/**
 * SHA-256 Animation Diagrams (DIAG-10)
 *
 * Exports:
 * - SHA256PaddingDiagram: Step-through showing message padding to 512-bit boundary
 * - SHA256MessageSchedule: W0-W15 from block, W16-W63 expansion
 * - SHA256RoundAnimation: MAIN ANIMATION — step through 64 compression rounds
 * - SHA256CompressionOverview: Static flow diagram of entire compression function
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  SHA-256 Constants from FIPS PUB 180-4                               */
/* ================================================================== */

/** First 32 bits of the fractional parts of the cube roots of the first 64 primes. */
const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/** First 32 bits of the fractional parts of the square roots of the first 8 primes. */
const H_INIT: number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/* ================================================================== */
/*  SHA-256 Helper Functions                                            */
/* ================================================================== */

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function ch(e: number, f: number, g: number): number {
  return ((e & f) ^ (~e & g)) >>> 0;
}

function maj(a: number, b: number, c: number): number {
  return ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
}

function Sigma0(a: number): number {
  return (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
}

function Sigma1(e: number): number {
  return (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
}

function sigma0(x: number): number {
  return (rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3)) >>> 0;
}

function sigma1(x: number): number {
  return (rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10)) >>> 0;
}

function hex8(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0');
}

/* ================================================================== */
/*  Pre-computed values for "abc" example                               */
/* ================================================================== */

function padMessage(msg: string): number[] {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(msg);
  const bitLen = bytes.length * 8;
  const padded: number[] = Array.from(bytes);
  padded.push(0x80);
  while ((padded.length % 64) !== 56) {
    padded.push(0x00);
  }
  // 64-bit big-endian length
  for (let i = 56; i >= 0; i -= 8) {
    padded.push((bitLen >>> i) & 0xff);
  }
  return padded;
}

function getMessageWords(padded: number[], blockOffset: number): number[] {
  const W: number[] = new Array(64);
  for (let t = 0; t < 16; t++) {
    W[t] = ((padded[blockOffset + t * 4] << 24) |
             (padded[blockOffset + t * 4 + 1] << 16) |
             (padded[blockOffset + t * 4 + 2] << 8) |
             (padded[blockOffset + t * 4 + 3])) >>> 0;
  }
  for (let t = 16; t < 64; t++) {
    W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) >>> 0;
  }
  return W;
}

// Pre-compute W[] for "abc"
const ABC_PADDED = padMessage('abc');
const ABC_W = getMessageWords(ABC_PADDED, 0);

/* ================================================================== */
/*  SHA256PaddingDiagram                                                */
/* ================================================================== */

/**
 * SHA256PaddingDiagram - Step-through showing message padding to 512-bit boundary.
 */
