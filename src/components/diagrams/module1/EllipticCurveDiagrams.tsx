/**
 * Elliptic Curve Diagrams (includes DIAG-10: Point Addition Animation)
 *
 * Exports:
 * - EllipticCurveRealDiagram: Interactive curve y^2 = x^3 + ax + b over real numbers
 * - PointAdditionAnimation: Step-through geometric point addition (DIAG-10)
 * - ScalarMultiplicationDiagram: Show P, 2P, 3P, ..., nP on curve
 * - FiniteFieldCurveDiagram: Scatter plot of curve points over GF(p)
 */

import { useState, useMemo, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Mathematical Helpers                                                */
/* ================================================================== */

interface Point {
  x: number;
  y: number;
}

/** Compute curve points for y^2 = x^3 + ax + b over reals. */
function computeRealCurvePoints(
  a: number,
  b: number,
  xMin: number,
  xMax: number,
  steps: number,
): { upper: Point[]; lower: Point[] } {
  const upper: Point[] = [];
  const lower: Point[] = [];
  const dx = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const rhs = x * x * x + a * x + b;
    if (rhs >= 0) {
      const y = Math.sqrt(rhs);
      upper.push({ x, y });
      lower.push({ x, y: -y });
    }
  }
  return { upper, lower };
}

/** Point addition on y^2 = x^3 + ax + b over reals. */
function addPoints(P: Point, Q: Point, a: number): Point {
  if (Math.abs(P.x - Q.x) < 1e-10 && Math.abs(P.y - Q.y) < 1e-10) {
    // Point doubling
    const m = (3 * P.x * P.x + a) / (2 * P.y);
    const xr = m * m - 2 * P.x;
    const yr = m * (P.x - xr) - P.y;
    return { x: xr, y: yr };
  }
  const m = (Q.y - P.y) / (Q.x - P.x);
  const xr = m * m - P.x - Q.x;
  const yr = m * (P.x - xr) - P.y;
  return { x: xr, y: yr };
}

/** Convert math coordinates to SVG coordinates. */
function toSvg(
  p: Point,
  viewBox: { xMin: number; yMin: number; width: number; height: number },
  svgW: number,
  svgH: number,
): { x: number; y: number } {
  return {
    x: ((p.x - viewBox.xMin) / viewBox.width) * svgW,
    y: svgH - ((p.y - viewBox.yMin) / viewBox.height) * svgH,
  };
}

/** Build SVG path string from points. */
function pointsToPath(
  points: Point[],
  vb: { xMin: number; yMin: number; width: number; height: number },
  svgW: number,
  svgH: number,
): string {
  if (points.length === 0) return '';
  const svgPts = points.map((p) => toSvg(p, vb, svgW, svgH));
  return 'M ' + svgPts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' L ');
}

/** Modular exponentiation. */
function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0;
  let result = 1;
  base = ((base % mod) + mod) % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

/* ================================================================== */
/*  EllipticCurveRealDiagram                                            */
/* ================================================================== */

const SVG_W = 400;
const SVG_H = 400;

/**
 * EllipticCurveRealDiagram - Interactive curve y^2 = x^3 + ax + b over reals.
 * Pre-computes ~200 curve points at initialization. Parameters adjustable.
 */
