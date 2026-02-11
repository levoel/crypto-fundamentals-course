/**
 * Oracle Integration Diagrams (DEFI-09)
 *
 * Exports:
 * - StalenessCheckFlowDiagram: Staleness check decision tree with 3 checks and Solidity snippets (static with hover)
 */

import { useState } from 'react';
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
  const [selectedCheck, setSelectedCheck] = useState<number | null>(null);

  return (
    <DiagramContainer title="Проверка свежести: decision tree" color="purple">
      {/* Entry point */}
      <DiagramTooltip content="Вызов latestRoundData() у Chainlink price feed. Возвращает answer (цена), updatedAt (timestamp), roundId. Точка входа для всех проверок свежести данных.">
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 12,
          textAlign: 'center',
          background: `${colors.primary}08`,
          border: `1px solid ${colors.primary}20`,
        }}>
          <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: colors.primary }}>
            latestRoundData()
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.textMuted, marginTop: 4 }}>
            (roundId, price, startedAt, updatedAt, answeredInRound)
          </div>
        </div>
      </DiagramTooltip>

      {/* Check steps */}
      {CHECK_STEPS.map((step, i) => {
        const isSelected = selectedCheck === i;

        return (
          <div key={i} style={{ marginBottom: 12 }}>
            {/* Arrow down */}
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, marginBottom: 4 }}>
              |
            </div>

            {/* Check box */}
            <DiagramTooltip content={step.detail}>
            <div
              onClick={() => setSelectedCheck(isSelected ? null : i)}
              style={{
                ...glassStyle,
                padding: 14,
                cursor: 'pointer',
                background: isSelected ? `${step.color}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? step.color : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s',
              }}
            >
              {/* Check name */}
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: step.color,
                fontFamily: 'monospace',
                marginBottom: 6,
              }}>
                {step.name}
              </div>

              {/* Decision */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8,
              }}>
                <div style={{
                  ...glassStyle,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: colors.text,
                  flex: 1,
                  textAlign: 'center',
                }}>
                  {step.check}
                </div>
              </div>

              {/* Pass/Fail branches */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div style={{
                  ...glassStyle,
                  padding: '6px 10px',
                  textAlign: 'center',
                  background: `${colors.success}08`,
                  border: `1px solid ${colors.success}20`,
                }}>
                  <div style={{ fontSize: 10, color: colors.success, fontWeight: 600, fontFamily: 'monospace' }}>
                    {step.passLabel} -- continue
                  </div>
                </div>
                <div style={{
                  ...glassStyle,
                  padding: '6px 10px',
                  textAlign: 'center',
                  background: '#ef444408',
                  border: '1px solid #ef444420',
                }}>
                  <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, fontFamily: 'monospace' }}>
                    {step.failLabel} -- {step.failAction}
                  </div>
                </div>
              </div>

              {/* Solidity code */}
              <div style={{
                ...glassStyle,
                padding: '8px 10px',
                fontSize: 11,
                fontFamily: 'monospace',
                color: colors.success,
                background: 'rgba(0,0,0,0.3)',
              }}>
                {step.solidity}
              </div>

              {/* Detail on click */}
              {isSelected && (
                <div style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: colors.text,
                  lineHeight: 1.6,
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
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, marginBottom: 4 }}>
        |
      </div>
      <DiagramTooltip content="Использование цены: масштабировать до нужных decimals. Chainlink возвращает цену с feed.decimals() знаков. ETH/USD: 8 decimals, ERC-20: 18.">
        <div style={{
          ...glassStyle,
          padding: 12,
          textAlign: 'center',
          background: `${colors.success}10`,
          border: `1px solid ${colors.success}30`,
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.success, fontFamily: 'monospace' }}>
            All checks passed -- Use price
          </div>
        </div>
      </DiagramTooltip>

      {/* Complete Solidity snippet */}
      <DiagramTooltip content="Полный паттерн валидации Chainlink. Три require -- минимальный стандарт безопасности. Копируйте этот шаблон в каждый контракт, использующий оракулы.">
        <div style={{
          ...glassStyle,
          padding: 12,
          background: 'rgba(0,0,0,0.3)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8, fontFamily: 'monospace' }}>
            Complete validation pattern:
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.text, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
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
          padding: 14,
          background: '#f59e0b08',
          border: '1px solid #f59e0b20',
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace', marginBottom: 6 }}>
            L2 Sequencer Uptime Feed
          </div>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
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
