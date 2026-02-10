/**
 * Audit Tools Diagrams (SEC-10)
 *
 * Exports:
 * - ToolComparisonDiagram: HTML table comparing Slither vs Mythril vs Aderyn (10 rows)
 * - SlitherOutputGuideDiagram: Mock Slither output for VulnerableVault.sol with triage annotations
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ToolComparisonDiagram                                              */
/* ================================================================== */

interface ToolRow {
  category: string;
  slither: string;
  mythril: string;
  aderyn: string;
}

const TOOL_ROWS: ToolRow[] = [
  { category: 'Подход', slither: 'Static analysis (AST + CFG + dataflow)', mythril: 'Symbolic execution + SMT solver', aderyn: 'AST pattern matching' },
  { category: 'Язык', slither: 'Python', mythril: 'Python (z3 solver)', aderyn: 'Rust' },
  { category: 'Скорость', slither: 'Секунды (быстрый)', mythril: 'Минуты-часы (медленный)', aderyn: 'Секунды (быстрый)' },
  { category: 'Detectors', slither: '200+ built-in detectors', mythril: '~40 SWC detectors', aderyn: '~30 Cyfrin detectors' },
  { category: 'Framework', slither: 'Trail of Bits', mythril: 'ConsenSys Diligence', aderyn: 'Cyfrin' },
  { category: 'Сильные стороны', slither: 'Coverage, скорость, custom detectors, CI/CD', mythril: 'Находит глубокие баги (multi-tx), formal verification', aderyn: 'Скорость, Rust reliability, новые детекторы' },
  { category: 'Слабые стороны', slither: 'False positives, не находит multi-tx баги', mythril: 'Медленный, path explosion, high FP rate', aderyn: 'Меньше детекторов, новый инструмент' },
  { category: 'Лучше всего для', slither: 'CI/CD pipeline, первый проход аудита', mythril: 'Глубокий анализ critical контрактов', aderyn: 'Быстрая проверка, дополнение к Slither' },
  { category: 'Docker', slither: 'trailofbits/eth-security-toolbox', mythril: 'mythril/myth', aderyn: 'cyfrin/aderyn (cargo install)' },
  { category: 'Output', slither: 'JSON, text, Markdown, SARIF', mythril: 'JSON, text, Markdown', aderyn: 'JSON, Markdown' },
];

const TOOL_COLORS: Record<string, string> = {
  Slither: colors.success,
  Mythril: '#8b5cf6',
  Aderyn: '#eab308',
};

const TOOL_TOOLTIPS: Record<string, string> = {
  Slither: 'Slither (Trail of Bits) — статический анализатор на Python. Находит reentrancy, unchecked calls, shadowing. Быстрый (~1-5 секунд), низкий порог входа.',
  Mythril: 'Mythril (ConsenSys) — символьное исполнение. Находит integer overflow, unchecked call, delegatecall injection. Медленнее Slither, но глубже.',
  Aderyn: 'Aderyn (Cyfrin) — AST-анализатор на Rust. Новый инструмент с растущей библиотекой детекторов. Быстрый и надёжный, хорошо дополняет Slither.',
};

const CATEGORY_TOOLTIPS: Record<string, string> = {
  'Подход': 'Подход определяет какие баги инструмент может найти. Static analysis быстрый но поверхностный. Symbolic execution медленный но находит глубокие multi-tx баги.',
  'Язык': 'Язык реализации влияет на скорость и экосистему плагинов. Python — проще custom detectors, Rust — быстрее выполнение.',
  'Скорость': 'Скорость критична для CI/CD: Slither/Aderyn за секунды, Mythril может анализировать контракт часами из-за path explosion.',
  'Detectors': 'Количество детекторов определяет покрытие. Больше не значит лучше — важно качество и false positive rate.',
  'Framework': 'Компания-разработчик определяет вектор развития и доверие к инструменту.',
  'Сильные стороны': 'Каждый инструмент имеет уникальную нишу. Комбинация Slither + Mythril покрывает >90% автоматически обнаруживаемых уязвимостей.',
  'Слабые стороны': 'Понимание слабостей помогает выбрать правильную комбинацию инструментов для конкретного проекта.',
  'Лучше всего для': 'Выбор инструмента зависит от контекста: CI/CD (Slither), глубокий аудит (Mythril), быстрая проверка (Aderyn).',
  'Docker': 'Docker-образы упрощают запуск инструментов без локальной установки зависимостей (Python, Rust, solc).',
  'Output': 'Формат output влияет на интеграцию: SARIF для IDE/GitHub, JSON для автоматизации, Markdown для отчётов.',
};

