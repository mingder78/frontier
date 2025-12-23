import { createLibp2p } from 'libp2p'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { tcp } from '@libp2p/tcp'
import { identify } from '@libp2p/identify'
import type { Libp2p } from 'libp2p'
import { multiaddr } from '@multiformats/multiaddr'
import { logger } from '@libp2p/logger'
import { webSockets } from '@libp2p/websockets'
import { circuitRelayServer } from '@libp2p/circuit-relay-v2'

// Create a logger instance
const log = logger('libp2p:node')

export async function createNode(): Promise<Libp2p> {
  try {
    // Create and configure the LibP2P node
    const node = await createLibp2p({
    addresses: {
        // Define listen addresses
        listen: ['/ip4/0.0.0.0/tcp/0']
      },
      
      // Configure transports
      transports: [
        tcp() // TCP transport layer
      ],
      
      // Configure connection encryption
      connectionEncryption: [
        noise() // Noise protocol for encrypted communications
      ],
      
      // Configure stream multiplexing
      streamMuxers: [
        yamux(), // Primary stream multiplexer
        mplex()  // Backup multiplexer
      ],
      
      // Configure peer discovery and identification
      services: {
        identify: identify() // Identify protocol for peer discovery
      },
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