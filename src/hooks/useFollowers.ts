import { useEffect, useState } from 'react';
import { Event, EventTemplate, SimplePool, getEventHash } from 'nostr-tools';
import { useListEvents } from './useListEvents';
import * as secp from "@noble/secp256k1";
import { defaultRelays } from '../nostr/Relays';

type UseFollowersProps = {
  pool: SimplePool | null;
  relays: string[];
  tabIndex: number;
};

export const useFollowers = ({ pool, relays, tabIndex }: UseFollowersProps) => {
  const [followers, setFollowers] = useState<string[]>([]);

  const { events } = useListEvents({
    pool,
    relays: [...defaultRelays, ...relays],
    filter: { kinds: [3], authors: [], limit: 1 },
  });

  const setFollowing = async (followerPubkey: string, pool: SimplePool, followers: string[], relays: string[]) => {
    if (!pool) {
        alert("pool is null")
        return;
    }

    try {
        const pubkey = await window.nostr.getPublicKey();
        const userFollowerEvent: Event[] = await pool.list([...defaultRelays, ...relays], [{kinds: [3], authors: [pubkey], limit: 1 }])
        console.log("user follower event " + JSON.stringify(userFollowerEvent[0]))
        
        const isUnfollowing: boolean = !!userFollowerEvent.find((e) =>
            e.tags.some((t) => t[1] === followerPubkey)
        );

        console.log("setIsFollowing " + followerPubkey + " " + isUnfollowing)
        
        const currentTags = userFollowerEvent[0]?.tags || [];

        const newTags = isUnfollowing
            ? currentTags.filter((tag) => tag[1] !== followerPubkey)
            : currentTags.concat([["p", followerPubkey]]);

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

        let pubs = pool.publish(relays, newEvent)
        
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

  useEffect(() => {
    const getFollowers = async () => {
      if (!window.nostr) {
        if (tabIndex === 0) return;
        alert('You need to install a Nostr extension to provide your pubkey.');
        return;
      }

      const pk = await window.nostr.getPublicKey();

      let followerPks: string[] = [];
      if (!events[0] || !events[0].tags) return [];

      const followerArray: string[][] = events[0].tags.filter((tag) => tag[0] === 'p');
      for (let i = 0; i < followerArray.length; i++) {
        if (secp.utils.isValidPrivateKey(followerArray[i][1])) {
          followerPks.push(followerArray[i][1]);
        }
      }

      console.log(followerPks.length + ' followers found');
      setFollowers(followerPks);
    };

    getFollowers();
  }, [events, tabIndex]);

  return { followers, setFollowers };
};
