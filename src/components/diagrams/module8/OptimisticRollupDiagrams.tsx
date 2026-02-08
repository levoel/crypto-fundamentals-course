/**
 * Optimistic Rollup Diagrams (SCALE-05)
 *
 * Exports:
 * - RollupArchitectureDiagram: 6-step step-through showing optimistic rollup flow (history array)
 * - FraudProofComparisonDiagram: Static two-column comparison of single-round vs multi-round fraud proofs
 * - L1L2MessageDiagram: 6-step step-through showing L1<->L2 deposit and withdrawal flows (history array)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  RollupArchitectureDiagram                                            */
/* ================================================================== */

interface RollupStep {
  title: string;
  phase: string;
  description: string;
  actors: { name: string; color: string; active: boolean }[];
  dataFlow: string;
  highlight: string;
}

const ROLLUP_STEPS: RollupStep[] = [
  {
    title: 'USER TX -- Отправка транзакции',
    phase: 'Soft confirmation (~2s)',
    description: 'Пользователь отправляет транзакцию sequencer. Sequencer -- централизованный оператор, который принимает, упорядочивает и исполняет транзакции локально. "Soft confirmation" за секунды.',
    actors: [
      { name: 'User', color: '#6366f1', active: true },
      { name: 'Sequencer', color: '#f59e0b', active: true },
      { name: 'L1 Contract', color: '#10b981', active: false },
      { name: 'Verifiers', color: '#a78bfa', active: false },
    ],
    dataFlow: 'User -> Sequencer',
    highlight: '#6366f1',
  },
  {
    title: 'BATCH -- Формирование пакета',
    phase: 'Aggregation',
    description: 'Sequencer собирает сотни транзакций в batch. Данные сжимаются для эффективности. Один batch может содержать 100-1000 транзакций.',
    actors: [
      { name: 'User', color: '#6366f1', active: false },
      { name: 'Sequencer', color: '#f59e0b', active: true },
      { name: 'L1 Contract', color: '#10b981', active: false },
      { name: 'Verifiers', color: '#a78bfa', active: false },
    ],
    dataFlow: 'Sequencer: [TX1, TX2, ..., TX500] -> batch',
    highlight: '#f59e0b',
  },
  {
    title: 'SUBMIT TO L1 -- Публикация на Ethereum',
    phase: 'Data Availability',
    description: 'Sequencer публикует batch данных на Ethereum L1 как calldata (до EIP-4844) или blob (после EIP-4844). Включает новый state root. Это шаг "data availability" -- данные доступны всем.',
    actors: [
      { name: 'User', color: '#6366f1', active: false },
      { name: 'Sequencer', color: '#f59e0b', active: true },
      { name: 'L1 Contract', color: '#10b981', active: true },
      { name: 'Verifiers', color: '#a78bfa', active: false },
    ],
    dataFlow: 'Sequencer -> L1 Contract (batch + state root)',
    highlight: '#10b981',
  },
  {
    title: 'CHALLENGE WINDOW -- 7-дневный период',
    phase: '7 days',
    description: '7-дневное окно оспаривания. Любой может загрузить batch data, повторно исполнить транзакции и проверить state root. Если root неверный -- challenger подает fraud proof.',
    actors: [
      { name: 'User', color: '#6366f1', active: false },
      { name: 'Sequencer', color: '#f59e0b', active: false },
      { name: 'L1 Contract', color: '#10b981', active: true },
      { name: 'Verifiers', color: '#a78bfa', active: true },
    ],
    dataFlow: 'Verifiers re-execute batch -> compare state roots',
    highlight: '#a78bfa',
  },
  {
    title: 'NO CHALLENGE -- Оптимистичное принятие',
    phase: 'Finalization',
    description: 'Если за 7 дней никто не оспорил state transition -- он принимается как финальный. "Optimistic" = считаем валидным, пока не доказано обратное. В 99.99% случаев транзакции валидны.',
    actors: [
      { name: 'User', color: '#6366f1', active: false },
      { name: 'Sequencer', color: '#f59e0b', active: false },
      { name: 'L1 Contract', color: '#10b981', active: true },
      { name: 'Verifiers', color: '#a78bfa', active: false },
    ],
    dataFlow: 'No challenge -> state accepted',
    highlight: '#10b981',
  },
  {
    title: 'FINALITY -- Финальность на L1',
    phase: 'Hard finality (7 days)',
    description: 'State финализирован на L1. Withdrawals могут быть обработаны. Итого: soft finality за секунды (sequencer), hard finality за 7 дней (L1 верификация).',
    actors: [
      { name: 'User', color: '#6366f1', active: true },
      { name: 'Sequencer', color: '#f59e0b', active: false },
      { name: 'L1 Contract', color: '#10b981', active: true },
      { name: 'Verifiers', color: '#a78bfa', active: false },
    ],
    dataFlow: 'L1 Contract -> finalized state -> withdrawals enabled',
    highlight: '#2563eb',
  },
];

