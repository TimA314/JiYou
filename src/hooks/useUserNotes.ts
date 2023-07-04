import { useState, useEffect, useRef } from 'react';
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
    const isFetchingUserNotes = useRef(false);
    
    const allRelayUrls = relays.map((r) => r.relayUrl);
    const userNotesFilter = {kinds: [1], authors: [pk_decoded]};

    // Set Full Event Data (metadata)
    const setNewEvent = async (event: Event) => {
        if (!pool) return;

        if (userNotes.some(e => e.eventId === newEvent.eventId)) return;
        const newEvent = await fetchSingleFullEventData(pool, allRelayUrls, event);
        setUserNotes(prev => [...prev, newEvent]);
    }

    // Fetch user notes
    useEffect(() => {
        if (!pool || isFetchingUserNotes.current || pk_decoded === "") return;
        isFetchingUserNotes.current = true;

        setUserNotes([]);

        let sub = pool.sub(allRelayUrls, [userNotesFilter]);

        sub.on('event', event => {
            setNewEvent(event);
        })

        sub.on('eose', () => {
            isFetchingUserNotes.current = false;
        })

    }, [pk_decoded]);


    // fetch like notifications
    useEffect(() => {
        if (!pool) return;

        const likeEventIdsToFetch = userNotes.filter((e) => !likedNotificationEvents.some((l) => l.id === e.eventId))
            .map((e) => e.eventId);

        if (likeEventIdsToFetch.length === 0) return;

        const notificationsFilter = {kinds: [7], "#e": likeEventIdsToFetch, "#p": [pk_decoded]};

        let sub = pool.sub(allRelayUrls, [notificationsFilter]);

        sub.on('event', event => {
            if (likedNotificationEvents.some(e => e.id === event.id)) return;
            setLikedNotificationEvents(prev => [...prev, event]);
        })

    }, [userNotes]);

    // fetch metadata for liked notifications
    useEffect(() => {
        if (!pool) return;

        const fetchMetaDataForLikedNotifications = async () => {
            const eventsToFetch = likedNotificationEvents.filter((e) => !likedNotificationMetaData[e.pubkey]);
            if (eventsToFetch.length === 0) return;
            const newMetaData = await fetchMetaData(pool, allRelayUrls, eventsToFetch);
            setLikedNotificationMetaData(prev => ({...prev, ...newMetaData}));
        }

        fetchMetaDataForLikedNotifications();
    }, [likedNotificationEvents])



    return { userNotes, likedNotificationEvents, likedNotificationMetaData };
};