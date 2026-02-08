#!/bin/bash
# LAB-01: Bitcoin Transactions on Regtest
# Run: docker exec bitcoin-regtest bash /scripts/lab-01-transactions.sh
#
# This lab covers:
#   Section 1: Wallet and balance check
#   Section 2: List UTXOs
#   Section 3: Create addresses (P2WPKH, P2TR)
#   Section 4: Simple send with sendtoaddress
#   Section 5: Raw transaction construction
#   Section 6: View block structure
#   Section 7: Descriptor wallet inspection
#
# Prerequisites: init-regtest.sh has been run (wallet "course" exists, 101+ blocks mined)

set -e

RPC_USER="${BITCOIN_RPC_USER:-student}"
RPC_PASS="${BITCOIN_RPC_PASSWORD:-learn}"
CLI="bitcoin-cli -regtest -rpcuser=$RPC_USER -rpcpassword=$RPC_PASS"

echo "============================================================"
echo "  LAB-01: Bitcoin Transactions on Regtest"
echo "  Bitcoin Core v30.2 -- Descriptor Wallets Only"
echo "============================================================"
echo ""

# ----------------------------------------------------------------
# Section 1: Wallet and balance check
# ----------------------------------------------------------------
echo "=== Section 1: Wallet and Balance Check ==="
echo ""

# Ensure wallet is loaded
$CLI loadwallet "course" 2>/dev/null || true

BALANCE=$($CLI getbalance)
BLOCK_HEIGHT=$($CLI getblockcount)
echo "Current balance: $BALANCE BTC"
echo "Block height: $BLOCK_HEIGHT"
echo ""

# ----------------------------------------------------------------
# Section 2: List UTXOs
# ----------------------------------------------------------------
echo "=== Section 2: List UTXOs ==="
echo ""
echo "UTXOs are the fundamental building blocks of Bitcoin transactions."
echo "Your balance is NOT a number in a database -- it is the SUM of all UTXOs you can spend."
echo ""

