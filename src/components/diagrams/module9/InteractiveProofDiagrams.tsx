/**
 * Interactive Proof Diagrams (ZK-03)
 *
 * Exports:
 * - SigmaProtocolDiagram: Sigma protocol flow (step-through, history array, 5 steps)
 * - SchnorrProtocolDiagram: Schnorr protocol with numbers (interactive, editable x, "Run Round" button)
 * - FiatShamirDiagram: Fiat-Shamir transform comparison (static, side-by-side)
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  SigmaProtocolDiagram                                                */
/* ================================================================== */

interface SigmaStep {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  proverAction: string;
  verifierAction: string;
  messageLabel?: string;
  messageDirection?: 'P->V' | 'V->P' | null;
  tooltip: string;
}

const SIGMA_STEPS: SigmaStep[] = [
  {
    title: 'SETUP',
    subtitle: 'Начальные условия',
    description: 'Prover знает секрет x. Public statement: P = xG (открытый ключ). Prover хочет доказать знание x без раскрытия.',
    color: '#94a3b8',
    proverAction: 'Знает: x (секрет)',
    verifierAction: 'Знает: P = xG (публичный)',
    messageDirection: null,
    tooltip: 'Sigma-протокол — трёхшаговая структура ZK-доказательства: commitment -> challenge -> response. Все ZK-протоколы (Schnorr, Guillou-Quisquater, Okamoto) следуют этому паттерну.',
  },
  {
    title: 'COMMITMENT',
    subtitle: 'Move 1: Prover -> Verifier',
    description: "Prover выбирает случайный k, вычисляет R = kG, отправляет R Verifier. R маскирует секрет x случайностью k.",
    color: '#a78bfa',
    proverAction: 'k = random, R = kG',
    verifierAction: 'Получает R',
    messageLabel: 'R = kG',
    messageDirection: 'P->V',
    tooltip: 'Доказывающий выбирает случайное r и отправляет commitment a = g^r. Это скрывает секрет x, но привязывает доказывающего к определенному значению r.',
  },
  {
    title: 'CHALLENGE',
    subtitle: 'Move 2: Verifier -> Prover',
    description: "Verifier выбирает случайный c, отправляет c Prover. Случайность c гарантирует что Prover не может подготовить ответ заранее.",
    color: '#f59e0b',
    proverAction: 'Получает c',
    verifierAction: 'c = random',
    messageLabel: 'c (random challenge)',
    messageDirection: 'V->P',
    tooltip: 'Верификатор отправляет случайный challenge e. Случайность challenge критична — если доказывающий может предсказать e, он может подделать доказательство.',
  },
  {
    title: 'RESPONSE',
    subtitle: 'Move 3: Prover -> Verifier',
    description: "Prover вычисляет s = k + c*x (mod n), отправляет s Verifier. s объединяет случайность k и секрет x, но x невозможно извлечь из s.",
    color: '#3b82f6',
    proverAction: 's = k + c*x (mod n)',
    verifierAction: 'Получает s',
    messageLabel: 's = k + cx',
    messageDirection: 'P->V',
    tooltip: 'Доказывающий вычисляет response z = r + e*x mod q и отправляет верификатору. Это позволяет верифицировать знание x без его раскрытия.',
  },
  {
    title: 'VERIFY',
    subtitle: 'Проверка',
    description: "Verifier проверяет: sG == R + cP? Развернем: sG = (k + cx)G = kG + cxG = R + cP. Если равенство выполняется -- Prover знает x.",
    color: '#22c55e',
    proverAction: 'Доказано: знает x',
    verifierAction: 'sG == R + cP?',
    messageDirection: null,
    tooltip: 'Верификатор проверяет уравнение sG == R + cP. Алгебраически: sG = (k+cx)G = kG + cxG = R + cP. Если равенство выполняется, доказывающий знает x с overwhelming probability.',
  },
];

/**
 * SigmaProtocolDiagram
 *
 * 5-step step-through showing Sigma (3-move) protocol pattern.
 */
