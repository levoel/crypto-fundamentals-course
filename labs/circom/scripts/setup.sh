#!/bin/bash
# setup.sh -- Download ptau, compile circuit, and run Groth16 setup
#
# Usage: ./scripts/setup.sh circuits/multiplier.circom
#
# Steps:
#   1. Download powersOfTau28_hez_final_14.ptau (if not present)
#   2. Compile circuit (generate R1CS + WASM)
#   3. Run Groth16 setup (create .zkey)
#   4. Contribute randomness to .zkey
#   5. Export verification key

set -euo pipefail

CIRCUIT_PATH="${1:?Usage: ./scripts/setup.sh <circuit.circom>}"
CIRCUIT_NAME=$(basename "$CIRCUIT_PATH" .circom)
BUILD_DIR="build/${CIRCUIT_NAME}"
PTAU_DIR="ptau"
PTAU_FILE="${PTAU_DIR}/powersOfTau28_hez_final_14.ptau"
PTAU_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_14.ptau"

echo "=== Circom Setup: ${CIRCUIT_NAME} ==="
echo ""

# Step 1: Download ptau if not present
if [ ! -f "$PTAU_FILE" ]; then
    echo "[1/5] Downloading Powers of Tau (~54 MB)..."
    mkdir -p "$PTAU_DIR"
    wget -q --show-progress -O "$PTAU_FILE" "$PTAU_URL"
    echo "  Downloaded: $PTAU_FILE"
else
    echo "[1/5] Powers of Tau already present: $PTAU_FILE"
fi

# Step 2: Compile circuit
echo ""
echo "[2/5] Compiling circuit: ${CIRCUIT_PATH}"
mkdir -p "$BUILD_DIR"
circom "$CIRCUIT_PATH" \
    --r1cs \
    --wasm \
    --sym \
    -o "$BUILD_DIR"
echo "  R1CS:   ${BUILD_DIR}/${CIRCUIT_NAME}.r1cs"
echo "  WASM:   ${BUILD_DIR}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm"
echo "  Symbols: ${BUILD_DIR}/${CIRCUIT_NAME}.sym"

# Print circuit info
echo ""
echo "  Circuit info:"
snarkjs r1cs info "${BUILD_DIR}/${CIRCUIT_NAME}.r1cs"

# Step 3: Groth16 setup (Phase 2)
echo ""
echo "[3/5] Running Groth16 setup..."
snarkjs groth16 setup \
    "${BUILD_DIR}/${CIRCUIT_NAME}.r1cs" \
    "$PTAU_FILE" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_0.zkey"
echo "  Initial zkey: ${BUILD_DIR}/${CIRCUIT_NAME}_0.zkey"

# Step 4: Contribute randomness
echo ""
echo "[4/5] Contributing randomness to zkey..."
snarkjs zkey contribute \
    "${BUILD_DIR}/${CIRCUIT_NAME}_0.zkey" \
    "${BUILD_DIR}/${CIRCUIT_NAME}.zkey" \
    --name="dev-contributor" \
    -v -e="random-entropy-for-dev-$(date +%s)"
echo "  Final zkey: ${BUILD_DIR}/${CIRCUIT_NAME}.zkey"

# Step 5: Export verification key
echo ""
echo "[5/5] Exporting verification key..."
snarkjs zkey export verificationkey \
    "${BUILD_DIR}/${CIRCUIT_NAME}.zkey" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_vkey.json"
echo "  Verification key: ${BUILD_DIR}/${CIRCUIT_NAME}_vkey.json"

echo ""
echo "=== Setup complete for ${CIRCUIT_NAME} ==="
echo "Next: ./scripts/prove.sh ${CIRCUIT_PATH} inputs/${CIRCUIT_NAME}_input.json"
