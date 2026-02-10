/**
 * Anchor Basics Diagrams (SOL-06)
 *
 * Exports:
 * - AnchorProgramStructureDiagram: Annotated Anchor program structure with macro highlights (click-based with DiagramTooltip)
 * - AnchorChecksTableDiagram: What Anchor checks automatically vs what requires manual validation (interactive table with DiagramTooltip)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
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
  tooltipRu: string;
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
    tooltipRu: '#[program] -- главный макрос Anchor. Он генерирует entrypoint программы, dispatch по дискриминатору инструкции (первые 8 байт SHA-256 от имени метода) и автоматическую десериализацию Context<T>.',
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
    tooltipRu: '#[derive(Accounts)] генерирует валидацию всех аккаунтов в контексте инструкции. Для каждого поля проверяется owner, discriminator, signer и constraint-выражения. Это устраняет ~70% уязвимостей.',
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
    tooltipRu: '#[account] определяет структуру данных аккаунта. Anchor генерирует Borsh (де)сериализацию и 8-байтный discriminator (SHA-256("account:Name")[:8]) для защиты от подмены типа аккаунта.',
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
    tooltipRu: '#[error_code] создает типизированные ошибки программы с кодами начиная с 6000. Каждая ошибка с #[msg("...")] попадает в IDL, что позволяет TypeScript клиенту показать пользователю понятное сообщение.',
  },
];

/**
 * AnchorProgramStructureDiagram
 *
 * Shows the four key Anchor macros and what code they generate.
 * Click on each macro to see generated code details.
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
            <DiagramTooltip key={i} content={m.tooltipRu}>
              <div>
                <button
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
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Target code */}
      <DiagramTooltip content={`Этот макрос применяется к ${current.macro === '#[program]' ? 'модулю программы' : current.macro === '#[derive(Accounts)]' ? 'структуре контекста инструкции' : current.macro === '#[account]' ? 'структуре данных аккаунта' : 'enum пользовательских ошибок'}. Anchor анализирует его на этапе компиляции и генерирует boilerplate-код.`}>
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
      </DiagramTooltip>

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
      <DiagramTooltip content="Anchor генерирует этот код на этапе компиляции через proc-макросы Rust. Разработчик пишет декларативные аннотации, а компилятор создает весь boilerplate: валидацию, (де)сериализацию, dispatch и error handling.">
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
      </DiagramTooltip>

      {/* Summary data box */}
      <DiagramTooltip content="Anchor-макросы устраняют типичные уязвимости Solana-программ: пропущенная проверка owner, неправильный discriminator, отсутствие проверки signer. Без Anchor разработчик должен писать все эти проверки вручную.">
        <DataBox
          label="Ключевой принцип"
          value="Anchor-макросы генерируют ~70% boilerplate: entrypoint, dispatch, (де)сериализацию, валидацию аккаунтов"
          variant="highlight"
        />
      </DiagramTooltip>
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
  tooltipRu: string;
}

