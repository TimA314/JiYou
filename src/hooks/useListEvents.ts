import { useState, useEffect, MutableRefObject, useMemo } from 'react';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { MetaData, RelaySetting } from '../nostr/Types';
import { eventContainsExplicitContent, insertEventIntoDescendingList } from '../utils/eventUtils';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setGlobalNotes, setMetaData, setReactions, setReplyNotes, setRootNotes } from '../redux/slices/notesSlice';

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
  const notes = useSelector((state: RootState) => state.notes);
  const keys = useSelector((state: RootState) => state.keys);

  const dispatch = useDispatch();
  const readableRelayUrls = useMemo(() => relays.filter((r) => r.read).map((r) => r.relayUrl), [relays]);
  const allRelayUrls = useMemo(() => relays.map((r) => r.relayUrl), [relays]);


  useEffect(() => {
    const subFeedEvents = async () => {
      if (!pool) return;
      

      let sub = pool.sub(readableRelayUrls, [filter ?? {}]);

      sub.on("event", (event) => {
          if (hideExplicitContent && eventContainsExplicitContent(event)) return;
          const sanitizedEvent = sanitizeEvent(event);
          dispatch(setGlobalNotes(insertEventIntoDescendingList(notes.globalNotes, sanitizedEvent)))
      });
    }
    subFeedEvents();
  }, [fetchEvents]);


  //MetaData
  useEffect(() => {
    const subMetaDataEvents = async () => {
      if (!pool) return;


      const feedKeys = notes.globalNotes.filter((e) => !notes.metaData[e.pubkey])?.map((e) => e.pubkey);
      const reactionKeysToFetch = Object.values(notes.reactions).flat().filter((e) => !notes.metaData[e.pubkey]).map((e) => e.pubkey);
      const rootKeysToFetch = Object.values(notes.rootNotes).flat().filter((e) => !notes.metaData[e.pubkey]).map((e) => e.pubkey);
      const replyKeysToFetch = Object.values(notes.replyNotes).flat().filter((e) => !notes.metaData[e.pubkey]).map((e) => e.pubkey);

      const pubkeysToFetch = [...feedKeys,...reactionKeysToFetch,...rootKeysToFetch,...replyKeysToFetch];
      if (!notes.metaData[keys.publicKey.decoded]){
        pubkeysToFetch.push(keys.publicKey.decoded)
      }

      let sub = pool.sub(allRelayUrls, [{ "kinds": [0], authors: pubkeysToFetch }]);

      sub.on("event", (event) => { 
        const sanitizedEvent = sanitizeEvent(event);
        const metadata = JSON.parse(sanitizedEvent.content) as MetaData;
        dispatch(setMetaData({ ...notes.metaData, [sanitizedEvent.pubkey]: metadata }))
      });
    }
    subMetaDataEvents();
  }, [notes.globalNotes, notes.rootNotes, notes.replyNotes, notes.reactions, notes.userNotes, keys.publicKey.decoded]);


  //Reactions
  useEffect(() => {

    const subReactionEvents = async () => {
      if (!pool) return;
      const allPubkeysToFetch: string[] = []
      const allEventIdsToFetch: string[] = []

      const feedEventsToFetch = notes.globalNotes.filter((e) => !notes.reactions[e.id]);
      const replyEventsToFetch = Object.values(notes.replyNotes).flat().filter((e) => !notes.reactions[e.id]);
      const rootEventsToFetch = Object.values(notes.rootNotes).flat().filter((e) => !notes.reactions[e.id]);
      const userEventsToFetch = notes.userNotes.filter((e) => !notes.reactions[e.id])


      feedEventsToFetch.forEach((e) => {
        allPubkeysToFetch.push(e.pubkey) 
        allEventIdsToFetch.push(e.id)
        }
      );
      replyEventsToFetch.forEach((e) => {
        allPubkeysToFetch.push(e.pubkey) 
        allEventIdsToFetch.push(e.id)
        }
      );
      rootEventsToFetch.forEach((e) => {
        allPubkeysToFetch.push(e.pubkey) 
        allEventIdsToFetch.push(e.id)
        }
      );
      userEventsToFetch.forEach((e) => {
        allPubkeysToFetch.push(e.pubkey) 
        allEventIdsToFetch.push(e.id)
        }
      );


      let sub = pool.sub(allRelayUrls, [{ "kinds": [7], "#e": allEventIdsToFetch, "#p": allPubkeysToFetch}]);

      sub.on("event", (event) => {
        const likedEventId = event.tags.find((t) => t[0] === "e")?.[1];
        if (!likedEventId) return;

        const prevReactionEvents = notes.reactions[likedEventId] ? [...notes.reactions[likedEventId]] : [];
        const alreadyExists = prevReactionEvents.find(e => e.sig === event.sig);
        if (!alreadyExists) {
            prevReactionEvents.push(event);
        }

        dispatch(setReactions({ ...notes.reactions, [likedEventId]: prevReactionEvents }))
      });
    }

    subReactionEvents();
  }, [notes.globalNotes, notes.rootNotes, notes.replyNotes, notes.userNotes]);

  
  //Reply Events
  useEffect(() => {
    const subReplyEvents = async () => {
      if (!pool) return;
      const replyEventsToFetch: string[] = []
     
      notes.globalNotes.filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
        replyEventsToFetch.push(e.id)
      });

      Object.values(notes.rootNotes).flat().filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
        replyEventsToFetch.push(e.id)
      });

      Object.values(notes.replyNotes).flat().filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
        replyEventsToFetch.push(e.id)
      });

      Object.values(notes.userNotes).flat().filter((e: Event) => !notes.replyNotes[e.id]).forEach((e) => {
        replyEventsToFetch.push(e.id)
      });


      let sub = pool.sub(allRelayUrls, [{ kinds: [1], "#e": replyEventsToFetch}]);

      sub.on("event", (event: Event) => {
        const sanitizedEvent = sanitizeEvent(event);
        dispatch(setReplyNotes({ ...notes.replyNotes, [sanitizedEvent.id]: [...(notes.replyNotes[sanitizedEvent.id] || []), sanitizedEvent] }))
      });

    }
    subReplyEvents();
  }, [notes.globalNotes, notes.rootNotes, notes.userNotes]);


  //Root Events
  useEffect(() => {
    const subRootEvents = async () => {
      if (!pool) return;

      let idsToFetch: string[] = [];

      notes.globalNotes.forEach((e: Event) => {
        idsToFetch = e.tags.filter((t) => t[0] === "e" && t[1]).flat();
      });

      Object.values(notes.replyNotes).flat().forEach((e: Event) => {
        idsToFetch = e.tags.filter((t) => t[0] === "e" && t[1]).flat();
      });

      Object.values(notes.userNotes).forEach((e: Event) => {
        idsToFetch = e.tags.filter((t) => t[0] === "e" && t[1]).flat();
      });

      let sub = pool.sub(allRelayUrls, [{ kinds: [1], ids: idsToFetch}]);

      sub.on("event", (event: Event) => {
        const sanitizedEvent = sanitizeEvent(event);
        dispatch(setRootNotes({ ...notes.rootNotes, [sanitizedEvent.id]: [...(notes.rootNotes[sanitizedEvent.id] || []), sanitizedEvent] }))
      });

    }
    subRootEvents();
  }, [notes.globalNotes, notes.replyNotes, notes.userNotes]);

 
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
