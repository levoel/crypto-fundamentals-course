/**
 * Layer 2 Concept Diagrams (SCALE-02)
 *
 * Exports:
 * - L2ClassificationDiagram: Interactive expand/collapse tree of L2 scaling solutions
 * - DASpectrumDiagram: Data availability spectrum (rollup -> validium -> sidechain) with hover
 * - L2TVLDiagram: Static horizontal bar chart of L2 TVL distribution (2025)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  L2ClassificationDiagram                                             */
/* ================================================================== */

interface TreeNode {
  id: string;
  label: string;
  detail?: string;
  da?: string;
  security?: string;
  children?: TreeNode[];
}

const CLASSIFICATION_TREE: TreeNode = {
  id: 'root',
  label: 'Ethereum Scaling',
  children: [
    {
      id: 'onchain',
      label: 'On-chain',
      children: [
        { id: 'sharding', label: 'Sharding', detail: 'Full Danksharding (future)', da: 'On Ethereum', security: 'L1 consensus' },
      ],
    },
    {
      id: 'offchain',
      label: 'Off-chain (Layer 2)',
      children: [
        {
          id: 'channels',
          label: 'State Channels',
          children: [
            { id: 'raiden', label: 'Raiden', detail: 'Ethereum payment channels', da: 'Between parties', security: 'Multisig + dispute' },
            { id: 'connext', label: 'Connext', detail: 'Cross-chain liquidity', da: 'Between parties', security: 'Multisig + dispute' },
          ],
        },
        {
          id: 'plasma',
          label: 'Plasma',
          children: [
            { id: 'polygon-plasma', label: 'Polygon (historical)', detail: 'Перешел на zkEVM', da: 'Off-chain (operator)', security: 'Merkle roots + exit game' },
            { id: 'omg', label: 'OMG Network', detail: 'Не поддерживает general SC', da: 'Off-chain (operator)', security: 'Merkle roots + exit game' },
          ],
        },
        {
          id: 'rollups',
          label: 'Rollups',
          children: [
            {
              id: 'optimistic',
              label: 'Optimistic',
              children: [
                { id: 'optimism', label: 'Optimism', detail: 'OP Stack, EVM equivalent, 7-day finality', da: 'On Ethereum (blobs)', security: 'Fraud proofs (Cannon)' },
                { id: 'arbitrum', label: 'Arbitrum', detail: 'Nitro, WASM execution, multi-round fraud proof', da: 'On Ethereum (blobs)', security: 'Interactive fraud proofs' },
                { id: 'base', label: 'Base', detail: 'Coinbase L2, OP Stack, крупнейший по TVL', da: 'On Ethereum (blobs)', security: 'OP Stack fraud proofs' },
              ],
            },
            {
              id: 'zk',
              label: 'ZK',
              children: [
                { id: 'zksync', label: 'zkSync Era', detail: 'Type 4 zkEVM, native AA', da: 'On Ethereum (blobs)', security: 'Validity proofs (SNARKs)' },
                { id: 'starknet', label: 'StarkNet', detail: 'Cairo language, STARKs', da: 'On Ethereum (blobs)', security: 'Validity proofs (STARKs)' },
                { id: 'polygon-zkevm', label: 'Polygon zkEVM', detail: 'Type 2 zkEVM', da: 'On Ethereum (blobs)', security: 'Validity proofs' },
                { id: 'scroll', label: 'Scroll', detail: 'Type 2 zkEVM, community-driven', da: 'On Ethereum (blobs)', security: 'Validity proofs' },
              ],
            },
          ],
        },
        {
          id: 'validiums',
          label: 'Validiums',
          children: [
            { id: 'anytrust', label: 'Arbitrum Orbit (AnyTrust)', detail: 'Off-chain DA via DAC', da: 'Off-chain (DAC, 5-15 members)', security: 'DAC trust assumption' },
          ],
        },
        {
          id: 'sidechains',
          label: 'Sidechains (NOT L2)',
          children: [
            { id: 'polygon-pos', label: 'Polygon PoS', detail: 'Собственные валидаторы, НЕ L2 rollup', da: 'Own chain', security: 'Own validators (100+)' },
          ],
        },
      ],
    },
  ],
};

