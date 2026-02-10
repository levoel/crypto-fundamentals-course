/**
 * STARK Diagrams (ZK-06)
 *
 * Exports:
 * - FRIProtocolDiagram: Step-through FRI protocol (6 steps, history array)
 * - SNARKvsSTARKDeepDiagram: Deep SNARK vs STARK comparison table (8 rows, hover tooltips)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  FRIProtocolDiagram                                                   */
/* ================================================================== */

interface FRIStep {
  title: string;
  label: string;
  description: string;
  detail: string;
  color: string;
  icon: string;
}

const FRI_STEPS: FRIStep[] = [
  {
    title: 'POLYNOMIAL COMMITMENT',
    label: 'Шаг 1',
    description: 'Prover имеет полином f(x) степени d (представляющий witness вычисления). Prover вычисляет f(x) в N точках evaluation domain (N >> d). Получает N значений: [f(x_0), f(x_1), ..., f(x_{N-1})].',
    detail: 'Ключевое отличие от SNARKs: нет elliptic curves. Работаем над конечным полем с hash functions.',
    color: '#3b82f6',
    icon: 'f(x)',
  },
  {
    title: 'MERKLE COMMIT',
    label: 'Шаг 2',
    description: 'Prover организует все N значений в Merkle tree и публикует Merkle root. Это commitment -- prover не может изменить значения после публикации root. Verifier видит только root (32 bytes), но может запросить любое f(x_i) с Merkle proof.',
    detail: 'Hash-based commitment: SHA-256/Poseidon. Quantum-resistant, transparent (no trusted setup).',
    color: '#8b5cf6',
    icon: 'MT',
  },
  {
    title: 'FOLDING ROUND 1',
    label: 'Шаг 3',
    description: 'Verifier отправляет random challenge r_1. Prover "складывает" (folds) полином: новый полином f_1(x) = f_even(x) + r_1 * f_odd(x). Степень УМЕНЬШАЕТСЯ вдвое: deg(f_1) = d/2. Prover коммитит f_1 через новый Merkle root.',
    detail: 'Folding = split + combine. Чётные и нечётные коэффициенты полинома объединяются с рандомным коэффициентом.',
    color: '#10b981',
    icon: 'd/2',
  },
  {
    title: 'ПОВТОРНЫЕ FOLDING ROUNDS',
    label: 'Шаг 4',
    description: 'Процесс повторяется log(d) раз. Каждый round: verifier выбирает новый random r_i, prover складывает полином, степень уменьшается вдвое. После k rounds: deg(f_k) = d / 2^k. Когда степень = 0, полином = константа.',
    detail: 'Для d = 1024: нужно 10 rounds (log_2(1024) = 10). Итого: 10 Merkle roots.',
    color: '#f59e0b',
    icon: 'log',
  },
  {
    title: 'QUERY PHASE',
    label: 'Шаг 5',
    description: 'Verifier выбирает несколько random точек и запрашивает значения полинома в этих точках на КАЖДОМ уровне folding. Prover предоставляет значения с Merkle proofs. Verifier проверяет консистентность: значения на уровне i+1 должны быть корректным fold значений на уровне i.',
    detail: 'Soundness: вероятность обмана = (ρ)^q, где ρ = rate parameter, q = количество queries. Обычно 40-80 queries.',
    color: '#ef4444',
    icon: 'Q',
  },
  {
    title: 'РЕЗУЛЬТАТ: PROXIMITY PROOF',
    label: 'Шаг 6',
    description: 'Если все consistency checks прошли, verifier убеждён: исходная функция f(x) "близка" к полиному степени <= d (proximity to Reed-Solomon codeword). Это доказывает, что prover действительно знал low-degree polynomial, а значит -- witness вычисления.',
    detail: 'FRI = Fast Reed-Solomon IOP of Proximity. "Proximity" = функция отличается от полинома в малом числе точек.',
    color: '#10b981',
    icon: 'OK',
  },
];

/**
 * FRIProtocolDiagram
 *
 * Step-through FRI protocol visualization with 6 steps,
 * history array for forward/backward navigation.
 */
