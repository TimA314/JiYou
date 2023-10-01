import { MetaData } from "./Types";
import { bech32 } from '@scure/base'
import { EventTemplate, Kind, Event, validateEvent, verifySignature } from "nostr-tools";

export const getLnurl = (metaData: MetaData) => {
    const utf8Decoder = new TextDecoder('utf-8')
    let lud06 = metaData.lud06;
    let lud16 = metaData.lud16;

    if (lud06 && lud06 !== "") {
      let { words } = bech32.decode(lud06, 1000)
      let data = bech32.fromWords(words)
      return utf8Decoder.decode(data)
    } else if (lud16 && lud16 !== "") {
      let [name, domain] = lud16.split('@')
      return `https://${domain}/.well-known/lnurlp/${name}`
    } else {
      return null
    }
  }

  
  export const getZapCallbackFromLnurl = async (lnurl: string) => {
    let res = await fetch(lnurl)
    let body = await res.json()
    console.log(JSON.stringify(body));

    if (body.allowsNostr && body.nostrPubkey) {
      return body.callback
    }
  }

  export function validateZapRequest(zapRequestString: string): string | null {
    let zapRequest: Event
  
    try {
      zapRequest = JSON.parse(zapRequestString)
    } catch (err) {
      return 'Invalid zap request JSON.'
    }
  
    if (!validateEvent(zapRequest)) return 'Zap request is not a valid Nostr event.'
  
    if (!verifySignature(zapRequest as Event)) return 'Invalid signature on zap request.'
  
    let p = zapRequest.tags.find(([t, v]) => t === 'p' && v)
    if (!p) return "Zap request doesn't have a 'p' tag."
    if (!p[1].match(/^[a-f0-9]{64}$/)) return "Zap request 'p' tag is not valid hex."
  
    let e = zapRequest.tags.find(([t, v]) => t === 'e' && v)
    if (e && !e[1].match(/^[a-f0-9]{64}$/)) return "Zap request 'e' tag is not valid hex."
  
    let relays = zapRequest.tags.find(([t, v]) => t === 'relays' && v)
    if (!relays) return "Zap request doesn't have a 'relays' tag."
  
    return null
  }
  
  export function makeZapReceipt({
    zapRequest,
    preimage,
    bolt11,
    paidAt,
  }: {
    zapRequest: string
    preimage?: string
    bolt11: string
    paidAt: Date
  }): EventTemplate<Kind.Zap> {
    let zr: Event<Kind.ZapRequest> = JSON.parse(zapRequest)
    let tagsFromZapRequest = zr.tags.filter(([t]) => t === 'e' || t === 'p' || t === 'a')
  
    let zap: EventTemplate<Kind.Zap> = {
      kind: 9735,
      created_at: Math.round(paidAt.getTime() / 1000),
      content: '',
      tags: [...tagsFromZapRequest, ['bolt11', bolt11], ['description', zapRequest]],
    }
  
    if (preimage) {
      zap.tags.push(['preimage', preimage])
    }
  
    return zap
  }

  export function makeZapRequest({
    profile,
    event,
    amount,
    relays,
    comment = '',
  }: {
    profile: string
    event: string | null
    amount: number
    comment: string
    relays: string[]
  }): EventTemplate<Kind.ZapRequest> {
    if (!amount) throw new Error('amount not given')
    if (!profile) throw new Error('profile not given')
  
    let zr: EventTemplate<Kind.ZapRequest> = {
      kind: 9734,
      created_at: Math.round(Date.now() / 1000),
      content: comment,
      tags: [
        ['p', profile],
        ['amount', amount.toString()],
        ['relays', relays.join(',')],
      ],
    }
  
    if (event) {
      zr.tags.push(['e', event])
    }
  
    return zr
  }