UTXO_COUNT=$($CLI listunspent | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
echo "Total UTXOs: $UTXO_COUNT"
echo ""

echo "First 3 UTXOs:"
$CLI listunspent | python3 -c "
import sys, json
utxos = json.load(sys.stdin)[:3]
for u in utxos:
    print(f\"  txid: {u['txid'][:16]}...  vout: {u['vout']}  amount: {u['amount']} BTC  addr: {u['address'][:20]}...\")
"
echo ""

# ----------------------------------------------------------------
# Section 3: Create addresses (P2WPKH, P2TR)
# ----------------------------------------------------------------
echo "=== Section 3: Create Addresses ==="
echo ""

ADDR_SEGWIT=$($CLI getnewaddress "" "bech32")
ADDR_TAPROOT=$($CLI getnewaddress "" "bech32m")

echo "P2WPKH (SegWit v0) address: $ADDR_SEGWIT"
echo "  -> starts with bcrt1q (regtest) / bc1q (mainnet)"
echo ""
echo "P2TR (Taproot) address: $ADDR_TAPROOT"
echo "  -> starts with bcrt1p (regtest) / bc1p (mainnet)"
echo ""

# Show address info
echo "Address info for P2WPKH:"
$CLI getaddressinfo "$ADDR_SEGWIT" | python3 -c "
import sys, json
info = json.load(sys.stdin)
print(f\"  Type: {info.get('desc', 'N/A')[:40]}...\")
print(f\"  ismine: {info.get('ismine', False)}\")
print(f\"  iswatchonly: {info.get('iswatchonly', False)}\")
"
echo ""

# ----------------------------------------------------------------
# Section 4: Simple send
# ----------------------------------------------------------------
echo "=== Section 4: Simple Transaction (sendtoaddress) ==="
echo ""

RECIPIENT=$($CLI getnewaddress "" "bech32")
echo "Recipient address: $RECIPIENT"

TXID=$($CLI sendtoaddress "$RECIPIENT" 1.0)
echo "Transaction sent!"
echo "  txid: $TXID"
echo ""

# Check mempool (unconfirmed)
echo "Mempool size (before mining):"
$CLI getmempoolinfo | python3 -c "
import sys, json
info = json.load(sys.stdin)
print(f\"  Transactions: {info['size']}\")
print(f\"  Bytes: {info['bytes']}\")
"
echo ""

# Mine a block to confirm
echo "Mining 1 block to confirm..."
$CLI -generate 1 > /dev/null
echo "Block mined!"
echo ""

# Verify confirmation
CONFIRMATIONS=$($CLI gettransaction "$TXID" | python3 -c "import sys,json; print(json.load(sys.stdin)['confirmations'])")
echo "Confirmations: $CONFIRMATIONS"
echo ""

# ----------------------------------------------------------------
# Section 5: Raw transaction construction
# ----------------------------------------------------------------
echo "=== Section 5: Raw Transaction Construction ==="
echo ""
echo "This section demonstrates manual transaction creation."
echo "Formula: fee = sum(inputs) - sum(outputs)"
echo ""

# Find a suitable UTXO
UTXO_JSON=$($CLI listunspent | python3 -c "
import sys, json
utxos = json.load(sys.stdin)
# Pick a UTXO with enough funds
for u in utxos:
    if float(u['amount']) >= 1.0:
        print(json.dumps({'txid': u['txid'], 'vout': u['vout'], 'amount': float(u['amount'])}))
        break
")

if [ -z "$UTXO_JSON" ]; then
    echo "No suitable UTXO found. Mining more blocks..."
    $CLI -generate 10 > /dev/null
    UTXO_JSON=$($CLI listunspent | python3 -c "
import sys, json
utxos = json.load(sys.stdin)
for u in utxos:
    if float(u['amount']) >= 1.0:
        print(json.dumps({'txid': u['txid'], 'vout': u['vout'], 'amount': float(u['amount'])}))
        break
")
fi

TXID_IN=$(echo "$UTXO_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['txid'])")
VOUT=$(echo "$UTXO_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['vout'])")
AMOUNT=$(echo "$UTXO_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['amount'])")

echo "Selected UTXO:"
echo "  txid: ${TXID_IN:0:16}..."
echo "  vout: $VOUT"
echo "  amount: $AMOUNT BTC"
echo ""

# Create recipient address
RAW_RECIPIENT=$($CLI getnewaddress "" "bech32")

# Calculate amounts (fee = 0.0001 BTC)
FEE=0.0001
SEND_AMOUNT=$(python3 -c "print(round($AMOUNT - $FEE, 8))")

echo "Transaction plan:"
echo "  Input:  $AMOUNT BTC"
echo "  Output: $SEND_AMOUNT BTC -> $RAW_RECIPIENT"
echo "  Fee:    $FEE BTC"
echo ""

# Create raw transaction
RAW_TX=$($CLI createrawtransaction "[{\"txid\":\"$TXID_IN\",\"vout\":$VOUT}]" "{\"$RAW_RECIPIENT\":$SEND_AMOUNT}")
echo "Raw transaction (hex, unsigned):"
echo "  ${RAW_TX:0:40}..."
echo ""

# Decode to inspect
echo "Decoded transaction:"
$CLI decoderawtransaction "$RAW_TX" | python3 -c "
import sys, json
tx = json.load(sys.stdin)
print(f\"  txid: {tx['txid'][:16]}...\")
print(f\"  Version: {tx['version']}\")
print(f\"  Inputs: {len(tx['vin'])}\")
for vin in tx['vin']:
    print(f\"    txid: {vin['txid'][:16]}... vout: {vin['vout']}\")
print(f\"  Outputs: {len(tx['vout'])}\")
for vout in tx['vout']:
    print(f\"    amount: {vout['value']} BTC  script: {vout['scriptPubKey']['type']}\")
"
echo ""

# Sign with wallet (descriptor wallet)
SIGNED=$($CLI signrawtransactionwithwallet "$RAW_TX")
SIGNED_HEX=$(echo "$SIGNED" | python3 -c "import sys,json; print(json.load(sys.stdin)['hex'])")
SIGNED_COMPLETE=$(echo "$SIGNED" | python3 -c "import sys,json; print(json.load(sys.stdin)['complete'])")

echo "Signed: complete=$SIGNED_COMPLETE"
echo ""

# Broadcast
BROADCAST_TXID=$($CLI sendrawtransaction "$SIGNED_HEX")
echo "Broadcast txid: $BROADCAST_TXID"

# Mine to confirm
$CLI -generate 1 > /dev/null
echo "Block mined. Transaction confirmed!"
echo ""

# ----------------------------------------------------------------
# Section 6: View block structure
# ----------------------------------------------------------------
echo "=== Section 6: Block Structure ==="
echo ""

BEST_HASH=$($CLI getbestblockhash)
echo "Best block hash: $BEST_HASH"
echo ""

echo "Block header:"
$CLI getblockheader "$BEST_HASH" | python3 -c "
import sys, json
h = json.load(sys.stdin)
print(f\"  Height:         {h['height']}\")
print(f\"  Version:        {h['version']} (0x{h['versionHex']})\")
print(f\"  Previous Hash:  {h['previousblockhash'][:16]}...\")
print(f\"  Merkle Root:    {h['merkleroot'][:16]}...\")
print(f\"  Time:           {h['time']}\")
print(f\"  nBits:          {h['bits']}\")
print(f\"  Nonce:          {h['nonce']}\")
print(f\"  Tx count:       {h['nTx']}\")
print(f\"  Total: 80 bytes -> SHA256d -> block hash\")
"
echo ""

echo "Block with full transaction details (verbosity 2):"
$CLI getblock "$BEST_HASH" 2 | python3 -c "
import sys, json
block = json.load(sys.stdin)
print(f\"  Transactions in block: {len(block['tx'])}\")
for i, tx in enumerate(block['tx'][:3]):
    is_coinbase = 'coinbase' in tx['vin'][0]
    tx_type = 'coinbase' if is_coinbase else 'regular'
    print(f\"  [{i}] {tx['txid'][:16]}... ({tx_type}) inputs={len(tx['vin'])} outputs={len(tx['vout'])}\")
if len(block['tx']) > 3:
    print(f\"  ... and {len(block['tx']) - 3} more transactions\")
"
echo ""

# ----------------------------------------------------------------
# Section 7: Descriptor wallet inspection
# ----------------------------------------------------------------
echo "=== Section 7: Descriptor Wallet Inspection ==="
echo ""
echo "Bitcoin Core v30+ uses descriptor wallets ONLY."
echo "Legacy key export/import commands are REMOVED in v30."
echo ""

echo "Wallet descriptors (first 3):"
$CLI listdescriptors | python3 -c "
import sys, json
result = json.load(sys.stdin)
for desc in result['descriptors'][:3]:
    d = desc['desc']
    # Truncate long descriptors
    if len(d) > 60:
        d = d[:60] + '...'
    print(f\"  {d}\")
    print(f\"    active: {desc.get('active', False)}  range: {desc.get('range', 'N/A')}\")
print(f\"  ... total: {len(result['descriptors'])} descriptors\")
"
echo ""

echo "============================================================"
echo "  LAB-01 Complete!"
echo ""
echo "  Key takeaways:"
echo "  1. Balance = sum of all UTXOs you can spend"
echo "  2. fee = sum(inputs) - sum(outputs)"
echo "  3. Block header = 80 bytes -> SHA256d -> block hash"
echo "  4. Descriptor wallets: use listdescriptors for key inspection"
echo "============================================================"
