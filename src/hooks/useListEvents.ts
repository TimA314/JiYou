import { useEffect, useMemo, useRef, useContext } from 'react';
import { Event, Filter } from 'nostr-tools';
import { eventContainsExplicitContent } from '../utils/eventUtils';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { batch, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addGlobalNotes, addReplyNotes, addRootNotes, clearGlobalNotes, setIsRefreshingFeedNotes } from '../redux/slices/eventsSlice';
import { PoolContext } from '../context/PoolContext';
import { GetImageFromPost } from '../utils/miscUtils';
import { addMessage } from '../redux/slices/noteSlice';
import { defaultRelays } from '../nostr/DefaultRelays';

type useListEventsProps = {};

export const useListEvents = ({}: useListEventsProps) => {
  const pool = useContext(PoolContext);
  const events = useSelector((state: RootState) => state.events);
  const nostr = useSelector((state: RootState) => state.nostr);
  const note = useSelector((state: RootState) => state.note);
  const repliesFetched = useRef<Record<string, boolean>>({});
  const rootsFetched = useRef<Record<string, boolean>>({});
  const dispatch = useDispatch();
  const readableRelayUrls = useMemo(() => nostr.relays.filter((r) => r.read).map((r) => r.relayUrl), [nostr.relays]);
  const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl)])];


  //Feed Notes
  useEffect(() => {
    dispatch(clearGlobalNotes());
    
    if (!events.refreshFeedNotes){
      dispatch(setIsRefreshingFeedNotes(true))
    }

    const subFeedEvents = async () => {
      if (!pool)  {
        dispatch(setIsRefreshingFeedNotes(false))
        return;
      }
      dispatch(addMessage({ message: "Requesting Notes", isError: false }));
      

      let imageOnly = note.imageOnlyMode;
      let hideExplicitContent = note.hideExplicitContent;
      
      const unParsedSettings = localStorage.getItem("JiYouSettings");
      if (unParsedSettings){
        const settings = JSON.parse(unParsedSettings);
        imageOnly = settings.feedSettings.imagesOnlyMode;
        hideExplicitContent = settings.feedSettings.hideExplicitContent
      }

      let filter: Filter = {kinds: [1], limit: 50};

      if (note.searchEventIds.length > 0){
        filter.ids = note.searchEventIds;
      } 
      
      if (note.hashTags.length > 0) {
        filter["#t"] = note.hashTags;
      }

      if (note.tabIndex == 1 && nostr.following.length > 0){
        filter.authors = nostr.following;
      }


      console.log("fetching feed with filter: " + JSON.stringify(filter))
      let sub = pool.sub(readableRelayUrls, [filter]);

      let eventsBatch: Event[] = [];

      sub.on("event", async (event: Event) => {
        if (hideExplicitContent && eventContainsExplicitContent(event, note.explicitTags)) return;
        if (imageOnly && GetImageFromPost(event.content)?.length === 0){
          return;
        }
        if (note.hashTags.length > 0 && event.tags.filter((t) => t[0] === "t" && note.hashTags.includes(t[1])).length === 0) return;

        eventsBatch.push(await sanitizeEvent(event));

        if (eventsBatch.length > 10) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addGlobalNotes(ev)));
          });
          eventsBatch = [];
        }
      });

      sub.on("eose", () => {
        if (eventsBatch.length > 0) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addGlobalNotes(ev)));
          });
          eventsBatch = [];
        }
        dispatch(setIsRefreshingFeedNotes(false));
      })
    }

    subFeedEvents();
  }, [note.hashTags, note.searchEventIds, events.refreshFeedNotes, note.tabIndex, note.hideExplicitContent, note.imageOnlyMode, nostr.relays]);

 
  //Reply Events
  useEffect(() => {
    
    const subReplyEvents = async () => {
      if (!pool) return;

      const replyEventIdsToFetch: string[] = []
     
      events.globalNotes.filter((e: Event) => !repliesFetched.current[e.id] || repliesFetched.current[e.id] !== true)
        .forEach((e) => replyEventIdsToFetch.push(e.id));

      Object.values(events.rootNotes).flat().filter((e: Event) => !repliesFetched.current[e.id] || repliesFetched.current[e.id] !== true)
      .forEach((e) => replyEventIdsToFetch.push(e.id));

      Object.values(events.replyNotes).flat().filter((e: Event) => !repliesFetched.current[e.id] || repliesFetched.current[e.id] !== true)
      .forEach((e) => replyEventIdsToFetch.push(e.id));

      events.userNotes.filter((e: Event) => !repliesFetched.current[e.id] || repliesFetched.current[e.id] !== true)
        .forEach((e) => replyEventIdsToFetch.push(e.id));

      events.currentProfileNotes.filter((e: Event) => !repliesFetched.current[e.id] || repliesFetched.current[e.id] !== true)
        .forEach((e) => replyEventIdsToFetch.push(e.id));
      
      if (replyEventIdsToFetch.length === 0) return;

      replyEventIdsToFetch.forEach((id) => repliesFetched.current[id] = true)

      let batchedList = await pool.batchedList('noteDetails', allRelayUrls, [{ kinds: [1], "#e": replyEventIdsToFetch}]);
      console.log("ReplyEvents: " + batchedList.length)
      batch(() => {
        batchedList.forEach(ev => dispatch(addReplyNotes(sanitizeEvent(ev))));
      });
      
    }

    subReplyEvents();
  }, [events.globalNotes, events.replyNotes, events.rootNotes, events.userNotes, events.currentProfileNotes]);


  //Root Events
  useEffect(() => {
    
    const subRootEvents = async () => {
      if (!pool) return;
      const idsToFetch: string[] = [];
      
      events.globalNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      Object.values(events.replyNotes).flat().forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      events.userNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      events.currentProfileNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      events.rootNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      if (idsToFetch.length === 0){
        return;
      }

      let batchedList = await pool.batchedList('noteDetails', allRelayUrls, [{ kinds: [1], ids: idsToFetch}]);
      console.log("RootEvents: " + batchedList.length)
      batch(() => {
        batchedList.forEach(ev => dispatch(addRootNotes(sanitizeEvent(ev))));
      })
    }

    subRootEvents();
  }, [events.globalNotes, events.replyNotes, events.userNotes, events.rootNotes, events.currentProfileNotes]);

}
