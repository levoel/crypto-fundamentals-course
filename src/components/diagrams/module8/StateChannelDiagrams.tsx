/** @jsxImportSource solid-js */
/**
 * State Channel Diagrams (SCALE-03)
 *
 * Exports:
 * - ChannelLifecycleDiagram: 6-step step-through showing state channel lifecycle (history array)
 * - PaymentChannelDiagram: Interactive slider for payment channel balance redistribution
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ChannelLifecycleDiagram                                             */
/* ================================================================== */

interface ChannelStep {
  title: string;
  phase: string;
  description: string;
  aliceBalance: number;
  bobBalance: number;
  stateVersion: number | null;
  onChain: boolean;
  highlight: string;
  tooltipRu: string;
}

const CHANNEL_STEPS: ChannelStep[] = [
  {
    title: 'OPEN -- Deploy Multisig',
    phase: 'On-chain TX #1',
    description: 'Alice и Bob разворачивают multisig-контракт. Каждый вносит 5 ETH. Средства заблокированы в контракте.',
    aliceBalance: 5,
    bobBalance: 5,
    stateVersion: 0,
    onChain: true,
    highlight: '#10b981',
    tooltipRu: 'Открытие канала -- единственная ончейн-транзакция. Multisig-контракт блокирует депозиты обоих участников. Это создает "виртуальный банк" между Alice и Bob.',
  },
  {
    title: 'TRANSACT OFF-CHAIN -- Alice pays Bob 1 ETH',
    phase: 'Off-chain (instant, free)',
    description: 'Alice отправляет Bob 1 ETH. Новое состояние: Alice=4, Bob=6. Обе стороны подписывают. Нет транзакции на блокчейне! Мгновенно, бесплатно, приватно.',
    aliceBalance: 4,
    bobBalance: 6,
    stateVersion: 1,
    onChain: false,
    highlight: '#6366f1',
    tooltipRu: 'Каждая оффчейн-транзакция -- подписанное сообщение с новым состоянием. Обе стороны хранят полную историю подписанных состояний. Это позволяет доказать финальный баланс при закрытии.',
  },
  {
    title: 'TRANSACT OFF-CHAIN -- Bob pays Alice 2 ETH',
    phase: 'Off-chain (instant, free)',
    description: 'Bob отправляет Alice 2 ETH. Новое состояние: Alice=6, Bob=4. Обе стороны подписывают state v2.',
    aliceBalance: 6,
    bobBalance: 4,
    stateVersion: 2,
    onChain: false,
    highlight: '#6366f1',
    tooltipRu: 'Версия состояния (nonce) гарантирует порядок. Более новое состояние всегда побеждает старое. Это основа механизма dispute resolution.',
  },
  {
    title: 'COOPERATIVE CLOSE',
    phase: 'On-chain TX #2',
    description: 'Обе стороны согласны на финальное состояние. Публикуют state v2. Контракт выдает: Alice=6 ETH, Bob=4 ETH. Одна ончейн-транзакция.',
    aliceBalance: 6,
    bobBalance: 4,
    stateVersion: 2,
    onChain: true,
    highlight: '#10b981',
    tooltipRu: 'Кооперативное закрытие -- идеальный сценарий. Всего 2 ончейн-транзакции (open + close) вместо N транзакций. Экономия газа = (N-2) * gasPrice.',
  },
  {
    title: 'DISPUTE CLOSE (альтернатива)',
    phase: 'Challenge period',
    description: 'Alice пытается опубликовать старый state v1 (Alice=4). Bob видит это и публикует более новый state v2 (Alice=6). Challenge period проходит. Контракт принимает v2. Bob предотвратил мошенничество Alice.',
    aliceBalance: 6,
    bobBalance: 4,
    stateVersion: 2,
    onChain: true,
    highlight: '#f43f5e',
    tooltipRu: 'Dispute mechanism -- защита от мошенничества. Challenge period (обычно 24-48 часов) дает время для оспаривания. Контракт принимает состояние с наивысшей версией.',
  },
  {
    title: 'LIMITATIONS',
    phase: 'Ограничения state channels',
    description: 'Фиксированные участники (только Alice и Bob). Liveness requirement -- нужно следить за блокчейном. Ликвидность заблокирована. Нет поддержки general smart contracts (ограниченное состояние).',
    aliceBalance: 6,
    bobBalance: 4,
    stateVersion: null,
    onChain: false,
    highlight: '#f59e0b',
    tooltipRu: 'Ограничения state channels привели к разработке Plasma и Rollups. Фиксированные участники делают каналы непригодными для DeFi-протоколов с произвольным числом пользователей.',
  },
];

/**
 * ChannelLifecycleDiagram
 *
 * 6-step step-through showing state channel lifecycle.
 * History array pattern with Step/Back/Reset navigation.
 */
