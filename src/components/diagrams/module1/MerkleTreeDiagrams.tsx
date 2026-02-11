/**
 * Merkle Tree Diagrams (DIAG-10)
 *
 * Exports:
 * - MerkleTreeBuildAnimation: Step-through tree construction from leaves to root (DIAG-10)
 * - MerkleTreeStructureDiagram: Static tree showing levels, leaf/internal/root nodes
 * - MerkleRootCommitmentDiagram: Changing one leaf changes root (commitment property)
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Simple JS hash for Merkle tree (deterministic, no SubtleCrypto)    */
/* ================================================================== */

/**
 * Minimal hash producing 8 hex chars. Uses a simple mixing function
 * seeded from string bytes. NOT cryptographic -- purely for visual demos.
 */
function simpleHash(input: string): string {
  let h = 0x811c9dc5; // FNV offset
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Second round for better avalanche
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return (h >>> 0).toString(16).padStart(8, '0');
}

function hashConcat(a: string, b: string): string {
  return simpleHash(a + b);
}

/* ================================================================== */
/*  Shared tree layout helpers                                          */
/* ================================================================== */

interface TreeNode {
  hash: string;
  label?: string;
  level: number;
  index: number;
  children?: [number, number]; // indices in flat array of child level
}

/**
 * Build a complete Merkle tree from transaction labels.
 * Returns levels from leaves (0) up to root.
 */
