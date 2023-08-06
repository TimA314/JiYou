import { useEffect, useMemo, useRef, useContext } from 'react';
import { Event, Filter } from 'nostr-tools';
import { eventContainsExplicitContent } from '../utils/eventUtils';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { batch, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addCurrentProfileNotes, addGlobalNotes, addMetaData, addReactions, addReplyNotes, addRootNotes, addUserNotes, clearCurrentProfileNotes, clearGlobalNotes, clearUserEvents, setIsRefreshingFeedNotes, setIsRefreshingUserEvents } from '../redux/slices/eventsSlice';
import { PoolContext } from '../context/PoolContext';
import { GetImageFromPost } from '../utils/miscUtils';
import { addMessage } from '../redux/slices/noteSlice';
import { defaultRelays } from '../nostr/DefaultRelays';

type useListEventsProps = {};

export const useListEvents = ({}: useListEventsProps) => {
  const pool = useContext(PoolContext);
  const keys = useSelector((state: RootState) => state.keys);
  const events = useSelector((state: RootState) => state.events);
  const nostr = useSelector((state: RootState) => state.nostr);
  const note = useSelector((state: RootState) => state.note);
  const metadataFetched = useRef<Record<string, boolean>>({});
  const reactionsFetched = useRef<Record<string, boolean>>({});
  const repliesFetched = useRef<Record<string, boolean>>({});
  const rootsFetched = useRef<Record<string, boolean>>({});
  const dispatch = useDispatch();
  const readableRelayUrls = useMemo(() => nostr.relays.filter((r) => r.read).map((r) => r.relayUrl), [nostr.relays]);
  const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl)])];


  //Feed Notes
  useEffect(() => {

    dispatch(clearGlobalNotes());
    const subFeedEvents = async () => {
      if (!pool) return;
      dispatch(addMessage({ message: "Requesting Notes", isError: false }));
      
      let imageOnly = note.imageOnlyMode;
      let hideExplicitContent = note.hideExplicitContent;
      
      const unParsedSettings = localStorage.getItem("JiYouSettings");
      if (unParsedSettings){
        const settings = JSON.parse(unParsedSettings);
        imageOnly = settings.feedSettings.imagesOnlyMode;
        hideExplicitContent = settings.feedSettings.hideExplicitContent
      }

      let filter: Filter = {kinds: [1], limit: 150};

      if (note.searchEventIds.length > 0){
        filter.ids = note.searchEventIds;
      } 
      
      if (note.hashTags.length > 0) {
        filter["#t"] = note.hashTags;
      }

      if (note.tabIndex == 1) {
        if (nostr.following.length === 0) return;

        filter.authors = nostr.following;
      }

      console.log("fetching feed with filter: " + JSON.stringify(filter))
      let sub = pool.sub(readableRelayUrls, [filter]);

      let eventsBatch: Event[] = [];

      sub.on("event", (event: Event) => {
        if (hideExplicitContent && eventContainsExplicitContent(event)) return;
        if (imageOnly && GetImageFromPost(event.content)?.length === 0){
          return;
        }
        if (note.hashTags.length > 0 && event.tags.filter((t) => t[0] === "t" && note.hashTags.includes(t[1])).length === 0) return;

        eventsBatch.push(sanitizeEvent(event));

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


  //MetaData
  useEffect(() => {
  
    
    const fetchMetaData = async () => {
      if (!pool) return;
      const pubkeysToFetch = [];

      events.globalNotes.filter((event) => metadataFetched.current[event.pubkey] !== true)
        .forEach((event) => pubkeysToFetch.push(event.pubkey));

      Object.values(events.reactions).flat().filter((event) => metadataFetched.current[event.pubkey] !== true)
        .forEach((event) => pubkeysToFetch.push(event.pubkey));

      Object.values(events.replyNotes).flat().filter((event) => metadataFetched.current[event.pubkey] !== true)
      .forEach((event) => pubkeysToFetch.push(event.pubkey));

      if (!events.metaData[keys.publicKey.decoded]) {
        pubkeysToFetch.unshift(keys.publicKey.decoded)
      }

      pubkeysToFetch.forEach((pubkey) => (metadataFetched.current[pubkey] = true));

      if (pubkeysToFetch.length === 0) return;
      
      const sub = pool.sub([...allRelayUrls, "wss://purplepag.es"], [
        {
          kinds: [0],
          authors: pubkeysToFetch,
        },
      ]);

      let eventsBatch: Event[] = [];

      sub.on("event", (event: Event) => {
        eventsBatch.push(sanitizeEvent(event));
        if (eventsBatch.length > 10) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addMetaData(ev)));
          });
          eventsBatch = [];
        }
      });

      sub.on("eose", () => {
        if (eventsBatch.length > 0) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addMetaData(ev)));
          });
          eventsBatch = [];
        }
      })

    };

      fetchMetaData();

    return () => {};
  }, [events.globalNotes, events.reactions, events.replyNotes, events.rootNotes, keys.publicKey.decoded]);

  


  //Reactions
  useEffect(() => {

    const fetchReactions = async () => {
      if (!pool) return;
      const allPubkeysToFetch: string[] = []
      const allEventIdsToFetch: string[] = []

      const feedEventsToFetch = events.globalNotes.filter((e) => reactionsFetched.current[e.id] !== true);
      const rootEventsToFetch = events.rootNotes.filter((e) => reactionsFetched.current[e.id] !== true);
      const replyEventsToFetch = Object.values(events.replyNotes).flat().filter((e) => reactionsFetched.current[e.id] !== true);
      const userEventsToFetch =  events.userNotes.filter((e) => reactionsFetched.current[e.id] !== true);

      const uniqueEvents = [...new Set([...feedEventsToFetch, ...rootEventsToFetch, ...userEventsToFetch, ...replyEventsToFetch])];

      uniqueEvents.forEach((e) => {
        reactionsFetched.current[e.id] = true;
        allPubkeysToFetch.push(e.pubkey) 
        allEventIdsToFetch.push(e.id)
        }
      );

      if(allEventIdsToFetch.length === 0 || allPubkeysToFetch.length === 0){
        return;
      }

      let sub = pool.sub(allRelayUrls, [{ "kinds": [7], "#e": allEventIdsToFetch, "#p": allPubkeysToFetch}]);
      
      let eventsBatch: Event[] = [];

      sub.on("event", (event: Event) => {
        eventsBatch.push(sanitizeEvent(event));
        if (eventsBatch.length > 10) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addReactions(ev)));
          });
          eventsBatch = [];
        }
      });

      sub.on("eose", () => {
        if (eventsBatch.length > 0) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addReactions(ev)));
          });
          eventsBatch = [];
        }
      })
    }

    fetchReactions();
  }, [events.globalNotes, events.replyNotes, events.rootNotes, events.userNotes]);

  
  //Reply Events
  useEffect(() => {
    
    const subReplyEvents = async () => {
      if (!pool) return;

      const replyEventIdsToFetch: string[] = []
     
      events.globalNotes.filter((e: Event) => repliesFetched.current[e.id] !== true)
        .forEach((e) => replyEventIdsToFetch.push(e.id));

      Object.values(events.rootNotes).flat().filter((e: Event) => repliesFetched.current[e.id] !== true)
      .forEach((e) => replyEventIdsToFetch.push(e.id));

      Object.values(events.replyNotes).flat().filter((e: Event) => repliesFetched.current[e.id] !== true)
      .forEach((e) => replyEventIdsToFetch.push(e.id));

      events.userNotes.filter((e: Event) => repliesFetched.current[e.id] !== true)
        .forEach((e) => replyEventIdsToFetch.push(e.id));

      replyEventIdsToFetch.forEach((id) => repliesFetched.current[id] = true)

      if (replyEventIdsToFetch.length === 0) return;

      let sub = pool.sub(allRelayUrls, [{ kinds: [1], "#e": replyEventIdsToFetch}]);
      
      let eventsBatch: Event[] = [];

      sub.on("event", (event: Event) => {
        eventsBatch.push(sanitizeEvent(event));
        if (eventsBatch.length > 10) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addReplyNotes(ev)));
          });
          eventsBatch = [];
        }
      });

      sub.on("eose", () => {
        if (eventsBatch.length > 0) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addReplyNotes(ev)));
          });
          eventsBatch = [];
        }
      })
    }

    subReplyEvents();
  }, [events.globalNotes, events.replyNotes, events.rootNotes, events.userNotes]);


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

      events.rootNotes.forEach((e: Event) => {
        e.tags?.filter((t) => t[0] === "e" && t[1] && rootsFetched.current[t[1]] !== true).forEach(((t) => {
          idsToFetch.push(t[1])
          rootsFetched.current[e.id] = true;
        }));
      });

      if (idsToFetch.length === 0){
        return;
      }

      let sub = pool.sub(allRelayUrls, [{ kinds: [1], ids: idsToFetch}]);
      
      let eventsBatch: Event[] = [];
      
      sub.on("event", (event: Event) => {
        eventsBatch.push(sanitizeEvent(event));
        if (eventsBatch.length > 10) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addRootNotes(ev)));
          })
        }
      });

      sub.on("eose", () => {
        if (eventsBatch.length > 0) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addRootNotes(ev)));
          });
          eventsBatch = [];
        }
      })
    }

    subRootEvents();
  }, [events.globalNotes, events.replyNotes, events.userNotes, events.rootNotes]);

  //User Notes
  useEffect(() => {
    
    const fetchUserNotes = () => {
      if (!pool) return;

      if(note.profileEventToShow !== null){
        dispatch(clearCurrentProfileNotes())
      } else{
        dispatch(clearUserEvents());
      }

      const pubkeyToFetch: string = note.profileEventToShow === null ? keys.publicKey.decoded : note.profileEventToShow.pubkey;
      console.log("Requesting User Notes for ", pubkeyToFetch)

      const sub = pool.sub(allRelayUrls, [{ kinds: [1], authors: [pubkeyToFetch]}])
      let eventsBatch: Event[] = [];

      sub.on("event", (event: Event) => {
        eventsBatch.push(sanitizeEvent(event));
        console.log(note.profileEventToShow === null ? "userEvent" : "profileEvent")

        if (eventsBatch.length > 2) {
          batch(() => {
            eventsBatch.forEach((ev) => {

              if (keys.publicKey.decoded === ev.pubkey) {
                dispatch(addUserNotes(ev));
              } else {
                dispatch(addCurrentProfileNotes(ev));
              }
            });
          });
          eventsBatch = []; 
        }


      });

      sub.on("eose", () => {
        dispatch(setIsRefreshingUserEvents(false))

        if (eventsBatch.length > 0) {
          batch(() => {
            eventsBatch.forEach(ev => dispatch(addReplyNotes(ev)));
          });
          eventsBatch = [];
        }
      })
    }

    fetchUserNotes();
  }, [pool, keys.publicKey.decoded, events.refreshUserNotes, note.profileEventToShow]);
}