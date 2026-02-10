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
import { DiagramTooltip } from '@primitives/Tooltip';
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
  tooltip: string;
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
    tooltip: 'PDA (Program Derived Address) вычисляется детерминированно из seeds и program ID. Аккаунт ещё не существует на блокчейне — это лишь математически выведенный адрес, готовый к инициализации.',
  },
  {
    phase: '1. Init (создание)',
    title: 'Создание и инициализация',
    constraint: '#[account(init, payer, space, seeds, bump)]',
    description: 'Anchor вызывает System Program через CPI: создает аккаунт, выделяет space байт, переводит lamports для rent-exemption, назначает owner = наша программа. Затем записывает 8-байтный discriminator.',
    code: '#[account(\n  init,\n  payer = authority,\n  space = Counter::SPACE,  // 49\n  seeds = [b"counter", authority.key().as_ref()],\n  bump,\n)]',
    state: { exists: true, data: '[disc|00..00] (49 bytes)', lamports: 'rent-exempt min', owner: 'course_counter' },
    color: colors.primary,
    tooltip: 'Init выполняет 3 операции через CPI в System Program: allocate (выделение space байт), assign (назначение owner = программа), transfer (перевод lamports для rent-exemption). Затем Anchor записывает 8-байтный discriminator в начало data.',
  },
  {
    phase: '2. Use (чтение/запись)',
    title: 'Использование аккаунта',
    constraint: '#[account(mut, seeds, bump, has_one)]',
    description: 'Anchor десериализует data, проверяет discriminator, seeds, bump, has_one. Handler получает mutable ссылку, изменяет поля. После handler Anchor сериализует данные обратно.',
    code: '#[account(\n  mut,\n  seeds = [b"counter", authority.key().as_ref()],\n  bump = counter.bump,\n  has_one = authority @ CourseError::Unauthorized,\n)]',
    state: { exists: true, data: '[disc|auth|count=N|bump]', lamports: 'rent-exempt min', owner: 'course_counter' },
    color: colors.success,
    tooltip: 'Use-фаза: Anchor загружает аккаунт, проверяет все constraints (discriminator, owner, seeds, bump, has_one), десериализует данные через Borsh. Handler изменяет поля, после чего Anchor автоматически сериализует обратно.',
  },
  {
    phase: '3. Realloc (опционально)',
    title: 'Изменение размера',
    constraint: '#[account(mut, realloc, realloc::payer, realloc::zero)]',
    description: 'Если структура данных растет (например, добавлен вектор), Anchor может reallocate аккаунт. Payer доплачивает разницу в rent, или получает refund при уменьшении.',
    code: '#[account(\n  mut,\n  realloc = Counter::SPACE + extra,\n  realloc::payer = authority,\n  realloc::zero = true,\n)]',
    state: { exists: true, data: '[disc|auth|count|bump|...extra]', lamports: 'new rent-exempt', owner: 'course_counter' },
    color: colors.accent,
    tooltip: 'Realloc позволяет динамически изменять размер аккаунта. При увеличении payer доплачивает разницу в rent. При уменьшении — получает refund. realloc::zero = true обнуляет новое пространство для безопасности.',
  },
  {
    phase: '4. Close (закрытие)',
    title: 'Закрытие аккаунта',
    constraint: '#[account(mut, close = authority)]',
    description: 'Anchor обнуляет все data (записывает нули), переводит все lamports на target (authority). Аккаунт удаляется runtime в конце слота.',
    code: '#[account(\n  mut,\n  close = authority,\n  has_one = authority,\n)]',
    state: { exists: false, data: '[zeroed]', lamports: '0 (refunded)', owner: 'System Program' },
    color: '#f43f5e',
    tooltip: 'Close обнуляет все данные аккаунта (предотвращает revival-атаки), переводит все lamports получателю и сбрасывает owner на System Program. Runtime удалит аккаунт в конце слота, когда баланс станет 0.',
  },
];

