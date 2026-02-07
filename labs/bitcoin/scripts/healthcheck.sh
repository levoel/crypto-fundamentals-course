#!/bin/bash
# Wait for Bitcoin Core RPC to be ready
set -e
bitcoin-cli -regtest \
  -rpcuser="${BITCOIN_RPC_USER}" \
  -rpcpassword="${BITCOIN_RPC_PASSWORD}" \
  getblockchaininfo > /dev/null 2>&1
