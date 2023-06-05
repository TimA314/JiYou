import { useState, useEffect } from 'react';
import { Event, SimplePool } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { MetaData, ReactionCounts } from '../nostr/Types';
import { getEventOptions } from '../nostr/FeedEvents';
import { defaultRelays } from '../nostr/DefaultRelays';

type useListEventsProps = {
  pool: SimplePool | null;
  relays: string[];
  tabIndex: number;
  followers: string[];
  hashtags: string[];
};

export const useListEvents = ({ pool, relays, tabIndex, followers, hashtags }: useListEventsProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
  const [metaData, setMetaData] = useState<Record<string, MetaData>>({});
  const [eventsFetched, setEventsFetched] = useState<boolean>(false);

  useEffect(() => {
    if (!pool) {
      console.log('pool is null');
      return;
    }

    const fetchEvents = async () => {
      try {
        // Fetch events
        
        //If no followers and on the followers tab, don't fetch events
        if (tabIndex === 1 && followers.length === 0) {
          setEventsFetched(true);
          return;
        }
        
        console.log('Fetching events with options: ', getEventOptions(hashtags, tabIndex, followers));

        const fetchedFeedEvents = await pool.list(relays, [getEventOptions(hashtags, tabIndex, followers)]);
        const sanitizedEvents = fetchedFeedEvents.map((event) => sanitizeEvent(event));
        
        const recommendedRelays: string[] = [...new Set([...relays, ...defaultRelays])];
        
        let eventIds: string[] = sanitizedEvents.map(event => event.id);
        let eventsPubkeys: string[] = sanitizedEvents.map(event => event.pubkey);

        // Fetch reactions
        const reactionEvents = await pool.list(recommendedRelays, [{ "kinds": [7], "#e": eventIds, "#p": eventsPubkeys}]);
        const retrievedReactionObjects: Record<string, ReactionCounts> = {};
        reactionEvents.forEach((event) => {
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
        
        const fetchedMetaDataEvents = await pool.list(recommendedRelays, [{kinds: [0], authors: eventsPubkeys}]);
        
        const metaDataMap: Record<string, MetaData> = {};
        fetchedMetaDataEvents.forEach((event) => {
          if(event.content){
            try {
              metaDataMap[event.pubkey] = JSON.parse(event.content);
            } catch (error) {
              console.error('Error parsing event content:', event.content, error);
            }
          }
        });
        
        setEvents(sanitizedEvents);
        setReactions(retrievedReactionObjects);
        setMetaData(metaDataMap);
        setEventsFetched(true);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    

    fetchEvents();
  }, [pool, tabIndex, hashtags]);

  return { events, setEvents, reactions, metaData: metaData, eventsFetched, setEventsFetched };
};
