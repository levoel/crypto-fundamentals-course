/**
 * Payment Channel Diagrams
 *
 * Exports:
 * - CommitmentTransactionDiagram: Step-through commitment TX structure with revocation/penalty
 * - HTLCMultiHopDiagram: 6-step animated HTLC multi-hop payment (Alice -> Carol -> Bob)
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  CommitmentTransactionDiagram                                       */
/* ------------------------------------------------------------------ */

interface CommitmentStep {
  title: string;
  description: string;
  aliceTx: { toLocal: string; toRemote: string; localNote: string; remoteNote: string } | null;
  bobTx: { toLocal: string; toRemote: string; localNote: string; remoteNote: string } | null;
  warning: string | null;
  detail: string;
}

const COMMITMENT_STEPS: CommitmentStep[] = [
  {
    title: 'Шаг 0: Структура Commitment TX',
    description: 'Каждая commitment TX имеет два выхода: to_local (свои средства, с таймлоком) и to_remote (средства партнёра, без задержки). Таймлок нужен, чтобы партнёр мог оспорить мошенничество.',
    aliceTx: {
      toLocal: '4 BTC',
      toRemote: '6 BTC',
      localNote: 'Таймлок 144 блока',
      remoteNote: 'Мгновенный доступ',
    },
    bobTx: null,
    warning: null,
    detail: 'to_local: ваши средства, но вы должны ждать (OP_CHECKSEQUENCEVERIFY). to_remote: средства партнёра, доступны сразу.',
  },
  {
    title: 'Шаг 1: Асимметрия commitment TX',
    description: 'Alice и Bob имеют РАЗНЫЕ версии одной commitment TX. В версии Alice -- таймлок на ЕЁ средства. В версии Bob -- таймлок на ЕГО средства. Это зеркальное отражение.',
    aliceTx: {
      toLocal: '4 BTC',
      toRemote: '6 BTC',
      localNote: 'Alice ждёт 144 блока',
      remoteNote: 'Bob получает сразу',
    },
    bobTx: {
      toLocal: '6 BTC',
      toRemote: '4 BTC',
      localNote: 'Bob ждёт 144 блока',
      remoteNote: 'Alice получает сразу',
    },
    warning: null,
    detail: 'Зачем асимметрия? Если Alice опубликует СВОЮ commitment TX, Bob получит средства сразу. Alice должна ждать. Это даёт Bob время обнаружить мошенничество.',
  },
  {
    title: 'Шаг 2: Обмен ключами отзыва',
    description: 'При обновлении состояния Alice передаёт Bob ключ отзыва для СВОЕЙ старой commitment TX. Теперь Bob может забрать ВСЕ средства, если Alice опубликует старое состояние.',
    aliceTx: {
      toLocal: '4 BTC',
      toRemote: '6 BTC',
      localNote: 'ОТОЗВАНА! Ключ у Bob',
      remoteNote: 'Bob может забрать всё',
    },
    bobTx: {
      toLocal: '6 BTC',
      toRemote: '4 BTC',
      localNote: 'ОТОЗВАНА! Ключ у Alice',
      remoteNote: 'Alice может забрать всё',
    },
    warning: null,
    detail: 'Ключ отзыва позволяет партнёру забрать to_local до истечения таймлока. Отзыв делает публикацию старого состояния экономически невыгодной.',
  },
  {
    title: 'Шаг 3: Наказание за мошенничество',
    description: 'Alice публикует СТАРУЮ commitment TX (где у неё больше BTC). Bob обнаруживает это в течение 144 блоков и использует ключ отзыва для забора ВСЕХ средств канала.',
    aliceTx: {
      toLocal: '5 BTC',
      toRemote: '5 BTC',
      localNote: 'Alice ждёт 144 блока...',
      remoteNote: 'Bob видит старое состояние!',
    },
    bobTx: null,
    warning: 'Мошенничество = потеря всех средств',
    detail: 'Bob использует ключ отзыва и забирает ВСЕ 10 BTC из канала. Alice теряет даже те 5 BTC, которые были бы честно её. Экономическое наказание делает мошенничество иррациональным.',
  },
];

