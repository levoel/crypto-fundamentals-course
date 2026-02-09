import { EvmBatchProcessor } from '@subsquid/evm-processor'

// ERC-20 Transfer event topic0
export const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

// Default contract address (first Anvil deploy)
export const CONTRACT_ADDRESS = (
  process.env.CONTRACT_ADDRESS ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3'
).toLowerCase()

export const processor = new EvmBatchProcessor()
  // No setGateway() for local node -- RPC only
  .setRpcEndpoint(process.env.RPC_ENDPOINT || 'http://anvil:8545')
  .setFinalityConfirmation(1) // Local node: 1 block is enough
  .addLog({
    address: [CONTRACT_ADDRESS],
    topic0: [TRANSFER_TOPIC],
  })
  .setFields({
    log: {
      transactionHash: true,
      topics: true,
      data: true,
    },
  })
