/** @jsxImportSource solid-js */
/**
 * Plasma Diagrams (SCALE-04)
 *
 * Exports:
 * - PlasmaArchitectureDiagram: Static overview of Plasma architecture (L1, operator, child chain)
 * - MassExitDiagram: 5-step step-through showing the mass exit problem (history array)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
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
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '16px' }}>
        <svg width={svgW} height={svgH} style={{ 'overflow': 'visible' }}>
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

      {/* Layer tooltips below SVG */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '14px', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
        <DiagramTooltip content="L1 (Ethereum) хранит Plasma-контракт, который принимает депозиты и Merkle roots от оператора. L1 -- арбитр: при dispute пользователь может выйти, предоставив Merkle proof своего баланса.">
          <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': '#6366f1', 'padding': '3px 8px', 'border-radius': '4px', 'background': 'rgba(99,102,241,0.1)', 'border': '1px solid rgba(99,102,241,0.2)' }}>
            L1 (Ethereum)
          </span>
        </DiagramTooltip>
        <DiagramTooltip content="Оператор -- единственный узел, обрабатывающий транзакции на child chain. Он формирует блоки, вычисляет Merkle root и публикует его на L1. Centralized point of failure: если оператор злонамерен или исчезнет, пользователи должны массово выйти.">
          <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': '#f59e0b', 'padding': '3px 8px', 'border-radius': '4px', 'background': 'rgba(245,158,11,0.1)', 'border': '1px solid rgba(245,158,11,0.2)' }}>
            Operator
          </span>
        </DiagramTooltip>
        <DiagramTooltip content="Child chain -- отдельный блокчейн, где происходят пользовательские транзакции. Высокая пропускная способность, но данные НЕ публикуются на L1. Это фундаментальная проблема data availability Plasma.">
          <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': '#10b981', 'padding': '3px 8px', 'border-radius': '4px', 'background': 'rgba(16,185,129,0.1)', 'border': '1px solid rgba(16,185,129,0.2)' }}>
            Child Chain
          </span>
        </DiagramTooltip>
      </div>

      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '14px', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
        <DiagramTooltip content="Депозит -- перевод активов с L1 в Plasma child chain. Средства блокируются в Plasma-контракте на Ethereum, а эквивалент появляется на child chain.">
          <span style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': '#10b981', 'padding': '2px 6px', 'border-radius': '3px', 'background': 'rgba(16,185,129,0.08)', 'border': '1px solid rgba(16,185,129,0.15)' }}>
            Deposits
          </span>
        </DiagramTooltip>
        <DiagramTooltip content="Merkle root -- криптографический хеш всех транзакций в блоке child chain. Оператор публикует только root (32 байта) на L1, не сами транзакции. Это экономит газ, но создает проблему data availability.">
          <span style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': '#a78bfa', 'padding': '2px 6px', 'border-radius': '3px', 'background': 'rgba(167,139,250,0.08)', 'border': '1px solid rgba(167,139,250,0.15)' }}>
            Merkle roots
          </span>
        </DiagramTooltip>
        <DiagramTooltip content="Exit -- вывод средств обратно на L1. Пользователь предоставляет Merkle proof своего баланса. Challenge period позволяет оспорить невалидные выходы. Это единственный механизм безопасности для пользователей.">
          <span style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': '#f43f5e', 'padding': '2px 6px', 'border-radius': '3px', 'background': 'rgba(244,63,94,0.08)', 'border': '1px solid rgba(244,63,94,0.15)' }}>
            Exits (Merkle proof)
          </span>
        </DiagramTooltip>
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
  tooltipRu: string;
}

