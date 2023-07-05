import { useEffect, useState } from 'react';
import { EventTemplate, Kind, SimplePool } from 'nostr-tools';
import { sanitizeString } from '../utils/sanitizeUtils';
import { defaultRelays } from '../nostr/DefaultRelays';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import { RelaySetting } from '../nostr/Types';
import { RelayReadWriteOrBoth, metaDataAndRelayHelpingRelay } from '../utils/miscUtils';

type UseRelaysProps = {
  pool: SimplePool | null;
  pk_decoded: string;
  sk_decoded: string;
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useRelays = ({ pool, pk_decoded, sk_decoded, setFetchEvents }: UseRelaysProps) => {
  const [relays, setRelays] = useState<RelaySetting[]>(defaultRelays);
  
  useEffect(() => {
    if (pk_decoded === "") {
        setRelays(defaultRelays);
        return;
    }
    if (!pool) return;

    const getUserRelays = async () => {
        try {
            const relayUrls = relays.map((r) => r.relayUrl);
            let currentRelaysEvent = await pool.list([...new Set([...relayUrls, metaDataAndRelayHelpingRelay])], [{kinds: [10002], authors: [pk_decoded], limit: 1 }])
            
            if (currentRelaysEvent[0] && currentRelaysEvent[0].tags.length > 0){
                let updatedRelays: RelaySetting[] = [];
                currentRelaysEvent[0].tags.forEach((tag) => {
                    if(tag[0] === "r") {
                        const sanitizedRelay = sanitizeString(tag[1]);
                        const readWriteable = tag[2].trim() === "";
                        const readable = tag[2] === "read" || readWriteable;
                        const writeable = tag[2] === "write" || readWriteable;
                        if (sanitizedRelay.startsWith("wss://")){
                            updatedRelays.push({relayUrl: sanitizedRelay, read: readable, write: writeable});
                        }
                    }
                })

                setRelays(updatedRelays);
            }
            
        } catch (error) {
          console.error(error);
        }
    }

    getUserRelays();
}, [pool, pk_decoded])
  
  
const updateRelays = async (relaysToUpdate: RelaySetting[]) => {
    if (!pool) return;
    const writableRelayUrls = relaysToUpdate.filter((r) => r.write).map((r) => r.relayUrl);

    try{
        
        //construct the tags
        const relayTags: string[][] = [];
        relaysToUpdate.forEach((r) => {
            relayTags.push(["r", r.relayUrl, RelayReadWriteOrBoth(r)])
        })
        
        //cunstruct the event
        const _baseEvent = {
            kind: Kind.RelayList,
            content: "",
            created_at: Math.floor(Date.now() / 1000),
            tags: relayTags,
        } as EventTemplate


        if (window.nostr && sk_decoded === "") {
           const signedWithNostr = await signEventWithNostr(pool, writableRelayUrls, _baseEvent);
           if (signedWithNostr) {
                setRelays(relays);
                return;
           }
        }

        setRelays(relaysToUpdate);
        setFetchEvents(true);
        await signEventWithStoredSk(pool, writableRelayUrls, _baseEvent);

    } catch (error) {
        console.error("Error adding relay" + error);
    }
}

  return { relays, updateRelays, setRelays };
};
