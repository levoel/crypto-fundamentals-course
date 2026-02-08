/**
 * Lightning Network Diagrams
 *
 * Exports:
 * - PaymentChannelLifecycleDiagram: 5-step animated payment channel lifecycle
 *   (funding -> commitment updates -> cooperative close) with balance bar
 * - LNRoutingGraphDiagram: Static LN routing graph with onion routing concept
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  PaymentChannelLifecycleDiagram                                     */
/* ------------------------------------------------------------------ */

interface ChannelStep {
  title: string;
  description: string;
  aliceBalance: number;
  bobBalance: number;
  onChain: boolean;
  commitmentLabel: string;
  revokedStates: number[];
  detail: string;
}

const CHANNEL_STEPS: ChannelStep[] = [
  {
    title: 'Шаг 0: Начальное состояние',
    description: 'Alice и Bob хотят совершать быстрые платежи друг другу. Пока что их BTC находятся в отдельных UTXO на блокчейне.',
    aliceBalance: 5,
    bobBalance: 5,
    onChain: true,
    commitmentLabel: 'Нет канала',
    revokedStates: [],
    detail: 'Каждый платёж требует ончейн-транзакции (~10 мин ожидания, комиссия майнерам).',
  },
  {
    title: 'Шаг 1: Funding TX (ончейн)',
    description: 'Alice и Bob создают 2-of-2 мультисиг-адрес и отправляют по 5 BTC. Funding TX записывается в блокчейн -- канал открыт.',
    aliceBalance: 5,
    bobBalance: 5,
    onChain: true,
    commitmentLabel: 'Commitment TX #0',
    revokedStates: [],
    detail: '2-of-2 мультисиг: для траты нужны подписи обеих сторон. Это единственная ончейн-транзакция до закрытия.',
  },
  {
    title: 'Шаг 2: Платёж 1 (офчейн)',
    description: 'Alice платит Bob 1 BTC. Создаётся новая commitment TX #1. Старое состояние (#0) отзывается -- Alice передаёт Bob ключ отзыва.',
    aliceBalance: 4,
    bobBalance: 6,
    onChain: false,
    commitmentLabel: 'Commitment TX #1',
    revokedStates: [0],
    detail: 'Офчейн: не требует записи в блокчейн. Мгновенно. Бесплатно. Только обмен подписями между Alice и Bob.',
  },
  {
    title: 'Шаг 3: Платёж 2 (офчейн)',
    description: 'Alice платит Bob ещё 2 BTC. Новая commitment TX #2. Предыдущие состояния (#0, #1) отозваны.',
    aliceBalance: 2,
    bobBalance: 8,
    onChain: false,
    commitmentLabel: 'Commitment TX #2',
    revokedStates: [0, 1],
    detail: 'Можно совершать тысячи офчейн-платежей. Каждый обновляет баланс канала и отзывает предыдущее состояние.',
  },
  {
    title: 'Шаг 4: Кооперативное закрытие (ончейн)',
    description: 'Alice и Bob решают закрыть канал. Оба подписывают closing TX: Alice получает 2 BTC, Bob -- 8 BTC. Транзакция записывается в блокчейн.',
    aliceBalance: 2,
    bobBalance: 8,
    onChain: true,
    commitmentLabel: 'Closing TX (финальная)',
    revokedStates: [0, 1, 2],
    detail: 'Кооперативное закрытие: обе стороны согласны, средства доступны сразу. Принудительное закрытие: одна сторона публикует commitment TX, ждёт таймлок.',
  },
];

const ALL_STATES = [0, 1, 2];

/**
 * PaymentChannelLifecycleDiagram - 5-step animated payment channel lifecycle.
 * History array pattern with forward/backward navigation.
 * Shows balance bar transitioning between Alice and Bob.
 */
