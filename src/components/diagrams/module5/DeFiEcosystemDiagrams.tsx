/** @jsxImportSource solid-js */
/**
 * DeFi Ecosystem Diagrams (DEFI-01)
 *
 * Exports:
 * - DeFiCategoryMapDiagram: DeFi ecosystem category map with 7 categories (static with hover)
 * - TVLComparisonDiagram: Total Value Locked comparison bar chart (static with hover)
 * - AMMvsOrderbookDiagram: AMM vs traditional order book comparison table (static with hover)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  DeFiCategoryMapDiagram                                              */
/* ================================================================== */

interface DeFiCategory {
  name: string;
  nameEn: string;
  protocols: string[];
  description: string;
  detail: string;
  color: string;
  icon: string;
}

const DEFI_CATEGORIES: DeFiCategory[] = [
  {
    name: 'DEXes (AMM)',
    nameEn: 'Decentralized Exchanges',
    protocols: ['Uniswap', 'Curve', 'Balancer'],
    description: 'Обмен токенов через пулы ликвидности',
    detail: 'Вместо ордер-бука используют математические формулы (AMM). Любой может стать провайдером ликвидности и получать комиссии с каждой сделки. Uniswap обрабатывает миллиарды долларов ежемесячно.',
    color: colors.primary,
    icon: '🔄',
  },
  {
    name: 'Lending',
    nameEn: 'Lending & Borrowing',
    protocols: ['Aave', 'Compound', 'Sky (MakerDAO)'],
    description: 'Займы и кредитование без посредников',
    detail: 'Депозит токенов для получения процентов или использование залога для займа. Процентные ставки устанавливаются алгоритмически на основе спроса и предложения. Aave управляет более $20B активов.',
    color: '#a78bfa',
    icon: '🏦',
  },
  {
    name: 'Stablecoins',
    nameEn: 'Stablecoins',
    protocols: ['USDT', 'USDC', 'DAI/USDS'],
    description: 'Токены с привязкой к доллару',
    detail: 'Три типа: фиатные (USDC -- обеспечен долларами), крипто-обеспеченные (DAI -- залог в ETH/WBTC), алгоритмические (устанавливают привязку через смарт-контракты). Без стейблкоинов DeFi не мог бы функционировать.',
    color: '#a78bfa',
    icon: '💲',
  },
  {
    name: 'Derivatives',
    nameEn: 'Derivatives & Perpetuals',
    protocols: ['dYdX', 'GMX', 'Hyperliquid'],
    description: 'Бессрочные фьючерсы и опционы',
    detail: 'Торговля с кредитным плечом (до 50x) без центрального посредника. Бессрочные фьючерсы (perpetuals) -- самый популярный инструмент: нет срока экспирации, funding rate привязывает цену к спотовой.',
    color: '#f59e0b',
    icon: '📊',
  },
  {
    name: 'Oracles',
    nameEn: 'Oracles',
    protocols: ['Chainlink', 'Pyth', 'UMA'],
    description: 'Внешние данные на блокчейне',
    detail: 'Смарт-контракты не могут получить данные извне блокчейна. Оракулы доставляют цены, погоду, результаты событий. Chainlink -- крупнейшая сеть оракулов с тысячами узлов, обеспечивающих данные для DeFi.',
    color: colors.success,
    icon: '🔮',
  },
  {
    name: 'Aggregators',
    nameEn: 'DEX Aggregators',
    protocols: ['1inch', 'Paraswap', 'CoW Swap'],
    description: 'Лучшая цена с нескольких DEX',
    detail: 'Разбивают крупные ордера по нескольким DEX для получения лучшей цены. Алгоритмы оптимизации маршрутов находят оптимальный путь обмена, минимизируя проскальзывание и комиссии.',
    color: colors.primary,
    icon: '🔀',
  },
  {
    name: 'Yield',
    nameEn: 'Yield Optimization',
    protocols: ['Yearn', 'Convex', 'Lido'],
    description: 'Автоматическая оптимизация доходности',
    detail: 'Автоматически перемещают капитал между протоколами для максимизации доходности. Yearn находит лучшие ставки. Lido предлагает ликвидный стейкинг ETH (stETH). Convex оптимизирует доходность на Curve.',
    color: '#f59e0b',
    icon: '📈',
  },
];

const COMPOSABILITY_ARROWS = [
  { from: 0, to: 5, label: 'DEX -> Aggregator' },
  { from: 0, to: 1, label: 'DEX -> Lending' },
  { from: 1, to: 6, label: 'Lending -> Yield' },
  { from: 4, to: 1, label: 'Oracle -> Lending' },
  { from: 4, to: 3, label: 'Oracle -> Derivatives' },
];

