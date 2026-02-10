/**
 * Programs & Instructions Diagrams (SOL-05)
 *
 * Exports:
 * - InstructionAnatomyDiagram: Instruction structure with 3 fields and AccountMeta examples (static with DiagramTooltip)
 * - TransactionExecutionDiagram: Sealevel parallel execution step-through (interactive with DiagramTooltip)
 * - CPIFlowDiagram: Cross-Program Invocation flow showing invoke() and invoke_signed() (static with DiagramTooltip)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

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
/*  InstructionAnatomyDiagram                                           */
/* ================================================================== */

interface InstructionField {
  name: string;
  type: string;
  descRu: string;
  color: string;
}

const INSTRUCTION_FIELDS: InstructionField[] = [
  {
    name: 'program_id',
    type: 'Pubkey',
    descRu: 'Какую программу вызвать. Runtime загружает программу по этому адресу и передает ей управление.',
    color: colors.primary,
  },
  {
    name: 'accounts',
    type: 'Vec<AccountMeta>',
    descRu: 'Список аккаунтов с флагами is_signer и is_writable. Программа может только читать/писать аккаунты из этого списка. Runtime проверяет подписи и блокировки.',
    color: colors.success,
  },
  {
    name: 'data',
    type: 'Vec<u8>',
    descRu: 'Сериализованные аргументы инструкции. Anchor использует первые 8 байт как дискриминатор (SHA-256("global:method_name")[..8]), остальные -- параметры.',
    color: '#f59e0b',
  },
];

interface AccountMetaExample {
  pubkey: string;
  isSigner: boolean;
  isWritable: boolean;
  label: string;
  tooltipRu: string;
}

const ACCOUNT_META_EXAMPLES: AccountMetaExample[] = [
  {
    pubkey: 'Counter PDA',
    isSigner: false,
    isWritable: true,
    label: 'Данные для записи',
    tooltipRu: 'Counter PDA -- аккаунт данных, в который программа записывает обновленное значение счетчика. is_writable = true позволяет программе модифицировать данные. is_signer = false, потому что PDA не имеет приватного ключа.',
  },
  {
    pubkey: 'Authority',
    isSigner: true,
    isWritable: true,
    label: 'Подписант + плательщик',
    tooltipRu: 'Authority -- пользователь, инициировавший транзакцию. is_signer = true означает, что он подписал транзакцию приватным ключом. is_writable = true позволяет списать lamports за rent и комиссию.',
  },
  {
    pubkey: 'System Program',
    isSigner: false,
    isWritable: false,
    label: 'Только для CPI',
    tooltipRu: 'System Program передается для CPI-вызовов (например, create_account). is_signer = false и is_writable = false -- программа не модифицируется, а используется как адрес для вызова.',
  },
];

export function InstructionAnatomyDiagram() {
  return (
    <DiagramContainer title="Анатомия инструкции Solana" color="blue">
      {/* Instruction box with 3 sections */}
      <div style={{
        ...glassStyle,
        padding: '16px',
        border: `1px solid ${colors.primary}40`,
        marginBottom: 12,
      }}>
        <div style={{
          textAlign: 'center', fontFamily: 'monospace', fontSize: 11,
          color: colors.textMuted, marginBottom: 12,
        }}>
          Instruction = {'{'} program_id, accounts, data {'}'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {INSTRUCTION_FIELDS.map((field) => (
            <DiagramTooltip key={field.name} content={field.descRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '10px 14px',
                  borderLeft: `3px solid ${field.color}`,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${colors.border}`,
                  borderLeftWidth: 3,
                  borderLeftColor: field.color,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: colors.text }}>
                    {field.name}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: colors.textMuted }}>
                    {field.type}
                  </span>
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      {/* AccountMeta examples */}
      <div style={{
        ...glassStyle,
        padding: '12px 14px',
        marginBottom: 12,
        borderLeft: `3px solid ${colors.success}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.success, marginBottom: 8 }}>
          accounts: Vec&lt;AccountMeta&gt;
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ACCOUNT_META_EXAMPLES.map((meta, i) => (
            <DiagramTooltip key={i} content={meta.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '6px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'default',
                }}
              >
                <span style={{ color: colors.text }}>{meta.pubkey}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    padding: '1px 6px', borderRadius: 4, fontSize: 9,
                    background: meta.isSigner ? `${colors.primary}20` : 'rgba(255,255,255,0.05)',
                    color: meta.isSigner ? colors.primary : colors.textMuted,
                    border: `1px solid ${meta.isSigner ? colors.primary + '40' : 'transparent'}`,
                  }}>
                    signer: {meta.isSigner ? 'true' : 'false'}
                  </span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 4, fontSize: 9,
                    background: meta.isWritable ? `${colors.success}20` : 'rgba(255,255,255,0.05)',
                    color: meta.isWritable ? colors.success : colors.textMuted,
                    border: `1px solid ${meta.isWritable ? colors.success + '40' : 'transparent'}`,
                  }}>
                    writable: {meta.isWritable ? 'true' : 'false'}
                  </span>
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      {/* Anchor mapping note */}
      <DiagramTooltip content="Anchor автоматически генерирует дискриминатор инструкции из SHA-256 хеша имени метода. Первые 8 байт instruction_data используются для маршрутизации вызова к нужному handler.">
        <div style={{ ...glassStyle, padding: '10px 12px', fontSize: 11 }}>
          <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: 4 }}>
            data: дискриминатор инструкции (Anchor)
          </div>
          <div style={{ fontFamily: 'monospace', color: colors.text, lineHeight: 1.6 }}>
            <div>
              <span style={{ color: colors.textMuted }}>// Первые 8 байт data:</span>
            </div>
            <div>
              SHA-256(<span style={{ color: colors.success }}>"global:increment"</span>)[..8]
            </div>
            <div style={{ color: colors.textMuted, marginTop: 4 }}>
              Anchor: #[derive(Accounts)] генерирует AccountMeta,{' '}
              #[program] маршрутизирует по дискриминатору.
            </div>
          </div>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  TransactionExecutionDiagram                                         */
