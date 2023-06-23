import { useEffect, useState } from 'react';
import { Event, EventTemplate, SimplePool, getEventHash, getPublicKey, nip19 } from 'nostr-tools';

type UseFollowingProps = {
  pool: SimplePool | null;
  relays: string[];
  pk: string;
  setEventToSign: (event: EventTemplate) => void;
  setSignEventOpen: (open: boolean) => void;
};

export const useFollowing = ({ pool, relays, pk, setEventToSign, setSignEventOpen}: UseFollowingProps) => {
  const [following, setFollowing] = useState<string[]>([]);
  
  useEffect(() => {
    console.log("useFollowers pk: " + pk)
    if (!pool || pk === "") return;
    

    const getFollowing = async () => {
      
      let followingPks: string[] = [];
      const userFollowingEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [pk], limit: 1 }])
      
      if (!userFollowingEvent[0] || !userFollowingEvent[0].tags) return;
  
      const followingArray: string[][] = userFollowingEvent[0].tags.filter((tag) => tag[0] === 'p');
      for (let i = 0; i < followingArray.length; i++) {
        if (followingArray[i][1]) {
          followingPks.push(followingArray[i][1]);
        }
      }
      console.log(followingPks.length + ' followers found');
      setFollowing(followingPks);
    };
  
    getFollowing();
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
  
  const updateFollowing = async (followerPubkey: string) => {
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
      
      const isUnfollowing: boolean = !!following.find((follower) => follower === followerPubkey);
    
      console.log("setIsFollowing " + followerPubkey + " " + isUnfollowing)
            
      const newTags: string[][] = isUnfollowing ? [] : [["p", followerPubkey]];
      console.log(following)
      following.forEach((follower) => {
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
          setFollowing(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))
          return
        }
      }

      //sign manually
      setEventToSign(_baseEvent);          
      setFollowing(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))
      setSignEventOpen(true);

    } catch (error) {
        console.log(error);
    }
}

  return { following, updateFollowing };
};
