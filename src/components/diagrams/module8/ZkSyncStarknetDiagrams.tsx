/**
 * zkSync / StarkNet Diagrams (SCALE-08)
 *
 * Exports:
 * - ZkSyncVsStarknetDiagram: Side-by-side architecture comparison (static with DiagramTooltip)
 * - ZKEcosystemMapDiagram: ZK rollup ecosystem grid by Type (static with DiagramTooltip)
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ZkSyncVsStarknetDiagram                                             */
/* ================================================================== */

interface FeatureRow {
  label: string;
  zksync: string;
  starknet: string;
  tooltipRu: string;
}

const FEATURES: FeatureRow[] = [
  { label: 'VM', zksync: 'zkEVM (Type 4, custom bytecode)', starknet: 'Cairo VM (custom, not EVM)', tooltipRu: 'VM (Virtual Machine) -- среда исполнения контрактов. zkSync использует zkEVM Type 4 (компилирует Solidity в свой bytecode), StarkNet -- Cairo VM (собственный дизайн, оптимизированный для ZK-доказательств).' },
  { label: 'Language', zksync: 'Solidity (transpiled)', starknet: 'Cairo (designed for provability)', tooltipRu: 'Язык разработки: zkSync поддерживает Solidity (транспилируется в zkEVM bytecode), что упрощает миграцию. StarkNet использует Cairo -- язык, спроектированный для provability, более мощный для ZK, но требует изучения.' },
  { label: 'Proof System', zksync: 'zk-SNARKs (PLONK-based)', starknet: 'STARKs (transparent, quantum resistant)', tooltipRu: 'Proof system: zkSync -- PLONK-based SNARKs (trusted setup, компактные proofs ~1KB). StarkNet -- STARKs (без trusted setup, quantum resistant, но proofs ~100KB). Tradeoff: размер proof vs. trust assumptions.' },
  { label: 'Account Abstraction', zksync: 'Native (all accounts = smart contracts)', starknet: 'Native (built into protocol from day 1)', tooltipRu: 'Account Abstraction (AA): обе сети реализуют AA нативно. Каждый аккаунт -- smart contract. Это позволяет: social recovery, session keys, gas abstraction, batch transactions. На L1 Ethereum AA все еще ERC-4337 (не нативный).' },
  { label: 'Ecosystem', zksync: 'Hyperchains (L3 on top of zkSync)', starknet: 'Volition (hybrid DA), Madara (app-chains)', tooltipRu: 'Экосистема: zkSync строит Hyperchains (L3 на базе zkSync -- фрактальное масштабирование). StarkNet развивает Volition (выбор DA: on-chain vs off-chain) и Madara (framework для app-specific chains).' },
  { label: 'Status', zksync: 'Mainnet since 2023, EVM compat goal 2025-26', starknet: 'Mainnet since 2023, sequencer decentral. 2026', tooltipRu: 'Обе сети на mainnet с 2023. zkSync фокусируется на EVM-совместимости (Type 1-2 zkEVM к 2025-26). StarkNet -- на децентрализации sequencer (запланировано на 2026). Обе сети в стадии активной разработки.' },
  { label: 'Target TPS', zksync: '10,000+', starknet: '10,000+ (via SHARP)', tooltipRu: 'Целевой TPS: обе сети стремятся к 10,000+ TPS. StarkNet использует SHARP (Shared Prover) для амортизации стоимости proof generation между несколькими приложениями.' },
];

/**
 * ZkSyncVsStarknetDiagram
 *
 * Two-column comparison: zkSync Era vs StarkNet architecture details.
 * hoveredRow migrated to DiagramTooltip on first-column cells.
 */
