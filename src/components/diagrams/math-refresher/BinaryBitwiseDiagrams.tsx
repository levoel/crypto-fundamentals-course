/**
 * Binary & Bitwise Diagrams (MATH-04)
 *
 * Exports:
 * - BitwiseOperationsDiagram: Interactive bitwise operation visualizer (AND, OR, XOR, NOT, <<, >>)
 * - HexConverterDiagram: Interactive decimal/binary/hex converter with nibble grouping
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  BitwiseOperationsDiagram                                            */
/* ------------------------------------------------------------------ */

type BitwiseOp = 'AND' | 'OR' | 'XOR' | 'NOT' | 'SHL' | 'SHR';

function toBin8(n: number): string {
  return (n & 0xFF).toString(2).padStart(8, '0');
}

function applyOp(a: number, b: number, op: BitwiseOp): number {
  const mask = 0xFF;
  switch (op) {
    case 'AND': return (a & b) & mask;
    case 'OR': return (a | b) & mask;
    case 'XOR': return (a ^ b) & mask;
    case 'NOT': return (~a) & mask;
    case 'SHL': return (a << 1) & mask;
    case 'SHR': return (a >> 1) & mask;
  }
}

function getOpSymbol(op: BitwiseOp): string {
  switch (op) {
    case 'AND': return '&';
    case 'OR': return '|';
    case 'XOR': return '^';
    case 'NOT': return '~';
    case 'SHL': return '<<';
    case 'SHR': return '>>';
  }
}

function getPythonExpr(a: number, b: number, op: BitwiseOp): string {
  switch (op) {
    case 'AND': return `${a} & ${b}`;
    case 'OR': return `${a} | ${b}`;
    case 'XOR': return `${a} ^ ${b}`;
    case 'NOT': return `~${a} & 0xFF`;
    case 'SHL': return `${a} << 1 & 0xFF`;
    case 'SHR': return `${a} >> 1`;
  }
}

function getBitResult(aBit: number, bBit: number, op: BitwiseOp): number {
  switch (op) {
    case 'AND': return aBit & bBit;
    case 'OR': return aBit | bBit;
    case 'XOR': return aBit ^ bBit;
    case 'NOT': return aBit === 0 ? 1 : 0;
    case 'SHL': return 0; // handled at word level
    case 'SHR': return 0;
  }
}

const OP_BUTTONS: { key: BitwiseOp; label: string; symbol: string }[] = [
  { key: 'AND', label: 'AND', symbol: '&' },
  { key: 'OR', label: 'OR', symbol: '|' },
  { key: 'XOR', label: 'XOR', symbol: '^' },
  { key: 'NOT', label: 'NOT', symbol: '~' },
  { key: 'SHL', label: 'Left Shift', symbol: '<<' },
  { key: 'SHR', label: 'Right Shift', symbol: '>>' },
];

/**
 * BitwiseOperationsDiagram - Interactive bitwise operation visualizer.
 * Two 8-bit inputs with AND, OR, XOR, NOT, <<, >> operations.
 * Shows bit-by-bit results with color coding.
 */
