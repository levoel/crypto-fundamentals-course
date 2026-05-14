/** @jsxImportSource solid-js */
/**
 * ZK Rollup Diagrams (SCALE-07)
 *
 * Exports:
 * - ZKArchitectureDiagram: Step-through ZK rollup architecture (5 steps, history array)
 * - SNARKvsSTARKDiagram: HTML comparison table with 8 rows
 * - ZkEVMSpectrumDiagram: Horizontal spectrum bar Type 1-4 with arrows
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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

const ZK_STEP_TOOLTIPS = [
  'Секвенсер принимает транзакции и формирует batch. Централизованный оператор обеспечивает быстрое упорядочивание, но не может подделать состояние благодаря validity proofs.',
  'Prover -- вычислительно самый дорогой компонент. Генерация ZK proof требует специализированного оборудования (GPU/FPGA/ASIC). Это основной bottleneck ZK rollups.',
  'Публикация данных на L1 обеспечивает data availability: любой может восстановить полное состояние rollup из on-chain данных.',
  'On-chain верификация proof стоит ~300K gas (доли цента). Это ключевое преимущество ZK: дорого доказать, дешево проверить.',
  'В отличие от optimistic rollups (7-дневное ожидание), ZK rollups финализируют состояние сразу после верификации proof. Вывод средств за часы, не за неделю.',
];

/**
 * ZKArchitectureDiagram
 *
 * Step-through ZK rollup architecture with 5 steps, history array,
 * step/back/reset buttons. Contrast box: Optimistic vs ZK finality.
 */
