// client.ts
import { createLibp2p } from "libp2p";
import { yamux } from "@chainsafe/libp2p-yamux";
import { noise } from "@chainsafe/libp2p-noise";
import { webRTC } from "@libp2p/webrtc";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";

const RELAY_MULTIADDR = "/ip4/127.0.0.1/tcp/9090/ws/p2p/<RelayPeerId>";

const node = await createLibp2p({
  transports: [
    webRTC(),
    circuitRelayTransport()
  ],
  connectionEncryption: [noise()],
  streamMuxers: [yamux()],
});

await node.dial(RELAY_MULTIADDR);

console.log("Client started:", node.peerId.toString());

