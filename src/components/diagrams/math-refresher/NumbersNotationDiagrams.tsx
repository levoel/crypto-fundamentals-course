/**
 * Numbers & Notation Diagrams (MATH-01)
 *
 * Exports:
 * - NumberLineDiagram: Interactive number with base toggle (decimal/binary/hex)
 * - NotationDictionary: Math notation lookup with Python equivalents
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  NumberLineDiagram                                                    */
/* ------------------------------------------------------------------ */

type Base = 'decimal' | 'binary' | 'hex';

function toBase(n: number, base: Base): string {
  switch (base) {
    case 'decimal': return String(n);
    case 'binary': return '0b' + n.toString(2);
    case 'hex': return '0x' + n.toString(16).toUpperCase();
  }
}

function getBitPositions(n: number): { bit: number; value: number; position: number }[] {
  const bits: { bit: number; value: number; position: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const value = 1 << i;
    if (value <= 255) {
      bits.push({ bit: (n >> i) & 1, value, position: i });
    }
  }
  return bits;
}

function getNibbles(n: number): { high: string; low: string } {
  const hex = n.toString(16).toUpperCase().padStart(2, '0');
  return { high: hex[0], low: hex[1] };
}

/**
 * NumberLineDiagram - Interactive number line with base toggle.
 * Shows decimal, binary, hex representations simultaneously.
 * Binary view shows bit positions; hex view shows nibble grouping.
 */
