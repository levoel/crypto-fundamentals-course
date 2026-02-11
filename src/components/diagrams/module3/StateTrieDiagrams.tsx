/**
 * State Trie Diagrams (ETH-03)
 *
 * Exports:
 * - MPTVisualizationDiagram: Interactive MPT with account insertion (history array, step-through)
 * - FourTriesDiagram: Relationship between 4 tries (static with DiagramTooltip)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

/** FNV-1a hash producing 8 hex chars */
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

/** Two-round FNV for 16 hex chars */
function fnvHash16(input: string): string {
  const h1 = fnvHash(input);
  const h2 = fnvHash(input + ':2');
  return h1 + h2;
}

function truncHex(s: string, len = 8): string {
  return s.length > len ? s.slice(0, len) + '...' : s;
}

function btnStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    ...glassStyle,
    padding: '8px 16px',
    cursor: active ? 'pointer' : 'not-allowed',
    color: active ? accentColor : colors.textMuted,
    fontSize: 13,
    opacity: active ? 1 : 0.5,
    border: `1px solid ${active ? accentColor + '50' : colors.border}`,
    borderRadius: 8,
    background: active ? accentColor + '10' : 'rgba(255,255,255,0.03)',
  };
}

/* ================================================================== */
/*  MPTVisualizationDiagram                                             */
/* ================================================================== */

/**
 * Simplified MPT visualization with step-through.
 * Uses a conceptual node-based layout rather than full hex nibble paths.
 */

interface MPTNode {
  id: string;
  type: 'branch' | 'extension' | 'leaf';
  label: string;
  detail: string;
  x: number;
  y: number;
  highlighted?: boolean;
  dimmed?: boolean;
}

interface MPTEdge {
  from: string;
  to: string;
  label?: string;
  highlighted?: boolean;
  dimmed?: boolean;
}

interface MPTStep {
  title: string;
  description: string;
  nodes: MPTNode[];
  edges: MPTEdge[];
  stateRoot: string;
}

const NODE_COLORS: Record<string, string> = {
  branch: '#a855f7',
  extension: colors.primary,
  leaf: colors.success,
};

const NODE_W = 80;
const NODE_H = 36;
const SVG_W = 600;
const SVG_H = 300;

// Step 0: Initial trie with 4 accounts
const STEP_0_NODES: MPTNode[] = [
  { id: 'root', type: 'branch', label: 'Root', detail: 'Branch node: 16 слотов (nibble 0-f) + value', x: 300, y: 30 },
  { id: 'ext-a', type: 'extension', label: 'Ext: a3..', detail: 'Extension: общий префикс a3 для Alice и Contract1', x: 150, y: 100 },
  { id: 'ext-b', type: 'extension', label: 'Ext: b7..', detail: 'Extension: общий префикс b7 для Bob и Contract2', x: 450, y: 100 },
  { id: 'br-a', type: 'branch', label: 'Branch', detail: 'Branch node: разветвление по следующему nibble', x: 150, y: 170 },
  { id: 'leaf-alice', type: 'leaf', label: 'Alice', detail: 'Leaf: 0xa3f1... nonce=2, balance=8.98 ETH', x: 80, y: 250 },
  { id: 'leaf-c1', type: 'leaf', label: 'Contract1', detail: 'Leaf: 0xa3c2... nonce=0, balance=0, codeHash=0x7f9a...', x: 220, y: 250 },
  { id: 'br-b', type: 'branch', label: 'Branch', detail: 'Branch node: разветвление по следующему nibble', x: 450, y: 170 },
  { id: 'leaf-bob', type: 'leaf', label: 'Bob', detail: 'Leaf: 0xb71e... nonce=0, balance=1 ETH', x: 380, y: 250 },
  { id: 'leaf-c2', type: 'leaf', label: 'Contract2', detail: 'Leaf: 0xb7d4... nonce=0, balance=0, codeHash=0xa2b1...', x: 520, y: 250 },
];

