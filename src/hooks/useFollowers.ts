import { useEffect, useState } from 'react';
import { Event, EventTemplate, SimplePool, getEventHash } from 'nostr-tools';
import { defaultRelays } from '../nostr/DefaultRelays';

type UseFollowersProps = {
  pool: SimplePool | null;
  relays: string[];
  pk: string;
  setEventToSign: (event: EventTemplate) => void;
  setSignEventOpen: (open: boolean) => void;
};

export const useFollowers = ({ pool, relays, pk, setEventToSign, setSignEventOpen}: UseFollowersProps) => {
  const [followers, setFollowers] = useState<string[]>([]);
  
  useEffect(() => {
    if (!pool || pk === "") return;

    const getFollowers = async () => {
      
      let followerPks: string[] = [];
      const userFollowerEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [pk], limit: 1 }])

      if (!userFollowerEvent[0] || !userFollowerEvent[0].tags) return;
  
      const followerArray: string[][] = userFollowerEvent[0].tags.filter((tag) => tag[0] === 'p');
      for (let i = 0; i < followerArray.length; i++) {
        if (followerArray[i][1]) {
          followerPks.push(followerArray[i][1]);
        }
      }
      console.log(followerPks.length + ' followers found');
      setFollowers(followerPks);
    };
  
    getFollowers();
  }, [pool, relays]);

  const signNostrEventWithNostrExtension = async (_baseEvent: EventTemplate, pubkey: string) => {
    try {

      if (!window.nostr || !pool) return false;
      if (!pubkey) return false;
      const sig = (await window.nostr.signEvent(_baseEvent)).sig;
      
      const newEvent: Event = {
        ..._baseEvent,
        id: getEventHash({..._baseEvent, pubkey}),
        sig,
        pubkey,
      }
      
      let pubs = pool.publish(relays, newEvent)
      
      pubs.on("ok", (pub: any) => {
        console.log(`Posted to ${pub}`)
      })
      
      pubs.on("failed", (error: string) => {
        console.log("Failed to post to" + error)
      })
    }
    catch {}

    return true;
  }
  
  const setFollowing = async (
    followerPubkey: string, 
    pool: SimplePool | null, 
    relays: string[]
  ) => {

    if (!pool) return;

    try {
      let pubkey: string = pk;

      if (window.nostr) {
        pubkey = await window.nostr.getPublicKey();
      }

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
      
      //sign with Nostr Extension
      if (window.nostr) {
        const signed = await signNostrEventWithNostrExtension(_baseEvent, pubkey);
        if (signed) {
          return newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1])
        }
      }

      setSignEventOpen(true);
      setEventToSign(_baseEvent);
      return newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1])

    } catch (error) {
        console.log(error);
    }
}

  return { followers, setFollowing };
};
