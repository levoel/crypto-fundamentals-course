/**
 * Primes & Divisibility Diagrams (MATH-02)
 *
 * Exports:
 * - PrimesSieveDiagram: Step-through Sieve of Eratosthenes (2-50)
 * - FactorizationTreeDiagram: Interactive prime factorization tree (SVG)
 * - GCDVisualization: Step-through Euclidean algorithm with rectangle subdivision
 */

import { useState, useMemo, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  PrimesSieveDiagram                                                  */
/* ------------------------------------------------------------------ */

interface SieveStep {
  prime: number;
  eliminated: Set<number>;
  description: string;
}

function computeSieveSteps(): SieveStep[] {
  const steps: SieveStep[] = [];
  const allEliminated = new Set<number>();
  const primes = [2, 3, 5, 7];

  for (const p of primes) {
    const eliminated = new Set<number>();
    for (let m = p * 2; m <= 50; m += p) {
      if (!allEliminated.has(m)) {
        eliminated.add(m);
      }
    }
    eliminated.forEach((n) => allEliminated.add(n));
    steps.push({
      prime: p,
      eliminated,
      description: `Вычёркиваем кратные ${p}` + (eliminated.size > 0 ? ` (${eliminated.size} чисел)` : ' (все уже вычеркнуты)'),
    });
  }
  return steps;
}

const SIEVE_STEPS = computeSieveSteps();

function isPrimeSieve(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

/**
 * PrimesSieveDiagram - Step-through Sieve of Eratosthenes for 2-50.
 * History array pattern with forward/backward navigation.
 */
export function PrimesSieveDiagram() {
  const [step, setStep] = useState(0);

  // step 0 = initial (all white), steps 1-4 = sieving by 2,3,5,7, step 5 = done
  const maxStep = SIEVE_STEPS.length + 1;

  const eliminatedUpToStep = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < Math.min(step, SIEVE_STEPS.length); i++) {
      SIEVE_STEPS[i].eliminated.forEach((n) => set.add(n));
    }
    return set;
  }, [step]);

  const currentStepEliminated = useMemo(() => {
    if (step === 0 || step > SIEVE_STEPS.length) return new Set<number>();
    return SIEVE_STEPS[step - 1].eliminated;
  }, [step]);

  const currentPrime = step > 0 && step <= SIEVE_STEPS.length ? SIEVE_STEPS[step - 1].prime : null;

  const numbers = Array.from({ length: 49 }, (_, i) => i + 2);
  const primesFound = numbers.filter((n) => isPrimeSieve(n) && !eliminatedUpToStep.has(n));

  const getNumberColor = (n: number): { bg: string; border: string; text: string } => {
    if (step === maxStep - 1 && isPrimeSieve(n)) {
      return { bg: `${colors.success}30`, border: `${colors.success}60`, text: colors.success };
    }
    if (currentStepEliminated.has(n)) {
      return { bg: `${colors.danger}25`, border: `${colors.danger}50`, text: colors.danger };
    }
    if (eliminatedUpToStep.has(n)) {
      return { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.05)', text: colors.textMuted };
    }
    if (currentPrime !== null && n === currentPrime) {
      return { bg: `${colors.primary}30`, border: `${colors.primary}60`, text: colors.primary };
    }
    return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: colors.text };
  };

  const stepDescription = step === 0
    ? 'Начало: все числа от 2 до 50'
    : step <= SIEVE_STEPS.length
      ? SIEVE_STEPS[step - 1].description
      : `Готово! Найдено ${numbers.filter(isPrimeSieve).length} простых чисел`;

  return (
    <DiagramContainer title="Решето Эратосфена" color="green">
      <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 12 }}>
        Шаг {step}/{maxStep - 1}: {stepDescription}
      </div>

      {/* Number grid 10 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
        {numbers.map((n) => {
          const c = getNumberColor(n);
          const isEliminated = eliminatedUpToStep.has(n) && !currentStepEliminated.has(n);
          return (
            <div
              key={n}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 0',
                borderRadius: 6,
                background: c.bg,
                border: `1px solid ${c.border}`,
                fontFamily: 'monospace',
                fontSize: 13,
                color: c.text,
                opacity: isEliminated ? 0.4 : 1,
                textDecoration: isEliminated ? 'line-through' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {n}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button
          onClick={() => setStep(0)}
          style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
        >
          Сброс
        </button>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            color: step === 0 ? colors.textMuted : colors.text,
            fontSize: 13,
            opacity: step === 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={() => setStep((s) => Math.min(maxStep - 1, s + 1))}
          disabled={step >= maxStep - 1}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step >= maxStep - 1 ? 'not-allowed' : 'pointer',
            color: step >= maxStep - 1 ? colors.textMuted : colors.primary,
            fontSize: 13,
            opacity: step >= maxStep - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {step === maxStep - 1 && (
        <DataBox
          label="Простые числа от 2 до 50"
          value={numbers.filter(isPrimeSieve).join(', ')}
          variant="highlight"
        />
      )}
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  FactorizationTreeDiagram                                            */
/* ------------------------------------------------------------------ */

interface TreeNode {
  value: number;
  isPrime: boolean;
  children?: [TreeNode, TreeNode]; // [smallestPrime, quotient]
  x?: number;
  y?: number;
}

const PRIME_COLORS: Record<number, string> = {
  2: colors.info,
  3: colors.success,
  5: '#eab308',
  7: colors.danger,
  11: colors.accent,
  13: colors.secondary,
  17: '#f472b6',
  19: '#a78bfa',
  23: '#34d399',
  29: '#fb923c',
};

function getPrimeColor(p: number): string {
  return PRIME_COLORS[p] || colors.primary;
}

function buildFactorizationTree(n: number): TreeNode {
  if (n < 2) return { value: n, isPrime: false };
  if (isPrimeSieve(n)) return { value: n, isPrime: true };

  let smallestPrime = 2;
  while (n % smallestPrime !== 0) smallestPrime++;

  const quotient = n / smallestPrime;
  return {
    value: n,
    isPrime: false,
    children: [
      { value: smallestPrime, isPrime: true },
      buildFactorizationTree(quotient),
    ],
  };
}

function getTreeDepth(node: TreeNode): number {
  if (!node.children) return 0;
  return 1 + Math.max(getTreeDepth(node.children[0]), getTreeDepth(node.children[1]));
}

function layoutTree(node: TreeNode, x: number, y: number, spread: number): TreeNode {
  node.x = x;
  node.y = y;
  if (node.children) {
    layoutTree(node.children[0], x - spread, y + 50, spread * 0.55);
    layoutTree(node.children[1], x + spread, y + 50, spread * 0.55);
  }
  return node;
}

function getFactorization(n: number): Map<number, number> {
  const factors = new Map<number, number>();
  let remaining = n;
  for (let d = 2; d * d <= remaining; d++) {
    while (remaining % d === 0) {
      factors.set(d, (factors.get(d) || 0) + 1);
      remaining /= d;
    }
  }
  if (remaining > 1) factors.set(remaining, (factors.get(remaining) || 0) + 1);
  return factors;
}

function renderTreeNodes(node: TreeNode): JSX.Element[] {
  const elements: JSX.Element[] = [];
  if (node.x === undefined || node.y === undefined) return elements;

  // Draw edges first
  if (node.children) {
    for (const child of node.children) {
      if (child.x !== undefined && child.y !== undefined) {
        elements.push(
          <line
            key={`edge-${node.value}-${child.value}-${child.x}`}
            x1={node.x}
            y1={node.y + 14}
            x2={child.x}
            y2={child.y - 14}
            stroke={colors.border}
            strokeWidth={1.5}
          />
        );
      }
    }
  }

  // Draw node
  const nodeColor = node.isPrime ? getPrimeColor(node.value) : colors.text;
  const bgColor = node.isPrime ? nodeColor + '25' : 'rgba(255,255,255,0.05)';
  const borderColor = node.isPrime ? nodeColor + '60' : colors.border;

  elements.push(
    <g key={`node-${node.value}-${node.x}-${node.y}`}>
      <rect
        x={node.x - 20}
        y={node.y - 14}
        width={40}
        height={28}
        rx={6}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={1.5}
      />
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={nodeColor}
        fontSize={node.value > 99 ? 10 : 13}
        fontFamily="monospace"
        fontWeight={node.isPrime ? 700 : 400}
      >
        {node.value}
      </text>
    </g>
  );

  // Recurse children
  if (node.children) {
    for (const child of node.children) {
      elements.push(...renderTreeNodes(child));
    }
  }

  return elements;
}

/**
 * FactorizationTreeDiagram - Interactive prime factorization tree.
 * Input a number (2-1000), see its factorization as a binary tree.
 */
export function FactorizationTreeDiagram() {
  const [value, setValue] = useState(360);

  const tree = useMemo(() => {
    const raw = buildFactorizationTree(value);
    const depth = getTreeDepth(raw);
    const spread = Math.min(120, 60 + depth * 20);
    return layoutTree(raw, 200, 30, spread);
  }, [value]);

  const factors = useMemo(() => getFactorization(value), [value]);
  const depth = getTreeDepth(tree);
  const svgHeight = Math.max(120, (depth + 1) * 50 + 30);

  const factorizationStr = Array.from(factors.entries())
    .map(([p, e]) => e === 1 ? String(p) : `${p}${superscript(e)}`)
    .join(' \u00D7 ');

  return (
    <DiagramContainer title="Дерево простого разложения" color="blue">
      <InteractiveValue value={value} onChange={setValue} min={2} max={1000} label="Число" />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, overflowX: 'auto' }}>
        <svg width={400} height={svgHeight} viewBox={`0 0 400 ${svgHeight}`}>
          {renderTreeNodes(tree)}
        </svg>
      </div>

      <DataBox
        label="Разложение"
        value={`${value} = ${factorizationStr}`}
        variant="highlight"
      />

      {/* Color legend for primes used */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {Array.from(factors.keys()).map((p) => (
          <div
            key={p}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 4,
              background: getPrimeColor(p) + '20',
              border: `1px solid ${getPrimeColor(p)}40`,
              fontSize: 12,
              fontFamily: 'monospace',
              color: getPrimeColor(p),
            }}
          >
            {p}
          </div>
        ))}
      </div>
    </DiagramContainer>
  );
}

