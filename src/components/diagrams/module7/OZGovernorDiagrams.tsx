/**
 * OpenZeppelin Governor Diagrams (GOV-05)
 *
 * Exports:
 * - GovernorArchitectureDiagram: OZ Governor v5 modular architecture (static)
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  GovernorArchitectureDiagram                                        */
/* ================================================================== */

interface Extension {
  name: string;
  description: string;
  color: string;
  x: number;
  y: number;
}

const EXTENSIONS: Extension[] = [
  {
    name: 'GovernorCountingSimple',
    description: 'Vote counting (For/Against/Abstain)',
    color: '#3b82f6',
    x: 80,
    y: 10,
  },
  {
    name: 'GovernorVotes',
    description: 'Token-based voting power (IVotes)',
    color: '#22c55e',
    x: 380,
    y: 10,
  },
  {
    name: 'GovernorVotesQuorumFraction',
    description: 'Quorum as % of total supply (4%)',
    color: '#a855f7',
    x: 80,
    y: 200,
  },
  {
    name: 'GovernorTimelockControl',
    description: 'Execution through TimelockController',
    color: '#f97316',
    x: 380,
    y: 200,
  },
];

const OPTIONAL_EXTENSIONS = [
  'GovernorSettings',
  'GovernorPreventLateQuorum',
  'GovernorStorage',
  'GovernorProposalGuardian',
];

/**
 * GovernorArchitectureDiagram
 *
 * Central Governor base + 4 extension modules connected via arrows.
 * Additional optional extensions listed below.
 */
