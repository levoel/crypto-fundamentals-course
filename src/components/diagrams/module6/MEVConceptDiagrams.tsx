/** @jsxImportSource solid-js */
/**
 * MEV Concept Diagrams (SEC-05)
 *
 * Exports:
 * - MEVSupplyChainDiagram: 5-step step-through of MEV supply chain (Users -> Searchers -> Builders -> Relays -> Validators)
 * - MEVTypesTableDiagram: HTML table classifying MEV types as harmful, beneficial, or neutral
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  MEVSupplyChainDiagram                                               */
/* ================================================================== */

interface SupplyChainStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const SUPPLY_CHAIN_HISTORY: SupplyChainStep[] = [
  {
    title: 'Пользователи (Users)',
    description: 'Пользователи отправляют транзакции через кошельки (MetaMask, Rabby). Транзакции попадают в публичный mempool -- "зал ожидания" перед включением в блок. В этом mempool каждый может видеть все ожидающие транзакции, включая суммы и направления свопов.',
    values: [
      { label: 'Действие', value: 'swap 10 ETH -> DAI', color: colors.primary },
      { label: 'Куда попадает', value: 'Public mempool', color: colors.accent },
      { label: 'Видимость', value: 'Все видят', color: '#f43f5e' },
      { label: 'Защита', value: 'Нет (по умолчанию)', color: '#f43f5e' },
    ],
    highlight: 'users',
  },
  {
    title: 'Searchers (искатели MEV)',
    description: 'Searchers -- специализированные боты, мониторящие mempool 24/7. Они ищут прибыльные возможности: арбитраж между DEX, ликвидации, sandwich-атаки. Найдя возможность, searcher формирует пакет транзакций (bundle) и отправляет его block builder.',
    values: [
      { label: 'Что делают', value: 'Мониторят mempool', color: colors.accent },
      { label: 'Инструменты', value: 'MEV-боты, Flashbots', color: colors.primary },
      { label: 'Стратегии', value: 'Arb, liquidation, sandwich', color: '#f43f5e' },
      { label: 'Прибыль', value: 'Часть MEV (после tip builders)', color: colors.success },
    ],
    highlight: 'searchers',
  },
  {
    title: 'Block Builders',
    description: 'Builders получают bundles от searchers и обычные транзакции из mempool. Они собирают оптимальный блок, максимизируя общий profit. Builder конкурирует с другими builders за право предложить свой блок -- аукцион происходит каждые 12 секунд.',
    values: [
      { label: 'Что делают', value: 'Собирают блоки', color: colors.primary },
      { label: 'Входные данные', value: 'Bundles + обычные tx', color: colors.accent },
      { label: 'Оптимизация', value: 'Max profit для validator', color: colors.success },
      { label: 'Ключевые builders', value: 'Flashbots, BeaverBuild, Titan', color: colors.text },
    ],
    highlight: 'builders',
  },
  {
    title: 'Relays (посредники)',
    description: 'Relays -- доверенные посредники между builders и validators. Relay проверяет валидность блока, скрывает его содержимое от validator до момента подписи (commit-reveal). Это предотвращает "builder exploitation" -- validator не может украсть MEV, подсмотрев блок.',
    values: [
      { label: 'Что делают', value: 'Передают блоки', color: colors.primary },
      { label: 'Ключевая роль', value: 'Commit-reveal (сокрытие)', color: colors.accent },
      { label: 'Доверие', value: 'Нейтральный посредник', color: '#eab308' },
      { label: 'Примеры', value: 'Flashbots, bloXroute, Agnostic', color: colors.text },
    ],
    highlight: 'relays',
  },
  {
    title: 'Validators (валидаторы)',
    description: 'Validators (ранее miners) выбирают самый прибыльный блок из предложенных relays. Через MEV-Boost validator получает "bid" (ставку) от каждого builder. Validator подписывает блок с наивысшей ставкой и получает: базовую награду (consensus) + tips + MEV-долю.',
    values: [
      { label: 'Что делают', value: 'Подписывают блок', color: colors.primary },
      { label: 'Выбор блока', value: 'Наивысшая ставка (bid)', color: colors.accent },
      { label: 'Доход', value: 'Base reward + tips + MEV', color: colors.success },
      { label: 'MEV-Boost adoption', value: '>90% валидаторов', color: colors.success },
    ],
    highlight: 'validators',
  },
];

