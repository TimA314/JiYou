import { useState, useEffect, MutableRefObject, useMemo } from 'react';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { MetaData, RelaySetting } from '../nostr/Types';
import { eventContainsExplicitContent, insertEventIntoDescendingList } from '../utils/eventUtils';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

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
  
  const [feedEvents, setFeedEvents] = useState<Event[]>([]);
  const [replyEvents, setReplyEvents] = useState<Record<string,Event[]>>({});
  const [rootEvents, setRootEvents] = useState<Record<string,Event[]>>({});
  
  const [reactions, setReactions] = useState<Record<string, Event[]>>({});
  const [metaData, setMetaData] = useState<Record<string, MetaData>>({});

  const readableRelayUrls = useMemo(() => relays.filter((r) => r.read).map((r) => r.relayUrl), [relays]);
  const allRelayUrls = useMemo(() => relays.map((r) => r.relayUrl), [relays]);


  useEffect(() => {
    const subFeedEvents = async () => {
      if (!pool) return;
      

      let sub = pool.sub(readableRelayUrls, [filter ?? {}]);

      sub.on("event", (event) => {
          if (hideExplicitContent && eventContainsExplicitContent(event)) return;
          const sanitizedEvent = sanitizeEvent(event);
          setFeedEvents((prev) => insertEventIntoDescendingList(prev, sanitizedEvent));
      });
    }
    subFeedEvents();
  }, [fetchEvents]);


  //MetaData
  useEffect(() => {
    const subMetaDataEvents = async () => {
      if (!pool) return;

      const feedKeys = feedEvents.filter((e) => !metaData[e.pubkey]).map((e) => e.pubkey);
      const reactionKeysToFetch = Object.keys(reactions).filter((e) => !metaData[e]);
      const rootKeysToFetch = Object.keys(rootEvents).filter((e) => !metaData[e]);
      const replyKeysToFetch = Object.keys(replyEvents).filter((e) => !metaData[e]);

      let sub = pool.sub(allRelayUrls, [{ "kinds": [0], authors: [...feedKeys,...reactionKeysToFetch,...rootKeysToFetch,...replyKeysToFetch] }]);

      sub.on("event", (event) => { 
        const sanitizedEvent = sanitizeEvent(event);
        const metadata = JSON.parse(sanitizedEvent.content) as MetaData;
        setMetaData((prev) => ({ ...prev, [sanitizedEvent.pubkey]: metadata }));
      });
    }
    subMetaDataEvents();
  }, [feedEvents]);


  //Reactions
  useEffect(() => {

    const subReactionEvents = async () => {
      if (!pool) return;
      const feedEventsToFetch = feedEvents.filter((e: Event) => !reactions[e.id]);
      const replyEventsToFetch = Object.values(replyEvents).map((e: Event[]) => e.filter((e: Event) => !reactions[e.id])).flat();
      const rootEventsToFetch = Object.values(rootEvents).map((e: Event[]) => e.filter((e: Event) => !reactions[e.id])).flat();

      const feedEventPubkeys = feedEventsToFetch.map((e: Event) => e.pubkey);
      const replyEventPubkeys = replyEventsToFetch.map((e: Event) => e.pubkey);
      const rootEventPubkeys = rootEventsToFetch.map((e: Event) => e.pubkey);

      const eventIds = [...feedEventsToFetch, ...replyEventsToFetch, ...rootEventsToFetch].map((e) => e.id);
      const eventsPubkeys = [...new Set([...feedEventPubkeys, ...replyEventPubkeys, ...rootEventPubkeys])];

      let sub = pool.sub(allRelayUrls, [{ "kinds": [7], "#e": eventIds, "#p": eventsPubkeys}]);

      sub.on("event", (event) => {
        const likedEventId = event.tags.find((t) => t[0] === "e")?.[1];
        
        if (!likedEventId) return;
    
        setReactions((prev) => {
            const prevReactionEvents = prev[likedEventId] ? [...prev[likedEventId]] : [];
            const alreadyExists = prevReactionEvents.find(e => e.sig === event.sig);
    
            if (!alreadyExists) {
                prevReactionEvents.push(event);
            }
    
            return { ...prev, [likedEventId]: prevReactionEvents };
        });
      });
    }

    subReactionEvents();
  }, [feedEvents, rootEvents, replyEvents]);

  
  //Reply Events
  useEffect(() => {
    const subReplyEvents = async () => {
      if (!pool) return;

      const replyEventsToFetch: Event[] = feedEvents.filter((e: Event) => !replyEvents[e.id]);

      let sub = pool.sub(allRelayUrls, [{ kinds: [1], "#e": replyEventsToFetch.map((e) => e.id)}]);

      sub.on("event", (event: Event) => {
        const sanitizedEvent = sanitizeEvent(event);
        setReplyEvents((prev) => ({ ...prev, [sanitizedEvent.id]: [...(prev[sanitizedEvent.id] || []), sanitizedEvent] }));
      });

    }
    subReplyEvents();
  }, [feedEvents]);


  //Root Events
  useEffect(() => {
    const subRootEvents = async () => {
      if (!pool) return;

      let idsToFetch: string[] = [];

      Object.values(feedEvents).forEach((e: Event) => {
        idsToFetch = e.tags.filter((t) => t[0] === "e" && t[1]).flat();
      });

      let sub = pool.sub(allRelayUrls, [{ kinds: [1], ids: idsToFetch}]);

      sub.on("event", (event: Event) => {
        const sanitizedEvent = sanitizeEvent(event);
        setRootEvents((prev) => ({ ...prev, [sanitizedEvent.id]: [...(prev[sanitizedEvent.id] || []), sanitizedEvent] }));
      });

    }
    subRootEvents();
  }, [feedEvents]);

 
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

  return { feedEvents, rootEvents, replyEvents, reactions, metaData, filter};
}
