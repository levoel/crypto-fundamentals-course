/** @jsxImportSource solid-js */
/**
 * Cross-Chain Diagrams (SCALE-09)
 *
 * Exports:
 * - CrossChainMessagingDiagram: Step-through cross-chain message passing (5 steps, history array)
 * - AssetTransferModelsDiagram: 3-column static comparison (Lock-and-Mint, Burn-and-Mint, Liquidity Pool)
 * - TrustSpectrumDiagram: Horizontal trust model spectrum with security/cost arrows
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  CrossChainMessagingDiagram                                          */
/* ================================================================== */

interface CCStep {
  title: string;
  label: string;
  description: string;
  chain: 'source' | 'relay' | 'destination';
  color: string;
  icon: string;
  tooltipRu: string;
}

const CC_STEPS: CCStep[] = [
  {
    title: 'SOURCE TX',
    label: 'Шаг 1',
    description: 'Пользователь инициирует cross-chain действие на Source Chain. Message = (destination, payload, sender). Контракт эмитирует событие.',
    chain: 'source',
    color: '#3b82f6',
    icon: 'SRC',
    tooltipRu: 'Source TX -- начало cross-chain операции. Пользователь вызывает bridge контракт на source chain. Контракт записывает message в event log. Формат: (destination chain ID, payload bytes, sender address).',
  },
  {
    title: 'RELAY',
    label: 'Шаг 2',
    description: 'Relayer (off-chain сервис) обнаруживает событие на source chain. Получает proof события (Merkle proof или подписи валидаторов).',
    chain: 'relay',
    color: '#f59e0b',
    icon: 'RLY',
    tooltipRu: 'Relay -- передача сообщения между чейнами. Relayer мониторит события source chain и создает proof (Merkle proof блока, подписи валидаторов, или ZK proof). Relayer НЕ может подделать message -- proof криптографически привязан к source chain.',
  },
  {
    title: 'VERIFICATION',
    label: 'Шаг 3',
    description: 'Relayer передает message + proof в receiving контракт на Destination Chain. Контракт верифицирует доказательство.',
    chain: 'destination',
    color: '#8b5cf6',
    icon: 'VRF',
    tooltipRu: 'Verification -- критический шаг безопасности. Destination контракт проверяет proof: валидность Merkle path, подписи валидаторов, или ZK proof. Если proof невалиден, транзакция отклоняется. Это единственная защита от поддельных сообщений.',
  },
  {
    title: 'EXECUTION',
    label: 'Шаг 4',
    description: 'Если proof валиден, destination контракт выполняет payload. Пример: mint tokens, update state, trigger function.',
    chain: 'destination',
    color: '#10b981',
    icon: 'EXE',
    tooltipRu: 'Execution -- выполнение payload на destination chain. Примеры: mint wrapped tokens, обновление состояния протокола, вызов целевой функции. Execution атомарен -- либо весь payload выполняется, либо ничего.',
  },
  {
    title: 'CONFIRMATION',
    label: 'Шаг 5',
    description: 'Выполнение подтверждено на destination chain. Source chain может получить confirmation (опционально, зависит от протокола).',
    chain: 'source',
    color: '#06b6d4',
    icon: 'OK',
    tooltipRu: 'Confirmation -- опциональное подтверждение на source chain. Некоторые протоколы (LayerZero, Chainlink CCIP) отправляют confirmation обратно на source. Это позволяет source контракту обновить состояние (например, разблокировать locked tokens).',
  },
];

const CHAIN_COLORS: Record<string, string> = {
  source: '#3b82f6',
  relay: '#f59e0b',
  destination: '#8b5cf6',
};

/**
 * CrossChainMessagingDiagram
 *
 * Step-through cross-chain message passing with two parallel chain lanes.
 * 5 steps, history array, step/back/reset controls.
 */