/* ================================================================== */

interface TxInfo {
  id: string;
  reads: string[];
  writes: string[];
  color: string;
}

const TRANSACTIONS: TxInfo[] = [
  { id: 'TX1', reads: ['Account A'], writes: ['Account B'], color: colors.primary },
  { id: 'TX2', reads: ['Account C'], writes: ['Account D'], color: colors.success },
  { id: 'TX3', reads: ['Account A'], writes: ['Account C'], color: '#f59e0b' },
];

const TX_TOOLTIPS: Record<string, string> = {
  TX1: 'TX1 читает Account A и пишет в Account B. Не пересекается с TX2 по аккаунтам, поэтому может выполняться параллельно.',
  TX2: 'TX2 читает Account C и пишет в Account D. Не пересекается с TX1, поэтому может выполняться параллельно.',
  TX3: 'TX3 читает Account A (конфликт с TX1) и пишет в Account C (конфликт с TX2). Должна ждать завершения TX1 и TX2.',
};

const EXECUTION_STEP_TITLES = [
  'Шаг 0: Транзакции в мемпуле',
  'Шаг 1: Sealevel анализирует зависимости',
  'Шаг 2: Wave 1 -- параллельное выполнение',
  'Шаг 3: Wave 2 -- последовательное выполнение',
  'Шаг 4: Все завершено',
];

const EXECUTION_STEP_DESCRIPTIONS = [
  '3 транзакции прибывают к валидатору. Каждая декларирует, какие аккаунты читает и пишет.',
  'TX1 и TX2 не пересекаются по аккаунтам -- можно параллельно. TX3 пересекается с обоими -- ждет.',
  'TX1 и TX2 выполняются одновременно на разных ядрах процессора.',
  'TX3 выполняется после завершения TX1 и TX2 (зависимость по Account A и Account C).',
  'Все транзакции завершены атомарно. Если инструкция в TX fails -- вся TX откатывается.',
];

const EXECUTION_STEP_TOOLTIPS = [
  'В Solana транзакции не ждут в mempool как в Ethereum. Gulf Stream пересылает их напрямую следующему лидеру. Каждая транзакция заранее декларирует read/write set.',
  'Sealevel анализирует read/write sets всех транзакций и строит граф зависимостей. Транзакции без пересечений группируются в wave для параллельного выполнения.',
  'Wave 1: TX1 и TX2 выполняются на разных ядрах CPU одновременно. В Ethereum это невозможно -- EVM выполняет все транзакции последовательно.',
  'Wave 2: TX3 зависит от результатов TX1 (Account A) и TX2 (Account C), поэтому выполняется после них. Sealevel минимизирует количество wave.',
  'Все 3 транзакции завершены. Каждая обработана атомарно -- при ошибке откатывается только конкретная транзакция, не затрагивая другие.',
];

