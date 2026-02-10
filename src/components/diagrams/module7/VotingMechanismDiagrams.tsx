/**
 * Voting Mechanism Diagrams (GOV-03)
 *
 * Exports:
 * - ProposalStateMachineDiagram: Proposal state machine (interactive, clickable states)
 * - GovernanceAttacksDiagram: Governance attack vectors (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ProposalStateMachineDiagram                                        */
/* ================================================================== */

interface ProposalState {
  name: string;
  color: string;
  x: number;
  y: number;
  description: string;
}

interface StateTransition {
  from: number;
  to: number;
  condition: string;
}

const STATES: ProposalState[] = [
  { name: 'Pending', color: '#94a3b8', x: 60, y: 40, description: 'Предложение создано, ожидает начала голосования (votingDelay)' },
  { name: 'Active', color: '#3b82f6', x: 210, y: 40, description: 'Голосование открыто: For, Against, Abstain (votingPeriod)' },
  { name: 'Succeeded', color: '#22c55e', x: 360, y: 10, description: 'Quorum достигнут AND For > Against' },
  { name: 'Defeated', color: '#ef4444', x: 360, y: 70, description: 'Quorum не достигнут OR Against >= For' },
  { name: 'Queued', color: '#a855f7', x: 500, y: 10, description: 'В очереди TimelockController (задержка исполнения)' },
  { name: 'Executed', color: '#10b981', x: 640, y: 10, description: 'Исполнено: on-chain действие выполнено' },
  { name: 'Canceled', color: '#f97316', x: 210, y: 120, description: 'Отменено proposer-ом или guardian-ом' },
  { name: 'Expired', color: '#6b7280', x: 640, y: 70, description: 'Не исполнено вовремя (grace period истек)' },
];

const TRANSITIONS: StateTransition[] = [
  { from: 0, to: 1, condition: 'after votingDelay' },
  { from: 1, to: 2, condition: 'quorum met + For > Against' },
  { from: 1, to: 3, condition: 'quorum not met OR Against >= For' },
  { from: 2, to: 4, condition: 'queue() called' },
  { from: 4, to: 5, condition: 'after timelockDelay + execute()' },
  { from: 4, to: 7, condition: 'past grace period' },
];

/**
 * ProposalStateMachineDiagram
 *
 * 7 states as clickable nodes. Click to highlight transitions and show conditions.
 */
