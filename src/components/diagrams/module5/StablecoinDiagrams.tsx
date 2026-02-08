/**
 * Stablecoin Diagrams (DEFI-10)
 *
 * Exports:
 * - StablecoinComparisonDiagram: 4 stablecoin types comparison table (static with hover)
 * - MakerDAOCDPDiagram: MakerDAO/Sky CDP mechanism step-through (6 steps, history array)
 * - USTDeathSpiralDiagram: UST/LUNA collapse visualization (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
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
  },
  {
    type: 'Crypto-collateralized',
    examples: 'DAI/USDS (MakerDAO/Sky)',
    mechanism: 'Over-collateralized CDPs (150%+). Залог в ETH, WBTC и др.',
    risk: 'Smart contract risk, oracle risk, каскад ликвидаций',
    decentralization: 'Децентрализованные',
    color: colors.primary,
    status: 'active',
  },
  {
    type: 'Algorithmic',
    examples: 'UST (COLLAPSED)',
    mechanism: 'Mint/burn с LUNA для поддержания привязки. Нет внешнего залога.',
    risk: 'Death spiral (доказано фатально). $40B потеряно (май 2022)',
    decentralization: 'Децентрализованные (провал)',
    color: '#ef4444',
    status: 'collapsed',
  },
  {
    type: 'Hybrid',
    examples: 'FRAX',
    mechanism: 'Частичный залог + алгоритмическая часть. Адаптивное соотношение.',
    risk: 'Сниженный risk death spiral, более сложная модель',
    decentralization: 'Полу-децентрализованные',
    color: '#f59e0b',
    status: 'experimental',
  },
];

const COLUMN_HEADERS = ['Тип', 'Примеры', 'Механизм', 'Риски', 'Децентрализация'];

/**
 * StablecoinComparisonDiagram
 *
 * HTML comparison table of 4 stablecoin types.
 * Color coding: green=safest, blue=moderate, red=collapsed, yellow=experimental.
 */
export function StablecoinComparisonDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <DiagramContainer title="Классификация стейблкоинов" color="blue">
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 130px 1fr 1fr 120px',
        gap: 1,
        marginBottom: 1,
      }}>
        {COLUMN_HEADERS.map((h) => (
          <div key={h} style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 600,
            color: colors.textMuted,
            textAlign: 'center',
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* Table rows */}
      {STABLECOIN_TYPES.map((row, i) => {
        const isHovered = hoveredRow === i;
        const isCollapsed = row.status === 'collapsed';

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 130px 1fr 1fr 120px',
              gap: 1,
              marginBottom: 1,
              opacity: isCollapsed && !isHovered ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'monospace',
              color: isHovered ? row.color : colors.text,
              background: isHovered ? `${row.color}08` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textDecoration: isCollapsed ? 'line-through' : 'none',
            }}>
              {row.type}
            </div>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 11,
              fontFamily: 'monospace',
              color: isHovered ? row.color : colors.textMuted,
              background: isHovered ? `${row.color}08` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              lineHeight: 1.4,
              textDecoration: isCollapsed ? 'line-through' : 'none',
            }}>
              {row.examples}
            </div>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 11,
              color: isHovered ? colors.text : colors.textMuted,
              background: isHovered ? `${row.color}08` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              lineHeight: 1.4,
            }}>
              {row.mechanism}
            </div>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 11,
              color: isHovered ? (isCollapsed ? '#ef4444' : colors.text) : colors.textMuted,
              background: isHovered ? `${row.color}08` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              lineHeight: 1.4,
            }}>
              {row.risk}
            </div>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 11,
              color: isHovered ? row.color : colors.textMuted,
              background: isHovered ? `${row.color}08` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
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
 * Forward/backward/reset navigation.
 */
export function MakerDAOCDPDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = CDP_HISTORY[stepIndex];

  // Color based on step status
  const statusColor = step.highlight === 'liquidation' ? '#ef4444'
    : step.highlight === 'warning' ? '#f59e0b'
    : step.highlight === 'healthy' ? colors.success
    : colors.primary;

  return (
    <DiagramContainer title="MakerDAO/Sky: механизм CDP" color="green">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {CDP_HISTORY.map((_, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex ? statusColor : 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: colors.text,
        marginBottom: 8,
        fontFamily: 'monospace',
      }}>
        {step.title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: colors.text,
        lineHeight: 1.6,
        marginBottom: 14,
      }}>
        {step.description}
      </div>

      {/* Values grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 16,
      }}>
        {step.values.map((v, i) => (
          <div key={i} style={{
            ...glassStyle,
            padding: 10,
          }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              {v.label}
            </div>
            <div style={{ fontSize: 13, color: v.color, fontFamily: 'monospace', fontWeight: 600 }}>
              {v.value}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => setStepIndex(0)}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            color: colors.text,
            fontSize: 13,
          }}
        >
          Сброс
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
          disabled={stepIndex === 0}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
            color: stepIndex === 0 ? colors.textMuted : colors.text,
            fontSize: 13,
            opacity: stepIndex === 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.min(CDP_HISTORY.length - 1, s + 1))}
          disabled={stepIndex >= CDP_HISTORY.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= CDP_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= CDP_HISTORY.length - 1 ? colors.textMuted : statusColor,
            fontSize: 13,
            opacity: stepIndex >= CDP_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= CDP_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
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
 * Static with hover for details.
 */
export function USTDeathSpiralDiagram() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <DiagramContainer title="UST/LUNA: death spiral (май 2022)" color="red">
      {/* Spiral steps */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 16,
      }}>
        {SPIRAL_STEPS.map((step, i) => {
          const isHovered = hoveredIdx === i;
          // Increasing indent to visualize downward spiral
          const indent = i * 8;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                marginLeft: indent,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                ...glassStyle,
                padding: '10px 14px',
                cursor: 'pointer',
                background: isHovered ? `${step.color}15` : `${step.color}05`,
                border: `1px solid ${isHovered ? step.color : step.color + '20'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Step number */}
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: `${step.color}20`,
                    border: `1px solid ${step.color}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: step.color,
                    flexShrink: 0,
                  }}>
                    {step.number}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isHovered ? step.color : colors.text,
                    fontFamily: 'monospace',
                  }}>
                    {step.title}
                  </div>

                  {/* Downward arrow indicator */}
                  {i < SPIRAL_STEPS.length - 1 && (
                    <div style={{
                      marginLeft: 'auto',
                      fontSize: 14,
                      color: step.color,
                      opacity: 0.5,
                    }}>
                      v
                    </div>
                  )}
                </div>

                {/* Detail on hover */}
                {isHovered && (
                  <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: colors.text,
                    lineHeight: 1.6,
                    paddingLeft: 34,
                  }}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        marginBottom: 16,
      }}>
        <div style={{ ...glassStyle, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>UST</div>
          <div style={{ fontSize: 13, color: '#ef4444', fontFamily: 'monospace', fontWeight: 600 }}>$1 → $0.01</div>
        </div>
        <div style={{ ...glassStyle, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>LUNA</div>
          <div style={{ fontSize: 13, color: '#ef4444', fontFamily: 'monospace', fontWeight: 600 }}>$80 → $0.0001</div>
        </div>
        <div style={{ ...glassStyle, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Потери</div>
          <div style={{ fontSize: 13, color: '#ef4444', fontFamily: 'monospace', fontWeight: 600 }}>$40B+</div>
        </div>
      </div>

      <DataBox
        label="Ключевой урок"
        value="Алгоритмические стейблкоины без достаточного ВНЕШНЕГО залога фатально уязвимы. Backing asset не может быть собственным токеном -- это круговая зависимость, которая разрушается при стрессе."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
