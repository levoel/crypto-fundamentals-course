/** @jsxImportSource solid-js */
/**
 * ERC-20 Token Diagrams (ETH-08)
 *
 * Exports:
 * - ERC20TransferDiagram: Simple transfer flow (static with DiagramTooltip)
 * - ApproveTransferFromDiagram: Approve/TransferFrom two-step pattern (step-through)
 * - TokenSupplyDiagram: Token supply visualization (static with DiagramTooltip)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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
  const aliceBefore = 500;
  const bobBefore = 200;
  const amount = 100;
  const aliceAfter = aliceBefore - amount;
  const bobAfter = bobBefore + amount;

  return (
    <DiagramContainer title="ERC-20: прямой перевод (transfer)" color="green">
      {/* Call label */}
      <div style={{
        'text-align': 'center',
        'margin-bottom': '16px',
        'font-family': 'monospace',
        'font-size': '13px',
        'color': colors.primary,
      }}>
        token.transfer(Bob, {amount})
      </div>

      {/* Two account boxes */}
      <div style={{ 'display': 'flex', 'gap': '16px', 'justify-content': 'center', 'align-items': 'center', 'flex-wrap': 'wrap' }}>
        {/* Alice */}
        <DiagramTooltip content="Отправитель вызывает transfer(to, amount). EVM проверяет balance >= amount, вычитает из sender, добавляет к receiver. Атомарная операция.">
          <div
            style={{
              ...glassStyle,
              'padding': '16px',
              'min-width': '160px',
              'background': 'rgba(255,255,255,0.03)',
              'border': '1px solid rgba(255,255,255,0.08)',
              'transition': 'all 0.2s',
            }}
          >
            <div style={{ 'font-size': '12px', 'color': colors.textMuted, 'margin-bottom': '8px', 'font-family': 'monospace' }}>
              Alice (msg.sender)
            </div>
            <div style={{ 'font-size': '14px', 'font-family': 'monospace', 'color': colors.text }}>
              До: <span style={{ 'color': colors.textMuted }}>{aliceBefore} CRST</span>
            </div>
            <div style={{ 'font-size': '14px', 'font-family': 'monospace', 'color': colors.text, 'font-weight': '600' }}>
              После: {aliceAfter} CRST
            </div>
          </div>
        </DiagramTooltip>

        {/* Arrow */}
        <div style={{ 'font-size': '24px', 'color': colors.success }}>
          →
        </div>

        {/* Bob */}
        <DiagramTooltip content="Получатель автоматически получает токены. Не требует подтверждения. Transfer event эмитится для off-chain tracking.">
          <div
            style={{
              ...glassStyle,
              'padding': '16px',
              'min-width': '160px',
              'background': 'rgba(255,255,255,0.03)',
              'border': '1px solid rgba(255,255,255,0.08)',
              'transition': 'all 0.2s',
            }}
          >
            <div style={{ 'font-size': '12px', 'color': colors.textMuted, 'margin-bottom': '8px', 'font-family': 'monospace' }}>
              Bob (to)
            </div>
            <div style={{ 'font-size': '14px', 'font-family': 'monospace', 'color': colors.text }}>
              До: <span style={{ 'color': colors.textMuted }}>{bobBefore} CRST</span>
            </div>
            <div style={{ 'font-size': '14px', 'font-family': 'monospace', 'color': colors.text, 'font-weight': '600' }}>
              После: {bobAfter} CRST
            </div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Event log */}
      <DiagramTooltip content="Transfer(from, to, amount): событие ERC-20. Индексируется нодами для отслеживания балансов. Используется The Graph и Etherscan.">
        <div
          style={{
            ...glassStyle,
            'margin-top': '16px',
            'padding': '12px',
            'background': 'rgba(255,255,255,0.02)',
            'border': '1px solid rgba(255,255,255,0.06)',
            'transition': 'all 0.2s',
          }}
        >
          <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'margin-bottom': '4px', 'font-family': 'monospace' }}>
            Event:
          </div>
          <div style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': colors.text }}>
            Transfer(Alice, Bob, {amount})
          </div>
        </div>
      </DiagramTooltip>
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
  const [stepIndex, setStepIndex] = createSignal(0);
  const state = ATF_HISTORY[stepIndex()];

  const actorBox = (
    label: string,
    color: string,
    balanceLabel: string | null,
    balance: number | null,
    isHighlighted: boolean,
  ) => (
    <div style={{
      ...glassStyle,
      'padding': '14px',
      'min-width': '130px',
      'text-align': 'center',
      'background': isHighlighted ? `${color}20` : 'rgba(255,255,255,0.03)',
      'border': `1px solid ${isHighlighted ? color : 'rgba(255,255,255,0.08)'}`,
      'transition': 'all 0.3s',
    }}>
      <div style={{ 'font-size': '13px', 'font-weight': '600', color, 'font-family': 'monospace', 'margin-bottom': '6px' }}>
        {label}
      </div>
      {balanceLabel !== null && balance !== null && (
        <div style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': colors.text }}>
          {balanceLabel}: <span style={{
            'color': isHighlighted ? color : colors.textMuted,
            'font-weight': isHighlighted ? 600 : 400,
          }}>{balance}</span>
        </div>
      )}
    </div>
  );

  return (
    <DiagramContainer title="ERC-20: approve + transferFrom" color="purple">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {ATF_HISTORY.map((s, i) => (
          <div
            onClick={() => setStepIndex(i)}
            style={{
              'flex': '1',
              'height': '4px',
              'border-radius': '2px',
              'cursor': 'pointer',
              'background': i <= stepIndex() ? colors.primary : 'rgba(255,255,255,0.1)',
              'transition': 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <DiagramTooltip content={state.description}>
        <div style={{
          'font-size': '14px',
          'font-weight': '600',
          'color': colors.text,
          'margin-bottom': '12px',
          'font-family': 'monospace',
        }}>
          {state.title}
        </div>
      </DiagramTooltip>

      {/* Actors row */}
      <div style={{ 'display': 'flex', 'gap': '12px', 'justify-content': 'center', 'align-items': 'center', 'flex-wrap': 'wrap', 'margin-bottom': '12px' }}>
        {actorBox('Alice', colors.success, 'Баланс', state.aliceBalance, state.highlight === 'alice')}
        {actorBox('DEX', colors.primary, null, null, state.highlight === 'dex')}
        {actorBox('Bob', colors.accent, 'Баланс', state.bobBalance, state.highlight === 'bob')}
      </div>

      {/* Allowance indicator */}
      <div style={{
        ...glassStyle,
        'padding': '10px',
        'text-align': 'center',
        'margin-bottom': '12px',
        'background': state.highlight === 'allowance' ? '#eab30820' : 'rgba(255,255,255,0.02)',
        'border': `1px solid ${state.highlight === 'allowance' ? '#eab308' : 'rgba(255,255,255,0.06)'}`,
        'transition': 'all 0.3s',
      }}>
        <span style={{ 'font-size': '12px', 'font-family': 'monospace', 'color': colors.textMuted }}>
          allowance[Alice][DEX] ={' '}
        </span>
        <span style={{
          'font-size': '14px',
          'font-family': 'monospace',
          'font-weight': '600',
          'color': state.highlight === 'allowance' ? '#eab308' : colors.text,
        }}>
          {state.allowance}
        </span>
      </div>

      {/* Code block */}
      <div style={{
        ...glassStyle,
        'padding': '12px',
        'margin-bottom': '12px',
        'background': 'rgba(255,255,255,0.02)',
        'border': '1px solid rgba(255,255,255,0.06)',
      }}>
        <pre style={{
          'margin': '0',
          'font-size': '12px',
          'font-family': 'monospace',
          'color': colors.primary,
          'white-space': 'pre-wrap',
          'line-height': '1.6',
        }}>
          {state.code}
        </pre>
      </div>

      {/* Description */}
      <div style={{
        'font-size': '13px',
        'color': colors.text,
        'line-height': '1.6',
        'margin-bottom': '16px',
      }}>
        {state.description}
      </div>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'justify-content': 'center' }}>
        <button
          onClick={() => setStepIndex(0)}
          style={{
            ...glassStyle,
            'padding': '8px 16px',
            'cursor': 'pointer',
            'color': colors.text,
            'font-size': '13px',
          }}
        >
          Сброс
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
          disabled={stepIndex() === 0}
          style={{
            ...glassStyle,
            'padding': '8px 20px',
            'cursor': stepIndex() === 0 ? 'not-allowed' : 'pointer',
            'color': stepIndex() === 0 ? colors.textMuted : colors.text,
            'font-size': '13px',
            'opacity': stepIndex() === 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.min(ATF_HISTORY.length - 1, s + 1))}
          disabled={stepIndex() >= ATF_HISTORY.length - 1}
          style={{
            ...glassStyle,
            'padding': '8px 20px',
            'cursor': stepIndex() >= ATF_HISTORY.length - 1 ? 'not-allowed' : 'pointer',
            'color': stepIndex() >= ATF_HISTORY.length - 1 ? colors.textMuted : colors.primary,
            'font-size': '13px',
            'opacity': stepIndex() >= ATF_HISTORY.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>

      {stepIndex() >= ATF_HISTORY.length - 1 && (
        <div style={{ 'margin-top': '12px' }}>
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
 * DiagramTooltip on legend items shows: mint increases totalSupply, burn decreases, transfer doesn't change.
 */
export function TokenSupplyDiagram() {
  return (
    <DiagramContainer title="Эмиссия токена ERC-20" color="blue">
      {/* Total supply label */}
      <div style={{ 'text-align': 'center', 'margin-bottom': '16px' }}>
        <span style={{ 'font-size': '12px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
          totalSupply() ={' '}
        </span>
        <span style={{ 'font-size': '16px', 'font-weight': '600', 'color': colors.text, 'font-family': 'monospace' }}>
          {TOTAL_SUPPLY.toLocaleString()} CRST
        </span>
      </div>

      {/* Stacked bar */}
      <div style={{ 'display': 'flex', 'border-radius': '8px', 'overflow': 'hidden', 'height': '32px', 'margin-bottom': '16px' }}>
        {SUPPLY_SEGMENTS.map((seg, i) => {
          const widthPercent = (seg.amount / TOTAL_SUPPLY) * 100;

          return (
            <DiagramTooltip content={seg.description}>
              <div
                style={{
                  'width': `${widthPercent}%`,
                  'background': `${seg.color}80`,
                  'transition': 'all 0.2s',
                  'cursor': 'pointer',
                  'display': 'flex',
                  'align-items': 'center',
                  'justify-content': 'center',
                }}
              >
                <span style={{
                  'font-size': '10px',
                  'font-family': 'monospace',
                  'color': '#fff',
                  'font-weight': '600',
                  'text-shadow': '0 1px 2px rgba(0,0,0,0.5)',
                }}>
                  {widthPercent.toFixed(0)}%
                </span>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '8px' }}>
        {SUPPLY_SEGMENTS.map((seg, i) => (
          <DiagramTooltip content={seg.description}>
            <div
              style={{
                ...glassStyle,
                'padding': '10px 14px',
                'display': 'flex',
                'align-items': 'center',
                'gap': '12px',
                'background': 'rgba(255,255,255,0.02)',
                'border': '1px solid rgba(255,255,255,0.06)',
                'cursor': 'pointer',
                'transition': 'all 0.2s',
              }}
            >
              <div style={{
                'width': '12px',
                'height': '12px',
                'border-radius': '3px',
                'background': seg.color,
                'flex-shrink': '0',
              }} />
              <div style={{ 'flex': '1' }}>
                <div style={{
                  'font-size': '13px',
                  'font-family': 'monospace',
                  'color': colors.text,
                  'font-weight': '600',
                }}>
                  {seg.label}: {seg.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Mint/Burn/Transfer explanation */}
      <div style={{
        ...glassStyle,
        'margin-top': '16px',
        'padding': '12px',
        'font-size': '12px',
        'color': colors.textMuted,
        'line-height': '1.6',
      }}>
        <div><span style={{ 'color': colors.success, 'font-family': 'monospace' }}>_mint()</span> -- увеличивает totalSupply и баланс получателя</div>
        <div><span style={{ 'color': '#f43f5e', 'font-family': 'monospace' }}>_burn()</span> -- уменьшает totalSupply и баланс владельца</div>
        <div><span style={{ 'color': colors.primary, 'font-family': 'monospace' }}>transfer()</span> -- НЕ меняет totalSupply (перемещение между аккаунтами)</div>
      </div>
    </DiagramContainer>
  );
}
