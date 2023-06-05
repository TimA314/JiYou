import { Event, EventTemplate, Filter, Kind, SimplePool, getEventHash, validateEvent } from "nostr-tools";
import { FullEventData } from "./Types";


export const getEventOptions = (hashtags: string[], tabIndex: number, followers: string[]) => {
    
    let options: Filter = {
        kinds: [1],
        limit: 500
    }
    
    if(hashtags.length > 0) {
        options["#t"] = hashtags;
    }
    
    switch (tabIndex) {
        case 0: //Global
            break;
        case 1: //Followers
            if(followers.length > 0){
                options.authors = followers;
            }
            break;
        default:
            break;
    }

    return options;
}

export const likeEvent = async (
    pool: SimplePool, 
    relays: string[], 
    event: FullEventData, 
    pk: string, 
    setEventToSign: React.Dispatch<React.SetStateAction<EventTemplate | null>>, 
    setSignEventOpen: React.Dispatch<React.SetStateAction<boolean>>
    ) => {

        //Construct the event
        const _baseEvent = {
            kind: Kind.Reaction,
            content: "+",
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["e", event.eventId],
                ["p", event.pubkey],
            ],
        } as EventTemplate
        
        try {        
            //sign with Nostr Extension
            const pubkey = await window.nostr.getPublicKey();
            const sig = (await window.nostr.signEvent(_baseEvent)).sig;

            const newEvent: Event = {
            ..._baseEvent,
            id: getEventHash({..._baseEvent, pubkey}),
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
        } catch {}

        setSignEventOpen(true);
        setEventToSign(_baseEvent);
        return true;
}