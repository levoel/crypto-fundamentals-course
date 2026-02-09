import { TypeormDatabase } from '@subsquid/typeorm-store'
import { processor, CONTRACT_ADDRESS, TRANSFER_TOPIC } from './processor'
import { Transfer, Account } from './model'

const db = new TypeormDatabase({ supportHotBlocks: true })

processor.run(db, async (ctx) => {
  const transfers: Transfer[] = []

  for (const block of ctx.blocks) {
    for (const log of block.logs) {
      if (
        log.address === CONTRACT_ADDRESS &&
        log.topics[0] === TRANSFER_TOPIC
      ) {
        // Decode Transfer(address indexed from, address indexed to, uint256 value)
        const from = '0x' + log.topics[1].slice(26).toLowerCase()
        const to = '0x' + log.topics[2].slice(26).toLowerCase()
        const value = BigInt(log.data)

        transfers.push(
          new Transfer({
            id: log.id,
            from,
            to,
            value,
            timestamp: new Date(block.header.timestamp),
            blockNumber: block.header.height,
            txHash: log.transactionHash,
          })
        )

        // Update account balances
        let fromAccount = await ctx.store.get(Account, from)
        if (!fromAccount) {
          fromAccount = new Account({ id: from, balance: 0n })
        }
        fromAccount.balance -= value
        await ctx.store.upsert(fromAccount)

        let toAccount = await ctx.store.get(Account, to)
        if (!toAccount) {
          toAccount = new Account({ id: to, balance: 0n })
        }
        toAccount.balance += value
        await ctx.store.upsert(toAccount)
      }
    }
  }

  await ctx.store.insert(transfers)
})
