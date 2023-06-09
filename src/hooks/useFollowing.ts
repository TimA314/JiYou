import { useEffect, useState } from 'react';
import { Event, EventTemplate, SimplePool } from 'nostr-tools';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import { RelaySetting } from '../nostr/Types';

type UseFollowingProps = {
  pool: SimplePool | null;
  relays: RelaySetting[];
  pk_decoded: string;
  sk_decoded: string;
};

export const useFollowing = ({ pool, relays, pk_decoded, sk_decoded }: UseFollowingProps) => {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const allRelayUrls = relays.map((r) => r.relayUrl);
  const writableRelayUrls = relays.filter((r) => r.write).map((r) => r.relayUrl);


  const getFollowing = async () => {
    if(pk_decoded === ""){
      setFollowing([]);
      return [];
    }

    if (!pool) return [];
    let followingPks: string[] = [];
    const userFollowingEvent: Event[] = await pool.list(allRelayUrls, [{kinds: [3], authors: [pk_decoded], limit: 1 }])
    
    if (!userFollowingEvent[0] || !userFollowingEvent[0].tags) return [];

    const followingArray: string[][] = userFollowingEvent[0].tags.filter((tag) => tag[0] === 'p');
    for (let i = 0; i < followingArray.length; i++) {
      if (followingArray[i][1]) {
        followingPks.push(followingArray[i][1]);
      }
    }

    setFollowing(followingPks);
    return followingPks;
  };

  const getFollowers = async () => {
    if(pk_decoded === ""){
      setFollowers([]);
      return;
    }
    if (!pool) return;

    const followerEvents = await pool.list(allRelayUrls, [{kinds: [3], ["#p"]: [pk_decoded] }])

    if (!followerEvents || followerEvents.length === 0) return;

    const followerPks: string[] = followerEvents.map((event) => event.pubkey);
    setFollowers(followerPks);
  }
  
  useEffect(() => {
    getFollowing();
    getFollowers();
  }, [relays, pk_decoded, sk_decoded]);

  
  const updateFollowing = async (followPubkey: string) => {
    if (!pool) return;

    try {
      const currentFollowing = await getFollowing();
      const isUnfollowing: boolean = !!currentFollowing.find((follower) => follower === followPubkey);
                
      const newTags: string[][] = isUnfollowing ? [] : [["p", followPubkey]];
      currentFollowing.forEach((follow) => {
        if (follow === followPubkey && isUnfollowing) {
          return
        } else {
          newTags.push(["p", follow])
        }
      })
      
      const _baseEvent = {
        kind: 3,
        content: "",
        created_at: Math.floor(Date.now() / 1000),
        tags: newTags,
      } as EventTemplate
      
      //sign with Nostr Extension
      if (window.nostr && sk_decoded === "") {
        const signed = await signEventWithNostr(pool, writableRelayUrls, _baseEvent);
        if (signed) {
          setFollowing(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))
          return
        }
      }

      //sign with sk
      const signedWithSk = await signEventWithStoredSk(pool, writableRelayUrls, _baseEvent); 
      if (signedWithSk) {      
        setFollowing(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))
      }

    } catch (error) {
        console.error(error);
    }
}

  return { following, updateFollowing, followers };
};
