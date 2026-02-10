/**
 * DAO Concept Diagrams (GOV-01)
 *
 * Exports:
 * - DAOArchitectureDiagram: DAO governance architecture overview (static flow)
 * - DAOCategoriesDiagram: DAO landscape/categories grid with hover tooltips
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  DAOArchitectureDiagram                                             */
/* ================================================================== */

interface ArchNode {
  label: string;
  sublabel: string;
  icon: string;
  x: number;
  y: number;
}

const ARCH_NODES: ArchNode[] = [
  { label: 'Token Holders', sublabel: 'Владельцы governance токенов', icon: '\u{1F465}', x: 30, y: 50 },
  { label: 'Proposal', sublabel: 'Описание действия', icon: '\u{1F4DD}', x: 150, y: 50 },
  { label: 'Voting', sublabel: 'For / Against / Abstain', icon: '\u{1F5F3}', x: 270, y: 50 },
  { label: 'Timelock', sublabel: 'Задержка исполнения', icon: '\u{23F3}', x: 390, y: 50 },
  { label: 'Execution', sublabel: 'On-chain действие', icon: '\u{26A1}', x: 510, y: 50 },
];

/**
 * DAOArchitectureDiagram
 *
 * Flow diagram: Token Holders -> Proposal -> Voting -> Timelock -> Execution.
 * Below: comparison Traditional org vs DAO.
 */
