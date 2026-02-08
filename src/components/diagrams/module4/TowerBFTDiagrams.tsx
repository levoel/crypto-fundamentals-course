/**
 * Tower BFT Diagrams (SOL-03)
 *
 * Exports:
 * - VoteTowerDiagram: Vote tower lockout visualization (interactive, step-through with history array)
 * - LeaderScheduleDiagram: Leader schedule + Gulf Stream flow (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared button style                                                */
/* ================================================================== */

function btnStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    ...glassStyle,
    padding: '8px 16px',
    cursor: active ? 'pointer' : 'not-allowed',
    color: active ? accentColor : colors.textMuted,
    fontSize: 13,
    fontFamily: 'monospace',
    opacity: active ? 1 : 0.5,
    border: `1px solid ${active ? accentColor + '40' : 'rgba(255,255,255,0.08)'}`,
    background: active ? `${accentColor}10` : 'rgba(255,255,255,0.03)',
  };
}

/* ================================================================== */
/*  VoteTowerDiagram                                                   */
/* ================================================================== */

interface VoteEntry {
  slot: number;
  lockout: number;
  confirmations: number;
}

interface TowerStep {
  votes: VoteEntry[];
  message: string;
  showConfirmationLevels?: boolean;
}

function buildTowerSteps(): TowerStep[] {
  return [
    {
      votes: [],
      message: 'Каждый валидатор поддерживает "башню" (tower) своих голосов. Пока башня пуста -- валидатор еще ни за что не голосовал.',
    },
    {
      votes: [
        { slot: 100, lockout: 2, confirmations: 1 },
      ],
      message: 'Голос за слот 100. Lockout = 2: валидатор не может изменить этот голос в течение 2 слотов.',
    },
    {
      votes: [
        { slot: 100, lockout: 4, confirmations: 2 },
        { slot: 101, lockout: 2, confirmations: 1 },
      ],
      message: 'Голос за слот 101. Lockout предыдущего голоса УДВАИВАЕТСЯ (2 -> 4). Новый голос начинает с lockout = 2.',
    },
    {
      votes: [
        { slot: 100, lockout: 8, confirmations: 3 },
        { slot: 101, lockout: 4, confirmations: 2 },
        { slot: 102, lockout: 2, confirmations: 1 },
      ],
      message: 'Голос за слот 102. Lockout продолжает удваиваться! Слот 100 теперь заблокирован на 8 слотов. Чем глубже голос -- тем экспоненциально труднее его отменить.',
    },
    {
      votes: [
        { slot: 100, lockout: 16, confirmations: 4 },
        { slot: 101, lockout: 8, confirmations: 3 },
        { slot: 102, lockout: 4, confirmations: 2 },
        { slot: 103, lockout: 2, confirmations: 1 },
      ],
      message: 'Голос за слот 103. Lockout: 16, 8, 4, 2. После 32 подтверждений голос становится "rooted" (финализированным). Это уровень подтверждения "finalized".',
    },
    {
      votes: [
        { slot: 100, lockout: 16, confirmations: 4 },
        { slot: 101, lockout: 8, confirmations: 3 },
        { slot: 102, lockout: 4, confirmations: 2 },
        { slot: 103, lockout: 2, confirmations: 1 },
      ],
      message: '',
      showConfirmationLevels: true,
    },
  ];
}