function TreeNodeComponent({ node, depth, expanded, onToggle }: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isLeaf = !hasChildren;
  const isSidechain = node.id === 'sidechains' || node.id === 'polygon-pos';

  const depthColors = ['#6366f1', '#10b981', '#f59e0b', '#a78bfa', '#f43f5e', '#2563eb'];
  const nodeColor = isSidechain ? '#f43f5e' : depthColors[depth % depthColors.length];

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => hasChildren ? onToggle(node.id) : undefined}
        style={{
          ...glassStyle,
          padding: '6px 10px',
          marginBottom: 4,
          cursor: hasChildren ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: `1px solid ${isExpanded ? nodeColor + '40' : 'rgba(255,255,255,0.06)'}`,
          background: isExpanded ? `${nodeColor}08` : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s',
        }}
      >
        {hasChildren && (
          <span style={{ fontSize: 10, color: nodeColor, fontFamily: 'monospace', width: 12, textAlign: 'center' }}>
            {isExpanded ? '-' : '+'}
          </span>
        )}
        {isLeaf && <span style={{ width: 12 }} />}
        <span style={{
          fontSize: 11,
          fontWeight: hasChildren ? 600 : 400,
          color: hasChildren ? nodeColor : colors.text,
          fontFamily: 'monospace',
        }}>
          {node.label}
        </span>
        {node.detail && isLeaf && (
          <span style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginLeft: 'auto' }}>
            {node.detail}
          </span>
        )}
      </div>

      {/* Leaf detail row */}
      {isLeaf && isExpanded && node.da && (
        <div style={{
          marginLeft: 20,
          marginBottom: 6,
          padding: '4px 10px',
          fontSize: 10,
          fontFamily: 'monospace',
          color: colors.textMuted,
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <span><span style={{ color: nodeColor }}>DA:</span> {node.da}</span>
          <span><span style={{ color: nodeColor }}>Security:</span> {node.security}</span>
        </div>
      )}

      {/* Children */}
      {hasChildren && isExpanded && node.children!.map((child) => (
        <TreeNodeComponent key={child.id} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
      ))}
    </div>
  );
}

/**
 * L2ClassificationDiagram
 *
 * Interactive expand/collapse tree showing L2 solution classification.
 * Root: Ethereum Scaling -> On-chain / Off-chain -> subcategories.
 */
