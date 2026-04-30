# Course versions — Crypto Fundamentals

Last review: 2026-04-30
Next review: 2026-10-30

## Cadence

Полугодовой — фундамент криптографии меняется медленно (примитивы, ECDSA, hash), но протокольный слой (Ethereum hard forks, Solana клиенты, zkVM, restaking) — раз в 6 месяцев требует ревизии.

## Pinned baseline (April 2026)

| Component | Version | Released | Course depth |
|-----------|---------|----------|--------------|
| Bitcoin Core | 30.2 | 2026-02 | full |
| Ethereum (Pectra hard fork) | EIP-7702 / 2935 / 7691 | 2025-05 | full |
| EigenLayer (restaking) | mainnet GA | 2025-04 | partial |
| Solana Firedancer client | mainnet | 2025-10 | partial |
| Solana Alpenglow (SIMD-0326) | testnet → mainnet planned | конец 2026 | mention |
| RISC Zero R0VM | 2.0 | 2026-Q1 | partial |
| SP1 zkVM | stable | 2026-Q1 | partial |
| Foundry (Anvil/Forge/Cast) | latest (nightly) | rolling | full |
| Hardhat | 3.1.7 | 2026-Q1 | full |
| Anchor | 0.32.1 | 2026-Q1 | full |
| ethers.js | 6.16.0 | 2026 | full |
| viem | 2.45.1 | 2026 | full |
| pycryptodome | 3.23.0 | 2026 | full |
| cryptography (pyca) | 46.0.4 | 2026 | full |

## Forthcoming (next review)

- Ethereum Fusaka / Glamsterdam hard fork prep (PeerDAS, EOF) — следить за timeline.
- Solana Alpenglow (SIMD-0326) — переход на BLS aggregation, снижение времени до finality.
- zkVM ландшафт — RISC Zero, SP1, Jolt, Nexus сравнение и production-кейсы.
- Native rollups / Based rollups — пересмотр модуля Scalability.
- USDC/USDT enshrinement в L2 — обновить DeFi блок.

## Recent updates

- 2026-04-30 — Wave 1 P0 правки (Pectra, EigenLayer, Firedancer) + Wave 2 новые уроки (Alpenglow, R0VM 2.0, restaking) + Wave 3 cross-refs.

## Lab tooling (Docker/host)

| Tool | Version | Verified | Image / Package | Used In |
|------|---------|----------|-----------------|---------|
| Bitcoin Core | 30.2 | 2026-02-08 | bitcoin/bitcoin:30.2 | labs/bitcoin |
| Foundry | latest (nightly) | 2026-02-08 | ghcr.io/foundry-rs/foundry:latest | labs/ethereum |
| Hardhat | 3.1.7 | 2026-02-08 | npm: hardhat@^3.1.7 | labs/ethereum |
| Solana Test Validator | latest (nightly) | 2026-02-08 | ghcr.io/beeman/solana-test-validator:latest | labs/solana |
| Anchor | 0.32.1 | 2026-02-08 | cargo: anchor-cli@0.32.1 | labs/solana (host) |
| Python | 3.12 | 2026-02-08 | quay.io/jupyter/scipy-notebook:2025-12-31 | labs/crypto |
| Node.js | >= 22.10.0 | 2026-02-08 | host requirement | labs/ethereum |
| Rust | >= 1.75 | 2026-02-08 | host requirement | labs/solana |
| pycryptodome | 3.23.0 | 2026-02-08 | pip | labs/crypto |
| ecdsa | 0.19.1 | 2026-02-08 | pip | labs/crypto |
| python-bitcoinlib | 0.12.2 | 2026-02-08 | pip | labs/crypto |
| cryptography | 46.0.4 | 2026-02-08 | pip | labs/crypto |
| ethers.js | 6.16.0 | 2026-02-08 | npm | labs/ethereum |
| viem | 2.45.1 | 2026-02-08 | npm | labs/ethereum |

## Known compatibility notes

- **Solana Docker:** требует `security_opt: seccomp:unconfined` из-за io_uring syscalls в Agave. Без этого контейнер падает на старте.
- **Hardhat 3:** требует Node.js >= 22.10.0 (ESM-first). Более ранние версии Node не загрузят плагины Hardhat 3.
- **Jupyter base image:** используем `quay.io/jupyter/scipy-notebook`, НЕ Docker Hub. Jupyter мигрировал на quay.io; образы на Docker Hub устарели.
- **Anchor 0.32.1 + Agave v3:** совместимость в Docker не протестирована. Anchor запускается на хосте и деплоит в контейнерный test-validator через RPC.
