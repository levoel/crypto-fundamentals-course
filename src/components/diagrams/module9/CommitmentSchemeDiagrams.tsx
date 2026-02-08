/**
 * Commitment Scheme Diagrams (ZK-02)
 *
 * Exports:
 * - CommitmentLifecycleDiagram: Commitment lifecycle step-through (history array, 5 steps)
 * - HashVsPedersenDiagram: Hash-based vs Pedersen comparison table (static)
 * - HomomorphicCommitmentDiagram: Homomorphic commitment demo (interactive, two InteractiveValue sliders)
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  CommitmentLifecycleDiagram                                          */
/* ================================================================== */

interface CommitStep {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  aliceHas: string;
  bobHas: string;
  arrowLabel?: string;
  arrowDirection?: 'A->B' | 'B->A' | null;
}

const COMMIT_STEPS: CommitStep[] = [
  {
    title: 'CHOOSE',
    subtitle: 'Алиса выбирает значение',
    description: "Алиса выбирает секретное значение m (например, свой голос: 'ДА'). Генерирует случайный blinding factor r.",
    color: '#a78bfa',
    aliceHas: "m = 'ДА', r = random",
    bobHas: '(ничего)',
    arrowDirection: null,
  },
  {
    title: 'COMMIT',
    subtitle: 'Создание commitment',
    description: 'Алиса вычисляет commitment C = H(m || r) и отправляет C Бобу. Конверт запечатан.',
    color: '#3b82f6',
    aliceHas: 'm, r, C',
    bobHas: 'C (непрозрачный)',
    arrowLabel: 'C = H(m || r)',
    arrowDirection: 'A->B',
  },
  {
    title: 'LOCKED',
    subtitle: 'Commitment зафиксирован',
    description: 'Commitment зафиксирован. Алиса НЕ МОЖЕТ изменить m -- это нарушило бы binding. Боб НЕ МОЖЕТ узнать m -- это нарушило бы hiding.',
    color: '#f59e0b',
    aliceHas: 'm, r (секретно)',
    bobHas: 'C (публично)',
    arrowDirection: null,
  },
  {
    title: 'REVEAL',
    subtitle: 'Раскрытие',
    description: "Алиса раскрывает (m, r). Боб проверяет: C == H(m || r)?",
    color: '#f97316',
    aliceHas: "раскрывает m='ДА', r",
    bobHas: "получает (m, r), проверяет",
    arrowLabel: "(m='ДА', r)",
    arrowDirection: 'A->B',
  },
  {
    title: 'VERIFY',
    subtitle: 'Проверка',
    description: "C == H('ДА' || r)? Да -> Боб убеждён, что Алиса выбрала 'ДА' ещё на шаге 1. Binding: Алиса не могла подменить. Hiding: Боб не мог узнать до раскрытия.",
    color: '#22c55e',
    aliceHas: 'доказано: голос = ДА',
    bobHas: 'верифицировано!',
    arrowDirection: null,
  },
];

/**
 * CommitmentLifecycleDiagram
 *
 * 5-step step-through showing commit-reveal scheme.
 */
