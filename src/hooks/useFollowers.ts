import { useEffect, useState } from 'react';
import { Event, EventTemplate, SimplePool, getEventHash, getPublicKey, nip19 } from 'nostr-tools';
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
    console.log("useFollowers pk: " + pk)
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
      if (!window.nostr || !pool || !pubkey) return false;

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

      return true;
    }
    catch {
      return false;
    }

  }
  
  const setFollowing = async (followerPubkey: string) => {
    console.log("here")
    if (!pool) return;

    try {
      const sk = localStorage.getItem("sk") || "";
      const decodedSk = nip19.decode(sk);
      const pubkeyFromStorage = getPublicKey(decodedSk.data.toString());
      let pubkey: string = pubkeyFromStorage;
      if (window.nostr) {
        try{
          pubkey = await window.nostr.getPublicKey();
        } catch {}
      }

      if (!pubkey || pubkey === "") {
        console.log("No pubkey")
        return;
      }
      
      const isUnfollowing: boolean = !!followers.find((follower) => follower === followerPubkey);
    
      console.log("setIsFollowing " + followerPubkey + " " + isUnfollowing)
            
      const newTags: string[][] = isUnfollowing ? [] : [["p", followerPubkey]];
      console.log(followers)
      followers.forEach((follower) => {
        if (follower === followerPubkey && isUnfollowing) {
          return
        } else {
          newTags.push(["p", follower])
        }
      })

      const _baseEvent = {
        kind: 3,
        content: "",
        created_at: Math.floor(Date.now() / 1000),
        tags: newTags,
      } as EventTemplate
      
      //sign with Nostr Extension
      if (window.nostr) {
        const signed = await signNostrEventWithNostrExtension(_baseEvent, pubkey);
        if (signed) {
          setFollowers(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))
          return
        }
      }

      //sign manually
      setSignEventOpen(true);
      setEventToSign(_baseEvent);          
      setFollowers(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))

    } catch (error) {
        console.log(error);
    }
}

  return { followers, setFollowing };
};
