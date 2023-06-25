import { useEffect, useState } from 'react';
import { Event, EventTemplate, SimplePool } from 'nostr-tools';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';

type UseFollowingProps = {
  pool: SimplePool | null;
  relays: string[];
  pk_decoded: string;
};

export const useFollowing = ({ pool, relays, pk_decoded }: UseFollowingProps) => {
  const [following, setFollowing] = useState<string[]>([]);
  
  const getFollowing = async () => {
    if (!pool || pk_decoded === "") return [];
    console.log("useFollowers pk: " + pk_decoded)
    let followingPks: string[] = [];
    const userFollowingEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [pk_decoded], limit: 1 }])
    
    if (!userFollowingEvent[0] || !userFollowingEvent[0].tags) return [];

    const followingArray: string[][] = userFollowingEvent[0].tags.filter((tag) => tag[0] === 'p');
    for (let i = 0; i < followingArray.length; i++) {
      if (followingArray[i][1]) {
        followingPks.push(followingArray[i][1]);
      }
    }
    console.log(followingPks.length + ' following');
    setFollowing(followingPks);
    return followingPks;
  };
  
  
  useEffect(() => {
    getFollowing();
  }, [relays, pk_decoded]);

  
  const updateFollowing = async (followPubkey: string) => {
    if (!pool) return;

    try {
      const currentFollowing = await getFollowing();
      const isUnfollowing: boolean = !!currentFollowing.find((follower) => follower === followPubkey);
    
      console.log("setIsFollowing " + followPubkey + " to following = " + isUnfollowing)
            
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
      console.log(_baseEvent)
      
      //sign with Nostr Extension
      if (window.nostr) {
        const signed = await signEventWithNostr(pool, relays, _baseEvent);
        if (signed) {
          setFollowing(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))
          return
        }
      }

      //sign with sk
      const signedWithSk = await signEventWithStoredSk(pool, relays, _baseEvent); 
      if (signedWithSk) {      
        setFollowing(newTags.filter((tag) => tag[0] === "p").map((tag) => tag[1]))
      }

    } catch (error) {
        console.error(error);
    }
}

  return { following, updateFollowing };
};