/** Tooltip for account state grid fields */
const STATE_FIELD_TOOLTIPS: Record<string, string> = {
  exists: 'Флаг существования аккаунта на блокчейне. false означает, что по данному адресу нет данных — аккаунт не создан или уже закрыт.',
  owner: 'Owner определяет, какая программа имеет право изменять данные аккаунта. При init owner назначается на вашу программу. Только owner может записывать данные.',
  data: 'Содержимое аккаунта: первые 8 байт — discriminator (SHA-256 от имени типа), далее — сериализованные через Borsh поля структуры.',
  lamports: 'Баланс аккаунта в lamports (1 SOL = 10^9 lamports). Для существования аккаунт должен содержать rent-exempt минимум, зависящий от размера data.',
};

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
            <DiagramTooltip key={i} content={s.tooltip}>
              <div
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
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Current step title */}
      <div style={{ fontSize: 16, fontWeight: 600, color: current.color, marginBottom: 8 }}>
        {current.title}
      </div>

      {/* Constraint */}
      {current.constraint !== '(нет)' && (
        <DiagramTooltip content={`Anchor-макрос для фазы "${current.phase}". Каждый атрибут (init, mut, seeds, bump, has_one, close) генерирует проверки, которые выполняются ДО вашего handler-кода.`}>
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
        </DiagramTooltip>
      )}

      {/* Description */}
      <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.6, marginBottom: 14 }}>
        {current.description}
      </div>

      {/* Account state panel */}
      <DiagramTooltip content="Состояние аккаунта на данном этапе жизненного цикла. Каждое поле (exists, owner, data, lamports) отражает текущее значение на блокчейне после выполнения инструкции.">
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
              <DiagramTooltip key={f.label} content={STATE_FIELD_TOOLTIPS[f.label]}>
                <div style={{
                  ...glassStyle,
                  padding: '6px 8px',
                  background: 'rgba(0,0,0,0.2)',
                }}>
                  <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: f.c, fontFamily: 'monospace', marginTop: 2 }}>{f.value}</div>
                </div>
              </DiagramTooltip>
            ))}
          </div>
        </div>
      </DiagramTooltip>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <DiagramTooltip content="Вернуться к предыдущей фазе жизненного цикла аккаунта.">
          <div>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={navBtnStyle(step > 0, current.color)}
            >
              Назад
            </button>
          </div>
        </DiagramTooltip>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace', alignSelf: 'center' }}>
          {step + 1} / {LIFECYCLE_STEPS.length}
        </span>
        <DiagramTooltip content="Перейти к следующей фазе: увидеть, как изменяется состояние аккаунта.">
          <div>
            <button
              onClick={() => setStep((s) => Math.min(LIFECYCLE_STEPS.length - 1, s + 1))}
              disabled={step >= LIFECYCLE_STEPS.length - 1}
              style={navBtnStyle(step < LIFECYCLE_STEPS.length - 1, current.color)}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {step >= LIFECYCLE_STEPS.length - 1 && (
        <DiagramTooltip content="Полный цикл жизни аккаунта Solana: от математического PDA-адреса через инициализацию, использование и опциональный realloc до закрытия с возвратом lamports.">
          <DataBox
            label="Полный цикл"
            value="init (создать + выделить + назначить owner) -> use (читать/писать) -> close (обнулить + вернуть lamports)"
            variant="highlight"
          />
        </DiagramTooltip>
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
  tooltip: string;
}

const VALIDATION_STEPS: ValidationStep[] = [
  {
    order: 1,
    name: 'Discriminator',
    check: 'Первые 8 байт account.data == SHA-256("account:Counter")[:8]',
    pass: 'Тип аккаунта подтвержден -- это действительно Counter',
    fail: 'AccountDiscriminatorMismatch -- чужой тип аккаунта',
    color: colors.primary,
    tooltip: 'Discriminator — 8-байтный хеш имени типа аккаунта. Anchor записывает его при init и проверяет при каждом доступе. Предотвращает использование аккаунта неправильного типа (type confusion attack).',
  },
  {
    order: 2,
    name: 'Owner',
    check: 'account.owner == course_counter program_id',
    pass: 'Аккаунт принадлежит нашей программе',
    fail: 'AccountOwnedByWrongProgram -- аккаунт от другой программы',
    color: colors.accent,
    tooltip: 'Owner-проверка гарантирует, что аккаунт был создан и управляется именно вашей программой. Без этой проверки злоумышленник может подставить аккаунт от другой программы с поддельными данными.',
  },
  {
    order: 3,
    name: 'Seeds + Bump',
    check: 'create_program_address([b"counter", authority.key(), bump]) == account.key()',
    pass: 'PDA-адрес совпадает с ожидаемым',
    fail: 'ConstraintSeeds -- неверный PDA (другие seeds или bump)',
    color: colors.success,
    tooltip: 'Seeds + Bump верифицирует, что переданный аккаунт — это именно тот PDA, который ожидается. PDA вычисляется детерминированно, поэтому подмена невозможна без знания правильных seeds.',
  },
  {
    order: 4,
    name: 'Signer',
    check: 'authority.is_signer == true',
    pass: 'Транзакция подписана authority',
    fail: 'MissingSigner -- аккаунт не подписал транзакцию',
    color: '#e879f9',
    tooltip: 'Signer-проверка подтверждает, что authority действительно подписал транзакцию своим приватным ключом. Без этой проверки любой мог бы вызвать инструкцию от чужого имени.',
  },
  {
    order: 5,
    name: 'Mutable',
    check: 'account.is_writable == true',
    pass: 'Аккаунт помечен как writable в транзакции',
    fail: 'ConstraintMut -- аккаунт не помечен как writable',
    color: '#f59e0b',
    tooltip: 'Mut-проверка гарантирует, что аккаунт помечен как writable в транзакции. Solana runtime использует этот флаг для оптимистичной параллелизации: read-only аккаунты обрабатываются параллельно.',
  },
  {
    order: 6,
    name: 'has_one',
    check: 'counter.authority == authority.key()',
    pass: 'Поле authority в аккаунте совпадает с переданным signer',
    fail: 'CourseError::Unauthorized -- неверный authority',
    color: '#f43f5e',
    tooltip: 'has_one проверяет, что поле внутри данных аккаунта (например, authority) совпадает с переданным аккаунтом. Это связывает аккаунт с его владельцем и предотвращает несанкционированный доступ.',
  },
  {
    order: 7,
    name: 'Десериализация',
    check: 'BorshDeserialize::deserialize(account.data[8..])',
    pass: 'Данные успешно десериализованы в Counter { authority, count, bump }',
    fail: 'AccountDidNotDeserialize -- поврежденные данные',
    color: colors.primary,
    tooltip: 'Десериализация через Borsh преобразует сырые байты (после 8-байтного discriminator) в структуру Counter. Если данные повреждены или формат не совпадает, десериализация завершится ошибкой.',
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
            <DiagramTooltip key={i} content={s.tooltip}>
              <div
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
            </DiagramTooltip>
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
      <DiagramTooltip content={`Проверка #${current.order}: ${current.name}. Anchor генерирует этот код из макроса #[account(...)]. Если проверка не пройдена, транзакция автоматически откатывается.`}>
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
      </DiagramTooltip>

      {/* Pass / Fail outcomes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <DiagramTooltip content="Успешная проверка: constraint выполнен, данные аккаунта корректны. Anchor переходит к следующей проверке или вызывает handler.">
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
        </DiagramTooltip>
        <DiagramTooltip content="Неудачная проверка: constraint нарушен. Anchor возвращает ошибку, транзакция откатывается (revert), никакие данные не изменяются. Это защита от уязвимостей.">
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
        </DiagramTooltip>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <DiagramTooltip content="Вернуться к предыдущей проверке в цепочке валидации constraints.">
          <div>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={navBtnStyle(step > 0, current.color)}
            >
              Назад
            </button>
          </div>
        </DiagramTooltip>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace', alignSelf: 'center' }}>
          {step + 1} / {VALIDATION_STEPS.length}
        </span>
        <DiagramTooltip content="Перейти к следующей проверке: увидеть, какой constraint Anchor проверяет далее.">
          <div>
            <button
              onClick={() => setStep((s) => Math.min(VALIDATION_STEPS.length - 1, s + 1))}
              disabled={step >= VALIDATION_STEPS.length - 1}
              style={navBtnStyle(step < VALIDATION_STEPS.length - 1, current.color)}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {step >= VALIDATION_STEPS.length - 1 && (
        <DiagramTooltip content="Все 7 constraint-проверок выполняются автоматически до вызова вашего handler. Порядок проверок оптимизирован: самые быстрые (discriminator) — первые, самые тяжёлые (десериализация) — последние.">
          <DataBox
            label="Все 7 проверок пройдены"
            value="Только после прохождения ВСЕХ constraint-проверок Anchor вызывает ваш handler. Любой сбой = автоматический revert."
            variant="highlight"
          />
        </DiagramTooltip>
      )}
    </DiagramContainer>
  );
}
