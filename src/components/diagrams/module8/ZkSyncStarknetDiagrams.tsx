/**
 * zkSync / StarkNet Diagrams (SCALE-08)
 *
 * Exports:
 * - ZkSyncVsStarknetDiagram: Side-by-side architecture comparison (static with DataBox blocks)
 * - ZKEcosystemMapDiagram: ZK rollup ecosystem grid by Type (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ZkSyncVsStarknetDiagram                                             */
/* ================================================================== */

interface FeatureRow {
  label: string;
  zksync: string;
  starknet: string;
}

const FEATURES: FeatureRow[] = [
  { label: 'VM', zksync: 'zkEVM (Type 4, custom bytecode)', starknet: 'Cairo VM (custom, not EVM)' },
  { label: 'Language', zksync: 'Solidity (transpiled)', starknet: 'Cairo (designed for provability)' },
  { label: 'Proof System', zksync: 'zk-SNARKs (PLONK-based)', starknet: 'STARKs (transparent, quantum resistant)' },
  { label: 'Account Abstraction', zksync: 'Native (all accounts = smart contracts)', starknet: 'Native (built into protocol from day 1)' },
  { label: 'Ecosystem', zksync: 'Hyperchains (L3 on top of zkSync)', starknet: 'Volition (hybrid DA), Madara (app-chains)' },
  { label: 'Status', zksync: 'Mainnet since 2023, EVM compat goal 2025-26', starknet: 'Mainnet since 2023, sequencer decentral. 2026' },
  { label: 'Target TPS', zksync: '10,000+', starknet: '10,000+ (via SHARP)' },
];

/**
 * ZkSyncVsStarknetDiagram
 *
 * Two-column comparison: zkSync Era vs StarkNet architecture details.
 * Shared goal arrow at bottom.
 */
export function ZkSyncVsStarknetDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <DiagramContainer title="zkSync Era vs StarkNet" color="purple">
      {/* Header columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 0, marginBottom: 4 }}>
        <div />
        <div style={{
          padding: '8px 10px',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: '#6366f1',
          fontFamily: 'monospace',
          borderBottom: '2px solid rgba(99,102,241,0.3)',
        }}>
          zkSync Era
        </div>
        <div style={{
          padding: '8px 10px',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: '#f59e0b',
          fontFamily: 'monospace',
          borderBottom: '2px solid rgba(245,158,11,0.3)',
        }}>
          StarkNet
        </div>
      </div>

      {/* Feature rows */}
      {FEATURES.map((row, i) => {
        const isHovered = hoveredRow === i;
        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr 1fr',
              gap: 0,
              background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
              transition: 'background 0.15s',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{
              padding: '8px 10px',
              fontSize: 10,
              fontWeight: 600,
              color: isHovered ? colors.text : colors.textMuted,
              fontFamily: 'monospace',
            }}>
              {row.label}
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
        );
      })}

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
        <div style={{ fontSize: 12, color: colors.text, fontWeight: 600 }}>
          Масштабирование Ethereum через validity proofs
        </div>
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
  },
];

/**
 * ZKEcosystemMapDiagram
 *
 * Grid of cards for ZK rollup projects, color-coded by Type.
 * Hover reveals differentiator, team, launch date.
 */
export function ZKEcosystemMapDiagram() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  return (
    <DiagramContainer title="Экосистема ZK Rollups (2025)" color="green">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8,
        marginBottom: 14,
      }}>
        {ZK_PROJECTS.map((project) => {
          const isHovered = hoveredProject === project.name;
          return (
            <div
              key={project.name}
              onMouseEnter={() => setHoveredProject(project.name)}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                ...glassStyle,
                padding: 12,
                borderRadius: 6,
                cursor: 'pointer',
                background: isHovered ? `${project.typeColor}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isHovered ? `${project.typeColor}40` : 'rgba(255,255,255,0.08)'}`,
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

              {/* Hover detail */}
              {isHovered && (
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
              )}
            </div>
          );
        })}
      </div>

      <DataBox
        label="Тренд 2025"
        value="Экосистема ZK rollups растет. Type 2 (EVM equivalent) -- наиболее активный сегмент."
        variant="info"
      />
    </DiagramContainer>
  );
}
