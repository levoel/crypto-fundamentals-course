/**
 * Liquidation Diagrams (DEFI-07)
 *
 * Exports:
 * - HealthFactorGaugeDiagram: Interactive ETH price slider ($1000-$3000) showing HF gauge
 * - LiquidationStepThroughDiagram: Step-through liquidation scenario (6 steps, history array)
 * - LiquidationCascadeDiagram: Cascade/spiral visualization (DiagramTooltip)
 * - LiquidatorProfitDiagram: Static liquidator profit calculation breakdown
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  HealthFactorGaugeDiagram                                             */
/* ================================================================== */

/**
 * HealthFactorGaugeDiagram
 *
 * Interactive gauge that recalculates health factor as ETH price changes.
 * Scenario: 10 ETH collateral, 12,000 USDC debt.
 * WETH liquidation threshold = 82.5%.
 * Slider: ETH price from $1000 to $3000.
 */
export function HealthFactorGaugeDiagram() {
  const [ethPrice, setEthPrice] = useState(2000);

  const ethAmount = 10;
  const debtUSD = 12000;
  const liqThreshold = 0.825; // 82.5%

  const collateralUSD = ethAmount * ethPrice;
  const hf = (collateralUSD * liqThreshold) / debtUSD;
  const ltvUsed = debtUSD / collateralUSD;

  // Determine status
  const isLiquidated = hf < 1;
  const isDanger = hf >= 1 && hf < 1.2;
  const isWarning = hf >= 1.2 && hf < 1.5;
  const isSafe = hf >= 1.5;

  const statusColor = isLiquidated ? '#f43f5e' : isDanger ? '#f97316' : isWarning ? '#eab308' : colors.success;
  const statusLabel = isLiquidated ? 'LIQUIDATED' : isDanger ? 'DANGER' : isWarning ? 'WARNING' : 'SAFE';

  // Calculate liquidation price
  const liquidationPrice = debtUSD / (ethAmount * liqThreshold);

  // Gauge arc for SVG
  const gaugeW = 200;
  const gaugeH = 120;
  const cx = gaugeW / 2;
  const cy = 100;
  const radius = 80;

  // HF from 0 to 3 mapped to 180deg to 0deg (left to right arc)
  const clampedHF = Math.min(Math.max(hf, 0), 3);
  const angle = Math.PI - (clampedHF / 3) * Math.PI;
  const needleX = cx + radius * 0.7 * Math.cos(angle);
  const needleY = cy - radius * 0.7 * Math.sin(angle);

  return (
    <DiagramContainer title="Health Factor: интерактивный gauge" color="blue">
      {/* Gauge SVG */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={gaugeW} height={gaugeH} style={{ overflow: 'visible' }}>
          {/* Background arc segments */}
          {/* Red zone: HF 0 - 1 (180deg to 120deg) */}
          <path
            d={describeArc(cx, cy, radius, 120, 180)}
            fill="none"
            stroke="#f43f5e40"
            strokeWidth={12}
            strokeLinecap="round"
          />
          {/* Orange zone: HF 1 - 1.2 (120deg to 108deg) */}
          <path
            d={describeArc(cx, cy, radius, 108, 120)}
            fill="none"
            stroke="#f9731640"
            strokeWidth={12}
            strokeLinecap="round"
          />
          {/* Yellow zone: HF 1.2 - 1.5 (108deg to 90deg) */}
          <path
            d={describeArc(cx, cy, radius, 90, 108)}
            fill="none"
            stroke="#eab30840"
            strokeWidth={12}
            strokeLinecap="round"
          />
          {/* Green zone: HF 1.5 - 3 (90deg to 0deg) */}
          <path
            d={describeArc(cx, cy, radius, 0, 90)}
            fill="none"
            stroke={`${colors.success}40`}
            strokeWidth={12}
            strokeLinecap="round"
          />

          {/* HF = 1 marker */}
          <line
            x1={cx + radius * 0.65 * Math.cos(Math.PI * 2 / 3)}
            y1={cy - radius * 0.65 * Math.sin(Math.PI * 2 / 3)}
            x2={cx + radius * 0.95 * Math.cos(Math.PI * 2 / 3)}
            y2={cy - radius * 0.95 * Math.sin(Math.PI * 2 / 3)}
            stroke="#f43f5e"
            strokeWidth={2}
          />
          <text
            x={cx + radius * 0.55 * Math.cos(Math.PI * 2 / 3)}
            y={cy - radius * 0.55 * Math.sin(Math.PI * 2 / 3) + 4}
            fill="#f43f5e"
            fontSize={9}
            fontFamily="monospace"
            textAnchor="middle"
          >
            1.0
          </text>

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={statusColor}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={4} fill={statusColor} />

          {/* Scale labels */}
          <text x={cx - radius - 4} y={cy + 14} fill={colors.textMuted} fontSize={8} fontFamily="monospace" textAnchor="end">0</text>
          <text x={cx + radius + 4} y={cy + 14} fill={colors.textMuted} fontSize={8} fontFamily="monospace" textAnchor="start">3.0</text>

          {/* HF value in center */}
          <text x={cx} y={cy + 24} fill={statusColor} fontSize={18} fontWeight={700} fontFamily="monospace" textAnchor="middle">
            {hf.toFixed(3)}
          </text>
          <text x={cx} y={cy + 38} fill={statusColor} fontSize={10} fontFamily="monospace" textAnchor="middle">
            {statusLabel}
          </text>
        </svg>
      </div>

      {/* ETH Price Slider */}
      <div style={{ marginBottom: 16, padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
            ETH Price:
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'monospace',
            color: statusColor,
          }}>
            ${ethPrice.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={3000}
          step={10}
          value={ethPrice}
          onChange={(e) => setEthPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: colors.primary }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
          <span>$1,000</span>
          <span>$2,000</span>
          <span>$3,000</span>
        </div>
      </div>

      {/* Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 12,
      }}>
        <DiagramTooltip content="Health Factor > 2: безопасная зона. Collateral значительно превышает долг. Можно добавить ещё borrowing.">
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Collateral</div>
            <div style={{ fontSize: 13, color: colors.primary, fontFamily: 'monospace', fontWeight: 600 }}>${collateralUSD.toLocaleString()}</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Health Factor < 1: ЛИКВИДАЦИЯ. Liquidator может погасить до 50% долга и получить collateral с дисконтом (5-15% liquidation bonus).">
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Debt</div>
            <div style={{ fontSize: 13, color: '#f43f5e', fontFamily: 'monospace', fontWeight: 600 }}>${debtUSD.toLocaleString()}</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Health Factor 1-2: зона предупреждения. Волатильность может привести к ликвидации. Рекомендуется добавить collateral или погасить часть долга.">
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>LTV используемый</div>
            <div style={{ fontSize: 13, color: colors.accent, fontFamily: 'monospace', fontWeight: 600 }}>{(ltvUsed * 100).toFixed(1)}%</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Цена ликвидации: при достижении этой цены ETH позиция будет ликвидирована (HF < 1). Формула: debt / (collateral_amount * liq_threshold).">
          <div style={{
            ...glassStyle,
            padding: 10,
            background: isLiquidated ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLiquidated ? '#f43f5e30' : 'rgba(255,255,255,0.08)'}`,
          }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Цена ликвидации</div>
            <div style={{ fontSize: 13, color: '#f43f5e', fontFamily: 'monospace', fontWeight: 600 }}>${liquidationPrice.toFixed(0)}</div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Formula */}
      <div style={{ ...glassStyle, padding: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.primary, textAlign: 'center' }}>
          HF = (collateral * liq_threshold) / debt = ({collateralUSD.toLocaleString()} * 0.825) / {debtUSD.toLocaleString()} = {hf.toFixed(3)}
        </div>
      </div>

      <DataBox
        label="Health Factor"
        value="HF > 1.5: безопасно. HF 1.0-1.2: danger zone. HF < 1.0: позиция ликвидируется. Ликвидатор погашает часть долга и забирает залог с бонусом."
        variant="info"
      />
    </DiagramContainer>
  );
}

// Helper: SVG arc path
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(Math.PI - startRad);
  const y1 = cy - r * Math.sin(Math.PI - startRad);
  const x2 = cx + r * Math.cos(Math.PI - endRad);
  const y2 = cy - r * Math.sin(Math.PI - endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

/* ================================================================== */
/*  LiquidationStepThroughDiagram                                        */
/* ================================================================== */

interface LiqStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const LIQUIDATION_HISTORY: LiqStep[] = [
  {
    title: 'Начальная позиция',
    description: 'Bob депонирует 10 ETH при цене $2,000/ETH. Залог: $20,000. WETH liquidation threshold = 82.5%.',
    values: [
      { label: 'Collateral', value: '10 ETH = $20,000', color: colors.primary },
      { label: 'Debt', value: '$0', color: colors.textMuted },
      { label: 'Health Factor', value: 'Infinity', color: colors.success },
      { label: 'Liq. Threshold', value: '82.5%', color: '#eab308' },
    ],
    highlight: 'initial',
  },
  {
    title: 'Шаг 1: Bob берет займ',
    description: 'Bob занимает 12,000 USDC (60% LTV). Это консервативный займ -- далеко от лимита 80% LTV. Health Factor = (20000 * 0.825) / 12000 = 1.375.',
    values: [
      { label: 'Collateral (USD)', value: '$20,000', color: colors.primary },
      { label: 'Debt', value: '12,000 USDC', color: '#f43f5e' },
      { label: 'Health Factor', value: '1.375', color: colors.success },
      { label: 'LTV используемый', value: '60%', color: colors.accent },
    ],
    highlight: 'borrow',
  },
  {
    title: 'Шаг 2: ETH падает до $1,400',
    description: 'Крипторынок обваливается. ETH падает с $2,000 до $1,400 (-30%). Залог Bob обесценивается, но долг остается прежним. Health Factor пересчитывается.',
    values: [
      { label: 'ETH Price', value: '$2,000 -> $1,400', color: '#f43f5e' },
      { label: 'Collateral (USD)', value: '10 * $1,400 = $14,000', color: '#f43f5e' },
      { label: 'Debt', value: '12,000 USDC (неизменно)', color: '#f43f5e' },
      { label: 'Health Factor', value: '(14000*0.825)/12000 = 0.963', color: '#f43f5e' },
    ],
    highlight: 'drop',
  },
  {
    title: 'Шаг 3: HF < 1 -- ликвидация разрешена',
    description: 'Health Factor = 0.963 < 1.0. Позиция Bob теперь подлежит ликвидации. Любой адрес может вызвать liquidationCall() на Aave Pool. Close factor = 50%: ликвидатор может погасить до 50% долга.',
    values: [
      { label: 'Health Factor', value: '0.963 < 1.0', color: '#f43f5e' },
      { label: 'Close Factor', value: '50% = макс. 6,000 USDC', color: colors.accent },
      { label: 'Liquidation Bonus', value: '5% на WETH', color: colors.success },
      { label: 'Статус', value: 'LIQUIDATABLE', color: '#f43f5e' },
    ],
    highlight: 'eligible',
  },
  {
    title: 'Шаг 4: Ликвидатор действует',
    description: 'MEV-бот (ликвидатор) вызывает liquidationCall(). Он погашает 6,000 USDC долга Bob. Взамен получает WETH стоимостью 6,000 * 1.05 = $6,300 (включая 5% бонус). Это 6300/1400 = 4.5 ETH.',
    values: [
      { label: 'Долг погашен', value: '6,000 USDC', color: colors.success },
      { label: 'Collateral изъят', value: '4.5 ETH ($6,300)', color: '#f43f5e' },
      { label: 'Бонус ликвидатора', value: '5% = $300 прибыль', color: colors.success },
      { label: 'Gas + MEV', value: '~$10-50', color: colors.textMuted },
    ],
    highlight: 'liquidation',
  },
  {
    title: 'Шаг 5: Позиция после ликвидации',
    description: 'Bob потерял 4.5 ETH залога и 5% бонус ликвидатора. Его позиция уменьшилась, но стала здоровее. Если цена продолжит падать, возможна повторная ликвидация.',
    values: [
      { label: 'Collateral (осталось)', value: '5.5 ETH = $7,700', color: colors.primary },
      { label: 'Debt (осталось)', value: '6,000 USDC', color: '#f43f5e' },
      { label: 'Health Factor', value: '(7700*0.825)/6000 = 1.059', color: '#eab308' },
      { label: 'Потери Bob', value: '4.5 ETH + 5% бонус', color: '#f43f5e' },
    ],
    highlight: 'aftermath',
  },
];

/**
 * LiquidationStepThroughDiagram
 *
 * Step-through liquidation scenario with concrete numbers.
 * DiagramTooltip on step titles using description data.
 */
export function LiquidationStepThroughDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = LIQUIDATION_HISTORY[stepIndex];

  return (
    <DiagramContainer title="Ликвидация: пошаговый сценарий" color="purple">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {LIQUIDATION_HISTORY.map((_, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex
                ? (i >= 2 ? '#f43f5e' : colors.success)
                : 'rgba(255,255,255,0.1)',
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
          onClick={() => setStepIndex((s) => Math.min(LIQUIDATION_HISTORY.length - 1, s + 1))}
          disabled={stepIndex >= LIQUIDATION_HISTORY.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= LIQUIDATION_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= LIQUIDATION_HISTORY.length - 1 ? colors.textMuted : '#f43f5e',
            fontSize: 13,
            opacity: stepIndex >= LIQUIDATION_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= LIQUIDATION_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Урок"
            value="Ликвидация -- штраф за недостаточный залог. Bob потерял ~30% залога (4.5 из 10 ETH). Безопасная практика: держать HF > 1.5 и мониторить цены."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  LiquidationCascadeDiagram                                            */
/* ================================================================== */

interface CascadeEvent {
  step: number;
  trigger: string;
  effect: string;
  ethPrice: string;
  totalLiquidated: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tooltip: string;
}

const CASCADE_EVENTS: CascadeEvent[] = [
  {
    step: 1,
    trigger: 'ETH падает с $2,000 до $1,600',
    effect: 'Первая волна: ликвидируются позиции с HF~1.0 (высокий LTV)',
    ethPrice: '$1,600',
    totalLiquidated: '$50M',
    severity: 'low',
    tooltip: 'Каскадная ликвидация: первая волна. Ликвидируются позиции с наивысшим LTV. ETH: $1,600, $50M ликвидировано.',
  },
  {
    step: 2,
    trigger: 'Ликвидаторы продают ETH за USDC',
    effect: 'Давление на цену: продажи ликвидаторов усиливают падение ETH',
    ethPrice: '$1,450',
    totalLiquidated: '$200M',
    severity: 'medium',
    tooltip: 'Ликвидаторы продают полученный ETH на рынке, создавая дополнительное давление на цену. ETH: $1,450, $200M ликвидировано.',
  },
  {
    step: 3,
    trigger: 'ETH $1,450 -> еще больше позиций HF < 1',
    effect: 'Вторая волна: ликвидируются ранее безопасные позиции',
    ethPrice: '$1,300',
    totalLiquidated: '$500M',
    severity: 'high',
    tooltip: 'Вторая волна: ранее безопасные позиции достигают HF < 1. Самоусиливающийся цикл. ETH: $1,300, $500M ликвидировано.',
  },
  {
    step: 4,
    trigger: 'Gas spike до 500+ gwei, oracle delays',
    effect: 'Ликвидаторы не успевают, протокол накапливает bad debt',
    ethPrice: '$1,100',
    totalLiquidated: '$1B+',
    severity: 'critical',
    tooltip: 'Каскадная ликвидация: ликвидация крупных позиций продаёт collateral -> цена collateral падает -> другие позиции достигают HF < 1 -> ещё больше ликвидаций. Пример: Black Thursday (Mar 2020): ETH -43%.',
  },
];

const severityColors: Record<string, string> = {
  low: '#eab308',
  medium: '#f97316',
  high: '#f43f5e',
  critical: '#dc2626',
};

/**
 * LiquidationCascadeDiagram
 *
 * Visualization of cascading liquidations. DiagramTooltip replaces hoveredIdx.
 */
export function LiquidationCascadeDiagram() {
  return (
    <DiagramContainer title="Каскадная ликвидация: positive feedback loop" color="purple">
      {/* Spiral visualization */}
      <div style={{ marginBottom: 16 }}>
        {CASCADE_EVENTS.map((event, i) => {
          const sColor = severityColors[event.severity];

          return (
            <DiagramTooltip key={i} content={event.tooltip}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                {/* Step number */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `${sColor}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: sColor,
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                  {event.step}
                </div>

                {/* Bar */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    ...glassStyle,
                    padding: '8px 12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: sColor,
                      fontFamily: 'monospace',
                      marginBottom: 2,
                    }}>
                      {event.trigger}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: colors.text,
                      lineHeight: 1.4,
                    }}>
                      {event.effect}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: 16,
                      marginTop: 6,
                      fontSize: 10,
                      fontFamily: 'monospace',
                    }}>
                      <span style={{ color: colors.textMuted }}>ETH: <span style={{ color: sColor }}>{event.ethPrice}</span></span>
                      <span style={{ color: colors.textMuted }}>Liquidated: <span style={{ color: sColor }}>{event.totalLiquidated}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Feedback loop label */}
      <div style={{
        ...glassStyle,
        padding: 10,
        textAlign: 'center',
        marginBottom: 8,
        background: 'rgba(244,63,94,0.06)',
        border: '1px solid rgba(244,63,94,0.2)',
      }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#f43f5e' }}>
          Liquidation &rarr; Sell collateral &rarr; Price drop &rarr; More liquidations &rarr; ...
        </div>
      </div>

      <DataBox
        label="Black Thursday (12 марта 2020)"
        value="ETH упал на 43% за 24 часа. $8.3M bad debt в MakerDAO. Liquidation bots не справились с gas spikes. Урок: каскадные ликвидации -- системный риск DeFi."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  LiquidatorProfitDiagram                                              */
/* ================================================================== */

/**
 * LiquidatorProfitDiagram
 *
 * Static breakdown of liquidator profit calculation. DiagramTooltip on profit items.
 */
export function LiquidatorProfitDiagram() {
  // Scenario from the step-through:
  // 10 ETH at $1,400, 12,000 USDC debt, HF = 0.963
  // Close factor 50%, liquidation bonus 5%
  const debtRepaid = 6000;       // USDC
  const bonus = 0.05;             // 5%
  const ethPrice = 1400;
  const collateralValue = debtRepaid * (1 + bonus); // $6,300
  const collateralETH = collateralValue / ethPrice;  // 4.5 ETH
  const profitUSD = debtRepaid * bonus;              // $300
  const gasCost = 30;
  const netProfit = profitUSD - gasCost;

  const items = [
    { label: 'Долг погашен ликвидатором', value: `${debtRepaid.toLocaleString()} USDC`, color: '#f43f5e', isNegative: true, tooltip: 'Ликвидатор отправляет USDC в протокол для погашения части долга заёмщика. Close factor = 50% -- можно погасить до половины долга.' },
    { label: 'Collateral получен', value: `${collateralETH.toFixed(2)} ETH ($${collateralValue.toLocaleString()})`, color: colors.success, isNegative: false, tooltip: 'Ликвидатор получает collateral заёмщика с liquidation bonus. Стоимость: debt_repaid * (1 + bonus) = больше, чем было погашено.' },
    { label: 'Liquidation Bonus (5%)', value: `+$${profitUSD.toFixed(0)}`, color: colors.success, isNegative: false, tooltip: 'Liquidator profit = liquidation_bonus * debt_repaid. Для Aave: 5-15% bonus в зависимости от collateral type.' },
    { label: 'Gas cost (~200k gas)', value: `-$${gasCost}`, color: colors.textMuted, isNegative: true, tooltip: 'Gas cost для вызова liquidationCall(). При высоком gas price (500+ gwei) стоимость может превысить прибыль.' },
    { label: 'NET PROFIT', value: `$${netProfit.toFixed(0)}`, color: colors.success, isNegative: false, tooltip: 'Flash loan + liquidation = atomic profit без начального капитала. MEV-боты конкурируют через Flashbots и PGA за право ликвидации.' },
  ];

  return (
    <DiagramContainer title="Прибыль ликвидатора: разбор" color="green">
      {/* Profit breakdown */}
      <div style={{ marginBottom: 16 }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <div key={i}>
              {isLast && (
                <div style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.15)',
                  margin: '8px 0',
                }} />
              )}
              <DiagramTooltip content={item.tooltip}>
                <div style={{
                  ...glassStyle,
                  padding: '10px 14px',
                  marginBottom: isLast ? 0 : 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isLast ? `${colors.success}08` : 'transparent',
                  border: isLast ? `1px solid ${colors.success}30` : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{
                    fontSize: isLast ? 13 : 12,
                    fontFamily: 'monospace',
                    color: isLast ? colors.success : colors.text,
                    fontWeight: isLast ? 700 : 400,
                  }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: isLast ? 15 : 13,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: item.color,
                  }}>
                    {item.value}
                  </span>
                </div>
              </DiagramTooltip>
            </div>
          );
        })}
      </div>

      {/* Flash loan note */}
      <DiagramTooltip content="Flash loan + liquidation = atomic profit без начального капитала. Flash loan fee обычно 0.09% (Aave) или 0% (dYdX).">
        <div style={{
          ...glassStyle,
          padding: 10,
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.primary, textAlign: 'center' }}>
            Flash loan liquidation: ликвидатор берет 6,000 USDC flash loan, погашает долг, получает 4.5 ETH, продает ETH, возвращает flash loan. Profit = $300 - gas - flash fee.
          </div>
        </div>
      </DiagramTooltip>

      <DataBox
        label="MEV и ликвидации"
        value="Ликвидация -- одна из основных MEV-возможностей. Конкуренция между ботами сжимает прибыль. Flashbots и priority gas auction (PGA) -- инструменты MEV-ботов."
        variant="info"
      />
    </DiagramContainer>
  );
}
