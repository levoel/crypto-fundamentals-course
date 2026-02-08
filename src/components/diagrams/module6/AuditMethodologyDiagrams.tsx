/**
 * Audit Methodology Diagrams (SEC-09)
 *
 * Exports:
 * - AuditPipelineDiagram: 4-phase step-through (scoping 10%, automated 20%, manual 60%, reporting 10%)
 * - AuditChecklistDiagram: 12 interactive checkboxes grouped by OWASP categories with progress bar
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
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

/**
 * AuditPipelineDiagram
 *
 * 4-phase step-through showing the complete audit lifecycle.
 * Key insight: automated tools find ~20%, manual review finds ~80%.
 */
export function AuditPipelineDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const phase = AUDIT_PHASES[stepIndex];

  return (
    <DiagramContainer title="Методология аудита: 4-фазный процесс" color="blue">
      {/* Phase progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {AUDIT_PHASES.map((p, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: Number(p.percentage.replace('%', '')),
              height: 6,
              borderRadius: 3,
              cursor: 'pointer',
              background: i <= stepIndex ? p.color : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s',
              position: 'relative',
            }}
            title={`${p.title} (${p.percentage})`}
          />
        ))}
      </div>

      {/* Percentage labels */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {AUDIT_PHASES.map((p, i) => (
          <div
            key={i}
            style={{
              flex: Number(p.percentage.replace('%', '')),
              textAlign: 'center',
              fontSize: 9,
              fontFamily: 'monospace',
              color: i <= stepIndex ? p.color : colors.textMuted,
              fontWeight: i === stepIndex ? 700 : 400,
            }}
          >
            {p.percentage}
          </div>
        ))}
      </div>

      {/* Phase title */}
      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: phase.color,
        marginBottom: 8,
        fontFamily: 'monospace',
      }}>
        {phase.title} ({phase.percentage} времени)
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: colors.text,
        lineHeight: 1.6,
        marginBottom: 14,
      }}>
        {phase.description}
      </div>

      {/* Tasks list */}
      <div style={{
        ...glassStyle,
        padding: 12,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          Задачи фазы:
        </div>
        {phase.tasks.map((task, i) => (
          <div key={i} style={{
            fontSize: 12,
            color: colors.text,
            fontFamily: 'monospace',
            padding: '3px 0',
            borderBottom: i < phase.tasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            {i + 1}. {task}
          </div>
        ))}
      </div>

      {/* Deliverable */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 14,
      }}>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            Deliverable
          </div>
          <div style={{ fontSize: 12, color: phase.color, fontFamily: 'monospace', fontWeight: 600 }}>
            {phase.deliverable}
          </div>
        </div>
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            % от audit time
          </div>
          <div style={{ fontSize: 18, color: phase.color, fontFamily: 'monospace', fontWeight: 700 }}>
            {phase.percentage}
          </div>
        </div>
      </div>

      {/* Insight */}
      <div style={{
        ...glassStyle,
        padding: 10,
        background: `${phase.color}08`,
        border: `1px solid ${phase.color}30`,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: phase.color, lineHeight: 1.5, fontStyle: 'italic' }}>
          {phase.insight}
        </div>
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
          onClick={() => setStepIndex((s) => Math.min(AUDIT_PHASES.length - 1, s + 1))}
          disabled={stepIndex >= AUDIT_PHASES.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= AUDIT_PHASES.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= AUDIT_PHASES.length - 1 ? colors.textMuted : phase.color,
            fontSize: 13,
            opacity: stepIndex >= AUDIT_PHASES.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= AUDIT_PHASES.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевое распределение"
            value="Инструменты: ~20% findings. Manual review: ~80% findings. Аудит БЕЗ manual review = security theater. Аудит БЕЗ инструментов = неэффективность."
            variant="highlight"
          />
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
 * Progress bar shows completion. Hover for detailed tooltips.
 */
export function AuditChecklistDiagram() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progress = (checked.size / CHECKLIST_ITEMS.length) * 100;
  const hoveredItem = CHECKLIST_ITEMS.find((item) => item.id === hoveredId);

  return (
    <DiagramContainer title="Security Audit Checklist (OWASP-based)" color="green">
      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
            Прогресс аудита
          </span>
          <span style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: progress === 100 ? colors.success : colors.accent,
            fontWeight: 600,
          }}>
            {checked.size}/{CHECKLIST_ITEMS.length} ({Math.round(progress)}%)
          </span>
        </div>
        <div style={{
          height: 6,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 3,
            background: progress === 100
              ? colors.success
              : `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Categories */}
      {CHECKLIST_CATEGORIES.map((cat) => {
        const items = CHECKLIST_ITEMS.filter((item) => item.category === cat.name);
        const catChecked = items.filter((item) => checked.has(item.id)).length;

        return (
          <div key={cat.name} style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: cat.color,
              fontFamily: 'monospace',
              marginBottom: 6,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>{cat.name}</span>
              <span style={{ color: colors.textMuted, fontWeight: 400 }}>
                {catChecked}/{items.length}
              </span>
            </div>

            {items.map((item) => {
              const isChecked = checked.has(item.id);
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 8px',
                    marginBottom: 2,
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    border: `1.5px solid ${isChecked ? colors.success : 'rgba(255,255,255,0.2)'}`,
                    background: isChecked ? `${colors.success}20` : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}>
                    {isChecked && (
                      <span style={{ fontSize: 10, color: colors.success, lineHeight: 1 }}>
                        &#10003;
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: isChecked ? colors.textMuted : colors.text,
                    textDecoration: isChecked ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Hover tooltip */}
      {hoveredItem && (
        <div style={{
          ...glassStyle,
          padding: 10,
          marginTop: 8,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.2s',
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            {hoveredItem.category}: {hoveredItem.label}
          </div>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5 }}>
            {hoveredItem.tooltip}
          </div>
        </div>
      )}

      {progress === 100 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Checklist complete"
            value="Все 12 проверок пройдены. Это базовый checklist -- полный аудит включает 50+ проверок по категориям: governance, upgrades, token standards, external integrations."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}
