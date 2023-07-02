import { Filter, SimplePool, Event } from "nostr-tools";
import { sanitizeEvent } from "../utils/sanitizeUtils";
import { eventContainsExplicitContent, setEventData } from "../utils/eventUtils";
import { FullEventData, MetaData, ReactionCounts } from "./Types";
import { metaDataAndRelayHelpingRelay } from "../utils/miscUtils";

export const fetchNostrEvent = async (pool: SimplePool, readableRelays: string[], allRelays: string[], filter: Filter, hideExplicitContent: boolean) => {
    const fetchedEvents = await pool.list(readableRelays, [filter]);
    console.log("number of events fetched: ", fetchedEvents.length);
    let sanitizedEvents = fetchedEvents.map((e) => sanitizeEvent(e));

    if (filter.kinds?.includes(1) && hideExplicitContent) {
        sanitizedEvents = sanitizedEvents.filter((e) => !eventContainsExplicitContent(e));
    }

    // Return FullEventData for Kind 1 Events
    if (filter.kinds?.includes(1)){
        const reactions = await fetchReactions(pool, allRelays, sanitizedEvents);
        const metaData = await fetchMetaData(pool, allRelays, sanitizedEvents);
        const eventDataSet = sanitizedEvents.map((e) => setEventData(e, metaData[e.pubkey], reactions[e.id]))
        return eventDataSet;
    }

    return [];
}

export const fetchSingleFullEventData = async (pool: SimplePool, relays: string[], event: Event) => {
    const sanitizedSingleEvent = sanitizeEvent(event);
    const reactions = await fetchReactions(pool, relays, [sanitizedSingleEvent]);
    const metaData = await fetchMetaData(pool, relays, [sanitizedSingleEvent]);
    return setEventData(sanitizedSingleEvent, metaData[event.pubkey], reactions[event.id]);
}

const fetchReactions = async (pool: SimplePool, relays: string[], events: Event[]) => {
    let eventIds: string[] = events.map((event: Event) => event.id);
    let eventsPubkeys: string[] = events.map((event: Event) => event.pubkey);

    const reactionEvents = await pool.list(relays, [{ "kinds": [7], "#e": eventIds, "#p": eventsPubkeys}]);
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

    return retrievedReactionObjects;
}

const fetchMetaData = async (pool: SimplePool, relays: string[], events: Event[]) => {
    let eventsPubkeys: string[] = events.map((event: Event) => event.pubkey);

    const fetchedMetaDataEvents = await pool.list([...new Set([...relays, metaDataAndRelayHelpingRelay])], [{kinds: [0], authors: eventsPubkeys}]);
        
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

    return metaDataMap;
}