/**
 * Network Protocol Diagrams (BTC-08)
 *
 * Exports:
 * - NetworkTopologyDiagram: P2P network with peer discovery, block propagation, tx relay flows
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Node and connection data                                            */
/* ================================================================== */

type NodeType = 'full' | 'miner' | 'spv';
type FlowType = 'discovery' | 'block' | 'transaction';

interface NetworkNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

const NODES: NetworkNode[] = [
  { id: 'n1', label: 'Full Node A', type: 'full', x: 120, y: 60 },
  { id: 'n2', label: 'Miner B', type: 'miner', x: 320, y: 40 },
  { id: 'n3', label: 'Full Node C', type: 'full', x: 480, y: 100 },
  { id: 'n4', label: 'SPV Wallet', type: 'spv', x: 80, y: 200 },
  { id: 'n5', label: 'Miner D', type: 'miner', x: 260, y: 220 },
  { id: 'n6', label: 'Full Node E', type: 'full', x: 440, y: 240 },
  { id: 'n7', label: 'Full Node F', type: 'full', x: 180, y: 320 },
  { id: 'n8', label: 'DNS Seed', type: 'full', x: 400, y: 340 },
];

const CONNECTIONS: Connection[] = [
  { from: 'n1', to: 'n2' },
  { from: 'n1', to: 'n4' },
  { from: 'n1', to: 'n5' },
  { from: 'n2', to: 'n3' },
  { from: 'n2', to: 'n5' },
  { from: 'n3', to: 'n6' },
  { from: 'n5', to: 'n6' },
  { from: 'n5', to: 'n7' },
  { from: 'n6', to: 'n8' },
  { from: 'n7', to: 'n8' },
  { from: 'n4', to: 'n7' },
];

const NODE_COLORS: Record<NodeType, string> = {
  full: '#3b82f6',   // blue
  miner: '#4ade80',  // green
  spv: '#9ca3af',    // gray
};

const NODE_LABELS_RU: Record<NodeType, string> = {
  full: 'Полный узел',
  miner: 'Майнер',
  spv: 'SPV-клиент',
};

/* ================================================================== */
/*  Flow definitions for each message type                              */
/* ================================================================== */

interface FlowStep {
  from: string;
  to: string;
  message: string;
  description: string;
}

const FLOWS: Record<FlowType, { title: string; description: string; steps: FlowStep[] }> = {
  discovery: {
    title: 'Обнаружение узлов',
    description: 'Новый узел находит пиров через DNS seeds и addr-сообщения',
    steps: [
      { from: 'n4', to: 'n8', message: 'DNS query', description: 'SPV запрашивает DNS seed для получения адресов узлов' },
      { from: 'n8', to: 'n4', message: 'addr (IP-список)', description: 'DNS seed возвращает список IP-адресов активных узлов' },
      { from: 'n4', to: 'n1', message: 'version', description: 'SPV устанавливает соединение с Full Node A' },
      { from: 'n1', to: 'n4', message: 'verack', description: 'Full Node A подтверждает соединение (handshake)' },
      { from: 'n1', to: 'n4', message: 'addr', description: 'Full Node A делится адресами других известных узлов' },
    ],
  },
  block: {
    title: 'Распространение блока',
    description: 'Майнер нашел блок и рассылает его по сети через inv -> getdata -> block',
    steps: [
      { from: 'n2', to: 'n1', message: 'inv (block hash)', description: 'Miner B объявляет новый блок соседям' },
      { from: 'n2', to: 'n3', message: 'inv (block hash)', description: 'Miner B объявляет блок Full Node C' },
      { from: 'n2', to: 'n5', message: 'inv (block hash)', description: 'Miner B объявляет блок Miner D' },
      { from: 'n1', to: 'n2', message: 'getdata', description: 'Full Node A запрашивает полный блок' },
      { from: 'n2', to: 'n1', message: 'block (data)', description: 'Miner B отправляет полные данные блока' },
      { from: 'n1', to: 'n5', message: 'inv (block hash)', description: 'Full Node A пересылает inv своим соседям' },
    ],
  },
  transaction: {
    title: 'Передача транзакции',
    description: 'Новая транзакция распространяется по сети и попадает в мемпул каждого узла',
    steps: [
      { from: 'n4', to: 'n1', message: 'inv (tx hash)', description: 'SPV объявляет новую транзакцию' },
      { from: 'n1', to: 'n4', message: 'getdata', description: 'Full Node A запрашивает данные транзакции' },
      { from: 'n4', to: 'n1', message: 'tx (data)', description: 'SPV отправляет полную транзакцию' },
      { from: 'n1', to: 'n2', message: 'inv (tx hash)', description: 'Full Node A ретранслирует inv майнеру' },
      { from: 'n1', to: 'n5', message: 'inv (tx hash)', description: 'Full Node A ретранслирует inv Miner D' },
      { from: 'n2', to: 'n1', message: 'getdata', description: 'Miner B запрашивает транзакцию для мемпула' },
      { from: 'n1', to: 'n2', message: 'tx (data)', description: 'Транзакция попадает в мемпул майнера' },
    ],
  },
};

/* ================================================================== */
/*  Helpers                                                             */
/* ================================================================== */

