/**
 * ERC-20 Token Diagrams (ETH-08)
 *
 * Exports:
 * - ERC20TransferDiagram: Simple transfer flow (static with hover)
 * - ApproveTransferFromDiagram: Approve/TransferFrom two-step pattern (step-through)
 * - TokenSupplyDiagram: Token supply visualization (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ERC20TransferDiagram                                                */
/* ================================================================== */

/**
 * ERC20TransferDiagram
 *
 * Shows: Alice calls token.transfer(Bob, 100).
 * Alice balance decreases, Bob balance increases. Transfer event emitted.
 */
export function ERC20TransferDiagram() {
  const [hovered, setHovered] = useState<'alice' | 'bob' | 'event' | null>(null);

  const aliceBefore = 500;
  const bobBefore = 200;
  const amount = 100;
  const aliceAfter = aliceBefore - amount;
  const bobAfter = bobBefore + amount;

  return (
    <DiagramContainer title="ERC-20: прямой перевод (transfer)" color="green">
      {/* Call label */}
      <div style={{
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'monospace',
        fontSize: 13,
        color: colors.primary,
      }}>
        token.transfer(Bob, {amount})
      </div>

      {/* Two account boxes */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Alice */}
        <div
          onMouseEnter={() => setHovered('alice')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...glassStyle,
            padding: 16,
            minWidth: 160,
            background: hovered === 'alice' ? `${colors.success}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${hovered === 'alice' ? colors.success : 'rgba(255,255,255,0.08)'}`,
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, fontFamily: 'monospace' }}>
            Alice (msg.sender)
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: colors.text }}>
            До: <span style={{ color: colors.textMuted }}>{aliceBefore} CRST</span>
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: hovered === 'alice' ? '#f43f5e' : colors.text, fontWeight: 600 }}>
            После: {aliceAfter} CRST
          </div>
          {hovered === 'alice' && (
            <div style={{ fontSize: 11, color: '#f43f5e', marginTop: 6, fontFamily: 'monospace' }}>
              -{amount} (отправлено)
            </div>
          )}
        </div>

        {/* Arrow */}
        <div style={{ fontSize: 24, color: colors.success }}>
          →
        </div>

        {/* Bob */}
        <div
          onMouseEnter={() => setHovered('bob')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...glassStyle,
            padding: 16,
            minWidth: 160,
            background: hovered === 'bob' ? `${colors.success}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${hovered === 'bob' ? colors.success : 'rgba(255,255,255,0.08)'}`,
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8, fontFamily: 'monospace' }}>
            Bob (to)
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: colors.text }}>
            До: <span style={{ color: colors.textMuted }}>{bobBefore} CRST</span>
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: hovered === 'bob' ? colors.success : colors.text, fontWeight: 600 }}>
            После: {bobAfter} CRST
          </div>
          {hovered === 'bob' && (
            <div style={{ fontSize: 11, color: colors.success, marginTop: 6, fontFamily: 'monospace' }}>
              +{amount} (получено)
            </div>
          )}
        </div>
      </div>

      {/* Event log */}
      <div
        onMouseEnter={() => setHovered('event')}
        onMouseLeave={() => setHovered(null)}
        style={{
          ...glassStyle,
          marginTop: 16,
          padding: 12,
          background: hovered === 'event' ? `${colors.accent}10` : 'rgba(255,255,255,0.02)',
          border: `1px solid ${hovered === 'event' ? colors.accent + '40' : 'rgba(255,255,255,0.06)'}`,
          transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, fontFamily: 'monospace' }}>
          Event:
        </div>
        <div style={{ fontSize: 12, fontFamily: 'monospace', color: hovered === 'event' ? colors.accent : colors.text }}>
          Transfer(Alice, Bob, {amount})
        </div>
        {hovered === 'event' && (
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
            Каждый transfer() генерирует событие Transfer. Это позволяет индексаторам (Etherscan, The Graph) отслеживать переводы.
          </div>
        )}
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ApproveTransferFromDiagram                                          */
/* ================================================================== */

interface ATFState {
  aliceBalance: number;
  bobBalance: number;
  allowance: number;
  title: string;
  description: string;
  code: string;
  highlight: 'alice' | 'dex' | 'bob' | 'allowance' | null;
}

