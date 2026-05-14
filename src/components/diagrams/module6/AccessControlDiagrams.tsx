/** @jsxImportSource solid-js */
/**
 * Access Control Diagrams (SEC-04)
 *
 * Exports:
 * - AccessControlComparisonDiagram: HTML comparison table -- vulnerable UnsafeToken vs fixed UnsafeTokenFixed
 * - RoleHierarchyDiagram: 4-step step-through showing access control evolution (none -> Ownable -> Ownable2Step -> RBAC)
 * - RBACHierarchyDiagram: Visual role hierarchy tree replacing ASCII art
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  AccessControlComparisonDiagram                                       */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  vulnerable: string;
  vulnColor: string;
  fixed: string;
  fixedColor: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    aspect: 'mint()',
    vulnerable: 'public -- кто угодно может минтить',
    vulnColor: '#f43f5e',
    fixed: 'onlyOwner -- только владелец',
    fixedColor: colors.success,
  },
  {
    aspect: 'burn()',
    vulnerable: 'public -- кто угодно может сжигать чужие токены',
    vulnColor: '#f43f5e',
    fixed: 'msg.sender сжигает только свои',
    fixedColor: colors.success,
  },
  {
    aspect: 'Наследование',
    vulnerable: 'Только ERC20',
    vulnColor: colors.textMuted,
    fixed: 'ERC20 + Ownable',
    fixedColor: colors.primary,
  },
  {
    aspect: 'Конструктор',
    vulnerable: 'ERC20("Unsafe", "UNSAFE")',
    vulnColor: colors.textMuted,
    fixed: 'ERC20(...) Ownable(msg.sender)',
    fixedColor: colors.primary,
  },
  {
    aspect: 'Вектор атаки',
    vulnerable: 'Атакующий минтит бесконечные токены, dump на DEX',
    vulnColor: '#f43f5e',
    fixed: 'Нет -- mint доступен только owner',
    fixedColor: colors.success,
  },
  {
    aspect: 'Реальный пример',
    vulnerable: 'Любой проект без access control = rug',
    vulnColor: '#f43f5e',
    fixed: 'OZ Ownable / AccessControl -- стандарт',
    fixedColor: colors.success,
  },
];

const ASPECT_TOOLTIPS: Record<string, string> = {
  'mint()': 'mint() создаёт новые токены. Без access control любой может вызвать mint() и создать бесконечное количество токенов, обесценив весь supply.',
  'burn()': 'burn() уничтожает токены. Без проверки msg.sender атакующий может сжечь токены других пользователей напрямую.',
  'Наследование': 'Наследование от Ownable добавляет модификатор onlyOwner и функции transferOwnership/renounceOwnership. Одна строка import меняет security posture.',
  'Конструктор': 'Конструктор Ownable(msg.sender) устанавливает deployer как owner. Это критически важно: без этого owner = address(0) и никто не контролирует контракт.',
  'Вектор атаки': 'Классический rug pull: атакующий минтит миллиарды токенов и продаёт на DEX, обрушивая цену до нуля для всех держателей.',
  'Реальный пример': 'OpenZeppelin Ownable и AccessControl — стандарт индустрии. Используются в 95%+ production контрактов.',
};

/**
 * AccessControlComparisonDiagram
 *
 * HTML comparison table: vulnerable UnsafeToken vs fixed UnsafeTokenFixed.
 * Color-coded rows highlighting security differences.
 */
