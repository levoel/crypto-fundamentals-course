/** @jsxImportSource solid-js */
/**
 * Optimistic Rollup Diagrams (SCALE-05)
 *
 * Exports:
 * - RollupArchitectureDiagram: 6-step step-through showing optimistic rollup flow (history array)
 * - FraudProofComparisonDiagram: Two-column comparison of single-round vs multi-round fraud proofs
 * - L1L2MessageDiagram: 6-step step-through showing L1<->L2 deposit and withdrawal flows (history array)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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

const ROLLUP_STEP_TOOLTIPS = [
  'Sequencer принимает транзакции от пользователей и обеспечивает мгновенный ответ (soft confirmation). Централизация sequencer -- компромисс: скорость за счет доверия, но sequencer не может подделать state (fraud proofs защищают).',
  'Batching -- ключ к экономии. Вместо публикации каждой транзакции на L1, сотни группируются в один batch. Amortизация L1 gas cost: $0.01 per TX вместо $5.',
  'Data Availability на L1 -- критическое отличие rollup от sidechain. Любой может загрузить данные и верифицировать state. Blobs (EIP-4844) снизили стоимость DA в 10-100x.',
  'Challenge window -- 7 дней. Достаточно времени для любого верификатора обнаружить и оспорить мошенничество. Один честный верификатор защищает всю систему (1-of-N trust assumption).',
  'Оптимистичное принятие: в 99.99% случаев транзакции валидны, поэтому проверка каждой не нужна. Fraud proofs работают как страховка -- используются только при мошенничестве.',
  'Hard finality через 7 дней. Soft finality от sequencer за секунды, но с trust assumption. Для вывода средств на L1 необходимо ждать полную финализацию (или использовать liquidity providers).',
];

/**
 * RollupArchitectureDiagram
 *
 * 6-step step-through showing optimistic rollup architecture.
 * History array pattern with Step/Back/Reset navigation.
 */
