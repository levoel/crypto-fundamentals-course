/** @jsxImportSource solid-js */
/**
 * Stablecoin Diagrams (DEFI-10)
 *
 * Exports:
 * - StablecoinComparisonDiagram: 4 stablecoin types comparison table (DiagramTooltip)
 * - MakerDAOCDPDiagram: MakerDAO/Sky CDP mechanism step-through (6 steps, history array)
 * - USTDeathSpiralDiagram: UST/LUNA collapse visualization (DiagramTooltip)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  StablecoinComparisonDiagram                                         */
/* ================================================================== */

interface StablecoinType {
  type: string;
  examples: string;
  mechanism: string;
  risk: string;
  decentralization: string;
  color: string;
  status: 'active' | 'collapsed' | 'experimental';
  tooltip: string;
}

const STABLECOIN_TYPES: StablecoinType[] = [
  {
    type: 'Fiat-backed',
    examples: 'USDT, USDC',
    mechanism: '1:1 банковские резервы в долларах и казначейских облигациях',
    risk: 'Counterparty risk, регуляторный риск (заморозка адресов)',
    decentralization: 'Централизованные',
    color: colors.success,
    status: 'active',
    tooltip: 'Fiat-backed (USDT, USDC): 1:1 обеспечен фиатом на банковском счёте. Централизован, но самый стабильный peg. Риск: counterparty risk (банк, эмитент).',
  },
  {
    type: 'Crypto-collateralized',
    examples: 'DAI/USDS (MakerDAO/Sky)',
    mechanism: 'Over-collateralized CDPs (150%+). Залог в ETH, WBTC и др.',
    risk: 'Smart contract risk, oracle risk, каскад ликвидаций',
    decentralization: 'Децентрализованные',
    color: colors.primary,
    status: 'active',
    tooltip: 'Crypto-backed (DAI): обеспечен криптоактивами с overcollateralization (150%+). Децентрализован, но менее эффективен по капиталу. Риск: каскадная ликвидация.',
  },
  {
    type: 'Algorithmic',
    examples: 'UST (COLLAPSED)',
    mechanism: 'Mint/burn с LUNA для поддержания привязки. Нет внешнего залога.',
    risk: 'Death spiral (доказано фатально). $40B потеряно (май 2022)',
    decentralization: 'Децентрализованные (провал)',
    color: '#ef4444',
    status: 'collapsed',
    tooltip: 'Algorithmic (UST/LUNA): поддержка peg через mint/burn механизм. Не требует collateral. Риск: death spiral при потере доверия (UST крах: $40B+ потерь).',
  },
  {
    type: 'Hybrid',
    examples: 'FRAX',
    mechanism: 'Частичный залог + алгоритмическая часть. Адаптивное соотношение.',
    risk: 'Сниженный risk death spiral, более сложная модель',
    decentralization: 'Полу-децентрализованные',
    color: '#f59e0b',
    status: 'experimental',
    tooltip: 'Hybrid (FRAX): частичный залог + алгоритмическая стабилизация. Компромисс между эффективностью капитала и безопасностью. Адаптивное collateral ratio.',
  },
];

const COLUMN_HEADERS = ['Тип', 'Примеры', 'Механизм', 'Риски', 'Децентрализация'];

/**
 * StablecoinComparisonDiagram
 *
 * HTML comparison table of 4 stablecoin types. DiagramTooltip on first column.
 */
