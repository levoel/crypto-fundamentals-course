/** @jsxImportSource solid-js */
/**
 * Validator Diagrams (ETH-11)
 *
 * Exports:
 * - ValidatorLifecycleDiagram: Step-through interactive (history array, 6 steps)
 *   Includes Pectra changes: EIP-7251, EIP-6110, EIP-7002, reduced slashing penalty
 * - SlashingConditionsDiagram: 4 slashing conditions (static with DiagramTooltip)
 */

import { createEffect, createSignal, onCleanup } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ValidatorLifecycleDiagram (INTERACTIVE, step-through)               */
/* ================================================================== */

interface LifecycleStep {
  title: string;
  description: string;
  balance: string;
  status: string;
  statusColor: string;
  detail: string;
  pectraNote?: string;
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    title: 'Шаг 1: Депозит',
    description: 'Валидатор отправляет 32 ETH в Beacon Chain deposit contract (0x00000000219ab540356cBB839Cbe05303d7705Fa). Транзакция на Execution Layer генерирует событие DepositEvent.',
    balance: '32.000 ETH',
    status: 'DEPOSITED',
    statusColor: colors.warning,
    detail: 'Депозит должен содержать withdrawal credentials, публичный BLS-ключ и подпись. Минимум 32 ETH, максимум -- теперь до 2048 ETH.',
    pectraNote: 'EIP-7251 (Pectra): Максимальный эффективный баланс увеличен с 32 до 2048 ETH. Крупные стейкеры могут консолидировать валидаторы.',
  },
  {
    title: 'Шаг 2: Очередь активации',
    description: 'Валидатор попадает в очередь активации. Обработка депозита теперь происходит на Execution Layer, что значительно ускоряет процесс.',
    balance: '32.000 ETH',
    status: 'PENDING',
    statusColor: '#f59e0b',
    detail: 'Скорость активации зависит от длины очереди. Churn limit определяет, сколько валидаторов могут активироваться за эпоху.',
    pectraNote: 'EIP-6110 (Pectra): Обработка депозитов перенесена на Execution Layer. Активация ускорена с ~13 часов до ~13 минут.',
  },
  {
    title: 'Шаг 3: Активный валидатор',
    description: 'Валидатор активирован и выполняет обязанности: аттестация (каждую эпоху), предложение блоков (при выборе), участие в sync-комитетах.',
    balance: '32.000 ETH',
    status: 'ACTIVE',
    statusColor: '#4ade80',
    detail: 'Каждый слот (12с) валидатор аттестует head цепочки. Proposer выбирается псевдослучайно (RANDAO). Sync committee обновляется каждые ~27 часов.',
  },
  {
    title: 'Шаг 4: Награды за аттестацию',
    description: 'За правильные аттестации валидатор получает награды. Базовая награда зависит от эффективного баланса и общего стейка сети. Пропущенные аттестации приводят к штрафам.',
    balance: '32.025 ETH (+0.025)',
    status: 'ACTIVE (rewards)',
    statusColor: '#4ade80',
    detail: 'Награда = base_reward * weight / total_weight. Компоненты: source (FFG), target (FFG), head (LMD GHOST). Proposer получает дополнительную награду.',
  },
  {
    title: 'Шаг 5: Добровольный выход',
    description: 'Валидатор инициирует добровольный выход. После инициации начинается период ожидания (~27 часов), после чего средства становятся доступны для вывода.',
    balance: '32.025 ETH',
    status: 'EXITING',
    statusColor: '#f59e0b',
    detail: 'Выход можно инициировать через BLS-ключ (VoluntaryExit) или теперь через смарт-контракт на Execution Layer.',
    pectraNote: 'EIP-7002 (Pectra): Execution Layer triggerable exits. Смарт-контракты и стейкинг-пулы могут инициировать выход валидатора без BLS-ключа.',
  },
  {
    title: 'Шаг 6: Slashing (альтернативный путь)',
    description: 'Если валидатор нарушает правила протокола (двойное предложение, двойная аттестация, surround vote), он подвергается slashing: немедленный штраф + корреляционный штраф + принудительный выход.',
    balance: '31.992 ETH (-0.008)',
    status: 'SLASHED',
    statusColor: '#ef4444',
    detail: 'Начальный штраф: effective_balance / 4096 (~0.0078 ETH при 32 ETH). Корреляционный штраф через ~18 дней: пропорционален количеству slashed валидаторов в том же периоде. Выход через ~36 дней.',
    pectraNote: 'Pectra: Начальный штраф снижен с 1/32 (~1 ETH) до 1/4096 (~0.008 ETH). Это стимулирует консолидацию валидаторов (EIP-7251), уменьшая риск при крупных стейках.',
  },
];

