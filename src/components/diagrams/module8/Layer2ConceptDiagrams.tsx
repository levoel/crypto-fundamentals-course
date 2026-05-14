/** @jsxImportSource solid-js */
/**
 * Layer 2 Concept Diagrams (SCALE-02)
 *
 * Exports:
 * - L2ClassificationDiagram: Interactive expand/collapse tree of L2 scaling solutions
 * - DASpectrumDiagram: Data availability spectrum (rollup -> validium -> sidechain)
 * - L2TVLDiagram: Static horizontal bar chart of L2 TVL distribution (2025)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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

const TREE_TOOLTIPS: Record<string, string> = {
  root: 'Масштабирование Ethereum включает on-chain (шардинг) и off-chain (Layer 2) подходы. Off-chain решения переносят вычисления с L1, сохраняя безопасность.',
  onchain: 'On-chain масштабирование увеличивает пропускную способность самого L1. Danksharding разделит данные между валидаторами.',
  offchain: 'Off-chain решения выполняют транзакции за пределами L1, периодически публикуя данные на Ethereum. Наследуют безопасность L1 в разной степени.',
  channels: 'State Channels позволяют двум сторонам обмениваться транзакциями без публикации каждой на L1. Подходят для платежей, не для общих вычислений.',
  plasma: 'Plasma создает дочерние цепи с периодической публикацией Merkle roots на L1. Ограничен: не поддерживает произвольные smart contracts.',
  rollups: 'Rollups -- доминирующий подход к масштабированию. Выполняют транзакции off-chain, но публикуют все данные на L1 для верификации.',
  optimistic: 'Optimistic rollups считают транзакции валидными по умолчанию. 7-дневный challenge period для fraud proofs.',
  zk: 'ZK rollups генерируют математические доказательства (validity proofs) корректности каждого batch. Мгновенная финализация после верификации proof.',
  validiums: 'Validiums используют validity proofs как ZK rollups, но хранят данные off-chain (DAC). Дешевле, но слабее гарантии доступности данных.',
  sidechains: 'Сайдчейны -- НЕ Layer 2. Они имеют собственных валидаторов и не наследуют безопасность Ethereum.',
};

function TreeNodeComponent(props: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = () => props.node.children && props.node.children.length > 0;
  const isExpanded = () => props.expanded.has(props.node.id);
  const isLeaf = () => !hasChildren();
  const isSidechain = () => props.node.id === 'sidechains' || props.node.id === 'polygon-pos';

  const depthColors = ['#6366f1', '#10b981', '#f59e0b', '#a78bfa', '#f43f5e', '#2563eb'];
  const nodeColor = () => isSidechain() ? '#f43f5e' : depthColors[props.depth % depthColors.length];

  const tooltipContent = () => TREE_TOOLTIPS[props.node.id];

  const nodeElement = (
    <div
      onClick={() => hasChildren() ? props.onToggle(props.node.id) : undefined}
      style={{
        ...glassStyle,
        'padding': '6px 10px',
        'margin-bottom': '4px',
        'cursor': hasChildren() ? 'pointer' : 'default',
        'display': 'flex',
        'align-items': 'center',
        'gap': '8px',
        'border': `1px solid ${isExpanded() ? nodeColor() + '40' : 'rgba(255,255,255,0.06)'}`,
        'background': isExpanded() ? `${nodeColor()}08` : 'rgba(255,255,255,0.02)',
        'transition': 'all 0.2s',
      }}
    >
      {hasChildren() && (
        <span style={{ 'font-size': '10px', 'color': nodeColor(), 'font-family': 'monospace', 'width': '12px', 'text-align': 'center' }}>
          {isExpanded() ? '-' : '+'}
        </span>
      )}
      {isLeaf() && <span style={{ 'width': '12px' }} />}
      <span style={{
        'font-size': '11px',
        'font-weight': hasChildren() ? 600 : 400,
        'color': hasChildren() ? nodeColor() : colors.text,
        'font-family': 'monospace',
      }}>
        {props.node.label}
      </span>
      {props.node.detail && isLeaf() && (
        <span style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-left': 'auto' }}>
          {props.node.detail}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ 'margin-left': props.depth * 16 }}>
      {tooltipContent() ? (
        <DiagramTooltip content={tooltipContent()}>
          {nodeElement}
        </DiagramTooltip>
      ) : nodeElement}

      {/* Leaf detail row */}
      {isLeaf() && isExpanded() && props.node.da && (
        <div style={{
          'margin-left': '20px',
          'margin-bottom': '6px',
          'padding': '4px 10px',
          'font-size': '10px',
          'font-family': 'monospace',
          'color': colors.textMuted,
          'display': 'flex',
          'gap': '16px',
          'flex-wrap': 'wrap',
        }}>
          <span><span style={{ 'color': nodeColor() }}>DA:</span> {props.node.da}</span>
          <span><span style={{ 'color': nodeColor() }}>Security:</span> {props.node.security}</span>
        </div>
      )}

      {/* Children */}
      {hasChildren() && isExpanded() && props.node.children!.map((child) => (
        <TreeNodeComponent node={child} depth={props.depth + 1} expanded={props.expanded} onToggle={props.onToggle} />
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
  const [expanded, setExpanded] = createSignal<Set<string>>(new Set(['root', 'offchain', 'rollups']));

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
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '12px' }}>
        <DiagramTooltip content="Развернуть все узлы дерева для полного обзора классификации решений масштабирования.">
          <div style={{ 'display': 'inline-block' }}>
            <button onClick={expandAll} style={{ ...glassStyle, 'padding': '4px 10px', 'cursor': 'pointer', 'font-size': '10px', 'font-family': 'monospace', 'color': colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '4px' }}>
              Развернуть все
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Свернуть дерево до корневого узла.">
          <div style={{ 'display': 'inline-block' }}>
            <button onClick={collapseAll} style={{ ...glassStyle, 'padding': '4px 10px', 'cursor': 'pointer', 'font-size': '10px', 'font-family': 'monospace', 'color': colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '4px' }}>
              Свернуть все
            </button>
          </div>
        </DiagramTooltip>
      </div>

      <TreeNodeComponent node={CLASSIFICATION_TREE} depth={0} expanded={expanded()} onToggle={onToggle} />

      <div style={{ 'margin-top': '12px' }}>
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
 * DiagramTooltip on each zone for details.
 */
export function DASpectrumDiagram() {
  return (
    <DiagramContainer title="Спектр доступности данных (Data Availability)" color="orange">
      {/* Spectrum bar */}
      <div style={{ 'display': 'flex', 'margin-bottom': '8px', 'border-radius': '6px', 'overflow': 'hidden' }}>
        {DA_ZONES.map((zone, i) => (
          <DiagramTooltip
            content={
              <>
                <div style={{ 'font-weight': '700', 'margin-bottom': '4px' }}>{zone.label}</div>
                <div style={{ 'margin-bottom': '6px' }}>{zone.description}</div>
                <div style={{ 'font-size': '12px' }}>
                  <div><span style={{ 'opacity': '0.7' }}>Examples:</span> {zone.examples}</div>
                  <div><span style={{ 'opacity': '0.7' }}>Security:</span> {zone.security}</div>
                  <div><span style={{ 'opacity': '0.7' }}>Cost:</span> {zone.cost}</div>
                </div>
              </>
            }
          >
            <div
              style={{
                'width': `${zone.width}%`,
                'padding': '12px 8px',
                'background': `${zone.color}12`,
                'border-right': i < DA_ZONES.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                'cursor': 'pointer',
                'text-align': 'center',
                'transition': 'all 0.2s',
              }}
            >
              <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': zone.color, 'font-family': 'monospace', 'line-height': '1.4' }}>
                {zone.label}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Gradient arrows */}
      <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'margin-bottom': '12px', 'padding': '0 4px' }}>
        <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '4px' }}>
          <span style={{ 'font-size': '10px', 'color': '#10b981', 'font-family': 'monospace' }}>Security: HIGH</span>
          <span style={{ 'font-size': '10px', 'color': colors.textMuted }}>---{'>'}</span>
          <span style={{ 'font-size': '10px', 'color': '#f43f5e', 'font-family': 'monospace' }}>LOW</span>
        </div>
        <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '4px' }}>
          <span style={{ 'font-size': '10px', 'color': '#10b981', 'font-family': 'monospace' }}>Cost: HIGH</span>
          <span style={{ 'font-size': '10px', 'color': colors.textMuted }}>---{'>'}</span>
          <span style={{ 'font-size': '10px', 'color': '#f43f5e', 'font-family': 'monospace' }}>LOW</span>
        </div>
      </div>

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
  tooltipRu: string;
}

