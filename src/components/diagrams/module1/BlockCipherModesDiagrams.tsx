/**
 * Block Cipher Modes Diagrams
 *
 * Exports:
 * - ECBPenguinDiagram: ECB mode pattern weakness (static)
 * - CBCModeDiagram: Step-through CBC encryption animation
 * - CTRModeDiagram: Step-through CTR mode animation
 * - GCMModeDiagram: Authenticated encryption flow with step-through
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                       */
/* ------------------------------------------------------------------ */

/** Simple deterministic "hash" for visual demo (not cryptographic). */
function pseudoEncrypt(input: string, key: string): string {
  let hash = 0;
  const combined = input + key;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
}

/** Simple XOR of two hex strings for visual demo. */
function xorHex(a: string, b: string): string {
  const result: string[] = [];
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const xored = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    result.push(xored.toString(16));
  }
  return result.join('');
}

function StepControls({
  step,
  maxStep,
  onStep,
  onReset,
}: {
  step: number;
  maxStep: number;
  onStep: () => void;
  onReset: () => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
      <button
        onClick={onReset}
        style={{
          ...glassStyle,
          padding: '6px 14px',
          cursor: 'pointer',
          color: colors.text,
          fontSize: 13,
        }}
      >
        Сброс
      </button>
      <button
        onClick={onStep}
        disabled={step >= maxStep}
        style={{
          ...glassStyle,
          padding: '6px 14px',
          cursor: step >= maxStep ? 'not-allowed' : 'pointer',
          color: step >= maxStep ? colors.textMuted : colors.primary,
          fontSize: 13,
          opacity: step >= maxStep ? 0.5 : 1,
          background: step < maxStep ? `${colors.primary}15` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${step < maxStep ? colors.primary + '40' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        Следующий шаг
      </button>
      <span style={{
        fontSize: 12,
        color: colors.textMuted,
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'monospace',
      }}>
        {step}/{maxStep}
      </span>
    </div>
  );
}

/** Block display component. */
function Block({
  label,
  value,
  active,
  color: blockColor,
}: {
  label: string;
  value: string;
  active?: boolean;
  color?: string;
}) {
  const c = blockColor || colors.text;
  return (
    <div style={{
      ...glassStyle,
      padding: '8px 12px',
      minWidth: 90,
      textAlign: 'center',
      borderColor: active ? `${c}50` : 'rgba(255,255,255,0.08)',
      background: active ? `${c}10` : 'rgba(255,255,255,0.02)',
      transition: 'all 0.3s',
    }}>
      <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: c, fontFamily: 'monospace', fontWeight: active ? 600 : 400 }}>
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ECBPenguinDiagram                                                   */
/* ------------------------------------------------------------------ */

/**
 * ECBPenguinDiagram - Shows the ECB pattern weakness.
 * Uses a simplified pixel grid to demonstrate that identical plaintext blocks
 * produce identical ciphertext blocks, making patterns visible.
 */

// Define a simple 8x8 pattern (a triangle/arrow shape)
const PATTERN_ORIGINAL: number[][] = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];

// ECB: same input block -> same output. Map 0->A, 1->B (two distinct "encrypted" values)
const ECB_COLORS: Record<number, string> = {
  0: '#1a3a5c',  // "encrypted" dark block
  1: '#4a8ab5',  // "encrypted" light block
};

// CBC/proper encryption: each cell gets a unique-looking pseudorandom color
const CBC_SEED = [
  '#2d4a6e', '#5c3a2d', '#3a5c4a', '#6e2d5c', '#4a6e3a', '#2d5c6e', '#5c4a2d', '#3a2d5c',
  '#6e5c3a', '#2d3a6e', '#5c6e4a', '#3a5c2d', '#4a2d6e', '#6e3a5c', '#2d6e4a', '#5c2d3a',
  '#3a6e5c', '#6e4a2d', '#4a5c6e', '#2d5c3a', '#5c3a6e', '#3a2d4a', '#6e5c2d', '#4a3a5c',
  '#2d6e5c', '#5c4a6e', '#3a6e2d', '#6e2d4a', '#4a5c3a', '#2d4a5c', '#5c6e2d', '#3a4a6e',
  '#6e3a2d', '#4a2d5c', '#2d5c4a', '#5c2d6e', '#3a4a2d', '#6e5c4a', '#4a6e5c', '#2d3a5c',
  '#5c6e3a', '#3a5c6e', '#6e4a5c', '#4a3a2d', '#2d6e3a', '#5c2d4a', '#3a6e4a', '#6e2d3a',
  '#4a5c2d', '#2d4a3a', '#5c3a4a', '#3a2d6e', '#6e4a3a', '#4a6e2d', '#2d3a4a', '#5c6e5c',
  '#3a4a5c', '#6e3a4a', '#4a2d3a', '#2d5c2d', '#5c4a3a', '#3a6e6e', '#6e2d6e', '#4a3a6e',
];

export function ECBPenguinDiagram() {
  const cellSize = 28;
  const gap = 2;
  const gridWidth = 8 * (cellSize + gap);

  return (
    <DiagramContainer
      title="ECB: видимый паттерн (проблема пингвина)"
      color="red"
    >
      <div style={{
        display: 'flex',
        gap: 32,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Original pattern */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: colors.text, marginBottom: 8, fontWeight: 600 }}>
            Исходное изображение
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(8, ${cellSize}px)`,
            gap: `${gap}px`,
            width: 'fit-content',
            margin: '0 auto',
          }}>
            {PATTERN_ORIGINAL.flat().map((val, i) => (
              <div
                key={i}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 3,
                  background: val === 1 ? colors.primary : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${val === 1 ? colors.primary + '60' : 'rgba(255,255,255,0.08)'}`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ECB encrypted - pattern visible */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: colors.error || '#ef4444', marginBottom: 8, fontWeight: 600 }}>
            ECB шифрование
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(8, ${cellSize}px)`,
            gap: `${gap}px`,
            width: 'fit-content',
            margin: '0 auto',
          }}>
            {PATTERN_ORIGINAL.flat().map((val, i) => (
              <div
                key={i}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 3,
                  background: ECB_COLORS[val],
                  border: `1px solid rgba(255,255,255,0.08)`,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: colors.error || '#ef4444', marginTop: 4 }}>
            Паттерн все еще виден!
          </div>
        </div>

        {/* CBC/proper encrypted - pattern hidden */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: colors.success, marginBottom: 8, fontWeight: 600 }}>
            CBC/CTR шифрование
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(8, ${cellSize}px)`,
            gap: `${gap}px`,
            width: 'fit-content',
            margin: '0 auto',
          }}>
            {PATTERN_ORIGINAL.flat().map((_, i) => (
              <div
                key={i}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 3,
                  background: CBC_SEED[i % CBC_SEED.length],
                  border: `1px solid rgba(255,255,255,0.08)`,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: colors.success, marginTop: 4 }}>
            Паттерн скрыт
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: 12,
        ...glassStyle,
        borderColor: 'rgba(239,68,68,0.3)',
      }}>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          <strong style={{ color: colors.error || '#ef4444' }}>Проблема ECB:</strong>{' '}
          Одинаковые блоки открытого текста всегда дают одинаковые блоки шифротекста.
          Это означает, что паттерны в данных видны после шифрования.
          Это катастрофично для изображений и структурированных данных {'\u2014'} злоумышленник видит
          структуру данных без расшифровки.
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  CBCModeDiagram                                                      */
/* ------------------------------------------------------------------ */

