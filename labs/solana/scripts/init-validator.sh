#!/bin/bash
# Initialize Solana test-validator for course labs
# Run after container is healthy: docker exec solana-validator bash /scripts/init-validator.sh
set -e

SOLANA_URL="http://localhost:8899"

echo "Checking Solana cluster..."
solana cluster-version -u "$SOLANA_URL"

echo ""
echo "Creating test keypair..."
solana-keygen new --no-bip39-passphrase --outfile /tmp/test-keypair.json --force

echo ""
echo "Requesting airdrop (2 SOL)..."
solana airdrop 2 --keypair /tmp/test-keypair.json -u "$SOLANA_URL"

echo ""
echo "Solana test-validator initialized!"
echo "RPC: $SOLANA_URL"
echo "WebSocket: ws://localhost:8900"
echo "Balance: $(solana balance --keypair /tmp/test-keypair.json -u $SOLANA_URL)"
