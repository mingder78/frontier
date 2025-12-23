#!/usr/bin/env node

import minimist from 'minimist'
import { createNode } from './libp2p'
import { showHelp, showVersion } from './utils'

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