export function FRIProtocolDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const current = history[history.length - 1];

  const step = () => {
    if (current < FRI_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = FRI_STEPS[current];

  return (
    <DiagramContainer title="FRI Protocol: доказательство low-degree polynomial" color="green">
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {FRI_STEPS.map((st, i) => (
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
        {FRI_STEPS.map((st, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <DiagramTooltip content={st.detail}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                fontFamily: 'monospace',
                color: i <= current ? '#fff' : colors.textMuted,
                background: i <= current ? `${st.color}30` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === current ? st.color : i < current ? `${st.color}40` : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.3s',
              }}>
                {st.icon}
              </div>
            </DiagramTooltip>
            {i < FRI_STEPS.length - 1 && (
              <div style={{
                width: 20,
                height: 2,
                background: i < current ? `${FRI_STEPS[i + 1].color}60` : 'rgba(255,255,255,0.08)',
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
        <DiagramTooltip content={s.description}>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 8 }}>
            {s.description}
          </div>
        </DiagramTooltip>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', fontStyle: 'italic' }}>
          {s.detail}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Back', action: back, disabled: history.length <= 1, tooltip: 'Вернуться к предыдущему шагу FRI-протокола.' },
          { label: `Step ${current + 1}/${FRI_STEPS.length}`, action: step, disabled: current >= FRI_STEPS.length - 1, tooltip: 'Перейти к следующему шагу FRI-протокола. Каждый шаг уменьшает степень полинома вдвое.' },
          { label: 'Reset', action: reset, disabled: history.length <= 1, tooltip: 'Начать просмотр FRI-протокола с первого шага.' },
        ].map((btn) => (
          <DiagramTooltip key={btn.label} content={btn.tooltip}>
            <div>
              <button
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
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DiagramTooltip content="FRI (Fast Reed-Solomon IOP of Proximity) — основа STARK proof system. Использует только hash-функции вместо эллиптических кривых, что обеспечивает прозрачность (no trusted setup) и квантовую устойчивость.">
        <DataBox
          label="Почему FRI?"
          value="FRI = Fast Reed-Solomon IOP of Proximity. Использует только hash functions (no elliptic curves), поэтому STARKs: (1) не требуют trusted setup, (2) quantum-resistant, (3) прозрачны."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SNARKvsSTARKDeepDiagram                                              */
/* ================================================================== */

interface DeepComparisonRow {
  category: string;
  snark: string;
  stark: string;
  snarkAdvantage: boolean;
  starkAdvantage: boolean;
  tooltip: string;
}

const DEEP_COMPARISON_ROWS: DeepComparisonRow[] = [
  {
    category: 'Full Name',
    snark: 'Succinct Non-interactive ARgument of Knowledge',
    stark: 'Scalable Transparent ARgument of Knowledge',
    snarkAdvantage: false,
    starkAdvantage: false,
    tooltip: 'S в STARK = Scalable (prover scales квазилинейно). T = Transparent (no trusted setup).',
  },
  {
    category: 'Trusted Setup',
    snark: 'Required (toxic waste, MPC ceremony)',
    stark: 'Not required (transparent, public randomness)',
    snarkAdvantage: false,
    starkAdvantage: true,
    tooltip: 'SNARK (Groth16): ceremony per circuit. PLONK: universal setup. STARK: никакого setup вообще.',
  },
  {
    category: 'Cryptographic Basis',
    snark: 'Elliptic curves + bilinear pairings',
    stark: 'Hash functions only (collision resistance)',
    snarkAdvantage: false,
    starkAdvantage: true,
    tooltip: 'SNARK полагается на hardness of discrete log problem. STARK -- только на collision-resistant hashing.',
  },
  {
    category: 'Proof Size',
    snark: '~128-288 bytes (constant)',
    stark: '~45-200 KB (polylogarithmic)',
    snarkAdvantage: true,
    starkAdvantage: false,
    tooltip: 'Groth16: 3 group elements (~128 B). STARK proof = Merkle paths + FRI commitments. Tradeoff: размер vs прозрачность.',
  },
  {
    category: 'Verification Time',
    snark: '~3 pairings (ms, ~200-300K gas)',
    stark: 'O(poly(log N)) hash ops (ms, ~1-5M gas)',
    snarkAdvantage: true,
    starkAdvantage: false,
    tooltip: 'SNARK verification = constant (3 pairing ops). STARK verification = log^2(N) hash operations.',
  },
  {
    category: 'Prover Time',
    snark: 'O(N log N) EC operations (slower)',
    stark: 'O(N log^2 N) field/hash ops (faster in practice)',
    snarkAdvantage: false,
    starkAdvantage: true,
    tooltip: 'EC operations (SNARKs) дороже field ops + hashing (STARKs). Для больших вычислений STARK prover быстрее.',
  },
  {
    category: 'Quantum Resistance',
    snark: 'No (EC discrete log solvable by Shor)',
    stark: 'Yes (hash functions resist quantum attacks)',
    snarkAdvantage: false,
    starkAdvantage: true,
    tooltip: 'Алгоритм Шора ломает EC-based SNARKs. Hash-based STARKs требуют удвоения размера hash для Grover.',
  },
  {
    category: 'Production Systems',
    snark: 'zkSync Era, Polygon zkEVM, Scroll, Zcash',
    stark: 'StarkNet, StarkEx (dYdX, Immutable X), RISC Zero',
    snarkAdvantage: false,
    starkAdvantage: false,
    tooltip: 'SNARK-based rollups доминируют по TVL. STARK-based (StarkNet) растут. RISC Zero: general-purpose STARK VM.',
  },
];

/**
 * SNARKvsSTARKDeepDiagram
 *
 * Deep SNARK vs STARK comparison: 8 dimensions with hover tooltips.
 * Goes beyond Phase 8's surface comparison (SCALE-07).
 * Phase 8 = ЧТО отличает. Phase 9 = ПОЧЕМУ отличает (cryptographic basis).
 */
export function SNARKvsSTARKDeepDiagram() {
  return (
    <DiagramContainer title="SNARKs vs STARKs: глубокое сравнение" color="orange">
      <div style={{
        fontSize: 10,
        color: colors.textMuted,
        fontFamily: 'monospace',
        marginBottom: 12,
        fontStyle: 'italic',
      }}>
        Module 8 рассказал ЧТО отличает SNARKs и STARKs. Теперь мы понимаем ПОЧЕМУ.
      </div>

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
                minWidth: 120,
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
                minWidth: 180,
              }}>
                SNARK (Groth16)
              </th>
              <th style={{
                padding: '8px 10px',
                textAlign: 'left',
                fontSize: 11,
                fontWeight: 600,
                color: '#f59e0b',
                borderBottom: '2px solid rgba(245,158,11,0.3)',
                minWidth: 180,
              }}>
                STARK (FRI-based)
              </th>
            </tr>
          </thead>
          <tbody>
            {DEEP_COMPARISON_ROWS.map((row, i) => (
              <tr
                key={i}
                style={{
                  cursor: 'help',
                }}
              >
                <td style={{
                  padding: '7px 10px',
                  color: colors.textMuted,
                  fontWeight: 600,
                  fontSize: 11,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <DiagramTooltip content={row.tooltip}>
                    <span>{row.category}</span>
                  </DiagramTooltip>
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
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DiagramTooltip content="Фундаментальный trade-off: SNARKs используют EC pairings для сжатия proof до 3 group elements (~128 байт), но требуют trusted setup. STARKs используют hash-based commitments (Merkle paths), которые не сжимаются — но обеспечивают прозрачность и квантовую устойчивость.">
          <DataBox
            label="Ключевое различие (WHY)"
            value="SNARK: маленький proof потому что EC pairings позволяют 'сжать' polynomial check в 3 group elements. STARK: большой proof потому что hash-based commitments (Merkle paths) не сжимаются -- но зато нет trusted setup и есть quantum resistance."
            variant="info"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
