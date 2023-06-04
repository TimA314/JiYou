import { useEffect, useState } from 'react';
import { Event, EventTemplate, Kind, SimplePool, getEventHash, validateEvent, verifySignature } from 'nostr-tools';
import { sanitizeString } from '../utils/sanitizeUtils';
import { defaultRelays } from '../nostr/DefaultRelays';

type UseRelaysProps = {
  pool: SimplePool | null;
  pk: string;
  setEventToSign: (event: EventTemplate) => void;
  setSignEventOpen: (open: boolean) => void;
};

export const useRelays = ({ pool, pk, setEventToSign, setSignEventOpen}: UseRelaysProps) => {
  const [relays, setRelays] = useState<string[]>(defaultRelays);
  
  useEffect(() => {
    if (!pool || pk === "") return;

    const getEvents = async () => {
        try {

            let currentRelaysEvent = await pool.list(relays, [{kinds: [10002], authors: [pk], limit: 1 }])
            
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
}, [pool, pk])
  
  
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
            try{

                const sig = (await window.nostr.signEvent(_baseEvent)).sig;
                
                const newEvent: Event = {
                    ..._baseEvent,
                    id: getEventHash({
                        ..._baseEvent,
                        pubkey: pk
                    }),
                    sig: sig,
                    pubkey: pk,
                }
                
                if(!validateEvent(newEvent) || !verifySignature(newEvent)) {
                    console.log("Event is Invalid")
                    return;
                }
                
                const pubs = pool.publish(defaultRelays, newEvent)
                pubs.on("ok", (pub: any) => {
                    console.log(`Posted to ${pub}`)
                })

                setRelays(relays);
                return;
            } catch{}
        }

        setSignEventOpen(true);
        setEventToSign(_baseEvent);

    } catch (error) {
        console.log("Error adding relay" + error);
    }
}

  return { relays, updateRelays, setRelays };
};
