# Tool Versions

Centralized version documentation for all tools and dependencies used in the crypto-fundamentals course lab environments.

**Review cadence:** Quarterly. Check for new stable releases, security patches, and breaking changes.

## Pinned Versions

| Tool | Version | Verified | Image / Package | Used In |
|------|---------|----------|-----------------|---------|
| Bitcoin Core | 30.2 | 2026-02-08 | bitcoin/bitcoin:30.2 | labs/bitcoin |
| Foundry (Anvil/Forge/Cast) | latest (nightly) | 2026-02-08 | ghcr.io/foundry-rs/foundry:latest | labs/ethereum |
| Hardhat | 3.1.7 | 2026-02-08 | npm: hardhat@^3.1.7 | labs/ethereum |
| Solana Test Validator | latest (nightly) | 2026-02-08 | ghcr.io/beeman/solana-test-validator:latest | labs/solana |
| Anchor | 0.32.1 | 2026-02-08 | cargo: anchor-cli@0.32.1 | labs/solana (host) |
| Python | 3.12 | 2026-02-08 | quay.io/jupyter/scipy-notebook:2025-12-31 | labs/crypto |
| Node.js | >= 22.10.0 | 2026-02-08 | Host machine requirement | labs/ethereum |
| Rust | >= 1.75 | 2026-02-08 | Host machine requirement | labs/solana (host) |
| pycryptodome | 3.23.0 | 2026-02-08 | pip: pycryptodome==3.23.0 | labs/crypto |
| ecdsa | 0.19.1 | 2026-02-08 | pip: ecdsa==0.19.1 | labs/crypto |
| python-bitcoinlib | 0.12.2 | 2026-02-08 | pip: python-bitcoinlib==0.12.2 | labs/crypto |
| cryptography | 46.0.4 | 2026-02-08 | pip: cryptography==46.0.4 | labs/crypto |
| ethers.js | 6.16.0 | 2026-02-08 | npm: ethers@^6.16.0 | labs/ethereum |
| viem | 2.45.1 | 2026-02-08 | npm: viem@^2.45.1 | labs/ethereum |

## Next Review Date

**2026-05-08** (quarterly from initial verification)

## Known Compatibility Notes

- **Solana Docker:** Requires `security_opt: seccomp:unconfined` in docker-compose.yml due to io_uring syscalls used by the Agave validator. Without this, the container will crash on startup.
- **Hardhat 3:** Requires Node.js >= 22.10.0 (ESM-first architecture). Earlier Node versions will fail to load Hardhat 3 plugins.
- **Jupyter base image:** Use `quay.io` registry (`quay.io/jupyter/scipy-notebook`), NOT Docker Hub. The Jupyter project migrated to quay.io; Docker Hub images are outdated and unmaintained.
- **Anchor 0.32.1 + Agave v3:** Compatibility not yet tested inside Docker. Anchor runs on the host machine and deploys to the containerized Solana test-validator via RPC. Monitor Anchor releases for Agave v3 support.

## How to Update

1. Check official release pages for each tool:
   - [Bitcoin Core](https://github.com/bitcoin/bitcoin/releases)
   - [Foundry](https://github.com/foundry-rs/foundry/releases)
   - [Hardhat](https://github.com/NomicFoundation/hardhat/releases)
   - [Solana](https://github.com/anza-xyz/agave/releases)
   - [Anchor](https://github.com/coral-xyz/anchor/releases)
   - [Jupyter Docker Stacks](https://github.com/jupyter/docker-stacks/tags)
2. Update `.env` files in the respective `labs/` directory with new image tags or versions.
3. For custom images (labs/crypto): run `docker compose build --no-cache` to rebuild.
4. For pre-built images: run `docker compose pull` to fetch the latest tags.
5. Run `docker compose up` and verify the lab environment starts correctly.
6. Update the "Verified" date in this file for each tool you updated.
7. Set the next review date to 3 months from today.
