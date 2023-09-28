import { useContext, useEffect } from "react";
import { batch, useDispatch, useSelector } from "react-redux";
import { addCurrentProfileNotes, addUserNotes, clearCurrentProfileNotes, clearUserEvents, setIsRefreshingUserEvents, setRefreshingCurrentProfileNotes } from "../redux/slices/eventsSlice";
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

    const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl)])];


  //User Notes
  useEffect(() => {
    
    const fetchUserNotes = async () => {
      if (!pool) return;

      dispatch(clearUserEvents());

      const batchedList = await pool.batchedList('initial', allRelayUrls, [{ kinds: [1], authors: [keys.publicKey.decoded]}])
      let eventsBatch: Event[] = [];

      batch(() => {
        eventsBatch.forEach((ev) => {
          if (keys.publicKey.decoded === ev.pubkey) {
            dispatch(addUserNotes(sanitizeEvent(ev)));
          } else {
            dispatch(addCurrentProfileNotes(sanitizeEvent(ev)));
          }
        });
      });

      dispatch(setIsRefreshingUserEvents(false))
    }

    fetchUserNotes();
  }, [keys.publicKey.decoded, events.refreshUserNotes, note.profileEventToShow]);
  

     //Curent Profile Notes
  useEffect(() => {
    
    const fetchCurrentProfileNotes = () => {
      dispatch(clearCurrentProfileNotes());

      if (!pool || note.profileEventToShow === null) {
        return;
      }

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

      sub.on("event", async (event: Event) => {
        if (profileNotesAlreadyFetched.length > 0 && profileNotesAlreadyFetched.some((e: Event) => e.id === event.id)) {
          return; 
        }
        
        eventsBatch.push(await sanitizeEvent(event));

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
        dispatch(setRefreshingCurrentProfileNotes(false));

      })
    }
    
    fetchCurrentProfileNotes();
  }, [note.profileEventToShow, events.refreshCurrentProfileNotes]);

};