/**
 * Uniswap V2 Math Diagrams (DEFI-03)
 *
 * Exports:
 * - V2SwapMathDiagram: Step-through V2 swap calculation with integer math (6 steps, history array)
 * - LPTokenMintingDiagram: LP token minting calculation (DiagramTooltip)
 * - V2vsV3EfficiencyDiagram: Capital efficiency comparison V2 vs V3 (DiagramTooltip)
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  V2SwapMathDiagram                                                    */
/* ================================================================== */

interface V2Step {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
}

const V2_SWAP_STEPS: V2Step[] = [
  {
    title: 'Состояние пула',
    description:
      'Пул ETH/USDC. Резервы определяют цену: 2,000,000 / 1,000 = 2,000 USDC за 1 ETH. Все числа -- uint256 (целочисленная арифметика).',
    values: [
      { label: 'reserveIn (ETH)', value: '1,000', color: colors.primary },
      { label: 'reserveOut (USDC)', value: '2,000,000', color: colors.success },
      { label: 'k = reserveIn * reserveOut', value: '2,000,000,000', color: colors.accent },
      { label: 'Spot price', value: '2,000 USDC/ETH', color: colors.text },
    ],
  },
  {
    title: 'Шаг 1: Input и применение комиссии',
    description:
      'Trader отправляет 10 ETH. V2 использует целочисленную математику: умножаем на 997 вместо деления на 1000 и вычитания 3. Нет float в Solidity!',
    values: [
      { label: 'amountIn', value: '10 ETH', color: colors.accent },
      { label: 'amountInWithFee', value: '10 * 997 = 9,970', color: colors.primary },
      { label: 'Комиссия', value: '0.3% (3/1000)', color: '#f43f5e' },
      { label: 'Формула', value: 'amountIn * 997', color: colors.textMuted },
    ],
  },
  {
    title: 'Шаг 2: Числитель',
    description:
      'Числитель формулы: output reserve умноженный на fee-adjusted input. Порядок важен для предотвращения overflow.',
    values: [
      { label: 'reserveOut', value: '2,000,000', color: colors.success },
      { label: 'amountInWithFee', value: '9,970', color: colors.primary },
      { label: 'numerator', value: '2,000,000 * 9,970', color: colors.accent },
      { label: '= ', value: '19,940,000,000', color: colors.accent },
    ],
  },
  {
    title: 'Шаг 3: Знаменатель',
    description:
      'Знаменатель: scaled input reserve плюс fee-adjusted input. Масштабирование на 1000 компенсирует умножение числителя на 997.',
    values: [
      { label: 'reserveIn * 1000', value: '1,000 * 1,000 = 1,000,000', color: colors.primary },
      { label: 'amountInWithFee', value: '9,970', color: colors.primary },
      { label: 'denominator', value: '1,000,000 + 9,970', color: colors.accent },
      { label: '= ', value: '1,009,970', color: colors.accent },
    ],
  },
  {
    title: 'Шаг 4: Результат (целочисленное деление)',
    description:
      'amountOut = numerator / denominator. В Solidity это целочисленное деление (округление вниз). Эффективная цена хуже спотовой из-за price impact и комиссии.',
    values: [
      { label: 'amountOut', value: '19,940,000,000 / 1,009,970', color: colors.accent },
      { label: '= ', value: '19,743 USDC', color: colors.success },
      { label: 'Эффективная цена', value: '1,974.3 USDC/ETH', color: colors.accent },
      { label: 'Price impact + fee', value: '-1.28%', color: '#f43f5e' },
    ],
  },
  {
    title: 'Шаг 5: Новые резервы и проверка k',
    description:
      'Все 10 ETH (включая комиссию) остаются в пуле. Новый k >= старый k. Комиссия 0.3% осталась в пуле -- LP заработали.',
    values: [
      { label: 'Новый reserveIn', value: '1,010 ETH', color: colors.primary },
      { label: 'Новый reserveOut', value: '1,980,257 USDC', color: colors.success },
      { label: 'Новый k', value: '1,010 * 1,980,257 = 2,000,059,570', color: colors.accent },
      { label: 'k вырос?', value: '2,000,059,570 >= 2,000,000,000', color: colors.success },
    ],
  },
];

