import { useContext, useEffect } from 'react';
import { EventTemplate, Kind } from 'nostr-tools';
import { sanitizeString } from '../utils/sanitizeUtils';
import { defaultRelays } from '../nostr/DefaultRelays';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import { RelaySetting } from '../nostr/Types';
import { RelayReadWriteOrBoth, metaDataAndRelayHelpingRelay } from '../utils/miscUtils';
import { RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { setRelays } from '../redux/slices/nostrSlice';
import { PoolContext } from '../context/PoolContext';

type UseRelaysProps = {
  setFetchEvents: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useRelays = ({ setFetchEvents }: UseRelaysProps) => {
    const pool = useContext(PoolContext);
    const nostr = useSelector((state: RootState) => state.nostr);
    const keys = useSelector((state: RootState) => state.keys);
    const dispatch = useDispatch();
  
  useEffect(() => {
    if (keys.publicKey.decoded === "") {
        dispatch(setRelays(defaultRelays));
        return;
    }
    
    const getUserRelays = async () => {
        if (!pool) return;
        try {
            const relayUrls = nostr.relays.map((r) => r.relayUrl);
            let currentRelaysEvent = await pool.list([...new Set([...relayUrls, metaDataAndRelayHelpingRelay])], [{kinds: [10002], authors: [keys.publicKey.decoded], limit: 1 }])
            
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

                dispatch(setRelays(updatedRelays));
            }
            
        } catch (error) {
          console.error(error);
        }
    }

    getUserRelays();
}, [pool, keys.publicKey.decoded])
  
  
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


        if (window.nostr && keys.privateKey.decoded === "") {
           const signedWithNostr = await signEventWithNostr(pool, writableRelayUrls, _baseEvent);
           if (signedWithNostr) {
                dispatch(setRelays(nostr.relays));
                return;
           }
        }

        dispatch(setRelays(relaysToUpdate));
        setFetchEvents(true);
        await signEventWithStoredSk(pool, keys, writableRelayUrls, _baseEvent);

    } catch (error) {
        console.error("Error adding relay" + error);
    }
}

  return { updateRelays };
};
