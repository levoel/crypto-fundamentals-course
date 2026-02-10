/**
 * Tower BFT Diagrams (SOL-03)
 *
 * Exports:
 * - VoteTowerDiagram: Vote tower lockout visualization (interactive, step-through with history array)
 * - LeaderScheduleDiagram: Leader schedule + Gulf Stream flow (static with DiagramTooltip)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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

/** Tooltip for each vote level box explaining exponential lockout */
function voteLevelTooltip(vote: VoteEntry, depth: number): string {
  if (depth === 0) {
    return `Слот ${vote.slot} — самый новый голос в башне. Lockout = ${vote.lockout} слотов: валидатор не может переголосовать за другой форк в течение ${vote.lockout} слотов. При добавлении нового голоса этот lockout удвоится.`;
  }
  return `Слот ${vote.slot} — глубина ${depth} в башне. Lockout = ${vote.lockout} (2^${vote.confirmations}) слотов. Для отката этого голоса валидатор должен ждать ${vote.lockout} слотов без подтверждений. Экспоненциальный рост lockout делает откат экономически невыгодным.`;
}

/** Tooltip content for confirmation level cards */
const CONFIRMATION_TOOLTIPS: Record<string, string> = {
  'Processed': 'Оптимистическое подтверждение: лидер обработал транзакцию и включил в блок. Lockout минимален, транзакция может быть отменена при переключении форка. Используйте для UI-обновлений, но не для критичных операций.',
  'Confirmed (optimistic)': 'Подтверждено 2/3 стейка: супербольшинство валидаторов проголосовали за слот. Откат требует координации сверхбольшинства и потери значительного стейка. Подходит для большинства приложений.',
  'Finalized (rooted)': 'Финализировано: голос получил 31+ подтверждений, lockout достиг максимума (2^31 слотов). Откат практически невозможен — потребуется сжечь стейк 2/3 валидаторов. Эквивалент финализации в Ethereum.',
};

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
            <DiagramTooltip content="Пустая башня голосований. Валидатор ещё не участвовал в консенсусе. После первого голоса начнётся экспоненциальный механизм lockout.">
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
            </DiagramTooltip>
          ) : (
            /* Render votes from top (newest) to bottom (oldest) */
            [...currentStep.votes].reverse().map((vote, visualIdx) => {
              const depth = currentStep.votes.length - 1 - visualIdx; // 0 = newest, length-1 = oldest
              const total = currentStep.votes.length;
              const bgColor = voteColor(depth, total);
              const isNewest = visualIdx === 0;

              return (
                <DiagramTooltip key={vote.slot} content={voteLevelTooltip(vote, depth)}>
                  <div
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
                </DiagramTooltip>
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
            <DiagramTooltip key={item.level} content={CONFIRMATION_TOOLTIPS[item.level]}>
              <div
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
            </DiagramTooltip>
          ))}
        </div>
      )}

      {/* Message */}
      {currentStep.message && (
        <DiagramTooltip content="Пошаговое описание механизма Tower BFT. Каждый голос увеличивает lockout предыдущих, создавая экспоненциально растущую стоимость отката.">
          <DataBox
            label={`Шаг ${step + 1} из ${steps.length}`}
            value={currentStep.message}
            variant="highlight"
          />
        </DiagramTooltip>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <DiagramTooltip content="Сброс к начальному состоянию — пустой башне голосований.">
          <div>
            <button
              onClick={() => setStep(0)}
              style={btnStyle(step > 0, colors.text)}
              disabled={step === 0}
            >
              Сброс
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Вернуться к предыдущему шагу и увидеть башню с меньшим количеством голосов.">
          <div>
            <button
              onClick={() => canBack && setStep((s) => s - 1)}
              disabled={!canBack}
              style={btnStyle(canBack, colors.text)}
            >
              Назад
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Добавить следующий голос в башню и увидеть удвоение lockout.">
          <div>
            <button
              onClick={() => canForward && setStep((s) => s + 1)}
              disabled={!canForward}
              style={btnStyle(canForward, '#a855f7')}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
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

/** Tooltip for slot timeline elements */
function slotTooltip(slotIdx: number, leader: Leader | undefined): string {
  if (!leader) return `Слот ${slotIdx} — не назначен лидеру.`;
  const isFirst = slotIdx === leader.startSlot;
  if (isFirst) {
    return `Слот ${slotIdx} — начало ротации ${leader.label}. Каждый лидер получает 4 последовательных слота (~1.6 секунды), в течение которых производит блоки. Расписание вычисляется детерминированно из распределения стейка.`;
  }
  return `Слот ${slotIdx} — продолжение ротации ${leader.label}. Лидер производит блок каждые ~400мс (1 слот). За 4 слота обрабатываются тысячи транзакций.`;
}

export function LeaderScheduleDiagram() {
  return (
    <DiagramContainer title="Расписание лидеров и Gulf Stream" color="blue">
      {/* Epoch / slot timeline */}
      <DiagramTooltip content="Расписание лидеров детерминированно вычисляется из стейка валидаторов на каждую эпоху. Валидатор с 1% стейка получает ~1% слотов для производства блоков, что обеспечивает справедливое распределение.">
        <div
          style={{
            ...glassStyle,
            padding: 16,
            borderRadius: 10,
            marginBottom: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
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
                <DiagramTooltip key={i} content={slotTooltip(i, leader)}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
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
                </DiagramTooltip>
              );
            })}
          </div>
        </div>
      </DiagramTooltip>

      {/* Gulf Stream flow */}
      <DiagramTooltip content="Gulf Stream -- протокол пересылки транзакций, который направляет транзакции напрямую следующему лидеру в расписании, минуя традиционный мемпул. Это снижает задержку подтверждения и уменьшает нагрузку на сеть.">
        <div
          style={{
            ...glassStyle,
            padding: 16,
            borderRadius: 10,
            marginBottom: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
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
                { label: 'Клиент', color: colors.text, tooltip: 'Клиент отправляет транзакцию напрямую текущему лидеру, минуя мемпул. Это возможно благодаря тому, что расписание лидеров известно заранее.' },
                { label: 'Текущий лидер', color: '#22c55e', tooltip: 'Текущий лидер получает транзакцию и включает её в блок. Одновременно пересылает (forwards) транзакцию следующему лидеру на случай, если текущий слот завершится.' },
                { label: 'Следующий лидер', color: '#3b82f6', tooltip: 'Следующий лидер в расписании получает транзакцию заранее через Gulf Stream. Если текущий лидер не успел её обработать, следующий подхватит без задержки.' },
              ].map((node, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DiagramTooltip content={node.tooltip}>
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
                  </DiagramTooltip>
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
                { label: 'Клиент', color: colors.textMuted, tooltip: 'В Ethereum клиент отправляет транзакцию в сеть, где она попадает в мемпул — общую очередь ожидающих транзакций.' },
                { label: 'Mempool', color: '#f59e0b', tooltip: 'Мемпул — пул ожидающих транзакций. Транзакции ждут, пока пропозер не включит их в блок. Это создаёт задержку и позволяет MEV-ботам манипулировать порядком.' },
                { label: 'Ожидание блока...', color: '#8b5cf6', tooltip: 'В Ethereum блоки производятся каждые ~12 секунд. Транзакция может ждать один или несколько блоков до включения, что создаёт значительную задержку по сравнению с Solana (~400мс).' },
              ].map((node, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DiagramTooltip content={node.tooltip}>
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
                  </DiagramTooltip>
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
      </DiagramTooltip>

      {/* Key insight */}
      <DiagramTooltip content="Gulf Stream позволяет Solana достигать пропускной способности до 65,000 TPS, минуя традиционный мемпул. Транзакции поступают напрямую к лидеру, что минимизирует задержку и исключает необходимость глобальной синхронизации мемпула.">
        <DataBox
          label="Gulf Stream"
          value="Gulf Stream устраняет mempool. Транзакции отправляются напрямую текущему и следующему лидеру, что сокращает задержку подтверждения. Лидер начинает обработку до начала своих слотов."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