/**
 * V2SwapMathDiagram
 *
 * Step-through V2 swap with Uniswap V2 integer formula.
 * 6 steps, history array, forward/backward/reset navigation.
 */
export function V2SwapMathDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = V2_SWAP_STEPS[stepIndex];

  return (
    <DiagramContainer title="Uniswap V2: целочисленная математика свопа" color="blue">
      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {V2_SWAP_STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex ? colors.primary : 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <DiagramTooltip content="Формула свопа V2: dy = y * dx / (x + dx). С учётом fee: dy = y * (dx * 997) / (x * 1000 + dx * 997). 0.3% fee остаётся в пуле.">
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 8,
            fontFamily: 'monospace',
          }}
        >
          {step.title}
        </div>
      </DiagramTooltip>

      {/* Description */}
      <div
        style={{
          fontSize: 13,
          color: colors.text,
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {step.description}
      </div>

      {/* Values grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {step.values.map((v, i) => (
          <DiagramTooltip key={i} content="Reserve X: количество токена X в пуле. Reserve Y: количество токена Y. Цена X в Y: price = reserve_Y / reserve_X.">
            <div style={{ ...glassStyle, padding: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  marginBottom: 4,
                }}
              >
                {v.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: v.color,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {v.value}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Formula box */}
      {stepIndex >= 1 && stepIndex <= 4 && (
        <div
          style={{
            ...glassStyle,
            padding: 10,
            marginBottom: 16,
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: colors.primary,
              textAlign: 'center',
            }}
          >
            amountOut = reserveOut * amountIn * 997 / (reserveIn * 1000 + amountIn * 997)
          </div>
        </div>
      )}

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
          onClick={() => setStepIndex((s) => Math.min(V2_SWAP_STEPS.length - 1, s + 1))}
          disabled={stepIndex >= V2_SWAP_STEPS.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= V2_SWAP_STEPS.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= V2_SWAP_STEPS.length - 1 ? colors.textMuted : colors.primary,
            fontSize: 13,
            opacity: stepIndex >= V2_SWAP_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= V2_SWAP_STEPS.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевой вывод"
            value="V2 использует ТОЛЬКО целочисленную арифметику: * 997 / 1000 вместо * 0.997. Нет float, нет погрешностей округления. k монотонно растет -- LP зарабатывают."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  LPTokenMintingDiagram                                                */
/* ================================================================== */

interface MintScenario {
  title: string;
  formula: string;
  explanation: string;
  example: string;
  color: string;
  tooltip: string;
}

const MINT_SCENARIOS: MintScenario[] = [
  {
    title: 'Первый провайдер',
    formula: 'liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY',
    explanation:
      'Геометрическое среднее входных сумм. Задает начальное соотношение. MINIMUM_LIQUIDITY (1000) навсегда блокируется для предотвращения манипуляции ценой LP токенов.',
    example:
      'amountA = 10 ETH (10e18), amountB = 20,000 USDC (20,000e6)\nliquidity = sqrt(10e18 * 20,000e6) - 1000 = sqrt(2e26) - 1000',
    color: colors.primary,
    tooltip: 'Первый LP: LP_tokens = sqrt(x * y) - MINIMUM_LIQUIDITY. 1000 wei LP токенов навсегда locked (предотвращает деление на ноль и manipulation).',
  },
  {
    title: 'Последующие провайдеры',
    formula: 'liquidity = min(amountA * totalSupply / reserveA, amountB * totalSupply / reserveB)',
    explanation:
      'Минимум из двух соотношений. Если провайдер вносит несбалансированную сумму, он получает LP-токенов меньше -- разница остается в пуле как "подарок" существующим LP.',
    example:
      'reserveA = 100 ETH, reserveB = 200,000 USDC, totalSupply = 1000\namountA = 10 ETH, amountB = 20,000 USDC\nliquidity = min(10*1000/100, 20000*1000/200000) = min(100, 100) = 100',
    color: colors.success,
    tooltip: 'Добавление ликвидности: LP_tokens = min(dx/x, dy/y) * totalSupply. Нужно добавить оба токена пропорционально текущему ratio.',
  },
];

/**
 * LPTokenMintingDiagram
 *
 * Shows first-provider and subsequent-provider scenarios with DiagramTooltip.
 */
export function LPTokenMintingDiagram() {
  return (
    <DiagramContainer title="LP токены: расчет долей" color="green">
      {/* Scenario cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {MINT_SCENARIOS.map((s, i) => (
          <DiagramTooltip key={i} content={s.tooltip}>
            <div
              style={{
                ...glassStyle,
                padding: 14,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: s.color,
                  marginBottom: 6,
                  fontFamily: 'monospace',
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: colors.accent,
                  fontFamily: 'monospace',
                  marginBottom: 8,
                  padding: 8,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 4,
                }}
              >
                {s.formula}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: colors.text,
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                {s.explanation}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-line',
                  padding: 8,
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: 4,
                }}
              >
                {s.example}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* MINIMUM_LIQUIDITY note */}
      <DiagramTooltip content="Удаление ликвидности: dx = LP_tokens / totalSupply * reserve_X. Получаете долю обоих токенов + накопленные fees.">
        <div
          style={{
            ...glassStyle,
            padding: 10,
            background: 'rgba(244,63,94,0.06)',
            border: '1px solid rgba(244,63,94,0.2)',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#f43f5e',
              fontFamily: 'monospace',
              textAlign: 'center',
            }}
          >
            MINIMUM_LIQUIDITY = 1000 -- навсегда заблокировано в address(0). Без этого первый LP мог
            бы манипулировать ценой LP-токена.
          </div>
        </div>
      </DiagramTooltip>

      <DataBox
        label="LP токены = ERC-20"
        value="LP токены можно передавать, торговать, использовать как залог. Burn LP -> получить пропорциональную долю пула."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  V2vsV3EfficiencyDiagram                                              */
/* ================================================================== */

interface EfficiencyRow {
  metric: string;
  v2: string;
  v3: string;
  advantage: string;
  tooltip: string;
}

const EFFICIENCY_DATA: EfficiencyRow[] = [
  {
    metric: 'Диапазон ликвидности',
    v2: '[0, infinity)',
    v3: '[price_a, price_b]',
    advantage: 'V3: LP выбирает диапазон',
    tooltip: 'V2: ликвидность от 0 до infinity (большая часть не используется). V3: concentrated ranges. Для +-5% range: ~4000x эффективнее V2.',
  },
  {
    metric: 'ETH/USDC $100K',
    v2: 'Глубина: ~$100K',
    v3: 'Глубина: ~$424K (x4.24)',
    advantage: 'V3: 4.24x эффективнее',
    tooltip: 'V2: ликвидность от 0 до infinity (большая часть не используется). V3: concentrated ranges. Для +-5% range: ~4000x эффективнее V2.',
  },
  {
    metric: 'Заработок комиссий',
    v2: 'Весь диапазон, мало',
    v3: 'Только в диапазоне, много',
    advantage: 'V3: до 4000x больше',
    tooltip: 'V2: LP зарабатывает на всём диапазоне, но мало. V3: LP зарабатывает только в своём range, но получает пропорционально больше комиссий.',
  },
  {
    metric: 'LP токен',
    v2: 'ERC-20 (взаимозаменяемый)',
    v3: 'NFT (уникальная позиция)',
    advantage: 'V2: проще, V3: гибче',
    tooltip: 'V2: LP complexity: deposit and forget. V3: активное управление range. Если цена выходит за range -- LP перестаёт зарабатывать fees.',
  },
  {
    metric: 'Управление',
    v2: 'Set & forget',
    v3: 'Активное управление',
    advantage: 'V2: проще',
    tooltip: 'V2: IL = 2*sqrt(p) / (1+p) - 1. V3: IL amplified пропорционально concentration. Узкий range = больше fees, но больше IL.',
  },
];

/**
 * V2vsV3EfficiencyDiagram
 *
 * Comparison table with DiagramTooltip on first column cells.
 */
export function V2vsV3EfficiencyDiagram() {
  // SVG visualization
  const svgW = 320;
  const svgH = 160;
  const midX = svgW / 2;

  // V2 curve (full range)
  const v2Points = useMemo(() => {
    const pts: string[] = [];
    for (let px = 30; px < svgW - 30; px += 3) {
      const x = 200 + (px / svgW) * 1800;
      const y = 400000 / x;
      const svgY = 140 - (y / 2000) * 120;
      if (svgY > 10 && svgY < 150) {
        pts.push(`${px},${svgY.toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, []);

  return (
    <DiagramContainer title="V2 vs V3: эффективность капитала" color="purple">
      {/* SVG comparison */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* V2 full curve (dim) */}
          <polyline points={v2Points} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
          <text x={40} y={20} fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="monospace">
            V2: весь диапазон
          </text>

          {/* V3 concentrated range (bright) */}
          <rect
            x={midX - 50}
            y={30}
            width={100}
            height={100}
            fill="rgba(168,85,247,0.1)"
            stroke={colors.accent}
            strokeWidth={1}
            strokeDasharray="4,3"
            rx={4}
          />
          <text
            x={midX}
            y={24}
            fill={colors.accent}
            fontSize={10}
            fontFamily="monospace"
            textAnchor="middle"
          >
            V3: [1500, 2500]
          </text>

          {/* Liquidity depth bars */}
          <rect x={midX - 40} y={50} width={30} height={60} fill="rgba(255,255,255,0.1)" rx={2} />
          <text
            x={midX - 25}
            y={125}
            fill="rgba(255,255,255,0.3)"
            fontSize={9}
            fontFamily="monospace"
            textAnchor="middle"
          >
            V2
          </text>

          <rect x={midX + 10} y={20} width={30} height={90} fill={`${colors.accent}60`} rx={2} />
          <text
            x={midX + 25}
            y={125}
            fill={colors.accent}
            fontSize={9}
            fontFamily="monospace"
            textAnchor="middle"
          >
            V3
          </text>

          {/* Arrow */}
          <text
            x={midX + 55}
            y={65}
            fill={colors.success}
            fontSize={11}
            fontFamily="monospace"
            fontWeight={600}
          >
            x4.24
          </text>
        </svg>
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            fontFamily: 'monospace',
          }}
        >
          <thead>
            <tr>
              {['Метрика', 'V2', 'V3', 'Преимущество'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '8px 6px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'left',
                    color: colors.textMuted,
                    fontWeight: 400,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EFFICIENCY_DATA.map((row, i) => (
              <tr
                key={i}
                style={{
                  transition: 'all 0.15s',
                }}
              >
                <td
                  style={{
                    padding: '8px 6px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: colors.text,
                    fontWeight: 600,
                  }}
                >
                  <DiagramTooltip content={row.tooltip}>
                    <span>{row.metric}</span>
                  </DiagramTooltip>
                </td>
                <td
                  style={{
                    padding: '8px 6px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: colors.textMuted,
                  }}
                >
                  {row.v2}
                </td>
                <td
                  style={{
                    padding: '8px 6px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: colors.accent,
                  }}
                >
                  {row.v3}
                </td>
                <td
                  style={{
                    padding: '8px 6px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: colors.success,
                  }}
                >
                  {row.advantage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Почему V3 эффективнее?"
          value="V2 размазывает ликвидность по [0, infinity). Для ETH/USDC > 99% ликвидности V2 никогда не используется. V3 LP выбирает узкий диапазон и получает пропорционально больше комиссий."
          variant="info"
        />
      </div>
    </DiagramContainer>
  );
}