export function PaymentChannelLifecycleDiagram() {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<number[]>([0]);

  const handleNext = useCallback(() => {
    setStep((s) => {
      const next = Math.min(s + 1, CHANNEL_STEPS.length - 1);
      setHistory((h) => {
        if (h.length <= next) return [...h, next];
        return h;
      });
      return next;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setHistory([0]);
  }, []);

  const current = CHANNEL_STEPS[step];
  const totalCapacity = current.aliceBalance + current.bobBalance;
  const alicePct = (current.aliceBalance / totalCapacity) * 100;

  return (
    <DiagramContainer title="Жизненный цикл платежного канала" color="green">
      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {CHANNEL_STEPS.map((_s, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              background: i <= step ? `${colors.success}30` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${i <= step ? colors.success : 'rgba(255,255,255,0.1)'}`,
              color: i <= step ? colors.success : colors.textMuted,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => setStep(i)}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Step title and description */}
      <div style={{
        ...glassStyle,
        padding: 14,
        borderColor: `${current.onChain ? colors.warning : colors.success}40`,
        marginBottom: 16,
        transition: 'border-color 0.3s',
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: current.onChain ? colors.warning : colors.success,
          marginBottom: 6,
        }}>
          {current.title}
        </div>
        <div style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 600,
          background: current.onChain ? `${colors.warning}20` : `${colors.success}20`,
          color: current.onChain ? colors.warning : colors.success,
          marginBottom: 8,
        }}>
          {current.onChain ? 'ОНЧЕЙН' : 'ОФЧЕЙН'}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          {current.description}
        </div>
      </div>

      {/* Balance visualization */}
      <div style={{ marginBottom: 16 }}>
        {/* Party labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.primary }}>
            Alice: {current.aliceBalance} BTC
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.success }}>
            Bob: {current.bobBalance} BTC
          </div>
        </div>

        {/* Balance bar */}
        <div style={{
          width: '100%',
          height: 32,
          borderRadius: 8,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          display: 'flex',
          position: 'relative' as const,
        }}>
          <div style={{
            width: `${alicePct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${colors.primary}60, ${colors.primary}30)`,
            transition: 'width 0.6s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: colors.primary,
            minWidth: alicePct > 0 ? 40 : 0,
          }}>
            {current.aliceBalance > 0 ? `${current.aliceBalance} BTC` : ''}
          </div>
          <div style={{
            width: `${100 - alicePct}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${colors.success}30, ${colors.success}60)`,
            transition: 'width 0.6s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: colors.success,
            minWidth: (100 - alicePct) > 0 ? 40 : 0,
          }}>
            {current.bobBalance > 0 ? `${current.bobBalance} BTC` : ''}
          </div>
        </div>

        {/* Capacity label */}
        <div style={{
          textAlign: 'center',
          fontSize: 10,
          color: colors.textMuted,
          marginTop: 4,
        }}>
          Ёмкость канала: {totalCapacity} BTC
        </div>
      </div>

      {/* Commitment TX / state info */}
      <div style={{
        ...glassStyle,
        padding: 12,
        borderColor: `${colors.accent}30`,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.accent, marginBottom: 6 }}>
          {current.commitmentLabel}
        </div>

        {/* Revoked states */}
        {step > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {ALL_STATES.map((stateNum) => {
              const isRevoked = current.revokedStates.includes(stateNum);
              const isCurrent = step > 0 && stateNum === step - 1 && !isRevoked;
              if (stateNum >= step) return null;
              return (
                <div
                  key={stateNum}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    background: isRevoked ? `${colors.danger}15` : `${colors.success}15`,
                    color: isRevoked ? colors.danger : colors.success,
                    textDecoration: isRevoked ? 'line-through' : 'none',
                    border: `1px solid ${isRevoked ? colors.danger + '30' : colors.success + '30'}`,
                  }}
                >
                  TX #{stateNum} {isRevoked ? '(отозвана)' : isCurrent ? '(текущая)' : ''}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
          {current.detail}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={handleReset}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 12,
            color: colors.textMuted,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          Сброс
        </button>
        <button
          onClick={handlePrev}
          disabled={step <= 0}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step <= 0 ? 'default' : 'pointer',
            fontSize: 12,
            color: step <= 0 ? colors.textMuted : colors.accent,
            border: `1px solid ${step <= 0 ? 'rgba(255,255,255,0.1)' : colors.accent}`,
            background: step <= 0 ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
            opacity: step <= 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={handleNext}
          disabled={step >= CHANNEL_STEPS.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step >= CHANNEL_STEPS.length - 1 ? 'default' : 'pointer',
            fontSize: 12,
            color: step >= CHANNEL_STEPS.length - 1 ? colors.textMuted : colors.success,
            border: `1px solid ${step >= CHANNEL_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.success}`,
            background: step >= CHANNEL_STEPS.length - 1 ? 'rgba(255,255,255,0.03)' : `${colors.success}15`,
            opacity: step >= CHANNEL_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  LNRoutingGraphDiagram                                              */
/* ------------------------------------------------------------------ */

interface LNNode {
  id: string;
  label: string;
  x: number;
  y: number;
  channels: number;
  totalCapacity: string;
  isOnPath: boolean;
}

interface LNChannel {
  from: string;
  to: string;
  capacity: string;
  balanceA: string;
  balanceB: string;
  isOnPath: boolean;
}

const LN_NODES: LNNode[] = [
  { id: 'A', label: 'Alice', x: 50, y: 50, channels: 3, totalCapacity: '1.5 BTC', isOnPath: true },
  { id: 'B', label: 'Bob', x: 280, y: 40, channels: 2, totalCapacity: '0.8 BTC', isOnPath: true },
  { id: 'C', label: 'Carol', x: 160, y: 130, channels: 4, totalCapacity: '2.1 BTC', isOnPath: true },
  { id: 'D', label: 'Dave', x: 350, y: 150, channels: 2, totalCapacity: '0.5 BTC', isOnPath: true },
  { id: 'E', label: 'Eve', x: 50, y: 200, channels: 2, totalCapacity: '0.9 BTC', isOnPath: false },
  { id: 'F', label: 'Frank', x: 350, y: 250, channels: 2, totalCapacity: '0.6 BTC', isOnPath: false },
  { id: 'G', label: 'Grace', x: 200, y: 260, channels: 3, totalCapacity: '1.3 BTC', isOnPath: false },
];

const LN_CHANNELS: LNChannel[] = [
  { from: 'A', to: 'B', capacity: '0.5 BTC', balanceA: '0.3', balanceB: '0.2', isOnPath: false },
  { from: 'A', to: 'C', capacity: '0.5 BTC', balanceA: '0.4', balanceB: '0.1', isOnPath: true },
  { from: 'A', to: 'E', capacity: '0.5 BTC', balanceA: '0.2', balanceB: '0.3', isOnPath: false },
  { from: 'B', to: 'D', capacity: '0.4 BTC', balanceA: '0.15', balanceB: '0.25', isOnPath: false },
  { from: 'C', to: 'B', capacity: '0.6 BTC', balanceA: '0.35', balanceB: '0.25', isOnPath: false },
  { from: 'C', to: 'D', capacity: '0.5 BTC', balanceA: '0.3', balanceB: '0.2', isOnPath: true },
  { from: 'C', to: 'G', capacity: '0.5 BTC', balanceA: '0.25', balanceB: '0.25', isOnPath: false },
  { from: 'D', to: 'F', capacity: '0.3 BTC', balanceA: '0.1', balanceB: '0.2', isOnPath: false },
  { from: 'E', to: 'G', capacity: '0.4 BTC', balanceA: '0.2', balanceB: '0.2', isOnPath: false },
  { from: 'G', to: 'F', capacity: '0.3 BTC', balanceA: '0.15', balanceB: '0.15', isOnPath: false },
];

function getNodeById(id: string): LNNode {
  return LN_NODES.find((n) => n.id === id)!;
}

/**
 * LNRoutingGraphDiagram - Lightning Network routing graph (static with hover).
 * Shows 7 nodes connected by channels. Highlights path A -> C -> D.
 * Onion routing: each node only knows prev and next hop.
 */
export function LNRoutingGraphDiagram() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredChannel, setHoveredChannel] = useState<number | null>(null);

  const svgW = 420;
  const svgH = 310;
  const nodeR = 20;

  return (
    <DiagramContainer title="Маршрутизация в Lightning Network" color="blue">
      {/* Onion routing explanation */}
      <div style={{
        ...glassStyle,
        padding: 10,
        borderColor: `${colors.info}30`,
        marginBottom: 12,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 1.5,
      }}>
        <strong style={{ color: colors.info }}>Луковая маршрутизация:</strong>{' '}
        Каждый узел знает только предыдущий и следующий хоп. Маршрут: <span style={{ color: colors.primary, fontWeight: 600 }}>Alice</span> {'->'} <span style={{ color: colors.accent, fontWeight: 600 }}>Carol</span> {'->'} <span style={{ color: colors.success, fontWeight: 600 }}>Dave</span>. Carol не знает, что платёж идёт от Alice к Dave.
      </div>

      {/* SVG Graph */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 12,
      }}>
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ maxWidth: svgW, overflow: 'visible' }}
        >
          {/* Channels (edges) */}
          {LN_CHANNELS.map((ch, i) => {
            const fromNode = getNodeById(ch.from);
            const toNode = getNodeById(ch.to);
            const isHovered = hoveredChannel === i;
            const strokeColor = ch.isOnPath
              ? colors.success
              : isHovered
                ? colors.accent
                : 'rgba(255,255,255,0.15)';
            const strokeWidth = ch.isOnPath ? 2.5 : isHovered ? 2 : 1;

            return (
              <g key={`ch-${i}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={ch.isOnPath ? 'none' : '4,3'}
                  style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredChannel(i)}
                  onMouseLeave={() => setHoveredChannel(null)}
                />
                {/* Path arrow */}
                {ch.isOnPath && (
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 8}
                    textAnchor="middle"
                    fontSize={10}
                    fill={colors.success}
                    fontWeight={700}
                  >
                    {ch.capacity}
                  </text>
                )}
                {/* Hover tooltip for channel */}
                {isHovered && (
                  <g>
                    <rect
                      x={(fromNode.x + toNode.x) / 2 - 60}
                      y={(fromNode.y + toNode.y) / 2 + 4}
                      width={120}
                      height={42}
                      rx={6}
                      fill="rgba(0,0,0,0.85)"
                      stroke="rgba(255,255,255,0.2)"
                    />
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 + 18}
                      textAnchor="middle"
                      fontSize={9}
                      fill={colors.text}
                    >
                      Ёмкость: {ch.capacity}
                    </text>
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 + 30}
                      textAnchor="middle"
                      fontSize={9}
                      fill={colors.textMuted}
                    >
                      {ch.from}: {ch.balanceA} | {ch.to}: {ch.balanceB}
                    </text>
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 + 42}
                      textAnchor="middle"
                      fontSize={8}
                      fill={colors.textMuted}
                    >
                      BTC
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {LN_NODES.map((node) => {
            const isHovered = hoveredNode === node.id;
            const fillColor = node.isOnPath
              ? (node.id === 'A' ? colors.primary : node.id === 'D' ? colors.success : colors.accent)
              : 'rgba(255,255,255,0.08)';
            const borderColor = node.isOnPath
              ? fillColor
              : isHovered
                ? colors.accent
                : 'rgba(255,255,255,0.2)';

            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeR}
                  fill={`${fillColor}25`}
                  stroke={borderColor}
                  strokeWidth={node.isOnPath ? 2.5 : isHovered ? 2 : 1.5}
                  style={{ transition: 'all 0.2s' }}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={node.isOnPath ? fillColor : isHovered ? colors.accent : colors.text}
                >
                  {node.id}
                </text>
                <text
                  x={node.x}
                  y={node.y + nodeR + 12}
                  textAnchor="middle"
                  fontSize={9}
                  fill={colors.textMuted}
                >
                  {node.label}
                </text>

                {/* Hover tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x={node.x - 55}
                      y={node.y - nodeR - 48}
                      width={110}
                      height={38}
                      rx={6}
                      fill="rgba(0,0,0,0.85)"
                      stroke="rgba(255,255,255,0.2)"
                    />
                    <text
                      x={node.x}
                      y={node.y - nodeR - 32}
                      textAnchor="middle"
                      fontSize={9}
                      fill={colors.text}
                    >
                      Каналов: {node.channels}
                    </text>
                    <text
                      x={node.x}
                      y={node.y - nodeR - 18}
                      textAnchor="middle"
                      fontSize={9}
                      fill={colors.textMuted}
                    >
                      Ёмкость: {node.totalCapacity}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <Grid columns={2} gap={8}>
        <div style={{
          ...glassStyle,
          padding: 10,
          borderColor: `${colors.success}30`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: colors.success, marginBottom: 4 }}>
            Маршрут платежа
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted, lineHeight: 1.5 }}>
            Alice {'->'} Carol {'->'} Dave. Сплошная линия -- выбранный маршрут. Каждый узел пересылает платёж дальше.
          </div>
        </div>
        <div style={{
          ...glassStyle,
          padding: 10,
          borderColor: `${colors.info}30`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: colors.info, marginBottom: 4 }}>
            Луковые слои
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted, lineHeight: 1.5 }}>
            Alice шифрует маршрут слоями. Carol расшифровывает свой слой: «отправь Dave». Она не знает, откуда пришёл платёж.
          </div>
        </div>
      </Grid>
    </DiagramContainer>
  );
}
