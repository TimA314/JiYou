import { Event, EventTemplate, Filter, SimplePool, finishEvent, getEventHash, nip19, validateEvent } from "nostr-tools";


export const getDefaultFeedFilter = (hashtags: string[], tabIndex: number, followers: string[]) => {
    
    let options: Filter = {
        kinds: [1],
        limit: 100
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
relays: string[],
event: EventTemplate,
) => {
    const secretKey = localStorage.getItem('sk');
    const decodedSk = nip19.decode(secretKey ?? '');

    if (!decodedSk || decodedSk.data.toString().trim() === '') {
        alert('Invalid secret key, check settings or use a Nostr extension');
        return false;
    }
    
    const signedEvent = finishEvent(event, decodedSk.data.toString());
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