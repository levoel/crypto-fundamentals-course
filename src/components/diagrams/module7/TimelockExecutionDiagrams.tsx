/**
 * Timelock Execution Diagrams (GOV-04)
 *
 * Exports:
 * - TimelockFlowDiagram: Full timelock execution flow (step-through, history array, 7 steps)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  TimelockFlowDiagram                                                */
/* ================================================================== */

interface TimelockStep {
  title: string;
  action: string;
  state: string;
  stateColor: string;
  role: string;
  day: string;
  description: string;
  codeHint: string;
}

const TIMELOCK_STEPS: TimelockStep[] = [
  {
    title: 'PROPOSE',
    action: 'governor.propose(targets, values, calldatas, description)',
    state: 'Pending',
    stateColor: '#94a3b8',
    role: 'Anyone with voting power',
    day: 'Day 0',
    description: 'Deployer создает предложение: перевести 1 ETH из Treasury получателю.',
    codeHint: 'governor.propose(...)',
  },
  {
    title: 'VOTING DELAY',
    action: 'vm.warp(block.timestamp + 1 days + 1)',
    state: 'Active',
    stateColor: '#3b82f6',
    role: 'System (time passes)',
    day: 'Day 1',
    description: 'Прошел 1 день (votingDelay). Сообщество может подготовиться к голосованию.',
    codeHint: 'vm.warp(+1 day)',
  },
  {
    title: 'VOTE',
    action: 'castVote(proposalId, support)',
    state: 'Active',
    stateColor: '#3b82f6',
    role: 'Token holders',
    day: 'Days 1-8',
    description: 'voter1 голосует For (400K votes), voter2 голосует Against (100K votes). Quorum: 4% от 1M = 40K (достигнут).',
    codeHint: 'castVote(id, 1=For)',
  },
  {
    title: 'VOTING ENDS',
    action: 'vm.warp(block.timestamp + 1 weeks + 1)',
    state: 'Succeeded',
    stateColor: '#22c55e',
    role: 'System (time passes)',
    day: 'Day 8',
    description: 'Период голосования завершен. For (400K) > Against (100K) и quorum met. Предложение принято.',
    codeHint: 'vm.warp(+1 week)',
  },
  {
    title: 'QUEUE',
    action: 'governor.queue(targets, values, calldatas, descriptionHash)',
    state: 'Queued',
    stateColor: '#a855f7',
    role: 'Governor -> Timelock',
    day: 'Day 8',
    description: 'Governor вызывает timelock.schedule(). Предложение помещено в очередь TimelockController.',
    codeHint: 'governor.queue(...)',
  },
  {
    title: 'TIMELOCK DELAY',
    action: 'vm.warp(block.timestamp + 1 days + 1)',
    state: 'Queued',
    stateColor: '#a855f7',
    role: 'System (security buffer)',
    day: 'Day 9',
    description: 'Задержка 1 день. Сообщество может увидеть будущее действие и при необходимости принять меры (вывести средства).',
    codeHint: 'vm.warp(+1 day)',
  },
  {
    title: 'EXECUTE',
    action: 'governor.execute(targets, values, calldatas, descriptionHash)',
    state: 'Executed',
    stateColor: '#10b981',
    role: 'Anyone (executor)',
    day: 'Day 9',
    description: 'TimelockController вызывает Treasury.release(recipient, 1 ETH). Получатель получает 1 ETH. Proposal завершен.',
    codeHint: 'governor.execute(...)',
  },
];

/**
 * TimelockFlowDiagram
 *
 * 7-step step-through with history array showing the complete governance lifecycle.
 * Time axis at bottom. Role labels on each step.
 */
export function TimelockFlowDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const step = history[history.length - 1];
  const current = TIMELOCK_STEPS[step];

  const handleNext = () => {
    if (step < TIMELOCK_STEPS.length - 1) {
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
    <DiagramContainer title="Полный цикл governance: от предложения до исполнения" color="blue">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {TIMELOCK_STEPS.map((s, i) => (
          <div key={i} style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: i === step ? 700 : 400,
            background: i === step ? `${s.stateColor}20` : i <= step ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
            color: i === step ? s.stateColor : i <= step ? '#22c55e' : colors.textMuted,
            border: `1px solid ${i === step ? `${s.stateColor}50` : 'rgba(255,255,255,0.08)'}`,
          }}>
            {s.title}
          </div>
        ))}
      </div>

      {/* Current step detail */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 12,
        border: `1px solid ${current.stateColor}30`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: current.stateColor,
            fontFamily: 'monospace',
          }}>
            {step + 1}. {current.title}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              fontSize: 9,
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: 4,
              background: `${current.stateColor}15`,
              color: current.stateColor,
              border: `1px solid ${current.stateColor}30`,
            }}>
              State: {current.state}
            </span>
            <span style={{
              fontSize: 9,
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.05)',
              color: colors.textMuted,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              {current.day}
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 10 }}>
          {current.description}
        </div>

        {/* Role and code */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{
            ...glassStyle,
            padding: 10,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 2 }}>
              Role:
            </div>
            <div style={{ fontSize: 10, color: '#f97316', fontFamily: 'monospace' }}>
              {current.role}
            </div>
          </div>
          <div style={{
            ...glassStyle,
            padding: 10,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 2 }}>
              Code:
            </div>
            <div style={{ fontSize: 10, color: '#22c55e', fontFamily: 'monospace' }}>
              {current.codeHint}
            </div>
          </div>
        </div>
      </div>

      {/* Time axis */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width={500} height={40} style={{ overflow: 'visible' }}>
            {/* Axis line */}
            <line x1={20} y1={20} x2={480} y2={20} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

            {/* Day markers */}
            {[
              { label: 'Day 0', x: 30 },
              { label: 'Day 1', x: 130 },
              { label: 'Day 8', x: 300 },
              { label: 'Day 9', x: 460 },
            ].map((marker, i) => {
              const isActive = (
                (i === 0 && step >= 0) ||
                (i === 1 && step >= 1) ||
                (i === 2 && step >= 3) ||
                (i === 3 && step >= 5)
              );
              return (
                <g key={i}>
                  <circle cx={marker.x} cy={20} r={4} fill={isActive ? '#60a5fa' : 'rgba(255,255,255,0.15)'} />
                  <text x={marker.x} y={35} fill={isActive ? colors.text : colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
                    {marker.label}
                  </text>
                </g>
              );
            })}

            {/* Segments */}
            {[
              { x1: 30, x2: 130, label: 'votingDelay', color: '#94a3b8' },
              { x1: 130, x2: 300, label: 'votingPeriod', color: '#3b82f6' },
              { x1: 300, x2: 460, label: 'timelockDelay', color: '#a855f7' },
            ].map((seg, i) => (
              <g key={i}>
                <line x1={seg.x1} y1={14} x2={seg.x2} y2={14} stroke={`${seg.color}40`} strokeWidth={4} />
                <text x={(seg.x1 + seg.x2) / 2} y={8} fill={seg.color} fontSize={7} textAnchor="middle" fontFamily="monospace">
                  {seg.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
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
        <button onClick={handleNext} disabled={step >= TIMELOCK_STEPS.length - 1} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid rgba(96,165,250,0.3)',
          background: step < TIMELOCK_STEPS.length - 1 ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.05)',
          color: step < TIMELOCK_STEPS.length - 1 ? '#60a5fa' : colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: step < TIMELOCK_STEPS.length - 1 ? 'pointer' : 'not-allowed',
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
