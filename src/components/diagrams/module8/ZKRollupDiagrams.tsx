/**
 * ZK Rollup Diagrams (SCALE-07)
 *
 * Exports:
 * - ZKArchitectureDiagram: Step-through ZK rollup architecture (5 steps, history array)
 * - SNARKvsSTARKDiagram: HTML comparison table with 8 rows (hover)
 * - ZkEVMSpectrumDiagram: Horizontal spectrum bar Type 1-4 with arrows
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ZKArchitectureDiagram                                               */
/* ================================================================== */

interface ZKStep {
  title: string;
  label: string;
  description: string;
  detail: string;
  color: string;
  icon: string;
}

const ZK_STEPS: ZKStep[] = [
  {
    title: 'TRANSACTIONS',
    label: 'Шаг 1',
    description: 'Пользователи отправляют транзакции секвенсеру. Секвенсер выполняет транзакции и определяет новое состояние.',
    detail: 'Batch: 100-1000 транзакций группируются вместе',
    color: '#6366f1',
    icon: 'TX',
  },
  {
    title: 'PROVER',
    label: 'Шаг 2',
    description: 'Off-chain prover генерирует validity proof (SNARK или STARK), доказывающий корректность state transition. Вычислительно дорого (минуты-часы).',
    detail: 'Prover = специализированное оборудование (GPU/FPGA)',
    color: '#8b5cf6',
    icon: 'ZK',
  },
  {
    title: 'SUBMIT TO L1',
    label: 'Шаг 3',
    description: 'Секвенсер публикует на Ethereum L1: (a) сжатые данные транзакций (data availability), (b) новый state root, (c) validity proof.',
    detail: 'Data availability = любой может восстановить состояние',
    color: '#3b82f6',
    icon: 'L1',
  },
  {
    title: 'VERIFIER',
    label: 'Шаг 4',
    description: 'On-chain verifier контракт проверяет validity proof. Если proof валиден, state transition принимается МГНОВЕННО. Никакого 7-дневного ожидания.',
    detail: 'Верификация: миллисекунды, стоимость: ~300K gas',
    color: '#10b981',
    icon: 'V',
  },
  {
    title: 'FINALITY',
    label: 'Шаг 5',
    description: 'Состояние финализировано на L1 после верификации proof. Вывод средств можно начать немедленно (часы, не 7 дней).',
    detail: 'Validity proofs = криптографическая уверенность, не экономическое допущение',
    color: '#f59e0b',
    icon: 'FIN',
  },
];

/**
 * ZKArchitectureDiagram
 *
 * Step-through ZK rollup architecture with 5 steps, history array,
 * step/back/reset buttons. Contrast box: Optimistic vs ZK finality.
 */
