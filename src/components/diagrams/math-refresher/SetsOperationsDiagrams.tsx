/**
 * Sets & Operations Diagrams (MATH-03)
 *
 * Exports:
 * - SetOperationsDiagram: Interactive Venn diagram with set operations
 * - BinaryOperationTableDiagram: Operation table with algebraic property checking
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  SetOperationsDiagram                                                */
/* ------------------------------------------------------------------ */

type SetOp = 'union' | 'intersection' | 'difference' | 'symmetric';

const SET_A = [1, 2, 3, 4, 5];
const SET_B = [3, 4, 5, 6, 7];

function computeSetOp(op: SetOp): { result: number[]; notation: string; python: string } {
  const a = new Set(SET_A);
  const b = new Set(SET_B);
  switch (op) {
    case 'union': {
      const result = [...new Set([...a, ...b])].sort((x, y) => x - y);
      return { result, notation: `A \u222A B = {${result.join(', ')}}`, python: 'A | B' };
    }
    case 'intersection': {
      const result = SET_A.filter((x) => b.has(x));
      return { result, notation: `A \u2229 B = {${result.join(', ')}}`, python: 'A & B' };
    }
    case 'difference': {
      const result = SET_A.filter((x) => !b.has(x));
      return { result, notation: `A \u2216 B = {${result.join(', ')}}`, python: 'A - B' };
    }
    case 'symmetric': {
      const result = [...SET_A.filter((x) => !b.has(x)), ...Array.from(b).filter((x) => !a.has(x))].sort((x, y) => x - y);
      return { result, notation: `A \u25B3 B = {${result.join(', ')}}`, python: 'A ^ B' };
    }
  }
}

const opButtons: { key: SetOp; label: string; symbol: string }[] = [
  { key: 'union', label: 'Объединение', symbol: '\u222A' },
  { key: 'intersection', label: 'Пересечение', symbol: '\u2229' },
  { key: 'difference', label: 'Разность', symbol: 'A\u2216B' },
  { key: 'symmetric', label: 'Симм. разность', symbol: '\u25B3' },
];

/**
 * SetOperationsDiagram - Interactive Venn diagram with set operations.
 * Two sets A and B with selectable operations.
 */
