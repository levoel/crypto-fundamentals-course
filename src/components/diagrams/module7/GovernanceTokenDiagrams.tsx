/**
 * Governance Token Diagrams (GOV-02)
 *
 * Exports:
 * - DelegationFlowDiagram: Delegation and checkpoint flow (step-through, history array)
 * - VotingPowerDiagram: Voting power vs token balance interactive demo
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  DelegationFlowDiagram                                              */
/* ================================================================== */

interface DelegationStep {
  title: string;
  description: string;
  alice: { balance: string; votes: string };
  bob: { balance: string; votes: string };
  insight: string;
  insightColor: string;
}

const DELEGATION_STEPS: DelegationStep[] = [
  {
    title: 'Step 1: mint()',
    description: 'mint() создает 1M токенов для Alice',
    alice: { balance: '1,000,000', votes: '0' },
    bob: { balance: '0', votes: '0' },
    insight: 'Токены созданы, но voting power = 0!',
    insightColor: '#ef4444',
  },
  {
    title: 'Step 2: delegate(Alice)',
    description: 'Alice вызывает delegate(Alice) -- самоделегирование',
    alice: { balance: '1,000,000', votes: '1,000,000' },
    bob: { balance: '0', votes: '0' },
    insight: 'Voting power активирован! Checkpoint создан.',
    insightColor: '#22c55e',
  },
  {
    title: 'Step 3: transfer(Bob, 500K)',
    description: 'Bob получает 500K токенов через transfer',
    alice: { balance: '500,000', votes: '500,000' },
    bob: { balance: '500,000', votes: '0' },
    insight: 'Bob имеет токены, но НЕ МОЖЕТ голосовать!',
    insightColor: '#ef4444',
  },
  {
    title: 'Step 4: Bob delegate(Alice)',
    description: 'Bob делегирует голоса Alice (представительское делегирование)',
    alice: { balance: '500,000', votes: '1,000,000' },
    bob: { balance: '500,000', votes: '0' },
    insight: 'Alice имеет 1M votes (свои 500K + Bob 500K)',
    insightColor: '#3b82f6',
  },
  {
    title: 'Step 5: Proposal snapshot',
    description: 'Proposal создан в timestamp T. Governor фиксирует голоса на момент T.',
    alice: { balance: '500,000', votes: '1,000,000 (locked at T)' },
    bob: { balance: '500,000', votes: '0' },
    insight: 'Checkpoints предотвращают манипуляцию!',
    insightColor: '#a855f7',
  },
];

/**
 * DelegationFlowDiagram
 *
 * Step-through with history array showing delegation and checkpoint flow.
 * 5 steps: mint -> self-delegate -> transfer -> representative-delegate -> snapshot.
 */
