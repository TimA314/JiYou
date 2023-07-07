import { useState, useEffect, MutableRefObject, useRef, useMemo } from 'react';
import { Filter, SimplePool } from 'nostr-tools';
import { FullEventData, RelaySetting } from '../nostr/Types';
import { getDefaultFeedFilter } from '../nostr/FeedEvents';
import { fetchNostrEvent } from '../nostr/FetchEvent';

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
  fetchingEventsInProgress
}: useListEventsProps) => {

  const [threadEvents, setThreadEvents] = useState<{
    feedEvents: Map<string, FullEventData>, 
    replyEvents: Map<string, FullEventData>, 
    rootEvents: Map<string, FullEventData>
  }>({
    feedEvents: new Map(),
    replyEvents: new Map(), 
    rootEvents: new Map()
  });

  const filter = useRef<Filter | null>(null);
  const readableRelayUrls = useMemo(() => relays.filter((r) => r.read).map((r) => r.relayUrl), [relays]);
  const allRelayUrls = useMemo(() => relays.map((r) => r.relayUrl), [relays]);

  const fetchThreadEvents = async (eventDataSet: FullEventData[]) => {
    if (!pool) return;

    //Reply Events
    const replyFilter = { "kinds": [1], "#e": eventDataSet.map((e) => e.eventId)};

    const fetchedReplyEvents = await fetchNostrEvent(pool, allRelayUrls, allRelayUrls, replyFilter, hideExplicitContent.current)
    let newReplyEvents = new Map(threadEvents.replyEvents);
    fetchedReplyEvents.forEach((event) => {
      newReplyEvents.set(event.eventId, event);
    });

    //Root Events
    const rootEventIdsToFetch: string[] = [];
    const relaysToFetchFrom: string[] = [];

    eventDataSet.forEach((f) => {
      const eventIdsFromTags = f.tags.filter((t) => t[0] === "e" && t[1] && t[1] !== f.eventId).map((t) => t[1]);
      const recommendedEventRelays = f.tags.filter((t) => t[2] && t[2].startsWith("wss")).map((t) => t[2]);

        eventIdsFromTags.forEach((e) => {
          if (threadEvents.rootEvents.has(e)) return;
          rootEventIdsToFetch.push(e);
        });
        relaysToFetchFrom.push(...recommendedEventRelays);
    });

    const rootFilter = { "kinds": [1], ids: rootEventIdsToFetch};

    const fetchedRootEvents = await fetchNostrEvent(pool, [...new Set([...allRelayUrls, ...relaysToFetchFrom])], allRelayUrls, rootFilter, hideExplicitContent.current)
    let newRootEvents = new Map(threadEvents.rootEvents);
    fetchedRootEvents.forEach((event) => {
      newRootEvents.set(event.eventId, event);
    });


    if (imagesOnlyMode.current) {
      setThreadEvents({
        feedEvents: new Map(eventDataSet.filter((e) => e.images.length > 0).map(event => [event.eventId, event])), 
        replyEvents: newReplyEvents, 
        rootEvents: newRootEvents
      });
    } else {
      setThreadEvents({
        feedEvents: new Map(eventDataSet.map(event => [event.eventId, event])),
        replyEvents: newReplyEvents, 
        rootEvents: newRootEvents
      });
    }
  }

  const fetchEventsFromRelays = async () => {
    try {
      if (!pool) return;
      fetchingEventsInProgress.current = true;

      //Reset events
      setThreadEvents({
        feedEvents: new Map(),
        replyEvents: new Map(), 
        rootEvents: new Map()
      });

      //If no followers and on the followers tab, don't fetch events
      if (tabIndex === 1 && following.length === 0) {
        setFetchEvents(false);
        fetchingEventsInProgress.current = false;
        return;
      }

      const filterToUse = filter.current ? filter.current : getDefaultFeedFilter(hashtags, tabIndex, following);
      
      console.log('Fetching events with options: ', filterToUse );

      const eventDataSet = await fetchNostrEvent(pool, readableRelayUrls, allRelayUrls, filterToUse, hideExplicitContent.current)
      
      await fetchThreadEvents(eventDataSet);

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

  }, [fetchEvents, filter.current]);

  return { threadEvents, filter};
};