const CBC_PLAINTEXTS = ['P1=41414141', 'P2=41414141', 'P3=42424242'];
const CBC_IV = '7a3f9c1e';
const CBC_KEY = 'secret';

/**
 * CBCModeDiagram - Step-through CBC encryption.
 * Shows how each plaintext block is XORed with the previous ciphertext (or IV)
 * before encryption, creating a chain.
 */
export function CBCModeDiagram() {
  const [step, setStep] = useState(0);
  // step 0: show IV and plaintext blocks
  // step 1: XOR P1 with IV, encrypt -> C1
  // step 2: XOR P2 with C1, encrypt -> C2
  // step 3: XOR P3 with C2, encrypt -> C3

  const ciphertexts: string[] = [];
  let prevBlock = CBC_IV;
  for (let i = 0; i < CBC_PLAINTEXTS.length; i++) {
    const xored = xorHex(CBC_PLAINTEXTS[i].split('=')[1], prevBlock);
    const ct = pseudoEncrypt(xored, CBC_KEY);
    ciphertexts.push(ct);
    prevBlock = ct;
  }

  return (
    <DiagramContainer
      title="CBC: цепочка блоков шифрования"
      color="blue"
    >
      {/* Initial state: plaintext blocks */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, textAlign: 'center' }}>
          Открытый текст (заметьте: P1 и P2 одинаковы!)
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Block label="IV" value={CBC_IV} active={step >= 0} color={colors.accent} />
          {CBC_PLAINTEXTS.map((p, i) => (
            <Block
              key={i}
              label={`Блок ${i + 1}`}
              value={p}
              active={step >= i + 1}
              color={step === i + 1 ? colors.primary : undefined}
            />
          ))}
        </div>
      </div>

      {/* Processing visualization */}
      {step >= 1 && (
        <div style={{
          padding: 12,
          ...glassStyle,
          borderColor: `${colors.primary}30`,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
            Шаг {step}: Обработка блока {step}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Block
              label={step === 1 ? 'IV' : `C${step - 1}`}
              value={step === 1 ? CBC_IV : ciphertexts[step - 2]}
              active
              color={colors.accent}
            />
            <span style={{ fontSize: 16, color: colors.textMuted }}>XOR</span>
            <Block
              label={`P${step}`}
              value={CBC_PLAINTEXTS[step - 1]}
              active
              color={colors.primary}
            />
            <Arrow direction="right" label="AES" />
            <Block
              label={`C${step}`}
              value={ciphertexts[step - 1]}
              active
              color={colors.success}
            />
          </div>
        </div>
      )}

      {/* Ciphertext output */}
      <div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, textAlign: 'center' }}>
          Шифротекст
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {ciphertexts.map((ct, i) => (
            <Block
              key={i}
              label={`C${i + 1}`}
              value={step > i ? ct : '????????'}
              active={step > i}
              color={step > i ? colors.success : undefined}
            />
          ))}
        </div>
      </div>

      {/* Key observation */}
      {step >= 3 && (
        <div style={{
          marginTop: 12,
          padding: 10,
          ...glassStyle,
          borderColor: `${colors.success}30`,
        }}>
          <div style={{ fontSize: 12, color: colors.success, lineHeight: 1.6 }}>
            P1 и P2 одинаковы ({CBC_PLAINTEXTS[0]}), но C1 ({ciphertexts[0]}) и C2 ({ciphertexts[1]}) {'\u2014'} разные!
            CBC разрушает паттерны благодаря цепочке XOR.
          </div>
        </div>
      )}

      <StepControls
        step={step}
        maxStep={3}
        onStep={() => setStep((s) => Math.min(3, s + 1))}
        onReset={() => setStep(0)}
      />

      <div style={{ marginTop: 8, fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
        Шифрование последовательное: C(n) зависит от C(n-1). Нельзя параллелизировать.
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  CTRModeDiagram                                                      */
/* ------------------------------------------------------------------ */

const CTR_PLAINTEXTS = ['P1=48656c6c', 'P2=6f20576f', 'P3=726c6421'];
const CTR_NONCE = 'a1b2c3';
const CTR_KEY = 'ctrkey';

/**
 * CTRModeDiagram - Step-through CTR mode.
 * Shows counter (nonce + incrementing counter) being encrypted, then XORed with plaintext.
 * Highlights: no block chaining, can encrypt blocks in parallel.
 */
export function CTRModeDiagram() {
  const [step, setStep] = useState(0);
  // step 0: show nonce and plaintext blocks
  // step 1: encrypt counter 0, XOR with P1 -> C1
  // step 2: encrypt counter 1, XOR with P2 -> C2
  // step 3: encrypt counter 2, XOR with P3 -> C3

  const counterBlocks: string[] = [];
  const keystreams: string[] = [];
  const ciphertexts: string[] = [];

  for (let i = 0; i < CTR_PLAINTEXTS.length; i++) {
    const counter = CTR_NONCE + i.toString(16).padStart(2, '0');
    counterBlocks.push(counter);
    const ks = pseudoEncrypt(counter, CTR_KEY);
    keystreams.push(ks);
    const pt = CTR_PLAINTEXTS[i].split('=')[1];
    ciphertexts.push(xorHex(pt, ks));
  }

  return (
    <DiagramContainer
      title="CTR: режим счетчика"
      color="purple"
    >
      {/* Plaintext blocks */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, textAlign: 'center' }}>
          Nonce: <span style={{ fontFamily: 'monospace', color: colors.accent }}>{CTR_NONCE}</span> | Открытый текст:
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {CTR_PLAINTEXTS.map((p, i) => (
            <Block
              key={i}
              label={`Блок ${i + 1}`}
              value={p}
              active={step >= i + 1}
              color={step === i + 1 ? colors.primary : undefined}
            />
          ))}
        </div>
      </div>

      {/* Processing for current step */}
      {step >= 1 && step <= 3 && (
        <div style={{
          padding: 12,
          ...glassStyle,
          borderColor: `${colors.accent}30`,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
            Шаг {step}: Блок {step}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Block
              label={`Счетчик ${step - 1}`}
              value={counterBlocks[step - 1]}
              active
              color={colors.accent}
            />
            <Arrow direction="right" label="AES" />
            <Block
              label="Keystream"
              value={keystreams[step - 1]}
              active
              color={colors.warning}
            />
            <span style={{ fontSize: 16, color: colors.textMuted }}>XOR</span>
            <Block
              label={`P${step}`}
              value={CTR_PLAINTEXTS[step - 1]}
              active
              color={colors.primary}
            />
            <Arrow direction="right" />
            <Block
              label={`C${step}`}
              value={ciphertexts[step - 1]}
              active
              color={colors.success}
            />
          </div>
        </div>
      )}

      {/* Ciphertext output */}
      <div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, textAlign: 'center' }}>
          Шифротекст
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {ciphertexts.map((ct, i) => (
            <Block
              key={i}
              label={`C${i + 1}`}
              value={step > i ? ct : '????????'}
              active={step > i}
              color={step > i ? colors.success : undefined}
            />
          ))}
        </div>
      </div>

      <StepControls
        step={step}
        maxStep={3}
        onStep={() => setStep((s) => Math.min(3, s + 1))}
        onReset={() => setStep(0)}
      />

      {/* Key insight */}
      {step >= 3 && (
        <div style={{
          marginTop: 8,
          padding: 10,
          ...glassStyle,
          borderColor: `${colors.success}30`,
        }}>
          <div style={{ fontSize: 12, color: colors.success, lineHeight: 1.6 }}>
            Каждый блок шифруется независимо (Nonce + счетчик). Блоки можно обрабатывать параллельно!
            CTR превращает блочный шифр в потоковый шифр.
          </div>
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
        Ethereum keystore файлы используют AES-128-CTR.
        Никогда не используйте один nonce дважды с одним ключом!
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  GCMModeDiagram                                                      */
/* ------------------------------------------------------------------ */

const GCM_PLAINTEXTS = ['P1=данные1', 'P2=данные2'];
const GCM_NONCE = 'b3c4d5';
const GCM_KEY = 'gcmkey';
const GCM_AAD = 'заголовок';

/**
 * GCMModeDiagram - Authenticated encryption flow.
 * Shows two parallel tracks: CTR encryption and GHASH authentication tag computation.
 * Output: ciphertext + authentication tag.
 */
export function GCMModeDiagram() {
  const [step, setStep] = useState(0);
  // step 0: show inputs (plaintext, key, nonce, AAD)
  // step 1: CTR encryption of P1 -> C1, GHASH starts with AAD
  // step 2: CTR encryption of P2 -> C2, GHASH continues
  // step 3: Final: generate auth tag, show complete output

  const ciphertexts: string[] = [];
  for (let i = 0; i < GCM_PLAINTEXTS.length; i++) {
    const counter = GCM_NONCE + (i + 1).toString(16).padStart(2, '0');
    const ks = pseudoEncrypt(counter, GCM_KEY);
    ciphertexts.push(ks.slice(0, 8));
  }
  const authTag = pseudoEncrypt(ciphertexts.join('') + GCM_AAD, GCM_KEY).slice(0, 8);

  return (
    <DiagramContainer
      title="GCM: аутентифицированное шифрование"
      color="green"
    >
      {/* Inputs */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, textAlign: 'center' }}>
          Входные данные
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Block label="Nonce" value={GCM_NONCE} active={step >= 0} color={colors.accent} />
          <Block label="AAD" value={GCM_AAD} active={step >= 0} color={colors.warning} />
          {GCM_PLAINTEXTS.map((p, i) => (
            <Block
              key={i}
              label={`P${i + 1}`}
              value={p}
              active={step >= i + 1}
              color={step === i + 1 ? colors.primary : undefined}
            />
          ))}
        </div>
      </div>

      {/* Two parallel tracks */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {/* Encryption track */}
        <div style={{
          ...glassStyle,
          padding: 12,
          flex: '1 1 300px',
          maxWidth: 400,
          borderColor: `${colors.primary}30`,
        }}>
          <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
            Шифрование (CTR)
          </div>
          {step >= 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GCM_PLAINTEXTS.slice(0, Math.min(step, 2)).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: colors.accent }}>
                    E(Nonce|{i + 1})
                  </span>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>XOR</span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: colors.primary }}>
                    {p}
                  </span>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>=</span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: colors.success, fontWeight: 600 }}>
                    {ciphertexts[i]}
                  </span>
                </div>
              ))}
            </div>
          )}
          {step < 1 && (
            <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
              Ожидание...
            </div>
          )}
        </div>

        {/* Authentication track */}
        <div style={{
          ...glassStyle,
          padding: 12,
          flex: '1 1 300px',
          maxWidth: 400,
          borderColor: `${colors.warning}30`,
        }}>
          <div style={{ fontSize: 12, color: colors.warning, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
            Аутентификация (GHASH)
          </div>
          {step >= 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {step >= 1 && (
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.warning, textAlign: 'center' }}>
                  GHASH(AAD) = {pseudoEncrypt(GCM_AAD, 'ghash').slice(0, 8)}
                </div>
              )}
              {step >= 2 && (
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.warning, textAlign: 'center' }}>
                  GHASH(AAD, C1, C2) = {pseudoEncrypt(GCM_AAD + ciphertexts.join(''), 'ghash').slice(0, 8)}
                </div>
              )}
              {step >= 3 && (
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.success, fontWeight: 600, textAlign: 'center' }}>
                  Tag = E(Nonce|0) XOR GHASH = {authTag}
                </div>
              )}
            </div>
          )}
          {step < 1 && (
            <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
              Ожидание...
            </div>
          )}
        </div>
      </div>

      {/* Output */}
      {step >= 3 && (
        <div style={{
          padding: 12,
          ...glassStyle,
          borderColor: `${colors.success}40`,
          background: `${colors.success}08`,
        }}>
          <div style={{ fontSize: 12, color: colors.success, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
            Результат GCM
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {ciphertexts.map((ct, i) => (
              <Block key={i} label={`C${i + 1}`} value={ct} active color={colors.success} />
            ))}
            <Block label="Auth Tag" value={authTag} active color={colors.warning} />
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
            Если кто-то изменит шифротекст, тег не совпадет {'\u2014'} подделка будет обнаружена.
            GCM обеспечивает и конфиденциальность, и целостность данных.
          </div>
        </div>
      )}

      <StepControls
        step={step}
        maxStep={3}
        onStep={() => setStep((s) => Math.min(3, s + 1))}
        onReset={() => setStep(0)}
      />

      <div style={{ marginTop: 8, fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
        GCM = CTR (шифрование) + GHASH (аутентификация). Стандарт для TLS 1.3 и большинства современных протоколов.
      </div>
    </DiagramContainer>
  );
}
