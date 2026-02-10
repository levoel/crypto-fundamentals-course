/**
 * Proof of History Diagrams (SOL-02)
 *
 * Exports:
 * - PoHHashChainDiagram: Step-through PoH hash chain with event interleaving (interactive, history array)
 * - PoHVerificationDiagram: Sequential generation vs parallel verification (static with DiagramTooltip)
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  FNV hash -- deterministic, browser-safe (no SubtleCrypto)          */
/* ================================================================== */

/**
 * FNV-1a hash producing 16 hex chars (two 32-bit rounds concatenated).
 * NOT cryptographic -- purely for visual PoH demo.
 */
function fnvHash(input: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x45d9f3b);
  h1 ^= h1 >>> 16;

  let h2 = 0x6c62272e;
  for (let i = 0; i < input.length; i++) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x01000193);
  }
  h2 ^= h2 >>> 16;
  h2 = Math.imul(h2, 0x45d9f3b);
  h2 ^= h2 >>> 16;

  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

/* ================================================================== */
/*  Shared button style                                                */
/* ================================================================== */

function btnStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    ...glassStyle,
    padding: '8px 16px',
    cursor: active ? 'pointer' : 'not-allowed',
    color: active ? accentColor : colors.textMuted,
    fontSize: 13,
    fontFamily: 'monospace',
    opacity: active ? 1 : 0.5,
    border: `1px solid ${active ? accentColor + '40' : 'rgba(255,255,255,0.08)'}`,
    background: active ? `${accentColor}10` : 'rgba(255,255,255,0.03)',
  };
}

/* ================================================================== */
/*  PoHHashChainDiagram                                                */
/* ================================================================== */

interface PoHEntry {
  index: number;
  hash: string;
  input: string;
  event?: string;
}

interface PoHStep {
  entries: PoHEntry[];
  message: string;
  highlightEvent?: number; // index of entry with event
}

function buildPoHSteps(): PoHStep[] {
  const seed = 'solana-genesis-seed';
  const h0 = fnvHash(seed);
  const h1 = fnvHash(h0);
  const h2 = fnvHash(h1);
  const event1 = 'Transfer 5 SOL';
  const h3 = fnvHash(h2 + event1);
  const h4 = fnvHash(h3);
  const h5 = fnvHash(h4);
  const event2 = 'Create Account';
  const h6 = fnvHash(h5 + event2);

  return [
    {
      entries: [
        { index: 0, hash: h0, input: `SHA-256(seed)` },
      ],
      message: 'Начальное состояние. Seed-значение хешируется для создания H(0). Это первый элемент цепочки PoH.',
    },
    {
      entries: [
        { index: 0, hash: h0, input: `SHA-256(seed)` },
        { index: 1, hash: h1, input: `SHA-256(H(0))` },
      ],
      message: 'H(1) = SHA-256(H(0)). Каждый хеш требует предыдущий -- цепочку нельзя параллелизировать.',
    },
    {
      entries: [
        { index: 0, hash: h0, input: `SHA-256(seed)` },
        { index: 1, hash: h1, input: `SHA-256(H(0))` },
        { index: 2, hash: h2, input: `SHA-256(H(1))` },
      ],
      message: 'H(2) = SHA-256(H(1)). N хешей доказывают, что прошло N единиц времени.',
    },
    {
      entries: [
        { index: 0, hash: h0, input: `SHA-256(seed)` },
        { index: 1, hash: h1, input: `SHA-256(H(0))` },
        { index: 2, hash: h2, input: `SHA-256(H(1))` },
        { index: 3, hash: h3, input: `SHA-256(H(2) + event)`, event: event1 },
      ],
      message: 'Событие! H(3) = SHA-256(H(2) || "Transfer 5 SOL"). Событие вмешивается во вход хеша -- оно получает доказуемую временную метку.',
      highlightEvent: 3,
    },
    {
      entries: [
        { index: 0, hash: h0, input: `SHA-256(seed)` },
        { index: 1, hash: h1, input: `SHA-256(H(0))` },
        { index: 2, hash: h2, input: `SHA-256(H(1))` },
        { index: 3, hash: h3, input: `SHA-256(H(2) + event)`, event: event1 },
        { index: 4, hash: h4, input: `SHA-256(H(3))` },
        { index: 5, hash: h5, input: `SHA-256(H(4))` },
      ],
      message: 'После события цепочка продолжается: H(4) = SHA-256(H(3)), H(5) = SHA-256(H(4)). Порядок сохранен.',
      highlightEvent: 3,
    },
    {
      entries: [
        { index: 0, hash: h0, input: `SHA-256(seed)` },
        { index: 1, hash: h1, input: `SHA-256(H(0))` },
        { index: 2, hash: h2, input: `SHA-256(H(1))` },
        { index: 3, hash: h3, input: `SHA-256(H(2) + event)`, event: event1 },
        { index: 4, hash: h4, input: `SHA-256(H(3))` },
        { index: 5, hash: h5, input: `SHA-256(H(4))` },
        { index: 6, hash: h6, input: `SHA-256(H(5) + event)`, event: event2 },
      ],
      message: 'Второе событие! H(6) = SHA-256(H(5) || "Create Account"). Оба события упорядочены относительно друг друга по позиции в цепочке.',
      highlightEvent: 6,
    },
  ];
}

