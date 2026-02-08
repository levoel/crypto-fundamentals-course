/**
 * Account Model Diagrams (ETH-02)
 *
 * Exports:
 * - EOAvsContractDiagram: EOA vs Contract account comparison (static with hover)
 * - AccountFieldsDiagram: Account state fields explorer (static with interactive hover)
 * - AccountStateTransitionDiagram: Step-through account state changes (history array)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

/** FNV-1a hash producing 16 hex chars (two 32-bit rounds) */
function fnvHash(input: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x45d9f3b);
  h1 ^= h1 >>> 16;
  let h2 = 0x1a2b3c4d;
  for (let i = 0; i < input.length; i++) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x01000193);
  }
  h2 ^= h2 >>> 16;
  h2 = Math.imul(h2, 0x45d9f3b);
  h2 ^= h2 >>> 16;
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

function truncHex(s: string, len = 8): string {
  return s.length > len ? s.slice(0, len) + '...' : s;
}

function btnStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    ...glassStyle,
    padding: '8px 16px',
    cursor: active ? 'pointer' : 'not-allowed',
    color: active ? accentColor : colors.textMuted,
    fontSize: 13,
    opacity: active ? 1 : 0.5,
    border: `1px solid ${active ? accentColor + '50' : colors.border}`,
    borderRadius: 8,
    background: active ? accentColor + '10' : 'rgba(255,255,255,0.03)',
  };
}

/* ================================================================== */
/*  EOAvsContractDiagram                                                */
/* ================================================================== */

interface AccountFieldComparison {
  field: string;
  eoa: string;
  contract: string;
  shared: boolean;
}

const ACCOUNT_FIELDS_COMPARISON: AccountFieldComparison[] = [
  {
    field: 'nonce',
    eoa: 'Счетчик отправленных транзакций',
    contract: 'Счетчик созданных контрактов (через CREATE)',
    shared: false,
  },
  {
    field: 'balance',
    eoa: 'Баланс в wei (1 ETH = 10^18 wei)',
    contract: 'Баланс в wei (контракт может хранить ETH)',
    shared: true,
  },
  {
    field: 'storageRoot',
    eoa: 'Пустой (keccak256 пустого RLP)',
    contract: 'Корень storage trie контракта',
    shared: false,
  },
  {
    field: 'codeHash',
    eoa: 'keccak256("") = 0xc5d2...7f',
    contract: 'keccak256(bytecode) -- неизменяемый',
    shared: false,
  },
];

interface AccountTypeInfo {
  label: string;
  color: string;
  icon: string;
  control: string;
  initiation: string;
  code: string;
}

const EOA_INFO: AccountTypeInfo = {
  label: 'EOA (Externally Owned Account)',
  color: colors.primary,
  icon: 'K',
  control: 'Управляется приватным ключом',
  initiation: 'Может инициировать транзакции',
  code: 'Не содержит кода',
};

const CONTRACT_INFO: AccountTypeInfo = {
  label: 'Contract Account',
  color: '#a855f7',
  icon: 'C',
  control: 'Управляется байткодом',
  initiation: 'Активируется транзакциями/вызовами',
  code: 'Содержит неизменяемый код (EVM bytecode)',
};

