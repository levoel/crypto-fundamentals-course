/** @jsxImportSource solid-js */
/**
 * Circuit Writing Diagrams (ZK-08)
 *
 * Exports:
 * - ProofPipelineDiagram: Step-through Circom/snarkjs pipeline (8 steps, history array)
 * - CircuitComplexityDiagram: Circuit complexity progression (4 levels, static)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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
  tooltip: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    title: 'WRITE CIRCUIT',
    label: 'Шаг 1',
    description: 'Написать .circom файл: определить template, signals (input/output), constraints. Circom -- DSL для описания arithmetic circuits (R1CS constraints).',
    command: 'vim circuit.circom',
    color: '#3b82f6',
    icon: '.circom',
    tooltip: 'Описание вычисления на языке Circom: определение сигналов (input/output/intermediate) и ограничений (constraints) в виде template. Каждое constraint — квадратичное уравнение A*B = C.',
  },
  {
    title: 'COMPILE',
    label: 'Шаг 2',
    description: 'Circom compiler генерирует: (1) R1CS файл (constraints), (2) WASM файл (witness calculator), (3) sym файл (debug symbols). R1CS -- формальное представление constraints.',
    command: 'circom circuit.circom --r1cs --wasm --sym',
    color: '#8b5cf6',
    icon: 'R1CS',
    tooltip: 'Компиляция Circom-кода в R1CS-представление и WASM/C++ witness calculator. Команда: `circom circuit.circom --r1cs --wasm --sym`. R1CS — Rank-1 Constraint System.',
  },
  {
    title: 'DOWNLOAD PTAU',
    label: 'Шаг 3',
    description: 'Powers of Tau -- результат Phase 1 trusted setup ceremony. Универсальный для всех circuits до определенного размера. powersOfTau28_hez_final_14.ptau поддерживает circuits до 2^14 = 16,384 constraints.',
    command: 'wget https://storage.googleapis.com/.../ptau14.ptau',
    color: '#6366f1',
    icon: 'PTAU',
    tooltip: 'Powers of Tau — универсальный trusted setup (Phase 1). Результат MPC-ceremony с сотнями участников. Безопасен, если хотя бы один участник уничтожил свой секрет.',
  },
  {
    title: 'GROTH16 SETUP',
    label: 'Шаг 4',
    description: 'Phase 2 setup: специализирует powers of tau для конкретного circuit. Генерирует circuit-specific proving key (.zkey файл). Это circuit-specific trusted setup.',
    command: 'snarkjs groth16 setup circuit.r1cs ptau14.ptau circuit_0.zkey',
    color: '#10b981',
    icon: 'ZKEY',
    tooltip: 'Trusted setup (Phase 2): генерация proving key и verification key через ceremony, специфичную для данного circuit. Для Groth16 обязательна; для PLONK — универсальная.',
  },
  {
    title: 'CONTRIBUTE RANDOMNESS',
    label: 'Шаг 5',
    description: 'Добавить свою случайность в .zkey (Phase 2 contribution). В production: несколько участников (MPC). В dev: один участник с random entropy.',
    command: 'snarkjs zkey contribute circuit_0.zkey circuit.zkey --name="dev"',
    color: '#f59e0b',
    icon: 'RNG',
    tooltip: 'Добавление случайности в Phase 2 trusted setup. В production это MPC с множеством участников — безопасно, если хотя бы один честен. В dev — single contributor.',
  },
  {
    title: 'EXPORT VERIFICATION KEY',
    label: 'Шаг 6',
    description: 'Извлечь verification key из .zkey файла. Verification key -- публичный, используется verifier для проверки proofs. Маленький (JSON, ~1 KB).',
    command: 'snarkjs zkey export verificationkey circuit.zkey vkey.json',
    color: '#3b82f6',
    icon: 'VKEY',
    tooltip: 'Извлечение verification key из proving key. Verification key публикуется и используется для проверки доказательств. Малый размер (~1 KB JSON) позволяет on-chain верификацию.',
  },
  {
    title: 'GENERATE PROOF',
    label: 'Шаг 7',
    description: 'Два шага: (a) witness calculation -- WASM calculator вычисляет все intermediate signals из input. (b) proof generation -- snarkjs создает Groth16 proof (proof.json) и public signals (public.json).',
    command: 'snarkjs groth16 fullprove input.json circuit.wasm circuit.zkey proof.json public.json',
    color: '#8b5cf6',
    icon: 'PROOF',
    tooltip: 'Prover вычисляет ZK-доказательство из witness и proving key. Выход: proof.json (доказательство) + public.json (публичные сигналы). Время зависит от числа constraints.',
  },
  {
    title: 'VERIFY',
    label: 'Шаг 8',
    description: 'Verifier проверяет proof.json с помощью verification key и public signals. Если proof валиден -- "OK". Можно также экспортировать Solidity verifier contract для on-chain верификации.',
    command: 'snarkjs groth16 verify vkey.json public.json proof.json',
    color: '#10b981',
    icon: 'OK',
    tooltip: 'Верификация доказательства через verification key. Можно также экспортировать Solidity-контракт: `snarkjs zkey export solidityverifier`. Контракт деплоится в Ethereum для on-chain верификации.',
  },
];

/**
 * ProofPipelineDiagram
 *
 * Step-through Circom/snarkjs pipeline with 8 steps,
 * history array, step/back/reset, commands shown.
 */