export function ProposalStateMachineDiagram() {
  const [selectedState, setSelectedState] = useState<number | null>(null);

  const activeTransitions = selectedState !== null
    ? TRANSITIONS.filter(t => t.from === selectedState || t.to === selectedState)
    : [];

  const isActive = (idx: number) =>
    selectedState === idx ||
    activeTransitions.some(t => t.from === idx || t.to === idx);

  return (
    <DiagramContainer title="Жизненный цикл предложения (Proposal State Machine)" color="green">
      {/* SVG state machine */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, overflowX: 'auto' }}>
        <svg width={740} height={160} style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth={5} markerHeight={5} orient="auto-start-auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.4)" />
            </marker>
          </defs>

          {/* Transitions */}
          {TRANSITIONS.map((t, i) => {
            const from = STATES[t.from];
            const to = STATES[t.to];
            const isHighlighted = activeTransitions.includes(t);
            return (
              <g key={i}>
                <line
                  x1={from.x + 50}
                  y1={from.y + 12}
                  x2={to.x - 4}
                  y2={to.y + 12}
                  stroke={isHighlighted ? '#22c55e' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  markerEnd="url(#arrowGreen)"
                />
                {isHighlighted && (
                  <text
                    x={(from.x + to.x) / 2 + 25}
                    y={(from.y + to.y) / 2 + 6}
                    fill="#22c55e"
                    fontSize={7}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {t.condition}
                  </text>
                )}
              </g>
            );
          })}

          {/* Canceled arrows (from Pending, Active, Succeeded, Queued) */}
          {[0, 1, 2, 4].map(idx => {
            const from = STATES[idx];
            const to = STATES[6];
            const isHighlighted = selectedState === 6 || selectedState === idx;
            return (
              <line
                key={`cancel-${idx}`}
                x1={from.x + 25}
                y1={from.y + 25}
                x2={to.x + 25}
                y2={to.y - 2}
                stroke={isHighlighted ? '#f97316' : 'rgba(255,255,255,0.06)'}
                strokeWidth={1}
                strokeDasharray="4,3"
                markerEnd="url(#arrowGreen)"
              />
            );
          })}

          {/* State nodes */}
          {STATES.map((st, i) => {
            const active = isActive(i);
            const isSelected = selectedState === i;
            return (
              <g
                key={i}
                onClick={() => setSelectedState(isSelected ? null : i)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={st.x - 8}
                  y={st.y - 6}
                  width={100}
                  height={36}
                  rx={8}
                  fill={active ? `${st.color}20` : 'rgba(255,255,255,0.03)'}
                  stroke={active ? st.color : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {isSelected && (
                  <rect
                    x={st.x - 12}
                    y={st.y - 10}
                    width={108}
                    height={44}
                    rx={10}
                    fill="none"
                    stroke={st.color}
                    strokeWidth={1}
                    opacity={0.3}
                  />
                )}
                <text
                  x={st.x + 42}
                  y={st.y + 16}
                  fill={active ? st.color : colors.textMuted}
                  fontSize={10}
                  fontWeight={active ? 700 : 400}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {st.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected state detail */}
      {selectedState !== null && (
        <DiagramTooltip content={
          selectedState === 0 ? 'Pending -- предложение создано, но голосование ещё не началось. votingDelay дает сообществу время изучить предложение перед голосованием. Типичная задержка: 1-2 дня.'
          : selectedState === 1 ? 'Active -- голосование открыто. Участники могут голосовать For, Against или Abstain. Период голосования (votingPeriod) обычно длится 1 неделю. Голоса взвешены по checkpoint на момент создания proposal.'
          : selectedState === 2 ? 'Succeeded -- предложение принято. Quorum достигнут (обычно 4% от total supply) и For > Against. Теперь предложение можно поместить в очередь Timelock для исполнения.'
          : selectedState === 3 ? 'Defeated -- предложение отклонено. Либо quorum не достигнут (недостаточная явка), либо голосов Against >= For. Предложение можно создать заново с изменениями.'
          : selectedState === 4 ? 'Queued -- предложение в очереди TimelockController. Задержка перед исполнением дает сообществу время отреагировать на потенциально вредоносные предложения (вывести средства, отменить proposal).'
          : selectedState === 5 ? 'Executed -- предложение исполнено on-chain. Смарт-контракт выполнил все запланированные действия (transfer, parameter change, upgrade). Это финальное и необратимое состояние.'
          : selectedState === 6 ? 'Canceled -- предложение отменено proposer-ом или guardian-ом. Возможно из любого незавершенного состояния (Pending, Active, Succeeded, Queued). Guardian -- защитный механизм для экстренных случаев.'
          : 'Expired -- предложение не было исполнено в течение grace period после timelock delay. Обычно grace period составляет 1-7 дней. Необходимо создать новый proposal.'
        }>
          <div style={{
            ...glassStyle,
            padding: 12,
            marginBottom: 12,
            border: `1px solid ${STATES[selectedState].color}30`,
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: STATES[selectedState].color,
              fontFamily: 'monospace',
              marginBottom: 4,
            }}>
              {STATES[selectedState].name}
            </div>
            <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.5 }}>
              {STATES[selectedState].description}
            </div>
            {activeTransitions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
                  Transitions:
                </div>
                {activeTransitions.map((t, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#22c55e', fontFamily: 'monospace' }}>
                    {STATES[t.from].name} {'->'} {STATES[t.to].name}: {t.condition}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DiagramTooltip>
      )}

      <DiagramTooltip content="Proposal lifecycle в OpenZeppelin Governor следует строгой конечной машине состояний. Каждый переход имеет условие (время, результат голосования, quorum). Canceled -- особое состояние, доступное из любого незавершенного шага. Это обеспечивает предсказуемость и безопасность governance-процесса.">
        <DataBox
          label="Proposal Lifecycle"
          value="Pending -> Active -> Succeeded/Defeated -> Queued -> Executed. Кликните на состояние для деталей. Canceled возможен из любого незавершенного состояния."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  GovernanceAttacksDiagram                                           */
/* ================================================================== */

interface AttackVector {
  name: string;
  nameRu: string;
  color: string;
  example: string;
  loss: string;
  mechanism: string;
  defense: string;
}

const ATTACK_VECTORS: AttackVector[] = [
  {
    name: 'Flash Loan Governance',
    nameRu: 'Flash Loan атака на governance',
    color: '#ef4444',
    example: 'Beanstalk (Апрель 2022)',
    loss: '$182M',
    mechanism: 'Заём $1B -> 80% voting power -> одобрение вредоносного proposal -> вывод средств. Всё за одну транзакцию.',
    defense: 'ERC20Votes checkpoints: snapshot voting power at proposal creation, not at vote time. Flash loan tokens не дают голосов для уже созданных proposals.',
  },
  {
    name: 'Vote Buying',
    nameRu: 'Покупка голосов',
    color: '#f97316',
    example: 'Aave controversy (2025)',
    loss: '$10M+ token purchase',
    mechanism: 'Покупка токенов перед ключевым голосованием -> влияние на результат -> продажа после.',
    defense: 'Timelock delays дают сообществу время заметить необычное накопление. Proposal threshold требует минимум токенов для создания предложения.',
  },
  {
    name: 'Voter Apathy',
    nameRu: 'Апатия голосующих',
    color: '#eab308',
    example: 'Типичная проблема всех DAO',
    loss: 'Контроль меньшинством',
    mechanism: 'Низкая явка -> маленькая группа контролирует решения. 4-8% participation rate -- норма.',
    defense: 'Quorum requirements: минимум 4% от total supply должны проголосовать. Delegation к активным представителям.',
  },
];

/**
 * GovernanceAttacksDiagram
 *
 * 3 cards for governance attack vectors with hover details.
 * Color-coded: red=flash loan, orange=vote buying, yellow=voter apathy.
 */
export function GovernanceAttacksDiagram() {
  return (
    <DiagramContainer title="Атаки на governance: угрозы и защита" color="red">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: 12,
      }}>
        {ATTACK_VECTORS.map((atk, i) => (
          <DiagramTooltip
            key={i}
            content={`${atk.nameRu} (${atk.example}, потери: ${atk.loss}). Механизм: ${atk.mechanism} Защита: ${atk.defense}`}
          >
            <div style={{
              ...glassStyle,
              padding: 16,
              cursor: 'default',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: atk.color, fontFamily: 'monospace' }}>
                  {atk.name}
                </div>
                <span style={{
                  fontSize: 9,
                  fontFamily: 'monospace',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: `${atk.color}15`,
                  color: atk.color,
                  border: `1px solid ${atk.color}30`,
                }}>
                  {atk.loss}
                </span>
              </div>

              <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                {atk.example}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DiagramTooltip content="ERC20Votes checkpoints -- главная защита от flash loan governance атак. Voting power фиксируется в момент создания proposal (snapshot), а не в момент голосования. Это делает бесполезным заем токенов через flash loan для манипуляции голосованием.">
        <DataBox
          label="Key Takeaway"
          value="ERC20Votes checkpoints -- главная защита от flash loan governance. Snapshot voting power фиксируется при создании proposal, а не при голосовании."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