export function CommitmentLifecycleDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const step = history[history.length - 1];
  const current = COMMIT_STEPS[step];

  const handleNext = () => {
    if (step < COMMIT_STEPS.length - 1) {
      setHistory([...history, step + 1]);
    }
  };
  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const handleReset = () => setHistory([0]);

  return (
    <DiagramContainer title="Lifecycle commitment scheme: запечатать и раскрыть" color="blue">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {COMMIT_STEPS.map((s, i) => (
          <div key={i} style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: i === step ? 700 : 400,
            background: i === step ? `${s.color}20` : i < step ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
            color: i === step ? s.color : i < step ? '#22c55e' : colors.textMuted,
            border: `1px solid ${i === step ? `${s.color}50` : 'rgba(255,255,255,0.08)'}`,
          }}>
            {s.title}
          </div>
        ))}
      </div>

      {/* Alice and Bob visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={400} height={120} viewBox="0 0 400 120">
          {/* Alice */}
          <circle cx={60} cy={40} r={20} fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth={1.5} />
          <text x={60} y={44} fill="#a78bfa" fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight={600}>A</text>
          <text x={60} y={75} fill="#a78bfa" fontSize={9} textAnchor="middle" fontFamily="monospace">Алиса</text>

          {/* Bob */}
          <circle cx={340} cy={40} r={20} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth={1.5} />
          <text x={340} y={44} fill="#3b82f6" fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight={600}>B</text>
          <text x={340} y={75} fill="#3b82f6" fontSize={9} textAnchor="middle" fontFamily="monospace">Боб</text>

          {/* Arrow */}
          {current.arrowDirection === 'A->B' && (
            <g>
              <line x1={90} y1={40} x2={310} y2={40} stroke={current.color} strokeWidth={1.5} markerEnd="url(#arrowCS)" />
              <defs>
                <marker id="arrowCS" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={current.color} />
                </marker>
              </defs>
              <rect x={120} y={22} width={160} height={18} rx={4} fill="rgba(0,0,0,0.5)" />
              <text x={200} y={35} fill={current.color} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
                {current.arrowLabel}
              </text>
            </g>
          )}

          {/* Locked icon at step 2 */}
          {step === 2 && (
            <g>
              <rect x={185} y={25} width={30} height={20} rx={3} fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth={1} />
              <text x={200} y={39} fill="#f59e0b" fontSize={10} textAnchor="middle" fontFamily="monospace">🔒</text>
            </g>
          )}

          {/* Checkmark at step 4 */}
          {step === 4 && (
            <g>
              <circle cx={200} cy={40} r={14} fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth={1.5} />
              <text x={200} y={45} fill="#22c55e" fontSize={14} textAnchor="middle" fontFamily="monospace" fontWeight={700}>OK</text>
            </g>
          )}

          {/* Alice's state */}
          <text x={60} y={100} fill={colors.text} fontSize={8} textAnchor="middle" fontFamily="monospace">{current.aliceHas}</text>

          {/* Bob's state */}
          <text x={340} y={100} fill={colors.text} fontSize={8} textAnchor="middle" fontFamily="monospace">{current.bobHas}</text>
        </svg>
      </div>

      {/* Current step detail */}
      <div style={{
        ...glassStyle,
        padding: 14,
        marginBottom: 12,
        border: `1px solid ${current.color}30`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: current.color, fontFamily: 'monospace' }}>
            {step + 1}. {current.title}: {current.subtitle}
          </div>
          <span style={{
            fontSize: 9,
            fontFamily: 'monospace',
            padding: '2px 8px',
            borderRadius: 4,
            background: `${current.color}15`,
            color: current.color,
            border: `1px solid ${current.color}30`,
          }}>
            {step + 1}/{COMMIT_STEPS.length}
          </span>
        </div>
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
          {current.description}
        </div>
      </div>

      {/* Properties highlight at final step */}
      {step === 4 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace', marginBottom: 4 }}>Binding</div>
            <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.5 }}>
              Алиса не могла изменить m между commit и reveal. H(m||r) однозначно привязан к m.
            </div>
          </div>
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace', marginBottom: 4 }}>Hiding</div>
            <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.5 }}>
              Боб не мог узнать m из C. Случайный r делает C неотличимым от случайного числа.
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleBack} disabled={history.length <= 1} style={{
          padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)', color: history.length > 1 ? colors.text : colors.textMuted,
          fontSize: 11, fontFamily: 'monospace', cursor: history.length > 1 ? 'pointer' : 'not-allowed',
        }}>Back</button>
        <button onClick={handleNext} disabled={step >= COMMIT_STEPS.length - 1} style={{
          padding: '6px 16px', borderRadius: 6,
          border: `1px solid ${step < COMMIT_STEPS.length - 1 ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
          background: step < COMMIT_STEPS.length - 1 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
          color: step < COMMIT_STEPS.length - 1 ? '#3b82f6' : colors.textMuted,
          fontSize: 11, fontFamily: 'monospace', cursor: step < COMMIT_STEPS.length - 1 ? 'pointer' : 'not-allowed',
        }}>Step</button>
        <button onClick={handleReset} style={{
          padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)', color: colors.textMuted, fontSize: 11,
          fontFamily: 'monospace', cursor: 'pointer',
        }}>Reset</button>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  HashVsPedersenDiagram                                               */
/* ================================================================== */

interface CompRow {
  property: string;
  hash: string;
  hashColor: string;
  pedersen: string;
  pedersenColor: string;
  highlight?: boolean;
}

const COMPARISON_ROWS: CompRow[] = [
  { property: 'Формула', hash: 'C = H(m || r)', hashColor: colors.text, pedersen: 'C = mG + rH', pedersenColor: colors.text },
  { property: 'Binding', hash: 'Computational', hashColor: '#3b82f6', pedersen: 'Computational (DLOG)', pedersenColor: '#3b82f6' },
  { property: 'Hiding', hash: 'Perfect (random r)', hashColor: '#22c55e', pedersen: 'Perfect (random r)', pedersenColor: '#22c55e' },
  { property: 'Homomorphic', hash: 'Нет', hashColor: '#ef4444', pedersen: 'ДА! C(a)+C(b)=C(a+b)', pedersenColor: '#22c55e', highlight: true },
  { property: 'Setup', hash: 'Нет (hash function)', hashColor: colors.textMuted, pedersen: 'Два генератора G, H', pedersenColor: colors.textMuted },
  { property: 'Применения', hash: 'Voting, timestamping', hashColor: colors.textMuted, pedersen: 'Confidential TX, ZK', pedersenColor: colors.textMuted },
];

/**
 * HashVsPedersenDiagram
 *
 * Static comparison table: hash-based vs Pedersen commitment.
 */
export function HashVsPedersenDiagram() {
  return (
    <DiagramContainer title="Hash-based vs Pedersen: сравнение commitment schemes" color="orange">
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 1fr',
        gap: 1,
        marginBottom: 1,
      }}>
        <div style={{ ...glassStyle, padding: '8px 10px', fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace' }}>
          Свойство
        </div>
        <div style={{ ...glassStyle, padding: '8px 10px', fontSize: 10, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace', textAlign: 'center' }}>
          Hash-based
        </div>
        <div style={{ ...glassStyle, padding: '8px 10px', fontSize: 10, fontWeight: 600, color: '#a78bfa', fontFamily: 'monospace', textAlign: 'center' }}>
          Pedersen
        </div>
      </div>

      {/* Table rows */}
      {COMPARISON_ROWS.map((row) => (
        <div key={row.property} style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 1fr',
          gap: 1,
          marginBottom: 1,
        }}>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 10,
            fontWeight: 500,
            color: colors.text,
            fontFamily: 'monospace',
          }}>
            {row.property}
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 10,
            color: row.hashColor,
            fontFamily: 'monospace',
            textAlign: 'center',
            background: row.highlight ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
          }}>
            {row.hash}
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 10,
            color: row.pedersenColor,
            fontFamily: 'monospace',
            textAlign: 'center',
            background: row.highlight ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
            fontWeight: row.highlight ? 700 : 400,
          }}>
            {row.pedersen}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Ключевое различие"
          value="Pedersen commitment -- строительный блок ZK-доказательств. Гомоморфность позволяет ВЫЧИСЛЯТЬ на зашифрованных данных: складывать, сравнивать, проверять -- не раскрывая значений."
          variant="info"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  HomomorphicCommitmentDiagram                                        */
/* ================================================================== */

/**
 * Simplified FNV-like hash for browser-side simulation of commitment values.
 */
function simCommitHash(val: number, r: number): string {
  let h = 0x811c9dc5;
  const data = [val & 0xFF, (val >> 8) & 0xFF, r & 0xFF, (r >> 8) & 0xFF, (r >> 16) & 0xFF, (r >> 24) & 0xFF];
  for (const byte of data) {
    h ^= byte;
    h = Math.imul(h, 0x01000193);
  }
  h = h >>> 0;
  return '0x' + h.toString(16).padStart(8, '0') + '...';
}

/**
 * HomomorphicCommitmentDiagram
 *
 * Two sliders (a, b) showing that C(a) + C(b) = C(a+b) in Pedersen commitment.
 * Uses simulated values (FNV hash) for browser display; real EC math in Python notebook.
 */
export function HomomorphicCommitmentDiagram() {
  const [a, setA] = useState(7);
  const [b, setB] = useState(13);

  const r1 = 0xCAFE01;
  const r2 = 0xBEEF02;

  const ca = useMemo(() => simCommitHash(a, r1), [a]);
  const cb = useMemo(() => simCommitHash(b, r2), [b]);
  const cab = useMemo(() => simCommitHash(a + b, r1 + r2), [a, b]);

  return (
    <DiagramContainer title="Гомоморфное свойство Pedersen: вычисления на commitments" color="green">
      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <InteractiveValue value={a} onChange={setA} min={1} max={100} label="Значение a" />
        <InteractiveValue value={b} onChange={setB} min={1} max={100} label="Значение b" />
      </div>

      {/* Commitment rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {/* C(a) */}
        <div style={{
          ...glassStyle,
          padding: 12,
          border: '1px solid rgba(167,139,250,0.2)',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          alignItems: 'center',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 2 }}>
              C(a) = a*G + r1*H
            </div>
            <div style={{ fontSize: 9, color: '#a78bfa', fontFamily: 'monospace' }}>
              Commitment для a = {a}
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', fontFamily: 'monospace', textAlign: 'right' }}>
            {ca}
          </div>
        </div>

        {/* C(b) */}
        <div style={{
          ...glassStyle,
          padding: 12,
          border: '1px solid rgba(59,130,246,0.2)',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          alignItems: 'center',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 2 }}>
              C(b) = b*G + r2*H
            </div>
            <div style={{ fontSize: 9, color: '#3b82f6', fontFamily: 'monospace' }}>
              Commitment для b = {b}
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace', textAlign: 'right' }}>
            {cb}
          </div>
        </div>

        {/* Sum: C(a) + C(b) = C(a+b) */}
        <div style={{
          ...glassStyle,
          padding: 12,
          border: '1px solid rgba(34,197,94,0.3)',
          background: 'rgba(34,197,94,0.05)',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          alignItems: 'center',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 2 }}>
              C(a) + C(b) = C(a+b)
            </div>
            <div style={{ fontSize: 9, color: '#22c55e', fontFamily: 'monospace' }}>
              Сумма commitments = commitment суммы
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', fontFamily: 'monospace', marginTop: 4 }}>
              a + b = {a + b}
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', fontFamily: 'monospace', textAlign: 'right' }}>
            {cab}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div style={{ ...glassStyle, padding: 12, border: '1px solid rgba(34,197,94,0.15)', marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', fontFamily: 'monospace', marginBottom: 6 }}>
          Почему это работает:
        </div>
        <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.6 }}>
          C(a) + C(b) = (a*G + r1*H) + (b*G + r2*H) = (a+b)*G + (r1+r2)*H = C(a+b, r1+r2)
        </div>
      </div>

      <DataBox
        label="Применение"
        value="Можно сложить commitments БЕЗ раскрытия a и b! Верификатор видит только C(a), C(b), C(a+b) -- и может проверить, что C(a) + C(b) = C(a+b). Значения a и b остаются секретными. Это основа Confidential Transactions (Monero) и range proofs."
        variant="info"
      />
    </DiagramContainer>
  );
}
