import { useContext, useEffect, useRef } from "react";
import { PoolContext } from "../context/PoolContext";
import { batch, useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { defaultRelays } from "../nostr/DefaultRelays";
import { Event, Filter } from "nostr-tools";
import { sanitizeEvent } from "../utils/sanitizeUtils";
import { addZaps } from "../redux/slices/eventsSlice";

type Props = {}

const useGetZaps = (props: Props) => {
    const pool = useContext(PoolContext);
    const keys = useSelector((state: RootState) => state.keys);
    const events = useSelector((state: RootState) => state.events);
    const nostr = useSelector((state: RootState) => state.nostr);
    const zapsFetched = useRef<Record<string, boolean>>({});
    const dispatch = useDispatch();
    
    const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl)])];
    

    useEffect(() => {
        if (!pool) return;
        
        const fetchZaps = async () => { 
            const allPubkeysToFetch: string[] = []
            const allEventIdsToFetch: string[] = []
            const feedEventsToFetch = events.globalNotes.filter((e) => zapsFetched.current[e.id] !== true);
            const rootEventsToFetch = events.rootNotes.filter((e) => zapsFetched.current[e.id] !== true);
            const replyEventsToFetch = Object.values(events.replyNotes).flat().filter((e) => zapsFetched.current[e.id] !== true);
            const userEventsToFetch =  events.userNotes.filter((e) => zapsFetched.current[e.id] !== true);
            const currentProfileEventsToFetch =  events.currentProfileNotes.filter((e) => zapsFetched.current[e.id] !== true);
            
            const uniqueEvents = [...new Set([...feedEventsToFetch, ...rootEventsToFetch, ...userEventsToFetch, ...replyEventsToFetch, ...currentProfileEventsToFetch])];
            if (uniqueEvents.length === 0) return;
            
            uniqueEvents.forEach((e) => {
                zapsFetched.current[e.id] = true;
                allPubkeysToFetch.push(e.pubkey);
                allEventIdsToFetch.push(e.id);
            });
            
            const filter: Filter = {kinds: [9735], '#e': allEventIdsToFetch, '#p': allPubkeysToFetch};
            
            let sub = pool.sub(allRelayUrls, [filter])
            
            let eventsBatch: Event[] = [];
            
            sub.on("event", async (event: Event) => {
                eventsBatch.push(sanitizeEvent(event));
                if (eventsBatch.length > 10) {
                    batch(() => {
                      eventsBatch.forEach(ev => dispatch(addZaps(ev)));
                    });
                    eventsBatch = [];
                  }
            });

            sub.on("eose", () => {
                if (eventsBatch.length > 0) {
                  batch(() => {
                    eventsBatch.forEach(ev => dispatch(addZaps(ev)));
                  });
                  eventsBatch = [];
                }
              })
        }
        
        fetchZaps();
    }, [events.globalNotes, events.replyNotes, events.rootNotes, events.userNotes, events.currentProfileNotes]);
}

export default useGetZaps;
