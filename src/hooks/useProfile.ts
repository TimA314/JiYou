import { useEffect, useState } from 'react';
import { Event, EventTemplate, Kind, SimplePool, getEventHash, nip19 } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { ProfileContent } from '../nostr/Types';

type UseProfileProps = {
  pool: SimplePool | null;
  relays: string[];
  pk: string;
  setEventToSign: (event: EventTemplate) => void;
  setSignEventOpen: (open: boolean) => void;
};

export const useProfile = ({ pool, relays, pk, setEventToSign, setSignEventOpen}: UseProfileProps) => {
  const [profile, setProfile] = useState<ProfileContent>({
    name: "",
    picture: "",
    about: "",
    banner: ""
  });
  
  useEffect(() => {
    if (!pool || pk === "") return;

    const getProfile = async () => {
                  // Fetch user profile
                  const profileEvent: Event[] = await pool.list(relays, [{kinds: [0], authors: [pk], limit: 1 }])
            
                  if (!profileEvent || profileEvent.length < 1) return;
                  
                  const sanitizedEvent = sanitizeEvent(profileEvent[0]);
                  const content = JSON.parse(sanitizedEvent.content);

                  const profileContent: ProfileContent = {
                    name: content.name ? content.name : "",
                    picture: content.picture ? content.picture : "",
                    about: content.about ? content.about : "",
                    banner: content.banner ? content.banner : ""
                }
                
                setProfile(profileContent);
    };
  
    getProfile();
  }, [pool, pk]);

  
const signNostrEventWithNostrExtension = async (_baseEvent: EventTemplate) => {
  if (!window.nostr || !pool) return false;

  try{
    const pubkey = await window.nostr.getPublicKey();
    if (!pubkey) return false;
    const encodedPk = nip19.npubEncode(pubkey);
    if (!encodedPk || !encodedPk.startsWith("npub")) return false;

    //sign event
    const sig = (await window.nostr.signEvent(_baseEvent)).sig;
    const newEvent: Event = {
      ..._baseEvent,
      id: getEventHash({..._baseEvent, pubkey}),
      sig,
      pubkey: pubkey,
    }

  const pubs = pool.publish(relays, newEvent)
  
  pubs.on("ok", (pub: string) => {
      console.log("Posted to relay " + pub)

  })

  pubs.on("failed", (error: string) => {
    console.log("Failed to post to relay " + error)
  })
  
  return true;

  } catch { 
    return false;
  }
}
  
  const updateProfile = async (name: string, about: string, picture: string, banner: string) => {
    if (!pool) return;
    console.log("Updating profile");
    try {

        const updatedProfileContent: ProfileContent = {
            name: name,
            about: about,
            picture: picture,
            banner: banner
        }
        
        const newContent = JSON.stringify(updatedProfileContent);  
        
        const _baseEvent = {
            kind: Kind.Metadata,
            content: newContent,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
        } as EventTemplate

         
      if (window.nostr) {
        const signed = await signNostrEventWithNostrExtension(_baseEvent);
        if (signed) {
          setProfile(updatedProfileContent);
          return;
        }
      }


      setSignEventOpen(true);
      setEventToSign(_baseEvent);

    } catch (error) {
        alert(error);
        return;
    }       
}

  return { profile, updateProfile, setProfile };
};