export function ZKArchitectureDiagram() {
  const [history, setHistory] = createSignal<number[]>([0]);
  const current = history()[history().length - 1];

  const step = () => {
    if (current < ZK_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history().length > 1) {
      setHistory(history().slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = ZK_STEPS[current];

  return (
    <DiagramContainer title="Архитектура ZK Rollup" color="purple">
      {/* Progress bar */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {ZK_STEPS.map((st, i) => (
          <div
            style={{
              'flex': '1',
              'height': '4px',
              'border-radius': '2px',
              'background': i <= current ? st.color : 'rgba(255,255,255,0.08)',
              'transition': 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Flow visualization */}
      <div style={{ 'display': 'flex', 'gap': '6px', 'margin-bottom': '16px', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
        {ZK_STEPS.map((st, i) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px' }}>
            <DiagramTooltip content={ZK_STEP_TOOLTIPS[i]}>
              <div style={{
                'width': '44px',
                'height': '44px',
                'border-radius': '8px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '12px',
                'font-weight': '700',
                'font-family': 'monospace',
                'color': i <= current ? '#fff' : colors.textMuted,
                'background': i <= current ? `${st.color}30` : 'rgba(255,255,255,0.04)',
                'border': `1px solid ${i === current ? st.color : i < current ? `${st.color}40` : 'rgba(255,255,255,0.08)'}`,
                'transition': 'all 0.3s',
              }}>
                {st.icon}
              </div>
            </DiagramTooltip>
            {i < ZK_STEPS.length - 1 && (
              <div style={{
                'width': '20px',
                'height': '2px',
                'background': i < current ? `${ZK_STEPS[i + 1].color}60` : 'rgba(255,255,255,0.08)',
                'transition': 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current step detail */}
      <div style={{
        ...glassStyle,
        'padding': '16px',
        'margin-bottom': '12px',
        'border': `1px solid ${s.color}30`,
        'background': `${s.color}08`,
        'border-radius': '8px',
      }}>
        <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px', 'margin-bottom': '8px' }}>
          <span style={{
            'font-size': '9px',
            'font-family': 'monospace',
            'color': s.color,
            'padding': '2px 8px',
            'border-radius': '4px',
            'background': `${s.color}15`,
            'border': `1px solid ${s.color}30`,
          }}>
            {s.label}
          </span>
          <span style={{ 'font-size': '13px', 'font-weight': '700', 'color': colors.text }}>
            {s.title}
          </span>
        </div>
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '8px' }}>
          {s.description}
        </div>
        <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'font-style': 'italic' }}>
          {s.detail}
        </div>
      </div>

      {/* Controls */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '14px' }}>
        {[
          { label: 'Back', action: back, disabled: history().length <= 1 },
          { label: `Step ${current + 1}/${ZK_STEPS.length}`, action: step, disabled: current >= ZK_STEPS.length - 1 },
          { label: 'Reset', action: reset, disabled: history().length <= 1 },
        ].map((btn) => (
          <button
            onClick={btn.action}
            disabled={btn.disabled}
            style={{
              ...glassStyle,
              'padding': '6px 14px',
              'cursor': btn.disabled ? 'default' : 'pointer',
              'font-size': '11px',
              'font-family': 'monospace',
              'color': btn.disabled ? 'rgba(255,255,255,0.2)' : colors.text,
              'border': '1px solid rgba(255,255,255,0.1)',
              'border-radius': '6px',
              'opacity': btn.disabled ? 0.5 : 1,
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
  tooltipRu: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { category: 'Full Name', snark: 'Succinct Non-interactive ARgument of Knowledge', stark: 'Scalable Transparent ARgument of Knowledge', snarkAdvantage: false, starkAdvantage: false, tooltipRu: 'Названия отражают ключевые свойства: SNARK -- лаконичность и неинтерактивность, STARK -- масштабируемость и прозрачность (без trusted setup).' },
  { category: 'Trusted Setup', snark: 'Required (ceremony, toxic waste)', stark: 'Not required (transparent)', snarkAdvantage: false, starkAdvantage: true, tooltipRu: 'Trusted setup -- церемония генерации параметров. "Toxic waste" (секретные значения) должен быть уничтожен. Если хоть один участник нечестен -- система скомпрометирована.' },
  { category: 'Proof Size', snark: '~288 bytes (small)', stark: '~45-200 KB (larger)', snarkAdvantage: true, starkAdvantage: false, tooltipRu: 'Размер proof влияет на стоимость on-chain верификации. Маленький SNARK proof = дешевле публиковать на L1. STARK proof в 100-700x больше.' },
  { category: 'Verification Time', snark: 'Fast (~ms)', stark: 'Fast (~ms, slightly slower)', snarkAdvantage: true, starkAdvantage: false, tooltipRu: 'Обе системы верифицируются за миллисекунды. SNARK чуть быстрее из-за меньшего размера proof. Разница незначительна для практических применений.' },
  { category: 'Prover Time', snark: 'Fast', stark: 'Faster for large computations', snarkAdvantage: false, starkAdvantage: true, tooltipRu: 'STARK prover масштабируется quasi-линейно O(n log n), а SNARK -- квадратично для больших вычислений. Для миллионов операций STARK значительно быстрее.' },
  { category: 'Quantum Resistance', snark: 'No (elliptic curves)', stark: 'Yes (hash functions only)', snarkAdvantage: false, starkAdvantage: true, tooltipRu: 'SNARK основан на задачах дискретного логарифма (эллиптические кривые) -- уязвим для алгоритма Шора. STARK использует только хеш-функции -- квантово-устойчив.' },
  { category: 'Maturity', snark: 'More mature, widely deployed', stark: 'Newer, growing adoption', snarkAdvantage: true, starkAdvantage: false, tooltipRu: 'SNARK разработан в 2012, широко используется с 2016 (Zcash). STARK появился в 2018. Больше аудитов, больше production deployments у SNARK.' },
  { category: 'Used By', snark: 'zkSync Era, Polygon zkEVM, Scroll', stark: 'StarkNet, StarkEx', snarkAdvantage: false, starkAdvantage: false, tooltipRu: 'SNARK доминирует по количеству проектов. STARK используется StarkWare (StarkNet + StarkEx обслуживают dYdX, Immutable X, Sorare).' },
];

/**
 * SNARKvsSTARKDiagram
 *
 * HTML comparison table: SNARKs vs STARKs across 8 dimensions.
 * Advantages color-coded green. DiagramTooltip on first column.
 */
export function SNARKvsSTARKDiagram() {
  return (
    <DiagramContainer title="SNARKs vs STARKs: сравнение" color="orange">
      <div style={{ 'overflow-x': 'auto' }}>
        <table style={{
          'width': '100%',
          'border-collapse': 'collapse',
          'font-size': '12px',
          'font-family': 'monospace',
        }}>
          <thead>
            <tr>
              <th style={{
                'padding': '8px 10px',
                'text-align': 'left',
                'font-size': '10px',
                'color': colors.textMuted,
                'border-bottom': '1px solid rgba(255,255,255,0.1)',
                'min-width': '100px',
              }}>
                Параметр
              </th>
              <th style={{
                'padding': '8px 10px',
                'text-align': 'left',
                'font-size': '11px',
                'font-weight': '600',
                'color': '#6366f1',
                'border-bottom': '2px solid rgba(99,102,241,0.3)',
                'min-width': '160px',
              }}>
                SNARK
              </th>
              <th style={{
                'padding': '8px 10px',
                'text-align': 'left',
                'font-size': '11px',
                'font-weight': '600',
                'color': '#f59e0b',
                'border-bottom': '2px solid rgba(245,158,11,0.3)',
                'min-width': '160px',
              }}>
                STARK
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                style={{
                  'transition': 'background 0.15s',
                }}
              >
                <td style={{
                  'padding': '7px 10px',
                  'color': colors.textMuted,
                  'font-weight': '600',
                  'font-size': '11px',
                  'border-bottom': '1px solid rgba(255,255,255,0.05)',
                }}>
                  <DiagramTooltip content={row.tooltipRu}>
                    <span style={{ 'border-bottom': '1px dotted rgba(255,255,255,0.3)', 'cursor': 'help' }}>{row.category}</span>
                  </DiagramTooltip>
                </td>
                <td style={{
                  'padding': '7px 10px',
                  'color': row.snarkAdvantage ? colors.success : colors.text,
                  'font-size': '11px',
                  'border-bottom': '1px solid rgba(255,255,255,0.05)',
                  'line-height': '1.4',
                  'font-weight': row.snarkAdvantage ? 600 : 400,
                }}>
                  {row.snark}
                </td>
                <td style={{
                  'padding': '7px 10px',
                  'color': row.starkAdvantage ? colors.success : colors.text,
                  'font-size': '11px',
                  'border-bottom': '1px solid rgba(255,255,255,0.05)',
                  'line-height': '1.4',
                  'font-weight': row.starkAdvantage ? 600 : 400,
                }}>
                  {row.stark}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ 'margin-top': '12px' }}>
        <DataBox
          label="Ключевой trade-off"
          value="SNARK: маленький proof, но trusted setup. STARK: большой proof, но transparent и quantum-resistant."
          variant="info"
        />
      </div>
      <div style={{ 'margin-top': '8px', 'font-size': '10px', 'color': colors.textMuted, 'font-style': 'italic', 'font-family': 'monospace' }}>
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
  tooltipRu: string;
}

const ZKEVM_TYPES: ZkEVMType[] = [
  {
    type: 'Type 1',
    color: '#10b981',
    label: 'Full Ethereum equivalence',
    description: 'Proves Ethereum execution directly. Slowest proving. Best compatibility.',
    example: 'Taiko',
    tooltipRu: 'Type 1 zkEVM доказывает исполнение Ethereum напрямую, без модификаций. Максимальная совместимость: любой контракт, любой тул. Но proving крайне медленный -- часы на один блок.',
  },
  {
    type: 'Type 2',
    color: '#3b82f6',
    label: 'EVM equivalent',
    description: 'Slight state/block differences. Good compatibility.',
    example: 'Polygon zkEVM, Scroll, Linea',
    tooltipRu: 'Type 2 zkEVM вносит минимальные изменения в state layout и структуру блока для ускорения proving. 99% контрактов работают без изменений. Оптимальный баланс совместимости и производительности.',
  },
  {
    type: 'Type 3',
    color: '#f59e0b',
    label: 'Almost EVM equivalent',
    description: 'Some opcodes differ. Most contracts work. Transitional state.',
    example: '(transitional)',
    tooltipRu: 'Type 3 -- переходный тип. Некоторые opcodes отличаются от Ethereum. Большинство контрактов работают, но могут потребоваться минимальные изменения. Многие проекты начинали как Type 3 и мигрировали к Type 2.',
  },
  {
    type: 'Type 4',
    color: '#8b5cf6',
    label: 'High-level language equivalent',
    description: 'Compile Solidity to custom VM. Fastest proving. Least compatible.',
    example: 'zkSync Era, StarkNet (Cairo)',
    tooltipRu: 'Type 4 компилирует Solidity (или Cairo) в собственную VM. Самый быстрый proving, но наименьшая совместимость: precompiles, opcodes, deployment процесс отличаются. zkSync Era использует LLVM compiler для Solidity->ZK.',
  },
];

/**
 * ZkEVMSpectrumDiagram
 *
 * Horizontal spectrum bar with 4 positions (Type 1-4).
 * Two arrows below: Compatibility (High->Low), Performance (Low->High).
 * DiagramTooltip for details.
 */
export function ZkEVMSpectrumDiagram() {
  return (
    <DiagramContainer title="zkEVM: спектр совместимости (Type 1-4)" color="blue">
      {/* Spectrum bar */}
      <div style={{
        'display': 'flex',
        'gap': '3px',
        'margin-bottom': '14px',
      }}>
        {ZKEVM_TYPES.map((t, i) => (
          <DiagramTooltip content={t.tooltipRu}>
            <div
              style={{
                'flex': '1',
                'padding': '12px',
                'border-radius': '6px',
                'cursor': 'pointer',
                'background': 'rgba(255,255,255,0.03)',
                'border': `1px solid rgba(255,255,255,0.08)`,
                'transition': 'all 0.2s',
              }}
            >
              <div style={{
                'font-size': '10px',
                'font-weight': '700',
                'color': t.color,
                'font-family': 'monospace',
                'margin-bottom': '4px',
              }}>
                {t.type}
              </div>
              <div style={{
                'font-size': '10px',
                'color': colors.text,
                'line-height': '1.4',
                'margin-bottom': '4px',
              }}>
                {t.label}
              </div>
              <div style={{
                'font-size': '9px',
                'color': colors.textMuted,
                'font-family': 'monospace',
              }}>
                {t.example}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Arrows */}
      <div style={{ 'margin-bottom': '14px' }}>
        {[
          { label: 'Compatibility', left: 'High', right: 'Low', color: '#10b981' },
          { label: 'Performance', left: 'Low', right: 'High', color: '#8b5cf6' },
        ].map((arrow) => (
          <div style={{
            'display': 'flex',
            'align-items': 'center',
            'gap': '8px',
            'margin-bottom': '6px',
          }}>
            <span style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'min-width': '90px' }}>
              {arrow.label}:
            </span>
            <span style={{ 'font-size': '10px', 'color': arrow.color, 'font-weight': '600' }}>{arrow.left}</span>
            <div style={{
              'flex': '1',
              'height': '2px',
              'background': `linear-gradient(to right, ${arrow.color}60, ${arrow.color}20)`,
              'border-radius': '1px',
            }} />
            <span style={{ 'font-size': '10px', 'color': arrow.color, 'font-weight': '600' }}>{arrow.right}</span>
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
