#!/usr/bin/env node

import minimist from 'minimist'
import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { identify } from '@libp2p/identify'
import type { Libp2p } from '@libp2p/interface-libp2p'
import { multiaddr } from '@multiformats/multiaddr'
import { logger } from '@libp2p/logger'

import { webSockets } from '@libp2p/websockets'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { identify } from '@libp2p/identify'

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
  -r, --relay             Start a p2p relay server
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
  console.log("libp2p-relay 1.0.0");
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

console.log(`Hello, Libp2p Relay! Running in ${mode} mode.`);

  main().catch(err => {
    console.error('Fatal relay error:', err)
  })

if (argv["--"].length > 0) {
  console.log("Extra args after --:", argv["--"]);
}


// Create a logger instance
const log = logger('libp2p:node')

async function createNode(): Promise<Libp2p> {
  try {
    // Create and configure the LibP2P node
    const node = await createLibp2p({
      // Configure addressing
      addresses: {
        // Define listen addresses
        listen: ['/ip4/0.0.0.0/tcp/0/ws']
      },
      
      // Configure transports
      transports: [
        webSockets(),
       // tcp() // TCP transport layer
      ],
      
      // Configure connection encryption
      connectionEncryption: [
        noise() // Noise protocol for encrypted communications
      ],
      
      // Configure stream multiplexing
      streamMuxers: [
        yamux(), // Primary stream multiplexer
        //mplex()  // Backup multiplexer
      ],
      
      // Configure peer discovery and identification
      services: {
        relay: circuitRelayServer(),
        identify: identify() // Identify protocol for peer discovery
      },
      
      // Configure connection manager options
      connectionManager: {
        minConnections: 0,
        maxConnections: 50,
        autoDialInterval: 30000, // 30 seconds
      }
    })

    // Start the LibP2P node
    await node.start()
    
    // Log node information
    log('Node started with PeerId: %s', node.peerId.toString())
    
    // Log listen addresses
    node.getMultiaddrs().forEach((addr) => {
      log('Listening on: %s', addr.toString())
    })

    // Setup shutdown handler
    process.on('SIGTERM', async () => {
      log('Received SIGTERM, shutting down...')
      await node.stop()
      process.exit(0)
    })

    return node

  } catch (error) {
    log.error('Failed to create LibP2P node:', error)
    throw error
  }
}

// Example usage
async function main() {
  try {
    const node = await createNode()
    
    // Example: Connect to a known peer
    // const targetPeer = '/ip4/127.0.0.1/tcp/63785/p2p/QmHash...'
    // await node.dial(multiaddr(targetPeer))
    
    // Keep the process running
    process.stdin.resume()
    
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run the example
//main()
