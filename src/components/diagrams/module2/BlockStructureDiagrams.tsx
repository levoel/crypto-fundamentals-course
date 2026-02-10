/**
 * Block Structure Diagrams (BTC-03)
 *
 * Exports:
 * - BlockHeaderExplorer: Interactive 80-byte block header fields (click to inspect)
 * - BlockChainLinkDiagram: Block chain linking visualization
 * - MerkleInBlockDiagram: Merkle tree inside a block connecting to header
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

function truncHex(s: string, len = 8): string {
  return s.length > len ? s.slice(0, len) + '...' : s;
}

/** FNV hash for display purposes */
function fnvHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return (h >>> 0).toString(16).padStart(8, '0');
}

/* ================================================================== */
/*  BlockHeaderExplorer                                                 */
/* ================================================================== */

interface HeaderField {
  name: string;
  nameRu: string;
  size: number;
  hex: string;
  description: string;
  role: string;
  color: string;
}

/** Genesis block header values (well-known, for realistic display) */
const HEADER_FIELDS: HeaderField[] = [
  {
    name: 'Version',
    nameRu: 'Версия',
    size: 4,
    hex: '01000000',
    description: 'Версия протокола блока. Используется для сигнализации soft fork (BIP 9).',
    role: 'Указывает, какие правила консенсуса применяются. Бит-поля для голосования за обновления.',
    color: colors.primary,
  },
  {
    name: 'Previous Hash',
    nameRu: 'Хеш предыдущего',
    size: 32,
    hex: '0000000000000000000000000000000000000000000000000000000000000000',
    description: 'SHA-256d хеш заголовка предыдущего блока. У Genesis Block = все нули.',
    role: 'Связывает блоки в цепочку. Изменение любого блока меняет все последующие хеши.',
    color: colors.success,
  },
  {
    name: 'Merkle Root',
    nameRu: 'Корень Меркла',
    size: 32,
    hex: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    description: 'Корень дерева Меркла, построенного из всех txid блока. Фиксирует набор транзакций.',
    role: 'Позволяет проверить включение транзакции за O(log n) -- Merkle Proof (см. CRYPTO-13/14).',
    color: colors.accent,
  },
  {
    name: 'Timestamp',
    nameRu: 'Временная метка',
    size: 4,
    hex: '29ab5f49',
    description: 'Unix timestamp (секунды). Genesis: 1231006505 = 3 января 2009, 18:15:05 UTC.',
    role: 'Используется для расчёта сложности (каждые 2016 блоков). Допустимое отклонение ~2 часа.',
    color: '#e67e22',
  },
  {
    name: 'nBits (Target)',
    nameRu: 'nBits (Цель)',
    size: 4,
    hex: 'ffff001d',
    description: 'Компактное представление целевого значения: 0x1d00ffff. Майнер должен найти хеш < target.',
    role: 'Кодирует сложность майнинга. Формат: 1 байт экспонента + 3 байта мантисса.',
    color: '#9b59b6',
  },
  {
    name: 'Nonce',
    nameRu: 'Нонс',
    size: 4,
    hex: '1dac2b7c',
    description: 'Число, которое майнер перебирает для поиска хеша < target. Genesis nonce = 2083236893.',
    role: '4 байта = 2^32 вариантов. Если не хватает, меняют timestamp или coinbase extraNonce.',
    color: '#1abc9c',
  },
];

