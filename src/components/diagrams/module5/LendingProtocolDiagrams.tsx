/**
 * Lending Protocol Diagrams (DEFI-06)
 *
 * Exports:
 * - InterestRateCurveDiagram: Interactive kinked interest rate curve with utilization slider
 * - SupplyBorrowFlowDiagram: Step-through supply/borrow flow with history array (6 steps)
 * - ATokenGrowthDiagram: Static timeline showing aToken balance growth over time
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  InterestRateCurveDiagram                                            */
/* ================================================================== */

/**
 * InterestRateCurveDiagram
 *
 * Interactive kinked interest rate curve for Aave V3.
 * Slider controls utilization rate (0-100%).
 * Shows borrow rate and supply rate with piecewise linear model.
 *
 * Parameters (USDC on Aave V3):
 * - U_optimal = 90%
 * - R_base = 0%
 * - R_slope1 = 3.5%
 * - R_slope2 = 60%
 * - Reserve factor = 10%
 */
export function InterestRateCurveDiagram() {
  const [utilization, setUtilization] = useState(45);

  // Aave V3 USDC interest rate parameters
  const U_OPTIMAL = 90; // %
  const R_BASE = 0;     // %
  const R_SLOPE1 = 3.5; // %
  const R_SLOPE2 = 60;  // %
  const RESERVE_FACTOR = 0.10; // 10%

  // Calculate borrow rate (piecewise linear)
  const calcBorrowRate = (u: number): number => {
    if (u <= U_OPTIMAL) {
      return R_BASE + R_SLOPE1 * (u / U_OPTIMAL);
    }
    return R_BASE + R_SLOPE1 + R_SLOPE2 * ((u - U_OPTIMAL) / (100 - U_OPTIMAL));
  };

  // Supply rate = borrow rate * utilization * (1 - reserve factor)
  const calcSupplyRate = (u: number): number => {
    const br = calcBorrowRate(u);
    return br * (u / 100) * (1 - RESERVE_FACTOR);
  };

  const borrowRate = calcBorrowRate(utilization);
  const supplyRate = calcSupplyRate(utilization);

  // SVG chart
  const svgW = 340;
  const svgH = 200;
  const padL = 44;
  const padB = 28;
  const padT = 10;
  const padR = 10;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxRate = 70; // % for Y axis

  const toSvgX = (u: number) => padL + (u / 100) * plotW;
  const toSvgY = (r: number) => padT + plotH - (r / maxRate) * plotH;

  // Borrow rate curve points
  const borrowCurvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let u = 0; u <= 100; u += 1) {
      const r = calcBorrowRate(u);
      pts.push(`${toSvgX(u).toFixed(1)},${toSvgY(r).toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  // Supply rate curve points
  const supplyCurvePoints = useMemo(() => {
    const pts: string[] = [];
    for (let u = 0; u <= 100; u += 1) {
      const r = calcSupplyRate(u);
      pts.push(`${toSvgX(u).toFixed(1)},${toSvgY(r).toFixed(1)}`);
    }
    return pts.join(' ');
  }, []);

  const isAboveOptimal = utilization > U_OPTIMAL;

  return (
    <DiagramContainer title="Aave V3: модель процентных ставок (kinked curve)" color="blue">
      {/* SVG chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

          {/* Optimal utilization vertical line */}
          <line
            x1={toSvgX(U_OPTIMAL)}
            y1={padT}
            x2={toSvgX(U_OPTIMAL)}
            y2={padT + plotH}
            stroke="#eab308"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <text x={toSvgX(U_OPTIMAL)} y={padT - 2} fill="#eab308" fontSize={9} textAnchor="middle" fontFamily="monospace">
            U_opt={U_OPTIMAL}%
          </text>

          {/* Danger zone background (above optimal) */}
          <rect
            x={toSvgX(U_OPTIMAL)}
            y={padT}
            width={plotW - (U_OPTIMAL / 100) * plotW}
            height={plotH}
            fill="rgba(244,63,94,0.04)"
          />

          {/* Borrow rate curve */}
          <polyline points={borrowCurvePoints} fill="none" stroke="#f43f5e" strokeWidth={2} />

          {/* Supply rate curve */}
          <polyline points={supplyCurvePoints} fill="none" stroke={colors.success} strokeWidth={2} />

          {/* Current utilization vertical marker */}
          <line
            x1={toSvgX(utilization)}
            y1={padT}
            x2={toSvgX(utilization)}
            y2={padT + plotH}
            stroke={colors.accent}
            strokeWidth={1}
            strokeDasharray="2,3"
          />

          {/* Current borrow rate point */}
          <circle
            cx={toSvgX(utilization)}
            cy={toSvgY(borrowRate)}
            r={4}
            fill="#f43f5e"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />

          {/* Current supply rate point */}
          <circle
            cx={toSvgX(utilization)}
            cy={toSvgY(supplyRate)}
            r={4}
            fill={colors.success}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />

          {/* Legend */}
          <line x1={padL + 4} y1={padT + 6} x2={padL + 20} y2={padT + 6} stroke="#f43f5e" strokeWidth={2} />
          <text x={padL + 24} y={padT + 10} fill="#f43f5e" fontSize={9} fontFamily="monospace">Borrow Rate</text>
          <line x1={padL + 4} y1={padT + 18} x2={padL + 20} y2={padT + 18} stroke={colors.success} strokeWidth={2} />
          <text x={padL + 24} y={padT + 22} fill={colors.success} fontSize={9} fontFamily="monospace">Supply Rate</text>

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 2} fill={colors.textMuted} fontSize={10} textAnchor="middle" fontFamily="monospace">Utilization Rate (%)</text>
          <text x={6} y={padT + plotH / 2} fill={colors.textMuted} fontSize={10} textAnchor="middle" fontFamily="monospace" transform={`rotate(-90, 6, ${padT + plotH / 2})`}>Rate (%)</text>

          {/* X-axis scale */}
          {[0, 25, 50, 75, 100].map((v) => (
            <text key={v} x={toSvgX(v)} y={padT + plotH + 14} fill={colors.textMuted} fontSize={8} textAnchor="middle" fontFamily="monospace">{v}</text>
          ))}
          {/* Y-axis scale */}
          {[0, 10, 20, 30, 40, 50, 60, 70].filter((v) => v <= maxRate).map((v) => (
            <text key={v} x={padL - 4} y={toSvgY(v) + 3} fill={colors.textMuted} fontSize={8} textAnchor="end" fontFamily="monospace">{v}%</text>
          ))}
        </svg>
      </div>

      {/* Slider */}
      <DiagramTooltip content="Kink point (оптимальная утилизация): обычно 80-90%. Ниже kink: пологий рост ставки. Выше kink: резкий рост (стимул для погашения займов и новых deposits).">
        <div style={{ marginBottom: 16, padding: '0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
              Utilization Rate:
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'monospace',
              color: isAboveOptimal ? '#f43f5e' : colors.accent,
            }}>
              {utilization}% {isAboveOptimal ? '(above optimal!)' : ''}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={utilization}
            onChange={(e) => setUtilization(Number(e.target.value))}
            style={{ width: '100%', accentColor: colors.primary }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </DiagramTooltip>

      {/* Computed values */}
      <DiagramTooltip content="Supply APY < Borrow APY (spread = протокол revenue). Reserve Factor -- доля процентов, идущая в казну протокола. Slope 1 (до kink): умеренный рост. Slope 2 (после kink): агрессивный рост (100-300% APY).">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 12,
        }}>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Borrow Rate</div>
            <div style={{ fontSize: 13, color: '#f43f5e', fontFamily: 'monospace', fontWeight: 600 }}>{borrowRate.toFixed(2)}%</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Supply Rate</div>
            <div style={{ fontSize: 13, color: colors.success, fontFamily: 'monospace', fontWeight: 600 }}>{supplyRate.toFixed(2)}%</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>U_optimal</div>
            <div style={{ fontSize: 13, color: '#eab308', fontFamily: 'monospace', fontWeight: 600 }}>{U_OPTIMAL}%</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Reserve Factor</div>
            <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'monospace' }}>{(RESERVE_FACTOR * 100).toFixed(0)}%</div>
          </div>
        </div>
      </DiagramTooltip>

      {/* Formula */}
      <DiagramTooltip content="Base rate: минимальная ставка при 0% утилизации. Определяется governance. Формула piecewise linear: два наклона с переломной точкой в U_optimal.">
        <div style={{ ...glassStyle, padding: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.primary, textAlign: 'center' }}>
            {utilization <= U_OPTIMAL
              ? `R_borrow = R_base + R_slope1 * (U / U_opt) = ${R_BASE} + ${R_SLOPE1} * (${utilization} / ${U_OPTIMAL}) = ${borrowRate.toFixed(2)}%`
              : `R_borrow = R_base + R_slope1 + R_slope2 * ((U - U_opt) / (1 - U_opt)) = ${borrowRate.toFixed(2)}%`
            }
          </div>
        </div>
      </DiagramTooltip>

      <DataBox
        label="Kinked Curve"
        value={`Ниже U_opt=${U_OPTIMAL}%: ставка растет плавно (slope1=${R_SLOPE1}%). Выше: ставка взлетает (slope2=${R_SLOPE2}%), стимулируя возврат займов.`}
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SupplyBorrowFlowDiagram                                              */
/* ================================================================== */

interface FlowStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const SUPPLY_BORROW_HISTORY: FlowStep[] = [
  {
    title: 'Начальное состояние',
    description: 'Alice хочет использовать Aave V3. У нее есть 10 ETH (~$20,000 при цене $2,000/ETH). Она планирует внести ETH как залог и занять USDC.',
    values: [
      { label: 'Баланс Alice', value: '10 ETH (~$20,000)', color: colors.primary },
      { label: 'Collateral в Aave', value: '0', color: colors.textMuted },
      { label: 'Debt', value: '0', color: colors.textMuted },
      { label: 'Health Factor', value: 'N/A', color: colors.textMuted },
    ],
    highlight: 'initial',
  },
  {
    title: 'Шаг 1: Approve WETH',
    description: 'Alice сначала wraps ETH в WETH (ERC-20), затем вызывает approve() чтобы разрешить Aave Pool тратить ее WETH. Без approve невозможно внести залог.',
    values: [
      { label: 'Транзакция', value: 'WETH.approve(Pool, 10e18)', color: colors.accent },
      { label: 'Allowance', value: '10 WETH', color: colors.success },
      { label: 'Gas', value: '~46,000', color: colors.textMuted },
      { label: 'Паттерн', value: 'Approve + Interact', color: colors.primary },
    ],
    highlight: 'approve',
  },
  {
    title: 'Шаг 2: Supply WETH',
    description: 'Alice вызывает pool.supply(WETH, 10e18, alice, 0). Pool переводит 10 WETH от Alice себе. Взамен Alice получает 10 aWETH -- interest-bearing receipt tokens.',
    values: [
      { label: 'Транзакция', value: 'pool.supply(WETH, 10e18)', color: colors.accent },
      { label: 'WETH баланс', value: '0 (переданы в Pool)', color: '#f43f5e' },
      { label: 'aWETH баланс', value: '10 aWETH', color: colors.success },
      { label: 'Collateral (USD)', value: '$20,000', color: colors.primary },
    ],
    highlight: 'supply',
  },
  {
    title: 'Шаг 3: Проверка лимитов',
    description: 'WETH на Aave V3 имеет LTV=80% и Liquidation Threshold=82.5%. Alice может занять до 80% от залога, но ликвидация начнется когда долг достигнет 82.5%.',
    values: [
      { label: 'LTV (max borrow)', value: '80% = $16,000', color: colors.accent },
      { label: 'Liq. Threshold', value: '82.5% = $16,500', color: '#f43f5e' },
      { label: 'Безопасная зона', value: '$0 - $16,000 долга', color: colors.success },
      { label: 'Danger зона', value: '$16,000 - $16,500', color: '#f43f5e' },
    ],
    highlight: 'limits',
  },
  {
    title: 'Шаг 4: Borrow USDC',
    description: 'Alice берет займ 12,000 USDC (60% LTV -- консервативно). Pool минтит variableDebtToken Alice и переводит ей 12,000 USDC. Начисление процентов начинается немедленно.',
    values: [
      { label: 'Транзакция', value: 'pool.borrow(USDC, 12000e6, 2)', color: colors.accent },
      { label: 'USDC получено', value: '12,000 USDC', color: colors.success },
      { label: 'Debt Token баланс', value: '12,000 vdUSDC', color: '#f43f5e' },
      { label: 'Interest Rate Mode', value: '2 (variable)', color: colors.primary },
    ],
    highlight: 'borrow',
  },
  {
    title: 'Шаг 5: Итоговая позиция',
    description: 'Alice имеет $20,000 залога и $12,000 долга. Health Factor = (20000 * 0.825) / 12000 = 1.375. Позиция здоровая (HF > 1). Если ETH упадет ниже ~$1,454, HF < 1 и начнется ликвидация.',
    values: [
      { label: 'Collateral (USD)', value: '$20,000', color: colors.primary },
      { label: 'Debt (USD)', value: '$12,000', color: '#f43f5e' },
      { label: 'Health Factor', value: '1.375', color: colors.success },
      { label: 'Цена ликвидации ETH', value: '~$1,454', color: '#f43f5e' },
    ],
    highlight: 'result',
  },
];

/**
 * SupplyBorrowFlowDiagram
 *
 * Step-through supply/borrow flow on Aave V3.
 * 6 steps with concrete numbers. Forward/backward/reset navigation.
 */
export function SupplyBorrowFlowDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = SUPPLY_BORROW_HISTORY[stepIndex];

  return (
    <DiagramContainer title="Aave V3: supply и borrow пошагово" color="green">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {SUPPLY_BORROW_HISTORY.map((_, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex ? colors.success : 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <DiagramTooltip content={step.description}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 8,
          fontFamily: 'monospace',
        }}>
          {step.title}
        </div>
      </DiagramTooltip>

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
          onClick={() => setStepIndex((s) => Math.min(SUPPLY_BORROW_HISTORY.length - 1, s + 1))}
          disabled={stepIndex >= SUPPLY_BORROW_HISTORY.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= SUPPLY_BORROW_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= SUPPLY_BORROW_HISTORY.length - 1 ? colors.textMuted : colors.success,
            fontSize: 13,
            opacity: stepIndex >= SUPPLY_BORROW_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= SUPPLY_BORROW_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевой вывод"
            value="HF = (Collateral * LiquidationThreshold) / Debt. При HF < 1 позиция подлежит ликвидации. Безопасная практика: держать HF > 1.5."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ATokenGrowthDiagram                                                  */
/* ================================================================== */

interface ATokenSnapshot {
  day: string;
  balance: string;
  balanceNum: number;
  rate: string;
  earned: string;
}

const ATOKEN_TIMELINE: ATokenSnapshot[] = [
  { day: 'День 0', balance: '10.000000', balanceNum: 10, rate: '2.5% APY', earned: '0.000000' },
  { day: 'День 30', balance: '10.006849', balanceNum: 10.006849, rate: '2.5% APY', earned: '0.006849' },
  { day: 'День 90', balance: '10.020548', balanceNum: 10.020548, rate: '2.5% APY', earned: '0.020548' },
  { day: 'День 180', balance: '10.041096', balanceNum: 10.041096, rate: '2.6% APY', earned: '0.041096' },
  { day: 'День 365', balance: '10.083333', balanceNum: 10.083333, rate: '2.7% APY', earned: '0.083333' },
  { day: 'Год 2', balance: '10.170139', balanceNum: 10.170139, rate: '2.8% APY', earned: '0.170139' },
];

/**
 * ATokenGrowthDiagram
 *
 * Static timeline showing aToken balance growth over time.
 * Demonstrates how aToken balance automatically increases
 * without any transactions (rebasing mechanism).
 */
export function ATokenGrowthDiagram() {
  const maxBalance = Math.max(...ATOKEN_TIMELINE.map((s) => s.balanceNum));
  const minBalance = ATOKEN_TIMELINE[0].balanceNum;
  const range = maxBalance - minBalance;

  return (
    <DiagramContainer title="aToken: баланс растет автоматически" color="purple">
      {/* Bar chart */}
      <div style={{
        display: 'flex',
        gap: 6,
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 120,
        marginBottom: 16,
        padding: '0 8px',
      }}>
        {ATOKEN_TIMELINE.map((snap, i) => {
          const heightPercent = 30 + (range > 0 ? ((snap.balanceNum - minBalance) / range) * 60 : 0);

          return (
            <DiagramTooltip key={i} content={`${snap.day}: aWETH баланс ${snap.balance}, APY ${snap.rate}, заработано +${snap.earned} ETH. Механизм: rebasing (balance = scaledBalance * liquidityIndex).`}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div style={{
                  fontSize: 8,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  marginBottom: 4,
                }}>
                  {snap.day}
                </div>
                <div style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  minHeight: 20,
                  borderRadius: '4px 4px 0 0',
                  background: `${colors.accent}60`,
                  transition: 'all 0.3s',
                }} />
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Balance label */}
      <div style={{
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 12,
        fontFamily: 'monospace',
        color: colors.textMuted,
      }}>
        aWETH: {ATOKEN_TIMELINE[0].balance} &rarr; {ATOKEN_TIMELINE[ATOKEN_TIMELINE.length - 1].balance} (+{ATOKEN_TIMELINE[ATOKEN_TIMELINE.length - 1].earned} ETH)
      </div>

      <DataBox
        label="Rebasing aTokens"
        value="Баланс aToken растет каждый блок без транзакций. Это реализуется через scaledBalance и liquidityIndex: balance = scaledBalance * liquidityIndex. Когда кто-то платит проценты, index растет."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