export function BitwiseOperationsDiagram() {
  const [a, setA] = useState(170); // 0xAA = 10101010
  const [b, setB] = useState(85);  // 0x55 = 01010101
  const [op, setOp] = useState<BitwiseOp>('AND');

  const result = applyOp(a, b, op);
  const aBits = toBin8(a);
  const bBits = toBin8(b);
  const resultBits = toBin8(result);

  const isUnary = op === 'NOT' || op === 'SHL' || op === 'SHR';
  const isBitwise = op === 'AND' || op === 'OR' || op === 'XOR' || op === 'NOT';

  return (
    <DiagramContainer title="Битовые операции" color="blue">
      <InteractiveValue value={a} onChange={setA} min={0} max={255} label="A" />
      {!isUnary && (
        <div style={{ marginTop: 8 }}>
          <InteractiveValue value={b} onChange={setB} min={0} max={255} label="B" />
        </div>
      )}

      {/* Operation selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {OP_BUTTONS.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setOp(btn.key)}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: 'pointer',
              background: op === btn.key ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${op === btn.key ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              color: op === btn.key ? colors.primary : colors.text,
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            {btn.symbol} {btn.label}
          </button>
        ))}
      </div>

      {/* Bit-by-bit visualization */}
      <div style={{ ...glassStyle, padding: 12, marginTop: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 14 }}>
            <thead>
              <tr>
                <td style={{ padding: '4px 8px', color: colors.textMuted, fontSize: 11, width: 40 }}></td>
                {Array.from({ length: 8 }, (_, i) => (
                  <th key={i} style={{ padding: '4px 8px', color: colors.textMuted, fontSize: 10, textAlign: 'center' }}>
                    {7 - i}
                  </th>
                ))}
                <td style={{ padding: '4px 8px', color: colors.textMuted, fontSize: 11, textAlign: 'right', width: 60 }}>DEC</td>
              </tr>
            </thead>
            <tbody>
              {/* Row A */}
              <tr>
                <td style={{ padding: '4px 8px', color: colors.primary, fontWeight: 600 }}>A</td>
                {aBits.split('').map((bit, i) => (
                  <td key={i} style={{
                    padding: '6px 8px',
                    textAlign: 'center',
                    color: bit === '1' ? colors.success : colors.textMuted,
                    background: bit === '1' ? `${colors.success}15` : 'transparent',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}>
                    {bit}
                  </td>
                ))}
                <td style={{ padding: '4px 8px', color: colors.text, textAlign: 'right' }}>{a}</td>
              </tr>

              {/* Row B (for binary ops) */}
              {!isUnary && (
                <tr>
                  <td style={{ padding: '4px 8px', color: colors.accent, fontWeight: 600 }}>B</td>
                  {bBits.split('').map((bit, i) => (
                    <td key={i} style={{
                      padding: '6px 8px',
                      textAlign: 'center',
                      color: bit === '1' ? colors.success : colors.textMuted,
                      background: bit === '1' ? `${colors.success}15` : 'transparent',
                      borderRadius: 4,
                      fontWeight: 600,
                    }}>
                      {bit}
                    </td>
                  ))}
                  <td style={{ padding: '4px 8px', color: colors.text, textAlign: 'right' }}>{b}</td>
                </tr>
              )}

              {/* Separator */}
              <tr>
                <td style={{ padding: '2px 8px', color: colors.textMuted }}>{getOpSymbol(op)}</td>
                {Array.from({ length: 8 }, (_, i) => (
                  <td key={i} style={{ borderBottom: `2px solid ${colors.border}`, padding: '2px' }}></td>
                ))}
                <td style={{ borderBottom: `2px solid ${colors.border}`, padding: '2px' }}></td>
              </tr>

              {/* Result row */}
              <tr>
                <td style={{ padding: '4px 8px', color: colors.warning, fontWeight: 600 }}>R</td>
                {resultBits.split('').map((bit, i) => {
                  const isChanged = isBitwise && (
                    op === 'NOT'
                      ? bit !== aBits[i]
                      : bit !== aBits[i] || bit !== bBits[i]
                  );
                  return (
                    <td key={i} style={{
                      padding: '6px 8px',
                      textAlign: 'center',
                      color: bit === '1' ? colors.warning : colors.textMuted,
                      background: bit === '1' ? `${colors.warning}20` : 'transparent',
                      borderRadius: 4,
                      fontWeight: 700,
                      fontSize: 15,
                    }}>
                      {bit}
                    </td>
                  );
                })}
                <td style={{ padding: '4px 8px', color: colors.warning, textAlign: 'right', fontWeight: 700 }}>{result}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Three representations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
        <DataBox
          label="Двоичная"
          value={isUnary
            ? `${getOpSymbol(op)}${aBits} = ${resultBits}`
            : `${aBits} ${getOpSymbol(op)} ${bBits} = ${resultBits}`}
          variant="default"
        />
        <DataBox
          label="Десятичная"
          value={isUnary
            ? `${getOpSymbol(op)}${a} = ${result}`
            : `${a} ${getOpSymbol(op)} ${b} = ${result}`}
          variant="default"
        />
        <DataBox
          label="Python"
          value={getPythonExpr(a, b, op) + ` = ${result}`}
          variant="highlight"
        />
      </div>

      {/* XOR special note */}
      {op === 'XOR' && (
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          marginTop: 8,
          fontSize: 12,
          color: colors.info,
          background: `${colors.info}10`,
          border: `1px solid ${colors.info}25`,
        }}>
          XOR -- король криптографии: обратим! a ^ b ^ b = a. Именно поэтому XOR используется повсюду в шифровании.
        </div>
      )}
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  HexConverterDiagram                                                */
/* ------------------------------------------------------------------ */

function toNibbles(n: number): { nibbles: string[]; bits: string[][] } {
  const bin = n.toString(2).padStart(16, '0');
  const hex = n.toString(16).toUpperCase().padStart(4, '0');
  const nibbles: string[] = [];
  const bits: string[][] = [];

  for (let i = 0; i < 4; i++) {
    nibbles.push(hex[i]);
    bits.push(bin.slice(i * 4, i * 4 + 4).split(''));
  }

  return { nibbles, bits };
}

/**
 * HexConverterDiagram - Interactive decimal/binary/hex converter.
 * Shows nibble grouping and conversion process.
 */
export function HexConverterDiagram() {
  const [value, setValue] = useState(255);

  const { nibbles, bits } = useMemo(() => toNibbles(value), [value]);

  const binStr = value.toString(2).padStart(16, '0');
  const hexStr = value.toString(16).toUpperCase().padStart(4, '0');

  // Find leading non-zero nibble for display
  const significantStart = Math.max(0, nibbles.findIndex((n) => n !== '0'));

  return (
    <DiagramContainer title="Конвертер: десятичная / двоичная / hex" color="purple">
      <InteractiveValue value={value} onChange={setValue} min={0} max={65535} label="Число" />

      {/* Three representations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
        <DataBox label="Десятичная" value={String(value)} variant="default" />
        <DataBox label="Двоичная" value={'0b' + binStr} variant="default" />
        <DataBox label="Шестнадцатеричная" value={'0x' + hexStr} variant="highlight" />
      </div>

      {/* Nibble grouping visualization */}
      <div style={{ ...glassStyle, padding: 16, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12, textAlign: 'center' }}>
          Каждый hex-символ = 4 бита (нибл)
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {nibbles.map((nibble, ni) => {
            const nibbleColor = ni < 2 ? colors.accent : colors.success;
            const isZeroNibble = ni < significantStart;

            return (
              <div
                key={ni}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: isZeroNibble ? 0.4 : 1,
                }}
              >
                {/* Hex digit */}
                <div style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: `${nibbleColor}20`,
                  border: `1px solid ${nibbleColor}40`,
                  fontFamily: 'monospace',
                  fontSize: 22,
                  color: nibbleColor,
                  fontWeight: 700,
                }}>
                  {nibble}
                </div>

                {/* Arrow */}
                <div style={{ color: colors.textMuted, fontSize: 10 }}>|</div>

                {/* 4-bit group */}
                <div style={{ display: 'flex', gap: 2 }}>
                  {bits[ni].map((bit, bi) => (
                    <div
                      key={bi}
                      style={{
                        width: 22,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        background: bit === '1' ? `${nibbleColor}20` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${bit === '1' ? nibbleColor + '40' : 'rgba(255,255,255,0.08)'}`,
                        fontFamily: 'monospace',
                        fontSize: 13,
                        color: bit === '1' ? nibbleColor : colors.textMuted,
                        fontWeight: bit === '1' ? 600 : 400,
                      }}
                    >
                      {bit}
                    </div>
                  ))}
                </div>

                {/* Nibble label */}
                <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                  Нибл {ni}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Python equivalents */}
      <div style={{ ...glassStyle, padding: 12, marginTop: 12 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Python:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 12 }}>
          <div style={{ color: colors.accent }}>
            bin({value}) = '{`0b${value.toString(2)}`}'
          </div>
          <div style={{ color: colors.success }}>
            hex({value}) = '{`0x${value.toString(16)}`}'
          </div>
          <div style={{ color: colors.text }}>
            int('{`0x${hexStr}`}', 16) = {value}
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
