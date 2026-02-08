/**
 * Flashbots Diagrams (SEC-07)
 *
 * Exports:
 * - FlashbotsProtectFlowDiagram: 4-step step-through of Flashbots Protect RPC flow
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  FlashbotsProtectFlowDiagram                                         */
/* ================================================================== */

interface FlashbotsStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const FLASHBOTS_HISTORY: FlashbotsStep[] = [
  {
    title: 'Шаг 1: Настройка Flashbots Protect RPC',
    description: 'Пользователь добавляет Flashbots Protect как custom RPC в кошелек. URL: https://rpc.flashbots.net/fast. Это занимает 30 секунд. После этого ВСЕ транзакции идут через приватный канал вместо публичного mempool. Настройка одноразовая.',
    values: [
      { label: 'RPC URL', value: 'rpc.flashbots.net/fast', color: colors.primary },
      { label: 'Chain ID', value: '1 (Ethereum mainnet)', color: colors.accent },
      { label: 'Время настройки', value: '~30 секунд', color: colors.success },
      { label: 'Стоимость', value: 'Бесплатно', color: colors.success },
    ],
    highlight: 'setup',
  },
  {
    title: 'Шаг 2: Приватная отправка транзакции',
    description: 'Вместо broadcast в публичный mempool транзакция отправляется напрямую к Flashbots. Она НИКОГДА не появляется в публичном mempool. Ни один searcher, ни один бот не видит эту транзакцию до момента включения в блок.',
    values: [
      { label: 'Маршрут', value: 'Wallet -> Flashbots (приватно)', color: colors.success },
      { label: 'Публичный mempool', value: 'Транзакция ОТСУТСТВУЕТ', color: colors.success },
      { label: 'Видимость для searchers', value: 'Нулевая', color: colors.success },
      { label: 'Sandwich возможен?', value: 'НЕТ', color: colors.success },
    ],
    highlight: 'private',
  },
  {
    title: 'Шаг 3: Block builder включает транзакцию',
    description: 'Flashbots передает транзакцию доверенным block builders. Builder включает ее в блок наравне с обычными транзакциями. Если транзакция не включена за 25 блоков (~5 минут) -- она отменяется. MEV-Boost механизм: builders конкурируют за блок.',
    values: [
      { label: 'Включение', value: 'Builder добавляет в блок', color: colors.primary },
      { label: 'Таймаут', value: '25 блоков (~5 мин)', color: '#eab308' },
      { label: 'Если не включена', value: 'Автоотмена (nonce освобожден)', color: colors.textMuted },
      { label: 'Приоритет', value: 'Стандартный (по gas price)', color: colors.accent },
    ],
    highlight: 'builder',
  },
  {
    title: 'Шаг 4: Результат и преимущества',
    description: 'Транзакция включена в блок без sandwich атаки. Пользователь получил честную цену. Дополнительный бонус: если транзакция ревертится on-chain, Flashbots НЕ включает ее в блок, и пользователь не платит газ за failed tx. 90% MEV refund возвращается пользователю.',
    values: [
      { label: 'Sandwich protection', value: 'Полная', color: colors.success },
      { label: 'Failed tx protection', value: 'Не платите газ за revert', color: colors.success },
      { label: 'MEV refund', value: '90% MEV возвращается user', color: colors.success },
      { label: 'Защищено транзакций', value: '12M+ (и растет)', color: colors.accent },
    ],
    highlight: 'result',
  },
];

/**
 * FlashbotsProtectFlowDiagram
 *
 * 4-step step-through: setup RPC -> private submission ->
 * builder inclusion -> benefits summary.
 * Forward/backward/reset navigation.
 */
export function FlashbotsProtectFlowDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = FLASHBOTS_HISTORY[stepIndex];

  return (
    <DiagramContainer title="Flashbots Protect: пошаговый flow" color="green">
      {/* Visual flow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['Setup RPC', 'Private Send', 'Builder', 'Result'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              onClick={() => setStepIndex(i)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: i === stepIndex ? `${colors.success}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === stepIndex ? colors.success : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                fontSize: 11,
                fontFamily: 'monospace',
                color: i <= stepIndex ? colors.success : colors.textMuted,
                fontWeight: i === stepIndex ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {label}
            </div>
            {i < 3 && (
              <span style={{ color: i < stepIndex ? colors.success : 'rgba(255,255,255,0.15)', fontSize: 14 }}>
                {'\u2192'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {FLASHBOTS_HISTORY.map((_, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex ? colors.success : 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: colors.text,
        marginBottom: 8,
        fontFamily: 'monospace',
      }}>
        {step.title}
      </div>

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
          onClick={() => setStepIndex((s) => Math.min(FLASHBOTS_HISTORY.length - 1, s + 1))}
          disabled={stepIndex >= FLASHBOTS_HISTORY.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= FLASHBOTS_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= FLASHBOTS_HISTORY.length - 1 ? colors.textMuted : colors.success,
            fontSize: 13,
            opacity: stepIndex >= FLASHBOTS_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= FLASHBOTS_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевой вывод"
            value="Flashbots Protect: бесплатная защита от sandwich, refund 90% MEV, и бесплатные failed tx. Добавьте rpc.flashbots.net/fast в MetaMask прямо сейчас."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}
