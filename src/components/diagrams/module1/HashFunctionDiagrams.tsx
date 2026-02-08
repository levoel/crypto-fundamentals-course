/**
 * Hash Function Diagrams
 *
 * Exports:
 * - HashFunctionOverview: Static diagram showing any-size input -> fixed 256-bit output
 * - AvalancheEffectDemo: Interactive hash comparison with bit diff highlighting
 * - HashPropertyComparison: Three hash properties explained visually
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  Minimal JS SHA-256 implementation for browser-side hashing          */
/* ------------------------------------------------------------------ */

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

const H_INIT: number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function sha256JS(message: string): string {
  // Convert string to UTF-8 bytes
  const encoder = new TextEncoder();
  const msgBytes = encoder.encode(message);
  const bitLen = msgBytes.length * 8;

  // Padding
  const padded: number[] = Array.from(msgBytes);
  padded.push(0x80);
  while ((padded.length % 64) !== 56) {
    padded.push(0x00);
  }
  // Append length as 64-bit big-endian
  for (let i = 56; i >= 0; i -= 8) {
    padded.push((bitLen >>> i) & 0xff);
  }

  // Parse into 32-bit words, process each 512-bit block
  let h = [...H_INIT];

  for (let offset = 0; offset < padded.length; offset += 64) {
    const W: number[] = new Array(64);
    for (let t = 0; t < 16; t++) {
      W[t] = ((padded[offset + t * 4] << 24) |
               (padded[offset + t * 4 + 1] << 16) |
               (padded[offset + t * 4 + 2] << 8) |
               (padded[offset + t * 4 + 3])) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = (rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10)) >>> 0;
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;
    for (let t = 0; t < 64; t++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (hh + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  return h.map(v => v.toString(16).padStart(8, '0')).join('');
}

/* ------------------------------------------------------------------ */
/*  HashFunctionOverview                                                 */
/* ------------------------------------------------------------------ */

/**
 * HashFunctionOverview - Static diagram: any-size input -> hash function -> fixed 256-bit output.
 */
export function HashFunctionOverview() {
  const examples = [
    { input: '"A"', size: '1 байт' },
    { input: '"Hello, World!"', size: '13 байт' },
    { input: 'Фильм 4K', size: '~4 ГБ' },
  ];

  return (
    <DiagramContainer
      title="Хеш-функция: вход любого размера -> фиксированный выход"
      color="blue"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {examples.map((ex, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <FlowNode variant="primary" size="sm">
              {ex.input} ({ex.size})
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="accent" size="sm">
              SHA-256
            </FlowNode>
            <Arrow direction="right" />
            <FlowNode variant="success" size="sm">
              256 бит (32 байта)
            </FlowNode>
          </div>
        ))}

        <DataBox
          label="Ключевое свойство"
          value="Независимо от размера входных данных (1 байт или 4 ГБ), выход SHA-256 всегда ровно 256 бит (64 hex символа)"
          variant="highlight"
        />
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  AvalancheEffectDemo                                                  */
/* ------------------------------------------------------------------ */

/**
 * Compute bit-level difference between two hex hash strings.
 */
function countDiffBits(hex1: string, hex2: string): number {
  let diff = 0;
  for (let i = 0; i < hex1.length && i < hex2.length; i++) {
    const xor = parseInt(hex1[i], 16) ^ parseInt(hex2[i], 16);
    diff += xor.toString(2).split('').filter(b => b === '1').length;
  }
  return diff;
}

/**
 * AvalancheEffectDemo - Type two inputs, see SHA-256 outputs and bit diff.
 * Uses a lightweight JS SHA-256 implementation (no SubtleCrypto dependency).
 */
export function AvalancheEffectDemo() {
  const [input1, setInput1] = useState('Hello');
  const [input2, setInput2] = useState('hello');

  const hash1 = sha256JS(input1);
  const hash2 = sha256JS(input2);
  const diffBits = countDiffBits(hash1, hash2);
  const pct = ((diffBits / 256) * 100).toFixed(1);

  // Highlight differing hex characters
  const renderHashDiff = (h1: string, h2: string) => {
    return h1.split('').map((ch, i) => {
      const isDiff = ch !== h2[i];
      return (
        <span
          key={i}
          style={{
            color: isDiff ? colors.danger : colors.success,
            fontFamily: 'monospace',
            fontSize: 13,
          }}
        >
          {ch}
        </span>
      );
    });
  };

  return (
    <DiagramContainer title="Лавинный эффект" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Input fields */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
              Вход 1
            </label>
            <input
              type="text"
              value={input1}
              onChange={e => setInput1(e.target.value)}
              style={{
                ...glassStyle,
                width: '100%',
                padding: '8px 12px',
                color: colors.text,
                fontSize: 14,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: colors.textMuted, display: 'block', marginBottom: 4 }}>
              Вход 2
            </label>
            <input
              type="text"
              value={input2}
              onChange={e => setInput2(e.target.value)}
              style={{
                ...glassStyle,
                width: '100%',
                padding: '8px 12px',
                color: colors.text,
                fontSize: 14,
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Hash output 1 */}
        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SHA-256("{input1}")
          </div>
          <div style={{ wordBreak: 'break-all', lineHeight: 1.6 }}>
            {renderHashDiff(hash1, hash2)}
          </div>
        </div>

        {/* Hash output 2 */}
        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            SHA-256("{input2}")
          </div>
          <div style={{ wordBreak: 'break-all', lineHeight: 1.6 }}>
            {renderHashDiff(hash2, hash1)}
          </div>
        </div>

        {/* Statistics */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <DataBox
            label="Отличающихся бит"
            value={`${diffBits} / 256`}
            variant="highlight"
            style={{ flex: 1, minWidth: 140 }}
          />
          <DataBox
            label="Процент изменений"
            value={`${pct}%`}
            variant="highlight"
            style={{ flex: 1, minWidth: 140 }}
          />
        </div>

        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
          <span style={{ color: colors.success }}>Зеленый</span> = совпадает,{' '}
          <span style={{ color: colors.danger }}>красный</span> = отличается.
          Идеальная хеш-функция меняет ~50% бит при любом изменении входа.
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  HashPropertyComparison                                               */
/* ------------------------------------------------------------------ */

interface HashProperty {
  name: string;
  formal: string;
  analogy: string;
  difficulty: string;
  icon: string;
}

const HASH_PROPERTIES: HashProperty[] = [
  {
    name: 'Стойкость к прообразу',
    formal: 'По хешу h невозможно найти сообщение m: H(m) = h',
    analogy: 'Как пепел: видишь результат сгорания, но восстановить документ невозможно',
    difficulty: 'Сложность: 2^256 операций',
    icon: '1',
  },
  {
    name: 'Стойкость к второму прообразу',
    formal: 'Для данного m1 невозможно найти m2 != m1: H(m1) = H(m2)',
    analogy: 'Как отпечаток пальца: найти другого человека с таким же отпечатком практически невозможно',
    difficulty: 'Сложность: 2^256 операций',
    icon: '2',
  },
  {
    name: 'Стойкость к коллизиям',
    formal: 'Невозможно найти любые m1 != m2: H(m1) = H(m2)',
    analogy: 'Как найти любых двух людей с одинаковыми отпечатками в толпе (парадокс дней рождения)',
    difficulty: 'Сложность: 2^128 операций (парадокс дней рождения)',
    icon: '3',
  },
];

/**
 * HashPropertyComparison - Three hash properties explained with analogies.
 */
export function HashPropertyComparison() {
  return (
    <DiagramContainer
      title="Три свойства хеш-функций"
      color="green"
    >
      <Grid columns={3} gap={12}>
        {HASH_PROPERTIES.map((prop, i) => (
          <div
            key={i}
            style={{
              ...glassStyle,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${colors.primary}20`,
              border: `1px solid ${colors.primary}40`,
              color: colors.primary,
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: 16,
            }}>
              {prop.icon}
            </div>

            {/* Name */}
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.text,
            }}>
              {prop.name}
            </div>

            {/* Formal definition */}
            <div style={{
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: 'monospace',
              lineHeight: 1.5,
            }}>
              {prop.formal}
            </div>

            {/* Analogy */}
            <div style={{
              fontSize: 12,
              color: colors.accent,
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}>
              {prop.analogy}
            </div>

            {/* Difficulty */}
            <div style={{
              fontSize: 11,
              color: colors.warning,
              fontFamily: 'monospace',
              marginTop: 'auto',
            }}>
              {prop.difficulty}
            </div>
          </div>
        ))}
      </Grid>
    </DiagramContainer>
  );
}