export function EOAvsContractDiagram() {
  const [hoveredField, setHoveredField] = useState<number | null>(null);

  return (
    <DiagramContainer title="EOA vs Contract Account" color="blue">
      {/* Account type headers */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[EOA_INFO, CONTRACT_INFO].map((info) => (
          <div key={info.label} style={{
            ...glassStyle,
            flex: 1,
            padding: '12px 16px',
            borderTop: `3px solid ${info.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: info.color + '20', border: `2px solid ${info.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: info.color,
              }}>
                {info.icon}
              </div>
              <div style={{ fontWeight: 600, color: info.color, fontSize: 13, fontFamily: 'monospace' }}>
                {info.label}
              </div>
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
              <div>{info.control}</div>
              <div>{info.initiation}</div>
              <div>{info.code}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Field comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'monospace', borderBottom: `1px solid ${colors.border}`, width: '20%' }}>
                Поле
              </th>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'monospace', borderBottom: `1px solid ${colors.border}`, color: colors.primary, width: '40%' }}>
                EOA
              </th>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'monospace', borderBottom: `1px solid ${colors.border}`, color: '#a855f7', width: '40%' }}>
                Contract
              </th>
            </tr>
          </thead>
          <tbody>
            {ACCOUNT_FIELDS_COMPARISON.map((row, i) => {
              const isHovered = hoveredField === i;
              const fieldColor = row.shared ? colors.success : '#f59e0b';
              return (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredField(i)}
                  onMouseLeave={() => setHoveredField(null)}
                  style={{ cursor: 'default' }}
                >
                  <td style={{
                    padding: '8px 10px', fontFamily: 'monospace',
                    fontWeight: 600, color: isHovered ? fieldColor : colors.text,
                    background: isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    borderRadius: 4,
                  }}>
                    {row.field}
                    <span style={{ fontSize: 9, marginLeft: 4, color: fieldColor }}>
                      {row.shared ? '(=)' : '(!=)'}
                    </span>
                  </td>
                  <td style={{
                    padding: '8px 10px', fontFamily: 'monospace', fontSize: 11,
                    color: colors.textMuted,
                    background: isHovered ? `${colors.primary}10` : 'rgba(255,255,255,0.03)',
                    borderRadius: 4,
                  }}>
                    {row.eoa}
                  </td>
                  <td style={{
                    padding: '8px 10px', fontFamily: 'monospace', fontSize: 11,
                    color: colors.text,
                    background: isHovered ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.03)',
                    borderRadius: 4,
                  }}>
                    {row.contract}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Ключевое отличие"
          value="EOA контролируется приватным ключом (ECDSA secp256k1). Contract контролируется кодом -- его поведение полностью определяется байткодом, который неизменяем после деплоя."
          variant="highlight"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AccountFieldsDiagram                                                */
/* ================================================================== */

interface FieldDetail {
  name: string;
  type: string;
  size: string;
  encoding: string;
  eoaExample: string;
  contractExample: string;
  role: string;
  color: string;
}

const FIELD_DETAILS: FieldDetail[] = [
  {
    name: 'nonce',
    type: 'uint64',
    size: '8 байт',
    encoding: 'RLP integer',
    eoaExample: '42 (отправлено 42 транзакции)',
    contractExample: '3 (создано 3 контракта через CREATE)',
    role: 'Защита от replay-атак. Каждая транзакция должна содержать текущий nonce аккаунта.',
    color: colors.primary,
  },
  {
    name: 'balance',
    type: 'uint256',
    size: '32 байта',
    encoding: 'RLP integer (в wei)',
    eoaExample: '1000000000000000000 (= 1 ETH)',
    contractExample: '5000000000000000000 (= 5 ETH)',
    role: 'Баланс аккаунта в wei. 1 ETH = 10^18 wei. Обновляется при каждом переводе и оплате газа.',
    color: colors.success,
  },
  {
    name: 'storageRoot',
    type: 'bytes32',
    size: '32 байта',
    encoding: 'Keccak-256 hash',
    eoaExample: '0x56e8...c5d2 (keccak256 пустого trie)',
    contractExample: '0xa1b2...f3e4 (корень storage trie)',
    role: 'Корень дерева хранилища контракта. Для EOA -- хеш пустого дерева. Для контракта -- корень его storage trie с переменными состояния.',
    color: '#f59e0b',
  },
  {
    name: 'codeHash',
    type: 'bytes32',
    size: '32 байта',
    encoding: 'Keccak-256 hash',
    eoaExample: '0xc5d2...467f (keccak256 пустого байткода)',
    contractExample: '0x7f9a...b3c1 (keccak256 bytecode)',
    role: 'Хеш байткода контракта. Для EOA -- keccak256("") = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470. Неизменяемый после деплоя.',
    color: '#a855f7',
  },
];

export function AccountFieldsDiagram() {
  const [selectedField, setSelectedField] = useState<number | null>(null);

  const selected = selectedField !== null ? FIELD_DETAILS[selectedField] : null;

  return (
    <DiagramContainer title="Поля состояния аккаунта" color="green">
      {/* Account box */}
      <div style={{
        ...glassStyle,
        padding: '16px',
        border: `1px solid ${colors.border}`,
        marginBottom: 12,
      }}>
        <div style={{
          textAlign: 'center', fontFamily: 'monospace', fontSize: 11,
          color: colors.textMuted, marginBottom: 12,
        }}>
          Account State = rlp([nonce, balance, storageRoot, codeHash])
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FIELD_DETAILS.map((field, i) => {
            const isSelected = selectedField === i;
            return (
              <div
                key={field.name}
                onClick={() => setSelectedField(isSelected ? null : i)}
                style={{
                  ...glassStyle,
                  padding: '10px 16px',
                  flex: '1 1 auto',
                  minWidth: 120,
                  maxWidth: 180,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${field.color}`,
                  background: isSelected ? field.color + '15' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSelected ? field.color : colors.border}`,
                  borderLeftWidth: 3,
                  borderLeftColor: field.color,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <div style={{
                  fontFamily: 'monospace', fontSize: 14, fontWeight: 600,
                  color: isSelected ? field.color : colors.text,
                }}>
                  {field.name}
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 10, color: colors.textMuted, marginTop: 4,
                }}>
                  {field.type} ({field.size})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div style={{
          ...glassStyle,
          padding: '14px',
          borderLeft: `3px solid ${selected.color}`,
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: selected.color, marginBottom: 8 }}>
            {selected.name}: {selected.type}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <div>
              <span style={{ color: colors.textMuted }}>Кодирование: </span>
              <span style={{ color: colors.text, fontFamily: 'monospace' }}>{selected.encoding}</span>
            </div>
            <div>
              <span style={{ color: colors.textMuted }}>Роль: </span>
              <span style={{ color: colors.text }}>{selected.role}</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ color: colors.primary, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>EOA:</div>
              <div style={{ color: colors.text, fontFamily: 'monospace', fontSize: 11 }}>{selected.eoaExample}</div>
            </div>
            <div>
              <div style={{ color: '#a855f7', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>Contract:</div>
              <div style={{ color: colors.text, fontFamily: 'monospace', fontSize: 11 }}>{selected.contractExample}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
          Нажмите на поле, чтобы увидеть подробности
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AccountStateTransitionDiagram                                       */
/* ================================================================== */

interface AccountState {
  address: string;
  label: string;
  nonce: number;
  balance: string;
  storageRoot: string;
  codeHash: string;
  isContract: boolean;
}

interface TransitionStep {
  title: string;
  description: string;
  accounts: AccountState[];
  stateRoot: string;
  highlight?: string;
}

const EMPTY_STORAGE_ROOT = '56e81f17';
const EMPTY_CODE_HASH = 'c5d2467f';

const TRANSITION_STEPS: TransitionStep[] = [
  {
    title: 'Шаг 0: Начальное состояние',
    description: 'Alice имеет 10 ETH, Bob -- 0 ETH. Оба -- EOA. State root вычисляется из состояния всех аккаунтов.',
    accounts: [
      { address: '0xAlice', label: 'Alice (EOA)', nonce: 0, balance: '10.00 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
      { address: '0xBob', label: 'Bob (EOA)', nonce: 0, balance: '0.00 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
    ],
    stateRoot: fnvHash('state-root-step-0'),
  },
  {
    title: 'Шаг 1: Alice отправляет 1 ETH Bob',
    description: 'Транзакция: Alice -> Bob, 1 ETH. Nonce Alice увеличивается на 1. Gas fee = 0.01 ETH. Баланс Alice: 10 - 1 - 0.01 = 8.99 ETH. State root меняется.',
    accounts: [
      { address: '0xAlice', label: 'Alice (EOA)', nonce: 1, balance: '8.99 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
      { address: '0xBob', label: 'Bob (EOA)', nonce: 0, balance: '1.00 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
    ],
    stateRoot: fnvHash('state-root-step-1'),
    highlight: 'nonce: 0 -> 1, balance: 10.00 -> 8.99 (Alice), balance: 0.00 -> 1.00 (Bob)',
  },
  {
    title: 'Шаг 2: Alice деплоит контракт',
    description: 'Alice отправляет транзакцию с data (байткод), без адресата (to = null). Nonce Alice: 2. Gas fee = 0.01 ETH. Создается новый Contract Account.',
    accounts: [
      { address: '0xAlice', label: 'Alice (EOA)', nonce: 2, balance: '8.98 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
      { address: '0xBob', label: 'Bob (EOA)', nonce: 0, balance: '1.00 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
      { address: '0xC0ntr', label: 'Contract', nonce: 0, balance: '0.00 ETH', storageRoot: fnvHash('contract-storage').slice(0, 8), codeHash: fnvHash('contract-code').slice(0, 8), isContract: true },
    ],
    stateRoot: fnvHash('state-root-step-2'),
    highlight: 'Новый аккаунт: Contract с codeHash и storageRoot',
  },
  {
    title: 'Шаг 3: Адрес контракта',
    description: 'Адрес нового контракта = keccak256(rlp([sender, nonce]))[12:]. Alice (nonce=1 на момент деплоя) -> уникальный адрес. Детерминистически вычислим.',
    accounts: [
      { address: '0xAlice', label: 'Alice (EOA)', nonce: 2, balance: '8.98 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
      { address: '0xBob', label: 'Bob (EOA)', nonce: 0, balance: '1.00 ETH', storageRoot: EMPTY_STORAGE_ROOT, codeHash: EMPTY_CODE_HASH, isContract: false },
      { address: '0xC0ntr', label: 'Contract', nonce: 0, balance: '0.00 ETH', storageRoot: fnvHash('contract-storage').slice(0, 8), codeHash: fnvHash('contract-code').slice(0, 8), isContract: true },
    ],
    stateRoot: fnvHash('state-root-step-2'),
    highlight: 'address = keccak256(rlp([Alice, 1]))[12:]',
  },
];

export function AccountStateTransitionDiagram() {
  const [step, setStep] = useState(0);

  const current = TRANSITION_STEPS[step];

  return (
    <DiagramContainer title="Переходы состояния аккаунтов" color="purple">
      {/* Step info */}
      <div style={{
        ...glassStyle,
        padding: '10px 14px',
        marginBottom: 12,
        borderLeft: `3px solid #a855f7`,
      }}>
        <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 4 }}>
          {current.title}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 12 }}>
          {current.description}
        </div>
      </div>

      {/* Accounts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {current.accounts.map((acc, i) => (
          <div
            key={`${acc.address}-${i}`}
            style={{
              ...glassStyle,
              padding: '10px 14px',
              flex: '1 1 auto',
              minWidth: 200,
              borderTop: `3px solid ${acc.isContract ? '#a855f7' : colors.primary}`,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: acc.isContract ? '#a855f720' : colors.primary + '20',
                border: `1.5px solid ${acc.isContract ? '#a855f7' : colors.primary}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                color: acc.isContract ? '#a855f7' : colors.primary,
              }}>
                {acc.isContract ? 'C' : 'E'}
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: colors.text }}>
                {acc.label}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontFamily: 'monospace', fontSize: 11 }}>
              <div>
                <span style={{ color: colors.primary }}>nonce: </span>
                <span style={{ color: colors.text }}>{acc.nonce}</span>
              </div>
              <div>
                <span style={{ color: colors.success }}>balance: </span>
                <span style={{ color: colors.text }}>{acc.balance}</span>
              </div>
              <div>
                <span style={{ color: '#f59e0b' }}>storageRoot: </span>
                <span style={{ color: colors.textMuted }}>0x{truncHex(acc.storageRoot)}</span>
              </div>
              <div>
                <span style={{ color: '#a855f7' }}>codeHash: </span>
                <span style={{ color: colors.textMuted }}>0x{truncHex(acc.codeHash)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* State root */}
      <div style={{
        ...glassStyle,
        padding: '8px 14px',
        textAlign: 'center',
        fontFamily: 'monospace',
        fontSize: 12,
      }}>
        <span style={{ color: colors.textMuted }}>State Root: </span>
        <span style={{ color: '#a855f7', fontWeight: 600 }}>0x{truncHex(current.stateRoot, 16)}</span>
      </div>

      {/* Highlight */}
      {current.highlight && (
        <div style={{ marginTop: 8 }}>
          <DataBox label="Изменения" value={current.highlight} variant="highlight" />
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button onClick={() => setStep(0)} style={btnStyle(true, colors.text)}>
          Сброс
        </button>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={btnStyle(step > 0, colors.text)}
        >
          Назад
        </button>
        <button
          onClick={() => setStep((s) => Math.min(TRANSITION_STEPS.length - 1, s + 1))}
          disabled={step >= TRANSITION_STEPS.length - 1}
          style={btnStyle(step < TRANSITION_STEPS.length - 1, '#a855f7')}
        >
          Далее
        </button>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {TRANSITION_STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i === step ? '#a855f7' : 'rgba(255,255,255,0.15)',
              border: `1px solid ${i === step ? '#a855f7' : colors.border}`,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </DiagramContainer>
  );
}