/**
 * RollupArchitectureDiagram
 *
 * 6-step step-through showing optimistic rollup architecture.
 * History array pattern with Step/Back/Reset navigation.
 */
export function RollupArchitectureDiagram() {
  const [stepIdx, setStepIdx] = useState(0);

  const step = ROLLUP_STEPS[stepIdx];

  const goNext = () => setStepIdx((i) => Math.min(i + 1, ROLLUP_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  return (
    <DiagramContainer title="Архитектура Optimistic Rollup" color="blue">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {ROLLUP_STEPS.map((s, i) => (
          <div
            key={i}
            onClick={() => setStepIdx(i)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: i === stepIdx ? 700 : 400,
              cursor: 'pointer',
              background: i === stepIdx ? `${s.highlight}20` : 'rgba(255,255,255,0.03)',
              color: i === stepIdx ? s.highlight : i < stepIdx ? colors.textMuted : 'rgba(255,255,255,0.2)',
              border: `1px solid ${i === stepIdx ? s.highlight + '50' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 14,
        border: `1px solid ${step.highlight}30`,
      }}>
        {/* Title and phase */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: step.highlight, fontFamily: 'monospace' }}>
            Step {stepIdx + 1}: {step.title}
          </div>
          <span style={{
            fontSize: 9,
            fontFamily: 'monospace',
            padding: '2px 8px',
            borderRadius: 4,
            background: `${step.highlight}15`,
            color: step.highlight,
            border: `1px solid ${step.highlight}30`,
          }}>
            {step.phase}
          </span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 14 }}>
          {step.description}
        </div>

        {/* Actors */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {step.actors.map((actor) => (
            <div
              key={actor.name}
              style={{
                ...glassStyle,
                padding: '6px 12px',
                fontSize: 10,
                fontFamily: 'monospace',
                color: actor.active ? actor.color : 'rgba(255,255,255,0.2)',
                border: `1px solid ${actor.active ? actor.color + '40' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 6,
                opacity: actor.active ? 1 : 0.5,
                transition: 'all 0.3s',
              }}
            >
              {actor.name}
            </div>
          ))}
        </div>

        {/* Data flow */}
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted }}>
          <span style={{ color: step.highlight }}>Data flow:</span> {step.dataFlow}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
        <button onClick={reset} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Reset
        </button>
        <button onClick={goBack} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Back
        </button>
        <button onClick={goNext} disabled={stepIdx === ROLLUP_STEPS.length - 1} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === ROLLUP_STEPS.length - 1 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === ROLLUP_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, border: `1px solid ${stepIdx === ROLLUP_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, borderRadius: 6, opacity: stepIdx === ROLLUP_STEPS.length - 1 ? 0.5 : 1 }}>
          Step
        </button>
      </div>

      <DataBox
        label="Ключевой принцип"
        value="Оптимизм: считаем транзакции валидными, пока не доказано обратное. 99.99% транзакций валидны. Fraud proofs обрабатывают 0.01%."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  FraudProofComparisonDiagram                                          */
/* ================================================================== */

interface FraudProofType {
  name: string;
  project: string;
  color: string;
  steps: string[];
  pros: string[];
  cons: string[];
  gasNote: string;
  stageNote: string;
}

const FRAUD_PROOF_TYPES: FraudProofType[] = [
  {
    name: 'Single-Round',
    project: 'Optimism (Cannon FPVM)',
    color: '#ef4444',
    steps: [
      'Challenger обнаруживает неверный state root',
      'Challenger отправляет fraud proof на L1',
      'L1 контракт запускает Cannon FPVM',
      'FPVM повторно исполняет спорную транзакцию',
      'Если state root не совпадает -- fraud доказан',
    ],
    pros: ['Простая логика -- одно взаимодействие', 'Быстрое разрешение спора (~1 TX)'],
    cons: ['Высокий gas cost на L1 (re-execution)', 'Ограничен размером одной транзакции'],
    gasNote: 'O(N) gas -- полное повторное исполнение',
    stageNote: 'Stage 1 с 2024 (permissionless Cannon)',
  },
  {
    name: 'Multi-Round Interactive',
    project: 'Arbitrum (Bisection)',
    color: '#2563eb',
    steps: [
      'Challenger обнаруживает неверный state root',
      'Bisection round 1: делим execution trace пополам',
      'Каждый round: определяем в какой половине ошибка',
      '~log2(N) rounds для N инструкций (~40-50 rounds)',
      'Финальный round: верификация ОДНОЙ инструкции на L1',
    ],
    pros: ['Низкий gas cost (проверка 1 инструкции)', 'Масштабируется для миллионов инструкций'],
    cons: ['Сложная логика -- множество взаимодействий', 'Дольше разрешение спора (дни)'],
    gasNote: 'O(log N) gas -- только 1 инструкция on-chain',
    stageNote: 'Stage 1 с 2024 (permissionless bisection)',
  },
];

/**
 * FraudProofComparisonDiagram
 *
 * Two-column comparison of single-round vs multi-round fraud proofs.
 * Hover on sections reveals detailed tradeoffs.
 */
export function FraudProofComparisonDiagram() {
  const [hoveredType, setHoveredType] = useState<number | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  return (
    <DiagramContainer title="Fraud Proofs: однораундовые vs интерактивные" color="orange">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
        {FRAUD_PROOF_TYPES.map((type, idx) => {
          const isHovered = hoveredType === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredType(idx)}
              onMouseLeave={() => { setHoveredType(null); setHoveredSection(null); }}
              style={{
                ...glassStyle,
                padding: 14,
                border: `1px solid ${isHovered ? type.color + '50' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                transition: 'all 0.2s',
              }}
            >
              {/* Header */}
              <div style={{ fontSize: 13, fontWeight: 700, color: type.color, fontFamily: 'monospace', marginBottom: 4 }}>
                {type.name}
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 12 }}>
                {type.project}
              </div>

              {/* Steps */}
              <div
                onMouseEnter={() => setHoveredSection(`steps-${idx}`)}
                onMouseLeave={() => setHoveredSection(null)}
                style={{ marginBottom: 12 }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, color: type.color, fontFamily: 'monospace', marginBottom: 6 }}>
                  Процесс:
                </div>
                {type.steps.map((step, i) => (
                  <div key={i} style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.6, paddingLeft: 8, borderLeft: `2px solid ${type.color}30` }}>
                    {i + 1}. {step}
                  </div>
                ))}
              </div>

              {/* Pros/Cons */}
              <div
                onMouseEnter={() => setHoveredSection(`tradeoffs-${idx}`)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#10b981', fontFamily: 'monospace', marginBottom: 4 }}>
                    Pros:
                  </div>
                  {type.pros.map((pro, i) => (
                    <div key={i} style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.5, paddingLeft: 8 }}>
                      + {pro}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#f43f5e', fontFamily: 'monospace', marginBottom: 4 }}>
                    Cons:
                  </div>
                  {type.cons.map((con, i) => (
                    <div key={i} style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.5, paddingLeft: 8 }}>
                      - {con}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gas note */}
              {hoveredSection === `tradeoffs-${idx}` && (
                <div style={{
                  ...glassStyle,
                  padding: 8,
                  marginTop: 6,
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: type.color,
                  border: `1px solid ${type.color}30`,
                  borderRadius: 6,
                }}>
                  <div>Gas: {type.gasNote}</div>
                  <div style={{ marginTop: 4, color: colors.textMuted }}>{type.stageNote}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DataBox
        label="Безопасность"
        value="Оба подхода безопасны при наличии хотя бы одного честного верификатора. Single-round проще, multi-round дешевле. Выбор -- трейдофф между сложностью и стоимостью."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  L1L2MessageDiagram                                                   */
/* ================================================================== */

interface MessageStep {
  title: string;
  direction: 'deposit' | 'withdrawal';
  phase: string;
  description: string;
  l1Status: string;
  l2Status: string;
  duration: string;
  highlight: string;
}

const MESSAGE_STEPS: MessageStep[] = [
  {
    title: 'DEPOSIT -- L1 -> L2: отправка',
    direction: 'deposit',
    phase: 'L1 Transaction',
    description: 'User отправляет ETH/токены в Bridge contract на L1. Bridge блокирует активы. Создается deposit message для L2.',
    l1Status: 'Bridge locks assets',
    l2Status: 'Waiting...',
    duration: '~1 TX on L1',
    highlight: '#6366f1',
  },
  {
    title: 'L2 MINT -- Создание активов на L2',
    direction: 'deposit',
    phase: 'L2 Processing',
    description: 'После подтверждения на L1, L2 bridge минтит эквивалентные активы на L2. Заняло 1-5 минут. User может использовать активы на L2.',
    l1Status: 'Assets locked',
    l2Status: 'Minted equivalent',
    duration: '~1-5 min',
    highlight: '#10b981',
  },
  {
    title: 'USE ON L2 -- Транзакции на L2',
    direction: 'deposit',
    phase: 'L2 Operation',
    description: 'User совершает транзакции на L2 с низкими комиссиями (в 10-100x дешевле L1). Те же smart contracts, тот же tooling. DeFi, NFT, games -- все работает.',
    l1Status: 'Assets still locked',
    l2Status: 'Active transactions',
    duration: 'seconds per TX',
    highlight: '#a78bfa',
  },
  {
    title: 'WITHDRAWAL INITIATE -- L2 -> L1: начало',
    direction: 'withdrawal',
    phase: 'L2 Transaction',
    description: 'User инициирует withdrawal на L2. Создается withdrawal message. Начинается 7-дневный challenge period. Это КЛЮЧЕВАЯ причина, почему withdrawals медленные.',
    l1Status: 'Waiting for challenge period',
    l2Status: 'Withdrawal initiated',
    duration: '~1 TX on L2',
    highlight: '#f59e0b',
  },
  {
    title: 'CHALLENGE PERIOD -- 7-дневное ожидание',
    direction: 'withdrawal',
    phase: '7-day wait',
    description: '7-дневный challenge period. Если fraud proof в это время отменит state transition -- withdrawal будет reversed. ЭТО причина, почему optimistic rollup withdrawals медленные. Не баг -- security feature.',
    l1Status: 'Challenge window open',
    l2Status: 'Withdrawal pending',
    duration: '7 days',
    highlight: '#f43f5e',
  },
  {
    title: 'WITHDRAWAL FINALIZE -- Получение на L1',
    direction: 'withdrawal',
    phase: 'L1 Transaction',
    description: 'После 7 дней user финализирует withdrawal на L1. Bridge отпускает активы. Liquidity providers (Across, Hop, Stargate) предлагают мгновенные withdrawals за комиссию (они берут на себя 7-дневный риск).',
    l1Status: 'Bridge releases assets',
    l2Status: 'Withdrawal complete',
    duration: '~1 TX on L1',
    highlight: '#2563eb',
  },
];

/**
 * L1L2MessageDiagram
 *
 * 6-step step-through showing L1<->L2 deposit and withdrawal flows.
 * History array pattern with Step/Back/Reset navigation.
 */
export function L1L2MessageDiagram() {
  const [stepIdx, setStepIdx] = useState(0);

  const step = MESSAGE_STEPS[stepIdx];

  const goNext = () => setStepIdx((i) => Math.min(i + 1, MESSAGE_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  const isDeposit = step.direction === 'deposit';

  return (
    <DiagramContainer title="L1 <-> L2: депозиты и выводы" color="green">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {MESSAGE_STEPS.map((s, i) => (
          <div
            key={i}
            onClick={() => setStepIdx(i)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontFamily: 'monospace',
              fontWeight: i === stepIdx ? 700 : 400,
              cursor: 'pointer',
              background: i === stepIdx ? `${s.highlight}20` : 'rgba(255,255,255,0.03)',
              color: i === stepIdx ? s.highlight : i < stepIdx ? colors.textMuted : 'rgba(255,255,255,0.2)',
              border: `1px solid ${i === stepIdx ? s.highlight + '50' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Direction badge */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <span style={{
          fontSize: 10,
          fontFamily: 'monospace',
          padding: '3px 10px',
          borderRadius: 4,
          background: isDeposit ? '#6366f115' : '#f59e0b15',
          color: isDeposit ? '#6366f1' : '#f59e0b',
          border: `1px solid ${isDeposit ? '#6366f130' : '#f59e0b30'}`,
          fontWeight: 600,
        }}>
          {isDeposit ? 'DEPOSIT (L1 -> L2)' : 'WITHDRAWAL (L2 -> L1)'}
        </span>
        <span style={{
          fontSize: 10,
          fontFamily: 'monospace',
          padding: '3px 10px',
          borderRadius: 4,
          background: 'rgba(255,255,255,0.03)',
          color: step.highlight,
          border: `1px solid ${step.highlight}30`,
        }}>
          {step.duration}
        </span>
      </div>

      {/* Step content */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 14,
        border: `1px solid ${step.highlight}30`,
      }}>
        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 600, color: step.highlight, fontFamily: 'monospace', marginBottom: 4 }}>
          Step {stepIdx + 1}: {step.title}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 12 }}>
          {step.phase}
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 14 }}>
          {step.description}
        </div>

        {/* Two-lane status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            ...glassStyle,
            padding: 10,
            borderRadius: 6,
            border: '1px solid #6366f130',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', fontFamily: 'monospace', marginBottom: 4 }}>
              L1 (Ethereum)
            </div>
            <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace' }}>
              {step.l1Status}
            </div>
          </div>
          <div style={{
            ...glassStyle,
            padding: 10,
            borderRadius: 6,
            border: '1px solid #10b98130',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#10b981', fontFamily: 'monospace', marginBottom: 4 }}>
              L2 (Rollup)
            </div>
            <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace' }}>
              {step.l2Status}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
        <button onClick={reset} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Reset
        </button>
        <button onClick={goBack} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Back
        </button>
        <button onClick={goNext} disabled={stepIdx === MESSAGE_STEPS.length - 1} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === MESSAGE_STEPS.length - 1 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === MESSAGE_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, border: `1px solid ${stepIdx === MESSAGE_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, borderRadius: 6, opacity: stepIdx === MESSAGE_STEPS.length - 1 ? 0.5 : 1 }}>
          Step
        </button>
      </div>

      <DataBox
        label="Асимметрия"
        value="Депозит: минуты. Вывод: 7 дней. Liquidity providers (Across, Hop, Stargate) предлагают мгновенные выводы за комиссию -- они берут на себя 7-дневный риск."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
