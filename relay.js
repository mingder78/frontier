import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";

const node = await createLibp2p({
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/15003/ws"],
  },
  transports: [tcp(), webSockets()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  relay: circuitRelayServer(),
});

console.log("🚀 Relay node ready!");
node.getMultiaddrs().forEach(ma => console.log(ma.toString()));

