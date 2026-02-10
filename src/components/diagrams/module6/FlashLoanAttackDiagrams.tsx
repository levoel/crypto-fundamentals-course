/**
 * Flash Loan Attack Diagrams (SEC-08)
 *
 * Exports:
 * - FlashLoanAttackStepsDiagram: 8-step step-through of flash loan oracle manipulation attack
 * - DeFiAttacksTimelineDiagram: Static timeline of 5 major flash loan attacks ($500M+ total)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  FlashLoanAttackStepsDiagram                                         */
/* ================================================================== */

interface AttackStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const ATTACK_HISTORY: AttackStep[] = [
  {
    title: 'Контекст: уязвимый протокол',
    description: 'LendingProtocolX использует spot price с Uniswap V2 как oracle для расчета залога. getPrice() вызывает getReserves() и делит одно на другое. Это ГЛАВНАЯ уязвимость: spot price можно манипулировать в рамках одной транзакции.',
    values: [
      { label: 'Oracle протокола', value: 'Uniswap V2 getReserves()', color: '#f43f5e' },
      { label: 'Правильный oracle', value: 'Chainlink price feed', color: colors.success },
      { label: 'Уязвимость', value: 'Spot price = manipulable', color: '#f43f5e' },
      { label: 'TVL протокола', value: '$10,000,000', color: colors.accent },
    ],
    highlight: 'context',
  },
  {
    title: 'Шаг 1: Borrow flash loan',
    description: 'Атакующий занимает 10,000 ETH через flash loan от Aave. Flash loan выдается БЕЗ залога, но должен быть возвращен в той же транзакции. Если не возвращен -- ВСЯ транзакция ревертится. Комиссия: 0.09% (9 ETH).',
    values: [
      { label: 'Источник', value: 'Aave V3 flash loan', color: colors.primary },
      { label: 'Сумма', value: '10,000 ETH (~$20M)', color: colors.accent },
      { label: 'Залог', value: '0 (без залога!)', color: '#f43f5e' },
      { label: 'Комиссия', value: '0.09% = 9 ETH', color: colors.textMuted },
    ],
    highlight: 'borrow',
  },
  {
    title: 'Шаг 2: Dump ETH на Uniswap',
    description: 'Атакующий продает 10,000 ETH на Uniswap V2 ETH/USDC пул. Этот массивный swap сдвигает цену ETH ВНИЗ. До: 1 ETH = 2,000 USDC. После: 1 ETH = 400 USDC. Spot price манипулирован в 5 раз.',
    values: [
      { label: 'Действие', value: 'swap 10,000 ETH -> USDC', color: '#f43f5e' },
      { label: 'Цена до', value: '1 ETH = 2,000 USDC', color: colors.textMuted },
      { label: 'Цена после', value: '1 ETH = 400 USDC', color: '#f43f5e' },
      { label: 'Сдвиг цены', value: '-80% (5x drop)', color: '#f43f5e' },
    ],
    highlight: 'dump',
  },
  {
    title: 'Шаг 3: Oracle протокола читает заниженную цену',
    description: 'LendingProtocolX вызывает getPrice() -- а тот читает текущие резервы Uniswap. Резервы уже сдвинуты. Oracle думает что ETH стоит $400 вместо $2,000. Позиции других пользователей теперь "undercollateralized" по мнению протокола.',
    values: [
      { label: 'Oracle видит', value: '1 ETH = 400 USDC', color: '#f43f5e' },
      { label: 'Реальная цена', value: '1 ETH = 2,000 USDC', color: colors.success },
      { label: 'Разница', value: '5x заниженная цена', color: '#f43f5e' },
      { label: 'Причина', value: 'getReserves() = текущий spot', color: '#eab308' },
    ],
    highlight: 'oracle-read',
  },
  {
    title: 'Шаг 4: Exploit -- ликвидация или дешевый borrow',
    description: 'Атакующий использует заниженную цену: 1) ликвидирует позиции других пользователей по заниженной цене, или 2) берет заем, внося минимум залога (протокол думает что ETH дешевый). Атакующий получает $5M+ в токенах.',
    values: [
      { label: 'Exploit вектор', value: 'Ликвидация по $400/ETH', color: '#f43f5e' },
      { label: 'Получено', value: '~$5,000,000 в токенах', color: colors.success },
      { label: 'Вариант 2', value: 'Borrow с минимальным залогом', color: '#f43f5e' },
      { label: 'Жертвы', value: 'Все пользователи протокола', color: '#f43f5e' },
    ],
    highlight: 'exploit',
  },
  {
    title: 'Шаг 5: Swap back на Uniswap',
    description: 'Атакующий возвращает цену в норму: покупает ETH обратно на Uniswap за USDC. Цена ETH возвращается к ~$2,000. Атакующий получает обратно свои ~10,000 ETH (с небольшим slippage).',
    values: [
      { label: 'Действие', value: 'swap USDC -> 10,000 ETH', color: colors.primary },
      { label: 'Цена возвращается', value: '~2,000 USDC/ETH', color: colors.success },
      { label: 'Slippage loss', value: '~50 ETH (~$100K)', color: colors.textMuted },
      { label: 'Net ETH', value: '~9,950 ETH', color: colors.accent },
    ],
    highlight: 'swapback',
  },
  {
    title: 'Шаг 6: Repay flash loan',
    description: 'Атакующий возвращает 10,009 ETH (loan + 0.09% комиссия). Flash loan провайдер (Aave) получает свои средства обратно. Транзакция НЕ ревертится, потому что loan погашен. Все произошло в ОДНОЙ атомарной транзакции.',
    values: [
      { label: 'Возврат', value: '10,009 ETH (loan + fee)', color: colors.primary },
      { label: 'Flash loan fee', value: '9 ETH ($18,000)', color: colors.textMuted },
      { label: 'Атомарность', value: '1 транзакция, 1 блок', color: colors.accent },
      { label: 'Revert?', value: 'НЕТ (loan погашен)', color: colors.success },
    ],
    highlight: 'repay',
  },
  {
    title: 'Итог: прибыль атакующего',
    description: 'Атакующий потратил: 9 ETH (flash loan fee) + ~50 ETH (slippage) + gas. Получил: ~$5,000,000 в токенах. Чистая прибыль: ~$4,880,000. И все это БЕЗ начального капитала. Flash loan -- не уязвимость. Уязвимость -- spot price oracle!',
    values: [
      { label: 'Расходы', value: '~$120,000 (fee+slippage+gas)', color: '#f43f5e' },
      { label: 'Доход', value: '~$5,000,000', color: colors.success },
      { label: 'Чистая прибыль', value: '~$4,880,000', color: colors.success },
      { label: 'ROOT CAUSE', value: 'Spot price oracle!', color: '#f43f5e' },
    ],
    highlight: 'profit',
  },
];

