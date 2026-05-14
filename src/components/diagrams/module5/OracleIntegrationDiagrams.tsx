/** @jsxImportSource solid-js */
/**
 * Oracle Integration Diagrams (DEFI-09)
 *
 * Exports:
 * - StalenessCheckFlowDiagram: Staleness check decision tree with 3 checks and Solidity snippets (static with hover)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  StalenessCheckFlowDiagram                                           */
/* ================================================================== */

interface CheckStep {
  name: string;
  check: string;
  solidity: string;
  passLabel: string;
  failLabel: string;
  failAction: string;
  detail: string;
  color: string;
}

const CHECK_STEPS: CheckStep[] = [
  {
    name: 'Check 1: Price > 0',
    check: 'price > 0 ?',
    solidity: 'require(price > 0, "Invalid price");',
    passLabel: 'Yes',
    failLabel: 'No',
    failAction: 'revert "Invalid price"',
    detail: 'Chainlink может вернуть 0 или отрицательное значение при сбое фида. Нулевая цена приведет к бесплатным ликвидациям или бесконечным займам.',
    color: '#ef4444',
  },
  {
    name: 'Check 2: answeredInRound >= roundId',
    check: 'answeredInRound >= roundId ?',
    solidity: 'require(answeredInRound >= roundId, "Stale round");',
    passLabel: 'Yes',
    failLabel: 'No',
    failAction: 'revert "Stale round"',
    detail: 'Если answeredInRound < roundId, ответ был получен в предыдущем раунде -- фид не получил достаточно ответов от узлов DON в текущем раунде.',
    color: '#f59e0b',
  },
  {
    name: 'Check 3: Staleness (updatedAt)',
    check: 'block.timestamp - updatedAt < maxStaleness ?',
    solidity: 'require(block.timestamp - updatedAt < 3600, "Stale price");',
    passLabel: 'Yes',
    failLabel: 'No',
    failAction: 'revert "Stale price"',
    detail: 'Проверяет, что данные обновлены недавно. maxStaleness зависит от heartbeat фида. Для ETH/USD (heartbeat 3600s) ставьте 3600-7200. Слишком маленькое значение вызовет ложные revert.',
    color: '#a78bfa',
  },
];

/**
 * StalenessCheckFlowDiagram
 *
 * Decision tree for oracle price validation: 3 checks with Solidity code snippets.
 * Shows the flow: latestRoundData() -> check1 -> check2 -> check3 -> use price.
 */
