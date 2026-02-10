/**
 * UTXO Diagrams (BTC-02)
 *
 * Exports:
 * - UTXOFlowDiagram: Interactive step-through UTXO transaction flow (history array pattern)
 * - UTXOSetVisualization: UTXO set explorer with block height slider
 * - ChangeAddressDiagram: Step-through change address creation
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

/** Truncate hex-like string to 8 chars for display */
function truncHex(s: string, len = 8): string {
  return s.length > len ? s.slice(0, len) + '...' : s;
}

/** Simple pseudo-txid generator for display */
function pseudoTxid(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 16;
  return (h >>> 0).toString(16).padStart(8, '0') + 'a1b2c3d4e5f6';
}

/* ================================================================== */
/*  UTXOFlowDiagram                                                     */
/* ================================================================== */

interface UTXO {
  txid: string;
  vout: number;
  amount: number;
  owner: string;
}

interface FlowStep {
  title: string;
  description: string;
  utxos: { utxo: UTXO; status: 'unspent' | 'selected' | 'spent' | 'new' }[];
  showTx: boolean;
  txLabel?: string;
}

const ALICE_UTXOS: UTXO[] = [
  { txid: pseudoTxid('alice-utxo-1'), vout: 0, amount: 0.5, owner: 'Alice' },
  { txid: pseudoTxid('alice-utxo-2'), vout: 1, amount: 0.3, owner: 'Alice' },
];

const FLOW_STEPS: FlowStep[] = [
  {
    title: 'Шаг 0: Пул UTXO',
    description: 'Alice имеет 2 неизрасходованных выхода (UTXO): 0.5 BTC и 0.3 BTC. Общий баланс = 0.8 BTC.',
    utxos: [
      { utxo: ALICE_UTXOS[0], status: 'unspent' },
      { utxo: ALICE_UTXOS[1], status: 'unspent' },
    ],
    showTx: false,
  },
  {
    title: 'Шаг 1: Выбор входов',
    description: 'Alice хочет отправить 0.6 BTC Bob. Одного UTXO недостаточно (0.5 < 0.6), поэтому выбираем оба.',
    utxos: [
      { utxo: ALICE_UTXOS[0], status: 'selected' },
      { utxo: ALICE_UTXOS[1], status: 'selected' },
    ],
    showTx: false,
  },
  {
    title: 'Шаг 2: Создание выходов',
    description: 'Транзакция: Bob получает 0.6 BTC, Alice получает сдачу 0.1999 BTC. Комиссия = 0.0001 BTC.',
    utxos: [
      { utxo: ALICE_UTXOS[0], status: 'selected' },
      { utxo: ALICE_UTXOS[1], status: 'selected' },
      { utxo: { txid: pseudoTxid('new-tx'), vout: 0, amount: 0.6, owner: 'Bob' }, status: 'new' },
      { utxo: { txid: pseudoTxid('new-tx'), vout: 1, amount: 0.1999, owner: 'Alice (сдача)' }, status: 'new' },
    ],
    showTx: true,
    txLabel: 'fee = 0.8 - 0.6 - 0.1999 = 0.0001 BTC',
  },
  {
    title: 'Шаг 3: Подписание (ECDSA)',
    description: 'Alice подписывает транзакцию своим приватным ключом (ECDSA, см. CRYPTO-11). Подпись доказывает владение UTXO.',
    utxos: [
      { utxo: ALICE_UTXOS[0], status: 'selected' },
      { utxo: ALICE_UTXOS[1], status: 'selected' },
      { utxo: { txid: pseudoTxid('new-tx'), vout: 0, amount: 0.6, owner: 'Bob' }, status: 'new' },
      { utxo: { txid: pseudoTxid('new-tx'), vout: 1, amount: 0.1999, owner: 'Alice (сдача)' }, status: 'new' },
    ],
    showTx: true,
    txLabel: 'Подпись: ECDSA(privKey, txHash)',
  },
  {
    title: 'Шаг 4: Результат',
    description: 'Старые UTXO потрачены (исчезают из UTXO set). Новые UTXO созданы. Bob имеет 0.6 BTC, Alice -- 0.1999 BTC.',
    utxos: [
      { utxo: ALICE_UTXOS[0], status: 'spent' },
      { utxo: ALICE_UTXOS[1], status: 'spent' },
      { utxo: { txid: pseudoTxid('new-tx'), vout: 0, amount: 0.6, owner: 'Bob' }, status: 'unspent' },
      { utxo: { txid: pseudoTxid('new-tx'), vout: 1, amount: 0.1999, owner: 'Alice (сдача)' }, status: 'unspent' },
    ],
    showTx: false,
  },
];

