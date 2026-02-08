#!/bin/bash
# prove.sh -- Generate witness and create Groth16 proof
#
# Usage: ./scripts/prove.sh circuits/multiplier.circom inputs/multiplier_input.json
#
# Prerequisites: Run setup.sh first
#
# Steps:
#   1. Calculate witness from input
#   2. Generate Groth16 proof

set -euo pipefail

CIRCUIT_PATH="${1:?Usage: ./scripts/prove.sh <circuit.circom> <input.json>}"
INPUT_PATH="${2:?Usage: ./scripts/prove.sh <circuit.circom> <input.json>}"
CIRCUIT_NAME=$(basename "$CIRCUIT_PATH" .circom)
BUILD_DIR="build/${CIRCUIT_NAME}"

echo "=== Generating Proof: ${CIRCUIT_NAME} ==="
echo ""

# Verify setup was run
if [ ! -f "${BUILD_DIR}/${CIRCUIT_NAME}.zkey" ]; then
    echo "ERROR: Setup not complete. Run setup.sh first:"
    echo "  ./scripts/setup.sh ${CIRCUIT_PATH}"
    exit 1
fi

# Step 1: Calculate witness
echo "[1/2] Calculating witness from input..."
echo "  Input: ${INPUT_PATH}"
node "${BUILD_DIR}/${CIRCUIT_NAME}_js/generate_witness.js" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm" \
    "$INPUT_PATH" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_witness.wtns"
echo "  Witness: ${BUILD_DIR}/${CIRCUIT_NAME}_witness.wtns"

# Step 2: Generate proof
echo ""
echo "[2/2] Generating Groth16 proof..."
snarkjs groth16 prove \
    "${BUILD_DIR}/${CIRCUIT_NAME}.zkey" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_witness.wtns" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_proof.json" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_public.json"
echo "  Proof:   ${BUILD_DIR}/${CIRCUIT_NAME}_proof.json"
echo "  Public:  ${BUILD_DIR}/${CIRCUIT_NAME}_public.json"

echo ""
echo "=== Proof generated for ${CIRCUIT_NAME} ==="
echo "Next: ./scripts/verify.sh ${CIRCUIT_PATH}"
