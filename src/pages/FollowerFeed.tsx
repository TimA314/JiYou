import {useEffect, useState } from 'react';
import { getPublicKey, SimplePool, Event } from 'nostr-tools';
import { useNavigate } from 'react-router';
import Note from '../components/Note';
import { defaultRelays } from '../nostr/Relays';
import * as secp from "@noble/secp256k1";
import { EventWithProfile } from '../nostr/Types';
import { sanitizeString } from '../util';


function FollowerFeed() {
    const [events, setEvents] = useState<EventWithProfile[]>([])
    const privateKey = window.localStorage.getItem("localSk");
    const localRelays: string | null = localStorage.getItem('relays');
    const relays: string[] = !localRelays || JSON.parse(localRelays)?.length === 0 ? defaultRelays : JSON.parse(localRelays);
    const navigate = useNavigate();

    const pool = new SimplePool();
    
    useEffect(() => {
        if (!secp.utils.isValidPrivateKey(privateKey ?? "")) navigate("/", {replace: true});

        const loadEvents = async () => {
            try{

                let followerPks = await getUserFollowers()
                let poolOfEvents = await pool.list(relays, [{kinds: [1], authors: followerPks, limit: 100 }])

                if(!poolOfEvents) {
                    return;
                }

                for(let i=0;i<poolOfEvents.length;i++) {
                    if (events.find(e => e.sig === poolOfEvents[i].sig) !== undefined) continue;

                    let prof: Event[] = await pool.list(relays, [{kinds: [0], authors: [poolOfEvents[i].pubkey], limit: 1 }])

                    if(prof){
                        let newPost: EventWithProfile = {
                            ...poolOfEvents[i],
                            profileEvent: prof[0],
                            isFollowing: Array.isArray(followerPks) && followerPks.some(followPk => followPk === prof[0].pubkey)
                        }
                        
                        setEvents((prevEvents) => {
                            return [...prevEvents, newPost];
                        });
                    }
                }

            } catch (error) {
                console.error("event error: " + error)
            }
        }

        const getUserFollowers = async() => {
            const userFollowerEvent: Event[] = await pool.list(relays, [{kinds: [3], authors: [getPublicKey(privateKey!)], limit: 1 }])

            if (!userFollowerEvent[0] || !userFollowerEvent[0].tags) return;

            const followerArray: string[][] = userFollowerEvent[0].tags.filter((tag) => tag[0] === "p");
            let followerPks: string[] = [];
            for(let i=0; i<followerArray.length;i++){
                if(secp.utils.isValidPrivateKey(followerArray[i][1])){
                    followerPks.push(followerArray[i][1]);
                }
            }
            return followerPks;
        }

        loadEvents();
    }, [])
    
    if (events && events.length > 0) {
        return (
            <>
                {events
                .filter((event, index, self) => {
                    return index === self.findIndex((e) => (
                    e.sig === event.sig
                    ))
                })
                .map((event) => {
                    return (
                    <Note key={sanitizeString(event.sig)} event={event} />
                    )
                })}
            </>
        )
    } else {
        return <></>
    }
}

export default FollowerFeed