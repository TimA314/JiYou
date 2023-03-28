import { SimplePool } from 'nostr-tools'
import React, { useState } from 'react'

type Props = {}

function GlobalFeed({}: Props) {
    const [pool, setPool] = useState<SimplePool | null>(null);
    

  return (
    <div>GlobalFeed</div>
  )
}

export default GlobalFeed