export function BlockHeaderExplorer() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const totalBytes = HEADER_FIELDS.reduce((s, f) => s + f.size, 0);
  const selected = selectedIdx !== null ? HEADER_FIELDS[selectedIdx] : null;

  return (
    <DiagramContainer title="Заголовок блока Bitcoin (80 байт)" color="blue">
      {/* Header bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
        {HEADER_FIELDS.map((field, i) => {
          const widthPct = (field.size / totalBytes) * 100;
          const isSelected = selectedIdx === i;
          return (
            <DiagramTooltip key={i} content={field.description}>
              <div
                onClick={() => setSelectedIdx(isSelected ? null : i)}
                style={{
                  flex: `0 0 ${widthPct}%`,
                  minWidth: 0,
                  padding: '6px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isSelected ? field.color + '25' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSelected ? field.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 4,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  fontSize: 9,
                  fontFamily: 'monospace',
                  color: isSelected ? field.color : colors.textMuted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {field.nameRu}
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: colors.text,
                  fontWeight: isSelected ? 600 : 400,
                }}>
                  {field.size} B
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected ? (
        <div style={{
          ...glassStyle,
          padding: 14,
          borderLeft: `3px solid ${selected.color}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: selected.color, fontSize: 14 }}>
              {selected.nameRu} ({selected.name})
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: colors.textMuted }}>
              {selected.size} байт
            </span>
          </div>

          <div style={{ fontSize: 12, color: colors.text, marginBottom: 8 }}>
            {selected.description}
          </div>

          <div style={{
            ...glassStyle,
            padding: '6px 10px',
            fontFamily: 'monospace',
            fontSize: 11,
            color: colors.textMuted,
            wordBreak: 'break-all',
            marginBottom: 8,
          }}>
            hex: {truncHex(selected.hex, 16)}
          </div>

          <div style={{ fontSize: 11, color: colors.textMuted, fontStyle: 'italic' }}>
            Роль в PoW: {selected.role}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
          Нажмите на поле заголовка, чтобы узнать подробности
        </div>
      )}

      {/* Total */}
      <DiagramTooltip content="Заголовок блока всегда ровно 80 байт. Майнер хеширует эти 80 байт дважды (SHA-256d) и проверяет, что результат меньше target. Если да -- блок найден.">
        <div style={{
          ...glassStyle,
          padding: '8px 14px',
          marginTop: 12,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: 13,
        }}>
          <span style={{ color: colors.primary }}>80 байт</span>
          <span style={{ color: colors.textMuted }}> {'->'} SHA-256(SHA-256(header)) {'->'} </span>
          <span style={{ color: colors.success }}>Block Hash</span>
          <span style={{ color: colors.textMuted }}> (должен быть {'<'} target)</span>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  BlockChainLinkDiagram                                               */
/* ================================================================== */

interface BlockInfo {
  height: number;
  hash: string;
  prevHash: string;
  txCount: number;
  time: string;
  tooltipRu: string;
}

const CHAIN_BLOCKS: BlockInfo[] = [
  {
    height: 840000,
    hash: fnvHash('block-840000') + fnvHash('block-840000-x'),
    prevHash: fnvHash('block-839999') + fnvHash('block-839999-x'),
    txCount: 3050,
    time: '2024-04-20',
    tooltipRu: 'Блок #840000 -- четвертый халвинг Bitcoin (апрель 2024). Награда за блок уменьшилась с 6.25 до 3.125 BTC. Каждый блок содержит хеш предыдущего, создавая неразрывную цепочку.',
  },
  {
    height: 840001,
    hash: fnvHash('block-840001') + fnvHash('block-840001-x'),
    prevHash: fnvHash('block-840000') + fnvHash('block-840000-x'),
    txCount: 2812,
    time: '2024-04-20',
    tooltipRu: 'Блок #840001 содержит хеш блока #840000. Изменение любых данных в #840000 изменит его хеш, и #840001 станет невалидным. Каскадный эффект защищает всю цепочку.',
  },
  {
    height: 840002,
    hash: fnvHash('block-840002') + fnvHash('block-840002-x'),
    prevHash: fnvHash('block-840001') + fnvHash('block-840001-x'),
    txCount: 3201,
    time: '2024-04-20',
    tooltipRu: 'Блок #840002 ссылается на #840001. Чтобы изменить транзакцию в #840000, атакующему нужно пересчитать Proof-of-Work для #840000, #840001 и #840002 -- это экспоненциально сложнее.',
  },
  {
    height: 840003,
    hash: fnvHash('block-840003') + fnvHash('block-840003-x'),
    prevHash: fnvHash('block-840002') + fnvHash('block-840002-x'),
    txCount: 2955,
    time: '2024-04-20',
    tooltipRu: 'Блок #840003 -- самый новый в этой цепочке. Каждый новый блок делает предыдущие более защищенными. 6 подтверждений (~1 час) считаются практически необратимыми.',
  },
];

export function BlockChainLinkDiagram() {
  return (
    <DiagramContainer title="Цепочка блоков" color="green">
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, alignItems: 'center', minWidth: 700, padding: '8px 0' }}>
          {CHAIN_BLOCKS.map((block, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Block */}
              <DiagramTooltip content={block.tooltipRu}>
                <div
                  style={{
                    ...glassStyle,
                    padding: '10px 12px',
                    width: 150,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                    #{block.height}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.success, marginBottom: 2 }}>
                    {truncHex(block.hash, 12)}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: colors.textMuted }}>
                    prev: {truncHex(block.prevHash, 10)}
                  </div>
                  <div style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>
                    {block.txCount} tx | {block.time}
                  </div>
                </div>
              </DiagramTooltip>

              {/* Arrow */}
              {i < CHAIN_BLOCKS.length - 1 && (
                <svg width={30} height={30} viewBox="0 0 30 30" style={{ flexShrink: 0 }}>
                  <line x1={0} y1={15} x2={22} y2={15} stroke={colors.border} strokeWidth={1.5} />
                  <polygon points="22,10 30,15 22,20" fill={colors.border} />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <DiagramTooltip content="Неизменяемость блокчейна: изменение любого блока инвалидирует все последующие блоки, потому что каждый блок содержит хеш предыдущего. Чем больше подтверждений, тем выше защита.">
        <div style={{
          ...glassStyle,
          padding: 10,
          marginTop: 8,
          borderColor: `${colors.warning}30`,
          fontSize: 12,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: colors.warning }}>Неизменяемость:</strong>{' '}
          Изменение блока #{CHAIN_BLOCKS[0].height} инвалидирует все {CHAIN_BLOCKS.length} блоков в цепочке. Каждый новый блок делает предыдущие более защищёнными.
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MerkleInBlockDiagram                                                */
/* ================================================================== */

const TX_LABELS = ['tx1', 'tx2', 'tx3', 'tx4'];

function buildMiniMerkle(labels: string[]): { leaves: string[]; mid: string[]; root: string } {
  const leaves = labels.map((l) => fnvHash(l));
  const mid = [fnvHash(leaves[0] + leaves[1]), fnvHash(leaves[2] + leaves[3])];
  const root = fnvHash(mid[0] + mid[1]);
  return { leaves, mid, root };
}

interface MerkleNodeInfo {
  label: string;
  hash: string;
  tooltipRu: string;
}

export function MerkleInBlockDiagram() {
  const tree = buildMiniMerkle(TX_LABELS);

  const nodePositions: Record<string, { x: number; y: number; label: string; hash: string }> = {
    root: { x: 250, y: 30, label: 'Merkle Root', hash: tree.root },
    m0: { x: 150, y: 90, label: 'H(tx1+tx2)', hash: tree.mid[0] },
    m1: { x: 350, y: 90, label: 'H(tx3+tx4)', hash: tree.mid[1] },
    l0: { x: 80, y: 150, label: 'H(tx1)', hash: tree.leaves[0] },
    l1: { x: 200, y: 150, label: 'H(tx2)', hash: tree.leaves[1] },
    l2: { x: 300, y: 150, label: 'H(tx3)', hash: tree.leaves[2] },
    l3: { x: 420, y: 150, label: 'H(tx4)', hash: tree.leaves[3] },
  };

  const merkleLegend: MerkleNodeInfo[] = [
    { label: 'Merkle Root', hash: tree.root, tooltipRu: 'Корень дерева Меркла -- единственный хеш, записанный в заголовок блока. Он фиксирует ВСЕ транзакции блока. Изменение любой транзакции меняет root.' },
    { label: 'H(tx1+tx2)', hash: tree.mid[0], tooltipRu: 'Промежуточный узел: хеш от конкатенации H(tx1) и H(tx2). Если tx1 или tx2 изменится, этот хеш тоже изменится, и каскадом изменится root.' },
    { label: 'H(tx3+tx4)', hash: tree.mid[1], tooltipRu: 'Промежуточный узел: хеш от конкатенации H(tx3) и H(tx4). Для Merkle Proof достаточно предоставить "сестринские" хеши по пути к root.' },
    { label: 'H(tx1)', hash: tree.leaves[0], tooltipRu: 'Лист дерева: SHA-256d хеш транзакции tx1 (txid). Каждая транзакция блока представлена своим txid в виде листа дерева Меркла.' },
    { label: 'H(tx2)', hash: tree.leaves[1], tooltipRu: 'Лист дерева: SHA-256d хеш транзакции tx2. Для доказательства включения tx2 нужны: H(tx1) + H(tx3+tx4) -- это Merkle Proof из 2 хешей.' },
    { label: 'H(tx3)', hash: tree.leaves[2], tooltipRu: 'Лист дерева: SHA-256d хеш транзакции tx3. Merkle Proof позволяет проверить включение за O(log n) -- для 1000 tx нужно всего ~10 хешей.' },
    { label: 'H(tx4)', hash: tree.leaves[3], tooltipRu: 'Лист дерева: SHA-256d хеш транзакции tx4. Если число транзакций нечётное, последний лист дублируется для построения сбалансированного дерева.' },
  ];

  const edges: [string, string][] = [
    ['root', 'm0'], ['root', 'm1'],
    ['m0', 'l0'], ['m0', 'l1'],
    ['m1', 'l2'], ['m1', 'l3'],
  ];

  return (
    <DiagramContainer title="Дерево Меркла в блоке" color="purple">
      {/* Block header representation */}
      <div style={{
        ...glassStyle,
        padding: '8px 12px',
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 8,
      }}>
        {['Version', 'Prev Hash', 'Merkle Root', 'Time', 'nBits', 'Nonce'].map((field) => (
          <DiagramTooltip key={field} content={
            field === 'Merkle Root'
              ? 'Merkle Root -- единственное поле заголовка, связанное с содержимым блока. Остальные 5 полей описывают метаданные блока.'
              : `${field} -- одно из 6 полей 80-байтового заголовка блока.`
          }>
            <span
              style={{
                padding: '3px 8px',
                fontSize: 10,
                fontFamily: 'monospace',
                borderRadius: 4,
                background: field === 'Merkle Root' ? `${colors.accent}25` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${field === 'Merkle Root' ? colors.accent : 'rgba(255,255,255,0.1)'}`,
                color: field === 'Merkle Root' ? colors.accent : colors.textMuted,
                fontWeight: field === 'Merkle Root' ? 600 : 400,
              }}
            >
              {field}
            </span>
          </DiagramTooltip>
        ))}
      </div>

      {/* Arrow from header to tree root */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <svg width={20} height={20} viewBox="0 0 20 20">
          <line x1={10} y1={0} x2={10} y2={14} stroke={colors.accent} strokeWidth={1.5} />
          <polygon points="6,14 10,20 14,14" fill={colors.accent} />
        </svg>
      </div>

      {/* Merkle tree SVG (static, no hover) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={500} height={200} viewBox="0 0 500 200">
          {/* Edges */}
          {edges.map(([from, to], i) => {
            const f = nodePositions[from];
            const t = nodePositions[to];
            return (
              <line
                key={i}
                x1={f.x} y1={f.y + 15}
                x2={t.x} y2={t.y - 5}
                stroke={colors.border}
                strokeWidth={1}
                opacity={0.5}
              />
            );
          })}

          {/* Nodes (static) */}
          {Object.entries(nodePositions).map(([id, node]) => {
            const isRoot = id === 'root';
            const nodeColor = isRoot ? colors.accent : id.startsWith('m') ? colors.primary : colors.success;

            return (
              <g key={id}>
                <rect
                  x={node.x - 45}
                  y={node.y - 12}
                  width={90}
                  height={30}
                  rx={6}
                  fill="rgba(255,255,255,0.05)"
                  stroke={colors.border}
                  strokeWidth={1}
                />
                <text
                  x={node.x}
                  y={node.y - 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={nodeColor}
                  fontSize={9}
                  fontFamily="monospace"
                >
                  {node.label}
                </text>
                <text
                  x={node.x}
                  y={node.y + 11}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize={9}
                  fontFamily="monospace"
                >
                  {truncHex(node.hash)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* HTML Merkle legend with DiagramTooltip (replaces SVG hover + conditional DataBox) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 6,
        marginTop: 8,
      }}>
        {merkleLegend.map((node) => (
          <DiagramTooltip key={node.label} content={node.tooltipRu}>
            <div style={{
              ...glassStyle,
              padding: '6px 8px',
              textAlign: 'center',
              borderColor: node.label === 'Merkle Root' ? `${colors.accent}30` : 'rgba(255,255,255,0.08)',
            }}>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: node.label === 'Merkle Root' ? colors.accent : node.label.startsWith('H(tx') && !node.label.includes('+') ? colors.success : colors.primary,
              }}>
                {node.label}
              </div>
              <div style={{ fontSize: 9, fontFamily: 'monospace', color: colors.textMuted }}>
                {truncHex(node.hash)}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Reference to Phase 2 */}
      <div style={{
        ...glassStyle,
        padding: '8px 14px',
        marginTop: 8,
        textAlign: 'center',
        fontSize: 12,
        color: colors.textMuted,
      }}>
        Подробнее о деревьях Меркла: CRYPTO-13 (построение) и CRYPTO-14 (Merkle Proof)
      </div>
    </DiagramContainer>
  );
}