const STEP_0_EDGES: MPTEdge[] = [
  { from: 'root', to: 'ext-a', label: 'a' },
  { from: 'root', to: 'ext-b', label: 'b' },
  { from: 'ext-a', to: 'br-a' },
  { from: 'br-a', to: 'leaf-alice', label: 'f' },
  { from: 'br-a', to: 'leaf-c1', label: 'c' },
  { from: 'ext-b', to: 'br-b' },
  { from: 'br-b', to: 'leaf-bob', label: '1' },
  { from: 'br-b', to: 'leaf-c2', label: 'd' },
];

// Step 1: Highlight path to Alice
const STEP_1_NODES: MPTNode[] = STEP_0_NODES.map((n) => ({
  ...n,
  highlighted: ['root', 'ext-a', 'br-a', 'leaf-alice'].includes(n.id),
  dimmed: !['root', 'ext-a', 'br-a', 'leaf-alice'].includes(n.id),
}));

const STEP_1_EDGES: MPTEdge[] = STEP_0_EDGES.map((e) => ({
  ...e,
  highlighted: ['root->ext-a', 'ext-a->br-a', 'br-a->leaf-alice'].includes(`${e.from}->${e.to}`),
  dimmed: !['root->ext-a', 'ext-a->br-a', 'br-a->leaf-alice'].includes(`${e.from}->${e.to}`),
}));

// Step 2: Insert Dave -- trie restructuring
const STEP_2_NODES: MPTNode[] = [
  { id: 'root', type: 'branch', label: 'Root', detail: 'Branch node: теперь 3 слота заняты (a, b, d)', x: 300, y: 30, highlighted: true },
  { id: 'ext-a', type: 'extension', label: 'Ext: a3..', detail: 'Extension: общий префикс a3 (без изменений)', x: 120, y: 100 },
  { id: 'ext-b', type: 'extension', label: 'Ext: b7..', detail: 'Extension: общий префикс b7 (без изменений)', x: 370, y: 100 },
  { id: 'leaf-dave', type: 'leaf', label: 'Dave', detail: 'Leaf: 0xd5e2... nonce=0, balance=5 ETH (НОВЫЙ)', x: 530, y: 100, highlighted: true },
  { id: 'br-a', type: 'branch', label: 'Branch', detail: 'Branch node: без изменений', x: 120, y: 170 },
  { id: 'leaf-alice', type: 'leaf', label: 'Alice', detail: 'Leaf: 0xa3f1... без изменений', x: 50, y: 250 },
  { id: 'leaf-c1', type: 'leaf', label: 'Contract1', detail: 'Leaf: 0xa3c2... без изменений', x: 190, y: 250 },
  { id: 'br-b', type: 'branch', label: 'Branch', detail: 'Branch node: без изменений', x: 370, y: 170 },
  { id: 'leaf-bob', type: 'leaf', label: 'Bob', detail: 'Leaf: 0xb71e... без изменений', x: 300, y: 250 },
  { id: 'leaf-c2', type: 'leaf', label: 'Contract2', detail: 'Leaf: 0xb7d4... без изменений', x: 440, y: 250 },
];

const STEP_2_EDGES: MPTEdge[] = [
  { from: 'root', to: 'ext-a', label: 'a' },
  { from: 'root', to: 'ext-b', label: 'b' },
  { from: 'root', to: 'leaf-dave', label: 'd', highlighted: true },
  { from: 'ext-a', to: 'br-a' },
  { from: 'br-a', to: 'leaf-alice', label: 'f' },
  { from: 'br-a', to: 'leaf-c1', label: 'c' },
  { from: 'ext-b', to: 'br-b' },
  { from: 'br-b', to: 'leaf-bob', label: '1' },
  { from: 'br-b', to: 'leaf-c2', label: 'd' },
];

// Step 3: New state root
const STEP_3_NODES: MPTNode[] = STEP_2_NODES.map((n) => ({
  ...n,
  highlighted: n.id === 'root',
  dimmed: false,
}));
const STEP_3_EDGES: MPTEdge[] = STEP_2_EDGES.map((e) => ({ ...e, highlighted: false, dimmed: false }));

