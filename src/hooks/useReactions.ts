import { useState, useEffect, useRef } from 'react';
import { ReactionCounts } from '../nostr/Types';
import { Event, SimplePool } from 'nostr-tools';
import { getReactionEvents } from '../nostr/FeedEvents';

type useReactionsProps = {
    events: Event[];
    pool: SimplePool | null;
    relays: string[];
};

function useReactions({ events, pool, relays }: useReactionsProps) {
    const [reactions, setReactions] = useState<Record<string,ReactionCounts>>({});
    const reactionsFetched = useRef<Record<string,boolean>>({});

  useEffect(() => {
    if (!pool) return;

    const getReactions = async () => {
        const unprocessedEvents = events.filter((event) => !reactionsFetched.current[event.id]);
        if (unprocessedEvents.length === 0) return;

        const reactionEventObjects: Record<string, ReactionCounts> = await getReactionEvents(unprocessedEvents, pool, relays, reactions);
        if (!reactionEventObjects) return;

        // merge existing and new reactions
        setReactions((cur) => ({
            ...cur,
            ...reactionEventObjects,
        }));

        // update reactionsFetched ref
        unprocessedEvents.forEach((event) => {
            reactionsFetched.current[event.id] = true;
        });
    }

    getReactions();

    return () => {};
}, [pool, events, relays, reactions]); 

  return reactions;
}

export default useReactions;
