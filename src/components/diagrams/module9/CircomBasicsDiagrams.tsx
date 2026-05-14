/** @jsxImportSource solid-js */
/**
 * Circom Basics Diagrams (ZK-07)
 *
 * Exports:
 * - CircomAnatomyDiagram: Annotated Multiplier2 circuit code with callouts
 * - ConstraintOperatorsDiagram: Operator comparison table with exploit example
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
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
  return (
    <DiagramContainer title="Анатомия Circom: template, signals, constraints" color="blue">
      {/* Code block */}
      <div style={{
        ...glassStyle,
        'padding': '16px',
        'border-radius': '8px',
        'border': '1px solid rgba(255,255,255,0.08)',
        'margin-bottom': '12px',
        'font-family': 'monospace',
        'font-size': '12px',
        'line-height': '1.8',
      }}>
        {ANNOTATED_CODE.map((item, i) => (
          item.annotation ? (
            <DiagramTooltip content={item.annotation}>
              <div
                style={{
                  'padding': '2px 8px',
                  'border-radius': '4px',
                  'border-left': `3px solid ${item.color}`,
                  'cursor': 'help',
                }}
              >
                <span style={{ 'color': item.color }}>{item.line}</span>
              </div>
            </DiagramTooltip>
          ) : (
            <div
              style={{
                'padding': '2px 8px',
                'border-radius': '4px',
                'border-left': '3px solid transparent',
              }}
            >
              <span style={{ 'color': item.color }}>{item.line}</span>
            </div>
          )
        ))}
      </div>

      {/* Signal types legend */}
      <div style={{ 'display': 'flex', 'gap': '12px', 'flex-wrap': 'wrap', 'margin-bottom': '12px' }}>
        {[
          { label: 'signal input', color: '#10b981', desc: 'Приватный вход (prover)', tooltip: 'Input signals — приватные входные данные, которые знает только prover. Verifier не видит их значения, но может проверить корректность вычислений через proof.' },
          { label: 'signal output', color: '#f59e0b', desc: 'Публичный выход (verifier)', tooltip: 'Output signals — публичные значения, видимые verifier. Это результат вычисления, который можно проверить без знания приватных входов.' },
          { label: 'signal (intermediate)', color: '#6366f1', desc: 'Промежуточное значение', tooltip: 'Промежуточные сигналы хранят результаты частичных вычислений внутри circuit. Они нужны для flattening: разбиения сложных выражений на элементарные R1CS-ограничения.' },
        ].map((s) => (
          <DiagramTooltip content={s.tooltip}>
            <div style={{
              ...glassStyle,
              'padding': '6px 10px',
              'border-radius': '6px',
              'border': `1px solid ${s.color}30`,
              'font-size': '10px',
              'font-family': 'monospace',
            }}>
              <span style={{ 'color': s.color, 'font-weight': '600' }}>{s.label}</span>
              <span style={{ 'color': colors.textMuted, 'margin-left': '6px' }}>{s.desc}</span>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DiagramTooltip content="Template в Circom — аналог class в ООП. Описывает сигналы (inputs/outputs) и ограничения (constraints). component main = Template() создает конкретный экземпляр для генерации proof.">
        <DataBox
          label="Template"
          value="Template -- как class в OOP: описывает signals и constraints. component main = Template() создает конкретный instance. Каждый template может быть параметризован (например, Multiplier(N))."
          variant="info"
        />
      </DiagramTooltip>
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
  return (
    <DiagramContainer title="Операторы Circom: <== (safe) vs <-- (dangerous)" color="red">
      {/* Operator table */}
      <div style={{ 'overflow-x': 'auto', 'margin-bottom': '14px' }}>
        <table style={{
          'width': '100%',
          'border-collapse': 'collapse',
          'font-size': '12px',
          'font-family': 'monospace',
        }}>
          <thead>
            <tr>
              {['Оператор', 'Действие', 'Безопасность', 'Пример'].map((h) => (
                <th style={{
                  'padding': '8px 10px',
                  'text-align': 'left',
                  'font-size': '10px',
                  'color': colors.textMuted,
                  'border-bottom': '1px solid rgba(255,255,255,0.1)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OPERATORS.map((op, i) => (
              <tr
                style={{
                  'cursor': 'help',
                }}
              >
                <td style={{
                  'padding': '8px 10px',
                  'font-weight': '700',
                  'font-size': '14px',
                  'color': op.safetyColor,
                  'border-bottom': '1px solid rgba(255,255,255,0.05)',
                }}>
                  <DiagramTooltip content={op.explanation}>
                    <span>{op.operator}</span>
                  </DiagramTooltip>
                </td>
                <td style={{
                  'padding': '8px 10px',
                  'color': colors.text,
                  'font-size': '11px',
                  'border-bottom': '1px solid rgba(255,255,255,0.05)',
                  'line-height': '1.4',
                }}>
                  {op.does}
                </td>
                <td style={{
                  'padding': '8px 10px',
                  'border-bottom': '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{
                    'padding': '2px 8px',
                    'border-radius': '4px',
                    'font-size': '10px',
                    'font-weight': '700',
                    'color': op.safetyColor,
                    'background': `${op.safetyColor}15`,
                    'border': `1px solid ${op.safetyColor}30`,
                  }}>
                    {op.safety}
                  </span>
                </td>
                <td style={{
                  'padding': '8px 10px',
                  'color': colors.text,
                  'font-size': '11px',
                  'border-bottom': '1px solid rgba(255,255,255,0.05)',
                }}>
                  {op.example}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EXPLOIT EXAMPLE */}
      <DiagramTooltip content="Under-constrained circuit — критическая уязвимость в ZK. Без constraint (===) prover может подставить произвольное значение, и verifier примет ложное доказательство. Это нарушает soundness — главное свойство proof system.">
        <div style={{
          ...glassStyle,
          'padding': '14px',
          'border-radius': '8px',
          'border': '2px solid rgba(239, 68, 68, 0.5)',
          'background': 'rgba(239, 68, 68, 0.05)',
          'margin-bottom': '12px',
        }}>
          <div style={{
            'font-size': '11px',
            'font-weight': '700',
            'color': '#ef4444',
            'margin-bottom': '8px',
            'font-family': 'monospace',
          }}>
            EXPLOIT: circuit без constraint принимает ложные proofs
          </div>

          <div style={{ 'display': 'flex', 'gap': '12px', 'flex-wrap': 'wrap' }}>
            {/* Vulnerable */}
            <div style={{ 'flex': '1', 'min-width': '200px' }}>
              <div style={{
                'font-size': '10px',
                'color': '#ef4444',
                'font-weight': '700',
                'margin-bottom': '4px',
                'font-family': 'monospace',
              }}>
                VULNERABLE (no constraint):
              </div>
              <div style={{
                ...glassStyle,
                'padding': '10px',
                'border-radius': '6px',
                'font-size': '11px',
                'font-family': 'monospace',
                'line-height': '1.6',
                'border': '1px solid rgba(239,68,68,0.2)',
              }}>
                <div style={{ 'color': colors.textMuted }}>{'// BUG: no constraint!'}</div>
                <div><span style={{ 'color': '#ef4444' }}>c {'<--'} a * b;</span></div>
                <div style={{ 'color': colors.textMuted }}>{'// Prover sets c = 999'}</div>
                <div style={{ 'color': colors.textMuted }}>{'// Verifier ACCEPTS!'}</div>
              </div>
            </div>

            {/* Correct */}
            <div style={{ 'flex': '1', 'min-width': '200px' }}>
              <div style={{
                'font-size': '10px',
                'color': '#10b981',
                'font-weight': '700',
                'margin-bottom': '4px',
                'font-family': 'monospace',
              }}>
                CORRECT (with constraint):
              </div>
              <div style={{
                ...glassStyle,
                'padding': '10px',
                'border-radius': '6px',
                'font-size': '11px',
                'font-family': 'monospace',
                'line-height': '1.6',
                'border': '1px solid rgba(16,185,129,0.2)',
              }}>
                <div style={{ 'color': colors.textMuted }}>{'// SAFE: assignment + constraint'}</div>
                <div><span style={{ 'color': '#10b981' }}>c {'<=='} a * b;</span></div>
                <div style={{ 'color': colors.textMuted }}>{'// Prover sets c = 999?'}</div>
                <div style={{ 'color': colors.textMuted }}>{'// Verifier REJECTS!'}</div>
              </div>
            </div>
          </div>
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="Золотое правило Circom: оператор <== объединяет присвоение и constraint в одну безопасную операцию. Оператор <-- без === — потенциальная уязвимость, нарушающая soundness proof system.">
        <DataBox
          label="Правило #1"
          value="ВСЕГДА используйте <== (safe). Используйте <-- ТОЛЬКО для non-quadratic expressions (sqrt, division), и НЕМЕДЛЕННО добавляйте === constraint. Каждый <-- без === -- потенциальная уязвимость."
          variant="warning"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
