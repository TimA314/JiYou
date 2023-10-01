import { useContext, useEffect, useRef, useState } from 'react';
import { Event, EventTemplate } from 'nostr-tools';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import { RootState } from '../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { PoolContext } from '../context/PoolContext';
import { setCurrentProfileFollowers, setCurrentProfileFollowing, setFollowers, setFollowing } from '../redux/slices/nostrSlice';
import { addMessage } from '../redux/slices/noteSlice';

type UseFollowingProps = {};

export const useFollowing = ({}: UseFollowingProps) => {
  const pool = useContext(PoolContext);
  const nostr = useSelector((state: RootState) => state.nostr);
  const keys = useSelector((state: RootState) => state.keys);
  const note = useSelector((state: RootState) => state.note);
  const allRelayUrls = nostr.relays.map((r) => r.relayUrl);
  const writableRelayUrls = nostr.relays.filter((r) => r.write).map((r) => r.relayUrl);
  const dispatch = useDispatch();
  const fetchingFollowing = useRef<boolean>(false);
  const fetchingFollowers = useRef<boolean>(false);
  const followingPks = useRef<string[]>([]);
  const followerPks = useRef<string[]>([]);


  const getFollowing = async (pubkey: string) => {
    if(pubkey === "" || !pool || fetchingFollowing.current){
      return [];
    }
    fetchingFollowing.current = true;

    const sub = pool.sub(allRelayUrls, [{kinds: [3], authors: [pubkey], limit: 1 }])

    sub.on("event", (event: Event) => {
      const followingArray = event.tags.filter((tag) => tag[0] === 'p');
      if (followingArray.length > 0) {
        for (let i = 0; i < followingArray.length; i++) {
          if (followingArray[i][1]) {
            const newPubkey = followingArray[i][1];
            followingPks.current = [...new Set([...followingPks.current, newPubkey])];
          }
        }
      }
    });

    sub.on("eose", () => {
      if (pubkey !== keys.publicKey.decoded) {
        dispatch(setCurrentProfileFollowing(followingPks.current));
      } else{
        dispatch(setFollowing(followingPks.current));
      }
      fetchingFollowing.current = false;
    });
  };

  const getFollowers = async (pubkey: string) => {
    if(!pool || pubkey === ""){
      return;
    }
    fetchingFollowers.current = true;
    const sub = pool.sub(allRelayUrls, [{kinds: [3], ["#p"]: [pubkey] }])
    
    sub.on("event", (event: Event) => {
      followerPks.current = [...new Set([...followerPks.current, event.pubkey])];
    });

    sub.on("eose", () => {
      fetchingFollowers.current = false;

      if(pubkey !== keys.publicKey.decoded){
        dispatch(setCurrentProfileFollowers(followerPks.current));
        return;
      }
      
      dispatch(setFollowers(followerPks.current));
    });
  }
  
  useEffect(() => {
    getFollowers(note.profileEventToShow !== null ? note.profileEventToShow.pubkey : keys.publicKey.decoded);
    getFollowing(note.profileEventToShow !== null ? note.profileEventToShow.pubkey : keys.publicKey.decoded);
  }, [pool, nostr.relays, keys.publicKey.decoded, note.profileEventToShow]);
  
  const updateFollowing = async (followPubkey: string) => {
    if (!pool) return;
    
    const _baseEvent = {
      kind: 3,
      content: "",
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
    } as EventTemplate
    
    try {
      
      const sub = pool.sub(allRelayUrls, [{kinds: [3], authors: [keys.publicKey.decoded], limit: 1 }])
      let retrievedCurrentFollowing: boolean = false;
      const newTag = ["p", followPubkey];
      
      sub.on("event", async (event: Event) => {
        const isUnfollowing: boolean = !!event.tags.some((t) => t[1] === followPubkey);
        retrievedCurrentFollowing = true;
        
        if (isUnfollowing) {
          _baseEvent.tags = event.tags.filter((tag) => tag[1] !== followPubkey);;
        } else {
          _baseEvent.tags = [...event.tags, newTag];
        }

        await signAndPublishEvent(_baseEvent);
      });

      sub.on("eose", async () => {
        if (!retrievedCurrentFollowing) {
          _baseEvent.tags = [newTag];
          await signAndPublishEvent(_baseEvent);
        }
      });

    } catch (error) {
        console.error(error);
    }
  }

  const signAndPublishEvent = async (_baseEvent: EventTemplate) => {
    let signed = false;
    //sign with Nostr Extension
    if (window.nostr && keys.privateKey.decoded === "") {
      signed = await signEventWithNostr(pool, writableRelayUrls, _baseEvent, dispatch);
    }
    //sign with sk
    if (!signed){
      signed= await signEventWithStoredSk(pool, keys, writableRelayUrls, _baseEvent, dispatch); 
    }
    
    if(!signed){
      dispatch(addMessage({message: "Could not sign event", isError: true}));
      return;
    }

    dispatch(setFollowing(_baseEvent.tags.map((tag) => tag[1])));
  }

  return { updateFollowing };
};
