import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayServer } from "@libp2p/circuit-relay-v2";
import { createEd25519PeerId } from "@libp2p/peer-id-factory";

const main = async () => {
const peerId = await createEd25519PeerId();

const node = await createLibp2p({
  peerId,
  addresses: {
    listen: ["/ip4/0.0.0.0/tcp/15003/ws",
//           "/dns4/myserver.com/tcp/443/wss"
    ],
  },
  transports: [tcp(), webSockets()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
  relay: circuitRelayServer(),
});

console.log("🚀 Relay node ready!");
node.getMultiaddrs().forEach(ma => console.log(ma.toString()));

console.log("✅ PeerId object:", node.peerId);
console.log("✅ PeerId as string:", node.peerId.toString()); // 最常用
}

main()
