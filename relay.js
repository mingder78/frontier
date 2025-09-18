import { createLibp2p } from 'libp2p';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { tcp } from '@libp2p/tcp';
import { circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';

const node = await createLibp2p({
  addresses: {
    listen: ['/ip4/0.0.0.0/tcp/9001']
  },
  transports: [tcp()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify,
    relay: circuitRelayServer() // Enables relay
  }
});

await node.start();
console.log('Relay Multiaddrs:', node.getMultiaddrs().map(ma => ma.toString()));
// Output example: /ip4/127.0.0.1/tcp/9001/p2p/12D3KooW... (use this in clients)jk