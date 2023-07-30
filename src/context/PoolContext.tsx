import React from 'react';
import { SimplePool } from 'nostr-tools';

export const PoolContext = React.createContext<SimplePool>(new SimplePool());