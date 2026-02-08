# Circom ZK Lab - Multi-stage Docker Build
# Stage 1: Build Circom 2.2.3 from source (Rust)
# Stage 2: Runtime with Node.js 22 + snarkjs + circomlib
#
# Usage: docker compose up circom-lab
# Then: docker compose exec circom-lab bash

# ---- Stage 1: Build Circom compiler from source ----
FROM rust:1.82-bookworm AS circom-builder

RUN git clone https://github.com/iden3/circom.git && \
    cd circom && \
    git checkout v2.2.3 && \
    cargo build --release && \
    cargo install --path circom

# ---- Stage 2: Runtime with Node.js + snarkjs ----
FROM node:22-bookworm-slim

# Copy compiled circom binary
COPY --from=circom-builder /usr/local/cargo/bin/circom /usr/local/bin/circom

# Install snarkjs globally
RUN npm install -g snarkjs@latest

# Install wget for ptau download
RUN apt-get update && apt-get install -y --no-install-recommends wget && \
    rm -rf /var/lib/apt/lists/*

# Setup working directory and install circomlib
WORKDIR /home/node/work
RUN npm init -y && npm install circomlib@2.0.5

# Verify installations
RUN circom --version && snarkjs --version

# Copy lab files
COPY circuits/ ./circuits/
COPY scripts/ ./scripts/
COPY inputs/ ./inputs/
COPY ptau/ ./ptau/

# Ensure scripts are executable
RUN chmod +x scripts/*.sh

USER node
WORKDIR /home/node/work
