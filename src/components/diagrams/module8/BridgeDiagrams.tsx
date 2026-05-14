/** @jsxImportSource solid-js */
/**
 * Bridge Diagrams (SCALE-10)
 *
 * Exports:
 * - BridgeArchitectureDiagram: Step-through lock-and-mint bridge with attack surfaces (5 steps, history array)
 * - BridgeHacksTimelineDiagram: Horizontal timeline of 5 major bridge hacks
 * - InteropComparisonDiagram: HTML table comparing LayerZero, Wormhole, Axelar, Native Bridges (8 rows)
 */

import { createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  BridgeArchitectureDiagram                                           */
/* ================================================================== */

interface BridgeStep {
  title: string;
  label: string;
  description: string;
  attackSurface: string;
  color: string;
  icon: string;
}

const BRIDGE_STEPS: BridgeStep[] = [
  {
    title: 'LOCK',
    label: 'Шаг 1',
    description: 'Пользователь отправляет 100 ETH в Bridge контракт на Ethereum. Bridge эмитирует Lock event.',
    attackSurface: 'Smart contract vulnerability в lock logic',
    color: '#3b82f6',
    icon: 'LOCK',
  },
  {
    title: 'RELAY',
    label: 'Шаг 2',
    description: 'Relayer/validator set обнаруживает Lock event. Валидаторы подписывают attestation: "100 ETH locked by user X on Ethereum."',
    attackSurface: 'Validator key compromise, collusion',
    color: '#f59e0b',
    icon: 'RLY',
  },
  {
    title: 'VERIFY',
    label: 'Шаг 3',
    description: 'Destination chain bridge получает attestation. Верифицирует подписи валидаторов (e.g., 13/19 threshold).',
    attackSurface: 'Signature verification bypass, proof verifier bugs',
    color: '#8b5cf6',
    icon: 'VRF',
  },
  {
    title: 'MINT',
    label: 'Шаг 4',
    description: 'Bridge минтит 100 wETH (wrapped ETH) на destination chain. Пользователь получает токены.',
    attackSurface: 'Unauthorized minting, replay attack',
    color: '#10b981',
    icon: 'MINT',
  },
  {
    title: 'ATTACK SURFACE SUMMARY',
    label: 'Шаг 5',
    description: 'Bridge = сумма всех attack surfaces. Каждый шаг -- потенциальная уязвимость. $2.8B+ потеряно через атаки на мосты.',
    attackSurface: 'ALL: contract bugs + key compromise + verification bypass + replay',
    color: '#f43f5e',
    icon: 'SUM',
  },
];

const BRIDGE_STEP_TOOLTIPS = [
  'Lock -- первый шаг bridge: активы блокируются в smart contract на source chain. Уязвимость в lock logic может позволить повторный lock/unlock или обход проверок.',
  'Relay -- передача информации между цепями. Компрометация приватных ключей валидаторов (Ronin: 5/9 ключей) позволяет подделать attestation.',
  'Verify -- проверка attestation на destination chain. Баги в верификации подписей (Wormhole) или proof verifier (BNB Bridge) -- самые дорогие уязвимости.',
  'Mint -- создание wrapped токенов на destination chain. Несанкционированный mint или replay attack позволяют создать токены без реальной блокировки на source chain.',
  'Bridge объединяет все attack surfaces: contract bugs, key compromise, verification bypass, replay. Это делает мосты самой уязвимой инфраструктурой в crypto.',
];

/**
 * BridgeArchitectureDiagram
 *
 * Step-through bridge architecture with attack surface annotations.
 * 5 steps, history array, step/back/reset controls.
 */
export function BridgeArchitectureDiagram() {
  const [history, setHistory] = createSignal<number[]>([0]);
  const current = history()[history().length - 1];

  const step = () => {
    if (current < BRIDGE_STEPS.length - 1) {
      setHistory([...history, current + 1]);
    }
  };
  const back = () => {
    if (history().length > 1) {
      setHistory(history().slice(0, -1));
    }
  };
  const reset = () => setHistory([0]);

  const s = BRIDGE_STEPS[current];
  const isSummary = current === BRIDGE_STEPS.length - 1;

  return (
    <DiagramContainer title="Bridge Architecture: attack surface" color="red">
      {/* Progress bar */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px' }}>
        {BRIDGE_STEPS.map((st, i) => (
          <div
            style={{
              'flex': '1',
              'height': '4px',
              'border-radius': '2px',
              'background': i <= current ? st.color : 'rgba(255,255,255,0.08)',
              'transition': 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Flow icons */}
      <div style={{ 'display': 'flex', 'gap': '6px', 'margin-bottom': '16px', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
        {BRIDGE_STEPS.map((st, i) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px' }}>
            <DiagramTooltip content={BRIDGE_STEP_TOOLTIPS[i]}>
              <div style={{
                'width': '46px',
                'height': '46px',
                'border-radius': '8px',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '10px',
                'font-weight': '700',
                'font-family': 'monospace',
                'color': i <= current ? '#fff' : colors.textMuted,
                'background': i <= current ? `${st.color}30` : 'rgba(255,255,255,0.04)',
                'border': `1px solid ${i === current ? st.color : i < current ? `${st.color}40` : 'rgba(255,255,255,0.08)'}`,
                'transition': 'all 0.3s',
              }}>
                {st.icon}
              </div>
            </DiagramTooltip>
            {i < BRIDGE_STEPS.length - 1 && (
              <div style={{
                'width': '18px',
                'height': '2px',
                'background': i < current ? `${BRIDGE_STEPS[i + 1].color}60` : 'rgba(255,255,255,0.08)',
                'transition': 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current step detail */}
      <div style={{
        ...glassStyle,
        'padding': '16px',
        'margin-bottom': '8px',
        'border': `1px solid ${s.color}30`,
        'background': `${s.color}08`,
        'border-radius': '8px',
      }}>
        <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px', 'margin-bottom': '8px' }}>
          <span style={{
            'font-size': '9px',
            'font-family': 'monospace',
            'color': s.color,
            'padding': '2px 8px',
            'border-radius': '4px',
            'background': `${s.color}15`,
            'border': `1px solid ${s.color}30`,
          }}>
            {s.label}
          </span>
          <span style={{ 'font-size': '13px', 'font-weight': '700', 'color': colors.text }}>
            {s.title}
          </span>
        </div>
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6', 'margin-bottom': '10px' }}>
          {s.description}
        </div>

        {/* Attack surface annotation */}
        <div style={{
          'padding': '8px',
          'border-radius': '4px',
          'background': 'rgba(244,63,94,0.08)',
          'border': '1px solid rgba(244,63,94,0.2)',
        }}>
          <div style={{
            'font-size': '9px',
            'font-weight': '700',
            'color': '#f43f5e',
            'font-family': 'monospace',
            'margin-bottom': '3px',
          }}>
            ATTACK SURFACE
          </div>
          <div style={{ 'font-size': '11px', 'color': '#fca5a5', 'line-height': '1.4' }}>
            {s.attackSurface}
          </div>
        </div>
      </div>

      {/* Summary: all attack surfaces */}
      {isSummary && (
        <div style={{
          'display': 'grid',
          'grid-template-columns': 'repeat(2, 1fr)',
          'gap': '6px',
          'margin-bottom': '12px',
        }}>
          {BRIDGE_STEPS.slice(0, 4).map((st, i) => (
            <div style={{
              ...glassStyle,
              'padding': '8px',
              'border-radius': '4px',
              'border': '1px solid rgba(244,63,94,0.2)',
              'background': 'rgba(244,63,94,0.05)',
            }}>
              <div style={{ 'font-size': '9px', 'font-weight': '700', 'color': st.color, 'font-family': 'monospace' }}>
                {st.title}
              </div>
              <div style={{ 'font-size': '9px', 'color': '#fca5a5', 'line-height': '1.3', 'margin-top': '2px' }}>
                {st.attackSurface}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '14px' }}>
        {[
          { label: 'Back', action: back, disabled: history().length <= 1 },
          { label: `Step ${current + 1}/${BRIDGE_STEPS.length}`, action: step, disabled: current >= BRIDGE_STEPS.length - 1 },
          { label: 'Reset', action: reset, disabled: history().length <= 1 },
        ].map((btn) => (
          <button
            onClick={btn.action}
            disabled={btn.disabled}
            style={{
              ...glassStyle,
              'padding': '6px 14px',
              'cursor': btn.disabled ? 'default' : 'pointer',
              'font-size': '11px',
              'font-family': 'monospace',
              'color': btn.disabled ? 'rgba(255,255,255,0.2)' : colors.text,
              'border': '1px solid rgba(255,255,255,0.1)',
              'border-radius': '6px',
              'opacity': btn.disabled ? 0.5 : 1,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  BridgeHacksTimelineDiagram                                          */
/* ================================================================== */

interface BridgeHack {
  name: string;
  date: string;
  loss: string;
  lossNum: number;
  mechanism: string;
  mechanismTag: string;
  tagColor: string;
  detail: string;
  tooltipRu: string;
}

const BRIDGE_HACKS: BridgeHack[] = [
  {
    name: 'Wormhole',
    date: 'Feb 2022',
    loss: '$326M',
    lossNum: 326,
    mechanism: 'Signature verification bypass',
    mechanismTag: 'Verification Bug',
    tagColor: '#f59e0b',
    detail: 'Solana-side vulnerability. Attacker bypassed signature verification.',
    tooltipRu: 'Wormhole (Feb 2022): $326M. Уязвимость в верификации подписей на стороне Solana. Атакующий обошел проверку guardian signatures и сминтил 120K wETH без реальной блокировки.',
  },
  {
    name: 'Ronin Bridge',
    date: 'Mar 2022',
    loss: '$624M',
    lossNum: 624,
    mechanism: 'Private key compromise (5/9 validators)',
    mechanismTag: 'Key Compromise',
    tagColor: '#f43f5e',
    detail: 'Lazarus Group (North Korea). Went undetected for 6 DAYS.',
    tooltipRu: 'Ronin Bridge (Mar 2022): $624M. Lazarus Group (КНДР) скомпрометировала 5 из 9 приватных ключей валидаторов. Атака не обнаружена 6 ДНЕЙ. Самый дорогой bridge hack в истории.',
  },
  {
    name: 'Harmony Horizon',
    date: 'Jun 2022',
    loss: '$100M',
    lossNum: 100,
    mechanism: 'Private key compromise (2/5 multisig)',
    mechanismTag: 'Key Compromise',
    tagColor: '#f43f5e',
    detail: 'Low threshold multisig = insufficient security.',
    tooltipRu: 'Harmony Horizon (Jun 2022): $100M. Multisig 2/5 -- слишком низкий порог. Компрометация всего 2 ключей дала полный контроль. Урок: threshold должен быть значительно выше.',
  },
  {
    name: 'Nomad',
    date: 'Aug 2022',
    loss: '$190M',
    lossNum: 190,
    mechanism: 'Message verification flaw',
    mechanismTag: 'Logic Flaw',
    tagColor: '#8b5cf6',
    detail: 'Copy-paste exploit. ANY user could drain funds. Most "democratic" hack.',
    tooltipRu: 'Nomad (Aug 2022): $190M. Баг в верификации сообщений позволил ЛЮБОМУ пользователю дренить фонды через copy-paste транзакции. Самый "демократичный" хак: сотни адресов участвовали.',
  },
  {
    name: 'BNB Bridge',
    date: 'Oct 2022',
    loss: '$570M',
    lossNum: 570,
    mechanism: 'Proof verifier bug',
    mechanismTag: 'Verification Bug',
    tagColor: '#f59e0b',
    detail: 'Attacker forged proofs to mint BNB.',
    tooltipRu: 'BNB Bridge (Oct 2022): $570M. Баг в proof verifier позволил подделать доказательства и сминтить BNB. Binance заморозил цепь для ограничения ущерба -- спорное решение с точки зрения децентрализации.',
  },
];

/**
 * BridgeHacksTimelineDiagram
 *
 * Horizontal timeline of 5 major bridge hacks.
 * Color-coded by attack type. DiagramTooltip on each hack card. Total losses DataBox.
 */
export function BridgeHacksTimelineDiagram() {
  const totalLoss = BRIDGE_HACKS.reduce((sum, h) => sum + h.lossNum, 0);

  return (
    <DiagramContainer title="Хронология взломов мостов" color="red">
      {/* Timeline */}
      <div style={{ 'position': 'relative', 'margin-bottom': '14px' }}>
        {/* Timeline line */}
        <div style={{
          'position': 'absolute',
          'top': '20px',
          'left': '20px',
          'right': '20px',
          'height': '2px',
          'background': 'rgba(255,255,255,0.1)',
          'z-index': '0',
        }} />

        {/* Hack entries */}
        <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'position': 'relative', 'z-index': '1' }}>
          {BRIDGE_HACKS.map((hack) => (
            <DiagramTooltip content={hack.tooltipRu}>
              <div
                style={{
                  'display': 'flex',
                  'flex-direction': 'column',
                  'align-items': 'center',
                  'flex': '1',
                  'cursor': 'pointer',
                }}
              >
                {/* Date */}
                <div style={{
                  'font-size': '8px',
                  'color': colors.textMuted,
                  'font-family': 'monospace',
                  'margin-bottom': '6px',
                }}>
                  {hack.date}
                </div>

                {/* Dot */}
                <div style={{
                  'width': '12px',
                  'height': '12px',
                  'border-radius': '50%',
                  'background': `${hack.tagColor}60`,
                  'border': `2px solid ${hack.tagColor}`,
                  'margin-bottom': '8px',
                  'transition': 'all 0.2s',
                }} />

                {/* Name + Loss */}
                <div style={{
                  'text-align': 'center',
                  'padding': '6px 4px',
                  'border-radius': '4px',
                  'min-width': '60px',
                }}>
                  <div style={{
                    'font-size': '10px',
                    'font-weight': '700',
                    'color': colors.text,
                    'line-height': '1.3',
                  }}>
                    {hack.name}
                  </div>
                  <div style={{
                    'font-size': '12px',
                    'font-weight': '700',
                    'color': '#f43f5e',
                    'font-family': 'monospace',
                    'margin-top': '2px',
                  }}>
                    {hack.loss}
                  </div>
                  <span style={{
                    'font-size': '8px',
                    'color': hack.tagColor,
                    'font-family': 'monospace',
                    'padding': '1px 4px',
                    'border-radius': '2px',
                    'background': `${hack.tagColor}15`,
                    'border': `1px solid ${hack.tagColor}30`,
                  }}>
                    {hack.mechanismTag}
                  </span>
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ 'display': 'flex', 'gap': '12px', 'margin-bottom': '12px', 'flex-wrap': 'wrap' }}>
        {[
          { tag: 'Key Compromise', color: '#f43f5e', tooltipRu: 'Компрометация приватных ключей валидаторов/multisig. Самый разрушительный тип атаки: полный контроль над bridge.' },
          { tag: 'Verification Bug', color: '#f59e0b', tooltipRu: 'Баги в верификации подписей или proof. Позволяют обойти проверки и подделать сообщения/доказательства.' },
          { tag: 'Logic Flaw', color: '#8b5cf6', tooltipRu: 'Логические ошибки в обработке сообщений. Позволяют несанкционированные операции (mint, transfer) без корректных условий.' },
        ].map((item) => (
          <DiagramTooltip content={item.tooltipRu}>
            <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '4px', 'cursor': 'pointer' }}>
              <div style={{
                'width': '8px',
                'height': '8px',
                'border-radius': '50%',
                'background': item.color,
              }} />
              <span style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
                {item.tag}
              </span>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DataBox
        label="Потери"
        value={`2022: >$1.3B потеряно только через мосты. В этой выборке: $${totalLoss}M. Всего: $2.8B+.`}
        variant="warning"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  InteropComparisonDiagram                                            */
/* ================================================================== */

interface InteropRow {
  category: string;
  layerzero: string;
  wormhole: string;
  axelar: string;
  native: string;
  tooltipRu: string;
}

const INTEROP_ROWS: InteropRow[] = [
  { category: 'Architecture', layerzero: 'Ultra-Light Nodes (ULNs)', wormhole: 'Guardian Network (19)', axelar: 'Proof of Stake validators', native: 'Rollup-specific', tooltipRu: 'Архитектура определяет trust model: LayerZero использует configurable DVNs, Wormhole -- фиксированный набор guardians, Axelar -- PoS валидаторов, native bridges -- механизмы самого rollup.' },
  { category: 'Trust Model', layerzero: 'Configurable (DVNs)', wormhole: 'Externally verified', axelar: 'Externally verified', native: 'Natively verified', tooltipRu: 'Trust model: кому вы доверяете. Native bridges наследуют безопасность L1 (natively verified). Остальные требуют доверия к внешним валидаторам (externally verified).' },
  { category: 'Supported Chains', layerzero: '80+', wormhole: '30+', axelar: '60+', native: 'L1 <-> specific L2', tooltipRu: 'Количество поддерживаемых цепей. LayerZero лидирует по охвату (80+). Native bridges ограничены конкретной парой L1-L2.' },
  { category: 'Message Type', layerzero: 'Arbitrary messages', wormhole: 'Arbitrary messages', axelar: 'General message passing', native: 'Deposits / withdrawals', tooltipRu: 'Тип сообщений: arbitrary messages позволяют вызывать контракты cross-chain (composability). Native bridges обычно ограничены переводами активов.' },
  { category: 'Speed', layerzero: 'Minutes', wormhole: 'Minutes', axelar: 'Minutes', native: 'Min (deposit) / 7d (withdrawal)', tooltipRu: 'Скорость: cross-chain протоколы работают за минуты. Native bridges: депозит за минуты, но вывод из optimistic rollup -- 7 дней (challenge period).' },
  { category: 'Market Share', layerzero: '~75% cross-chain volume', wormhole: '~10%', axelar: '~5%', native: 'N/A', tooltipRu: 'LayerZero доминирует с ~75% объемов cross-chain messaging. Wormhole восстанавливается после хака $326M. Рынок быстро консолидируется.' },
  { category: 'Security Model', layerzero: 'Decentralized Verification Networks', wormhole: '19 guardians', axelar: 'PoS validators', native: 'L1 security inheritance', tooltipRu: 'Security model: LayerZero DVNs -- configurable верификация (пользователь выбирает DVN провайдеров). Wormhole: 13/19 guardians. Native bridges: максимальная безопасность через L1.' },
  { category: 'Key Risk', layerzero: 'DVN collusion', wormhole: 'Guardian compromise', axelar: 'Validator compromise', native: 'Smart contract bugs', tooltipRu: 'Ключевой риск: для externally verified протоколов -- компрометация валидаторов. Для native bridges -- баги в smart contracts (но безопасность наследуется от L1).' },
];

const PROTOCOL_COLORS: Record<string, string> = {
  LayerZero: '#6366f1',
  Wormhole: '#10b981',
  Axelar: '#f59e0b',
  'Native Bridges': '#3b82f6',
};

/**
 * InteropComparisonDiagram
 *
 * HTML comparison table: LayerZero vs Wormhole vs Axelar vs Native Bridges.
 * 8 rows. DiagramTooltip on first column. Market leader highlighted.
 */
export function InteropComparisonDiagram() {
  const headers = ['LayerZero', 'Wormhole', 'Axelar', 'Native Bridges'] as const;

  return (
    <DiagramContainer title="Протоколы интероперабельности: сравнение" color="purple">
      <div style={{ 'overflow-x': 'auto' }}>
        <table style={{
          'width': '100%',
          'border-collapse': 'collapse',
          'font-size': '12px',
          'font-family': 'monospace',
        }}>
          <thead>
            <tr>
              <th style={{
                'padding': '8px 10px',
                'text-align': 'left',
                'font-size': '10px',
                'color': colors.textMuted,
                'border-bottom': '1px solid rgba(255,255,255,0.1)',
                'min-width': '90px',
              }}>
                Параметр
              </th>
              {headers.map((protocol) => (
                <th style={{
                  'padding': '8px 10px',
                  'text-align': 'left',
                  'font-size': '10px',
                  'font-weight': '600',
                  'color': PROTOCOL_COLORS[protocol],
                  'border-bottom': `2px solid ${PROTOCOL_COLORS[protocol]}40`,
                  'min-width': '110px',
                }}>
                  {protocol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INTEROP_ROWS.map((row, i) => {
              const isMarketShare = row.category === 'Market Share';
              return (
                <tr
                  style={{
                    'transition': 'background 0.15s',
                  }}
                >
                  <td style={{
                    'padding': '7px 10px',
                    'color': colors.textMuted,
                    'font-weight': '600',
                    'font-size': '10px',
                    'border-bottom': '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <DiagramTooltip content={row.tooltipRu}>
                      <span style={{ 'border-bottom': '1px dotted rgba(255,255,255,0.3)', 'cursor': 'help' }}>{row.category}</span>
                    </DiagramTooltip>
                  </td>
                  <td style={{
                    'padding': '7px 10px',
                    'color': isMarketShare ? PROTOCOL_COLORS.LayerZero : colors.text,
                    'font-weight': isMarketShare ? 700 : 400,
                    'font-size': '10px',
                    'border-bottom': '1px solid rgba(255,255,255,0.05)',
                    'line-height': '1.4',
                  }}>
                    {row.layerzero}
                  </td>
                  <td style={{
                    'padding': '7px 10px',
                    'color': colors.text,
                    'font-size': '10px',
                    'border-bottom': '1px solid rgba(255,255,255,0.05)',
                    'line-height': '1.4',
                  }}>
                    {row.wormhole}
                  </td>
                  <td style={{
                    'padding': '7px 10px',
                    'color': colors.text,
                    'font-size': '10px',
                    'border-bottom': '1px solid rgba(255,255,255,0.05)',
                    'line-height': '1.4',
                  }}>
                    {row.axelar}
                  </td>
                  <td style={{
                    'padding': '7px 10px',
                    'color': colors.text,
                    'font-size': '10px',
                    'border-bottom': '1px solid rgba(255,255,255,0.05)',
                    'line-height': '1.4',
                  }}>
                    {row.native}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ 'margin-top': '12px' }}>
        <DataBox
          label="Рынок 2025"
          value="LayerZero доминирует (~75% volume). Wormhole восстанавливается после хака. Native bridges -- самые безопасные для L1<->L2."
          variant="info"
        />
      </div>
    </DiagramContainer>
  );
}
