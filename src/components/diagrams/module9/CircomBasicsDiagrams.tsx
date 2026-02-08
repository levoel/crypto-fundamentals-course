/**
 * Circom Basics Diagrams (ZK-07)
 *
 * Exports:
 * - CircomAnatomyDiagram: Annotated Multiplier2 circuit code with callouts
 * - ConstraintOperatorsDiagram: Operator comparison table with exploit example
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  CircomAnatomyDiagram                                                 */
/* ================================================================== */

interface CodeAnnotation {
  line: string;
  annotation: string;
  color: string;
}

const ANNOTATED_CODE: CodeAnnotation[] = [
  {
    line: 'pragma circom 2.0.0;',
    annotation: 'Версия языка Circom. Определяет доступные фичи и синтаксис.',
    color: '#6366f1',
  },
  {
    line: 'template Multiplier2() {',
    annotation: 'Template -- параметризуемый blueprint (как class). Создает circuit.',
    color: '#3b82f6',
  },
  {
    line: '    signal input a;',
    annotation: 'Input signal -- приватный вход. Prover знает, verifier нет.',
    color: '#10b981',
  },
  {
    line: '    signal input b;',
    annotation: 'Второй input signal. Все сигналы -- элементы конечного поля.',
    color: '#10b981',
  },
  {
    line: '    signal output c;',
    annotation: 'Output signal -- публичный выход. Verifier видит это значение.',
    color: '#f59e0b',
  },
  {
    line: '    c <== a * b;',
    annotation: '<== = присвоение + constraint. SAFE. Гарантирует: c === a * b.',
    color: '#ef4444',
  },
  {
    line: '}',
    annotation: '',
    color: '#6366f1',
  },
  {
    line: 'component main = Multiplier2();',
    annotation: 'Точка входа. Instantiates template как main component.',
    color: '#8b5cf6',
  },
];

/**
 * CircomAnatomyDiagram
 *
 * Annotated Multiplier2 circuit code with 6 callout annotations.
 * Static diagram showing Circom syntax elements.
 */
