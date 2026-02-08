/**
 * Script Execution Diagrams
 *
 * Exports:
 * - P2PKHStackAnimation: Step-through P2PKH script execution (7 steps, history array)
 * - OpcodeReferenceDiagram: Opcode reference grid with hover tooltips (10+ opcodes)
 * - ScriptEvalFlowDiagram: Script validation process flow (scriptSig -> scriptPubKey)
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { Arrow } from '@primitives/Arrow';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  P2PKH Stack Animation Data                                         */
/* ------------------------------------------------------------------ */

interface ScriptStep {
  opLabel: string;
  stack: string[];
  description: string;
  highlight: number; // index of current opcode in script array
}

const P2PKH_SCRIPT_OPS = [
  '<sig>',
  '<pubKey>',
  'OP_DUP',
  'OP_HASH160',
  '<pubKeyHash>',
  'OP_EQUALVERIFY',
  'OP_CHECKSIG',
];

const P2PKH_STEPS: ScriptStep[] = [
  {
    opLabel: '<sig>',
    stack: ['3045...a1f2'],
    description: 'Push подпись (signature) из scriptSig на стек. Это ECDSA-подпись владельца UTXO.',
    highlight: 0,
  },
  {
    opLabel: '<pubKey>',
    stack: ['3045...a1f2', '0279...e3b4'],
    description: 'Push публичный ключ из scriptSig на стек. Этот ключ будет проверен позже.',
    highlight: 1,
  },
  {
    opLabel: 'OP_DUP',
    stack: ['3045...a1f2', '0279...e3b4', '0279...e3b4'],
    description: 'OP_DUP дублирует верхний элемент стека. Теперь pubKey на стеке дважды.',
    highlight: 2,
  },
  {
    opLabel: 'OP_HASH160',
    stack: ['3045...a1f2', '0279...e3b4', 'a914...7d8f'],
    description: 'OP_HASH160 применяет SHA-256 + RIPEMD-160 к верхнему элементу. pubKey -> hash160(pubKey).',
    highlight: 3,
  },
  {
    opLabel: '<pubKeyHash>',
    stack: ['3045...a1f2', '0279...e3b4', 'a914...7d8f', 'a914...7d8f'],
    description: 'Push ожидаемый хеш из scriptPubKey. Это адрес получателя (hash160 от его публичного ключа).',
    highlight: 4,
  },
  {
    opLabel: 'OP_EQUALVERIFY',
    stack: ['3045...a1f2', '0279...e3b4'],
    description: 'OP_EQUALVERIFY сравнивает два верхних элемента. Если хеши равны -- удаляет оба и продолжает. Если нет -- скрипт НЕМЕДЛЕННО завершается с ошибкой.',
    highlight: 5,
  },
  {
    opLabel: 'OP_CHECKSIG',
    stack: ['true'],
    description: 'OP_CHECKSIG проверяет подпись (sig) относительно публичного ключа (pubKey). Если подпись валидна -- кладет true на стек. Транзакция подтверждена!',
    highlight: 6,
  },
];

const P2SH_SCRIPT_OPS = [
  '<sig1>',
  '<sig2>',
  '<redeemScript>',
  'OP_HASH160',
  '<scriptHash>',
  'OP_EQUAL',
  '--- Redeem ---',
  'OP_2',
  '<pk1>',
  '<pk2>',
  '<pk3>',
  'OP_3',
  'OP_CHECKMULTISIG',
];

const P2SH_STEPS: ScriptStep[] = [
  {
    opLabel: '<sig1>',
    stack: ['sig1'],
    description: 'Push первую подпись на стек (из scriptSig).',
    highlight: 0,
  },
  {
    opLabel: '<sig2>',
    stack: ['sig1', 'sig2'],
    description: 'Push вторую подпись на стек.',
    highlight: 1,
  },
  {
    opLabel: '<redeemScript>',
    stack: ['sig1', 'sig2', '5221...ae'],
    description: 'Push сериализованный redeemScript (2-of-3 мультиподпись).',
    highlight: 2,
  },
  {
    opLabel: 'OP_HASH160',
    stack: ['sig1', 'sig2', 'c3f4...89ab'],
    description: 'OP_HASH160 хеширует redeemScript. Результат сравнится с хешем в scriptPubKey.',
    highlight: 3,
  },
  {
    opLabel: '<scriptHash>',
    stack: ['sig1', 'sig2', 'c3f4...89ab', 'c3f4...89ab'],
    description: 'Push ожидаемый хеш скрипта из scriptPubKey.',
    highlight: 4,
  },
  {
    opLabel: 'OP_EQUAL',
    stack: ['sig1', 'sig2'],
    description: 'OP_EQUAL проверяет, что хеши совпадают. Если да -- запускается redeemScript.',
    highlight: 5,
  },
  {
    opLabel: '--- Redeem Script ---',
    stack: ['sig1', 'sig2'],
    description: 'Теперь выполняется десериализованный redeemScript (2-of-3 мультиподпись).',
    highlight: 6,
  },
  {
    opLabel: 'OP_CHECKMULTISIG',
    stack: ['true'],
    description: 'OP_CHECKMULTISIG проверяет 2 подписи из 3 возможных публичных ключей. Результат: true.',
    highlight: 12,
  },
];

