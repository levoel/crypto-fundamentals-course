/**
 * EVM Execution Diagrams (ETH-04)
 *
 * Exports:
 * - EVMArchitectureDiagram: EVM architecture overview (static with hover/tooltips)
 * - OpcodeExecutionDiagram: Step-through EVM opcode execution (CORE INTERACTIVE, history array)
 * - StorageLayoutDiagram: Solidity storage slot mapping (static with hover)
 * - MemoryExpansionDiagram: Memory expansion with quadratic gas cost (interactive, history array)
 */

import { useState, useCallback, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

/** FNV-1a hash for simulated keccak256 (storage slot computation). */
function fnvHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  const h2 = Math.imul(h, 0x27d4eb2d) ^ (h >>> 15);
  return (h >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

/** Truncate hex for display. */
function truncHex(s: string, len = 10): string {
  return s.length > len ? s.slice(0, len) + '...' : s;
}

/* ================================================================== */
/*  EVMArchitectureDiagram                                              */
/* ================================================================== */

interface ArchComponent {
  name: string;
  desc: string;
  details: string;
  color: string;
}

const ARCH_COMPONENTS: ArchComponent[] = [
  {
    name: 'Stack',
    desc: '256-bit words, max 1024',
    details: 'Стек -- основная рабочая область EVM. Все арифметические и логические операции берут аргументы со стека и кладут результат обратно. Максимальная глубина 1024 элемента. Каждый элемент -- 256-bit (32 байта). LIFO.',
    color: colors.primary,
  },
  {
    name: 'Memory',
    desc: 'byte-addressable, volatile',
    details: 'Память -- линейный массив байтов, доступный по адресу. Очищается между внешними вызовами (volatile). Расширяется по мере использования, стоимость растет квадратично. Операции: MLOAD, MSTORE, MSTORE8.',
    color: colors.accent,
  },
  {
    name: 'Storage',
    desc: '256-bit key-value, persistent',
    details: 'Хранилище -- постоянное хранилище контракта. Ключи и значения по 256 бит. Сохраняется между транзакциями. Самое дорогое по газу: SSTORE cold (0->non-0) = 22100 gas. SLOAD cold = 2100 gas.',
    color: colors.success,
  },
  {
    name: 'Calldata',
    desc: 'read-only input',
    details: 'Входные данные вызова (msg.data). Только для чтения. Дешевле памяти (16 gas за ненулевой байт, 4 gas за нулевой). Операции: CALLDATALOAD, CALLDATASIZE, CALLDATACOPY.',
    color: colors.warning,
  },
  {
    name: 'Program Counter',
    desc: 'current position in bytecode',
    details: 'Указатель на текущую инструкцию в байткоде. Увеличивается после каждой операции. JUMP и JUMPI изменяют PC на произвольный адрес (только JUMPDEST).',
    color: colors.secondary,
  },
  {
    name: 'Gas Counter',
    desc: 'remaining gas budget',
    details: 'Оставшийся газ. Каждая операция уменьшает счетчик. Если газ закончился -- выполнение откатывается (revert). Начальное значение = gasLimit транзакции.',
    color: colors.danger,
  },
];

/**
 * EVMArchitectureDiagram -- EVM architecture overview with hover details.
 */
export function EVMArchitectureDiagram() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <DiagramContainer title="Архитектура EVM" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Grid columns={3} gap={8}>
          {ARCH_COMPONENTS.map((comp, i) => (
            <DiagramTooltip key={comp.name} content={comp.details}>
              <div
                onClick={() => setSelected(selected === i ? null : i)}
                style={{
                  ...glassStyle,
                  padding: '14px 12px',
                  cursor: 'pointer',
                  border: `1px solid ${selected === i ? comp.color + '80' : comp.color + '30'}`,
                  background: selected === i ? `${comp.color}15` : 'rgba(255,255,255,0.03)',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: comp.color,
                  fontFamily: 'monospace',
                }}>
                  {comp.name}
                </span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>
                  {comp.desc}
                </span>
              </div>
            </DiagramTooltip>
          ))}
        </Grid>

        {selected !== null && (
          <div style={{
            ...glassStyle,
            padding: 14,
            border: `1px solid ${ARCH_COMPONENTS[selected].color}40`,
            background: `${ARCH_COMPONENTS[selected].color}08`,
            transition: 'all 200ms ease',
          }}>
            <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
              {ARCH_COMPONENTS[selected].details}
            </div>
          </div>
        )}

        {/* Data flow arrows */}
        <DiagramTooltip content="Цикл выполнения EVM: Program Counter указывает на текущий байт в bytecode, извлекается opcode, операция работает со Stack/Memory/Storage, Gas Counter уменьшается.">
          <div style={{ ...glassStyle, padding: 12, fontSize: 11, color: colors.textMuted, textAlign: 'center', fontFamily: 'monospace' }}>
            Bytecode → PC → Opcode → Stack/Memory/Storage → Gas Counter
          </div>
        </DiagramTooltip>

        <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
          Нажмите на компонент для подробностей
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  OpcodeExecutionDiagram (CORE INTERACTIVE)                          */
/* ================================================================== */

interface EVMState {
  pc: number;
  opcode: string;
  operand: string;
  stack: string[];
  memory: Record<string, string>;
  storage: Record<string, string>;
  gas: number;
  gasUsed: number;
  desc: string;
  stackHighlight: { pushed: number[]; popped: number[] };
  storageChanged: string[];
  memoryChanged: string[];
}

/** Sequence 1: PUSH1 0x2A, PUSH1 0x00, SSTORE */
const SSTORE_SEQUENCE: EVMState[] = [
  {
    pc: -1, opcode: '--', operand: '', stack: [], memory: {}, storage: {},
    gas: 30000, gasUsed: 0, desc: 'Начальное состояние. Стек пуст, хранилище пусто.',
    stackHighlight: { pushed: [], popped: [] }, storageChanged: [], memoryChanged: [],
  },
  {
    pc: 0, opcode: 'PUSH1', operand: '0x2A', stack: ['0x2A'], memory: {}, storage: {},
    gas: 29997, gasUsed: 3, desc: 'Помещаем значение 42 (0x2A) на стек. Газ: 3.',
    stackHighlight: { pushed: [0], popped: [] }, storageChanged: [], memoryChanged: [],
  },
  {
    pc: 2, opcode: 'PUSH1', operand: '0x00', stack: ['0x2A', '0x00'], memory: {}, storage: {},
    gas: 29994, gasUsed: 3, desc: 'Помещаем номер слота 0 на стек. Газ: 3.',
    stackHighlight: { pushed: [1], popped: [] }, storageChanged: [], memoryChanged: [],
  },
  {
    pc: 4, opcode: 'SSTORE', operand: '', stack: [], memory: {}, storage: { '0x00': '0x2A' },
    gas: 7894, gasUsed: 22100, desc: 'SSTORE: записываем 0x2A в слот 0. Cold write (0->non-0): 22100 gas!',
    stackHighlight: { pushed: [], popped: [] }, storageChanged: ['0x00'], memoryChanged: [],
  },
];

/** Sequence 2: PUSH1 0x03, PUSH1 0x05, ADD */
const ADD_SEQUENCE: EVMState[] = [
  {
    pc: -1, opcode: '--', operand: '', stack: [], memory: {}, storage: {},
    gas: 30000, gasUsed: 0, desc: 'Начальное состояние. Стек пуст.',
    stackHighlight: { pushed: [], popped: [] }, storageChanged: [], memoryChanged: [],
  },
  {
    pc: 0, opcode: 'PUSH1', operand: '0x03', stack: ['0x03'], memory: {}, storage: {},
    gas: 29997, gasUsed: 3, desc: 'Помещаем 3 (0x03) на стек. Газ: 3.',
    stackHighlight: { pushed: [0], popped: [] }, storageChanged: [], memoryChanged: [],
  },
  {
    pc: 2, opcode: 'PUSH1', operand: '0x05', stack: ['0x03', '0x05'], memory: {}, storage: {},
    gas: 29994, gasUsed: 3, desc: 'Помещаем 5 (0x05) на стек. Газ: 3.',
    stackHighlight: { pushed: [1], popped: [] }, storageChanged: [], memoryChanged: [],
  },
  {
    pc: 4, opcode: 'ADD', operand: '', stack: ['0x08'], memory: {}, storage: {},
    gas: 29991, gasUsed: 3, desc: 'ADD: снимаем 0x05 и 0x03, кладем сумму 0x08. Газ: 3.',
    stackHighlight: { pushed: [0], popped: [] }, storageChanged: [], memoryChanged: [],
  },
];

const SEQUENCES = {
  sstore: { label: 'PUSH + SSTORE', bytecode: '60 2A 60 00 55', steps: SSTORE_SEQUENCE },
  add: { label: 'PUSH + ADD', bytecode: '60 03 60 05 01', steps: ADD_SEQUENCE },
} as const;

type SequenceKey = keyof typeof SEQUENCES;

/**
 * OpcodeExecutionDiagram -- Multi-panel EVM step-through with history array.
 */
export function OpcodeExecutionDiagram() {
  const [seqKey, setSeqKey] = useState<SequenceKey>('sstore');
  const [step, setStep] = useState(0);

  const seq = SEQUENCES[seqKey];
  const state = seq.steps[step];
  const maxStep = seq.steps.length - 1;

  const switchSequence = useCallback((key: SequenceKey) => {
    setSeqKey(key);
    setStep(0);
  }, []);

  // Build bytecode display with PC highlighting
  const bytecodeBytes = seq.bytecode.split(' ');

  // Map PC to byte index for highlighting
  const pcToByteMap = useMemo(() => {
    if (seqKey === 'sstore') return { 0: [0, 1], 2: [2, 3], 4: [4] };
    return { 0: [0, 1], 2: [2, 3], 4: [4] };
  }, [seqKey]);

  const highlightedBytes = state.pc >= 0
    ? (pcToByteMap as Record<number, number[]>)[state.pc] || []
    : [];

  return (
    <DiagramContainer title="Выполнение опкодов EVM" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Sequence selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.keys(SEQUENCES) as SequenceKey[]).map(key => (
            <button
              key={key}
              onClick={() => switchSequence(key)}
              style={{
                ...glassStyle,
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'monospace',
                color: seqKey === key ? colors.primary : colors.textMuted,
                border: `1px solid ${seqKey === key ? colors.primary + '60' : colors.border}`,
                background: seqKey === key ? `${colors.primary}15` : 'rgba(255,255,255,0.03)',
              }}
            >
              {SEQUENCES[key].label}
            </button>
          ))}
        </div>

        {/* Bytecode panel */}
        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Bytecode (PC: {state.pc >= 0 ? state.pc : '--'})
          </div>
          <div style={{ display: 'flex', gap: 6, fontFamily: 'monospace', fontSize: 14, flexWrap: 'wrap' }}>
            {bytecodeBytes.map((b, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: highlightedBytes.includes(i) ? `${colors.primary}30` : 'transparent',
                  color: highlightedBytes.includes(i) ? colors.primary : colors.text,
                  border: highlightedBytes.includes(i) ? `1px solid ${colors.primary}50` : '1px solid transparent',
                  transition: 'all 200ms ease',
                  fontWeight: highlightedBytes.includes(i) ? 700 : 400,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Multi-panel: Stack, Memory, Storage, Gas */}
        <Grid columns={2} gap={8}>
          {/* Stack */}
          <div style={{ ...glassStyle, padding: 12, minHeight: 100 }}>
            <div style={{ fontSize: 11, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Stack ({state.stack.length}/1024)
            </div>
            {state.stack.length === 0 ? (
              <div style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>пусто</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
                {state.stack.map((val, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontFamily: 'monospace',
                      fontSize: 13,
                      background: state.stackHighlight.pushed.includes(i)
                        ? `${colors.success}20`
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${state.stackHighlight.pushed.includes(i) ? colors.success + '50' : colors.border}`,
                      color: state.stackHighlight.pushed.includes(i) ? colors.success : colors.text,
                      transition: 'all 200ms ease',
                    }}
                  >
                    [{i}] {val}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storage */}
          <div style={{ ...glassStyle, padding: 12, minHeight: 100 }}>
            <div style={{ fontSize: 11, color: colors.success, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Storage (persistent)
            </div>
            {Object.keys(state.storage).length === 0 ? (
              <div style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>пусто</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(state.storage).map(([slot, val]) => (
                  <div
                    key={slot}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontFamily: 'monospace',
                      fontSize: 13,
                      background: state.storageChanged.includes(slot) ? `${colors.warning}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${state.storageChanged.includes(slot) ? colors.warning + '50' : colors.border}`,
                      color: state.storageChanged.includes(slot) ? colors.warning : colors.text,
                      transition: 'all 200ms ease',
                    }}
                  >
                    slot {slot} = {val}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Grid>

        {/* Gas and opcode info */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <DiagramTooltip content={state.desc}>
            <DataBox
              label="Opcode"
              value={state.opcode === '--' ? 'Начало' : `${state.opcode}${state.operand ? ' ' + state.operand : ''}`}
              variant="highlight"
              style={{ flex: 1, minWidth: 140 }}
            />
          </DiagramTooltip>
          <DiagramTooltip content="Gas Remaining: оставшийся газ. Каждая операция уменьшает счётчик. Если газ = 0 -- выполнение откатывается (out of gas revert).">
            <DataBox
              label="Gas Remaining"
              value={state.gas.toLocaleString()}
              variant="default"
              style={{ flex: 1, minWidth: 100 }}
            />
          </DiagramTooltip>
          <DiagramTooltip content="Gas Used: стоимость текущего шага. PUSH = 3 gas, ADD = 3 gas, SSTORE cold = 22100 gas. Разница в стоимости показывает, почему оптимизация storage критична.">
            <DataBox
              label="Gas Used (step)"
              value={state.gasUsed > 0 ? state.gasUsed.toLocaleString() : '--'}
              variant="default"
              style={{ flex: 1, minWidth: 100 }}
            />
          </DiagramTooltip>
        </div>

        {/* Description */}
        <div style={{ ...glassStyle, padding: 12, fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
          {state.desc}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => setStep(0)}
            style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
          >
            Сброс
          </button>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              ...glassStyle, padding: '8px 16px',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              color: step === 0 ? colors.textMuted : colors.text,
              fontSize: 13, opacity: step === 0 ? 0.5 : 1,
            }}
          >
            Назад
          </button>
          <button
            onClick={() => setStep(s => Math.min(maxStep, s + 1))}
            disabled={step >= maxStep}
            style={{
              ...glassStyle, padding: '8px 16px',
              cursor: step >= maxStep ? 'not-allowed' : 'pointer',
              color: step >= maxStep ? colors.textMuted : colors.primary,
              fontSize: 13, opacity: step >= maxStep ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          Шаг {step} из {maxStep} |{' '}
          <span style={{ color: colors.success }}>зеленый</span> = push,{' '}
          <span style={{ color: colors.warning }}>желтый</span> = storage modified
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  StorageLayoutDiagram                                                */
/* ================================================================== */

interface StorageSlot {
  slot: string;
  variable: string;
  type: string;
  size: string;
  packed: boolean;
  color: string;
}

const STORAGE_LAYOUT: StorageSlot[] = [
  { slot: '0', variable: 'uint256 a', type: 'uint256', size: '32 bytes', packed: false, color: colors.primary },
  { slot: '1', variable: 'uint128 b + uint128 c', type: 'uint128 + uint128', size: '16 + 16 = 32 bytes', packed: true, color: colors.accent },
  { slot: '2', variable: 'mapping(address => uint256) d', type: 'mapping', size: 'base slot', packed: false, color: colors.success },
];

/**
 * StorageLayoutDiagram -- Shows how Solidity maps variables to 32-byte storage slots.
 */
export function StorageLayoutDiagram() {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [mappingKey, setMappingKey] = useState('0xAbCd...1234');

  // Simulated keccak256(key . slot) using FNV
  const mappingSlot = useMemo(() => {
    const input = mappingKey + '.2';
    return '0x' + fnvHash(input);
  }, [mappingKey]);

  const EXAMPLE_KEYS = [
    '0xAbCd...1234',
    '0x7890...5678',
    '0xDEF0...9ABC',
  ];

  return (
    <DiagramContainer title="Storage Layout: переменные и слоты" color="green">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Contract source preview */}
        <div style={{ ...glassStyle, padding: 12, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 }}>
          <div style={{ color: colors.textMuted }}>{'// Contract storage layout'}</div>
          <div><span style={{ color: colors.secondary }}>uint256</span> <span style={{ color: colors.text }}>a;</span> <span style={{ color: colors.textMuted }}>{'// slot 0'}</span></div>
          <div><span style={{ color: colors.secondary }}>uint128</span> <span style={{ color: colors.text }}>b;</span> <span style={{ color: colors.textMuted }}>{'// slot 1 (lower 16 bytes)'}</span></div>
          <div><span style={{ color: colors.secondary }}>uint128</span> <span style={{ color: colors.text }}>c;</span> <span style={{ color: colors.textMuted }}>{'// slot 1 (upper 16 bytes)'}</span></div>
          <div><span style={{ color: colors.secondary }}>{'mapping(address => uint256)'}</span> <span style={{ color: colors.text }}>d;</span> <span style={{ color: colors.textMuted }}>{'// slot 2 (base)'}</span></div>
        </div>

        {/* Storage slots visualization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STORAGE_LAYOUT.map((slot, i) => {
            const slotTooltips = [
              'Slot 0: uint256 занимает ровно 1 slot (32 байта). Переменные располагаются последовательно начиная с slot 0.',
              'Slot 1: два uint128 (по 16 байт) упакованы в один slot. Solidity автоматически упаковывает если типы помещаются.',
              'Slot 2: mapping -- base slot пуст, элементы хранятся по keccak256(key . slot). Данные разбросаны по всему storage.',
            ];
            return (
              <DiagramTooltip key={i} content={slotTooltips[i]}>
                <div
                  onClick={() => setSelectedSlot(selectedSlot === i ? null : i)}
                  style={{
                    ...glassStyle,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    border: `1px solid ${selectedSlot === i ? slot.color + '80' : slot.color + '30'}`,
                    background: selectedSlot === i ? `${slot.color}12` : 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: slot.color, fontWeight: 600 }}>
                      Slot {slot.slot}
                    </span>
                    <span style={{ fontSize: 11, color: colors.textMuted }}>
                      {slot.variable}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: 11, color: colors.text }}>{slot.size}</span>
                    {slot.packed && (
                      <span style={{ fontSize: 10, color: colors.warning, padding: '1px 6px', background: `${colors.warning}15`, borderRadius: 4 }}>
                        packed
                      </span>
                    )}
                  </div>
                </div>
              </DiagramTooltip>
            );
          })}
        </div>

        {/* Packed slot detail */}
        {selectedSlot === 1 && (
          <div style={{ ...glassStyle, padding: 14 }}>
            <div style={{ fontSize: 11, color: colors.accent, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Slot 1: Packing (2 переменные в 1 слоте)
            </div>
            <div style={{ display: 'flex', fontFamily: 'monospace', fontSize: 12 }}>
              <div style={{ flex: 1, padding: 8, background: `${colors.accent}15`, border: `1px solid ${colors.accent}30`, borderRadius: '8px 0 0 8px', textAlign: 'center' }}>
                <div style={{ color: colors.accent }}>b (uint128)</div>
                <div style={{ color: colors.textMuted, fontSize: 10 }}>bytes 0-15</div>
              </div>
              <div style={{ flex: 1, padding: 8, background: `${colors.warning}15`, border: `1px solid ${colors.warning}30`, borderRadius: '0 8px 8px 0', textAlign: 'center' }}>
                <div style={{ color: colors.warning }}>c (uint128)</div>
                <div style={{ color: colors.textMuted, fontSize: 10 }}>bytes 16-31</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
              Solidity упаковывает переменные меньше 32 байт в один слот, если они объявлены подряд.
              uint128 (16 байт) + uint128 (16 байт) = 32 байта = 1 слот.
            </div>
          </div>
        )}

        {/* Mapping slot computation */}
        {selectedSlot === 2 && (
          <div style={{ ...glassStyle, padding: 14 }}>
            <div style={{ fontSize: 11, color: colors.success, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mapping: вычисление слота значения
            </div>
            <div style={{ fontSize: 12, color: colors.text, marginBottom: 10, lineHeight: 1.6 }}>
              Для <code style={{ color: colors.accent }}>mapping(address =&gt; uint256) d</code> значение
              хранится в слоте <code style={{ color: colors.warning }}>keccak256(key . slot)</code>,
              где <code style={{ color: colors.textMuted }}>.</code> -- конкатенация 32-байтных значений.
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {EXAMPLE_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => setMappingKey(key)}
                  style={{
                    ...glassStyle,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: mappingKey === key ? colors.success : colors.textMuted,
                    border: `1px solid ${mappingKey === key ? colors.success + '60' : colors.border}`,
                  }}
                >
                  {key}
                </button>
              ))}
            </div>

            <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2, color: colors.text }}>
              <div>key = <span style={{ color: colors.accent }}>{mappingKey}</span></div>
              <div>slot = <span style={{ color: colors.success }}>2</span></div>
              <div>keccak256({mappingKey} . 2) = <span style={{ color: colors.warning }}>{mappingSlot}</span></div>
              <div style={{ color: colors.textMuted }}>Значение d[{truncHex(mappingKey, 8)}] хранится в слоте {truncHex(mappingSlot, 12)}</div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
          Нажмите на слот для подробностей. Mapping использует FNV-хеш для демонстрации (вместо keccak256).
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MemoryExpansionDiagram                                              */
/* ================================================================== */

interface MemoryStep {
  title: string;
  desc: string;
  offset: string;
  value: string;
  memorySize: number;
  gasCost: number;
  totalGas: number;
  memoryMap: { offset: number; label: string; color: string }[];
}

const MEMORY_STEPS: MemoryStep[] = [
  {
    title: 'Начальное состояние',
    desc: 'Память пуста. Размер = 0 байт. Указатель свободной памяти (free memory pointer) по умолчанию = 0x80.',
    offset: '--', value: '--', memorySize: 0, gasCost: 0, totalGas: 0,
    memoryMap: [],
  },
  {
    title: 'MSTORE(0x00, 0xFF...FF)',
    desc: 'Записываем 32 байта по смещению 0x00. Память расширяется до 32 байт (1 слово). Стоимость расширения: 3 gas.',
    offset: '0x00', value: '0xFF...FF', memorySize: 32, gasCost: 3, totalGas: 6,
    memoryMap: [{ offset: 0, label: '0xFF...FF', color: colors.primary }],
  },
  {
    title: 'MSTORE(0x40, 0x80)',
    desc: 'Записываем 32 байта по смещению 0x40 (64). Память расширяется до 96 байт (3 слова). Расширение на 2 слова: 6 gas.',
    offset: '0x40', value: '0x00...80', memorySize: 96, gasCost: 6, totalGas: 15,
    memoryMap: [
      { offset: 0, label: '0xFF...FF', color: colors.primary },
      { offset: 32, label: '0x00...00', color: colors.textMuted },
      { offset: 64, label: '0x00...80', color: colors.accent },
    ],
  },
  {
    title: 'MSTORE(0x100, 0x42)',
    desc: 'Записываем по смещению 0x100 (256). Память расширяется до 288 байт (9 слов). Квадратичная стоимость: 9 + 9^2/512 = ~9.16 gas.',
    offset: '0x100', value: '0x00...42', memorySize: 288, gasCost: 9, totalGas: 30,
    memoryMap: [
      { offset: 0, label: '0xFF...FF', color: colors.primary },
      { offset: 32, label: '0x00...00', color: colors.textMuted },
      { offset: 64, label: '0x00...80', color: colors.accent },
      { offset: 96, label: '...zeros...', color: colors.textMuted },
      { offset: 256, label: '0x00...42', color: colors.warning },
    ],
  },
];

/**
 * MemoryExpansionDiagram -- Memory expansion with quadratic gas cost visualization.
 */
export function MemoryExpansionDiagram() {
  const [step, setStep] = useState(0);
  const state = MEMORY_STEPS[step];
  const maxStep = MEMORY_STEPS.length - 1;

  // Memory cost formula: memory_cost = (a * 3) + (a^2 / 512), where a = number of 32-byte words
  const memoryCostData = useMemo(() => {
    const points: { words: number; cost: number }[] = [];
    for (let w = 0; w <= 20; w++) {
      const cost = w * 3 + Math.floor(w * w / 512);
      points.push({ words: w, cost });
    }
    return points;
  }, []);

  const currentWords = Math.ceil(state.memorySize / 32);

  return (
    <DiagramContainer title="Расширение памяти EVM" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Step info */}
        <DataBox label={state.title} value={state.desc} variant="highlight" />

        {/* Memory layout */}
        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 11, color: colors.accent, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Memory ({state.memorySize} bytes = {currentWords} words)
          </div>
          {state.memoryMap.length === 0 ? (
            <div style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>пусто</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {state.memoryMap.map((m, i) => (
                <div
                  key={i}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    background: `${m.color}15`,
                    border: `1px solid ${m.color}30`,
                    color: m.color,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>0x{m.offset.toString(16).padStart(2, '0')}</span>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gas cost bar chart */}
        <DiagramTooltip content="Memory expansion: стоимость растёт квадратично. Первые 724 байта линейны (3 gas/word). После -- квадратичная компонента: memory_cost = (words^2 / 512) + 3 * words.">
        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 11, color: colors.warning, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Gas Cost: memory_cost = words * 3 + words^2 / 512
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
            {memoryCostData.slice(0, 15).map((p, i) => {
              const maxCost = memoryCostData[14].cost || 1;
              const height = Math.max(2, (p.cost / maxCost) * 50);
              const isCurrent = p.words === currentWords;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height,
                    background: isCurrent ? colors.warning : `${colors.primary}40`,
                    borderRadius: '2px 2px 0 0',
                    transition: 'all 200ms ease',
                    position: 'relative',
                  }}
                  title={`${p.words} words: ${p.cost} gas`}
                >
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: -16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      color: colors.warning,
                      whiteSpace: 'nowrap',
                    }}>
                      {p.cost}g
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
            <span>0 words</span>
            <span>14 words</span>
          </div>
        </div>
        </DiagramTooltip>

        {/* Gas stats */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <DiagramTooltip content="Memory Size: текущий размер выделенной памяти. Расширяется порциями по 32 байта (1 word). Нельзя уменьшить -- только растёт.">
            <DataBox label="Memory Size" value={`${state.memorySize} bytes`} variant="default" style={{ flex: 1, minWidth: 100 }} />
          </DiagramTooltip>
          <DiagramTooltip content="Expansion Cost: стоимость расширения памяти на текущем шаге. Первые ~724 байта линейны (3 gas/word), затем квадратичная компонента.">
            <DataBox label="Expansion Cost" value={state.gasCost > 0 ? `${state.gasCost} gas` : '--'} variant="default" style={{ flex: 1, minWidth: 100 }} />
          </DiagramTooltip>
          <DiagramTooltip content="Total Memory Gas: суммарная стоимость всех расширений памяти. Формула: memory_cost = words * 3 + words^2 / 512.">
            <DataBox label="Total Memory Gas" value={state.totalGas > 0 ? `${state.totalGas} gas` : '--'} variant="default" style={{ flex: 1, minWidth: 100 }} />
          </DiagramTooltip>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => setStep(0)}
            style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
          >
            Сброс
          </button>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              ...glassStyle, padding: '8px 16px',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              color: step === 0 ? colors.textMuted : colors.text,
              fontSize: 13, opacity: step === 0 ? 0.5 : 1,
            }}
          >
            Назад
          </button>
          <button
            onClick={() => setStep(s => Math.min(maxStep, s + 1))}
            disabled={step >= maxStep}
            style={{
              ...glassStyle, padding: '8px 16px',
              cursor: step >= maxStep ? 'not-allowed' : 'pointer',
              color: step >= maxStep ? colors.textMuted : colors.primary,
              fontSize: 13, opacity: step >= maxStep ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          Шаг {step} из {maxStep} | Стоимость растет квадратично с размером памяти
        </div>
      </div>
    </DiagramContainer>
  );
}
