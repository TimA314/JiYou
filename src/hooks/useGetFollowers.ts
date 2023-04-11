import { useState, useEffect } from 'react';
import { Filter, SimplePool } from 'nostr-tools';
import { useListEvents } from './useListEvents';
import * as secp from "@noble/secp256k1";

type UseFollowersProps = {
  pool: SimplePool | null;
  relays: string[];
  tabIndex: number;
  userPublicKey: string;
};

export const useFollowers = ({ pool, relays, tabIndex, userPublicKey }: UseFollowersProps) => {
  const [followers, setFollowers] = useState<string[]>([]);

  const filter: Filter = { kinds: [3], authors: [userPublicKey], limit: 1 }
  const { events } = useListEvents({pool, relays, filter});

  useEffect(() => {
    const getFollowers = async () => {
      if (!window.nostr) {
        if (tabIndex === 0) return;
        alert('You need to install a Nostr extension to provide your pubkey.');
        return;
      }

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
