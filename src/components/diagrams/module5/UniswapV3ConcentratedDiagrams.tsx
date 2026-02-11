/**
 * Uniswap V3 Concentrated Liquidity Diagrams (DEFI-04)
 *
 * Exports:
 * - TickRangeDiagram: Interactive tick/price range visualization with slider
 * - ConcentratedVsFullRangeDiagram: Concentrated vs full-range comparison (DiagramTooltip)
 * - V4HooksOverviewDiagram: V4 singleton + hooks architecture with V2/V3/V4 table (DiagramTooltip)
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  TickRangeDiagram                                                     */
/* ================================================================== */

/**
 * TickRangeDiagram
 *
 * Interactive slider for tick_lower/tick_upper.
 * Shows price(i) = 1.0001^i, current price marker, in-range/out-of-range.
 */
export function TickRangeDiagram() {
  const [tickLower, setTickLower] = useState(74000); // ~1500 USDC
  const [tickUpper, setTickUpper] = useState(78000); // ~2500 USDC
  const currentTick = 76012; // ~2000 USDC

  const priceLower = Math.pow(1.0001, tickLower);
  const priceUpper = Math.pow(1.0001, tickUpper);
  const currentPrice = Math.pow(1.0001, currentTick);
  const inRange = currentTick >= tickLower && currentTick <= tickUpper;

  // SVG
  const svgW = 320;
  const svgH = 100;
  const padL = 10;
  const padR = 10;
  const lineY = 50;
  const plotW = svgW - padL - padR;

  // Tick range for visualization
  const tickMin = 70000;
  const tickMax = 82000;
  const toSvgX = (tick: number) => padL + ((tick - tickMin) / (tickMax - tickMin)) * plotW;

  const lowerX = toSvgX(tickLower);
  const upperX = toSvgX(tickUpper);
  const currentX = toSvgX(currentTick);

  return (
    <DiagramContainer title="Uniswap V3: тики и ценовые диапазоны" color="blue">
      {/* SVG tick line */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* Base line */}
          <line
            x1={padL}
            y1={lineY}
            x2={svgW - padR}
            y2={lineY}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />

          {/* Active range shading */}
          <rect
            x={lowerX}
            y={lineY - 20}
            width={upperX - lowerX}
            height={40}
            fill={inRange ? 'rgba(34,197,94,0.12)' : 'rgba(244,63,94,0.08)'}
            rx={4}
          />

          {/* Lower tick mark */}
          <line x1={lowerX} y1={lineY - 25} x2={lowerX} y2={lineY + 25} stroke={colors.primary} strokeWidth={2} />
          <text x={lowerX} y={lineY + 38} fill={colors.primary} fontSize={9} textAnchor="middle" fontFamily="monospace">
            ${priceLower.toFixed(0)}
          </text>

          {/* Upper tick mark */}
          <line x1={upperX} y1={lineY - 25} x2={upperX} y2={lineY + 25} stroke={colors.primary} strokeWidth={2} />
          <text x={upperX} y={lineY + 38} fill={colors.primary} fontSize={9} textAnchor="middle" fontFamily="monospace">
            ${priceUpper.toFixed(0)}
          </text>

          {/* Current price marker */}
          <circle cx={currentX} cy={lineY} r={6} fill={inRange ? colors.success : '#f43f5e'} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
          <text x={currentX} y={lineY - 14} fill={inRange ? colors.success : '#f43f5e'} fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
            ${currentPrice.toFixed(0)}
          </text>

          {/* Status label */}
          <text x={svgW / 2} y={90} fill={inRange ? colors.success : '#f43f5e'} fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
            {inRange ? 'IN RANGE -- earning fees' : 'OUT OF RANGE -- no fees'}
          </text>
        </svg>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <DiagramTooltip content="Tick: дискретная точка на ценовой оси. price = 1.0001^tick. Tick spacing (60 для 0.3% fee) определяет гранулярность позиций.">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>tick_lower:</span>
              <span style={{ fontSize: 11, color: colors.primary, fontFamily: 'monospace' }}>{tickLower}</span>
            </div>
          </DiagramTooltip>
          <input
            type="range"
            min={70000}
            max={76000}
            value={tickLower}
            onChange={(e) => setTickLower(Number(e.target.value))}
            style={{ width: '100%', accentColor: colors.primary }}
          />
        </div>
        <div>
          <DiagramTooltip content="Range [tickLower, tickUpper]: интервал, в котором LP предоставляет ликвидность. Ликвидность активна только когда текущая цена в range.">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>tick_upper:</span>
              <span style={{ fontSize: 11, color: colors.primary, fontFamily: 'monospace' }}>{tickUpper}</span>
            </div>
          </DiagramTooltip>
          <input
            type="range"
            min={76000}
            max={82000}
            value={tickUpper}
            onChange={(e) => setTickUpper(Number(e.target.value))}
            style={{ width: '100%', accentColor: colors.primary }}
          />
        </div>
      </div>

      {/* Values */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <DiagramTooltip content="Tick: дискретная точка на ценовой оси. price = 1.0001^tick. Tick spacing (60 для 0.3% fee) определяет гранулярность позиций.">
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              price(tick_lower) = 1.0001^{tickLower}
            </div>
            <div style={{ fontSize: 13, color: colors.primary, fontFamily: 'monospace', fontWeight: 600 }}>
              ${priceLower.toFixed(2)}
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Range [tickLower, tickUpper]: интервал, в котором LP предоставляет ликвидность. Ликвидность активна только когда текущая цена в range.">
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              price(tick_upper) = 1.0001^{tickUpper}
            </div>
            <div style={{ fontSize: 13, color: colors.primary, fontFamily: 'monospace', fontWeight: 600 }}>
              ${priceUpper.toFixed(2)}
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Текущая цена определяется текущим тиком. Если цена внутри range -- LP зарабатывает fees. Вне range -- позиция неактивна.">
          <div style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Текущая цена (tick {currentTick})
            </div>
            <div style={{ fontSize: 13, color: inRange ? colors.success : '#f43f5e', fontFamily: 'monospace', fontWeight: 600 }}>
              ${currentPrice.toFixed(2)}
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Узкий range = выше concentration = больше fee income, но выше риск выхода за пределы. Широкий range = безопаснее, но меньше доход.">
          <div style={{
            ...glassStyle,
            padding: 10,
            background: inRange ? 'rgba(34,197,94,0.06)' : 'rgba(244,63,94,0.06)',
            border: `1px solid ${inRange ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)'}`,
          }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Ширина диапазона
            </div>
            <div style={{ fontSize: 13, color: colors.text, fontFamily: 'monospace', fontWeight: 600 }}>
              {(tickUpper - tickLower).toLocaleString()} тиков
            </div>
          </div>
        </DiagramTooltip>
      </div>

      <DataBox
        label="Формула"
        value="price(i) = 1.0001^i. Каждый тик = 1 basis point (0.01%). Выход цены за диапазон превращает позицию в 100% одного токена."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ConcentratedVsFullRangeDiagram                                       */
/* ================================================================== */

/**
 * ConcentratedVsFullRangeDiagram
 *
 * Two overlaid curves: full xy=k vs concentrated range. DiagramTooltip replaces hoveredZone.
 */
export function ConcentratedVsFullRangeDiagram() {
  const svgW = 320;
  const svgH = 200;
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
  const k = 400000;

  const toSvgX = (xVal: number) => padL + ((xVal - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (yVal: number) => padT + plotH - ((yVal - yMin) / (yMax - yMin)) * plotH;

  // Full curve
  const fullCurve = useMemo(() => {
    const pts: string[] = [];
    for (let xv = xMin; xv <= xMax; xv += 5) {
      const yv = k / xv;
      if (yv >= yMin && yv <= yMax) {
        pts.push(`${toSvgX(xv).toFixed(1)},${toSvgY(yv).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, []);

  // Concentrated range: x from 400-1000 (price_a to price_b)
  const concXmin = 400;
  const concXmax = 1000;

  const concCurve = useMemo(() => {
    const pts: string[] = [];
    for (let xv = concXmin; xv <= concXmax; xv += 5) {
      const yv = k / xv;
      if (yv >= yMin && yv <= yMax) {
        pts.push(`${toSvgX(xv).toFixed(1)},${toSvgY(yv).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, []);

  // Shaded area for concentrated range
  const shadedPath = useMemo(() => {
    const pts: string[] = [];
    for (let xv = concXmin; xv <= concXmax; xv += 5) {
      const yv = k / xv;
      if (yv >= yMin && yv <= yMax) {
        pts.push(`${toSvgX(xv).toFixed(1)},${toSvgY(yv).toFixed(1)}`);
      }
    }
    // Close the path along the bottom
    pts.push(`${toSvgX(concXmax).toFixed(1)},${toSvgY(yMin).toFixed(1)}`);
    pts.push(`${toSvgX(concXmin).toFixed(1)},${toSvgY(yMin).toFixed(1)}`);
    return pts.join(' ');
  }, []);

  return (
    <DiagramContainer title="Concentrated Liquidity: реальные vs виртуальные резервы" color="green">
      {/* SVG */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <text x={padL + plotW / 2} y={svgH - 2} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">Token X</text>
          <text x={8} y={padT + plotH / 2} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace" transform={`rotate(-90, 8, ${padT + plotH / 2})`}>Token Y</text>

          {/* Full curve (V2) */}
          <polyline
            points={fullCurve}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
          />

          {/* Concentrated range shading */}
          <polygon
            points={shadedPath}
            fill="rgba(34,197,94,0.1)"
          />

          {/* Concentrated curve (V3) */}
          <polyline
            points={concCurve}
            fill="none"
            stroke={`${colors.success}90`}
            strokeWidth={2}
          />

          {/* Range boundaries */}
          <line x1={toSvgX(concXmin)} y1={padT} x2={toSvgX(concXmin)} y2={padT + plotH} stroke={colors.success} strokeWidth={1} strokeDasharray="3,3" />
          <line x1={toSvgX(concXmax)} y1={padT} x2={toSvgX(concXmax)} y2={padT + plotH} stroke={colors.success} strokeWidth={1} strokeDasharray="3,3" />

          <text x={toSvgX(concXmin)} y={padT - 2} fill={colors.success} fontSize={8} textAnchor="middle" fontFamily="monospace">p_a</text>
          <text x={toSvgX(concXmax)} y={padT - 2} fill={colors.success} fontSize={8} textAnchor="middle" fontFamily="monospace">p_b</text>

          {/* Labels */}
          <text x={toSvgX(1500)} y={padT + 20} fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="monospace">V2 (full range)</text>
          <text x={toSvgX(500)} y={toSvgY(800) - 8} fill={colors.success} fontSize={9} fontFamily="monospace">V3 (active)</text>
        </svg>
      </div>

      {/* Zone explanations with DiagramTooltip */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <DiagramTooltip content="Full range [0, infinity): V2-style. Капитал распределён по всем ценам. Безопасно (всегда in range), но неэффективно.">
          <div style={{
            ...glassStyle,
            padding: 10,
            fontSize: 12,
            color: colors.text,
            lineHeight: 1.5,
          }}>
            <strong style={{ color: 'rgba(255,255,255,0.5)' }}>V2 (full range):</strong> Ликвидность по всей кривой [0, infinity). Виртуальные резервы = реальные резервы.
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Narrow range (+-2%): высокая concentration. 100x+ эффективнее full range. Но требует активного management -- цена может выйти за пределы.">
          <div style={{
            ...glassStyle,
            padding: 10,
            fontSize: 12,
            color: colors.text,
            lineHeight: 1.5,
            background: `${colors.success}08`,
            border: `1px solid ${colors.success}30`,
          }}>
            <strong style={{ color: colors.success }}>V3 (concentrated):</strong> LP размещает ликвидность только между p_a и p_b. Реальных токенов нужно значительно меньше.
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Out of range: позиция неактивна. LP не зарабатывает fees. Позиция конвертируется в один токен (100% token X или 100% token Y).">
          <div style={{
            ...glassStyle,
            padding: 10,
            fontSize: 12,
            color: colors.textMuted,
            lineHeight: 1.5,
          }}>
            <strong style={{ color: '#f43f5e' }}>Out of range:</strong> Позиция неактивна, LP не зарабатывает fees. Конвертируется в 100% одного токена.
          </div>
        </DiagramTooltip>
      </div>

      <DataBox
        label="Виртуальные резервы"
        value="V3 LP предоставляет реальные токены только для выбранного диапазона. Протокол рассчитывает виртуальные резервы так, чтобы в пределах [p_a, p_b] формула xy=k работала корректно."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  V4HooksOverviewDiagram                                               */
/* ================================================================== */

interface V4ComparisonRow {
  feature: string;
  v2: string;
  v3: string;
  v4: string;
  tooltip: string;
}

const V4_COMPARISON: V4ComparisonRow[] = [
  { feature: 'Pool deployment', v2: 'Отдельный контракт', v3: 'Отдельный контракт', v4: 'Singleton PoolManager', tooltip: 'V3: отдельный контракт на каждый пул. V4: Singleton (один контракт для всех пулов). Flash accounting через transient storage (EIP-1153).' },
  { feature: 'Creation cost', v2: '~4.5M gas', v3: '~4.5M gas', v4: '~99.99% дешевле', tooltip: 'V3: отдельный контракт на каждый пул. V4: Singleton (один контракт для всех пулов). Flash accounting через transient storage (EIP-1153).' },
  { feature: 'Multi-hop', v2: 'Промежуточные переводы', v3: 'Промежуточные переводы', v4: 'Flash accounting', tooltip: 'V3: отдельный контракт на каждый пул. V4: Singleton (один контракт для всех пулов). Flash accounting через transient storage (EIP-1153).' },
  { feature: 'Кастомизация', v2: 'Нет', v3: 'Нет', v4: 'Hooks (10 точек)', tooltip: 'V3: фиксированная логика. V4: hook контракты для custom behavior. Любой может создать hook и подключить к пулу.' },
  { feature: 'Native ETH', v2: 'Требует WETH', v3: 'Требует WETH', v4: 'Нативная поддержка', tooltip: 'V3: фиксированная логика. V4: hook контракты для custom behavior. Любой может создать hook и подключить к пулу.' },
];

interface HookItem {
  name: string;
  tooltip: string;
}

const HOOKS_LIST: HookItem[] = [
  { name: 'beforeInitialize', tooltip: 'beforeInitialize: вызывается перед созданием пула. Можно: валидация параметров, access control, начальная конфигурация hook.' },
  { name: 'afterInitialize', tooltip: 'afterInitialize: вызывается после создания пула. Можно: инициализация oracle, настройка дополнительного state.' },
  { name: 'beforeAddLiquidity', tooltip: 'beforeAddLiquidity: контроль кто может предоставлять ликвидность. Whitelisted LP, minimum deposit, KYC.' },
  { name: 'afterAddLiquidity', tooltip: 'afterAddLiquidity: post-processing после добавления ликвидности. Reward distribution, analytics.' },
  { name: 'beforeRemoveLiquidity', tooltip: 'beforeRemoveLiquidity: контроль вывода ликвидности. Lock periods, withdrawal limits.' },
  { name: 'afterRemoveLiquidity', tooltip: 'afterRemoveLiquidity: post-processing при withdraw. Fee settlement, reward claiming.' },
  { name: 'beforeSwap', tooltip: 'beforeSwap hook: вызывается перед свопом. Можно: custom fees, oracle updates, access control. V4 Singleton contract вызывает hook перед каждым swap.' },
  { name: 'afterSwap', tooltip: 'afterSwap hook: вызывается после свопа. Можно: reward distribution, analytics, TWAP update.' },
  { name: 'beforeDonate', tooltip: 'beforeDonate: вызывается перед donate (прямое пожертвование LP). Можно: валидация, access control.' },
  { name: 'afterDonate', tooltip: 'afterDonate: вызывается после donate. Можно: учёт донатов, reward распределение.' },
];

/**
 * V4HooksOverviewDiagram
 *
 * Singleton architecture + hooks lifecycle + V2/V3/V4 comparison table.
 * DiagramTooltip replaces hoveredHook and hoveredRow.
 */
export function V4HooksOverviewDiagram() {
  return (
    <DiagramContainer title="Uniswap V4: singleton и hooks" color="purple">
      {/* Singleton pattern */}
      <DiagramTooltip content="V3: отдельный контракт на каждый пул. V4: Singleton (один контракт для всех пулов). Flash accounting через transient storage (EIP-1153).">
        <div style={{
          ...glassStyle,
          padding: 14,
          marginBottom: 16,
          background: 'rgba(168,85,247,0.06)',
          border: '1px solid rgba(168,85,247,0.2)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.accent, fontFamily: 'monospace', marginBottom: 8 }}>
            Singleton Pattern
          </div>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5, marginBottom: 8 }}>
            V2/V3: каждый пул -- отдельный контракт (Factory + create2). V4: ВСЕ пулы живут в одном контракте <span style={{ color: colors.accent }}>PoolManager</span>. Создание пула = запись в mapping, не деплой контракта.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div style={{ ...glassStyle, padding: 8, textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>V2/V3</div>
              <div style={{ fontSize: 20, marginTop: 4 }}>{'{ } { } { }'}</div>
              <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>N контрактов</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: colors.textMuted }}>-&gt;</div>
            <div style={{ ...glassStyle, padding: 8, textAlign: 'center', flex: 1, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)' }}>
              <div style={{ fontSize: 10, color: colors.accent, fontFamily: 'monospace' }}>V4</div>
              <div style={{ fontSize: 20, marginTop: 4 }}>{'{ }'}</div>
              <div style={{ fontSize: 9, color: colors.accent, fontFamily: 'monospace' }}>1 контракт</div>
            </div>
          </div>
        </div>
      </DiagramTooltip>

      {/* Hooks lifecycle */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, fontFamily: 'monospace', marginBottom: 8 }}>
          Hooks: 10 точек кастомизации
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {HOOKS_LIST.map((hook, i) => {
            const isBefore = hook.name.startsWith('before');
            return (
              <DiagramTooltip key={i} content={hook.tooltip}>
                <div
                  style={{
                    ...glassStyle,
                    padding: '4px 8px',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: isBefore ? colors.primary : colors.success,
                    background: isBefore ? 'rgba(99,102,241,0.05)' : 'rgba(34,197,94,0.05)',
                    transition: 'all 0.15s',
                  }}
                >
                  {hook.name}
                </div>
              </DiagramTooltip>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace' }}>
          <thead>
            <tr>
              {['Feature', 'V2', 'V3', 'V4'].map((h) => (
                <th key={h} style={{
                  padding: '8px 6px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'left',
                  color: h === 'V4' ? colors.accent : colors.textMuted,
                  fontWeight: h === 'V4' ? 600 : 400,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {V4_COMPARISON.map((row, i) => (
              <tr
                key={i}
                style={{
                  transition: 'all 0.15s',
                }}
              >
                <td style={{ padding: '8px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: colors.text, fontWeight: 600 }}>
                  <DiagramTooltip content={row.tooltip}>
                    <span>{row.feature}</span>
                  </DiagramTooltip>
                </td>
                <td style={{ padding: '8px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: colors.textMuted }}>
                  {row.v2}
                </td>
                <td style={{ padding: '8px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: colors.textMuted }}>
                  {row.v3}
                </td>
                <td style={{ padding: '8px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: colors.accent, fontWeight: 600 }}>
                  {row.v4}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="V4 запущен 30 января 2025"
          value="Singleton + hooks + flash accounting (EIP-1153 transient storage). V2 math и V3 concentrated liquidity -- фундаментальные концепции, V4 -- эволюция архитектуры."
          variant="highlight"
        />
      </div>
    </DiagramContainer>
  );
}
