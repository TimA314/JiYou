import { Event, EventTemplate, Filter, Kind, SimplePool, getEventHash, validateEvent } from "nostr-tools";
import { FullEventData } from "./Types";


export const getEventOptions = (hashtags: string[], tabIndex: number, followers: string[]) => {
    
    let options: Filter = {
        kinds: [1],
        limit: 50,
        since: Math.floor((Date.now() / 1000) - (3 * 24 * 60 * 60)) //3 days ago
    }
    
    switch (tabIndex) {
        case 0: //Global
            if(hashtags.length > 0) {
                options["#t"] = hashtags;
            }
            break;
        case 1: //Followers
            if(hashtags.length > 0) {
                options["#t"] = hashtags;
            }
            if(followers.length > 0){
                options.authors = followers;
            }
            break;
        default:
            break;
    }

    return options;
}

export const likeEvent = async (pool: SimplePool, relays: string[], event: FullEventData) => {
    if (!window.nostr) {
        alert("You need to install a Nostr extension to provide your pubkey.")
        return false;
    }

    try {
        const pubkey = await window.nostr.getPublicKey();
        
        //cunstruct the event
        const _baseEvent = {
            kind: Kind.Reaction,
            content: "+",
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["e", event.eventId],
                ["p", event.pubkey],
            ],
        } as EventTemplate
        
        //prompt the user to sign the event
        const sig = (await window.nostr.signEvent(_baseEvent)).sig;
        
        const newEvent: Event = {
          ..._baseEvent,
          id: getEventHash({..._baseEvent, pubkey}),
          sig,
          pubkey,
        }
        
        console.log(validateEvent(newEvent))
  
        //post the event to the relays
        const pubs = pool.publish(relays, newEvent)
        
        pubs.on("ok", (r: any) => {
          console.log(`Posted to ${r}`)
        })
  
        pubs.on("failed", (error: string) => {
            console.log("Failed to post to ", error)
        })
  
    } catch (error) {
        alert(error)
        console.log(error);
        return false;
    }
}