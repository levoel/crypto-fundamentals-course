/**
 * Solidity Patterns & Testing Diagrams (ETH-07)
 *
 * Exports:
 * - CEIPatternDiagram: Checks-Effects-Interactions pattern flow (step-through)
 * - TestWorkflowDiagram: Hardhat vs Foundry test workflow comparison
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  CEIPatternDiagram                                                    */
/* ================================================================== */

interface CEIStep {
  phase: 'checks' | 'effects' | 'interactions';
  label: string;
  code: string;
  description: string;
  vulnerable?: string;
}

const CEI_STEPS: CEIStep[] = [
  {
    phase: 'checks',
    label: '1. Checks',
    code: 'require(balances[msg.sender] >= amount);',
    description: 'Проверяем все условия ДО изменения состояния. Если require не пройдет -- вся транзакция откатится.',
    vulnerable: 'if (amount == 0) return; // тоже проверка',
  },
  {
    phase: 'effects',
    label: '2. Effects',
    code: 'balances[msg.sender] -= amount;',
    description: 'Обновляем состояние контракта. Баланс уменьшен ДО внешнего вызова -- повторный вызов увидит уже обновленное значение.',
    vulnerable: '// Без CEI: внешний вызов ДО обновления -> reentrancy!',
  },
  {
    phase: 'interactions',
    label: '3. Interactions',
    code: '(bool ok, ) = msg.sender.call{value: amount}("");\nrequire(ok);',
    description: 'Внешний вызов -- ПОСЛЕДНИЙ шаг. Даже если получатель вызовет наш контракт повторно, баланс уже обновлен.',
    vulnerable: '// Уязвимый вариант: call ПЕРЕД -= amount',
  },
];

const PHASE_COLORS: Record<string, string> = {
  checks: colors.primary,
  effects: colors.accent,
  interactions: colors.success,
};

/**
 * CEIPatternDiagram
 *
 * Step-through animation showing the Checks-Effects-Interactions pattern
 * for reentrancy prevention.
 */
