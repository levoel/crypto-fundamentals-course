/**
 * Circuit Writing Diagrams (ZK-08)
 *
 * Exports:
 * - ProofPipelineDiagram: Step-through Circom/snarkjs pipeline (8 steps, history array)
 * - CircuitComplexityDiagram: Circuit complexity progression (4 levels, static)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ProofPipelineDiagram                                                 */
/* ================================================================== */

interface PipelineStep {
  title: string;
  label: string;
  description: string;
  command: string;
  color: string;
  icon: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    title: 'WRITE CIRCUIT',
    label: 'Шаг 1',
    description: 'Написать .circom файл: определить template, signals (input/output), constraints. Circom -- DSL для описания arithmetic circuits (R1CS constraints).',
    command: 'vim circuit.circom',
    color: '#3b82f6',
    icon: '.circom',
  },
  {
    title: 'COMPILE',
    label: 'Шаг 2',
    description: 'Circom compiler генерирует: (1) R1CS файл (constraints), (2) WASM файл (witness calculator), (3) sym файл (debug symbols). R1CS -- формальное представление constraints.',
    command: 'circom circuit.circom --r1cs --wasm --sym',
    color: '#8b5cf6',
    icon: 'R1CS',
  },
  {
    title: 'DOWNLOAD PTAU',
    label: 'Шаг 3',
    description: 'Powers of Tau -- результат Phase 1 trusted setup ceremony. Универсальный для всех circuits до определенного размера. powersOfTau28_hez_final_14.ptau поддерживает circuits до 2^14 = 16,384 constraints.',
    command: 'wget https://storage.googleapis.com/.../ptau14.ptau',
    color: '#6366f1',
    icon: 'PTAU',
  },
  {
    title: 'GROTH16 SETUP',
    label: 'Шаг 4',
    description: 'Phase 2 setup: специализирует powers of tau для конкретного circuit. Генерирует circuit-specific proving key (.zkey файл). Это circuit-specific trusted setup.',
    command: 'snarkjs groth16 setup circuit.r1cs ptau14.ptau circuit_0.zkey',
    color: '#10b981',
    icon: 'ZKEY',
  },
  {
    title: 'CONTRIBUTE RANDOMNESS',
    label: 'Шаг 5',
    description: 'Добавить свою случайность в .zkey (Phase 2 contribution). В production: несколько участников (MPC). В dev: один участник с random entropy.',
    command: 'snarkjs zkey contribute circuit_0.zkey circuit.zkey --name="dev"',
    color: '#f59e0b',
    icon: 'RNG',
  },
  {
    title: 'EXPORT VERIFICATION KEY',
    label: 'Шаг 6',
    description: 'Извлечь verification key из .zkey файла. Verification key -- публичный, используется verifier для проверки proofs. Маленький (JSON, ~1 KB).',
    command: 'snarkjs zkey export verificationkey circuit.zkey vkey.json',
    color: '#3b82f6',
    icon: 'VKEY',
  },
  {
    title: 'GENERATE PROOF',
    label: 'Шаг 7',
    description: 'Два шага: (a) witness calculation -- WASM calculator вычисляет все intermediate signals из input. (b) proof generation -- snarkjs создает Groth16 proof (proof.json) и public signals (public.json).',
    command: 'snarkjs groth16 fullprove input.json circuit.wasm circuit.zkey proof.json public.json',
    color: '#8b5cf6',
    icon: 'PROOF',
  },
  {
    title: 'VERIFY',
    label: 'Шаг 8',
    description: 'Verifier проверяет proof.json с помощью verification key и public signals. Если proof валиден -- "OK". Можно также экспортировать Solidity verifier contract для on-chain верификации.',
    command: 'snarkjs groth16 verify vkey.json public.json proof.json',
    color: '#10b981',
    icon: 'OK',
  },
];

/**
 * ProofPipelineDiagram
 *
 * Step-through Circom/snarkjs pipeline with 8 steps,
 * history array, step/back/reset, commands shown.
 */