function TxBox({ tx, status, dimmed }: { tx: TxInfo; status: string; dimmed?: boolean }) {
  const statusColors: Record<string, string> = {
    pending: colors.textMuted,
    running: colors.success,
    waiting: '#f59e0b',
    done: colors.primary,
    conflict: '#ef4444',
  };

  return (
    <DiagramTooltip content={TX_TOOLTIPS[tx.id]}>
      <div style={{
        ...glassStyle,
        padding: '8px 12px',
        borderLeft: `3px solid ${tx.color}`,
        opacity: dimmed ? 0.4 : 1,
        transition: 'opacity 0.2s',
        minWidth: 160,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: tx.color }}>
            {tx.id}
          </span>
          <span style={{
            padding: '1px 8px', borderRadius: 4, fontSize: 9, fontFamily: 'monospace',
            background: statusColors[status] + '20',
            color: statusColors[status],
            border: `1px solid ${statusColors[status]}40`,
          }}>
            {status}
          </span>
        </div>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted }}>
          <div>reads: [{tx.reads.join(', ')}]</div>
          <div>writes: [{tx.writes.join(', ')}]</div>
        </div>
      </div>
    </DiagramTooltip>
  );
}

export function TransactionExecutionDiagram() {
  const [step, setStep] = useState(0);

  const getStatus = (txIdx: number): string => {
    if (step === 0) return 'pending';
    if (step === 1) {
      if (txIdx === 2) return 'conflict';
      return 'pending';
    }
    if (step === 2) {
      if (txIdx <= 1) return 'running';
      return 'waiting';
    }
    if (step === 3) {
      if (txIdx <= 1) return 'done';
      return 'running';
    }
    return 'done';
  };

  return (
    <DiagramContainer title="Sealevel: параллельное выполнение" color="purple">
      {/* Step info */}
      <DiagramTooltip content={EXECUTION_STEP_TOOLTIPS[step]}>
        <div style={{
          ...glassStyle,
          padding: '10px 14px',
          marginBottom: 12,
          borderLeft: `3px solid #a855f7`,
        }}>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 4 }}>
            {EXECUTION_STEP_TITLES[step]}
          </div>
          <div style={{ color: colors.textMuted, fontSize: 12 }}>
            {EXECUTION_STEP_DESCRIPTIONS[step]}
          </div>
        </div>
      </DiagramTooltip>

      {/* Transactions visualization */}
      {step <= 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {TRANSACTIONS.map((tx, i) => (
            <TxBox key={tx.id} tx={tx} status={getStatus(i)} />
          ))}
        </div>
      )}

      {/* Wave execution visualization */}
      {step === 2 && (
        <div style={{ marginBottom: 12 }}>
          <DiagramTooltip content="Wave 1 -- группа транзакций без конфликтов по read/write аккаунтам. Sealevel назначает каждую транзакцию на отдельное ядро CPU для параллельного выполнения.">
            <div style={{ fontSize: 11, color: colors.success, fontWeight: 600, marginBottom: 6, fontFamily: 'monospace' }}>
              Wave 1 -- параллельно:
            </div>
          </DiagramTooltip>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, ...glassStyle, padding: '6px 10px', borderTop: `2px solid ${colors.success}`, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Core 0</div>
              <TxBox tx={TRANSACTIONS[0]} status="running" />
            </div>
            <div style={{ flex: 1, ...glassStyle, padding: '6px 10px', borderTop: `2px solid ${colors.success}`, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Core 1</div>
              <TxBox tx={TRANSACTIONS[1]} status="running" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TxBox tx={TRANSACTIONS[2]} status="waiting" dimmed />
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, fontFamily: 'monospace' }}>
            Wave 1 -- <span style={{ color: colors.success }}>завершено</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <TxBox tx={TRANSACTIONS[0]} status="done" dimmed />
            <TxBox tx={TRANSACTIONS[1]} status="done" dimmed />
          </div>
          <DiagramTooltip content="Wave 2 выполняется последовательно после Wave 1. TX3 зависит от Account A (прочитан TX1) и Account C (записан TX2), поэтому не могла быть в Wave 1.">
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginBottom: 6, fontFamily: 'monospace' }}>
              Wave 2 -- последовательно:
            </div>
          </DiagramTooltip>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ ...glassStyle, padding: '6px 10px', borderTop: `2px solid #f59e0b`, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Core 0</div>
              <TxBox tx={TRANSACTIONS[2]} status="running" />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TRANSACTIONS.map((tx) => (
              <TxBox key={tx.id} tx={tx} status="done" />
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <DiagramTooltip content="В Ethereum эффекты транзакции неизвестны до выполнения EVM. В Solana read/write set декларируется заранее, что позволяет Sealevel автоматически находить параллелизм без спекулятивного выполнения.">
              <DataBox
                label="Ключевой принцип"
                value="Декларация read/write set ДО выполнения позволяет Sealevel автоматически находить параллелизм. В Ethereum это невозможно: эффекты транзакции неизвестны до выполнения EVM."
                variant="highlight"
              />
            </DiagramTooltip>
          </div>
        </div>
      )}

      {/* Conflict highlights for step 1 */}
      {step === 1 && (
        <DiagramTooltip content="Sealevel строит граф зависимостей: если две транзакции пересекаются по write-аккаунту или одна пишет то, что другая читает -- они зависимы и не могут быть в одном wave.">
          <div style={{ ...glassStyle, padding: '10px 12px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontFamily: 'monospace', lineHeight: 1.8 }}>
              <div>
                <span style={{ color: colors.primary }}>TX1</span>
                <span style={{ color: colors.textMuted }}> reads A, writes B </span>
                <span style={{ color: colors.success }}>TX2</span>
                <span style={{ color: colors.textMuted }}> reads C, writes D </span>
                <span style={{ color: colors.success, fontWeight: 600 }}>-- нет пересечений!</span>
              </div>
              <div>
                <span style={{ color: '#f59e0b' }}>TX3</span>
                <span style={{ color: colors.textMuted }}> reads </span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>A</span>
                <span style={{ color: colors.textMuted }}>, writes </span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>C</span>
                <span style={{ color: '#ef4444' }}> -- конфликт с TX1 (A) и TX2 (C)</span>
              </div>
            </div>
          </div>
        </DiagramTooltip>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <DiagramTooltip content="Вернуться к начальному состоянию (транзакции в мемпуле).">
          <div>
            <button onClick={() => setStep(0)} style={btnStyle(true, colors.text)}>
              Сброс
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Перейти к предыдущему шагу выполнения транзакций.">
          <div>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={btnStyle(step > 0, colors.text)}
            >
              Назад
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Перейти к следующему шагу выполнения транзакций.">
          <div>
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={step >= 4}
              style={btnStyle(step < 4, '#a855f7')}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {EXECUTION_STEP_TITLES.map((_, i) => (
          <DiagramTooltip key={i} content={EXECUTION_STEP_TOOLTIPS[i]}>
            <div
              onClick={() => setStep(i)}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i === step ? '#a855f7' : 'rgba(255,255,255,0.15)',
                border: `1px solid ${i === step ? '#a855f7' : colors.border}`,
                cursor: 'pointer',
              }}
            />
          </DiagramTooltip>
        ))}
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  CPIFlowDiagram                                                      */
/* ================================================================== */

interface CPITarget {
  name: string;
  programId: string;
  instructions: string[];
  color: string;
  tooltipRu: string;
}

const CPI_TARGETS: CPITarget[] = [
  {
    name: 'System Program',
    programId: '11111111...1111',
    instructions: ['create_account', 'transfer', 'assign'],
    color: colors.primary,
    tooltipRu: 'System Program -- базовая программа Solana для создания аккаунтов, перевода SOL и назначения owner. Каждая программа вызывает System Program через CPI для create_account при инициализации PDA.',
  },
  {
    name: 'Token Program',
    programId: 'TokenkegQ...pnJ',
    instructions: ['transfer', 'mint_to', 'burn', 'approve'],
    color: colors.success,
    tooltipRu: 'Token Program (SPL Token) управляет всеми токенами в Solana. Программы вызывают его через CPI для transfer, mint_to, burn и approve. Token-2022 -- расширенная версия с расширениями (transfer hooks, confidential transfers).',
  },
  {
    name: 'Associated Token Program',
    programId: 'ATokenGP...oken',
    instructions: ['create (idempotent)'],
    color: '#f59e0b',
    tooltipRu: 'Associated Token Program создает детерминированные token-аккаунты для пользователей. create() идемпотентен -- если ATA уже существует, вызов не падает. PDA: seeds = [wallet, token_program, mint].',
  },
];

export function CPIFlowDiagram() {
  const [showSigned, setShowSigned] = useState(false);

  return (
    <DiagramContainer title="Cross-Program Invocation (CPI)" color="blue">
      {/* Toggle: invoke vs invoke_signed */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
        {[false, true].map((signed) => (
          <DiagramTooltip key={String(signed)} content={signed ? 'invoke_signed использует PDA-подпись (Program Derived Address) для CPI-вызовов, когда вызывающая программа должна подписать транзакцию от имени PDA.' : 'invoke выполняет межпрограммный вызов (CPI) с передачей привилегий подписанта вызывающей программы. Целевая программа может использовать переданные подписи.'}>
            <div>
              <button
                onClick={() => setShowSigned(signed)}
                style={{
                  ...glassStyle,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  background: showSigned === signed ? `${colors.primary}20` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${showSigned === signed ? colors.primary : colors.border}`,
                  color: showSigned === signed ? colors.primary : colors.textMuted,
                  fontSize: 12, fontFamily: 'monospace', fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                {signed ? 'invoke_signed (PDA)' : 'invoke (обычный)'}
              </button>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* CPI Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginBottom: 14 }}>
        {/* Caller program */}
        <DiagramTooltip content="Вызывающая программа (Program A) формирует CpiContext с program_id целевой программы, списком аккаунтов и данными инструкции. При invoke_signed дополнительно передаются signer_seeds для PDA.">
          <div style={{
            ...glassStyle,
            padding: '10px 20px',
            borderTop: `3px solid ${colors.primary}`,
            textAlign: 'center',
            width: '80%',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: colors.primary }}>
              Program A (Your Anchor Program)
            </div>
            {showSigned && (
              <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                PDA seeds: [b"vault", authority.key()]
              </div>
            )}
          </div>
        </DiagramTooltip>

        {/* Arrow with CPI details */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '6px 0', gap: 2,
        }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: showSigned ? '#f59e0b' : colors.success, fontWeight: 600 }}>
            {showSigned ? 'CPI: invoke_signed(signer_seeds)' : 'CPI: invoke()'}
          </div>
          <div style={{ fontSize: 18, color: showSigned ? '#f59e0b' : colors.success, lineHeight: 0.7 }}>
            &#8595;
          </div>
          <DiagramTooltip content="CpiContext содержит program_id целевой программы, Vec<AccountMeta> с аккаунтами и сериализованные данные инструкции. При invoke_signed добавляются signer_seeds для PDA-подписи.">
            <div style={{
              ...glassStyle,
              padding: '6px 12px',
              fontSize: 10,
              fontFamily: 'monospace',
              color: colors.textMuted,
              textAlign: 'center',
            }}>
              CpiContext: program_id, accounts, data
              {showSigned && (
                <div style={{ color: '#f59e0b', marginTop: 2 }}>
                  + signer_seeds: &[&[&[u8]]]
                </div>
              )}
            </div>
          </DiagramTooltip>
          <div style={{ fontSize: 18, color: showSigned ? '#f59e0b' : colors.success, lineHeight: 0.7 }}>
            &#8595;
          </div>
        </div>

        {/* Target program */}
        <DiagramTooltip content={showSigned ? 'При invoke_signed runtime проверяет, что seeds + bump + program_id дают адрес PDA. Если проверка проходит, PDA считается подписантом для целевой программы.' : 'При обычном invoke подписи из исходной транзакции передаются целевой программе. Если аккаунт отмечен как signer в исходной транзакции, он остается signer для целевой программы.'}>
          <div style={{
            ...glassStyle,
            padding: '10px 20px',
            borderTop: `3px solid ${showSigned ? '#f59e0b' : colors.success}`,
            textAlign: 'center',
            width: '80%',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: showSigned ? '#f59e0b' : colors.success }}>
              {showSigned ? 'Program B (Token Program)' : 'Program B (System Program)'}
            </div>
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
              {showSigned
                ? 'invoke_signed: runtime проверяет, что seeds derive в PDA-адрес'
                : 'invoke: обычный вызов, подписи передаются от исходной транзакции'}
            </div>
          </div>
        </DiagramTooltip>
      </div>

      {/* Common CPI targets */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>
          Частые CPI-цели:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CPI_TARGETS.map((target) => (
            <DiagramTooltip key={target.name} content={target.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '8px 12px',
                  flex: '1 1 auto',
                  minWidth: 140,
                  borderLeft: `3px solid ${target.color}`,
                  background: 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: target.color }}>
                  {target.name}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: colors.textMuted, marginTop: 2 }}>
                  {target.programId}
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: colors.text }}>
                  {target.instructions.map((inst, j) => (
                    <div key={j} style={{ fontFamily: 'monospace' }}>
                      - {inst}
                    </div>
                  ))}
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      {/* Key insight */}
      <DiagramTooltip content="invoke() передает подписи от исходной транзакции -- authority остается signer. invoke_signed() позволяет программе подписать за PDA, предоставив seeds и bump для верификации runtime.">
        <DataBox
          label="invoke vs invoke_signed"
          value="invoke() передает подписи из исходной транзакции. invoke_signed() позволяет программе 'подписать' за свой PDA -- runtime верифицирует, что seeds + bump + program_id дают адрес PDA."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