const MASS_EXIT_STEPS: MassExitStep[] = [
  {
    title: 'NORMAL OPERATION',
    description: 'Оператор обрабатывает 1000 транзакций, публикует Merkle root на L1. Пользователи доверяют оператору предоставить данные для exit.',
    l1Load: 5,
    usersAffected: 0,
    statusColor: '#10b981',
    icon: 'OK',
    tooltipRu: 'При нормальной работе Plasma экономит газ: вместо 1000 транзакций на L1, публикуется один 32-байтный Merkle root. Но безопасность зависит от доступности данных у оператора.',
  },
  {
    title: 'DATA WITHHOLDING',
    description: 'Оператор перестает делиться данными транзакций. Пользователи не могут создать Merkle proofs для своих балансов. Данные доступны только оператору.',
    l1Load: 5,
    usersAffected: 500,
    statusColor: '#f59e0b',
    icon: '!!',
    tooltipRu: 'Data withholding attack -- оператор публикует Merkle root, но скрывает данные транзакций. Пользователи не могут построить Merkle proof для exit. Это уникальная уязвимость Plasma, отсутствующая в rollups.',
  },
  {
    title: 'PANIC -- Mass Exit',
    description: 'Без данных пользователи ДОЛЖНЫ выйти, используя последнее известное валидное состояние. Все одновременно отправляют exit-транзакции на L1.',
    l1Load: 60,
    usersAffected: 800,
    statusColor: '#f43f5e',
    icon: '!!!',
    tooltipRu: 'Mass exit -- лавинообразный процесс. Каждый пользователь отправляет отдельную L1-транзакцию с Merkle proof. При 10,000 пользователях это 10,000 L1-транзакций одновременно.',
  },
  {
    title: 'L1 CONGESTION',
    description: 'Тысячи exit-транзакций перегружают Ethereum. Газ взлетает. Некоторые пользователи не могут позволить себе выход. Сеть перегружена.',
    l1Load: 95,
    usersAffected: 1000,
    statusColor: '#ef4444',
    icon: 'CRIT',
    tooltipRu: 'Ethereum обрабатывает ~15 TPS. При mass exit тысячи транзакций конкурируют за блок-пространство. Gas price может вырасти в 100x. Пользователи с малыми балансами теряют средства -- стоимость exit превышает баланс.',
  },
  {
    title: 'LESSON -- Why Rollups Won',
    description: 'Data availability problem -- фундаментальный недостаток Plasma. Rollups решили это: ВСЕ данные транзакций публикуются на L1. Если sequencer исчезнет, любой может восстановить состояние из L1.',
    l1Load: 10,
    usersAffected: 0,
    statusColor: '#a78bfa',
    icon: 'FIX',
    tooltipRu: 'Rollups = Plasma + data on-chain. Простое решение: публиковать calldata/blobs на L1. Стоимость выше, но mass exit невозможен -- любой узел может восстановить полное состояние из L1-данных.',
  },
];

/**
 * MassExitDiagram
 *
 * 5-step step-through showing the Plasma mass exit failure mode.
 * History array pattern with Step/Back/Reset navigation.
 */
