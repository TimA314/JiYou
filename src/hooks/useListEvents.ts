import { useState, useEffect, MutableRefObject } from 'react';
import { Event, SimplePool } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { FullEventData, MetaData, ReactionCounts, RelaySetting } from '../nostr/Types';
import { getEventOptions } from '../nostr/FeedEvents';
import { eventContainsExplicitContent, setEventData } from '../utils/eventUtils';

type useListEventsProps = {
  pool: SimplePool | null;
  setPool: React.Dispatch<React.SetStateAction<SimplePool>>;
  relays: RelaySetting[];
  tabIndex: number;
  following: string[];
  hashtags: string[];
  hideExplicitContent: boolean;
  imagesOnlyMode: boolean;
  fetchEvents: MutableRefObject<boolean>;
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
  fetchingEventsInProgress
}: useListEventsProps) => {

  const [events, setEvents] = useState<FullEventData[]>([]);
  const readableRelayUrls = relays.filter((r) => r.read).map((r) => r.relayUrl);
  const allRelayUrls = relays.map((r) => r.relayUrl);

  useEffect(() => {
    if (!pool){
      setPool(new SimplePool());
    } 

    const fetchEventsFromRelays = async () => {
      if (!pool) return;
      try {
        fetchingEventsInProgress.current = true;
        setEvents([]);

        //If no followers and on the followers tab, don't fetch events
        if (tabIndex === 1 && following.length === 0) {
          fetchEvents.current = false;
          fetchingEventsInProgress.current = false;
          return;
        }
        
        console.log('Fetching events with options: ', getEventOptions(hashtags, tabIndex, following));

        const fetchedFeedEvents = await pool.list(readableRelayUrls, [getEventOptions(hashtags, tabIndex, following)]);
        console.log("number of events fetched: ", fetchedFeedEvents.length);

        let sanitizedEvents = fetchedFeedEvents.map((event: Event) => sanitizeEvent(event));

        if (hideExplicitContent) {
          sanitizedEvents = sanitizedEvents.filter((e: Event) => !eventContainsExplicitContent(e));
        }

        
        let eventIds: string[] = sanitizedEvents.map((event: Event) => event.id);
        let eventsPubkeys: string[] = sanitizedEvents.map((event: Event) => event.pubkey);

        // Fetch reactions
        const reactionEvents = await pool.list(allRelayUrls, [{ "kinds": [7], "#e": eventIds, "#p": eventsPubkeys}]);
        const retrievedReactionObjects: Record<string, ReactionCounts> = {};
        reactionEvents.forEach((event: Event) => {
          const eventTagThatWasLiked = event.tags.filter((tag) => tag[0] === "e");
          eventTagThatWasLiked.forEach((tag) => {
            const isValidEventTagThatWasLiked = tag && tag[1];
            if (isValidEventTagThatWasLiked) {

              if (!retrievedReactionObjects[tag[1]] && event.content === "+") {
                retrievedReactionObjects[tag[1]] = {upvotes: 1, downvotes: 0};
              }
              if (!retrievedReactionObjects[tag[1]] && event.content === "-") {
                retrievedReactionObjects[tag[1]] = {upvotes: 0, downvotes: 1};
              }
              
              if (retrievedReactionObjects[tag[1]] && event.content === "+") {
                retrievedReactionObjects[tag[1]].upvotes++;
              }
              if(retrievedReactionObjects[tag[1]] && event.content === "-") {
                retrievedReactionObjects[tag[1]].downvotes++;
              }

            }
          });
        });
        
        const fetchedMetaDataEvents = await pool.list(allRelayUrls, [{kinds: [0], authors: eventsPubkeys}]);
        
        const metaDataMap: Record<string, MetaData> = {};
        fetchedMetaDataEvents.forEach((event: Event) => {
          if(event.content){
            try {
              metaDataMap[event.pubkey] = JSON.parse(event.content);
            } catch (error) {
              console.error('Error parsing event content:', event.content, error);
            }
          }
        });
        
        const eventDataSet = sanitizedEvents.map((e) => setEventData(e, metaDataMap[e.pubkey], retrievedReactionObjects[e.id]))
        
        if (imagesOnlyMode) {
          setEvents(eventDataSet.filter((e) => e.images.length > 0));
        }
        else {
          setEvents(eventDataSet);
        }
        fetchEvents.current = false;
        fetchingEventsInProgress.current = false;
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (fetchEvents.current && !fetchingEventsInProgress.current)
    {
      fetchEventsFromRelays();
    }

  }, [fetchEvents.current]);

  return { events };
};