function superscript(n: number): string {
  const map: Record<string, string> = {
    '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
    '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077',
    '8': '\u2078', '9': '\u2079',
  };
  return String(n).split('').map((d) => map[d] || d).join('');
}

/* ------------------------------------------------------------------ */
/*  GCDVisualization                                                    */
/* ------------------------------------------------------------------ */

interface GCDStep {
  a: number;
  b: number;
  q: number;
  r: number;
  equation: string;
}

function computeGCDSteps(a: number, b: number): GCDStep[] {
  const steps: GCDStep[] = [];
  let x = Math.max(a, b);
  let y = Math.min(a, b);
  if (y === 0) return [{ a: x, b: 0, q: 0, r: 0, equation: `НОД(${a}, ${b}) = ${x}` }];

  while (y > 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push({
      a: x,
      b: y,
      q,
      r,
      equation: `${x} = ${q} \u00D7 ${y} + ${r}`,
    });
    x = y;
    y = r;
  }
  return steps;
}

/**
 * GCDVisualization - Step-through Euclidean algorithm.
 * Shows division equations and rectangle subdivision visualization.
 */
export function GCDVisualization() {
  const [a, setA] = useState(252);
  const [b, setB] = useState(105);
  const [step, setStep] = useState(0);

  const steps = useMemo(() => computeGCDSteps(a, b), [a, b]);
  const maxStep = steps.length;

  const handleChangeA = useCallback((v: number) => { setA(v); setStep(0); }, []);
  const handleChangeB = useCallback((v: number) => { setB(v); setStep(0); }, []);

  const gcd = steps.length > 0 ? steps[steps.length - 1].a : Math.max(a, b);
  const visibleSteps = steps.slice(0, step + 1);

  // Rectangle subdivision for current step
  const currentA = step < steps.length ? steps[step].a : 0;
  const currentB = step < steps.length ? steps[step].b : 0;
  const currentQ = step < steps.length ? steps[step].q : 0;
  const currentR = step < steps.length ? steps[step].r : 0;

  const rectWidth = 360;
  const rectHeight = currentA > 0 ? Math.max(30, (currentB / currentA) * rectWidth) : 60;

  return (
    <DiagramContainer title="Алгоритм Евклида (НОД)" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <InteractiveValue value={a} onChange={handleChangeA} min={1} max={999} label="a" />
        <InteractiveValue value={b} onChange={handleChangeB} min={0} max={999} label="b" />

        {/* Step equations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visibleSteps.map((s, i) => (
            <div
              key={i}
              style={{
                ...glassStyle,
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: i === step ? `${colors.secondary}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === step ? colors.secondary + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
                Шаг {i + 1}
              </span>
              <span style={{ fontSize: 13, color: colors.text, fontFamily: 'monospace' }}>
                {s.equation}
              </span>
              <span style={{
                fontSize: 12,
                fontFamily: 'monospace',
                color: s.r === 0 ? colors.success : colors.textMuted,
                fontWeight: s.r === 0 ? 700 : 400,
              }}>
                r = {s.r}
              </span>
            </div>
          ))}
        </div>

        {/* Rectangle subdivision visualization */}
        {step < steps.length && currentB > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <svg width={rectWidth + 20} height={rectHeight + 20} viewBox={`0 0 ${rectWidth + 20} ${rectHeight + 20}`}>
              {/* Main rectangle a x b */}
              <rect
                x={10}
                y={10}
                width={rectWidth}
                height={rectHeight}
                fill="none"
                stroke={colors.border}
                strokeWidth={1.5}
              />
              {/* q squares of size b */}
              {Array.from({ length: currentQ }, (_, i) => {
                const squareWidth = (currentB / currentA) * rectWidth;
                return (
                  <rect
                    key={i}
                    x={10 + i * squareWidth}
                    y={10}
                    width={squareWidth}
                    height={rectHeight}
                    fill={`${colors.primary}15`}
                    stroke={colors.primary}
                    strokeWidth={1}
                    rx={2}
                  />
                );
              })}
              {/* Remainder rectangle */}
              {currentR > 0 && (
                <rect
                  x={10 + currentQ * ((currentB / currentA) * rectWidth)}
                  y={10}
                  width={(currentR / currentA) * rectWidth}
                  height={rectHeight}
                  fill={`${colors.warning}20`}
                  stroke={colors.warning}
                  strokeWidth={1.5}
                  rx={2}
                />
              )}
              {/* Labels */}
              <text x={rectWidth / 2 + 10} y={rectHeight + 18} textAnchor="middle" fill={colors.textMuted} fontSize={10} fontFamily="monospace">
                {currentA}
              </text>
              <text x={4} y={rectHeight / 2 + 10} textAnchor="middle" fill={colors.textMuted} fontSize={10} fontFamily="monospace" transform={`rotate(-90, 4, ${rectHeight / 2 + 10})`}>
                {currentB}
              </text>
            </svg>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => setStep(0)}
            style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
          >
            Сброс
          </button>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              color: step === 0 ? colors.textMuted : colors.text,
              fontSize: 13,
              opacity: step === 0 ? 0.5 : 1,
            }}
          >
            Назад
          </button>
          <button
            onClick={() => setStep((s) => Math.min(maxStep - 1, s + 1))}
            disabled={step >= maxStep - 1}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: step >= maxStep - 1 ? 'not-allowed' : 'pointer',
              color: step >= maxStep - 1 ? colors.textMuted : colors.primary,
              fontSize: 13,
              opacity: step >= maxStep - 1 ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>

        {step >= maxStep - 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <DataBox
              label="Результат"
              value={`НОД(${a}, ${b}) = ${gcd}`}
              variant="highlight"
            />
            <div style={{ ...glassStyle, padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', color: colors.accent }}>
              Python: math.gcd({a}, {b}) = {gcd}
            </div>
          </div>
        )}
      </div>
    </DiagramContainer>
  );
}
