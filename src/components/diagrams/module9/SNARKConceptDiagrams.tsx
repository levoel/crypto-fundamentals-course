/**
 * SNARK Concept Diagrams (ZK-04)
 *
 * Exports:
 * - ArithmeticCircuitDiagram: Interactive arithmetic circuit for x^3 + x + 5 = 35
 * - R1CSMatrixDiagram: Step-through R1CS constraint construction (5 steps, history array)
 * - ComputationToProofDiagram: Static pipeline from computation to proof
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ArithmeticCircuitDiagram                                            */
/* ================================================================== */

interface GateNode {
  id: string;
  label: string;
  op: string;
  compute: (x: number) => number;
  color: string;
}

const GATES: GateNode[] = [
  { id: 'input', label: 'x', op: 'INPUT', compute: (x) => x, color: '#3b82f6' },
  { id: 'g1', label: 'v1 = x * x', op: 'MUL', compute: (x) => x * x, color: '#8b5cf6' },
  { id: 'g2', label: 'v2 = v1 * x', op: 'MUL', compute: (x) => x * x * x, color: '#8b5cf6' },
  { id: 'g3', label: 'v3 = v2 + x', op: 'ADD', compute: (x) => x * x * x + x, color: '#6366f1' },
  { id: 'g4', label: 'out = v3 + 5', op: 'ADD', compute: (x) => x * x * x + x + 5, color: '#6366f1' },
];

/**
 * ArithmeticCircuitDiagram
 *
 * Interactive arithmetic circuit for x^3 + x + 5 = 35.
 * Slider changes x (1-10), circuit updates live.
 * Green checkmark when output = 35, red X otherwise.
 */
