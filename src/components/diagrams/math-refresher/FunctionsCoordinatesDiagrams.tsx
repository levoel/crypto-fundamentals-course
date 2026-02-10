/**
 * Functions & Coordinates Diagrams (MATH-05)
 *
 * Exports:
 * - FunctionMachineDiagram: Interactive function visualization (domain/codomain/injection)
 * - CoordinatePlaneDiagram: Interactive coordinate plane with curve plotting and elliptic curve preview
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  FunctionMachineDiagram                                              */
/* ------------------------------------------------------------------ */

type FuncType = 'linear' | 'quadratic' | 'modular';

interface FuncDef {
  name: string;
  label: string;
  fn: (x: number) => number;
  injective: boolean;
  surjective: boolean;
  injectiveWhy: string;
  surjectiveWhy: string;
}

const FUNCTIONS: Record<FuncType, FuncDef> = {
  linear: {
    name: 'f(x) = 2x + 1',
    label: '2x + 1',
    fn: (x) => 2 * x + 1,
    injective: true,
    surjective: false,
    injectiveWhy: 'Разные входы дают разные выходы (линейная функция с ненулевым коэффициентом)',
    surjectiveWhy: 'Не все целые числа -- выходы (только нечетные)',
  },
  quadratic: {
    name: 'f(x) = x\u00B2',
    label: 'x\u00B2',
    fn: (x) => x * x,
    injective: false,
    surjective: false,
    injectiveWhy: 'f(-2) = f(2) = 4 -- разные входы, одинаковый выход',
    surjectiveWhy: 'Отрицательные числа не являются выходами',
  },
  modular: {
    name: 'f(x) = x mod 7',
    label: 'x mod 7',
    fn: (x) => ((x % 7) + 7) % 7,
    injective: false,
    surjective: true,
    injectiveWhy: 'f(0) = f(7) = 0 -- разные входы, одинаковый выход',
    surjectiveWhy: 'Каждое число 0-6 достижимо (область значений = кодомен)',
  },
};

const FUNC_KEYS: FuncType[] = ['linear', 'quadratic', 'modular'];

/**
 * FunctionMachineDiagram - Interactive function visualization.
 * Shows function as input-output machine with domain/codomain/injection properties.
 */