/**
 * DeFiCategoryMapDiagram
 *
 * Grid of 7 DeFi categories with hover details and composability arrows.
 */
export function DeFiCategoryMapDiagram() {
  const [selectedIdx, setSelectedIdx] = createSignal<number | null>(null);

  const selected = selectedIdx() !== null ? DEFI_CATEGORIES[selectedIdx()] : null;

  return (
    <DiagramContainer title="DeFi экосистема: 7 категорий протоколов" color="blue">
      {/* Category grid */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': 'repeat(auto-fill, minmax(180px, 1fr))',
        'gap': '10px',
        'margin-bottom': '16px',
      }}>
        {DEFI_CATEGORIES.map((cat, i) => {
          const isSelected = selectedIdx() === i;

          return (
            <DiagramTooltip content={cat.detail}>
              <div
                onClick={() => setSelectedIdx(isSelected ? null : i)}
                style={{
                  ...glassStyle,
                  'padding': '14px',
                  'cursor': 'pointer',
                  'background': isSelected ? `${cat.color}15` : 'rgba(255,255,255,0.03)',
                  'border': `1px solid ${isSelected ? cat.color : 'rgba(255,255,255,0.08)'}`,
                  'transition': 'all 0.2s',
                }}
              >
                <div style={{ 'font-size': '20px', 'margin-bottom': '6px' }}>{cat.icon}</div>
                <div style={{
                  'font-size': '13px',
                  'font-weight': '600',
                  'color': isSelected ? cat.color : colors.text,
                  'font-family': 'monospace',
                  'margin-bottom': '4px',
                }}>
                  {cat.name}
                </div>
                <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'margin-bottom': '8px', 'line-height': '1.4' }}>
                  {cat.description}
                </div>
                <div style={{ 'display': 'flex', 'flex-wrap': 'wrap', 'gap': '4px' }}>
                  {cat.protocols.map((p, j) => (
                    <span
                      style={{
                        'font-size': '10px',
                        'font-family': 'monospace',
                        'padding': '2px 6px',
                        'border-radius': '4px',
                        'background': `${cat.color}15`,
                        'color': cat.color,
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Selected category detail */}
      {selected && (
        <div style={{
          ...glassStyle,
          'padding': '16px',
          'background': `${selected.color}08`,
          'border': `1px solid ${selected.color}30`,
          'margin-bottom': '16px',
          'transition': 'all 0.3s',
        }}>
          <div style={{
            'font-size': '14px',
            'font-weight': '600',
            'color': selected.color,
            'font-family': 'monospace',
            'margin-bottom': '4px',
          }}>
            {selected.name} ({selected.nameEn})
          </div>
          <div style={{
            'font-size': '13px',
            'color': colors.text,
            'line-height': '1.6',
          }}>
            {selected.detail}
          </div>
        </div>
      )}

      {/* Composability arrows */}
      <DiagramTooltip content="Композируемость (DeFi Legos): протоколы комбинируются как строительные блоки. Один протокол использует выходы другого. Это фундаментальное свойство DeFi на одном блокчейне.">
      <div style={{
        ...glassStyle,
        'padding': '12px',
        'background': 'rgba(255,255,255,0.02)',
        'border': '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ 'font-size': '12px', 'color': colors.textMuted, 'margin-bottom': '8px', 'font-weight': '600' }}>
          Композируемость (DeFi Legos):
        </div>
        <div style={{ 'display': 'flex', 'flex-wrap': 'wrap', 'gap': '8px' }}>
          {COMPOSABILITY_ARROWS.map((arrow, i) => (
            <div
              style={{
                'font-size': '11px',
                'font-family': 'monospace',
                'padding': '4px 8px',
                'border-radius': '4px',
                'background': 'rgba(255,255,255,0.05)',
                'color': colors.primary,
              }}
            >
              {DEFI_CATEGORIES[arrow.from].name.split(' ')[0]} → {DEFI_CATEGORIES[arrow.to].name.split(' ')[0]}
            </div>
          ))}
        </div>
        <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'margin-top': '8px', 'line-height': '1.5' }}>
          Протоколы комбинируются как Lego: депозит в Aave дает aToken, который можно использовать как залог в MakerDAO, а полученный DAI -- инвестировать в Yearn для максимальной доходности.
        </div>
      </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  TVLComparisonDiagram                                                */
/* ================================================================== */

interface TVLProtocol {
  name: string;
  tvl: number;
  category: string;
  chain: string;
  description: string;
  color: string;
}

const TVL_PROTOCOLS: TVLProtocol[] = [
  {
    name: 'Lido',
    tvl: 33,
    category: 'Yield (Liquid Staking)',
    chain: 'Ethereum',
    description: 'Ликвидный стейкинг ETH. Депозит ETH, получение stETH, участие в DeFi.',
    color: '#00a3ff',
  },
  {
    name: 'Aave',
    tvl: 20,
    category: 'Lending',
    chain: 'Multi-chain',
    description: 'Крупнейший протокол кредитования. Поддерживает более 100 активов на 7 сетях.',
    color: '#b6509e',
  },
  {
    name: 'EigenLayer',
    tvl: 15,
    category: 'Restaking',
    chain: 'Ethereum',
    description: 'Restaking ETH для защиты дополнительных сервисов (AVS). Новая парадигма безопасности.',
    color: '#1d0040',
  },
  {
    name: 'Sky (MakerDAO)',
    tvl: 8,
    category: 'Stablecoins',
    chain: 'Ethereum',
    description: 'Эмитент DAI/USDS -- крупнейшего крипто-обеспеченного стейблкоина.',
    color: '#1aab9b',
  },
  {
    name: 'Uniswap',
    tvl: 5,
    category: 'DEX (AMM)',
    chain: 'Multi-chain',
    description: 'Крупнейший DEX. Пионер формулы xy=k. V3 -- концентрированная ликвидность.',
    color: '#ff007a',
  },
  {
    name: 'Compound',
    tvl: 3,
    category: 'Lending',
    chain: 'Ethereum',
    description: 'Первый крупный lending протокол. Пионер алгоритмических процентных ставок.',
    color: '#00d395',
  },
];

const MAX_TVL = Math.max(...TVL_PROTOCOLS.map((p) => p.tvl));

/**
 * TVLComparisonDiagram
 *
 * Horizontal bar chart of approximate TVL for top DeFi protocols.
 * Hover shows: category, main chain, brief description.
 */
export function TVLComparisonDiagram() {
  return (
    <DiagramContainer title="TVL: капитал в DeFi протоколах" color="green">
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '8px', 'margin-bottom': '12px' }}>
        {TVL_PROTOCOLS.map((protocol, i) => {
          const widthPercent = (protocol.tvl / MAX_TVL) * 100;

          return (
            <DiagramTooltip content={`${protocol.category} (${protocol.chain}). ${protocol.description}`}>
              <div
                style={{
                  ...glassStyle,
                  'padding': '10px 14px',
                  'background': 'rgba(255,255,255,0.02)',
                  'border': '1px solid rgba(255,255,255,0.06)',
                  'transition': 'all 0.2s',
                }}
              >
                {/* Protocol name and TVL */}
                <div style={{
                  'display': 'flex',
                  'justify-content': 'space-between',
                  'align-items': 'center',
                  'margin-bottom': '6px',
                }}>
                  <span style={{
                    'font-size': '13px',
                    'font-weight': '600',
                    'font-family': 'monospace',
                    'color': colors.text,
                  }}>
                    {protocol.name}
                  </span>
                  <span style={{
                    'font-size': '13px',
                    'font-weight': '600',
                    'font-family': 'monospace',
                    'color': colors.textMuted,
                  }}>
                    ~${protocol.tvl}B
                  </span>
                </div>

                {/* Bar */}
                <div style={{
                  'height': '6px',
                  'border-radius': '3px',
                  'background': 'rgba(255,255,255,0.05)',
                  'overflow': 'hidden',
                }}>
                  <div style={{
                    'width': `${widthPercent}%`,
                    'height': '100%',
                    'border-radius': '3px',
                    'background': `${protocol.color}80`,
                    'transition': 'all 0.3s',
                  }} />
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div style={{
        'font-size': '11px',
        'color': colors.textMuted,
        'font-style': 'italic',
        'text-align': 'center',
      }}>
        TVL данные приблизительные и меняются ежедневно. Источник: DeFiLlama
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AMMvsOrderbookDiagram                                               */
/* ================================================================== */

interface ComparisonRow {
  criterion: string;
  orderbook: string;
  amm: string;
  detail: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    criterion: 'Ликвидность',
    orderbook: 'Market makers (профессиональные трейдеры)',
    amm: 'Liquidity providers (любой пользователь)',
    detail: 'В AMM любой может стать провайдером ликвидности, депонировав пару токенов в пул.',
  },
  {
    criterion: 'Ценообразование',
    orderbook: 'Bid/ask спред (заявки покупателей и продавцов)',
    amm: 'Формула (xy = k определяет цену)',
    detail: 'AMM использует математическую формулу вместо матчинга ордеров. Цена определяется соотношением резервов.',
  },
  {
    criterion: 'Скорость',
    orderbook: 'Instant matching (микросекунды)',
    amm: 'Block confirmation (12 сек Ethereum)',
    detail: 'CEX матчат ордера в памяти. AMM ждет включения транзакции в блок.',
  },
  {
    criterion: 'KYC',
    orderbook: 'Обязателен (паспорт, адрес)',
    amm: 'Не требуется (только кошелек)',
    detail: 'Permissionless доступ -- ключевое свойство DeFi. Любой кошелек может торговать.',
  },
  {
    criterion: 'Кастодиальность',
    orderbook: 'Биржа хранит средства',
    amm: 'Пользователь контролирует средства',
    detail: 'Non-custodial: средства в смарт-контракте, а не на балансе компании. "Not your keys, not your coins".',
  },
  {
    criterion: 'Листинг',
    orderbook: 'Биржа решает (заявка, аудит, листинг)',
    amm: 'Permissionless (любой создает пул)',
    detail: 'На Uniswap любой может создать пул для любого ERC-20 токена. Это и плюс (доступность), и минус (scam-токены).',
  },
  {
    criterion: 'Проскальзывание',
    orderbook: 'Низкое для ликвидных пар',
    amm: 'Зависит от размера пула',
    detail: 'Price impact в AMM: чем больше сделка относительно пула, тем хуже цена. Формула: dx/(x+dx).',
  },
  {
    criterion: 'Доход LP',
    orderbook: 'N/A (только для трейдеров)',
    amm: 'Комиссии с каждого свопа (0.3%)',
    detail: 'LP получают долю от всех комиссий пропорционально своей доле в пуле. Но есть риск impermanent loss.',
  },
];

/**
 * AMMvsOrderbookDiagram
 *
 * Comparison table: Order Book (CEX) vs AMM (DEX).
 * Follows established HTML comparison table pattern.
 */
export function AMMvsOrderbookDiagram() {
  return (
    <DiagramContainer title="AMM vs Order Book: сравнение моделей" color="purple">
      {/* Table header */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '1fr 1fr 1fr',
        'gap': '1px',
        'margin-bottom': '1px',
      }}>
        <div style={{
          ...glassStyle,
          'padding': '10px 12px',
          'font-size': '12px',
          'font-weight': '600',
          'color': colors.textMuted,
          'text-align': 'center',
        }}>
          Критерий
        </div>
        <div style={{
          ...glassStyle,
          'padding': '10px 12px',
          'font-size': '12px',
          'font-weight': '600',
          'color': '#eab308',
          'text-align': 'center',
          'background': '#eab30808',
        }}>
          Order Book (CEX)
        </div>
        <div style={{
          ...glassStyle,
          'padding': '10px 12px',
          'font-size': '12px',
          'font-weight': '600',
          'color': colors.success,
          'text-align': 'center',
          'background': `${colors.success}08`,
        }}>
          AMM (DEX)
        </div>
      </div>

      {/* Table rows */}
      {COMPARISON_ROWS.map((row, i) => (
        <div
          style={{ 'margin-bottom': '1px' }}
        >
          <div style={{
            'display': 'grid',
            'grid-template-columns': '1fr 1fr 1fr',
            'gap': '1px',
          }}>
            <div style={{
              ...glassStyle,
              'padding': '8px 12px',
              'font-size': '12px',
              'font-weight': '600',
              'color': colors.text,
              'font-family': 'monospace',
              'display': 'flex',
              'align-items': 'center',
            }}>
              <DiagramTooltip content={row.detail}>
                <span>{row.criterion}</span>
              </DiagramTooltip>
            </div>
            <div style={{
              ...glassStyle,
              'padding': '8px 12px',
              'font-size': '11px',
              'color': colors.textMuted,
              'background': 'rgba(255,255,255,0.02)',
              'line-height': '1.4',
            }}>
              {row.orderbook}
            </div>
            <div style={{
              ...glassStyle,
              'padding': '8px 12px',
              'font-size': '11px',
              'color': colors.textMuted,
              'background': 'rgba(255,255,255,0.02)',
              'line-height': '1.4',
            }}>
              {row.amm}
            </div>
          </div>
        </div>
      ))}
    </DiagramContainer>
  );
}