export function EllipticCurveRealDiagram() {
  const [a, setA] = useState(-3);
  const [b, setB] = useState(5);

  const vb = { xMin: -5, yMin: -8, width: 10, height: 16 };

  // Pre-compute curve points (not in render loop)
  const curveData = useMemo(() => {
    return computeRealCurvePoints(a, b, vb.xMin, vb.xMin + vb.width, 200);
  }, [a, b]);

  const discriminant = 4 * a * a * a + 27 * b * b;
  const isValid = discriminant !== 0;

  const upperPath = pointsToPath(curveData.upper, vb, SVG_W, SVG_H);
  const lowerPath = pointsToPath(curveData.lower, vb, SVG_W, SVG_H);

  // Axis positions
  const originSvg = toSvg({ x: 0, y: 0 }, vb, SVG_W, SVG_H);

  return (
    <DiagramContainer title={`Эллиптическая кривая y\u00B2 = x\u00B3 + ax + b`} color="blue">
      {/* Parameter controls */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontFamily: 'monospace', color: colors.primary }}>a =</span>
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <span style={{ fontSize: 13, fontFamily: 'monospace', color: colors.text, minWidth: 24 }}>{a}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontFamily: 'monospace', color: colors.accent }}>b =</span>
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <span style={{ fontSize: 13, fontFamily: 'monospace', color: colors.text, minWidth: 24 }}>{b}</span>
        </div>
      </div>

      {/* Equation and discriminant */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 14, color: colors.text }}>
          y{'\u00B2'} = x{'\u00B3'} {a >= 0 ? '+' : '\u2212'} {Math.abs(a)}x {b >= 0 ? '+' : '\u2212'} {Math.abs(b)}
        </span>
        <div style={{
          fontSize: 11,
          color: isValid ? colors.success : '#ff4444',
          marginTop: 4,
        }}>
          {'\u0394'} = 4a{'\u00B3'} + 27b{'\u00B2'} = {discriminant} {isValid ? '(\u2260 0, кривая невырожденная)' : '(= 0, кривая вырожденная!)'}
        </div>
      </div>

      {/* SVG Curve */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Grid lines */}
          {Array.from({ length: 11 }, (_, i) => {
            const x = (i / 10) * SVG_W;
            const y = (i / 10) * SVG_H;
            return (
              <g key={i}>
                <line x1={x} y1={0} x2={x} y2={SVG_H} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                <line x1={0} y1={y} x2={SVG_W} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              </g>
            );
          })}
          {/* Axes */}
          <line x1={0} y1={originSvg.y} x2={SVG_W} y2={originSvg.y} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={originSvg.x} y1={0} x2={originSvg.x} y2={SVG_H} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          {/* Curve paths */}
          {upperPath && (
            <path d={upperPath} fill="none" stroke={colors.primary} strokeWidth={2.5} opacity={0.9} />
          )}
          {lowerPath && (
            <path d={lowerPath} fill="none" stroke={colors.primary} strokeWidth={2.5} opacity={0.9} />
          )}
        </svg>
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: 8 }}>
        Кривая симметрична относительно оси x. Измените a и b, чтобы увидеть разные формы.
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  PointAdditionAnimation (DIAG-10)                                    */
/* ================================================================== */

// Curve: y^2 = x^3 - 3x + 5 (a=-3, b=5)
const PA_A = -3;
const PA_B = 5;

// Pre-computed points on the curve
const PA_P: Point = { x: -1, y: Math.sqrt((-1) * (-1) * (-1) + PA_A * (-1) + PA_B) }; // (-1, sqrt(7)) ~ (-1, 2.646)
const PA_Q: Point = { x: 1, y: Math.sqrt(1 + PA_A + PA_B) }; // (1, sqrt(3)) ~ (1, 1.732)

// Pre-compute line through P and Q: y = mx + c
const PA_M = (PA_Q.y - PA_P.y) / (PA_Q.x - PA_P.x);
const PA_C = PA_P.y - PA_M * PA_P.x;

// Pre-compute intersection R' (third intersection of line with curve)
// Solving: (mx + c)^2 = x^3 + ax + b
// x^3 - m^2*x^2 + (a - 2mc)*x + (b - c^2) = 0
// We know x1 = PA_P.x and x2 = PA_Q.x, so x3 = m^2 - x1 - x2 (Vieta's formula)
const PA_R_PRIME_X = PA_M * PA_M - PA_P.x - PA_Q.x;
const PA_R_PRIME_Y = PA_M * PA_R_PRIME_X + PA_C;
const PA_R_PRIME: Point = { x: PA_R_PRIME_X, y: PA_R_PRIME_Y };

// R = P + Q (reflection of R' across x-axis)
const PA_R: Point = { x: PA_R_PRIME_X, y: -PA_R_PRIME_Y };

const PA_VB = { xMin: -4, yMin: -6, width: 8, height: 12 };
const PA_SVG_W = 420;
const PA_SVG_H = 420;