const TVL_DATA: TVLEntry[] = [
  { name: 'Base', tvl: 12, tvlLabel: '~$12B', share: '~47%', color: '#2563eb', note: 'Coinbase, OP Stack', tooltipRu: 'Base (Coinbase) -- крупнейший L2 по TVL. Построен на OP Stack, часть Superchain. Рост обусловлен интеграцией с Coinbase и низкими комиссиями.' },
  { name: 'Arbitrum One', tvl: 8, tvlLabel: '~$8B', share: '~31%', color: '#f59e0b', tooltipRu: 'Arbitrum One -- лидер по собственному TVL среди rollups. Nitro архитектура с interactive fraud proofs и Stylus WASM VM.' },
  { name: 'Optimism', tvl: 2.5, tvlLabel: '~$2.5B', share: '~10%', color: '#ef4444', tooltipRu: 'Optimism Mainnet -- пионер optimistic rollups. OP Stack framework позволил запуск Superchain (Base, Zora, Mode).' },
  { name: 'zkSync Era', tvl: 0.8, tvlLabel: '~$0.8B', share: '~3%', color: '#a78bfa', tooltipRu: 'zkSync Era -- Type 4 zkEVM с native Account Abstraction. Использует SNARKs для validity proofs. Быстрая финализация.' },
  { name: 'StarkNet', tvl: 0.5, tvlLabel: '~$0.5B', share: '~2%', color: '#8b5cf6', tooltipRu: 'StarkNet -- ZK rollup на базе STARKs. Собственный язык Cairo. Quantum-resistant доказательства, transparent setup.' },
  { name: 'Others', tvl: 2, tvlLabel: '~$2B', share: '~7%', color: '#6b7280', tooltipRu: 'Включает Scroll, Linea, Polygon zkEVM, Manta, Blast и другие rollups. Экосистема активно растет.' },
];

