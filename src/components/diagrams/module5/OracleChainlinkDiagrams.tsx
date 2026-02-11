/**
 * Oracle Chainlink Diagrams (DEFI-08)
 *
 * Exports:
 * - OracleArchitectureDiagram: Chainlink DON architecture flow (static with click-select)
 * - PriceFeedDataFlowDiagram: Price feed data flow with heartbeat and methods table (DiagramTooltip)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  OracleArchitectureDiagram                                           */
/* ================================================================== */

interface ArchStage {
  name: string;
  nameEn: string;
  description: string;
  detail: string;
  icon: string;
  color: string;
  tooltipRu: string;
}

const ARCH_STAGES: ArchStage[] = [
  {
    name: 'Источники данных',
    nameEn: 'Data Sources',
    description: 'CoinGecko, CoinMarketCap, Binance, Kraken...',
    detail: 'Каждый узел Chainlink получает цены из нескольких независимых источников (API бирж, агрегаторов). Множественные источники защищают от манипуляций одного провайдера.',
    icon: 'DB',
    color: colors.primary,
    tooltipRu: 'Data Sources: внешние API бирж и агрегаторов. Каждый узел DON запрашивает цены из нескольких источников одновременно. Множественные источники -- защита от манипуляций одного провайдера.',
  },
  {
    name: 'Узлы DON',
    nameEn: 'Chainlink Nodes (DON)',
    description: '31 независимый оператор',
    detail: 'Decentralized Oracle Network: каждый узел управляется независимым оператором (Deutsche Telekom, Swisscom, Infura и др.). Каждый агрегирует данные от нескольких источников и отправляет свой ответ on-chain.',
    icon: 'N',
    color: '#a78bfa',
    tooltipRu: 'DON: сеть независимых нод-оракулов. Каждая нода запрашивает данные из внешних API. Минимум 3 ноды для каждого price feed. Защита от manipulation.',
  },
  {
    name: 'Aggregator',
    nameEn: 'Aggregator Contract',
    description: 'Медиана от всех узлов',
    detail: 'Смарт-контракт, который собирает ответы от всех узлов DON и вычисляет медиану. Медиана устойчива к выбросам: если 1 из 31 узла врет, результат не пострадает.',
    icon: 'Ag',
    color: colors.success,
    tooltipRu: 'Aggregator: on-chain контракт, агрегирующий ответы от нод. Использует median (не average) -- устойчив к outliers и manipulated nodes.',
  },
  {
    name: 'Proxy',
    nameEn: 'Proxy Contract',
    description: 'Стабильный адрес',
    detail: 'Прокси-контракт с постоянным адресом, который указывает на текущий Aggregator. При обновлении агрегатора адрес прокси не меняется -- потребители не ломаются.',
    icon: 'Px',
    color: '#f59e0b',
    tooltipRu: 'Proxy: контракт с постоянным адресом, указывающий на текущий Aggregator. При обновлении агрегатора адрес прокси не меняется -- потребители не ломаются.',
  },
  {
    name: 'Consumer',
    nameEn: 'Your Contract',
    description: 'Ваш контракт читает цену',
    detail: 'Ваш смарт-контракт вызывает latestRoundData() через AggregatorV3Interface. Это единственная точка интеграции -- весь остальной процесс абстрагирован.',
    icon: 'Sc',
    color: '#ef4444',
    tooltipRu: 'Price Feed: конечный контракт, предоставляющий цену dApps. latestRoundData() возвращает цену, timestamp, round. Обновляется при deviation > threshold.',
  },
];

/**
 * OracleArchitectureDiagram
 *
 * Chainlink DON architecture: sources -> nodes -> aggregator -> proxy -> consumer.
 * Click on each stage to see details.
 */