export function ZKArchitectureDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const current = history[history.length - 1];

  const step = () => {
    if (current < ZK_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = ZK_STEPS[current];

  return (
    <DiagramContainer title="Архитектура ZK Rollup" color="purple">
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {ZK_STEPS.map((st, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= current ? st.color : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Flow visualization */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {ZK_STEPS.map((st, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'monospace',
              color: i <= current ? '#fff' : colors.textMuted,
              background: i <= current ? `${st.color}30` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === current ? st.color : i < current ? `${st.color}40` : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.3s',
            }}>
              {st.icon}
            </div>
            {i < ZK_STEPS.length - 1 && (
              <div style={{
                width: 20,
                height: 2,
                background: i < current ? `${ZK_STEPS[i + 1].color}60` : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current step detail */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 12,
        border: `1px solid ${s.color}30`,
        background: `${s.color}08`,
        borderRadius: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 9,
            fontFamily: 'monospace',
            color: s.color,
            padding: '2px 8px',
            borderRadius: 4,
            background: `${s.color}15`,
            border: `1px solid ${s.color}30`,
          }}>
            {s.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
            {s.title}
          </span>
        </div>
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 8 }}>
          {s.description}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', fontStyle: 'italic' }}>
          {s.detail}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Back', action: back, disabled: history.length <= 1 },
          { label: `Step ${current + 1}/${ZK_STEPS.length}`, action: step, disabled: current >= ZK_STEPS.length - 1 },
          { label: 'Reset', action: reset, disabled: history.length <= 1 },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            disabled={btn.disabled}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: btn.disabled ? 'default' : 'pointer',
              fontSize: 11,
              fontFamily: 'monospace',
              color: btn.disabled ? 'rgba(255,255,255,0.2)' : colors.text,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              opacity: btn.disabled ? 0.5 : 1,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Contrast box */}
      <DataBox
        label="Optimistic vs ZK"
        value="Optimistic: ждем 7 дней (fraud proof). ZK: проверяем математически (validity proof). Результат: ZK = быстрая финализация."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SNARKvsSTARKDiagram                                                 */
/* ================================================================== */

interface ComparisonRow {
  category: string;
  snark: string;
  stark: string;
  snarkAdvantage: boolean;
  starkAdvantage: boolean;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { category: 'Full Name', snark: 'Succinct Non-interactive ARgument of Knowledge', stark: 'Scalable Transparent ARgument of Knowledge', snarkAdvantage: false, starkAdvantage: false },
  { category: 'Trusted Setup', snark: 'Required (ceremony, toxic waste)', stark: 'Not required (transparent)', snarkAdvantage: false, starkAdvantage: true },
  { category: 'Proof Size', snark: '~288 bytes (small)', stark: '~45-200 KB (larger)', snarkAdvantage: true, starkAdvantage: false },
  { category: 'Verification Time', snark: 'Fast (~ms)', stark: 'Fast (~ms, slightly slower)', snarkAdvantage: true, starkAdvantage: false },
  { category: 'Prover Time', snark: 'Fast', stark: 'Faster for large computations', snarkAdvantage: false, starkAdvantage: true },
  { category: 'Quantum Resistance', snark: 'No (elliptic curves)', stark: 'Yes (hash functions only)', snarkAdvantage: false, starkAdvantage: true },
  { category: 'Maturity', snark: 'More mature, widely deployed', stark: 'Newer, growing adoption', snarkAdvantage: true, starkAdvantage: false },
  { category: 'Used By', snark: 'zkSync Era, Polygon zkEVM, Scroll', stark: 'StarkNet, StarkEx', snarkAdvantage: false, starkAdvantage: false },
];

/**
 * SNARKvsSTARKDiagram
 *
 * HTML comparison table: SNARKs vs STARKs across 8 dimensions.
 * Advantages color-coded green. Hover rows for emphasis.
 */
export function SNARKvsSTARKDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <DiagramContainer title="SNARKs vs STARKs: сравнение" color="orange">
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12,
          fontFamily: 'monospace',
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '8px 10px',
                textAlign: 'left',
                fontSize: 10,
                color: colors.textMuted,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                minWidth: 100,
              }}>
                Параметр
              </th>
              <th style={{
                padding: '8px 10px',
                textAlign: 'left',
                fontSize: 11,
                fontWeight: 600,
                color: '#6366f1',
                borderBottom: '2px solid rgba(99,102,241,0.3)',
                minWidth: 160,
              }}>
                SNARK
              </th>
              <th style={{
                padding: '8px 10px',
                textAlign: 'left',
                fontSize: 11,
                fontWeight: 600,
                color: '#f59e0b',
                borderBottom: '2px solid rgba(245,158,11,0.3)',
                minWidth: 160,
              }}>
                STARK
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => {
              const isHovered = hoveredRow === i;
              return (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{
                    padding: '7px 10px',
                    color: isHovered ? colors.text : colors.textMuted,
                    fontWeight: 600,
                    fontSize: 11,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    {row.category}
                  </td>
                  <td style={{
                    padding: '7px 10px',
                    color: row.snarkAdvantage ? colors.success : colors.text,
                    fontSize: 11,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: 1.4,
                    fontWeight: row.snarkAdvantage ? 600 : 400,
                  }}>
                    {row.snark}
                  </td>
                  <td style={{
                    padding: '7px 10px',
                    color: row.starkAdvantage ? colors.success : colors.text,
                    fontSize: 11,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: 1.4,
                    fontWeight: row.starkAdvantage ? 600 : 400,
                  }}>
                    {row.stark}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Ключевой trade-off"
          value="SNARK: маленький proof, но trusted setup. STARK: большой proof, но transparent и quantum-resistant."
          variant="info"
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: colors.textMuted, fontStyle: 'italic', fontFamily: 'monospace' }}>
        Математика доказательств -- тема Phase 9. Здесь: как они используются в rollup архитектуре.
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ZkEVMSpectrumDiagram                                                */
/* ================================================================== */

interface ZkEVMType {
  type: string;
  color: string;
  label: string;
  description: string;
  example: string;
}

const ZKEVM_TYPES: ZkEVMType[] = [
  {
    type: 'Type 1',
    color: '#10b981',
    label: 'Full Ethereum equivalence',
    description: 'Proves Ethereum execution directly. Slowest proving. Best compatibility.',
    example: 'Taiko',
  },
  {
    type: 'Type 2',
    color: '#3b82f6',
    label: 'EVM equivalent',
    description: 'Slight state/block differences. Good compatibility.',
    example: 'Polygon zkEVM, Scroll, Linea',
  },
  {
    type: 'Type 3',
    color: '#f59e0b',
    label: 'Almost EVM equivalent',
    description: 'Some opcodes differ. Most contracts work. Transitional state.',
    example: '(transitional)',
  },
  {
    type: 'Type 4',
    color: '#8b5cf6',
    label: 'High-level language equivalent',
    description: 'Compile Solidity to custom VM. Fastest proving. Least compatible.',
    example: 'zkSync Era, StarkNet (Cairo)',
  },
];

/**
 * ZkEVMSpectrumDiagram
 *
 * Horizontal spectrum bar with 4 positions (Type 1-4).
 * Two arrows below: Compatibility (High->Low), Performance (Low->High).
 * Hover for details.
 */
export function ZkEVMSpectrumDiagram() {
  const [hoveredType, setHoveredType] = useState<number | null>(null);

  return (
    <DiagramContainer title="zkEVM: спектр совместимости (Type 1-4)" color="blue">
      {/* Spectrum bar */}
      <div style={{
        display: 'flex',
        gap: 3,
        marginBottom: 8,
      }}>
        {ZKEVM_TYPES.map((t, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredType(i)}
            onMouseLeave={() => setHoveredType(null)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 6,
              cursor: 'pointer',
              background: hoveredType === i ? `${t.color}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${hoveredType === i ? `${t.color}50` : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: t.color,
              fontFamily: 'monospace',
              marginBottom: 4,
            }}>
              {t.type}
            </div>
            <div style={{
              fontSize: 10,
              color: colors.text,
              lineHeight: 1.4,
              marginBottom: 4,
            }}>
              {t.label}
            </div>
            <div style={{
              fontSize: 9,
              color: colors.textMuted,
              fontFamily: 'monospace',
            }}>
              {t.example}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded detail on hover */}
      {hoveredType !== null && (
        <div style={{
          ...glassStyle,
          padding: 10,
          marginBottom: 10,
          borderRadius: 6,
          border: `1px solid ${ZKEVM_TYPES[hoveredType].color}30`,
          background: `${ZKEVM_TYPES[hoveredType].color}08`,
        }}>
          <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: ZKEVM_TYPES[hoveredType].color }}>
              {ZKEVM_TYPES[hoveredType].type}:
            </span>{' '}
            {ZKEVM_TYPES[hoveredType].description}
          </div>
        </div>
      )}

      {/* Arrows */}
      <div style={{ marginBottom: 14 }}>
        {[
          { label: 'Compatibility', left: 'High', right: 'Low', color: '#10b981' },
          { label: 'Performance', left: 'Low', right: 'High', color: '#8b5cf6' },
        ].map((arrow) => (
          <div key={arrow.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', minWidth: 90 }}>
              {arrow.label}:
            </span>
            <span style={{ fontSize: 10, color: arrow.color, fontWeight: 600 }}>{arrow.left}</span>
            <div style={{
              flex: 1,
              height: 2,
              background: `linear-gradient(to right, ${arrow.color}60, ${arrow.color}20)`,
              borderRadius: 1,
            }} />
            <span style={{ fontSize: 10, color: arrow.color, fontWeight: 600 }}>{arrow.right}</span>
          </div>
        ))}
      </div>

      <DataBox
        label="Идеал"
        value="Идеал: Type 1 с быстрым prover. Реальность: компромисс между совместимостью и скоростью доказательств."
        variant="info"
      />
    </DiagramContainer>
  );
}