const MPT_STEPS: MPTStep[] = [
  {
    title: 'Шаг 0: Начальный MPT (4 аккаунта)',
    description: 'Trie содержит 4 аккаунта: Alice, Bob, Contract1, Contract2. Каждый адрес хешируется (keccak256) и используется как ключ в trie. Типы узлов: Branch (фиолетовый), Extension (синий), Leaf (зеленый).',
    nodes: STEP_0_NODES,
    edges: STEP_0_EDGES,
    stateRoot: fnvHash16('mpt-root-step-0'),
  },
  {
    title: 'Шаг 1: Поиск аккаунта Alice',
    description: 'Путь: Root -> nibble "a" -> Extension "a3" -> Branch -> nibble "f" -> Leaf (Alice). Nibble-путь = первые символы keccak256(address). Проходим дерево сверху вниз, сравнивая nibble за nibble.',
    nodes: STEP_1_NODES,
    edges: STEP_1_EDGES,
    stateRoot: fnvHash16('mpt-root-step-0'),
  },
  {
    title: 'Шаг 2: Вставка нового аккаунта Dave',
    description: 'Адрес Dave начинается с nibble "d" -- такого слота в Root еще нет. Новый Leaf добавляется прямо к Root по слоту "d". Если бы путь пересекался с существующим, потребовалось бы разбить Leaf на Extension + Branch.',
    nodes: STEP_2_NODES,
    edges: STEP_2_EDGES,
    stateRoot: fnvHash16('mpt-root-step-2'),
  },
  {
    title: 'Шаг 3: Новый State Root',
    description: 'ЛЮБОЕ изменение аккаунта (вставка, обновление balance/nonce) приводит к пересчету хешей от измененного Leaf до Root. Новый State Root != старый. Это свойство Merkle-подобных деревьев гарантирует целостность.',
    nodes: STEP_3_NODES,
    edges: STEP_3_EDGES,
    stateRoot: fnvHash16('mpt-root-step-2'),
  },
];

function findNode(nodes: MPTNode[], id: string): MPTNode | undefined {
  return nodes.find((n) => n.id === id);
}

