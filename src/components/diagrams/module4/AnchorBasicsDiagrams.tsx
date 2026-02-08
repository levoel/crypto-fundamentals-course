/**
 * Anchor Basics Diagrams (SOL-06)
 *
 * Exports:
 * - AnchorProgramStructureDiagram: Annotated Anchor program structure with macro highlights (static with hover)
 * - AnchorChecksTableDiagram: What Anchor checks automatically vs what requires manual validation (interactive table)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  AnchorProgramStructureDiagram                                       */
/* ================================================================== */

interface MacroAnnotation {
  macro: string;
  target: string;
  description: string;
  generates: string[];
  color: string;
}

const MACRO_ANNOTATIONS: MacroAnnotation[] = [
  {
    macro: '#[program]',
    target: 'mod course_counter { ... }',
    description: 'Точка входа программы. Генерирует entrypoint, dispatch по instruction discriminator, десериализацию аккаунтов.',
    generates: [
      'entrypoint!(process_instruction)',
      'Dispatch: первые 8 байт instruction_data -> SHA-256("global:<fn_name>")[:8]',
      'Десериализация Context<T> для каждой инструкции',
      'Сериализация результатов обратно в account.data',
    ],
    color: colors.primary,
  },
  {
    macro: '#[derive(Accounts)]',
    target: 'struct Initialize<\'info> { ... }',
    description: 'Валидация аккаунтов. Генерирует проверки ownership, discriminator, signer, constraints для каждого поля.',
    generates: [
      'Проверка owner для Account<T> (программа владеет аккаунтом)',
      'Проверка 8-байтного discriminator (SHA-256("account:<Name>")[:8])',
      'Проверка подписи для Signer<\'info>',
      'Выполнение constraint-выражений (seeds, bump, has_one, mut)',
    ],
    color: colors.accent,
  },
  {
    macro: '#[account]',
    target: 'struct Counter { authority, count, bump }',
    description: 'Определение данных аккаунта. Генерирует Borsh (де)сериализацию и 8-байтный discriminator.',
    generates: [
      'impl BorshSerialize + BorshDeserialize для Counter',
      'DISCRIMINATOR = SHA-256("account:Counter")[:8]',
      'Автоматическая запись discriminator при init',
      'Проверка discriminator при каждом чтении',
    ],
    color: colors.success,
  },
  {
    macro: '#[error_code]',
    target: 'enum CourseError { Unauthorized, Overflow }',
    description: 'Пользовательские ошибки. Генерирует коды ошибок начиная с 6000 и читаемые сообщения.',
    generates: [
      'Unauthorized = 6000, Overflow = 6001',
      'Каждый #[msg("...")] становится error message',
      'impl From<CourseError> for anchor_lang::error::Error',
      'TypeScript клиент получает типизированные ошибки через IDL',
    ],
    color: '#e879f9',
  },
];

/**
 * AnchorProgramStructureDiagram
 *
 * Shows the four key Anchor macros and what code they generate.
 * Hover over each macro to see generated code details.
 */