function buildMerkleTree(txLabels: string[]): string[][] {
  const leaves = txLabels.map(tx => simpleHash(tx));
  const levels: string[][] = [leaves];
  let current = leaves;

  while (current.length > 1) {
    // Duplicate last if odd
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
/*  Shared button style helpers                                         */
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
/*  SVG Tree Renderer                                                   */
/* ================================================================== */

interface SVGTreeProps {
  levels: string[][];
  highlightLevel?: number;   // level index to highlight (build animation)
  highlightPath?: Set<string>; // "level-index" keys for commitment diagram
  highlightColor?: string;
  dimOthers?: boolean;
  nodeLabels?: Map<string, string>; // "level-index" -> label override
  width?: number;
  height?: number;
  txLabels?: string[];
}

function SVGTreeRenderer({
  levels,
  highlightLevel,
  highlightPath,
  highlightColor = colors.warning,
  dimOthers = false,
  nodeLabels,
  width = 700,
  height = 320,
  txLabels,
}: SVGTreeProps) {
  const totalLevels = levels.length;
  const levelHeight = height / (totalLevels + 0.5);
  const nodeWidth = 72;
  const nodeHeight = 32;

  // Calculate node positions
  const positions: { x: number; y: number; hash: string; level: number; index: number }[][] = [];

  for (let lvl = 0; lvl < totalLevels; lvl++) {
    const nodesInLevel = levels[lvl].length;
    const yPos = height - (lvl + 1) * levelHeight;
    const spacing = width / (nodesInLevel + 1);
    const levelPositions: typeof positions[0] = [];
    for (let idx = 0; idx < nodesInLevel; idx++) {
      levelPositions.push({
        x: spacing * (idx + 1),
        y: yPos,
        hash: levels[lvl][idx],
        level: lvl,
        index: idx,
      });
    }
    positions.push(levelPositions);
  }

  // Determine node color
  const getNodeColor = (lvl: number, idx: number): string => {
    const key = `${lvl}-${idx}`;
    if (highlightPath?.has(key)) return highlightColor;
    if (highlightLevel !== undefined) {
      if (lvl === highlightLevel) return colors.primary;
      if (lvl < highlightLevel) return colors.success + 'cc';
      return colors.textMuted + '40';
    }
    // Default coloring by level
    if (lvl === 0) return colors.success;
    if (lvl === totalLevels - 1) return '#a855f7'; // purple for root
    return colors.primary;
  };

  const getNodeOpacity = (lvl: number, idx: number): number => {
    const key = `${lvl}-${idx}`;
    if (highlightPath && dimOthers && !highlightPath.has(key)) return 0.25;
    if (highlightLevel !== undefined && lvl > highlightLevel) return 0.2;
    return 1;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', maxHeight: height }}
    >
      {/* Lines connecting parents to children */}
      {positions.map((levelPos, lvl) => {
        if (lvl === 0) return null;
        const childLevel = positions[lvl - 1];
        return levelPos.map((parent, idx) => {
          const leftChildIdx = idx * 2;
          const rightChildIdx = idx * 2 + 1;
          const leftChild = childLevel[leftChildIdx];
          const rightChild = childLevel[rightChildIdx];
          if (!leftChild) return null;

          const parentKey = `${lvl}-${idx}`;
          const leftKey = `${lvl - 1}-${leftChildIdx}`;
          const rightKey = `${lvl - 1}-${rightChildIdx}`;

          const lineOpacity = highlightPath
            ? (highlightPath.has(parentKey) && highlightPath.has(leftKey) ? 0.8 : (dimOthers ? 0.1 : 0.3))
            : (highlightLevel !== undefined && lvl > highlightLevel ? 0.1 : 0.3);

          const lineOpacityR = highlightPath
            ? (highlightPath.has(parentKey) && highlightPath.has(rightKey) ? 0.8 : (dimOthers ? 0.1 : 0.3))
            : lineOpacity;

          return (
            <g key={`line-${lvl}-${idx}`}>
              <line
                x1={parent.x}
                y1={parent.y + nodeHeight / 2}
                x2={leftChild.x}
                y2={leftChild.y - nodeHeight / 2}
                stroke={colors.text}
                strokeWidth={1}
                opacity={lineOpacity}
              />
              {rightChild && (
                <line
                  x1={parent.x}
                  y1={parent.y + nodeHeight / 2}
                  x2={rightChild.x}
                  y2={rightChild.y - nodeHeight / 2}
                  stroke={colors.text}
                  strokeWidth={1}
                  opacity={lineOpacityR}
                />
              )}
            </g>
          );
        });
      })}

      {/* Nodes */}
      {positions.map((levelPos, lvl) =>
        levelPos.map((node, idx) => {
          const key = `${lvl}-${idx}`;
          const nodeColor = getNodeColor(lvl, idx);
          const opacity = getNodeOpacity(lvl, idx);
          const label = nodeLabels?.get(key);
          const isRoot = lvl === totalLevels - 1;

          return (
            <g key={key} opacity={opacity} style={{ transition: 'opacity 400ms ease' }}>
              <rect
                x={node.x - nodeWidth / 2}
                y={node.y - nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx={6}
                fill={nodeColor + '18'}
                stroke={nodeColor}
                strokeWidth={isRoot ? 2 : 1}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={nodeColor}
                fontSize={10}
                fontFamily="monospace"
              >
                {label || node.hash.slice(0, 8)}
              </text>
              {/* Show tx label below leaf nodes */}
              {lvl === 0 && txLabels && txLabels[idx] && (
                <text
                  x={node.x}
                  y={node.y + nodeHeight / 2 + 14}
                  textAnchor="middle"
                  fill={colors.textMuted}
                  fontSize={9}
                  fontFamily="monospace"
                >
                  {txLabels[idx]}
                </text>
              )}
              {/* Root label */}
              {isRoot && (
                <text
                  x={node.x}
                  y={node.y - nodeHeight / 2 - 8}
                  textAnchor="middle"
                  fill={'#a855f7'}
                  fontSize={11}
                  fontWeight={600}
                >
                  Merkle Root
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
/*  MerkleTreeBuildAnimation (DIAG-10)                                  */
/* ================================================================== */

const BUILD_TX_LABELS = ['tx1', 'tx2', 'tx3', 'tx4', 'tx5', 'tx6', 'tx7', 'tx8'];
const BUILD_TREE = buildMerkleTree(BUILD_TX_LABELS);
const BUILD_TOTAL_LEVELS = BUILD_TREE.length; // 4 levels (leaves + 3 internal)

const STEP_DESCRIPTIONS = [
  'Исходные транзакции. Каждую нужно захешировать.',
  'Хешируем каждую транзакцию -> получаем листья дерева (уровень 0).',
  'Попарно конкатенируем и хешируем листья -> уровень 1 (4 узла).',
  'Попарно конкатенируем и хешируем уровень 1 -> уровень 2 (2 узла).',
  'Хешируем два оставшихся узла -> Merkle Root!',
];

/**
 * MerkleTreeBuildAnimation -- MAIN ANIMATION (DIAG-10). Step-through Merkle tree
 * construction from raw transactions up to the Merkle root.
 */
export function MerkleTreeBuildAnimation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const maxStep = BUILD_TOTAL_LEVELS; // steps 0..4

  const advance = useCallback(() => {
    setStep(s => Math.min(maxStep, s + 1));
  }, [maxStep]);

  const goBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setIsPlaying(false);
  }, []);

  const toggleAutoplay = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev && step < maxStep) {
        const interval = setInterval(() => {
          setStep(s => {
            if (s >= maxStep) {
              clearInterval(interval);
              setIsPlaying(false);
              return s;
            }
            return s + 1;
          });
        }, 1200);
        (window as Record<string, unknown>).__merkleTreeInterval = interval;
        return true;
      } else {
        const existing = (window as Record<string, unknown>).__merkleTreeInterval as ReturnType<typeof setInterval> | undefined;
        if (existing) clearInterval(existing);
        return false;
      }
    });
  }, [step, maxStep]);

  // Build visible levels: for step N, show levels 0..N-1
  // step=0: show raw txs (no tree yet)
  // step=1: show level 0 (leaves)
  // step=2: show levels 0-1
  // ...
  const visibleLevels = step === 0 ? [] : BUILD_TREE.slice(0, step);

  // Computation description for current step
  const getComputationHint = (): string => {
    if (step === 0) return '';
    if (step === 1) return `H("tx1") = ${BUILD_TREE[0][0].slice(0, 8)}...`;
    if (step <= BUILD_TOTAL_LEVELS) {
      const lvl = step - 1;
      const childLevel = BUILD_TREE[lvl - 1];
      if (childLevel && childLevel.length >= 2) {
        return `H(${childLevel[0].slice(0, 8)} || ${childLevel[1].slice(0, 8)}) = ${BUILD_TREE[lvl][0].slice(0, 8)}...`;
      }
    }
    return '';
  };

  return (
    <DiagramContainer title="Построение дерева Меркла" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Step description */}
        <DiagramTooltip content="Шаг 1: каждый элемент данных (транзакция) хешируется индивидуально. Шаг 2+: пары хешей конкатенируются и хешируются вверх до корня.">
          <DataBox
            label={`Шаг ${step} / ${maxStep}`}
            value={STEP_DESCRIPTIONS[step] || ''}
            variant="highlight"
          />
        </DiagramTooltip>

        {/* Raw transaction display when step == 0 */}
        {step === 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {BUILD_TX_LABELS.map((tx, i) => (
              <DiagramTooltip key={i} content={`Транзакция ${tx}: исходные данные, которые будут захешированы для создания листа дерева Меркла.`}>
                <div
                  style={{
                    ...glassStyle,
                    padding: '8px 14px',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: colors.accent,
                    border: `1px solid ${colors.accent}40`,
                  }}
                >
                  {tx}
                </div>
              </DiagramTooltip>
            ))}
          </div>
        )}

        {/* Tree visualization */}
        {visibleLevels.length > 0 && (
          <SVGTreeRenderer
            levels={visibleLevels}
            highlightLevel={step - 1}
            txLabels={BUILD_TX_LABELS}
          />
        )}

        {/* Computation hint */}
        {getComputationHint() && (
          <DiagramTooltip content="Пары хешей конкатенируются и хешируются: H(H(tx1) || H(tx2)). Процесс повторяется вверх до корня.">
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              fontSize: 12,
              fontFamily: 'monospace',
              color: colors.accent,
              textAlign: 'center',
            }}>
              {getComputationHint()}
            </div>
          </DiagramTooltip>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <DiagramTooltip content="Вернуться к исходным транзакциям.">
            <div>
              <button onClick={reset} style={btnStyle(true, colors.text)}>
                Сброс
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Перейти к предыдущему уровню дерева.">
            <div>
              <button onClick={goBack} style={btnStyle(step > 0, colors.text)}>
                Назад
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Вычислить следующий уровень дерева Меркла.">
            <div>
              <button onClick={advance} style={btnStyle(step < maxStep, colors.primary)}>
                Далее
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Автоматически построить дерево Меркла по шагам.">
            <div>
              <button
                onClick={toggleAutoplay}
                style={btnStyle(true, isPlaying ? colors.warning : colors.accent)}
              >
                {isPlaying ? 'Стоп' : 'Автовоспроизведение'}
              </button>
            </div>
          </DiagramTooltip>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          Шаг {step} из {maxStep} |{' '}
          <span style={{ color: colors.primary }}>Синие</span> = текущий уровень,{' '}
          <span style={{ color: colors.success }}>зеленые</span> = вычислены ранее
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MerkleTreeStructureDiagram                                          */
/* ================================================================== */

const STRUCT_TX = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const STRUCT_TREE = buildMerkleTree(STRUCT_TX);

const LEVEL_LABELS: Record<number, string> = {
  0: 'Листья (данные)',
  1: 'Уровень 1',
  2: 'Уровень 2',
  3: 'Корень (Root)',
};

/**
 * MerkleTreeStructureDiagram -- Static complete Merkle tree with 8 leaves.
 * Color-coded levels: leaf (green), internal (blue), root (purple).
 */
export function MerkleTreeStructureDiagram() {
  return (
    <DiagramContainer title="Структура дерева Меркла" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SVGTreeRenderer
          levels={STRUCT_TREE}
          txLabels={STRUCT_TX}
          height={340}
        />

        {/* Level labels legend */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(LEVEL_LABELS).map(([lvl, label]) => {
            const lvlNum = parseInt(lvl, 10);
            const c = lvlNum === 0 ? colors.success
              : lvlNum === STRUCT_TREE.length - 1 ? '#a855f7'
              : colors.primary;
            const tooltipContent = lvlNum === 0
              ? 'Лист (leaf): H(data). Хеш одного элемента данных. В Bitcoin -- хеш транзакции.'
              : lvlNum === STRUCT_TREE.length - 1
              ? 'Merkle Root: единственный хеш, представляющий все данные дерева. Изменение любого листа меняет root. В Bitcoin хранится в заголовке блока.'
              : 'Внутренний узел: H(left_child || right_child). Каждый уровень дерева уменьшает количество хешей вдвое.';
            return (
              <DiagramTooltip key={lvl} content={tooltipContent}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 3,
                    background: c + '30', border: `1px solid ${c}`,
                  }} />
                  <span style={{ fontSize: 12, color: colors.textMuted }}>{label}</span>
                </div>
              </DiagramTooltip>
            );
          })}
        </div>

        <DiagramTooltip content="Полное бинарное дерево: n листьев дают высоту log2(n) и всего 2n - 1 узлов. Эффективность Merkle proof напрямую зависит от высоты.">
          <DataBox
            label="Свойства"
            value={`8 листьев -> высота ${STRUCT_TREE.length - 1} (log2(8) = 3). Всего узлов: ${STRUCT_TREE.reduce((s, l) => s + l.length, 0)} (2n - 1 для n листьев).`}
            variant="default"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MerkleRootCommitmentDiagram                                         */
/* ================================================================== */

const COMMIT_TX_ORIGINAL = ['tx1', 'tx2', 'tx3', 'tx4'];
const COMMIT_TX_MODIFIED = ['tx1', 'tx2', 'tx3*', 'tx4']; // tx3 changed
const COMMIT_TREE_ORIG = buildMerkleTree(COMMIT_TX_ORIGINAL);
const COMMIT_TREE_MOD = buildMerkleTree(COMMIT_TX_MODIFIED);

/**
 * Find nodes that differ between two trees. Returns Set of "level-index" keys.
 */
function findChangedNodes(treeA: string[][], treeB: string[][]): Set<string> {
  const changed = new Set<string>();
  for (let lvl = 0; lvl < treeA.length && lvl < treeB.length; lvl++) {
    for (let idx = 0; idx < treeA[lvl].length && idx < treeB[lvl].length; idx++) {
      if (treeA[lvl][idx] !== treeB[lvl][idx]) {
        changed.add(`${lvl}-${idx}`);
      }
    }
  }
  return changed;
}

const CHANGED_NODES = findChangedNodes(COMMIT_TREE_ORIG, COMMIT_TREE_MOD);

/**
 * MerkleRootCommitmentDiagram -- Two trees side by side: original and modified.
 * Demonstrates that changing one leaf changes the entire path to root.
 */
export function MerkleRootCommitmentDiagram() {
  return (
    <DiagramContainer title="Изменение одного листа меняет корень" color="green">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DiagramTooltip content="Merkle root как commitment: публикуя root, вы фиксируете набор данных. Позже можно доказать принадлежность любого элемента без раскрытия остальных (Merkle proof).">
          <div style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center' }}>
            Изменяем <span style={{ color: colors.danger, fontWeight: 600 }}>tx3</span> на{' '}
            <span style={{ color: colors.danger, fontWeight: 600 }}>tx3*</span>.
            Все узлы на пути от листа к корню (красные) пересчитываются.
          </div>
        </DiagramTooltip>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Original tree */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <DiagramTooltip content="Оригинальное дерево с неизмененными данными. Merkle Root вычислен из всех 4 транзакций.">
              <div style={{
                fontSize: 12, color: colors.success, textAlign: 'center',
                marginBottom: 6, fontWeight: 600,
              }}>
                Оригинальное дерево
              </div>
            </DiagramTooltip>
            <div style={{ ...glassStyle, padding: 8 }}>
              <SVGTreeRenderer
                levels={COMMIT_TREE_ORIG}
                txLabels={COMMIT_TX_ORIGINAL}
                width={340}
                height={220}
              />
            </div>
            <div style={{
              textAlign: 'center', fontSize: 11, fontFamily: 'monospace',
              color: colors.textMuted, marginTop: 4,
            }}>
              Root: {COMMIT_TREE_ORIG[COMMIT_TREE_ORIG.length - 1][0].slice(0, 8)}
            </div>
          </div>

          {/* Modified tree */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <DiagramTooltip content="Измененное дерево: tx3 заменена на tx3*. Красные узлы -- все пересчитанные хеши на пути от измененного листа к корню.">
              <div style={{
                fontSize: 12, color: colors.danger, textAlign: 'center',
                marginBottom: 6, fontWeight: 600,
              }}>
                Измененное дерево (tx3 -&gt; tx3*)
              </div>
            </DiagramTooltip>
            <div style={{ ...glassStyle, padding: 8 }}>
              <SVGTreeRenderer
                levels={COMMIT_TREE_MOD}
                highlightPath={CHANGED_NODES}
                highlightColor={colors.danger}
                dimOthers={true}
                txLabels={COMMIT_TX_MODIFIED}
                width={340}
                height={220}
              />
            </div>
            <div style={{
              textAlign: 'center', fontSize: 11, fontFamily: 'monospace',
              color: colors.danger, marginTop: 4,
            }}>
              Root: {COMMIT_TREE_MOD[COMMIT_TREE_MOD.length - 1][0].slice(0, 8)}
            </div>
          </div>
        </div>

        <DiagramTooltip content="Это свойство -- основа целостности блокчейна. Merkle Root в заголовке блока Bitcoin фиксирует все ~2000 транзакций одним 32-байтным хешем.">
          <DataBox
            label="Свойство обязательства (Commitment)"
            value="Merkle Root фиксирует ВСЕ данные в дереве. Изменение любого листа неизбежно меняет корень. Невозможно подменить транзакцию, не изменив Merkle Root в заголовке блока."
            variant="highlight"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
