/**
 * Derivatives Diagrams (DEFI-11)
 *
 * Exports:
 * - FundingRateDiagram: Perpetual funding rate mechanism (static with hover)
 * - LeverageLiquidationDiagram: Leverage and margin liquidation scenario (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  FundingRateDiagram                                                   */
/* ================================================================== */

interface FundingScenario {
  label: string;
  perpPrice: number;
  spotPrice: number;
  direction: 'longs_pay' | 'shorts_pay';
  description: string;
  detail: string;
}

const FUNDING_SCENARIOS: FundingScenario[] = [
  {
    label: 'Premium (Perp > Spot)',
    perpPrice: 2050,
    spotPrice: 2000,
    direction: 'longs_pay',
    description: 'Лонги платят шортам',
    detail: 'Цена перпетуала выше спота. Funding rate положительный. Лонги платят шортам каждые 8 часов, что стимулирует открытие шортов и давит цену перпетуала вниз к споту.',
  },
  {
    label: 'Discount (Perp < Spot)',
    perpPrice: 1960,
    spotPrice: 2000,
    direction: 'shorts_pay',
    description: 'Шорты платят лонгам',
    detail: 'Цена перпетуала ниже спота. Funding rate отрицательный. Шорты платят лонгам каждые 8 часов, что стимулирует открытие лонгов и поднимает цену перпетуала к споту.',
  },
  {
    label: 'Equilibrium (Perp = Spot)',
    perpPrice: 2000,
    spotPrice: 2000,
    direction: 'longs_pay',
    description: 'Funding rate ~ 0',
    detail: 'Цена перпетуала совпадает со спотом. Funding rate близок к нулю. Система в равновесии -- никто никому не платит.',
  },
];

const TIMELINE_HOURS = [0, 8, 16, 24, 32, 40, 48];

/**
 * FundingRateDiagram
 *
 * Shows perpetual funding rate mechanism: how periodic payments
 * between longs and shorts keep perp price anchored to spot.
 */
