#!/bin/bash
# Deploy SimpleToken to local Anvil
# Requires: foundry tools (forge, cast) available
set -e

DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=${RPC_URL:-http://localhost:8545}

echo "Compiling and deploying SimpleToken..."
DEPLOYED=$(forge create contracts/SimpleToken.sol:SimpleToken \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_KEY \
  --constructor-args $(cast to-wei 1000000) \
  2>&1 | grep "Deployed to:" | awk '{print $3}')

echo "SimpleToken deployed at: $DEPLOYED"

# Transfer tokens to 3 other accounts for indexing variety
for ADDR in 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
            0x90F79bf6EB2c4f870365E785982E1f101E93b906; do
  cast send $DEPLOYED "transfer(address,uint256)" $ADDR $(cast to-wei 100000) \
    --rpc-url $RPC_URL --private-key $DEPLOYER_KEY
  echo "Transferred 100,000 STK to $ADDR"
done

echo "Done! Update CONTRACT_ADDRESS in .env if needed: $DEPLOYED"
