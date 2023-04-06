import { Event, SimplePool } from "nostr-tools";
import { ReactionCounts } from "./Types";

export const GetReactions = async (pool: SimplePool, unprocessedEvents: Event[], relays: string[], reactionsFetched: Record<string,boolean>) => {
    const eventIds = unprocessedEvents.map((event) => event.id);
    const pubkeys = unprocessedEvents.map((event) => event.pubkey);

    const reactionEvents: Event[] = await pool.list(relays, [{ "kinds": [7], "#e": eventIds, "#p": pubkeys}]);

    if(!reactionEvents) {
        return {};
    }

    const reactionObject: Record<string, ReactionCounts> = {};

    reactionEvents.forEach((reactionEvent) => {
      if (!reactionObject[reactionEvent.id]) {
        reactionObject[reactionEvent.id] = {
          upvotes: 0,
          downvotes: 0,
        };
      }
  
      if (reactionEvent.content === "+") {
        reactionObject[reactionEvent.id].upvotes++;
      } else if (reactionEvent.content === "-") {
        reactionObject[reactionEvent.id].downvotes++;
      }
    });
  
    return reactionObject;
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