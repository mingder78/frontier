#!/usr/bin/env node

import minimist from 'minimist'
import { createLibp2p } from 'libp2p'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'

const AUDIO_PROTOCOL = '/webrtc-audio/1.0.0'

async function main() {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/127.0.0.1/tcp/0/ws']
      // TODO check "What is next?" section
    },
    transports: [
      webSockets()
    ],
    connectionEncrypters: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
services: {
      identify: identify(),
      relay: circuitRelayServer({
        reservations: {  // Configures reservation limits (default: unlimited for testing)
          maxReservations: 50,
          maxReservationsPerPeer: 10,  // Limits reservations per peer
          reservationDuration: 300000,
          reservationTTL: 600000
        },
        connections: {  // Limits relayed connections
          maxIncoming: 100,
          maxOutgoing: 100,
          maxPerPeer: 5
        },
        // ACL: undefined  // No ACL = accepts reservations from any peer (key for "true" reservations)
        // For production: ACL: { allow: ['QmSpecificPeerID'] } to restrict
        metrics: { enabled: true }  // Optional: Enable Prometheus metrics
      })
    }
  })

  console.log(`🚀🔭🛰📡 Node started with id ${node.peerId.toString()}`)
  console.log('Listening on: 🌈')
  node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))

  node.handle(AUDIO_PROTOCOL, async ({ stream, connection }) => {
    console.log('📩 signaling message from', connection.remotePeer.toString())
    const decoder = new TextDecoder()
    const reader = stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      console.log('message:', decoder.decode(value))
    }
  })
}

// Define minimist options
const argv = minimist(process.argv.slice(2), {
  string: ["name", "mode", "relay"],        // force parsing as strings
  boolean: ["help", "version", "verbose"],
  alias: {
    h: "help",
    v: "version",
    n: "name",
    m: "mode",
  },
  default: {
    name: "World",
    mode: "dev",
    relay: "run",
    verbose: false,
  },
  "--": true, // everything after `--` goes to argv["--"]
});

// CLI usage function
function showHelp() {
  console.log(`
Usage:
  bun cli.ts [options] [-- extra args]

Options:
  -r, --relay            Start a p2p relay server
  -n, --name <string>     Set your name (default: "World")
  -m, --mode <string>     Choose mode: "dev" | "prod" (default: "dev")
  -v, --version           Show version
  -h, --help              Show this help message
      --verbose           Enable verbose output

Examples:
  bun cli.ts --name Alice
  bun cli.ts -m prod --verbose
  bun cli.ts -- --extra something
  bun cli.ts relay
`);
}

function showVersion() {
  console.log("cli-example 1.0.0");
}


if (argv.help) {
  showHelp();
  process.exit(0);
}

if (argv.version) {
  showVersion();
  process.exit(0);
}

const { name, mode, verbose } = argv;

if (verbose) {
  console.log("Raw argv:", argv);
}

console.log(`Hello, My Treehole! Running in ${mode} mode.`);
main().catch(err => {
  console.error('Fatal relay error:', err)
})


if (argv["--"].length > 0) {
  console.log("Extra args after --:", argv["--"]);
}