export function FunctionMachineDiagram() {
  const [funcKey, setFuncKey] = useState<FuncType>('linear');
  const [x, setX] = useState(5);

  const func = FUNCTIONS[funcKey];
  const y = func.fn(x);

  // Generate table of input-output pairs
  const pairs = useMemo(() => {
    const inputs = [-3, -2, -1, 0, 1, 2, 3, 4, 5];
    return inputs.map((inp) => ({ x: inp, y: func.fn(inp) }));
  }, [funcKey]);

  return (
    <DiagramContainer title="Функция как машина" color="green">
      {/* Function selector */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {FUNC_KEYS.map((key) => (
          <DiagramTooltip
            key={key}
            content={
              key === 'linear'
                ? 'Линейная функция f(x) = 2x + 1. Инъективна (разные входы -> разные выходы), но не сюръективна (не все целые числа -- выходы). Линейные функции используются в линейной алгебре, лежащей в основе решёток (lattice-based crypto).'
                : key === 'quadratic'
                  ? 'Квадратичная функция f(x) = x^2. Не инъективна: f(-2) = f(2) = 4. Квадратичные вычеты -- основа ряда криптосистем (Rabin, Goldwasser-Micali). Вычисление квадратного корня по модулю -- сложная задача.'
                  : 'Модулярная функция f(x) = x mod 7. Не инъективна, но сюръективна на Z_7. Модулярная арифметика -- фундамент RSA, Diffie-Hellman, ECC. Хеш-функции по сути являются модулярными отображениями.'
            }
          >
            <div>
              <button
                onClick={() => setFuncKey(key)}
                style={{
                  ...glassStyle,
                  padding: '6px 14px',
                  cursor: 'pointer',
                  background: funcKey === key ? `${colors.success}25` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${funcKey === key ? colors.success : 'rgba(255,255,255,0.1)'}`,
                  color: funcKey === key ? colors.success : colors.text,
                  fontSize: 13,
                  fontFamily: 'monospace',
                }}
              >
                {FUNCTIONS[key].name}
              </button>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <InteractiveValue value={x} onChange={setX} min={-10} max={20} label="x" />

      {/* Machine SVG */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <svg width={380} height={120} viewBox="0 0 380 120">
          {/* Input arrow */}
          <line x1={20} y1={60} x2={100} y2={60} stroke={colors.primary} strokeWidth={2} />
          <polygon points="100,54 115,60 100,66" fill={colors.primary} />

          {/* Machine box */}
          <rect x={120} y={20} width={140} height={80} rx={12} fill={`${colors.success}15`} stroke={colors.success} strokeWidth={2} />
          <text x={190} y={50} textAnchor="middle" fill={colors.success} fontSize={14} fontFamily="monospace" fontWeight={700}>
            {func.label}
          </text>
          <text x={190} y={75} textAnchor="middle" fill={colors.textMuted} fontSize={12} fontFamily="monospace">
            f({x}) = {y}
          </text>

          {/* Output arrow */}
          <line x1={260} y1={60} x2={340} y2={60} stroke={colors.warning} strokeWidth={2} />
          <polygon points="340,54 355,60 340,66" fill={colors.warning} />

          {/* Input label */}
          <text x={50} y={45} textAnchor="middle" fill={colors.primary} fontSize={18} fontFamily="monospace" fontWeight={700}>
            {x}
          </text>
          <text x={50} y={85} textAnchor="middle" fill={colors.textMuted} fontSize={10}>
            вход (x)
          </text>

          {/* Output label */}
          <text x={365} y={55} textAnchor="start" fill={colors.warning} fontSize={18} fontFamily="monospace" fontWeight={700}>
            {y}
          </text>
        </svg>
      </div>

      {/* Developer analogy */}
      <DiagramTooltip content="Детерминизм -- ключевое свойство: одинаковый вход всегда даёт одинаковый выход. SHA-256('hello') всегда одинаков. Это критично для верификации: любой может проверить хеш, подпись или proof без доверия к вычислителю.">
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          marginTop: 8,
          fontSize: 12,
          color: colors.info,
          background: `${colors.info}10`,
          border: `1px solid ${colors.info}25`,
        }}>
          Аналогия: чистая функция в программировании -- один и тот же вход всегда дает один и тот же выход, без побочных эффектов.
        </div>
      </DiagramTooltip>

      {/* Input-output table */}
      <div style={{ overflowX: 'auto', marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', color: colors.primary, fontSize: 12, borderBottom: `1px solid ${colors.border}`, textAlign: 'center' }}>x</th>
              {pairs.map((p) => (
                <th key={p.x} style={{
                  padding: '6px 8px',
                  textAlign: 'center',
                  borderBottom: `1px solid ${colors.border}`,
                  color: p.x === x ? colors.primary : colors.textMuted,
                  fontWeight: p.x === x ? 700 : 400,
                  background: p.x === x ? `${colors.primary}15` : 'transparent',
                }}>
                  {p.x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '6px 10px', color: colors.warning, fontSize: 12, textAlign: 'center' }}>f(x)</td>
              {pairs.map((p) => (
                <td key={p.x} style={{
                  padding: '6px 8px',
                  textAlign: 'center',
                  color: p.x === x ? colors.warning : colors.text,
                  fontWeight: p.x === x ? 700 : 400,
                  background: p.x === x ? `${colors.warning}15` : 'transparent',
                }}>
                  {p.y}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Properties */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        <DiagramTooltip content="Инъективность (one-to-one): разные входы всегда дают разные выходы. Шифрование должно быть инъективным -- два разных открытых текста не могут зашифроваться в один шифротекст, иначе расшифрование невозможно.">
          <div style={{
            ...glassStyle,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: func.injective ? `${colors.success}08` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${func.injective ? colors.success + '25' : 'rgba(255,255,255,0.06)'}`,
          }}>
            <span style={{ fontSize: 16, color: func.injective ? colors.success : colors.danger, flexShrink: 0 }}>
              {func.injective ? '\u2713' : '\u2717'}
            </span>
            <div>
              <span style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>Инъективность (one-to-one)</span>
              <span style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>{func.injectiveWhy}</span>
            </div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Сюръективность (onto): каждый элемент кодомена является выходом хотя бы для одного входа. Хеш-функции теоретически сюръективны на своём выходном пространстве -- каждый 256-битный хеш достижим (хотя найти прообраз вычислительно невозможно).">
          <div style={{
            ...glassStyle,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: func.surjective ? `${colors.success}08` : 'rgba(255,255,255,0.02)',
            border: `1px solid ${func.surjective ? colors.success + '25' : 'rgba(255,255,255,0.06)'}`,
          }}>
            <span style={{ fontSize: 16, color: func.surjective ? colors.success : colors.danger, flexShrink: 0 }}>
              {func.surjective ? '\u2713' : '\u2717'}
            </span>
            <div>
              <span style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>Сюръективность (onto)</span>
              <span style={{ fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>{func.surjectiveWhy}</span>
            </div>
          </div>
        </DiagramTooltip>

        {func.injective && func.surjective && (
          <DiagramTooltip content="Биекция = инъекция + сюръекция. Идеальное обратимое отображение. Шифрование -- биекция: каждому открытому тексту соответствует ровно один шифротекст и наоборот. Без биективности расшифрование было бы неоднозначным.">
            <DataBox label="Вывод" value="Биекция! Идеальное отображение -- как шифрование с расшифрованием." variant="highlight" />
          </DiagramTooltip>
        )}
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  CoordinatePlaneDiagram                                              */
/* ------------------------------------------------------------------ */

type PlotMode = 'points' | 'line' | 'parabola' | 'elliptic';

const PLOT_MODES: { key: PlotMode; label: string }[] = [
  { key: 'points', label: 'Точки' },
  { key: 'line', label: 'y = 2x + 1' },
  { key: 'parabola', label: 'y = x\u00B2' },
  { key: 'elliptic', label: 'y\u00B2 = x\u00B3 + 7' },
];

const PRESET_POINTS = [
  { x: -2, y: 3 },
  { x: 0, y: 1 },
  { x: 1, y: -2 },
  { x: 3, y: 4 },
  { x: -1, y: -1 },
];

/**
 * CoordinatePlaneDiagram - Interactive coordinate plane.
 * Plot points, lines, parabola, and elliptic curve preview.
 */
export function CoordinatePlaneDiagram() {
  const [mode, setMode] = useState<PlotMode>('line');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null);

  // Coordinate system config
  const svgW = 400;
  const svgH = 340;
  const margin = 40;
  const plotW = svgW - 2 * margin;
  const plotH = svgH - 2 * margin;

  // Range depends on mode
  const range = mode === 'elliptic' ? { xMin: -3, xMax: 6, yMin: -10, yMax: 10 } : { xMin: -5, xMax: 5, yMin: -5, yMax: 8 };

  const toSvgX = (x: number) => margin + ((x - range.xMin) / (range.xMax - range.xMin)) * plotW;
  const toSvgY = (y: number) => margin + plotH - ((y - range.yMin) / (range.yMax - range.yMin)) * plotH;

  // Generate curve points
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    if (mode === 'line') {
      for (let x = range.xMin; x <= range.xMax; x += 0.1) {
        pts.push({ x, y: 2 * x + 1 });
      }
    } else if (mode === 'parabola') {
      for (let x = range.xMin; x <= range.xMax; x += 0.1) {
        pts.push({ x, y: x * x });
      }
    } else if (mode === 'elliptic') {
      // y^2 = x^3 + 7, so y = +/- sqrt(x^3 + 7)
      // Only valid when x^3 + 7 >= 0, i.e. x >= -7^(1/3) ~ -1.913
      const startX = -1.9;
      // Upper branch
      const upper: { x: number; y: number }[] = [];
      const lower: { x: number; y: number }[] = [];
      for (let x = startX; x <= range.xMax; x += 0.05) {
        const rhs = x * x * x + 7;
        if (rhs >= 0) {
          const yVal = Math.sqrt(rhs);
          upper.push({ x, y: yVal });
          lower.push({ x, y: -yVal });
        }
      }
      // Return upper then lower (reversed for smooth path)
      pts.push(...upper, ...lower.reverse());
    }
    return pts;
  }, [mode, range.xMin, range.xMax]);

  // Slope calculation for line mode
  const slopeInfo = mode === 'line' ? {
    p1: { x: 0, y: 1 },
    p2: { x: 2, y: 5 },
    slope: 2,
    rise: 4,
    run: 2,
  } : null;

  return (
    <DiagramContainer title="Координатная плоскость" color="blue">
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {PLOT_MODES.map((m) => (
          <DiagramTooltip
            key={m.key}
            content={
              m.key === 'points'
                ? 'Отдельные точки на плоскости. Каждая точка -- пара координат (x, y). В ECC точки на кривой над конечным полем выглядят как разбросанные точки -- не гладкая кривая.'
                : m.key === 'line'
                  ? 'Линейная функция y = 2x + 1. Наклон (slope) = rise/run = 2. Касательные к эллиптической кривой -- линейные приближения, используемые при сложении точек в ECC.'
                  : m.key === 'parabola'
                    ? 'Парабола y = x^2. Не инъективна: для y > 0 существуют два прообраза (+/-sqrt(y)). Квадратичные вычеты по модулю p -- основа ряда криптосистем.'
                    : 'Эллиптическая кривая secp256k1: y^2 = x^3 + 7. Используется в Bitcoin и Ethereum для ECDSA. Над вещественными числами -- гладкая кривая; над GF(p) -- точки в конечном поле.'
            }
          >
            <div>
              <button
                onClick={() => { setMode(m.key); setHoveredPoint(null); }}
                style={{
                  ...glassStyle,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  background: mode === m.key ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mode === m.key ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                  color: mode === m.key ? colors.primary : colors.text,
                  fontSize: 12,
                  fontFamily: 'monospace',
                }}
              >
                {m.label}
              </button>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* SVG coordinate plane */}
      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {/* Grid lines */}
          {Array.from({ length: Math.floor(range.xMax - range.xMin) + 1 }, (_, i) => {
            const x = range.xMin + i;
            const sx = toSvgX(x);
            return sx >= margin && sx <= svgW - margin ? (
              <line key={`gx-${i}`} x1={sx} y1={margin} x2={sx} y2={svgH - margin} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            ) : null;
          })}
          {Array.from({ length: Math.floor(range.yMax - range.yMin) + 1 }, (_, i) => {
            const y = range.yMin + i;
            const sy = toSvgY(y);
            return sy >= margin && sy <= svgH - margin ? (
              <line key={`gy-${i}`} x1={margin} y1={sy} x2={svgW - margin} y2={sy} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            ) : null;
          })}

          {/* Axes */}
          {toSvgY(0) >= margin && toSvgY(0) <= svgH - margin && (
            <line x1={margin} y1={toSvgY(0)} x2={svgW - margin} y2={toSvgY(0)} stroke={colors.border} strokeWidth={1.5} />
          )}
          {toSvgX(0) >= margin && toSvgX(0) <= svgW - margin && (
            <line x1={toSvgX(0)} y1={margin} x2={toSvgX(0)} y2={svgH - margin} stroke={colors.border} strokeWidth={1.5} />
          )}

          {/* Axis labels */}
          <text x={svgW - margin + 5} y={toSvgY(0) + 4} fill={colors.textMuted} fontSize={12}>x</text>
          <text x={toSvgX(0) - 12} y={margin - 5} fill={colors.textMuted} fontSize={12}>y</text>

          {/* Tick labels */}
          {Array.from({ length: Math.floor(range.xMax - range.xMin) + 1 }, (_, i) => {
            const x = range.xMin + i;
            if (x === 0) return null;
            const sx = toSvgX(x);
            const axisY = Math.min(Math.max(toSvgY(0), margin), svgH - margin);
            return sx >= margin && sx <= svgW - margin ? (
              <text key={`lx-${i}`} x={sx} y={axisY + 14} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
                {x}
              </text>
            ) : null;
          })}

          {/* Curve / Points */}
          {mode === 'points' && PRESET_POINTS.map((pt, i) => (
            <g key={i}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={toSvgX(pt.x)} cy={toSvgY(pt.y)} r={6} fill={colors.primary} stroke={colors.primary} strokeWidth={2} opacity={0.9} />
              {hoveredPoint === pt && (
                <text x={toSvgX(pt.x) + 10} y={toSvgY(pt.y) - 8} fill={colors.primary} fontSize={11} fontFamily="monospace" fontWeight={600}>
                  ({pt.x}, {pt.y})
                </text>
              )}
            </g>
          ))}

          {(mode === 'line' || mode === 'parabola') && curvePoints.length > 1 && (
            <polyline
              points={curvePoints
                .filter((p) => p.y >= range.yMin && p.y <= range.yMax)
                .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
                .join(' ')}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2}
              opacity={0.9}
            />
          )}

          {mode === 'elliptic' && curvePoints.length > 1 && (
            <>
              {/* Upper branch */}
              <polyline
                points={curvePoints
                  .filter((p) => p.y >= 0 && p.y <= range.yMax && p.x >= range.xMin)
                  .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
                  .join(' ')}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                opacity={0.9}
              />
              {/* Lower branch */}
              <polyline
                points={curvePoints
                  .filter((p) => p.y <= 0 && p.y >= range.yMin && p.x >= range.xMin)
                  .sort((a, b) => a.x - b.x)
                  .map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`)
                  .join(' ')}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                opacity={0.9}
              />
              {/* Symmetry line (x-axis is the axis of symmetry) */}
              <line
                x1={margin}
                y1={toSvgY(0)}
                x2={svgW - margin}
                y2={toSvgY(0)}
                stroke={colors.warning}
                strokeWidth={1}
                strokeDasharray="6,4"
                opacity={0.5}
              />
              {/* Symmetry annotation */}
              <text x={svgW - margin - 60} y={toSvgY(0) - 8} fill={colors.warning} fontSize={10} opacity={0.8}>
                ось симметрии
              </text>
            </>
          )}

          {/* Slope visualization for line mode */}
          {mode === 'line' && slopeInfo && (
            <>
              {/* Rise/Run triangle */}
              <line
                x1={toSvgX(slopeInfo.p1.x)} y1={toSvgY(slopeInfo.p1.y)}
                x2={toSvgX(slopeInfo.p2.x)} y2={toSvgY(slopeInfo.p1.y)}
                stroke={colors.success} strokeWidth={1.5} strokeDasharray="4,3"
              />
              <line
                x1={toSvgX(slopeInfo.p2.x)} y1={toSvgY(slopeInfo.p1.y)}
                x2={toSvgX(slopeInfo.p2.x)} y2={toSvgY(slopeInfo.p2.y)}
                stroke={colors.warning} strokeWidth={1.5} strokeDasharray="4,3"
              />
              {/* Labels */}
              <text
                x={(toSvgX(slopeInfo.p1.x) + toSvgX(slopeInfo.p2.x)) / 2}
                y={toSvgY(slopeInfo.p1.y) + 14}
                textAnchor="middle" fill={colors.success} fontSize={10}
              >
                run = {slopeInfo.run}
              </text>
              <text
                x={toSvgX(slopeInfo.p2.x) + 8}
                y={(toSvgY(slopeInfo.p1.y) + toSvgY(slopeInfo.p2.y)) / 2}
                fill={colors.warning} fontSize={10}
              >
                rise = {slopeInfo.rise}
              </text>
              {/* Points */}
              <circle cx={toSvgX(slopeInfo.p1.x)} cy={toSvgY(slopeInfo.p1.y)} r={4} fill={colors.success} />
              <circle cx={toSvgX(slopeInfo.p2.x)} cy={toSvgY(slopeInfo.p2.y)} r={4} fill={colors.success} />
            </>
          )}
        </svg>
      </div>

      {/* Info panels */}
      {mode === 'line' && slopeInfo && (
        <DiagramTooltip content="Наклон (slope) -- скорость изменения функции. slope = delta_y / delta_x. В ECC наклон касательной к кривой используется для вычисления удвоения точки (point doubling) -- ключевая операция в scalar multiplication.">
          <DataBox
            label="Наклон (slope)"
            value={`rise / run = ${slopeInfo.rise} / ${slopeInfo.run} = ${slopeInfo.slope}`}
            variant="highlight"
          />
        </DiagramTooltip>
      )}

      {mode === 'elliptic' && (
        <DiagramTooltip content="secp256k1 -- конкретная эллиптическая кривая, выбранная Сатоши для Bitcoin. Параметры: a=0, b=7, определена над полем GF(p) где p = 2^256 - 2^32 - 977. Порядок группы -- число точек на кривой, ~2^256.">
          <div style={{
            ...glassStyle,
            padding: '10px 14px',
            marginTop: 8,
            fontSize: 12,
            color: colors.accent,
            background: `${colors.accent}10`,
            border: `1px solid ${colors.accent}25`,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>secp256k1: y{'\u00B2'} = x{'\u00B3'} + 7 (над R)</div>
            <div style={{ color: colors.textMuted }}>
              Кривая симметрична относительно оси x: для каждой точки (x, y) существует точка (x, -y).
              В CRYPTO-09 эта же кривая будет определена над конечным полем GF(p), где она выглядит как
              разбросанные точки, а не гладкая кривая.
            </div>
          </div>
        </DiagramTooltip>
      )}

      {mode === 'points' && (
        <DiagramTooltip content="Координатная плоскость -- визуальное представление пар (x, y). В ECC каждая точка кривой -- пара координат из конечного поля. Публичный ключ в ECDSA -- это точка на кривой (x, y), а приватный ключ -- скаляр.">
          <div style={{ ...glassStyle, padding: '8px 12px', marginTop: 8, fontSize: 12, color: colors.textMuted }}>
            Наведите на точку, чтобы увидеть координаты. Каждая точка задается парой (x, y).
          </div>
        </DiagramTooltip>
      )}
    </DiagramContainer>
  );
}
