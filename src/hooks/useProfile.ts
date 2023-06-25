import { useEffect, useState } from 'react';
import { Event, EventTemplate, Kind, SimplePool } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { ProfileContent } from '../nostr/Types';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';

type UseProfileProps = {
  pool: SimplePool | null;
  relays: string[];
  pk_decoded: string;
};

export const useProfile = ({ pool, relays, pk_decoded }: UseProfileProps) => {
  const [profile, setProfile] = useState<ProfileContent>({
    name: "",
    picture: "",
    about: "",
    banner: ""
  });
  
  const getProfile = async () => {
    if (!pool || pk_decoded === "") return;

    // Fetch user profile
    const profileEvent: Event[] = await pool.list(relays, [{kinds: [0], authors: [pk_decoded], limit: 1 }])

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

  useEffect(() => {
    if (!pool || pk_decoded === "") return;
    getProfile();
  }, []);

  
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
        setProfile(updatedProfileContent);
        
        const newContent = JSON.stringify(updatedProfileContent);  
        const _baseEvent = {
            kind: Kind.Metadata,
            content: newContent,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
        } as EventTemplate

         
      if (window.nostr) {
        const signed = await signEventWithNostr(pool, relays, _baseEvent);
        if (signed) {
          return;
        }
      }

      await signEventWithStoredSk(pool, relays, _baseEvent);

    } catch (error) {
        alert(error);
        return;
    }       
}

  return { profile, updateProfile, getProfile };
};