export function DAOArchitectureDiagram() {
  return (
    <DiagramContainer title="Архитектура DAO: от идеи до исполнения" color="blue">
      {/* Flow diagram */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <svg width={600} height={120} style={{ overflow: 'visible' }}>
          {/* Arrows between nodes */}
          {ARCH_NODES.slice(0, -1).map((node, i) => {
            const next = ARCH_NODES[i + 1];
            return (
              <line
                key={i}
                x1={node.x + 50}
                y1={node.y + 12}
                x2={next.x - 2}
                y2={next.y + 12}
                stroke="rgba(96,165,250,0.5)"
                strokeWidth={2}
                markerEnd="url(#arrowBlue)"
              />
            );
          })}
          <defs>
            <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth={6} markerHeight={6} orient="auto-start-auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(96,165,250,0.7)" />
            </marker>
          </defs>

          {/* Nodes */}
          {ARCH_NODES.map((node, i) => (
            <g key={i}>
              <rect
                x={node.x - 8}
                y={node.y - 18}
                width={100}
                height={60}
                rx={8}
                fill="rgba(255,255,255,0.05)"
                stroke="rgba(96,165,250,0.3)"
                strokeWidth={1}
              />
              <text
                x={node.x + 42}
                y={node.y + 2}
                fill={colors.text}
                fontSize={11}
                fontWeight={600}
                fontFamily="monospace"
                textAnchor="middle"
              >
                {node.label}
              </text>
              <text
                x={node.x + 42}
                y={node.y + 18}
                fill={colors.textMuted}
                fontSize={8}
                fontFamily="monospace"
                textAnchor="middle"
              >
                {node.sublabel}
              </text>
              <text
                x={node.x + 42}
                y={node.y + 34}
                fontSize={14}
                textAnchor="middle"
              >
                {node.icon}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Comparison table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        marginBottom: 12,
      }}>
        <DiagramTooltip content="Традиционная организация управляется советом директоров и CEO. Решения принимаются за закрытыми дверями, акционеры голосуют редко. Прозрачность минимальна, NDA защищают информацию от публичного доступа.">
          <div style={{
            ...glassStyle,
            padding: 14,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#ef4444',
              fontFamily: 'monospace',
              marginBottom: 6,
            }}>
              Traditional Organization
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
              Board of Directors decides. Shareholders vote rarely.
              CEO executes decisions. Hierarchy, NDAs, closed meetings.
            </div>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="DAO -- децентрализованная автономная организация, где владельцы токенов предлагают и голосуют за решения. Смарт-контракт автоматически исполняет результат голосования. Всё прозрачно: код открыт, голоса на блокчейне, казна под контролем сообщества.">
          <div style={{
            ...glassStyle,
            padding: 14,
            border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#22c55e',
              fontFamily: 'monospace',
              marginBottom: 6,
            }}>
              DAO (Decentralized Autonomous Organization)
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
              Token holders propose and vote. Smart contract executes.
              Open governance, transparent voting, code is law.
            </div>
          </div>
        </DiagramTooltip>
      </div>

      <DiagramTooltip content="Полный цикл DAO-governance: владельцы токенов создают предложение, сообщество голосует (For/Against/Abstain), после успешного голосования предложение проходит через timelock-задержку и автоматически исполняется on-chain. Это устраняет необходимость доверять центральному оператору.">
        <DataBox
          label="DAO Architecture"
          value="Token Holders -> Proposal -> Voting -> Timelock -> Execution. Все решения исполняются автоматически через смарт-контракты."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  DAOCategoriesDiagram                                               */
/* ================================================================== */

interface DAOCategory {
  name: string;
  nameRu: string;
  color: string;
  examples: string[];
  description: string;
}

const DAO_CATEGORIES: DAOCategory[] = [
  {
    name: 'Protocol DAOs',
    nameRu: 'Протокольные DAO',
    color: '#3b82f6',
    examples: ['Uniswap', 'Aave', 'Compound', 'MakerDAO/Sky'],
    description: 'Управляют DeFi-протоколами: параметры, обновления, казна',
  },
  {
    name: 'Investment DAOs',
    nameRu: 'Инвестиционные DAO',
    color: '#22c55e',
    examples: ['MetaCartel Ventures', 'The LAO', 'Flamingo DAO'],
    description: 'Коллективные инвестиции: pooled capital, совместные решения',
  },
  {
    name: 'Social DAOs',
    nameRu: 'Социальные DAO',
    color: '#a855f7',
    examples: ['Friends with Benefits', 'Bankless DAO'],
    description: 'Сообщества и культура: членство через токен, контент, события',
  },
  {
    name: 'Service DAOs',
    nameRu: 'Сервисные DAO',
    color: '#f97316',
    examples: ['RaidGuild', 'DAOhaus', 'LexDAO'],
    description: 'Кооперативы фрилансеров: Web3-разработка, юридические услуги',
  },
];

/**
 * DAOCategoriesDiagram
 *
 * Grid of 4 DAO category cards with hover tooltip showing example DAOs.
 * Color-coded: blue=protocol, green=investment, purple=social, orange=service.
 */
export function DAOCategoriesDiagram() {
  return (
    <DiagramContainer title="Категории DAO" color="purple">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 12,
      }}>
        {DAO_CATEGORIES.map((cat, i) => (
          <DiagramTooltip
            key={i}
            content={`${cat.nameRu}: ${cat.description}. Примеры: ${cat.examples.join(', ')}. ${
              cat.name === 'Protocol DAOs'
                ? 'Крупнейшие по казне -- Uniswap ($6B+), Aave, MakerDAO/Sky. Управляют параметрами протоколов, обновлениями и распределением средств.'
                : cat.name === 'Investment DAOs'
                  ? 'Участники объединяют капитал и совместно решают, куда инвестировать. Юридическая структура через обертки типа LAO (Limited Liability Autonomous Organization).'
                  : cat.name === 'Social DAOs'
                    ? 'Членство через владение токеном. Создают контент, проводят события, строят культуру вокруг Web3-сообщества.'
                    : 'Кооперативы Web3-специалистов: разработчиков, юристов, дизайнеров. Распределение работы и оплаты через on-chain механизмы.'
            }`}
          >
            <div style={{
              ...glassStyle,
              padding: 16,
              cursor: 'default',
              border: `1px solid rgba(255,255,255,0.08)`,
              background: 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: cat.color,
                fontFamily: 'monospace',
                marginBottom: 4,
              }}>
                {cat.name}
              </div>
              <div style={{
                fontSize: 11,
                color: colors.textMuted,
                marginBottom: 8,
              }}>
                {cat.nameRu}
              </div>
              <div style={{
                fontSize: 11,
                color: colors.text,
                lineHeight: 1.5,
              }}>
                {cat.description}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DiagramTooltip content="Категоризация DAO помогает понять масштаб децентрализованного управления. Protocol DAOs контролируют миллиарды долларов в DeFi, Investment DAOs демократизируют доступ к венчурным инвестициям, Social DAOs создают новые формы сообществ, а Service DAOs формируют Web3-рынок труда.">
        <DataBox
          label="DAO Landscape"
          value="Protocol DAOs управляют DeFi ($6B+ treasury Uniswap). Investment DAOs объединяют капитал. Social DAOs строят сообщества. Service DAOs -- Web3-кооперативы."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
