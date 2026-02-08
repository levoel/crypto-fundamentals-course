/**
 * Account Model Diagrams (SOL-04)
 *
 * Exports:
 * - SolanaAccountStructureDiagram: Solana account 5-field explorer with data/program toggle (static with hover)
 * - EthVsSolanaStateDiagram: Ethereum bundled vs Solana separated state model comparison (static with hover)
 * - PDADerivationDiagram: Step-through PDA derivation with FNV hash simulation (interactive, history array)
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

function truncHex(s: string, len = 16): string {
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
/*  SolanaAccountStructureDiagram                                       */
/* ================================================================== */

interface AccountField {
  name: string;
  type: string;
  hoverRu: string;
  dataExample: string;
  programExample: string;
  color: string;
}

const ACCOUNT_FIELDS: AccountField[] = [
  {
    name: 'lamports',
    type: 'u64',
    hoverRu: 'Баланс в lamports (1 SOL = 10^9 lamports). Любой может зачислить lamports, только owner может списать.',
    dataExample: '1 000 000 000 (= 1 SOL)',
    programExample: '500 000 (rent-exempt minimum)',
    color: colors.success,
  },
  {
    name: 'data',
    type: 'Vec<u8>',
    hoverRu: 'Произвольный массив байтов. Только owner-программа может изменять. Для программ: содержит BPF bytecode. Для data-аккаунтов: сериализованное состояние.',
    dataExample: '[counter: u64 = 42, authority: Pubkey]',
    programExample: '[BPF bytecode, ~200 KB]',
    color: colors.primary,
  },
  {
    name: 'owner',
    type: 'Pubkey',
    hoverRu: 'Программа-владелец аккаунта. Только owner может изменять data и списывать lamports. По умолчанию: System Program (1111...1111).',
    dataExample: 'CounterProgram (Cntr7x...)',
    programExample: 'BPF Loader (BPFLoad...)',
    color: '#f59e0b',
  },
  {
    name: 'executable',
    type: 'bool',
    hoverRu: 'Является ли аккаунт программой. Если true, поле data содержит исполняемый BPF bytecode. Программы принадлежат BPF Loader.',
    dataExample: 'false',
    programExample: 'true',
    color: '#a855f7',
  },
  {
    name: 'rent_epoch',
    type: 'u64',
    hoverRu: 'Эпоха, когда будет следующая проверка rent. Аккаунты должны поддерживать минимальный баланс (rent-exempt threshold) для сохранения. Если баланс ниже порога, аккаунт может быть удалён.',
    dataExample: '512',
    programExample: '512',
    color: colors.textMuted,
  },
];