export function AccessControlComparisonDiagram() {
  return (
    <DiagramContainer title="UnsafeToken vs UnsafeTokenFixed: сравнение" color="rose">
      {/* Table header */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '120px 1fr 1fr',
        'gap': '1px',
        'margin-bottom': '1px',
      }}>
        <div style={{
          ...glassStyle,
          'padding': '10px',
          'font-size': '11px',
          'font-weight': '600',
          'color': colors.textMuted,
          'font-family': 'monospace',
          'text-align': 'center',
          'border-radius': '12px 0 0 0',
        }}>
          Аспект
        </div>
        <div style={{
          ...glassStyle,
          'padding': '10px',
          'font-size': '11px',
          'font-weight': '600',
          'color': '#f43f5e',
          'font-family': 'monospace',
          'text-align': 'center',
          'border-radius': '0',
        }}>
          UnsafeToken (уязвимый)
        </div>
        <div style={{
          ...glassStyle,
          'padding': '10px',
          'font-size': '11px',
          'font-weight': '600',
          'color': colors.success,
          'font-family': 'monospace',
          'text-align': 'center',
          'border-radius': '0 12px 0 0',
        }}>
          UnsafeTokenFixed (исправленный)
        </div>
      </div>

      {/* Table rows */}
      {COMPARISON_ROWS.map((row, i) => {
        const isLast = i === COMPARISON_ROWS.length - 1;

        return (
          <div
            style={{
              'display': 'grid',
              'grid-template-columns': '120px 1fr 1fr',
              'gap': '1px',
              'margin-bottom': '1px',
              'transition': 'all 0.15s',
            }}
          >
            <div style={{
              ...glassStyle,
              'padding': '10px',
              'font-size': '11px',
              'color': colors.textMuted,
              'font-family': 'monospace',
              'font-weight': '600',
              'border-radius': isLast ? '0 0 0 12px' : 0,
              'background': 'rgba(255,255,255,0.03)',
            }}>
              <DiagramTooltip content={ASPECT_TOOLTIPS[row.aspect] || row.aspect}>
                {row.aspect}
              </DiagramTooltip>
            </div>
            <div style={{
              ...glassStyle,
              'padding': '10px',
              'font-size': '11px',
              'color': row.vulnColor,
              'font-family': 'monospace',
              'border-radius': '0',
              'background': 'rgba(255,255,255,0.03)',
            }}>
              {row.vulnerable}
            </div>
            <div style={{
              ...glassStyle,
              'padding': '10px',
              'font-size': '11px',
              'color': row.fixedColor,
              'font-family': 'monospace',
              'border-radius': isLast ? '0 0 12px 0' : 0,
              'background': 'rgba(255,255,255,0.03)',
            }}>
              {row.fixed}
            </div>
          </div>
        );
      })}

      <div style={{ 'margin-top': '12px' }}>
        <DiagramTooltip content="OWASP Smart Contract Top 10 — классификация уязвимостей смарт-контрактов. Access Control (#1) лидирует по количеству потерянных средств.">
          <DataBox
            label="Ключевой вывод"
            value="Отсутствие access control -- уязвимость #1 по OWASP Smart Contract Top 10. Одна строка (onlyOwner) предотвращает катастрофические потери."
            variant="highlight"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  RoleHierarchyDiagram                                                 */
/* ================================================================== */

interface ACStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  code: string;
}

