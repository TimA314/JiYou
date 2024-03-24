import { useContext, useEffect, useRef } from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { PoolContext } from '../context/PoolContext';
import { sanitizeEvent } from "../utils/sanitizeUtils";
import { addMetaData } from "../redux/slices/eventsSlice";
import { fetchNostrBandMetaData } from "../utils/eventUtils";
import { Event } from 'nostr-tools';
import { defaultRelays } from "../nostr/DefaultRelays";
import { metaDataAndRelayHelpingRelay } from "../utils/miscUtils";
 
 
 export const useGetMetaData = () => {
    const pool = useContext(PoolContext);
    const events = useSelector((state: RootState) => state.events);
    const metadataFetched = useRef<Record<string, boolean>>({});
    const keys = useSelector((state: RootState) => state.keys);
    const nostr = useSelector((state: RootState) => state.nostr);


    const dispatch = useDispatch();
    const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl), metaDataAndRelayHelpingRelay])];

 
 //MetaData
 useEffect(() => {
  
    
    const fetchMetaData = async () => {
      if (!pool) return;
      const pubkeysToFetch: string[] = [];

      events.globalNotes.filter((event) => metadataFetched.current[event.pubkey] !== true)
        .forEach((event) => pubkeysToFetch.push(event.pubkey));

      events.currentProfileNotes.filter((event) => metadataFetched.current[event.pubkey] !== true)
        .forEach((event) => pubkeysToFetch.push(event.pubkey));

      nostr.following.filter((followPk) => metadataFetched.current[followPk] !== true)
        .forEach((followPk) => pubkeysToFetch.push(followPk));

      Object.values(events.reactions).flat().filter((event) => metadataFetched.current[event.pubkey] !== true)
        .forEach((event) => pubkeysToFetch.push(event.pubkey));

      Object.values(events.replyNotes).flat().filter((event) => metadataFetched.current[event.pubkey] !== true)
      .forEach((event) => pubkeysToFetch.push(event.pubkey));

      if (!events.metaData[keys.publicKey.decoded]) {
        pubkeysToFetch.unshift(keys.publicKey.decoded)
      }

      pubkeysToFetch.forEach((pubkey) => (metadataFetched.current[pubkey] = true));

      if (pubkeysToFetch.length === 0) return;
      
      const sub = pool.sub([...allRelayUrls, "wss://purplepag.es"], [
        {
          kinds: [0],
          authors: pubkeysToFetch,
        },
      ]);

      let allFetchedEvents: Event[] = [];
      let eventsBatch: Event[] = [];

      sub.on("event", async (event: Event) => {
        allFetchedEvents.push(event);
        const sanitizedEvent = await sanitizeEvent(event);
        eventsBatch.push(sanitizedEvent);
        if (eventsBatch.length > 10) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addMetaData(ev)));
          });
          eventsBatch = [];
        }
      });

      sub.on("eose", () => {
        console.log(allFetchedEvents.length)
        if (eventsBatch.length > 0) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addMetaData(ev)));
          });
          eventsBatch = [];
        }

        const missingEvents = pubkeysToFetch.filter((pk) => allFetchedEvents.find((e) => e.pubkey === pk));
        if (missingEvents.length === 0) return;

        batch(() => {
          missingEvents.forEach(async (pk) => {

            const nostrBandMetaData = await fetchNostrBandMetaData(pk);
            if (nostrBandMetaData !== null && nostrBandMetaData !== undefined) {
              dispatch(addMetaData(nostrBandMetaData));
            }
          });
        });

      })

    };

      fetchMetaData();

    return () => {};
  }, [events.globalNotes, events.reactions, events.replyNotes, events.rootNotes, keys.publicKey.decoded, events.currentProfileNotes]);

}