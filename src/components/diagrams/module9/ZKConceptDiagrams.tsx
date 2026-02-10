/**
 * ZK Concept Diagrams (ZK-01)
 *
 * Exports:
 * - AliBabaCaveDiagram: Ali Baba cave simulation (interactive step-through, history array, 6 steps)
 * - ZKPropertiesDiagram: ZK properties triangle (static)
 * - ZKApplicationsDiagram: ZK applications landscape (static with DiagramTooltip)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  AliBabaCaveDiagram                                                  */
/* ================================================================== */

interface CaveStep {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  peggyPath?: 'A' | 'B' | null;
  victorRequest?: 'A' | 'B' | null;
  doorOpen?: boolean;
  peggyVisible?: boolean;
  victorLooking?: boolean;
  tooltip: string;
}

const CAVE_STEPS: CaveStep[] = [
  {
    title: 'SETUP',
    subtitle: 'Условие задачи',
    description: 'Пегги (Prover) знает секретное слово. Виктор (Verifier) хочет убедиться, что Пегги знает его, НЕ узнав само слово.',
    color: '#94a3b8',
    peggyPath: null,
    victorRequest: null,
    doorOpen: false,
    peggyVisible: true,
    victorLooking: false,
    tooltip: 'Пещера Али-Бабы — классическая аналогия для объяснения ZK-доказательств: доказывающий знает секретное слово (пароль от двери), а верификатор проверяет знание, не узнавая сам секрет.',
  },
  {
    title: 'ENTER',
    subtitle: 'Пегги заходит в пещеру',
    description: 'Пегги заходит в пещеру и случайно выбирает путь A или B. Виктор НЕ видит, какой путь она выбрала.',
    color: '#a78bfa',
    peggyPath: 'A',
    victorRequest: null,
    doorOpen: false,
    peggyVisible: false,
    victorLooking: false,
    tooltip: 'Пегги случайно выбирает один из двух путей. Виктор не видит её выбор — это гарантирует, что он не может предсказать ответ и подстроить вызов.',
  },
  {
    title: 'CHALLENGE',
    subtitle: 'Виктор бросает вызов',
    description: "Виктор кричит: 'Выйди через путь B!' (случайный выбор).",
    color: '#f59e0b',
    peggyPath: 'A',
    victorRequest: 'B',
    doorOpen: false,
    peggyVisible: false,
    victorLooking: true,
    tooltip: 'Виктор случайно выбирает сторону выхода. Случайность challenge критична — если Пегги могла бы предсказать запрос, она могла бы обмануть без знания секрета.',
  },
  {
    title: 'RESPONSE',
    subtitle: 'Пегги проходит через дверь',
    description: 'Пегги знает секретное слово, поэтому может открыть дверь и выйти через ЛЮБОЙ путь.',
    color: '#22c55e',
    peggyPath: 'B',
    victorRequest: 'B',
    doorOpen: true,
    peggyVisible: true,
    victorLooking: true,
    tooltip: 'Зная секретное слово, Пегги открывает дверь и выходит через запрошенный путь. Без знания секрета она могла бы выйти правильно только с вероятностью 50%.',
  },
  {
    title: 'REPEAT',
    subtitle: 'Повторение снижает шанс обмана',
    description: 'Один раунд -- Пегги могла угадать (50% шанс). После 20 раундов: шанс обмана = 1/2^20 = 0.0001%. Виктор убежден.',
    color: '#3b82f6',
    peggyPath: null,
    victorRequest: null,
    doorOpen: false,
    peggyVisible: true,
    victorLooking: true,
    tooltip: 'Повторение раундов экспоненциально снижает вероятность обмана. После N раундов вероятность успешного мошенничества = (1/2)^N, что быстро становится пренебрежимо малым.',
  },
  {
    title: 'ZK PROPERTIES',
    subtitle: 'Три свойства доказательства',
    description: 'Completeness: если Пегги знает слово, Виктор ВСЕГДА примет. Soundness: если НЕ знает, вероятность обмана -> 0. Zero-knowledge: Виктор узнал ТОЛЬКО что Пегги знает слово, НЕ само слово.',
    color: '#10b981',
    peggyPath: null,
    victorRequest: null,
    doorOpen: false,
    peggyVisible: true,
    victorLooking: true,
    tooltip: 'Три фундаментальных свойства ZK-доказательства: полнота (честный prover всегда убедит), корректность (мошенник не обманет), нулевое разглашение (секрет не раскрыт).',
  },
];

