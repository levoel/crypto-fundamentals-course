/**
 * Groth16 Diagrams (ZK-05)
 *
 * Exports:
 * - TrustedSetupDiagram: Step-through trusted setup ceremony (6 steps, history array)
 * - Groth16LifecycleDiagram: Static Groth16 proof lifecycle (Prover -> Proof -> Verifier)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  TrustedSetupDiagram                                                  */
/* ================================================================== */

interface SetupStep {
  title: string;
  label: string;
  description: string;
  detail: string;
  color: string;
  icon: string;
}

const SETUP_STEPS: SetupStep[] = [
  {
    title: 'ЗАЧЕМ TRUSTED SETUP?',
    label: 'Шаг 1',
    description: 'SNARK proof system (Groth16) нуждается в Common Reference String (CRS) -- структурированных параметрах, привязанных к конкретной circuit. CRS содержит зашифрованные powers of secret: [s, s^2, s^3, ...]. Этот секрет s называется "toxic waste" -- если кто-то его знает, он может создавать поддельные proofs.',
    detail: 'CRS = proving key (prover) + verification key (verifier). Без CRS нет SNARK.',
    color: '#3b82f6',
    icon: '?',
  },
  {
    title: 'PHASE 1: POWERS OF TAU',
    label: 'Шаг 2',
    description: 'Phase 1 -- универсальная: генерирует powers of tau (\u03C4) через MPC церемонию. Каждый участник добавляет свою случайность к \u03C4. Результат: [\u03C4, \u03C4^2, \u03C4^3, ...] на эллиптической кривой. Этот результат переиспользуем для ЛЮБОЙ circuit до определенного размера.',
    detail: 'Ethereum KZG ceremony (2023): 141,416 участников из 177 стран. Самая большая MPC ceremony в истории.',
    color: '#8b5cf6',
    icon: '\u03C4',
  },
  {
    title: 'MPC CEREMONY: КАК ЭТО РАБОТАЕТ',
    label: 'Шаг 3',
    description: 'Multi-Party Computation: участники по очереди добавляют случайность. Участник 1 генерирует s1, передает g^(s1). Участник 2 генерирует s2, вычисляет g^(s1*s2). Участник N генерирует sN, вычисляет g^(s1*s2*...*sN). Итоговый секрет \u03C4 = s1 * s2 * ... * sN. Никто не знает \u03C4 целиком.',
    detail: 'Zcash Sprout ceremony (2016): 6 участников. Zcash Sapling (2018): 87 участников. Ethereum KZG (2023): 141,416 участников.',
    color: '#6366f1',
    icon: 'MPC',
  },
  {
    title: 'TOXIC WASTE',
    label: 'Шаг 4',
    description: 'Toxic waste = секретное значение \u03C4 (и все промежуточные si). Если ЛЮБОЙ атакующий получит \u03C4, он может генерировать поддельные proofs (forge proofs of false statements). Каждый участник ОБЯЗАН уничтожить свой секрет si после участия.',
    detail: 'Ключевая гарантия: если ХОТЯ БЫ ОДИН участник честно уничтожил свой si, toxic waste безвозвратно утерян и система безопасна.',
    color: '#ef4444',
    icon: '\u2622',
  },
  {
    title: 'PHASE 2: CIRCUIT-SPECIFIC',
    label: 'Шаг 5',
    description: 'Phase 2 берет результат Phase 1 и специализирует его для конкретной circuit (R1CS/QAP). Создает proving key и verification key именно для этой программы. При изменении программы нужна новая Phase 2 (но Phase 1 переиспользуется).',
    detail: 'Для каждого нового ZK приложения (например, новый Tornado Cash mixer или Zcash upgrade) нужна отдельная Phase 2 ceremony.',
    color: '#f59e0b',
    icon: 'P2',
  },
  {
    title: 'РЕЗУЛЬТАТ: КЛЮЧИ',
    label: 'Шаг 6',
    description: 'После ceremony имеем: (1) Proving Key (pk) -- большой, используется prover для генерации proofs. (2) Verification Key (vk) -- маленький, используется verifier для проверки proofs. vk обычно размещается в smart contract on-chain.',
    detail: 'PLONK (next generation): universal trusted setup -- одна ceremony для ВСЕХ circuits. Нет per-circuit Phase 2. Но Groth16 все еще самый компактный proof (~128 bytes).',
    color: '#10b981',
    icon: 'PK',
  },
];