const CHECKS: CheckItem[] = [
  {
    check: 'Account ownership',
    category: 'automatic',
    description: 'Проверка, что аккаунт принадлежит ожидаемой программе',
    anchor: 'Account<\'info, T> -- автоматически проверяет owner == program_id',
    consequence: 'Без проверки: чужая программа может подменить аккаунт',
    tooltipRu: 'Anchor автоматически проверяет, что owner аккаунта совпадает с program_id. Без этой проверки атакующий может передать аккаунт, принадлежащий другой программе, и обойти валидацию данных.',
  },
  {
    check: 'Discriminator (тип аккаунта)',
    category: 'automatic',
    description: 'Проверка 8-байтного дискриминатора -- аккаунт действительно Counter, а не другой тип',
    anchor: '#[account] генерирует SHA-256("account:Counter")[:8]',
    consequence: 'Без проверки: данные могут быть десериализованы неправильно',
    tooltipRu: 'Discriminator -- первые 8 байт SHA-256("account:TypeName"). Anchor проверяет его при каждом чтении аккаунта. Без дискриминатора атакующий может подставить аккаунт другого типа с теми же полями.',
  },
  {
    check: 'Signer verification',
    category: 'automatic',
    description: 'Проверка, что аккаунт подписал транзакцию',
    anchor: 'Signer<\'info> -- автоматическая проверка is_signer',
    consequence: 'Без проверки: кто угодно может вызвать привилегированную функцию',
    tooltipRu: 'Signer<\'info> проверяет, что аккаунт действительно подписал транзакцию (is_signer = true). Без этой проверки любой может вызвать административные функции (withdraw, update_authority) от чужого имени.',
  },
  {
    check: 'PDA derivation',
    category: 'automatic',
    description: 'Проверка, что адрес аккаунта совпадает с ожидаемым PDA',
    anchor: 'seeds = [...], bump -- проверяет create_program_address',
    consequence: 'Без проверки: атакующий может подставить произвольный аккаунт',
    tooltipRu: 'Constraint seeds = [...] и bump проверяют, что адрес аккаунта -- это PDA, вычисленный из указанных seeds. Без этой проверки атакующий может передать произвольный аккаунт вместо ожидаемого PDA.',
  },
  {
    check: 'Constraint expressions',
    category: 'automatic',
    description: 'Проверка has_one, address, constraint выражений',
    anchor: 'has_one = authority, constraint = counter.active',
    consequence: 'Без проверки: нарушение инвариантов данных',
    tooltipRu: 'has_one = authority проверяет, что поле authority в аккаунте совпадает с переданным аккаунтом. constraint = expr позволяет добавить произвольные проверки. Anchor выполняет их автоматически перед вызовом handler.',
  },
  {
    check: 'Init / mut / close lifecycle',
    category: 'automatic',
    description: 'Создание, мутабельность и закрытие аккаунтов',
    anchor: 'init -> CPI к System Program; mut -> persist changes; close -> zero + lamports',
    consequence: 'Без проверки: двойное создание, потеря данных, утечка lamports',
    tooltipRu: 'init создает аккаунт через CPI к System Program. mut сохраняет изменения после выполнения handler. close обнуляет data, переводит lamports и устанавливает discriminator в закрытый. Без close возможна утечка lamports.',
  },
  {
    check: 'Business logic',
    category: 'manual',
    description: 'Корректность вычислений, переполнение, логика приложения',
    anchor: 'require!(), checked_add(), if/else в handler',
    consequence: 'Anchor валидирует АККАУНТЫ, но не вашу ЛОГИКУ',
    tooltipRu: 'Anchor не проверяет бизнес-логику -- это ответственность разработчика. require!() для условий, checked_add()/checked_sub() для арифметики. Anchor валидирует аккаунты, но не ваши вычисления.',
  },
  {
    check: 'remaining_accounts',
    category: 'manual',
    description: 'Дополнительные аккаунты, не описанные в #[derive(Accounts)]',
    anchor: 'ctx.remaining_accounts -- НУЛЕВАЯ защита от Anchor',
    consequence: 'Атакующий может передать произвольные аккаунты',
    tooltipRu: 'remaining_accounts -- аккаунты, переданные сверх описанных в #[derive(Accounts)]. Anchor не проверяет их owner, discriminator или signer. Каждый remaining_account нужно валидировать вручную.',
  },
  {
    check: 'Post-CPI data freshness',
    category: 'manual',
    description: 'После CPI данные в десериализованных аккаунтах могут быть устаревшими',
    anchor: 'account.reload() после CPI',
    consequence: 'Использование stale данных -> неверные решения',
    tooltipRu: 'После CPI-вызова данные в десериализованных аккаунтах могут быть устаревшими -- целевая программа могла их изменить. Вызовите account.reload() после CPI для получения актуальных данных.',
  },
  {
    check: 'CPI target program',
    category: 'manual',
    description: 'Проверка, что CPI вызывает ожидаемую программу, а не подмену',
    anchor: 'Program<\'info, T> для CPI target или ручная проверка program_id',
    consequence: 'Confused deputy attack -- вызов вредоносной программы',
    tooltipRu: 'Без проверки program_id целевой программы возможен confused deputy attack: атакующий подставляет вредоносную программу вместо System Program или Token Program. Используйте Program<\'info, T> для автопроверки.',
  },
  {
    check: 'Arithmetic overflow',
    category: 'manual',
    description: 'Rust в release mode не проверяет overflow по умолчанию',
    anchor: 'checked_add(), checked_mul(), checked_sub()',
    consequence: 'Тихое переполнение -> некорректные балансы/счетчики',
    tooltipRu: 'В release mode Rust не проверяет арифметическое переполнение -- u64::MAX + 1 тихо станет 0. Используйте checked_add(), checked_sub(), checked_mul() или saturating_* методы для безопасной арифметики.',
  },
  {
    check: 'Cross-instruction consistency',
    category: 'manual',
    description: 'Состояние между инструкциями в одной транзакции',
    anchor: 'Ручные проверки в handler или require!() с перечитыванием',
    consequence: 'Flash loan атаки, front-running внутри транзакции',
    tooltipRu: 'В одной транзакции Solana можно вызвать несколько инструкций. Состояние между ними может измениться. Flash loan атаки используют это: занимают токены в первой инструкции, используют во второй, возвращают в третьей.',
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

  const filtered = filter === 'all' ? CHECKS : CHECKS.filter((c) => c.category === filter);

  const autoCount = CHECKS.filter((c) => c.category === 'automatic').length;
  const manualCount = CHECKS.filter((c) => c.category === 'manual').length;

  return (
    <DiagramContainer title="Anchor: автоматические vs ручные проверки" color="emerald">
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([
          { key: 'all' as const, label: `Все (${CHECKS.length})`, color: colors.text, tooltipRu: 'Показать все проверки: автоматические (Anchor) и ручные (разработчик). Всего 11 категорий проверок безопасности.' },
          { key: 'automatic' as const, label: `Автоматические (${autoCount})`, color: colors.success, tooltipRu: 'Anchor выполняет эти проверки автоматически при десериализации контекста. Разработчику нужно только правильно определить типы полей.' },
          { key: 'manual' as const, label: `Ручные (${manualCount})`, color: '#f59e0b', tooltipRu: 'Эти проверки разработчик должен реализовать самостоятельно в handler. Anchor не может автоматизировать проверку бизнес-логики.' },
        ]).map((f) => {
          const isActive = filter === f.key;
          return (
            <DiagramTooltip key={f.key} content={f.tooltipRu}>
              <div>
                <button
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
              </div>
            </DiagramTooltip>
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
        const isAuto = item.category === 'automatic';
        const catColor = isAuto ? colors.success : '#f59e0b';

        return (
          <DiagramTooltip key={i} content={item.tooltipRu}>
            <div
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
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s',
              }}>
                {i + 1}
              </div>
              <div style={{
                ...glassStyle,
                padding: '8px 10px',
                fontSize: 12,
                color: colors.textMuted,
                fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.02)',
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
                background: `${catColor}05`,
                transition: 'all 0.15s',
              }}>
                {isAuto ? 'Anchor (auto)' : 'Developer (manual)'}
              </div>
            </div>
          </DiagramTooltip>
        );
      })}

      {/* Summary */}
      <DiagramTooltip content={`Anchor покрывает ${autoCount} категорий проверок автоматически. Оставшиеся ${manualCount} -- ответственность разработчика. Ключевое правило: Anchor валидирует аккаунты, но не бизнес-логику.`}>
        <DataBox
          label="Ключевой вывод"
          value={`Anchor проверяет ${autoCount} аспектов автоматически. ${manualCount} аспектов требуют ручной проверки в handler. Не путайте валидацию аккаунтов с валидацией логики.`}
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