export function ValidatorLifecycleDiagram() {
  const [step, setStep] = createSignal(0);
  const [autoPlay, setAutoPlay] = createSignal(false);
  let intervalRef: ReturnType<typeof setInterval> | null = null;

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, LIFECYCLE_STEPS.length - 1));
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleReset = () => {
    setStep(0);
    setAutoPlay(false);
  };

  createEffect(() => {
    if (autoPlay()) {
      intervalRef = setInterval(() => {
        setStep((s) => {
          if (s >= LIFECYCLE_STEPS.length - 1) {
            setAutoPlay(false);
            return s;
          }
          return s + 1;
        });
      }, 3000);
    }
    onCleanup(() => {
      if (intervalRef) clearInterval(intervalRef);
    });
  });

  const current = LIFECYCLE_STEPS[step()];

  return (
    <DiagramContainer title="Жизненный цикл валидатора Ethereum" color="purple">
      {/* Step indicators */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'justify-content': 'center', 'margin-bottom': '16px', 'flex-wrap': 'wrap' }}>
        {LIFECYCLE_STEPS.map((s, i) => {
          return (
            <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '4px' }}>
              {i === 5 && (
                <div style={{
                  'font-size': '9px',
                  'color': '#ef4444',
                  'font-weight': '600',
                  'margin-right': '2px',
                  'writing-mode': 'horizontal-tb',
                }}>
                  ALT
                </div>
              )}
              <DiagramTooltip content={LIFECYCLE_STEPS[i].description}>
                <div
                  style={{
                    'width': '30px',
                    'height': '30px',
                    'border-radius': '50%',
                    'display': 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    'font-size': '11px',
                    'font-weight': '600',
                    'background': i <= step() ? `${LIFECYCLE_STEPS[i].statusColor}30` : 'rgba(255,255,255,0.05)',
                    'border': `2px solid ${i <= step() ? LIFECYCLE_STEPS[i].statusColor : 'rgba(255,255,255,0.1)'}`,
                    'color': i <= step() ? LIFECYCLE_STEPS[i].statusColor : colors.textMuted,
                    'cursor': 'pointer',
                    'transition': 'all 0.3s',
                  }}
                  onClick={() => setStep(i)}
                >
                  {i + 1}
                </div>
              </DiagramTooltip>
              {i < 4 && (
                <div style={{
                  'width': '12px',
                  'height': '2px',
                  'background': i < step() ? LIFECYCLE_STEPS[i].statusColor : colors.border,
                  'transition': 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Status badge + balance */}
      <div style={{ 'display': 'flex', 'gap': '12px', 'justify-content': 'center', 'margin-bottom': '16px', 'flex-wrap': 'wrap' }}>
        <div style={{
          ...glassStyle,
          'padding': '6px 14px',
          'display': 'inline-flex',
          'align-items': 'center',
          'gap': '8px',
          'border-color': `${current.statusColor}40`,
        }}>
          <div style={{
            'width': '8px',
            'height': '8px',
            'border-radius': '50%',
            'background': current.statusColor,
          }} />
          <span style={{ 'font-size': '12px', 'font-weight': '700', 'color': current.statusColor, 'font-family': 'monospace' }}>
            {current.status}
          </span>
        </div>
        <DataBox label="Баланс" value={current.balance} variant="highlight" />
      </div>

      {/* Current step content */}
      <div style={{
        ...glassStyle,
        'padding': '16px',
        'border-color': `${current.statusColor}40`,
        'margin-bottom': '16px',
        'transition': 'border-color 0.3s',
      }}>
        <div style={{
          'font-size': '14px',
          'font-weight': '700',
          'color': current.statusColor,
          'margin-bottom': '8px',
        }}>
          {current.title}
        </div>
        <div style={{ 'font-size': '12px', 'color': colors.textMuted, 'margin-bottom': '12px', 'line-height': '1.6' }}>
          {current.description}
        </div>

        {/* Technical detail */}
        <div style={{
          'padding': '8px 12px',
          'background': 'rgba(255,255,255,0.03)',
          'border-radius': '6px',
          'margin-bottom': current.pectraNote ? 12 : 0,
          'font-size': '12px',
          'color': colors.text,
          'line-height': '1.6',
          'font-family': 'monospace',
        }}>
          {current.detail}
        </div>

        {/* Pectra upgrade note */}
        {current.pectraNote && (
          <div style={{
            'padding': '8px 12px',
            'background': `${colors.accent}10`,
            'border': `1px solid ${colors.accent}30`,
            'border-radius': '6px',
            'font-size': '12px',
            'color': colors.accent,
            'line-height': '1.6',
          }}>
            <strong>Pectra (май 2025):</strong> {current.pectraNote.replace(/^.*Pectra\)?:\s*/, '')}
          </div>
        )}
      </div>

      {/* Visual flow */}
      <div style={{
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'gap': '2px',
        'flex-wrap': 'wrap',
        'margin-bottom': '16px',
      }}>
        {['Депозит', 'Очередь', 'Активный', 'Награды', 'Выход'].map((label, i) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '2px' }}>
            <div style={{
              'padding': '4px 8px',
              'border-radius': '6px',
              'font-size': '10px',
              'font-weight': '600',
              'background': i <= step() && step() < 5 ? `${LIFECYCLE_STEPS[Math.min(i, 4)].statusColor}20` : 'rgba(255,255,255,0.05)',
              'border': `1px solid ${i <= step() && step() < 5 ? LIFECYCLE_STEPS[Math.min(i, 4)].statusColor + '40' : 'rgba(255,255,255,0.1)'}`,
              'color': i <= step() && step() < 5 ? LIFECYCLE_STEPS[Math.min(i, 4)].statusColor : colors.textMuted,
              'transition': 'all 0.3s',
            }}>
              {label}
            </div>
            {i < 4 && (
              <span style={{ 'color': colors.border, 'font-size': '10px' }}>→</span>
            )}
          </div>
        ))}
        {step() === 5 && (
          <>
            <span style={{ 'color': '#ef4444', 'font-size': '10px', 'margin-left': '8px' }}>|</span>
            <div style={{
              'padding': '4px 8px',
              'border-radius': '6px',
              'font-size': '10px',
              'font-weight': '700',
              'background': 'rgba(239,68,68,0.2)',
              'border': '1px solid rgba(239,68,68,0.4)',
              'color': '#ef4444',
            }}>
              SLASHED
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center' }}>
        <button
          onClick={handleReset}
          style={{
            ...glassStyle,
            'padding': '8px 16px',
            'cursor': 'pointer',
            'font-size': '12px',
            'color': colors.textMuted,
            'border': '1px solid rgba(255,255,255,0.1)',
            'background': 'rgba(255,255,255,0.05)',
          }}
        >
          Сброс
        </button>
        <button
          onClick={handlePrev}
          disabled={step() <= 0}
          style={{
            ...glassStyle,
            'padding': '8px 16px',
            'cursor': step() <= 0 ? 'default' : 'pointer',
            'font-size': '12px',
            'color': step() <= 0 ? colors.textMuted : colors.accent,
            'border': `1px solid ${step() <= 0 ? 'rgba(255,255,255,0.1)' : colors.accent}`,
            'background': step() <= 0 ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
            'opacity': step() <= 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={handleNext}
          disabled={step() >= LIFECYCLE_STEPS.length - 1}
          style={{
            ...glassStyle,
            'padding': '8px 16px',
            'cursor': step() >= LIFECYCLE_STEPS.length - 1 ? 'default' : 'pointer',
            'font-size': '12px',
            'color': step() >= LIFECYCLE_STEPS.length - 1 ? colors.textMuted : colors.primary,
            'border': `1px solid ${step() >= LIFECYCLE_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.primary}`,
            'background': step() >= LIFECYCLE_STEPS.length - 1 ? 'rgba(255,255,255,0.03)' : `${colors.primary}15`,
            'opacity': step() >= LIFECYCLE_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
        <button
          onClick={() => {
            if (step() >= LIFECYCLE_STEPS.length - 1) setStep(0);
            setAutoPlay(!autoPlay());
          }}
          style={{
            ...glassStyle,
            'padding': '8px 16px',
            'cursor': 'pointer',
            'font-size': '12px',
            'color': autoPlay() ? colors.warning : colors.success,
            'border': `1px solid ${autoPlay() ? colors.warning : colors.success}`,
            'background': `${autoPlay() ? colors.warning : colors.success}15`,
          }}
        >
          {autoPlay() ? 'Стоп' : 'Авто'}
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SlashingConditionsDiagram                                           */
/* ================================================================== */

interface SlashingCondition {
  name: string;
  description: string;
  visual: string;
  severity: string;
  example: string;
  color: string;
}

const SLASHING_CONDITIONS: SlashingCondition[] = [
  {
    name: 'Double Proposal',
    description: 'Валидатор предлагает два разных блока для одного и того же слота.',
    visual: 'Slot 100: Block A и Block B',
    severity: 'Начальный штраф + корреляционный штраф',
    example: 'Proposer пытается создать форк, предлагая два конкурирующих блока.',
    color: '#ef4444',
  },
  {
    name: 'LMD GHOST Double Vote',
    description: 'Валидатор аттестует два разных head блока для одного и того же слота (целевой эпохи).',
    visual: 'Slot 100: Attest Block A и Attest Block B',
    severity: 'Начальный штраф + корреляционный штраф',
    example: 'Валидатор голосует за два разных head в рамках одного слота.',
    color: '#f97316',
  },
  {
    name: 'FFG Surround Vote',
    description: 'Аттестация (source → target) окружает другую аттестацию того же валидатора: source1 < source2 < target2 < target1.',
    visual: 'Vote 1: [2 → 6] окружает Vote 2: [3 → 5]',
    severity: 'Наиболее серьезное нарушение',
    example: 'Валидатор пытается "откатить" финализацию, голосуя за более широкий диапазон, содержащий предыдущий.',
    color: '#dc2626',
  },
  {
    name: 'FFG Double Vote',
    description: 'Валидатор создает две аттестации с разными target для одной и той же эпохи (одинаковый target epoch, разные target root).',
    visual: 'Epoch 5: Target A и Target B',
    severity: 'Начальный штраф + корреляционный штраф',
    example: 'Валидатор голосует за два разных checkpoint в одной целевой эпохе.',
    color: '#ef4444',
  },
];

export function SlashingConditionsDiagram() {
  return (
    <DiagramContainer title="4 условия слешинга (Slashing Conditions)" color="red">
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '10px' }}>
        {SLASHING_CONDITIONS.map((cond, i) => (
          <DiagramTooltip content={cond.description}>
            <div
              style={{
                ...glassStyle,
                'padding': '14px',
                'border-color': `${cond.color}20`,
                'background': 'rgba(255,255,255,0.02)',
                'transition': 'all 0.2s',
                'cursor': 'default',
              }}
            >
              <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '10px', 'margin-bottom': '8px' }}>
                {/* Number badge */}
                <div style={{
                  'width': '28px',
                  'height': '28px',
                  'border-radius': '50%',
                  'background': `${cond.color}25`,
                  'border': `2px solid ${cond.color}`,
                  'display': 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                  'font-size': '12px',
                  'font-weight': '700',
                  'color': cond.color,
                  'flex-shrink': '0',
                }}>
                  {i + 1}
                </div>

                {/* Title */}
                <div style={{ 'flex': '1' }}>
                  <div style={{ 'font-size': '13px', 'font-weight': '700', 'color': cond.color }}>
                    {cond.name}
                  </div>
                  <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'margin-top': '2px' }}>
                    {cond.description}
                  </div>
                </div>
              </div>

              {/* Visual representation */}
              <div style={{
                'padding': '6px 10px',
                'background': `${cond.color}10`,
                'border': `1px solid ${cond.color}25`,
                'border-radius': '6px',
                'font-family': 'monospace',
                'font-size': '11px',
                'color': cond.color,
                'margin-bottom': '6px',
              }}>
                {cond.visual}
              </div>

              {/* Always-visible details */}
              <div style={{
                'font-size': '11px',
                'color': colors.textMuted,
                'line-height': '1.5',
                'padding-top': '6px',
                'border-top': `1px solid ${cond.color}15`,
              }}>
                <div><strong style={{ 'color': colors.text }}>Пример:</strong> {cond.example}</div>
                <div style={{ 'margin-top': '4px' }}><strong style={{ 'color': cond.color }}>Наказание:</strong> {cond.severity}</div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Penalty mechanics summary */}
      <div style={{
        'margin-top': '16px',
        ...glassStyle,
        'padding': '12px 14px',
        'border-color': `${colors.danger}20`,
      }}>
        <div style={{ 'font-size': '13px', 'font-weight': '700', 'color': colors.danger, 'margin-bottom': '8px' }}>
          Механика наказания (Pectra)
        </div>
        <div style={{ 'display': 'flex', 'gap': '8px', 'flex-wrap': 'wrap' }}>
          <DataBox
            label="Начальный штраф"
            value="balance / 4096 (~0.008 ETH)"
            variant="default"
          />
          <DataBox
            label="Было до Pectra"
            value="balance / 32 (~1 ETH)"
            variant="default"
          />
          <DataBox
            label="Корреляционный штраф"
            value="до 100% при массовом slashing"
            variant="default"
          />
        </div>
        <div style={{
          'margin-top': '10px',
          'font-size': '11px',
          'color': colors.textMuted,
          'line-height': '1.6',
        }}>
          Корреляционный штраф рассчитывается через ~18 дней: чем больше валидаторов нарушили правила в тот же период, тем выше штраф (до полной конфискации стейка). Принудительный выход через ~36 дней.
        </div>
      </div>
    </DiagramContainer>
  );
}