export function L2ClassificationDiagram() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root', 'offchain', 'rollups']));

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds: string[] = [];
    const collect = (node: TreeNode) => {
      allIds.push(node.id);
      node.children?.forEach(collect);
    };
    collect(CLASSIFICATION_TREE);
    setExpanded(new Set(allIds));
  };

  const collapseAll = () => {
    setExpanded(new Set(['root']));
  };

  return (
    <DiagramContainer title="Классификация решений масштабирования" color="blue">
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={expandAll} style={{ ...glassStyle, padding: '4px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}>
          Развернуть все
        </button>
        <button onClick={collapseAll} style={{ ...glassStyle, padding: '4px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}>
          Свернуть все
        </button>
      </div>

      <TreeNodeComponent node={CLASSIFICATION_TREE} depth={0} expanded={expanded} onToggle={onToggle} />

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Важно"
          value="Polygon PoS -- сайдчейн, НЕ L2 rollup. У него собственные валидаторы и собственная безопасность. Настоящие L2 (rollups) наследуют безопасность Ethereum через публикацию данных на L1."
          variant="warning"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  DASpectrumDiagram                                                   */
/* ================================================================== */

interface DAZone {
  label: string;
  description: string;
  examples: string;
  security: string;
  cost: string;
  color: string;
  width: number;
}

const DA_ZONES: DAZone[] = [
  {
    label: 'Rollup (calldata/blobs)',
    description: 'Все данные на L1. Полная безопасность Ethereum.',
    examples: 'Optimism, Arbitrum, zkSync Era, Scroll',
    security: 'Максимальная (L1 security)',
    cost: 'Высокая (но blobs снижают)',
    color: '#10b981',
    width: 35,
  },
  {
    label: 'Validium (DAC)',
    description: 'Данные у комитета (5-15 участников). Доверие к DAC.',
    examples: 'Arbitrum Orbit (AnyTrust mode)',
    security: 'Средняя (DAC trust)',
    cost: 'Средняя',
    color: '#f59e0b',
    width: 30,
  },
  {
    label: 'Sidechain (own chain)',
    description: 'Собственные валидаторы. Собственная безопасность.',
    examples: 'Polygon PoS',
    security: 'Низкая (own validators)',
    cost: 'Низкая',
    color: '#f43f5e',
    width: 35,
  },
];

/**
 * DASpectrumDiagram
 *
 * Data availability spectrum: most secure (left, rollups) to least secure (right, sidechains).
 * Hover on each zone for details.
 */
export function DASpectrumDiagram() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hovered = hoveredIdx !== null ? DA_ZONES[hoveredIdx] : null;

  return (
    <DiagramContainer title="Спектр доступности данных (Data Availability)" color="orange">
      {/* Spectrum bar */}
      <div style={{ display: 'flex', marginBottom: 8, borderRadius: 6, overflow: 'hidden' }}>
        {DA_ZONES.map((zone, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              width: `${zone.width}%`,
              padding: '12px 8px',
              background: hoveredIdx === i ? `${zone.color}25` : `${zone.color}12`,
              borderRight: i < DA_ZONES.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, color: zone.color, fontFamily: 'monospace', lineHeight: 1.4 }}>
              {zone.label}
            </div>
          </div>
        ))}
      </div>

      {/* Gradient arrows */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#10b981', fontFamily: 'monospace' }}>Security: HIGH</span>
          <span style={{ fontSize: 10, color: colors.textMuted }}>---{'>'}</span>
          <span style={{ fontSize: 10, color: '#f43f5e', fontFamily: 'monospace' }}>LOW</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#10b981', fontFamily: 'monospace' }}>Cost: HIGH</span>
          <span style={{ fontSize: 10, color: colors.textMuted }}>---{'>'}</span>
          <span style={{ fontSize: 10, color: '#f43f5e', fontFamily: 'monospace' }}>LOW</span>
        </div>
      </div>

      {/* Hover detail */}
      {hovered && (
        <div style={{
          ...glassStyle,
          padding: 14,
          marginBottom: 12,
          border: `1px solid ${hovered.color}30`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: hovered.color, fontFamily: 'monospace', marginBottom: 6 }}>
            {hovered.label}
          </div>
          <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5, marginBottom: 8 }}>
            {hovered.description}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace' }}>
              <span style={{ color: colors.textMuted }}>Examples: </span>
              <span style={{ color: colors.text }}>{hovered.examples}</span>
            </div>
            <div style={{ fontSize: 10, fontFamily: 'monospace' }}>
              <span style={{ color: colors.textMuted }}>Security: </span>
              <span style={{ color: hovered.color }}>{hovered.security}</span>
            </div>
            <div style={{ fontSize: 10, fontFamily: 'monospace' }}>
              <span style={{ color: colors.textMuted }}>Cost: </span>
              <span style={{ color: hovered.color }}>{hovered.cost}</span>
            </div>
          </div>
        </div>
      )}

      <DataBox
        label="EIP-4844 (Proto-Danksharding)"
        value="Blobs -- специальные данные, дешевле calldata, хранятся ~18 дней. Достаточно для challenge period optimistic rollups. Снижение комиссий L2 в 10-100x."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  L2TVLDiagram                                                        */
/* ================================================================== */

interface TVLEntry {
  name: string;
  tvl: number;
  tvlLabel: string;
  share: string;
  color: string;
  note?: string;
}

const TVL_DATA: TVLEntry[] = [
  { name: 'Base', tvl: 12, tvlLabel: '~$12B', share: '~47%', color: '#2563eb', note: 'Coinbase, OP Stack' },
  { name: 'Arbitrum One', tvl: 8, tvlLabel: '~$8B', share: '~31%', color: '#f59e0b' },
  { name: 'Optimism', tvl: 2.5, tvlLabel: '~$2.5B', share: '~10%', color: '#ef4444' },
  { name: 'zkSync Era', tvl: 0.8, tvlLabel: '~$0.8B', share: '~3%', color: '#a78bfa' },
  { name: 'StarkNet', tvl: 0.5, tvlLabel: '~$0.5B', share: '~2%', color: '#8b5cf6' },
  { name: 'Others', tvl: 2, tvlLabel: '~$2B', share: '~7%', color: '#6b7280' },
];

/**
 * L2TVLDiagram
 *
 * Static horizontal bar chart showing L2 TVL distribution (2025).
 */
export function L2TVLDiagram() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxTVL = Math.max(...TVL_DATA.map((d) => d.tvl));

  const svgW = 440;
  const barH = 30;
  const gap = 6;
  const padL = 100;
  const padR = 100;
  const svgH = TVL_DATA.length * (barH + gap) + 16;
  const chartW = svgW - padL - padR;

  return (
    <DiagramContainer title="TVL Layer 2 экосистемы (2025)" color="green">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {TVL_DATA.map((entry, i) => {
            const y = i * (barH + gap) + 4;
            const w = (entry.tvl / maxTVL) * chartW;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'default' }}
              >
                <text
                  x={padL - 8}
                  y={y + barH / 2 + 4}
                  fill={isHovered ? entry.color : colors.text}
                  fontSize={10}
                  textAnchor="end"
                  fontFamily="monospace"
                  fontWeight={isHovered ? 600 : 400}
                >
                  {entry.name}
                </text>
                <rect
                  x={padL}
                  y={y}
                  width={Math.max(w, 8)}
                  height={barH}
                  fill={entry.color}
                  opacity={isHovered ? 0.9 : 0.6}
                  rx={4}
                />
                <text
                  x={padL + Math.max(w, 8) + 8}
                  y={y + barH / 2 - 2}
                  fill={entry.color}
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight={600}
                  dominantBaseline="middle"
                >
                  {entry.tvlLabel}
                </text>
                <text
                  x={padL + Math.max(w, 8) + 8}
                  y={y + barH / 2 + 11}
                  fill={colors.textMuted}
                  fontSize={9}
                  fontFamily="monospace"
                  dominantBaseline="middle"
                >
                  {entry.share}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{
        fontSize: 11,
        fontFamily: 'monospace',
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 12,
      }}>
        Total L2 TVL: <span style={{ color: '#10b981', fontWeight: 600 }}>~$26B</span> (2025)
      </div>

      <DataBox
        label="Примечание"
        value="Base (Coinbase, OP Stack) стала крупнейшей L2 в 2024 году, обогнав Arbitrum по TVL. Это демонстрирует силу OP Stack как платформы для создания rollups."
        variant="info"
      />
    </DiagramContainer>
  );
}