type ScriptType = 'P2PKH' | 'P2SH';

const SCRIPT_DATA: Record<ScriptType, { ops: string[]; steps: ScriptStep[]; label: string }> = {
  P2PKH: { ops: P2PKH_SCRIPT_OPS, steps: P2PKH_STEPS, label: 'P2PKH' },
  P2SH: { ops: P2SH_SCRIPT_OPS, steps: P2SH_STEPS, label: 'P2SH (Multisig)' },
};

/* ------------------------------------------------------------------ */
/*  P2PKHStackAnimation                                                */
/* ------------------------------------------------------------------ */

/**
 * P2PKHStackAnimation - Core animated diagram for BTC-04.
 * Step-through script execution using history array pattern.
 * 7 steps for P2PKH, 8 steps for P2SH multisig.
 * Three columns: Script ops | Stack | Description.
 */
export function P2PKHStackAnimation() {
  const [scriptType, setScriptType] = useState<ScriptType>('P2PKH');
  const [step, setStep] = useState(0);

  const data = SCRIPT_DATA[scriptType];
  const current = data.steps[step];
  const maxStep = data.steps.length - 1;

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, maxStep));
  }, [maxStep]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
  }, []);

  const handleScriptChange = useCallback((type: ScriptType) => {
    setScriptType(type);
    setStep(0);
  }, []);

  const isComplete = step === maxStep && current.stack[0] === 'true';

  return (
    <DiagramContainer title={`Выполнение Bitcoin Script: ${data.label}`} color="green">
      {/* Script type selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        {(Object.keys(SCRIPT_DATA) as ScriptType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleScriptChange(type)}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: scriptType === type ? colors.success : colors.textMuted,
              border: `1px solid ${scriptType === type ? colors.success : 'rgba(255,255,255,0.1)'}`,
              background: scriptType === type ? `${colors.success}15` : 'rgba(255,255,255,0.03)',
            }}
          >
            {SCRIPT_DATA[type].label}
          </button>
        ))}
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {data.steps.map((_, i) => (
          <div
            key={i}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              background: i <= step ? `${colors.success}30` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${i === step ? colors.success : i < step ? `${colors.success}60` : 'rgba(255,255,255,0.1)'}`,
              color: i <= step ? colors.success : colors.textMuted,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => setStep(i)}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Three-column layout: Script | Stack | Description */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 12, marginBottom: 16 }}>
        {/* Left: Script opcodes */}
        <div style={{ ...glassStyle, padding: 12, borderColor: `${colors.primary}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.primary, marginBottom: 8, textAlign: 'center' }}>
            Script
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {data.ops.map((op, i) => {
              const isActive = i === current.highlight;
              const isPast = i < current.highlight;
              return (
                <div
                  key={i}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? colors.success : isPast ? colors.textMuted : colors.text,
                    background: isActive ? `${colors.success}20` : 'transparent',
                    border: isActive ? `1px solid ${colors.success}60` : '1px solid transparent',
                    opacity: isPast ? 0.5 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  {op}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Stack visualization */}
        <div style={{ ...glassStyle, padding: 12, borderColor: `${colors.accent}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.accent, marginBottom: 8, textAlign: 'center' }}>
            Стек
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: 4,
            minHeight: 120,
            justifyContent: 'flex-start',
          }}>
            {current.stack.map((item, i) => {
              const isTop = i === current.stack.length - 1;
              const isTrueResult = item === 'true';
              return (
                <div
                  key={`${step}-${i}`}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    textAlign: 'center',
                    color: isTrueResult ? colors.success : isTop ? colors.accent : colors.text,
                    background: isTrueResult
                      ? `${colors.success}20`
                      : isTop
                        ? `${colors.accent}15`
                        : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isTrueResult ? colors.success : isTop ? colors.accent : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.3s',
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: 8,
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 4,
            fontSize: 10,
            color: colors.textMuted,
            textAlign: 'center',
          }}>
            {current.stack.length} {current.stack.length === 1 ? 'элемент' : 'элемента'}
          </div>
        </div>

        {/* Right: Description */}
        <div style={{ ...glassStyle, padding: 12, borderColor: `${colors.warning}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.warning, marginBottom: 8, textAlign: 'center' }}>
            Шаг {step}: {current.opLabel}
          </div>
          <div style={{
            fontSize: 12,
            color: colors.textMuted,
            lineHeight: 1.7,
          }}>
            {current.description}
          </div>

          {/* Result indicator */}
          {isComplete && (
            <div style={{
              marginTop: 12,
              padding: '8px 12px',
              background: `${colors.success}15`,
              border: `1px solid ${colors.success}40`,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              color: colors.success,
              textAlign: 'center',
            }}>
              Скрипт выполнен успешно! Стек: [true]
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
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
          onClick={handlePrev}
          disabled={step <= 0}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step <= 0 ? 'default' : 'pointer',
            fontSize: 12,
            color: step <= 0 ? colors.textMuted : colors.accent,
            border: `1px solid ${step <= 0 ? 'rgba(255,255,255,0.1)' : colors.accent}`,
            background: step <= 0 ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
            opacity: step <= 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={handleNext}
          disabled={step >= maxStep}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step >= maxStep ? 'default' : 'pointer',
            fontSize: 12,
            color: step >= maxStep ? colors.textMuted : colors.success,
            border: `1px solid ${step >= maxStep ? 'rgba(255,255,255,0.1)' : colors.success}`,
            background: step >= maxStep ? 'rgba(255,255,255,0.03)' : `${colors.success}15`,
            opacity: step >= maxStep ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  OpcodeReferenceDiagram                                             */
/* ------------------------------------------------------------------ */

interface OpcodeInfo {
  name: string;
  hex: string;
  description: string;
  stackBefore: string;
  stackAfter: string;
  category: 'crypto' | 'stack' | 'flow' | 'timelock' | 'arithmetic';
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: colors.primary,
  stack: colors.accent,
  flow: colors.warning,
  timelock: colors.secondary,
  arithmetic: colors.info,
};

const CATEGORY_LABELS: Record<string, string> = {
  crypto: 'Криптография',
  stack: 'Стек',
  flow: 'Поток',
  timelock: 'Таймлок',
  arithmetic: 'Арифметика',
};

const OPCODES: OpcodeInfo[] = [
  {
    name: 'OP_DUP',
    hex: '0x76',
    description: 'Дублирует верхний элемент стека',
    stackBefore: '[...x]',
    stackAfter: '[...x, x]',
    category: 'stack',
  },
  {
    name: 'OP_HASH160',
    hex: '0xa9',
    description: 'SHA-256 + RIPEMD-160 верхнего элемента',
    stackBefore: '[...x]',
    stackAfter: '[...Hash160(x)]',
    category: 'crypto',
  },
  {
    name: 'OP_EQUALVERIFY',
    hex: '0x88',
    description: 'Проверяет равенство двух верхних элементов, иначе ошибка',
    stackBefore: '[...a, b]',
    stackAfter: '[...]',
    category: 'stack',
  },
  {
    name: 'OP_CHECKSIG',
    hex: '0xac',
    description: 'Проверяет ECDSA-подпись относительно публичного ключа',
    stackBefore: '[...sig, pubKey]',
    stackAfter: '[...true/false]',
    category: 'crypto',
  },
  {
    name: 'OP_EQUAL',
    hex: '0x87',
    description: 'Проверяет равенство, кладет результат на стек',
    stackBefore: '[...a, b]',
    stackAfter: '[...true/false]',
    category: 'stack',
  },
  {
    name: 'OP_CHECKMULTISIG',
    hex: '0xae',
    description: 'Проверяет m-of-n мультиподпись',
    stackBefore: '[...sigs, n, pubKeys, m]',
    stackAfter: '[...true/false]',
    category: 'crypto',
  },
  {
    name: 'OP_HASH256',
    hex: '0xaa',
    description: 'Двойной SHA-256 верхнего элемента',
    stackBefore: '[...x]',
    stackAfter: '[...SHA256d(x)]',
    category: 'crypto',
  },
  {
    name: 'OP_IF',
    hex: '0x63',
    description: 'Условное ветвление: выполнить если top != 0',
    stackBefore: '[...condition]',
    stackAfter: '[...]',
    category: 'flow',
  },
  {
    name: 'OP_ELSE',
    hex: '0x67',
    description: 'Альтернативная ветка OP_IF',
    stackBefore: '---',
    stackAfter: '---',
    category: 'flow',
  },
  {
    name: 'OP_ENDIF',
    hex: '0x68',
    description: 'Конец условного блока',
    stackBefore: '---',
    stackAfter: '---',
    category: 'flow',
  },
  {
    name: 'OP_CLTV',
    hex: '0xb1',
    description: 'Проверяет абсолютный таймлок (CHECKLOCKTIMEVERIFY)',
    stackBefore: '[...locktime]',
    stackAfter: '[...locktime]',
    category: 'timelock',
  },
  {
    name: 'OP_CSV',
    hex: '0xb2',
    description: 'Проверяет относительный таймлок (CHECKSEQUENCEVERIFY)',
    stackBefore: '[...sequence]',
    stackAfter: '[...sequence]',
    category: 'timelock',
  },
  {
    name: 'OP_RETURN',
    hex: '0x6a',
    description: 'Делает выход непотребляемым (для данных)',
    stackBefore: '---',
    stackAfter: 'FAIL',
    category: 'flow',
  },
];

/**
 * OpcodeReferenceDiagram - Opcode reference grid with hover tooltips.
 * Color-coded by category. Shows stack effects on hover.
 */
export function OpcodeReferenceDiagram() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <DiagramContainer title="Справочник опкодов Bitcoin Script" color="blue">
      {/* Category legend */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: CATEGORY_COLORS[key],
              opacity: 0.7,
            }} />
            <span style={{ fontSize: 11, color: colors.textMuted }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Opcode grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 8,
        marginBottom: 16,
      }}>
        {OPCODES.map((op, i) => {
          const catColor = CATEGORY_COLORS[op.category];
          const isHovered = hovered === i;
          return (
            <div
              key={op.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...glassStyle,
                padding: '10px 10px',
                borderColor: isHovered ? `${catColor}60` : `${catColor}20`,
                background: isHovered ? `${catColor}10` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'monospace',
                color: catColor,
                marginBottom: 2,
              }}>
                {op.name}
              </div>
              <div style={{
                fontSize: 10,
                color: colors.textMuted,
                fontFamily: 'monospace',
              }}>
                {op.hex}
              </div>
              <div style={{
                fontSize: 10,
                color: colors.textMuted,
                marginTop: 4,
                lineHeight: 1.4,
              }}>
                {op.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover detail panel */}
      {hovered !== null && (
        <div style={{
          ...glassStyle,
          padding: 14,
          borderColor: `${CATEGORY_COLORS[OPCODES[hovered].category]}40`,
          background: `${CATEGORY_COLORS[OPCODES[hovered].category]}08`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'monospace',
              color: CATEGORY_COLORS[OPCODES[hovered].category],
            }}>
              {OPCODES[hovered].name}
            </span>
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 4,
              background: `${CATEGORY_COLORS[OPCODES[hovered].category]}20`,
              color: CATEGORY_COLORS[OPCODES[hovered].category],
            }}>
              {CATEGORY_LABELS[OPCODES[hovered].category]}
            </span>
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            {OPCODES[hovered].description}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'monospace',
            fontSize: 12,
          }}>
            <span style={{ color: colors.text }}>{OPCODES[hovered].stackBefore}</span>
            <Arrow direction="right" />
            <span style={{ color: colors.success }}>{OPCODES[hovered].stackAfter}</span>
          </div>
        </div>
      )}
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  ScriptEvalFlowDiagram                                              */
/* ------------------------------------------------------------------ */

/**
 * ScriptEvalFlowDiagram - Script evaluation process flow.
 * Shows: scriptSig -> stack -> scriptPubKey -> result.
 * Also shows P2SH and SegWit variations.
 */
export function ScriptEvalFlowDiagram() {
  const [variant, setVariant] = useState<'standard' | 'p2sh' | 'segwit'>('standard');

  return (
    <DiagramContainer title="Процесс валидации скрипта" color="purple">
      {/* Variant selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        {[
          { key: 'standard' as const, label: 'Стандартный (P2PKH)' },
          { key: 'p2sh' as const, label: 'P2SH' },
          { key: 'segwit' as const, label: 'SegWit' },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setVariant(v.key)}
            style={{
              ...glassStyle,
              padding: '5px 12px',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              color: variant === v.key ? colors.secondary : colors.textMuted,
              border: `1px solid ${variant === v.key ? colors.secondary : 'rgba(255,255,255,0.1)'}`,
              background: variant === v.key ? `${colors.secondary}15` : 'rgba(255,255,255,0.03)',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Flow diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {/* Phase 1: scriptSig / witness */}
        <DataBox
          label={variant === 'segwit' ? 'Witness Data' : 'scriptSig'}
          value={
            variant === 'standard'
              ? '<sig> <pubKey>'
              : variant === 'p2sh'
                ? '<sig1> <sig2> <redeemScript>'
                : '<sig> <pubKey> (в witness поле)'
          }
          variant="highlight"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Arrow direction="down" />
          <span style={{ fontSize: 11, color: colors.textMuted }}>Выполнить на стеке</span>
        </div>

        {/* Phase 2: Stack state after scriptSig */}
        <div style={{
          ...glassStyle,
          padding: 12,
          borderColor: `${colors.accent}30`,
          textAlign: 'center',
          width: '100%',
          maxWidth: 300,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: colors.accent, marginBottom: 4 }}>
            Стек после фазы 1
          </div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.text }}>
            {variant === 'standard'
              ? '[sig, pubKey]'
              : variant === 'p2sh'
                ? '[sig1, sig2, redeemScript]'
                : '[sig, pubKey]'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Arrow direction="down" />
          <span style={{ fontSize: 11, color: colors.textMuted }}>scriptPubKey на тот же стек</span>
        </div>

        {/* Phase 3: scriptPubKey execution */}
        <DataBox
          label="scriptPubKey"
          value={
            variant === 'standard'
              ? 'OP_DUP OP_HASH160 <hash> OP_EQUALVERIFY OP_CHECKSIG'
              : variant === 'p2sh'
                ? 'OP_HASH160 <scriptHash> OP_EQUAL'
                : 'OP_0 <20-byte witness program>'
          }
          variant="default"
        />

        {/* P2SH extra phase */}
        {variant === 'p2sh' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Arrow direction="down" />
              <span style={{ fontSize: 11, color: colors.warning }}>Десериализовать redeemScript</span>
            </div>

            <div style={{
              ...glassStyle,
              padding: 12,
              borderColor: `${colors.warning}40`,
              background: `${colors.warning}08`,
              textAlign: 'center',
              width: '100%',
              maxWidth: 300,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: colors.warning, marginBottom: 4 }}>
                Выполнение redeemScript
              </div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.text }}>
                OP_2 &lt;pk1&gt; &lt;pk2&gt; &lt;pk3&gt; OP_3 OP_CHECKMULTISIG
              </div>
            </div>
          </>
        )}

        {/* SegWit note */}
        {variant === 'segwit' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Arrow direction="down" />
              <span style={{ fontSize: 11, color: colors.info }}>Witness program определяет тип</span>
            </div>

            <div style={{
              ...glassStyle,
              padding: 12,
              borderColor: `${colors.info}40`,
              background: `${colors.info}08`,
              textAlign: 'center',
              width: '100%',
              maxWidth: 300,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: colors.info, marginBottom: 4 }}>
                Witness проверка
              </div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.text }}>
                Version 0, 20 bytes = P2WPKH (hash160 pubKey)
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                Witness данные проверяются вместо scriptSig
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Arrow direction="down" />
        </div>

        {/* Result */}
        <div style={{
          ...glassStyle,
          padding: 14,
          borderColor: `${colors.success}50`,
          background: `${colors.success}10`,
          textAlign: 'center',
          width: '100%',
          maxWidth: 300,
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: colors.success,
            marginBottom: 4,
          }}>
            Стек: [true]
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted }}>
            Транзакция валидна!
          </div>
        </div>
      </div>

      {/* Explanation note */}
      <div style={{
        marginTop: 16,
        ...glassStyle,
        padding: 10,
        borderColor: `${colors.secondary}20`,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 1.6,
      }}>
        <strong style={{ color: colors.secondary }}>Правило:</strong>{' '}
        После выполнения всех скриптов стек должен содержать одно ненулевое значение (true).
        Если стек пуст или содержит false -- транзакция отклоняется.
      </div>
    </DiagramContainer>
  );
}
