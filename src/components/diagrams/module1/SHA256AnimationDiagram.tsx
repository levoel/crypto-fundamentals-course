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
        <DataBox label={data.label} value={data.desc} variant="highlight" />

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

        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Примечание
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: colors.accent, lineHeight: 1.5 }}>
            {data.binary}
          </div>
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
        <DataBox
          label="Сообщение"
          value='"abc" — 1 блок (512 бит). W0-W15 берутся напрямую из блока, W16-W63 вычисляются.'
          variant="default"
        />

        {/* Word grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          maxHeight: 400,
          overflowY: 'auto',
        }}>
          {ABC_W.slice(0, visibleCount).map((w, i) => (
            <div
              key={i}
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
          ))}
        </div>

        {visibleCount > 16 && visibleCount <= 64 && (
          <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', fontFamily: 'monospace' }}>
            W[{visibleCount - 1}] = sigma1(W[{visibleCount - 3}]) + W[{visibleCount - 8}] + sigma0(W[{visibleCount - 16}]) + W[{visibleCount - 17}])
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
          >
            Сброс
          </button>
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
          <DataBox
            label="Раунд"
            value={step === 0 ? 'Начальное состояние (H0)' : `${step} / 64`}
            variant="highlight"
            style={{ flex: 1, minWidth: 120 }}
          />
          {step > 0 && step <= 64 && (
            <>
              <DataBox
                label={`K[${step - 1}]`}
                value={hex8(K[step - 1])}
                variant="default"
                style={{ flex: 1, minWidth: 120 }}
              />
              <DataBox
                label={`W[${step - 1}]`}
                value={hex8(ABC_W[step - 1])}
                variant="default"
                style={{ flex: 1, minWidth: 120 }}
              />
            </>
          )}
        </div>

        {/* Working variables a-h */}
        <Grid columns={4} gap={8}>
          {VAR_NAMES.map((name, i) => (
            <div
              key={name}
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
          ))}
        </Grid>

        {/* T1 and T2 display (only after first round) */}
        {step > 0 && step <= 64 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ ...glassStyle, padding: '8px 12px', flex: 1, minWidth: 200, fontSize: 11, fontFamily: 'monospace', color: colors.textMuted }}>
              <span style={{ color: colors.accent }}>T1</span> = h + Sigma1(e) + Ch(e,f,g) + K[{step - 1}] + W[{step - 1}]
            </div>
            <div style={{ ...glassStyle, padding: '8px 12px', flex: 1, minWidth: 200, fontSize: 11, fontFamily: 'monospace', color: colors.textMuted }}>
              <span style={{ color: colors.accent }}>T2</span> = Sigma0(a) + Maj(a,b,c)
            </div>
          </div>
        )}

        {/* Variable rotation explanation */}
        <div style={{ ...glassStyle, padding: '8px 12px', fontSize: 11, color: colors.textMuted, textAlign: 'center', fontFamily: 'monospace' }}>
          a = T1+T2, b = a, c = b, d = c, e = d+T1, f = e, g = f, h = g
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{ ...glassStyle, padding: '8px 16px', cursor: 'pointer', color: colors.text, fontSize: 13 }}
          >
            Сброс
          </button>
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
        <FlowNode variant="primary" size="md">
          Сообщение (любой длины)
        </FlowNode>

        <Arrow direction="down" label="Дополнение (padding)" />

        <FlowNode variant="default" size="md">
          Дополненное сообщение (кратно 512 бит)
        </FlowNode>

        <Arrow direction="down" label="Разбиение на блоки" />

        <FlowNode variant="accent" size="md">
          Блоки по 512 бит (M1, M2, ...)
        </FlowNode>

        <Arrow direction="down" label="Для каждого блока:" />

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

        <Arrow direction="down" label="После всех блоков" />

        <FlowNode variant="success" size="md">
          Финальный хеш: H0 || H1 || ... || H7 (256 бит)
        </FlowNode>

        <DataBox
          label="Начальные значения (FIPS 180-4)"
          value={`H0=${hex8(H_INIT[0])} H1=${hex8(H_INIT[1])} H2=${hex8(H_INIT[2])} H3=${hex8(H_INIT[3])}`}
          variant="default"
        />
      </div>
    </DiagramContainer>
  );
}