export function SHA256PaddingDiagram() {
  const [step, setStep] = useState(0);
  const msg = 'abc';
  const msgBytes = Array.from(new TextEncoder().encode(msg));
  const maxStep = 3;

  const getStepData = () => {
    switch (step) {
      case 0:
        return {
          label: 'Шаг 1: Исходное сообщение',
          hex: msgBytes.map(b => b.toString(16).padStart(2, '0')).join(' '),
          binary: msgBytes.map(b => b.toString(2).padStart(8, '0')).join(' '),
          desc: `"abc" = 3 байта (24 бита)`,
        };
      case 1:
        return {
          label: 'Шаг 2: Добавляем бит "1"',
          hex: [...msgBytes, 0x80].map(b => b.toString(16).padStart(2, '0')).join(' '),
          binary: [...msgBytes.map(b => b.toString(2).padStart(8, '0')), '10000000'].join(' '),
          desc: 'Добавляем байт 0x80 (бит "1" + 7 нулевых бит)',
        };
      case 2: {
        const partial = [...msgBytes, 0x80];
        const zeros = 56 - partial.length;
        const withZeros = [...partial, ...new Array(zeros).fill(0)];
        return {
          label: 'Шаг 3: Дополняем нулями',
          hex: withZeros.map(b => b.toString(16).padStart(2, '0')).join(' '),
          binary: `${partial.length} байт данных + ${zeros} нулевых байт = 56 байт (448 бит)`,
          desc: `Дополняем нулями до 56 байт (448 бит) — оставляем 8 байт для длины`,
        };
      }
      case 3: {
        const full = ABC_PADDED;
        return {
          label: 'Шаг 4: Добавляем длину сообщения',
          hex: full.map(b => b.toString(16).padStart(2, '0')).join(' '),
          binary: `Последние 8 байт: 00 00 00 00 00 00 00 18 (= 24 бита = 0x18)`,
          desc: 'Добавляем длину исходного сообщения как 64-битное число (big-endian). Итого: 64 байта = 512 бит = 1 блок.',
        };
      }
      default:
        return { label: '', hex: '', binary: '', desc: '' };
    }
  };

  const data = getStepData();

  return (
    <DiagramContainer title="SHA-256: дополнение сообщения (padding)" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DiagramTooltip content="SHA-256 padding: сообщение дополняется до кратного 512 бит. Добавляется бит '1', нули, и 64-бит длина исходного сообщения.">
          <DataBox label={data.label} value={data.desc} variant="highlight" />
        </DiagramTooltip>

        <DiagramTooltip content="Hex-представление текущего шага padding. Каждый байт отображается в шестнадцатеричной системе для наглядности побитовых операций.">
          <div style={{ ...glassStyle, padding: 12 }}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hex
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: colors.text,
              wordBreak: 'break-all',
              lineHeight: 1.8,
            }}>
              {data.hex}
            </div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Примечание к текущему шагу. Padding гарантирует, что сообщение имеет длину, кратную 512 бит, и содержит метаданные о длине исходного сообщения.">
          <div style={{ ...glassStyle, padding: 12 }}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Примечание
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: colors.accent, lineHeight: 1.5 }}>
              {data.binary}
            </div>
          </div>
        </DiagramTooltip>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <DiagramTooltip content="Вернуться к первому шагу padding.">
            <div>
              <button
                onClick={() => setStep(0)}
                style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
              >
                Сброс
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Перейти к предыдущему шагу padding.">
            <div>
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
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Перейти к следующему шагу padding.">
            <div>
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
          </DiagramTooltip>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          Шаг {step + 1} из {maxStep + 1}
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SHA256MessageSchedule                                               */
/* ================================================================== */

/**
 * SHA256MessageSchedule - Show W0-W15 from block, W16-W63 expansion.
 */
