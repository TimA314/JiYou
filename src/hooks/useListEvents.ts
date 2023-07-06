import { useState, useEffect, MutableRefObject, useRef } from 'react';
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

  const [feedEvents, setFeedEvents] = useState<FullEventData[]>([]);
  const [replyEvents, setReplyEvents] = useState<FullEventData[]>([]);
  const [rootEvents, setRootEvents] = useState<FullEventData[]>([]);
  const filter = useRef<Filter | null>(null);
  const readableRelayUrls = relays.filter((r) => r.read).map((r) => r.relayUrl);
  const allRelayUrls = relays.map((r) => r.relayUrl);

  const fetchThreadEvents = async (eventDataSet: FullEventData[]) => {
    if (!pool) return;

    //Reply Events
    const replyFilter = { "kinds": [1], "#e": eventDataSet.map((e) => e.eventId)};

    const fetchedReplyEvents = await fetchNostrEvent(pool, allRelayUrls, allRelayUrls, replyFilter, hideExplicitContent.current)
    const newReplyEvents = [...new Set([...replyEvents, ...fetchedReplyEvents])];
    setReplyEvents(newReplyEvents);

    //Root Events
    const rootEventIdsToFetch: string[] = [];
    const relaysToFetchFrom: string[] = [];

    eventDataSet.forEach((f) => {
      const eventIdsFromTags = f.tags.filter((t) => t[0] === "e" && t[1] && t[1] !== f.eventId).map((t) => t[1]);
      const recommendedEventRelays = f.tags.filter((t) => t[2] && t[2].startsWith("wss")).map((t) => t[2]);

      rootEventIdsToFetch.push(...eventIdsFromTags);
      relaysToFetchFrom.push(...recommendedEventRelays);
    });

    const filteredRootEventsToFetch = [...new Set(rootEventIdsToFetch)].filter((r) => !rootEvents.some((e) => e.eventId === r));
    const rootFilter = { "kinds": [1], ids: filteredRootEventsToFetch};

    const fetchedRootEvents = await fetchNostrEvent(pool, [...new Set([...allRelayUrls, ...relaysToFetchFrom])], allRelayUrls, rootFilter, hideExplicitContent.current)
    const newRootEvents = [...new Set([...rootEvents, ...fetchedRootEvents])];
    setRootEvents(newRootEvents);
    console.log('Root Events: ', newRootEvents.length, " Reply Events: ", newReplyEvents.length)
  }

  const fetchEventsFromRelays = async () => {
    try {
      if (!pool) return;
      fetchingEventsInProgress.current = true;
      setFeedEvents([]);
      
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

      if (imagesOnlyMode.current) {
        setFeedEvents(eventDataSet.filter((e) => e.images.length > 0));
      }
      else {
        setFeedEvents(eventDataSet);
      }
      setFetchEvents(false);
      fetchingEventsInProgress.current = false;
    } catch (error) {
      console.error('Error fetching events:', error);
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

  return { feedEvents, filter, replyEvents, rootEvents };
};
