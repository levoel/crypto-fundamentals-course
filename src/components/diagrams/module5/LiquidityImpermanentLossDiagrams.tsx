/** @jsxImportSource solid-js */
/**
 * Liquidity & Impermanent Loss Diagrams (DEFI-05)
 *
 * Exports:
 * - ILCalculatorDiagram: Interactive IL calculator with slider (r = 0.1 to 10)
 * - ILFormulaDerivationDiagram: Step-through IL formula derivation (6 steps, history array)
 * - FeeVsILBreakevenDiagram: Fee revenue vs IL break-even chart (DiagramTooltip on HTML legend)
 * - PositionManagementFlowDiagram: LP position management flow (DiagramTooltip on steps)
 */

import { createMemo, createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ILCalculatorDiagram                                                  */
/* ================================================================== */

function calcIL(r: number): number {
  return (2 * Math.sqrt(r)) / (1 + r) - 1;
}

const IL_REFERENCE = [
  { r: 1.25, label: '+25%' },
  { r: 1.5, label: '+50%' },
  { r: 2.0, label: '2x' },
  { r: 3.0, label: '3x' },
  { r: 5.0, label: '5x' },
  { r: 0.5, label: '-50%' },
  { r: 0.2, label: '-80%' },
];

/**
 * ILCalculatorDiagram
 *
 * Interactive slider: r = 0.1 to 10. Shows IL, LP vs HODL value.
 */
export function ILCalculatorDiagram() {
  const [rSlider, setRSlider] = createSignal(200); // r * 100 for integer slider
  const r = rSlider() / 100;
  const il = calcIL(r);

  const initialETHPrice = 2000;
  const finalETHPrice = initialETHPrice * r;

  // Assume equal-value deposit: 1 ETH + 2000 USDC
  const hodlValue = 1 * finalETHPrice + 2000;
  const lpValue = hodlValue * (1 + il);

  const ilPercent = (il * 100).toFixed(2);
  const ilColor = Math.abs(il) < 0.02 ? colors.success : Math.abs(il) < 0.10 ? '#eab308' : '#f43f5e';

  // Chart points
  const svgW = 320;
  const svgH = 140;
  const padL = 40;
  const padB = 24;
  const padT = 10;
  const padR = 10;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const chartPoints = createMemo(() => {
    const pts: string[] = [];
    for (let rv = 10; rv <= 1000; rv += 5) {
      const rr = rv / 100;
      const ilVal = calcIL(rr) * 100;
      const x = padL + ((rr - 0.1) / (10 - 0.1)) * plotW;
      const y = padT + plotH - ((ilVal + 60) / 60) * plotH; // range: -60% to 0%
      if (y > padT && y < padT + plotH) {
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
    }
    return pts.join(' ');
  });

  // Current point on chart
  const curX = padL + ((r - 0.1) / (10 - 0.1)) * plotW;
  const curY = padT + plotH - ((il * 100 + 60) / 60) * plotH;

  return (
    <DiagramContainer title="Калькулятор impermanent loss" color="blue">
      {/* Chart */}
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '16px' }}>
        <svg width={svgW} height={svgH} style={{ 'overflow': 'visible' }}>
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

          {/* 0% line */}
          <line x1={padL} y1={padT} x2={padL + plotW} y2={padT} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4,4" />

          {/* IL curve */}
          <polyline points={chartPoints} fill="none" stroke="#f43f5e" strokeWidth={2} />

          {/* Current point */}
          <circle cx={curX} cy={curY} r={5} fill={ilColor} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 2} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            Price ratio (r)
          </text>
          <text x={6} y={padT + plotH / 2} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace" transform={`rotate(-90, 6, ${padT + plotH / 2})`}>
            IL %
          </text>

          {/* Scale */}
          {[0.5, 1, 2, 5, 10].map((v) => (
            <text x={padL + ((v - 0.1) / (10 - 0.1)) * plotW} y={padT + plotH + 14} fill={colors.textMuted} fontSize={8} textAnchor="middle" fontFamily="monospace">
              {v}x
            </text>
          ))}
          {[0, -10, -20, -30, -40, -50].map((v) => (
            <text x={padL - 4} y={padT + plotH - ((v + 60) / 60) * plotH + 3} fill={colors.textMuted} fontSize={8} textAnchor="end" fontFamily="monospace">
              {v}%
            </text>
          ))}
        </svg>
      </div>

      {/* Slider */}
      <div style={{ 'margin-bottom': '16px', 'padding': '0 8px' }}>
        <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'margin-bottom': '6px' }}>
          <DiagramTooltip content="Price ratio: отношение текущей цены к цене при deposit. ratio = 2 означает цена удвоилась. IL зависит ТОЛЬКО от price ratio, не от направления.">
            <span style={{ 'font-size': '12px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
              Price ratio (r):
            </span>
          </DiagramTooltip>
          <span style={{ 'font-size': '13px', 'font-weight': '600', 'color': ilColor, 'font-family': 'monospace' }}>
            {r.toFixed(2)}x (ETH: ${finalETHPrice.toFixed(0)})
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={1000}
          value={rSlider()}
          onChange={(e) => setRSlider(Number(e.target.value))}
          style={{ 'width': '100%', 'accent-color': colors.primary }}
        />
        <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
          <span>0.1x</span>
          <span>1x</span>
          <span>5x</span>
          <span>10x</span>
        </div>
      </div>

      {/* Values */}
      <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '8px', 'margin-bottom': '12px' }}>
        <DiagramTooltip content="Impermanent Loss: разница между стоимостью LP позиции и HODL. Всегда <= 0%. Становится 'permanent' только при выводе ликвидности из пула.">
          <div style={{
            ...glassStyle,
            'padding': '10px',
            'background': `${ilColor}08`,
            'border': `1px solid ${ilColor}30`,
          }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Impermanent Loss
            </div>
            <div style={{ 'font-size': '16px', 'color': ilColor, 'font-family': 'monospace', 'font-weight': '700' }}>
              {ilPercent}%
            </div>
          </div>
        </DiagramTooltip>
        <div style={{ ...glassStyle, 'padding': '10px' }}>
          <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
            Price ratio
          </div>
          <div style={{ 'font-size': '14px', 'color': colors.text, 'font-family': 'monospace', 'font-weight': '600' }}>
            r = {r.toFixed(2)}
          </div>
        </div>
        <DiagramTooltip content="HODL value: стоимость, если бы просто держали оба токена без предоставления ликвидности. V_hodl = x * P_new + y.">
          <div style={{ ...glassStyle, 'padding': '10px' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              HODL value
            </div>
            <div style={{ 'font-size': '13px', 'color': colors.success, 'font-family': 'monospace', 'font-weight': '600' }}>
              ${hodlValue.toFixed(0)}
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="LP value (до комиссий): стоимость позиции в пуле. V_lp = 2*sqrt(k*P). Разница с HODL = impermanent loss. Комиссии могут компенсировать IL.">
          <div style={{ ...glassStyle, 'padding': '10px' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              LP value (before fees)
            </div>
            <div style={{ 'font-size': '13px', 'color': colors.accent, 'font-family': 'monospace', 'font-weight': '600' }}>
              ${lpValue.toFixed(0)}
            </div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Reference table */}
      <DiagramTooltip content="IL формула: IL = 2*sqrt(price_ratio) / (1 + price_ratio) - 1. При 2x цене: IL = -5.7%. При 5x: IL = -25.5%. IL = 0% только если цена вернулась к исходной.">
        <div style={{ ...glassStyle, 'padding': '10px', 'margin-bottom': '8px' }}>
          <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '6px' }}>
            Референсные значения:
          </div>
          <div style={{ 'display': 'flex', 'flex-wrap': 'wrap', 'gap': '6px' }}>
            {IL_REFERENCE.map((ref) => {
              const refIL = calcIL(ref.r);
              const refColor = Math.abs(refIL) < 0.02 ? colors.success : Math.abs(refIL) < 0.10 ? '#eab308' : '#f43f5e';
              return (
                <div style={{ 'font-size': '10px', 'font-family': 'monospace' }}>
                  <span style={{ 'color': colors.textMuted }}>{ref.label}:</span>{' '}
                  <span style={{ 'color': refColor, 'font-weight': '600' }}>{(refIL * 100).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </DiagramTooltip>

      <DataBox
        label="Формула"
        value="IL = 2*sqrt(r) / (1 + r) - 1, где r = P_new / P_initial. IL симметричен: 2x вверх и 2x вниз дают одинаковый IL (-5.7%)."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ILFormulaDerivationDiagram                                           */
/* ================================================================== */

interface DerivationStep {
  title: string;
  description: string;
  formula: string;
  detail: string;
  tooltipRu: string;
}

const DERIVATION_STEPS: DerivationStep[] = [
  {
    title: 'Начальные условия',
    description: 'LP вносит равную стоимость: x токенов A и y токенов B. Начальная цена P = y/x (1 A = P единиц B). Общая стоимость позиции = 2*x*P.',
    formula: 'V_initial = x * P + y = 2 * x * P  (так как y = x * P)',
    detail: 'Пример: 1 ETH ($2000) + 2000 USDC = $4000',
    tooltipRu: 'Начальные условия: LP вносит равную стоимость обоих токенов. V_initial = 2*x*P. Это базовая точка для расчёта IL.',
  },
  {
    title: 'Шаг 1: Цена меняется на r',
    description: 'Цена A меняется: P_new = r * P (ratio r = P_new / P). Арбитражеры выравнивают пул с рыночной ценой. Инвариант xy = k сохраняется.',
    formula: 'r = P_new / P,   x * y = k (constant)',
    detail: 'r = 2.0 означает цена ETH удвоилась: $2000 -> $4000',
    tooltipRu: 'Изменение цены: арбитражеры выравнивают пул с рыночной ценой. Инвариант xy = k (constant product) сохраняется всегда.',
  },
  {
    title: 'Шаг 2: Ребалансировка пула',
    description: 'После арбитража резервы пула изменились. Из xy = k и price = y/x = P*r выводим новые резервы.',
    formula: 'x_new = x / sqrt(r),   y_new = y * sqrt(r)',
    detail: 'При r=2: x_new = 1/1.414 = 0.707 ETH, y_new = 2000*1.414 = 2828 USDC',
    tooltipRu: 'Ребалансировка: из xy = k и price = y/x = P*r выводим новые резервы. x_new уменьшается, y_new увеличивается при росте цены.',
  },
  {
    title: 'Шаг 3: Стоимость LP vs HODL',
    description: 'Сравниваем стоимость позиции в пуле (V_lp) со стоимостью простого хранения (V_hodl).',
    formula: 'V_lp = x_new * P_new + y_new = x*P*2*sqrt(r)\nV_hodl = x * P_new + y = x*P*(1+r)',
    detail: 'V_lp = 2*2000*1.414 = $5657, V_hodl = 4000 + 2000 = $6000',
    tooltipRu: 'Сравнение стоимости: V_lp (позиция в пуле) vs V_hodl (просто хранение). Разница = impermanent loss.',
  },
  {
    title: 'Шаг 4: Формула IL',
    description: 'IL = V_lp / V_hodl - 1. Подставляем и упрощаем:',
    formula: 'IL = V_lp/V_hodl - 1 = 2*sqrt(r)/(1+r) - 1',
    detail: 'IL = 2*1.414/3 - 1 = 2.828/3 - 1 = 0.943 - 1 = -0.057 = -5.7%',
    tooltipRu: 'Вывод IL: сравниваем V_pool (стоимость LP позиции) с V_hold (стоимость если бы просто держали). V_pool = 2*sqrt(k*P) где k = x*y, P = price. V_hold = x_0*P + y_0.',
  },
  {
    title: 'Шаг 5: Ключевые свойства',
    description: 'IL всегда <= 0 (это потеря). IL = 0 только при r = 1 (цена не изменилась). IL симметричен: r = 2 и r = 0.5 дают одинаковый IL (-5.7%).',
    formula: 'IL(r) = 2*sqrt(r)/(1+r) - 1 <= 0 для всех r > 0\nIL(r) = IL(1/r)  (симметрия)',
    detail: 'IL -- это не потеря депозита, а упущенная выгода vs HODL. Становится "permanent" только при выводе.',
    tooltipRu: 'Ключевые свойства: IL всегда <= 0, IL = 0 только при r = 1, IL симметричен (IL(r) = IL(1/r)). IL -- упущенная выгода vs HODL.',
  },
];

/**
 * ILFormulaDerivationDiagram
 *
 * Step-through IL formula derivation. 6 steps, history array.
 */
export function ILFormulaDerivationDiagram() {
  const [stepIndex, setStepIndex] = createSignal(0);
  const step = DERIVATION_STEPS[stepIndex()];

  return (
    <DiagramContainer title="Вывод формулы impermanent loss" color="green">
      {/* Step progress */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {DERIVATION_STEPS.map((_, i) => (
          <div
            onClick={() => setStepIndex(i)}
            style={{
              'flex': '1',
              'height': '4px',
              'border-radius': '2px',
              'cursor': 'pointer',
              'background': i <= stepIndex() ? colors.success : 'rgba(255,255,255,0.1)',
              'transition': 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Title */}
      <DiagramTooltip content={step.tooltipRu}>
        <div style={{ 'font-size': '14px', 'font-weight': '600', 'color': colors.text, 'margin-bottom': '8px', 'font-family': 'monospace' }}>
          {step.title}
        </div>
      </DiagramTooltip>

      {/* Description */}
      <div style={{ 'font-size': '13px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '12px' }}>
        {step.description}
      </div>

      {/* Formula box */}
      <div style={{
        ...glassStyle,
        'padding': '12px',
        'margin-bottom': '12px',
        'background': 'rgba(34,197,94,0.06)',
        'border': '1px solid rgba(34,197,94,0.2)',
      }}>
        <div style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': colors.success, 'white-space': 'pre-line', 'text-align': 'center' }}>
          {step.formula}
        </div>
      </div>

      {/* Numerical example */}
      <div style={{ ...glassStyle, 'padding': '10px', 'margin-bottom': '16px' }}>
        <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
          Числовой пример (r = 2.0):
        </div>
        <div style={{ 'font-size': '12px', 'color': colors.accent, 'font-family': 'monospace' }}>
          {step.detail}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center' }}>
        <button
          onClick={() => setStepIndex(0)}
          style={{ ...glassStyle, 'padding': '8px 16px', 'cursor': 'pointer', 'color': colors.text, 'font-size': '13px' }}
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
          onClick={() => setStepIndex((s) => Math.min(DERIVATION_STEPS.length - 1, s + 1))}
          disabled={stepIndex() >= DERIVATION_STEPS.length - 1}
          style={{
            ...glassStyle,
            'padding': '8px 20px',
            'cursor': stepIndex() >= DERIVATION_STEPS.length - 1 ? 'not-allowed' : 'pointer',
            'color': stepIndex() >= DERIVATION_STEPS.length - 1 ? colors.textMuted : colors.success,
            'font-size': '13px',
            'opacity': stepIndex() >= DERIVATION_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex() >= DERIVATION_STEPS.length - 1 && (
        <div style={{ 'margin-top': '12px' }}>
          <DataBox
            label="Финальная формула"
            value="IL(r) = 2*sqrt(r)/(1+r) - 1. Запомните: это ВСЕГДА потеря (<=0). При r=1 IL=0. Symmetric: IL(2) = IL(0.5) = -5.7%."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  FeeVsILBreakevenDiagram                                              */
/* ================================================================== */

/**
 * FeeVsILBreakevenDiagram
 *
 * Static chart: IL curve (red) vs fee revenue line (green).
 * Shaded profitable/loss zones. HTML legend with DiagramTooltip.
 */
export function FeeVsILBreakevenDiagram() {
  const svgW = 320;
  const svgH = 180;
  const padL = 44;
  const padB = 28;
  const padT = 12;
  const padR = 10;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const rMin = 0.5;
  const rMax = 3.0;
  const yMin = -20; // %
  const yMax = 10; // %

  const toSvgX = (r: number) => padL + ((r - rMin) / (rMax - rMin)) * plotW;
  const toSvgY = (pct: number) => padT + plotH - ((pct - yMin) / (yMax - yMin)) * plotH;

  const feeAPR = 5; // 5% annual fee revenue

  // IL curve points
  const ilCurve = createMemo(() => {
    const pts: string[] = [];
    for (let rv = 50; rv <= 300; rv += 2) {
      const rr = rv / 100;
      const il = calcIL(rr) * 100;
      pts.push(`${toSvgX(rr).toFixed(1)},${toSvgY(il).toFixed(1)}`);
    }
    return pts.join(' ');
  });

  // Fee line (flat)
  const feeLine = `${toSvgX(rMin).toFixed(1)},${toSvgY(feeAPR).toFixed(1)} ${toSvgX(rMax).toFixed(1)},${toSvgY(feeAPR).toFixed(1)}`;

  // Profitable zone polygon (where fee > |IL|, i.e., fee + IL > 0)
  const profitZone = createMemo(() => {
    const pts: string[] = [];
    for (let rv = 50; rv <= 300; rv += 2) {
      const rr = rv / 100;
      const il = calcIL(rr) * 100;
      const net = feeAPR + il;
      if (net > 0) {
        pts.push(`${toSvgX(rr).toFixed(1)},${toSvgY(feeAPR).toFixed(1)}`);
      }
    }
    // Close with IL curve going back
    for (let rv = 300; rv >= 50; rv -= 2) {
      const rr = rv / 100;
      const il = calcIL(rr) * 100;
      const net = feeAPR + il;
      if (net > 0) {
        pts.push(`${toSvgX(rr).toFixed(1)},${toSvgY(il).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  });

  return (
    <DiagramContainer title="Комиссии vs Impermanent Loss: точка безубыточности" color="purple">
      {/* Chart */}
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '16px' }}>
        <svg width={svgW} height={svgH} style={{ 'overflow': 'visible' }}>
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

          {/* 0% line */}
          <line x1={padL} y1={toSvgY(0)} x2={padL + plotW} y2={toSvgY(0)} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4,4" />

          {/* Profitable zone */}
          <polygon
            points={profitZone}
            fill="rgba(34,197,94,0.1)"
          />

          {/* IL curve (red) */}
          <polyline points={ilCurve} fill="none" stroke="#f43f5e" strokeWidth={2} />

          {/* Fee line (green) */}
          <polyline points={feeLine} fill="none" stroke={colors.success} strokeWidth={2} strokeDasharray="6,3" />

          {/* Labels */}
          <text x={padL + plotW - 5} y={toSvgY(feeAPR) - 6} fill={colors.success} fontSize={9} textAnchor="end" fontFamily="monospace">
            Fee APR ({feeAPR}%)
          </text>
          <text x={padL + 8} y={toSvgY(-14)} fill="#f43f5e" fontSize={9} fontFamily="monospace">
            IL curve
          </text>
          <text x={padL + plotW / 2} y={toSvgY(3)} fill={colors.success} fontSize={9} textAnchor="middle" fontFamily="monospace" opacity={0.6}>
            Profit zone
          </text>

          {/* X axis labels */}
          {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((v) => (
            <text x={toSvgX(v)} y={padT + plotH + 14} fill={colors.textMuted} fontSize={8} textAnchor="middle" fontFamily="monospace">
              {v}x
            </text>
          ))}
          {/* Y axis labels */}
          {[-15, -10, -5, 0, 5].map((v) => (
            <text x={padL - 4} y={toSvgY(v) + 3} fill={colors.textMuted} fontSize={8} textAnchor="end" fontFamily="monospace">
              {v}%
            </text>
          ))}

          {/* Axis titles */}
          <text x={padL + plotW / 2} y={svgH - 2} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            Price ratio
          </text>
        </svg>
      </div>

      {/* HTML Zone Legend with DiagramTooltip (replaces SVG polygon hover) */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '12px' }}>
        <DiagramTooltip content="Зона прибыли: fee income > IL. LP зарабатывает. Характерно для высокообъёмных пар (ETH/USDC) с узкой волатильностью.">
          <div style={{
            ...glassStyle,
            'padding': '8px 12px',
            'flex': '1',
            'display': 'flex',
            'align-items': 'center',
            'gap': '8px',
          }}>
            <div style={{ 'width': '12px', 'height': '12px', 'border-radius': '2px', 'background': 'rgba(34,197,94,0.3)', 'flex-shrink': '0' }} />
            <span style={{ 'font-size': '11px', 'font-family': 'monospace', 'color': colors.success, 'font-weight': '600' }}>Зона прибыли</span>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Зона убытка: IL > fee income. LP теряет деньги vs holding. Характерно для волатильных пар с низким объёмом торгов.">
          <div style={{
            ...glassStyle,
            'padding': '8px 12px',
            'flex': '1',
            'display': 'flex',
            'align-items': 'center',
            'gap': '8px',
          }}>
            <div style={{ 'width': '12px', 'height': '12px', 'border-radius': '2px', 'background': 'rgba(244,63,94,0.3)', 'flex-shrink': '0' }} />
            <span style={{ 'font-size': '11px', 'font-family': 'monospace', 'color': '#f43f5e', 'font-weight': '600' }}>Зона убытка</span>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Точка безубыточности: fee income = IL. Зависит от объёма торгов, волатильности и размера пула.">
          <div style={{
            ...glassStyle,
            'padding': '8px 12px',
            'flex': '1',
            'display': 'flex',
            'align-items': 'center',
            'gap': '8px',
          }}>
            <div style={{ 'width': '12px', 'height': '2px', 'background': '#eab308', 'flex-shrink': '0' }} />
            <span style={{ 'font-size': '11px', 'font-family': 'monospace', 'color': '#eab308', 'font-weight': '600' }}>Breakeven</span>
          </div>
        </DiagramTooltip>
      </div>

      {/* Key insight */}
      <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '8px', 'margin-bottom': '12px' }}>
        <DiagramTooltip content="Стейблкоин-пары (USDC/DAI): волатильность ~0.1%, IL минимальный. Комиссии стабильны. Идеально для консервативных LP.">
          <div style={{
            ...glassStyle,
            'padding': '10px',
            'background': 'rgba(34,197,94,0.06)',
            'border': '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ 'font-size': '10px', 'color': colors.success, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Идеальные пулы для LP
            </div>
            <div style={{ 'font-size': '11px', 'color': colors.text, 'line-height': '1.4' }}>
              Стейблкоины (USDC/DAI): низкий IL, стабильные комиссии
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Мем-токены и новые проекты: волатильность может превышать 50-100% за день. IL легко превышает комиссии. Высокий APR не компенсирует потерь.">
          <div style={{
            ...glassStyle,
            'padding': '10px',
            'background': 'rgba(244,63,94,0.06)',
            'border': '1px solid rgba(244,63,94,0.2)',
          }}>
            <div style={{ 'font-size': '10px', 'color': '#f43f5e', 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Рискованные пулы
            </div>
            <div style={{ 'font-size': '11px', 'color': colors.text, 'line-height': '1.4' }}>
              Мем-токены: высокая волатильность, IL может превысить комиссии
            </div>
          </div>
        </DiagramTooltip>
      </div>

      <DataBox
        label="Правило LP"
        value="Прибыльно когда: fee_APR > |IL|. Оценивайте ожидаемую волатильность и объем торгов перед входом в пул."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  PositionManagementFlowDiagram                                        */
/* ================================================================== */

interface FlowStep {
  id: string;
  label: string;
  description: string;
  type: 'action' | 'decision' | 'outcome';
  color: string;
  tooltipRu: string;
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: 'choose',
    label: 'Выбрать диапазон',
    description: 'V2: полный диапазон (авто). V3: выбрать [tick_lower, tick_upper]. Узже диапазон = больше комиссий, но выше IL и риск выхода.',
    type: 'action',
    color: colors.primary,
    tooltipRu: 'Выбор диапазона: V2 -- полный диапазон (0, infinity). V3 -- concentrated liquidity в выбранном range. Узкий range = выше capital efficiency, но выше IL и риск out-of-range.',
  },
  {
    id: 'deposit',
    label: 'Внести токены',
    description: 'Депозит обоих токенов в пропорции текущей цены. V2: получаете ERC-20 LP токен. V3: получаете NFT (уникальная позиция).',
    type: 'action',
    color: colors.primary,
    tooltipRu: 'Депозит: вносите оба токена в пропорции текущей цены пула. V2 -- ERC-20 LP token (fungible). V3 -- NFT позиция (unique range). Slippage tolerance учитывать.',
  },
  {
    id: 'monitor',
    label: 'Мониторинг позиции',
    description: 'Отслеживать: текущая цена vs диапазон, accumulated fees, IL vs fees, TVL изменения.',
    type: 'action',
    color: colors.accent,
    tooltipRu: 'Мониторинг позиции: отслеживать price ratio, accumulated fees, current IL. Инструменты: Revert Finance, DeBank, Zerion.',
  },
  {
    id: 'check',
    label: 'Цена в диапазоне?',
    description: 'V2: всегда в диапазоне (full range). V3: проверить, не вышла ли цена за tick_lower/tick_upper.',
    type: 'decision',
    color: '#eab308',
    tooltipRu: 'Проверка диапазона: V2 -- всегда в диапазоне. V3 -- если цена вышла за tick boundaries, позиция inactive. Комиссии не начисляются пока цена вне диапазона.',
  },
  {
    id: 'earning',
    label: 'Зарабатываете комиссии',
    description: 'Позиция активна. Каждый своп через ваш ценовой диапазон начисляет пропорциональную долю 0.3% комиссии.',
    type: 'outcome',
    color: colors.success,
    tooltipRu: 'Активная позиция: каждый своп через ваш ценовой диапазон начисляет комиссию пропорционально вашей доле ликвидности. V3: concentrated = больше комиссий на доллар.',
  },
  {
    id: 'inactive',
    label: 'Нет комиссий (out of range)',
    description: 'V3: позиция стала 100% одного токена. Комиссии не начисляются. Варианты: ждать возврата цены, ребалансировать, вывести.',
    type: 'outcome',
    color: '#f43f5e',
    tooltipRu: 'Out of range (V3): позиция 100% одного токена, комиссии не начисляются. Решение: ждать возврата цены, ребалансировать, или вывести ликвидность.',
  },
  {
    id: 'rebalance',
    label: 'Ребалансировка / Вывод',
    description: 'Вывести ликвидность, установить новый диапазон, внести заново. Учитывать: gas costs, IL при выводе, новый диапазон. Автоменеджеры: Arrakis, Gamma.',
    type: 'action',
    color: colors.accent,
    tooltipRu: 'Ребалансировка: при значительном price shift -- withdraw + re-deposit в новый range. Для V3: переместить concentrated liquidity. Gas costs учитывать.',
  },
];

/**
 * PositionManagementFlowDiagram
 *
 * Static flow diagram with DiagramTooltip on each step.
 */
export function PositionManagementFlowDiagram() {
  return (
    <DiagramContainer title="Управление LP позицией" color="blue">
      {/* Flow diagram */}
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '6px', 'margin-bottom': '16px' }}>
        {FLOW_STEPS.map((step, i) => {
          const isDecision = step.type === 'decision';

          return (
            <div>
              {/* Connector arrow */}
              {i > 0 && (
                <div style={{ 'text-align': 'center', 'color': colors.textMuted, 'font-size': '12px', 'line-height': '16px' }}>
                  {i === 4 ? 'Да' : i === 5 ? 'Нет' : '|'}
                </div>
              )}

              <DiagramTooltip content={step.tooltipRu}>
                <div
                  style={{
                    ...glassStyle,
                    'padding': '10px',
                    'background': 'rgba(255,255,255,0.03)',
                    'border': '1px solid rgba(255,255,255,0.08)',
                    'border-radius': isDecision ? 8 : 6,
                    'transition': 'all 0.2s',
                  }}
                >
                  <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px' }}>
                    <span style={{
                      'font-size': '10px',
                      'font-family': 'monospace',
                      'color': step.color,
                      'padding': '2px 6px',
                      'background': `${step.color}15`,
                      'border-radius': '3px',
                      'font-weight': '600',
                    }}>
                      {step.type === 'decision' ? '?' : step.type === 'outcome' ? (step.id === 'earning' ? 'OK' : '!!') : (i + 1).toString()}
                    </span>
                    <span style={{
                      'font-size': '13px',
                      'font-weight': '600',
                      'color': step.color,
                      'font-family': 'monospace',
                    }}>
                      {step.label}
                    </span>
                  </div>

                  <div style={{
                    'font-size': '12px',
                    'color': colors.textMuted,
                    'line-height': '1.5',
                    'margin-top': '6px',
                  }}>
                    {step.description}
                  </div>
                </div>
              </DiagramTooltip>
            </div>
          );
        })}
      </div>

      <DataBox
        label="V2 vs V3 управление"
        value="V2: set & forget (full range, всегда зарабатывает). V3: активное управление (выше доходность, но нужен мониторинг и ребалансировка)."
        variant="info"
      />
    </DiagramContainer>
  );
}
