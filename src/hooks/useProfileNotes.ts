import { useContext, useEffect, useRef } from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { addCurrentProfileNotes, addUserNotes, clearCurrentProfileNotes, clearUserEvents, setIsRefreshingUserEvents, setRefreshingCurrentProfileNotes, toggleProfileRefreshAnimation } from "../redux/slices/eventsSlice";
import { RootState } from "../redux/store";
import { PoolContext } from '../context/PoolContext';
import { defaultRelays } from "../nostr/DefaultRelays";
import { sanitizeEvent } from "../utils/sanitizeUtils";
import { Event } from 'nostr-tools';


export const useProfileNotes = () => {
    const pool = useContext(PoolContext);
    const dispatch = useDispatch();
    const keys = useSelector((state: RootState) => state.keys);
    const nostr = useSelector((state: RootState) => state.nostr);
    const events = useSelector((state: RootState) => state.events);
    const note = useSelector((state: RootState) => state.note);
    const fetchingUserNotes = useRef<boolean>(false);
    const fetchingCurrentProfileNotes = useRef<boolean>(false);
    const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl)])];


  //User Notes
  useEffect(() => {
    
    const fetchUserNotes = async () => {
      if (!pool || fetchingUserNotes.current || note.profileEventToShow !== null) return;

      dispatch(clearUserEvents());
      console.log("fetching user notes")

      const sub = pool.sub(allRelayUrls, [{ kinds: [1], authors: [keys.publicKey.decoded]}])
      let eventsBatch: Event[] = [];

      sub.on("event", (event: Event) => {
        const existingInBatch = eventsBatch.some((e: Event) => e.sig === event.sig);
        const existingInStore = events.userNotes.some((e: Event) => e.sig === event.sig);
        const isUsersEvent = keys.publicKey.decoded === event.pubkey;
        if (existingInBatch || existingInStore || !isUsersEvent) {
          fetchingUserNotes.current = false;
          return;
        }

        eventsBatch.push(sanitizeEvent(event));

        if (eventsBatch.length > 10) {
          batch(async () => {
            eventsBatch.forEach((ev) => {
              dispatch(addUserNotes(ev));
            });
          });
        }
      });

      sub.on("eose", () => {
        if (eventsBatch.length > 0){
          
          batch(() => {
            eventsBatch.forEach((ev) => {
              dispatch(addUserNotes(ev));
            });
          });
          
          dispatch(toggleProfileRefreshAnimation());
          dispatch(setIsRefreshingUserEvents(false));
          fetchingUserNotes.current = false;
        }
      });
    }

    fetchUserNotes();

  }, [keys.publicKey.decoded, events.refreshUserNotes, note.profileEventToShow]);
  

     //Curent Profile Notes
  useEffect(() => {
    
    const fetchCurrentProfileNotes = () => {
      if (!pool || note.profileEventToShow === null || fetchingCurrentProfileNotes.current) {
        return;
      }
      fetchingCurrentProfileNotes.current = true;
      dispatch(clearCurrentProfileNotes());

      const profileNotesAlreadyFetched = events.globalNotes.filter((e: Event) => e.pubkey === note.profileEventToShow?.pubkey)
      if (profileNotesAlreadyFetched.length > 0) {
        batch(() => {
          profileNotesAlreadyFetched.forEach((ev) => {
            dispatch(addCurrentProfileNotes(ev));
          });
        });
      }

      const sub = pool.sub(allRelayUrls, [{ kinds: [1], authors: [note.profileEventToShow.pubkey]}])
      
      let eventsBatch: Event[] = [];

      sub.on("event", (event: Event) => {
        if (profileNotesAlreadyFetched.length > 0 && profileNotesAlreadyFetched.some((e: Event) => e.id === event.id)) {
          return; 
        }
        
        eventsBatch.push(sanitizeEvent(event));

        if (eventsBatch.length > 2) {
          batch(() => {
            eventsBatch.forEach((ev) => {
                dispatch(addCurrentProfileNotes(ev));
            });
          });
          eventsBatch = []; 
        }
      });
      
      sub.on("eose", () => {        

        if (eventsBatch.length > 0) {
      
          batch(() => {
            eventsBatch.forEach((ev) => {
              dispatch(addCurrentProfileNotes(eventsBatch));
            });
          });
          eventsBatch = [];
        }
        dispatch(toggleProfileRefreshAnimation());
        dispatch(setRefreshingCurrentProfileNotes(false));
        fetchingCurrentProfileNotes.current = false;
      })
    }
    
    fetchCurrentProfileNotes();
  }, [note.profileEventToShow, events.refreshCurrentProfileNotes]);

};