const AC_EVOLUTION: ACStep[] = [
  {
    title: 'Нет контроля доступа',
    description: 'Функции публичные. Любой адрес может вызвать любую функцию. Это эквивалент банка без дверей и охраны.',
    values: [
      { label: 'Контроль', value: 'Отсутствует', color: '#f43f5e' },
      { label: 'Кто может вызвать', value: 'Любой адрес', color: '#f43f5e' },
      { label: 'Уровень защиты', value: '0 / 4', color: '#f43f5e' },
      { label: 'Пример', value: 'UnsafeToken.sol', color: colors.textMuted },
    ],
    code: 'function mint(address to, uint256 amount) public {\n  _mint(to, amount);\n}',
  },
  {
    title: 'Ownable (один владелец)',
    description: 'Один адрес (owner) контролирует привилегированные функции. Modifier onlyOwner проверяет msg.sender == owner(). Простой и эффективный для большинства случаев.',
    values: [
      { label: 'Контроль', value: 'Ownable (1 владелец)', color: colors.success },
      { label: 'Кто может вызвать', value: 'Только owner', color: colors.success },
      { label: 'Уровень защиты', value: '2 / 4', color: '#f59e0b' },
      { label: 'Риск', value: 'Потеря ключа owner = потеря контроля', color: '#f59e0b' },
    ],
    code: 'import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";\n\nfunction mint(address to, uint256 amount)\n  public onlyOwner {\n  _mint(to, amount);\n}',
  },
  {
    title: 'Ownable2Step (безопасная передача)',
    description: 'Двухшаговая передача ownership: текущий owner вызывает transferOwnership(), новый owner подтверждает через acceptOwnership(). Защита от случайной передачи на неправильный адрес.',
    values: [
      { label: 'Контроль', value: 'Ownable2Step', color: colors.success },
      { label: 'Передача', value: '2 шага: transfer + accept', color: colors.primary },
      { label: 'Уровень защиты', value: '3 / 4', color: colors.success },
      { label: 'Защита', value: 'Нет случайной передачи', color: colors.success },
    ],
    code: 'import {Ownable2Step} from\n  "@openzeppelin/contracts/access/Ownable2Step.sol";\n\n// Шаг 1: owner.transferOwnership(newOwner)\n// Шаг 2: newOwner.acceptOwnership()',
  },
  {
    title: 'AccessControl (RBAC)',
    description: 'Role-Based Access Control: множество ролей (MINTER_ROLE, PAUSER_ROLE, ADMIN_ROLE). Каждая роль может быть назначена нескольким адресам. Гранулярный контроль для сложных протоколов.',
    values: [
      { label: 'Контроль', value: 'RBAC (множество ролей)', color: colors.primary },
      { label: 'Гранулярность', value: 'Роль на каждую операцию', color: colors.primary },
      { label: 'Уровень защиты', value: '4 / 4', color: colors.success },
      { label: 'Использование', value: 'DeFi протоколы, DAO', color: colors.accent },
    ],
    code: 'import {AccessControl} from\n  "@openzeppelin/contracts/access/AccessControl.sol";\n\nbytes32 MINTER_ROLE = keccak256("MINTER_ROLE");\n\nfunction mint(address to, uint256 amount)\n  public onlyRole(MINTER_ROLE) {\n  _mint(to, amount);\n}',
  },
];

const ROLE_TOOLTIPS: Record<string, string> = {
  'Нет контроля доступа': 'Без access control все функции эквивалентны public API. Любой бот может вызвать mint(), burn(), pause() — полная потеря средств неизбежна.',
  'Ownable (один владелец)': 'Ownable (OpenZeppelin) — простейший контроль: один owner с полными правами. Подходит для простых контрактов. Риск: единая точка отказа.',
  'Ownable2Step (безопасная передача)': 'Ownable2Step добавляет confirmацию: новый owner должен вызвать acceptOwnership(). Защищает от опечатки в адресе при transferOwnership().',
  'AccessControl (RBAC)': 'OpenZeppelin AccessControl — стандартная реализация RBAC с DEFAULT_ADMIN_ROLE. Поддерживает иерархию ролей и adminRole для каждой роли.',
};

/**
 * RoleHierarchyDiagram
 *
 * 4-step step-through showing access control evolution:
 * none -> Ownable -> Ownable2Step -> AccessControl (RBAC).
 */
