import { useState, useEffect, MutableRefObject, useMemo, useRef } from 'react';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { MetaData, RelaySetting } from '../nostr/Types';
import { eventContainsExplicitContent, insertEventIntoDescendingList } from '../utils/eventUtils';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addGlobalNotes, addMetaData, addReactions, addReplyNotes, addRootNotes, addUserNotes, clearGlobalNotes } from '../redux/slices/notesSlice';
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
  const reactionsFetched = useRef<Record<string, boolean>>({});
  const repliesFetched = useRef<Record<string, boolean>>({});
  const rootsFetched = useRef<Record<string, boolean>>({});

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
      const pubkeysToFetch = [];

      notes.globalNotes.filter((event) => metadataFetched.current[event.pubkey] !== true)
        .forEach((event) => pubkeysToFetch.push(event.pubkey));

      Object.values(notes.reactions).flat().filter((event) => metadataFetched.current[event.pubkey] !== true)
        .forEach((event) => pubkeysToFetch.push(event.pubkey));

      Object.values(notes.replyNotes).flat().filter((event) => metadataFetched.current[event.pubkey] !== true)
      .forEach((event) => pubkeysToFetch.push(event.pubkey));

      if (!notes.metaData[keys.publicKey.decoded]) {
        pubkeysToFetch.unshift(keys.publicKey.decoded)
      }

      pubkeysToFetch.forEach((pubkey) => (metadataFetched.current[pubkey] = true));

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
  }, [pool, notes.globalNotes, keys.publicKey.decoded]);

  


  //Reactions
  useEffect(() => {

    if (!pool) return;

    const fetchReactions = async () => {
      const allPubkeysToFetch: string[] = []
      const allEventIdsToFetch: string[] = []

      const feedEventsToFetch = notes.globalNotes.filter((e) => reactionsFetched.current[e.id] !== true);
      const rootEventsToFetch = notes.rootNotes.filter((e) => reactionsFetched.current[e.id] !== true);
      const userEventsToFetch =  notes.userNotes.filter((e) => reactionsFetched.current[e.id] !== true);
      const replyEventsToFetch = Object.values(notes.replyNotes).flat().filter((e) => reactionsFetched.current[e.id] !== true);

      const uniqueEvents = [...new Set([...feedEventsToFetch, ...rootEventsToFetch, ...userEventsToFetch, ...replyEventsToFetch])];

      uniqueEvents.forEach((e) => {
        reactionsFetched.current[e.id] = true;
        allPubkeysToFetch.push(e.pubkey) 
        allEventIdsToFetch.push(e.id)
        }
      );

      if(allEventIdsToFetch.length === 0 || allPubkeysToFetch.length === 0){
        return;
      }

      let sub = pool.sub(allRelayUrls, [{ "kinds": [7], "#e": allEventIdsToFetch, "#p": allPubkeysToFetch}]);

      sub.on("event", (event) => {
        dispatch(addReactions(event))
      });
    }

    fetchReactions();
  }, [notes]);

  
  //Reply Events
  useEffect(() => {
    if (!pool) return;

    const subReplyEvents = async () => {

      const replyEventIdsToFetch: string[] = []
     
      notes.globalNotes.filter((e: Event) => repliesFetched.current[e.id] !== true)
        .forEach((e) => replyEventIdsToFetch.push(e.id));

      Object.values(notes.rootNotes).flat().filter((e: Event) => repliesFetched.current[e.id] !== true)
      .forEach((e) => replyEventIdsToFetch.push(e.id));

      Object.values(notes.replyNotes).flat().filter((e: Event) => repliesFetched.current[e.id] !== true)
      .forEach((e) => replyEventIdsToFetch.push(e.id));

      notes.userNotes.filter((e: Event) => repliesFetched.current[e.id] !== true)
        .forEach((e) => replyEventIdsToFetch.push(e.id));

      replyEventIdsToFetch.forEach((id) => repliesFetched.current[id] = true)

      console.log("replyEvents to fetch: " + replyEventIdsToFetch.length)

      if (replyEventIdsToFetch.length === 0) return;

      let sub = pool.sub(allRelayUrls, [{ kinds: [1], "#e": replyEventIdsToFetch}]);

      sub.on("event", (event: Event) => {
        const sanitizedEvent = sanitizeEvent(event);
        dispatch(addReplyNotes(sanitizedEvent))
      });
    }

    subReplyEvents();
  }, [notes.globalNotes, notes.replyNotes, notes.rootNotes, notes.userNotes]);


  //Root Events
  useEffect(() => {
    if (!pool) return;

    const subRootEvents = async () => {
      const idsToFetch: string[] = [];
      
      notes.globalNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      Object.values(notes.replyNotes).flat().forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      notes.userNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      notes.rootNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      if (idsToFetch.length === 0){
        return;
      }

      let sub = pool.sub(allRelayUrls, [{ kinds: [1], ids: idsToFetch}]);

      sub.on("event", (event: Event) => {
        const sanitizedEvent = sanitizeEvent(event);
        dispatch(addRootNotes(sanitizedEvent))
      });
    }

    subRootEvents();
  }, [notes.globalNotes, notes.replyNotes, notes.userNotes, notes.rootNotes]);

 
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

  //User Notes
  useEffect(() => {
    if (!pool) return;

    const fetchUserNotes = () => {
      const sub = pool.sub(allRelayUrls, [{ kinds: [1], authors: [keys.publicKey.decoded]}])

      sub.on("event", (event: Event) => {
        const sanitizedEvent = sanitizeEvent(event);
        dispatch(addUserNotes(sanitizedEvent));
      })
    }

    fetchUserNotes();
  }, [pool, keys.publicKey.decoded, notes.refreshUserNotes])


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
