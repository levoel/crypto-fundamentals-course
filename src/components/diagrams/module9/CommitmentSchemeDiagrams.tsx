/** @jsxImportSource solid-js */
/**
 * Commitment Scheme Diagrams (ZK-02)
 *
 * Exports:
 * - CommitmentLifecycleDiagram: Commitment lifecycle step-through (history array, 5 steps)
 * - HashVsPedersenDiagram: Hash-based vs Pedersen comparison table (static)
 * - HomomorphicCommitmentDiagram: Homomorphic commitment demo (interactive, two InteractiveValue sliders)
 */

import { createMemo, createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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
  tooltip: string;
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
    tooltip: 'Инициализация параметров схемы обязательств (commitment scheme): выбор хеш-функции или генераторов группы для Pedersen commitment. Алиса готовит секретное значение и случайный blinding factor.',
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
    tooltip: 'Фаза обязательства (commit): отправитель вычисляет C = Commit(m, r) и публикует C. После этого значение m нельзя изменить (binding), но оно скрыто (hiding).',
  },
  {
    title: 'LOCKED',
    subtitle: 'Commitment зафиксирован',
    description: 'Commitment зафиксирован. Алиса НЕ МОЖЕТ изменить m -- это нарушило бы binding. Боб НЕ МОЖЕТ узнать m -- это нарушило бы hiding.',
    color: '#f59e0b',
    aliceHas: 'm, r (секретно)',
    bobHas: 'C (публично)',
    arrowDirection: null,
    tooltip: 'Фаза блокировки: commitment зафиксирован. Два ключевых свойства активны — binding (Алиса не может изменить m) и hiding (Боб не может узнать m из C).',
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
    tooltip: 'Фаза раскрытия (reveal): Алиса отправляет открытый текст m и blinding factor r. Боб может проверить, что C действительно соответствует переданным значениям.',
  },
  {
    title: 'VERIFY',
    subtitle: 'Проверка',
    description: "C == H('ДА' || r)? Да -> Боб убеждён, что Алиса выбрала 'ДА' ещё на шаге 1. Binding: Алиса не могла подменить. Hiding: Боб не мог узнать до раскрытия.",
    color: '#22c55e',
    aliceHas: 'доказано: голос = ДА',
    bobHas: 'верифицировано!',
    arrowDirection: null,
    tooltip: 'Фаза верификации: Боб вычисляет H(m || r) и сравнивает с C. Совпадение гарантирует, что Алиса не изменила значение m после фазы commit. Binding и hiding подтверждены.',
  },
];

/**
 * CommitmentLifecycleDiagram
 *
 * 5-step step-through showing commit-reveal scheme.
 */
