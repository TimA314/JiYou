import { useDispatch, useSelector } from "react-redux";
import { PoolContext } from '../context/PoolContext';
import { useContext } from 'react';
import { getLnurl, getZapCallbackFromLnurl, makeZapRequest, validateZapRequest } from "../nostr/Zaps";
import { addMessage } from "../redux/slices/noteSlice";
import { MetaData } from "../nostr/Types";
import { fetchNostrBandMetaData } from "../utils/eventUtils";
import { RootState } from "../redux/store";
import { defaultRelays } from "../nostr/DefaultRelays";
import { metaDataAndRelayHelpingRelay } from "../utils/miscUtils";
import { Event, finishEvent } from "nostr-tools";
import { addZaps } from "../redux/slices/eventsSlice";

export const useZapNote = () => {
    const pool = useContext(PoolContext);
    const events = useSelector((state: RootState) => state.events);
    const nostr = useSelector((state: RootState) => state.nostr);
    const keys = useSelector((state: RootState) => state.keys);
    const allRelayUrls = [...new Set([...nostr.relays.map((r) => r.relayUrl), ...defaultRelays.map((r) => r.relayUrl), metaDataAndRelayHelpingRelay])];

    const dispatch = useDispatch();

    const zapNote = async (zapEvent: Event, amount: number) => {
        if (!pool || zapEvent === null) return;
        if (!typeof window.webln) {
          console.log('WebLN is not available');
          return;
        }
        console.log("zapNote");
    
        let callback = null;
        let lnurl = null;
    
        if (events.metaData[zapEvent.pubkey]){
          // Get the lnurl from the metadata
          lnurl = getLnurl(events.metaData[zapEvent.pubkey]);
          console.log(events.metaData[zapEvent.pubkey])
        } else {
          // Backup get lnurl from NostrBand metadata
          const nostrBandMetaData = await fetchNostrBandMetaData(zapEvent.pubkey);
          console.log("nostrBandMetaData", nostrBandMetaData)
          if (nostrBandMetaData) {
            lnurl = getLnurl(nostrBandMetaData as MetaData)
          }
        }
          
        console.log("lnurl", lnurl);
    
        if (!lnurl) {
          dispatch(addMessage({ message: "unable to get lnurl", isError: true }));
          return;
        }
          
        callback = await getZapCallbackFromLnurl(lnurl);
    
        console.log("callback", callback);
        if (!callback) {
          dispatch(addMessage({ message: "unable to get callback from lnurl", isError: true }));
          return;
        }
    
        const zapRequest = makeZapRequest(
          {
            profile: zapEvent.pubkey,
            event: zapEvent.id,
            amount: amount,
            comment: "zap",
            relays: allRelayUrls
          }
        );
    
        let signedEvent = null;
        
        if (window.nostr && keys.privateKey.decoded === ""){
          try{
            signedEvent = await window.nostr.signEvent(zapRequest);
            console.log("signed by extension");
          } catch{
            dispatch(addMessage({ message: "unable to sign event", isError: true }));
            return;
          }
        } else {
          signedEvent = finishEvent(zapRequest, keys.privateKey.decoded);
        }
    
        if (!signedEvent) {
          dispatch(addMessage({ message: "unable to sign event", isError: true }));
          return;
        }
        
        const validation = validateZapRequest(JSON.stringify(signedEvent));
    
        if(validation !== null){
          dispatch(addMessage({message: validation, isError: true}));
          return;
        }
        
        console.log("zapRequest", zapRequest);
    
        // Provide invoice to a lightning wallet client (e.g. Zeus, Breez, alby, etc.)
        try{
          const jsonResult = await fetch(`${callback}?amount=${amount}&nostr=${event}&lnurl=${lnurl}`)
          const invoice = await jsonResult.json();
          console.log("invoice", invoice.pr)
    
          if(typeof window.webln !== 'undefined') {
            await window.webln.enable();
            await window.webln.sendPayment(invoice.pr);
            dispatch(addMessage({message: "zap sent", isError: false}));
          } else {
            dispatch(addMessage({message: "webln unavailable, unable to send payment", isError: true}));
          }
    
          let sub = pool.sub(allRelayUrls, [{kinds: [9735], ids: [signedEvent.id]}]);
    
          sub.on('event', event => {
            console.log("zap reciept", event);
            if (event.kind === 9735) {
              dispatch(addZaps(event))
              dispatch(addMessage({message: "zap sent", isError: false}));
            }
          });
    
        }
        catch(error) {
          // User denied permission or cancelled 
          console.log(error);
          dispatch(addMessage({message: "unable to send payment", isError: true}));
        }
      }

    return { zapNote }
}