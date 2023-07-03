import { useState, useEffect } from 'react';
import { SimplePool, Event } from 'nostr-tools';
import { FullEventData, MetaData, RelaySetting } from '../nostr/Types';
import { fetchMetaData, fetchSingleFullEventData } from '../nostr/FetchEvent';


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
    const [likedNotificationEvents, setLikedNotificationEvents] = useState<Event[]>([]);
    const [likedNotificationMetaData, setLikedNotificationMetaData] = useState<Record<string, MetaData>>({});
    
    const allRelayUrls = relays.map((r) => r.relayUrl);

    const userNotesFilter = {kinds: [1], authors: [pk_decoded]};

    const setNewEvent = async (event: Event) => {
        if (!pool) return;
        console.log(userNotes.some(e => e.eventId === newEvent.eventId) + " duplicate")
        if (userNotes.some(e => e.eventId === newEvent.eventId)) return;
        const newEvent = await fetchSingleFullEventData(pool, allRelayUrls, event);
        setUserNotes(prev => [...prev, newEvent]);
    }

    useEffect(() => {
        if (!pool) return;

        let sub = pool.sub(allRelayUrls, [userNotesFilter]);

        sub.on('event', event => {
            setNewEvent(event);
        })

    }, [pk_decoded]);

    useEffect(() => {
        if (!pool) return;

        const notificationsFilter = {kinds: [7], "#e": userNotes.map((e) => e.eventId), "#p": [pk_decoded]};

        let sub = pool.sub(allRelayUrls, [notificationsFilter]);

        sub.on('event', event => {
            if (likedNotificationEvents.some(e => e.id === event.id)) return;
            setLikedNotificationEvents(prev => [...prev, event]);
        })

    }, [userNotes]);

    useEffect(() => {
        if (!pool) return;

        const fetchMetaDataForLikedNotifications = async () => {
            const eventsToFetch = likedNotificationEvents.filter((e) => !likedNotificationMetaData[e.pubkey]);
            const newMetaData = await fetchMetaData(pool, allRelayUrls, eventsToFetch);
            console.log(newMetaData)
            setLikedNotificationMetaData(prev => ({...prev, ...newMetaData}));
        }

        fetchMetaDataForLikedNotifications();
    }, [likedNotificationEvents])



    return { userNotes, likedNotificationEvents, likedNotificationMetaData };
};