/** Tooltip content for hash chain boxes based on whether they contain an event */
function hashBoxTooltip(entry: PoHEntry): string {
  if (entry.event) {
    return `H(${entry.index}) содержит событие "${entry.event}". Хеш вычислен от предыдущего хеша + данные события, что даёт событию доказуемую позицию во времени.`;
  }
  if (entry.index === 0) {
    return 'H(0) — начальный хеш цепочки, вычисленный из seed-значения. Все последующие хеши строятся на этом фундаменте, образуя Verifiable Delay Function (VDF).';
  }
  return `H(${entry.index}) = SHA-256(H(${entry.index - 1})). Каждый хеш в цепочке последовательно зависит от предыдущего, что делает невозможным параллельное вычисление и гарантирует порядок.`;
}

export function PoHHashChainDiagram() {
  const [step, setStep] = useState(0);
  const steps = buildPoHSteps();
  const currentStep = steps[step];

  const canBack = step > 0;
  const canForward = step < steps.length - 1;

  return (
    <DiagramContainer title="Proof of History: цепочка хешей" color="green">
      {/* Hash chain visualization */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 'max-content', padding: '8px 0' }}>
          {currentStep.entries.map((entry, i) => {
            const isEvent = !!entry.event;
            const isHighlighted = currentStep.highlightEvent === entry.index;
            const boxColor = isEvent ? '#f59e0b' : '#22c55e';

            return (
              <div key={entry.index} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {/* Event label above */}
                  {isEvent && (
                    <div style={{
                      ...glassStyle,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: isHighlighted ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)',
                      border: `1px solid rgba(245,158,11,${isHighlighted ? 0.6 : 0.3})`,
                      fontSize: 10,
                      fontFamily: 'monospace',
                      color: '#f59e0b',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}>
                      {entry.event}
                    </div>
                  )}
                  {isEvent && (
                    <div style={{ fontSize: 10, color: '#f59e0b', lineHeight: 1 }}>
                      |
                    </div>
                  )}

                  {/* Hash box */}
                  <DiagramTooltip content={hashBoxTooltip(entry)}>
                    <div style={{
                      ...glassStyle,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isHighlighted ? `${boxColor}15` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isHighlighted ? boxColor + '60' : 'rgba(255,255,255,0.1)'}`,
                      textAlign: 'center',
                      minWidth: 100,
                    }}>
                      <div style={{
                        fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
                        color: boxColor, marginBottom: 4,
                      }}>
                        H({entry.index})
                      </div>
                      <div style={{
                        fontSize: 11, fontFamily: 'monospace',
                        color: colors.text, letterSpacing: 0.5,
                      }}>
                        {entry.hash}
                      </div>
                    </div>
                  </DiagramTooltip>
                </div>

                {/* Arrow to next */}
                {i < currentStep.entries.length - 1 && (
                  <div style={{
                    fontSize: 16, color: colors.textMuted, fontFamily: 'monospace',
                    padding: '0 2px',
                  }}>
                    {'\u2192'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message */}
      <DiagramTooltip content="Пошаговое описание процесса построения цепочки PoH. Каждый шаг демонстрирует, как последовательное хеширование создаёт криптографические часы — Verifiable Delay Function.">
        <DataBox
          label={`Шаг ${step + 1} из ${steps.length}`}
          value={currentStep.message}
          variant="highlight"
        />
      </DiagramTooltip>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <DiagramTooltip content="Сброс к первому шагу — начальному seed-хешу цепочки PoH.">
          <div>
            <button
              onClick={() => setStep(0)}
              style={btnStyle(step > 0, colors.text)}
              disabled={step === 0}
            >
              Сброс
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Вернуться к предыдущему шагу построения цепочки хешей.">
          <div>
            <button
              onClick={() => canBack && setStep((s) => s - 1)}
              disabled={!canBack}
              style={btnStyle(canBack, colors.text)}
            >
              Назад
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Перейти к следующему шагу: увидеть, как добавляется новый хеш или событие в цепочку.">
          <div>
            <button
              onClick={() => canForward && setStep((s) => s + 1)}
              disabled={!canForward}
              style={btnStyle(canForward, '#22c55e')}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  PoHVerificationDiagram                                             */
/* ================================================================== */

export function PoHVerificationDiagram() {
  const coreColors = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];
  const chainLen = 8;

  return (
    <DiagramContainer title="PoH: генерация vs верификация" color="blue">
      {/* Generation section */}
      <DiagramTooltip content="Генератор PoH последовательно вычисляет SHA-256 хеши, создавая криптографические часы. Каждый хеш зависит от предыдущего, что гарантирует порядок событий без необходимости синхронизации между валидаторами.">
        <div
          style={{
            ...glassStyle,
            padding: 16,
            borderRadius: 10,
            marginBottom: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.15s',
            cursor: 'default',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
              color: '#f59e0b',
              background: 'rgba(245,158,11,0.15)',
              padding: '3px 8px', borderRadius: 4,
            }}>
              Генерация (последовательная)
            </div>
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
              1 ядро, N операций, O(N)
            </span>
          </div>

          {/* Single CPU generating chain */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
            {/* CPU icon */}
            <div style={{
              ...glassStyle,
              padding: '6px 10px', borderRadius: 6, textAlign: 'center',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              minWidth: 48, flexShrink: 0,
            }}>
              <div style={{ fontSize: 14 }}>CPU</div>
              <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>Core 1</div>
            </div>

            <span style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: 12, flexShrink: 0 }}>{'\u2192'}</span>

            {/* Hash chain */}
            {Array.from({ length: chainLen }, (_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <div style={{
                  ...glassStyle,
                  padding: '4px 8px', borderRadius: 4, textAlign: 'center',
                  background: 'rgba(245,158,11,0.05)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  minWidth: 36,
                }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#f59e0b' }}>
                    H({i})
                  </span>
                </div>
                {i < chainLen - 1 && (
                  <span style={{ color: colors.textMuted, fontSize: 10, fontFamily: 'monospace' }}>{'\u2192'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </DiagramTooltip>

      {/* Verification section */}
      <DiagramTooltip content="Верификация PoH параллельна: любой валидатор может независимо проверить цепочку хешей, разбив её на сегменты и верифицируя каждый на отдельном ядре CPU. Это делает проверку значительно быстрее генерации.">
        <div
          style={{
            ...glassStyle,
            padding: 16,
            borderRadius: 10,
            marginBottom: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.15s',
            cursor: 'default',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
              color: '#22c55e',
              background: 'rgba(34,197,94,0.15)',
              padding: '3px 8px', borderRadius: 4,
            }}>
              Верификация (параллельная)
            </div>
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
              4 ядра, N/4 операций каждое, O(N/cores)
            </span>
          </div>

          {/* 4 cores each verifying a chunk */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[0, 1, 2, 3].map((coreIdx) => {
              const startH = coreIdx * 2;
              const endH = startH + 2;
              return (
                <div key={coreIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    ...glassStyle,
                    padding: '4px 8px', borderRadius: 4, textAlign: 'center',
                    background: `${coreColors[coreIdx]}10`,
                    border: `1px solid ${coreColors[coreIdx]}30`,
                    minWidth: 48, flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: coreColors[coreIdx], fontWeight: 600 }}>
                      Core {coreIdx + 1}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                    проверяет
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <div style={{
                      ...glassStyle,
                      padding: '3px 6px', borderRadius: 3,
                      background: `${coreColors[coreIdx]}08`,
                      border: `1px solid ${coreColors[coreIdx]}20`,
                    }}>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: coreColors[coreIdx] }}>
                        H({startH})
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: colors.textMuted }}>{'\u2192'}</span>
                    <div style={{
                      ...glassStyle,
                      padding: '3px 6px', borderRadius: 3,
                      background: `${coreColors[coreIdx]}08`,
                      border: `1px solid ${coreColors[coreIdx]}20`,
                    }}>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: coreColors[coreIdx] }}>
                        H({endH})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DiagramTooltip>

      {/* Key insight */}
      <DiagramTooltip content="Асимметрия генерации и верификации — ключевое свойство PoH. Генерация требует O(N) последовательных операций, а верификация — O(N/cores), что позволяет всем валидаторам быстро проверить доказательство.">
        <DataBox
          label="Ключевое свойство"
          value="Эта асимметрия делает PoH полезным: один лидер генерирует доказательство (последовательно, медленно), а все валидаторы верифицируют его быстро (параллельно, во много раз быстрее)."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
