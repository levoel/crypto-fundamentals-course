/**
 * Access Control Diagrams (SEC-04)
 *
 * Exports:
 * - AccessControlComparisonDiagram: HTML comparison table -- vulnerable UnsafeToken vs fixed UnsafeTokenFixed
 * - RoleHierarchyDiagram: 4-step step-through showing access control evolution (none -> Ownable -> Ownable2Step -> RBAC)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
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

/**
 * AccessControlComparisonDiagram
 *
 * HTML comparison table: vulnerable UnsafeToken vs fixed UnsafeTokenFixed.
 * Color-coded rows highlighting security differences.
 */
export function AccessControlComparisonDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <DiagramContainer title="UnsafeToken vs UnsafeTokenFixed: сравнение" color="rose">
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 1fr',
        gap: 1,
        marginBottom: 1,
      }}>
        <div style={{
          ...glassStyle,
          padding: 10,
          fontSize: 11,
          fontWeight: 600,
          color: colors.textMuted,
          fontFamily: 'monospace',
          textAlign: 'center',
          borderRadius: '12px 0 0 0',
        }}>
          Аспект
        </div>
        <div style={{
          ...glassStyle,
          padding: 10,
          fontSize: 11,
          fontWeight: 600,
          color: '#f43f5e',
          fontFamily: 'monospace',
          textAlign: 'center',
          borderRadius: 0,
        }}>
          UnsafeToken (уязвимый)
        </div>
        <div style={{
          ...glassStyle,
          padding: 10,
          fontSize: 11,
          fontWeight: 600,
          color: colors.success,
          fontFamily: 'monospace',
          textAlign: 'center',
          borderRadius: '0 12px 0 0',
        }}>
          UnsafeTokenFixed (исправленный)
        </div>
      </div>

      {/* Table rows */}
      {COMPARISON_ROWS.map((row, i) => {
        const isHovered = hoveredRow === i;
        const isLast = i === COMPARISON_ROWS.length - 1;

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 1fr',
              gap: 1,
              marginBottom: 1,
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              ...glassStyle,
              padding: 10,
              fontSize: 11,
              color: isHovered ? colors.text : colors.textMuted,
              fontFamily: 'monospace',
              fontWeight: 600,
              borderRadius: isLast ? '0 0 0 12px' : 0,
              background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            }}>
              {row.aspect}
            </div>
            <div style={{
              ...glassStyle,
              padding: 10,
              fontSize: 11,
              color: row.vulnColor,
              fontFamily: 'monospace',
              borderRadius: 0,
              background: isHovered ? 'rgba(244,63,94,0.06)' : 'rgba(255,255,255,0.03)',
            }}>
              {row.vulnerable}
            </div>
            <div style={{
              ...glassStyle,
              padding: 10,
              fontSize: 11,
              color: row.fixedColor,
              fontFamily: 'monospace',
              borderRadius: isLast ? '0 0 12px 0' : 0,
              background: isHovered ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
            }}>
              {row.fixed}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Ключевой вывод"
          value="Отсутствие access control -- уязвимость #1 по OWASP Smart Contract Top 10. Одна строка (onlyOwner) предотвращает катастрофические потери."
          variant="highlight"
        />
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

/**
 * RoleHierarchyDiagram
 *
 * 4-step step-through showing access control evolution:
 * none -> Ownable -> Ownable2Step -> AccessControl (RBAC).
 */
export function RoleHierarchyDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = AC_EVOLUTION[stepIndex];

  const accentColor = stepIndex === 0 ? '#f43f5e' : stepIndex === 1 ? colors.success : stepIndex === 2 ? colors.success : colors.primary;

  return (
    <DiagramContainer title="Эволюция access control: от нуля до RBAC" color="blue">
      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {AC_EVOLUTION.map((_, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex ? accentColor : 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: colors.text,
        marginBottom: 8,
        fontFamily: 'monospace',
      }}>
        {step.title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: colors.text,
        lineHeight: 1.6,
        marginBottom: 14,
      }}>
        {step.description}
      </div>

      {/* Values grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 12,
      }}>
        {step.values.map((v, i) => (
          <div key={i} style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              {v.label}
            </div>
            <div style={{ fontSize: 13, color: v.color, fontFamily: 'monospace', fontWeight: 600 }}>
              {v.value}
            </div>
          </div>
        ))}
      </div>

      {/* Code snippet */}
      <div style={{
        ...glassStyle,
        padding: 14,
        marginBottom: 14,
        background: 'rgba(0,0,0,0.3)',
        border: `1px solid ${accentColor}30`,
      }}>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
          Solidity
        </div>
        <pre style={{
          fontSize: 11,
          fontFamily: 'monospace',
          color: colors.accent,
          margin: 0,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}>
          {step.code}
        </pre>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => setStepIndex(0)}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            color: colors.text,
            fontSize: 13,
          }}
        >
          Сброс
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
          disabled={stepIndex === 0}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
            color: stepIndex === 0 ? colors.textMuted : colors.text,
            fontSize: 13,
            opacity: stepIndex === 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.min(AC_EVOLUTION.length - 1, s + 1))}
          disabled={stepIndex >= AC_EVOLUTION.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= AC_EVOLUTION.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= AC_EVOLUTION.length - 1 ? colors.textMuted : accentColor,
            fontSize: 13,
            opacity: stepIndex >= AC_EVOLUTION.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= AC_EVOLUTION.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Рекомендация"
            value="Для простых контрактов: Ownable2Step. Для DeFi-протоколов: AccessControl (RBAC) + TimelockController для задержки критических операций."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}
