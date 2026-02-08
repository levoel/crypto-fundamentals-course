/**
 * Anchor Development Diagrams (SOL-07)
 *
 * Exports:
 * - AccountLifecycleDiagram: 5-step account lifecycle (init -> fund -> use -> realloc -> close) with step-through
 * - ConstraintValidationDiagram: 7-step constraint validation flow (discriminator through all checks)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

function navBtnStyle(enabled: boolean, accentColor: string): React.CSSProperties {
  return {
    ...glassStyle,
    padding: '8px 20px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    color: enabled ? accentColor : colors.textMuted,
    fontSize: 13,
    opacity: enabled ? 1 : 0.5,
    border: `1px solid ${enabled ? accentColor + '50' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 8,
    background: enabled ? accentColor + '10' : 'rgba(255,255,255,0.03)',
  };
}

/* ================================================================== */
/*  AccountLifecycleDiagram                                             */
/* ================================================================== */

interface LifecycleStep {
  phase: string;
  title: string;
  constraint: string;
  description: string;
  code: string;
  state: {
    exists: boolean;
    data: string;
    lamports: string;
    owner: string;
  };
  color: string;
}

const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    phase: '0. До создания',
    title: 'Аккаунт не существует',
    constraint: '(нет)',
    description: 'PDA-адрес вычислен, но на блокчейне нет аккаунта. Это просто математический адрес.',
    code: '// PDA = findProgramAddress(\n//   [b"counter", authority],\n//   program_id\n// )',
    state: { exists: false, data: '-', lamports: '0', owner: 'System Program' },
    color: colors.textMuted,
  },
  {
    phase: '1. Init (создание)',
    title: 'Создание и инициализация',
    constraint: '#[account(init, payer, space, seeds, bump)]',
    description: 'Anchor вызывает System Program через CPI: создает аккаунт, выделяет space байт, переводит lamports для rent-exemption, назначает owner = наша программа. Затем записывает 8-байтный discriminator.',
    code: '#[account(\n  init,\n  payer = authority,\n  space = Counter::SPACE,  // 49\n  seeds = [b"counter", authority.key().as_ref()],\n  bump,\n)]',
    state: { exists: true, data: '[disc|00..00] (49 bytes)', lamports: 'rent-exempt min', owner: 'course_counter' },
    color: colors.primary,
  },
  {
    phase: '2. Use (чтение/запись)',
    title: 'Использование аккаунта',
    constraint: '#[account(mut, seeds, bump, has_one)]',
    description: 'Anchor десериализует data, проверяет discriminator, seeds, bump, has_one. Handler получает mutable ссылку, изменяет поля. После handler Anchor сериализует данные обратно.',
    code: '#[account(\n  mut,\n  seeds = [b"counter", authority.key().as_ref()],\n  bump = counter.bump,\n  has_one = authority @ CourseError::Unauthorized,\n)]',
    state: { exists: true, data: '[disc|auth|count=N|bump]', lamports: 'rent-exempt min', owner: 'course_counter' },
    color: colors.success,
  },
  {
    phase: '3. Realloc (опционально)',
    title: 'Изменение размера',
    constraint: '#[account(mut, realloc, realloc::payer, realloc::zero)]',
    description: 'Если структура данных растет (например, добавлен вектор), Anchor может reallocate аккаунт. Payer доплачивает разницу в rent, или получает refund при уменьшении.',
    code: '#[account(\n  mut,\n  realloc = Counter::SPACE + extra,\n  realloc::payer = authority,\n  realloc::zero = true,\n)]',
    state: { exists: true, data: '[disc|auth|count|bump|...extra]', lamports: 'new rent-exempt', owner: 'course_counter' },
    color: colors.accent,
  },
  {
    phase: '4. Close (закрытие)',
    title: 'Закрытие аккаунта',
    constraint: '#[account(mut, close = authority)]',
    description: 'Anchor обнуляет все data (записывает нули), переводит все lamports на target (authority). Аккаунт удаляется runtime в конце слота.',
    code: '#[account(\n  mut,\n  close = authority,\n  has_one = authority,\n)]',
    state: { exists: false, data: '[zeroed]', lamports: '0 (refunded)', owner: 'System Program' },
    color: '#f43f5e',
  },
];

