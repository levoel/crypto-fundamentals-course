/**
 * RSA Diagrams
 *
 * Exports:
 * - RSAKeyGenerationDiagram: Step-through RSA key generation (p, q, n, phi, e, d)
 * - RSAEncryptDecryptDiagram: Interactive encrypt/decrypt flow with small numbers
 * - RSASecurityDiagram: Factoring problem visualization and key size comparison
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Modular exponentiation: base^exp mod m (safe for small numbers). */
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

/** Extended Euclidean Algorithm: returns [gcd, x, y] where ax + by = gcd. */
function extGcd(a: number, b: number): [number, number, number] {
  if (a === 0) return [b, 0, 1];
  const [g, x1, y1] = extGcd(b % a, a);
  return [g, y1 - Math.floor(b / a) * x1, x1];
}

/** Modular inverse: a^(-1) mod m. */
function modInverse(a: number, m: number): number {
  const [g, x] = extGcd(a % m, m);
  if (g !== 1) throw new Error('No inverse');
  return ((x % m) + m) % m;
}

/* ------------------------------------------------------------------ */
/*  RSAKeyGenerationDiagram                                              */
/* ------------------------------------------------------------------ */

const RSA_P = 61;
const RSA_Q = 53;
const RSA_N = RSA_P * RSA_Q; // 3233
const RSA_PHI = (RSA_P - 1) * (RSA_Q - 1); // 3120
const RSA_E = 17; // small e for educational clarity (gcd(17, 3120) = 1)
const RSA_D = modInverse(RSA_E, RSA_PHI); // 2753

interface StepInfo {
  title: string;
  description: string;
  formula: string;
  value: string;
  color: string;
}

const KEY_GEN_STEPS: StepInfo[] = [
  {
    title: 'Шаг 1: Выбираем простые числа p и q',
    description: 'Два больших простых числа — основа безопасности RSA. Чем больше p и q, тем сложнее факторизовать n.',
    formula: 'p = 61, q = 53',
    value: `p = ${RSA_P}, q = ${RSA_Q}`,
    color: colors.primary,
  },
  {
    title: 'Шаг 2: Вычисляем n = p * q',
    description: 'Модуль n — часть открытого ключа. Зная n, найти p и q (факторизация) — вычислительно сложно.',
    formula: 'n = p × q',
    value: `n = ${RSA_P} × ${RSA_Q} = ${RSA_N}`,
    color: colors.accent,
  },
  {
    title: 'Шаг 3: Вычисляем функцию Эйлера phi(n)',
    description: 'phi(n) = (p-1)(q-1) — количество чисел от 1 до n, взаимно простых с n.',
    formula: 'phi(n) = (p - 1)(q - 1)',
    value: `phi(${RSA_N}) = ${RSA_P - 1} × ${RSA_Q - 1} = ${RSA_PHI}`,
    color: colors.success,
  },
  {
    title: 'Шаг 4: Выбираем открытую экспоненту e',
    description: 'e должно быть взаимно просто с phi(n). Обычно e = 65537 (в продакшене), здесь e = 17 для наглядности.',
    formula: 'gcd(e, phi(n)) = 1',
    value: `e = ${RSA_E}, gcd(${RSA_E}, ${RSA_PHI}) = 1`,
    color: colors.warning,
  },
  {
    title: 'Шаг 5: Вычисляем секретную экспоненту d',
    description: 'd — мультипликативный обратный к e по модулю phi(n). Это секретный ключ.',
    formula: 'd = e^(-1) mod phi(n)',
    value: `d = ${RSA_E}^(-1) mod ${RSA_PHI} = ${RSA_D}`,
    color: colors.primary,
  },
];

/**
 * RSAKeyGenerationDiagram - Step-through RSA key generation.
 * Steps: choose p,q -> compute n -> compute phi -> choose e -> compute d.
 * Uses small primes (p=61, q=53) for educational demo.
 */
