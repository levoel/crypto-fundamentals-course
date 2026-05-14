/** @jsxImportSource solid-js */
/**
 * Audit Methodology Diagrams (SEC-09)
 *
 * Exports:
 * - AuditPipelineDiagram: 4-phase step-through (scoping 10%, automated 20%, manual 60%, reporting 10%)
 * - AuditChecklistDiagram: 12 interactive checkboxes grouped by OWASP categories with progress bar
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  AuditPipelineDiagram                                               */
/* ================================================================== */

interface AuditPhase {
  title: string;
  percentage: string;
  description: string;
  tasks: string[];
  deliverable: string;
  color: string;
  insight: string;
}

const AUDIT_PHASES: AuditPhase[] = [
  {
    title: 'Фаза 1: Scoping',
    percentage: '10%',
    description: 'Определение границ аудита: какие контракты, какие цепи, какие интеграции. Создание threat model и attack surface. Согласование timeline и severity classification.',
    tasks: [
      'Инвентаризация контрактов (LoC, complexity)',
      'Определение attack surface (external calls, admin, user flows)',
      'Threat model: кто атакующий? Какие активы?',
      'Severity classification (Critical/High/Medium/Low/Info)',
      'Timeline: calendar days vs auditor-days',
    ],
    deliverable: 'Scope Document + Threat Model',
    color: colors.primary,
    insight: 'Плохой scoping = пропущенные контракты = пропущенные баги. 80% аудитов с "surprise findings" имели неполный scope.',
  },
  {
    title: 'Фаза 2: Automated Analysis',
    percentage: '20%',
    description: 'Запуск статических анализаторов (Slither, Aderyn) и символьного исполнения (Mythril, Halmos). Автоматические инструменты находят ~20% уязвимостей, но делают это БЫСТРО. Они освобождают аудитора для manual review.',
    tasks: [
      'Slither: static analysis (200+ detectors)',
      'Mythril: symbolic execution (SWC coverage)',
      'Aderyn: AST analysis (Cyfrin detectors)',
      'Triage: TP vs FP vs Informational',
      'Gas optimization analysis',
    ],
    deliverable: 'Automated Findings Report (triaged)',
    color: '#eab308',
    insight: 'Инструменты находят ~20% багов, но 100% "low-hanging fruit". Если аудитор не запустил Slither -- это не аудит.',
  },
  {
    title: 'Фаза 3: Manual Review',
    percentage: '60%',
    description: 'Ручной анализ кода аудитором. Это ЯДРО аудита. Автоматические инструменты не понимают бизнес-логику, экономические атаки, cross-contract interactions. Manual review находит ~80% critical/high findings.',
    tasks: [
      'Line-by-line code review',
      'Business logic validation',
      'Cross-contract interaction analysis',
      'Economic attack modeling (flash loan, MEV)',
      'Invariant identification и проверка',
      'PoC exploit writing для каждого finding',
    ],
    deliverable: 'Manual Findings + PoC exploits',
    color: colors.success,
    insight: 'Manual review находит ~80% уязвимостей. Инструменты НЕ МОГУТ заменить опытного аудитора -- они лишь экономят время.',
  },
  {
    title: 'Фаза 4: Reporting',
    percentage: '10%',
    description: 'Структурированный отчет с severity classification, PoC, рекомендациями по fix, и executive summary. Отчет -- это ПРОДУКТ аудита. Плохой отчет = бесполезный аудит.',
    tasks: [
      'Severity classification (C/H/M/L/I)',
      'PoC code для каждого finding',
      'Рекомендации по исправлению (конкретный код)',
      'Executive summary для нетехнических стейкхолдеров',
      'Fix review (проверка исправлений)',
    ],
    deliverable: 'Final Audit Report',
    color: '#f43f5e',
    insight: 'Хороший отчет содержит: описание, severity, PoC, fix recommendation, fix verification. Без PoC finding = теория.',
  },
];

const PIPELINE_TOOLTIPS: Record<string, string> = {
  scoping: 'Автоматический анализ (Slither, Mythril) выявляет типовые паттерны уязвимостей за секунды. Покрывает ~60% известных проблем, но пропускает логические ошибки.',
  automated: 'Ручной аудит анализирует бизнес-логику, экономические атаки и сложные взаимодействия между контрактами. Требует опыта аудитора.',
  manual: 'Отчёт классифицирует найденные уязвимости по критичности (Critical/High/Medium/Low/Informational) с рекомендациями по исправлению.',
  reporting: 'Fix review проверяет корректность исправлений после аудита. Без fix review нельзя подтвердить что уязвимости действительно устранены.',
};