export function ChannelLifecycleDiagram() {
  const [stepIdx, setStepIdx] = createSignal(0);

  const step = CHANNEL_STEPS[stepIdx()];
  const totalBalance = 10;

  const goNext = () => setStepIdx((i) => Math.min(i + 1, CHANNEL_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  return (
    <DiagramContainer title="Жизненный цикл state channel" color="blue">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '14px', 'flex-wrap': 'wrap' }}>
        {CHANNEL_STEPS.map((s, i) => (
          <DiagramTooltip content={s.tooltipRu}>
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
          <DiagramTooltip content={step.tooltipRu}>
            <span style={{ 'font-size': '13px', 'font-weight': '600', 'color': step.highlight, 'font-family': 'monospace' }}>
              Step {stepIdx() + 1}: {step.title}
            </span>
          </DiagramTooltip>
          <DiagramTooltip content={step.onChain ? 'On-chain транзакция записывается в блокчейн. Требует газ и время на подтверждение. Дорого, но финально.' : 'Off-chain операция не записывается в блокчейн. Мгновенно, бесплатно, приватно. Но требует подписей обеих сторон.'}>
            <span style={{
              'font-size': '9px',
              'font-family': 'monospace',
              'padding': '2px 8px',
              'border-radius': '4px',
              'background': step.onChain ? '#10b98115' : '#6366f115',
              'color': step.onChain ? '#10b981' : '#6366f1',
              'border': `1px solid ${step.onChain ? '#10b98130' : '#6366f130'}`,
            }}>
              {step.phase}
            </span>
          </DiagramTooltip>
        </div>

        {/* Description */}
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '14px' }}>
          {step.description}
        </div>

        {/* Balance bars */}
        <div style={{ 'display': 'flex', 'gap': '12px', 'margin-bottom': '8px' }}>
          {/* Alice */}
          <div style={{ 'flex': '1' }}>
            <DiagramTooltip content={`Alice владеет ${step.aliceBalance} из ${totalBalance} ETH в канале. При закрытии канала контракт выдаст Alice ровно ${step.aliceBalance} ETH.`}>
              <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': '#6366f1', 'margin-bottom': '4px', 'display': 'inline-block' }}>
                Alice: {step.aliceBalance} ETH
              </span>
            </DiagramTooltip>
            <div style={{
              'height': '20px',
              'background': 'rgba(255,255,255,0.05)',
              'border-radius': '4px',
              'overflow': 'hidden',
            }}>
              <div style={{
                'width': `${(step.aliceBalance / totalBalance) * 100}%`,
                'height': '100%',
                'background': '#6366f1',
                'opacity': '0.7',
                'border-radius': '4px',
                'transition': 'width 0.3s',
              }} />
            </div>
          </div>
          {/* Bob */}
          <div style={{ 'flex': '1' }}>
            <DiagramTooltip content={`Bob владеет ${step.bobBalance} из ${totalBalance} ETH в канале. Сумма балансов всегда равна начальному депозиту (${totalBalance} ETH) -- невозможно создать или уничтожить средства.`}>
              <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': '#10b981', 'margin-bottom': '4px', 'display': 'inline-block' }}>
                Bob: {step.bobBalance} ETH
              </span>
            </DiagramTooltip>
            <div style={{
              'height': '20px',
              'background': 'rgba(255,255,255,0.05)',
              'border-radius': '4px',
              'overflow': 'hidden',
            }}>
              <div style={{
                'width': `${(step.bobBalance / totalBalance) * 100}%`,
                'height': '100%',
                'background': '#10b981',
                'opacity': '0.7',
                'border-radius': '4px',
                'transition': 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* State version + on-chain indicator */}
        <div style={{ 'display': 'flex', 'gap': '16px', 'font-size': '10px', 'font-family': 'monospace', 'color': colors.textMuted }}>
          {step.stateVersion !== null && (
            <DiagramTooltip content={`State version ${step.stateVersion} -- порядковый номер состояния. При dispute контракт принимает состояние с наивысшей версией. Это гарантирует, что мошенник не сможет откатить канал к старому состоянию.`}>
              <span>State version: <span style={{ 'color': step.highlight }}>{step.stateVersion}</span></span>
            </DiagramTooltip>
          )}
          <DiagramTooltip content={step.onChain ? 'Ончейн-транзакция записывается в блок Ethereum. Требует газ, но обеспечивает финальность. Используется только для открытия и закрытия канала.' : 'Оффчейн-операция происходит вне блокчейна. Только подписанные сообщения между участниками. Мгновенно и бесплатно.'}>
            <span>
              {step.onChain ? (
                <span style={{ 'color': '#10b981' }}>ON-CHAIN TX</span>
              ) : (
                <span style={{ 'color': '#6366f1' }}>OFF-CHAIN</span>
              )}
            </span>
          </DiagramTooltip>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center' }}>
        <div>
          <button onClick={reset} disabled={stepIdx() === 0} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === 0 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '6px', 'opacity': stepIdx() === 0 ? 0.5 : 1 }}>
            Reset
          </button>
        </div>
        <div>
          <button onClick={goBack} disabled={stepIdx() === 0} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === 0 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '6px', 'opacity': stepIdx() === 0 ? 0.5 : 1 }}>
            Back
          </button>
        </div>
        <div>
          <button onClick={goNext} disabled={stepIdx() === CHANNEL_STEPS.length - 1} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === CHANNEL_STEPS.length - 1 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === CHANNEL_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, 'border': `1px solid ${stepIdx() === CHANNEL_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, 'border-radius': '6px', 'opacity': stepIdx() === CHANNEL_STEPS.length - 1 ? 0.5 : 1 }}>
            Step
          </button>
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  PaymentChannelDiagram                                               */
/* ================================================================== */

/**
 * PaymentChannelDiagram
 *
 * Interactive slider showing Alice/Bob balance redistribution.
 * Total always = 10 ETH. Each move increments state counter.
 */
export function PaymentChannelDiagram() {
  const [aliceBalance, setAliceBalance] = createSignal(5);
  const [stateCount, setStateCount] = createSignal(0);

  const totalBalance = 10;
  const bobBalance = totalBalance - aliceBalance();

  const handleSliderChange = (val: number) => {
    if (val !== aliceBalance()) {
      setAliceBalance(val);
      setStateCount((c) => c + 1);
    }
  };

  const resetChannel = () => {
    setAliceBalance(5);
    setStateCount(0);
  };

  return (
    <DiagramContainer title="Payment Channel: баланс между участниками" color="green">
      {/* State counter */}
      <div style={{ 'text-align': 'center', 'margin-bottom': '14px' }}>
        <DiagramTooltip content={`Каждое перемещение слайдера = новое подписанное состояние канала (state #${stateCount()}). В реальном канале каждое состояние подписывается обеими сторонами и хранит nonce для упорядочивания.`}>
          <span style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': colors.textMuted }}>
            State #{stateCount()}:
          </span>
        </DiagramTooltip>
        {' '}
        <DiagramTooltip content={`Alice владеет ${aliceBalance()} ETH. При кооперативном закрытии канала контракт отправит Alice ровно ${aliceBalance()} ETH.`}>
          <span style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': '#6366f1', 'font-weight': '600' }}>
            Alice = {aliceBalance()} ETH
          </span>
        </DiagramTooltip>
        <span style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': colors.textMuted }}>, </span>
        <DiagramTooltip content={`Bob владеет ${bobBalance} ETH. Сумма Alice + Bob всегда = ${totalBalance} ETH (начальный депозит). Средства не создаются и не уничтожаются.`}>
          <span style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': '#10b981', 'font-weight': '600' }}>
            Bob = {bobBalance} ETH
          </span>
        </DiagramTooltip>
      </div>

      {/* Balance bars */}
      <div style={{
        'display': 'flex',
        'height': '36px',
        'border-radius': '6px',
        'overflow': 'hidden',
        'margin-bottom': '12px',
        'border': '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          'width': `${(aliceBalance() / totalBalance) * 100}%`,
          'background': '#6366f1',
          'opacity': '0.7',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'transition': 'width 0.2s',
          'min-width': aliceBalance() > 0 ? 30 : 0,
        }}>
          {aliceBalance() > 0 && (
            <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': 'white', 'font-weight': '600' }}>
              Alice {aliceBalance()}
            </span>
          )}
        </div>
        <div style={{
          'width': `${(bobBalance / totalBalance) * 100}%`,
          'background': '#10b981',
          'opacity': '0.7',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'transition': 'width 0.2s',
          'min-width': bobBalance > 0 ? 30 : 0,
        }}>
          {bobBalance > 0 && (
            <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': 'white', 'font-weight': '600' }}>
              Bob {bobBalance}
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div style={{ 'margin-bottom': '14px', 'padding': '0 4px' }}>
        <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'margin-bottom': '4px' }}>
          <DiagramTooltip content="Перемещение слайдера влево увеличивает долю Alice. В реальном канале Alice создает подписанное сообщение с новым распределением и отправляет Bob.">
            <span style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': '#6366f1' }}>Alice gets more</span>
          </DiagramTooltip>
          <DiagramTooltip content="Перемещение слайдера вправо увеличивает долю Bob. Bob подписывает новое состояние, подтверждая согласие с распределением.">
            <span style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': '#10b981' }}>Bob gets more</span>
          </DiagramTooltip>
        </div>
        <input
          type="range"
          min={0}
          max={totalBalance}
          value={aliceBalance()}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          style={{ 'width': '100%', 'accent-color': '#6366f1' }}
        />
      </div>

      {/* Reset */}
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '14px' }}>
        <div>
          <button onClick={resetChannel} style={{ ...glassStyle, 'padding': '5px 12px', 'cursor': 'pointer', 'font-size': '10px', 'font-family': 'monospace', 'color': colors.textMuted, 'border': '1px solid rgba(255,255,255,0.1)', 'border-radius': '6px' }}>
            Reset channel
          </button>
        </div>
      </div>

      <DataBox
        label="Ключевой принцип"
        value="Каждое изменение баланса -- подписанное сообщение, не транзакция. Мгновенно и бесплатно. Это тот же принцип, что и Lightning Network (BTC-09), обобщенный для произвольного состояния."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