export function RoleHierarchyDiagram() {
  const [stepIndex, setStepIndex] = createSignal(0);
  const step = AC_EVOLUTION[stepIndex()];

  const accentColor = stepIndex() === 0 ? '#f43f5e' : stepIndex() === 1 ? colors.success : stepIndex() === 2 ? colors.success : colors.primary;

  return (
    <DiagramContainer title="Эволюция access control: от нуля до RBAC" color="blue">
      {/* Step progress bar */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {AC_EVOLUTION.map((s, i) => (
          <DiagramTooltip content={ROLE_TOOLTIPS[s.title] || s.description}>
            <div
              onClick={() => setStepIndex(i)}
              style={{
                'flex': '1',
                'height': '4px',
                'border-radius': '2px',
                'cursor': 'pointer',
                'background': i <= stepIndex() ? accentColor : 'rgba(255,255,255,0.1)',
                'transition': 'all 0.2s',
              }}
            />
          </DiagramTooltip>
        ))}
      </div>

      {/* Step title */}
      <DiagramTooltip content={ROLE_TOOLTIPS[step.title] || step.description}>
        <div style={{
          'font-size': '14px',
          'font-weight': '600',
          'color': colors.text,
          'margin-bottom': '8px',
          'font-family': 'monospace',
        }}>
          {step.title}
        </div>
      </DiagramTooltip>

      {/* Description */}
      <div style={{
        'font-size': '13px',
        'color': colors.text,
        'line-height': '1.6',
        'margin-bottom': '14px',
      }}>
        {step.description}
      </div>

      {/* Values grid */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '1fr 1fr',
        'gap': '8px',
        'margin-bottom': '12px',
      }}>
        {step.values.map((v, i) => (
          <div style={{ ...glassStyle, 'padding': '10px' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              {v.label}
            </div>
            <div style={{ 'font-size': '13px', 'color': v.color, 'font-family': 'monospace', 'font-weight': '600' }}>
              {v.value}
            </div>
          </div>
        ))}
      </div>

      {/* Code snippet */}
      <DiagramTooltip content="Solidity код демонстрирует конкретный паттерн access control. Обратите внимание на import и модификатор в сигнатуре функции.">
        <div style={{
          ...glassStyle,
          'padding': '14px',
          'margin-bottom': '14px',
          'background': 'rgba(0,0,0,0.3)',
          'border': `1px solid ${accentColor}30`,
        }}>
          <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '6px' }}>
            Solidity
          </div>
          <pre style={{
            'font-size': '11px',
            'font-family': 'monospace',
            'color': colors.accent,
            'margin': '0',
            'white-space': 'pre-wrap',
            'line-height': '1.5',
          }}>
            {step.code}
          </pre>
        </div>
      </DiagramTooltip>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center' }}>
        <div>
          <button
            onClick={() => setStepIndex(0)}
            style={{
              ...glassStyle,
              'padding': '8px 16px',
              'cursor': 'pointer',
              'color': colors.text,
              'font-size': '13px',
            }}
          >
            Сброс
          </button>
        </div>
        <div>
          <button
            onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
            disabled={stepIndex() === 0}
            style={{
              ...glassStyle,
              'padding': '8px 20px',
              'cursor': stepIndex() === 0 ? 'not-allowed' : 'pointer',
              'color': stepIndex() === 0 ? colors.textMuted : colors.text,
              'font-size': '13px',
              'opacity': stepIndex() === 0 ? 0.5 : 1,
            }}
          >
            Назад
          </button>
        </div>
        <div>
          <button
            onClick={() => setStepIndex((s) => Math.min(AC_EVOLUTION.length - 1, s + 1))}
            disabled={stepIndex() >= AC_EVOLUTION.length - 1}
            style={{
              ...glassStyle,
              'padding': '8px 20px',
              'cursor': stepIndex() >= AC_EVOLUTION.length - 1 ? 'not-allowed' : 'pointer',
              'color': stepIndex() >= AC_EVOLUTION.length - 1 ? colors.textMuted : accentColor,
              'font-size': '13px',
              'opacity': stepIndex() >= AC_EVOLUTION.length - 1 ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>
      </div>

      {stepIndex() >= AC_EVOLUTION.length - 1 && (
        <div style={{ 'margin-top': '12px' }}>
          <DiagramTooltip content="TimelockController добавляет задержку (24-48 часов) между предложением и исполнением критических операций. Даёт пользователям время отреагировать.">
            <DataBox
              label="Рекомендация"
              value="Для простых контрактов: Ownable2Step. Для DeFi-протоколов: AccessControl (RBAC) + TimelockController для задержки критических операций."
              variant="highlight"
            />
          </DiagramTooltip>
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  RBACHierarchyDiagram                                                */
/* ================================================================== */

interface RBACRole {
  name: string;
  description: string;
  color: string;
  tooltipRu: string;
}

const RBAC_CHILDREN: RBACRole[] = [
  {
    name: 'MINTER_ROLE',
    description: 'может минтить',
    color: '#10b981',
    tooltipRu: 'MINTER_ROLE — право создавать новые токены. Назначается factory-контрактам или multi-sig кошелькам. Компрометация даёт бесконечный mint.',
  },
  {
    name: 'PAUSER_ROLE',
    description: 'может приостанавливать',
    color: '#f59e0b',
    tooltipRu: 'PAUSER_ROLE — право приостанавливать все переводы (emergency pause). Используется при обнаружении эксплойта для минимизации потерь.',
  },
  {
    name: 'UPGRADER_ROLE',
    description: 'может обновлять proxy',
    color: '#6366f1',
    tooltipRu: 'UPGRADER_ROLE — право обновлять implementation контракта через proxy. Критичнейшая роль: обновление может полностью изменить логику контракта.',
  },
  {
    name: 'CUSTOM_ROLE',
    description: 'кастомная роль',
    color: '#a78bfa',
    tooltipRu: 'Любая кастомная роль, определяемая протоколом. Например: ORACLE_ROLE, LIQUIDATOR_ROLE, STRATEGY_ROLE. Роли создаются через keccak256("ROLE_NAME").',
  },
];

/**
 * RBACHierarchyDiagram
 *
 * Visual hierarchy tree showing DEFAULT_ADMIN_ROLE and its child roles.
 * Replaces ASCII art: DEFAULT_ADMIN_ROLE -> MINTER / PAUSER / UPGRADER / CUSTOM.
 */
export function RBACHierarchyDiagram() {
  return (
    <DiagramContainer title="Иерархия ролей AccessControl" color="blue">
      {/* Root node: DEFAULT_ADMIN_ROLE */}
      <DiagramTooltip content="DEFAULT_ADMIN_ROLE — корневая роль. Может назначать и отзывать любые другие роли. bytes32(0x00). Назначается deployer-у в конструкторе.">
        <div style={{
          ...glassStyle,
          'padding': '12px 18px',
          'border-radius': '10px',
          'border': '1px solid #ef444440',
          'background': '#ef444410',
          'margin-bottom': '20px',
          'text-align': 'center',
          'cursor': 'pointer',
        }}>
          <div style={{ 'font-size': '13px', 'font-weight': '700', 'color': '#ef4444', 'font-family': 'monospace' }}>
            DEFAULT_ADMIN_ROLE
          </div>
          <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-top': '4px' }}>
            может назначать любые роли
          </div>
        </div>
      </DiagramTooltip>

      {/* Connector lines from root to children */}
      <div style={{ 'display': 'flex', 'justify-content': 'center', 'margin-bottom': '4px' }}>
        <div style={{ 'width': '2px', 'height': '12px', 'background': 'rgba(255,255,255,0.15)' }} />
      </div>

      {/* Horizontal connector bar */}
      <div style={{
        'height': '2px',
        'background': 'rgba(255,255,255,0.12)',
        'margin': '0 10%',
        'margin-bottom': '4px',
      }} />

      {/* Child role nodes */}
      <div style={{ 'display': 'grid', 'grid-template-columns': 'repeat(2, 1fr)', 'gap': '8px' }}>
        {RBAC_CHILDREN.map((role, i) => (
          <DiagramTooltip content={role.tooltipRu}>
            <div style={{
              ...glassStyle,
              'padding': '10px 14px',
              'border-radius': '8px',
              'border': `1px solid ${role.color}30`,
              'border-left': `3px solid ${role.color}`,
              'cursor': 'pointer',
              'transition': 'all 0.15s',
            }}>
              <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px', 'margin-bottom': '4px' }}>
                {/* Connector dot */}
                <div style={{
                  'width': '6px',
                  'height': '6px',
                  'border-radius': '50%',
                  'background': role.color,
                  'flex-shrink': '0',
                }} />
                <span style={{ 'font-size': '11px', 'font-weight': '600', 'color': role.color, 'font-family': 'monospace' }}>
                  {role.name}
                </span>
              </div>
              <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'padding-left': '12px' }}>
                {role.description}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <div style={{ 'margin-top': '14px' }}>
        <DataBox
          label="Admin role"
          value="Каждая роль имеет свой admin role. По умолчанию admin role = DEFAULT_ADMIN_ROLE. Настраивается через _setRoleAdmin()."
          variant="default"
        />
      </div>
    </DiagramContainer>
  );
}
