import { useContext, useEffect, useRef } from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { PoolContext } from '../context/PoolContext';
import { Event } from 'nostr-tools';
import { RootState } from "../redux/store";
import { addReactions } from "../redux/slices/eventsSlice";
import { sanitizeEvent } from "../utils/sanitizeUtils";
import { defaultRelays } from "../nostr/DefaultRelays";

export const useGetReactions = () => {
    const pool = useContext(PoolContext);
    const events = useSelector((state: RootState) => state.events);
    const nostr = useSelector((state: RootState) => state.nostr);
    const reactionsFetched = useRef<Record<string, boolean>>({});
    const dispatch = useDispatch();
    const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl)])];

    
    useEffect(() => {

        const fetchReactions = async () => {
          if (!pool) return;
          const allPubkeysToFetch: string[] = []
          const allEventIdsToFetch: string[] = []
    
          const feedEventsToFetch = events.globalNotes.filter((e) => reactionsFetched.current[e.id] !== true);
          const rootEventsToFetch = events.rootNotes.filter((e) => reactionsFetched.current[e.id] !== true);
          const replyEventsToFetch = Object.values(events.replyNotes).flat().filter((e) => reactionsFetched.current[e.id] !== true);
          const userEventsToFetch =  events.userNotes.filter((e) => reactionsFetched.current[e.id] !== true);
          const currentProfileEventsToFetch =  events.currentProfileNotes.filter((e) => reactionsFetched.current[e.id] !== true);
    
          const uniqueEvents = [...new Set([...feedEventsToFetch, ...rootEventsToFetch, ...userEventsToFetch, ...replyEventsToFetch, ...currentProfileEventsToFetch])];
          if (uniqueEvents.length === 0) return;
    
          uniqueEvents.forEach((e) => {
            reactionsFetched.current[e.id] = true;
            allPubkeysToFetch.push(e.pubkey) 
            allEventIdsToFetch.push(e.id)
            }
          );
    
          let sub = pool.sub(allRelayUrls, [{ "kinds": [7], "#e": allEventIdsToFetch, "#p": allPubkeysToFetch}]);
          
          let eventsBatch: Event[] = [];
    
          sub.on("event", async (event: Event) => {
            eventsBatch.push(sanitizeEvent(event));
            if (eventsBatch.length > 10) {
              batch(() => {
                eventsBatch.forEach(ev => dispatch(addReactions(ev)));
              });
              eventsBatch = [];
            }
          });
    
          sub.on("eose", () => {
            if (eventsBatch.length > 0) {
              batch(() => {
                eventsBatch.forEach(ev => dispatch(addReactions(ev)));
              });
              eventsBatch = [];
            }
          })
        }
    
        fetchReactions();
        
      }, [events.globalNotes, events.replyNotes, events.rootNotes, events.userNotes, events.currentProfileNotes]);
    
  
 return {}
}