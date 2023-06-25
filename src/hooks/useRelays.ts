import { useEffect, useState } from 'react';
import { EventTemplate, Kind, SimplePool } from 'nostr-tools';
import { sanitizeString } from '../utils/sanitizeUtils';
import { defaultRelays } from '../nostr/DefaultRelays';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';

type UseRelaysProps = {
  pool: SimplePool | null;
  pk_decoded: string;
};

export const useRelays = ({ pool, pk_decoded }: UseRelaysProps) => {
  const [relays, setRelays] = useState<string[]>(defaultRelays);
  
  useEffect(() => {
    if (!pool || pk_decoded === "") return;

    const getEvents = async () => {
        try {

            let currentRelaysEvent = await pool.list(relays, [{kinds: [10002], authors: [pk_decoded], limit: 1 }])
            
            if (currentRelaysEvent[0] && currentRelaysEvent[0].tags.length > 0){
                let relayStrings: string[] = [];
                currentRelaysEvent[0].tags.forEach((tag) => {
                    if(tag[0] === "r") {
                        const sanitizedRelay = sanitizeString(tag[1]);
                        if (sanitizedRelay.startsWith("wss://")){
                            relayStrings.push(sanitizedRelay);
                        }
                    }
                })
                console.log(relayStrings)
                setRelays(relayStrings);
            }
            
        } catch (error) {
          console.error(error);
        }
    }

    getEvents();
}, [pool, pk_decoded])
  
  
const updateRelays = async (relays: string[]) => {
    if (!pool) return;

    try{
        
        //construct the tags
        const relayTags: string[][] = [];
        relays.forEach((r) => {
            relayTags.push(["r", r])
        })
        
        //cunstruct the event
        const _baseEvent = {
            kind: Kind.RelayList,
            content: "",
            created_at: Math.floor(Date.now() / 1000),
            tags: relayTags,
        } as EventTemplate


        if (window.nostr) {
           const signedWithNostr = await signEventWithNostr(pool, relays, _baseEvent);
           if (signedWithNostr) {
                setRelays(relays);
                return;
           }
        }

        setRelays(relays);
        await signEventWithStoredSk(pool, relays, _baseEvent);
        

    } catch (error) {
        console.error("Error adding relay" + error);
    }
}

  return { relays, updateRelays, setRelays };
};
