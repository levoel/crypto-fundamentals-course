/**
 * AMM Concept Diagrams (DEFI-02)
 *
 * Exports:
 * - XYKCurveDiagram: Interactive xy=k hyperbola curve with swap amount slider
 * - SwapStepThroughDiagram: Step-through swap calculation with history array (6 steps)
 * - PriceImpactDiagram: Price impact visualization with interactive slider
 * - FeeAccumulationDiagram: Fee accumulation over time showing k growth (static with hover)
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  XYKCurveDiagram                                                     */
/* ================================================================== */

/**
 * XYKCurveDiagram
 *
 * Interactive xy=k hyperbola curve.
 * Slider controls swap amount (dx). Shows how point moves along the curve.
 * Displays reserves, k, price, output dynamically.
 */
export function XYKCurveDiagram() {
  const [dx, setDx] = useState(100);

  const x0 = 1000;
  const y0 = 1000;
  const k = x0 * y0; // 1,000,000

  const newX = x0 + dx;
  const newY = k / newX;
  const dy = y0 - newY;
  const price0 = y0 / x0;
  const priceAfter = newY / newX;

  // SVG curve points
  const svgW = 320;
  const svgH = 220;
  const padL = 40;
  const padB = 30;
  const padT = 10;
  const padR = 10;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const xMin = 200;
  const xMax = 2000;
  const yMin = 200;
  const yMax = 2000;

  const toSvgX = (xVal: number) => padL + ((xVal - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (yVal: number) => padT + plotH - ((yVal - yMin) / (yMax - yMin)) * plotH;

  const curvePoints = useMemo(() => {
    const points: string[] = [];
    for (let xv = xMin; xv <= xMax; xv += 10) {
      const yv = k / xv;
      if (yv >= yMin && yv <= yMax) {
        points.push(`${toSvgX(xv).toFixed(1)},${toSvgY(yv).toFixed(1)}`);
      }
    }
    return points.join(' ');
  }, []);

  const p0sx = toSvgX(x0);
  const p0sy = toSvgY(y0);
  const p1sx = toSvgX(newX);
  const p1sy = toSvgY(newY);

  return (
    <DiagramContainer title="Кривая xy = k: постоянное произведение" color="blue">
      {/* SVG curve */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <text x={padL + plotW / 2} y={svgH - 2} fill={colors.textMuted} fontSize={10} textAnchor="middle" fontFamily="monospace">Token A (x)</text>
          <text x={8} y={padT + plotH / 2} fill={colors.textMuted} fontSize={10} textAnchor="middle" fontFamily="monospace" transform={`rotate(-90, 8, ${padT + plotH / 2})`}>Token B (y)</text>

          {/* Curve */}
          <polyline points={curvePoints} fill="none" stroke={colors.primary} strokeWidth={2} />

          {/* Movement arrow */}
          {dx > 0 && (
            <line x1={p0sx} y1={p0sy} x2={p1sx} y2={p1sy} stroke={colors.accent} strokeWidth={1.5} strokeDasharray="4,3" markerEnd="url(#arrowhead)" />
          )}

          {/* Initial point */}
          <circle cx={p0sx} cy={p0sy} r={5} fill={colors.success} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />

          {/* New point */}
          {dx > 0 && (
            <circle cx={p1sx} cy={p1sy} r={5} fill={colors.accent} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
          )}

          {/* Labels */}
          <text x={p0sx + 8} y={p0sy - 8} fill={colors.success} fontSize={10} fontFamily="monospace">
            ({x0}, {y0})
          </text>
          {dx > 0 && (
            <text x={p1sx + 8} y={p1sy + 14} fill={colors.accent} fontSize={10} fontFamily="monospace">
              ({newX.toFixed(0)}, {newY.toFixed(0)})
            </text>
          )}

          {/* Arrow marker */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill={colors.accent} />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Slider */}
      <DiagramTooltip content="x * y = k: постоянное произведение. При свопе X -> Y: trader добавляет dx в пул X, забирает dy из пула Y, сохраняя k = (x+dx)(y-dy). Кривая никогда не касается осей -- бесконечная ликвидность (теоретически).">
        <div style={{ marginBottom: 16, padding: '0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
              Swap amount (dx):
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.accent, fontFamily: 'monospace' }}>
              {dx} Token A
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={500}
            value={dx}
            onChange={(e) => setDx(Number(e.target.value))}
            style={{ width: '100%', accentColor: colors.primary }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
            <span>1</span>
            <span>250</span>
            <span>500</span>
          </div>
        </div>
      </DiagramTooltip>

      {/* Computed values */}
      <DiagramTooltip content="Price impact: чем больше swap относительно liquidity pool, тем хуже цена. Для dx от x: dy = y * dx / (x + dx). Больше пул = меньше impact.">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Резервы до</div>
            <div style={{ fontSize: 12, color: colors.success, fontFamily: 'monospace' }}>x = {x0}, y = {y0}</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Резервы после</div>
            <div style={{ fontSize: 12, color: colors.accent, fontFamily: 'monospace' }}>x = {newX.toFixed(0)}, y = {newY.toFixed(0)}</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>k = x * y</div>
            <div style={{ fontSize: 12, color: colors.primary, fontFamily: 'monospace', fontWeight: 600 }}>{k.toLocaleString()} (const)</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Output (dy)</div>
            <div style={{ fontSize: 12, color: colors.accent, fontFamily: 'monospace', fontWeight: 600 }}>{dy.toFixed(2)} Token B</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Цена до (y/x)</div>
            <div style={{ fontSize: 12, color: colors.success, fontFamily: 'monospace' }}>{price0.toFixed(4)}</div>
          </div>
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Цена после</div>
            <div style={{ fontSize: 12, color: colors.accent, fontFamily: 'monospace' }}>{priceAfter.toFixed(4)}</div>
          </div>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SwapStepThroughDiagram                                              */
/* ================================================================== */

interface SwapStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const SWAP_HISTORY: SwapStep[] = [
  {
    title: 'Начальное состояние пула',
    description: 'Пул ETH/USDC содержит ликвидность. Текущая цена определяется соотношением резервов: 2,000,000 / 1,000 = 2,000 USDC за 1 ETH.',
    values: [
      { label: 'Reserve ETH (x)', value: '1,000', color: colors.primary },
      { label: 'Reserve USDC (y)', value: '2,000,000', color: colors.success },
      { label: 'k = x * y', value: '2,000,000,000', color: colors.accent },
      { label: 'Цена ETH', value: '2,000 USDC', color: colors.text },
    ],
    highlight: 'pool',
  },
  {
    title: 'Шаг 1: Trader отправляет 10 ETH',
    description: 'Trader хочет обменять 10 ETH на USDC. Он отправляет 10 ETH в смарт-контракт пула. AMM рассчитает, сколько USDC выдать.',
    values: [
      { label: 'Swap input (dx)', value: '10 ETH', color: colors.accent },
      { label: 'Направление', value: 'ETH → USDC', color: colors.primary },
      { label: 'Ожидаемая цена', value: '~2,000 USDC/ETH', color: colors.textMuted },
      { label: 'Ожидаемый output', value: '~20,000 USDC', color: colors.textMuted },
    ],
    highlight: 'input',
  },
  {
    title: 'Шаг 2: Вычет комиссии 0.3%',
    description: 'Перед расчетом AMM вычитает 0.3% комиссию. Комиссия остается в пуле и увеличивает долю LP. Расчет ведется от суммы после комиссии.',
    values: [
      { label: 'Input до комиссии', value: '10 ETH', color: colors.textMuted },
      { label: 'Комиссия (0.3%)', value: '0.03 ETH', color: '#f43f5e' },
      { label: 'dx после комиссии', value: '9.97 ETH', color: colors.accent },
      { label: 'Формула', value: 'dx * (1 - 0.003) = 9.97', color: colors.primary },
    ],
    highlight: 'fee',
  },
  {
    title: 'Шаг 3: Расчет по формуле xy = k',
    description: 'AMM использует формулу постоянного произведения. new_x = 1000 + 9.97 = 1009.97. new_y = k / new_x. dy = y - new_y. Это и есть output для trader.',
    values: [
      { label: 'new_x = x + dx_fee', value: '1,009.97 ETH', color: colors.primary },
      { label: 'new_y = k / new_x', value: '1,980,258.49 USDC', color: colors.success },
      { label: 'dy = y - new_y', value: '19,741.51 USDC', color: colors.accent },
      { label: 'Формула', value: 'dy = y*dx*997 / (x*1000+dx*997)', color: colors.primary },
    ],
    highlight: 'calculation',
  },
  {
    title: 'Шаг 4: Результат свопа',
    description: 'Trader получает 19,741.51 USDC за 10 ETH. Эффективная цена: 1,974.15 USDC/ETH вместо спотовой 2,000. Разница -- price impact, вызванный изменением соотношения резервов.',
    values: [
      { label: 'Trader получает', value: '19,741.51 USDC', color: colors.success },
      { label: 'Эффективная цена', value: '1,974.15 USDC/ETH', color: colors.accent },
      { label: 'Спотовая цена', value: '2,000 USDC/ETH', color: colors.textMuted },
      { label: 'Price impact', value: '-1.29%', color: '#f43f5e' },
    ],
    highlight: 'result',
  },
  {
    title: 'Шаг 5: Новое состояние пула',
    description: 'После свопа резервы изменились. Все 10 ETH (включая комиссию 0.03 ETH) остались в пуле. k слегка вырос, потому что комиссия осталась в пуле. LP заработали на этом свопе.',
    values: [
      { label: 'Reserve ETH', value: '1,010 ETH', color: colors.primary },
      { label: 'Reserve USDC', value: '1,980,258.49 USDC', color: colors.success },
      { label: 'Новый k', value: '2,000,061,075 (> старый k)', color: colors.accent },
      { label: 'Новая цена ETH', value: '1,960.65 USDC/ETH', color: colors.text },
    ],
    highlight: 'newstate',
  },
];

/**
 * SwapStepThroughDiagram
 *
 * Step-through swap calculation using history array pattern.
 * 6 steps with concrete numbers. Forward/backward/reset navigation.
 */
export function SwapStepThroughDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = SWAP_HISTORY[stepIndex];

  return (
    <DiagramContainer title="Swap: пошаговый расчет" color="green">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {SWAP_HISTORY.map((_, i) => (
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
          onClick={() => setStepIndex((s) => Math.min(SWAP_HISTORY.length - 1, s + 1))}
          disabled={stepIndex >= SWAP_HISTORY.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= SWAP_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= SWAP_HISTORY.length - 1 ? colors.textMuted : colors.success,
            fontSize: 13,
            opacity: stepIndex >= SWAP_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= SWAP_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевой вывод"
            value="k растет с каждым свопом за счет комиссий. LP зарабатывают, потому что их доля пула становится ценнее."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  PriceImpactDiagram                                                  */
/* ================================================================== */

/**
 * PriceImpactDiagram
 *
 * Interactive slider showing price impact for different swap sizes.
 * Pool: 1000 ETH / 2,000,000 USDC. Danger zone: >5% impact.
 */
export function PriceImpactDiagram() {
  const [swapAmount, setSwapAmount] = useState(10);

  const poolX = 1000; // ETH
  const poolY = 2_000_000; // USDC
  const spotPrice = poolY / poolX; // 2000

  // With 0.3% fee
  const dxFee = swapAmount * 0.997;
  const newX = poolX + dxFee;
  const newY = (poolX * poolY) / newX;
  const dy = poolY - newY;
  const effectivePrice = dy / swapAmount;
  const priceImpact = (swapAmount / (poolX + swapAmount)) * 100;

  // Chart data points
  const chartPoints = useMemo(() => {
    const points: { amount: number; impact: number }[] = [];
    const amounts = [0.1, 1, 5, 10, 20, 50, 100, 200, 300, 400, 500];
    for (const a of amounts) {
      points.push({ amount: a, impact: (a / (poolX + a)) * 100 });
    }
    return points;
  }, []);

  const svgW = 320;
  const svgH = 140;
  const padL = 40;
  const padB = 24;
  const padT = 10;
  const padR = 10;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxAmount = 500;
  const maxImpact = 35;

  const toSvgX = (a: number) => padL + (a / maxAmount) * plotW;
  const toSvgY = (imp: number) => padT + plotH - (imp / maxImpact) * plotH;

  const chartPath = chartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.amount).toFixed(1)},${toSvgY(p.impact).toFixed(1)}`)
    .join(' ');

  const isDanger = priceImpact > 5;
  const isWarning = priceImpact > 2 && priceImpact <= 5;

  return (
    <DiagramContainer title="Price Impact: влияние размера сделки" color="purple">
      {/* Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

          {/* Danger zone background (>5%) */}
          <rect
            x={padL}
            y={toSvgY(maxImpact)}
            width={plotW}
            height={toSvgY(5) - toSvgY(maxImpact)}
            fill="rgba(244,63,94,0.06)"
          />

          {/* 5% threshold line */}
          <line
            x1={padL}
            y1={toSvgY(5)}
            x2={padL + plotW}
            y2={toSvgY(5)}
            stroke="#f43f5e"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <text x={padL + plotW + 2} y={toSvgY(5) + 4} fill="#f43f5e" fontSize={9} fontFamily="monospace">5%</text>

          {/* Curve */}
          <path d={chartPath} fill="none" stroke={colors.accent} strokeWidth={2} />

          {/* Current point */}
          <circle
            cx={toSvgX(swapAmount)}
            cy={toSvgY(priceImpact)}
            r={5}
            fill={isDanger ? '#f43f5e' : isWarning ? '#eab308' : colors.success}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 2} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">Swap size (ETH)</text>
          <text x={6} y={padT + plotH / 2} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace" transform={`rotate(-90, 6, ${padT + plotH / 2})`}>Impact %</text>

          {/* Scale marks */}
          {[0, 100, 200, 300, 400, 500].map((v) => (
            <text key={v} x={toSvgX(v)} y={padT + plotH + 12} fill={colors.textMuted} fontSize={8} textAnchor="middle" fontFamily="monospace">{v}</text>
          ))}
          {[0, 5, 10, 15, 20, 25, 30, 35].filter((v) => v <= maxImpact).map((v) => (
            <text key={v} x={padL - 4} y={toSvgY(v) + 3} fill={colors.textMuted} fontSize={8} textAnchor="end" fontFamily="monospace">{v}%</text>
          ))}
        </svg>
      </div>

      {/* Slider */}
      <DiagramTooltip content="Малый swap (<1% от пула): price impact < 0.3%. Для retail trades -- незначительный slippage. Большой swap (>10% от пула): price impact > 3%. MEV bots отслеживают такие свопы для sandwich attacks.">
        <div style={{ marginBottom: 16, padding: '0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
              Swap amount:
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'monospace',
              color: isDanger ? '#f43f5e' : isWarning ? '#eab308' : colors.success,
            }}>
              {swapAmount} ETH
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={500}
            step={1}
            value={swapAmount}
            onChange={(e) => setSwapAmount(Number(e.target.value))}
            style={{ width: '100%', accentColor: colors.accent }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
            <span>1 ETH</span>
            <span>250 ETH</span>
            <span>500 ETH</span>
          </div>
        </div>
      </DiagramTooltip>

      {/* Values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Output</div>
          <div style={{ fontSize: 13, color: colors.success, fontFamily: 'monospace', fontWeight: 600 }}>{dy.toFixed(2)} USDC</div>
        </div>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Эффективная цена</div>
          <div style={{ fontSize: 13, color: colors.accent, fontFamily: 'monospace', fontWeight: 600 }}>{effectivePrice.toFixed(2)} USDC/ETH</div>
        </div>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Спотовая цена</div>
          <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: 'monospace' }}>{spotPrice.toFixed(2)} USDC/ETH</div>
        </div>
        <div style={{
          ...glassStyle,
          padding: 10,
          background: isDanger ? 'rgba(244,63,94,0.08)' : isWarning ? 'rgba(234,179,8,0.08)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isDanger ? '#f43f5e30' : isWarning ? '#eab30830' : 'rgba(255,255,255,0.08)'}`,
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Price impact</div>
          <div style={{
            fontSize: 13,
            fontFamily: 'monospace',
            fontWeight: 600,
            color: isDanger ? '#f43f5e' : isWarning ? '#eab308' : colors.success,
          }}>
            {priceImpact.toFixed(2)}% {isDanger ? '(DANGER)' : isWarning ? '(WARNING)' : '(OK)'}
          </div>
        </div>
      </div>

      {/* Formula */}
      <DiagramTooltip content="Формула price impact для constant product AMM. Чистая математика: чем больше dx относительно x, тем больше проскальзывание. Uniswap V3 решает это concentrated liquidity.">
        <div style={{ ...glassStyle, padding: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.primary, textAlign: 'center' }}>
            price_impact = dx / (x + dx) = {swapAmount} / ({poolX} + {swapAmount}) = {priceImpact.toFixed(4)}%
          </div>
        </div>
      </DiagramTooltip>

      <DataBox
        label="Защита от проскальзывания"
        value="Установите amountOutMin для ограничения максимального impact. amountOutMin = 0 -- классическая уязвимость (sandwich attack)."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  FeeAccumulationDiagram                                              */
/* ================================================================== */

interface FeeSwap {
  swap: string;
  direction: string;
  amount: string;
  fee: string;
  kBefore: number;
  kAfter: number;
}

const FEE_SWAPS: FeeSwap[] = [
  {
    swap: 'Swap 1',
    direction: '10 ETH → USDC',
    amount: '10 ETH',
    fee: '0.03 ETH',
    kBefore: 2_000_000_000,
    kAfter: 2_000_061_075,
  },
  {
    swap: 'Swap 2',
    direction: '5,000 USDC → ETH',
    amount: '5,000 USDC',
    fee: '15 USDC',
    kBefore: 2_000_061_075,
    kAfter: 2_000_099_262,
  },
  {
    swap: 'Swap 3',
    direction: '20 ETH → USDC',
    amount: '20 ETH',
    fee: '0.06 ETH',
    kBefore: 2_000_099_262,
    kAfter: 2_000_343_891,
  },
  {
    swap: 'Swap 4',
    direction: '50,000 USDC → ETH',
    amount: '50,000 USDC',
    fee: '150 USDC',
    kBefore: 2_000_343_891,
    kAfter: 2_001_861_420,
  },
  {
    swap: 'Swap 5',
    direction: '100 ETH → USDC',
    amount: '100 ETH',
    fee: '0.3 ETH',
    kBefore: 2_001_861_420,
    kAfter: 2_007_899_534,
  },
];

const MAX_K = Math.max(...FEE_SWAPS.map((s) => s.kAfter));
const MIN_K = FEE_SWAPS[0].kBefore;

/**
 * FeeAccumulationDiagram
 *
 * Timeline of 5 swaps showing k growing monotonically.
 * Bar chart + hover details.
 */
export function FeeAccumulationDiagram() {
  // Normalize for bar height (start from MIN_K to emphasize growth)
  const kRange = MAX_K - MIN_K;

  return (
    <DiagramContainer title="Комиссии: как растет k" color="green">
      {/* Bar chart */}
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 140,
        marginBottom: 16,
        padding: '0 8px',
      }}>
        {/* Initial k bar */}
        <DiagramTooltip content="Начальное значение k = x * y. Константа пула до первого свопа. Все последующие свопы будут увеличивать k за счёт комиссий.">
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
            <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Initial
            </div>
            <div style={{
              width: '100%',
              height: '20%',
              minHeight: 20,
              borderRadius: '4px 4px 0 0',
              background: 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }} />
          </div>
        </DiagramTooltip>

        {FEE_SWAPS.map((swap, i) => {
          const heightPercent = 20 + ((swap.kAfter - MIN_K) / kRange) * 70;

          return (
            <DiagramTooltip key={i} content={`${swap.swap}: ${swap.direction}. Комиссия: ${swap.fee}. Рост k: +${(swap.kAfter - swap.kBefore).toLocaleString()} (${swap.kBefore.toLocaleString()} -> ${swap.kAfter.toLocaleString()}).`}>
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
                  fontSize: 9,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  marginBottom: 4,
                }}>
                  {swap.swap.replace('Swap ', '#')}
                </div>
                <div style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  minHeight: 20,
                  borderRadius: '4px 4px 0 0',
                  background: `${colors.success}60`,
                  transition: 'all 0.3s',
                }} />
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* K value label */}
      <div style={{
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 12,
        fontFamily: 'monospace',
        color: colors.textMuted,
      }}>
        k: {MIN_K.toLocaleString()} → {MAX_K.toLocaleString()} (+{((MAX_K - MIN_K) / MIN_K * 100).toFixed(4)}%)
      </div>

      <DataBox
        label="Монотонный рост k"
        value="k никогда не уменьшается. Комиссии остаются в пуле и увеличивают k. Доля LP в растущем пуле -- это заработок провайдеров ликвидности."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