export function SolanaAccountStructureDiagram() {
  const [hoveredField, setHoveredField] = useState<number | null>(null);
  const [mode, setMode] = useState<'data' | 'program'>('data');

  const hovered = hoveredField !== null ? ACCOUNT_FIELDS[hoveredField] : null;

  return (
    <DiagramContainer title="Структура аккаунта Solana" color="green">
      {/* Toggle */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
        {(['data', 'program'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setHoveredField(null); }}
            style={{
              ...glassStyle,
              padding: '6px 16px',
              cursor: 'pointer',
              background: mode === m ? (m === 'data' ? colors.success + '20' : '#a855f720') : 'rgba(255,255,255,0.05)',
              border: `1px solid ${mode === m ? (m === 'data' ? colors.success : '#a855f7') : colors.border}`,
              color: mode === m ? (m === 'data' ? colors.success : '#a855f7') : colors.textMuted,
              fontSize: 12, fontFamily: 'monospace', fontWeight: 600,
              borderRadius: 8,
            }}
          >
            {m === 'data' ? 'Data Account' : 'Program Account'}
          </button>
        ))}
      </div>

      {/* Account box with 5 fields */}
      <div style={{
        ...glassStyle,
        padding: '16px',
        border: `1px solid ${mode === 'data' ? colors.success + '40' : '#a855f740'}`,
        marginBottom: 12,
      }}>
        <div style={{
          textAlign: 'center', fontFamily: 'monospace', fontSize: 11,
          color: colors.textMuted, marginBottom: 12,
        }}>
          Account = {'{'} lamports, data, owner, executable, rent_epoch {'}'}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {ACCOUNT_FIELDS.map((field, i) => {
            const isHovered = hoveredField === i;
            return (
              <div
                key={field.name}
                onMouseEnter={() => setHoveredField(i)}
                onMouseLeave={() => setHoveredField(null)}
                style={{
                  ...glassStyle,
                  padding: '10px 14px',
                  flex: '1 1 auto',
                  minWidth: 110,
                  maxWidth: 170,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${field.color}`,
                  background: isHovered ? field.color + '15' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isHovered ? field.color : colors.border}`,
                  borderLeftWidth: 3,
                  borderLeftColor: field.color,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                <div style={{
                  fontFamily: 'monospace', fontSize: 13, fontWeight: 600,
                  color: isHovered ? field.color : colors.text,
                }}>
                  {field.name}
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 10, color: colors.textMuted, marginTop: 4,
                }}>
                  {field.type}
                </div>
                <div style={{
                  fontSize: 10, color: colors.textMuted, marginTop: 4,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {mode === 'data' ? field.dataExample : field.programExample}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {hovered ? (
        <div style={{
          ...glassStyle,
          padding: '12px 14px',
          borderLeft: `3px solid ${hovered.color}`,
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: hovered.color, marginBottom: 6 }}>
            {hovered.name}: {hovered.type}
          </div>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.5, marginBottom: 8 }}>
            {hovered.hoverRu}
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
            <div>
              <span style={{ color: colors.success, fontWeight: 600 }}>Data Account: </span>
              <span style={{ color: colors.text, fontFamily: 'monospace' }}>{hovered.dataExample}</span>
            </div>
            <div>
              <span style={{ color: '#a855f7', fontWeight: 600 }}>Program: </span>
              <span style={{ color: colors.text, fontFamily: 'monospace' }}>{hovered.programExample}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' }}>
          Наведите на поле, чтобы увидеть подробности
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  EthVsSolanaStateDiagram                                             */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  ethereum: string;
  solana: string;
}

const STATE_COMPARISON: ComparisonRow[] = [
  {
    aspect: 'Хранение данных',
    ethereum: 'mapping(address => uint256) -- внутри контракта',
    solana: 'PDA: seeds = [b"balance", user.key()] -- отдельный аккаунт',
  },
  {
    aspect: 'Вычисление слота',
    ethereum: 'keccak256(key . slot) -- storage slot',
    solana: 'SHA-256(seeds + bump + program_id) -- PDA адрес',
  },
  {
    aspect: 'Расположение данных',
    ethereum: 'Внутри storage контракта',
    solana: 'Отдельный аккаунт, принадлежащий программе',
  },
  {
    aspect: 'Объявление',
    ethereum: 'Неявное (storage slot создается при записи)',
    solana: 'Явное (аккаунт нужно создать и оплатить rent)',
  },
];

export function EthVsSolanaStateDiagram() {
  const [hoveredSide, setHoveredSide] = useState<'eth' | 'sol' | null>(null);

  return (
    <DiagramContainer title="Ethereum vs Solana: модели состояния" color="purple">
      {/* Visual comparison */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {/* Ethereum side */}
        <div
          onMouseEnter={() => setHoveredSide('eth')}
          onMouseLeave={() => setHoveredSide(null)}
          style={{
            ...glassStyle,
            flex: 1,
            padding: '14px',
            borderTop: `3px solid #a855f7`,
            background: hoveredSide === 'eth' ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.05)',
            transition: 'background 0.15s',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#a855f7', marginBottom: 10, textAlign: 'center' }}>
            Ethereum: Smart Contract
          </div>
          {/* Single bundled box */}
          <div style={{
            ...glassStyle,
            padding: '10px',
            border: `1px solid #a855f740`,
          }}>
            {['Code (EVM bytecode)', 'Storage (key-value slots)', 'Balance (wei)', 'Nonce'].map((item, i) => (
              <div key={i} style={{
                padding: '4px 8px',
                fontSize: 11,
                fontFamily: 'monospace',
                color: colors.text,
                borderBottom: i < 3 ? `1px solid ${colors.border}` : 'none',
              }}>
                {item}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, color: '#a855f7', marginTop: 8, fontWeight: 600 }}>
            Code + Data = ОДИН аккаунт
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
            Контракт -- как объект со свойствами
          </div>
        </div>

        {/* Solana side */}
        <div
          onMouseEnter={() => setHoveredSide('sol')}
          onMouseLeave={() => setHoveredSide(null)}
          style={{
            ...glassStyle,
            flex: 1,
            padding: '14px',
            borderTop: `3px solid ${colors.success}`,
            background: hoveredSide === 'sol' ? `${colors.success}10` : 'rgba(255,255,255,0.05)',
            transition: 'background 0.15s',
          }}
        >
          <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: colors.success, marginBottom: 10, textAlign: 'center' }}>
            Solana: Program + Data Accounts
          </div>
          {/* Two separate boxes with arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            {/* Program box */}
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              border: `1px solid ${colors.success}40`,
              width: '100%',
            }}>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.success, fontWeight: 600 }}>
                Program (executable)
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>
                Stateless -- нет внутреннего хранилища
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>
                Owner: BPF Loader
              </div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: 11, color: colors.success, fontFamily: 'monospace' }}>
              operates on
            </div>
            <div style={{ fontSize: 16, color: colors.success, lineHeight: 0.5 }}>
              &#8595;
            </div>

            {/* Data account box */}
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              border: `1px solid ${colors.primary}40`,
              width: '100%',
            }}>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.primary, fontWeight: 600 }}>
                Data Account
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>
                Owned by program, stores state
              </div>
              <div style={{ fontSize: 10, color: colors.textMuted }}>
                Has lamport balance
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, color: colors.success, marginTop: 8, fontWeight: 600 }}>
            Code и Data = РАЗНЫЕ аккаунты
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
            Программа -- как функция, данные -- аргументы
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'monospace', borderBottom: `1px solid ${colors.border}`, width: '22%', color: colors.textMuted }}>
                Аспект
              </th>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'monospace', borderBottom: `1px solid ${colors.border}`, color: '#a855f7', width: '39%' }}>
                Ethereum
              </th>
              <th style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'monospace', borderBottom: `1px solid ${colors.border}`, color: colors.success, width: '39%' }}>
                Solana
              </th>
            </tr>
          </thead>
          <tbody>
            {STATE_COMPARISON.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 600, color: colors.text, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                  {row.aspect}
                </td>
                <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: colors.textMuted, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                  {row.ethereum}
                </td>
                <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: colors.text, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                  {row.solana}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Ключевое отличие"
          value='Ethereum контракты -- как объекты с properties. Solana программы -- как функции, получающие данные как аргументы. Программы stateless: они не хранят ничего внутри себя.'
          variant="highlight"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  PDADerivationDiagram                                                */
/* ================================================================== */

interface PDAStep {
  title: string;
  description: string;
  content: React.ReactNode;
}

function PDAStepContent({ step, seedHex, programIdHex }: { step: number; seedHex: string; programIdHex: string }) {
  const hash255 = fnvHash(seedHex + 'ff' + programIdHex + 'ProgramDerivedAddress');
  const hash254 = fnvHash(seedHex + 'fe' + programIdHex + 'ProgramDerivedAddress');

  if (step === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
          Seeds -- произвольные массивы байтов, выбранные разработчиком:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ ...glassStyle, padding: '8px 12px', borderLeft: `3px solid ${colors.success}` }}>
            <div style={{ fontSize: 10, color: colors.textMuted }}>Seed 1: b"counter"</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.success }}>
              636f756e746572
            </div>
          </div>
          <div style={{ ...glassStyle, padding: '8px 12px', borderLeft: `3px solid ${colors.primary}` }}>
            <div style={{ fontSize: 10, color: colors.textMuted }}>Seed 2: authority.key()</div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.primary }}>
              Ab5F...{programIdHex.slice(0, 4)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
          К seeds добавляются program ID и магическая строка:
        </div>
        <div style={{ ...glassStyle, padding: '10px 12px', fontFamily: 'monospace', fontSize: 11 }}>
          <span style={{ color: colors.success }}>seeds</span>
          <span style={{ color: colors.textMuted }}> + </span>
          <span style={{ color: '#f59e0b' }}>[bump]</span>
          <span style={{ color: colors.textMuted }}> + </span>
          <span style={{ color: colors.primary }}>program_id</span>
          <span style={{ color: colors.textMuted }}> + </span>
          <span style={{ color: '#a855f7' }}>"ProgramDerivedAddress"</span>
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted }}>
          SHA-256 от этой конкатенации дает кандидат-адрес. Bump перебирается с 255 вниз.
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
          Bump = 255: вычисляем хеш и проверяем...
        </div>
        <div style={{ ...glassStyle, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
            <span style={{ color: colors.textMuted }}>SHA-256(seeds + </span>
            <span style={{ color: '#f59e0b' }}>[255]</span>
            <span style={{ color: colors.textMuted }}> + program_id + magic)</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: colors.text, marginTop: 6 }}>
            = 0x{truncHex(hash255, 16)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: colors.textMuted }}>На кривой Ed25519?</span>
            <span style={{
              padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
            }}>
              DA -- на кривой
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>
            Результат -- валидная точка Ed25519. Значит, у этого адреса МОЖЕТ быть приватный ключ. Небезопасно! Пробуем следующий bump.
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
          Bump = 254: вычисляем хеш и проверяем...
        </div>
        <div style={{ ...glassStyle, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 11 }}>
            <span style={{ color: colors.textMuted }}>SHA-256(seeds + </span>
            <span style={{ color: '#f59e0b' }}>[254]</span>
            <span style={{ color: colors.textMuted }}> + program_id + magic)</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: colors.text, marginTop: 6 }}>
            = 0x{truncHex(hash254, 16)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: colors.textMuted }}>На кривой Ed25519?</span>
            <span style={{
              padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: `${colors.success}15`, color: colors.success, border: `1px solid ${colors.success}40`,
            }}>
              NET -- не на кривой!
            </span>
          </div>
          <div style={{ fontSize: 11, color: colors.success, marginTop: 6 }}>
            Результат НЕ является точкой Ed25519. Валидный PDA! Canonical bump = 254.
          </div>
        </div>
      </div>
    );
  }

  // step === 4
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ ...glassStyle, padding: '10px 12px', borderLeft: `3px solid ${colors.success}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.success, marginBottom: 6 }}>
          PDA адрес найден:
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 14, color: colors.text }}>
          0x{truncHex(hash254, 16)}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
          Canonical bump = 254 | Seeds: [b"counter", authority]
        </div>
      </div>
      <div style={{
        ...glassStyle,
        padding: '10px 12px',
        borderLeft: `3px solid #f59e0b`,
        marginTop: 4,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>
          Почему PDA безопасны:
        </div>
        <div style={{ fontSize: 11, color: colors.text, lineHeight: 1.6 }}>
          PDA НЕ лежат на кривой Ed25519, поэтому у них НЕТ приватного ключа.
          Никто не может подписать транзакцию от имени PDA.
          Только программа-владелец может "подписать" за свой PDA через invoke_signed.
          Runtime проверяет, что seeds действительно дают этот PDA-адрес.
        </div>
      </div>
    </div>
  );
}