const PROBABILITY_TABLE = [
  { rounds: 1, prob: '50%', decimal: '0.5' },
  { rounds: 5, prob: '3.1%', decimal: '0.031' },
  { rounds: 10, prob: '0.098%', decimal: '0.00098' },
  { rounds: 20, prob: '0.000095%', decimal: '0.00000095' },
];

export function AliBabaCaveDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const step = history[history.length - 1];
  const current = CAVE_STEPS[step];

  const handleNext = () => {
    if (step < CAVE_STEPS.length - 1) {
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
    <DiagramContainer title="Пещера Али-Бабы: интуиция zero-knowledge" color="purple">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {CAVE_STEPS.map((s, i) => (
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

      {/* Cave visualization */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={340} height={220} viewBox="0 0 340 220">
          {/* Cave outline -- circular cave with entrance at bottom */}
          <ellipse cx={170} cy={110} rx={130} ry={90} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />

          {/* Entrance */}
          <line x1={170} y1={200} x2={170} y2={160} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
          <text x={170} y={215} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">Вход</text>

          {/* Fork */}
          <circle cx={170} cy={155} r={3} fill="rgba(255,255,255,0.3)" />

          {/* Path A (left) */}
          <path d="M 170 155 Q 100 130 80 80" fill="none" stroke={current.peggyPath === 'A' ? '#a78bfa' : 'rgba(255,255,255,0.15)'} strokeWidth={2} strokeDasharray={current.peggyPath === 'A' ? 'none' : '4,4'} />
          <text x={70} y={70} fill={current.peggyPath === 'A' ? '#a78bfa' : colors.textMuted} fontSize={11} fontFamily="monospace" fontWeight={600}>A</text>

          {/* Path B (right) */}
          <path d="M 170 155 Q 240 130 260 80" fill="none" stroke={current.peggyPath === 'B' || current.victorRequest === 'B' ? '#f59e0b' : 'rgba(255,255,255,0.15)'} strokeWidth={2} strokeDasharray={current.peggyPath === 'B' && step >= 3 ? 'none' : '4,4'} />
          <text x={262} y={70} fill={current.victorRequest === 'B' ? '#f59e0b' : colors.textMuted} fontSize={11} fontFamily="monospace" fontWeight={600}>B</text>

          {/* Door at back of cave */}
          <rect x={155} y={28} width={30} height={12} rx={2} fill={current.doorOpen ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'} stroke={current.doorOpen ? '#22c55e' : '#ef4444'} strokeWidth={1} />
          <text x={170} y={37} fill={current.doorOpen ? '#22c55e' : '#ef4444'} fontSize={7} textAnchor="middle" fontFamily="monospace">
            {current.doorOpen ? 'OPEN' : 'LOCKED'}
          </text>

          {/* Paths connecting to door */}
          <path d="M 80 80 Q 100 40 155 34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3,3" />
          <path d="M 260 80 Q 240 40 185 34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3,3" />

          {/* Peggy (Prover) -- purple circle */}
          {current.peggyVisible && step === 0 && (
            <g>
              <circle cx={140} cy={185} r={10} fill="#a78bfa" opacity={0.8} />
              <text x={140} y={189} fill="white" fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight={600}>P</text>
              <text x={140} y={178} fill="#a78bfa" fontSize={8} textAnchor="middle" fontFamily="monospace">Пегги</text>
            </g>
          )}
          {step === 1 && (
            <g>
              <circle cx={95} cy={110} r={10} fill="#a78bfa" opacity={0.8} />
              <text x={95} y={114} fill="white" fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight={600}>P</text>
              <text x={95} y={100} fill="#a78bfa" fontSize={8} textAnchor="middle" fontFamily="monospace">?</text>
            </g>
          )}
          {step === 2 && (
            <g>
              <circle cx={85} cy={85} r={10} fill="#a78bfa" opacity={0.8} />
              <text x={85} y={89} fill="white" fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight={600}>P</text>
            </g>
          )}
          {step === 3 && (
            <g>
              <circle cx={240} cy={120} r={10} fill="#a78bfa" opacity={0.8} />
              <text x={240} y={124} fill="white" fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight={600}>P</text>
              <text x={240} y={110} fill="#22c55e" fontSize={8} textAnchor="middle" fontFamily="monospace">Выход B</text>
            </g>
          )}
          {current.peggyVisible && step >= 4 && (
            <g>
              <circle cx={140} cy={185} r={10} fill="#a78bfa" opacity={0.8} />
              <text x={140} y={189} fill="white" fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight={600}>P</text>
            </g>
          )}

          {/* Victor (Verifier) -- yellow circle */}
          <g>
            <circle cx={200} cy={185} r={10} fill="#f59e0b" opacity={0.8} />
            <text x={200} y={189} fill="white" fontSize={8} textAnchor="middle" fontFamily="monospace" fontWeight={600}>V</text>
            <text x={200} y={178} fill="#f59e0b" fontSize={8} textAnchor="middle" fontFamily="monospace">Виктор</text>
          </g>

          {/* Victor's challenge speech bubble */}
          {step === 2 && (
            <g>
              <rect x={215} y={162} width={110} height={20} rx={4} fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth={1} />
              <text x={270} y={176} fill="#f59e0b" fontSize={8} textAnchor="middle" fontFamily="monospace">"Выйди через B!"</text>
            </g>
          )}
        </svg>
      </div>

      {/* Current step detail */}
      <DiagramTooltip content={current.tooltip}>
        <div style={{
          ...glassStyle,
          padding: 14,
          marginBottom: 12,
          border: `1px solid ${current.color}30`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: current.color, fontFamily: 'monospace' }}>
              {step + 1}. {current.title}: {current.subtitle}
            </div>
            <span style={{
              fontSize: 9,
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: 4,
              background: `${current.color}15`,
              color: current.color,
              border: `1px solid ${current.color}30`,
            }}>
              Шаг {step + 1}/{CAVE_STEPS.length}
            </span>
          </div>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
            {current.description}
          </div>
        </div>
      </DiagramTooltip>

      {/* Probability table (shown at step 4) */}
      {step === 4 && (
        <DiagramTooltip content="Таблица вероятностей обмана: с каждым раундом вероятность успешного мошенничества падает экспоненциально. После 20 раундов вероятность обмана составляет менее 0.0001% — это обеспечивает soundness ZK-доказательства.">
          <div style={{ ...glassStyle, padding: 12, marginBottom: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace', marginBottom: 8 }}>
              Вероятность обмана при повторении:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {PROBABILITY_TABLE.map((row) => (
                <div key={row.rounds} style={{
                  ...glassStyle,
                  padding: 8,
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>{row.rounds} раунд{row.rounds > 1 ? (row.rounds < 5 ? 'а' : 'ов') : ''}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace' }}>{row.prob}</div>
                  <div style={{ fontSize: 8, color: colors.textMuted, fontFamily: 'monospace' }}>1/2^{row.rounds}</div>
                </div>
              ))}
            </div>
          </div>
        </DiagramTooltip>
      )}

      {/* ZK Properties summary (shown at step 5) */}
      {step === 5 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Completeness', desc: 'Знает -> Примет', color: '#22c55e' },
            { label: 'Soundness', desc: 'Не знает -> Обман ~0%', color: '#3b82f6' },
            { label: 'Zero-Knowledge', desc: 'Узнал ЧТО, не КАК', color: '#f59e0b' },
          ].map((prop) => (
            <div key={prop.label} style={{
              ...glassStyle,
              padding: 10,
              textAlign: 'center',
              border: `1px solid ${prop.color}30`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: prop.color, fontFamily: 'monospace' }}>{prop.label}</div>
              <div style={{ fontSize: 9, color: colors.text, fontFamily: 'monospace', marginTop: 4 }}>{prop.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8 }}>
        <DiagramTooltip content="Навигация по шагам пещеры Али-Бабы: используйте кнопки для перехода между этапами ZK-доказательства — от setup до финальных свойств.">
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleBack} disabled={history.length <= 1} style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: history.length > 1 ? colors.text : colors.textMuted,
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: history.length > 1 ? 'pointer' : 'not-allowed',
            }}>
              Back
            </button>
            <button onClick={handleNext} disabled={step >= CAVE_STEPS.length - 1} style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: `1px solid ${step < CAVE_STEPS.length - 1 ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.1)'}`,
              background: step < CAVE_STEPS.length - 1 ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)',
              color: step < CAVE_STEPS.length - 1 ? '#a78bfa' : colors.textMuted,
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: step < CAVE_STEPS.length - 1 ? 'pointer' : 'not-allowed',
            }}>
              Step
            </button>
            <button onClick={handleReset} style={{
              padding: '6px 16px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: colors.textMuted,
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}>
              Reset
            </button>
          </div>
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ZKPropertiesDiagram                                                 */
/* ================================================================== */

interface ZKProperty {
  label: string;
  labelRu: string;
  definition: string;
  example: string;
  formal: string;
  color: string;
  tooltip: string;
}

const ZK_PROPERTIES: ZKProperty[] = [
  {
    label: 'Completeness',
    labelRu: 'Полнота',
    definition: 'Если утверждение ИСТИННО и Prover честен, Verifier ВСЕГДА примет доказательство.',
    example: 'Пегги знает слово -> Виктор всегда примет.',
    formal: 'Pr[Verify(proof) = accept | statement is true] = 1',
    color: '#22c55e',
    tooltip: 'Полнота (Completeness): если утверждение истинно и доказывающий знает свидетельство (witness), верификатор всегда примет доказательство. Гарантирует, что честный доказывающий никогда не будет отвергнут.',
  },
  {
    label: 'Soundness',
    labelRu: 'Надёжность',
    definition: 'Если утверждение ЛОЖНО, нечестный Prover НЕ СМОЖЕТ убедить Verifier (кроме пренебрежимо малой вероятности).',
    example: 'Пегги НЕ знает слово -> обман раскроется через N раундов.',
    formal: 'Pr[Verify(proof) = accept | statement is false] < epsilon',
    color: '#3b82f6',
    tooltip: 'Корректность (Soundness): если утверждение ложно, никакой нечестный доказывающий не сможет убедить верификатора принять доказательство (кроме с пренебрежимо малой вероятностью). Защищает от ложных доказательств.',
  },
  {
    label: 'Zero-Knowledge',
    labelRu: 'Нулевое знание',
    definition: 'Verifier НЕ УЗНАЕТ ничего, кроме истинности утверждения. Никакой информации о секрете.',
    example: 'Виктор знает ЧТО Пегги знает, но НЕ знает секретное слово.',
    formal: 'exists Simulator S: S(statement) ~ real proof transcript',
    color: '#f59e0b',
    tooltip: 'Нулевое разглашение (Zero-Knowledge): верификатор не узнает ничего, кроме истинности утверждения. Формально: существует симулятор, создающий неотличимые транскрипты без знания свидетельства.',
  },
];

/**
 * ZKPropertiesDiagram
 *
 * Three ZK properties arranged in a triangle with formal definitions below.
 */
export function ZKPropertiesDiagram() {
  return (
    <DiagramContainer title="Три свойства ZK-доказательства" color="blue">
      {/* Triangle layout */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={360} height={200} viewBox="0 0 360 200">
          {/* Connecting lines */}
          <line x1={180} y1={30} x2={60} y2={160} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4,4" />
          <line x1={180} y1={30} x2={300} y2={160} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4,4" />
          <line x1={60} y1={160} x2={300} y2={160} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4,4" />

          {/* Center label */}
          <text x={180} y={110} fill="rgba(255,255,255,0.4)" fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
            ZK Proof
          </text>

          {/* Top: Completeness */}
          <circle cx={180} cy={24} r={18} fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth={1} />
          <text x={180} y={20} fill="#22c55e" fontSize={7} textAnchor="middle" fontFamily="monospace" fontWeight={600}>Complete-</text>
          <text x={180} y={29} fill="#22c55e" fontSize={7} textAnchor="middle" fontFamily="monospace" fontWeight={600}>ness</text>

          {/* Bottom-left: Soundness */}
          <circle cx={60} cy={160} r={18} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth={1} />
          <text x={60} y={157} fill="#3b82f6" fontSize={7} textAnchor="middle" fontFamily="monospace" fontWeight={600}>Sound-</text>
          <text x={60} y={166} fill="#3b82f6" fontSize={7} textAnchor="middle" fontFamily="monospace" fontWeight={600}>ness</text>

          {/* Bottom-right: Zero-Knowledge */}
          <circle cx={300} cy={160} r={18} fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth={1} />
          <text x={300} y={157} fill="#f59e0b" fontSize={6} textAnchor="middle" fontFamily="monospace" fontWeight={600}>Zero-</text>
          <text x={300} y={166} fill="#f59e0b" fontSize={6} textAnchor="middle" fontFamily="monospace" fontWeight={600}>Knowledge</text>
        </svg>
      </div>

      {/* Property cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {ZK_PROPERTIES.map((prop) => (
          <DiagramTooltip key={prop.label} content={prop.tooltip}>
            <div style={{
              ...glassStyle,
              padding: 12,
              border: `1px solid ${prop.color}25`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: prop.color, fontFamily: 'monospace', marginBottom: 2 }}>
                {prop.label}
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
                ({prop.labelRu})
              </div>
              <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.5, marginBottom: 8 }}>
                {prop.definition}
              </div>
              <div style={{ fontSize: 9, fontStyle: 'italic', color: prop.color, lineHeight: 1.4, opacity: 0.8 }}>
                {prop.example}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Formal definitions */}
      <DiagramTooltip content="Формальные определения ZK-свойств используют парадигму симулятора: если существует полиномиальный алгоритм (симулятор), создающий транскрипты, неотличимые от реальных — протокол обеспечивает нулевое разглашение. Различают computational ZK (неотличимость для PPT-алгоритмов) и statistical ZK (неотличимость для любых алгоритмов).">
        <div style={{ ...glassStyle, padding: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
            Формальные определения:
          </div>
          {ZK_PROPERTIES.map((prop) => (
            <div key={prop.label} style={{
              fontSize: 10,
              fontFamily: 'monospace',
              color: colors.text,
              marginBottom: 4,
              padding: '4px 8px',
              background: `${prop.color}08`,
              borderRadius: 4,
              borderLeft: `2px solid ${prop.color}40`,
            }}>
              <span style={{ color: prop.color, fontWeight: 600 }}>{prop.label}:</span>{' '}
              {prop.formal}
            </div>
          ))}
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ZKApplicationsDiagram                                               */
/* ================================================================== */

interface ZKApplication {
  title: string;
  titleRu: string;
  summary: string;
  color: string;
  tooltip: string;
}

const ZK_APPLICATIONS: ZKApplication[] = [
  {
    title: 'Privacy',
    titleRu: 'Конфиденциальность',
    summary: 'Скрыть данные транзакций.',
    color: '#a78bfa',
    tooltip: 'Zcash использует zk-SNARKs для скрытия отправителя, получателя и суммы транзакции. Shielded-транзакции доказывают валидность перевода без раскрытия деталей.',
  },
  {
    title: 'Scalability',
    titleRu: 'Масштабируемость',
    summary: 'ZK Rollups сжимают тысячи транзакций в один proof.',
    color: '#3b82f6',
    tooltip: 'zk-Rollups (zkSync, StarkNet, Polygon zkEVM) используют ZK-доказательства для сжатия тысяч транзакций L2 в одно доказательство на L1, обеспечивая масштабируемость без потери безопасности.',
  },
  {
    title: 'Identity',
    titleRu: 'Идентификация',
    summary: 'Доказать свойство без раскрытия данных.',
    color: '#22c55e',
    tooltip: 'ZK-доказательства позволяют подтвердить возраст, гражданство или квалификацию без раскрытия документов. Основа для децентрализованной цифровой идентичности (DID).',
  },
  {
    title: 'Voting',
    titleRu: 'Голосование',
    summary: 'Приватное голосование с проверяемым результатом.',
    color: '#f59e0b',
    tooltip: 'ZK-голосование позволяет доказать право голоса и корректность подсчета без раскрытия индивидуальных голосов. Предотвращает покупку голосов и принуждение.',
  },
  {
    title: 'Compliance',
    titleRu: 'Соответствие',
    summary: 'Доказать соблюдение правил без раскрытия данных.',
    color: '#ef4444',
    tooltip: 'ZK-compliance позволяет доказать соответствие регуляторным требованиям (достаточность резервов, KYC-проверка) без раскрытия конфиденциальных данных клиентов.',
  },
];

/**
 * ZKApplicationsDiagram
 *
 * Grid of 5 ZK application cards with DiagramTooltip.
 */
export function ZKApplicationsDiagram() {
  return (
    <DiagramContainer title="Применения Zero-Knowledge: от блокчейна до реального мира" color="green">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
        {ZK_APPLICATIONS.slice(0, 3).map((app) => (
          <DiagramTooltip key={app.title} content={app.tooltip}>
            <div
              style={{
                ...glassStyle,
                padding: 12,
                cursor: 'pointer',
                border: `1px solid rgba(255,255,255,0.06)`,
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: app.color, fontFamily: 'monospace', marginBottom: 2 }}>
                {app.title}
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
                ({app.titleRu})
              </div>
              <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.5 }}>
                {app.summary}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12 }}>
        {ZK_APPLICATIONS.slice(3).map((app) => (
          <DiagramTooltip key={app.title} content={app.tooltip}>
            <div
              style={{
                ...glassStyle,
                padding: 12,
                cursor: 'pointer',
                border: `1px solid rgba(255,255,255,0.06)`,
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: app.color, fontFamily: 'monospace', marginBottom: 2 }}>
                {app.title}
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
                ({app.titleRu})
              </div>
              <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.5 }}>
                {app.summary}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DiagramTooltip content="ZK-доказательства — универсальная криптографическая технология: везде, где нужно ДОКАЗАТЬ что-то без РАСКРЫТИЯ секретной информации. От приватных транзакций до масштабирования блокчейнов и цифровой идентичности.">
        <DataBox
          label="Ключевое наблюдение"
          value="ZK = универсальная технология: где нужно ДОКАЗАТЬ без РАСКРЫТИЯ. От приватных транзакций (Zcash) до масштабирования (zkSync) и цифровой идентификации (WorldID)."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
