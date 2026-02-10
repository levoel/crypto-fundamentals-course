/**
 * Frontrunning & Sandwich Attack Diagrams (SEC-06)
 *
 * Exports:
 * - SandwichAttackDiagram: 6-step step-through with concrete numbers (10 ETH swap, frontrun, backrun)
 * - MempoolVisualizationDiagram: Interactive toggle between Public Mempool (sandwich visible) and Flashbots Protect (private)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  SandwichAttackDiagram                                               */
/* ================================================================== */

interface SandwichStep {
  title: string;
  description: string;
  values: { label: string; value: string; color: string }[];
  highlight: string;
}

const SANDWICH_HISTORY: SandwichStep[] = [
  {
    title: 'Жертва отправляет транзакцию',
    description: 'Alice хочет купить DAI за 10 ETH на Uniswap. Она отправляет транзакцию через MetaMask с amountOutMin = 0 (без защиты от slippage). Транзакция попадает в публичный mempool. Пул: 1,000 ETH / 2,000,000 DAI. Спотовая цена: 2,000 DAI/ETH.',
    values: [
      { label: 'Tx жертвы', value: 'swap 10 ETH -> DAI', color: colors.primary },
      { label: 'amountOutMin', value: '0 (НЕТ защиты!)', color: '#f43f5e' },
      { label: 'Gas price', value: '30 gwei', color: colors.textMuted },
      { label: 'Ожидаемый output', value: '~19,741 DAI', color: colors.success },
    ],
    highlight: 'victim',
  },
  {
    title: 'Шаг 1: Frontrun (атакующий покупает)',
    description: 'Searcher-бот видит транзакцию Alice в mempool. Он отправляет свою транзакцию с БОЛЕЕ ВЫСОКИМ gas price (31 gwei), чтобы она выполнилась ПЕРЕД Alice. Searcher покупает 5 ETH -> DAI, сдвигая цену вверх.',
    values: [
      { label: 'Frontrun tx', value: 'swap 5 ETH -> DAI', color: '#f43f5e' },
      { label: 'Gas price', value: '31 gwei (> 30 жертвы)', color: '#f43f5e' },
      { label: 'Searcher получает', value: '~9,920 DAI', color: colors.accent },
      { label: 'Новая цена', value: '~1,980 DAI/ETH (выше!)', color: '#eab308' },
    ],
    highlight: 'frontrun',
  },
  {
    title: 'Шаг 2: Victim tx (жертва покупает по завышенной цене)',
    description: 'Транзакция Alice выполняется ПОСЛЕ frontrun. Цена уже сдвинута searcher. Alice получает МЕНЬШЕ DAI, чем ожидала. Ее amountOutMin = 0, поэтому транзакция не ревертится, несмотря на плохую цену.',
    values: [
      { label: 'Alice свопит', value: '10 ETH -> DAI', color: colors.primary },
      { label: 'Ожидала получить', value: '~19,741 DAI', color: colors.textMuted },
      { label: 'Получила реально', value: '~19,340 DAI', color: '#f43f5e' },
      { label: 'Потеря Alice', value: '~401 DAI ($401)', color: '#f43f5e' },
    ],
    highlight: 'victim-exec',
  },
  {
    title: 'Шаг 3: Backrun (атакующий продает)',
    description: 'Сразу после транзакции Alice searcher продает свои DAI обратно за ETH. Цена DAI немного выросла после покупки Alice. Searcher получает обратно свои ETH + прибыль за вычетом gas.',
    values: [
      { label: 'Backrun tx', value: 'swap 9,920 DAI -> ETH', color: '#f43f5e' },
      { label: 'Gas price', value: '29 gwei (ниже, чтобы после Alice)', color: colors.textMuted },
      { label: 'Searcher получает', value: '~5.19 ETH', color: colors.success },
      { label: 'Прибыль searcher', value: '~0.19 ETH (~$380)', color: colors.success },
    ],
    highlight: 'backrun',
  },
  {
    title: 'Итог: Кто выиграл, кто проиграл',
    description: 'Sandwich завершен за 1 блок (12 секунд). Alice потеряла ~$401 из-за ухудшенной цены. Searcher заработал ~$380 (минус gas). Оставшийся $21 -- газ, потраченный searcher на 2 дополнительных транзакции.',
    values: [
      { label: 'Потеря Alice', value: '-$401', color: '#f43f5e' },
      { label: 'Прибыль searcher', value: '+$380', color: colors.success },
      { label: 'Gas cost (2 tx)', value: '~$21', color: colors.textMuted },
      { label: 'Время атаки', value: '1 блок (12 сек)', color: colors.accent },
    ],
    highlight: 'result',
  },
  {
    title: 'Защита: как избежать sandwich',
    description: 'Главная защита -- установить amountOutMin > 0 (максимальный slippage 0.5-1%). Но даже это не полностью защищает. Лучшее решение -- Flashbots Protect RPC: транзакция не попадает в публичный mempool, и searchers ее не видят.',
    values: [
      { label: 'Защита 1', value: 'amountOutMin (slippage limit)', color: colors.success },
      { label: 'Защита 2', value: 'Flashbots Protect RPC', color: colors.success },
      { label: 'Защита 3', value: 'MEV-aware DEX (CoW Swap)', color: colors.success },
      { label: 'amountOutMin = 0', value: 'НИКОГДА так не делайте!', color: '#f43f5e' },
    ],
    highlight: 'defense',
  },
];