export function SigmaProtocolDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const step = history[history.length - 1];
  const current = SIGMA_STEPS[step];

  const handleNext = () => {
    if (step < SIGMA_STEPS.length - 1) {
      setHistory([...history, step + 1]);
    }
  };
  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const handleReset = () => setHistory([0]);

  return (
    <DiagramContainer title="Sigma протокол: три шага ZK-доказательства" color="purple">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {SIGMA_STEPS.map((s, i) => (
          <div key={i} style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: i === step ? 700 : 400,
            background: i === step ? `${s.color}20` : i < step ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
            color: i === step ? s.color : i < step ? '#22c55e' : colors.textMuted,
            border: `1px solid ${i === step ? `${s.color}50` : 'rgba(255,255,255,0.08)'}`,
          }}>
            {s.title}
          </div>
        ))}
      </div>

      {/* Message Sequence Diagram */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={400} height={180} viewBox="0 0 400 180">
          {/* Prover column */}
          <rect x={30} y={10} width={80} height={24} rx={4} fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth={1} />
          <text x={70} y={26} fill="#a78bfa" fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight={600}>Prover</text>
          <line x1={70} y1={34} x2={70} y2={170} stroke="rgba(167,139,250,0.3)" strokeWidth={1} strokeDasharray="3,3" />

          {/* Verifier column */}
          <rect x={290} y={10} width={80} height={24} rx={4} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth={1} />
          <text x={330} y={26} fill="#3b82f6" fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight={600}>Verifier</text>
          <line x1={330} y1={34} x2={330} y2={170} stroke="rgba(59,130,246,0.3)" strokeWidth={1} strokeDasharray="3,3" />

          {/* Move 1: R = kG (P -> V) */}
          {step >= 1 && (
            <g>
              <line x1={80} y1={60} x2={320} y2={60} stroke={step === 1 ? '#a78bfa' : 'rgba(167,139,250,0.4)'} strokeWidth={1.5} markerEnd="url(#arrSP1)" />
              <defs><marker id="arrSP1" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={step === 1 ? '#a78bfa' : 'rgba(167,139,250,0.4)'} /></marker></defs>
              <text x={200} y={55} fill={step === 1 ? '#a78bfa' : 'rgba(167,139,250,0.6)'} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight={600}>R = kG</text>
            </g>
          )}

          {/* Move 2: c (V -> P) */}
          {step >= 2 && (
            <g>
              <line x1={320} y1={95} x2={80} y2={95} stroke={step === 2 ? '#f59e0b' : 'rgba(245,158,11,0.4)'} strokeWidth={1.5} markerEnd="url(#arrSP2)" />
              <defs><marker id="arrSP2" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={step === 2 ? '#f59e0b' : 'rgba(245,158,11,0.4)'} /></marker></defs>
              <text x={200} y={90} fill={step === 2 ? '#f59e0b' : 'rgba(245,158,11,0.6)'} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight={600}>c (random)</text>
            </g>
          )}

          {/* Move 3: s (P -> V) */}
          {step >= 3 && (
            <g>
              <line x1={80} y1={130} x2={320} y2={130} stroke={step === 3 ? '#3b82f6' : 'rgba(59,130,246,0.4)'} strokeWidth={1.5} markerEnd="url(#arrSP3)" />
              <defs><marker id="arrSP3" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={step === 3 ? '#3b82f6' : 'rgba(59,130,246,0.4)'} /></marker></defs>
              <text x={200} y={125} fill={step === 3 ? '#3b82f6' : 'rgba(59,130,246,0.6)'} fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight={600}>s = k + cx</text>
            </g>
          )}

          {/* Verify check at step 4 */}
          {step === 4 && (
            <g>
              <circle cx={330} cy={155} r={10} fill="rgba(34,197,94,0.2)" stroke="#22c55e" strokeWidth={1} />
              <text x={330} y={159} fill="#22c55e" fontSize={10} textAnchor="middle" fontFamily="monospace" fontWeight={700}>OK</text>
              <text x={270} y={160} fill="#22c55e" fontSize={8} textAnchor="middle" fontFamily="monospace">sG == R + cP</text>
            </g>
          )}
        </svg>
      </div>

      {/* Step detail */}
      <DiagramTooltip content={current.tooltip}>
        <div style={{
          ...glassStyle,
          padding: 14,
          marginBottom: 12,
          border: `1px solid ${current.color}30`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: current.color, fontFamily: 'monospace', marginBottom: 8 }}>
            {step + 1}. {current.title}: {current.subtitle}
          </div>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 10 }}>
            {current.description}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ ...glassStyle, padding: 8, border: '1px solid rgba(167,139,250,0.15)' }}>
              <div style={{ fontSize: 9, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 2 }}>Prover:</div>
              <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace' }}>{current.proverAction}</div>
            </div>
            <div style={{ ...glassStyle, padding: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
              <div style={{ fontSize: 9, color: '#3b82f6', fontFamily: 'monospace', marginBottom: 2 }}>Verifier:</div>
              <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace' }}>{current.verifierAction}</div>
            </div>
          </div>
        </div>
      </DiagramTooltip>

      {/* Verify equation at step 4 */}
      {step === 4 && (
        <div style={{ ...glassStyle, padding: 10, marginBottom: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#22c55e', lineHeight: 1.6 }}>
            sG = (k + cx)G = kG + cxG = R + cP {'  '}
            <span style={{ fontWeight: 700 }}>Verifier убежден. Секрет x НЕ раскрыт.</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <DiagramTooltip content="Навигация по шагам Sigma-протокола: commitment (P->V), challenge (V->P), response (P->V), verify. Три хода — минимальная структура для ZK-доказательства.">
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleBack} disabled={history.length <= 1} style={{
            padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)', color: history.length > 1 ? colors.text : colors.textMuted,
            fontSize: 11, fontFamily: 'monospace', cursor: history.length > 1 ? 'pointer' : 'not-allowed',
          }}>Back</button>
          <button onClick={handleNext} disabled={step >= SIGMA_STEPS.length - 1} style={{
            padding: '6px 16px', borderRadius: 6,
            border: `1px solid ${step < SIGMA_STEPS.length - 1 ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.1)'}`,
            background: step < SIGMA_STEPS.length - 1 ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)',
            color: step < SIGMA_STEPS.length - 1 ? '#a78bfa' : colors.textMuted,
            fontSize: 11, fontFamily: 'monospace', cursor: step < SIGMA_STEPS.length - 1 ? 'pointer' : 'not-allowed',
          }}>Step</button>
          <button onClick={handleReset} style={{
            padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.05)', color: colors.textMuted, fontSize: 11,
            fontFamily: 'monospace', cursor: 'pointer',
          }}>Reset</button>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SchnorrProtocolDiagram                                              */
/* ================================================================== */

/**
 * Modular exponentiation for small prime field demo.
 */
function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = ((base % mod) + mod) % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

interface RoundResult {
  k: number;
  R: number;
  c: number;
  s: number;
  lhs: number;
  rhs: number;
  valid: boolean;
  honest: boolean;
}

const SCHNORR_P = 23;
const SCHNORR_G = 5;
const SCHNORR_Q = 11; // order of g=5 mod 23

/**
 * SchnorrProtocolDiagram
 *
 * Small prime field (p=23, g=5) interactive Schnorr protocol.
 * Editable secret x, "Run Round" button, honest vs cheater modes.
 */
export function SchnorrProtocolDiagram() {
  const [x, setX] = useState(7);
  const [mode, setMode] = useState<'honest' | 'cheater'>('honest');
  const [rounds, setRounds] = useState<RoundResult[]>([]);

  const P = modPow(SCHNORR_G, x, SCHNORR_P);

  const runRound = useCallback(() => {
    const k = Math.floor(Math.random() * (SCHNORR_Q - 1)) + 1;
    const R = modPow(SCHNORR_G, k, SCHNORR_P);
    const c = Math.floor(Math.random() * (SCHNORR_Q - 1)) + 1;

    let s: number;
    let honest: boolean;

    if (mode === 'honest') {
      s = (k + c * x) % SCHNORR_Q;
      honest = true;
    } else {
      // Cheater: doesn't know x, picks random s
      s = Math.floor(Math.random() * (SCHNORR_Q - 1)) + 1;
      honest = false;
    }

    const lhs = modPow(SCHNORR_G, s, SCHNORR_P);
    const rhs = (R * modPow(P, c, SCHNORR_P)) % SCHNORR_P;
    const valid = lhs === rhs;

    setRounds((prev) => [...prev.slice(-4), { k, R, c, s, lhs, rhs, valid, honest }]);
  }, [x, mode, P]);

  const clearRounds = () => setRounds([]);

  const passCount = rounds.filter((r) => r.valid).length;
  const failCount = rounds.filter((r) => !r.valid).length;

  return (
    <DiagramContainer title="Schnorr протокол: пример с числами" color="blue">
      {/* Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ ...glassStyle, padding: 8, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>p (prime)</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: 'monospace' }}>{SCHNORR_P}</div>
        </div>
        <div style={{ ...glassStyle, padding: 8, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>g (generator)</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: 'monospace' }}>{SCHNORR_G}</div>
        </div>
        <div style={{ ...glassStyle, padding: 8, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>q (order)</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: 'monospace' }}>{SCHNORR_Q}</div>
        </div>
      </div>

      {/* Secret key input */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(167,139,250,0.2)' }}>
          <DiagramTooltip content="Секретный ключ x — приватное значение, которое доказывающий хочет подтвердить знание без раскрытия. В Schnorr-протоколе x определяет публичный ключ P = g^x mod p.">
            <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Secret key x:</div>
          </DiagramTooltip>
          <input
            type="number"
            value={x}
            min={1}
            max={SCHNORR_Q - 1}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setX(Math.max(1, Math.min(SCHNORR_Q - 1, val)));
              clearRounds();
            }}
            style={{
              width: '100%',
              padding: '4px 8px',
              fontSize: 14,
              fontFamily: 'monospace',
              fontWeight: 700,
              color: '#a78bfa',
              background: 'rgba(167,139,250,0.08)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
        <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(59,130,246,0.2)' }}>
          <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>Public key P = g^x mod p:</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace' }}>
            {SCHNORR_G}^{x} mod {SCHNORR_P} = {P}
          </div>
        </div>
      </div>

      {/* Mode toggle + Run button */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <DiagramTooltip content={mode === 'honest'
          ? 'Честный режим: доказывающий знает секретный ключ x и корректно вычисляет response z = r + e*x. Верификация всегда проходит успешно.'
          : 'Режим мошенника: доказывающий НЕ знает x и пытается угадать challenge заранее. С вероятностью ~100% обман раскрывается.'}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setMode('honest'); clearRounds(); }}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', cursor: 'pointer',
                border: `1px solid ${mode === 'honest' ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                background: mode === 'honest' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                color: mode === 'honest' ? '#22c55e' : colors.textMuted,
                fontWeight: mode === 'honest' ? 600 : 400,
              }}
            >
              Honest Prover
            </button>
            <button
              onClick={() => { setMode('cheater'); clearRounds(); }}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', cursor: 'pointer',
                border: `1px solid ${mode === 'cheater' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                background: mode === 'cheater' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                color: mode === 'cheater' ? '#ef4444' : colors.textMuted,
                fontWeight: mode === 'cheater' ? 600 : 400,
              }}
            >
              Cheater (no x)
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Выполнить один раунд протокола Шнорра: commitment -> challenge -> response -> verification.">
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={runRound}
              style={{
                padding: '6px 18px', borderRadius: 6, fontSize: 11, fontFamily: 'monospace', cursor: 'pointer',
                border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', fontWeight: 600,
              }}
            >
              Run Round
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Очистить историю раундов и начать заново.">
          <div>
            <button
              onClick={clearRounds}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 10, fontFamily: 'monospace', cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: colors.textMuted,
              }}
            >
              Clear
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {/* Rounds table */}
      {rounds.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '30px 40px 40px 40px 40px 60px 60px 50px',
            gap: 1,
            marginBottom: 1,
          }}>
            {[
              { h: '#', tip: 'Номер раунда протокола.' },
              { h: 'k', tip: 'Случайное число k (nonce): Prover выбирает секретное k для вычисления commitment R = g^k.' },
              { h: 'R', tip: 'Commitment R = g^k mod p: отправляется Verifier как первый шаг протокола.' },
              { h: 'c', tip: 'Challenge c: случайное число от Verifier. Prover не может предсказать c заранее.' },
              { h: 's', tip: 'Response s = k + c*x mod q (честный) или random (мошенник). Ключевое вычисление протокола.' },
              { h: 'g^s', tip: 'Левая часть проверки: g^s mod p. Verifier вычисляет это значение.' },
              { h: 'R*P^c', tip: 'Правая часть проверки: R * P^c mod p. Если g^s == R*P^c, доказательство верно.' },
              { h: 'Result', tip: 'Результат верификации: PASS (g^s == R*P^c) или FAIL (значения не совпадают).' },
            ].map(({ h, tip }) => (
              <DiagramTooltip key={h} content={tip}>
                <div style={{
                  ...glassStyle, padding: '4px 4px', fontSize: 8, fontWeight: 600,
                  color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center',
                }}>{h}</div>
              </DiagramTooltip>
            ))}
          </div>
          {/* Rows */}
          {rounds.map((r, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '30px 40px 40px 40px 40px 60px 60px 50px',
              gap: 1,
              marginBottom: 1,
            }}>
              <div style={{ ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', color: colors.textMuted }}>{i + 1}</div>
              <div style={{ ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', color: '#a78bfa' }}>{r.k}</div>
              <div style={{ ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', color: colors.text }}>{r.R}</div>
              <div style={{ ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', color: '#f59e0b' }}>{r.c}</div>
              <div style={{ ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', color: '#3b82f6' }}>{r.s}</div>
              <div style={{ ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', color: colors.text }}>{r.lhs}</div>
              <div style={{ ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center', color: colors.text }}>{r.rhs}</div>
              <div style={{
                ...glassStyle, padding: '4px', fontSize: 9, fontFamily: 'monospace', textAlign: 'center',
                fontWeight: 700,
                color: r.valid ? '#22c55e' : '#ef4444',
                background: r.valid ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              }}>
                {r.valid ? 'PASS' : 'FAIL'}
              </div>
            </div>
          ))}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#22c55e' }}>Pass: {passCount}</span>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#ef4444' }}>Fail: {failCount}</span>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted }}>
              Total: {rounds.length} | {mode === 'honest' ? 'Honest prover: всегда pass' : `Cheater: ~${rounds.length > 0 ? Math.round(failCount / rounds.length * 100) : 0}% fail`}
            </span>
          </div>
        </div>
      )}

      <DiagramTooltip content={mode === 'honest'
        ? `Честный доказывающий знает секрет x=${x} и всегда корректно вычисляет response s = k + c*x mod ${SCHNORR_Q}. Верификация g^s == R*P^c ВСЕГДА проходит — это свойство completeness.`
        : 'Мошенник не знает x и выбирает случайный s. Вероятность прохождения верификации пренебрежимо мала — это свойство soundness протокола Шнорра.'}>
        <DataBox
          label={mode === 'honest' ? 'Honest Prover' : 'Cheater'}
          value={mode === 'honest'
            ? `Честный prover знает x=${x}, поэтому вычисляет s = k + c*x (mod ${SCHNORR_Q}). Верификация g^s == R * P^c ВСЕГДА проходит.`
            : `Cheater НЕ знает x, выбирает случайный s. Верификация g^s == R * P^c проходит только при совпадении (~0%). Запустите 5-10 раундов!`
          }
          variant={mode === 'honest' ? 'info' : 'warning'}
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  FiatShamirDiagram                                                   */
/* ================================================================== */

/**
 * FiatShamirDiagram
 *
 * Side-by-side comparison: interactive Schnorr vs non-interactive (Fiat-Shamir).
 */
export function FiatShamirDiagram() {
  return (
    <DiagramContainer title="Fiat-Shamir: из диалога в одно сообщение" color="orange">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, marginBottom: 16 }}>
        {/* Left: Interactive */}
        <div style={{ ...glassStyle, padding: 14, border: '1px solid rgba(167,139,250,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 12, textAlign: 'center' }}>
            Интерактивный протокол
          </div>

          {/* 3 arrows */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <svg width={180} height={140} viewBox="0 0 180 140">
              {/* P and V labels */}
              <text x={20} y={14} fill="#a78bfa" fontSize={9} fontFamily="monospace" fontWeight={600}>P</text>
              <text x={160} y={14} fill="#3b82f6" fontSize={9} fontFamily="monospace" fontWeight={600}>V</text>
              <line x1={25} y1={20} x2={25} y2={130} stroke="rgba(167,139,250,0.3)" strokeWidth={1} strokeDasharray="2,2" />
              <line x1={165} y1={20} x2={165} y2={130} stroke="rgba(59,130,246,0.3)" strokeWidth={1} strokeDasharray="2,2" />

              {/* Arrow 1: P -> V (R) */}
              <line x1={30} y1={40} x2={155} y2={40} stroke="#a78bfa" strokeWidth={1} markerEnd="url(#aFS1)" />
              <defs><marker id="aFS1" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" /></marker></defs>
              <text x={95} y={35} fill="#a78bfa" fontSize={8} textAnchor="middle" fontFamily="monospace">R = kG</text>

              {/* Arrow 2: V -> P (c) */}
              <line x1={160} y1={70} x2={35} y2={70} stroke="#f59e0b" strokeWidth={1} markerEnd="url(#aFS2)" />
              <defs><marker id="aFS2" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" /></marker></defs>
              <text x={95} y={65} fill="#f59e0b" fontSize={8} textAnchor="middle" fontFamily="monospace">c = random</text>

              {/* Arrow 3: P -> V (s) */}
              <line x1={30} y1={100} x2={155} y2={100} stroke="#3b82f6" strokeWidth={1} markerEnd="url(#aFS3)" />
              <defs><marker id="aFS3" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker></defs>
              <text x={95} y={95} fill="#3b82f6" fontSize={8} textAnchor="middle" fontFamily="monospace">s = k + cx</text>
            </svg>
          </div>

          <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', lineHeight: 1.5, textAlign: 'center' }}>
            3 сообщения. Verifier ДОЛЖЕН быть online. Verifier выбирает случайный c.
          </div>
        </div>

        {/* Center: Transform arrow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#f97316', fontFamily: 'monospace', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            Fiat-Shamir
          </div>
          <svg width={30} height={40} viewBox="0 0 30 40">
            <line x1={5} y1={20} x2={25} y2={20} stroke="#f97316" strokeWidth={2} markerEnd="url(#aFSM)" />
            <defs><marker id="aFSM" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" /></marker></defs>
          </svg>
          <div style={{ fontSize: 8, color: '#f97316', fontFamily: 'monospace', textAlign: 'center', lineHeight: 1.4 }}>
            c = random<br />{'-> '}c = H(stmt || R)
          </div>
        </div>

        {/* Right: Non-interactive */}
        <div style={{ ...glassStyle, padding: 14, border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', fontFamily: 'monospace', marginBottom: 12, textAlign: 'center' }}>
            Неинтерактивный (Fiat-Shamir)
          </div>

          {/* Single arrow */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <svg width={180} height={140} viewBox="0 0 180 140">
              <text x={20} y={14} fill="#a78bfa" fontSize={9} fontFamily="monospace" fontWeight={600}>P</text>
              <text x={160} y={14} fill="#3b82f6" fontSize={9} fontFamily="monospace" fontWeight={600}>V</text>
              <line x1={25} y1={20} x2={25} y2={130} stroke="rgba(167,139,250,0.3)" strokeWidth={1} strokeDasharray="2,2" />
              <line x1={165} y1={20} x2={165} y2={130} stroke="rgba(59,130,246,0.3)" strokeWidth={1} strokeDasharray="2,2" />

              {/* Prover computes internally */}
              <text x={10} y={40} fill="rgba(167,139,250,0.6)" fontSize={7} fontFamily="monospace">R = kG</text>
              <text x={10} y={55} fill="rgba(245,158,11,0.6)" fontSize={7} fontFamily="monospace">c = H(stmt||R)</text>
              <text x={10} y={70} fill="rgba(59,130,246,0.6)" fontSize={7} fontFamily="monospace">s = k + cx</text>

              {/* Single arrow P -> V with (R, s) */}
              <line x1={30} y1={90} x2={155} y2={90} stroke="#22c55e" strokeWidth={2} markerEnd="url(#aFS4)" />
              <defs><marker id="aFS4" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" /></marker></defs>
              <text x={95} y={84} fill="#22c55e" fontSize={9} textAnchor="middle" fontFamily="monospace" fontWeight={600}>(R, s)</text>

              {/* Verifier computes */}
              <text x={120} y={112} fill="rgba(59,130,246,0.6)" fontSize={7} fontFamily="monospace">c = H(stmt||R)</text>
              <text x={120} y={125} fill="rgba(59,130,246,0.6)" fontSize={7} fontFamily="monospace">sG == R + cP?</text>
            </svg>
          </div>

          <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', lineHeight: 1.5, textAlign: 'center' }}>
            1 сообщение. Verifier может быть offline. Hash H "имитирует" случайного verifier.
          </div>
        </div>
      </div>

      <DiagramTooltip content="Преобразование Фиата-Шамира заменяет случайный challenge верификатора хешем транскрипта: e = H(a, msg). Это превращает интерактивный протокол в неинтерактивное доказательство, которое можно отправить в блокчейн для on-chain верификации.">
        <DataBox
          label="Ключевое следствие"
          value="Fiat-Shamir -- ключевая трансформация: из интерактивного протокола -> неинтерактивное доказательство. ВСЕ SNARKs и STARKs используют этот приём. Бонус: Schnorr протокол + Fiat-Shamir = Schnorr подпись (Phase 2, CRYPTO-12)."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