export function VoteTowerDiagram() {
  const [step, setStep] = useState(0);
  const steps = buildTowerSteps();
  const currentStep = steps[step];

  const canBack = step > 0;
  const canForward = step < steps.length - 1;

  // Color gradient: deeper votes = darker green
  const voteColor = (depth: number, total: number): string => {
    const alpha = 0.3 + (depth / Math.max(total, 1)) * 0.5;
    return `rgba(34,197,94,${alpha})`;
  };

  return (
    <DiagramContainer title="Tower BFT: башня голосований" color="purple">
      {/* Vote tower visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 420 }}>
          {currentStep.votes.length === 0 ? (
            <div style={{
              ...glassStyle,
              padding: '24px 16px',
              borderRadius: 8,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(255,255,255,0.15)',
            }}>
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
                Башня пуста -- нет голосов
              </span>
            </div>
          ) : (
            /* Render votes from top (newest) to bottom (oldest) */
            [...currentStep.votes].reverse().map((vote, visualIdx) => {
              const depth = currentStep.votes.length - 1 - visualIdx; // 0 = newest, length-1 = oldest
              const total = currentStep.votes.length;
              const bgColor = voteColor(depth, total);
              const isNewest = visualIdx === 0;

              return (
                <div
                  key={vote.slot}
                  style={{
                    ...glassStyle,
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: bgColor,
                    border: `1px solid rgba(34,197,94,${0.2 + depth * 0.1})`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
                      color: '#22c55e',
                    }}>
                      Slot {vote.slot}
                    </span>
                    {isNewest && (
                      <span style={{
                        fontSize: 9, fontFamily: 'monospace',
                        color: colors.primary,
                        background: `${colors.primary}20`,
                        padding: '1px 6px', borderRadius: 3,
                      }}>
                        НОВЫЙ
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>lockout</div>
                      <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: colors.text }}>
                        {vote.lockout}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>confirms</div>
                      <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: colors.text }}>
                        {vote.confirmations}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirmation levels summary (final step) */}
      {currentStep.showConfirmationLevels && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {[
            {
              level: 'Processed',
              desc: 'Лидер обработал транзакцию',
              color: '#f59e0b',
              detail: 'Быстрее всего, но наименее надежно. Транзакция может быть отменена.',
            },
            {
              level: 'Confirmed (optimistic)',
              desc: '2/3 валидаторов проголосовали за слот',
              color: '#3b82f6',
              detail: 'Супербольшинство подтвердило слот. Вероятность отмены крайне мала.',
            },
            {
              level: 'Finalized (rooted)',
              desc: '32+ голосов поверх, необратимо',
              color: '#22c55e',
              detail: 'Голос получил 32+ подтверждений, lockout достиг максимума. Эквивалент финализации в Ethereum.',
            },
          ].map((item) => (
            <div
              key={item.level}
              style={{
                ...glassStyle,
                padding: '10px 14px',
                borderRadius: 8,
                background: `${item.color}08`,
                border: `1px solid ${item.color}25`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: item.color,
                }} />
                <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: item.color }}>
                  {item.level}
                </span>
                <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
                  -- {item.desc}
                </span>
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', paddingLeft: 16, lineHeight: 1.4 }}>
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message */}
      {currentStep.message && (
        <DataBox
          label={`Шаг ${step + 1} из ${steps.length}`}
          value={currentStep.message}
          variant="highlight"
        />
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button
          onClick={() => setStep(0)}
          style={btnStyle(step > 0, colors.text)}
          disabled={step === 0}
        >
          Сброс
        </button>
        <button
          onClick={() => canBack && setStep((s) => s - 1)}
          disabled={!canBack}
          style={btnStyle(canBack, colors.text)}
        >
          Назад
        </button>
        <button
          onClick={() => canForward && setStep((s) => s + 1)}
          disabled={!canForward}
          style={btnStyle(canForward, '#a855f7')}
        >
          Далее
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  LeaderScheduleDiagram                                              */
/* ================================================================== */

interface Leader {
  id: string;
  label: string;
  color: string;
  startSlot: number;
  endSlot: number;
}

const LEADERS: Leader[] = [
  { id: 'a', label: 'Лидер A', color: '#22c55e', startSlot: 0, endSlot: 3 },
  { id: 'b', label: 'Лидер B', color: '#3b82f6', startSlot: 4, endSlot: 7 },
  { id: 'c', label: 'Лидер C', color: '#a855f7', startSlot: 8, endSlot: 11 },
];

const TOTAL_SLOTS = 12;

export function LeaderScheduleDiagram() {
  const [hoveredSection, setHoveredSection] = useState<'schedule' | 'gulfstream' | null>(null);

  return (
    <DiagramContainer title="Расписание лидеров и Gulf Stream" color="blue">
      {/* Epoch / slot timeline */}
      <div
        onMouseEnter={() => setHoveredSection('schedule')}
        onMouseLeave={() => setHoveredSection(null)}
        style={{
          ...glassStyle,
          padding: 16,
          borderRadius: 10,
          marginBottom: 12,
          background: hoveredSection === 'schedule' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${hoveredSection === 'schedule' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
          transition: 'all 0.15s',
          cursor: 'default',
        }}
      >
        <div style={{
          fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
          color: '#3b82f6', marginBottom: 10,
        }}>
          Epoch = 432,000 слотов (~2-3 дня). Каждый лидер получает 4 слота (~1.6s).
        </div>

        {/* Leader legend */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          {LEADERS.map((leader) => (
            <div key={leader.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 3,
                background: leader.color, opacity: 0.7,
              }} />
              <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
                {leader.label}
              </span>
            </div>
          ))}
        </div>

        {/* Slot timeline */}
        <div style={{ display: 'flex', gap: 3, overflowX: 'auto' }}>
          {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
            const leader = LEADERS.find((l) => i >= l.startSlot && i <= l.endSlot);
            const leaderColor = leader?.color || colors.textMuted;
            const isFirstInGroup = leader && i === leader.startSlot;

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  ...glassStyle,
                  width: 40, height: 36,
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${leaderColor}15`,
                  border: `1px solid ${leaderColor}30`,
                  borderLeft: isFirstInGroup ? `3px solid ${leaderColor}` : undefined,
                }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: leaderColor, fontWeight: 600 }}>
                    {i}
                  </span>
                </div>
                {isFirstInGroup && (
                  <span style={{ fontSize: 8, fontFamily: 'monospace', color: leaderColor }}>
                    {leader.label.split(' ')[1]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gulf Stream flow */}
      <div
        onMouseEnter={() => setHoveredSection('gulfstream')}
        onMouseLeave={() => setHoveredSection(null)}
        style={{
          ...glassStyle,
          padding: 16,
          borderRadius: 10,
          marginBottom: 12,
          background: hoveredSection === 'gulfstream' ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${hoveredSection === 'gulfstream' ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
          transition: 'all 0.15s',
          cursor: 'default',
        }}
      >
        <div style={{
          fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
          color: '#22c55e', marginBottom: 12,
        }}>
          Gulf Stream: транзакции без mempool
        </div>

        {/* Solana flow */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: '#22c55e', fontFamily: 'monospace', fontWeight: 600, marginBottom: 8 }}>
            Solana:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Клиент', color: colors.text },
              { label: 'Текущий лидер', color: '#22c55e' },
              { label: 'Следующий лидер', color: '#3b82f6' },
            ].map((node, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  ...glassStyle,
                  padding: '6px 12px', borderRadius: 6,
                  background: `${node.color}10`,
                  border: `1px solid ${node.color}30`,
                }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: node.color, fontWeight: 600 }}>
                    {node.label}
                  </span>
                </div>
                {i < 2 && (
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>{'\u2192'}</span>
                )}
              </div>
            ))}
          </div>
          <div style={{
            fontSize: 10, color: colors.textMuted, fontFamily: 'monospace',
            marginTop: 6, paddingLeft: 4,
          }}>
            Транзакции пересылаются заранее следующему лидеру
          </div>
        </div>

        {/* Ethereum flow (contrast) */}
        <div>
          <div style={{ fontSize: 10, color: '#8b5cf6', fontFamily: 'monospace', fontWeight: 600, marginBottom: 8 }}>
            Ethereum (для сравнения):
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Клиент', color: colors.textMuted },
              { label: 'Mempool', color: '#f59e0b' },
              { label: 'Ожидание блока...', color: '#8b5cf6' },
            ].map((node, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  ...glassStyle,
                  padding: '6px 12px', borderRadius: 6,
                  background: `${node.color}10`,
                  border: `1px solid ${node.color}30`,
                }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: node.color, fontWeight: 600 }}>
                    {node.label}
                  </span>
                </div>
                {i < 2 && (
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>{'\u2192'}</span>
                )}
              </div>
            ))}
          </div>
          <div style={{
            fontSize: 10, color: colors.textMuted, fontFamily: 'monospace',
            marginTop: 6, paddingLeft: 4,
          }}>
            Транзакции ждут в mempool, пока пропозер их не включит
          </div>
        </div>
      </div>

      {/* Key insight */}
      <DataBox
        label="Gulf Stream"
        value="Gulf Stream устраняет mempool. Транзакции отправляются напрямую текущему и следующему лидеру, что сокращает задержку подтверждения. Лидер начинает обработку до начала своих слотов."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