const PA_STEP_LABELS = [
  'Точки P и Q на кривой',
  'Прямая через P и Q',
  'Третья точка пересечения R\'',
  'Отражение: R = P + Q',
  'Результат: P + Q = R',
];

/**
 * PointAdditionAnimation - MAIN ECC ANIMATION (DIAG-10).
 * Step-through geometric point addition: P, Q -> line -> R' -> reflect -> R.
 * All points pre-computed. SVG rendering with smooth CSS transitions.
 */
export function PointAdditionAnimation() {
  const [step, setStep] = useState(0);

  const curveData = useMemo(() => {
    return computeRealCurvePoints(PA_A, PA_B, PA_VB.xMin, PA_VB.xMin + PA_VB.width, 200);
  }, []);

  const upperPath = pointsToPath(curveData.upper, PA_VB, PA_SVG_W, PA_SVG_H);
  const lowerPath = pointsToPath(curveData.lower, PA_VB, PA_SVG_W, PA_SVG_H);

  const pSvg = toSvg(PA_P, PA_VB, PA_SVG_W, PA_SVG_H);
  const qSvg = toSvg(PA_Q, PA_VB, PA_SVG_W, PA_SVG_H);
  const rpSvg = toSvg(PA_R_PRIME, PA_VB, PA_SVG_W, PA_SVG_H);
  const rSvg = toSvg(PA_R, PA_VB, PA_SVG_W, PA_SVG_H);
  const originSvg = toSvg({ x: 0, y: 0 }, PA_VB, PA_SVG_W, PA_SVG_H);

  // Line endpoints (extended beyond P and Q for visual effect)
  const lineX1 = PA_P.x - 2;
  const lineY1 = PA_M * lineX1 + PA_C;
  const lineX2 = PA_R_PRIME.x + 1;
  const lineY2 = PA_M * lineX2 + PA_C;
  const lineSvg1 = toSvg({ x: lineX1, y: lineY1 }, PA_VB, PA_SVG_W, PA_SVG_H);
  const lineSvg2 = toSvg({ x: lineX2, y: lineY2 }, PA_VB, PA_SVG_W, PA_SVG_H);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 4));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
  }, []);

  return (
    <DiagramContainer title="Сложение точек P + Q на эллиптической кривой" color="purple">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
        {PA_STEP_LABELS.map((label, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              padding: '4px 10px',
              fontSize: 11,
              borderRadius: 4,
              cursor: 'pointer',
              background: i <= step ? `${colors.accent}20` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === step ? colors.accent : i < step ? `${colors.accent}40` : 'rgba(255,255,255,0.08)'}`,
              color: i <= step ? colors.accent : colors.textMuted,
              transition: 'all 0.3s',
            }}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Step description */}
      <div style={{
        textAlign: 'center',
        fontSize: 13,
        color: colors.accent,
        fontWeight: 600,
        marginBottom: 8,
        minHeight: 20,
      }}>
        {PA_STEP_LABELS[step]}
      </div>

      {/* SVG Animation */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          width={PA_SVG_W}
          height={PA_SVG_H}
          viewBox={`0 0 ${PA_SVG_W} ${PA_SVG_H}`}
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Axes */}
          <line x1={0} y1={originSvg.y} x2={PA_SVG_W} y2={originSvg.y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <line x1={originSvg.x} y1={0} x2={originSvg.x} y2={PA_SVG_H} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

          {/* Curve */}
          {upperPath && <path d={upperPath} fill="none" stroke={colors.primary} strokeWidth={2} opacity={0.7} />}
          {lowerPath && <path d={lowerPath} fill="none" stroke={colors.primary} strokeWidth={2} opacity={0.7} />}

          {/* Step 1+: Line through P and Q */}
          {step >= 1 && (
            <line
              x1={lineSvg1.x}
              y1={lineSvg1.y}
              x2={lineSvg2.x}
              y2={lineSvg2.y}
              stroke={colors.warning}
              strokeWidth={1.5}
              strokeDasharray="6,3"
              opacity={0.8}
              style={{ transition: 'opacity 0.5s' }}
            />
          )}

          {/* Step 2+: R' intersection point */}
          {step >= 2 && (
            <>
              <circle cx={rpSvg.x} cy={rpSvg.y} r={6} fill={colors.warning} opacity={0.8} style={{ transition: 'opacity 0.5s' }} />
              <text x={rpSvg.x + 10} y={rpSvg.y - 8} fill={colors.warning} fontSize={12} fontWeight={600}>
                R&apos;
              </text>
            </>
          )}

          {/* Step 3+: Vertical reflection line */}
          {step >= 3 && (
            <line
              x1={rpSvg.x}
              y1={rpSvg.y}
              x2={rSvg.x}
              y2={rSvg.y}
              stroke={colors.success}
              strokeWidth={1.5}
              strokeDasharray="4,4"
              opacity={0.7}
              style={{ transition: 'opacity 0.5s' }}
            />
          )}

          {/* Step 3+: R = P + Q point */}
          {step >= 3 && (
            <>
              <circle cx={rSvg.x} cy={rSvg.y} r={7} fill={colors.success} opacity={0.9} style={{ transition: 'opacity 0.5s' }} />
              <text x={rSvg.x + 10} y={rSvg.y + 4} fill={colors.success} fontSize={13} fontWeight={700}>
                R = P + Q
              </text>
            </>
          )}

          {/* Point P (always visible) */}
          <circle cx={pSvg.x} cy={pSvg.y} r={6} fill={colors.primary} />
          <text x={pSvg.x - 20} y={pSvg.y - 10} fill={colors.primary} fontSize={13} fontWeight={700}>
            P
          </text>

          {/* Point Q (always visible) */}
          <circle cx={qSvg.x} cy={qSvg.y} r={6} fill={colors.accent} />
          <text x={qSvg.x + 10} y={qSvg.y - 10} fill={colors.accent} fontSize={13} fontWeight={700}>
            Q
          </text>
        </svg>
      </div>

      {/* Point coordinates */}
      <div style={{ marginTop: 12 }}>
        <Grid columns={step >= 3 ? 3 : 2} gap={8}>
          <DataBox label="P" value={`(${PA_P.x.toFixed(1)}, ${PA_P.y.toFixed(3)})`} variant="default" />
          <DataBox label="Q" value={`(${PA_Q.x.toFixed(1)}, ${PA_Q.y.toFixed(3)})`} variant="default" />
          {step >= 3 && (
            <DataBox label="R = P + Q" value={`(${PA_R.x.toFixed(3)}, ${PA_R.y.toFixed(3)})`} variant="highlight" />
          )}
        </Grid>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button
          onClick={handleReset}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 12,
            color: colors.textMuted,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          Сброс
        </button>
        <button
          onClick={handleNext}
          disabled={step >= 4}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step >= 4 ? 'default' : 'pointer',
            fontSize: 12,
            color: step >= 4 ? colors.textMuted : colors.accent,
            border: `1px solid ${step >= 4 ? 'rgba(255,255,255,0.1)' : colors.accent}`,
            background: step >= 4 ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
            opacity: step >= 4 ? 0.5 : 1,
          }}
        >
          Следующий шаг
        </button>
      </div>

      {step >= 4 && (
        <div style={{
          marginTop: 12,
          padding: 10,
          ...glassStyle,
          borderColor: `${colors.success}30`,
          textAlign: 'center',
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.6,
        }}>
          <strong style={{ color: colors.success }}>Алгоритм:</strong> проводим прямую через P и Q, находим третью точку пересечения R{'\''},
          отражаем R{'\''}  через ось x и получаем R = P + Q. Эта операция — основа всей криптографии на эллиптических кривых.
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ScalarMultiplicationDiagram                                         */
/* ================================================================== */

// Pre-computed scalar multiples on y^2 = x^3 - 3x + 5
// Starting with P = (-1, sqrt(7))
const SM_CURVE_A = -3;
const SM_CURVE_B = 5;

const SM_POINTS: { n: number; point: Point }[] = (() => {
  const P: Point = { x: -1, y: Math.sqrt(7) };
  const results: { n: number; point: Point }[] = [{ n: 1, point: P }];
  let current = P;
  for (let i = 2; i <= 8; i++) {
    current = addPoints(current, P, SM_CURVE_A);
    results.push({ n: i, point: current });
  }
  return results;
})();

/**
 * ScalarMultiplicationDiagram - Shows P, 2P, 3P, ..., 8P on the curve.
 * Step through with controls. Connects to ECDLP concept.
 */
export function ScalarMultiplicationDiagram() {
  const [visibleCount, setVisibleCount] = useState(1);

  const vb = { xMin: -4, yMin: -8, width: 10, height: 16 };
  const svgW = 400;
  const svgH = 400;

  const curveData = useMemo(() => {
    return computeRealCurvePoints(SM_CURVE_A, SM_CURVE_B, vb.xMin, vb.xMin + vb.width, 200);
  }, []);

  const upperPath = pointsToPath(curveData.upper, vb, svgW, svgH);
  const lowerPath = pointsToPath(curveData.lower, vb, svgW, svgH);
  const originSvg = toSvg({ x: 0, y: 0 }, vb, svgW, svgH);

  const pointColors = [
    colors.primary, colors.accent, colors.success, colors.warning,
    '#ff6b6b', '#48dbfb', '#feca57', '#ff9ff3',
  ];

  return (
    <DiagramContainer title="Скалярное умножение: nP" color="green">
      {/* SVG */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Axes */}
          <line x1={0} y1={originSvg.y} x2={svgW} y2={originSvg.y} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
          <line x1={originSvg.x} y1={0} x2={originSvg.x} y2={svgH} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

          {/* Curve */}
          {upperPath && <path d={upperPath} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />}
          {lowerPath && <path d={lowerPath} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />}

          {/* Points */}
          {SM_POINTS.slice(0, visibleCount).map((item, i) => {
            const svgPt = toSvg(item.point, vb, svgW, svgH);
            const clr = pointColors[i % pointColors.length];
            // Check if point is within SVG bounds
            if (svgPt.x < 0 || svgPt.x > svgW || svgPt.y < 0 || svgPt.y > svgH) return null;
            return (
              <g key={i}>
                <circle cx={svgPt.x} cy={svgPt.y} r={6} fill={clr} opacity={0.9} style={{ transition: 'all 0.4s' }} />
                <text
                  x={svgPt.x + 10}
                  y={svgPt.y - 8}
                  fill={clr}
                  fontSize={12}
                  fontWeight={600}
                >
                  {item.n === 1 ? 'P' : `${item.n}P`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Point list */}
      <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SM_POINTS.slice(0, visibleCount).map((item, i) => (
          <div
            key={i}
            style={{
              ...glassStyle,
              padding: '4px 8px',
              fontSize: 10,
              fontFamily: 'monospace',
              color: pointColors[i % pointColors.length],
              borderColor: `${pointColors[i % pointColors.length]}30`,
            }}
          >
            {item.n === 1 ? 'P' : `${item.n}P`} = ({item.point.x.toFixed(2)}, {item.point.y.toFixed(2)})
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button
          onClick={() => setVisibleCount(1)}
          style={{
            ...glassStyle,
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: 12,
            color: colors.textMuted,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          Сброс
        </button>
        <button
          onClick={() => setVisibleCount((c) => Math.min(c + 1, 8))}
          disabled={visibleCount >= 8}
          style={{
            ...glassStyle,
            padding: '8px 14px',
            cursor: visibleCount >= 8 ? 'default' : 'pointer',
            fontSize: 12,
            color: visibleCount >= 8 ? colors.textMuted : colors.success,
            border: `1px solid ${visibleCount >= 8 ? 'rgba(255,255,255,0.1)' : colors.success}`,
            background: visibleCount >= 8 ? 'rgba(255,255,255,0.03)' : `${colors.success}15`,
            opacity: visibleCount >= 8 ? 0.5 : 1,
          }}
        >
          + следующая точка
        </button>
      </div>

      {/* ECDLP note */}
      <div style={{
        marginTop: 12,
        padding: 10,
        ...glassStyle,
        borderColor: `${colors.warning}30`,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        <strong style={{ color: colors.warning }}>ECDLP:</strong>{' '}
        Зная nP и P, найти n вычислительно невозможно.
        Точки «прыгают» по кривой непредсказуемо — нет способа «отмотать назад» без перебора.
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  FiniteFieldCurveDiagram                                             */
/* ================================================================== */

const SMALL_PRIMES = [7, 11, 13, 17, 19, 23];

/** Compute all (x, y) satisfying y^2 = x^3 + ax + b (mod p). */
function computeFiniteFieldPoints(a: number, b: number, p: number): Point[] {
  const points: Point[] = [];
  // Pre-compute quadratic residues
  const qr = new Map<number, number[]>();
  for (let y = 0; y < p; y++) {
    const y2 = (y * y) % p;
    if (!qr.has(y2)) qr.set(y2, []);
    qr.get(y2)!.push(y);
  }

  for (let x = 0; x < p; x++) {
    const rhs = (((x * x * x + a * x + b) % p) + p) % p;
    const ys = qr.get(rhs);
    if (ys) {
      for (const y of ys) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

/**
 * FiniteFieldCurveDiagram - Scatter plot of curve points over GF(p).
 * Default: y^2 = x^3 + 7 (mod 23) — secp256k1 parameters scaled down.
 */
export function FiniteFieldCurveDiagram() {
  const [p, setP] = useState(23);
  const a = 0;
  const b = 7;

  const points = useMemo(() => computeFiniteFieldPoints(a, b, p), [p]);

  const cellSize = Math.min(Math.floor(360 / p), 20);
  const gridW = cellSize * p;
  const gridH = cellSize * p;

  return (
    <DiagramContainer title="Эллиптическая кривая над конечным полем GF(p)" color="blue">
      {/* Prime selector */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
        {SMALL_PRIMES.map((prime) => (
          <button
            key={prime}
            onClick={() => setP(prime)}
            style={{
              ...glassStyle,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'monospace',
              background: p === prime ? `${colors.primary}20` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${p === prime ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              color: p === prime ? colors.primary : colors.textMuted,
            }}
          >
            p={prime}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 13, color: colors.text }}>
          y{'\u00B2'} {'\u2261'} x{'\u00B3'} + 7 (mod {p})
        </span>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
          {points.length} точек на кривой (+ точка на бесконечности)
        </div>
      </div>

      {/* Scatter plot */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <svg
            width={gridW + 40}
            height={gridH + 40}
            viewBox={`0 0 ${gridW + 40} ${gridH + 40}`}
            style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Grid */}
            {Array.from({ length: p + 1 }, (_, i) => (
              <g key={i}>
                <line
                  x1={20 + i * cellSize}
                  y1={20}
                  x2={20 + i * cellSize}
                  y2={20 + gridH}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={0.5}
                />
                <line
                  x1={20}
                  y1={20 + i * cellSize}
                  x2={20 + gridW}
                  y2={20 + i * cellSize}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={0.5}
                />
              </g>
            ))}

            {/* Points */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={20 + pt.x * cellSize + cellSize / 2}
                cy={20 + (p - 1 - pt.y) * cellSize + cellSize / 2}
                r={Math.max(cellSize / 3, 2.5)}
                fill={colors.accent}
                opacity={0.85}
              />
            ))}

            {/* Axis labels */}
            <text x={gridW / 2 + 20} y={gridH + 36} fill={colors.textMuted} fontSize={10} textAnchor="middle">
              x (mod {p})
            </text>
            <text x={8} y={gridH / 2 + 20} fill={colors.textMuted} fontSize={10} textAnchor="middle" transform={`rotate(-90, 8, ${gridH / 2 + 20})`}>
              y (mod {p})
            </text>
          </svg>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: 10,
        ...glassStyle,
        borderColor: `${colors.accent}20`,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        Те же операции (сложение, умножение) работают, но визуально точки разбросаны.
        В secp256k1 поле имеет размер p {'\u2248'} 2{'\u00B2'}{'\u2075'}{'\u2076'} — точек {'\u2248'} 2{'\u00B2'}{'\u2075'}{'\u2076'}.
      </div>
    </DiagramContainer>
  );
}