export function CEIPatternDiagram() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showVulnerable, setShowVulnerable] = useState(false);

  const step = CEI_STEPS[currentStep];
  const phaseColor = PHASE_COLORS[step.phase];

  return (
    <DiagramContainer title="CEI: Checks-Effects-Interactions" color="emerald">
      {/* Phase indicators */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {CEI_STEPS.map((s, i) => {
          const c = PHASE_COLORS[s.phase];
          const isActive = i === currentStep;
          const isPast = i < currentStep;

          return (
            <DiagramTooltip key={i} content={s.description}>
              <div
                onClick={() => setCurrentStep(i)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  ...glassStyle,
                  background: isActive ? `${c}25` : isPast ? `${c}10` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? c : isPast ? c + '40' : 'rgba(255,255,255,0.08)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center' as const,
                }}
              >
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? c : isPast ? c + 'aa' : colors.textMuted,
                  fontFamily: 'monospace',
                }}>
                  {s.label}
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Current step code */}
      <div style={{
        ...glassStyle,
        padding: 16,
        background: `${phaseColor}08`,
        border: `1px solid ${phaseColor}30`,
        marginBottom: 12,
      }}>
        <pre style={{
          margin: 0,
          fontSize: 13,
          fontFamily: 'monospace',
          color: phaseColor,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}>
          {step.code}
        </pre>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: colors.text,
        lineHeight: 1.6,
        marginBottom: 12,
      }}>
        {step.description}
      </div>

      {/* Vulnerable comparison toggle */}
      <button
        onClick={() => setShowVulnerable(!showVulnerable)}
        style={{
          ...glassStyle,
          padding: '6px 14px',
          cursor: 'pointer',
          background: showVulnerable ? '#f43f5e20' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${showVulnerable ? '#f43f5e' : 'rgba(255,255,255,0.1)'}`,
          color: showVulnerable ? '#f43f5e' : colors.textMuted,
          fontSize: 12,
          fontFamily: 'monospace',
          marginBottom: 12,
        }}
      >
        {showVulnerable ? 'Скрыть уязвимый вариант' : 'Показать уязвимый вариант'}
      </button>

      {showVulnerable && step.vulnerable && (
        <div style={{
          ...glassStyle,
          padding: 12,
          background: '#f43f5e10',
          border: '1px solid #f43f5e30',
          marginBottom: 12,
        }}>
          <pre style={{
            margin: 0,
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#f43f5e',
            whiteSpace: 'pre-wrap',
          }}>
            {step.vulnerable}
          </pre>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            color: currentStep === 0 ? colors.textMuted : colors.text,
            fontSize: 13,
            opacity: currentStep === 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={() => setCurrentStep((s) => Math.min(CEI_STEPS.length - 1, s + 1))}
          disabled={currentStep >= CEI_STEPS.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: currentStep >= CEI_STEPS.length - 1 ? 'not-allowed' : 'pointer',
            color: currentStep >= CEI_STEPS.length - 1 ? colors.textMuted : colors.primary,
            fontSize: 13,
            opacity: currentStep >= CEI_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {currentStep >= CEI_STEPS.length - 1 && (
        <DiagramTooltip content="CEI -- главный паттерн защиты от reentrancy. The DAO hack (2016) произошёл из-за нарушения CEI: external call до обновления balance.">
          <DataBox
            label="Принцип CEI"
            value="Checks -> Effects -> Interactions = защита от reentrancy"
            variant="highlight"
          />
        </DiagramTooltip>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  TestWorkflowDiagram                                                 */
/* ================================================================== */

interface WorkflowStep {
  label: string;
  foundry: string;
  hardhat: string;
  tooltip: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    label: 'Компиляция',
    foundry: 'forge build',
    hardhat: 'npx hardhat compile',
    tooltip: 'Компиляция: Foundry использует solc напрямую (быстрее). Hardhat компилирует через solc с кешированием артефактов в artifacts/.',
  },
  {
    label: 'Запуск тестов',
    foundry: 'forge test',
    hardhat: 'npx hardhat test',
    tooltip: 'Запуск тестов: Foundry запускает тесты в EVM напрямую (Rust). Hardhat -- через Node.js с viem. Foundry значительно быстрее.',
  },
  {
    label: 'Язык тестов',
    foundry: 'Solidity (.t.sol)',
    hardhat: 'TypeScript (.test.ts)',
    tooltip: 'Foundry: тесты на Solidity -- тот же язык что и контракты. Hardhat: TypeScript с viem -- привычнее для web-разработчиков.',
  },
  {
    label: 'Фреймворк',
    foundry: 'forge-std (Test.sol)',
    hardhat: 'node:test + node:assert',
    tooltip: 'forge-std: библиотека Solidity с assertEq, vm cheatcodes. Hardhat 3: встроенные node:test и node:assert (без Mocha/Chai).',
  },
  {
    label: 'Деплой контракта',
    foundry: 'new Counter()',
    hardhat: 'hre.viem.deployContract("Counter")',
    tooltip: 'Foundry: deploy через Solidity constructor (new Counter()). Hardhat: через viem publicClient и walletClient.',
  },
  {
    label: 'Проверка revert',
    foundry: 'vm.expectRevert(Error.selector)',
    hardhat: 'assert.rejects(async () => ...)',
    tooltip: 'Foundry: vm.expectRevert() перехватывает следующий вызов. Hardhat: assert.rejects с async callback. Foundry точнее -- проверяет selector.',
  },
  {
    label: 'Смена msg.sender',
    foundry: 'vm.prank(alice)',
    hardhat: 'walletClient (другой аккаунт)',
    tooltip: 'Foundry: vm.prank(addr) -- подменяет msg.sender на один вызов. vm.startPrank -- на несколько. Hardhat: создаёт отдельный walletClient.',
  },
  {
    label: 'Проверка событий',
    foundry: 'vm.expectEmit()',
    hardhat: 'receipt.logs (viem)',
    tooltip: 'Foundry: vm.expectEmit() -- перед вызовом задаёт ожидаемое событие. Hardhat: парсит logs из receipt через viem decodeEventLog.',
  },
];

/**
 * TestWorkflowDiagram
 *
 * Side-by-side comparison of Foundry (Forge) and Hardhat 3 (viem) testing workflows.
 */
export function TestWorkflowDiagram() {
  return (
    <DiagramContainer title="Foundry vs Hardhat: тестирование" color="blue">
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr 1fr',
        gap: 2,
        marginBottom: 2,
      }}>
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 600,
          color: colors.textMuted,
          fontFamily: 'monospace',
        }}>
          Шаг
        </div>
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 600,
          color: colors.accent,
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          Foundry (Forge)
        </div>
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 600,
          color: colors.primary,
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          Hardhat 3 (viem)
        </div>
      </div>

      {/* Rows */}
      {WORKFLOW_STEPS.map((step, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 1fr',
            gap: 2,
            marginBottom: 2,
          }}
        >
          <DiagramTooltip content={step.tooltip}>
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              fontSize: 12,
              color: colors.textMuted,
              fontFamily: 'monospace',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {step.label}
            </div>
          </DiagramTooltip>
          <div style={{
            ...glassStyle,
            padding: '8px 12px',
            fontSize: 11,
            color: colors.text,
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {step.foundry}
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 12px',
            fontSize: 11,
            color: colors.text,
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.02)',
          }}>
            {step.hardhat}
          </div>
        </div>
      ))}

      <DiagramTooltip content="Foundry и Hardhat совместимы в одном проекте. Foundry быстрее для unit-тестов (Rust EVM), Hardhat удобнее для интеграционных тестов (TypeScript, viem).">
        <div style={{ marginTop: 12, fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          Оба инструмента работают в одном проекте: Foundry использует <code>foundry.toml</code>,
          Hardhat -- <code>hardhat.config.ts</code>. Контракты в <code>contracts/</code>, тесты в <code>test/</code>.
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}