export function SHA256MessageSchedule() {
  const [visibleCount, setVisibleCount] = useState(16);

  const advance = () => setVisibleCount(v => Math.min(64, v + 1));
  const advanceAll = () => setVisibleCount(64);
  const reset = () => setVisibleCount(16);

  return (
    <DiagramContainer title='SHA-256: расписание сообщений (W0-W63)' color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <DiagramTooltip content="Message schedule расширяет 512-битный блок до 2048 бит (64 слова по 32 бита). Первые 16 слов берутся напрямую, остальные вычисляются рекурсивно.">
          <DataBox
            label="Сообщение"
            value='"abc" — 1 блок (512 бит). W0-W15 берутся напрямую из блока, W16-W63 вычисляются.'
            variant="default"
          />
        </DiagramTooltip>

        {/* Word grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          maxHeight: 400,
          overflowY: 'auto',
        }}>
          {ABC_W.slice(0, visibleCount).map((w, i) => (
            <DiagramTooltip
              key={i}
              content={i < 16
                ? `W0-W15: первые 16 words (32 бита каждый) берутся напрямую из padded message block. Это исходные данные для раунда.`
                : `W16-W63: вычисляются рекурсивно: Wt = sigma1(W[t-2]) + W[t-7] + sigma0(W[t-15]) + W[t-16]. Расширяет 512 бит до 2048 бит.`
              }
            >
              <div
                style={{
                  ...glassStyle,
                  padding: '6px 8px',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  background: i < 16 ? `${colors.primary}10` : `${colors.accent}10`,
                  border: `1px solid ${i < 16 ? colors.primary + '30' : colors.accent + '30'}`,
                }}
              >
                <span style={{ color: i < 16 ? colors.primary : colors.accent, fontWeight: 600 }}>
                  W[{i}]
                </span>
                <span style={{ color: colors.text }}>
                  {hex8(w)}
                </span>
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {visibleCount > 16 && visibleCount <= 64 && (
          <DiagramTooltip content="sigma0/sigma1: bitwise rotation и XOR операции, обеспечивающие diffusion в message schedule.">
            <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', fontFamily: 'monospace' }}>
              W[{visibleCount - 1}] = sigma1(W[{visibleCount - 3}]) + W[{visibleCount - 8}] + sigma0(W[{visibleCount - 16}]) + W[{visibleCount - 17}])
            </div>
          </DiagramTooltip>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <DiagramTooltip content="Сбросить до первых 16 слов (из блока).">
            <div>
              <button
                onClick={reset}
                style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
              >
                Сброс
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Вычислить следующее слово message schedule.">
            <div>
              <button
                onClick={advance}
                disabled={visibleCount >= 64}
                style={{
                  ...glassStyle, padding: '8px 16px',
                  cursor: visibleCount >= 64 ? 'not-allowed' : 'pointer',
                  color: visibleCount >= 64 ? colors.textMuted : colors.primary,
                  fontSize: 13, opacity: visibleCount >= 64 ? 0.5 : 1,
                }}
              >
                Следующее W
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Показать все 64 слова message schedule сразу.">
            <div>
              <button
                onClick={advanceAll}
                disabled={visibleCount >= 64}
                style={{
                  ...glassStyle, padding: '8px 16px',
                  cursor: visibleCount >= 64 ? 'not-allowed' : 'pointer',
                  color: visibleCount >= 64 ? colors.textMuted : colors.accent,
                  fontSize: 13, opacity: visibleCount >= 64 ? 0.5 : 1,
                }}
              >
                Показать все 64
              </button>
            </div>
          </DiagramTooltip>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          Показано: {visibleCount} / 64 слов.{' '}
          <span style={{ color: colors.primary }}>Синие</span> = из блока,{' '}
          <span style={{ color: colors.accent }}>голубые</span> = вычислены.
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SHA256RoundAnimation (MAIN DIAG-10)                                 */
/* ================================================================== */

/** Names for 8 working variables. */
const VAR_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

interface RoundState {
  vars: number[];
  t1: number;
  t2: number;
}

/**
 * Compute one SHA-256 compression round.
 */
function computeRound(vars: number[], round: number, W: number[]): RoundState {
  const [a, b, c, d, e, f, g, h] = vars;
  const t1 = (h + Sigma1(e) + ch(e, f, g) + K[round] + W[round]) >>> 0;
  const t2 = (Sigma0(a) + maj(a, b, c)) >>> 0;
  return {
    vars: [
      (t1 + t2) >>> 0, // new a
      a,                // new b
      b,                // new c
      c,                // new d
      (d + t1) >>> 0,   // new e
      e,                // new f
      f,                // new g
      g,                // new h
    ],
    t1,
    t2,
  };
}

/**
 * SHA256RoundAnimation - Step through 64 compression rounds for "abc".
 * Shows all 8 working variables (a-h) updating each round, with
 * highlighting for variables that changed.
 */
export function SHA256RoundAnimation() {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<number[][]>([H_INIT]);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentVars = history[step];
  const prevVars = step > 0 ? history[step - 1] : null;

  const advance = useCallback(() => {
    setStep(s => {
      if (s >= 64) return s;
      const nextStep = s + 1;
      setHistory(h => {
        if (h.length > nextStep) return h; // already computed
        const { vars: newVars } = computeRound(h[s], s, ABC_W);
        return [...h, newVars];
      });
      return nextStep;
    });
  }, []);

  const goBack = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setHistory([H_INIT]);
    setIsPlaying(false);
  }, []);

  // Auto-play
  const toggleAutoplay = useCallback(() => {
    setIsPlaying(prev => {
      if (!prev && step < 64) {
        const interval = setInterval(() => {
          setStep(s => {
            if (s >= 64) {
              clearInterval(interval);
              setIsPlaying(false);
              return s;
            }
            const nextStep = s + 1;
            setHistory(h => {
              if (h.length > nextStep) return h;
              const { vars: newVars } = computeRound(h[s], s, ABC_W);
              return [...h, newVars];
            });
            return nextStep;
          });
        }, 200);
        // Store interval for cleanup
        (window as Record<string, unknown>).__sha256Interval = interval;
        return true;
      } else {
        const existing = (window as Record<string, unknown>).__sha256Interval as ReturnType<typeof setInterval> | undefined;
        if (existing) clearInterval(existing);
        return false;
      }
    });
  }, [step]);

  // Check which variables changed
  const changedVars = prevVars
    ? currentVars.map((v, i) => v !== prevVars[i])
    : new Array(8).fill(false);

  return (
    <DiagramContainer title="SHA-256: 64 раунда сжатия" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Round info */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <DiagramTooltip content="Рабочие переменные a-h: 8 x 32-бит words. Инициализируются из текущего hash state (H0-H7). Обновляются каждый раунд через Ch, Maj, Sigma.">
            <DataBox
              label="Раунд"
              value={step === 0 ? 'Начальное состояние (H0)' : `${step} / 64`}
              variant="highlight"
              style={{ flex: 1, minWidth: 120 }}
            />
          </DiagramTooltip>
          {step > 0 && step <= 64 && (
            <>
              <DiagramTooltip content="K[t] -- round constant. Первые 32 бита дробной части кубических корней первых 64 простых чисел. Фиксированы стандартом FIPS 180-4.">
                <DataBox
                  label={`K[${step - 1}]`}
                  value={hex8(K[step - 1])}
                  variant="default"
                  style={{ flex: 1, minWidth: 120 }}
                />
              </DiagramTooltip>
              <DiagramTooltip content="W[t] -- слово из message schedule. W0-W15 из блока, W16-W63 вычислены через sigma0/sigma1.">
                <DataBox
                  label={`W[${step - 1}]`}
                  value={hex8(ABC_W[step - 1])}
                  variant="default"
                  style={{ flex: 1, minWidth: 120 }}
                />
              </DiagramTooltip>
            </>
          )}
        </div>

        {/* Working variables a-h */}
        <Grid columns={4} gap={8}>
          {VAR_NAMES.map((name, i) => (
            <DiagramTooltip
              key={name}
              content={
                name === 'a' ? 'a = T1 + T2. Комбинирует результат нелинейных функций. Новое значение определяет начало цепочки переменных.' :
                name === 'e' ? 'e = d + T1. Определяет вход в функцию Ch(e,f,g). Критично для нелинейности раунда.' :
                `Переменная ${name}: сдвигается из предыдущей позиции. Каждый раунд все 8 переменных обновляются через rotation.`
              }
            >
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: changedVars[i] ? `${colors.warning}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${changedVars[i] ? colors.warning + '60' : colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  transition: 'background 300ms ease, border-color 300ms ease',
                }}
              >
                <span style={{
                  fontSize: 11,
                  color: changedVars[i] ? colors.warning : colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  transition: 'color 300ms ease',
                }}>
                  {name}
                </span>
                <span style={{
                  fontSize: 14,
                  color: changedVars[i] ? colors.text : colors.textMuted,
                  fontFamily: 'monospace',
                  transition: 'color 300ms ease',
                }}>
                  {hex8(currentVars[i])}
                </span>
              </div>
            </DiagramTooltip>
          ))}
        </Grid>

        {/* T1 and T2 display (only after first round) */}
        {step > 0 && step <= 64 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DiagramTooltip content="T1 использует Ch(e,f,g) = (e AND f) XOR (NOT e AND g) -- бит e выбирает между f и g. Нелинейная операция, обеспечивающая confusion.">
              <div style={{ ...glassStyle, padding: '8px 12px', flex: 1, minWidth: 200, fontSize: 11, fontFamily: 'monospace', color: colors.textMuted }}>
                <span style={{ color: colors.accent }}>T1</span> = h + Sigma1(e) + Ch(e,f,g) + K[{step - 1}] + W[{step - 1}]
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="T2 использует Maj(a,b,c) = (a AND b) XOR (a AND c) XOR (b AND c) -- голосование большинством. Sigma0: bitwise rotation + XOR для diffusion.">
              <div style={{ ...glassStyle, padding: '8px 12px', flex: 1, minWidth: 200, fontSize: 11, fontFamily: 'monospace', color: colors.textMuted }}>
                <span style={{ color: colors.accent }}>T2</span> = Sigma0(a) + Maj(a,b,c)
              </div>
            </DiagramTooltip>
          </div>
        )}

        {/* Variable rotation explanation */}
        <DiagramTooltip content="Каждый раунд переменные сдвигаются: предыдущий a становится b, b -> c, и т.д. Только a и e вычисляются заново через T1 и T2.">
          <div style={{ ...glassStyle, padding: '8px 12px', fontSize: 11, color: colors.textMuted, textAlign: 'center', fontFamily: 'monospace' }}>
            a = T1+T2, b = a, c = b, d = c, e = d+T1, f = e, g = f, h = g
          </div>
        </DiagramTooltip>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <DiagramTooltip content="Сбросить анимацию к начальному состоянию H0.">
            <div>
              <button
                onClick={reset}
                style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
              >
                Сброс
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Вернуться на предыдущий раунд.">
            <div>
              <button
                onClick={goBack}
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
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Выполнить следующий раунд сжатия.">
            <div>
              <button
                onClick={advance}
                disabled={step >= 64}
                style={{
                  ...glassStyle, padding: '8px 16px',
                  cursor: step >= 64 ? 'not-allowed' : 'pointer',
                  color: step >= 64 ? colors.textMuted : colors.primary,
                  fontSize: 13, opacity: step >= 64 ? 0.5 : 1,
                }}
              >
                Следующий раунд
              </button>
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Автоматически проигрывать все 64 раунда с интервалом 200мс.">
            <div>
              <button
                onClick={toggleAutoplay}
                style={{
                  ...glassStyle, padding: '8px 16px',
                  cursor: 'pointer',
                  color: isPlaying ? colors.warning : colors.accent,
                  fontSize: 13,
                }}
              >
                {isPlaying ? 'Стоп' : 'Автовоспроизведение'}
              </button>
            </div>
          </DiagramTooltip>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
          Раунд {step} / 64 | Сообщение: "abc" |{' '}
          <span style={{ color: colors.warning }}>Желтые</span> ячейки = изменились в этом раунде
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SHA256CompressionOverview                                           */
/* ================================================================== */

/**
 * SHA256CompressionOverview - Static flow diagram of entire compression function.
 */
export function SHA256CompressionOverview() {
  return (
    <DiagramContainer title="SHA-256: обзор функции сжатия" color="emerald">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <DiagramTooltip content="Вход: произвольное сообщение любой длины -- от 0 бит до 2^64 - 1 бит. SHA-256 всегда выдает 256-битный хеш.">
          <FlowNode variant="primary" size="md">
            Сообщение (любой длины)
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Дополнение (padding)" />

        <DiagramTooltip content="Padding добавляет бит '1', нули и 64-бит длину. Результат кратен 512 бит -- готов к разбиению на блоки.">
          <FlowNode variant="default" size="md">
            Дополненное сообщение (кратно 512 бит)
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Разбиение на блоки" />

        <DiagramTooltip content="Каждый 512-битный блок обрабатывается последовательно. Результат одного блока -- вход для следующего (цепочка Меркла-Дамгарда).">
          <FlowNode variant="accent" size="md">
            Блоки по 512 бит (M1, M2, ...)
          </FlowNode>
        </DiagramTooltip>

        <Arrow direction="down" label="Для каждого блока:" />

        <DiagramTooltip content="Compression function: 64 раунда обработки. Каждый раунд использует Wt (message schedule word) + Kt (round constant). Финальный hash = initial state + final working variables.">
          <div style={{ ...glassStyle, padding: 16, width: '100%', maxWidth: 500 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <FlowNode variant="secondary" size="sm">
                Расписание сообщений: 16 слов → 64 слова (W)
              </FlowNode>

              <Arrow direction="down" />

              <FlowNode variant="warning" size="sm">
                64 раунда сжатия (a,b,c,d,e,f,g,h)
              </FlowNode>

              <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>
                Каждый раунд: T1 = h + Sigma1(e) + Ch(e,f,g) + K[i] + W[i]
                <br />
                T2 = Sigma0(a) + Maj(a,b,c)
              </div>

              <Arrow direction="down" />

              <FlowNode variant="success" size="sm">
                Прибавление к текущему хешу (H += a,b,...,h)
              </FlowNode>
            </div>
          </div>
        </DiagramTooltip>

        <Arrow direction="down" label="После всех блоков" />

        <DiagramTooltip content="Финальный хеш -- конкатенация 8 слов H0..H7 по 32 бита. Для 'abc': ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad.">
          <FlowNode variant="success" size="md">
            Финальный хеш: H0 || H1 || ... || H7 (256 бит)
          </FlowNode>
        </DiagramTooltip>

        <DiagramTooltip content="Начальные значения H0-H7 -- первые 32 бита дробных частей квадратных корней первых 8 простых чисел. Стандартизованы FIPS 180-4.">
          <DataBox
            label="Начальные значения (FIPS 180-4)"
            value={`H0=${hex8(H_INIT[0])} H1=${hex8(H_INIT[1])} H2=${hex8(H_INIT[2])} H3=${hex8(H_INIT[3])}`}
            variant="default"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