/**
 * ToolComparisonDiagram
 *
 * HTML comparison table: Slither vs Mythril vs Aderyn across 10 dimensions.
 * DiagramTooltip on tool names and category cells.
 */
export function ToolComparisonDiagram() {
  return (
    <DiagramContainer title="Сравнение инструментов: Slither vs Mythril vs Aderyn" color="green">
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12,
          fontFamily: 'monospace',
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '8px 10px',
                textAlign: 'left',
                fontSize: 10,
                color: colors.textMuted,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                minWidth: 90,
              }}>
                Критерий
              </th>
              {(['Slither', 'Mythril', 'Aderyn'] as const).map((tool) => (
                <th key={tool} style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 600,
                  color: TOOL_COLORS[tool],
                  borderBottom: `2px solid ${TOOL_COLORS[tool]}40`,
                  minWidth: 140,
                }}>
                  <DiagramTooltip content={TOOL_TOOLTIPS[tool]}>
                    {tool}
                  </DiagramTooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOOL_ROWS.map((row, i) => (
              <tr
                key={i}
                style={{
                  transition: 'background 0.15s',
                }}
              >
                <td style={{
                  padding: '7px 10px',
                  color: colors.textMuted,
                  fontWeight: 600,
                  fontSize: 11,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <DiagramTooltip content={CATEGORY_TOOLTIPS[row.category] || row.category}>
                    {row.category}
                  </DiagramTooltip>
                </td>
                <td style={{
                  padding: '7px 10px',
                  color: colors.text,
                  fontSize: 11,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  lineHeight: 1.4,
                }}>
                  {row.slither}
                </td>
                <td style={{
                  padding: '7px 10px',
                  color: colors.text,
                  fontSize: 11,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  lineHeight: 1.4,
                }}>
                  {row.mythril}
                </td>
                <td style={{
                  padding: '7px 10px',
                  color: colors.text,
                  fontSize: 11,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  lineHeight: 1.4,
                }}>
                  {row.aderyn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DiagramTooltip content="Layered defense — принцип: каждый инструмент покрывает слабости другого. Slither находит паттерны, Mythril — глубокие баги, manual review — бизнес-логику.">
          <DataBox
            label="Layered defense"
            value="Ни один инструмент не находит все баги. Slither (быстрый, широкий) + Mythril (глубокий, медленный) + Manual review = максимальное покрытие."
            variant="info"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SlitherOutputGuideDiagram                                          */
/* ================================================================== */

type TriageClass = 'TP' | 'FP' | 'Info';

interface SlitherFinding {
  id: number;
  detector: string;
  severity: 'High' | 'Medium' | 'Low' | 'Informational';
  confidence: 'High' | 'Medium' | 'Low';
  location: string;
  description: string;
  triage: TriageClass;
  triageReason: string;
}

const MOCK_FINDINGS: SlitherFinding[] = [
  {
    id: 1,
    detector: 'reentrancy-eth',
    severity: 'High',
    confidence: 'Medium',
    location: 'VulnerableVault.sol#L45-52 withdraw()',
    description: 'Reentrancy in VulnerableVault.withdraw(): External call msg.sender.call{value: amount}("") is followed by state change balances[msg.sender] = 0',
    triage: 'TP',
    triageReason: 'TRUE POSITIVE. State change ПОСЛЕ external call. Классическая reentrancy: call -> state update. Должно быть: state update -> call (CEI pattern).',
  },
  {
    id: 2,
    detector: 'unprotected-upgrade',
    severity: 'High',
    confidence: 'High',
    location: 'VulnerableVault.sol#L12 initialize()',
    description: 'VulnerableVault.initialize() has no access control. Anyone can call initialize() and become owner.',
    triage: 'TP',
    triageReason: 'TRUE POSITIVE. initialize() без access control. Атакующий может вызвать первым и стать owner. Нужен initializer modifier от OpenZeppelin.',
  },
  {
    id: 3,
    detector: 'arbitrary-send-eth',
    severity: 'High',
    confidence: 'Medium',
    location: 'VulnerableVault.sol#L60 emergencyWithdraw()',
    description: 'VulnerableVault.emergencyWithdraw() sends ETH to arbitrary address controlled by owner.',
    triage: 'FP',
    triageReason: 'FALSE POSITIVE. emergencyWithdraw() защищен onlyOwner. Отправка на owner address -- это intended behavior для emergency recovery.',
  },
  {
    id: 4,
    detector: 'reentrancy-events',
    severity: 'Low',
    confidence: 'Medium',
    location: 'VulnerableVault.sol#L45-52 withdraw()',
    description: 'Reentrancy in VulnerableVault.withdraw(): Event Withdrawal emitted after external call.',
    triage: 'Info',
    triageReason: 'INFORMATIONAL. Event ordering не влияет на безопасность, но event emitted до state change может дать inconsistent off-chain data. Low priority, но стоит исправить.',
  },
  {
    id: 5,
    detector: 'solc-version',
    severity: 'Informational',
    confidence: 'High',
    location: 'VulnerableVault.sol#L2',
    description: 'pragma solidity ^0.8.28 allows any 0.8.x. Consider using a fixed version.',
    triage: 'Info',
    triageReason: 'INFORMATIONAL. Floating pragma -- minor issue. Рекомендация: фиксировать версию для production (0.8.28 вместо ^0.8.28).',
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  High: '#f43f5e',
  Medium: '#eab308',
  Low: colors.accent,
  Informational: colors.textMuted,
};

const SEVERITY_TOOLTIPS: Record<string, string> = {
  High: 'High severity — критическая уязвимость с прямым финансовым ущербом. Требует немедленного исправления до деплоя.',
  Medium: 'Medium severity — уязвимость с ограниченным воздействием или требующая определённых условий для эксплуатации.',
  Low: 'Low severity — минимальный риск, но стоит исправить. Может стать проблемой при изменении контекста.',
  Informational: 'Informational — не уязвимость, но рекомендация по улучшению кода: naming, gas, code style.',
};

const TRIAGE_COLORS: Record<TriageClass, string> = {
  TP: '#f43f5e',
  FP: colors.success,
  Info: colors.accent,
};

const TRIAGE_LABELS: Record<TriageClass, string> = {
  TP: 'True Positive',
  FP: 'False Positive',
  Info: 'Informational',
};

const TRIAGE_TOOLTIPS: Record<TriageClass, string> = {
  TP: 'True Positive — инструмент правильно обнаружил реальную уязвимость. Требует исправления.',
  FP: 'False Positive — ложное срабатывание. Инструмент нашёл паттерн, но в контексте это не уязвимость.',
  Info: 'Informational — не уязвимость, а рекомендация. Стоит рассмотреть, но не блокирует деплой.',
};

/**
 * SlitherOutputGuideDiagram
 *
 * Mock Slither output for VulnerableVault.sol annotated with
 * location, detector name, severity. Triage classification: TP/FP/Info.
 */
export function SlitherOutputGuideDiagram() {
  const [selectedFinding, setSelectedFinding] = useState<number>(0);
  const [filter, setFilter] = useState<TriageClass | 'all'>('all');

  const filtered = filter === 'all'
    ? MOCK_FINDINGS
    : MOCK_FINDINGS.filter((f) => f.triage === filter);

  const triageSummary = {
    TP: MOCK_FINDINGS.filter((f) => f.triage === 'TP').length,
    FP: MOCK_FINDINGS.filter((f) => f.triage === 'FP').length,
    Info: MOCK_FINDINGS.filter((f) => f.triage === 'Info').length,
  };

  return (
    <DiagramContainer title="Slither Output: VulnerableVault.sol (triage guide)" color="red">
      {/* Triage summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        marginBottom: 14,
      }}>
        {(Object.entries(triageSummary) as [TriageClass, number][]).map(([cls, count]) => (
          <DiagramTooltip key={cls} content={TRIAGE_TOOLTIPS[cls]}>
            <div
              onClick={() => setFilter((prev) => prev === cls ? 'all' : cls)}
              style={{
                ...glassStyle,
                padding: 10,
                textAlign: 'center',
                cursor: 'pointer',
                background: filter === cls ? `${TRIAGE_COLORS[cls]}10` : 'transparent',
                border: filter === cls ? `1px solid ${TRIAGE_COLORS[cls]}40` : '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: TRIAGE_COLORS[cls], fontFamily: 'monospace' }}>
                {count}
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                {TRIAGE_LABELS[cls]}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Mock terminal output */}
      <DiagramTooltip content="Детекторы Slither проверяют ~80 паттернов уязвимостей. Каждый результат включает: detector name, severity (Impact + Confidence), описание и файл:строка.">
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 6,
          padding: 10,
          marginBottom: 14,
          border: '1px solid rgba(255,255,255,0.06)',
          fontFamily: 'monospace',
          fontSize: 10,
          color: colors.textMuted,
          lineHeight: 1.3,
        }}>
          <div>$ docker compose --profile security run slither contracts/security/VulnerableVault.sol</div>
          <div style={{ color: colors.success, marginTop: 4 }}>Compilation warnings/errors on VulnerableVault.sol:</div>
          <div>...</div>
          <div style={{ marginTop: 4 }}>
            VulnerableVault.sol analyzed ({MOCK_FINDINGS.length} findings)
          </div>
          <div style={{ color: '#f43f5e' }}>
            {MOCK_FINDINGS.filter((f) => f.severity === 'High').length} High,{' '}
            {MOCK_FINDINGS.filter((f) => f.severity === 'Medium').length} Medium,{' '}
            {MOCK_FINDINGS.filter((f) => f.severity === 'Low').length} Low,{' '}
            {MOCK_FINDINGS.filter((f) => f.severity === 'Informational').length} Informational
          </div>
        </div>
      </DiagramTooltip>

      {/* Findings list */}
      <div style={{ marginBottom: 14 }}>
        {filtered.map((finding) => {
          const isSelected = selectedFinding === finding.id;
          return (
            <div
              key={finding.id}
              onClick={() => setSelectedFinding(finding.id)}
              style={{
                ...glassStyle,
                padding: 10,
                marginBottom: 6,
                cursor: 'pointer',
                background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: isSelected
                  ? `1px solid ${SEVERITY_COLORS[finding.severity]}40`
                  : '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.15s',
              }}
            >
              {/* Header line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <DiagramTooltip content={SEVERITY_TOOLTIPS[finding.severity]}>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: SEVERITY_COLORS[finding.severity],
                    fontFamily: 'monospace',
                    padding: '1px 6px',
                    borderRadius: 3,
                    background: `${SEVERITY_COLORS[finding.severity]}15`,
                    border: `1px solid ${SEVERITY_COLORS[finding.severity]}30`,
                  }}>
                    {finding.severity}
                  </span>
                </DiagramTooltip>
                <span style={{
                  fontSize: 9,
                  color: TRIAGE_COLORS[finding.triage],
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}>
                  [{finding.triage}]
                </span>
                <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                  {finding.detector}
                </span>
              </div>

              {/* Location */}
              <div style={{ fontSize: 10, color: colors.accent, fontFamily: 'monospace', marginBottom: 4 }}>
                {finding.location}
              </div>

              {/* Description */}
              <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.4 }}>
                {finding.description}
              </div>

              {/* Triage detail (expanded) */}
              {isSelected && (
                <div style={{
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 4,
                  background: `${TRIAGE_COLORS[finding.triage]}08`,
                  border: `1px solid ${TRIAGE_COLORS[finding.triage]}20`,
                }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: TRIAGE_COLORS[finding.triage],
                    fontFamily: 'monospace',
                    marginBottom: 4,
                  }}>
                    Triage: {TRIAGE_LABELS[finding.triage]}
                  </div>
                  <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
                    {finding.triageReason}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DiagramTooltip content="~30-50% результатов Slither — ложные срабатывания. Аудитор должен проверить каждый результат вручную. slither-disable-next-line для подавления известных false positives.">
        <DataBox
          label="Triage -- навык аудитора"
          value="Slither находит 5 findings, но только 2 -- настоящие баги (TP). 1 -- false positive (FP). 2 -- informational. Умение отличить TP от FP = ключевой навык security researcher."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