/**
 * L2TVLDiagram
 *
 * Static horizontal bar chart showing L2 TVL distribution (2025).
 * SVG bars with HTML tooltip legend below.
 */
export function L2TVLDiagram() {
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
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '12px' }}>
        <svg width={svgW} height={svgH} style={{ 'overflow': 'visible' }}>
          {TVL_DATA.map((entry, i) => {
            const y = i * (barH + gap) + 4;
            const w = (entry.tvl / maxTVL) * chartW;

            return (
              <g>
                <text
                  x={padL - 8}
                  y={y + barH / 2 + 4}
                  fill={colors.text}
                  fontSize={10}
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {entry.name}
                </text>
                <rect
                  x={padL}
                  y={y}
                  width={Math.max(w, 8)}
                  height={barH}
                  fill={entry.color}
                  opacity={0.6}
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

      {/* HTML tooltip legend */}
      <div style={{ 'display': 'flex', 'flex-wrap': 'wrap', 'gap': '6px', 'margin-bottom': '12px', 'justify-content': 'center' }}>
        {TVL_DATA.map((entry) => (
          <DiagramTooltip content={entry.tooltipRu}>
            <div style={{
              'display': 'inline-flex',
              'align-items': 'center',
              'gap': '4px',
              'padding': '4px 8px',
              'border-radius': '4px',
              'border': `1px solid ${entry.color}30`,
              'background': `${entry.color}08`,
              'cursor': 'pointer',
            }}>
              <div style={{ 'width': '8px', 'height': '8px', 'border-radius': '2px', 'background': entry.color }} />
              <span style={{ 'font-size': '10px', 'color': entry.color, 'font-family': 'monospace' }}>{entry.name}</span>
              <span style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace' }}>{entry.tvlLabel}</span>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <div style={{
        'font-size': '11px',
        'font-family': 'monospace',
        'color': colors.textMuted,
        'text-align': 'center',
        'margin-bottom': '12px',
      }}>
        Total L2 TVL: <span style={{ 'color': '#10b981', 'font-weight': '600' }}>~$26B</span> (2025)
      </div>

      <DataBox
        label="Примечание"
        value="Base (Coinbase, OP Stack) стала крупнейшей L2 в 2024 году, обогнав Arbitrum по TVL. Это демонстрирует силу OP Stack как платформы для создания rollups."
        variant="info"
      />
    </DiagramContainer>
  );
}
