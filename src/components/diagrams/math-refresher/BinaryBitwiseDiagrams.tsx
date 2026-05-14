/** @jsxImportSource solid-js */
/**
 * Binary & Bitwise Diagrams (MATH-04)
 *
 * Exports:
 * - BitwiseOperationsDiagram: Interactive bitwise operation visualizer (AND, OR, XOR, NOT, <<, >>)
 * - HexConverterDiagram: Interactive decimal/binary/hex converter with nibble grouping
 */

import { createMemo, createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
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

const OP_BUTTONS: { key: BitwiseOp; label: string; symbol: string; tooltip: string }[] = [
  { key: 'AND', label: 'AND', symbol: '&', tooltip: 'Побитовое И: результат = 1, только если оба бита = 1. Используется для маскирования (извлечения определённых бит). Например, n & 0xFF извлекает последний байт.' },
  { key: 'OR', label: 'OR', symbol: '|', tooltip: 'Побитовое ИЛИ: результат = 1, если хотя бы один бит = 1. Используется для установки флагов и комбинирования битовых масок в правах доступа смарт-контрактов.' },
  { key: 'XOR', label: 'XOR', symbol: '^', tooltip: 'Исключающее ИЛИ: результат = 1, если биты различны. Главная операция криптографии: a ^ b ^ b = a (обратимость). Основа OTP, потоковых шифров, Feistel-сетей в AES.' },
  { key: 'NOT', label: 'NOT', symbol: '~', tooltip: 'Побитовая инверсия: все биты меняются на противоположные. Используется в дополнительном коде для представления отрицательных чисел и в хеш-функциях.' },
  { key: 'SHL', label: 'Left Shift', symbol: '<<', tooltip: 'Сдвиг влево: все биты сдвигаются на одну позицию влево (эквивалент умножения на 2). В SHA-256 активно используются сдвиги и вращения для диффузии битов.' },
  { key: 'SHR', label: 'Right Shift', symbol: '>>', tooltip: 'Сдвиг вправо: все биты сдвигаются на одну позицию вправо (эквивалент целочисленного деления на 2). Применяется в алгоритмах быстрого возведения в степень (square-and-multiply) для RSA.' },
];

/**
 * BitwiseOperationsDiagram - Interactive bitwise operation visualizer.
 * Two 8-bit inputs with AND, OR, XOR, NOT, <<, >> operations.
 * Shows bit-by-bit results with color coding.
 */
export function BitwiseOperationsDiagram() {
  const [a, setA] = createSignal(170); // 0xAA = 10101010
  const [b, setB] = createSignal(85);  // 0x55 = 01010101
  const [op, setOp] = createSignal<BitwiseOp>('AND');

  const result = applyOp(a(), b(), op());
  const aBits = toBin8(a());
  const bBits = toBin8(b());
  const resultBits = toBin8(result);

  const isUnary = op() === 'NOT' || op() === 'SHL' || op() === 'SHR';
  const isBitwise = op() === 'AND' || op() === 'OR' || op() === 'XOR' || op() === 'NOT';

  return (
    <DiagramContainer title="Битовые операции" color="blue">
      <InteractiveValue value={a()} onChange={setA} min={0} max={255} label="A" />
      {!isUnary && (
        <div style={{ 'margin-top': '8px' }}>
          <InteractiveValue value={b()} onChange={setB} min={0} max={255} label="B" />
        </div>
      )}

      {/* Operation selector */}
      <div style={{ 'display': 'flex', 'gap': '6px', 'flex-wrap': 'wrap', 'margin-top': '12px' }}>
        {OP_BUTTONS.map((btn) => (
          <DiagramTooltip content={btn.tooltip}>
            <div>
              <button
                onClick={() => setOp(btn.key)}
                style={{
                  ...glassStyle,
                  'padding': '6px 14px',
                  'cursor': 'pointer',
                  'background': op() === btn.key ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
                  'border': `1px solid ${op() === btn.key ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                  'color': op() === btn.key ? colors.primary : colors.text,
                  'font-size': '13px',
                  'font-family': 'monospace',
                }}
              >
                {btn.symbol} {btn.label}
              </button>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Bit-by-bit visualization */}
      <div style={{ ...glassStyle, 'padding': '12px', 'margin-top': '12px' }}>
        <div style={{ 'overflow-x': 'auto' }}>
          <table style={{ 'width': '100%', 'border-collapse': 'collapse', 'font-family': 'monospace', 'font-size': '14px' }}>
            <thead>
              <tr>
                <td style={{ 'padding': '4px 8px', 'color': colors.textMuted, 'font-size': '11px', 'width': '40px' }}></td>
                {Array.from({ length: 8 }, (_, i) => (
                  <th style={{ 'padding': '4px 8px', 'color': colors.textMuted, 'font-size': '10px', 'text-align': 'center' }}>
                    {7 - i}
                  </th>
                ))}
                <td style={{ 'padding': '4px 8px', 'color': colors.textMuted, 'font-size': '11px', 'text-align': 'right', 'width': '60px' }}>DEC</td>
              </tr>
            </thead>
            <tbody>
              {/* Row A */}
              <tr>
                <td style={{ 'padding': '4px 8px', 'color': colors.primary, 'font-weight': '600' }}>A</td>
                {aBits.split('').map((bit, i) => (
                  <td style={{
                    'padding': '6px 8px',
                    'text-align': 'center',
                    'color': bit === '1' ? colors.success : colors.textMuted,
                    'background': bit === '1' ? `${colors.success}15` : 'transparent',
                    'border-radius': '4px',
                    'font-weight': '600',
                  }}>
                    {bit}
                  </td>
                ))}
                <td style={{ 'padding': '4px 8px', 'color': colors.text, 'text-align': 'right' }}>{a()}</td>
              </tr>

              {/* Row B (for binary ops) */}
              {!isUnary && (
                <tr>
                  <td style={{ 'padding': '4px 8px', 'color': colors.accent, 'font-weight': '600' }}>B</td>
                  {bBits.split('').map((bit, i) => (
                    <td style={{
                      'padding': '6px 8px',
                      'text-align': 'center',
                      'color': bit === '1' ? colors.success : colors.textMuted,
                      'background': bit === '1' ? `${colors.success}15` : 'transparent',
                      'border-radius': '4px',
                      'font-weight': '600',
                    }}>
                      {bit}
                    </td>
                  ))}
                  <td style={{ 'padding': '4px 8px', 'color': colors.text, 'text-align': 'right' }}>{b()}</td>
                </tr>
              )}

              {/* Separator */}
              <tr>
                <td style={{ 'padding': '2px 8px', 'color': colors.textMuted }}>{getOpSymbol(op())}</td>
                {Array.from({ length: 8 }, (_, i) => (
                  <td style={{ 'border-bottom': `2px solid ${colors.border}`, 'padding': '2px' }}></td>
                ))}
                <td style={{ 'border-bottom': `2px solid ${colors.border}`, 'padding': '2px' }}></td>
              </tr>

              {/* Result row */}
              <tr>
                <td style={{ 'padding': '4px 8px', 'color': colors.warning, 'font-weight': '600' }}>R</td>
                {resultBits.split('').map((bit, i) => {
                  const isChanged = isBitwise && (
                    op() === 'NOT'
                      ? bit !== aBits[i]
                      : bit !== aBits[i] || bit !== bBits[i]
                  );
                  return (
                    <td style={{
                      'padding': '6px 8px',
                      'text-align': 'center',
                      'color': bit === '1' ? colors.warning : colors.textMuted,
                      'background': bit === '1' ? `${colors.warning}20` : 'transparent',
                      'border-radius': '4px',
                      'font-weight': '700',
                      'font-size': '15px',
                    }}>
                      {bit}
                    </td>
                  );
                })}
                <td style={{ 'padding': '4px 8px', 'color': colors.warning, 'text-align': 'right', 'font-weight': '700' }}>{result}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Three representations */}
      <div style={{ 'display': 'grid', 'grid-template-columns': 'repeat(3, 1fr)', 'gap': '8px', 'margin-top': '12px' }}>
        <DiagramTooltip content="Двоичное представление результата операции. Побитовые операции наиболее наглядны именно в двоичной форме -- виден результат для каждого бита.">
          <DataBox
            label="Двоичная"
            value={isUnary
              ? `${getOpSymbol(op())}${aBits} = ${resultBits}`
              : `${aBits} ${getOpSymbol(op())} ${bBits} = ${resultBits}`}
            variant="default"
          />
        </DiagramTooltip>
        <DiagramTooltip content="Десятичное представление того же результата. Побитовые операции в десятичной форме менее интуитивны -- одно число может сильно отличаться от исходных.">
          <DataBox
            label="Десятичная"
            value={isUnary
              ? `${getOpSymbol(op())}${a()} = ${result}`
              : `${a()} ${getOpSymbol(op())} ${b()} = ${result}`}
            variant="default"
          />
        </DiagramTooltip>
        <DiagramTooltip content="Синтаксис Python для побитовых операций совпадает с математической нотацией: &, |, ^, ~, <<, >>. Все операции работают на уровне отдельных бит целого числа.">
          <DataBox
            label="Python"
            value={getPythonExpr(a(), b(), op()) + ` = ${result}`}
            variant="highlight"
          />
        </DiagramTooltip>
      </div>

      {/* XOR special note */}
      {op() === 'XOR' && (
        <DiagramTooltip content="Свойство самообратимости XOR: a XOR key XOR key = a. One-Time Pad (OTP) -- теоретически невзломаемый шифр, основанный исключительно на XOR. AES, ChaCha20, Salsa20 -- все используют XOR как ключевую операцию шифрования.">
          <div style={{
            ...glassStyle,
            'padding': '8px 12px',
            'margin-top': '8px',
            'font-size': '12px',
            'color': colors.info,
            'background': `${colors.info}10`,
            'border': `1px solid ${colors.info}25`,
          }}>
            XOR -- король криптографии: обратим! a ^ b ^ b = a. Именно поэтому XOR используется повсюду в шифровании.
          </div>
        </DiagramTooltip>
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
  const [value, setValue] = createSignal(255);

  const { nibbles, bits } = createMemo(() => toNibbles(value()));

  const binStr = value().toString(2).padStart(16, '0');
  const hexStr = value().toString(16).toUpperCase().padStart(4, '0');

  // Find leading non-zero nibble for display
  const significantStart = Math.max(0, nibbles.findIndex((n) => n !== '0'));

  return (
    <DiagramContainer title="Конвертер: десятичная / двоичная / hex" color="purple">
      <InteractiveValue value={value()} onChange={setValue} min={0} max={65535} label="Число" />

      {/* Three representations */}
      <div style={{ 'display': 'grid', 'grid-template-columns': 'repeat(3, 1fr)', 'gap': '8px', 'margin-top': '12px' }}>
        <DiagramTooltip content="Десятичное значение (основание 10). Диапазон 0-65535 -- это одно 16-битное слово. В Ethereum gas-лимиты и wei-значения хранятся как uint256 (32 байта).">
          <DataBox label="Десятичная" value={String(value())} variant="default" />
        </DiagramTooltip>
        <DiagramTooltip content="Двоичное представление с префиксом 0b. 16 бит показаны полностью, включая ведущие нули. Криптографические ключи -- последовательности бит (256 для ECDSA, 128/256 для AES).">
          <DataBox label="Двоичная" value={'0b' + binStr} variant="default" />
        </DiagramTooltip>
        <DiagramTooltip content="Hex с префиксом 0x -- стандарт записи в блокчейне. Ethereum-адрес: 0x + 40 hex-символов = 20 байт. Keccak256-хеш: 0x + 64 hex-символа = 32 байта.">
          <DataBox label="Шестнадцатеричная" value={'0x' + hexStr} variant="highlight" />
        </DiagramTooltip>
      </div>

      {/* Nibble grouping visualization */}
      <div style={{ ...glassStyle, 'padding': '16px', 'margin-top': '12px' }}>
        <DiagramTooltip content="Нибл (nibble) = 4 бита = один hex-символ. Это ключевое соответствие: каждый байт в hex записывается ровно двумя символами, что делает hex идеальным форматом для отображения криптографических данных.">
          <div style={{ 'font-size': '12px', 'color': colors.textMuted, 'margin-bottom': '12px', 'text-align': 'center' }}>
            Каждый hex-символ = 4 бита (нибл)
          </div>
        </DiagramTooltip>

        <div style={{ 'display': 'flex', 'justify-content': 'center', 'gap': '16px', 'flex-wrap': 'wrap' }}>
          {nibbles.map((nibble, ni) => {
            const nibbleColor = ni < 2 ? colors.accent : colors.success;
            const isZeroNibble = ni < significantStart;

            return (
              <div
                style={{
                  'display': 'flex',
                  'flex-direction': 'column',
                  'align-items': 'center',
                  'gap': '6px',
                  'opacity': isZeroNibble ? 0.4 : 1,
                }}
              >
                {/* Hex digit */}
                <div style={{
                  'padding': '8px 16px',
                  'border-radius': '8px',
                  'background': `${nibbleColor}20`,
                  'border': `1px solid ${nibbleColor}40`,
                  'font-family': 'monospace',
                  'font-size': '22px',
                  'color': nibbleColor,
                  'font-weight': '700',
                }}>
                  {nibble}
                </div>

                {/* Arrow */}
                <div style={{ 'color': colors.textMuted, 'font-size': '10px' }}>|</div>

                {/* 4-bit group */}
                <div style={{ 'display': 'flex', 'gap': '2px' }}>
                  {bits[ni].map((bit, bi) => (
                    <div
                      style={{
                        'width': '22px',
                        'height': '28px',
                        'display': 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        'border-radius': '4px',
                        'background': bit === '1' ? `${nibbleColor}20` : 'rgba(255,255,255,0.03)',
                        'border': `1px solid ${bit === '1' ? nibbleColor + '40' : 'rgba(255,255,255,0.08)'}`,
                        'font-family': 'monospace',
                        'font-size': '13px',
                        'color': bit === '1' ? nibbleColor : colors.textMuted,
                        'font-weight': bit === '1' ? 600 : 400,
                      }}
                    >
                      {bit}
                    </div>
                  ))}
                </div>

                {/* Nibble label */}
                <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
                  Нибл {ni}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Python equivalents */}
      <DiagramTooltip content="Python нативно поддерживает работу с числами произвольной длины и различными системами счисления. bin() и hex() возвращают строковые представления, а int() с указанием основания парсит обратно.">
        <div style={{ ...glassStyle, 'padding': '12px', 'margin-top': '12px' }}>
          <div style={{ 'font-size': '12px', 'color': colors.textMuted, 'margin-bottom': '6px' }}>Python:</div>
        <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '4px', 'font-family': 'monospace', 'font-size': '12px' }}>
          <div style={{ 'color': colors.accent }}>
            bin({value()}) = '{`0b${value.toString(2)}`}'
          </div>
          <div style={{ 'color': colors.success }}>
            hex({value()}) = '{`0x${value.toString(16)}`}'
          </div>
          <div style={{ 'color': colors.text }}>
            int('{`0x${hexStr}`}', 16) = {value()}
          </div>
        </div>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}
