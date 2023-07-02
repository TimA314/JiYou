import { useState, useEffect } from 'react';
import { SimplePool, Event } from 'nostr-tools';
import { FullEventData, RelaySetting } from '../nostr/Types';
import { fetchSingleFullEventData } from '../nostr/FetchEvent';

type useUserNotesProps = {
    pool: SimplePool | null;
    relays: RelaySetting[];
    pk_decoded: string;
    following: string[]; 
};

export const useUserNotes = ({ 
    pool,
    relays, 
    pk_decoded,
    following 
}: useUserNotesProps) => {

    const [userNotes, setUserNotes] = useState<FullEventData[]>([]);
    const allRelayUrls = relays.map((r) => r.relayUrl);
    const filter = {kinds: [1], authors: [pk_decoded]};

    const setNewEvent = async (event: Event) => {
        if (!pool) return;
        console.log(userNotes.some(e => e.eventId === newEvent.eventId) + " duplicate")
        if (userNotes.some(e => e.eventId === newEvent.eventId)) return;
        const newEvent = await fetchSingleFullEventData(pool, allRelayUrls, event);
        setUserNotes(prev => [...prev, newEvent]);
    }

    useEffect(() => {
    if (!pool) return;

    let sub = pool.sub(allRelayUrls, [filter]);

    sub.on('event', event => {
        console.log('new event', JSON.stringify(event))
        setNewEvent(event);
    })

    }, [pk_decoded]);

    return { userNotes };
};