/**
 * SandwichAttackDiagram
 *
 * 6-step step-through with concrete numbers.
 * Forward/backward/reset navigation.
 */
export function SandwichAttackDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = SANDWICH_HISTORY[stepIndex];

  return (
    <DiagramContainer title="Sandwich Attack: пошаговая анатомия" color="red">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {SANDWICH_HISTORY.map((_, i) => (
          <div
            key={i}
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
          <DiagramTooltip key={i} content={`${v.label}: ${v.value}. Параметр текущего шага sandwich-атаки -- отслеживайте как меняются суммы и gas price на каждом этапе.`}>
            <div style={{
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
          </DiagramTooltip>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <DiagramTooltip content="Сбросить демонстрацию к началу -- моменту отправки транзакции жертвой.">
          <div style={{ display: 'inline-block' }}>
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
        </DiagramTooltip>
        <DiagramTooltip content="Вернуться к предыдущему шагу анатомии sandwich-атаки.">
          <div style={{ display: 'inline-block' }}>
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
        </DiagramTooltip>
        <DiagramTooltip content="Перейти к следующему шагу: от frontrun через victim tx до backrun и защиты.">
          <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setStepIndex((s) => Math.min(SANDWICH_HISTORY.length - 1, s + 1))}
              disabled={stepIndex >= SANDWICH_HISTORY.length - 1}
              style={{
                ...glassStyle,
                padding: '8px 20px',
                cursor: stepIndex >= SANDWICH_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
                color: stepIndex >= SANDWICH_HISTORY.length - 1 ? colors.textMuted : '#f43f5e',
                fontSize: 13,
                opacity: stepIndex >= SANDWICH_HISTORY.length - 1 ? 0.5 : 1,
              }}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {stepIndex >= SANDWICH_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DiagramTooltip content="Sandwich-атака эксплуатирует отсутствие slippage protection. Всегда устанавливайте amountOutMin > 0 и используйте Flashbots Protect или MEV-aware DEX.">
            <DataBox
              label="Ключевой вывод"
              value="amountOutMin = 0 -- приглашение к sandwich. Используйте slippage protection + Flashbots Protect для защиты от MEV."
              variant="highlight"
            />
          </DiagramTooltip>
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MempoolVisualizationDiagram                                         */
/* ================================================================== */

interface MempoolTx {
  from: string;
  action: string;
  gasPrice: string;
  type: 'victim' | 'frontrun' | 'backrun' | 'normal';
}

const PUBLIC_MEMPOOL: MempoolTx[] = [
  { from: 'Searcher', action: 'swap 5 ETH -> DAI (frontrun)', gasPrice: '31 gwei', type: 'frontrun' },
  { from: 'Alice', action: 'swap 10 ETH -> DAI', gasPrice: '30 gwei', type: 'victim' },
  { from: 'Searcher', action: 'swap 9,920 DAI -> ETH (backrun)', gasPrice: '29 gwei', type: 'backrun' },
  { from: 'Bob', action: 'transfer 1 ETH', gasPrice: '25 gwei', type: 'normal' },
  { from: 'Carol', action: 'approve USDC', gasPrice: '20 gwei', type: 'normal' },
];

const FLASHBOTS_MEMPOOL: MempoolTx[] = [
  { from: 'Bob', action: 'transfer 1 ETH', gasPrice: '25 gwei', type: 'normal' },
  { from: 'Carol', action: 'approve USDC', gasPrice: '20 gwei', type: 'normal' },
];

/**
 * MempoolVisualizationDiagram
 *
 * Interactive toggle: "Public Mempool" vs "Flashbots Protect".
 * Public shows sandwich attack around victim.
 * Flashbots shows only normal txs -- victim's tx is hidden in private pool.
 */
export function MempoolVisualizationDiagram() {
  const [isPrivate, setIsPrivate] = useState(false);

  const mempool = isPrivate ? FLASHBOTS_MEMPOOL : PUBLIC_MEMPOOL;

  const typeColor = (t: string) => {
    switch (t) {
      case 'frontrun': return '#f43f5e';
      case 'backrun': return '#f43f5e';
      case 'victim': return '#eab308';
      case 'normal': return colors.textMuted;
      default: return colors.text;
    }
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case 'frontrun': return 'FRONTRUN';
      case 'backrun': return 'BACKRUN';
      case 'victim': return 'VICTIM';
      case 'normal': return '';
      default: return '';
    }
  };

  return (
    <DiagramContainer title="Mempool: публичный vs приватный" color="green">
      {/* Toggle */}
      <div style={{
        display: 'flex',
        gap: 0,
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <DiagramTooltip content="Публичный mempool -- все транзакции видны всем. Searcher-боты мониторят его в реальном времени и строят sandwich-атаки вокруг крупных свопов.">
          <div style={{ flex: 1 }}>
            <button
              onClick={() => setIsPrivate(false)}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: !isPrivate ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.03)',
                border: 'none',
                color: !isPrivate ? '#f43f5e' : colors.textMuted,
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: !isPrivate ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              Public Mempool
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Flashbots Protect -- приватный канал. Транзакция идет напрямую к block builder, минуя публичный mempool. Searcher-боты не видят её.">
          <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={() => setIsPrivate(true)}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: isPrivate ? `${colors.success}15` : 'rgba(255,255,255,0.03)',
                border: 'none',
                color: isPrivate ? colors.success : colors.textMuted,
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: isPrivate ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              Flashbots Protect
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {/* Mempool transactions */}
      <div style={{ marginBottom: 16 }}>
        {mempool.map((tx, i) => {
          const txTooltips: Record<string, string> = {
            frontrun: 'Frontrun-транзакция searcher-бота с более высоким gas price. Выполняется ДО транзакции жертвы, сдвигая цену вверх.',
            victim: 'Транзакция жертвы -- видна всем в публичном mempool. Gas price определяет позицию в очереди блока.',
            backrun: 'Backrun-транзакция searcher-бота с более низким gas price. Выполняется ПОСЛЕ жертвы, фиксируя прибыль.',
            normal: 'Обычная транзакция -- не связана с MEV. Сортируется по gas price в стандартном порядке.',
          };
          return (
          <DiagramTooltip key={i} content={txTooltips[tx.type]}>
            <div style={{
              ...glassStyle,
              padding: 10,
              marginBottom: 6,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: tx.type !== 'normal' ? `${typeColor(tx.type)}08` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tx.type !== 'normal' ? `${typeColor(tx.type)}20` : 'rgba(255,255,255,0.06)'}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.text }}>
                  <span style={{ color: colors.accent }}>{tx.from}</span>: {tx.action}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, marginTop: 2 }}>
                  Gas: {tx.gasPrice}
                </div>
              </div>
              {typeLabel(tx.type) && (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: `${typeColor(tx.type)}15`,
                  color: typeColor(tx.type),
                  fontSize: 9,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}>
                  {typeLabel(tx.type)}
                </span>
              )}
            </div>
          </DiagramTooltip>
          );
        })}

        {isPrivate && (
          <div style={{
            ...glassStyle,
            padding: 10,
            marginBottom: 6,
            background: `${colors.success}08`,
            border: `1px solid ${colors.success}20`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.success }}>
              Alice: swap 10 ETH -{'>'} DAI
            </div>
            <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.success, marginTop: 2 }}>
              Приватный пул Flashbots (searchers НЕ видят)
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <DiagramTooltip content={isPrivate
        ? 'Flashbots Protect направляет транзакцию напрямую к block builder через приватный канал, полностью исключая видимость для MEV-ботов.'
        : 'В публичном mempool все транзакции видны. Searcher-боты анализируют pending tx и строят sandwich-атаки за миллисекунды.'
      }>
        <DataBox
          label={isPrivate ? 'Flashbots Protect: транзакция защищена' : 'Public Mempool: уязвимость!'}
          value={isPrivate
            ? 'Tx Alice идет напрямую к block builder через приватный канал. Searchers не видят ее в mempool и не могут построить sandwich.'
            : 'Searcher видит tx Alice в публичном mempool. Он размещает frontrun (выше gas) и backrun (ниже gas) вокруг нее. Alice теряет $401.'
          }
          variant={isPrivate ? 'highlight' : 'info'}
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