export function GovernorArchitectureDiagram() {
  const centerX = 255;
  const centerY = 110;
  const boxW = 180;

  return (
    <DiagramContainer title="OpenZeppelin Governor v5: модульная архитектура" color="green">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={600} height={280} style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrowArch" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth={5} markerHeight={5} orient="auto-start-auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
            </marker>
          </defs>

          {/* Center: Governor base */}
          <rect
            x={centerX - 70}
            y={centerY - 30}
            width={140}
            height={60}
            rx={10}
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
          <text x={centerX} y={centerY - 8} fill={colors.text} fontSize={12} fontWeight={700} fontFamily="monospace" textAnchor="middle">
            Governor
          </text>
          <text x={centerX} y={centerY + 8} fill={colors.textMuted} fontSize={8} fontFamily="monospace" textAnchor="middle">
            propose() castVote()
          </text>
          <text x={centerX} y={centerY + 20} fill={colors.textMuted} fontSize={8} fontFamily="monospace" textAnchor="middle">
            queue() execute()
          </text>

          {/* Extension boxes and arrows */}
          {EXTENSIONS.map((ext, i) => {
            const extCx = ext.x + boxW / 2;
            const extCy = ext.y + 22;
            return (
              <g key={i}>
                {/* Arrow from extension to center */}
                <line
                  x1={extCx}
                  y1={i < 2 ? extCy + 22 : extCy - 2}
                  x2={centerX}
                  y2={i < 2 ? centerY - 32 : centerY + 32}
                  stroke={`${ext.color}50`}
                  strokeWidth={1.5}
                  markerEnd="url(#arrowArch)"
                />

                {/* Extension box */}
                <rect
                  x={ext.x}
                  y={ext.y}
                  width={boxW}
                  height={44}
                  rx={8}
                  fill={`${ext.color}10`}
                  stroke={`${ext.color}40`}
                  strokeWidth={1}
                />
                <text
                  x={extCx}
                  y={ext.y + 16}
                  fill={ext.color}
                  fontSize={9}
                  fontWeight={600}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {ext.name}
                </text>
                <text
                  x={extCx}
                  y={ext.y + 32}
                  fill={colors.textMuted}
                  fontSize={7}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {ext.description}
                </text>
              </g>
            );
          })}

          {/* External links */}
          {/* GovernorVotes -> ERC20Votes Token */}
          <rect x={560} y={50} width={36} height={30} rx={6} fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" strokeWidth={1} />
          <text x={578} y={64} fill="#22c55e" fontSize={6} fontFamily="monospace" textAnchor="middle">ERC20</text>
          <text x={578} y={73} fill="#22c55e" fontSize={6} fontFamily="monospace" textAnchor="middle">Votes</text>
          <line x1={560} y1={32} x2={578} y2={50} stroke="rgba(34,197,94,0.3)" strokeWidth={1} strokeDasharray="4,3" />

          {/* GovernorTimelockControl -> TimelockController */}
          <rect x={560} y={200} width={36} height={30} rx={6} fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" strokeWidth={1} />
          <text x={578} y={214} fill="#f97316" fontSize={6} fontFamily="monospace" textAnchor="middle">Timelock</text>
          <text x={578} y={223} fill="#f97316" fontSize={6} fontFamily="monospace" textAnchor="middle">Ctrl</text>
          <line x1={560} y1={222} x2={578} y2={218} stroke="rgba(249,115,22,0.3)" strokeWidth={1} strokeDasharray="4,3" />

          {/* Note about overrides */}
          <text x={centerX} y={265} fill={colors.textMuted} fontSize={8} fontFamily="monospace" textAnchor="middle">
            6 function overrides needed due to multiple inheritance (Solidity C3 linearization)
          </text>
        </svg>
      </div>

      {/* Core extension tags (HTML, wrappable with DiagramTooltip) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <DiagramTooltip content="GovernorCountingSimple реализует подсчет голосов по схеме For/Against/Abstain. Каждый голосующий выбирает одну из трёх опций. Abstain засчитывается для quorum, но не влияет на результат (For vs Against). Это стандартный и наиболее распространенный модуль подсчета.">
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace' }}>GovernorCountingSimple</div>
            <div style={{ fontSize: 9, color: colors.textMuted }}>Vote counting (For/Against/Abstain)</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="GovernorVotes подключает Governor к токену, реализующему интерфейс IVotes (обычно ERC20Votes). Считывает voting power через getVotes() и getPastVotes(). Поддерживает как ERC20Votes, так и ERC721Votes (NFT governance).">
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', fontFamily: 'monospace' }}>GovernorVotes</div>
            <div style={{ fontSize: 9, color: colors.textMuted }}>Token-based voting power (IVotes)</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="GovernorVotesQuorumFraction задает quorum как процент от total supply. Стандартное значение 4% означает, что минимум 4% всех токенов должны участвовать в голосовании. Quorum пересчитывается автоматически при изменении total supply (mint/burn).">
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#a855f7', fontFamily: 'monospace' }}>GovernorVotesQuorumFraction</div>
            <div style={{ fontSize: 9, color: colors.textMuted }}>Quorum as % of total supply (4%)</div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="GovernorTimelockControl направляет исполнение proposal через TimelockController. Все одобренные предложения проходят задержку (обычно 1-2 дня) перед исполнением. Это дает сообществу время отреагировать на потенциально вредоносные предложения.">
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(249,115,22,0.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#f97316', fontFamily: 'monospace' }}>GovernorTimelockControl</div>
            <div style={{ fontSize: 9, color: colors.textMuted }}>Execution through TimelockController</div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Optional extensions */}
      <DiagramTooltip content="Дополнительные модули OpenZeppelin Governor: GovernorSettings позволяет изменять votingDelay/votingPeriod/proposalThreshold через governance. GovernorPreventLateQuorum продлевает голосование если quorum достигнут поздно. GovernorStorage хранит proposal данные on-chain. GovernorProposalGuardian добавляет роль guardian для экстренной отмены.">
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 12,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
            Optional extensions:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {OPTIONAL_EXTENSIONS.map((ext, i) => (
              <span key={i} style={{
                fontSize: 9,
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.05)',
                color: colors.textMuted,
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {ext}
              </span>
            ))}
          </div>
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="OpenZeppelin Governor использует модульную архитектуру на основе множественного наследования Solidity. Базовый контракт Governor предоставляет core-функции (propose, castVote, queue, execute), а расширения добавляют специализированную логику. Из-за множественного наследования требуется 6 function overrides (C3 linearization).">
        <DataBox
          label="Modular Architecture"
          value="Governor base + 4 extensions = полная governance система. GovernorCountingSimple (подсчет), GovernorVotes (токены), GovernorVotesQuorumFraction (кворум), GovernorTimelockControl (исполнение)."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
