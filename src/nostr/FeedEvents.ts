import { Event, EventTemplate, SimplePool, getEventHash } from "nostr-tools";
import * as secp from "@noble/secp256k1";
import { sanitizeEvent } from "../util";


export const getFollowers = async (pool: SimplePool, relays: string[], tabIndex: number) => {
            
    if (!window.nostr) {
        if(tabIndex === 0) return;
        alert("You need to install a Nostr extension to provide your pubkey.")
        return;
    }
    try {
        const pk = await window.nostr.getPublicKey();
        
        const userFollowerEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [pk], limit: 1 }])
        let followerPks: string[] = [];
        if (!userFollowerEvent[0] || !userFollowerEvent[0].tags) return [];
        
        const followerArray: string[][] = userFollowerEvent[0].tags.filter((tag) => tag[0] === "p");
        for(let i=0; i<followerArray.length;i++){
            if(secp.utils.isValidPrivateKey(followerArray[i][1])){
                followerPks.push(followerArray[i][1]);
            }
        }
        return followerPks;
    } catch (error) {
        alert(error)
        console.log(error);
    }
}

export const getReplyThreadEvents = async (events: Event[], pool: SimplePool, relays: string[]) => {
    const eventIdsToFetch: string[] = [];
    events.forEach(event => {
        event.tags?.forEach(tag => {
            if(tag[0] === "e" && tag[1]){
                eventIdsToFetch.push(tag[1]);
            }
        })
    })

    if (eventIdsToFetch.length === 0) return;
    const replyThreadEvents: Event[] = await pool.list(relays, [{kinds: [1], ids: eventIdsToFetch }])
    if (!replyThreadEvents) return null;

    const sanitizedEvents = replyThreadEvents.map(event => sanitizeEvent(event));

    return sanitizedEvents;
}

export const setFollowing = async (followerPubkey: string, pool: SimplePool, followers: string[], relays: string[]) => {
    if (!pool) {
        alert("pool is null")
        return;
    }
    if (!window.nostr) {
        alert("You need to install a Nostr extension to provide your pubkey.")
        return;
    }
    
    const unFollow = followers.includes(followerPubkey);

    console.log("setIsFollowing " + followerPubkey + " " + unFollow)

    try {
        const pubkey = await window.nostr.getPublicKey();
        const userFollowerEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [pubkey], limit: 1 }])
        console.log("user follower event " + userFollowerEvent[0])
        
        let newTags: string[][] = [];
        if (userFollowerEvent[0]) {
            newTags = [...userFollowerEvent[0].tags];
        }

        if (unFollow) {
            newTags = newTags.filter((tag) => tag[1] !== followerPubkey);
        } else {
            newTags.push(["p", followerPubkey]);
        }

        const _baseEvent = {
            kind: 3,
            content: userFollowerEvent[0]?.content ?? "",
            created_at: Math.floor(Date.now() / 1000),
            tags: newTags,
        } as EventTemplate

        const sig = (await window.nostr.signEvent(_baseEvent)).sig;

        const newEvent: Event = {
            ..._baseEvent,
            id: getEventHash({..._baseEvent, pubkey}),
            sig,
            pubkey,
        }

        const pubs = pool.publish(relays, newEvent)
        
        pubs.on("ok", () => {
            alert("Posted to relays")
            console.log("Posted to relays")
        })

        pubs.on("failed", (error: string) => {
            alert("Failed to post to relays" + error)
        })

        return newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1])
    } catch (error) {
        alert(error)
        console.log(error);
    }
}