export function StalenessCheckFlowDiagram() {
  const [selectedCheck, setSelectedCheck] = createSignal<number | null>(null);

  return (
    <DiagramContainer title="Проверка свежести: decision tree" color="purple">
      {/* Entry point */}
      <DiagramTooltip content="Вызов latestRoundData() у Chainlink price feed. Возвращает answer (цена), updatedAt (timestamp), roundId. Точка входа для всех проверок свежести данных.">
        <div style={{
          ...glassStyle,
          'padding': '12px',
          'margin-bottom': '12px',
          'text-align': 'center',
          'background': `${colors.primary}08`,
          'border': `1px solid ${colors.primary}20`,
        }}>
          <div style={{ 'font-size': '12px', 'font-family': 'monospace', 'font-weight': '600', 'color': colors.primary }}>
            latestRoundData()
          </div>
          <div style={{ 'font-size': '11px', 'font-family': 'monospace', 'color': colors.textMuted, 'margin-top': '4px' }}>
            (roundId, price, startedAt, updatedAt, answeredInRound)
          </div>
        </div>
      </DiagramTooltip>

      {/* Check steps */}
      {CHECK_STEPS.map((step, i) => {
        const isSelected = selectedCheck() === i;

        return (
          <div style={{ 'margin-bottom': '12px' }}>
            {/* Arrow down */}
            <div style={{ 'text-align': 'center', 'color': 'rgba(255,255,255,0.2)', 'font-size': '14px', 'margin-bottom': '4px' }}>
              |
            </div>

            {/* Check box */}
            <DiagramTooltip content={step.detail}>
            <div
              onClick={() => setSelectedCheck(isSelected ? null : i)}
              style={{
                ...glassStyle,
                'padding': '14px',
                'cursor': 'pointer',
                'background': isSelected ? `${step.color}10` : 'rgba(255,255,255,0.03)',
                'border': `1px solid ${isSelected ? step.color : 'rgba(255,255,255,0.08)'}`,
                'transition': 'all 0.2s',
              }}
            >
              {/* Check name */}
              <div style={{
                'font-size': '12px',
                'font-weight': '600',
                'color': step.color,
                'font-family': 'monospace',
                'margin-bottom': '6px',
              }}>
                {step.name}
              </div>

              {/* Decision */}
              <div style={{
                'display': 'flex',
                'align-items': 'center',
                'gap': '12px',
                'margin-bottom': '8px',
              }}>
                <div style={{
                  ...glassStyle,
                  'padding': '6px 12px',
                  'font-size': '12px',
                  'font-family': 'monospace',
                  'font-weight': '600',
                  'color': colors.text,
                  'flex': '1',
                  'text-align': 'center',
                }}>
                  {step.check}
                </div>
              </div>

              {/* Pass/Fail branches */}
              <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '8px', 'margin-bottom': '8px' }}>
                <div style={{
                  ...glassStyle,
                  'padding': '6px 10px',
                  'text-align': 'center',
                  'background': `${colors.success}08`,
                  'border': `1px solid ${colors.success}20`,
                }}>
                  <div style={{ 'font-size': '10px', 'color': colors.success, 'font-weight': '600', 'font-family': 'monospace' }}>
                    {step.passLabel} -- continue
                  </div>
                </div>
                <div style={{
                  ...glassStyle,
                  'padding': '6px 10px',
                  'text-align': 'center',
                  'background': '#ef444408',
                  'border': '1px solid #ef444420',
                }}>
                  <div style={{ 'font-size': '10px', 'color': '#ef4444', 'font-weight': '600', 'font-family': 'monospace' }}>
                    {step.failLabel} -- {step.failAction}
                  </div>
                </div>
              </div>

              {/* Solidity code */}
              <div style={{
                ...glassStyle,
                'padding': '8px 10px',
                'font-size': '11px',
                'font-family': 'monospace',
                'color': colors.success,
                'background': 'rgba(0,0,0,0.3)',
              }}>
                {step.solidity}
              </div>

              {/* Detail on click */}
              {isSelected && (
                <div style={{
                  'margin-top': '10px',
                  'font-size': '12px',
                  'color': colors.text,
                  'line-height': '1.6',
                }}>
                  {step.detail}
                </div>
              )}
            </div>
            </DiagramTooltip>
          </div>
        );
      })}

      {/* Success box */}
      <div style={{ 'text-align': 'center', 'color': 'rgba(255,255,255,0.2)', 'font-size': '14px', 'margin-bottom': '4px' }}>
        |
      </div>
      <DiagramTooltip content="Использование цены: масштабировать до нужных decimals. Chainlink возвращает цену с feed.decimals() знаков. ETH/USD: 8 decimals, ERC-20: 18.">
        <div style={{
          ...glassStyle,
          'padding': '12px',
          'text-align': 'center',
          'background': `${colors.success}10`,
          'border': `1px solid ${colors.success}30`,
          'margin-bottom': '16px',
        }}>
          <div style={{ 'font-size': '13px', 'font-weight': '600', 'color': colors.success, 'font-family': 'monospace' }}>
            All checks passed -- Use price
          </div>
        </div>
      </DiagramTooltip>

      {/* Complete Solidity snippet */}
      <DiagramTooltip content="Полный паттерн валидации Chainlink. Три require -- минимальный стандарт безопасности. Копируйте этот шаблон в каждый контракт, использующий оракулы.">
        <div style={{
          ...glassStyle,
          'padding': '12px',
          'background': 'rgba(0,0,0,0.3)',
          'margin-bottom': '16px',
        }}>
          <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'margin-bottom': '8px', 'font-family': 'monospace' }}>
            Complete validation pattern:
          </div>
          <div style={{ 'font-size': '11px', 'font-family': 'monospace', 'color': colors.text, 'line-height': '1.8', 'white-space': 'pre-wrap' }}>
{`(uint80 roundId, int256 price,,
 uint256 updatedAt,
 uint80 answeredInRound) = feed.latestRoundData();

require(price > 0, "Invalid price");
require(answeredInRound >= roundId, "Stale round");
require(block.timestamp - updatedAt < 3600, "Stale price");`}
          </div>
        </div>
      </DiagramTooltip>

      {/* L2 Note */}
      <DiagramTooltip content="L2 Sequencer Uptime Feed: дополнительная проверка для L2 сетей. Если секвенсор был offline, после восстановления цены могут быть устаревшими. Grace period предотвращает использование stale data.">
        <div style={{
          ...glassStyle,
          'padding': '14px',
          'background': '#f59e0b08',
          'border': '1px solid #f59e0b20',
          'margin-bottom': '12px',
        }}>
          <div style={{ 'font-size': '12px', 'font-weight': '600', 'color': '#f59e0b', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
            L2 Sequencer Uptime Feed
          </div>
          <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6' }}>
            На L2 (Optimism, Arbitrum) секвенсор может упасть. Когда он восстанавливается, накопившиеся транзакции исполняются с потенциально устаревшими ценами.
            Решение: проверяйте Sequencer Uptime Feed перед использованием ценового фида. Добавьте grace period (обычно 3600s) после восстановления секвенсора.
          </div>
        </div>
      </DiagramTooltip>

      <DataBox
        label="Самая частая ошибка"
        value="Вызов latestRoundData() БЕЗ каких-либо проверок. По данным аудиторов, это встречается в ~60% контрактов, использующих Chainlink."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
