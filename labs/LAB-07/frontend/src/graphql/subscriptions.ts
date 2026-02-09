export const LIVE_TRANSFERS_SUBSCRIPTION = `
  subscription LiveTransfers {
    transfers(orderBy: blockNumber_DESC, limit: 10) {
      id
      from
      to
      value
      blockNumber
      timestamp
    }
  }
`