const PDA_STEP_TITLES = [
  'Шаг 0: Определяем seeds',
  'Шаг 1: Формируем входные данные',
  'Шаг 2: Пробуем bump = 255',
  'Шаг 3: Пробуем bump = 254',
  'Шаг 4: PDA найден!',
];

const PDA_STEP_DESCRIPTIONS = [
  'Seeds -- произвольные байтовые массивы, выбранные разработчиком.',
  'Program ID и магическая строка "ProgramDerivedAddress" добавляются к seeds.',
  'Если результат хеширования -- валидная точка Ed25519, пробуем следующий bump.',
  'Если результат НЕ на кривой -- это валидный PDA! Canonical bump найден.',
  'PDA не имеет приватного ключа. Только программа может "подписать" за него через invoke_signed.',
];

export function PDADerivationDiagram() {
  const [step, setStep] = useState(0);

  const seedHex = '636f756e746572';
  const programIdHex = fnvHash('CounterProgram').slice(0, 8);

  return (
    <DiagramContainer title="Derivation PDA: от seeds до адреса" color="green">
      {/* Step info */}
      <div style={{
        ...glassStyle,
        padding: '10px 14px',
        marginBottom: 12,
        borderLeft: `3px solid ${colors.success}`,
      }}>
        <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 4 }}>
          {PDA_STEP_TITLES[step]}
        </div>
        <div style={{ color: colors.textMuted, fontSize: 12 }}>
          {PDA_STEP_DESCRIPTIONS[step]}
        </div>
      </div>

      {/* Step content */}
      <div style={{ ...glassStyle, padding: '14px', marginBottom: 12, minHeight: 140 }}>
        <PDAStepContent step={step} seedHex={seedHex} programIdHex={programIdHex} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
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
          onClick={() => setStep((s) => Math.min(4, s + 1))}
          disabled={step >= 4}
          style={btnStyle(step < 4, colors.success)}
        >
          Далее
        </button>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {PDA_STEP_TITLES.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i === step ? colors.success : 'rgba(255,255,255,0.15)',
              border: `1px solid ${i === step ? colors.success : colors.border}`,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </DiagramContainer>
  );
}
