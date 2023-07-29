import { useState, useEffect, MutableRefObject, useMemo, useRef } from 'react';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { MetaData, RelaySetting } from '../nostr/Types';
import { eventContainsExplicitContent, insertEventIntoDescendingList } from '../utils/eventUtils';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addGlobalNotes, addMetaData, addReactions, addReplyNotes, addRootNotes, clearGlobalNotes } from '../redux/slices/notesSlice';
import { useDebounce } from 'use-debounce';

type useListEventsProps = {
  pool: SimplePool | null;
  setPool: React.Dispatch<React.SetStateAction<SimplePool>>;
  relays: RelaySetting[];
  tabIndex: number;
  following: string[];
  hashtags: string[];
  hideExplicitContent: MutableRefObject<boolean>;
  imagesOnlyMode: MutableRefObject<boolean>;
  fetchEvents: boolean;
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
  fetchingEventsInProgress: MutableRefObject<boolean>;
  filter: Filter | null;
};

export const useListEvents = ({ 
  pool,
  setPool,
  relays, 
  tabIndex, 
  following, 
  hashtags, 
  hideExplicitContent, 
  imagesOnlyMode, 
  fetchEvents,
  setFetchEvents,
  fetchingEventsInProgress,
  filter
}: useListEventsProps) => {
  const keys = useSelector((state: RootState) => state.keys);
  const notes = useSelector((state: RootState) => state.notes);
  const metadataFetched = useRef<Record<string, boolean>>({});
  

  const dispatch = useDispatch();
  const readableRelayUrls = useMemo(() => relays.filter((r) => r.read).map((r) => r.relayUrl), [relays]);
  const allRelayUrls = [...new Set([...relays.map((r) => r.relayUrl), "wss://purplepag.es"])];
  

  useEffect(() => {
    const subFeedEvents = async () => {
      if (!pool) return;
      
      dispatch(clearGlobalNotes());
      let sub = pool.sub(readableRelayUrls, [filter ?? {}]);

      sub.on("event", (event) => {
          if (hideExplicitContent && eventContainsExplicitContent(event)) return;
          const sanitizedEvent = sanitizeEvent(event);
          dispatch(addGlobalNotes(sanitizedEvent))
      });
    }
    subFeedEvents();
  }, [fetchEvents]);


  //MetaData
  useEffect(() => {
  
    if (!pool) return;

    const fetchMetaData = async () => {
      const pubkeysToFetch = notes.globalNotes.filter((event) => metadataFetched.current[event.pubkey] !== true)
        .map((event) => event.pubkey);

      if (!notes.metaData[keys.publicKey.decoded] && metadataFetched.current[keys.publicKey.decoded] !== true) {
        pubkeysToFetch.push(keys.publicKey.decoded)
      }

      pubkeysToFetch.forEach(
        (pubkey) => (metadataFetched.current[pubkey] = true)
      );

      if (pubkeysToFetch.length > 0) {
        const sub = pool.sub(allRelayUrls, [
          {
            kinds: [0],
            authors: pubkeysToFetch,
          },
        ]);

        sub.on("event", (event: Event) => {
          const sanitizedEvent = sanitizeEvent(event);
          dispatch(addMetaData(sanitizedEvent))
        });
      }
    };

      fetchMetaData();

    return () => {};
  }, [pool, notes.globalNotes]);

  




  // //Reactions
  // useEffect(() => {

  //   const subReactionEvents = async () => {
  //     if (!pool || !shouldRunSubReactions) return;
  //     const allPubkeysToFetch: string[] = []
  //     const allEventIdsToFetch: string[] = []

  //     const feedEventsToFetch = notes.globalNotes.filter((e) => !notes.reactions[e.id]);
  //     const replyEventsToFetch = Object.values(notes.replyNotes).flat().filter((e) => !notes.reactions[e.id]);
  //     const rootEventsToFetch = Object.values(notes.rootNotes).flat().filter((e) => !notes.reactions[e.id]);
  //     const userEventsToFetch = notes.userNotes.filter((e) => !notes.reactions[e.id])


  //     feedEventsToFetch.forEach((e) => {
  //       allPubkeysToFetch.push(e.pubkey) 
  //       allEventIdsToFetch.push(e.id)
  //       }
  //     );
  //     replyEventsToFetch.forEach((e) => {
  //       allPubkeysToFetch.push(e.pubkey) 
  //       allEventIdsToFetch.push(e.id)
  //       }
  //     );
  //     rootEventsToFetch.forEach((e) => {
  //       allPubkeysToFetch.push(e.pubkey) 
  //       allEventIdsToFetch.push(e.id)
  //       }
  //     );
  //     userEventsToFetch.forEach((e) => {
  //       allPubkeysToFetch.push(e.pubkey) 
  //       allEventIdsToFetch.push(e.id)
  //       }
  //     );

  //     console.log("reactions to fetch: " + allEventIdsToFetch.length)
  //     if(allEventIdsToFetch.length === 0 || allPubkeysToFetch.length === 0){
  //       setShouldRunSubReactions(false);
  //       return;
  //     }

  //     let sub = pool.sub(allRelayUrls, [{ "kinds": [7], "#e": allEventIdsToFetch, "#p": allPubkeysToFetch}]);

  //     sub.on("event", (event) => {
  //       const likedEventId = event.tags.find((t) => t[0] === "e")?.[1];
  //       if (!likedEventId) return;

  //       const prevReactionEvents = notes.reactions[likedEventId] ? [...notes.reactions[likedEventId]] : [];
  //       const alreadyExists = prevReactionEvents.find(e => e.sig === event.sig);
  //       if (!alreadyExists) {
  //           prevReactionEvents.push(event);
  //       }

  //       dispatch(addReactions({ [likedEventId]: prevReactionEvents }))
  //     });
  //   }

  //   subReactionEvents();
  // }, [shouldRunSubReactions]);

  
  //Reply Events
  // useEffect(() => {

  //   const subReplyEvents = async () => {
  //     if (!pool || !shouldRunSubReplyEvents) return;

  //     const replyEventIdsToFetch: string[] = []
     
  //     notes.globalNotes.filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
  //       replyEventIdsToFetch.push(e.id)
  //     });

  //     Object.values(notes.rootNotes).flat().filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
  //       replyEventIdsToFetch.push(e.id)
  //     });

  //     Object.values(notes.replyNotes).flat().filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
  //       replyEventIdsToFetch.push(e.id)
  //     });

  //     Object.values(notes.userNotes).flat().filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
  //       replyEventIdsToFetch.push(e.id)
  //     });

  //     console.log("replyEvents to fetch: " + replyEventIdsToFetch.length)
  //     if (replyEventIdsToFetch.length === 0){
  //       setShouldRunSubReplyEvents(false);
  //       return;
  //     }

  //     let sub = pool.sub(allRelayUrls, [{ kinds: [1], "#e": replyEventIdsToFetch}]);

  //     sub.on("event", (event: Event) => {
  //       const sanitizedEvent = sanitizeEvent(event);
  //       dispatch(addReplyNotes({[sanitizedEvent.id]: [...(notes.replyNotes[sanitizedEvent.id] || []), sanitizedEvent] }))
  //     });
  //   }

  //   subReplyEvents();
  // }, [shouldRunSubReplyEvents]);


  // //Root Events
  // useEffect(() => {
  //   const subRootEvents = async () => {
  //     if (!pool || !shouldRunSubRootEvents) return;
  //     fetchingRootEvents.current = true;

  //     let idsToFetch: string[] = [];

  //     notes.globalNotes.forEach((e: Event) => {
  //       e.tags?.filter((t) => t[0] === "e" && t[1]).forEach(((t) => {
  //         idsToFetch.push(t[1])
  //       }));
  //     });

  //     Object.values(notes.replyNotes).flat().forEach((e: Event) => {
  //       e.tags?.filter((t) => t[0] === "e" && t[1]).forEach(((t) => {
  //         idsToFetch.push(t[1])
  //       }));
  //     });

  //     Object.values(notes.userNotes).forEach((e: Event) => {
  //       e.tags?.filter((t) => t[0] === "e" && t[1]).forEach(((t) => {
  //         idsToFetch.push(t[1])
  //       }));
  //     });

  //     if (idsToFetch.length === 0){
  //       setShouldRunSubRootEvents(false);
  //       return;
  //     }

  //     let sub = pool.sub(allRelayUrls, [{ kinds: [1], ids: idsToFetch}]);
  //     console.log("rootNotes " + notes.rootNotes.length)

  //     sub.on("event", (event: Event) => {
  //       const sanitizedEvent = sanitizeEvent(event);
  //       dispatch(addRootNotes(sanitizedEvent))
  //     });

  //     sub.on("eose", () => {
  //       setShouldRunSubRootEvents(false)
  //       return;
  //     })

  //   }

  //   subRootEvents();
  // }, [shouldRunSubRootEvents]);

 
  const fetchEventsFromRelays = async () => {
    try {
      if (!pool) return;
      fetchingEventsInProgress.current = true;
  
      //If no followers and on the followers tab, don't fetch events
      if (tabIndex === 1 && following.length === 0) {
        setFetchEvents(false);
        fetchingEventsInProgress.current = false;
        return;
      }
  
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setFetchEvents(false);
      fetchingEventsInProgress.current = false;
    }
  };


  useEffect(() => {
    if (!pool){
      setPool(new SimplePool());
    } 

    if (fetchEvents && !fetchingEventsInProgress.current)
    {
      fetchEventsFromRelays();
    }

  }, [fetchEvents, filter]);

  return { filter};
}
