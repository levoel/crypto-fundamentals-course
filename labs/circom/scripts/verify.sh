#!/bin/bash
# verify.sh -- Verify a Groth16 proof
#
# Usage: ./scripts/verify.sh circuits/multiplier.circom
#
# Prerequisites: Run setup.sh and prove.sh first
#
# Steps:
#   1. Verify proof against verification key and public signals

set -euo pipefail

CIRCUIT_PATH="${1:?Usage: ./scripts/verify.sh <circuit.circom>}"
CIRCUIT_NAME=$(basename "$CIRCUIT_PATH" .circom)
BUILD_DIR="build/${CIRCUIT_NAME}"

echo "=== Verifying Proof: ${CIRCUIT_NAME} ==="
echo ""

# Verify files exist
if [ ! -f "${BUILD_DIR}/${CIRCUIT_NAME}_vkey.json" ]; then
    echo "ERROR: Verification key not found. Run setup.sh first."
    exit 1
fi

if [ ! -f "${BUILD_DIR}/${CIRCUIT_NAME}_proof.json" ]; then
    echo "ERROR: Proof not found. Run prove.sh first."
    exit 1
fi

# Display public signals
echo "Public signals:"
python3 -c "
import json
with open('${BUILD_DIR}/${CIRCUIT_NAME}_public.json') as f:
    signals = json.load(f)
for i, s in enumerate(signals):
    print(f'  [{i}]: {s}')
"
echo ""

# Verify proof
echo "Verifying Groth16 proof..."
snarkjs groth16 verify \
    "${BUILD_DIR}/${CIRCUIT_NAME}_vkey.json" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_public.json" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_proof.json"

echo ""
echo "=== Verification complete for ${CIRCUIT_NAME} ==="