export function AnchorProgramStructureDiagram() {
  const [selectedMacro, setSelectedMacro] = useState<number>(0);

  const current = MACRO_ANNOTATIONS[selectedMacro];

  return (
    <DiagramContainer title="Структура Anchor-программы: макросы" color="blue">
      {/* Macro selector tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {MACRO_ANNOTATIONS.map((m, i) => {
          const isActive = i === selectedMacro;
          return (
            <button
              key={i}
              onClick={() => setSelectedMacro(i)}
              style={{
                ...glassStyle,
                padding: '8px 14px',
                cursor: 'pointer',
                background: isActive ? `${m.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? m.color : 'rgba(255,255,255,0.08)'}`,
                color: isActive ? m.color : colors.textMuted,
                fontSize: 13,
                fontFamily: 'monospace',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {m.macro}
            </button>
          );
        })}
      </div>

      {/* Target code */}
      <div style={{
        ...glassStyle,
        padding: 14,
        background: `${current.color}08`,
        border: `1px solid ${current.color}30`,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
          Применяется к:
        </div>
        <pre style={{
          margin: 0,
          fontSize: 13,
          fontFamily: 'monospace',
          color: current.color,
          whiteSpace: 'pre-wrap',
        }}>
          {current.target}
        </pre>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: colors.text,
        lineHeight: 1.6,
        marginBottom: 14,
      }}>
        {current.description}
      </div>

      {/* Generated code list */}
      <div style={{
        ...glassStyle,
        padding: 14,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          Что генерирует компилятор:
        </div>
        {current.generates.map((g, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: 11,
              color: current.color,
              fontFamily: 'monospace',
              flexShrink: 0,
              marginTop: 2,
            }}>
              {i + 1}.
            </span>
            <span style={{
              fontSize: 12,
              color: colors.text,
              fontFamily: 'monospace',
              lineHeight: 1.5,
            }}>
              {g}
            </span>
          </div>
        ))}
      </div>

      {/* Summary data box */}
      <DataBox
        label="Ключевой принцип"
        value="Anchor-макросы генерируют ~70% boilerplate: entrypoint, dispatch, (де)сериализацию, валидацию аккаунтов"
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AnchorChecksTableDiagram                                            */
/* ================================================================== */

interface CheckItem {
  check: string;
  category: 'automatic' | 'manual';
  description: string;
  anchor: string;
  consequence: string;
}

const CHECKS: CheckItem[] = [
  {
    check: 'Account ownership',
    category: 'automatic',
    description: 'Проверка, что аккаунт принадлежит ожидаемой программе',
    anchor: 'Account<\'info, T> -- автоматически проверяет owner == program_id',
    consequence: 'Без проверки: чужая программа может подменить аккаунт',
  },
  {
    check: 'Discriminator (тип аккаунта)',
    category: 'automatic',
    description: 'Проверка 8-байтного дискриминатора -- аккаунт действительно Counter, а не другой тип',
    anchor: '#[account] генерирует SHA-256("account:Counter")[:8]',
    consequence: 'Без проверки: данные могут быть десериализованы неправильно',
  },
  {
    check: 'Signer verification',
    category: 'automatic',
    description: 'Проверка, что аккаунт подписал транзакцию',
    anchor: 'Signer<\'info> -- автоматическая проверка is_signer',
    consequence: 'Без проверки: кто угодно может вызвать привилегированную функцию',
  },
  {
    check: 'PDA derivation',
    category: 'automatic',
    description: 'Проверка, что адрес аккаунта совпадает с ожидаемым PDA',
    anchor: 'seeds = [...], bump -- проверяет create_program_address',
    consequence: 'Без проверки: атакующий может подставить произвольный аккаунт',
  },
  {
    check: 'Constraint expressions',
    category: 'automatic',
    description: 'Проверка has_one, address, constraint выражений',
    anchor: 'has_one = authority, constraint = counter.active',
    consequence: 'Без проверки: нарушение инвариантов данных',
  },
  {
    check: 'Init / mut / close lifecycle',
    category: 'automatic',
    description: 'Создание, мутабельность и закрытие аккаунтов',
    anchor: 'init -> CPI к System Program; mut -> persist changes; close -> zero + lamports',
    consequence: 'Без проверки: двойное создание, потеря данных, утечка lamports',
  },
  {
    check: 'Business logic',
    category: 'manual',
    description: 'Корректность вычислений, переполнение, логика приложения',
    anchor: 'require!(), checked_add(), if/else в handler',
    consequence: 'Anchor валидирует АККАУНТЫ, но не вашу ЛОГИКУ',
  },
  {
    check: 'remaining_accounts',
    category: 'manual',
    description: 'Дополнительные аккаунты, не описанные в #[derive(Accounts)]',
    anchor: 'ctx.remaining_accounts -- НУЛЕВАЯ защита от Anchor',
    consequence: 'Атакующий может передать произвольные аккаунты',
  },
  {
    check: 'Post-CPI data freshness',
    category: 'manual',
    description: 'После CPI данные в десериализованных аккаунтах могут быть устаревшими',
    anchor: 'account.reload() после CPI',
    consequence: 'Использование stale данных -> неверные решения',
  },
  {
    check: 'CPI target program',
    category: 'manual',
    description: 'Проверка, что CPI вызывает ожидаемую программу, а не подмену',
    anchor: 'Program<\'info, T> для CPI target или ручная проверка program_id',
    consequence: 'Confused deputy attack -- вызов вредоносной программы',
  },
  {
    check: 'Arithmetic overflow',
    category: 'manual',
    description: 'Rust в release mode не проверяет overflow по умолчанию',
    anchor: 'checked_add(), checked_mul(), checked_sub()',
    consequence: 'Тихое переполнение -> некорректные балансы/счетчики',
  },
  {
    check: 'Cross-instruction consistency',
    category: 'manual',
    description: 'Состояние между инструкциями в одной транзакции',
    anchor: 'Ручные проверки в handler или require!() с перечитыванием',
    consequence: 'Flash loan атаки, front-running внутри транзакции',
  },
];

/**
 * AnchorChecksTableDiagram
 *
 * Interactive table showing what Anchor validates automatically (ownership, discriminator,
 * signer, PDA, constraints) vs what the developer must check manually (business logic,
 * remaining_accounts, post-CPI freshness, CPI target, overflow).
 */
export function AnchorChecksTableDiagram() {
  const [filter, setFilter] = useState<'all' | 'automatic' | 'manual'>('all');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const filtered = filter === 'all' ? CHECKS : CHECKS.filter((c) => c.category === filter);

  const autoCount = CHECKS.filter((c) => c.category === 'automatic').length;
  const manualCount = CHECKS.filter((c) => c.category === 'manual').length;

  return (
    <DiagramContainer title="Anchor: автоматические vs ручные проверки" color="emerald">
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([
          { key: 'all' as const, label: `Все (${CHECKS.length})`, color: colors.text },
          { key: 'automatic' as const, label: `Автоматические (${autoCount})`, color: colors.success },
          { key: 'manual' as const, label: `Ручные (${manualCount})`, color: '#f59e0b' },
        ]).map((f) => {
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                ...glassStyle,
                padding: '6px 14px',
                cursor: 'pointer',
                background: isActive ? `${f.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? f.color : 'rgba(255,255,255,0.08)'}`,
                color: isActive ? f.color : colors.textMuted,
                fontSize: 12,
                fontFamily: 'monospace',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr 200px',
        gap: 2,
        marginBottom: 2,
      }}>
        <div style={{ ...glassStyle, padding: '6px 8px', fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>
          #
        </div>
        <div style={{ ...glassStyle, padding: '6px 10px', fontSize: 11, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace' }}>
          Проверка
        </div>
        <div style={{ ...glassStyle, padding: '6px 10px', fontSize: 11, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center' }}>
          Кто проверяет
        </div>
      </div>

      {/* Rows */}
      {filtered.map((item, i) => {
        const isHovered = hoveredRow === i;
        const isAuto = item.category === 'automatic';
        const catColor = isAuto ? colors.success : '#f59e0b';

        return (
          <div key={i}>
            <div
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr 200px',
                gap: 2,
                marginBottom: 2,
                cursor: 'pointer',
              }}
            >
              <div style={{
                ...glassStyle,
                padding: '8px 4px',
                fontSize: 10,
                color: catColor,
                fontFamily: 'monospace',
                textAlign: 'center',
                background: isHovered ? `${catColor}10` : 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s',
              }}>
                {i + 1}
              </div>
              <div style={{
                ...glassStyle,
                padding: '8px 10px',
                fontSize: 12,
                color: isHovered ? colors.text : colors.textMuted,
                fontFamily: 'monospace',
                background: isHovered ? `${catColor}08` : 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s',
              }}>
                {item.check}
              </div>
              <div style={{
                ...glassStyle,
                padding: '8px 10px',
                fontSize: 11,
                color: catColor,
                fontFamily: 'monospace',
                fontWeight: 600,
                textAlign: 'center',
                background: isHovered ? `${catColor}15` : `${catColor}05`,
                transition: 'all 0.15s',
              }}>
                {isAuto ? 'Anchor (auto)' : 'Developer (manual)'}
              </div>
            </div>

            {/* Detail panel on hover */}
            {isHovered && (
              <div style={{
                ...glassStyle,
                padding: 12,
                marginBottom: 4,
                background: `${catColor}08`,
                border: `1px solid ${catColor}20`,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5 }}>
                  {item.description}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: catColor }}>
                  Anchor: {item.anchor}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#f43f5e' }}>
                  Риск: {item.consequence}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <DataBox
        label="Ключевой вывод"
        value={`Anchor проверяет ${autoCount} аспектов автоматически. ${manualCount} аспектов требуют ручной проверки в handler. Не путайте валидацию аккаунтов с валидацией логики.`}
        variant="highlight"
      />
    </DiagramContainer>
  );
}
