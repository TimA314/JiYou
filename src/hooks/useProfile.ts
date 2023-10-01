import { useContext, useEffect, useState } from 'react';
import { Event, EventTemplate, Kind } from 'nostr-tools';
import { sanitizeEvent } from '../utils/sanitizeUtils';
import { signEventWithNostr, signEventWithStoredSk } from '../nostr/FeedEvents';
import { metaDataAndRelayHelpingRelay } from '../utils/miscUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { PoolContext } from '../context/PoolContext';
import { addMessage } from '../redux/slices/noteSlice';
import { MetaData } from '../nostr/Types';

type UseProfileProps = {};

export const useProfile = ({}: UseProfileProps) => {
  const pool = useContext(PoolContext);
  const nostr = useSelector((state: RootState) => state.nostr);
  const keys = useSelector((state: RootState) => state.keys);
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<MetaData>({
    name: "",
    picture: "",
    about: "",
    banner: "",
    lud16: "",
    lud06: ""
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

    const profileContent: MetaData = {
      name: content.name ? content.name : "",
      picture: content.picture ? content.picture : "",
      about: content.about ? content.about : "",
      banner: content.banner ? content.banner : "",
      lud16: content.lud16 ? content.lud16 : "",
      lud06: content.lud06 ? content.lud06 : ""
    }
    
    setProfile(profileContent);
  };

  useEffect(() => {
    if (keys.publicKey.decoded === "") {
      setProfile({
        name: "",
        picture: "",
        about: "",
        banner: "",
        lud16: "",
        lud06: ""
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


  const updateProfile = async (profileContent: MetaData) => {
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
          contentToPost.name = profileContent.name;
          contentToPost.about = profileContent.about;
          contentToPost.picture = profileContent.picture;
          contentToPost.banner = profileContent.banner;
          contentToPost.lud16 = profileContent.lud16;
          contentToPost.lud06 = profileContent.lud06;
          const newContent = JSON.stringify(contentToPost);  
          await publishProfileEvent(newContent);
          published = true;
        });

        sub.on("eose", () => {
          if(published) return;
          contentToPost = {
            name: profileContent.name,
            about: profileContent.about,
            picture: profileContent.picture,
            banner: profileContent.banner,
            lud16: profileContent.lud16,
            lud06: profileContent.lud06
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