export function ZkSyncVsStarknetDiagram() {
  return (
    <DiagramContainer title="zkSync Era vs StarkNet" color="purple">
      {/* Header columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 0, marginBottom: 4 }}>
        <div />
        <DiagramTooltip content="zkSync Era -- ZK rollup от Matter Labs. Ключевой принцип: совместимость с Solidity для легкой миграции существующих dApps. PLONK-based SNARKs, native account abstraction, Hyperchains (L3).">
          <span style={{
            padding: '8px 10px',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#6366f1',
            fontFamily: 'monospace',
            borderBottom: '2px solid rgba(99,102,241,0.3)',
            display: 'inline-block',
            width: '100%',
          }}>
            zkSync Era
          </span>
        </DiagramTooltip>
        <DiagramTooltip content="StarkNet -- ZK rollup от StarkWare. Ключевой принцип: максимальная мощность ZK через собственный язык Cairo и STARK proofs. Quantum resistant, без trusted setup, SHARP для shared proving.">
          <span style={{
            padding: '8px 10px',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#f59e0b',
            fontFamily: 'monospace',
            borderBottom: '2px solid rgba(245,158,11,0.3)',
            display: 'inline-block',
            width: '100%',
          }}>
            StarkNet
          </span>
        </DiagramTooltip>
      </div>

      {/* Feature rows */}
      {FEATURES.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 1fr',
            gap: 0,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ padding: '8px 10px' }}>
            <DiagramTooltip content={row.tooltipRu}>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors.textMuted,
                fontFamily: 'monospace',
              }}>
                {row.label}
              </span>
            </DiagramTooltip>
          </div>
          <div style={{
            padding: '8px 10px',
            fontSize: 11,
            color: colors.text,
            lineHeight: 1.4,
          }}>
            {row.zksync}
          </div>
          <div style={{
            padding: '8px 10px',
            fontSize: 11,
            color: colors.text,
            lineHeight: 1.4,
          }}>
            {row.starknet}
          </div>
        </div>
      ))}

      {/* Shared goal */}
      <div style={{
        marginTop: 14,
        padding: 10,
        borderRadius: 6,
        background: 'rgba(139,92,246,0.08)',
        border: '1px solid rgba(139,92,246,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
          Общая цель
        </div>
        <DiagramTooltip content="Обе сети стремятся масштабировать Ethereum через validity proofs (ZK proofs). Подход отличается: zkSync -- EVM-совместимость для простоты миграции, StarkNet -- новый язык для максимальной мощности ZK.">
          <span style={{ fontSize: 12, color: colors.text, fontWeight: 600 }}>
            Масштабирование Ethereum через validity proofs
          </span>
        </DiagramTooltip>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Выбор подхода"
          value="zkSync: привычный Solidity, быстрое развертывание. StarkNet: Cairo = мощнее для ZK, но новый язык."
          variant="info"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ZKEcosystemMapDiagram                                               */
/* ================================================================== */

interface ZKProject {
  name: string;
  type: string;
  typeColor: string;
  proofSystem: string;
  status: string;
  tvl: string;
  differentiator: string;
  team: string;
  launch: string;
  tooltipRu: string;
}

const ZK_PROJECTS: ZKProject[] = [
  {
    name: 'Taiko',
    type: 'Type 1',
    typeColor: '#10b981',
    proofSystem: 'Multi-proof (SNARK)',
    status: 'Mainnet 2024',
    tvl: '~$200M',
    differentiator: 'Full Ethereum equivalence, community-driven',
    team: 'Taiko Labs',
    launch: '2024',
    tooltipRu: 'Taiko -- Type 1 zkEVM (полная Ethereum-эквивалентность). Используют multi-proof подход для верификации. Community-driven проект с decentralized sequencer с первого дня. Mainnet с 2024.',
  },
  {
    name: 'Polygon zkEVM',
    type: 'Type 2',
    typeColor: '#3b82f6',
    proofSystem: 'zk-SNARKs',
    status: 'Mainnet 2023',
    tvl: '~$400M',
    differentiator: 'EVM equivalent, Polygon ecosystem',
    team: 'Polygon Labs',
    launch: '2023',
    tooltipRu: 'Polygon zkEVM -- Type 2 (EVM-equivalent). Часть экосистемы Polygon (бывший Matic). zk-SNARKs для proof generation. Интеграция с Polygon CDK для app-specific chains. TVL ~$400M.',
  },
  {
    name: 'Scroll',
    type: 'Type 2',
    typeColor: '#3b82f6',
    proofSystem: 'zk-SNARKs',
    status: 'Mainnet 2023',
    tvl: '~$500M',
    differentiator: 'Community-driven, Ethereum equivalence',
    team: 'Scroll Foundation',
    launch: '2023',
    tooltipRu: 'Scroll -- Type 2 zkEVM (EVM-equivalent). Community-driven проект с фокусом на Ethereum-эквивалентности. Тесное сотрудничество с Ethereum Foundation на zkEVM research. TVL ~$500M.',
  },
  {
    name: 'Linea',
    type: 'Type 2',
    typeColor: '#3b82f6',
    proofSystem: 'zk-SNARKs',
    status: 'Mainnet 2023',
    tvl: '~$600M',
    differentiator: 'ConsenSys (MetaMask), enterprise-focused',
    team: 'ConsenSys',
    launch: '2023',
    tooltipRu: 'Linea -- Type 2 zkEVM от ConsenSys (создатели MetaMask). Enterprise-focused подход с глубокой интеграцией MetaMask. ConsenSys infrastructure обеспечивает reliability. TVL ~$600M.',
  },
  {
    name: 'zkSync Era',
    type: 'Type 4',
    typeColor: '#8b5cf6',
    proofSystem: 'zk-SNARKs (PLONK)',
    status: 'Mainnet 2023',
    tvl: '~$800M',
    differentiator: 'Native AA, Hyperchains (L3)',
    team: 'Matter Labs',
    launch: '2023',
    tooltipRu: 'zkSync Era -- Type 4 zkEVM (custom bytecode, Solidity transpiled). Native account abstraction (все аккаунты = smart contracts). Hyperchains -- L3 на базе zkSync для фрактального масштабирования. TVL ~$800M.',
  },
  {
    name: 'StarkNet',
    type: 'Type 4',
    typeColor: '#8b5cf6',
    proofSystem: 'STARKs',
    status: 'Mainnet 2023',
    tvl: '~$600M',
    differentiator: 'Cairo language, quantum resistant, SHARP',
    team: 'StarkWare',
    launch: '2023',
    tooltipRu: 'StarkNet -- Type 4 (Cairo VM, не EVM). STARK proofs: quantum resistant, без trusted setup, но большие (~100KB). SHARP (Shared Prover) амортизирует стоимость proof generation. Cairo -- язык, оптимизированный для provability.',
  },
];

/**
 * ZKEcosystemMapDiagram
 *
 * Grid of cards for ZK rollup projects, color-coded by Type.
 * hoveredProject migrated to DiagramTooltip on project cards.
 */
export function ZKEcosystemMapDiagram() {
  return (
    <DiagramContainer title="Экосистема ZK Rollups (2025)" color="green">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8,
        marginBottom: 14,
      }}>
        {ZK_PROJECTS.map((project) => (
          <DiagramTooltip key={project.name} content={project.tooltipRu}>
            <div
              style={{
                ...glassStyle,
                padding: 12,
                borderRadius: 6,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s',
              }}
            >
              {/* Name + Type badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
                  {project.name}
                </span>
              </div>
              <span style={{
                fontSize: 9,
                fontFamily: 'monospace',
                color: project.typeColor,
                padding: '1px 6px',
                borderRadius: 3,
                background: `${project.typeColor}15`,
                border: `1px solid ${project.typeColor}30`,
                fontWeight: 600,
              }}>
                {project.type}
              </span>

              {/* Basic info */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                  Proof: {project.proofSystem}
                </div>
                <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                  Status: {project.status}
                </div>
                <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                  TVL: {project.tvl}
                </div>
              </div>

              {/* Always-visible detail (replaces hover) */}
              <div style={{
                marginTop: 8,
                padding: 6,
                borderRadius: 4,
                background: `${project.typeColor}08`,
                border: `1px solid ${project.typeColor}20`,
              }}>
                <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.4 }}>
                  {project.differentiator}
                </div>
                <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginTop: 4 }}>
                  Team: {project.team} | Launch: {project.launch}
                </div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DataBox
        label="Тренд 2025"
        value="Экосистема ZK rollups растет. Type 2 (EVM equivalent) -- наиболее активный сегмент."
        variant="info"
      />
    </DiagramContainer>
  );
}
