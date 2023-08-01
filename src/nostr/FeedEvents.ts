import { Event, EventTemplate, SimplePool, finishEvent, getEventHash, validateEvent } from "nostr-tools";
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
        const pubsPromises  = pool.publish(relays, newEvent);

        const pubs = await Promise.all(pubsPromises);
    
        pubs.forEach((pub: void | Error) => {
            if (!(pub instanceof Error)) {
              console.log(`Posted to ${pub}`);
            } else {
              console.log("Failed to post:", pub.message);
            }
          });
        
        return true;
    } catch {
        return false;
    }
}

export const signEventWithStoredSk = async (
pool: SimplePool,
keys: Keys,
keys: Keys,
relays: string[],
event: EventTemplate,
) => {

    if (keys.privateKey.decoded === "") {
    if (keys.privateKey.decoded === "") {
        alert('Invalid secret key, check settings or use a Nostr extension');
        return false;
    }
    
    const signedEvent = finishEvent(event, keys.privateKey.decoded);
    const signedEvent = finishEvent(event, keys.privateKey.decoded);
    const validated = validateEvent(signedEvent);

    if (!validated) {
        alert('Invalid event');
        return false;
    }
  
    const pubsPromises  = pool.publish(relays, signedEvent);

    const pubs = await Promise.all(pubsPromises);

    pubs.forEach((pub: void | Error) => {
        if (!(pub instanceof Error)) {
          console.log(`Posted to ${pub}`);
        } else {
          console.log("Failed to post:", pub.message);
        }
      });

  return true;
}