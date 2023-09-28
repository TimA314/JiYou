import { useContext, useEffect, useState } from 'react';
import { Event, EventTemplate, Kind } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { ProfileContent } from '../nostr/Types';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import { metaDataAndRelayHelpingRelay } from '../utils/miscUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { PoolContext } from '../context/PoolContext';
import { addMessage } from '../redux/slices/noteSlice';

type UseProfileProps = {};

export const useProfile = ({}: UseProfileProps) => {
  const pool = useContext(PoolContext);
  const nostr = useSelector((state: RootState) => state.nostr);
  const keys = useSelector((state: RootState) => state.keys);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<ProfileContent>({
    name: "",
    picture: "",
    about: "",
    banner: ""
  });

  const writableRelayUrls = nostr.relays.filter((r) => r.write).map((r) => r.relayUrl);
  const allRelayUrls = nostr.relays.map((r) => r.relayUrl);

  
  const getProfile = async () => {
    if (!pool || keys.publicKey.decoded === "") return;

    // Fetch user profile
    const profileEvent: Event[] = await pool.list([...new Set([...allRelayUrls, metaDataAndRelayHelpingRelay])], [{kinds: [0], authors: [keys.publicKey.decoded], limit: 1 }])

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
    if (keys.publicKey.decoded === "") {
      setProfile({
        name: "",
        picture: "",
        about: "",
        banner: ""
      });
      return;
    }

    getProfile();
  }, [keys.publicKey.decoded]);

  
  const publishProfileEvent = async (newContent: string) => {
    const _baseEvent = {
      kind: 0,
      content: newContent,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
    } as EventTemplate

    if (window.nostr && keys.privateKey.decoded === "") {
      const signed = await signEventWithNostr(pool, writableRelayUrls, _baseEvent, dispatch);
      if (signed) {
        return;
      }
    }

    await signEventWithStoredSk(pool, keys, writableRelayUrls, _baseEvent, dispatch);
  }


  const updateProfile = async (name: string, about: string, picture: string, banner: string) => {
    if (!pool) return;
    console.log("Updating profile");

    try {
          // Fetch user profile
        let contentToPost;
        
        let sub = pool.sub([...new Set([...allRelayUrls, metaDataAndRelayHelpingRelay])], [{kinds: [0], authors: [keys.publicKey.decoded], limit: 1 }])
        
        let published = false;

        sub.on("event", async (event: Event) => {
          if(published) return;
          const sanitizedEvent = sanitizeEvent(event);
          contentToPost = JSON.parse(sanitizedEvent.content);
          console.log(contentToPost);
          contentToPost.name = name;
          contentToPost.about = about;
          contentToPost.picture = picture;
          contentToPost.banner = banner;
          const newContent = JSON.stringify(contentToPost);  
          await publishProfileEvent(newContent);
          published = true;
        });

        sub.on("eose", () => {
          if(published) return;
          contentToPost = {
            name: name,
            about: about,
            picture: picture,
            banner: banner
          }
          publishProfileEvent(JSON.stringify(contentToPost));
        });

    } catch {
        dispatch(addMessage({ message: "Error updating profile", isError: true }));
        return;
    }       
}

  return { profile, updateProfile, getProfile };
};
