/**
 * Finite Field Diagrams
 *
 * Exports:
 * - CyclicGroupVisualization: Generator powers on a circle for Z*_p
 * - FiniteFieldGrid: GF(p) multiplication table heatmap
 * - GroupPropertyDiagram: Visual showing closure, identity, inverse, associativity
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0;
  let result = 1;
  base = ((base % mod) + mod) % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function isGenerator(g: number, p: number): boolean {
  const order = p - 1;
  const seen = new Set<number>();
  let current = 1;
  for (let i = 0; i < order; i++) {
    current = (current * g) % p;
    seen.add(current);
  }
  return seen.size === order;
}

const PRIMES = [2, 3, 5, 7, 11, 13];

/* ------------------------------------------------------------------ */
/*  CyclicGroupVisualization                                            */
/* ------------------------------------------------------------------ */

/**
 * CyclicGroupVisualization - Generator powers on a circle for Z*_p.
 * Highlights g^0, g^1, g^2, ... showing how generator visits all elements.
 */
export function CyclicGroupVisualization() {
  const [p, setP] = useState(7);
  const [g, setG] = useState(3);
  const [animStep, setAnimStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const order = p - 1; // |Z*_p|
  const elements = Array.from({ length: order }, (_, i) => i + 1); // 1..p-1
  const powers: number[] = [];
  for (let i = 0; i < order; i++) {
    powers.push(modPow(g, i, p));
  }

  const genIsValid = isGenerator(g, p);

  // Animation
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setAnimStep((s) => {
          if (s >= order - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 600);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, order]);

  const handlePrimeChange = useCallback((v: number) => {
    // Snap to nearest prime
    const nearest = PRIMES.reduce((prev, curr) =>
      Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
    );
    setP(nearest);
    setG(2);
    setAnimStep(0);
    setIsPlaying(false);
  }, []);

  const cx = 140;
  const cy = 140;
  const radius = 110;

  return (
    <DiagramContainer
      title="Циклическая группа и генераторы"
      color="blue"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <InteractiveValue
          value={p}
          onChange={handlePrimeChange}
          min={2}
          max={13}
          label={`Простое p = ${p}`}
        />
        <InteractiveValue
          value={g}
          onChange={(v) => { setG(v); setAnimStep(0); setIsPlaying(false); }}
          min={2}
          max={p - 1}
          label={`Генератор g = ${g}${genIsValid ? ' (генератор)' : ' (не генератор)'}`}
        />

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width={280} height={280} viewBox="0 0 280 280">
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke={colors.border} strokeWidth={1.5} />

            {/* Element positions around circle */}
            {elements.map((el, i) => {
              const angle = (2 * Math.PI * i) / order - Math.PI / 2;
              const x = cx + radius * Math.cos(angle);
              const y = cy + radius * Math.sin(angle);

              // Check if this element has been visited in animation
              const visitedIndex = powers.slice(0, animStep + 1).indexOf(el);
              const isVisited = visitedIndex !== -1 && visitedIndex <= animStep;
              const isCurrent = powers[animStep] === el;

              let fillColor = 'rgba(255,255,255,0.05)';
              if (isCurrent) fillColor = colors.primary + '70';
              else if (isVisited) fillColor = colors.accent + '40';

              return (
                <g key={el}>
                  <circle
                    cx={x}
                    cy={y}
                    r={16}
                    fill={fillColor}
                    stroke={isCurrent ? colors.primary : isVisited ? colors.accent : colors.border}
                    strokeWidth={isCurrent ? 2 : 1}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={colors.text}
                    fontSize={12}
                    fontFamily="monospace"
                  >
                    {el}
                  </text>
                </g>
              );
            })}

            {/* Draw arrows between consecutive powers */}
            {powers.slice(0, animStep + 1).map((_, i) => {
              if (i === 0) return null;
              const prevEl = powers[i - 1];
              const currEl = powers[i];
              const prevIdx = elements.indexOf(prevEl);
              const currIdx = elements.indexOf(currEl);
              const prevAngle = (2 * Math.PI * prevIdx) / order - Math.PI / 2;
              const currAngle = (2 * Math.PI * currIdx) / order - Math.PI / 2;
              const x1 = cx + (radius - 20) * Math.cos(prevAngle);
              const y1 = cy + (radius - 20) * Math.sin(prevAngle);
              const x2 = cx + (radius - 20) * Math.cos(currAngle);
              const y2 = cy + (radius - 20) * Math.sin(currAngle);

              return (
                <line
                  key={`arrow-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={colors.accent}
                  strokeWidth={1.5}
                  opacity={0.6}
                  markerEnd="url(#arrowhead)"
                />
              );
            })}

            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={colors.accent} />
              </marker>
            </defs>

            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill={colors.textMuted} fontSize={11} fontFamily="monospace">
              Z*_{p}
            </text>
          </svg>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => { setAnimStep(0); setIsPlaying(false); }}
            style={{ ...glassStyle, padding: '6px 14px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
          >
            Сброс
          </button>
          <button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                if (animStep >= order - 1) setAnimStep(0);
                setIsPlaying(true);
              }
            }}
            style={{ ...glassStyle, padding: '6px 14px', cursor: 'pointer', color: colors.primary, fontSize: 13 }}
          >
            {isPlaying ? 'Пауза' : 'Анимация'}
          </button>
          <button
            onClick={() => setAnimStep((s) => Math.min(order - 1, s + 1))}
            disabled={animStep >= order - 1}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: animStep >= order - 1 ? 'not-allowed' : 'pointer',
              color: animStep >= order - 1 ? colors.textMuted : colors.text,
              fontSize: 13,
              opacity: animStep >= order - 1 ? 0.5 : 1,
            }}
          >
            Шаг
          </button>
        </div>

        {/* Power sequence */}
        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
            Степени g = {g}:
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 12 }}>
            {powers.slice(0, animStep + 1).map((val, i) => (
              <span key={i} style={{
                padding: '2px 6px',
                borderRadius: 4,
                background: `${colors.primary}20`,
                border: `1px solid ${colors.primary}30`,
                color: colors.primary,
              }}>
                {g}^{i} = {val}
              </span>
            ))}
          </div>
        </div>

        {animStep >= order - 1 && (
          <DataBox
            label="Результат"
            value={genIsValid
              ? `g = ${g} является генератором Z*_${p}: посещает все ${order} элементов`
              : `g = ${g} НЕ является генератором Z*_${p}: посещает ${new Set(powers).size} из ${order} элементов`
            }
            variant="highlight"
          />
        )}
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  FiniteFieldGrid                                                     */
/* ------------------------------------------------------------------ */

const heatmapColors = [
  '#1e293b', '#1e3a5f', '#1e4d7b', '#1e6097', '#1e73b3',
  '#2186cf', '#3499db', '#47ace7', '#5abff3', '#6dd2ff',
  '#80e5ff', '#93f8ff', '#a6ffff',
];

/**
 * FiniteFieldGrid - GF(p) multiplication table heatmap.
 */
export function FiniteFieldGrid() {
  const [p, setP] = useState(7);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const handlePrimeChange = useCallback((v: number) => {
    const nearest = PRIMES.reduce((prev, curr) =>
      Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev
    );
    setP(nearest);
  }, []);

  const elements = Array.from({ length: p }, (_, i) => i);

  return (
    <DiagramContainer
      title="Таблица умножения GF(p)"
      color="purple"
    >
      <InteractiveValue
        value={p}
        onChange={handlePrimeChange}
        min={2}
        max={13}
        label={`Простое p = ${p}`}
      />

      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: p > 7 ? 10 : 13 }}>
          <thead>
            <tr>
              <th style={{
                padding: '6px 10px',
                color: colors.textMuted,
                fontSize: 11,
                borderBottom: `1px solid ${colors.border}`,
                borderRight: `1px solid ${colors.border}`,
              }}>
                *
              </th>
              {elements.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '6px 10px',
                    color: hoverCol === col ? colors.primary : colors.textMuted,
                    borderBottom: `1px solid ${colors.border}`,
                    background: hoverCol === col ? `${colors.primary}15` : 'transparent',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map((row) => (
              <tr key={row}>
                <td style={{
                  padding: '6px 10px',
                  color: hoverRow === row ? colors.primary : colors.textMuted,
                  fontWeight: 600,
                  borderRight: `1px solid ${colors.border}`,
                  background: hoverRow === row ? `${colors.primary}15` : 'transparent',
                }}>
                  {row}
                </td>
                {elements.map((col) => {
                  const product = (row * col) % p;
                  const colorIdx = Math.min(Math.floor((product / (p - 1 || 1)) * (heatmapColors.length - 1)), heatmapColors.length - 1);
                  const isHighlighted = hoverRow === row || hoverCol === col;

                  return (
                    <td
                      key={col}
                      onMouseEnter={() => { setHoverRow(row); setHoverCol(col); }}
                      onMouseLeave={() => { setHoverRow(null); setHoverCol(null); }}
                      style={{
                        padding: '6px 10px',
                        textAlign: 'center',
                        background: heatmapColors[colorIdx],
                        color: colors.text,
                        border: isHighlighted ? `1px solid ${colors.primary}60` : `1px solid rgba(255,255,255,0.05)`,
                        transition: 'border 0.15s',
                      }}
                    >
                      {product}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoverRow !== null && hoverCol !== null && (
        <div style={{ marginTop: 8, fontSize: 13, color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>
          {hoverRow} * {hoverCol} = {(hoverRow * hoverCol) % p} (mod {p})
        </div>
      )}
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  GroupPropertyDiagram                                                */
/* ------------------------------------------------------------------ */

interface PropertyExample {
  name: string;
  nameRu: string;
  formula: string;
  example: string;
  color: string;
}

const groupProperties: PropertyExample[] = [
  {
    name: 'closure',
    nameRu: 'Замкнутость',
    formula: 'a * b in G',
    example: '3 * 5 = 1 (mod 7) in Z*_7',
    color: colors.primary,
  },
  {
    name: 'identity',
    nameRu: 'Единица',
    formula: 'a * e = a',
    example: '5 * 1 = 5 (mod 7)',
    color: colors.accent,
  },
  {
    name: 'inverse',
    nameRu: 'Обратный',
    formula: 'a * a^(-1) = e',
    example: '3 * 5 = 1 (mod 7), т.е. 3^(-1) = 5',
    color: colors.success,
  },
  {
    name: 'associativity',
    nameRu: 'Ассоциативность',
    formula: '(a * b) * c = a * (b * c)',
    example: '(2*3)*5 = 6*5 = 2 = 2*(3*5) = 2*1 (mod 7)',
    color: colors.warning,
  },
];

/**
 * GroupPropertyDiagram - Visual showing closure, identity, inverse, associativity.
 * Each property shown with concrete example from Z*_7.
 */
export function GroupPropertyDiagram() {
  return (
    <DiagramContainer
      title="Свойства группы"
      color="emerald"
      description="Четыре аксиомы группы на примере Z*_7 = {1, 2, 3, 4, 5, 6}"
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
        {groupProperties.map((prop) => (
          <div
            key={prop.name}
            style={{
              ...glassStyle,
              padding: 16,
              borderColor: `${prop.color}30`,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: prop.color,
              }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: prop.color }}>
                {prop.nameRu}
              </span>
            </div>

            <div style={{ fontSize: 13, color: colors.text, fontFamily: 'monospace' }}>
              {prop.formula}
            </div>

            <div style={{
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: 'monospace',
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {prop.example}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <FlowNode variant="primary" size="sm">Z*_7</FlowNode>
        <Arrow direction="right" label="замкнутость" />
        <FlowNode variant="accent" size="sm">Единица: 1</FlowNode>
        <Arrow direction="right" label="обратные" />
        <FlowNode variant="success" size="sm">a * a^(-1) = 1</FlowNode>
      </div>
    </DiagramContainer>
  );
}