export function NumberLineDiagram() {
  const [value, setValue] = useState(42);
  const [activeBase, setActiveBase] = useState<Base>('decimal');

  const bits = getBitPositions(value);
  const nibbles = getNibbles(value);

  const bases: { key: Base; label: string }[] = [
    { key: 'decimal', label: 'DEC' },
    { key: 'binary', label: 'BIN' },
    { key: 'hex', label: 'HEX' },
  ];

  // Number line: show 0-255, highlight current value
  const lineWidth = 400;
  const lineY = 30;
  const markerX = (value / 255) * lineWidth;

  return (
    <DiagramContainer title="Числа: десятичная, двоичная, шестнадцатеричная" color="blue">
      <InteractiveValue value={value} onChange={setValue} min={0} max={255} label="Число" />

      {/* Base toggle buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {bases.map((b) => (
          <button
            key={b.key}
            onClick={() => setActiveBase(b.key)}
            style={{
              ...glassStyle,
              padding: '6px 16px',
              cursor: 'pointer',
              background: activeBase === b.key ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeBase === b.key ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              color: activeBase === b.key ? colors.primary : colors.text,
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Number line SVG */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, overflowX: 'auto' }}>
        <svg width={lineWidth + 40} height={60} viewBox={`0 0 ${lineWidth + 40} 60`}>
          <line x1={20} y1={lineY} x2={lineWidth + 20} y2={lineY} stroke={colors.border} strokeWidth={2} />
          {/* Ticks at 0, 64, 128, 192, 255 */}
          {[0, 64, 128, 192, 255].map((t) => {
            const tx = 20 + (t / 255) * lineWidth;
            return (
              <g key={t}>
                <line x1={tx} y1={lineY - 6} x2={tx} y2={lineY + 6} stroke={colors.textMuted} strokeWidth={1} />
                <text x={tx} y={lineY + 20} textAnchor="middle" fill={colors.textMuted} fontSize={10} fontFamily="monospace">
                  {t}
                </text>
              </g>
            );
          })}
          {/* Current value marker */}
          <circle cx={20 + markerX} cy={lineY} r={6} fill={colors.primary} stroke={colors.primary} strokeWidth={2} />
          <text x={20 + markerX} y={lineY - 12} textAnchor="middle" fill={colors.primary} fontSize={12} fontFamily="monospace" fontWeight="bold">
            {toBase(value, activeBase)}
          </text>
        </svg>
      </div>

      {/* Three representations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
        <DataBox label="Десятичная" value={String(value)} variant={activeBase === 'decimal' ? 'highlight' : 'default'} />
        <DataBox label="Двоичная" value={toBase(value, 'binary')} variant={activeBase === 'binary' ? 'highlight' : 'default'} />
        <DataBox label="Шестнадцатеричная" value={toBase(value, 'hex')} variant={activeBase === 'hex' ? 'highlight' : 'default'} />
      </div>

      {/* Binary bit positions */}
      {activeBase === 'binary' && (
        <div style={{ ...glassStyle, padding: 12, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Разрядные значения (позиции битов):
          </div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {bits.map((b) => (
              <div
                key={b.position}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '4px 6px',
                  borderRadius: 6,
                  background: b.bit === 1 ? `${colors.primary}25` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${b.bit === 1 ? colors.primary + '40' : 'rgba(255,255,255,0.06)'}`,
                  minWidth: 40,
                }}
              >
                <span style={{ fontSize: 10, color: colors.textMuted }}>{b.value}</span>
                <span style={{ fontSize: 16, fontFamily: 'monospace', color: b.bit === 1 ? colors.primary : colors.textMuted, fontWeight: 600 }}>
                  {b.bit}
                </span>
              </div>
            ))}
          </div>
          {value > 0 && (
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 8, textAlign: 'center', fontFamily: 'monospace' }}>
              {bits.filter((b) => b.bit === 1).map((b) => b.value).join(' + ')} = {value}
            </div>
          )}
        </div>
      )}

      {/* Hex nibble grouping */}
      {activeBase === 'hex' && (
        <div style={{ ...glassStyle, padding: 12, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Группировка по 4 бита (ниблы):
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Старший нибл</div>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: `${colors.accent}20`,
                border: `1px solid ${colors.accent}40`,
                fontFamily: 'monospace',
                fontSize: 20,
                color: colors.accent,
                fontWeight: 600,
              }}>
                {nibbles.high}
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, fontFamily: 'monospace' }}>
                {value.toString(2).padStart(8, '0').slice(0, 4)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Младший нибл</div>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: `${colors.success}20`,
                border: `1px solid ${colors.success}40`,
                fontFamily: 'monospace',
                fontSize: 20,
                color: colors.success,
                fontWeight: 600,
              }}>
                {nibbles.low}
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, fontFamily: 'monospace' }}>
                {value.toString(2).padStart(8, '0').slice(4)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 8, textAlign: 'center', fontFamily: 'monospace' }}>
            0x{nibbles.high}{nibbles.low} = {parseInt(nibbles.high, 16)} * 16 + {parseInt(nibbles.low, 16)} = {value}
          </div>
        </div>
      )}

      {/* Conversion summary */}
      <div style={{ ...glassStyle, padding: 12, marginTop: 12 }}>
        <div style={{ fontSize: 13, color: colors.text, fontFamily: 'monospace', textAlign: 'center' }}>
          {value} = {toBase(value, 'binary')} = {toBase(value, 'hex')}
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  NotationDictionary                                                   */
/* ------------------------------------------------------------------ */

interface NotationEntry {
  symbol: string;
  reading: string;
  python: string;
  usedIn: string;
  example: string;
  examplePython: string;
}

const notationEntries: NotationEntry[] = [
  {
    symbol: '\u2261',
    reading: 'конгруэнтно',
    python: '% (оператор остатка)',
    usedIn: 'CRYPTO-01',
    example: 'a \u2261 b (mod n)',
    examplePython: 'a % n == b % n',
  },
  {
    symbol: '\u2200',
    reading: 'для всех',
    python: 'for ... in / all()',
    usedIn: 'CRYPTO-02',
    example: '\u2200 a \u2208 G: a * e = a',
    examplePython: 'all(a * e == a for a in G)',
  },
  {
    symbol: '\u2203',
    reading: 'существует',
    python: 'any()',
    usedIn: 'CRYPTO-02',
    example: '\u2203 x: a * x = e',
    examplePython: 'any(a * x == e for x in G)',
  },
  {
    symbol: '\u2208',
    reading: 'принадлежит',
    python: 'in',
    usedIn: 'CRYPTO-01, CRYPTO-02',
    example: 'a \u2208 Z_p',
    examplePython: 'a in Z_p',
  },
  {
    symbol: '\u2209',
    reading: 'не принадлежит',
    python: 'not in',
    usedIn: 'CRYPTO-02',
    example: '0 \u2209 Z*_p',
    examplePython: '0 not in Z_star_p',
  },
  {
    symbol: '|',
    reading: 'делит',
    python: '% == 0',
    usedIn: 'CRYPTO-01, CRYPTO-08',
    example: 'a | b',
    examplePython: 'b % a == 0',
  },
  {
    symbol: '\u27FA',
    reading: 'тогда и только тогда',
    python: '== (эквивалентность)',
    usedIn: 'CRYPTO-01',
    example: 'a \u2261 b (mod n) \u27FA n | (a - b)',
    examplePython: '(a % n == b % n) == ((a - b) % n == 0)',
  },
  {
    symbol: '\u2192',
    reading: 'следует / отображение',
    python: 'if...then / lambda',
    usedIn: 'CRYPTO-02, CRYPTO-04',
    example: 'f: A \u2192 B',
    examplePython: 'f = lambda a: ...',
  },
  {
    symbol: '\u2205',
    reading: 'пустое множество',
    python: 'set()',
    usedIn: 'CRYPTO-02',
    example: 'A \u2229 B = \u2205',
    examplePython: 'A & B == set()',
  },
  {
    symbol: '\u2282',
    reading: 'подмножество',
    python: 'issubset() / <',
    usedIn: 'CRYPTO-02',
    example: 'Z*_p \u2282 Z_p',
    examplePython: 'Z_star_p < Z_p',
  },
  {
    symbol: '\u222A',
    reading: 'объединение',
    python: '| (для set)',
    usedIn: 'CRYPTO-02',
    example: 'A \u222A B',
    examplePython: 'A | B',
  },
  {
    symbol: '\u2229',
    reading: 'пересечение',
    python: '& (для set)',
    usedIn: 'CRYPTO-02',
    example: 'A \u2229 B',
    examplePython: 'A & B',
  },
];

/**
 * NotationDictionary - Interactive math notation lookup.
 * 12 symbols with Russian reading, Python equivalent, and usage context.
 * Click to expand with concrete example.
 */
export function NotationDictionary() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <DiagramContainer title="Словарь математической нотации" color="purple">
      <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
        Нажмите на символ, чтобы увидеть пример использования ({notationEntries.length} символов)
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 13 }}>
          <thead>
            <tr>
              {['Символ', 'Читается', 'Python', 'Где'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '8px 10px',
                    textAlign: 'left',
                    color: colors.textMuted,
                    fontSize: 11,
                    borderBottom: `1px solid ${colors.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notationEntries.map((entry, i) => (
              <>
                <tr
                  key={`row-${i}`}
                  onClick={() => setSelected(selected === i ? null : i)}
                  style={{
                    cursor: 'pointer',
                    background: selected === i ? `${colors.secondary}15` : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{
                    padding: '8px 10px',
                    fontSize: 18,
                    color: selected === i ? colors.secondary : colors.text,
                    borderBottom: selected === i ? 'none' : `1px solid rgba(255,255,255,0.05)`,
                  }}>
                    {entry.symbol}
                  </td>
                  <td style={{
                    padding: '8px 10px',
                    color: colors.text,
                    borderBottom: selected === i ? 'none' : `1px solid rgba(255,255,255,0.05)`,
                  }}>
                    {entry.reading}
                  </td>
                  <td style={{
                    padding: '8px 10px',
                    color: colors.accent,
                    borderBottom: selected === i ? 'none' : `1px solid rgba(255,255,255,0.05)`,
                  }}>
                    {entry.python}
                  </td>
                  <td style={{
                    padding: '8px 10px',
                    color: colors.textMuted,
                    fontSize: 11,
                    borderBottom: selected === i ? 'none' : `1px solid rgba(255,255,255,0.05)`,
                    whiteSpace: 'nowrap',
                  }}>
                    {entry.usedIn}
                  </td>
                </tr>
                {selected === i && (
                  <tr key={`example-${i}`}>
                    <td
                      colSpan={4}
                      style={{
                        padding: '8px 10px 12px',
                        borderBottom: `1px solid rgba(255,255,255,0.05)`,
                        background: `${colors.secondary}08`,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${colors.secondary}30`,
                        }}>
                          <span style={{ fontSize: 11, color: colors.textMuted }}>Математика: </span>
                          <span style={{ color: colors.text }}>{entry.example}</span>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${colors.accent}30`,
                        }}>
                          <span style={{ fontSize: 11, color: colors.textMuted }}>Python: </span>
                          <span style={{ color: colors.accent }}>{entry.examplePython}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </DiagramContainer>
  );
}