export function CrossChainMessagingDiagram() {
  const [history, setHistory] = createSignal<number[]>([0]);
  const current = history()[history().length - 1];

  const step = () => {
    if (current < CC_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history().length > 1) {
      setHistory(history().slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = CC_STEPS[current];

  return (
    <DiagramContainer title="Cross-chain: передача сообщений" color="blue">
      {/* Chain lanes */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '1fr auto 1fr',
        'gap': '8px',
        'margin-bottom': '14px',
      }}>
        {/* Source chain */}
        <div style={{
          ...glassStyle,
          'padding': '10px',
          'border-radius': '6px',
          'border': `1px solid ${s.chain === 'source' ? '#3b82f640' : 'rgba(255,255,255,0.06)'}`,
          'background': s.chain === 'source' ? 'rgba(59,130,246,0.06)' : 'transparent',
          'transition': 'all 0.3s',
        }}>
          <DiagramTooltip content="Source Chain -- блокчейн-отправитель. Здесь пользователь инициирует cross-chain операцию. Bridge контракт записывает message в event log и (опционально) блокирует активы.">
            <span style={{ 'font-size': '10px', 'font-weight': '700', 'color': '#3b82f6', 'font-family': 'monospace', 'margin-bottom': '6px', 'display': 'inline-block' }}>
              Source Chain
            </span>
          </DiagramTooltip>
          {CC_STEPS.filter((_, i) => i <= current).map((st, i) => (
            st.chain === 'source' && (
              <div style={{
                'font-size': '9px',
                'color': colors.textMuted,
                'font-family': 'monospace',
                'padding': '3px 6px',
                'margin-bottom': '3px',
                'border-radius': '3px',
                'background': `${st.color}10`,
              }}>
                {st.icon}: {st.title}
              </div>
            )
          ))}
        </div>

        {/* Relay arrow */}
        <div style={{
          'display': 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
          'justify-content': 'center',
          'gap': '4px',
        }}>
          <DiagramTooltip content="Relayer -- off-chain сервис, передающий сообщения между чейнами. Может быть централизованным (один оператор), децентрализованным (сеть нод), или permissionless (любой может стать relayer).">
            <span style={{
              'font-size': '9px',
              'color': '#f59e0b',
              'font-family': 'monospace',
              'font-weight': '600',
            }}>
              Relayer
            </span>
          </DiagramTooltip>
          <div style={{
            'width': '2px',
            'height': '40px',
            'background': current >= 1 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)',
            'transition': 'background 0.3s',
          }} />
          <div style={{
            'font-size': '14px',
            'color': current >= 1 ? '#f59e0b' : 'rgba(255,255,255,0.15)',
            'transition': 'color 0.3s',
          }}>
            {current >= 2 ? '\u2194' : current >= 1 ? '\u2192' : '\u2192'}
          </div>
        </div>

        {/* Destination chain */}
        <div style={{
          ...glassStyle,
          'padding': '10px',
          'border-radius': '6px',
          'border': `1px solid ${s.chain === 'destination' ? '#8b5cf640' : 'rgba(255,255,255,0.06)'}`,
          'background': s.chain === 'destination' ? 'rgba(139,92,246,0.06)' : 'transparent',
          'transition': 'all 0.3s',
        }}>
          <DiagramTooltip content="Destination Chain -- блокчейн-получатель. Здесь выполняется payload сообщения после верификации proof. Receiving контракт проверяет доказательство и выполняет целевое действие.">
            <span style={{ 'font-size': '10px', 'font-weight': '700', 'color': '#8b5cf6', 'font-family': 'monospace', 'margin-bottom': '6px', 'display': 'inline-block' }}>
              Destination Chain
            </span>
          </DiagramTooltip>
          {CC_STEPS.filter((_, i) => i <= current).map((st, i) => (
            st.chain === 'destination' && (
              <div style={{
                'font-size': '9px',
                'color': colors.textMuted,
                'font-family': 'monospace',
                'padding': '3px 6px',
                'margin-bottom': '3px',
                'border-radius': '3px',
                'background': `${st.color}10`,
              }}>
                {st.icon}: {st.title}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Current step detail */}
      <div style={{
        ...glassStyle,
        'padding': '14px',
        'margin-bottom': '12px',
        'border': `1px solid ${s.color}30`,
        'background': `${s.color}08`,
        'border-radius': '8px',
      }}>
        <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px', 'margin-bottom': '6px' }}>
          <DiagramTooltip content={s.tooltipRu}>
            <span style={{
              'font-size': '9px',
              'font-family': 'monospace',
              'color': s.color,
              'padding': '2px 8px',
              'border-radius': '4px',
              'background': `${s.color}15`,
              'border': `1px solid ${s.color}30`,
            }}>
              {s.label}
            </span>
          </DiagramTooltip>
          <DiagramTooltip content={`Текущий шаг выполняется на ${s.chain === 'source' ? 'source chain (отправитель)' : s.chain === 'relay' ? 'relay layer (передача)' : 'destination chain (получатель)'}. ${s.chain === 'relay' ? 'Relayer работает off-chain.' : 'Транзакция записывается в блокчейн.'}`}>
            <span style={{
              'font-size': '9px',
              'font-family': 'monospace',
              'color': CHAIN_COLORS[s.chain],
              'font-weight': '600',
            }}>
              [{s.chain}]
            </span>
          </DiagramTooltip>
          <span style={{ 'font-size': '12px', 'font-weight': '700', 'color': colors.text }}>
            {s.title}
          </span>
        </div>
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6' }}>
          {s.description}
        </div>
      </div>

      {/* Controls */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '14px' }}>
        {[
          { label: 'Back', action: back, disabled: history().length <= 1 },
          { label: `Step ${current + 1}/${CC_STEPS.length}`, action: step, disabled: current >= CC_STEPS.length - 1 },
          { label: 'Reset', action: reset, disabled: history().length <= 1 },
        ].map((btn) => (
          <div>
            <button
              onClick={btn.action}
              disabled={btn.disabled}
              style={{
                ...glassStyle,
                'padding': '6px 14px',
                'cursor': btn.disabled ? 'default' : 'pointer',
                'font-size': '11px',
                'font-family': 'monospace',
                'color': btn.disabled ? 'rgba(255,255,255,0.2)' : colors.text,
                'border': '1px solid rgba(255,255,255,0.1)',
                'border-radius': '6px',
                'opacity': btn.disabled ? 0.5 : 1,
              }}
            >
              {btn.label}
            </button>
          </div>
        ))}
      </div>

      <DataBox
        label="Attack surface"
        value="Каждый шаг может быть атакован: подмена сообщения, поддельное доказательство, replay атака."
        variant="warning"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AssetTransferModelsDiagram                                          */
/* ================================================================== */

interface TransferModel {
  name: string;
  color: string;
  mechanism: string;
  examples: string;
  risk: string;
  advantage: string;
  tooltipRu: string;
}

const TRANSFER_MODELS: TransferModel[] = [
  {
    name: 'Lock-and-Mint',
    color: '#f43f5e',
    mechanism: 'Source: lock asset в bridge контракте. Destination: mint wrapped token. Withdrawal: burn wrapped, unlock original.',
    examples: 'Wrapped ETH, Wrapped BTC',
    risk: 'Bridge контракт хранит ВСЕ locked assets (single point of failure)',
    advantage: 'Универсальный, работает для любого токена',
    tooltipRu: 'Lock-and-Mint -- самая распространенная модель. Оригинальный токен заблокирован в bridge контракте на source chain, wrapped версия создается на destination. Главный риск: bridge контракт -- honeypot для хакеров (Ronin bridge hack: $625M, Wormhole: $320M).',
  },
  {
    name: 'Burn-and-Mint',
    color: '#10b981',
    mechanism: 'Source: burn native token. Destination: mint native token. Нет wrapped tokens.',
    examples: 'USDC (native на обоих chains via Circle CCTP)',
    risk: 'Минимальный -- нет locked assets',
    advantage: 'Нет liquidity risk. Токен нативный на обоих chains.',
    tooltipRu: 'Burn-and-Mint -- идеальная модель: токен сжигается на source и создается на destination. Нет wrapped tokens, нет locked assets. Пример: USDC через CCTP (Circle). Ограничение: требует контроля над выпуском токена (только issuer может реализовать).',
  },
  {
    name: 'Liquidity Pool',
    color: '#3b82f6',
    mechanism: 'Source: deposit token в pool. Destination: withdraw из pool (от liquidity providers).',
    examples: 'Across, Stargate',
    risk: 'Ограничен ликвидностью в пуле, комиссии LP',
    advantage: 'Быстро (не ждем L1 finality), без wrapped tokens.',
    tooltipRu: 'Liquidity Pool -- модель на основе пулов ликвидности. LP предоставляют ликвидность на обоих chains. Пользователь депонирует на source, LP выдает на destination. Быстро (~минуты), но ограничено ликвидностью и требует incentives для LP.',
  },
];

/**
 * AssetTransferModelsDiagram
 *
 * 3-column comparison of asset transfer models with risk profile arrow.
 * hoveredModel migrated to DiagramTooltip on model cards.
 */
export function AssetTransferModelsDiagram() {
  return (
    <DiagramContainer title="Модели передачи активов" color="orange">
      <div style={{
        'display': 'grid',
        'grid-template-columns': 'repeat(3, 1fr)',
        'gap': '8px',
        'margin-bottom': '14px',
      }}>
        {TRANSFER_MODELS.map((model) => (
          <DiagramTooltip content={model.tooltipRu}>
            <div
              style={{
                ...glassStyle,
                'padding': '14px',
                'border-radius': '6px',
                'cursor': 'pointer',
                'background': 'rgba(255,255,255,0.02)',
                'border': '1px solid rgba(255,255,255,0.08)',
                'transition': 'all 0.2s',
              }}
            >
              <div style={{
                'font-size': '12px',
                'font-weight': '700',
                'color': model.color,
                'font-family': 'monospace',
                'margin-bottom': '8px',
              }}>
                {model.name}
              </div>
              <div style={{
                'font-size': '11px',
                'color': colors.text,
                'line-height': '1.5',
                'margin-bottom': '8px',
              }}>
                {model.mechanism}
              </div>
              <div style={{
                'font-size': '10px',
                'color': colors.textMuted,
                'font-family': 'monospace',
                'margin-bottom': '4px',
              }}>
                Examples: {model.examples}
              </div>

              {/* Always-visible risk/advantage (replaces hover) */}
              <div style={{ 'margin-top': '8px' }}>
                <div style={{
                  'font-size': '10px',
                  'color': '#f43f5e',
                  'font-family': 'monospace',
                  'margin-bottom': '4px',
                }}>
                  Risk: {model.risk}
                </div>
                <div style={{
                  'font-size': '10px',
                  'color': colors.success,
                  'font-family': 'monospace',
                }}>
                  Advantage: {model.advantage}
                </div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Risk profile arrow */}
      <div style={{
        'display': 'flex',
        'align-items': 'center',
        'gap': '8px',
        'margin-bottom': '14px',
      }}>
        <DiagramTooltip content="Шкала риска отражает объем locked assets. Lock-and-Mint -- максимальный риск (bridge контракт = honeypot). Burn-and-Mint -- минимальный (нет locked assets).">
          <span style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'min-width': '50px' }}>
            Risk:
          </span>
        </DiagramTooltip>
        <span style={{ 'font-size': '10px', 'color': '#f43f5e', 'font-weight': '600' }}>High</span>
        <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '2px', 'flex': '1' }}>
          <div style={{ 'flex': '1', 'height': '3px', 'border-radius': '2px', 'background': 'rgba(244,63,94,0.4)' }} />
          <div style={{ 'flex': '1', 'height': '3px', 'border-radius': '2px', 'background': 'rgba(59,130,246,0.4)' }} />
          <div style={{ 'flex': '1', 'height': '3px', 'border-radius': '2px', 'background': 'rgba(16,185,129,0.4)' }} />
        </div>
        <span style={{ 'font-size': '10px', 'color': '#10b981', 'font-weight': '600' }}>Low</span>
      </div>

      <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace', 'text-align': 'center', 'margin-bottom': '4px' }}>
        Lock-and-Mint (highest risk) {'  \u2192  '} Liquidity Pool (moderate) {'  \u2192  '} Burn-and-Mint (lowest risk)
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  TrustSpectrumDiagram                                                */
/* ================================================================== */

interface TrustModel {
  name: string;
  color: string;
  description: string;
  example: string;
  security: string;
  tooltipRu: string;
}

const TRUST_MODELS: TrustModel[] = [
  {
    name: 'Natively Verified',
    color: '#10b981',
    description: 'Light client или state proof на destination chain. Trustless верификация. Самый безопасный, но самый дорогой.',
    example: 'IBC (Cosmos), rollup native bridges',
    security: 'Cryptographic -- аналогичен L1 безопасности',
    tooltipRu: 'Natively Verified -- самый безопасный тип моста. Destination chain запускает light client source chain и верифицирует state proofs. Примеры: IBC (Cosmos -- light client каждого chain), L1/L2 native bridges (rollup bridge через validity/fraud proofs). Стоимость: высокий gas на верификацию.',
  },
  {
    name: 'Externally Verified',
    color: '#eab308',
    description: 'Набор валидаторов/guardians подписывают сообщения. Trust assumption: honest majority валидаторов.',
    example: 'Wormhole (19 guardians), Multichain (MPC)',
    security: 'Зависит от честности T-of-N валидаторов',
    tooltipRu: 'Externally Verified -- мост с внешними валидаторами. Группа подписантов (guardians/validators) подтверждает сообщения. Trust assumption: T-of-N честных подписантов. Уязвимость: компрометация T ключей = полный контроль над мостом. Wormhole hack ($320M) -- компрометация signature verification.',
  },
  {
    name: 'Optimistic',
    color: '#f59e0b',
    description: 'Сообщения считаются валидными, пока не оспорены. Challenge period для диспутов.',
    example: 'Across, Connext (older versions)',
    security: 'Требует хотя бы одного честного watcher',
    tooltipRu: 'Optimistic -- модель с презумпцией валидности. Сообщения принимаются без proof, но challenge period позволяет оспорить. Достаточно одного честного watcher для безопасности (1-of-N assumption). Tradeoff: задержка на challenge period (часы-дни).',
  },
];

/**
 * TrustSpectrumDiagram
 *
 * Horizontal trust model spectrum from most to least secure.
 * Security and cost arrows.
 * hoveredModel migrated to DiagramTooltip on spectrum items.
 */
export function TrustSpectrumDiagram() {
  return (
    <DiagramContainer title="Модели доверия мостов" color="red">
      {/* Spectrum cards */}
      <div style={{
        'display': 'flex',
        'gap': '4px',
        'margin-bottom': '14px',
      }}>
        {TRUST_MODELS.map((model) => (
          <DiagramTooltip content={model.tooltipRu}>
            <div
              style={{
                'flex': '1',
                ...glassStyle,
                'padding': '14px',
                'border-radius': '6px',
                'cursor': 'pointer',
                'background': 'rgba(255,255,255,0.02)',
                'border': '1px solid rgba(255,255,255,0.08)',
                'transition': 'all 0.2s',
              }}
            >
              <div style={{
                'font-size': '11px',
                'font-weight': '700',
                'color': model.color,
                'font-family': 'monospace',
                'margin-bottom': '6px',
              }}>
                {model.name}
              </div>
              <div style={{
                'font-size': '11px',
                'color': colors.text,
                'line-height': '1.5',
                'margin-bottom': '6px',
              }}>
                {model.description}
              </div>
              <div style={{
                'font-size': '9px',
                'color': colors.textMuted,
                'font-family': 'monospace',
              }}>
                Example: {model.example}
              </div>

              {/* Always-visible security (replaces hover) */}
              <div style={{
                'margin-top': '8px',
                'padding': '6px',
                'border-radius': '4px',
                'background': `${model.color}08`,
                'border': `1px solid ${model.color}20`,
              }}>
                <div style={{ 'font-size': '10px', 'color': colors.text, 'line-height': '1.4' }}>
                  Security: {model.security}
                </div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Arrows */}
      {[
        { label: 'Security', left: 'High', right: 'Low', color: '#10b981', tooltipRu: 'Уровень безопасности снижается слева направо. Natively Verified обеспечивает криптографическую безопасность на уровне L1. Optimistic полагается на наличие хотя бы одного честного watcher.' },
        { label: 'Cost', left: 'High', right: 'Low', color: '#f43f5e', tooltipRu: 'Стоимость верификации снижается слева направо. Native verification требует запуск light client (дорогой gas). Optimistic -- минимальный gas (proof только при dispute).' },
      ].map((arrow) => (
        <div style={{
          'display': 'flex',
          'align-items': 'center',
          'gap': '8px',
          'margin-bottom': '6px',
        }}>
          <DiagramTooltip content={arrow.tooltipRu}>
            <span style={{ 'font-size': '10px', 'color': colors.textMuted, 'font-family': 'monospace', 'min-width': '60px' }}>
              {arrow.label}:
            </span>
          </DiagramTooltip>
          <span style={{ 'font-size': '10px', 'color': arrow.color, 'font-weight': '600' }}>{arrow.left}</span>
          <div style={{
            'flex': '1',
            'height': '2px',
            'background': `linear-gradient(to right, ${arrow.color}60, ${arrow.color}10)`,
            'border-radius': '1px',
          }} />
          <span style={{ 'font-size': '10px', 'color': arrow.color, 'font-weight': '600' }}>{arrow.right}</span>
        </div>
      ))}

      <div style={{ 'margin-top': '10px' }}>
        <DataBox
          label="Статистика"
          value="Нативно верифицированные мосты -- самые безопасные, но самые дорогие. Большинство взломов -- у внешне верифицированных мостов."
          variant="warning"
        />
      </div>
    </DiagramContainer>
  );
}
