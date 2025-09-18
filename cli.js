#!/usr/bin/env node

import minimist from 'minimist'
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { identify } from '@libp2p/identify'

async function main() {
  const node = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/15003/ws']
    },
    transports: [
      tcp(),
      webSockets()
    ],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    services: {
      relay: circuitRelayServer({ advertise: true }),
      pubsub: gossipsub(),
      identify: identify(),
    }
  })

  await node.start()
  console.log('🚀 Relay node running')

  console.log(`🌈 Node started with id ${node.peerId.toString()}`)
  console.log('Listening on:')
  node.getMultiaddrs().forEach((ma) => console.log(ma.toString()))
  console.log('👉 ... press control-c to stop.')
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
main()


if (argv["--"].length > 0) {
  console.log("Extra args after --:", argv["--"]);
}