export function RSAKeyGenerationDiagram() {
  const [step, setStep] = useState(0);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, KEY_GEN_STEPS.length - 1));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
  }, []);

  return (
    <DiagramContainer title="RSA: генерация ключей по шагам" color="blue">
      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {KEY_GEN_STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              background: i <= step ? `${KEY_GEN_STEPS[i].color}30` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${i <= step ? KEY_GEN_STEPS[i].color : 'rgba(255,255,255,0.1)'}`,
              color: i <= step ? KEY_GEN_STEPS[i].color : colors.textMuted,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => setStep(i)}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Current step display */}
      <div style={{
        ...glassStyle,
        padding: 16,
        borderColor: `${KEY_GEN_STEPS[step].color}40`,
        marginBottom: 16,
        transition: 'border-color 0.3s',
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: KEY_GEN_STEPS[step].color,
          marginBottom: 8,
        }}>
          {KEY_GEN_STEPS[step].title}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
          {KEY_GEN_STEPS[step].description}
        </div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: 13,
          color: colors.text,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 6,
          marginBottom: 8,
        }}>
          {KEY_GEN_STEPS[step].formula}
        </div>
        <DataBox
          label="Результат"
          value={KEY_GEN_STEPS[step].value}
          variant="highlight"
        />
      </div>

      {/* Accumulated results */}
      <Grid columns={2} gap={8}>
        <DataBox label="Открытый ключ (e, n)" value={step >= 3 ? `(${RSA_E}, ${RSA_N})` : '...'} variant={step >= 3 ? 'highlight' : 'default'} />
        <DataBox label="Секретный ключ (d, n)" value={step >= 4 ? `(${RSA_D}, ${RSA_N})` : '...'} variant={step >= 4 ? 'highlight' : 'default'} />
      </Grid>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
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
          disabled={step >= KEY_GEN_STEPS.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step >= KEY_GEN_STEPS.length - 1 ? 'default' : 'pointer',
            fontSize: 12,
            color: step >= KEY_GEN_STEPS.length - 1 ? colors.textMuted : colors.primary,
            border: `1px solid ${step >= KEY_GEN_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.primary}`,
            background: step >= KEY_GEN_STEPS.length - 1 ? 'rgba(255,255,255,0.03)' : `${colors.primary}15`,
            opacity: step >= KEY_GEN_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Следующий шаг
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  RSAEncryptDecryptDiagram                                             */
/* ------------------------------------------------------------------ */

/**
 * RSAEncryptDecryptDiagram - Interactive encrypt/decrypt with small numbers.
 * User enters a message (small number), sees c = m^e mod n and m = c^d mod n.
 */
export function RSAEncryptDecryptDiagram() {
  const [message, setMessage] = useState(42);
  const ciphertext = modPow(message, RSA_E, RSA_N);
  const decrypted = modPow(ciphertext, RSA_D, RSA_N);

  return (
    <DiagramContainer title="RSA: шифрование и дешифрование" color="purple">
      {/* Message input */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
          Введите число для шифрования (0 &lt; m &lt; n = {RSA_N}):
        </div>
        <input
          type="number"
          min={1}
          max={RSA_N - 1}
          value={message}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v > 0 && v < RSA_N) setMessage(v);
          }}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            fontSize: 16,
            fontFamily: 'monospace',
            color: colors.primary,
            border: `1px solid ${colors.primary}40`,
            background: 'rgba(255,255,255,0.05)',
            width: 120,
            textAlign: 'center',
          }}
        />
      </div>

      {/* Encryption flow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <FlowNode variant="primary" size="sm">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Сообщение</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{message}</div>
          </div>
        </FlowNode>
        <Arrow direction="right" />
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          borderColor: `${colors.accent}40`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted }}>Шифрование</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.accent }}>
            c = m<sup>e</sup> mod n
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted }}>
            c = {message}<sup>{RSA_E}</sup> mod {RSA_N}
          </div>
        </div>
        <Arrow direction="right" />
        <FlowNode variant="accent" size="sm">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Шифротекст</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{ciphertext}</div>
          </div>
        </FlowNode>
      </div>

      {/* Decryption flow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <FlowNode variant="accent" size="sm">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Шифротекст</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{ciphertext}</div>
          </div>
        </FlowNode>
        <Arrow direction="right" />
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          borderColor: `${colors.success}40`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted }}>Дешифрование</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.success }}>
            m = c<sup>d</sup> mod n
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted }}>
            m = {ciphertext}<sup>{RSA_D}</sup> mod {RSA_N}
          </div>
        </div>
        <Arrow direction="right" />
        <FlowNode variant="success" size="sm">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Результат</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{decrypted}</div>
          </div>
        </FlowNode>
      </div>

      {/* Verification */}
      <div style={{
        textAlign: 'center',
        fontSize: 12,
        color: decrypted === message ? colors.success : colors.warning,
        padding: '8px 0',
      }}>
        {decrypted === message
          ? `m = ${decrypted} (совпадает с исходным сообщением)`
          : `Ошибка: ${decrypted} !== ${message}`}
      </div>

      {/* Key display */}
      <Grid columns={2} gap={8}>
        <DataBox label="Открытый ключ (e, n)" value={`(${RSA_E}, ${RSA_N})`} variant="default" />
        <DataBox label="Секретный ключ (d, n)" value={`(${RSA_D}, ${RSA_N})`} variant="default" />
      </Grid>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  RSASecurityDiagram                                                   */
/* ------------------------------------------------------------------ */

interface KeySizeInfo {
  bits: number;
  label: string;
  factorTime: string;
  status: 'broken' | 'deprecated' | 'safe' | 'strong';
  statusLabel: string;
  color: string;
}

const KEY_SIZES: KeySizeInfo[] = [
  {
    bits: 512,
    label: 'RSA-512',
    factorTime: '< 1 дня',
    status: 'broken',
    statusLabel: 'Взломан',
    color: '#ff4444',
  },
  {
    bits: 1024,
    label: 'RSA-1024',
    factorTime: '~месяцы',
    status: 'deprecated',
    statusLabel: 'Устарел',
    color: colors.warning,
  },
  {
    bits: 2048,
    label: 'RSA-2048',
    factorTime: '~10^15 лет',
    status: 'safe',
    statusLabel: 'Безопасен',
    color: colors.success,
  },
  {
    bits: 4096,
    label: 'RSA-4096',
    factorTime: '~10^30 лет',
    status: 'strong',
    statusLabel: 'Параноидальный',
    color: colors.primary,
  },
];

/**
 * RSASecurityDiagram - Factoring problem visualization.
 * Shows: small n (easy) vs large n (hard). Key size comparison.
 */
export function RSASecurityDiagram() {
  return (
    <DiagramContainer title="RSA: безопасность и задача факторизации" color="green">
      {/* Factoring problem explanation */}
      <div style={{
        ...glassStyle,
        padding: 16,
        borderColor: `${colors.accent}30`,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.accent, marginBottom: 8 }}>
          Задача факторизации
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6, marginBottom: 12 }}>
          Безопасность RSA основана на том, что умножить два числа легко, а разложить произведение на множители — сложно.
        </div>
        <Grid columns={2} gap={12}>
          <div style={{
            ...glassStyle,
            padding: 12,
            borderColor: `${colors.success}30`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: colors.success, fontWeight: 600, marginBottom: 4 }}>
              Легко (наносекунды)
            </div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: colors.text }}>
              61 x 53 = 3233
            </div>
          </div>
          <div style={{
            ...glassStyle,
            padding: 12,
            borderColor: '#ff444430',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#ff4444', fontWeight: 600, marginBottom: 4 }}>
              Сложно (годы, века...)
            </div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: colors.text }}>
              3233 = ? x ?
            </div>
          </div>
        </Grid>
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
          Для маленьких чисел факторизация тривиальна. Для чисел из 600+ цифр — вычислительно невозможна.
        </div>
      </div>

      {/* Key size comparison */}
      <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 12 }}>
        Размеры ключей RSA
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {KEY_SIZES.map((ks) => (
          <div
            key={ks.bits}
            style={{
              ...glassStyle,
              padding: '10px 14px',
              borderColor: `${ks.color}30`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Key size bar */}
            <div style={{ minWidth: 90 }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: ks.color }}>
                {ks.label}
              </div>
            </div>
            {/* Visual bar */}
            <div style={{
              flex: 1,
              height: 8,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(ks.bits / 4096) * 100}%`,
                height: '100%',
                background: ks.color,
                borderRadius: 4,
                opacity: 0.6,
                transition: 'width 0.5s',
              }} />
            </div>
            {/* Factor time */}
            <div style={{ minWidth: 100, fontSize: 11, color: colors.textMuted, textAlign: 'right' }}>
              {ks.factorTime}
            </div>
            {/* Status badge */}
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 4,
              background: `${ks.color}20`,
              color: ks.color,
              minWidth: 90,
              textAlign: 'center',
            }}>
              {ks.statusLabel}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison with ECC */}
      <div style={{
        marginTop: 16,
        padding: 12,
        ...glassStyle,
        borderColor: `${colors.primary}20`,
      }}>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          <strong style={{ color: colors.primary }}>RSA vs ECC:</strong>{' '}
          Ключ RSA-2048 (256 байт) обеспечивает ту же безопасность (~112 бит), что и ключ ECC-256 (32 байта).
          Блокчейны используют ECC (следующий урок) из-за компактности ключей и быстрых подписей.
        </div>
      </div>
    </DiagramContainer>
  );
}
