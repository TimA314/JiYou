import { Event, SimplePool } from "nostr-tools";
import { ReactionCounts } from "./Types";

export const GetReactions = async (pool: SimplePool, eventId: string, pubkey: string, relays: string[]) => {
    
    let reactions: ReactionCounts = {
        upvotes: 0,
        downvotes: 0,
    }
    
    if (!pool) {
        alert("pool is null")
        return reactions;
    }

    const reactionEvents: Event[] = await pool.list(relays, [{ "kinds": [7], "#e": [eventId], "#p": [pubkey]}]);
    console.log("ReactionEvents" + JSON.stringify(reactionEvents))
    if(!reactionEvents) {
        return reactions;
    }

    reactionEvents.forEach((reactionEvent) => {
        if (reactionEvent.content === "+") {
            reactions.upvotes++;
        } else if (reactionEvent.content === "-") {
            reactions.downvotes++;
        }
    })

    return reactions;
}


export const SendReactionEvent = async (userPubkey: string, pool: SimplePool, upvote: boolean ) => {
    if (!pool) {
        alert("pool is null")
        return;
    }

    if (!window.nostr) {
        alert("You need to install a Nostr extension to provide your pubkey.")
        return;
    }


    // try {
    //     const pubkey = await window.nostr.getPublicKey();
    //     const userFollowerEvent: Event[] = await pool.list(defaultRelays, [{kinds: [3], authors: [pubkey], limit: 1 }])
    //     console.log("user follower event " + userFollowerEvent)
        
    //     let newTags: string[][] = [];
    //     if (userFollowerEvent[0]) {
    //         newTags = [...userFollowerEvent[0].tags];
    //     }
    //     if (unFollow) {
    //         newTags = newTags.filter((tag) => tag[1] !== followerPubkey);
    //     } else {
    //         newTags.push(["p", followerPubkey]);
    //     }

    //     console.log(newTags)
    //     const _baseEvent = {
    //         kind: Kind.Contacts,
    //         content: userFollowerEvent[0]?.content ?? "",
    //         created_at: Math.floor(Date.now() / 1000),
    //         tags: newTags,
    //     } as EventTemplate

    //     const sig = (await window.nostr.signEvent(_baseEvent)).sig;

    //     const newEvent: Event = {
    //         ..._baseEvent,
    //         id: getEventHash({..._baseEvent, pubkey}),
    //         sig,
    //         pubkey,
    //     }

    //     const pubs = pool.publish(relays, newEvent)
        
    //     pubs.on("ok", () => {
    //         alert("Posted to relays")
    //         console.log("Posted to relays")
    //     })

    //     pubs.on("failed", (error: string) => {
    //     alert("Failed to post to relays" + error)
    //     })

    //     setFollowers(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]));
    // } catch (error) {
    //     alert(error)
    //     console.log(error);
    // }
}