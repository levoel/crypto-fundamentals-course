/**
 * Plasma Diagrams (SCALE-04)
 *
 * Exports:
 * - PlasmaArchitectureDiagram: Static overview of Plasma architecture (L1, operator, child chain)
 * - MassExitDiagram: 5-step step-through showing the mass exit problem (history array)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  PlasmaArchitectureDiagram                                           */
/* ================================================================== */

/**
 * PlasmaArchitectureDiagram
 *
 * Three-layer static diagram: L1 (Ethereum), Operator, Child Chain.
 * Arrows showing: Deposits, Merkle roots, Exits.
 */
export function PlasmaArchitectureDiagram() {
  const svgW = 420;
  const svgH = 340;

  // Layer positions
  const l1Y = 50;
  const opY = 160;
  const childY = 270;
  const layerW = 300;
  const layerH = 56;
  const startX = (svgW - layerW) / 2;

  return (
    <DiagramContainer title="Архитектура Plasma" color="orange">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* Defs for arrow markers */}
          <defs>
            <marker id="arrowDown" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#10b981" />
            </marker>
            <marker id="arrowUp" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#a78bfa" />
            </marker>
            <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#f43f5e" />
            </marker>
          </defs>

          {/* L1 Layer */}
          <rect x={startX} y={l1Y} width={layerW} height={layerH} rx={8} fill="rgba(99,102,241,0.12)" stroke="#6366f1" strokeWidth={1} />
          <text x={svgW / 2} y={l1Y + 22} fill="#6366f1" fontSize={12} textAnchor="middle" fontFamily="monospace" fontWeight={700}>
            L1 (Ethereum)
          </text>
          <text x={svgW / 2} y={l1Y + 40} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            Plasma Contract: deposits + Merkle roots
          </text>

          {/* Operator Layer */}
          <rect x={startX} y={opY} width={layerW} height={layerH} rx={8} fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth={1} />
          <text x={svgW / 2} y={opY + 22} fill="#f59e0b" fontSize={12} textAnchor="middle" fontFamily="monospace" fontWeight={700}>
            Operator
          </text>
          <text x={svgW / 2} y={opY + 40} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            Processes TX, computes Merkle roots
          </text>

          {/* Child Chain Layer */}
          <rect x={startX} y={childY} width={layerW} height={layerH} rx={8} fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth={1} />
          <text x={svgW / 2} y={childY + 22} fill="#10b981" fontSize={12} textAnchor="middle" fontFamily="monospace" fontWeight={700}>
            Child Chain
          </text>
          <text x={svgW / 2} y={childY + 40} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            Blocks, user TX, Merkle tree of state
          </text>

          {/* Arrow: Deposits (L1 -> Child) */}
          <line x1={startX + 60} y1={l1Y + layerH} x2={startX + 60} y2={childY} stroke="#10b981" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arrowDown)" />
          <text x={startX + 20} y={opY + layerH / 2 + 4} fill="#10b981" fontSize={9} fontFamily="monospace" textAnchor="middle">
            Deposits
          </text>

          {/* Arrow: Merkle roots (Child -> L1) */}
          <line x1={svgW / 2} y1={opY} x2={svgW / 2} y2={l1Y + layerH} stroke="#a78bfa" strokeWidth={1.5} markerEnd="url(#arrowUp)" />
          <text x={svgW / 2 + 60} y={(opY + l1Y + layerH) / 2 + 4} fill="#a78bfa" fontSize={9} fontFamily="monospace" textAnchor="start">
            Merkle roots
          </text>

          {/* Arrow: Operator -> Child */}
          <line x1={svgW / 2} y1={opY + layerH} x2={svgW / 2} y2={childY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,3" markerEnd="url(#arrowDown)" />

          {/* Arrow: Exits (Child -> L1) */}
          <line x1={startX + layerW - 60} y1={childY} x2={startX + layerW - 60} y2={l1Y + layerH} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arrowRed)" />
          <text x={startX + layerW - 10} y={opY + layerH / 2 + 4} fill="#f43f5e" fontSize={9} fontFamily="monospace" textAnchor="start">
            Exits (Merkle proof)
          </text>
        </svg>
      </div>

      <DataBox
        label="Ключевая проблема"
        value="Оператор публикует только Merkle root, НЕ данные транзакций. Если оператор исчезнет, пользователи не смогут доказать свои балансы. Это фундаментальный недостаток Plasma."
        variant="warning"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MassExitDiagram                                                     */
/* ================================================================== */

interface MassExitStep {
  title: string;
  description: string;
  l1Load: number;
  usersAffected: number;
  statusColor: string;
  icon: string;
}

const MASS_EXIT_STEPS: MassExitStep[] = [
  {
    title: 'NORMAL OPERATION',
    description: 'Оператор обрабатывает 1000 транзакций, публикует Merkle root на L1. Пользователи доверяют оператору предоставить данные для exit.',
    l1Load: 5,
    usersAffected: 0,
    statusColor: '#10b981',
    icon: 'OK',
  },
  {
    title: 'DATA WITHHOLDING',
    description: 'Оператор перестает делиться данными транзакций. Пользователи не могут создать Merkle proofs для своих балансов. Данные доступны только оператору.',
    l1Load: 5,
    usersAffected: 500,
    statusColor: '#f59e0b',
    icon: '!!',
  },
  {
    title: 'PANIC -- Mass Exit',
    description: 'Без данных пользователи ДОЛЖНЫ выйти, используя последнее известное валидное состояние. Все одновременно отправляют exit-транзакции на L1.',
    l1Load: 60,
    usersAffected: 800,
    statusColor: '#f43f5e',
    icon: '!!!',
  },
  {
    title: 'L1 CONGESTION',
    description: 'Тысячи exit-транзакций перегружают Ethereum. Газ взлетает. Некоторые пользователи не могут позволить себе выход. Сеть перегружена.',
    l1Load: 95,
    usersAffected: 1000,
    statusColor: '#ef4444',
    icon: 'CRIT',
  },
  {
    title: 'LESSON -- Why Rollups Won',
    description: 'Data availability problem -- фундаментальный недостаток Plasma. Rollups решили это: ВСЕ данные транзакций публикуются на L1. Если sequencer исчезнет, любой может восстановить состояние из L1.',
    l1Load: 10,
    usersAffected: 0,
    statusColor: '#a78bfa',
    icon: 'FIX',
  },
];

/**
 * MassExitDiagram
 *
 * 5-step step-through showing the Plasma mass exit failure mode.
 * History array pattern with Step/Back/Reset navigation.
 */
export function MassExitDiagram() {
  const [stepIdx, setStepIdx] = useState(0);

  const step = MASS_EXIT_STEPS[stepIdx];

  const goNext = () => setStepIdx((i) => Math.min(i + 1, MASS_EXIT_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  return (
    <DiagramContainer title="Mass Exit Problem: почему Plasma проиграла" color="red">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {MASS_EXIT_STEPS.map((s, i) => (
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
              background: i === stepIdx ? `${s.statusColor}20` : 'rgba(255,255,255,0.03)',
              color: i === stepIdx ? s.statusColor : i < stepIdx ? colors.textMuted : 'rgba(255,255,255,0.2)',
              border: `1px solid ${i === stepIdx ? s.statusColor + '50' : 'rgba(255,255,255,0.06)'}`,
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
        border: `1px solid ${step.statusColor}30`,
      }}>
        {/* Title + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: step.statusColor, fontFamily: 'monospace' }}>
            Step {stepIdx + 1}: {step.title}
          </div>
          <span style={{
            fontSize: 9,
            fontFamily: 'monospace',
            padding: '2px 8px',
            borderRadius: 4,
            background: `${step.statusColor}15`,
            color: step.statusColor,
            border: `1px solid ${step.statusColor}30`,
            fontWeight: 700,
          }}>
            {step.icon}
          </span>
        </div>

        {/* Description */}
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 14 }}>
          {step.description}
        </div>

        {/* Metrics */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* L1 Load */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, marginBottom: 4 }}>
              L1 Load: <span style={{ color: step.l1Load > 80 ? '#ef4444' : step.l1Load > 40 ? '#f59e0b' : '#10b981' }}>{step.l1Load}%</span>
            </div>
            <div style={{
              height: 14,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${step.l1Load}%`,
                height: '100%',
                background: step.l1Load > 80 ? '#ef4444' : step.l1Load > 40 ? '#f59e0b' : '#10b981',
                opacity: 0.7,
                borderRadius: 4,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>

          {/* Users affected */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, marginBottom: 4 }}>
              Users affected: <span style={{ color: step.usersAffected > 500 ? '#f43f5e' : step.usersAffected > 0 ? '#f59e0b' : '#10b981' }}>{step.usersAffected}/1000</span>
            </div>
            <div style={{
              height: 14,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(step.usersAffected / 1000) * 100}%`,
                height: '100%',
                background: step.usersAffected > 500 ? '#f43f5e' : step.usersAffected > 0 ? '#f59e0b' : '#10b981',
                opacity: 0.7,
                borderRadius: 4,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* L1 congestion visualization in step 4 */}
        {stepIdx === 3 && (
          <div style={{
            marginTop: 12,
            padding: 10,
            background: 'rgba(239,68,68,0.08)',
            borderRadius: 6,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#ef4444', marginBottom: 6, fontWeight: 600 }}>
              Ethereum Mempool Overflow:
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {Array.from({ length: 40 }, (_, i) => (
                <div key={i} style={{
                  width: 16,
                  height: 12,
                  borderRadius: 2,
                  background: i < 35 ? '#ef4444' : 'rgba(255,255,255,0.05)',
                  opacity: i < 35 ? (0.3 + Math.random() * 0.5) : 0.3,
                  fontSize: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: 'monospace',
                }}>
                  TX
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, fontFamily: 'monospace', color: colors.textMuted, marginTop: 6 }}>
              35/40 TX slots filled with exit transactions. Gas price: 500+ gwei
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
        <button onClick={reset} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Reset
        </button>
        <button onClick={goBack} disabled={stepIdx === 0} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : colors.textMuted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, opacity: stepIdx === 0 ? 0.5 : 1 }}>
          Back
        </button>
        <button onClick={goNext} disabled={stepIdx === MASS_EXIT_STEPS.length - 1} style={{ ...glassStyle, padding: '6px 14px', cursor: stepIdx === MASS_EXIT_STEPS.length - 1 ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace', color: stepIdx === MASS_EXIT_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, border: `1px solid ${stepIdx === MASS_EXIT_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, borderRadius: 6, opacity: stepIdx === MASS_EXIT_STEPS.length - 1 ? 0.5 : 1 }}>
          Step
        </button>
      </div>

      <DataBox
        label="Ключевой вывод"
        value="Rollups = Plasma + data on-chain. Это простое изменение решило проблему mass exit. Если sequencer исчезнет, любой может восстановить состояние из данных на L1."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