export function SetOperationsDiagram() {
  const [op, setOp] = useState<SetOp>('union');

  const { result, notation, python } = computeSetOp(op);
  const resultSet = new Set(result);

  // Venn diagram geometry
  const cx1 = 140;
  const cx2 = 220;
  const cy = 100;
  const r = 75;

  // Classify elements for coloring in Venn regions
  const onlyA = SET_A.filter((x) => !new Set(SET_B).has(x));
  const onlyB = Array.from(new Set(SET_B)).filter((x) => !new Set(SET_A).has(x));
  const both = SET_A.filter((x) => new Set(SET_B).has(x));

  const isHighlighted = (elements: number[]): boolean => {
    return elements.some((e) => resultSet.has(e));
  };

  return (
    <DiagramContainer title="Операции над множествами" color="blue">
      {/* Operation buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {opButtons.map((b) => (
          <button
            key={b.key}
            onClick={() => setOp(b.key)}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: 'pointer',
              background: op === b.key ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${op === b.key ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              color: op === b.key ? colors.primary : colors.text,
              fontSize: 13,
            }}
          >
            <span style={{ marginRight: 4 }}>{b.symbol}</span> {b.label}
          </button>
        ))}
      </div>

      {/* Venn diagram */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={360} height={200} viewBox="0 0 360 200">
          {/* Circle A */}
          <circle
            cx={cx1}
            cy={cy}
            r={r}
            fill={isHighlighted(onlyA) ? `${colors.primary}20` : 'rgba(255,255,255,0.03)'}
            stroke={colors.primary}
            strokeWidth={2}
            opacity={0.8}
          />
          {/* Circle B */}
          <circle
            cx={cx2}
            cy={cy}
            r={r}
            fill={isHighlighted(onlyB) ? `${colors.accent}20` : 'rgba(255,255,255,0.03)'}
            stroke={colors.accent}
            strokeWidth={2}
            opacity={0.8}
          />
          {/* Intersection highlight */}
          {isHighlighted(both) && (
            <clipPath id="clipA">
              <circle cx={cx1} cy={cy} r={r} />
            </clipPath>
          )}
          {isHighlighted(both) && (
            <circle
              cx={cx2}
              cy={cy}
              r={r}
              fill={`${colors.success}25`}
              clipPath="url(#clipA)"
            />
          )}

          {/* Labels */}
          <text x={cx1 - 35} y={cy - 50} fill={colors.primary} fontSize={14} fontWeight={600}>A</text>
          <text x={cx2 + 25} y={cy - 50} fill={colors.accent} fontSize={14} fontWeight={600}>B</text>

          {/* Element positions */}
          {/* Only A elements */}
          {onlyA.map((n, i) => (
            <text
              key={`a-${n}`}
              x={cx1 - 30 + (i % 2) * 20}
              y={cy - 10 + Math.floor(i / 2) * 22}
              textAnchor="middle"
              fill={resultSet.has(n) ? colors.primary : colors.textMuted}
              fontSize={14}
              fontFamily="monospace"
              fontWeight={resultSet.has(n) ? 700 : 400}
            >
              {n}
            </text>
          ))}
          {/* Intersection elements */}
          {both.map((n, i) => (
            <text
              key={`both-${n}`}
              x={(cx1 + cx2) / 2}
              y={cy - 15 + i * 18}
              textAnchor="middle"
              fill={resultSet.has(n) ? colors.success : colors.textMuted}
              fontSize={14}
              fontFamily="monospace"
              fontWeight={resultSet.has(n) ? 700 : 400}
            >
              {n}
            </text>
          ))}
          {/* Only B elements */}
          {onlyB.map((n, i) => (
            <text
              key={`b-${n}`}
              x={cx2 + 30 + (i % 2) * 20 - 10}
              y={cy - 10 + Math.floor(i / 2) * 22}
              textAnchor="middle"
              fill={resultSet.has(n) ? colors.accent : colors.textMuted}
              fontSize={14}
              fontFamily="monospace"
              fontWeight={resultSet.has(n) ? 700 : 400}
            >
              {n}
            </text>
          ))}
        </svg>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <DataBox label="Результат" value={notation} variant="highlight" />
        <div style={{ ...glassStyle, padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', color: colors.accent }}>
          Python: A = {'{'}1, 2, 3, 4, 5{'}'}; B = {'{'}3, 4, 5, 6, 7{'}'}; {python} = {'{' + result.join(', ') + '}'}
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  BinaryOperationTableDiagram                                         */
/* ------------------------------------------------------------------ */

interface AlgebraicStructure {
  name: string;
  elements: number[];
  operation: (a: number, b: number) => number;
  opSymbol: string;
  identity: number | null;
  isClosed: boolean;
  isCommutative: boolean;
  isAssociative: boolean;
  inverses: Map<number, number | null>;
}

function buildStructure(
  name: string,
  elements: number[],
  op: (a: number, b: number) => number,
  opSymbol: string
): AlgebraicStructure {
  // Check closure
  let isClosed = true;
  const elementSet = new Set(elements);
  for (const a of elements) {
    for (const b of elements) {
      if (!elementSet.has(op(a, b))) { isClosed = false; break; }
    }
    if (!isClosed) break;
  }

  // Check commutativity
  let isCommutative = true;
  for (const a of elements) {
    for (const b of elements) {
      if (op(a, b) !== op(b, a)) { isCommutative = false; break; }
    }
    if (!isCommutative) break;
  }

  // Check associativity (brute force for small sets)
  let isAssociative = true;
  for (const a of elements) {
    for (const b of elements) {
      for (const c of elements) {
        if (op(op(a, b), c) !== op(a, op(b, c))) { isAssociative = false; break; }
      }
      if (!isAssociative) break;
    }
    if (!isAssociative) break;
  }

  // Find identity
  let identity: number | null = null;
  for (const e of elements) {
    const isId = elements.every((a) => op(a, e) === a && op(e, a) === a);
    if (isId) { identity = e; break; }
  }

  // Find inverses
  const inverses = new Map<number, number | null>();
  if (identity !== null) {
    for (const a of elements) {
      let inv: number | null = null;
      for (const b of elements) {
        if (op(a, b) === identity && op(b, a) === identity) { inv = b; break; }
      }
      inverses.set(a, inv);
    }
  }

  return { name, elements, operation: op, opSymbol, identity, isClosed, isCommutative, isAssociative, inverses };
}

const STRUCTURES: AlgebraicStructure[] = [
  buildStructure(
    'Z\u2085, + (mod 5)',
    [0, 1, 2, 3, 4],
    (a, b) => (a + b) % 5,
    '+'
  ),
  buildStructure(
    'Z\u2085, \u00D7 (mod 5)',
    [0, 1, 2, 3, 4],
    (a, b) => (a * b) % 5,
    '\u00D7'
  ),
  buildStructure(
    'Z*\u2087, \u00D7 (mod 7)',
    [1, 2, 3, 4, 5, 6],
    (a, b) => (a * b) % 7,
    '\u00D7'
  ),
];

/**
 * BinaryOperationTableDiagram - Interactive operation table with property checking.
 * Select a set+operation, view the Cayley table, check algebraic properties.
 */
export function BinaryOperationTableDiagram() {
  const [structIdx, setStructIdx] = useState(0);
  const [highlightInverses, setHighlightInverses] = useState(false);

  const struct = STRUCTURES[structIdx];

  const inversePairs = useMemo(() => {
    const pairs = new Set<string>();
    if (struct.identity !== null) {
      struct.inverses.forEach((inv, el) => {
        if (inv !== null) {
          const key = [Math.min(el, inv), Math.max(el, inv)].join(',');
          pairs.add(key);
        }
      });
    }
    return pairs;
  }, [struct]);

  const isInversePair = (a: number, b: number): boolean => {
    const key = [Math.min(a, b), Math.max(a, b)].join(',');
    return inversePairs.has(key);
  };

  const properties = [
    { name: 'Замкнутость', value: struct.isClosed, desc: `Результат ${struct.opSymbol} всегда в множестве` },
    { name: 'Коммутативность', value: struct.isCommutative, desc: `a ${struct.opSymbol} b = b ${struct.opSymbol} a` },
    { name: 'Ассоциативность', value: struct.isAssociative, desc: `(a ${struct.opSymbol} b) ${struct.opSymbol} c = a ${struct.opSymbol} (b ${struct.opSymbol} c)` },
    { name: 'Нейтральный элемент', value: struct.identity !== null, desc: struct.identity !== null ? `e = ${struct.identity}` : 'не найден' },
    {
      name: 'Обратные элементы',
      value: struct.identity !== null && Array.from(struct.inverses.values()).every((v) => v !== null),
      desc: struct.identity !== null
        ? Array.from(struct.inverses.entries()).map(([el, inv]) => inv !== null ? `${el}\u207B\u00B9=${inv}` : `${el}: нет`).join(', ')
        : 'нет нейтрального',
    },
  ];

  return (
    <DiagramContainer title="Таблица операций и свойства" color="green">
      {/* Structure selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {STRUCTURES.map((s, i) => (
          <button
            key={i}
            onClick={() => { setStructIdx(i); setHighlightInverses(false); }}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: 'pointer',
              background: structIdx === i ? `${colors.success}25` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${structIdx === i ? colors.success : 'rgba(255,255,255,0.1)'}`,
              color: structIdx === i ? colors.success : colors.text,
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Operation table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{
                padding: '6px 10px',
                color: colors.textMuted,
                borderBottom: `1px solid ${colors.border}`,
                borderRight: `1px solid ${colors.border}`,
              }}>
                {struct.opSymbol}
              </th>
              {struct.elements.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '6px 10px',
                    color: col === struct.identity ? colors.success : colors.textMuted,
                    borderBottom: `1px solid ${colors.border}`,
                    fontWeight: col === struct.identity ? 700 : 400,
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {struct.elements.map((row) => (
              <tr key={row}>
                <td style={{
                  padding: '6px 10px',
                  color: row === struct.identity ? colors.success : colors.textMuted,
                  fontWeight: row === struct.identity ? 700 : 600,
                  borderRight: `1px solid ${colors.border}`,
                }}>
                  {row}
                </td>
                {struct.elements.map((col) => {
                  const result = struct.operation(row, col);
                  const isIdentityResult = result === struct.identity;
                  const isInvHighlight = highlightInverses && isIdentityResult && row !== struct.identity && col !== struct.identity;

                  return (
                    <td
                      key={col}
                      style={{
                        padding: '6px 10px',
                        textAlign: 'center',
                        background: isInvHighlight
                          ? `${colors.warning}25`
                          : isIdentityResult
                            ? `${colors.success}10`
                            : 'transparent',
                        border: `1px solid ${isInvHighlight ? colors.warning + '50' : 'rgba(255,255,255,0.05)'}`,
                        color: isInvHighlight ? colors.warning : isIdentityResult ? colors.success : colors.text,
                        fontWeight: isInvHighlight ? 700 : 400,
                      }}
                    >
                      {result}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toggle inverse highlight */}
      {struct.identity !== null && (
        <button
          onClick={() => setHighlightInverses(!highlightInverses)}
          style={{
            ...glassStyle,
            padding: '6px 14px',
            cursor: 'pointer',
            marginTop: 8,
            color: highlightInverses ? colors.warning : colors.textMuted,
            fontSize: 12,
            background: highlightInverses ? `${colors.warning}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${highlightInverses ? colors.warning + '40' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {highlightInverses ? 'Скрыть обратные пары' : 'Показать обратные пары'}
        </button>
      )}

      {/* Properties checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {properties.map((prop) => (
          <div
            key={prop.name}
            style={{
              ...glassStyle,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: prop.value ? `${colors.success}08` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${prop.value ? colors.success + '25' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <span style={{
              fontSize: 16,
              color: prop.value ? colors.success : colors.danger,
              flexShrink: 0,
            }}>
              {prop.value ? '\u2713' : '\u2717'}
            </span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>{prop.name}</span>
              <span style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>{prop.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {struct.isClosed && struct.isAssociative && struct.identity !== null &&
        Array.from(struct.inverses.values()).every((v) => v !== null) && (
          <DataBox
            label="Вывод"
            value={`(${struct.name}) образует группу!${struct.isCommutative ? ' (абелева группа)' : ''}`}
            variant="highlight"
          />
        )}
    </DiagramContainer>
  );
}
