#!/bin/bash
# Initialize Bitcoin regtest environment for course labs
# Run after container is healthy: docker exec bitcoin-regtest bash /scripts/init-regtest.sh
set -e

RPC_USER="${BITCOIN_RPC_USER:-student}"
RPC_PASS="${BITCOIN_RPC_PASSWORD:-learn}"
CLI="bitcoin-cli -regtest -rpcuser=$RPC_USER -rpcpassword=$RPC_PASS"

echo "Creating default wallet..."
$CLI createwallet "course" 2>/dev/null || echo "Wallet already exists"

echo "Generating 101 blocks (to make coinbase spendable)..."
ADDRESS=$($CLI getnewaddress)
$CLI generatetoaddress 101 "$ADDRESS"

echo "Regtest initialized!"
echo "Balance: $($CLI getbalance)"
echo "Block height: $($CLI getblockcount)"
echo "RPC endpoint: http://localhost:18443"
echo "RPC user: $RPC_USER"