export function CommitmentLifecycleDiagram() {
  const [history, setHistory] = createSignal<number[]>([0]);
  const step = history()[history().length - 1];
  const current = COMMIT_STEPS[step];

  const handleNext = () => {
    if (step < COMMIT_STEPS.length - 1) {
      setHistory([...history, step + 1]);
    }
  };
  const handleBack = () => {
    if (history().length > 1) {
      setHistory(history().slice(0, -1));
    }
  };
  const handleReset = () => setHistory([0]);

  return (
    <DiagramContainer title="Lifecycle commitment scheme: запечатать и раскрыть" color="blue">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px', 'flex-wrap': 'wrap' }}>
        {COMMIT_STEPS.map((s, i) => (
          <div style={{
            'padding': '4px 8px',
            'border-radius': '4px',
            'font-size': '9px',
            'font-family': 'monospace',
            'font-weight': i === step ? 700 : 400,
            'background': i === step ? `${s.color}20` : i < step ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
            'color': i === step ? s.color : i < step ? '#22c55e' : colors.textMuted,
            'border': `1px solid ${i === step ? `${s.color}50` : 'rgba(255,255,255,0.08)'}`,
          }}>
            {s.title}
          </div>
        ))}
      </div>

      {/* Alice and Bob visualization */}
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '16px' }}>
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
      <DiagramTooltip content={current.tooltip}>
        <div style={{
          ...glassStyle,
          'padding': '14px',
          'margin-bottom': '12px',
          'border': `1px solid ${current.color}30`,
        }}>
          <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px' }}>
            <div style={{ 'font-size': '13px', 'font-weight': '700', 'color': current.color, 'font-family': 'monospace' }}>
              {step + 1}. {current.title}: {current.subtitle}
            </div>
            <span style={{
              'font-size': '9px',
              'font-family': 'monospace',
              'padding': '2px 8px',
              'border-radius': '4px',
              'background': `${current.color}15`,
              'color': current.color,
              'border': `1px solid ${current.color}30`,
            }}>
              {step + 1}/{COMMIT_STEPS.length}
            </span>
          </div>
          <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6' }}>
            {current.description}
          </div>
        </div>
      </DiagramTooltip>

      {/* Properties highlight at final step */}
      {step === 4 && (
        <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '8px', 'margin-bottom': '12px' }}>
          <DiagramTooltip content="Binding (привязка): после фазы commit Алиса не может найти другое значение m', которое давало бы тот же commitment C. Это свойство основано на collision-resistance хеш-функции или hardness дискретного логарифма.">
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ 'font-size': '10px', 'font-weight': '700', 'color': '#3b82f6', 'font-family': 'monospace', 'margin-bottom': '4px' }}>Binding</div>
              <div style={{ 'font-size': '10px', 'color': colors.text, 'line-height': '1.5' }}>
                Алиса не могла изменить m между commit и reveal. H(m||r) однозначно привязан к m.
              </div>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Hiding (скрытие): до фазы reveal Боб не может извлечь никакой информации о m из commitment C. Случайный blinding factor r делает C вычислительно неотличимым от случайного значения.">
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ 'font-size': '10px', 'font-weight': '700', 'color': '#f59e0b', 'font-family': 'monospace', 'margin-bottom': '4px' }}>Hiding</div>
              <div style={{ 'font-size': '10px', 'color': colors.text, 'line-height': '1.5' }}>
                Боб не мог узнать m из C. Случайный r делает C неотличимым от случайного числа.
              </div>
            </div>
          </DiagramTooltip>
        </div>
      )}

      {/* Navigation */}
      <DiagramTooltip content="Навигация по lifecycle commitment scheme: от выбора значения (choose) через commit и lock до reveal и verify. Полный цикл обязательства.">
        <div style={{ 'display': 'flex', 'gap': '8px' }}>
          <button onClick={handleBack} disabled={history().length <= 1} style={{
            'padding': '6px 16px', 'border-radius': '6px', 'border': '1px solid rgba(255,255,255,0.15)',
            'background': 'rgba(255,255,255,0.05)', 'color': history().length > 1 ? colors.text : colors.textMuted,
            'font-size': '11px', 'font-family': 'monospace', 'cursor': history().length > 1 ? 'pointer' : 'not-allowed',
          }}>Back</button>
          <button onClick={handleNext} disabled={step >= COMMIT_STEPS.length - 1} style={{
            'padding': '6px 16px', 'border-radius': '6px',
            'border': `1px solid ${step < COMMIT_STEPS.length - 1 ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
            'background': step < COMMIT_STEPS.length - 1 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
            'color': step < COMMIT_STEPS.length - 1 ? '#3b82f6' : colors.textMuted,
            'font-size': '11px', 'font-family': 'monospace', 'cursor': step < COMMIT_STEPS.length - 1 ? 'pointer' : 'not-allowed',
          }}>Step</button>
          <button onClick={handleReset} style={{
            'padding': '6px 16px', 'border-radius': '6px', 'border': '1px solid rgba(255,255,255,0.15)',
            'background': 'rgba(255,255,255,0.05)', 'color': colors.textMuted, 'font-size': '11px',
            'font-family': 'monospace', 'cursor': 'pointer',
          }}>Reset</button>
        </div>
      </DiagramTooltip>
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
  hashTooltip: string;
  pedersenTooltip: string;
}

const COMPARISON_ROWS: CompRow[] = [
  {
    property: 'Формула',
    hash: 'C = H(m || r)',
    hashColor: colors.text,
    pedersen: 'C = mG + rH',
    pedersenColor: colors.text,
    hashTooltip: 'Hash commitment: конкатенация сообщения m и blinding factor r, затем хеширование. Простая и эффективная схема на основе криптографической хеш-функции.',
    pedersenTooltip: 'Pedersen commitment: линейная комбинация двух генераторов группы G и H с коэффициентами m (сообщение) и r (blinding factor). Основан на сложности дискретного логарифма.',
  },
  {
    property: 'Binding',
    hash: 'Computational',
    hashColor: '#3b82f6',
    pedersen: 'Computational (DLOG)',
    pedersenColor: '#3b82f6',
    hashTooltip: 'Hash commitment обеспечивает computational binding: изменение m требует нахождения коллизии хеш-функции. Безопасно при условии collision-resistance хеша.',
    pedersenTooltip: 'Pedersen commitment обеспечивает computational binding: нахождение двух разных (m, r) пар с одинаковым commitment эквивалентно вычислению дискретного логарифма log_G(H).',
  },
  {
    property: 'Hiding',
    hash: 'Perfect (random r)',
    hashColor: '#22c55e',
    pedersen: 'Perfect (random r)',
    pedersenColor: '#22c55e',
    hashTooltip: 'Hash commitment обеспечивает computational hiding (зависит от PRF-свойства хеша). При случайном r значение H(m||r) вычислительно неотличимо от случайного.',
    pedersenTooltip: 'Pedersen commitment обеспечивает perfect hiding: C = mG + rH information-theoretically скрывает m. Для любого C и любого m существует r, дающий этот C.',
  },
  {
    property: 'Homomorphic',
    hash: 'Нет',
    hashColor: '#ef4444',
    pedersen: 'ДА! C(a)+C(b)=C(a+b)',
    pedersenColor: '#22c55e',
    highlight: true,
    hashTooltip: 'Hash commitment НЕ гомоморфен: H(m1||r1) + H(m2||r2) !== H(m1+m2||r1+r2). Хеш-функции не сохраняют алгебраическую структуру.',
    pedersenTooltip: 'Pedersen commitment гомоморфен: C(m1,r1) * C(m2,r2) = C(m1+m2, r1+r2). Это ключевое свойство для ZK-доказательств и confidential transactions.',
  },
  {
    property: 'Setup',
    hash: 'Нет (hash function)',
    hashColor: colors.textMuted,
    pedersen: 'Два генератора G, H',
    pedersenColor: colors.textMuted,
    hashTooltip: 'Hash commitment не требует trusted setup: достаточно стандартной хеш-функции (SHA-256, Poseidon). Простая реализация и развертывание.',
    pedersenTooltip: 'Pedersen commitment требует два генератора G и H, для которых дискретный логарифм log_G(H) неизвестен. Обычно выбираются через hash-to-curve.',
  },
  {
    property: 'Применения',
    hash: 'Voting, timestamping',
    hashColor: colors.textMuted,
    pedersen: 'Confidential TX, ZK',
    pedersenColor: colors.textMuted,
    hashTooltip: 'Hash-based commitments используются для голосования, timestamping, и других задач, где не требуется гомоморфность. Простота реализации делает их популярным выбором.',
    pedersenTooltip: 'Pedersen commitments используются в Confidential Transactions (Monero, Liquid), range proofs, и как строительный блок ZK-доказательств благодаря гомоморфному свойству.',
  },
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
        'display': 'grid',
        'grid-template-columns': '120px 1fr 1fr',
        'gap': '1px',
        'margin-bottom': '1px',
      }}>
        <div style={{ ...glassStyle, 'padding': '8px 10px', 'font-size': '10px', 'font-weight': '600', 'color': colors.textMuted, 'font-family': 'monospace' }}>
          Свойство
        </div>
        <div style={{ ...glassStyle, 'padding': '8px 10px', 'font-size': '10px', 'font-weight': '600', 'color': '#f59e0b', 'font-family': 'monospace', 'text-align': 'center' }}>
          Hash-based
        </div>
        <div style={{ ...glassStyle, 'padding': '8px 10px', 'font-size': '10px', 'font-weight': '600', 'color': '#a78bfa', 'font-family': 'monospace', 'text-align': 'center' }}>
          Pedersen
        </div>
      </div>

      {/* Table rows */}
      {COMPARISON_ROWS.map((row) => (
        <div style={{
          'display': 'grid',
          'grid-template-columns': '120px 1fr 1fr',
          'gap': '1px',
          'margin-bottom': '1px',
        }}>
          <div style={{
            ...glassStyle,
            'padding': '8px 10px',
            'font-size': '10px',
            'font-weight': '500',
            'color': colors.text,
            'font-family': 'monospace',
          }}>
            {row.property}
          </div>
          <DiagramTooltip content={row.hashTooltip}>
            <div style={{
              ...glassStyle,
              'padding': '8px 10px',
              'font-size': '10px',
              'color': row.hashColor,
              'font-family': 'monospace',
              'text-align': 'center',
              'background': row.highlight ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
            }}>
              {row.hash}
            </div>
          </DiagramTooltip>
          <DiagramTooltip content={row.pedersenTooltip}>
            <div style={{
              ...glassStyle,
              'padding': '8px 10px',
              'font-size': '10px',
              'color': row.pedersenColor,
              'font-family': 'monospace',
              'text-align': 'center',
              'background': row.highlight ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
              'font-weight': row.highlight ? 700 : 400,
            }}>
              {row.pedersen}
            </div>
          </DiagramTooltip>
        </div>
      ))}

      <div style={{ 'margin-top': '12px' }}>
        <DiagramTooltip content="Гомоморфность Pedersen commitment — ключевое отличие: позволяет выполнять арифметические операции на зашифрованных данных. Это основа для range proofs, confidential transactions и многих ZK-протоколов.">
          <DataBox
            label="Ключевое различие"
            value="Pedersen commitment -- строительный блок ZK-доказательств. Гомоморфность позволяет ВЫЧИСЛЯТЬ на зашифрованных данных: складывать, сравнивать, проверять -- не раскрывая значений."
            variant="info"
          />
        </DiagramTooltip>
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
  const [a, setA] = createSignal(7);
  const [b, setB] = createSignal(13);

  const r1 = 0xCAFE01;
  const r2 = 0xBEEF02;

  const ca = createMemo(() => simCommitHash(a(), r1));
  const cb = createMemo(() => simCommitHash(b(), r2));
  const cab = createMemo(() => simCommitHash(a() + b(), r1 + r2));

  return (
    <DiagramContainer title="Гомоморфное свойство Pedersen: вычисления на commitments" color="green">
      {/* Sliders */}
      <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '12px', 'margin-bottom': '16px' }}>
        <DiagramTooltip content="Значение a: первое коммитируемое число. Commitment C(a) = a*G + r_a*H вычисляется с использованием случайного blinding factor r_a.">
          <div>
            <InteractiveValue value={a()} onChange={setA} min={1} max={100} label="Значение a" />
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Значение b: второе коммитируемое число. Гомоморфное свойство позволяет вычислить C(a+b) = C(a) * C(b) без раскрытия a и b.">
          <div>
            <InteractiveValue value={b()} onChange={setB} min={1} max={100} label="Значение b" />
          </div>
        </DiagramTooltip>
      </div>

      {/* Commitment rows */}
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '8px', 'margin-bottom': '16px' }}>
        {/* C(a) */}
        <DiagramTooltip content={`Commitment C(a) для значения a = ${a()}: вычисляется как a*G + r1*H. Blinding factor r1 скрывает значение a, но позволяет верифицировать его при раскрытии.`}>
          <div style={{
            ...glassStyle,
            'padding': '12px',
            'border': '1px solid rgba(167,139,250,0.2)',
            'display': 'grid',
            'grid-template-columns': '200px 1fr',
            'align-items': 'center',
            'gap': '12px',
          }}>
            <div>
              <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '2px' }}>
                C(a) = a*G + r1*H
              </div>
              <div style={{ 'font-size': '9px', 'color': '#a78bfa', 'font-family': 'monospace' }}>
                Commitment для a = {a()}
              </div>
            </div>
            <div style={{ 'font-size': '12px', 'font-weight': '600', 'color': '#a78bfa', 'font-family': 'monospace', 'text-align': 'right' }}>
              {ca}
            </div>
          </div>
        </DiagramTooltip>

        {/* C(b) */}
        <DiagramTooltip content={`Commitment C(b) для значения b = ${b()}: вычисляется как b*G + r2*H. Независимый blinding factor r2 обеспечивает hiding для каждого commitment отдельно.`}>
          <div style={{
            ...glassStyle,
            'padding': '12px',
            'border': '1px solid rgba(59,130,246,0.2)',
            'display': 'grid',
            'grid-template-columns': '200px 1fr',
            'align-items': 'center',
            'gap': '12px',
          }}>
            <div>
              <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '2px' }}>
                C(b) = b*G + r2*H
              </div>
              <div style={{ 'font-size': '9px', 'color': '#3b82f6', 'font-family': 'monospace' }}>
                Commitment для b = {b()}
              </div>
            </div>
            <div style={{ 'font-size': '12px', 'font-weight': '600', 'color': '#3b82f6', 'font-family': 'monospace', 'text-align': 'right' }}>
              {cb}
            </div>
          </div>
        </DiagramTooltip>

        {/* Sum: C(a) + C(b) = C(a+b) */}
        <DiagramTooltip content={`Гомоморфная сумма: C(a) + C(b) = C(${a()}+${b()}) = C(${a() + b()}). Верификатор видит только commitments и может проверить, что сумма корректна, не зная значений a и b.`}>
          <div style={{
            ...glassStyle,
            'padding': '12px',
            'border': '1px solid rgba(34,197,94,0.3)',
            'background': 'rgba(34,197,94,0.05)',
            'display': 'grid',
            'grid-template-columns': '200px 1fr',
            'align-items': 'center',
            'gap': '12px',
          }}>
            <div>
              <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '2px' }}>
                C(a) + C(b) = C(a+b)
              </div>
              <div style={{ 'font-size': '9px', 'color': '#22c55e', 'font-family': 'monospace' }}>
                Сумма commitments = commitment суммы
              </div>
              <div style={{ 'font-size': '11px', 'font-weight': '700', 'color': '#22c55e', 'font-family': 'monospace', 'margin-top': '4px' }}>
                a + b = {a() + b()}
              </div>
            </div>
            <div style={{ 'font-size': '12px', 'font-weight': '600', 'color': '#22c55e', 'font-family': 'monospace', 'text-align': 'right' }}>
              {cab}
            </div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Explanation */}
      <DiagramTooltip content="Гомоморфные commitments позволяют реализовать confidential transactions: суммы переводов скрыты, но верификатор может проверить, что сумма входов равна сумме выходов. Используется в Mimblewimble (Grin, Beam), Confidential Transactions в Monero и Liquid Network.">
        <div style={{ ...glassStyle, 'padding': '12px', 'border': '1px solid rgba(34,197,94,0.15)', 'margin-bottom': '12px' }}>
          <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#22c55e', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
            Почему это работает:
          </div>
          <div style={{ 'font-size': '10px', 'color': colors.text, 'font-family': 'monospace', 'line-height': '1.6' }}>
            C(a) + C(b) = (a*G + r1*H) + (b*G + r2*H) = (a+b)*G + (r1+r2)*H = C(a+b, r1+r2)
          </div>
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="Практическое применение: можно сложить commitments БЕЗ раскрытия значений. В блокчейне это позволяет скрыть суммы транзакций, сохраняя возможность верификации баланса. Основа Confidential Transactions (Monero) и range proofs.">
        <DataBox
          label="Применение"
          value="Можно сложить commitments БЕЗ раскрытия a и b! Верификатор видит только C(a), C(b), C(a+b) -- и может проверить, что C(a) + C(b) = C(a+b). Значения a и b остаются секретными. Это основа Confidential Transactions (Monero) и range proofs."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
