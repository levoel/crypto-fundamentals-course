/** @jsxImportSource solid-js */
/**
 * Integer Overflow Diagrams (SEC-03)
 *
 * Exports:
 * - OverflowVisualizationDiagram: Interactive uint8 slider with "+1 safe" and "+1 unchecked" buttons.
 *   Three scenario cards (safe, unchecked, downcasting) demonstrating overflow risks.
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  OverflowVisualizationDiagram                                         */
/* ================================================================== */

interface ScenarioCard {
  title: string;
  code: string;
  description: string;
  color: string;
}

const SCENARIOS: ScenarioCard[] = [
  {
    title: 'Safe (Solidity 0.8+ default)',
    code: 'uint8 x = 255; x += 1; // REVERT!',
    description: 'По умолчанию Solidity 0.8+ проверяет переполнение. Попытка 255 + 1 для uint8 вызывает revert с Panic(0x11). Безопасное поведение -- транзакция откатывается.',
    color: colors.success,
  },
  {
    title: 'Unchecked (опасно!)',
    code: 'unchecked { uint8 x = 255; x += 1; } // x = 0',
    description: 'В блоке unchecked {} проверки отключены для экономии gas (~120 gas за операцию). 255 + 1 оборачивается в 0. Используйте unchecked ТОЛЬКО когда overflow математически невозможен.',
    color: '#f43f5e',
  },
  {
    title: 'Unsafe Downcast (скрытая опасность)',
    code: 'uint256 big = 256; uint8 small = uint8(big); // small = 0',
    description: 'Приведение типов (downcasting) НЕ проверяется даже в Solidity 0.8+. uint8(256) молча обрезает до 0. Используйте SafeCast из OpenZeppelin для безопасного приведения.',
    color: '#f59e0b',
  },
];

/**
 * OverflowVisualizationDiagram
 *
 * Interactive uint8 slider (0-255) with "+1 safe" and "+1 unchecked" buttons.
 * Demonstrates three overflow scenarios: safe revert, unchecked wrap, unsafe downcast.
 */