export function ArithmeticCircuitDiagram() {
  const [x, setX] = useState(3);

  const values = GATES.map((g) => g.compute(x));
  const output = values[values.length - 1];
  const isValid = output === 35;

  return (
    <DiagramContainer title="Арифметическая схема: x^3 + x + 5 = 35" color="purple">
      {/* Input slider */}
      <InteractiveValue
        value={x}
        onChange={setX}
        min={1}
        max={10}
        label={`x = ${x}`}
      />

      {/* Circuit DAG */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '16px 0' }}>
        {GATES.map((gate, i) => {
          const val = values[i];
          const isOutput = i === GATES.length - 1;
          const borderColor = isOutput
            ? isValid ? '#10b981' : '#ef4444'
            : gate.color;

          return (
            <div key={gate.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Arrow from previous */}
              {i > 0 && (
                <div style={{
                  width: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.textMuted,
                  fontSize: 14,
                  fontFamily: 'monospace',
                }}>
                  {'\u2193'}
                </div>
              )}
              {i === 0 && <div style={{ width: 24 }} />}

              {/* Gate box */}
              <div style={{
                ...glassStyle,
                flex: 1,
                padding: '10px 14px',
                borderRadius: 8,
                border: `1px solid ${borderColor}40`,
                background: `${borderColor}08`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Op badge */}
                  <span style={{
                    fontSize: 9,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: gate.color,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: `${gate.color}15`,
                    border: `1px solid ${gate.color}30`,
                  }}>
                    {gate.op}
                  </span>
                  {/* Gate label */}
                  <span style={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: colors.text,
                  }}>
                    {i === 0 ? `x = ${x}` : gate.label.replace(/x/g, String(x))
                      .replace(/v1/g, String(values[1]))
                      .replace(/v2/g, String(values[2]))
                      .replace(/v3/g, String(values[3]))}
                  </span>
                </div>

                {/* Computed value */}
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: isOutput ? (isValid ? '#10b981' : '#ef4444') : colors.text,
                }}>
                  = {val} {isOutput && (isValid ? '\u2705' : '\u274C')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trace summary */}
      <div style={{
        ...glassStyle,
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
        border: `1px solid ${isValid ? '#10b98130' : '#ef444430'}`,
        background: isValid ? '#10b98108' : '#ef444408',
      }}>
        <div style={{
          fontSize: 11,
          fontFamily: 'monospace',
          color: colors.text,
          textAlign: 'center',
        }}>
          {x} {'\u2192'} {values[1]} {'\u2192'} {values[2]} {'\u2192'} {values[3]} {'\u2192'} {output}
          {isValid
            ? <span style={{ color: '#10b981', fontWeight: 700 }}> = 35 (valid witness)</span>
            : <span style={{ color: '#ef4444', fontWeight: 700 }}> {'\u2260'} 35 (invalid)</span>
          }
        </div>
      </div>

      {/* Flattening explanation */}
      <DataBox
        label="Flattening"
        value="Только умножение двух переменных допускается в R1CS. x^3 НЕЛЬЗЯ напрямую -- нужно разбить: v1 = x*x, v2 = v1*x. Каждый gate = одна constraint. Это связано с Circom: non-quadratic constraint error возникает при попытке x*x*x."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  R1CSMatrixDiagram                                                    */
/* ================================================================== */

interface R1CSStep {
  title: string;
  label: string;
  description: string;
  matrices: { A: number[][]; B: number[][]; C: number[][] } | null;
  witness: number[] | null;
  check: string | null;
  color: string;
}

// Witness: s = [1, x, v1, v2, out] = [1, 3, 9, 27, 35]
// Constraint 1: v1 = x * x   -> A1=[0,1,0,0,0], B1=[0,1,0,0,0], C1=[0,0,1,0,0]
// Constraint 2: v2 = v1 * x  -> A2=[0,0,1,0,0], B2=[0,1,0,0,0], C2=[0,0,0,1,0]
// Constraint 3: out = v2 + x + 5 -> A3=[5,1,0,1,0], B3=[1,0,0,0,0], C3=[0,0,0,0,1]
//   (rewritten: out = (v2 + x + 5) * 1)

const R1CS_STEPS: R1CSStep[] = [
  {
    title: 'WITNESS VECTOR',
    label: 'Шаг 1',
    description: 'Определяем переменные. Witness vector s содержит все значения: константу 1, вход x, промежуточные v1, v2, и выход out. Для x=3: s = [1, 3, 9, 27, 35].',
    matrices: null,
    witness: [1, 3, 9, 27, 35],
    check: null,
    color: '#3b82f6',
  },
  {
    title: 'CONSTRAINT 1: v1 = x * x',
    label: 'Шаг 2',
    description: 'Первое ограничение: v1 = x * x. В R1CS форме: (A1 . s) * (B1 . s) = (C1 . s). A1 выбирает x, B1 выбирает x, C1 выбирает v1. Проверка: 3 * 3 = 9.',
    matrices: {
      A: [[0, 1, 0, 0, 0]],
      B: [[0, 1, 0, 0, 0]],
      C: [[0, 0, 1, 0, 0]],
    },
    witness: [1, 3, 9, 27, 35],
    check: '(A1 . s) * (B1 . s) = 3 * 3 = 9 = (C1 . s)',
    color: '#8b5cf6',
  },
  {
    title: 'CONSTRAINT 2: v2 = v1 * x',
    label: 'Шаг 3',
    description: 'Второе ограничение: v2 = v1 * x. A2 выбирает v1, B2 выбирает x, C2 выбирает v2. Проверка: 9 * 3 = 27.',
    matrices: {
      A: [[0, 0, 1, 0, 0]],
      B: [[0, 1, 0, 0, 0]],
      C: [[0, 0, 0, 1, 0]],
    },
    witness: [1, 3, 9, 27, 35],
    check: '(A2 . s) * (B2 . s) = 9 * 3 = 27 = (C2 . s)',
    color: '#6366f1',
  },
  {
    title: 'CONSTRAINT 3: out = v2 + x + 5',
    label: 'Шаг 4',
    description: 'Третье ограничение: out = v2 + x + 5. R1CS допускает только умножение -- перепишем: (v2 + x + 5) * 1 = out. A3 выбирает v2 + x + 5*const, B3 выбирает 1 (const), C3 выбирает out. Проверка: (27+3+5) * 1 = 35.',
    matrices: {
      A: [[5, 1, 0, 1, 0]],
      B: [[1, 0, 0, 0, 0]],
      C: [[0, 0, 0, 0, 1]],
    },
    witness: [1, 3, 9, 27, 35],
    check: '(A3 . s) * (B3 . s) = (5*1 + 1*3 + 0 + 1*27 + 0) * (1*1) = 35 * 1 = 35 = (C3 . s)',
    color: '#10b981',
  },
  {
    title: 'FULL R1CS SYSTEM',
    label: 'Шаг 5',
    description: 'Полная система R1CS: 3 ограничения, 5 переменных. Матрицы A, B, C размером 3x5. Для каждого ряда i: (Ai . s) * (Bi . s) = (Ci . s). Все 3 проверки проходят -- witness валиден.',
    matrices: {
      A: [
        [0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [5, 1, 0, 1, 0],
      ],
      B: [
        [0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0],
      ],
      C: [
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 0, 0, 1],
      ],
    },
    witness: [1, 3, 9, 27, 35],
    check: 'Row 1: 3*3=9, Row 2: 9*3=27, Row 3: 35*1=35. All constraints satisfied.',
    color: '#f59e0b',
  },
];

const WITNESS_LABELS = ['1', 'x', 'v1', 'v2', 'out'];

function MatrixDisplay({ name, data, color }: { name: string; data: number[][]; color: string }) {
  return (
    <div style={{ display: 'inline-block', verticalAlign: 'top', marginRight: 12 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color,
        fontFamily: 'monospace',
        marginBottom: 4,
        textAlign: 'center',
      }}>
        {name}
      </div>
      <div style={{
        ...glassStyle,
        padding: 6,
        borderRadius: 6,
        border: `1px solid ${color}30`,
        background: `${color}06`,
      }}>
        {data.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: ri < data.length - 1 ? 2 : 0 }}>
            {row.map((val, ci) => (
              <span key={ci} style={{
                width: 26,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: val !== 0 ? 700 : 400,
                color: val !== 0 ? colors.text : 'rgba(255,255,255,0.2)',
                borderRadius: 3,
                background: val !== 0 ? `${color}12` : 'transparent',
              }}>
                {val}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * R1CSMatrixDiagram
 *
 * Step-through R1CS constraint construction for x^3 + x + 5 = 35.
 * 5 steps with history array, step/back/reset.
 */
export function R1CSMatrixDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const current = history[history.length - 1];

  const step = () => {
    if (current < R1CS_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = R1CS_STEPS[current];

  return (
    <DiagramContainer title="R1CS: матрицы ограничений для x^3 + x + 5 = 35" color="blue">
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {R1CS_STEPS.map((st, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= current ? st.color : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 12,
        border: `1px solid ${s.color}30`,
        background: `${s.color}08`,
        borderRadius: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 9,
            fontFamily: 'monospace',
            color: s.color,
            padding: '2px 8px',
            borderRadius: 4,
            background: `${s.color}15`,
            border: `1px solid ${s.color}30`,
          }}>
            {s.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>
            {s.title}
          </span>
        </div>

        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 12 }}>
          {s.description}
        </div>

        {/* Witness vector */}
        {s.witness && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              s = [{WITNESS_LABELS.join(', ')}] = [{s.witness.join(', ')}]
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {s.witness.map((val, i) => (
                <div key={i} style={{
                  ...glassStyle,
                  padding: '4px 8px',
                  borderRadius: 4,
                  textAlign: 'center',
                  minWidth: 36,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ fontSize: 8, color: colors.textMuted, fontFamily: 'monospace' }}>
                    {WITNESS_LABELS[i]}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matrices */}
        {s.matrices && (
          <div style={{ overflowX: 'auto', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <MatrixDisplay name="A" data={s.matrices.A} color="#8b5cf6" />
            <span style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 16,
              color: colors.textMuted,
              fontFamily: 'monospace',
              padding: '0 2px',
            }}>
              {'\u00B7'}
            </span>
            <MatrixDisplay name="B" data={s.matrices.B} color="#3b82f6" />
            <span style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 16,
              color: colors.textMuted,
              fontFamily: 'monospace',
              padding: '0 2px',
            }}>
              =
            </span>
            <MatrixDisplay name="C" data={s.matrices.C} color="#10b981" />
          </div>
        )}

        {/* Check */}
        {s.check && (
          <div style={{
            ...glassStyle,
            padding: 8,
            borderRadius: 6,
            border: '1px solid #10b98130',
            background: '#10b98108',
          }}>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#10b981', lineHeight: 1.5 }}>
              {'\u2705'} {s.check}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { label: 'Back', action: back, disabled: history.length <= 1 },
          { label: `Step ${current + 1}/${R1CS_STEPS.length}`, action: step, disabled: current >= R1CS_STEPS.length - 1 },
          { label: 'Reset', action: reset, disabled: history.length <= 1 },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            disabled={btn.disabled}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: btn.disabled ? 'default' : 'pointer',
              fontSize: 11,
              fontFamily: 'monospace',
              color: btn.disabled ? 'rgba(255,255,255,0.2)' : colors.text,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              opacity: btn.disabled ? 0.5 : 1,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ComputationToProofDiagram                                           */
/* ================================================================== */

interface PipelineStage {
  name: string;
  nameRu: string;
  description: string;
  size: string;
  color: string;
  icon: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    name: 'Computation',
    nameRu: 'Вычисление',
    description: 'Программа / функция',
    size: 'Произвольная сложность',
    color: '#3b82f6',
    icon: 'f(x)',
  },
  {
    name: 'Arithmetic Circuit',
    nameRu: 'Арифм. схема',
    description: 'DAG из +/* gates',
    size: 'N gates',
    color: '#6366f1',
    icon: 'AC',
  },
  {
    name: 'R1CS',
    nameRu: 'R1CS',
    description: 'A*s . B*s = C*s',
    size: 'N constraints x M vars',
    color: '#8b5cf6',
    icon: 'R1CS',
  },
  {
    name: 'QAP',
    nameRu: 'QAP',
    description: 'Polynomials encoding',
    size: 'Degree N polynomials',
    color: '#a855f7',
    icon: 'QAP',
  },
  {
    name: 'Trusted Setup',
    nameRu: 'Trusted Setup',
    description: 'CRS generation',
    size: 'Proving + Verification keys',
    color: '#ef4444',
    icon: 'TS',
  },
  {
    name: 'Proof',
    nameRu: 'Proof',
    description: '3 group elements',
    size: '~128 bytes (Groth16)',
    color: '#10b981',
    icon: '\u03C0',
  },
];

/**
 * ComputationToProofDiagram
 *
 * Horizontal pipeline showing 6 stages from computation to proof.
 * Static flow with size annotations.
 */
export function ComputationToProofDiagram() {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  return (
    <DiagramContainer title="От вычисления к proof: полный pipeline" color="green">
      {/* Pipeline flow */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 3,
        marginBottom: 16,
        overflowX: 'auto',
        paddingBottom: 4,
      }}>
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div
              onMouseEnter={() => setHoveredStage(i)}
              onMouseLeave={() => setHoveredStage(null)}
              style={{
                ...glassStyle,
                padding: '10px 10px',
                borderRadius: 8,
                border: `1px solid ${hoveredStage === i ? `${stage.color}60` : `${stage.color}25`}`,
                background: hoveredStage === i ? `${stage.color}12` : `${stage.color}06`,
                minWidth: 90,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: stage.color,
                fontFamily: 'monospace',
                marginBottom: 4,
              }}>
                {stage.icon}
              </div>
              {/* Name */}
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 2,
              }}>
                {stage.nameRu}
              </div>
              {/* Size */}
              <div style={{
                fontSize: 8,
                color: colors.textMuted,
                fontFamily: 'monospace',
              }}>
                {stage.size}
              </div>
            </div>
            {/* Arrow */}
            {i < PIPELINE_STAGES.length - 1 && (
              <div style={{
                fontSize: 14,
                color: colors.textMuted,
                fontFamily: 'monospace',
              }}>
                {'\u2192'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hovered detail */}
      {hoveredStage !== null && (
        <div style={{
          ...glassStyle,
          padding: 10,
          borderRadius: 6,
          marginBottom: 12,
          border: `1px solid ${PIPELINE_STAGES[hoveredStage].color}30`,
          background: `${PIPELINE_STAGES[hoveredStage].color}08`,
        }}>
          <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: PIPELINE_STAGES[hoveredStage].color }}>
              {PIPELINE_STAGES[hoveredStage].name}:
            </span>{' '}
            {PIPELINE_STAGES[hoveredStage].description}
          </div>
        </div>
      )}

      {/* Key insight */}
      <DataBox
        label="Ключевое свойство"
        value="Размер proof ПОСТОЯНЕН (~128 bytes для Groth16), независимо от сложности исходного вычисления. Это свойство succinct: proof маленький, а verification быстрая -- O(1)."
        variant="info"
      />
    </DiagramContainer>
  );
}
