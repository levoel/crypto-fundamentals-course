import { createClient as createUrqlClient, fetchExchange, subscriptionExchange } from 'urql'
import { createClient as createWsClient } from 'graphql-ws'

// Subsquid GraphQL endpoint (default)
// To use The Graph instead, change to:
//   HTTP: http://localhost:8000/subgraphs/name/simple-token
//   WS:   ws://localhost:8001/subgraphs/name/simple-token
const GRAPHQL_HTTP = 'http://localhost:4350/graphql'
const GRAPHQL_WS = 'ws://localhost:4350/graphql'

const wsClient = createWsClient({ url: GRAPHQL_WS })

export const client = createUrqlClient({
  url: GRAPHQL_HTTP,
  exchanges: [
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (request) => ({
        subscribe: (sink) => ({
          unsubscribe: wsClient.subscribe(request, sink),
        }),
      }),
    }),
  ],
})