export function RollupArchitectureDiagram() {
  const [stepIdx, setStepIdx] = createSignal(0);

  const step = ROLLUP_STEPS[stepIdx()];

  const goNext = () => setStepIdx((i) => Math.min(i + 1, ROLLUP_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  return (
    <DiagramContainer title="Архитектура Optimistic Rollup" color="blue">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '14px', 'flex-wrap': 'wrap' }}>
        {ROLLUP_STEPS.map((s, i) => (
          <DiagramTooltip content={ROLLUP_STEP_TOOLTIPS[i]}>
            <div
              onClick={() => setStepIdx(i)}
              style={{
                'width': '28px',
                'height': '28px',
                'border-radius': '6px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '11px',
                'font-family': 'monospace',
                'font-weight': i === stepIdx() ? 700 : 400,
                'cursor': 'pointer',
                'background': i === stepIdx() ? `${s.highlight}20` : 'rgba(255,255,255,0.03)',
                'color': i === stepIdx() ? s.highlight : i < stepIdx() ? colors.textMuted : 'rgba(255,255,255,0.2)',
                'border': `1px solid ${i === stepIdx() ? s.highlight + '50' : 'rgba(255,255,255,0.06)'}`,
                'transition': 'all 0.2s',
              }}
            >
              {i + 1}
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Step content */}
      <div style={{
        ...glassStyle,
        'padding': '16px',
        'margin-bottom': '14px',
        'border': `1px solid ${step.highlight}30`,
      }}>
        {/* Title and phase */}
        <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px', 'flex-wrap': 'wrap', 'gap': '8px' }}>
          <div style={{ 'font-size': '13px', 'font-weight': '600', 'color': step.highlight, 'font-family': 'monospace' }}>
            Step {stepIdx() + 1}: {step.title}
          </div>
          <span style={{
            'font-size': '9px',
            'font-family': 'monospace',
            'padding': '2px 8px',
            'border-radius': '4px',
            'background': `${step.highlight}15`,
            'color': step.highlight,
            'border': `1px solid ${step.highlight}30`,
          }}>
            {step.phase}
          </span>
        </div>

        {/* Description */}
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '14px' }}>
          {step.description}
        </div>

        {/* Actors */}
        <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '10px', 'flex-wrap': 'wrap' }}>
          {step.actors.map((actor) => (
            <div
              style={{
                ...glassStyle,
                'padding': '6px 12px',
                'font-size': '10px',
                'font-family': 'monospace',
                'color': actor.active ? actor.color : 'rgba(255,255,255,0.2)',
                'border': `1px solid ${actor.active ? actor.color + '40' : 'rgba(255,255,255,0.06)'}`,
                'border-radius': '6px',
                'opacity': actor.active ? 1 : 0.5,
                'transition': 'all 0.3s',
              }}
            >
              {actor.name}
            </div>
          ))}
        </div>

        {/* Data flow */}
        <div style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': colors.textMuted }}>
          <span style={{ 'color': step.highlight }}>Data flow:</span> {step.dataFlow}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center', 'margin-bottom': '14px' }}>
        <button onClick={reset} disabled={stepIdx() === 0} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === 0 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '6px', 'opacity': stepIdx() === 0 ? 0.5 : 1 }}>
          Reset
        </button>
        <button onClick={goBack} disabled={stepIdx() === 0} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === 0 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '6px', 'opacity': stepIdx() === 0 ? 0.5 : 1 }}>
          Back
        </button>
        <button onClick={goNext} disabled={stepIdx() === ROLLUP_STEPS.length - 1} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === ROLLUP_STEPS.length - 1 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === ROLLUP_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, 'border': `1px solid ${stepIdx() === ROLLUP_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, 'border-radius': '6px', 'opacity': stepIdx() === ROLLUP_STEPS.length - 1 ? 0.5 : 1 }}>
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
  tooltipRu: string;
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
    tooltipRu: 'Optimism Single-Round: вся спорная транзакция повторно исполняется на L1 через Cannon FPVM. Проще, но дороже по gas. O(N) gas за полное re-execution. Stage 1 с 2024 года.',
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
    tooltipRu: 'Arbitrum Multi-Round: bisection protocol сужает спор до одной инструкции за ~log2(N) раундов. O(log N) gas -- значительно дешевле. Но процесс длится дни из-за множества раундов.',
  },
];

/**
 * FraudProofComparisonDiagram
 *
 * Two-column comparison of single-round vs multi-round fraud proofs.
 * DiagramTooltip on type cards. Gas/stage info always visible.
 */
export function FraudProofComparisonDiagram() {
  return (
    <DiagramContainer title="Fraud Proofs: однораундовые vs интерактивные" color="orange">
      <div style={{ 'display': 'grid', 'grid-template-columns': 'repeat(2, 1fr)', 'gap': '12px', 'margin-bottom': '14px' }}>
        {FRAUD_PROOF_TYPES.map((type, idx) => (
          <DiagramTooltip content={type.tooltipRu}>
            <div
              style={{
                ...glassStyle,
                'padding': '14px',
                'border': `1px solid rgba(255,255,255,0.08)`,
                'border-radius': '8px',
                'transition': 'all 0.2s',
              }}
            >
              {/* Header */}
              <div style={{ 'font-size': '13px', 'font-weight': '700', 'color': type.color, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                {type.name}
              </div>
              <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '12px' }}>
                {type.project}
              </div>

              {/* Steps */}
              <div style={{ 'margin-bottom': '12px' }}>
                <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': type.color, 'font-family': 'monospace', 'margin-bottom': '6px' }}>
                  Процесс:
                </div>
                {type.steps.map((step, i) => (
                  <div style={{ 'font-size': '10px', 'color': colors.text, 'font-family': 'monospace', 'line-height': '1.6', 'padding-left': '8px', 'border-left': `2px solid ${type.color}30` }}>
                    {i + 1}. {step}
                  </div>
                ))}
              </div>

              {/* Pros/Cons */}
              <div>
                <div style={{ 'margin-bottom': '8px' }}>
                  <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#10b981', 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                    Pros:
                  </div>
                  {type.pros.map((pro, i) => (
                    <div style={{ 'font-size': '10px', 'color': colors.text, 'font-family': 'monospace', 'line-height': '1.5', 'padding-left': '8px' }}>
                      + {pro}
                    </div>
                  ))}
                </div>
                <div style={{ 'margin-bottom': '8px' }}>
                  <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#f43f5e', 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                    Cons:
                  </div>
                  {type.cons.map((con, i) => (
                    <div style={{ 'font-size': '10px', 'color': colors.text, 'font-family': 'monospace', 'line-height': '1.5', 'padding-left': '8px' }}>
                      - {con}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gas + stage note -- always visible */}
              <div style={{
                ...glassStyle,
                'padding': '8px',
                'margin-top': '6px',
                'font-size': '10px',
                'font-family': 'monospace',
                'color': type.color,
                'border': `1px solid ${type.color}30`,
                'border-radius': '6px',
              }}>
                <div>Gas: {type.gasNote}</div>
                <div style={{ 'margin-top': '4px', 'color': colors.textMuted }}>{type.stageNote}</div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
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

const MESSAGE_STEP_TOOLTIPS = [
  'Депозит L1->L2: пользователь блокирует активы в bridge contract. Bridge контракт верифицирован и аудирован. Процесс безопасен если контракт корректен.',
  'Минтинг на L2 происходит автоматически после подтверждения на L1. Задержка 1-5 минут зависит от скорости sequencer и L1 finality.',
  'На L2 комиссии в 10-100x ниже L1. Тот же EVM, те же инструменты (Hardhat, Foundry, ethers.js). Для разработчика -- почти прозрачная миграция.',
  'Инициация withdrawal -- точка невозврата. Challenge period начинается, и его нельзя ускорить. Это фундаментальное свойство optimistic rollups.',
  'Challenge period 7 дней -- не баг, а security feature. Любой честный верификатор может оспорить некорректный state transition. Без этого окна optimistic rollups небезопасны.',
  'Финализация withdrawal после 7 дней. Liquidity providers (Across, Hop, Stargate) предлагают мгновенные withdrawals за ~0.1-0.5% комиссии -- они берут 7-дневный риск на себя.',
];

/**
 * L1L2MessageDiagram
 *
 * 6-step step-through showing L1<->L2 deposit and withdrawal flows.
 * History array pattern with Step/Back/Reset navigation.
 */
export function L1L2MessageDiagram() {
  const [stepIdx, setStepIdx] = createSignal(0);

  const step = MESSAGE_STEPS[stepIdx()];

  const goNext = () => setStepIdx((i) => Math.min(i + 1, MESSAGE_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  const isDeposit = step.direction === 'deposit';

  return (
    <DiagramContainer title="L1 <-> L2: депозиты и выводы" color="green">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '14px', 'flex-wrap': 'wrap' }}>
        {MESSAGE_STEPS.map((s, i) => (
          <DiagramTooltip content={MESSAGE_STEP_TOOLTIPS[i]}>
            <div
              onClick={() => setStepIdx(i)}
              style={{
                'width': '28px',
                'height': '28px',
                'border-radius': '6px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '11px',
                'font-family': 'monospace',
                'font-weight': i === stepIdx() ? 700 : 400,
                'cursor': 'pointer',
                'background': i === stepIdx() ? `${s.highlight}20` : 'rgba(255,255,255,0.03)',
                'color': i === stepIdx() ? s.highlight : i < stepIdx() ? colors.textMuted : 'rgba(255,255,255,0.2)',
                'border': `1px solid ${i === stepIdx() ? s.highlight + '50' : 'rgba(255,255,255,0.06)'}`,
                'transition': 'all 0.2s',
              }}
            >
              {i + 1}
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Direction badge */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '12px' }}>
        <span style={{
          'font-size': '10px',
          'font-family': 'monospace',
          'padding': '3px 10px',
          'border-radius': '4px',
          'background': isDeposit ? '#6366f115' : '#f59e0b15',
          'color': isDeposit ? '#6366f1' : '#f59e0b',
          'border': `1px solid ${isDeposit ? '#6366f130' : '#f59e0b30'}`,
          'font-weight': '600',
        }}>
          {isDeposit ? 'DEPOSIT (L1 -> L2)' : 'WITHDRAWAL (L2 -> L1)'}
        </span>
        <span style={{
          'font-size': '10px',
          'font-family': 'monospace',
          'padding': '3px 10px',
          'border-radius': '4px',
          'background': 'rgba(255,255,255,0.03)',
          'color': step.highlight,
          'border': `1px solid ${step.highlight}30`,
        }}>
          {step.duration}
        </span>
      </div>

      {/* Step content */}
      <div style={{
        ...glassStyle,
        'padding': '16px',
        'margin-bottom': '14px',
        'border': `1px solid ${step.highlight}30`,
      }}>
        {/* Title */}
        <div style={{ 'font-size': '13px', 'font-weight': '600', 'color': step.highlight, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
          Step {stepIdx() + 1}: {step.title}
        </div>
        <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '12px' }}>
          {step.phase}
        </div>

        {/* Description */}
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '14px' }}>
          {step.description}
        </div>

        {/* Two-lane status */}
        <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '10px' }}>
          <DiagramTooltip content="Ethereum L1 -- settlement layer. Все активы в конечном итоге защищены консенсусом Ethereum.">
            <div style={{
              ...glassStyle,
              'padding': '10px',
              'border-radius': '6px',
              'border': '1px solid #6366f130',
            }}>
              <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#6366f1', 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                L1 (Ethereum)
              </div>
              <div style={{ 'font-size': '10px', 'color': colors.text, 'font-family': 'monospace' }}>
                {step.l1Status}
              </div>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="L2 Rollup -- execution layer. Транзакции выполняются здесь с низкими комиссиями, а безопасность наследуется от L1.">
            <div style={{
              ...glassStyle,
              'padding': '10px',
              'border-radius': '6px',
              'border': '1px solid #10b98130',
            }}>
              <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#10b981', 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                L2 (Rollup)
              </div>
              <div style={{ 'font-size': '10px', 'color': colors.text, 'font-family': 'monospace' }}>
                {step.l2Status}
              </div>
            </div>
          </DiagramTooltip>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center', 'margin-bottom': '14px' }}>
        <button onClick={reset} disabled={stepIdx() === 0} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === 0 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '6px', 'opacity': stepIdx() === 0 ? 0.5 : 1 }}>
          Reset
        </button>
        <button onClick={goBack} disabled={stepIdx() === 0} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === 0 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '6px', 'opacity': stepIdx() === 0 ? 0.5 : 1 }}>
          Back
        </button>
        <button onClick={goNext} disabled={stepIdx() === MESSAGE_STEPS.length - 1} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === MESSAGE_STEPS.length - 1 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === MESSAGE_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, 'border': `1px solid ${stepIdx() === MESSAGE_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, 'border-radius': '6px', 'opacity': stepIdx() === MESSAGE_STEPS.length - 1 ? 0.5 : 1 }}>
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