export function OverflowVisualizationDiagram() {
  const [value, setValue] = createSignal(250);
  const [mode, setMode] = createSignal<'idle' | 'safe_revert' | 'unchecked_wrap'>('idle');
  const [downcastInput, setDowncastInput] = createSignal(256);

  // Simulate "+1 safe" -- revert if overflow
  const handleSafeAdd = () => {
    if (value() >= 255) {
      setMode('safe_revert');
    } else {
      setValue((v) => v + 1);
      setMode('idle');
    }
  };

  // Simulate "+1 unchecked" -- wrap on overflow
  const handleUncheckedAdd = () => {
    if (value() >= 255) {
      setValue(0);
      setMode('unchecked_wrap');
    } else {
      setValue((v) => v + 1);
      setMode('idle');
    }
  };

  // Binary representation
  const toBinary = (n: number) => n.toString(2).padStart(8, '0');

  // Downcast result
  const downcastResult = downcastInput() & 0xff; // uint8 truncation

  return (
    <DiagramContainer title="Integer Overflow: uint8 (0-255)" color="amber">
      {/* Current value display */}
      <div style={{
        'display': 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        'gap': '24px',
        'margin-bottom': '16px',
      }}>
        <DiagramTooltip content="Десятичное представление uint8. Диапазон: 0-255. При приближении к максимуму (250+) значение подсвечивается красным -- зона риска переполнения.">
          <div style={{ 'text-align': 'center' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Decimal
            </div>
            <div style={{
              'font-size': '32px',
              'font-weight': '700',
              'font-family': 'monospace',
              'color': value() >= 250 ? '#f43f5e' : colors.text,
            }}>
              {value()}
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Двоичное (binary) представление числа. uint8 -- это 8 бит. Когда все биты = 1 (11111111), значение = 255 -- максимум. Следующий +1 обнуляет все биты.">
          <div style={{ 'text-align': 'center' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Binary
            </div>
            <div style={{
              'font-size': '20px',
              'font-family': 'monospace',
              'color': colors.accent,
              'letter-spacing': '2px',
            }}>
              {toBinary(value())}
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Шестнадцатеричное (hex) представление. 0xFF = 255 -- максимальное значение uint8. В Solidity и EVM hex-формат используется повсеместно для адресов, данных и storage.">
          <div style={{ 'text-align': 'center' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Hex
            </div>
            <div style={{
              'font-size': '20px',
              'font-family': 'monospace',
              'color': colors.primary,
            }}>
              0x{value().toString(16).toUpperCase().padStart(2, '0')}
            </div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Slider */}
      <div style={{ 'margin-bottom': '16px', 'padding': '0 8px' }}>
        <input
          type="range"
          min={0}
          max={255}
          step={1}
          value={value()}
          onChange={(e) => { setValue(Number(e.target.value)); setMode('idle'); }}
          style={{ 'width': '100%', 'accent-color': value() >= 250 ? '#f43f5e' : colors.primary }}
        />
        <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
          <span>0</span>
          <span>128</span>
          <span>255 (max)</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center', 'margin-bottom': '16px' }}>
        <DiagramTooltip content="Безопасное сложение (checked arithmetic). В Solidity 0.8+ при переполнении транзакция откатывается с Panic(0x11). Это поведение по умолчанию.">
          <div style={{ 'display': 'inline-block' }}>
            <button
              onClick={handleSafeAdd}
              style={{
                ...glassStyle,
                'padding': '10px 20px',
                'cursor': 'pointer',
                'color': colors.success,
                'font-size': '13px',
                'font-family': 'monospace',
                'font-weight': '600',
                'border': `1px solid ${colors.success}40`,
              }}
            >
              +1 safe (checked)
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Небезопасное сложение (unchecked). В блоке unchecked {} проверки отключены для экономии ~120 gas за операцию. При переполнении значение оборачивается: 255 + 1 = 0.">
          <div style={{ 'display': 'inline-block' }}>
            <button
              onClick={handleUncheckedAdd}
              style={{
                ...glassStyle,
                'padding': '10px 20px',
                'cursor': 'pointer',
                'color': '#f43f5e',
                'font-size': '13px',
                'font-family': 'monospace',
                'font-weight': '600',
                'border': '1px solid rgba(244,63,94,0.4)',
              }}
            >
              +1 unchecked
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Сбросить значение к 250 для повторной демонстрации переполнения.">
          <div style={{ 'display': 'inline-block' }}>
            <button
              onClick={() => { setValue(250); setMode('idle'); }}
              style={{
                ...glassStyle,
                'padding': '10px 16px',
                'cursor': 'pointer',
                'color': colors.textMuted,
                'font-size': '13px',
              }}
            >
              Сброс
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {/* Status message */}
      {mode() === 'safe_revert' && (
        <div style={{
          ...glassStyle,
          'padding': '12px',
          'margin-bottom': '16px',
          'border': `1px solid ${colors.success}40`,
          'text-align': 'center',
        }}>
          <div style={{ 'font-size': '14px', 'font-weight': '600', 'color': colors.success, 'font-family': 'monospace' }}>
            REVERT: Panic(0x11)
          </div>
          <div style={{ 'font-size': '12px', 'color': colors.text, 'margin-top': '4px' }}>
            Solidity 0.8+ предотвратил overflow. Транзакция откатилась.
          </div>
        </div>
      )}
      {mode() === 'unchecked_wrap' && (
        <div style={{
          ...glassStyle,
          'padding': '12px',
          'margin-bottom': '16px',
          'border': '1px solid rgba(244,63,94,0.4)',
          'text-align': 'center',
        }}>
          <div style={{ 'font-size': '14px', 'font-weight': '600', 'color': '#f43f5e', 'font-family': 'monospace' }}>
            OVERFLOW: 255 + 1 = 0 (wrapping)
          </div>
          <div style={{ 'font-size': '12px', 'color': colors.text, 'margin-top': '4px' }}>
            В блоке unchecked проверки отключены. Значение обернулось в 0!
          </div>
        </div>
      )}

      {/* Three scenario cards */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': 'repeat(auto-fill, minmax(200px, 1fr))',
        'gap': '10px',
        'margin-bottom': '16px',
      }}>
        {SCENARIOS.map((s, i) => (
          <DiagramTooltip content={s.description}>
            <div style={{
              ...glassStyle,
              'padding': '14px',
              'border': `1px solid ${s.color}30`,
            }}>
              <div style={{
                'font-size': '12px',
                'font-weight': '600',
                'color': s.color,
                'font-family': 'monospace',
                'margin-bottom': '6px',
              }}>
                {s.title}
              </div>
              <div style={{
                'font-size': '11px',
                'font-family': 'monospace',
                'color': colors.accent,
                'background': 'rgba(0,0,0,0.3)',
                'padding': '6px 8px',
                'border-radius': '4px',
                'margin-bottom': '8px',
                'white-space': 'pre-wrap',
                'word-break': 'break-all',
              }}>
                {s.code}
              </div>
              <div style={{ 'font-size': '11px', 'color': colors.text, 'line-height': '1.5' }}>
                {s.description}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Downcast demo */}
      <DiagramTooltip content="Приведение типов (downcasting) НЕ проверяется даже в Solidity 0.8+. uint8(256) молча обрезает до 0. Используйте SafeCast из OpenZeppelin для безопасного downcasting.">
      <div style={{ ...glassStyle, 'padding': '14px', 'margin-bottom': '12px' }}>
        <div style={{
          'font-size': '12px',
          'font-weight': '600',
          'color': '#f59e0b',
          'font-family': 'monospace',
          'margin-bottom': '8px',
        }}>
          Unsafe Downcast: uint256 -{'>'} uint8
        </div>
        <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center', 'margin-bottom': '8px' }}>
          <span style={{ 'font-size': '11px', 'color': colors.textMuted, 'font-family': 'monospace' }}>uint256 =</span>
          <input
            type="number"
            value={downcastInput()}
            onChange={(e) => setDowncastInput(Math.max(0, Math.min(65535, Number(e.target.value))))}
            style={{
              'background': 'rgba(0,0,0,0.3)',
              'border': '1px solid rgba(255,255,255,0.1)',
              'border-radius': '4px',
              'padding': '4px 8px',
              'color': colors.text,
              'font-family': 'monospace',
              'font-size': '13px',
              'width': '80px',
            }}
          />
          <span style={{ 'font-size': '11px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
            -{'>'} uint8 =
          </span>
          <span style={{
            'font-size': '16px',
            'font-weight': '700',
            'font-family': 'monospace',
            'color': downcastResult !== downcastInput() ? '#f43f5e' : colors.success,
          }}>
            {downcastResult}
          </span>
          {downcastResult !== downcastInput() && (
            <span style={{ 'font-size': '10px', 'color': '#f43f5e', 'font-family': 'monospace' }}>
              (data loss!)
            </span>
          )}
        </div>
        <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
          {downcastInput()} & 0xFF = {downcastResult} (сохраняются только младшие 8 бит)
        </div>
      </div>
      </DiagramTooltip>

      <DiagramTooltip content="Solidity 0.8+ автоматически проверяет overflow/underflow (checked arithmetic). Опасности остаются в unchecked {} блоках и при unsafe downcasting -- используйте SafeCast от OpenZeppelin.">
      <DataBox
        label="Ключевой вывод"
        value="Solidity 0.8+ защищает от overflow по умолчанию. Опасности: unchecked {} блоки и unsafe downcasting. Используйте unchecked только при математически доказанной безопасности, SafeCast для downcasting."
        variant="highlight"
      />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