/**
 * TrustedSetupDiagram
 *
 * Step-through trusted setup ceremony with 6 steps.
 * History array for forward/backward navigation.
 */
export function TrustedSetupDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const current = history[history.length - 1];

  const step = () => {
    if (current < SETUP_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = SETUP_STEPS[current];

  return (
    <DiagramContainer title="Trusted Setup: ceremony, toxic waste, и MPC" color="red">
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {SETUP_STEPS.map((st, i) => (
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

      {/* Phase indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SETUP_STEPS.map((st, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'monospace',
              color: i <= current ? '#fff' : colors.textMuted,
              background: i <= current ? `${st.color}30` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${i === current ? st.color : i < current ? `${st.color}40` : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.3s',
            }}>
              {st.icon}
            </div>
            {i < SETUP_STEPS.length - 1 && (
              <div style={{
                width: 16,
                height: 2,
                background: i < current ? `${SETUP_STEPS[i + 1].color}60` : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step detail */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 12,
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
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', fontStyle: 'italic', lineHeight: 1.5 }}>
          {s.detail}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Back', action: back, disabled: history.length <= 1 },
          { label: `Step ${current + 1}/${SETUP_STEPS.length}`, action: step, disabled: current >= SETUP_STEPS.length - 1 },
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

      {/* Key takeaway */}
      <DataBox
        label="Главная гарантия MPC"
        value="Если ХОТЯ БЫ ОДИН из 141,416 участников Ethereum KZG ceremony честно уничтожил свой секрет -- вся система безопасна. Вероятность, что ВСЕ участники сговорились, практически нулевая."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  Groth16LifecycleDiagram                                              */
/* ================================================================== */

interface LifecyclePhase {
  name: string;
  nameRu: string;
  where: string;
  description: string;
  details: string[];
  color: string;
  icon: string;
}

const LIFECYCLE_PHASES: LifecyclePhase[] = [
  {
    name: 'Setup',
    nameRu: 'Trusted Setup',
    where: 'One-time ceremony',
    description: 'Генерация proving key (pk) и verification key (vk) через MPC ceremony.',
    details: ['Phase 1: Powers of tau', 'Phase 2: Circuit-specific', 'pk: ~MB (prover)', 'vk: ~KB (verifier)'],
    color: '#f59e0b',
    icon: 'CRS',
  },
  {
    name: 'Prove',
    nameRu: 'Prover (off-chain)',
    where: 'Off-chain (heavy computation)',
    description: 'Prover берет witness (приватный вход) и pk, вычисляет proof \u03C0 = [A, B, C] -- три элемента эллиптической кривой.',
    details: ['Input: witness w, public inputs x, pk', 'Output: \u03C0 = (A, B, C)', 'Size: ~128 bytes (3 group elements)', 'Time: секунды-минуты'],
    color: '#8b5cf6',
    icon: 'P',
  },
  {
    name: 'Verify',
    nameRu: 'Verifier (on-chain)',
    where: 'On-chain (cheap verification)',
    description: 'Verifier проверяет proof через bilinear pairing: e(A, B) = e(\u03B1, \u03B2) * e(x*\u03B3, \u03B3) * e(C, \u03B4). Одно pairing equation -- и proof верифицирован.',
    details: ['Input: \u03C0 = (A, B, C), public inputs x, vk', 'Pairing check: 1 equation', 'Gas cost: ~200-300K', 'Time: миллисекунды'],
    color: '#10b981',
    icon: 'V',
  },
];

/**
 * Groth16LifecycleDiagram
 *
 * Static flow: Setup -> Prover -> Proof -> Verifier.
 * Bilinear pairing explanation box.
 */
export function Groth16LifecycleDiagram() {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  return (
    <DiagramContainer title="Groth16: lifecycle от witness до verification" color="purple">
      {/* Main flow */}
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 4,
        marginBottom: 16,
        overflowX: 'auto',
      }}>
        {LIFECYCLE_PHASES.map((phase, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              onMouseEnter={() => setHoveredPhase(i)}
              onMouseLeave={() => setHoveredPhase(null)}
              style={{
                ...glassStyle,
                padding: 14,
                borderRadius: 8,
                border: `1px solid ${hoveredPhase === i ? `${phase.color}60` : `${phase.color}25`}`,
                background: hoveredPhase === i ? `${phase.color}12` : `${phase.color}06`,
                minWidth: 140,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: phase.color,
                  fontFamily: 'monospace',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: `${phase.color}15`,
                  border: `1px solid ${phase.color}30`,
                }}>
                  {phase.icon}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
                  {phase.nameRu}
                </span>
              </div>
              {/* Where */}
              <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
                {phase.where}
              </div>
              {/* Description */}
              <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
                {phase.description}
              </div>
              {/* Details */}
              <div style={{ marginTop: 8 }}>
                {phase.details.map((d, di) => (
                  <div key={di} style={{
                    fontSize: 9,
                    color: colors.textMuted,
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                  }}>
                    {'\u2022'} {d}
                  </div>
                ))}
              </div>
            </div>
            {/* Arrow */}
            {i < LIFECYCLE_PHASES.length - 1 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}>
                <div style={{ fontSize: 14, color: colors.textMuted, fontFamily: 'monospace' }}>
                  {'\u2192'}
                </div>
                <div style={{ fontSize: 8, color: colors.textMuted, fontFamily: 'monospace' }}>
                  {i === 0 ? 'pk,vk' : '\u03C0=[A,B,C]'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bilinear pairing explanation */}
      <div style={{
        ...glassStyle,
        padding: 14,
        borderRadius: 8,
        marginBottom: 12,
        border: '1px solid #6366f130',
        background: '#6366f108',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#6366f1',
          fontFamily: 'monospace',
          marginBottom: 6,
        }}>
          Bilinear Pairing (magic function)
        </div>
        <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.6, marginBottom: 8 }}>
          e(aG, bH) = e(G, H)^(ab). Input: две точки на кривых G1, G2. Output: элемент GT.
          Позволяет проверить "произведение" без знания множителей.
          Verifier проверяет e(A, B) = e(alpha, beta) * e(L, gamma) * e(C, delta) --
          одно уравнение вместо пересчета всей computation.
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
          Groth16 verification: 3 pairing operations, ~200-300K gas on Ethereum
        </div>
      </div>

      {/* Proof size comparison */}
      <div style={{
        ...glassStyle,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          fontSize: 10,
          fontWeight: 700,
          color: colors.textMuted,
          fontFamily: 'monospace',
          marginBottom: 8,
        }}>
          Proof Size Comparison
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { name: 'Groth16', size: '~128 B', color: '#10b981', width: '10%' },
            { name: 'PLONK', size: '~400 B', color: '#3b82f6', width: '18%' },
            { name: 'Bulletproofs', size: '~1.3 KB', color: '#f59e0b', width: '35%' },
            { name: 'STARK', size: '~45-200 KB', color: '#ef4444', width: '100%' },
          ].map((p) => (
            <div key={p.name} style={{ flex: 1, minWidth: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: p.color, fontFamily: 'monospace', fontWeight: 600 }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>
                  {p.size}
                </span>
              </div>
              <div style={{
                height: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: p.width,
                  background: `${p.color}60`,
                  borderRadius: 2,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataBox
        label="Groth16 trade-off"
        value="Самый компактный proof (~128 bytes, 3 group elements), но требует trusted setup для КАЖДОЙ circuit. PLONK: universal setup (одна ceremony для всех circuits), но proof больше (~400 bytes). Выбор зависит от приложения."
        variant="info"
      />
    </DiagramContainer>
  );
}