const statusColors: Record<string, string> = {
  unspent: colors.success,
  selected: '#f1c40f',
  spent: '#e74c3c',
  new: colors.primary,
};

export function UTXOFlowDiagram() {
  const [step, setStep] = useState(0);

  const current = FLOW_STEPS[step];

  const inputs = current.utxos.filter((u) =>
    u.status === 'selected' || u.status === 'spent' || u.status === 'unspent' && u.utxo.owner === 'Alice'
  );
  const outputs = current.utxos.filter((u) => u.status === 'new');

  return (
    <DiagramContainer title="Поток UTXO: от входов к выходам" color="green">
      {/* Step info */}
      <DiagramTooltip content={current.description}>
        <div style={{
          ...glassStyle,
          padding: '10px 14px',
          marginBottom: 12,
          borderLeft: `3px solid ${colors.success}`,
        }}>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 4 }}>
            {current.title}
          </div>
          <div style={{ color: colors.textMuted, fontSize: 12 }}>
            {current.description}
          </div>
        </div>
      </DiagramTooltip>

      {/* UTXO display */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {current.utxos.map((item, i) => {
          const sc = statusColors[item.status];
          const utxoTooltips: Record<string, string> = {
            unspent: `Неизрасходованный выход (UTXO): ${item.utxo.amount} BTC принадлежит ${item.utxo.owner}. Этот UTXO можно использовать как вход в новую транзакцию.`,
            selected: `Выбранный вход: ${item.utxo.amount} BTC от ${item.utxo.owner}. Будет потрачен целиком -- UTXO нельзя разделить частично, поэтому создаётся выход-сдача.`,
            spent: `Потраченный UTXO: ${item.utxo.amount} BTC удалён из UTXO set. После включения транзакции в блок этот выход больше нельзя использовать (защита от double-spending).`,
            new: `Новый UTXO: ${item.utxo.amount} BTC для ${item.utxo.owner}. Создан текущей транзакцией и добавлен в UTXO set.`,
          };
          return (
            <DiagramTooltip key={`${item.utxo.txid}-${item.utxo.vout}-${i}`} content={utxoTooltips[item.status]}>
              <div
                style={{
                  ...glassStyle,
                  padding: '8px 12px',
                  flex: '1 1 auto',
                  minWidth: 180,
                  borderLeft: `3px solid ${sc}`,
                  opacity: item.status === 'spent' ? 0.4 : 1,
                  textDecoration: item.status === 'spent' ? 'line-through' : 'none',
                }}
              >
                <div style={{ fontSize: 11, color: sc, fontWeight: 600, marginBottom: 2 }}>
                  {item.utxo.owner}
                  {item.status === 'spent' && ' (потрачен)'}
                  {item.status === 'selected' && ' (выбран)'}
                  {item.status === 'new' && ' (новый)'}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: colors.text }}>
                  {item.utxo.amount} BTC
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: colors.textMuted }}>
                  txid:{truncHex(item.utxo.txid)}:{item.utxo.vout}
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Fee formula */}
      {current.showTx && current.txLabel && (
        <DiagramTooltip content="Детали текущей транзакции. В модели UTXO транзакция потребляет целые UTXO как входы и создаёт новые выходы. Разница между суммой входов и суммой выходов -- это комиссия майнеру.">
          <DataBox label="Транзакция" value={current.txLabel} variant="highlight" />
        </DiagramTooltip>
      )}

      {/* Fee formula - always show */}
      <DiagramTooltip content="Комиссия (fee) в Bitcoin вычисляется неявно: это разница между суммой всех входов и суммой всех выходов. Нет отдельного поля 'fee' в транзакции -- майнер забирает разницу.">
        <div style={{
          ...glassStyle,
          padding: '8px 14px',
          marginTop: 8,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: 13,
          color: '#f1c40f',
        }}>
          fee = sum(inputs) - sum(outputs)
        </div>
      </DiagramTooltip>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <DiagramTooltip content="Вернуться к первому шагу демонстрации UTXO потока.">
          <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setStep(0)}
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
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Вернуться к предыдущему шагу потока UTXO.">
          <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                ...glassStyle,
                padding: '8px 16px',
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                color: step === 0 ? colors.textMuted : colors.text,
                fontSize: 13,
                opacity: step === 0 ? 0.5 : 1,
              }}
            >
              Назад
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Перейти к следующему шагу потока UTXO.">
          <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setStep((s) => Math.min(FLOW_STEPS.length - 1, s + 1))}
              disabled={step >= FLOW_STEPS.length - 1}
              style={{
                ...glassStyle,
                padding: '8px 16px',
                cursor: step >= FLOW_STEPS.length - 1 ? 'not-allowed' : 'pointer',
                color: step >= FLOW_STEPS.length - 1 ? colors.textMuted : colors.success,
                fontSize: 13,
                opacity: step >= FLOW_STEPS.length - 1 ? 0.5 : 1,
              }}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {FLOW_STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
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

/* ================================================================== */
/*  UTXOSetVisualization                                                */
/* ================================================================== */

interface UTXORecord {
  txid: string;
  vout: number;
  amount: number;
  address: string;
  owner: string;
  spentAtBlock: number | null; // null = still unspent
  createdAtBlock: number;
}

const UTXO_DATA: UTXORecord[] = [
  { txid: pseudoTxid('gen-1'), vout: 0, amount: 50.0, address: 'bc1q' + pseudoTxid('a1').slice(0, 12), owner: 'Alice', createdAtBlock: 1, spentAtBlock: 3 },
  { txid: pseudoTxid('gen-2'), vout: 0, amount: 50.0, address: 'bc1q' + pseudoTxid('b1').slice(0, 12), owner: 'Bob', createdAtBlock: 2, spentAtBlock: null },
  { txid: pseudoTxid('tx-3'), vout: 0, amount: 30.0, address: 'bc1q' + pseudoTxid('a2').slice(0, 12), owner: 'Alice', createdAtBlock: 3, spentAtBlock: 5 },
  { txid: pseudoTxid('tx-3'), vout: 1, amount: 19.999, address: 'bc1q' + pseudoTxid('a3').slice(0, 12), owner: 'Alice', createdAtBlock: 3, spentAtBlock: null },
  { txid: pseudoTxid('gen-4'), vout: 0, amount: 50.0, address: 'bc1q' + pseudoTxid('b2').slice(0, 12), owner: 'Bob', createdAtBlock: 4, spentAtBlock: 6 },
  { txid: pseudoTxid('tx-5a'), vout: 0, amount: 10.0, address: 'bc1q' + pseudoTxid('b3').slice(0, 12), owner: 'Bob', createdAtBlock: 5, spentAtBlock: null },
  { txid: pseudoTxid('tx-5a'), vout: 1, amount: 19.998, address: 'bc1q' + pseudoTxid('a4').slice(0, 12), owner: 'Alice', createdAtBlock: 5, spentAtBlock: null },
  { txid: pseudoTxid('gen-6'), vout: 0, amount: 50.0, address: 'bc1q' + pseudoTxid('a5').slice(0, 12), owner: 'Alice', createdAtBlock: 6, spentAtBlock: null },
  { txid: pseudoTxid('tx-6b'), vout: 0, amount: 25.0, address: 'bc1q' + pseudoTxid('a6').slice(0, 12), owner: 'Alice', createdAtBlock: 6, spentAtBlock: null },
  { txid: pseudoTxid('tx-6b'), vout: 1, amount: 24.999, address: 'bc1q' + pseudoTxid('b4').slice(0, 12), owner: 'Bob', createdAtBlock: 6, spentAtBlock: null },
];

export function UTXOSetVisualization() {
  const [blockHeight, setBlockHeight] = useState(6);

  const activeUtxos = useMemo(() => {
    return UTXO_DATA.filter((u) =>
      u.createdAtBlock <= blockHeight &&
      (u.spentAtBlock === null || u.spentAtBlock > blockHeight)
    );
  }, [blockHeight]);

  const aliceBalance = activeUtxos.filter((u) => u.owner === 'Alice').reduce((s, u) => s + u.amount, 0);
  const bobBalance = activeUtxos.filter((u) => u.owner === 'Bob').reduce((s, u) => s + u.amount, 0);

  return (
    <DiagramContainer title="Множество UTXO" color="blue">
      <DiagramTooltip content="Высота блока определяет, какие UTXO существуют в данный момент. При каждом новом блоке одни UTXO создаются (выходы транзакций), другие -- тратятся (входы). Перемещайте слайдер, чтобы наблюдать эволюцию UTXO set.">
        <InteractiveValue
          value={blockHeight}
          onChange={setBlockHeight}
          min={1}
          max={6}
          label="Высота блока"
        />
      </DiagramTooltip>

      {/* UTXO list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 40px 80px 1fr 60px',
          gap: 4,
          fontSize: 11,
          fontFamily: 'monospace',
          color: colors.textMuted,
          padding: '0 8px',
        }}>
          <span>txid</span>
          <span>vout</span>
          <span>amount</span>
          <span>address</span>
          <span>owner</span>
        </div>

        {activeUtxos.map((u, i) => (
          <div
            key={`${u.txid}-${u.vout}`}
            style={{
              ...glassStyle,
              display: 'grid',
              gridTemplateColumns: '90px 40px 80px 1fr 60px',
              gap: 4,
              padding: '6px 8px',
              fontSize: 11,
              fontFamily: 'monospace',
              color: colors.text,
              background: u.owner === 'Alice' ? `${colors.primary}10` : `${colors.success}10`,
              borderLeft: `2px solid ${u.owner === 'Alice' ? colors.primary : colors.success}`,
            }}
          >
            <span>{truncHex(u.txid)}</span>
            <span>{u.vout}</span>
            <span>{u.amount.toFixed(3)}</span>
            <span>{truncHex(u.address, 16)}</span>
            <span style={{ color: u.owner === 'Alice' ? colors.primary : colors.success }}>
              {u.owner}
            </span>
          </div>
        ))}
      </div>

      {/* Balances */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <DiagramTooltip content="Баланс Alice -- сумма всех неизрасходованных выходов (UTXO), принадлежащих Alice на данной высоте блока. Каждый UTXO привязан к конкретному адресу и может быть потрачен только владельцем приватного ключа.">
          <DataBox
            label="Alice (сумма UTXO)"
            value={`${aliceBalance.toFixed(4)} BTC`}
            variant="highlight"
          />
        </DiagramTooltip>
        <DiagramTooltip content="Баланс Bob -- сумма всех неизрасходованных выходов (UTXO), принадлежащих Bob. В отличие от банковского счёта, баланс не хранится как число -- он вычисляется из множества UTXO.">
          <DataBox
            label="Bob (сумма UTXO)"
            value={`${bobBalance.toFixed(4)} BTC`}
            variant="highlight"
          />
        </DiagramTooltip>
      </div>

      {/* Key message */}
      <DiagramTooltip content="В модели UTXO нет понятия 'аккаунт' или 'баланс'. Каждая монета -- это конкретный неизрасходованный выход конкретной транзакции. Кошелёк просто суммирует все UTXO, которые пользователь может потратить.">
        <div style={{
          ...glassStyle,
          padding: '10px 14px',
          marginTop: 8,
          textAlign: 'center',
          borderLeft: `3px solid #f1c40f`,
        }}>
          <span style={{ color: '#f1c40f', fontWeight: 600, fontSize: 13 }}>
            В Bitcoin нет поля "баланс"
          </span>
          <span style={{ color: colors.textMuted, fontSize: 12 }}>
            {' '} -- баланс = сумма всех UTXO, которые вы можете потратить
          </span>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ChangeAddressDiagram                                                */
/* ================================================================== */

interface ChangeStep {
  title: string;
  description: string;
}

const CHANGE_STEPS: ChangeStep[] = [
  {
    title: 'Шаг 0: UTXO Alice',
    description: 'Alice имеет 1 UTXO на 1.0 BTC, привязанный к адресу bc1q...xyz.',
  },
  {
    title: 'Шаг 1: Создание транзакции',
    description: 'Alice отправляет 0.3 BTC Bob. Два выхода: Bob получает 0.3 BTC, Alice получает сдачу 0.6999 BTC (fee = 0.0001).',
  },
  {
    title: 'Шаг 2: Новый адрес сдачи',
    description: 'Сдача идёт на НОВЫЙ адрес bc1q...abc, а не на исходный bc1q...xyz. HD-кошелёк генерирует новый адрес автоматически.',
  },
  {
    title: 'Шаг 3: Приватность',
    description: 'Наблюдатель не может определить, какой из двух выходов -- оплата, а какой -- сдача. Это улучшает приватность.',
  },
];

const ALICE_ADDR = 'bc1q' + pseudoTxid('alice-orig').slice(0, 10);
const BOB_ADDR = 'bc1q' + pseudoTxid('bob-recv').slice(0, 10);
const CHANGE_ADDR = 'bc1q' + pseudoTxid('alice-change').slice(0, 10);

export function ChangeAddressDiagram() {
  const [step, setStep] = useState(0);

  const current = CHANGE_STEPS[step];

  return (
    <DiagramContainer title="Сдача и адреса сдачи" color="purple">
      {/* Step info */}
      <DiagramTooltip content={current.description}>
        <div style={{
          ...glassStyle,
          padding: '10px 14px',
          marginBottom: 12,
          borderLeft: `3px solid ${colors.accent}`,
        }}>
          <div style={{ fontWeight: 600, color: colors.text, fontSize: 14, marginBottom: 4 }}>
            {current.title}
          </div>
          <div style={{ color: colors.textMuted, fontSize: 12 }}>
            {current.description}
          </div>
        </div>
      </DiagramTooltip>

      {/* Visual */}
      <svg width="100%" height={180} viewBox="0 0 500 180">
        {/* Input UTXO */}
        <rect
          x={10} y={60} width={130} height={60} rx={8}
          fill={step === 0 ? `${colors.success}20` : step >= 4 ? 'rgba(255,255,255,0.02)' : `${statusColors.selected}15`}
          stroke={step === 0 ? colors.success : step >= 4 ? '#e74c3c' : '#f1c40f'}
          strokeWidth={1.5}
          opacity={step >= 4 ? 0.3 : 1}
        />
        <text x={75} y={82} textAnchor="middle" fill={colors.text} fontSize={12} fontFamily="monospace">
          1.0 BTC
        </text>
        <text x={75} y={100} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
          {truncHex(ALICE_ADDR, 14)}
        </text>
        <text x={75} y={50} textAnchor="middle" fill={colors.textMuted} fontSize={10}>
          Alice (вход)
        </text>

        {step >= 1 && (
          <>
            {/* Arrow to TX */}
            <line x1={140} y1={90} x2={200} y2={90} stroke={colors.border} strokeWidth={1.5} strokeDasharray="4,2" markerEnd="url(#arr-change)" />

            {/* TX box */}
            <rect x={200} y={70} width={60} height={40} rx={6}
              fill="rgba(255,255,255,0.08)"
              stroke={colors.border}
              strokeWidth={1}
            />
            <text x={230} y={93} textAnchor="middle" fill={colors.textMuted} fontSize={10} fontFamily="monospace">TX</text>

            {/* Arrow to Bob output */}
            <line x1={260} y1={80} x2={330} y2={40} stroke={colors.border} strokeWidth={1.5} strokeDasharray="4,2" markerEnd="url(#arr-change)" />

            {/* Bob output */}
            <rect x={330} y={10} width={150} height={55} rx={8}
              fill={`${colors.success}15`}
              stroke={colors.success}
              strokeWidth={1.5}
            />
            <text x={405} y={30} textAnchor="middle" fill={colors.success} fontSize={12} fontFamily="monospace" fontWeight={600}>
              0.3 BTC (Bob)
            </text>
            <text x={405} y={48} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
              {truncHex(BOB_ADDR, 14)}
            </text>

            {/* Arrow to change output */}
            <line x1={260} y1={100} x2={330} y2={140} stroke={colors.border} strokeWidth={1.5} strokeDasharray="4,2" markerEnd="url(#arr-change)" />

            {/* Change output */}
            <rect x={330} y={115} width={150} height={55} rx={8}
              fill={step >= 2 ? `${colors.accent}15` : `${colors.primary}15`}
              stroke={step >= 2 ? colors.accent : colors.primary}
              strokeWidth={1.5}
            />
            <text x={405} y={135} textAnchor="middle" fill={step >= 2 ? colors.accent : colors.primary} fontSize={12} fontFamily="monospace" fontWeight={600}>
              0.6999 BTC (сдача)
            </text>
            <text x={405} y={153} textAnchor="middle" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
              {step >= 2 ? truncHex(CHANGE_ADDR, 14) + ' (НОВЫЙ!)' : truncHex(ALICE_ADDR, 14)}
            </text>
          </>
        )}

        {step >= 3 && (
          <>
            {/* Privacy note */}
            <text x={405} y={90} textAnchor="middle" fill="#f1c40f" fontSize={10} fontFamily="monospace">
              Какой из двух -- оплата?
            </text>
          </>
        )}

        <defs>
          <marker id="arr-change" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={colors.border} />
          </marker>
        </defs>
      </svg>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <DiagramTooltip content="Вернуться к первому шагу демонстрации адреса сдачи.">
          <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setStep(0)}
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
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Вернуться к предыдущему шагу.">
          <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                ...glassStyle,
                padding: '8px 16px',
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                color: step === 0 ? colors.textMuted : colors.text,
                fontSize: 13,
                opacity: step === 0 ? 0.5 : 1,
              }}
            >
              Назад
            </button>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Перейти к следующему шагу демонстрации адреса сдачи.">
          <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setStep((s) => Math.min(CHANGE_STEPS.length - 1, s + 1))}
              disabled={step >= CHANGE_STEPS.length - 1}
              style={{
                ...glassStyle,
                padding: '8px 16px',
                cursor: step >= CHANGE_STEPS.length - 1 ? 'not-allowed' : 'pointer',
                color: step >= CHANGE_STEPS.length - 1 ? colors.textMuted : colors.accent,
                fontSize: 13,
                opacity: step >= CHANGE_STEPS.length - 1 ? 0.5 : 1,
              }}
            >
              Далее
            </button>
          </div>
        </DiagramTooltip>
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {CHANGE_STEPS.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i === step ? colors.accent : 'rgba(255,255,255,0.15)',
              border: `1px solid ${i === step ? colors.accent : colors.border}`,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </DiagramContainer>
  );
}
