/**
 * Cross-Chain Diagrams (SCALE-09)
 *
 * Exports:
 * - CrossChainMessagingDiagram: Step-through cross-chain message passing (5 steps, history array)
 * - AssetTransferModelsDiagram: 3-column static comparison (Lock-and-Mint, Burn-and-Mint, Liquidity Pool)
 * - TrustSpectrumDiagram: Horizontal trust model spectrum with security/cost arrows
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
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
}

const CC_STEPS: CCStep[] = [
  {
    title: 'SOURCE TX',
    label: 'Шаг 1',
    description: 'Пользователь инициирует cross-chain действие на Source Chain. Message = (destination, payload, sender). Контракт эмитирует событие.',
    chain: 'source',
    color: '#3b82f6',
    icon: 'SRC',
  },
  {
    title: 'RELAY',
    label: 'Шаг 2',
    description: 'Relayer (off-chain сервис) обнаруживает событие на source chain. Получает proof события (Merkle proof или подписи валидаторов).',
    chain: 'relay',
    color: '#f59e0b',
    icon: 'RLY',
  },
  {
    title: 'VERIFICATION',
    label: 'Шаг 3',
    description: 'Relayer передает message + proof в receiving контракт на Destination Chain. Контракт верифицирует доказательство.',
    chain: 'destination',
    color: '#8b5cf6',
    icon: 'VRF',
  },
  {
    title: 'EXECUTION',
    label: 'Шаг 4',
    description: 'Если proof валиден, destination контракт выполняет payload. Пример: mint tokens, update state, trigger function.',
    chain: 'destination',
    color: '#10b981',
    icon: 'EXE',
  },
  {
    title: 'CONFIRMATION',
    label: 'Шаг 5',
    description: 'Выполнение подтверждено на destination chain. Source chain может получить confirmation (опционально, зависит от протокола).',
    chain: 'source',
    color: '#06b6d4',
    icon: 'OK',
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
  const [history, setHistory] = useState<number[]>([0]);
  const current = history[history.length - 1];

  const step = () => {
    if (current < CC_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = CC_STEPS[current];

  return (
    <DiagramContainer title="Cross-chain: передача сообщений" color="blue">
      {/* Chain lanes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 8,
        marginBottom: 14,
      }}>
        {/* Source chain */}
        <div style={{
          ...glassStyle,
          padding: 10,
          borderRadius: 6,
          border: `1px solid ${s.chain === 'source' ? '#3b82f640' : 'rgba(255,255,255,0.06)'}`,
          background: s.chain === 'source' ? 'rgba(59,130,246,0.06)' : 'transparent',
          transition: 'all 0.3s',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace', marginBottom: 6 }}>
            Source Chain
          </div>
          {CC_STEPS.filter((_, i) => i <= current).map((st, i) => (
            st.chain === 'source' && (
              <div key={i} style={{
                fontSize: 9,
                color: colors.textMuted,
                fontFamily: 'monospace',
                padding: '3px 6px',
                marginBottom: 3,
                borderRadius: 3,
                background: `${st.color}10`,
              }}>
                {st.icon}: {st.title}
              </div>
            )
          ))}
        </div>

        {/* Relay arrow */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}>
          <div style={{
            fontSize: 9,
            color: '#f59e0b',
            fontFamily: 'monospace',
            fontWeight: 600,
          }}>
            Relayer
          </div>
          <div style={{
            width: 2,
            height: 40,
            background: current >= 1 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s',
          }} />
          <div style={{
            fontSize: 14,
            color: current >= 1 ? '#f59e0b' : 'rgba(255,255,255,0.15)',
            transition: 'color 0.3s',
          }}>
            {current >= 2 ? '\u2194' : current >= 1 ? '\u2192' : '\u2192'}
          </div>
        </div>

        {/* Destination chain */}
        <div style={{
          ...glassStyle,
          padding: 10,
          borderRadius: 6,
          border: `1px solid ${s.chain === 'destination' ? '#8b5cf640' : 'rgba(255,255,255,0.06)'}`,
          background: s.chain === 'destination' ? 'rgba(139,92,246,0.06)' : 'transparent',
          transition: 'all 0.3s',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace', marginBottom: 6 }}>
            Destination Chain
          </div>
          {CC_STEPS.filter((_, i) => i <= current).map((st, i) => (
            st.chain === 'destination' && (
              <div key={i} style={{
                fontSize: 9,
                color: colors.textMuted,
                fontFamily: 'monospace',
                padding: '3px 6px',
                marginBottom: 3,
                borderRadius: 3,
                background: `${st.color}10`,
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
        padding: 14,
        marginBottom: 12,
        border: `1px solid ${s.color}30`,
        background: `${s.color}08`,
        borderRadius: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontSize: 9,
            fontFamily: 'monospace',
            color: s.color,
            padding: '2px 8px',
            borderRadius: 4,
            background: `${s.color}15`,
            border: `1px solid ${s.color}30`,
          }}>
            {s.label}
          </span>
          <span style={{
            fontSize: 9,
            fontFamily: 'monospace',
            color: CHAIN_COLORS[s.chain],
            fontWeight: 600,
          }}>
            [{s.chain}]
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>
            {s.title}
          </span>
        </div>
        <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
          {s.description}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Back', action: back, disabled: history.length <= 1 },
          { label: `Step ${current + 1}/${CC_STEPS.length}`, action: step, disabled: current >= CC_STEPS.length - 1 },
          { label: 'Reset', action: reset, disabled: history.length <= 1 },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            disabled={btn.disabled}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: btn.disabled ? 'default' : 'pointer',
              fontSize: 11,
              fontFamily: 'monospace',
              color: btn.disabled ? 'rgba(255,255,255,0.2)' : colors.text,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              opacity: btn.disabled ? 0.5 : 1,
            }}
          >
            {btn.label}
          </button>
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
}

const TRANSFER_MODELS: TransferModel[] = [
  {
    name: 'Lock-and-Mint',
    color: '#f43f5e',
    mechanism: 'Source: lock asset в bridge контракте. Destination: mint wrapped token. Withdrawal: burn wrapped, unlock original.',
    examples: 'Wrapped ETH, Wrapped BTC',
    risk: 'Bridge контракт хранит ВСЕ locked assets (single point of failure)',
    advantage: 'Универсальный, работает для любого токена',
  },
  {
    name: 'Burn-and-Mint',
    color: '#10b981',
    mechanism: 'Source: burn native token. Destination: mint native token. Нет wrapped tokens.',
    examples: 'USDC (native на обоих chains via Circle CCTP)',
    risk: 'Минимальный -- нет locked assets',
    advantage: 'Нет liquidity risk. Токен нативный на обоих chains.',
  },
  {
    name: 'Liquidity Pool',
    color: '#3b82f6',
    mechanism: 'Source: deposit token в pool. Destination: withdraw из pool (от liquidity providers).',
    examples: 'Across, Stargate',
    risk: 'Ограничен ликвидностью в пуле, комиссии LP',
    advantage: 'Быстро (не ждем L1 finality), без wrapped tokens.',
  },
];

/**
 * AssetTransferModelsDiagram
 *
 * 3-column comparison of asset transfer models with risk profile arrow.
 */
export function AssetTransferModelsDiagram() {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  return (
    <DiagramContainer title="Модели передачи активов" color="orange">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginBottom: 14,
      }}>
        {TRANSFER_MODELS.map((model) => {
          const isHovered = hoveredModel === model.name;
          return (
            <div
              key={model.name}
              onMouseEnter={() => setHoveredModel(model.name)}
              onMouseLeave={() => setHoveredModel(null)}
              style={{
                ...glassStyle,
                padding: 14,
                borderRadius: 6,
                cursor: 'pointer',
                background: isHovered ? `${model.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isHovered ? `${model.color}40` : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: model.color,
                fontFamily: 'monospace',
                marginBottom: 8,
              }}>
                {model.name}
              </div>
              <div style={{
                fontSize: 11,
                color: colors.text,
                lineHeight: 1.5,
                marginBottom: 8,
              }}>
                {model.mechanism}
              </div>
              <div style={{
                fontSize: 10,
                color: colors.textMuted,
                fontFamily: 'monospace',
                marginBottom: 4,
              }}>
                Examples: {model.examples}
              </div>

              {isHovered && (
                <div style={{ marginTop: 8 }}>
                  <div style={{
                    fontSize: 10,
                    color: '#f43f5e',
                    fontFamily: 'monospace',
                    marginBottom: 4,
                  }}>
                    Risk: {model.risk}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: colors.success,
                    fontFamily: 'monospace',
                  }}>
                    Advantage: {model.advantage}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Risk profile arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', minWidth: 50 }}>
          Risk:
        </span>
        <span style={{ fontSize: 10, color: '#f43f5e', fontWeight: 600 }}>High</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(244,63,94,0.4)' }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(59,130,246,0.4)' }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(16,185,129,0.4)' }} />
        </div>
        <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>Low</span>
      </div>

      <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace', textAlign: 'center', marginBottom: 4 }}>
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
}

const TRUST_MODELS: TrustModel[] = [
  {
    name: 'Natively Verified',
    color: '#10b981',
    description: 'Light client или state proof на destination chain. Trustless верификация. Самый безопасный, но самый дорогой.',
    example: 'IBC (Cosmos), rollup native bridges',
    security: 'Cryptographic -- аналогичен L1 безопасности',
  },
  {
    name: 'Externally Verified',
    color: '#eab308',
    description: 'Набор валидаторов/guardians подписывают сообщения. Trust assumption: honest majority валидаторов.',
    example: 'Wormhole (19 guardians), Multichain (MPC)',
    security: 'Зависит от честности T-of-N валидаторов',
  },
  {
    name: 'Optimistic',
    color: '#f59e0b',
    description: 'Сообщения считаются валидными, пока не оспорены. Challenge period для диспутов.',
    example: 'Across, Connext (older versions)',
    security: 'Требует хотя бы одного честного watcher',
  },
];

/**
 * TrustSpectrumDiagram
 *
 * Horizontal trust model spectrum from most to least secure.
 * Security and cost arrows.
 */
export function TrustSpectrumDiagram() {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  return (
    <DiagramContainer title="Модели доверия мостов" color="red">
      {/* Spectrum cards */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 14,
      }}>
        {TRUST_MODELS.map((model) => {
          const isHovered = hoveredModel === model.name;
          return (
            <div
              key={model.name}
              onMouseEnter={() => setHoveredModel(model.name)}
              onMouseLeave={() => setHoveredModel(null)}
              style={{
                flex: 1,
                ...glassStyle,
                padding: 14,
                borderRadius: 6,
                cursor: 'pointer',
                background: isHovered ? `${model.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isHovered ? `${model.color}40` : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: model.color,
                fontFamily: 'monospace',
                marginBottom: 6,
              }}>
                {model.name}
              </div>
              <div style={{
                fontSize: 11,
                color: colors.text,
                lineHeight: 1.5,
                marginBottom: 6,
              }}>
                {model.description}
              </div>
              <div style={{
                fontSize: 9,
                color: colors.textMuted,
                fontFamily: 'monospace',
              }}>
                Example: {model.example}
              </div>

              {isHovered && (
                <div style={{
                  marginTop: 8,
                  padding: 6,
                  borderRadius: 4,
                  background: `${model.color}08`,
                  border: `1px solid ${model.color}20`,
                }}>
                  <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.4 }}>
                    Security: {model.security}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      {[
        { label: 'Security', left: 'High', right: 'Low', color: '#10b981' },
        { label: 'Cost', left: 'High', right: 'Low', color: '#f43f5e' },
      ].map((arrow) => (
        <div key={arrow.label} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        }}>
          <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', minWidth: 60 }}>
            {arrow.label}:
          </span>
          <span style={{ fontSize: 10, color: arrow.color, fontWeight: 600 }}>{arrow.left}</span>
          <div style={{
            flex: 1,
            height: 2,
            background: `linear-gradient(to right, ${arrow.color}60, ${arrow.color}10)`,
            borderRadius: 1,
          }} />
          <span style={{ fontSize: 10, color: arrow.color, fontWeight: 600 }}>{arrow.right}</span>
        </div>
      ))}

      <div style={{ marginTop: 10 }}>
        <DataBox
          label="Статистика"
          value="Нативно верифицированные мосты -- самые безопасные, но самые дорогие. Большинство взломов -- у внешне верифицированных мостов."
          variant="warning"
        />
      </div>
    </DiagramContainer>
  );
}
