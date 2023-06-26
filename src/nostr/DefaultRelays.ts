import { RelaySetting } from "./Types";

export const defaultRelays: RelaySetting[]  = [
    {relayUrl: "wss://relay.snort.social", read: false, write: true},
    {relayUrl: "wss://nostr.bitcoiner.social", read: false, write: true},
    {relayUrl: "wss://nostr.wine", read: true, write: true},
    {relayUrl: "wss://relay.nostrgraph.net", read: false, write: true},
    {relayUrl: "wss://relay.damus.io/", read: false, write: true},
    {relayUrl: "wss://relay.nostr.bg/", read: false, write: true},
    {relayUrl: "wss://nostr.fmt.wiz.biz/", read: false, write: true},
    {relayUrl: "wss://nos.lol/", read: false, write: true},
    {relayUrl: "wss://relay.nostr.band/", read: false, write: true},
    {relayUrl: "wss://eden.nostr.land", read: true, write: false}
  ]