export function DelegationFlowDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const step = history[history.length - 1];
  const current = DELEGATION_STEPS[step];

  const handleNext = () => {
    if (step < DELEGATION_STEPS.length - 1) {
      setHistory([...history, step + 1]);
    }
  };
  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const handleReset = () => setHistory([0]);

  const renderBar = (label: string, value: string, max: number, color: string) => {
    const numVal = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const width = max > 0 ? Math.min((numVal / max) * 100, 100) : 0;
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>{label}</span>
          <span style={{ fontSize: 10, color, fontFamily: 'monospace', fontWeight: 600 }}>{value}</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
          <div style={{
            height: '100%',
            width: `${width}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 0.4s ease',
            opacity: 0.7,
          }} />
        </div>
      </div>
    );
  };

  return (
    <DiagramContainer title="Делегирование: от токенов к голосам" color="blue">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {DELEGATION_STEPS.map((_, i) => (
          <div key={i} style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: i === step ? 700 : 400,
            background: i === step ? 'rgba(96,165,250,0.3)' : i < step ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
            color: i === step ? '#60a5fa' : i < step ? '#22c55e' : colors.textMuted,
            border: `1px solid ${i === step ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Current step */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 12,
        border: '1px solid rgba(96,165,250,0.2)',
      }}>
        <DiagramTooltip content={
          step === 0 ? 'mint() создает governance-токены. Но сами по себе токены НЕ дают права голоса -- это ключевое отличие ERC20Votes от обычного ERC20. Без вызова delegate() voting power остается нулевым, что защищает от flash loan атак.'
          : step === 1 ? 'delegate(self) активирует voting power через создание checkpoint. Checkpoint фиксирует баланс в конкретный момент времени, что предотвращает манипуляцию голосами через flash loans.'
          : step === 2 ? 'При transfer() токены перемещаются, но делегация НЕ переносится автоматически. Получатель должен сам вызвать delegate(), иначе его токены \"молчат\" в голосовании.'
          : step === 3 ? 'Представительское делегирование позволяет Bob отдать свои голоса Alice, не передавая токены. Alice получает 1M votes (свои 500K + Bob 500K). Это основа liquid democracy в DAO.'
          : 'Snapshot фиксирует voting power на момент создания proposal. Даже если после этого кто-то купит токены, они не смогут повлиять на уже существующее голосование. Это главная защита от flash loan governance атак.'
        }>
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#60a5fa',
              fontFamily: 'monospace',
              marginBottom: 4,
            }}>
              {current.title}
            </div>
            <div style={{ fontSize: 12, color: colors.text }}>
              {current.description}
            </div>
          </div>
        </DiagramTooltip>

        {/* Alice and Bob panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12, marginBottom: 12 }}>
          <DiagramTooltip content="Alice -- основной участник в примере делегирования. Она получает токены через mint(), активирует voting power через delegate(self) и может получать делегированные голоса от других участников.">
            <div style={{ ...glassStyle, padding: 12, border: '1px solid rgba(96,165,250,0.15)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', fontFamily: 'monospace', marginBottom: 8 }}>
                Alice
              </div>
              {renderBar('balanceOf', current.alice.balance, 1000000, '#60a5fa')}
              {renderBar('getVotes', current.alice.votes, 1000000, '#22c55e')}
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Bob -- получатель токенов через transfer(). Он имеет баланс, но если не вызовет delegate(), его voting power будет нулевым. Bob может делегировать голоса себе или представителю (Alice).">
            <div style={{ ...glassStyle, padding: 12, border: '1px solid rgba(249,115,22,0.15)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#f97316', fontFamily: 'monospace', marginBottom: 8 }}>
                Bob
              </div>
              {renderBar('balanceOf', current.bob.balance, 1000000, '#f97316')}
              {renderBar('getVotes', current.bob.votes, 1000000, '#22c55e')}
            </div>
          </DiagramTooltip>
        </div>

        {/* Insight */}
        <DiagramTooltip content="Инсайт показывает ключевой вывод каждого шага. Обратите внимание, как voting power изменяется отдельно от баланса токенов -- это фундаментальное свойство ERC20Votes.">
          <div style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: `${current.insightColor}10`,
            border: `1px solid ${current.insightColor}30`,
          }}>
            <span style={{ fontSize: 11, color: current.insightColor, fontFamily: 'monospace', fontWeight: 600 }}>
              {current.insight}
            </span>
          </div>
        </DiagramTooltip>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleBack} disabled={history.length <= 1} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: history.length > 1 ? colors.text : colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: history.length > 1 ? 'pointer' : 'not-allowed',
        }}>
          Back
        </button>
        <button onClick={handleNext} disabled={step >= DELEGATION_STEPS.length - 1} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid rgba(96,165,250,0.3)',
          background: step < DELEGATION_STEPS.length - 1 ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.05)',
          color: step < DELEGATION_STEPS.length - 1 ? '#60a5fa' : colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: step < DELEGATION_STEPS.length - 1 ? 'pointer' : 'not-allowed',
        }}>
          Step
        </button>
        <button onClick={handleReset} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: 'pointer',
        }}>
          Reset
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  VotingPowerDiagram                                                 */
/* ================================================================== */

