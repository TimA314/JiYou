import { useState, useEffect, useRef } from 'react';
import { Event, SimplePool } from 'nostr-tools';
import { getReplyThreadEvents } from '../nostr/FeedEvents';

type useReplyThreadsProps = {
  events: Event[];
  pool: SimplePool | null;
  relays: string[];
};

function useReplyThreads({ events, pool, relays }: useReplyThreadsProps) {
  const [replyThreads, setReplyThreads] = useState<Record<string, Event[]>>({});
  const replyThreadFetched = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!pool) return;

    const fetchReplyThreads = async () => {
      const unprocessedEvents = events.filter((event) => !replyThreadFetched.current[event.id]);
      if (unprocessedEvents.length === 0) return;

      const replyThreadEvents = await getReplyThreadEvents(unprocessedEvents, pool, relays);
      if (!replyThreadEvents) return;

      // Group replyThreadEvents by their referredEvent id
      const groupedReplies: Record<string, Event[]> = {};
      replyThreadEvents.forEach((event) => {
        const referredId = event.tags.find((tag) => tag[0] === 'e')?.[1] || '';
        if (!groupedReplies[referredId]) {
          groupedReplies[referredId] = [];
        }
        groupedReplies[referredId].push(event);
      });

      setReplyThreads((cur) => ({
        ...cur,
        ...groupedReplies,
      }));

      unprocessedEvents.forEach((event) => {
        replyThreadFetched.current[event.id] = true;
      });
    };

    fetchReplyThreads();

    return () => {};
  }, [pool, events, relays]);

  return replyThreads;
}

export default useReplyThreads;