/**
 * CommitmentTransactionDiagram - Step-through commitment TX structure.
 * Shows asymmetric outputs, revocation mechanism, and penalty scenario.
 */
export function CommitmentTransactionDiagram() {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState<number[]>([0]);

  const handleNext = useCallback(() => {
    setStep((s) => {
      const next = Math.min(s + 1, COMMITMENT_STEPS.length - 1);
      setHistory((h) => {
        if (h.length <= next) return [...h, next];
        return h;
      });
      return next;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setHistory([0]);
  }, []);

  const current = COMMITMENT_STEPS[step];
  const isPenalty = step === 3;

  /** Render a single commitment TX box */
  const renderTxBox = (
    label: string,
    tx: { toLocal: string; toRemote: string; localNote: string; remoteNote: string },
    ownerColor: string,
    isRevoked: boolean,
  ) => (
    <div style={{
      ...glassStyle,
      padding: 12,
      borderColor: isRevoked ? `${colors.danger}40` : `${ownerColor}30`,
      background: isRevoked ? `${colors.danger}08` : undefined,
    }}>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        color: isRevoked ? colors.danger : ownerColor,
        marginBottom: 8,
        textDecoration: isRevoked && step >= 2 ? 'line-through' : 'none',
      }}>
        {label}
      </div>

      {/* to_local output */}
      <div style={{
        padding: 8,
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 6,
        marginBottom: 6,
        border: `1px solid ${isPenalty ? colors.danger + '30' : colors.warning + '20'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: colors.warning, fontWeight: 600 }}>to_local</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors.text }}>{tx.toLocal}</span>
        </div>
        <div style={{ fontSize: 9, color: colors.textMuted }}>
          {tx.localNote}
        </div>
      </div>

      {/* to_remote output */}
      <div style={{
        padding: 8,
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 6,
        border: `1px solid ${colors.success}20`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: colors.success, fontWeight: 600 }}>to_remote</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors.text }}>{tx.toRemote}</span>
        </div>
        <div style={{ fontSize: 9, color: colors.textMuted }}>
          {tx.remoteNote}
        </div>
      </div>
    </div>
  );

  return (
    <DiagramContainer title="Структура Commitment TX и отзыв" color="purple">
      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {COMMITMENT_STEPS.map((_s, i) => {
          const isActive = i <= step;
          const clr = i === 3 ? colors.danger : colors.secondary;
          return (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                background: isActive ? `${clr}30` : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isActive ? clr : 'rgba(255,255,255,0.1)'}`,
                color: isActive ? clr : colors.textMuted,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onClick={() => setStep(i)}
            >
              {i}
            </div>
          );
        })}
      </div>

      {/* Step description */}
      <div style={{
        ...glassStyle,
        padding: 14,
        borderColor: isPenalty ? `${colors.danger}40` : `${colors.secondary}40`,
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: isPenalty ? colors.danger : colors.secondary,
          marginBottom: 6,
        }}>
          {current.title}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          {current.description}
        </div>
      </div>

      {/* Warning banner for penalty step */}
      {current.warning && (
        <div style={{
          padding: '10px 14px',
          background: `${colors.danger}15`,
          border: `2px solid ${colors.danger}50`,
          borderRadius: 8,
          marginBottom: 16,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: colors.danger,
        }}>
          {current.warning}
        </div>
      )}

      {/* TX visualizations */}
      {current.aliceTx && current.bobTx ? (
        <Grid columns={2} gap={10}>
          {renderTxBox('Версия Alice', current.aliceTx, colors.primary, step >= 2)}
          {renderTxBox('Версия Bob', current.bobTx, colors.success, step >= 2)}
        </Grid>
      ) : current.aliceTx ? (
        <div style={{ maxWidth: 340, margin: '0 auto' }}>
          {renderTxBox(
            isPenalty ? 'Alice публикует СТАРУЮ TX' : 'Commitment TX (версия Alice)',
            current.aliceTx,
            isPenalty ? colors.danger : colors.primary,
            isPenalty,
          )}
        </div>
      ) : null}

      {/* Penalty result */}
      {isPenalty && (
        <div style={{
          marginTop: 12,
          ...glassStyle,
          padding: 12,
          borderColor: `${colors.danger}30`,
          background: `${colors.danger}08`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: colors.danger, marginBottom: 4 }}>
            Результат: Bob забирает ВСЕ 10 BTC
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
            Bob использует ключ отзыва до истечения таймлока Alice. Ончейн-транзакция переводит все средства канала Bob. Alice теряет всё. Это -- экономическая гарантия честности.
          </div>
        </div>
      )}

      {/* Detail note */}
      <div style={{
        marginTop: 12,
        padding: 10,
        ...glassStyle,
        borderColor: 'rgba(255,255,255,0.08)',
        fontSize: 11,
        color: colors.textMuted,
        lineHeight: 1.5,
      }}>
        {current.detail}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button
          onClick={handleReset}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 12,
            color: colors.textMuted,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          Сброс
        </button>
        <button
          onClick={handlePrev}
          disabled={step <= 0}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step <= 0 ? 'default' : 'pointer',
            fontSize: 12,
            color: step <= 0 ? colors.textMuted : colors.accent,
            border: `1px solid ${step <= 0 ? 'rgba(255,255,255,0.1)' : colors.accent}`,
            background: step <= 0 ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
            opacity: step <= 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={handleNext}
          disabled={step >= COMMITMENT_STEPS.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step >= COMMITMENT_STEPS.length - 1 ? 'default' : 'pointer',
            fontSize: 12,
            color: step >= COMMITMENT_STEPS.length - 1 ? colors.textMuted : colors.secondary,
            border: `1px solid ${step >= COMMITMENT_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.secondary}`,
            background: step >= COMMITMENT_STEPS.length - 1 ? 'rgba(255,255,255,0.03)' : `${colors.secondary}15`,
            opacity: step >= COMMITMENT_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  HTLCMultiHopDiagram                                                */
/* ------------------------------------------------------------------ */

interface HTLCStep {
  title: string;
  description: string;
  aliceCarol: { status: string; amount: string; timelock: string; color: string };
  carolBob: { status: string; amount: string; timelock: string; color: string };
  preimageR: string;
  hashH: string;
  detail: string;
  isTimeout?: boolean;
}

const HTLC_HASH_H = 'a4b9...7d21';
const HTLC_PREIMAGE_R = 'c5e8...1b07';

const HTLC_STEPS: HTLCStep[] = [
  {
    title: 'Шаг 0: Подготовка',
    description: 'Bob генерирует случайный прообраз R и вычисляет хеш H = SHA-256(R). Bob отправляет H Alice (по защищённому каналу). R остаётся секретом Bob.',
    aliceCarol: { status: 'Нет HTLC', amount: '-', timelock: '-', color: colors.textMuted },
    carolBob: { status: 'Нет HTLC', amount: '-', timelock: '-', color: colors.textMuted },
    preimageR: '?????? (секрет Bob)',
    hashH: HTLC_HASH_H,
    detail: 'H -- публичный хеш, R -- секретный прообраз. Только тот, кто знает R, может «разблокировать» HTLC.',
  },
  {
    title: 'Шаг 1: Alice создаёт HTLC с Carol',
    description: 'Alice создаёт HTLC в канале с Carol: «Заплачу 1 BTC, если Carol предоставит прообраз H в течение 48 часов».',
    aliceCarol: { status: 'HTLC создан', amount: '1 BTC', timelock: '48 часов', color: colors.warning },
    carolBob: { status: 'Нет HTLC', amount: '-', timelock: '-', color: colors.textMuted },
    preimageR: '?????? (секрет Bob)',
    hashH: HTLC_HASH_H,
    detail: 'HTLC -- условный платёж: хеш-лок (нужен R) + тайм-лок (срок 48 часов). Carol не знает R, поэтому пока не может забрать средства.',
  },
  {
    title: 'Шаг 2: Carol создаёт HTLC с Bob',
    description: 'Carol создаёт HTLC в канале с Bob: «Заплачу 1 BTC, если Bob предоставит прообраз H в течение 24 часов». Обратите внимание: таймлок КОРОЧЕ!',
    aliceCarol: { status: 'HTLC активен', amount: '1 BTC', timelock: '48 часов', color: colors.warning },
    carolBob: { status: 'HTLC создан', amount: '1 BTC', timelock: '24 часа', color: colors.warning },
    preimageR: '?????? (секрет Bob)',
    hashH: HTLC_HASH_H,
    detail: 'Таймлок Carol->Bob (24ч) короче, чем Alice->Carol (48ч). Это гарантирует, что Carol успеет получить R от Bob и передать его Alice до истечения срока.',
  },
  {
    title: 'Шаг 3: Bob раскрывает R Carol',
    description: 'Bob предоставляет прообраз R Carol. Carol проверяет: SHA-256(R) == H? Да! Carol забирает 1 BTC из HTLC Bob.',
    aliceCarol: { status: 'HTLC активен', amount: '1 BTC', timelock: '48 часов', color: colors.warning },
    carolBob: { status: 'Исполнен!', amount: '1 BTC', timelock: '-', color: colors.success },
    preimageR: HTLC_PREIMAGE_R,
    hashH: HTLC_HASH_H,
    detail: 'Bob раскрывает R, потому что это единственный способ получить платёж. Carol теперь знает R и может разблокировать HTLC от Alice.',
  },
  {
    title: 'Шаг 4: Carol раскрывает R Alice',
    description: 'Carol предоставляет прообраз R Alice. Alice проверяет: SHA-256(R) == H? Да! Alice «оплачивает» HTLC -- Carol получает 1 BTC.',
    aliceCarol: { status: 'Исполнен!', amount: '1 BTC', timelock: '-', color: colors.success },
    carolBob: { status: 'Исполнен!', amount: '1 BTC', timelock: '-', color: colors.success },
    preimageR: HTLC_PREIMAGE_R,
    hashH: HTLC_HASH_H,
    detail: 'R «течёт» назад по маршруту: Bob -> Carol -> Alice. Каждый промежуточный узел получает компенсацию (routing fee, здесь опущена для простоты).',
  },
  {
    title: 'Шаг 5: Платёж завершён',
    description: 'Все HTLC исполнены. Alice заплатила 1 BTC, Bob получил 1 BTC, Carol -- посредник с нулевым балансом (в реальности получает routing fee). Платёж атомарный: либо ВСЕ HTLC исполнены, либо НИ ОДИН.',
    aliceCarol: { status: 'Завершён', amount: '1 BTC', timelock: '-', color: colors.success },
    carolBob: { status: 'Завершён', amount: '1 BTC', timelock: '-', color: colors.success },
    preimageR: HTLC_PREIMAGE_R,
    hashH: HTLC_HASH_H,
    detail: 'Атомарность обеспечена единым прообразом R. Без R ни один HTLC не может быть исполнен. Если Bob не раскроет R -- все HTLC истекут и средства вернутся отправителям.',
  },
];

const TIMEOUT_STEP: HTLCStep = {
  title: 'Альтернатива: Таймаут',
  description: 'Если Bob НЕ раскрывает R, то через 24 часа HTLC Carol->Bob истекает (средства возвращаются Carol). Через 48 часов HTLC Alice->Carol истекает (средства возвращаются Alice). Никто ничего не теряет.',
  aliceCarol: { status: 'Истёк!', amount: '0 BTC', timelock: 'Истёк', color: colors.danger },
  carolBob: { status: 'Истёк!', amount: '0 BTC', timelock: 'Истёк', color: colors.danger },
  preimageR: '?????? (не раскрыт)',
  hashH: HTLC_HASH_H,
  detail: 'Убывающие таймлоки обеспечивают безопасность: Carol не может застрять -- если Bob не платит вовремя, Carol возвращает средства до истечения её HTLC с Alice.',
  isTimeout: true,
};

/**
 * HTLCMultiHopDiagram - 6-step animated HTLC multi-hop payment.
 * Alice -> Carol -> Bob with preimage reveal flowing backward.
 * History array pattern. Includes timeout alternative.
 */
export function HTLCMultiHopDiagram() {
  const [step, setStep] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);
  const [history, setHistory] = useState<number[]>([0]);

  const handleNext = useCallback(() => {
    if (showTimeout) return;
    setStep((s) => {
      const next = Math.min(s + 1, HTLC_STEPS.length - 1);
      setHistory((h) => {
        if (h.length <= next) return [...h, next];
        return h;
      });
      return next;
    });
  }, [showTimeout]);

  const handlePrev = useCallback(() => {
    if (showTimeout) {
      setShowTimeout(false);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  }, [showTimeout]);

  const handleReset = useCallback(() => {
    setStep(0);
    setShowTimeout(false);
    setHistory([0]);
  }, []);

  const current = showTimeout ? TIMEOUT_STEP : HTLC_STEPS[step];
  const isTimeout = showTimeout;

  /** Render a channel HTLC box */
  const renderChannel = (
    from: string,
    to: string,
    data: { status: string; amount: string; timelock: string; color: string },
    fromColor: string,
    toColor: string,
  ) => (
    <div style={{
      ...glassStyle,
      padding: 12,
      borderColor: `${data.color}30`,
      transition: 'border-color 0.3s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: fromColor }}>{from}</span>
        <span style={{ fontSize: 11, color: data.color }}>{'-->'}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: toColor }}>{to}</span>
      </div>
      <div style={{
        padding: 6,
        background: `${data.color}10`,
        borderRadius: 6,
        border: `1px solid ${data.color}25`,
        marginBottom: 4,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: data.color, marginBottom: 2 }}>
          {data.status}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted }}>
          Сумма: {data.amount}
        </div>
        {data.timelock !== '-' && (
          <div style={{
            fontSize: 10,
            color: isTimeout ? colors.danger : colors.warning,
            fontWeight: 600,
          }}>
            Таймлок: {data.timelock}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DiagramContainer title="HTLC: атомарный мультихоп-платёж" color="green">
      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {HTLC_STEPS.map((_s, i) => {
          const isActive = !showTimeout && i <= step;
          return (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                background: isActive ? `${colors.success}30` : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isActive ? colors.success : 'rgba(255,255,255,0.1)'}`,
                color: isActive ? colors.success : colors.textMuted,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onClick={() => {
                setShowTimeout(false);
                setStep(i);
              }}
            >
              {i}
            </div>
          );
        })}
        {/* Timeout indicator */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 600,
            background: showTimeout ? `${colors.danger}30` : 'rgba(255,255,255,0.05)',
            border: `2px solid ${showTimeout ? colors.danger : 'rgba(255,255,255,0.1)'}`,
            color: showTimeout ? colors.danger : colors.textMuted,
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onClick={() => setShowTimeout(true)}
          title="Сценарий таймаута"
        >
          T
        </div>
      </div>

      {/* Step description */}
      <div style={{
        ...glassStyle,
        padding: 14,
        borderColor: isTimeout ? `${colors.danger}40` : `${colors.success}40`,
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: isTimeout ? colors.danger : colors.success,
          marginBottom: 6,
        }}>
          {current.title}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          {current.description}
        </div>
      </div>

      {/* Preimage and Hash display */}
      <Grid columns={2} gap={8}>
        <DataBox
          label="Хеш H = SHA-256(R)"
          value={current.hashH}
          variant="default"
        />
        <DataBox
          label="Прообраз R"
          value={current.preimageR}
          variant={current.preimageR.includes('???') ? 'default' : 'highlight'}
        />
      </Grid>

      {/* Preimage flow arrow (when revealed) */}
      {(step >= 3 && !showTimeout) && (
        <div style={{
          textAlign: 'center',
          margin: '8px 0',
          fontSize: 11,
          fontWeight: 600,
          color: colors.success,
        }}>
          R течёт назад: Bob {'->'} Carol {'->'} Alice
        </div>
      )}

      {/* Channel HTLC states */}
      <div style={{ marginTop: 12 }}>
        <Grid columns={2} gap={10}>
          {renderChannel('Alice', 'Carol', current.aliceCarol, colors.primary, colors.accent)}
          {renderChannel('Carol', 'Bob', current.carolBob, colors.accent, colors.success)}
        </Grid>
      </div>

      {/* Timelock explanation for step 2 */}
      {step === 2 && !showTimeout && (
        <div style={{
          marginTop: 12,
          ...glassStyle,
          padding: 10,
          borderColor: `${colors.warning}30`,
          fontSize: 11,
          color: colors.textMuted,
          lineHeight: 1.5,
        }}>
          <strong style={{ color: colors.warning }}>Почему таймлоки убывают?</strong>{' '}
          Alice: 48ч, Carol: 24ч. Если Carol узнает R от Bob, у неё есть 24 часа чтобы передать R Alice (до истечения 48ч). Убывающие таймлоки гарантируют атомарность.
        </div>
      )}

      {/* Detail note */}
      <div style={{
        marginTop: 12,
        padding: 10,
        ...glassStyle,
        borderColor: 'rgba(255,255,255,0.08)',
        fontSize: 11,
        color: colors.textMuted,
        lineHeight: 1.5,
      }}>
        {current.detail}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
        <button
          onClick={handleReset}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 12,
            color: colors.textMuted,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          Сброс
        </button>
        <button
          onClick={handlePrev}
          disabled={step <= 0 && !showTimeout}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: (step <= 0 && !showTimeout) ? 'default' : 'pointer',
            fontSize: 12,
            color: (step <= 0 && !showTimeout) ? colors.textMuted : colors.accent,
            border: `1px solid ${(step <= 0 && !showTimeout) ? 'rgba(255,255,255,0.1)' : colors.accent}`,
            background: (step <= 0 && !showTimeout) ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
            opacity: (step <= 0 && !showTimeout) ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={handleNext}
          disabled={step >= HTLC_STEPS.length - 1 || showTimeout}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: (step >= HTLC_STEPS.length - 1 || showTimeout) ? 'default' : 'pointer',
            fontSize: 12,
            color: (step >= HTLC_STEPS.length - 1 || showTimeout) ? colors.textMuted : colors.success,
            border: `1px solid ${(step >= HTLC_STEPS.length - 1 || showTimeout) ? 'rgba(255,255,255,0.1)' : colors.success}`,
            background: (step >= HTLC_STEPS.length - 1 || showTimeout) ? 'rgba(255,255,255,0.03)' : `${colors.success}15`,
            opacity: (step >= HTLC_STEPS.length - 1 || showTimeout) ? 0.5 : 1,
          }}
        >
          Далее
        </button>
        <button
          onClick={() => setShowTimeout(!showTimeout)}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 12,
            color: showTimeout ? colors.success : colors.danger,
            border: `1px solid ${showTimeout ? colors.success : colors.danger}`,
            background: `${showTimeout ? colors.success : colors.danger}15`,
          }}
        >
          {showTimeout ? 'Назад к маршруту' : 'Таймаут'}
        </button>
      </div>
    </DiagramContainer>
  );
}