export function StablecoinComparisonDiagram() {
  return (
    <DiagramContainer title="Классификация стейблкоинов" color="blue">
      {/* Table header */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '120px 130px 1fr 1fr 120px',
        'gap': '1px',
        'margin-bottom': '1px',
      }}>
        {COLUMN_HEADERS.map((h) => (
          <div style={{
            ...glassStyle,
            'padding': '8px 10px',
            'font-size': '11px',
            'font-weight': '600',
            'color': colors.textMuted,
            'text-align': 'center',
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* Table rows */}
      {STABLECOIN_TYPES.map((row, i) => {
        const isCollapsed = row.status === 'collapsed';

        return (
          <div
            style={{
              'display': 'grid',
              'grid-template-columns': '120px 130px 1fr 1fr 120px',
              'gap': '1px',
              'margin-bottom': '1px',
              'opacity': isCollapsed ? 0.7 : 1,
              'transition': 'all 0.2s',
            }}
          >
            <div style={{
              ...glassStyle,
              'padding': '8px 10px',
              'font-size': '12px',
              'font-weight': '600',
              'font-family': 'monospace',
              'color': colors.text,
              'background': 'rgba(255,255,255,0.02)',
              'transition': 'all 0.2s',
              'text-decoration': isCollapsed ? 'line-through' : 'none',
            }}>
              <DiagramTooltip content={row.tooltip}>
                <span>{row.type}</span>
              </DiagramTooltip>
            </div>
            <div style={{
              ...glassStyle,
              'padding': '8px 10px',
              'font-size': '11px',
              'font-family': 'monospace',
              'color': colors.textMuted,
              'background': 'rgba(255,255,255,0.02)',
              'transition': 'all 0.2s',
              'line-height': '1.4',
              'text-decoration': isCollapsed ? 'line-through' : 'none',
            }}>
              {row.examples}
            </div>
            <div style={{
              ...glassStyle,
              'padding': '8px 10px',
              'font-size': '11px',
              'color': colors.textMuted,
              'background': 'rgba(255,255,255,0.02)',
              'transition': 'all 0.2s',
              'line-height': '1.4',
            }}>
              {row.mechanism}
            </div>
            <div style={{
              ...glassStyle,
              'padding': '8px 10px',
              'font-size': '11px',
              'color': colors.textMuted,
              'background': 'rgba(255,255,255,0.02)',
              'transition': 'all 0.2s',
              'line-height': '1.4',
            }}>
              {row.risk}
            </div>
            <div style={{
              ...glassStyle,
              'padding': '8px 10px',
              'font-size': '11px',
              'color': colors.textMuted,
              'background': 'rgba(255,255,255,0.02)',
              'transition': 'all 0.2s',
              'text-align': 'center',
            }}>
              {row.decentralization}
            </div>
          </div>
        );
      })}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MakerDAOCDPDiagram                                                  */
/* ================================================================== */

interface CDPStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const CDP_HISTORY: CDPStep[] = [
  {
    title: 'Sky Protocol (ранее MakerDAO)',
    description: 'В сентябре 2024 MakerDAO провел ребрендинг в Sky Protocol. DAI продолжает существовать, USDS -- обновленная версия (1:1 к DAI). MKR конвертируется в SKY (1:24,000). Механизм CDP остался прежним.',
    values: [
      { label: 'Старое имя', value: 'MakerDAO', color: colors.textMuted },
      { label: 'Новое имя', value: 'Sky Protocol', color: colors.primary },
      { label: 'DAI -> USDS', value: '1:1 конвертация', color: colors.success },
      { label: 'MKR -> SKY', value: '1:24,000', color: '#f59e0b' },
    ],
    highlight: 'rebrand',
  },
  {
    title: 'Шаг 1: Депозит залога',
    description: 'Пользователь депонирует 1 ETH ($2,000) в Vault (ранее CDP -- Collateralized Debt Position). Залог блокируется в смарт-контракте. Минимальный collateralization ratio: 150%.',
    values: [
      { label: 'Залог', value: '1 ETH ($2,000)', color: colors.primary },
      { label: 'Min ratio', value: '150%', color: '#f59e0b' },
      { label: 'Max DAI', value: '$1,333', color: colors.success },
      { label: 'Долг', value: '0 DAI', color: colors.textMuted },
    ],
    highlight: 'deposit',
  },
  {
    title: 'Шаг 2: Минтинг DAI',
    description: 'Пользователь минтит 1,000 DAI. Это долг, обеспеченный залогом в ETH. За долг начисляется Stability Fee (процентная ставка), установленная governance (MKR/SKY holders).',
    values: [
      { label: 'Залог', value: '$2,000 (1 ETH)', color: colors.primary },
      { label: 'Долг', value: '1,000 DAI', color: '#ef4444' },
      { label: 'Ratio', value: '200%', color: colors.success },
      { label: 'Stability Fee', value: '~5% годовых', color: '#f59e0b' },
    ],
    highlight: 'mint',
  },
  {
    title: 'Шаг 3: Здоровый Vault',
    description: 'Текущий collateralization ratio: $2,000 / $1,000 = 200%. Это выше минимума (150%), vault здоров. Пользователь может вернуть DAI + fee и получить ETH обратно в любой момент.',
    values: [
      { label: 'Залог', value: '$2,000 (1 ETH)', color: colors.primary },
      { label: 'Долг', value: '1,000 DAI', color: '#ef4444' },
      { label: 'Ratio', value: '200% (healthy)', color: colors.success },
      { label: 'Liquidation at', value: '<150%', color: '#f59e0b' },
    ],
    highlight: 'healthy',
  },
  {
    title: 'Шаг 4: Цена падает (160%)',
    description: 'ETH падает до $1,600. Ratio: $1,600 / $1,000 = 160%. Все еще выше 150%, но уже близко к опасной зоне. Пользователь может добавить залог или вернуть часть DAI.',
    values: [
      { label: 'Залог', value: '$1,600 (1 ETH)', color: '#f59e0b' },
      { label: 'Долг', value: '1,000 DAI', color: '#ef4444' },
      { label: 'Ratio', value: '160% (warning)', color: '#f59e0b' },
      { label: 'До ликвидации', value: '$100 (ETH -> $1,500)', color: '#ef4444' },
    ],
    highlight: 'warning',
  },
  {
    title: 'Шаг 5: Ликвидация (140%)',
    description: 'ETH падает до $1,400. Ratio: $1,400 / $1,000 = 140% < 150%. Vault ликвидируется! Кипер (бот) вызывает ликвидацию. Залог продается на аукционе со штрафом ~13%. Пользователь теряет часть залога.',
    values: [
      { label: 'Залог', value: '$1,400 (1 ETH)', color: '#ef4444' },
      { label: 'Долг', value: '1,000 DAI', color: '#ef4444' },
      { label: 'Ratio', value: '140% < 150%!', color: '#ef4444' },
      { label: 'Штраф', value: '~13% ($130)', color: '#ef4444' },
    ],
    highlight: 'liquidation',
  },
];

/**
 * MakerDAOCDPDiagram
 *
 * Step-through MakerDAO/Sky CDP mechanism. 6 steps with history array.
 * Forward/backward/reset navigation. DiagramTooltip on step descriptions.
 */
export function MakerDAOCDPDiagram() {
  const [stepIndex, setStepIndex] = createSignal(0);
  const step = CDP_HISTORY[stepIndex()];

  // Color based on step status
  const statusColor = step.highlight === 'liquidation' ? '#ef4444'
    : step.highlight === 'warning' ? '#f59e0b'
    : step.highlight === 'healthy' ? colors.success
    : colors.primary;

  return (
    <DiagramContainer title="MakerDAO/Sky: механизм CDP" color="green">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {CDP_HISTORY.map((_, i) => (
          <div
            onClick={() => setStepIndex(i)}
            style={{
              'flex': '1',
              'height': '4px',
              'border-radius': '2px',
              'cursor': 'pointer',
              'background': i <= stepIndex() ? statusColor : 'rgba(255,255,255,0.1)',
              'transition': 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <DiagramTooltip content={step.description}>
        <div style={{
          'font-size': '14px',
          'font-weight': '600',
          'color': colors.text,
          'margin-bottom': '8px',
          'font-family': 'monospace',
        }}>
          {step.title}
        </div>
      </DiagramTooltip>

      {/* Description */}
      <div style={{
        'font-size': '13px',
        'color': colors.text,
        'line-height': '1.6',
        'margin-bottom': '14px',
      }}>
        {step.description}
      </div>

      {/* Values grid */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '1fr 1fr',
        'gap': '8px',
        'margin-bottom': '16px',
      }}>
        {step.values.map((v, i) => (
          <div style={{
            ...glassStyle,
            'padding': '10px',
          }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              {v.label}
            </div>
            <div style={{ 'font-size': '13px', 'color': v.color, 'font-family': 'monospace', 'font-weight': '600' }}>
              {v.value}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center' }}>
        <button
          onClick={() => setStepIndex(0)}
          style={{
            ...glassStyle,
            'padding': '8px 16px',
            'cursor': 'pointer',
            'color': colors.text,
            'font-size': '13px',
          }}
        >
          Сброс
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
          disabled={stepIndex() === 0}
          style={{
            ...glassStyle,
            'padding': '8px 20px',
            'cursor': stepIndex() === 0 ? 'not-allowed' : 'pointer',
            'color': stepIndex() === 0 ? colors.textMuted : colors.text,
            'font-size': '13px',
            'opacity': stepIndex() === 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.min(CDP_HISTORY.length - 1, s + 1))}
          disabled={stepIndex() >= CDP_HISTORY.length - 1}
          style={{
            ...glassStyle,
            'padding': '8px 20px',
            'cursor': stepIndex() >= CDP_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            'color': stepIndex() >= CDP_HISTORY.length - 1 ? colors.textMuted : statusColor,
            'font-size': '13px',
            'opacity': stepIndex() >= CDP_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex() >= CDP_HISTORY.length - 1 && (
        <div style={{ 'margin-top': '12px' }}>
          <DataBox
            label="Итог"
            value="Ликвидация защищает систему: долг погашается, DAI остается обеспеченным. Но пользователь теряет залог со штрафом. Over-collateralization -- цена стабильности."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  USTDeathSpiralDiagram                                               */
/* ================================================================== */

interface SpiralStep {
  number: number;
  title: string;
  description: string;
  color: string;
}

const SPIRAL_STEPS: SpiralStep[] = [
  {
    number: 1,
    title: 'Массовые выводы из Anchor Protocol',
    description: 'Anchor предлагал ~20% APY на депозиты UST. В мае 2022 крупные игроки начали выводить средства -- триггер коллапса.',
    color: '#f59e0b',
  },
  {
    number: 2,
    title: 'UST теряет привязку к $1',
    description: 'Массовые продажи UST на Curve и DEXes. UST падает ниже $1. Паника нарастает.',
    color: '#f59e0b',
  },
  {
    number: 3,
    title: 'Арбитражеры жгут UST, минтят LUNA',
    description: 'Механизм привязки: сжечь 1 UST = получить $1 в LUNA. Арбитражеры массово жгут UST, пытаясь восстановить привязку.',
    color: '#ef4444',
  },
  {
    number: 4,
    title: 'Предложение LUNA взрывается',
    description: 'Массовый минтинг LUNA для выкупа UST. Предложение LUNA растет экспоненциально: с 350M до 6.5 TRILLION токенов.',
    color: '#ef4444',
  },
  {
    number: 5,
    title: 'Цена LUNA обваливается',
    description: 'Гиперинфляция LUNA: цена падает с $80 до <$0.001. LUNA больше не может обеспечивать UST -- backing исчезает.',
    color: '#ef4444',
  },
  {
    number: 6,
    title: 'Spiral: depeg -> mint -> crash -> repeat',
    description: 'Порочный круг: больше UST продают -> больше LUNA минтят -> LUNA дешевеет -> UST обеспечен меньше -> еще больше продают UST.',
    color: '#dc2626',
  },
  {
    number: 7,
    title: 'Итог: $40B+ уничтожено',
    description: 'UST: $1 -> $0.01. LUNA: $80 -> $0.0001. >$40B рыночной капитализации испарилось за несколько дней. До Кванвон арестован. Алгоритмические стейблкоины без внешнего залога признаны фатально уязвимыми.',
    color: '#991b1b',
  },
];

/**
 * USTDeathSpiralDiagram
 *
 * Visualization of UST/LUNA collapse (May 2022). Downward spiral with 7 steps.
 * DiagramTooltip with description replaces hoveredIdx.
 */
export function USTDeathSpiralDiagram() {
  return (
    <DiagramContainer title="UST/LUNA: death spiral (май 2022)" color="red">
      {/* Spiral steps */}
      <div style={{
        'display': 'flex',
        'flex-direction': 'column',
        'gap': '4px',
        'margin-bottom': '16px',
      }}>
        {SPIRAL_STEPS.map((step, i) => {
          // Increasing indent to visualize downward spiral
          const indent = i * 8;

          return (
            <div
              style={{
                'margin-left': indent,
                'transition': 'all 0.2s',
              }}
            >
              <DiagramTooltip content={step.description}>
                <div style={{
                  ...glassStyle,
                  'padding': '10px 14px',
                  'background': `${step.color}05`,
                  'border': `1px solid ${step.color}20`,
                  'transition': 'all 0.2s',
                }}>
                  <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '10px' }}>
                    {/* Step number */}
                    <div style={{
                      'width': '24px',
                      'height': '24px',
                      'border-radius': '50%',
                      'background': `${step.color}20`,
                      'border': `1px solid ${step.color}60`,
                      'display': 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      'font-size': '11px',
                      'font-weight': '700',
                      'font-family': 'monospace',
                      'color': step.color,
                      'flex-shrink': '0',
                    }}>
                      {step.number}
                    </div>

                    {/* Title */}
                    <div style={{
                      'font-size': '12px',
                      'font-weight': '600',
                      'color': colors.text,
                      'font-family': 'monospace',
                    }}>
                      {step.title}
                    </div>

                    {/* Downward arrow indicator */}
                    {i < SPIRAL_STEPS.length - 1 && (
                      <div style={{
                        'margin-left': 'auto',
                        'font-size': '14px',
                        'color': step.color,
                        'opacity': '0.5',
                      }}>
                        v
                      </div>
                    )}
                  </div>
                </div>
              </DiagramTooltip>
            </div>
          );
        })}
      </div>

      {/* Impact summary */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '1fr 1fr 1fr',
        'gap': '8px',
        'margin-bottom': '16px',
      }}>
        <DiagramTooltip content="UST depeg: $1 -> $0.01. Алгоритмический стейблкоин без внешнего залога полностью потерял привязку к доллару.">
          <div style={{ ...glassStyle, 'padding': '10px', 'text-align': 'center' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>UST</div>
            <div style={{ 'font-size': '13px', 'color': '#ef4444', 'font-family': 'monospace', 'font-weight': '600' }}>$1 → $0.01</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="LUNA гиперинфляция: цена $80 -> $0.0001. Massive supply increase с 350M до 6.5T токенов за несколько дней.">
          <div style={{ ...glassStyle, 'padding': '10px', 'text-align': 'center' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>LUNA</div>
            <div style={{ 'font-size': '13px', 'color': '#ef4444', 'font-family': 'monospace', 'font-weight': '600' }}>$80 → $0.0001</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="$40B+ рыночной капитализации уничтожено за 3 дня. Крупнейший крах в истории DeFi.">
          <div style={{ ...glassStyle, 'padding': '10px', 'text-align': 'center' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>Потери</div>
            <div style={{ 'font-size': '13px', 'color': '#ef4444', 'font-family': 'monospace', 'font-weight': '600' }}>$40B+</div>
          </div>
        </DiagramTooltip>
      </div>

      <DataBox
        label="Ключевой урок"
        value="Алгоритмические стейблкоины без достаточного ВНЕШНЕГО залога фатально уязвимы. Backing asset не может быть собственным токеном -- это круговая зависимость, которая разрушается при стрессе."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
