import { useState, useEffect } from 'react';
import { Event, Filter, SimplePool } from 'nostr-tools';
import { sanitizeEvent } from '../util';
import { insertEventIntoDescendingList } from '../util';

type Props = {
  pool: SimplePool | null;
  relays: string[];
  filter: Filter;
};

export const useListEvents = ({ pool, relays, filter }: Props) => {
  const [events, setEvents] = useState<Event[]>([]);

  const isEventDistinct = (event: Event) => {
    return !events.some((existingEvent) => existingEvent.id === event.id);
  };

  useEffect(() => {
    if (!pool) {
      console.log('pool is null');
      return;
    }

    const fetchEvents = async () => {
      try {
        const fetchedEvents = await pool.list(relays, [filter]);
        const sanitizedEvents = fetchedEvents.map((event) => sanitizeEvent(event));
        setEvents((prevEvents) =>
          sanitizedEvents.reduce((accEvents, sanitizedEvent) => {
            if (isEventDistinct(sanitizedEvent)) {
              return insertEventIntoDescendingList(accEvents, sanitizedEvent);
            }
            return accEvents;
          }, prevEvents)
        );
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    setEvents([]);
    fetchEvents();
  }, [pool, relays, filter]);

  return { events, setEvents };
};
