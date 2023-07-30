import { Event, EventTemplate, Filter, SimplePool, finishEvent, getEventHash, nip19, validateEvent } from "nostr-tools";
import { Keys } from "./Types";


export const signEventWithNostr = async (
pool: SimplePool,
relays: string[], 
event: EventTemplate,
) => {

    if (!window.nostr){
        return false;
    }

    try {        
        const pubkey = await window.nostr.getPublicKey();
        const sig = (await window.nostr.signEvent(event)).sig;
        
        const newEvent: Event = {
            ...event,
            id: getEventHash({...event, pubkey}),
            sig,
            pubkey,
        }
        
        console.log(validateEvent(newEvent))
        
        //Post the event to the relays
        const pubs = pool.publish(relays, newEvent)
        
        pubs.on("ok", (r: any) => {
            console.log(`Posted to ${r}`)
        })
        
        pubs.on("failed", (error: string) => {
            console.log("Failed to post to ", error)
        })
        
        return true;
    } catch {
        return false;
    }
}

export const signEventWithStoredSk = async (
pool: SimplePool,
keys: Keys,
relays: string[],
event: EventTemplate,
) => {

    if (keys.privateKey.decoded === "") {
        alert('Invalid secret key, check settings or use a Nostr extension');
        return false;
    }
    
    const signedEvent = finishEvent(event, keys.privateKey.decoded);
    const validated = validateEvent(signedEvent);

    if (!validated) {
        alert('Invalid event');
        return false;
    }
  
    const pubs = pool.publish(relays, signedEvent);

    pubs.on('ok', (pub: string) => {
    console.log('Posted to relay ' + pub);
    });

    pubs.on('failed', (error: string) => {
    console.log('Failed to post to relay ' + error);
    });

    return true;
}