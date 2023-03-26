import * as secp from "@noble/secp256k1";

export type Event = {
    id?: string
    sig?: string
    kind: Kind
    tags: string[][]
    pubkey: string
    content: string
    created_at: number
  }

export enum Kind {
    Metadata = 0,
    Text = 1,
    RecommendRelay = 2,
    Contacts = 3,
    EncryptedDirectMessage = 4,
    EventDeletion = 5,
    EventUpdate = 6,
    Reaction = 7,
    ChannelCreation = 40,
    ChannelMetadata = 41,
    ChannelMessage = 42,
    ChannelHideMessage = 43,
    ChannelMuteUser = 44,
    RelayList = 10002,
    BlockList = 16462,
    FlagList = 16463,
    ReplaceableByTag = 30000,
  }

  export function getEmptyEvent(): Event {
    return {
      kind: 0,
      pubkey: '',
      content: '',
      tags: [],
      created_at: 0
    }
  }

  export function isEventValid(event: Event): boolean {
    if (typeof event.content !== 'string') return false;
    if (typeof event.created_at !== 'number') return false;
    if (typeof event.pubkey !== 'string') return false;
    if (!event.pubkey.match(/^[a-f0-9]{64}$/)) return false;
    if (!secp.utils.isValidPrivateKey(event.pubkey)) return false;
    if (!Array.isArray(event.tags)) return false;
    for (let i = 0; i < event.tags.length; i++) {
      let tag = event.tags[i]
      if (!Array.isArray(tag)) return false;
      for (let j = 0; j < tag.length; j++) {
        if (typeof tag[j] === 'object') return false;
      }
    }
    return true
  }