export function CircomAnatomyDiagram() {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  return (
    <DiagramContainer title="Анатомия Circom: template, signals, constraints" color="blue">
      {/* Code block */}
      <div style={{
        ...glassStyle,
        padding: 16,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 12,
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 1.8,
      }}>
        {ANNOTATED_CODE.map((item, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredLine(i)}
            onMouseLeave={() => setHoveredLine(null)}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              background: hoveredLine === i ? `${item.color}12` : 'transparent',
              borderLeft: hoveredLine === i ? `3px solid ${item.color}` : '3px solid transparent',
              transition: 'all 0.15s',
              cursor: item.annotation ? 'help' : 'default',
            }}
          >
            <span style={{ color: item.color }}>{item.line}</span>
          </div>
        ))}
      </div>

      {/* Annotation tooltip */}
      {hoveredLine !== null && ANNOTATED_CODE[hoveredLine].annotation && (
        <div style={{
          ...glassStyle,
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
          border: `1px solid ${ANNOTATED_CODE[hoveredLine].color}30`,
          background: `${ANNOTATED_CODE[hoveredLine].color}08`,
        }}>
          <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: ANNOTATED_CODE[hoveredLine].color, fontFamily: 'monospace' }}>
              {ANNOTATED_CODE[hoveredLine].line.trim()}
            </span>
            <br />
            {ANNOTATED_CODE[hoveredLine].annotation}
          </div>
        </div>
      )}

      {/* Signal types legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          { label: 'signal input', color: '#10b981', desc: 'Приватный вход (prover)' },
          { label: 'signal output', color: '#f59e0b', desc: 'Публичный выход (verifier)' },
          { label: 'signal (intermediate)', color: '#6366f1', desc: 'Промежуточное значение' },
        ].map((s) => (
          <div key={s.label} style={{
            ...glassStyle,
            padding: '6px 10px',
            borderRadius: 6,
            border: `1px solid ${s.color}30`,
            fontSize: 10,
            fontFamily: 'monospace',
          }}>
            <span style={{ color: s.color, fontWeight: 600 }}>{s.label}</span>
            <span style={{ color: colors.textMuted, marginLeft: 6 }}>{s.desc}</span>
          </div>
        ))}
      </div>

      <DataBox
        label="Template"
        value="Template -- как class в OOP: описывает signals и constraints. component main = Template() создает конкретный instance. Каждый template может быть параметризован (например, Multiplier(N))."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ConstraintOperatorsDiagram                                           */
/* ================================================================== */

interface OperatorInfo {
  operator: string;
  name: string;
  does: string;
  safety: string;
  safetyColor: string;
  example: string;
  explanation: string;
}

const OPERATORS: OperatorInfo[] = [
  {
    operator: '<==',
    name: 'Signal assignment + constraint',
    does: 'Присваивает значение И добавляет constraint',
    safety: 'SAFE',
    safetyColor: '#10b981',
    example: 'c <== a * b;',
    explanation: 'Эквивалент: c <-- a * b; c === a * b; Два действия в одном. Всегда используйте <== когда возможно.',
  },
  {
    operator: '<--',
    name: 'Signal assignment only',
    does: 'Только присваивает значение, БЕЗ constraint',
    safety: 'DANGEROUS',
    safetyColor: '#ef4444',
    example: 'c <-- a * b;',
    explanation: 'Prover может подставить ЛЮБОЕ значение c. Без constraint (===) verifier не проверит корректность. Используйте ТОЛЬКО когда <== невозможен (non-quadratic), и СРАЗУ добавляйте ===.',
  },
  {
    operator: '===',
    name: 'Constraint only',
    does: 'Добавляет constraint БЕЗ присваивания',
    safety: 'AUXILIARY',
    safetyColor: '#f59e0b',
    example: 'c === a * b;',
    explanation: 'Signal c уже должен иметь значение (через <-- или <==). === только проверяет, что constraint выполняется. Используется в паре с <--.',
  },
];

/**
 * ConstraintOperatorsDiagram
 *
 * Operator comparison table with danger indicators and
 * exploit example showing unsafe <-- without constraint.
 */
export function ConstraintOperatorsDiagram() {
  const [hoveredOp, setHoveredOp] = useState<number | null>(null);

  return (
    <DiagramContainer title="Операторы Circom: <== (safe) vs <-- (dangerous)" color="red">
      {/* Operator table */}
      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12,
          fontFamily: 'monospace',
        }}>
          <thead>
            <tr>
              {['Оператор', 'Действие', 'Безопасность', 'Пример'].map((h) => (
                <th key={h} style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  fontSize: 10,
                  color: colors.textMuted,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OPERATORS.map((op, i) => {
              const isHovered = hoveredOp === i;
              return (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredOp(i)}
                  onMouseLeave={() => setHoveredOp(null)}
                  style={{
                    background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                    transition: 'background 0.15s',
                    cursor: 'help',
                  }}
                >
                  <td style={{
                    padding: '8px 10px',
                    fontWeight: 700,
                    fontSize: 14,
                    color: op.safetyColor,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    {op.operator}
                  </td>
                  <td style={{
                    padding: '8px 10px',
                    color: colors.text,
                    fontSize: 11,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    lineHeight: 1.4,
                  }}>
                    {op.does}
                  </td>
                  <td style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      color: op.safetyColor,
                      background: `${op.safetyColor}15`,
                      border: `1px solid ${op.safetyColor}30`,
                    }}>
                      {op.safety}
                    </span>
                  </td>
                  <td style={{
                    padding: '8px 10px',
                    color: colors.text,
                    fontSize: 11,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    {op.example}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded explanation on hover */}
      {hoveredOp !== null && (
        <div style={{
          ...glassStyle,
          padding: 10,
          marginBottom: 14,
          borderRadius: 6,
          border: `1px solid ${OPERATORS[hoveredOp].safetyColor}30`,
          background: `${OPERATORS[hoveredOp].safetyColor}08`,
        }}>
          <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: OPERATORS[hoveredOp].safetyColor }}>
              {OPERATORS[hoveredOp].operator}
            </span>{' '}
            {OPERATORS[hoveredOp].explanation}
          </div>
        </div>
      )}

      {/* EXPLOIT EXAMPLE */}
      <div style={{
        ...glassStyle,
        padding: 14,
        borderRadius: 8,
        border: '2px solid rgba(239, 68, 68, 0.5)',
        background: 'rgba(239, 68, 68, 0.05)',
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#ef4444',
          marginBottom: 8,
          fontFamily: 'monospace',
        }}>
          EXPLOIT: circuit без constraint принимает ложные proofs
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* Vulnerable */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              fontSize: 10,
              color: '#ef4444',
              fontWeight: 700,
              marginBottom: 4,
              fontFamily: 'monospace',
            }}>
              VULNERABLE (no constraint):
            </div>
            <div style={{
              ...glassStyle,
              padding: 10,
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              lineHeight: 1.6,
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <div style={{ color: colors.textMuted }}>{'// BUG: no constraint!'}</div>
              <div><span style={{ color: '#ef4444' }}>c {'<--'} a * b;</span></div>
              <div style={{ color: colors.textMuted }}>{'// Prover sets c = 999'}</div>
              <div style={{ color: colors.textMuted }}>{'// Verifier ACCEPTS!'}</div>
            </div>
          </div>

          {/* Correct */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              fontSize: 10,
              color: '#10b981',
              fontWeight: 700,
              marginBottom: 4,
              fontFamily: 'monospace',
            }}>
              CORRECT (with constraint):
            </div>
            <div style={{
              ...glassStyle,
              padding: 10,
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              lineHeight: 1.6,
              border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{ color: colors.textMuted }}>{'// SAFE: assignment + constraint'}</div>
              <div><span style={{ color: '#10b981' }}>c {'<=='} a * b;</span></div>
              <div style={{ color: colors.textMuted }}>{'// Prover sets c = 999?'}</div>
              <div style={{ color: colors.textMuted }}>{'// Verifier REJECTS!'}</div>
            </div>
          </div>
        </div>
      </div>

      <DataBox
        label="Правило #1"
        value="ВСЕГДА используйте <== (safe). Используйте <-- ТОЛЬКО для non-quadratic expressions (sqrt, division), и НЕМЕДЛЕННО добавляйте === constraint. Каждый <-- без === -- потенциальная уязвимость."
        variant="warning"
      />
    </DiagramContainer>
  );
}