export function FundingRateDiagram() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const scenario = FUNDING_SCENARIOS[selectedIdx];
  const fr = ((scenario.perpPrice - scenario.spotPrice) / scenario.spotPrice) * 100;

  // Simulate price convergence over time
  const convergencePoints = TIMELINE_HOURS.map((h, i) => {
    const factor = 1 - (i / (TIMELINE_HOURS.length - 1)) * 0.8;
    const perpConverging = scenario.spotPrice + (scenario.perpPrice - scenario.spotPrice) * factor;
    return { hour: h, perp: perpConverging, spot: scenario.spotPrice };
  });

  const svgW = 460;
  const svgH = 160;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const allPrices = convergencePoints.flatMap((p) => [p.perp, p.spot]);
  const minP = Math.min(...allPrices) - 10;
  const maxP = Math.max(...allPrices) + 10;

  const toX = (i: number) => padL + (i / (convergencePoints.length - 1)) * chartW;
  const toY = (price: number) => padT + chartH - ((price - minP) / (maxP - minP)) * chartH;

  const perpPath = convergencePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(p.perp)}`).join(' ');
  const spotPath = convergencePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(p.spot)}`).join(' ');

  return (
    <DiagramContainer title="Funding Rate: \u043f\u0440\u0438\u0432\u044f\u0437\u043a\u0430 \u043a \u0441\u043f\u043e\u0442-\u0446\u0435\u043d\u0435" color="blue">
      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FUNDING_SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelectedIdx(i)}
            style={{
              ...glassStyle,
              padding: '8px 14px',
              cursor: 'pointer',
              background: selectedIdx === i ? `${colors.primary}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedIdx === i ? colors.primary : 'rgba(255,255,255,0.08)'}`,
              color: selectedIdx === i ? colors.primary : colors.textMuted,
              fontSize: 12,
              fontFamily: 'monospace',
              fontWeight: selectedIdx === i ? 600 : 400,
              borderRadius: 6,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Current scenario info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 8,
        marginBottom: 16,
      }}>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Spot Price</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: colors.success }}>
            ${scenario.spotPrice}
          </div>
        </div>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Perp Price</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#a78bfa' }}>
            ${scenario.perpPrice}
          </div>
        </div>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Funding Rate (8h)</div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: fr > 0 ? '#ef4444' : fr < 0 ? colors.success : colors.textMuted,
          }}>
            {fr > 0 ? '+' : ''}{fr.toFixed(3)}%
          </div>
        </div>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Направление</div>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'monospace',
            color: scenario.direction === 'longs_pay' ? '#ef4444' : colors.success,
          }}>
            {scenario.description}
          </div>
        </div>
      </div>

      {/* Price convergence chart */}
      <div style={{
        ...glassStyle,
        padding: 12,
        marginBottom: 16,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8, fontWeight: 600 }}>
          Сближение цен благодаря funding rate:
        </div>
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={padL}
              x2={svgW - padR}
              y1={padT + chartH * f}
              y2={padT + chartH * f}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4,4"
            />
          ))}

          {/* Spot line (dashed green) */}
          <path d={spotPath} fill="none" stroke={colors.success} strokeWidth={2} strokeDasharray="6,4" />

          {/* Perp line (solid purple) */}
          <path d={perpPath} fill="none" stroke="#a78bfa" strokeWidth={2} />

          {/* Data points */}
          {convergencePoints.map((p, i) => (
            <g key={i}>
              <circle
                cx={toX(i)}
                cy={toY(p.perp)}
                r={hoveredHour === i ? 5 : 3}
                fill="#a78bfa"
                style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                onMouseEnter={() => setHoveredHour(i)}
                onMouseLeave={() => setHoveredHour(null)}
              />
              <circle cx={toX(i)} cy={toY(p.spot)} r={3} fill={colors.success} />
            </g>
          ))}

          {/* X-axis labels */}
          {convergencePoints.map((p, i) => (
            <text
              key={i}
              x={toX(i)}
              y={svgH - 5}
              textAnchor="middle"
              fill={colors.textMuted}
              fontSize={10}
              fontFamily="monospace"
            >
              {p.hour}h
            </text>
          ))}

          {/* Y-axis labels */}
          {[minP, (minP + maxP) / 2, maxP].map((price, i) => (
            <text
              key={i}
              x={padL - 5}
              y={toY(price) + 4}
              textAnchor="end"
              fill={colors.textMuted}
              fontSize={10}
              fontFamily="monospace"
            >
              ${Math.round(price)}
            </text>
          ))}

          {/* Legend */}
          <line x1={padL + 10} x2={padL + 30} y1={padT - 5} y2={padT - 5} stroke="#a78bfa" strokeWidth={2} />
          <text x={padL + 35} y={padT - 1} fill="#a78bfa" fontSize={10} fontFamily="monospace">Perp</text>
          <line x1={padL + 90} x2={padL + 110} y1={padT - 5} y2={padT - 5} stroke={colors.success} strokeWidth={2} strokeDasharray="6,4" />
          <text x={padL + 115} y={padT - 1} fill={colors.success} fontSize={10} fontFamily="monospace">Spot</text>

          {/* Hover tooltip */}
          {hoveredHour !== null && (
            <g>
              <rect
                x={toX(hoveredHour) - 50}
                y={toY(convergencePoints[hoveredHour].perp) - 35}
                width={100}
                height={26}
                rx={4}
                fill="rgba(0,0,0,0.8)"
                stroke="rgba(255,255,255,0.1)"
              />
              <text
                x={toX(hoveredHour)}
                y={toY(convergencePoints[hoveredHour].perp) - 17}
                textAnchor="middle"
                fill="white"
                fontSize={10}
                fontFamily="monospace"
              >
                Perp: ${convergencePoints[hoveredHour].perp.toFixed(0)} | Spot: ${convergencePoints[hoveredHour].spot}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Detail */}
      <div style={{
        ...glassStyle,
        padding: 12,
        background: `${colors.primary}05`,
        border: `1px solid ${colors.primary}20`,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
          {scenario.detail}
        </div>
      </div>

      {/* Formula */}
      <DataBox label="Formula" mono>
        FR = (Perp_Price - Spot_Price) / Spot_Price * (interval / 8h){'\n'}
        Typical rate: ~0.01% per 8h (~11% annualized){'\n'}
        Payment every 8 hours between longs and shorts
      </DataBox>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  LeverageLiquidationDiagram                                          */
/* ================================================================== */

interface LeverageStep {
  priceChange: number;
  ethPrice: number;
  positionValue: number;
  pnl: number;
  marginRemaining: number;
  status: 'safe' | 'warning' | 'danger' | 'liquidated';
  description: string;
}

const INITIAL_MARGIN = 1000;
const LEVERAGE = 10;
const POSITION_SIZE = INITIAL_MARGIN * LEVERAGE; // $10,000
const ENTRY_PRICE = 2000;
const ETH_AMOUNT = POSITION_SIZE / ENTRY_PRICE; // 5 ETH
const MAINTENANCE_MARGIN_RATIO = 0.05;
const MAINTENANCE_MARGIN = POSITION_SIZE * MAINTENANCE_MARGIN_RATIO; // $500

const LEVERAGE_STEPS: LeverageStep[] = [
  {
    priceChange: 0,
    ethPrice: 2000,
    positionValue: 10000,
    pnl: 0,
    marginRemaining: 1000,
    status: 'safe',
    description: 'Entry: 10x leverage. $1,000 margin controls $10,000 position (5 ETH).',
  },
  {
    priceChange: -3,
    ethPrice: 1940,
    positionValue: 9700,
    pnl: -300,
    marginRemaining: 700,
    status: 'safe',
    description: 'ETH -3%: PnL = -$300. Margin $700 > maintenance $500. Safe.',
  },
  {
    priceChange: -5,
    ethPrice: 1900,
    positionValue: 9500,
    pnl: -500,
    marginRemaining: 500,
    status: 'warning',
    description: 'ETH -5%: PnL = -$500. Margin = maintenance ($500). Margin call!',
  },
  {
    priceChange: -8,
    ethPrice: 1840,
    positionValue: 9200,
    pnl: -800,
    marginRemaining: 200,
    status: 'danger',
    description: 'ETH -8%: PnL = -$800. Margin $200 < maintenance $500. Ликвидация неминуема.',
  },
  {
    priceChange: -10,
    ethPrice: 1800,
    positionValue: 9000,
    pnl: -1000,
    marginRemaining: 0,
    status: 'liquidated',
    description: 'ETH -10%: PnL = -$1,000 = ENTIRE margin. Позиция ликвидирована. 100% loss.',
  },
];

const STATUS_COLORS: Record<string, string> = {
  safe: colors.success,
  warning: '#eab308',
  danger: '#f97316',
  liquidated: '#ef4444',
};

/**
 * LeverageLiquidationDiagram
 *
 * Shows how 10x leverage amplifies losses: a 10% move = 100% margin loss.
 * Static with hover details for each price step.
 */
export function LeverageLiquidationDiagram() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const maxMargin = INITIAL_MARGIN;

  return (
    <DiagramContainer title="Leverage: \u043c\u0430\u0440\u0436\u0430 \u0438 \u043b\u0438\u043a\u0432\u0438\u0434\u0430\u0446\u0438\u044f" color="purple">
      {/* Position overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 8,
        marginBottom: 16,
      }}>
        {[
          { label: 'Leverage', value: '10x', color: '#a78bfa' },
          { label: 'Margin', value: '$1,000', color: colors.text },
          { label: 'Position', value: '$10,000', color: colors.primary },
          { label: 'Entry Price', value: '$2,000', color: colors.text },
          { label: 'ETH Amount', value: '5 ETH', color: colors.primary },
          { label: 'Maintenance', value: '$500 (5%)', color: '#eab308' },
        ].map((item, i) => (
          <div key={i} style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Margin bars */}
      <div style={{
        ...glassStyle,
        padding: 12,
        marginBottom: 16,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12, fontWeight: 600 }}>
          Margin level при падении ETH:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LEVERAGE_STEPS.map((step, i) => {
            const isHovered = hoveredStep === i;
            const barWidth = Math.max(0, (step.marginRemaining / maxMargin) * 100);
            const statusColor = STATUS_COLORS[step.status];
            const maintenanceLine = (MAINTENANCE_MARGIN / maxMargin) * 100;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 4,
                }}>
                  {/* Price change label */}
                  <div style={{
                    width: 70,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: isHovered ? statusColor : colors.textMuted,
                    textAlign: 'right',
                  }}>
                    {step.priceChange === 0 ? 'Entry' : `${step.priceChange}%`}
                  </div>

                  {/* Bar container */}
                  <div style={{
                    flex: 1,
                    height: 20,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Margin bar */}
                    <div style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      borderRadius: 4,
                      background: isHovered ? statusColor : `${statusColor}80`,
                      transition: 'all 0.3s',
                    }} />
                    {/* Maintenance margin line */}
                    <div style={{
                      position: 'absolute',
                      left: `${maintenanceLine}%`,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: '#eab308',
                      opacity: 0.6,
                    }} />
                  </div>

                  {/* Margin value */}
                  <div style={{
                    width: 60,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: statusColor,
                    textAlign: 'right',
                  }}>
                    ${step.marginRemaining}
                  </div>
                </div>

                {/* Hover detail */}
                {isHovered && (
                  <div style={{
                    ...glassStyle,
                    padding: 10,
                    marginLeft: 80,
                    marginBottom: 4,
                    background: `${statusColor}08`,
                    border: `1px solid ${statusColor}30`,
                    fontSize: 11,
                    color: colors.text,
                    lineHeight: 1.5,
                  }}>
                    <div>ETH: ${step.ethPrice} | Position: ${step.positionValue.toLocaleString()} | PnL: {step.pnl >= 0 ? '+' : ''}{step.pnl.toLocaleString()}</div>
                    <div style={{ marginTop: 4, color: colors.textMuted }}>{step.description}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ width: 12, height: 2, background: '#eab308' }} />
          <span style={{ fontSize: 10, color: colors.textMuted }}>Maintenance margin ($500)</span>
        </div>
      </div>

      {/* Key warning */}
      <DataBox label="Key Insight" mono>
        With 10x leverage, a 10% move against you = 100% loss.{'\n'}
        Liquidation price (long) = Entry * (1 - 1/Leverage){'\n'}
        = $2,000 * (1 - 1/10) = $2,000 * 0.9 = $1,800{'\n'}
        This is why leverage is the most dangerous tool in DeFi.
      </DataBox>
    </DiagramContainer>
  );
}
