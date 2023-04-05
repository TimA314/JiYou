import { Event, SimplePool } from "nostr-tools";
import * as secp from "@noble/secp256k1";


export const getFollowers = async (pool: SimplePool, relays: string[], tabIndex: number) => {
            
    if (!window.nostr) {
        if(tabIndex === 0) return;
        alert("You need to install a Nostr extension to provide your pubkey.")
        return;
    }
    try {
        const pk = await window.nostr.getPublicKey();
        
        const userFollowerEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [pk], limit: 1 }])
        let followerPks: string[] = [];
        if (!userFollowerEvent[0] || !userFollowerEvent[0].tags) return [];
        
        const followerArray: string[][] = userFollowerEvent[0].tags.filter((tag) => tag[0] === "p");
        for(let i=0; i<followerArray.length;i++){
            if(secp.utils.isValidPrivateKey(followerArray[i][1])){
                followerPks.push(followerArray[i][1]);
            }
        }
        return followerPks;
    } catch (error) {
        alert(error)
        console.log(error);
    }
}