const STEP_TOOLTIPS: Record<string, string> = {
  'context': 'Spot price oracle (getReserves) — главная уязвимость. Цена в AMM пуле зависит от соотношения резервов, которое можно изменить за одну транзакцию.',
  'borrow': 'Flash loan: заимствование без залога внутри одной транзакции. Если к концу транзакции займ не возвращён — вся транзакция revert.',
  'dump': 'Атакующий использует заёмные средства для манипуляции ценой на DEX (например, swap огромного объёма на Uniswap сдвигает цену).',
  'oracle-read': 'Пока цена искажена, зависимый протокол читает неверную цену и принимает решения на основе манипулированных данных.',
  'exploit': 'Пока цена искажена, атакующий эксплуатирует зависимый протокол — получает активы по завышенной/заниженной цене.',
  'swapback': 'Возврат цены в норму: атакующий покупает обратно проданные активы. Slippage — единственная потеря на этом этапе.',
  'repay': 'Возвращает flash loan + комиссию (~0.09%). Весь profit = выручка от exploit - стоимость flash loan - gas.',
  'profit': 'Чистая прибыль без начального капитала. ROOT CAUSE — не flash loan, а spot price oracle.',
};

/**
 * FlashLoanAttackStepsDiagram
 *
 * 8-step step-through of flash loan oracle manipulation attack.
 * KEY INSIGHT: vulnerability is NOT flash loan, it's spot price oracle.
 */
export function FlashLoanAttackStepsDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = ATTACK_HISTORY[stepIndex];

  return (
    <DiagramContainer title="Flash Loan Attack: пошаговый PoC" color="red">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {ATTACK_HISTORY.map((s, i) => (
          <DiagramTooltip key={i} content={STEP_TOOLTIPS[s.highlight] || s.description.slice(0, 120)}>
            <div
              onClick={() => setStepIndex(i)}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                cursor: 'pointer',
                background: i <= stepIndex ? '#f43f5e' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
            />
          </DiagramTooltip>
        ))}
      </div>

      {/* Step title */}
      <DiagramTooltip content={STEP_TOOLTIPS[step.highlight] || step.description.slice(0, 120)}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.text,
          marginBottom: 8,
          fontFamily: 'monospace',
        }}>
          {step.title}
        </div>
      </DiagramTooltip>

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
        marginBottom: 16,
      }}>
        {step.values.map((v, i) => (
          <div key={i} style={{
            ...glassStyle,
            padding: 10,
          }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              {v.label}
            </div>
            <div style={{ fontSize: 13, color: v.color, fontFamily: 'monospace', fontWeight: 600 }}>
              {v.value}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <div>
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
        </div>
        <div>
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
        </div>
        <div>
          <button
            onClick={() => setStepIndex((s) => Math.min(ATTACK_HISTORY.length - 1, s + 1))}
            disabled={stepIndex >= ATTACK_HISTORY.length - 1}
            style={{
              ...glassStyle,
              padding: '8px 20px',
              cursor: stepIndex >= ATTACK_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
              color: stepIndex >= ATTACK_HISTORY.length - 1 ? colors.textMuted : '#f43f5e',
              fontSize: 13,
              opacity: stepIndex >= ATTACK_HISTORY.length - 1 ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>
      </div>

      {stepIndex >= ATTACK_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DiagramTooltip content="Защита от oracle manipulation: 1) Chainlink price feeds (off-chain aggregation), 2) TWAP (time-weighted average price), 3) circuit breakers при резких изменениях цены.">
            <DataBox
              label="ROOT CAUSE: spot price oracle"
              value="Flash loan -- это инструмент, НЕ уязвимость. Уязвимость = использование spot price (getReserves) как oracle. Защита: Chainlink price feeds, TWAP, timelock."
              variant="highlight"
            />
          </DiagramTooltip>
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  DeFiAttacksTimelineDiagram                                          */
/* ================================================================== */

interface AttackEvent {
  date: string;
  protocol: string;
  loss: string;
  lossNum: number;
  vector: string;
  description: string;
}

const MAJOR_ATTACKS: AttackEvent[] = [
  {
    date: 'Feb 2020',
    protocol: 'bZx',
    loss: '$8.1M',
    lossNum: 8.1,
    vector: 'Flash loan + oracle manipulation',
    description: 'Первая крупная flash loan атака. Атакующий использовал dYdX flash loan для манипуляции ценой на Uniswap V1 и bZx margin trading.',
  },
  {
    date: 'Oct 2020',
    protocol: 'Harvest Finance',
    loss: '$34M',
    lossNum: 34,
    vector: 'Flash loan + Curve pool manipulation',
    description: 'Атакующий манипулировал ценой USDC/USDT на Curve для обмана fUSDC vault. Выполнено 7 атак за 7 минут.',
  },
  {
    date: 'May 2021',
    protocol: 'PancakeBunny',
    loss: '$45M',
    lossNum: 45,
    vector: 'Flash loan + AMM price manipulation',
    description: 'Атакующий занял BNB через PancakeSwap flash swap, манипулировал ценой BUNNY/BNB и минтил BUNNY по заниженной цене.',
  },
  {
    date: 'Oct 2022',
    protocol: 'Mango Markets',
    loss: '$114M',
    lossNum: 114,
    vector: 'Oracle manipulation (perps)',
    description: 'Avraham Eisenberg манипулировал ценой MNGO через perps для завышения collateral value. Впоследствии арестован и осужден.',
  },
  {
    date: 'Mar 2023',
    protocol: 'Euler Finance',
    loss: '$197M',
    lossNum: 197,
    vector: 'Flash loan + donation attack',
    description: 'Крупнейшая flash loan атака. Атакующий использовал donation bug в eToken для создания bad debt. Позже вернул средства.',
  },
];

const TOTAL_LOSSES = MAJOR_ATTACKS.reduce((sum, a) => sum + a.lossNum, 0);
const MAX_LOSS = Math.max(...MAJOR_ATTACKS.map((a) => a.lossNum));

/**
 * DeFiAttacksTimelineDiagram
 *
 * Static timeline with 5 major flash loan attacks.
 * $500M+ total losses callout. DiagramTooltip with expanded detail.
 */
export function DeFiAttacksTimelineDiagram() {
  return (
    <DiagramContainer title="Flash Loan атаки: timeline крупнейших инцидентов" color="purple">
      {/* Total callout */}
      <DiagramTooltip content="Суммарные потери от flash loan атак значительно превышают эту цифру. Здесь показаны только 5 крупнейших. Общий ущерб от DeFi эксплойтов превышает $10B.">
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 16,
          textAlign: 'center',
          background: 'rgba(244,63,94,0.06)',
          border: '1px solid rgba(244,63,94,0.2)',
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
            Суммарные потери (только эти 5 атак)
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f43f5e', fontFamily: 'monospace' }}>
            ${TOTAL_LOSSES.toFixed(1)}M+
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginTop: 4 }}>
            Все атаки эксплуатировали oracle или price manipulation
          </div>
        </div>
      </DiagramTooltip>

      {/* Bar chart timeline */}
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 140,
        marginBottom: 16,
        padding: '0 8px',
      }}>
        {MAJOR_ATTACKS.map((attack, i) => {
          const heightPercent = 20 + (attack.lossNum / MAX_LOSS) * 70;

          return (
            <DiagramTooltip
              key={i}
              content={`${attack.protocol} (${attack.date}): ${attack.vector}. Потери: ${attack.loss}. ${attack.description}`}
            >
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  fontSize: 9,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  marginBottom: 4,
                  textAlign: 'center',
                }}>
                  {attack.loss}
                </div>
                <div style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  minHeight: 20,
                  borderRadius: '4px 4px 0 0',
                  background: '#f43f5e60',
                  transition: 'all 0.3s',
                }} />
                <div style={{
                  fontSize: 8,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  marginTop: 4,
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {attack.protocol}
                  <br />
                  {attack.date}
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      <DiagramTooltip content="Все крупнейшие flash loan атаки эксплуатируют spot price как oracle. Chainlink, TWAP и time-delayed oracles устойчивы к манипуляции внутри одной транзакции.">
        <DataBox
          label="Общий паттерн"
          value="Все крупнейшие flash loan атаки эксплуатируют одну и ту же уязвимость: spot price как oracle. Решение: Chainlink / TWAP / time-delayed oracles."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