const ATF_HISTORY: ATFState[] = [
  {
    aliceBalance: 100,
    bobBalance: 0,
    allowance: 0,
    title: 'Начальное состояние',
    description: 'Alice владеет 100 CRST. DEX-контракт хочет обменять их на другой токен. Но DEX НЕ МОЖЕТ сам перевести токены Alice -- только Alice может вызвать transfer() от своего имени.',
    code: '// balances[Alice] = 100\n// balances[Bob] = 0\n// allowance[Alice][DEX] = 0',
    highlight: null,
  },
  {
    aliceBalance: 100,
    bobBalance: 0,
    allowance: 100,
    title: 'Шаг 1: Alice вызывает approve()',
    description: 'Alice дает DEX разрешение тратить до 100 токенов от ее имени. Это НЕ перевод -- это запись в mapping allowances.',
    code: 'token.approve(DEX, 100);\n// allowance[Alice][DEX] = 100\n// Событие: Approval(Alice, DEX, 100)',
    highlight: 'allowance',
  },
  {
    aliceBalance: 50,
    bobBalance: 50,
    allowance: 50,
    title: 'Шаг 2: DEX вызывает transferFrom()',
    description: 'DEX вызывает transferFrom(Alice, Bob, 50). Токены перемещаются от Alice к Bob, а allowance уменьшается на 50. DEX не трогает свои средства.',
    code: 'token.transferFrom(Alice, Bob, 50);\n// balances[Alice] = 50\n// balances[Bob] = 50\n// allowance[Alice][DEX] = 50\n// Событие: Transfer(Alice, Bob, 50)',
    highlight: 'dex',
  },
  {
    aliceBalance: 50,
    bobBalance: 50,
    allowance: 50,
    title: 'Почему нужен approve?',
    description: 'Контракт (DEX) не может вызвать transfer() от имени Alice, потому что msg.sender будет адресом DEX, а не Alice. Двухшаговый паттерн approve + transferFrom позволяет контрактам действовать от имени пользователя с его разрешения.',
    code: '// transfer(): msg.sender отправляет СВОИ токены\n// transferFrom(): msg.sender тратит ЧУЖИЕ токены\n//                (если есть разрешение)',
    highlight: 'alice',
  },
  {
    aliceBalance: 50,
    bobBalance: 50,
    allowance: 50,
    title: 'ERC-2612 permit() -- современная альтернатива',
    description: 'С ERC-2612 Alice подписывает off-chain сообщение (EIP-712), а DEX отправляет подпись в permit(). Нет отдельной транзакции approve -- экономия газа! CourseToken уже включает ERC20Permit.',
    code: '// Вместо двух транзакций:\n// 1. Alice -> approve(DEX, amount)  // стоит газ!\n// 2. DEX -> transferFrom(Alice, Bob, amount)\n\n// Одна транзакция:\n// DEX -> permit(Alice, DEX, amount, deadline, v, r, s)\n//     -> transferFrom(Alice, Bob, amount)',
    highlight: null,
  },
];

/**
 * ApproveTransferFromDiagram
 *
 * THE MOST IMPORTANT diagram in ETH-08.
 * Step-through with history array pattern showing the two-step approve/transferFrom flow.
 */
