/**
 * Integer Overflow Diagrams (SEC-03)
 *
 * Exports:
 * - OverflowVisualizationDiagram: Interactive uint8 slider with "+1 safe" and "+1 unchecked" buttons.
 *   Three scenario cards (safe, unchecked, downcasting) demonstrating overflow risks.
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
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
  const [value, setValue] = useState(250);
  const [mode, setMode] = useState<'idle' | 'safe_revert' | 'unchecked_wrap'>('idle');
  const [downcastInput, setDowncastInput] = useState(256);

  // Simulate "+1 safe" -- revert if overflow
  const handleSafeAdd = () => {
    if (value >= 255) {
      setMode('safe_revert');
    } else {
      setValue((v) => v + 1);
      setMode('idle');
    }
  };

  // Simulate "+1 unchecked" -- wrap on overflow
  const handleUncheckedAdd = () => {
    if (value >= 255) {
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
  const downcastResult = downcastInput & 0xff; // uint8 truncation

  return (
    <DiagramContainer title="Integer Overflow: uint8 (0-255)" color="amber">
      {/* Current value display */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
        marginBottom: 16,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            Decimal
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: value >= 250 ? '#f43f5e' : colors.text,
          }}>
            {value}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            Binary
          </div>
          <div style={{
            fontSize: 20,
            fontFamily: 'monospace',
            color: colors.accent,
            letterSpacing: 2,
          }}>
            {toBinary(value)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            Hex
          </div>
          <div style={{
            fontSize: 20,
            fontFamily: 'monospace',
            color: colors.primary,
          }}>
            0x{value.toString(16).toUpperCase().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 16, padding: '0 8px' }}>
        <input
          type="range"
          min={0}
          max={255}
          step={1}
          value={value}
          onChange={(e) => { setValue(Number(e.target.value)); setMode('idle'); }}
          style={{ width: '100%', accentColor: value >= 250 ? '#f43f5e' : colors.primary }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
          <span>0</span>
          <span>128</span>
          <span>255 (max)</span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        <button
          onClick={handleSafeAdd}
          style={{
            ...glassStyle,
            padding: '10px 20px',
            cursor: 'pointer',
            color: colors.success,
            fontSize: 13,
            fontFamily: 'monospace',
            fontWeight: 600,
            border: `1px solid ${colors.success}40`,
          }}
        >
          +1 safe (checked)
        </button>
        <button
          onClick={handleUncheckedAdd}
          style={{
            ...glassStyle,
            padding: '10px 20px',
            cursor: 'pointer',
            color: '#f43f5e',
            fontSize: 13,
            fontFamily: 'monospace',
            fontWeight: 600,
            border: '1px solid rgba(244,63,94,0.4)',
          }}
        >
          +1 unchecked
        </button>
        <button
          onClick={() => { setValue(250); setMode('idle'); }}
          style={{
            ...glassStyle,
            padding: '10px 16px',
            cursor: 'pointer',
            color: colors.textMuted,
            fontSize: 13,
          }}
        >
          Сброс
        </button>
      </div>

      {/* Status message */}
      {mode === 'safe_revert' && (
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 16,
          border: `1px solid ${colors.success}40`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.success, fontFamily: 'monospace' }}>
            REVERT: Panic(0x11)
          </div>
          <div style={{ fontSize: 12, color: colors.text, marginTop: 4 }}>
            Solidity 0.8+ предотвратил overflow. Транзакция откатилась.
          </div>
        </div>
      )}
      {mode === 'unchecked_wrap' && (
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 16,
          border: '1px solid rgba(244,63,94,0.4)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f43f5e', fontFamily: 'monospace' }}>
            OVERFLOW: 255 + 1 = 0 (wrapping)
          </div>
          <div style={{ fontSize: 12, color: colors.text, marginTop: 4 }}>
            В блоке unchecked проверки отключены. Значение обернулось в 0!
          </div>
        </div>
      )}

      {/* Three scenario cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        {SCENARIOS.map((s, i) => (
          <div key={i} style={{
            ...glassStyle,
            padding: 14,
            border: `1px solid ${s.color}30`,
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: s.color,
              fontFamily: 'monospace',
              marginBottom: 6,
            }}>
              {s.title}
            </div>
            <div style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: colors.accent,
              background: 'rgba(0,0,0,0.3)',
              padding: '6px 8px',
              borderRadius: 4,
              marginBottom: 8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {s.code}
            </div>
            <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
              {s.description}
            </div>
          </div>
        ))}
      </div>

      {/* Downcast demo */}
      <div style={{ ...glassStyle, padding: 14, marginBottom: 12 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#f59e0b',
          fontFamily: 'monospace',
          marginBottom: 8,
        }}>
          Unsafe Downcast: uint256 -{'>'} uint8
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>uint256 =</span>
          <input
            type="number"
            value={downcastInput}
            onChange={(e) => setDowncastInput(Math.max(0, Math.min(65535, Number(e.target.value))))}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              padding: '4px 8px',
              color: colors.text,
              fontFamily: 'monospace',
              fontSize: 13,
              width: 80,
            }}
          />
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
            -{'>'} uint8 =
          </span>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: downcastResult !== downcastInput ? '#f43f5e' : colors.success,
          }}>
            {downcastResult}
          </span>
          {downcastResult !== downcastInput && (
            <span style={{ fontSize: 10, color: '#f43f5e', fontFamily: 'monospace' }}>
              (data loss!)
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
          {downcastInput} & 0xFF = {downcastResult} (сохраняются только младшие 8 бит)
        </div>
      </div>

      <DataBox
        label="Ключевой вывод"
        value="Solidity 0.8+ защищает от overflow по умолчанию. Опасности: unchecked {} блоки и unsafe downcasting. Используйте unchecked только при математически доказанной безопасности, SafeCast для downcasting."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
