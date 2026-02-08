/**
 * State Channel Diagrams (SCALE-03)
 *
 * Exports:
 * - ChannelLifecycleDiagram: 6-step step-through showing state channel lifecycle (history array)
 * - PaymentChannelDiagram: Interactive slider for payment channel balance redistribution
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
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
  },
];

/**
 * ChannelLifecycleDiagram
 *
 * 6-step step-through showing state channel lifecycle.
 * History array pattern with Step/Back/Reset navigation.
 */
export function ChannelLifecycleDiagram() {
  const [stepIdx, setStepIdx] = useState(0);

  const step = CHANNEL_STEPS[stepIdx];
  const totalBalance = 10;

  const goNext = () => setStepIdx((i) => Math.min(i + 1, CHANNEL_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  return (
    <DiagramContainer title="Жизненный цикл state channel" color="blue">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {CHANNEL_STEPS.map((s, i) => (
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
            background: step.onChain ? '#10b98115' : '#6366f115',
            color: step.onChain ? '#10b981' : '#6366f1',
            border: `1px solid ${step.onChain ? '#10b98130' : '#6366f130'}`,
          }}>
            {step.phase}
          </span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 14 }}>
          {step.description}
        </div>

        {/* Balance bars */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {/* Alice */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#6366f1', marginBottom: 4 }}>
              Alice: {step.aliceBalance} ETH
            </div>
            <div style={{
              height: 20,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(step.aliceBalance / totalBalance) * 100}%`,
                height: '100%',
                background: '#6366f1',
                opacity: 0.7,
                borderRadius: 4,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
          {/* Bob */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#10b981', marginBottom: 4 }}>
              Bob: {step.bobBalance} ETH
            </div>
            <div style={{
              height: 20,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(step.bobBalance / totalBalance) * 100}%`,
                height: '100%',
                background: '#10b981',
                opacity: 0.7,
                borderRadius: 4,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* State version + on-chain indicator */}
        <div style={{ display: 'flex', gap: 16, fontSize: 10, fontFamily: 'monospace', color: colors.textMuted }}>
          {step.stateVersion !== null && (
            <span>State version: <span style={{ color: step.highlight }}>{step.stateVersion}</span></span>
          )}
          <span>
            {step.onChain ? (
              <span style={{ color: '#10b981' }}>ON-CHAIN TX</span>
            ) : (
              <span style={{ color: '#6366f1' }}>OFF-CHAIN</span>
            )}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={reset} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Reset
        </button>
        <button onClick={goBack} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Back
        </button>
        <button onClick={goNext} disabled={stepIdx === CHANNEL_STEPS.length - 1} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === CHANNEL_STEPS.length - 1 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === CHANNEL_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, border: `1px solid ${stepIdx === CHANNEL_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, borderRadius: 6, opacity: stepIdx === CHANNEL_STEPS.length - 1 ? 0.5 : 1 }}>
          Step
        </button>
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
  const [aliceBalance, setAliceBalance] = useState(5);
  const [stateCount, setStateCount] = useState(0);

  const totalBalance = 10;
  const bobBalance = totalBalance - aliceBalance;

  const handleSliderChange = (val: number) => {
    if (val !== aliceBalance) {
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
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: colors.textMuted }}>
          State #{stateCount}: </span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#6366f1', fontWeight: 600 }}>
          Alice = {aliceBalance} ETH</span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: colors.textMuted }}>, </span>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#10b981', fontWeight: 600 }}>
          Bob = {bobBalance} ETH</span>
      </div>

      {/* Balance bars */}
      <div style={{
        display: 'flex',
        height: 36,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: `${(aliceBalance / totalBalance) * 100}%`,
          background: '#6366f1',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.2s',
          minWidth: aliceBalance > 0 ? 30 : 0,
        }}>
          {aliceBalance > 0 && (
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'white', fontWeight: 600 }}>
              Alice {aliceBalance}
            </span>
          )}
        </div>
        <div style={{
          width: `${(bobBalance / totalBalance) * 100}%`,
          background: '#10b981',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.2s',
          minWidth: bobBalance > 0 ? 30 : 0,
        }}>
          {bobBalance > 0 && (
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'white', fontWeight: 600 }}>
              Bob {bobBalance}
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 14, padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#6366f1' }}>Alice gets more</span>
          <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#10b981' }}>Bob gets more</span>
        </div>
        <input
          type="range"
          min={0}
          max={totalBalance}
          value={aliceBalance}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#6366f1' }}
        />
      </div>

      {/* Reset */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <button onClick={resetChannel} style={{ ...glassStyle, padding: '5px 12px', cursor: 'pointer', fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6 }}>
          Reset channel
        </button>
      </div>

      <DataBox
        label="Ключевой принцип"
        value="Каждое изменение баланса -- подписанное сообщение, не транзакция. Мгновенно и бесплатно. Это тот же принцип, что и Lightning Network (BTC-09), обобщенный для произвольного состояния."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