/**
 * AuditPipelineDiagram
 *
 * 4-phase step-through showing the complete audit lifecycle.
 * Key insight: automated tools find ~20%, manual review finds ~80%.
 */
export function AuditPipelineDiagram() {
  const [stepIndex, setStepIndex] = createSignal(0);
  const phase = AUDIT_PHASES[stepIndex()];

  return (
    <DiagramContainer title="Методология аудита: 4-фазный процесс" color="blue">
      {/* Phase progress bar */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {AUDIT_PHASES.map((p, i) => (
          <DiagramTooltip content={`${p.title}: ${p.description.slice(0, 120)}...`}>
            <div
              onClick={() => setStepIndex(i)}
              style={{
                'flex': Number(p.percentage.replace('%', '')),
                'height': '6px',
                'border-radius': '3px',
                'cursor': 'pointer',
                'background': i <= stepIndex() ? p.color : 'rgba(255,255,255,0.1)',
                'transition': 'all 0.3s',
                'position': 'relative',
              }}
            />
          </DiagramTooltip>
        ))}
      </div>

      {/* Percentage labels */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '14px' }}>
        {AUDIT_PHASES.map((p, i) => (
          <div
            style={{
              'flex': Number(p.percentage.replace('%', '')),
              'text-align': 'center',
              'font-size': '9px',
              'font-family': 'monospace',
              'color': i <= stepIndex() ? p.color : colors.textMuted,
              'font-weight': i === stepIndex() ? 700 : 400,
            }}
          >
            {p.percentage}
          </div>
        ))}
      </div>

      {/* Phase title */}
      <DiagramTooltip content={phase.insight}>
        <div style={{
          'font-size': '15px',
          'font-weight': '600',
          'color': phase.color,
          'margin-bottom': '8px',
          'font-family': 'monospace',
        }}>
          {phase.title} ({phase.percentage} времени)
        </div>
      </DiagramTooltip>

      {/* Description */}
      <div style={{
        'font-size': '13px',
        'color': colors.text,
        'line-height': '1.6',
        'margin-bottom': '14px',
      }}>
        {phase.description}
      </div>

      {/* Tasks list */}
      <div style={{
        ...glassStyle,
        'padding': '12px',
        'margin-bottom': '12px',
      }}>
        <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '8px' }}>
          Задачи фазы:
        </div>
        {phase.tasks.map((task, i) => (
          <div style={{
            'font-size': '12px',
            'color': colors.text,
            'font-family': 'monospace',
            'padding': '3px 0',
            'border-bottom': i < phase.tasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            {i + 1}. {task}
          </div>
        ))}
      </div>

      {/* Deliverable */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '1fr 1fr',
        'gap': '8px',
        'margin-bottom': '14px',
      }}>
        <DiagramTooltip content="Deliverable -- конкретный артефакт, который аудитор создаёт по итогам фазы. Без deliverable фаза не считается завершённой.">
          <div style={{ ...glassStyle, 'padding': '10px' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Deliverable
            </div>
            <div style={{ 'font-size': '12px', 'color': phase.color, 'font-family': 'monospace', 'font-weight': '600' }}>
              {phase.deliverable}
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Процент времени аудита, выделяемый на эту фазу. Распределение может меняться в зависимости от сложности проекта и scope.">
          <div style={{ ...glassStyle, 'padding': '10px' }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              % от audit time
            </div>
            <div style={{ 'font-size': '18px', 'color': phase.color, 'font-family': 'monospace', 'font-weight': '700' }}>
              {phase.percentage}
            </div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Insight */}
      <div style={{
        ...glassStyle,
        'padding': '10px',
        'background': `${phase.color}08`,
        'border': `1px solid ${phase.color}30`,
        'margin-bottom': '16px',
      }}>
        <div style={{ 'font-size': '12px', 'color': phase.color, 'line-height': '1.5', 'font-style': 'italic' }}>
          {phase.insight}
        </div>
      </div>

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
            onClick={() => setStepIndex((s) => Math.min(AUDIT_PHASES.length - 1, s + 1))}
            disabled={stepIndex() >= AUDIT_PHASES.length - 1}
            style={{
              ...glassStyle,
              'padding': '8px 20px',
              'cursor': stepIndex() >= AUDIT_PHASES.length - 1 ? 'not-allowed' : 'pointer',
              'color': stepIndex() >= AUDIT_PHASES.length - 1 ? colors.textMuted : phase.color,
              'font-size': '13px',
              'opacity': stepIndex() >= AUDIT_PHASES.length - 1 ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>
      </div>

      {stepIndex() >= AUDIT_PHASES.length - 1 && (
        <div style={{ 'margin-top': '12px' }}>
          <DiagramTooltip content="Это соотношение подтверждается статистикой: инструменты находят типовые уязвимости (reentrancy, overflow), а manual review — бизнес-логику, экономические атаки, oracle manipulation.">
            <DataBox
              label="Ключевое распределение"
              value="Инструменты: ~20% findings. Manual review: ~80% findings. Аудит БЕЗ manual review = security theater. Аудит БЕЗ инструментов = неэффективность."
              variant="highlight"
            />
          </DiagramTooltip>
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AuditChecklistDiagram                                              */
/* ================================================================== */

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  tooltip: string;
}

const CHECKLIST_CATEGORIES = [
  { name: 'Access Control', color: '#f43f5e' },
  { name: 'Reentrancy', color: '#8b5cf6' },
  { name: 'Math / Logic', color: '#eab308' },
  { name: 'Oracle / Price', color: colors.primary },
];

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'ac1', label: 'Все external функции имеют access control', category: 'Access Control', tooltip: 'Проверить: onlyOwner, onlyRole, msg.sender checks на каждой public/external функции с side effects' },
  { id: 'ac2', label: 'Ownable2Step вместо Ownable', category: 'Access Control', tooltip: '2-step ownership transfer предотвращает случайную передачу на неверный адрес' },
  { id: 'ac3', label: 'Нет незащищенных selfdestruct/delegatecall', category: 'Access Control', tooltip: 'selfdestruct и delegatecall без access control = полная потеря средств' },
  { id: 're1', label: 'ReentrancyGuard на всех state-changing функциях', category: 'Reentrancy', tooltip: 'CEI pattern + nonReentrant modifier на функциях с external calls' },
  { id: 're2', label: 'CEI pattern (Checks-Effects-Interactions)', category: 'Reentrancy', tooltip: 'State updates ДО external calls. Проверить все .call(), .transfer(), token transfers' },
  { id: 're3', label: 'Cross-contract reentrancy проверена', category: 'Reentrancy', tooltip: 'Один контракт вызывает другой, который callback в первый -- shared state может быть inconsistent' },
  { id: 'ml1', label: 'Нет unchecked arithmetic в финансовых расчетах', category: 'Math / Logic', tooltip: 'unchecked {} блоки для gas optimization, но НИКОГДА для balance/amount/price calculations' },
  { id: 'ml2', label: 'Safe downcasting (SafeCast library)', category: 'Math / Logic', tooltip: 'uint256 -> uint128 truncation может привести к потере значений. Используйте OpenZeppelin SafeCast' },
  { id: 'ml3', label: 'Division before multiplication проверена', category: 'Math / Logic', tooltip: 'a / b * c теряет precision. Всегда: a * c / b. Проверить все финансовые формулы' },
  { id: 'op1', label: 'Oracle не использует spot price (getReserves)', category: 'Oracle / Price', tooltip: 'Spot price манипулируется за 1 tx. Использовать Chainlink / TWAP / time-delayed oracle' },
  { id: 'op2', label: 'Chainlink staleness check (updatedAt)', category: 'Oracle / Price', tooltip: 'Chainlink может вернуть stale price при network congestion. Проверять: block.timestamp - updatedAt < threshold' },
  { id: 'op3', label: 'Price deviation circuit breaker', category: 'Oracle / Price', tooltip: 'Отклонение цены > 10% за один блок = возможная манипуляция. Добавить circuit breaker' },
];

/**
 * AuditChecklistDiagram
 *
 * 12 interactive checkboxes grouped by OWASP-style categories.
 * Progress bar shows completion. DiagramTooltip with item.tooltip data.
 */
export function AuditChecklistDiagram() {
  const [checked, setChecked] = createSignal<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = (checked().size / CHECKLIST_ITEMS.length) * 100;

  return (
    <DiagramContainer title="Security Audit Checklist (OWASP-based)" color="green">
      {/* Progress bar */}
      <div style={{ 'margin-bottom': '16px' }}>
        <div style={{
          'display': 'flex',
          'justify-content': 'space-between',
          'margin-bottom': '6px',
        }}>
          <DiagramTooltip content="Прогресс показывает долю пройденных проверок. Это базовый checklist из 12 пунктов — полный аудит включает 50+ проверок.">
            <span style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
              Прогресс аудита
            </span>
          </DiagramTooltip>
          <span style={{
            'font-size': '10px',
            'font-family': 'monospace',
            'color': progress === 100 ? colors.success : colors.accent,
            'font-weight': '600',
          }}>
            {checked().size}/{CHECKLIST_ITEMS.length} ({Math.round(progress)}%)
          </span>
        </div>
        <div style={{
          'height': '6px',
          'border-radius': '3px',
          'background': 'rgba(255,255,255,0.08)',
          'overflow': 'hidden',
        }}>
          <div style={{
            'height': '100%',
            'width': `${progress}%`,
            'border-radius': '3px',
            'background': progress === 100
              ? colors.success
              : `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
            'transition': 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Categories */}
      {CHECKLIST_CATEGORIES.map((cat) => {
        const items = CHECKLIST_ITEMS.filter((item) => item.category === cat.name);
        const catChecked = items.filter((item) => checked().has(item.id)).length;

        return (
          <div style={{ 'margin-bottom': '14px' }}>
            <div style={{
              'font-size': '11px',
              'font-weight': '600',
              'color': cat.color,
              'font-family': 'monospace',
              'margin-bottom': '6px',
              'display': 'flex',
              'justify-content': 'space-between',
            }}>
              <span>{cat.name}</span>
              <span style={{ 'color': colors.textMuted, 'font-weight': '400' }}>
                {catChecked}/{items.length}
              </span>
            </div>

            {items.map((item) => {
              const isChecked = checked().has(item.id);

              return (
                <DiagramTooltip content={item.tooltip}>
                  <div
                    onClick={() => toggleItem(item.id)}
                    style={{
                      'display': 'flex',
                      'align-items': 'center',
                      'gap': '8px',
                      'padding': '5px 8px',
                      'margin-bottom': '2px',
                      'border-radius': '4px',
                      'cursor': 'pointer',
                      'transition': 'all 0.15s',
                    }}
                  >
                    <div style={{
                      'width': '16px',
                      'height': '16px',
                      'border-radius': '3px',
                      'border': `1.5px solid ${isChecked ? colors.success : 'rgba(255,255,255,0.2)'}`,
                      'background': isChecked ? `${colors.success}20` : 'transparent',
                      'display': 'flex',
                      'align-items': 'center',
                      'justify-content': 'center',
                      'flex-shrink': '0',
                      'transition': 'all 0.2s',
                    }}>
                      {isChecked && (
                        <span style={{ 'font-size': '10px', 'color': colors.success, 'line-height': '1' }}>
                          &#10003;
                        </span>
                      )}
                    </div>
                    <span style={{
                      'font-size': '12px',
                      'font-family': 'monospace',
                      'color': isChecked ? colors.textMuted : colors.text,
                      'text-decoration': isChecked ? 'line-through' : 'none',
                      'transition': 'all 0.2s',
                    }}>
                      {item.label}
                    </span>
                  </div>
                </DiagramTooltip>
              );
            })}
          </div>
        );
      })}

      {progress === 100 && (
        <div style={{ 'margin-top': '12px' }}>
          <DiagramTooltip content="Полный checklist аудита включает дополнительные категории: governance, upgrades (proxy patterns), token standards (ERC20/721/1155), external integrations, gas optimization.">
            <DataBox
              label="Checklist complete"
              value="Все 12 проверок пройдены. Это базовый checklist -- полный аудит включает 50+ проверок по категориям: governance, upgrades, token standards, external integrations."
              variant="highlight"
            />
          </DiagramTooltip>
        </div>
      )}
    </DiagramContainer>
  );
}
