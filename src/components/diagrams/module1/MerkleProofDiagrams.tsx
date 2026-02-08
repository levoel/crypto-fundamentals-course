/**
 * Merkle Proof Diagrams
 *
 * Exports:
 * - MerkleProofAnimation: Step-through proof path highlighting from leaf to root
 * - MerkleProofVerificationDiagram: Step-through verification with hash computation
 * - MerkleProofEfficiencyDiagram: O(log n) vs O(n) comparison with Bitcoin example
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Hash helpers (same as MerkleTreeDiagrams)                           */
/* ================================================================== */

function simpleHash(input: string): string {
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

function hashConcat(a: string, b: string): string {
  return simpleHash(a + b);
}

function buildTree(txLabels: string[]): string[][] {
  const leaves = txLabels.map(tx => simpleHash(tx));
  const levels: string[][] = [leaves];
  let current = leaves;
  while (current.length > 1) {
    if (current.length % 2 === 1) {
      current = [...current, current[current.length - 1]];
    }
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(hashConcat(current[i], current[i + 1]));
    }
    levels.push(next);
    current = next;
  }
  return levels;
}

/* ================================================================== */
/*  Proof computation helpers                                           */
/* ================================================================== */

interface ProofElement {
  hash: string;
  direction: 'left' | 'right';
  level: number;
  siblingIndex: number;
}

function getMerkleProof(tree: string[][], leafIndex: number): ProofElement[] {
  const proof: ProofElement[] = [];
  let idx = leafIndex;

  for (let lvl = 0; lvl < tree.length - 1; lvl++) {
    const level = tree[lvl];
    if (idx % 2 === 0) {
      const sibIdx = idx + 1;
      if (sibIdx < level.length) {
        proof.push({ hash: level[sibIdx], direction: 'right', level: lvl, siblingIndex: sibIdx });
      }
    } else {
      const sibIdx = idx - 1;
      proof.push({ hash: level[sibIdx], direction: 'left', level: lvl, siblingIndex: sibIdx });
    }
    idx = Math.floor(idx / 2);
  }

  return proof;
}

function verifyProof(leafHash: string, proof: ProofElement[], root: string): { steps: string[]; valid: boolean } {
  const steps: string[] = [];
  let current = leafHash;
  steps.push(`Start: ${current}`);

  for (const elem of proof) {
    if (elem.direction === 'right') {
      const next = hashConcat(current, elem.hash);
      steps.push(`H(${current.slice(0, 8)} || ${elem.hash.slice(0, 8)}) = ${next.slice(0, 8)}`);
      current = next;
    } else {
      const next = hashConcat(elem.hash, current);
      steps.push(`H(${elem.hash.slice(0, 8)} || ${current.slice(0, 8)}) = ${next.slice(0, 8)}`);
      current = next;
    }
  }

  const valid = current === root;
  steps.push(`Computed root: ${current}`);
  steps.push(`Known root:    ${root}`);
  steps.push(valid ? 'VALID' : 'INVALID');

  return { steps, valid };
}

/* ================================================================== */
/*  Button style helper                                                 */
/* ================================================================== */

function btnStyle(active: boolean, color: string): React.CSSProperties {
  return {
    ...glassStyle,
    padding: '8px 16px',
    cursor: active ? 'pointer' : 'not-allowed',
    color: active ? color : colors.textMuted,
    fontSize: 13,
    opacity: active ? 1 : 0.5,
    border: `1px solid ${active ? color + '50' : colors.border}`,
    borderRadius: 8,
    background: active ? color + '10' : 'rgba(255,255,255,0.03)',
  };
}

/* ================================================================== */
/*  SVG Tree with Proof Highlighting                                    */
/* ================================================================== */

const PROOF_TX = ['tx1', 'tx2', 'tx3', 'tx4', 'tx5', 'tx6', 'tx7', 'tx8'];
const PROOF_TREE = buildTree(PROOF_TX);
const PROOF_ROOT = PROOF_TREE[PROOF_TREE.length - 1][0];

interface ProofSVGProps {
  tree: string[][];
  txLabels: string[];
  targetLeaf: number;
  step: number; // 0 = highlight leaf, 1+ = highlight proof elements
  proof: ProofElement[];
  width?: number;
  height?: number;
}