export function ProofPipelineDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const current = history[history.length - 1];

  const step = () => {
    if (current < PIPELINE_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = PIPELINE_STEPS[current];

  return (
    <DiagramContainer title="Circom/snarkjs: полный pipeline от .circom до verification" color="purple">
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
        {PIPELINE_STEPS.map((st, i) => (
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

      {/* Flow visualization */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {PIPELINE_STEPS.map((st, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontWeight: 700,
              fontFamily: 'monospace',
              color: i <= current ? '#fff' : colors.textMuted,
              background: i <= current ? `${st.color}30` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === current ? st.color : i < current ? `${st.color}40` : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.3s',
            }}>
              {st.icon}
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div style={{
                width: 12,
                height: 2,
                background: i < current ? `${PIPELINE_STEPS[i + 1].color}60` : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current step detail */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 8,
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
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 8 }}>
          {s.description}
        </div>
        {/* Command */}
        <div style={{
          padding: '6px 10px',
          borderRadius: 4,
          background: 'rgba(0,0,0,0.3)',
          fontSize: 10,
          fontFamily: 'monospace',
          color: '#10b981',
          overflowX: 'auto',
        }}>
          $ {s.command}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Back', action: back, disabled: history.length <= 1 },
          { label: `Step ${current + 1}/${PIPELINE_STEPS.length}`, action: step, disabled: current >= PIPELINE_STEPS.length - 1 },
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

      <DataBox
        label="Pipeline summary"
        value=".circom -> compile (R1CS + WASM) -> ptau -> setup (.zkey) -> contribute -> export vkey -> prove (proof.json) -> verify. В Docker lab: 3 скрипта (setup.sh, prove.sh, verify.sh) автоматизируют весь процесс."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  CircuitComplexityDiagram                                             */
/* ================================================================== */

interface CircuitLevel {
  name: string;
  constraints: string;
  description: string;
  color: string;
  file: string;
  difficulty: string;
}

const CIRCUIT_LEVELS: CircuitLevel[] = [
  {
    name: 'Multiplier2',
    constraints: '1 constraint',
    description: 'Hello world: c = a * b. Одно quadratic constraint. Самый простой circuit.',
    color: '#10b981',
    file: 'multiplier.circom',
    difficulty: 'Beginner',
  },
  {
    name: 'Hash Preimage',
    constraints: '~240 constraints',
    description: 'Знание preimage хеша (Poseidon). Доказывает: "я знаю x, такой что Poseidon(x) = h" без раскрытия x.',
    color: '#3b82f6',
    file: 'hash_preimage.circom',
    difficulty: 'Intermediate',
  },
  {
    name: 'Range Proof',
    constraints: '~200 constraints',
    description: 'Значение в диапазоне [min, max]. Доказывает: "min <= value <= max" без раскрытия value.',
    color: '#f59e0b',
    file: 'range_proof.circom',
    difficulty: 'Intermediate',
  },
  {
    name: 'Age Check',
    constraints: '~200 constraints',
    description: 'Capstone: возраст >= threshold. Комбинирует circomlib comparators. Реальный use case: KYC без раскрытия возраста.',
    color: '#8b5cf6',
    file: 'age_check.circom',
    difficulty: 'Capstone',
  },
];

/**
 * CircuitComplexityDiagram
 *
 * Four-level circuit complexity progression from Multiplier to Age Check.
 * Static diagram with color-coded difficulty levels.
 */
export function CircuitComplexityDiagram() {
  return (
    <DiagramContainer title="Прогрессия сложности circuits: от Multiplier до Age Check" color="green">
      {/* Progression boxes */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {CIRCUIT_LEVELS.map((level, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180 }}>
            <div style={{
              ...glassStyle,
              padding: 14,
              borderRadius: 8,
              border: `1px solid ${level.color}30`,
              background: `${level.color}06`,
              flex: 1,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: level.color,
                  fontFamily: 'monospace',
                }}>
                  {level.name}
                </span>
                <span style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 4,
                  color: level.color,
                  background: `${level.color}15`,
                  border: `1px solid ${level.color}30`,
                  fontFamily: 'monospace',
                }}>
                  {level.difficulty}
                </span>
              </div>

              {/* Constraints */}
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors.text,
                fontFamily: 'monospace',
                marginBottom: 6,
              }}>
                {level.constraints}
              </div>

              {/* Description */}
              <div style={{
                fontSize: 10,
                color: colors.textMuted,
                lineHeight: 1.5,
                marginBottom: 6,
              }}>
                {level.description}
              </div>

              {/* File reference */}
              <div style={{
                fontSize: 9,
                color: colors.textMuted,
                fontFamily: 'monospace',
                fontStyle: 'italic',
              }}>
                {level.file}
              </div>
            </div>

            {/* Arrow between levels */}
            {i < CIRCUIT_LEVELS.length - 1 && (
              <div style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.2)',
                fontWeight: 700,
              }}>
                {'\u2192'}
              </div>
            )}
          </div>
        ))}
      </div>

      <DataBox
        label="Подход"
        value="От простого к сложному: начинаем с 1-constraint Multiplier, заканчиваем capstone Age Check с circomlib. Каждый circuit -- полный workflow: write -> compile -> setup -> prove -> verify."
        variant="info"
      />
    </DiagramContainer>
  );
}