export function MassExitDiagram() {
  const [stepIdx, setStepIdx] = createSignal(0);

  const step = MASS_EXIT_STEPS[stepIdx()];

  const goNext = () => setStepIdx((i) => Math.min(i + 1, MASS_EXIT_STEPS.length - 1));
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0));
  const reset = () => setStepIdx(0);

  return (
    <DiagramContainer title="Mass Exit Problem: почему Plasma проиграла" color="red">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '14px' }}>
        {MASS_EXIT_STEPS.map((s, i) => (
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
                'background': i === stepIdx() ? `${s.statusColor}20` : 'rgba(255,255,255,0.03)',
                'color': i === stepIdx() ? s.statusColor : i < stepIdx() ? colors.textMuted : 'rgba(255,255,255,0.2)',
                'border': `1px solid ${i === stepIdx() ? s.statusColor + '50' : 'rgba(255,255,255,0.06)'}`,
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
        'border': `1px solid ${step.statusColor}30`,
      }}>
        {/* Title + status */}
        <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px', 'flex-wrap': 'wrap', 'gap': '8px' }}>
          <DiagramTooltip content={step.tooltipRu}>
            <span style={{ 'font-size': '13px', 'font-weight': '600', 'color': step.statusColor, 'font-family': 'monospace' }}>
              Step {stepIdx() + 1}: {step.title}
            </span>
          </DiagramTooltip>
          <DiagramTooltip content={`Статус: ${step.icon}. L1 нагрузка ${step.l1Load}%, затронуто пользователей: ${step.usersAffected}/1000.`}>
            <span style={{
              'font-size': '9px',
              'font-family': 'monospace',
              'padding': '2px 8px',
              'border-radius': '4px',
              'background': `${step.statusColor}15`,
              'color': step.statusColor,
              'border': `1px solid ${step.statusColor}30`,
              'font-weight': '700',
            }}>
              {step.icon}
            </span>
          </DiagramTooltip>
        </div>

        {/* Description */}
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '14px' }}>
          {step.description}
        </div>

        {/* Metrics */}
        <div style={{ 'display': 'flex', 'gap': '20px', 'flex-wrap': 'wrap' }}>
          {/* L1 Load */}
          <div style={{ 'flex': '1', 'min-width': '140px' }}>
            <DiagramTooltip content={`L1 нагрузка ${step.l1Load}%. При mass exit тысячи exit-транзакций конкурируют за блок-пространство Ethereum. Каждая exit-транзакция требует Merkle proof (~500-1000 gas).`}>
              <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': colors.textMuted, 'margin-bottom': '4px', 'display': 'inline-block' }}>
                L1 Load: <span style={{ 'color': step.l1Load > 80 ? '#ef4444' : step.l1Load > 40 ? '#f59e0b' : '#10b981' }}>{step.l1Load}%</span>
              </span>
            </DiagramTooltip>
            <div style={{
              'height': '14px',
              'background': 'rgba(255,255,255,0.05)',
              'border-radius': '4px',
              'overflow': 'hidden',
            }}>
              <div style={{
                'width': `${step.l1Load}%`,
                'height': '100%',
                'background': step.l1Load > 80 ? '#ef4444' : step.l1Load > 40 ? '#f59e0b' : '#10b981',
                'opacity': '0.7',
                'border-radius': '4px',
                'transition': 'width 0.3s',
              }} />
            </div>
          </div>

          {/* Users affected */}
          <div style={{ 'flex': '1', 'min-width': '140px' }}>
            <DiagramTooltip content={`${step.usersAffected} из 1000 пользователей затронуты. При data withholding пользователи теряют возможность доказать свои балансы и вынуждены использовать последнее известное состояние для exit.`}>
              <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': colors.textMuted, 'margin-bottom': '4px', 'display': 'inline-block' }}>
                Users affected: <span style={{ 'color': step.usersAffected > 500 ? '#f43f5e' : step.usersAffected > 0 ? '#f59e0b' : '#10b981' }}>{step.usersAffected}/1000</span>
              </span>
            </DiagramTooltip>
            <div style={{
              'height': '14px',
              'background': 'rgba(255,255,255,0.05)',
              'border-radius': '4px',
              'overflow': 'hidden',
            }}>
              <div style={{
                'width': `${(step.usersAffected / 1000) * 100}%`,
                'height': '100%',
                'background': step.usersAffected > 500 ? '#f43f5e' : step.usersAffected > 0 ? '#f59e0b' : '#10b981',
                'opacity': '0.7',
                'border-radius': '4px',
                'transition': 'width 0.3s',
              }} />
            </div>
          </div>
        </div>

        {/* L1 congestion visualization in step 4 */}
        {stepIdx() === 3 && (
          <div style={{
            'margin-top': '12px',
            'padding': '10px',
            'background': 'rgba(239,68,68,0.08)',
            'border-radius': '6px',
            'border': '1px solid rgba(239,68,68,0.2)',
          }}>
            <DiagramTooltip content="Визуализация переполнения Ethereum mempool. Красные блоки -- exit-транзакции Plasma-пользователей. При mass exit mempool заполняется тысячами exit TX, вытесняя обычные транзакции.">
              <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': '#ef4444', 'margin-bottom': '6px', 'font-weight': '600', 'display': 'inline-block' }}>
                Ethereum Mempool Overflow:
              </span>
            </DiagramTooltip>
            <div style={{ 'display': 'flex', 'gap': '3px', 'flex-wrap': 'wrap' }}>
              {Array.from({ length: 40 }, (_, i) => (
                <div style={{
                  'width': '16px',
                  'height': '12px',
                  'border-radius': '2px',
                  'background': i < 35 ? '#ef4444' : 'rgba(255,255,255,0.05)',
                  'opacity': i < 35 ? 0.6 : 0.3,
                  'font-size': '6px',
                  'display': 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'color': 'white',
                  'font-family': 'monospace',
                }}>
                  TX
                </div>
              ))}
            </div>
            <div style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': colors.textMuted, 'margin-top': '6px' }}>
              35/40 TX slots filled with exit transactions. Gas price: 500+ gwei
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center', 'margin-bottom': '14px' }}>
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
          <button onClick={goNext} disabled={stepIdx() === MASS_EXIT_STEPS.length - 1} style={{ ...glassStyle, 'padding': '6px 14px', 'cursor': stepIdx() === MASS_EXIT_STEPS.length - 1 ? 'not-allowed' : 'pointer', 'font-size': '11px', 'font-family': 'monospace', 'color': stepIdx() === MASS_EXIT_STEPS.length - 1 ? 'rgba(255,255,255,0.2)' : colors.accent, 'border': `1px solid ${stepIdx() === MASS_EXIT_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.accent + '50'}`, 'border-radius': '6px', 'opacity': stepIdx() === MASS_EXIT_STEPS.length - 1 ? 0.5 : 1 }}>
            Step
          </button>
        </div>
      </div>

      <DataBox
        label="Ключевой вывод"
        value="Rollups = Plasma + data on-chain. Это простое изменение решило проблему mass exit. Если sequencer исчезнет, любой может восстановить состояние из данных на L1."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