function ProofTreeSVG({ tree, txLabels, targetLeaf, step, proof, width = 700, height = 340 }: ProofSVGProps) {
  const totalLevels = tree.length;
  const levelHeight = height / (totalLevels + 0.5);
  const nodeWidth = 72;
  const nodeHeight = 32;

  // Build set of highlighted nodes
  const pathNodes = new Set<string>(); // nodes on verification path
  const proofNodes = new Set<string>(); // sibling proof elements

  // Target leaf is always highlighted if step >= 0
  if (step >= 0) {
    pathNodes.add(`0-${targetLeaf}`);
  }

  // Walk up the path for each completed step
  let idx = targetLeaf;
  for (let s = 0; s < Math.min(step, proof.length); s++) {
    const elem = proof[s];
    proofNodes.add(`${elem.level}-${elem.siblingIndex}`);
    const parentIdx = Math.floor(idx / 2);
    pathNodes.add(`${elem.level + 1}-${parentIdx}`);
    idx = parentIdx;
  }

  // Calculate node positions
  const positions: { x: number; y: number; hash: string; level: number; index: number }[][] = [];
  for (let lvl = 0; lvl < totalLevels; lvl++) {
    const nodesInLevel = tree[lvl].length;
    const yPos = height - (lvl + 1) * levelHeight;
    const spacing = width / (nodesInLevel + 1);
    const levelPositions: typeof positions[0] = [];
    for (let i = 0; i < nodesInLevel; i++) {
      levelPositions.push({ x: spacing * (i + 1), y: yPos, hash: tree[lvl][i], level: lvl, index: i });
    }
    positions.push(levelPositions);
  }

  const getColor = (lvl: number, i: number): string => {
    const key = `${lvl}-${i}`;
    if (proofNodes.has(key)) return colors.warning; // orange for proof elements
    if (pathNodes.has(key)) return colors.success;  // green for path
    return colors.textMuted;
  };

  const getOpacity = (lvl: number, i: number): number => {
    const key = `${lvl}-${i}`;
    if (pathNodes.has(key) || proofNodes.has(key)) return 1;
    return 0.25;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: height }}>
      {/* Lines */}
      {positions.map((levelPos, lvl) => {
        if (lvl === 0) return null;
        const childLevel = positions[lvl - 1];
        return levelPos.map((parent, pi) => {
          const li = pi * 2;
          const ri = pi * 2 + 1;
          const left = childLevel[li];
          const right = childLevel[ri];
          if (!left) return null;

          const pKey = `${lvl}-${pi}`;
          const lKey = `${lvl - 1}-${li}`;
          const rKey = ri < childLevel.length ? `${lvl - 1}-${ri}` : null;

          const lActive = (pathNodes.has(pKey) || proofNodes.has(pKey)) && (pathNodes.has(lKey) || proofNodes.has(lKey));
          const rActive = rKey && (pathNodes.has(pKey) || proofNodes.has(pKey)) && (pathNodes.has(rKey) || proofNodes.has(rKey));

          return (
            <g key={`l-${lvl}-${pi}`}>
              <line
                x1={parent.x} y1={parent.y + nodeHeight / 2}
                x2={left.x} y2={left.y - nodeHeight / 2}
                stroke={lActive ? colors.success : colors.text}
                strokeWidth={lActive ? 1.5 : 0.7}
                opacity={lActive ? 0.8 : 0.1}
              />
              {right && (
                <line
                  x1={parent.x} y1={parent.y + nodeHeight / 2}
                  x2={right.x} y2={right.y - nodeHeight / 2}
                  stroke={rActive ? colors.success : colors.text}
                  strokeWidth={rActive ? 1.5 : 0.7}
                  opacity={rActive ? 0.8 : 0.1}
                />
              )}
            </g>
          );
        });
      })}

      {/* Nodes */}
      {positions.map((levelPos, lvl) =>
        levelPos.map((node, i) => {
          const key = `${lvl}-${i}`;
          const nc = getColor(lvl, i);
          const op = getOpacity(lvl, i);
          const isRoot = lvl === totalLevels - 1;

          return (
            <g key={key} opacity={op} style={{ transition: 'opacity 400ms ease' }}>
              <rect
                x={node.x - nodeWidth / 2} y={node.y - nodeHeight / 2}
                width={nodeWidth} height={nodeHeight} rx={6}
                fill={nc + '18'} stroke={nc} strokeWidth={isRoot ? 2 : 1}
              />
              <text
                x={node.x} y={node.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill={nc} fontSize={10} fontFamily="monospace"
              >
                {node.hash.slice(0, 8)}
              </text>
              {lvl === 0 && txLabels[i] && (
                <text
                  x={node.x} y={node.y + nodeHeight / 2 + 14}
                  textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace"
                >
                  {txLabels[i]}
                </text>
              )}
              {isRoot && (
                <text
                  x={node.x} y={node.y - nodeHeight / 2 - 8}
                  textAnchor="middle" fill={'#a855f7'} fontSize={11} fontWeight={600}
                >
                  Merkle Root
                </text>
              )}
              {/* Proof element marker */}
              {proofNodes.has(key) && (
                <text
                  x={node.x + nodeWidth / 2 + 4}
                  y={node.y + 4}
                  fill={colors.warning}
                  fontSize={9}
                  fontWeight={600}
                >
                  proof
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

/* ================================================================== */
/*  MerkleProofAnimation                                                */
/* ================================================================== */

/**
 * MerkleProofAnimation -- Step-through proof path from leaf to root.
 * User selects which leaf to prove, then steps through sibling collection.
 */
export function MerkleProofAnimation() {
  const [targetLeaf, setTargetLeaf] = useState(2); // default: tx3 (index 2)
  const [step, setStep] = useState(0);

  const proof = getMerkleProof(PROOF_TREE, targetLeaf);
  const maxStep = proof.length; // 3 steps for 8-leaf tree

  const stepDescriptions = [
    `Выделяем целевой лист: ${PROOF_TX[targetLeaf]} (хеш: ${PROOF_TREE[0][targetLeaf].slice(0, 8)}...)`,
    ...proof.map((elem, i) => {
      const dir = elem.direction === 'right' ? 'справа' : 'слева';
      return `Шаг ${i + 1}: Сохраняем соседний хеш ${dir}: ${elem.hash.slice(0, 8)}... (proof element ${i + 1})`;
    }),
  ];

  const handleLeafChange = (newLeaf: number) => {
    setTargetLeaf(newLeaf);
    setStep(0);
  };

  return (
    <DiagramContainer title="Merkle Proof: путь от листа к корню" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Leaf selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: colors.textMuted }}>Доказать лист:</span>
          {PROOF_TX.map((tx, i) => (
            <button
              key={i}
              onClick={() => handleLeafChange(i)}
              style={{
                ...glassStyle,
                padding: '4px 10px',
                fontSize: 12,
                fontFamily: 'monospace',
                cursor: 'pointer',
                color: i === targetLeaf ? colors.success : colors.textMuted,
                border: `1px solid ${i === targetLeaf ? colors.success + '60' : colors.border}`,
                background: i === targetLeaf ? colors.success + '15' : 'transparent',
                borderRadius: 6,
              }}
            >
              {tx}
            </button>
          ))}
        </div>

        {/* Step description */}
        <DataBox
          label={`Шаг ${step} / ${maxStep}`}
          value={stepDescriptions[step] || 'Proof построен!'}
          variant="highlight"
        />

        {/* Tree with proof highlighting */}
        <ProofTreeSVG
          tree={PROOF_TREE}
          txLabels={PROOF_TX}
          targetLeaf={targetLeaf}
          step={step}
          proof={proof}
        />

        {/* Proof elements collected so far */}
        {step > 0 && (
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Собранные элементы proof ({Math.min(step, proof.length)} / {proof.length})
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {proof.slice(0, step).map((elem, i) => (
                <div
                  key={i}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: colors.warning + '15',
                    border: `1px solid ${colors.warning}40`,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: colors.warning,
                  }}
                >
                  ({elem.hash.slice(0, 8)}, "{elem.direction}")
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setStep(0)} style={btnStyle(true, colors.text)}>
            Сброс
          </button>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            style={btnStyle(step > 0, colors.text)}
          >
            Назад
          </button>
          <button
            onClick={() => setStep(s => Math.min(maxStep, s + 1))}
            style={btnStyle(step < maxStep, colors.primary)}
          >
            Далее
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          <span style={{ color: colors.success }}>Зеленые</span> = путь верификации,{' '}
          <span style={{ color: colors.warning }}>оранжевые</span> = элементы proof
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MerkleProofVerificationDiagram                                      */
/* ================================================================== */

const VERIFY_LEAF = 2; // tx3
const VERIFY_PROOF = getMerkleProof(PROOF_TREE, VERIFY_LEAF);
const VERIFY_LEAF_HASH = PROOF_TREE[0][VERIFY_LEAF];
const VERIFY_RESULT = verifyProof(VERIFY_LEAF_HASH, VERIFY_PROOF, PROOF_ROOT);

/**
 * MerkleProofVerificationDiagram -- Step-through verification.
 * Shows each hash computation from leaf up to root comparison.
 */
export function MerkleProofVerificationDiagram() {
  const [step, setStep] = useState(0);

  // Steps: 0 = start (show leaf hash), 1..proof.length = compute each level, last = compare
  const totalSteps = VERIFY_PROOF.length + 1; // +1 for final comparison

  // Build computation steps
  const computations: { label: string; current: string; proofElem?: string; direction?: string; result?: string }[] = [];

  let current = VERIFY_LEAF_HASH;
  computations.push({
    label: `Начинаем с хеша листа: ${PROOF_TX[VERIFY_LEAF]}`,
    current,
  });

  for (const elem of VERIFY_PROOF) {
    const prev = current;
    if (elem.direction === 'right') {
      current = hashConcat(prev, elem.hash);
      computations.push({
        label: `Конкатенируем справа: H(current || proof)`,
        current: prev,
        proofElem: elem.hash,
        direction: 'right',
        result: current,
      });
    } else {
      current = hashConcat(elem.hash, prev);
      computations.push({
        label: `Конкатенируем слева: H(proof || current)`,
        current: prev,
        proofElem: elem.hash,
        direction: 'left',
        result: current,
      });
    }
  }

  // Final comparison
  computations.push({
    label: 'Сравниваем вычисленный корень с известным',
    current,
    result: current === PROOF_ROOT ? 'VALID' : 'INVALID',
  });

  const currentComp = computations[Math.min(step, computations.length - 1)];

  return (
    <DiagramContainer title="Верификация Merkle Proof" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DataBox
          label={`Шаг ${step} / ${totalSteps}`}
          value={currentComp.label}
          variant="highlight"
        />

        {/* Computation visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {computations.slice(0, step + 1).map((comp, i) => (
            <div
              key={i}
              style={{
                ...glassStyle,
                padding: 10,
                border: `1px solid ${i === step ? colors.primary + '50' : colors.border}`,
                opacity: i === step ? 1 : 0.6,
                transition: 'opacity 300ms ease',
              }}
            >
              {i === 0 && (
                <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                  <span style={{ color: colors.textMuted }}>leaf hash = </span>
                  <span style={{ color: colors.success }}>{comp.current}</span>
                </div>
              )}
              {comp.proofElem && (
                <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                  {comp.direction === 'right' ? (
                    <>
                      <span style={{ color: colors.textMuted }}>H(</span>
                      <span style={{ color: colors.success }}>{comp.current.slice(0, 8)}</span>
                      <span style={{ color: colors.textMuted }}> || </span>
                      <span style={{ color: colors.warning }}>{comp.proofElem.slice(0, 8)}</span>
                      <span style={{ color: colors.textMuted }}>) = </span>
                      <span style={{ color: colors.accent }}>{comp.result?.slice(0, 8)}</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: colors.textMuted }}>H(</span>
                      <span style={{ color: colors.warning }}>{comp.proofElem.slice(0, 8)}</span>
                      <span style={{ color: colors.textMuted }}> || </span>
                      <span style={{ color: colors.success }}>{comp.current.slice(0, 8)}</span>
                      <span style={{ color: colors.textMuted }}>) = </span>
                      <span style={{ color: colors.accent }}>{comp.result?.slice(0, 8)}</span>
                    </>
                  )}
                </div>
              )}
              {i === computations.length - 1 && i <= step && (
                <div style={{ fontFamily: 'monospace', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>
                    <span style={{ color: colors.textMuted }}>Вычисленный: </span>
                    <span style={{ color: colors.accent }}>{comp.current}</span>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }}>Известный:   </span>
                    <span style={{ color: '#a855f7' }}>{PROOF_ROOT}</span>
                  </div>
                  <div style={{
                    color: comp.result === 'VALID' ? colors.success : colors.danger,
                    fontWeight: 600,
                    marginTop: 4,
                  }}>
                    {comp.result === 'VALID' ? 'Proof валиден! Корни совпадают.' : 'Proof невалиден! Корни НЕ совпадают.'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setStep(0)} style={btnStyle(true, colors.text)}>
            Сброс
          </button>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            style={btnStyle(step > 0, colors.text)}
          >
            Назад
          </button>
          <button
            onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
            style={btnStyle(step < totalSteps, colors.primary)}
          >
            Далее
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          Верифицируем {PROOF_TX[VERIFY_LEAF]} | Proof содержит {VERIFY_PROOF.length} элементов | Дерево: {PROOF_TREE[0].length} листьев
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MerkleProofEfficiencyDiagram                                        */
/* ================================================================== */

interface EffRow {
  n: number;
  full: number;
  proof: number;
  label: string;
}

const EFFICIENCY_DATA: EffRow[] = [
  { n: 8, full: 8, proof: 3, label: '8 транзакций' },
  { n: 1000, full: 1000, proof: 10, label: '1 000 транзакций' },
  { n: 2000, full: 2000, proof: 11, label: 'Bitcoin блок (~2000 tx)' },
  { n: 1_000_000, full: 1_000_000, proof: 20, label: '1 000 000 транзакций' },
];

/**
 * MerkleProofEfficiencyDiagram -- O(log n) vs O(n) visual comparison.
 * Includes Bitcoin block practical example.
 */
export function MerkleProofEfficiencyDiagram() {
  return (
    <DiagramContainer title="Эффективность Merkle Proof: O(log n)" color="green">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Comparison table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left' }}>Данные</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Полная проверка (O(n))</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Merkle Proof (O(log n))</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Экономия</th>
              </tr>
            </thead>
            <tbody>
              {EFFICIENCY_DATA.map((row, i) => {
                const saving = ((1 - row.proof / row.full) * 100).toFixed(1);
                return (
                  <tr key={i}>
                    <td style={{ ...tdStyle, color: colors.text, fontWeight: i === 2 ? 600 : 400 }}>
                      {row.label}
                    </td>
                    <td style={{ ...tdStyle, color: colors.danger, textAlign: 'right', fontFamily: 'monospace' }}>
                      {row.full.toLocaleString()} хешей
                    </td>
                    <td style={{ ...tdStyle, color: colors.success, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                      {row.proof} хешей
                    </td>
                    <td style={{ ...tdStyle, color: colors.accent, textAlign: 'right', fontFamily: 'monospace' }}>
                      {saving}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bar chart comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {EFFICIENCY_DATA.map((row, i) => {
            // Log scale for visual: we show proof bar proportional and full bar at 100%
            const proofPct = Math.max(2, (row.proof / row.full) * 100);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, color: colors.textMuted }}>
                  {row.label} (n = {row.n.toLocaleString()})
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: colors.danger, width: 70, textAlign: 'right', flexShrink: 0 }}>
                    O(n)
                  </span>
                  <div style={{
                    height: 14,
                    width: '100%',
                    borderRadius: 4,
                    background: colors.danger + '30',
                    border: `1px solid ${colors.danger}40`,
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: colors.success, width: 70, textAlign: 'right', flexShrink: 0 }}>
                    O(log n)
                  </span>
                  <div style={{
                    height: 14,
                    width: `${proofPct}%`,
                    minWidth: 8,
                    borderRadius: 4,
                    background: colors.success + '50',
                    border: `1px solid ${colors.success}60`,
                  }} />
                  <span style={{ fontSize: 10, color: colors.success, fontFamily: 'monospace', flexShrink: 0 }}>
                    {row.proof}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bitcoin practical example */}
        <div style={{ ...glassStyle, padding: 12, border: `1px solid ${colors.warning}30` }}>
          <div style={{ fontSize: 12, color: colors.warning, fontWeight: 600, marginBottom: 6 }}>
            Практический пример: Bitcoin SPV
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
            Средний блок Bitcoin содержит ~2000 транзакций. SPV кошелек скачивает только заголовки блоков (80 байт каждый)
            и для проверки одной транзакции запрашивает Merkle Proof из <span style={{ color: colors.success, fontWeight: 600 }}>11 хешей</span> (по 32 байта = 352 байта)
            вместо скачивания всего блока (~1.5 МБ). Это экономит 99.98% трафика.
          </div>
        </div>

        {/* Formula */}
        <DataBox
          label="Формула"
          value="Размер Merkle Proof = ceil(log2(n)) хешей. Для n = 2000: ceil(log2(2000)) = 11 хешей."
          variant="default"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  Table style helpers                                                 */
/* ================================================================== */

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textMuted,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: `1px solid ${colors.border}20`,
  color: colors.textMuted,
  fontSize: 13,
};