export function OracleArchitectureDiagram() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const selected = selectedIdx !== null ? ARCH_STAGES[selectedIdx] : null;

  return (
    <DiagramContainer title="Chainlink: архитектура оракулов" color="blue">
      {/* Flow diagram */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        overflowX: 'auto',
        paddingBottom: 8,
        marginBottom: 16,
      }}>
        {ARCH_STAGES.map((stage, i) => {
          const isSelected = selectedIdx === i;

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Stage box */}
              <DiagramTooltip content={stage.tooltipRu}>
                <div
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                  style={{
                    ...glassStyle,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    minWidth: 110,
                    textAlign: 'center',
                    background: isSelected ? `${stage.color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? stage.color : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: `${stage.color}20`,
                    border: `1px solid ${stage.color}60`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: stage.color,
                  }}>
                    {stage.icon}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isSelected ? stage.color : colors.text,
                    fontFamily: 'monospace',
                    marginBottom: 4,
                  }}>
                    {stage.name}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: colors.textMuted,
                    lineHeight: 1.3,
                  }}>
                    {stage.description}
                  </div>
                </div>
              </DiagramTooltip>

              {/* Arrow between stages */}
              {i < ARCH_STAGES.length - 1 && (
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.3)',
                  padding: '0 2px',
                  flexShrink: 0,
                }}>
                  {'>'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected detail */}
      {selected && (
        <div style={{
          ...glassStyle,
          padding: 16,
          background: `${selected.color}08`,
          border: `1px solid ${selected.color}30`,
          marginBottom: 16,
          transition: 'all 0.3s',
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: selected.color,
            fontFamily: 'monospace',
            marginBottom: 4,
          }}>
            {selected.name} ({selected.nameEn})
          </div>
          <div style={{
            fontSize: 13,
            color: colors.text,
            lineHeight: 1.6,
          }}>
            {selected.detail}
          </div>
        </div>
      )}

      <DataBox
        label="Ключевой принцип"
        value="No single point of failure -- множество независимых узлов отправляют данные, агрегатор берет медиану. Даже если несколько узлов скомпрометированы, результат остается достоверным."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  PriceFeedDataFlowDiagram                                            */
/* ================================================================== */

interface FeedAddress {
  pair: string;
  address: string;
  decimals: number;
  heartbeat: string;
  deviation: string;
  tooltipRu: string;
}

const FEED_ADDRESSES: FeedAddress[] = [
  { pair: 'ETH/USD', address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419', decimals: 8, heartbeat: '3600s (1h)', deviation: '0.5%', tooltipRu: 'ETH/USD: heartbeat 3600s (1 час), deviation 0.5%. Обновляется если цена изменилась на 0.5% ИЛИ прошёл 1 час. Самый популярный feed.' },
  { pair: 'BTC/USD', address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c', decimals: 8, heartbeat: '3600s (1h)', deviation: '0.5%', tooltipRu: 'BTC/USD: heartbeat 3600s, deviation 0.5%. Аналогично ETH/USD. Используется для wrapped BTC pricing и cross-margin.' },
  { pair: 'USDC/USD', address: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6', decimals: 8, heartbeat: '86400s (24h)', deviation: '0.1%', tooltipRu: 'USDC/USD: heartbeat 86400s (24 часа), deviation 0.1%. Стейблкоин -- обновляется реже из-за низкой волатильности.' },
  { pair: 'DAI/USD', address: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9', decimals: 8, heartbeat: '3600s (1h)', deviation: '0.5%', tooltipRu: 'DAI/USD: heartbeat 3600s, deviation 0.5%. Алгоритмический стейблкоин -- может отклоняться от peg, поэтому обновляется чаще.' },
  { pair: 'LINK/USD', address: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c', decimals: 8, heartbeat: '3600s (1h)', deviation: '0.5%', tooltipRu: 'LINK/USD: heartbeat 3600s, deviation 0.5%. Meta -- Chainlink токен priced by Chainlink oracles.' },
];

interface MethodInfo {
  name: string;
  returns: string;
  description: string;
  tooltipRu: string;
}

const AGGREGATOR_METHODS: MethodInfo[] = [
  {
    name: 'latestRoundData()',
    returns: '(uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
    description: 'Последняя цена + метаданные раунда. answer -- цена в формате 8 decimals.',
    tooltipRu: 'latestRoundData(): возвращает (roundId, answer, startedAt, updatedAt, answeredInRound). Основной метод для получения цены. Всегда проверяйте updatedAt для staleness.',
  },
  {
    name: 'decimals()',
    returns: 'uint8',
    description: 'Количество десятичных знаков (8 для USD-пар). ETH = $2000 -> answer = 200000000000.',
    tooltipRu: 'decimals(): количество десятичных знаков в answer. ETH/USD: 8 decimals (answer 200000000000 = $2000.00). Разные feeds имеют разные decimals.',
  },
  {
    name: 'description()',
    returns: 'string',
    description: 'Описание фида, например "ETH / USD".',
    tooltipRu: 'description(): строка с описанием feed ("ETH / USD"). Используйте для верификации что подключились к правильному feed.',
  },
];

interface ReturnField {
  name: string;
  type: string;
  description: string;
  color: string;
  tooltipRu: string;
}

const RETURN_FIELDS: ReturnField[] = [
  { name: 'roundId', type: 'uint80', description: 'ID текущего раунда обновления', color: colors.textMuted, tooltipRu: 'roundId: ID раунда обновления. Проверять: answeredInRound >= roundId (ответ получен в текущем раунде). Stale rounds = потенциальная проблема.' },
  { name: 'answer', type: 'int256', description: 'Цена (8 decimals для USD). ETH=$2000 -> 200000000000', color: colors.success, tooltipRu: 'answer: цена с decimals() знаков. Для ETH/USD (8 decimals): answer = 200000000000 означает $2000.00. Всегда делить на 10^decimals().' },
  { name: 'startedAt', type: 'uint256', description: 'Timestamp начала раунда', color: colors.textMuted, tooltipRu: 'startedAt: timestamp начала текущего раунда обновления. Используется для определения задержки агрегации между startedAt и updatedAt.' },
  { name: 'updatedAt', type: 'uint256', description: 'Timestamp последнего обновления цены', color: '#f59e0b', tooltipRu: 'updatedAt: timestamp последнего обновления. Проверять: block.timestamp - updatedAt < maxStaleness. Устаревшая цена может привести к неправильным ликвидациям.' },
  { name: 'answeredInRound', type: 'uint80', description: 'Раунд, в котором был получен ответ', color: colors.textMuted, tooltipRu: 'answeredInRound: раунд, в котором был получен ответ. Если answeredInRound < roundId -- данные устарели (stale). Обязательная проверка для безопасности.' },
];

/**
 * PriceFeedDataFlowDiagram
 *
 * Price feed data flow: heartbeat, deviation, latestRoundData fields, feed addresses table.
 */
export function PriceFeedDataFlowDiagram() {
  return (
    <DiagramContainer title="Price Feed: данные и heartbeat" color="green">
      {/* Update triggers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 16,
      }}>
        <DiagramTooltip content="Heartbeat: гарантия свежести данных. Обновление происходит каждые N секунд даже при стабильной цене. ETH/USD: 3600s, USDC/USD: 86400s.">
          <div style={{
            ...glassStyle,
            padding: 12,
            background: `${colors.primary}08`,
            border: `1px solid ${colors.primary}20`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: colors.primary, fontFamily: 'monospace', marginBottom: 6 }}>
              Heartbeat
            </div>
            <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5 }}>
              Обновление каждые N секунд (ETH/USD: 3600s = 1 час). Гарантирует свежесть данных даже при стабильной цене.
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Deviation Threshold: обновление при движении цены > X%. ETH/USD: 0.5%. Обеспечивает точность при волатильности. Чем ниже порог -- тем чаще обновления и выше gas costs.">
          <div style={{
            ...glassStyle,
            padding: 12,
            background: '#f59e0b08',
            border: '1px solid #f59e0b20',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace', marginBottom: 6 }}>
              Deviation Threshold
            </div>
            <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5 }}>
              Обновление при движении цены {'>'} X% (ETH/USD: 0.5%). Обеспечивает точность при волатильности.
            </div>
          </div>
        </DiagramTooltip>
      </div>

      {/* latestRoundData return fields */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8, fontFamily: 'monospace' }}>
          latestRoundData() return values:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {RETURN_FIELDS.map((field, i) => (
            <DiagramTooltip key={i} content={field.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: field.color, minWidth: 130 }}>
                  {field.name}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: colors.textMuted, minWidth: 60 }}>
                  {field.type}
                </span>
                <span style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.4 }}>
                  {field.description}
                </span>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      {/* AggregatorV3Interface methods */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8, fontFamily: 'monospace' }}>
          AggregatorV3Interface methods:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {AGGREGATOR_METHODS.map((method, i) => (
            <DiagramTooltip key={i} content={method.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: colors.success, marginBottom: 4 }}>
                  {method.name}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, marginBottom: 4 }}>
                  returns: {method.returns}
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
                  {method.description}
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      {/* Key feed addresses table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8, fontFamily: 'monospace' }}>
          Key mainnet feed addresses:
        </div>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 60px 100px 60px',
          gap: 1,
          marginBottom: 1,
        }}>
          {['Pair', 'Address', 'Dec', 'Heartbeat', 'Dev'].map((h) => (
            <div key={h} style={{
              ...glassStyle,
              padding: '6px 8px',
              fontSize: 10,
              fontWeight: 600,
              color: colors.textMuted,
              textAlign: 'center',
            }}>
              {h}
            </div>
          ))}
        </div>
        {/* Rows */}
        {FEED_ADDRESSES.map((feed, i) => (
          <DiagramTooltip key={i} content={feed.tooltipRu}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 60px 100px 60px',
                gap: 1,
                marginBottom: 1,
              }}
            >
              <div style={{
                ...glassStyle,
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'monospace',
                color: colors.text,
                transition: 'all 0.2s',
              }}>
                {feed.pair}
              </div>
              <div style={{
                ...glassStyle,
                padding: '6px 8px',
                fontSize: 10,
                fontFamily: 'monospace',
                color: colors.textMuted,
                transition: 'all 0.2s',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {feed.address}
              </div>
              <div style={{
                ...glassStyle,
                padding: '6px 8px',
                fontSize: 11,
                fontFamily: 'monospace',
                color: colors.textMuted,
                textAlign: 'center',
              }}>
                {feed.decimals}
              </div>
              <div style={{
                ...glassStyle,
                padding: '6px 8px',
                fontSize: 10,
                fontFamily: 'monospace',
                color: colors.textMuted,
                textAlign: 'center',
              }}>
                {feed.heartbeat}
              </div>
              <div style={{
                ...glassStyle,
                padding: '6px 8px',
                fontSize: 10,
                fontFamily: 'monospace',
                color: colors.textMuted,
                textAlign: 'center',
              }}>
                {feed.deviation}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>
    </DiagramContainer>
  );
}