export function ProofPipelineDiagram() {
  const [history, setHistory] = createSignal<number[]>([0]);
  const current = history()[history().length - 1];

  const step = () => {
    if (current < PIPELINE_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history().length > 1) {
      setHistory(history().slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = PIPELINE_STEPS[current];

  return (
    <DiagramContainer title="Circom/snarkjs: полный pipeline от .circom до verification" color="purple">
      {/* Progress bar */}
      <div style={{ 'display': 'flex', 'gap': '3px', 'margin-bottom': '16px' }}>
        {PIPELINE_STEPS.map((st, i) => (
          <div
            style={{
              'flex': '1',
              'height': '4px',
              'border-radius': '2px',
              'background': i <= current ? st.color : 'rgba(255,255,255,0.08)',
              'transition': 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Flow visualization */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
        {PIPELINE_STEPS.map((st, i) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '4px' }}>
            <DiagramTooltip content={st.tooltip}>
              <div style={{
                'width': '40px',
                'height': '40px',
                'border-radius': '6px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '8px',
                'font-weight': '700',
                'font-family': 'monospace',
                'color': i <= current ? '#fff' : colors.textMuted,
                'background': i <= current ? `${st.color}30` : 'rgba(255,255,255,0.04)',
                'border': `1px solid ${i === current ? st.color : i < current ? `${st.color}40` : 'rgba(255,255,255,0.08)'}`,
                'transition': 'all 0.3s',
              }}>
                {st.icon}
              </div>
            </DiagramTooltip>
            {i < PIPELINE_STEPS.length - 1 && (
              <div style={{
                'width': '12px',
                'height': '2px',
                'background': i < current ? `${PIPELINE_STEPS[i + 1].color}60` : 'rgba(255,255,255,0.08)',
                'transition': 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current step detail */}
      <DiagramTooltip content={s.tooltip}>
        <div style={{
          ...glassStyle,
          'padding': '16px',
          'margin-bottom': '8px',
          'border': `1px solid ${s.color}30`,
          'background': `${s.color}08`,
          'border-radius': '8px',
        }}>
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px', 'margin-bottom': '8px' }}>
            <span style={{
              'font-size': '9px',
              'font-family': 'monospace',
              'color': s.color,
              'padding': '2px 8px',
              'border-radius': '4px',
              'background': `${s.color}15`,
              'border': `1px solid ${s.color}30`,
            }}>
              {s.label}
            </span>
            <span style={{ 'font-size': '13px', 'font-weight': '700', 'color': colors.text }}>
              {s.title}
            </span>
          </div>
          <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '8px' }}>
            {s.description}
          </div>
          {/* Command */}
          <DiagramTooltip content={`CLI-команда для этого шага pipeline. Выполняется в терминале проекта с установленным circom и snarkjs.`}>
            <div style={{
              'padding': '6px 10px',
              'border-radius': '4px',
              'background': 'rgba(0,0,0,0.3)',
              'font-size': '10px',
              'font-family': 'monospace',
              'color': '#10b981',
              'overflow-x': 'auto',
            }}>
              $ {s.command}
            </div>
          </DiagramTooltip>
        </div>
      </DiagramTooltip>

      {/* Controls */}
      <DiagramTooltip content="Навигация по 8 шагам Circom/snarkjs pipeline: от написания circuit до верификации proof. Каждый шаг — отдельная CLI-команда.">
        <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '14px' }}>
          {[
            { label: 'Back', action: back, disabled: history().length <= 1 },
            { label: `Step ${current + 1}/${PIPELINE_STEPS.length}`, action: step, disabled: current >= PIPELINE_STEPS.length - 1 },
            { label: 'Reset', action: reset, disabled: history().length <= 1 },
          ].map((btn) => (
            <button
              onClick={btn.action}
              disabled={btn.disabled}
              style={{
                ...glassStyle,
                'padding': '6px 14px',
                'cursor': btn.disabled ? 'default' : 'pointer',
                'font-size': '11px',
                'font-family': 'monospace',
                'color': btn.disabled ? 'rgba(255,255,255,0.2)' : colors.text,
                'border': '1px solid rgba(255,255,255,0.1)',
                'border-radius': '6px',
                'opacity': btn.disabled ? 0.5 : 1,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="Полный pipeline Circom/snarkjs: от DSL-описания circuit (.circom) через компиляцию, trusted setup и генерацию proof до верификации. В Docker lab автоматизирован тремя скриптами.">
        <DataBox
          label="Pipeline summary"
          value=".circom -> compile (R1CS + WASM) -> ptau -> setup (.zkey) -> contribute -> export vkey -> prove (proof.json) -> verify. В Docker lab: 3 скрипта (setup.sh, prove.sh, verify.sh) автоматизируют весь процесс."
          variant="info"
        />
      </DiagramTooltip>
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
  tooltip: string;
}

const CIRCUIT_LEVELS: CircuitLevel[] = [
  {
    name: 'Multiplier2',
    constraints: '1 constraint',
    description: 'Hello world: c = a * b. Одно quadratic constraint. Самый простой circuit.',
    color: '#10b981',
    file: 'multiplier.circom',
    difficulty: 'Beginner',
    tooltip: 'Базовые схемы: простые арифметические проверки (x^2 = y). Несколько ограничений, подходят для обучения основам Circom и понимания constraint-системы.',
  },
  {
    name: 'Hash Preimage',
    constraints: '~240 constraints',
    description: 'Знание preimage хеша (Poseidon). Доказывает: "я знаю x, такой что Poseidon(x) = h" без раскрытия x.',
    color: '#3b82f6',
    file: 'hash_preimage.circom',
    difficulty: 'Intermediate',
    tooltip: 'Промежуточные схемы: хеш-функции (Poseidon, MiMC), Merkle-tree включение. Десятки-сотни ограничений, используются в DeFi протоколах для приватных операций.',
  },
  {
    name: 'Range Proof',
    constraints: '~200 constraints',
    description: 'Значение в диапазоне [min, max]. Доказывает: "min <= value <= max" без раскрытия value.',
    color: '#f59e0b',
    file: 'range_proof.circom',
    difficulty: 'Intermediate',
    tooltip: 'Продвинутые схемы: range proofs, сравнение значений, bit decomposition. Сотни ограничений, требуют понимания circomlib компонентов и оптимизации constraints.',
  },
  {
    name: 'Age Check',
    constraints: '~200 constraints',
    description: 'Capstone: возраст >= threshold. Комбинирует circomlib comparators. Реальный use case: KYC без раскрытия возраста.',
    color: '#8b5cf6',
    file: 'age_check.circom',
    difficulty: 'Capstone',
    tooltip: 'Экспертные схемы: комбинация множества circomlib компонентов для реальных use cases (KYC, compliance). Capstone проект демонстрирует полный workflow от design до on-chain verification.',
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
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '14px', 'flex-wrap': 'wrap' }}>
        {CIRCUIT_LEVELS.map((level, i) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px', 'flex': '1', 'min-width': '180px' }}>
            <DiagramTooltip content={level.tooltip}>
              <div style={{
                ...glassStyle,
                'padding': '14px',
                'border-radius': '8px',
                'border': `1px solid ${level.color}30`,
                'background': `${level.color}06`,
                'flex': '1',
              }}>
                {/* Header */}
                <div style={{ 'display': 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'margin-bottom': '6px' }}>
                  <span style={{
                    'font-size': '12px',
                    'font-weight': '700',
                    'color': level.color,
                    'font-family': 'monospace',
                  }}>
                    {level.name}
                  </span>
                  <span style={{
                    'font-size': '9px',
                    'padding': '2px 6px',
                    'border-radius': '4px',
                    'color': level.color,
                    'background': `${level.color}15`,
                    'border': `1px solid ${level.color}30`,
                    'font-family': 'monospace',
                  }}>
                    {level.difficulty}
                  </span>
                </div>

                {/* Constraints */}
                <div style={{
                  'font-size': '10px',
                  'font-weight': '600',
                  'color': colors.text,
                  'font-family': 'monospace',
                  'margin-bottom': '6px',
                }}>
                  {level.constraints}
                </div>

                {/* Description */}
                <div style={{
                  'font-size': '10px',
                  'color': colors.textMuted,
                  'line-height': '1.5',
                  'margin-bottom': '6px',
                }}>
                  {level.description}
                </div>

                {/* File reference */}
                <div style={{
                  'font-size': '9px',
                  'color': colors.textMuted,
                  'font-family': 'monospace',
                  'font-style': 'italic',
                }}>
                  {level.file}
                </div>
              </div>
            </DiagramTooltip>

            {/* Arrow between levels */}
            {i < CIRCUIT_LEVELS.length - 1 && (
              <div style={{
                'font-size': '14px',
                'color': 'rgba(255,255,255,0.2)',
                'font-weight': '700',
              }}>
                {'\u2192'}
              </div>
            )}
          </div>
        ))}
      </div>

      <DiagramTooltip content="Прогрессия сложности circuit: от простейшего Multiplier2 (1 constraint) через hash preimage и range proof к capstone Age Check. Каждый circuit проходит полный workflow: write -> compile -> setup -> prove -> verify.">
        <DataBox
          label="Подход"
          value="От простого к сложному: начинаем с 1-constraint Multiplier, заканчиваем capstone Age Check с circomlib. Каждый circuit -- полный workflow: write -> compile -> setup -> prove -> verify."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