function getNode(id: string): NetworkNode {
  return NODES.find((n) => n.id === id)!;
}

/* ================================================================== */
/*  NetworkTopologyDiagram                                               */
/* ================================================================== */

export function NetworkTopologyDiagram() {
  const [activeFlow, setActiveFlow] = useState<FlowType>('discovery');
  const [activeStep, setActiveStep] = useState(0);

  const flow = FLOWS[activeFlow];
  const currentStep = flow.steps[activeStep];

  // Highlighted connections for current step
  const highlightedEdge = currentStep
    ? { from: currentStep.from, to: currentStep.to }
    : null;

  const svgW = 560;
  const svgH = 380;
  const nodeRadius = 20;

  const handleFlowChange = (f: FlowType) => {
    setActiveFlow(f);
    setActiveStep(0);
  };

  return (
    <DiagramContainer title="Сетевой протокол Bitcoin P2P" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Flow selector tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['discovery', 'block', 'transaction'] as FlowType[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFlowChange(f)}
              style={{
                ...glassStyle,
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: 12,
                color: activeFlow === f ? colors.primary : colors.textMuted,
                background: activeFlow === f ? `${colors.primary}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeFlow === f ? colors.primary + '40' : colors.border}`,
                borderRadius: 6,
              }}
            >
              {FLOWS[f].title}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: colors.textMuted }}>{flow.description}</div>

        {/* Network graph */}
        <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            {/* Connections */}
            {CONNECTIONS.map((c, i) => {
              const fromNode = getNode(c.from);
              const toNode = getNode(c.to);
              const isHighlighted =
                highlightedEdge &&
                ((highlightedEdge.from === c.from && highlightedEdge.to === c.to) ||
                  (highlightedEdge.from === c.to && highlightedEdge.to === c.from));

              return (
                <line
                  key={i}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isHighlighted ? colors.primary : colors.border}
                  strokeWidth={isHighlighted ? 2.5 : 0.8}
                  strokeDasharray={isHighlighted ? undefined : '4 3'}
                  opacity={isHighlighted ? 1 : 0.4}
                />
              );
            })}

            {/* Message label on highlighted edge */}
            {highlightedEdge && currentStep && (() => {
              const fromN = getNode(highlightedEdge.from);
              const toN = getNode(highlightedEdge.to);
              const mx = (fromN.x + toN.x) / 2;
              const my = (fromN.y + toN.y) / 2 - 10;
              // Arrow direction indicator
              const dx = toN.x - fromN.x;
              const dy = toN.y - fromN.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const arrowX = toN.x - (dx / len) * (nodeRadius + 4);
              const arrowY = toN.y - (dy / len) * (nodeRadius + 4);
              return (
                <g>
                  {/* Arrow tip */}
                  <circle cx={arrowX} cy={arrowY} r={3} fill={colors.primary} />
                  {/* Message label */}
                  <rect
                    x={mx - 45}
                    y={my - 8}
                    width={90}
                    height={16}
                    fill="rgba(0,0,0,0.7)"
                    rx={4}
                  />
                  <text
                    x={mx}
                    y={my + 3}
                    fill={colors.primary}
                    fontSize={9}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {currentStep.message}
                  </text>
                </g>
              );
            })()}

            {/* Nodes */}
            {NODES.map((node) => {
              const isActive =
                highlightedEdge &&
                (highlightedEdge.from === node.id || highlightedEdge.to === node.id);
              const nodeColor = NODE_COLORS[node.type];

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    fill={isActive ? nodeColor + '30' : nodeColor + '15'}
                    stroke={isActive ? nodeColor : nodeColor + '60'}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <text
                    x={node.x}
                    y={node.y + 1}
                    fill={nodeColor}
                    fontSize={9}
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {node.id.toUpperCase()}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + nodeRadius + 12}
                    fill={colors.textMuted}
                    fontSize={8}
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {(['full', 'miner', 'spv'] as NodeType[]).map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: NODE_COLORS[t],
                }}
              />
              <span style={{ fontSize: 11, color: colors.textMuted }}>{NODE_LABELS_RU[t]}</span>
            </div>
          ))}
        </div>

        {/* Step through controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
              color: activeStep === 0 ? colors.textMuted : colors.text,
              fontSize: 12,
              opacity: activeStep === 0 ? 0.5 : 1,
            }}
          >
            Назад
          </button>
          <span style={{ fontSize: 12, color: colors.textMuted, alignSelf: 'center', fontFamily: 'monospace' }}>
            {activeStep + 1} / {flow.steps.length}
          </span>
          <button
            onClick={() => setActiveStep((s) => Math.min(flow.steps.length - 1, s + 1))}
            disabled={activeStep >= flow.steps.length - 1}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: activeStep >= flow.steps.length - 1 ? 'not-allowed' : 'pointer',
              color: activeStep >= flow.steps.length - 1 ? colors.textMuted : colors.primary,
              fontSize: 12,
              opacity: activeStep >= flow.steps.length - 1 ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>

        {/* Current step description */}
        {currentStep && (
          <DataBox
            label={`Шаг ${activeStep + 1}: ${currentStep.message}`}
            value={currentStep.description}
            variant="highlight"
          />
        )}
      </div>
    </DiagramContainer>
  );
}