export function MPTVisualizationDiagram() {
  const [step, setStep] = useState(0);

  const current = MPT_STEPS[step];

  return (
    <DiagramContainer title="Modified Merkle Patricia Trie" color="green">
      {/* Step info */}
      <DiagramTooltip content={current.description}>
        <div style={{
          ...glassStyle,
          padding: '10px 14px',
          marginBottom: 12,
          borderLeft: `3px solid ${colors.success}`,
        }}>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 4 }}>
            {current.title}
          </div>
          <div style={{ color: colors.textMuted, fontSize: 12, lineHeight: 1.5 }}>
            {current.description}
          </div>
        </div>
      </DiagramTooltip>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 8, fontSize: 11 }}>
        {[
          { type: 'branch', label: 'Branch (16 детей + value)', color: NODE_COLORS.branch, tooltip: 'Branch node: 17 элементов (16 children для hex nibbles 0-F + value). Развилка в trie. Путь определяется hex-encoded key.' },
          { type: 'extension', label: 'Extension (общий префикс)', color: NODE_COLORS.extension, tooltip: 'Extension node: сжатие общего prefix. Содержит shared nibbles + ссылку на следующий node. Оптимизация: уменьшает глубину дерева.' },
          { type: 'leaf', label: 'Leaf (ключ + значение)', color: NODE_COLORS.leaf, tooltip: 'Leaf node: конечный узел с оставшимся key suffix + value. Содержит account data (nonce, balance, storageRoot, codeHash).' },
        ].map((item) => (
          <DiagramTooltip key={item.type} content={item.tooltip}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div style={{
                width: 10, height: 10, borderRadius: 3,
                background: item.color + '30', border: `1.5px solid ${item.color}`,
              }} />
              <span style={{ color: colors.textMuted, fontFamily: 'monospace' }}>{item.label}</span>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* SVG Trie */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
          <defs>
            <marker id="mpt-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={colors.border} />
            </marker>
          </defs>

          {/* Edges */}
          {current.edges.map((edge, i) => {
            const fromNode = findNode(current.nodes, edge.from);
            const toNode = findNode(current.nodes, edge.to);
            if (!fromNode || !toNode) return null;
            const x1 = fromNode.x;
            const y1 = fromNode.y + NODE_H / 2;
            const x2 = toNode.x;
            const y2 = toNode.y - NODE_H / 2;
            const edgeColor = edge.highlighted ? '#22c55e' : colors.border;
            const edgeOpacity = edge.dimmed ? 0.15 : edge.highlighted ? 0.9 : 0.4;

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={edgeColor} strokeWidth={edge.highlighted ? 2 : 1.5}
                  strokeDasharray={edge.highlighted ? 'none' : '5,3'}
                  markerEnd="url(#mpt-arrow)"
                  opacity={edgeOpacity}
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2 + (x2 > x1 ? -10 : 10)}
                    y={(y1 + y2) / 2}
                    fill={edge.highlighted ? '#22c55e' : colors.textMuted}
                    fontSize={10}
                    fontFamily="monospace"
                    fontWeight={edge.highlighted ? 700 : 400}
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes (no hover handlers) */}
          {current.nodes.map((node) => {
            const nodeColor = NODE_COLORS[node.type];
            const opacity = node.dimmed ? 0.25 : 1;
            const strokeW = node.highlighted ? 2.5 : 1;
            const fillOpacity = node.highlighted ? '30' : '10';

            return (
              <g
                key={node.id}
                style={{ transition: 'opacity 300ms ease' }}
                opacity={opacity}
              >
                <rect
                  x={node.x - NODE_W / 2}
                  y={node.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={6}
                  fill={nodeColor + fillOpacity}
                  stroke={nodeColor}
                  strokeWidth={strokeW}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={nodeColor}
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight={node.highlighted ? 700 : 500}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* State root */}
      <div style={{
        ...glassStyle,
        padding: '6px 14px',
        textAlign: 'center',
        fontFamily: 'monospace',
        fontSize: 12,
        marginTop: 8,
      }}>
        <span style={{ color: colors.textMuted }}>State Root: </span>
        <span style={{ color: '#22c55e', fontWeight: 600 }}>0x{truncHex(current.stateRoot, 16)}</span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button onClick={() => setStep(0)} style={btnStyle(true, colors.text)}>
          Сброс
        </button>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={btnStyle(step > 0, colors.text)}
        >
          Назад
        </button>
        <button
          onClick={() => setStep((s) => Math.min(MPT_STEPS.length - 1, s + 1))}
          disabled={step >= MPT_STEPS.length - 1}
          style={btnStyle(step < MPT_STEPS.length - 1, colors.success)}
        >
          Далее
        </button>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {MPT_STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i === step ? colors.success : 'rgba(255,255,255,0.15)',
              border: `1px solid ${i === step ? colors.success : colors.border}`,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  FourTriesDiagram                                                    */
/* ================================================================== */

interface TrieInfo {
  id: string;
  name: string;
  key: string;
  value: string;
  scope: string;
  rootField: string;
  description: string;
  color: string;
  x: number;
  y: number;
}

const FOUR_TRIES: TrieInfo[] = [
  {
    id: 'state',
    name: 'State Trie',
    key: 'keccak256(address)',
    value: 'rlp([nonce, balance, storageRoot, codeHash])',
    scope: 'Глобальный (один на всю сеть)',
    rootField: 'stateRoot',
    description: 'Хранит состояние всех ~280M аккаунтов Ethereum. Обновляется каждым блоком при изменении любого аккаунта. State root в заголовке блока.',
    color: colors.success,
    x: 80, y: 180,
  },
  {
    id: 'storage',
    name: 'Storage Trie',
    key: 'keccak256(slot)',
    value: 'rlp(value)',
    scope: 'Per-contract (один на каждый контракт)',
    rootField: 'storageRoot (в аккаунте)',
    description: 'У каждого контракта свой storage trie. Ключ = keccak256(номер слота). Значение = содержимое слота. Корень хранится в поле storageRoot аккаунта.',
    color: '#f59e0b',
    x: 230, y: 180,
  },
  {
    id: 'transaction',
    name: 'Transaction Trie',
    key: 'tx_index (RLP)',
    value: 'rlp(transaction)',
    scope: 'Per-block (один на блок)',
    rootField: 'transactionsRoot',
    description: 'Содержит все транзакции блока. Ключ = индекс транзакции. Построено один раз при создании блока и никогда не изменяется.',
    color: colors.primary,
    x: 380, y: 180,
  },
  {
    id: 'receipt',
    name: 'Receipt Trie',
    key: 'tx_index (RLP)',
    value: 'rlp(receipt)',
    scope: 'Per-block (один на блок)',
    rootField: 'receiptsRoot',
    description: 'Содержит receipt каждой транзакции блока: status, gasUsed, logs (events). Ключ = индекс транзакции. Неизменяемый.',
    color: '#e879f9',
    x: 530, y: 180,
  },
];

export function FourTriesDiagram() {
  return (
    <DiagramContainer title="Четыре дерева Ethereum" color="blue">
      {/* Block header */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={600} height={300} viewBox="0 0 600 300">
          <defs>
            <marker id="four-tries-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill={colors.border} />
            </marker>
          </defs>

          {/* Block header box */}
          <rect x={150} y={20} width={300} height={100} rx={10}
            fill="rgba(255,255,255,0.05)" stroke={colors.border} strokeWidth={1.5} />
          <text x={300} y={45} textAnchor="middle" fill={colors.text} fontSize={13} fontFamily="monospace" fontWeight={600}>
            Block Header
          </text>

          {/* Header fields */}
          {[
            { label: 'stateRoot', color: colors.success, x: 200, y: 68 },
            { label: 'transactionsRoot', color: colors.primary, x: 200, y: 88 },
            { label: 'receiptsRoot', color: '#e879f9', x: 200, y: 108 },
          ].map((field) => (
            <text key={field.label} x={field.x} y={field.y} fill={field.color} fontSize={10} fontFamily="monospace">
              {field.label}: 0x{fnvHash(field.label).slice(0, 8)}...
            </text>
          ))}

          {/* Arrows from header to tries */}
          {FOUR_TRIES.map((trie) => {
            const fromX = trie.id === 'state' || trie.id === 'storage' ? 250 : 400;
            const fromY = 120;
            return (
              <line
                key={`arrow-${trie.id}`}
                x1={fromX} y1={fromY}
                x2={trie.x} y2={trie.y - 25}
                stroke={trie.color} strokeWidth={1.5} strokeDasharray="5,3"
                markerEnd="url(#four-tries-arrow)" opacity={0.5}
              />
            );
          })}

          {/* Storage trie relationship arrow */}
          <path
            d="M 140 230 C 100 230, 100 180, 200 180"
            fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,3" opacity={0.5}
          />
          <text x={70} y={210} fill="#f59e0b" fontSize={8} fontFamily="monospace">
            storageRoot
          </text>

          {/* Trie boxes (no hover handlers) */}
          {FOUR_TRIES.map((trie) => {
            const bw = 110;
            const bh = 55;
            return (
              <g key={trie.id}>
                <rect
                  x={trie.x - bw / 2}
                  y={trie.y - bh / 2}
                  width={bw}
                  height={bh}
                  rx={8}
                  fill="rgba(255,255,255,0.05)"
                  stroke={colors.border}
                  strokeWidth={1}
                />
                <text
                  x={trie.x}
                  y={trie.y - 6}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize={11}
                  fontFamily="monospace"
                  fontWeight={600}
                >
                  {trie.name}
                </text>
                <text
                  x={trie.x}
                  y={trie.y + 10}
                  textAnchor="middle"
                  fill={colors.textMuted}
                  fontSize={8}
                  fontFamily="monospace"
                >
                  {trie.scope}
                </text>
              </g>
            );
          })}

          {/* Bottom labels */}
          <text x={155} y={290} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
            Модифицируется
          </text>
          <text x={155} y={300} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
            каждым блоком
          </text>
          <text x={455} y={290} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
            Неизменяемые
          </text>
          <text x={455} y={300} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
            per-block
          </text>
        </svg>
      </div>

      {/* HTML trie cards below SVG with DiagramTooltip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 8,
      }}>
        {FOUR_TRIES.map((trie) => (
          <DiagramTooltip key={trie.id} content={trie.description}>
            <div style={{
              ...glassStyle,
              padding: '10px 12px',
              borderLeft: `3px solid ${trie.color}`,
              cursor: 'pointer',
            }}>
              <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: trie.color, marginBottom: 4 }}>
                {trie.name}
              </div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.textMuted }}>
                <div>Key: {trie.key}</div>
                <div>Root: {trie.rootField}</div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>
    </DiagramContainer>
  );
}