const CHAIN_TOOLTIPS: Record<string, string> = {
  'users': 'Пользователи — источник MEV. Каждая транзакция в mempool содержит информацию о намерении (swap, borrow, repay), которую searchers используют для извлечения прибыли.',
  'searchers': 'Searchers — боты, сканирующие mempool и блокчейн для MEV-возможностей (арбитраж, ликвидации, sandwich). Конкурируют за включение через аукцион.',
  'builders': 'Block Builders собирают транзакции и bundles в оптимальные блоки. PBS (Proposer-Builder Separation) отделяет построение блока от его предложения.',
  'relays': 'Relays обеспечивают честность между builders и validators через commit-reveal. Validator подписывает блок не зная его содержимого.',
  'validators': 'Валидаторы (proposers) выбирают блок с наибольшей выплатой из предложений builders через MEV-Boost relay.',
};

/**
 * MEVSupplyChainDiagram
 *
 * 5-step step-through of MEV supply chain.
 * Users -> Searchers -> Block Builders -> Relays -> Validators.
 * Forward/backward/reset navigation.
 */
export function MEVSupplyChainDiagram() {
  const [stepIndex, setStepIndex] = createSignal(0);
  const step = SUPPLY_CHAIN_HISTORY[stepIndex()];

  const actors = ['Users', 'Searchers', 'Builders', 'Relays', 'Validators'];
  const actorColors = [colors.textMuted, colors.accent, colors.primary, '#eab308', colors.success];
  const actorKeys = ['users', 'searchers', 'builders', 'relays', 'validators'];

  return (
    <DiagramContainer title="MEV Supply Chain: 5 участников" color="purple">
      {/* Visual chain */}
      <div style={{ 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'gap': '4px', 'margin-bottom': '16px', 'flex-wrap': 'wrap' }}>
        {actors.map((actor, i) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '4px' }}>
            <DiagramTooltip content={CHAIN_TOOLTIPS[actorKeys[i]]}>
              <div
                onClick={() => setStepIndex(i)}
                style={{
                  'padding': '6px 10px',
                  'border-radius': '6px',
                  'background': i === stepIndex() ? `${actorColors[i]}20` : 'rgba(255,255,255,0.03)',
                  'border': `1px solid ${i === stepIndex() ? actorColors[i] : 'rgba(255,255,255,0.08)'}`,
                  'cursor': 'pointer',
                  'font-size': '11px',
                  'font-family': 'monospace',
                  'color': i <= stepIndex() ? actorColors[i] : colors.textMuted,
                  'font-weight': i === stepIndex() ? 600 : 400,
                  'transition': 'all 0.2s',
                }}
              >
                {actor}
              </div>
            </DiagramTooltip>
            {i < actors.length - 1 && (
              <span style={{ 'color': i < stepIndex() ? colors.success : 'rgba(255,255,255,0.15)', 'font-size': '14px' }}>
                {'\u2192'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {SUPPLY_CHAIN_HISTORY.map((_, i) => (
          <div
            onClick={() => setStepIndex(i)}
            style={{
              'flex': '1',
              'height': '4px',
              'border-radius': '2px',
              'cursor': 'pointer',
              'background': i <= stepIndex() ? colors.accent : 'rgba(255,255,255,0.1)',
              'transition': 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <DiagramTooltip content={CHAIN_TOOLTIPS[step.highlight] || step.description.slice(0, 120)}>
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
        'margin-bottom': '16px',
      }}>
        {step.values.map((v, i) => (
          <div style={{
            ...glassStyle,
            'padding': '10px',
          }}>
            <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              {v.label}
            </div>
            <div style={{ 'font-size': '13px', 'color': v.color, 'font-family': 'monospace', 'font-weight': '600' }}>
              {v.value}
            </div>
          </div>
        ))}
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
            onClick={() => setStepIndex((s) => Math.min(SUPPLY_CHAIN_HISTORY.length - 1, s + 1))}
            disabled={stepIndex() >= SUPPLY_CHAIN_HISTORY.length - 1}
            style={{
              ...glassStyle,
              'padding': '8px 20px',
              'cursor': stepIndex() >= SUPPLY_CHAIN_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
              'color': stepIndex() >= SUPPLY_CHAIN_HISTORY.length - 1 ? colors.textMuted : colors.success,
              'font-size': '13px',
              'opacity': stepIndex() >= SUPPLY_CHAIN_HISTORY.length - 1 ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>
      </div>

      {stepIndex() >= SUPPLY_CHAIN_HISTORY.length - 1 && (
        <div style={{ 'margin-top': '12px' }}>
          <DiagramTooltip content="PBS (Proposer-Builder Separation) — архитектурное решение Ethereum для разделения ролей. Validators не строят блоки сами, а выбирают лучший блок из предложенных builders.">
            <DataBox
              label="Ключевой вывод"
              value="MEV supply chain разделяет роли: searchers ищут возможности, builders собирают блоки, relays обеспечивают честность, validators подписывают. Это PBS (Proposer-Builder Separation)."
              variant="highlight"
            />
          </DiagramTooltip>
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MEVTypesTableDiagram                                                */
/* ================================================================== */

interface MEVType {
  name: string;
  category: 'harmful' | 'beneficial' | 'neutral';
  description: string;
  example: string;
  impact: string;
  profit: string;
}

const MEV_TYPES: MEVType[] = [
  {
    name: 'Sandwich Attack',
    category: 'harmful',
    description: 'Frontrun + backrun вокруг жертвы. Атакующий покупает перед жертвой (поднимая цену) и продает после (забирая прибыль).',
    example: 'Жертва свопит 10 ETH -> DAI. Searcher: buy DAI -> victim tx -> sell DAI.',
    impact: 'Жертва получает меньше токенов. Потери $10-$10,000+ за транзакцию.',
    profit: '$100 - $50,000 за атаку',
  },
  {
    name: 'Frontrunning (displacement)',
    category: 'harmful',
    description: 'Копирование прибыльной транзакции жертвы и выполнение ее раньше с более высоким gas price.',
    example: 'Жертва нашла арбитраж ETH/DAI. Searcher копирует calldata и ставит выше gas.',
    impact: 'Оригинальный трейдер теряет прибыль полностью. Его tx ревертится.',
    profit: '$50 - $100,000',
  },
  {
    name: 'Arbitrage',
    category: 'beneficial',
    description: 'Выравнивание цен между DEX. Если ETH стоит 2000 на Uniswap и 2010 на Sushiswap -- searcher покупает дешево и продает дорого.',
    example: 'Buy ETH @2000 Uniswap -> Sell ETH @2010 Sushiswap. Profit: $10/ETH.',
    impact: 'Улучшает price discovery. Цены на разных DEX сходятся.',
    profit: '$1 - $500,000',
  },
  {
    name: 'Liquidation',
    category: 'beneficial',
    description: 'Ликвидация undercollateralized позиций в lending-протоколах. Searcher погашает долг заемщика и получает бонус.',
    example: 'HF < 1 на Aave. Searcher repay 50% долга, получает collateral + 5% бонус.',
    impact: 'Защищает протокол от bad debt. Необходимо для стабильности DeFi.',
    profit: '$10 - $1,000,000',
  },
  {
    name: 'JIT Liquidity',
    category: 'neutral',
    description: 'Just-In-Time ликвидность: searcher добавляет ликвидность в Uniswap V3 на 1 блок перед крупным свопом и убирает после.',
    example: 'Крупный своп 100 ETH. JIT: addLiquidity -> swap executes -> removeLiquidity.',
    impact: 'Трейдер получает лучшую цену, но постоянные LP теряют комиссии.',
    profit: '$10 - $10,000',
  },
];

const MEV_TYPE_TOOLTIPS: Record<string, string> = {
  'Sandwich Attack': 'Sandwich attack — frontrun + backrun вокруг жертвы. Бот покупает актив до жертвы (поднимая цену) и продаёт после (по завышенной цене). Защита: private mempool (Flashbots Protect), high slippage tolerance awareness.',
  'Frontrunning (displacement)': 'Frontrunning — выполнение транзакции ДО жертвы с целью извлечения прибыли из ценового движения. Бот копирует выгодную TX с более высоким gas.',
  'Arbitrage': 'DEX-арбитраж — покупка токена на DEX с низкой ценой и продажа на DEX с высокой. Выравнивает цены между площадками. Наименее вредный тип MEV.',
  'Liquidation': 'MEV-ликвидация — поиск undercollateralized позиций в lending протоколах. Ликвидатор получает дисконт (~5-15%) на залог. Необходимо для здоровья протокола.',
  'JIT Liquidity': 'JIT Liquidity — добавление ликвидности на 1 блок для захвата комиссий от крупного свопа. Серая зона: трейдер получает лучшую цену, но пассивные LP теряют доход.',
};

/**
 * MEVTypesTableDiagram
 *
 * HTML table classifying MEV types:
 * - Harmful (sandwich, displacement) in red
 * - Beneficial (arbitrage, liquidation) in green
 * - Neutral (JIT) in gray
 * DiagramTooltip with expanded detail.
 */
export function MEVTypesTableDiagram() {
  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'harmful': return '#f43f5e';
      case 'beneficial': return colors.success;
      case 'neutral': return colors.textMuted;
      default: return colors.text;
    }
  };

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'harmful': return 'Вредный';
      case 'beneficial': return 'Полезный';
      case 'neutral': return 'Нейтральный';
      default: return cat;
    }
  };

  return (
    <DiagramContainer title="Типы MEV: спектр от вредного до полезного" color="blue">
      {/* Table */}
      <div style={{ 'overflow-x': 'auto', 'margin-bottom': '16px' }}>
        <table style={{
          'width': '100%',
          'border-collapse': 'collapse',
          'font-family': 'monospace',
          'font-size': '12px',
        }}>
          <thead>
            <tr>
              {['Тип MEV', 'Категория', 'Воздействие', 'Прибыль searcher'].map((header) => (
                <th style={{
                  'padding': '10px 8px',
                  'text-align': 'left',
                  'border-bottom': '1px solid rgba(255,255,255,0.15)',
                  'color': colors.textMuted,
                  'font-weight': '600',
                  'font-size': '10px',
                  'text-transform': 'uppercase',
                  'letter-spacing': '0.05em',
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEV_TYPES.map((mev, i) => {
              const catColor = categoryColor(mev.category);

              return (
                <tr
                  style={{
                    'transition': 'all 0.2s',
                  }}
                >
                  <td style={{
                    'padding': '10px 8px',
                    'border-bottom': '1px solid rgba(255,255,255,0.06)',
                    'color': colors.text,
                    'font-weight': '600',
                  }}>
                    <DiagramTooltip content={MEV_TYPE_TOOLTIPS[mev.name] || `${mev.description} Пример: ${mev.example}`}>
                      {mev.name}
                    </DiagramTooltip>
                  </td>
                  <td style={{
                    'padding': '10px 8px',
                    'border-bottom': '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{
                      'padding': '2px 8px',
                      'border-radius': '4px',
                      'background': `${catColor}15`,
                      'color': catColor,
                      'font-size': '11px',
                      'font-weight': '600',
                    }}>
                      {categoryLabel(mev.category)}
                    </span>
                  </td>
                  <td style={{
                    'padding': '10px 8px',
                    'border-bottom': '1px solid rgba(255,255,255,0.06)',
                    'color': colors.textMuted,
                    'font-size': '11px',
                  }}>
                    {mev.impact}
                  </td>
                  <td style={{
                    'padding': '10px 8px',
                    'border-bottom': '1px solid rgba(255,255,255,0.06)',
                    'color': catColor,
                    'font-size': '11px',
                    'font-weight': '600',
                  }}>
                    {mev.profit}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <DiagramTooltip content="MEV — неизбежное свойство публичных блокчейнов с mempool. Задача — минимизировать вредный MEV (sandwich, frontrun) и поощрять полезный (arbitrage, liquidation).">
        <DataBox
          label="MEV -- это спектр"
          value="Sandwich и frontrunning вредят пользователям. Арбитраж и ликвидации необходимы для здоровья рынка. JIT -- серая зона: хорошо для трейдера, плохо для пассивных LP."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