/**
 * VotingPowerDiagram
 *
 * Interactive demo: balance vs voting power.
 * Slider for token amount + toggle for delegation status.
 */
export function VotingPowerDiagram() {
  const [amount, setAmount] = useState(500000);
  const [delegated, setDelegated] = useState(false);

  return (
    <DiagramContainer title="Balance vs Voting Power: зачем нужна делегация" color="orange">
      {/* Slider */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <DiagramTooltip content="Количество governance-токенов на балансе. В модели 1 token = 1 vote, больше токенов означает больше влияния. Однако некоторые DAO экспериментируют с квадратичным голосованием (quadratic voting), где влияние растет как корень из количества токенов.">
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>Token Amount</span>
          </DiagramTooltip>
          <span style={{ fontSize: 11, color: '#f97316', fontFamily: 'monospace', fontWeight: 600 }}>
            {amount.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1000000}
          step={10000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#f97316' }}
        />
      </div>

      {/* Delegation toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <DiagramTooltip content="Делегация -- обязательный шаг для активации voting power в ERC20Votes. Без вызова delegate() баланс токенов не конвертируется в голоса. Можно делегировать себе (self-delegate) или представителю. Это защита от flash loan атак: snapshot фиксирует голоса до начала голосования.">
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>Delegated?</span>
        </DiagramTooltip>
        <button
          onClick={() => setDelegated(!delegated)}
          style={{
            padding: '4px 12px',
            borderRadius: 6,
            border: `1px solid ${delegated ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
            background: delegated ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: delegated ? '#22c55e' : '#ef4444',
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {delegated ? 'Yes' : 'No'}
        </button>
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* Balance */}
        <div style={{
          ...glassStyle,
          padding: 16,
          textAlign: 'center',
          border: '1px solid rgba(96,165,250,0.2)',
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
            Balance (ERC20)
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            balanceOf(user)
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace' }}>
            {amount.toLocaleString()}
          </div>
        </div>

        {/* Voting Power */}
        <div style={{
          ...glassStyle,
          padding: 16,
          textAlign: 'center',
          border: `1px solid ${delegated ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
            Voting Power (ERC20Votes)
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            getVotes(user)
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: delegated ? '#22c55e' : '#ef4444', fontFamily: 'monospace' }}>
            {delegated ? amount.toLocaleString() : '0'}
          </div>
          {!delegated && (
            <div style={{
              marginTop: 6,
              padding: '4px 8px',
              borderRadius: 4,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 9,
              color: '#ef4444',
              fontFamily: 'monospace',
            }}>
              delegation required!
            </div>
          )}
        </div>
      </div>

      {/* Code snippet */}
      <DiagramTooltip content="token.delegate(address(this)) -- Solidity-вызов для самоделегирования. address(this) в контексте контракта означает адрес самого контракта. Для EOA (обычного кошелька) используется token.delegate(msg.sender). После вызова создается checkpoint с текущим балансом как voting power.">
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 12,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            fontSize: 10,
            color: colors.textMuted,
            fontFamily: 'monospace',
            marginBottom: 4,
          }}>
            Активация voting power:
          </div>
          <code style={{
            fontSize: 11,
            color: delegated ? '#22c55e' : '#f97316',
            fontFamily: 'monospace',
          }}>
            token.delegate(address(this));
          </code>
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="Это критически важный паттерн ERC20Votes от OpenZeppelin. balanceOf() отвечает за владение токенами (ERC20), а getVotes() -- за voting power (ERC20Votes extension). Эти значения независимы. Без явного вызова delegate() voting power всегда будет 0, даже с миллионами токенов на балансе.">
        <DataBox
          label="CRITICAL"
          value="ERC20Votes НЕ отслеживает voting power автоматически. balanceOf() может быть 1M, а getVotes() будет 0. Вызовите delegate(self) для активации!"
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
