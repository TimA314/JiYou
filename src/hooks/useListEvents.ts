import { useState, useEffect } from 'react';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { MetaData, ReactionCounts } from '../nostr/Types';
import * as secp from 'noble-secp256k1';
import { getEventOptions } from '../nostr/FeedEvents';

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


  useEffect(() => {
    if (!pool) {
      console.log('pool is null');
      return;
    }

    const fetchEvents = async () => {
      try {
        const fetchedFeedEvents = await pool.list(relays, [getEventOptions(hashtags, tabIndex, followers)]);
        const sanitizedEvents = fetchedFeedEvents.map((event) => sanitizeEvent(event));

        const replyEventIds: string[] = [];
        events.forEach(event => {
            event.tags?.forEach(tag => {
                if(tag[0] === "e" && tag[1]){
                  replyEventIds.push(tag[1]);
                }
            })
        })

        let eventIds: string[] = sanitizedEvents.map(event => event.id);
        let reactionPubkeys: string[] = sanitizedEvents.map(event => event.pubkey);
        let newEvents: Event[] = [];
        
        // Fetch reply thread events
        if (replyEventIds.length !== 0){
          const replyThreadEvents: Event[] = await pool.list(relays, [{kinds: [1], ids: replyEventIds }])
          const sanitizedReplyThreadEvents = replyThreadEvents.map((event) => sanitizeEvent(event));

          eventIds = eventIds.concat(replyThreadEvents.map(event => event.id));
          reactionPubkeys = reactionPubkeys.concat(replyThreadEvents.map(event => event.pubkey));

          newEvents = [...sanitizedEvents, ...sanitizedReplyThreadEvents];
        } else {
          newEvents = sanitizedEvents;
        }
        setEvents(newEvents);

        // Fetch reactions
        const reactionEvents = await pool.list(relays, [{ "kinds": [7], "#e": eventIds, "#p": reactionPubkeys}]);
        const retrievedReactionObjects: Record<string, ReactionCounts> = {};

        reactionEvents.forEach((event) => {
          const eventTagThatWasLiked = event.tags.filter((tag) => tag[0] === "e");
          eventTagThatWasLiked.forEach((tag) => {
            const isValidEventTagThatWasLiked = tag !== undefined && secp.utils.isValidPrivateKey(tag[1]);
              if (event.content === "+" && isValidEventTagThatWasLiked) {
                retrievedReactionObjects[tag[1]].upvotes++;
              } else if(event.content === "-" && isValidEventTagThatWasLiked) {
                retrievedReactionObjects[tag[1]].downvotes++;
              }
          });
        });

        setReactions(retrievedReactionObjects);

        // Fetch metadata
        const authorPubkeys: string[] = newEvents.map(event => event.pubkey);
        const fetchedMetaDataEvents = await pool.list(relays, [{kinds: [0], authors: authorPubkeys}]);

        const metaDataMap: Record<string, MetaData> = {};
        fetchedMetaDataEvents.forEach((event) => {
          metaDataMap[event.pubkey] = JSON.parse(event.content);
        });

        setMetaData(metaDataMap);

      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  return { events, setEvents, reactions, metaData: metaData };
};
