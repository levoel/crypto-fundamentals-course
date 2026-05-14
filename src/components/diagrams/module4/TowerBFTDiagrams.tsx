/** @jsxImportSource solid-js */
/**
 * Tower BFT Diagrams (SOL-03)
 *
 * Exports:
 * - VoteTowerDiagram: Vote tower lockout visualization (interactive, step-through with history array)
 * - LeaderScheduleDiagram: Leader schedule + Gulf Stream flow (static with DiagramTooltip)
 */

import { createSignal, type JSX } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared button style                                                */
/* ================================================================== */

function btnStyle(active: boolean, accentColor: string): JSX.CSSProperties {
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
  const [step, setStep] = createSignal(0);
  const steps = buildTowerSteps();
  const currentStep = steps[step()];

  const canBack = step() > 0;
  const canForward = step() < steps.length - 1;

  // Color gradient: deeper votes = darker green
  const voteColor = (depth: number, total: number): string => {
    const alpha = 0.3 + (depth / Math.max(total, 1)) * 0.5;
    return `rgba(34,197,94,${alpha})`;
  };

  return (
    <DiagramContainer title="Tower BFT: башня голосований" color="purple">
      {/* Vote tower visualization */}
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '16px' }}>
        <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '6px', 'width': '100%', 'max-width': '420px' }}>
          {currentStep.votes.length === 0 ? (
            <DiagramTooltip content="Пустая башня голосований. Валидатор ещё не участвовал в консенсусе. После первого голоса начнётся экспоненциальный механизм lockout.">
              <div style={{
                ...glassStyle,
                'padding': '24px 16px',
                'border-radius': '8px',
                'text-align': 'center',
                'background': 'rgba(255,255,255,0.03)',
                'border': '1px dashed rgba(255,255,255,0.15)',
              }}>
                <span style={{ 'font-size': '12px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
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
                <DiagramTooltip content={voteLevelTooltip(vote, depth)}>
                  <div
                    style={{
                      ...glassStyle,
                      'padding': '10px 16px',
                      'border-radius': '8px',
                      'background': bgColor,
                      'border': `1px solid rgba(34,197,94,${0.2 + depth * 0.1})`,
                      'display': 'flex',
                      'justify-content': 'space-between',
                      'align-items': 'center',
                    }}
                  >
                    <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '10px' }}>
                      <span style={{
                        'font-size': '12px', 'font-family': 'monospace', 'font-weight': '700',
                        'color': '#22c55e',
                      }}>
                        Slot {vote.slot}
                      </span>
                      {isNewest && (
                        <span style={{
                          'font-size': '9px', 'font-family': 'monospace',
                          'color': colors.primary,
                          'background': `${colors.primary}20`,
                          'padding': '1px 6px', 'border-radius': '3px',
                        }}>
                          НОВЫЙ
                        </span>
                      )}
                    </div>
                    <div style={{ 'display': 'flex', 'gap': '16px' }}>
                      <div style={{ 'text-align': 'center' }}>
                        <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace' }}>lockout</div>
                        <div style={{ 'font-size': '14px', 'font-family': 'monospace', 'font-weight': '700', 'color': colors.text }}>
                          {vote.lockout}
                        </div>
                      </div>
                      <div style={{ 'text-align': 'center' }}>
                        <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace' }}>confirms</div>
                        <div style={{ 'font-size': '14px', 'font-family': 'monospace', 'font-weight': '700', 'color': colors.text }}>
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
        <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '8px', 'margin-bottom': '12px' }}>
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
            <DiagramTooltip content={CONFIRMATION_TOOLTIPS[item.level]}>
              <div
                style={{
                  ...glassStyle,
                  'padding': '10px 14px',
                  'border-radius': '8px',
                  'background': `${item.color}08`,
                  'border': `1px solid ${item.color}25`,
                }}
              >
                <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px', 'margin-bottom': '4px' }}>
                  <div style={{
                    'width': '8px', 'height': '8px', 'border-radius': '50%',
                    'background': item.color,
                  }} />
                  <span style={{ 'font-size': '12px', 'font-family': 'monospace', 'font-weight': '700', 'color': item.color }}>
                    {item.level}
                  </span>
                  <span style={{ 'font-size': '11px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
                    -- {item.desc}
                  </span>
                </div>
                <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'font-family': 'monospace', 'padding-left': '16px', 'line-height': '1.4' }}>
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
            label={`Шаг ${step() + 1} из ${steps.length}`}
            value={currentStep.message}
            variant="highlight"
          />
        </DiagramTooltip>
      )}

      {/* Controls */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center', 'margin-top': '12px' }}>
        <DiagramTooltip content="Сброс к начальному состоянию — пустой башне голосований.">
          <div>
            <button
              onClick={() => setStep(0)}
              style={btnStyle(step() > 0, colors.text)}
              disabled={step() === 0}
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
            'padding': '16px',
            'border-radius': '10px',
            'margin-bottom': '12px',
            'background': 'rgba(255,255,255,0.05)',
            'border': '1px solid rgba(255,255,255,0.08)',
            'transition': 'all 0.15s',
            'cursor': 'default',
          }}
        >
          <div style={{
            'font-size': '11px', 'font-family': 'monospace', 'font-weight': '700',
            'color': '#3b82f6', 'margin-bottom': '10px',
          }}>
            Epoch = 432,000 слотов (~2-3 дня). Каждый лидер получает 4 слота (~1.6s).
          </div>

          {/* Leader legend */}
          <div style={{ 'display': 'flex', 'gap': '12px', 'margin-bottom': '10px', 'flex-wrap': 'wrap' }}>
            {LEADERS.map((leader) => (
              <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px' }}>
                <div style={{
                  'width': '10px', 'height': '10px', 'border-radius': '3px',
                  'background': leader.color, 'opacity': '0.7',
                }} />
                <span style={{ 'font-size': '11px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
                  {leader.label}
                </span>
              </div>
            ))}
          </div>

          {/* Slot timeline */}
          <div style={{ 'display': 'flex', 'gap': '3px', 'overflow-x': 'auto' }}>
            {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
              const leader = LEADERS.find((l) => i >= l.startSlot && i <= l.endSlot);
              const leaderColor = leader?.color || colors.textMuted;
              const isFirstInGroup = leader && i === leader.startSlot;

              return (
                <DiagramTooltip content={slotTooltip(i, leader)}>
                  <div style={{ 'display': 'flex', 'flex-direction': 'column', 'align-items': 'center', 'gap': '4px' }}>
                    <div style={{
                      ...glassStyle,
                      'width': '40px', 'height': '36px',
                      'border-radius': '4px',
                      'display': 'flex', 'align-items': 'center', 'justify-content': 'center',
                      'background': `${leaderColor}15`,
                      'border': `1px solid ${leaderColor}30`,
                      'border-left': isFirstInGroup ? `3px solid ${leaderColor}` : undefined,
                    }}>
                      <span style={{ 'font-size': '10px', 'font-family': 'monospace', 'color': leaderColor, 'font-weight': '600' }}>
                        {i}
                      </span>
                    </div>
                    {isFirstInGroup && (
                      <span style={{ 'font-size': '8px', 'font-family': 'monospace', 'color': leaderColor }}>
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
            'padding': '16px',
            'border-radius': '10px',
            'margin-bottom': '12px',
            'background': 'rgba(255,255,255,0.05)',
            'border': '1px solid rgba(255,255,255,0.08)',
            'transition': 'all 0.15s',
            'cursor': 'default',
          }}
        >
          <div style={{
            'font-size': '11px', 'font-family': 'monospace', 'font-weight': '700',
            'color': '#22c55e', 'margin-bottom': '12px',
          }}>
            Gulf Stream: транзакции без mempool
          </div>

          {/* Solana flow */}
          <div style={{ 'margin-bottom': '16px' }}>
            <div style={{ 'font-size': '10px', 'color': '#22c55e', 'font-family': 'monospace', 'font-weight': '600', 'margin-bottom': '8px' }}>
              Solana:
            </div>
            <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px', 'flex-wrap': 'wrap' }}>
              {[
                { label: 'Клиент', color: colors.text, tooltip: 'Клиент отправляет транзакцию напрямую текущему лидеру, минуя мемпул. Это возможно благодаря тому, что расписание лидеров известно заранее.' },
                { label: 'Текущий лидер', color: '#22c55e', tooltip: 'Текущий лидер получает транзакцию и включает её в блок. Одновременно пересылает (forwards) транзакцию следующему лидеру на случай, если текущий слот завершится.' },
                { label: 'Следующий лидер', color: '#3b82f6', tooltip: 'Следующий лидер в расписании получает транзакцию заранее через Gulf Stream. Если текущий лидер не успел её обработать, следующий подхватит без задержки.' },
              ].map((node, i) => (
                <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px' }}>
                  <DiagramTooltip content={node.tooltip}>
                    <div style={{
                      ...glassStyle,
                      'padding': '6px 12px', 'border-radius': '6px',
                      'background': `${node.color}10`,
                      'border': `1px solid ${node.color}30`,
                    }}>
                      <span style={{ 'font-size': '11px', 'font-family': 'monospace', 'color': node.color, 'font-weight': '600' }}>
                        {node.label}
                      </span>
                    </div>
                  </DiagramTooltip>
                  {i < 2 && (
                    <span style={{ 'font-size': '12px', 'color': colors.textMuted, 'font-family': 'monospace' }}>{'\u2192'}</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace',
              'margin-top': '6px', 'padding-left': '4px',
            }}>
              Транзакции пересылаются заранее следующему лидеру
            </div>
          </div>

          {/* Ethereum flow (contrast) */}
          <div>
            <div style={{ 'font-size': '10px', 'color': '#8b5cf6', 'font-family': 'monospace', 'font-weight': '600', 'margin-bottom': '8px' }}>
              Ethereum (для сравнения):
            </div>
            <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px', 'flex-wrap': 'wrap' }}>
              {[
                { label: 'Клиент', color: colors.textMuted, tooltip: 'В Ethereum клиент отправляет транзакцию в сеть, где она попадает в мемпул — общую очередь ожидающих транзакций.' },
                { label: 'Mempool', color: '#f59e0b', tooltip: 'Мемпул — пул ожидающих транзакций. Транзакции ждут, пока пропозер не включит их в блок. Это создаёт задержку и позволяет MEV-ботам манипулировать порядком.' },
                { label: 'Ожидание блока...', color: '#8b5cf6', tooltip: 'В Ethereum блоки производятся каждые ~12 секунд. Транзакция может ждать один или несколько блоков до включения, что создаёт значительную задержку по сравнению с Solana (~400мс).' },
              ].map((node, i) => (
                <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px' }}>
                  <DiagramTooltip content={node.tooltip}>
                    <div style={{
                      ...glassStyle,
                      'padding': '6px 12px', 'border-radius': '6px',
                      'background': `${node.color}10`,
                      'border': `1px solid ${node.color}30`,
                    }}>
                      <span style={{ 'font-size': '11px', 'font-family': 'monospace', 'color': node.color, 'font-weight': '600' }}>
                        {node.label}
                      </span>
                    </div>
                  </DiagramTooltip>
                  {i < 2 && (
                    <span style={{ 'font-size': '12px', 'color': colors.textMuted, 'font-family': 'monospace' }}>{'\u2192'}</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace',
              'margin-top': '6px', 'padding-left': '4px',
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
