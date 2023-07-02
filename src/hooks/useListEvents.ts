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
  const filter = useRef<Filter | null>(null);
  const readableRelayUrls = relays.filter((r) => r.read).map((r) => r.relayUrl);
  const allRelayUrls = relays.map((r) => r.relayUrl);

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

  return { feedEvents, filter };
};
