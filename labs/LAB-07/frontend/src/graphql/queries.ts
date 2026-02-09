export const TRANSFERS_QUERY = `
  query Transfers($limit: Int!, $offset: Int!) {
    transfers(
      orderBy: blockNumber_DESC,
      limit: $limit,
      offset: $offset
    ) {
      id
      from
      to
      value
      blockNumber
      timestamp
      txHash
    }
  }
`

export const HOLDER_RANKINGS_QUERY = `
  query HolderRankings($limit: Int!) {
    accounts(
      orderBy: balance_DESC,
      limit: $limit,
      where: { balance_gt: "0" }
    ) {
      id
      balance
    }
  }
`

export const TRANSFER_COUNT_QUERY = `
  query TransferCount {
    transfersConnection(orderBy: id_ASC) {
      totalCount
    }
  }
`