export function ApproveTransferFromDiagram() {
  const [stepIndex, setStepIndex] = useState(0);
  const state = ATF_HISTORY[stepIndex];

  const actorBox = (
    label: string,
    color: string,
    balanceLabel: string | null,
    balance: number | null,
    isHighlighted: boolean,
  ) => (
    <div style={{
      ...glassStyle,
      padding: 14,
      minWidth: 130,
      textAlign: 'center',
      background: isHighlighted ? `${color}20` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isHighlighted ? color : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.3s',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color, fontFamily: 'monospace', marginBottom: 6 }}>
        {label}
      </div>
      {balanceLabel !== null && balance !== null && (
        <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.text }}>
          {balanceLabel}: <span style={{
            color: isHighlighted ? color : colors.textMuted,
            fontWeight: isHighlighted ? 600 : 400,
          }}>{balance}</span>
        </div>
      )}
    </div>
  );

  return (
    <DiagramContainer title="ERC-20: approve + transferFrom" color="purple">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {ATF_HISTORY.map((s, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex ? colors.primary : 'rgba(255,255,255,0.1)',
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
        marginBottom: 12,
        fontFamily: 'monospace',
      }}>
        {state.title}
      </div>

      {/* Actors row */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {actorBox('Alice', colors.success, 'Баланс', state.aliceBalance, state.highlight === 'alice')}
        {actorBox('DEX', colors.primary, null, null, state.highlight === 'dex')}
        {actorBox('Bob', colors.accent, 'Баланс', state.bobBalance, state.highlight === 'bob')}
      </div>

      {/* Allowance indicator */}
      <div style={{
        ...glassStyle,
        padding: 10,
        textAlign: 'center',
        marginBottom: 12,
        background: state.highlight === 'allowance' ? '#eab30820' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${state.highlight === 'allowance' ? '#eab308' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.3s',
      }}>
        <span style={{ fontSize: 12, fontFamily: 'monospace', color: colors.textMuted }}>
          allowance[Alice][DEX] ={' '}
        </span>
        <span style={{
          fontSize: 14,
          fontFamily: 'monospace',
          fontWeight: 600,
          color: state.highlight === 'allowance' ? '#eab308' : colors.text,
        }}>
          {state.allowance}
        </span>
      </div>

      {/* Code block */}
      <div style={{
        ...glassStyle,
        padding: 12,
        marginBottom: 12,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <pre style={{
          margin: 0,
          fontSize: 12,
          fontFamily: 'monospace',
          color: colors.primary,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}>
          {state.code}
        </pre>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: colors.text,
        lineHeight: 1.6,
        marginBottom: 16,
      }}>
        {state.description}
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
          onClick={() => setStepIndex((s) => Math.min(ATF_HISTORY.length - 1, s + 1))}
          disabled={stepIndex >= ATF_HISTORY.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= ATF_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= ATF_HISTORY.length - 1 ? colors.textMuted : colors.primary,
            fontSize: 13,
            opacity: stepIndex >= ATF_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex >= ATF_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевой паттерн"
            value="approve() дает разрешение, transferFrom() использует его. permit() -- modern gasless альтернатива."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  TokenSupplyDiagram                                                  */
/* ================================================================== */

interface SupplySegment {
  label: string;
  amount: number;
  color: string;
  description: string;
}

const SUPPLY_SEGMENTS: SupplySegment[] = [
  {
    label: 'Deployer',
    amount: 500_000,
    color: colors.primary,
    description: 'Создатель контракта получает начальный supply через _mint() в конструкторе',
  },
  {
    label: 'Обращение',
    amount: 300_000,
    color: colors.success,
    description: 'Токены, распределенные через transfer(). totalSupply не меняется при переводах.',
  },
  {
    label: 'Сожжено',
    amount: 200_000,
    color: '#f43f5e',
    description: '_burn() уменьшает totalSupply и баланс владельца. Сожженные токены необратимо удалены.',
  },
];

const TOTAL_SUPPLY = SUPPLY_SEGMENTS.reduce((sum, s) => sum + s.amount, 0);

/**
 * TokenSupplyDiagram
 *
 * Shows total supply as a bar chart: deployer, circulating, burned.
 * Hover shows: mint increases totalSupply, burn decreases, transfer doesn't change.
 */
export function TokenSupplyDiagram() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <DiagramContainer title="Эмиссия токена ERC-20" color="blue">
      {/* Total supply label */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
          totalSupply() ={' '}
        </span>
        <span style={{ fontSize: 16, fontWeight: 600, color: colors.text, fontFamily: 'monospace' }}>
          {TOTAL_SUPPLY.toLocaleString()} CRST
        </span>
      </div>

      {/* Stacked bar */}
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 32, marginBottom: 16 }}>
        {SUPPLY_SEGMENTS.map((seg, i) => {
          const widthPercent = (seg.amount / TOTAL_SUPPLY) * 100;
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                width: `${widthPercent}%`,
                background: isHovered ? seg.color : `${seg.color}80`,
                transition: 'all 0.2s',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{
                fontSize: 10,
                fontFamily: 'monospace',
                color: '#fff',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}>
                {widthPercent.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SUPPLY_SEGMENTS.map((seg, i) => {
          const isHovered = hoveredIdx === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                ...glassStyle,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isHovered ? `${seg.color}12` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isHovered ? seg.color + '40' : 'rgba(255,255,255,0.06)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: seg.color,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'monospace',
                  color: isHovered ? seg.color : colors.text,
                  fontWeight: 600,
                }}>
                  {seg.label}: {seg.amount.toLocaleString()}
                </div>
                {isHovered && (
                  <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                    {seg.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mint/Burn/Transfer explanation */}
      <div style={{
        ...glassStyle,
        marginTop: 16,
        padding: 12,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 1.6,
      }}>
        <div><span style={{ color: colors.success, fontFamily: 'monospace' }}>_mint()</span> -- увеличивает totalSupply и баланс получателя</div>
        <div><span style={{ color: '#f43f5e', fontFamily: 'monospace' }}>_burn()</span> -- уменьшает totalSupply и баланс владельца</div>
        <div><span style={{ color: colors.primary, fontFamily: 'monospace' }}>transfer()</span> -- НЕ меняет totalSupply (перемещение между аккаунтами)</div>
      </div>
    </DiagramContainer>
  );
}
