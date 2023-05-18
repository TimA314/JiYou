import { useState, useEffect } from 'react';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { MetaData, ReactionCounts } from '../nostr/Types';
import * as secp from 'noble-secp256k1';

type useListEventsProps = {
  pool: SimplePool | null;
  relays: string[];
  filter: Filter;
};

export const useListEvents = ({ pool, relays, filter }: useListEventsProps) => {
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
        const fetchedFeedEvents = await pool.list(relays, [filter]);
        const sanitizedEvents = fetchedFeedEvents.map((event) => sanitizeEvent(event));

        const replyEventIds: string[] = [];
        events.forEach(event => {
            event.tags?.forEach(tag => {
                if(tag[0] === "e" && tag[1]){
                  replyEventIds.push(tag[1]);
                }
            })
        })

        let eventIds: string[] = events.map(event => event.id);
        let reactionPubkeys: string[] = events.map(event => event.pubkey);
        
        // Fetch reply thread events
        if (replyEventIds.length !== 0){
          const replyThreadEvents: Event[] = await pool.list(relays, [{kinds: [1], ids: replyEventIds }])
          const sanitizedReplyThreadEvents = replyThreadEvents.map((event) => sanitizeEvent(event));

          eventIds = eventIds.concat(replyThreadEvents.map(event => event.id));
          reactionPubkeys = reactionPubkeys.concat(replyThreadEvents.map(event => event.pubkey));

          setEvents([...sanitizedEvents, ...sanitizedReplyThreadEvents]);
        } else {
          setEvents(sanitizedEvents);
        }
        
        // Fetch reactions
        const reactionEvents = await pool.list(relays, [{ "kinds": [7], "#e": eventIds, "#p": reactionPubkeys}]);
        const retrievedReactionObjects: Record<string, ReactionCounts> = {};

        reactionEvents.forEach((event) => {
          const eventTagThatWasLiked = event.tags.find((tag) => tag[0] === "e");
          const isValidEventTagThatWasLiked = eventTagThatWasLiked !== undefined && secp.utils.isValidPrivateKey(eventTagThatWasLiked[1]);

            if (event.content === "+" && isValidEventTagThatWasLiked) {
              retrievedReactionObjects[eventTagThatWasLiked[1]].upvotes++;
            } else if(event.content === "-" && isValidEventTagThatWasLiked) {
              retrievedReactionObjects[eventTagThatWasLiked[1]].downvotes++;
            }
          }
        );

        setReactions(retrievedReactionObjects);

        // Fetch metadata
        const authorPubkeys: string[] = events.map(event => event.pubkey);
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
  }, [pool, filter]);

  return { events, setEvents, reactions, metaData: metaData };
};