/**
 * AccountLifecycleDiagram
 *
 * Step-through animation showing the full account lifecycle:
 * non-existent -> init -> use -> realloc -> close
 */
export function AccountLifecycleDiagram() {
  const [step, setStep] = useState(0);

  const current = LIFECYCLE_STEPS[step];

  return (
    <DiagramContainer title="Жизненный цикл аккаунта: init -> use -> close" color="blue">
      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
        {LIFECYCLE_STEPS.map((s, i) => {
          const isActive = i === step;
          const isPast = i < step;
          return (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                flex: 1,
                padding: '8px 6px',
                ...glassStyle,
                background: isActive ? `${s.color}20` : isPast ? `${s.color}08` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? s.color : isPast ? s.color + '30' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? s.color : isPast ? s.color + 'aa' : colors.textMuted,
              }}>
                {s.phase}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current step title */}
      <div style={{ fontSize: 16, fontWeight: 600, color: current.color, marginBottom: 8 }}>
        {current.title}
      </div>

      {/* Constraint */}
      {current.constraint !== '(нет)' && (
        <div style={{
          ...glassStyle,
          padding: 10,
          background: `${current.color}08`,
          border: `1px solid ${current.color}25`,
          marginBottom: 10,
        }}>
          <pre style={{
            margin: 0,
            fontSize: 12,
            fontFamily: 'monospace',
            color: current.color,
            whiteSpace: 'pre-wrap',
          }}>
            {current.code}
          </pre>
        </div>
      )}

      {/* Description */}
      <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.6, marginBottom: 14 }}>
        {current.description}
      </div>

      {/* Account state panel */}
      <div style={{
        ...glassStyle,
        padding: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          Состояние аккаунта:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: 'exists', value: current.state.exists ? 'true' : 'false', c: current.state.exists ? colors.success : '#f43f5e' },
            { label: 'owner', value: current.state.owner, c: colors.accent },
            { label: 'data', value: current.state.data, c: colors.primary },
            { label: 'lamports', value: current.state.lamports, c: colors.success },
          ].map((f) => (
            <div key={f.label} style={{
              ...glassStyle,
              padding: '6px 8px',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>{f.label}</div>
              <div style={{ fontSize: 11, color: f.c, fontFamily: 'monospace', marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={navBtnStyle(step > 0, current.color)}
        >
          Назад
        </button>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace', alignSelf: 'center' }}>
          {step + 1} / {LIFECYCLE_STEPS.length}
        </span>
        <button
          onClick={() => setStep((s) => Math.min(LIFECYCLE_STEPS.length - 1, s + 1))}
          disabled={step >= LIFECYCLE_STEPS.length - 1}
          style={navBtnStyle(step < LIFECYCLE_STEPS.length - 1, current.color)}
        >
          Далее
        </button>
      </div>

      {step >= LIFECYCLE_STEPS.length - 1 && (
        <DataBox
          label="Полный цикл"
          value="init (создать + выделить + назначить owner) -> use (читать/писать) -> close (обнулить + вернуть lamports)"
          variant="highlight"
        />
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ConstraintValidationDiagram                                         */
/* ================================================================== */

interface ValidationStep {
  order: number;
  name: string;
  check: string;
  pass: string;
  fail: string;
  color: string;
}

const VALIDATION_STEPS: ValidationStep[] = [
  {
    order: 1,
    name: 'Discriminator',
    check: 'Первые 8 байт account.data == SHA-256("account:Counter")[:8]',
    pass: 'Тип аккаунта подтвержден -- это действительно Counter',
    fail: 'AccountDiscriminatorMismatch -- чужой тип аккаунта',
    color: colors.primary,
  },
  {
    order: 2,
    name: 'Owner',
    check: 'account.owner == course_counter program_id',
    pass: 'Аккаунт принадлежит нашей программе',
    fail: 'AccountOwnedByWrongProgram -- аккаунт от другой программы',
    color: colors.accent,
  },
  {
    order: 3,
    name: 'Seeds + Bump',
    check: 'create_program_address([b"counter", authority.key(), bump]) == account.key()',
    pass: 'PDA-адрес совпадает с ожидаемым',
    fail: 'ConstraintSeeds -- неверный PDA (другие seeds или bump)',
    color: colors.success,
  },
  {
    order: 4,
    name: 'Signer',
    check: 'authority.is_signer == true',
    pass: 'Транзакция подписана authority',
    fail: 'MissingSigner -- аккаунт не подписал транзакцию',
    color: '#e879f9',
  },
  {
    order: 5,
    name: 'Mutable',
    check: 'account.is_writable == true',
    pass: 'Аккаунт помечен как writable в транзакции',
    fail: 'ConstraintMut -- аккаунт не помечен как writable',
    color: '#f59e0b',
  },
  {
    order: 6,
    name: 'has_one',
    check: 'counter.authority == authority.key()',
    pass: 'Поле authority в аккаунте совпадает с переданным signer',
    fail: 'CourseError::Unauthorized -- неверный authority',
    color: '#f43f5e',
  },
  {
    order: 7,
    name: 'Десериализация',
    check: 'BorshDeserialize::deserialize(account.data[8..])',
    pass: 'Данные успешно десериализованы в Counter { authority, count, bump }',
    fail: 'AccountDidNotDeserialize -- поврежденные данные',
    color: colors.primary,
  },
];

/**
 * ConstraintValidationDiagram
 *
 * Step-through showing the 7 validation checks Anchor performs when
 * processing #[account(mut, seeds, bump, has_one)] constraint.
 */
export function ConstraintValidationDiagram() {
  const [step, setStep] = useState(0);

  const current = VALIDATION_STEPS[step];

  return (
    <DiagramContainer title="Порядок валидации constraints" color="purple">
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
        {VALIDATION_STEPS.map((s, i) => {
          const isActive = i === step;
          const isPast = i < step;
          return (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: isActive ? s.color : isPast ? s.color + '60' : 'rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            />
          );
        })}
      </div>

      {/* Step header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `${current.color}20`,
          border: `2px solid ${current.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: current.color,
          fontFamily: 'monospace',
        }}>
          {current.order}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: current.color }}>
          {current.name}
        </div>
      </div>

      {/* Check expression */}
      <div style={{
        ...glassStyle,
        padding: 12,
        background: `${current.color}08`,
        border: `1px solid ${current.color}25`,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
          Проверка:
        </div>
        <pre style={{
          margin: 0,
          fontSize: 12,
          fontFamily: 'monospace',
          color: current.color,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}>
          {current.check}
        </pre>
      </div>

      {/* Pass / Fail outcomes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <div style={{
          ...glassStyle,
          padding: 10,
          background: `${colors.success}08`,
          border: `1px solid ${colors.success}20`,
        }}>
          <div style={{ fontSize: 10, color: colors.success, fontFamily: 'monospace', marginBottom: 4, fontWeight: 600 }}>
            PASS
          </div>
          <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
            {current.pass}
          </div>
        </div>
        <div style={{
          ...glassStyle,
          padding: 10,
          background: '#f43f5e08',
          border: '1px solid #f43f5e20',
        }}>
          <div style={{ fontSize: 10, color: '#f43f5e', fontFamily: 'monospace', marginBottom: 4, fontWeight: 600 }}>
            FAIL
          </div>
          <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
            {current.fail}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={navBtnStyle(step > 0, current.color)}
        >
          Назад
        </button>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace', alignSelf: 'center' }}>
          {step + 1} / {VALIDATION_STEPS.length}
        </span>
        <button
          onClick={() => setStep((s) => Math.min(VALIDATION_STEPS.length - 1, s + 1))}
          disabled={step >= VALIDATION_STEPS.length - 1}
          style={navBtnStyle(step < VALIDATION_STEPS.length - 1, current.color)}
        >
          Далее
        </button>
      </div>

      {step >= VALIDATION_STEPS.length - 1 && (
        <DataBox
          label="Все 7 проверок пройдены"
          value="Только после прохождения ВСЕХ constraint-проверок Anchor вызывает ваш handler. Любой сбой = автоматический revert."
          variant="highlight"
        />
      )}
    </DiagramContainer>
  );
}
