import { useEffect, useState } from 'react';
import { Event, EventTemplate, Kind, SimplePool, finishEvent, getEventHash, nip19 } from 'nostr-tools';
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
  
  
  const updateProfile = async (name: string, about: string, picture: string, banner: string) => {
    if (!pool || pk === "") return;

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

        let sig = "";
        const pubkey = pk;
        if (window.nostr) {
          sig = (await window.nostr.signEvent(_baseEvent)).sig;
        } else {
          const sk = localStorage.getItem("sk");
          if (sk || sk !== "" || nip19.decode(sk)) {
            var signedEvent = finishEvent(_baseEvent, sk!);
            sig = signedEvent.sig;
          }
        }

        if (sig === "") return;

        const newEvent: Event = {
            ..._baseEvent,
            id: getEventHash({..._baseEvent, pubkey}),
            sig,
            pubkey,
        }

        const pubs = pool.publish(relays, newEvent)
        
        pubs.on("ok", () => {
            console.log("Posted to relays")

        })
  
        pubs.on("failed", (error: string) => {
          alert("Failed to post to relays" + error)
        })

        setProfile(updatedProfileContent);

    } catch (error) {
        alert(error);
        return;
    }       
}

  return { profile, updateProfile };
};
