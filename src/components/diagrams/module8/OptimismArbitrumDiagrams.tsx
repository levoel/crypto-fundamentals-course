/**
 * Optimism & Arbitrum Diagrams (SCALE-06)
 *
 * Exports:
 * - OPStackDiagram: Static 4-layer OP Stack modular architecture with Superchain vision
 * - NitroDiagram: Static Arbitrum Nitro architecture flow with Stylus panel
 * - OPvsARBDiagram: HTML comparison table (10 rows) with hover tooltips
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  OPStackDiagram                                                       */
/* ================================================================== */

interface StackLayer {
  name: string;
  component: string;
  description: string;
  color: string;
  swappable: boolean;
}

const OP_STACK_LAYERS: StackLayer[] = [
  {
    name: 'Consensus Layer',
    component: 'Sequencer (централизованный)',
    description: 'Упорядочивание транзакций. Текущий: единый sequencer. Будущее: decentralized sequencer network.',
    color: '#f59e0b',
    swappable: true,
  },
  {
    name: 'Execution Layer',
    component: 'OP-Geth (модифицированный go-ethereum)',
    description: 'Исполнение транзакций. EVM-equivalent: OP-Geth запускает те же opcodes что и Ethereum L1.',
    color: '#6366f1',
    swappable: true,
  },
  {
    name: 'Settlement Layer',
    component: 'Ethereum L1 (fraud proofs)',
    description: 'Финальная верификация state transitions. Cannon FPVM для permissionless fraud proofs (Stage 1).',
    color: '#10b981',
    swappable: false,
  },
  {
    name: 'Data Availability Layer',
    component: 'Ethereum L1 (calldata / blobs)',
    description: 'Хранение данных транзакций. Pre-4844: calldata. Post-4844: blob transactions (10-100x дешевле).',
    color: '#2563eb',
    swappable: true,
  },
];

interface SuperchainMember {
  name: string;
  color: string;
  tvl: string;
}

const SUPERCHAIN_MEMBERS: SuperchainMember[] = [
  { name: 'Optimism', color: '#ef4444', tvl: '~$2.5B' },
  { name: 'Base', color: '#2563eb', tvl: '~$12B' },
  { name: 'Zora', color: '#a78bfa', tvl: '~$50M' },
  { name: 'Mode', color: '#f59e0b', tvl: '~$200M' },
];

interface Milestone {
  year: string;
  event: string;
  color: string;
}

const OP_MILESTONES: Milestone[] = [
  { year: '2023', event: 'Bedrock -- модульная архитектура', color: '#6366f1' },
  { year: '2024', event: 'Cannon FPVM -- permissionless fraud proofs (Stage 1)', color: '#ef4444' },
  { year: '2024', event: 'EIP-4844 -- blob transactions', color: '#2563eb' },
  { year: '2025', event: 'ERC-7802 -- cross-chain token standard', color: '#10b981' },
];

/**
 * OPStackDiagram
 *
 * 4-layer OP Stack modular architecture.
 * Superchain vision with member chains. Key milestones.
 */
export function OPStackDiagram() {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  return (
    <DiagramContainer title="OP Stack: модульная архитектура" color="red">
      {/* 4-layer stack */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          OP Stack = модульный rollup framework. Каждый layer может быть заменен.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {OP_STACK_LAYERS.map((layer, i) => {
            const isHovered = hoveredLayer === i;

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredLayer(i)}
                onMouseLeave={() => setHoveredLayer(null)}
                style={{
                  ...glassStyle,
                  padding: '10px 14px',
                  border: `1px solid ${isHovered ? layer.color + '60' : layer.color + '25'}`,
                  borderRadius: 6,
                  borderLeft: `4px solid ${layer.color}`,
                  transition: 'all 0.2s',
                  background: isHovered ? `${layer.color}10` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isHovered ? 6 : 0, flexWrap: 'wrap', gap: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: layer.color, fontFamily: 'monospace' }}>
                    {layer.name}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace' }}>
                      {layer.component}
                    </span>
                    {layer.swappable && (
                      <span style={{
                        fontSize: 8,
                        padding: '1px 5px',
                        borderRadius: 3,
                        background: '#f59e0b15',
                        color: '#f59e0b',
                        border: '1px solid #f59e0b30',
                        fontFamily: 'monospace',
                      }}>
                        swappable
                      </span>
                    )}
                  </div>
                </div>
                {isHovered && (
                  <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', lineHeight: 1.5 }}>
                    {layer.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Superchain */}
      <div style={{
        ...glassStyle,
        padding: 14,
        marginBottom: 14,
        border: '1px solid #ef444430',
        borderRadius: 8,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', fontFamily: 'monospace', marginBottom: 8 }}>
          Superchain Vision
        </div>
        <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.5, marginBottom: 10 }}>
          Множество OP Stack сетей, объединенных общей безопасностью и интероперабельностью.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUPERCHAIN_MEMBERS.map((member) => (
            <div
              key={member.name}
              style={{
                ...glassStyle,
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${member.color}30`,
                fontSize: 10,
                fontFamily: 'monospace',
              }}
            >
              <span style={{ color: member.color, fontWeight: 600 }}>{member.name}</span>
              <span style={{ color: colors.textMuted, marginLeft: 6 }}>{member.tvl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
          Ключевые milestones:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {OP_MILESTONES.map((ms, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: ms.color, fontFamily: 'monospace', flexShrink: 0 }}>
                {ms.year}
              </span>
              <span style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.4 }}>
                {ms.event}
              </span>
            </div>
          ))}
        </div>
      </div>

      <DataBox
        label="Superchain"
        value="Superchain: интероперабельность между OP Stack сетями. ERC-7802 стандарт для cross-chain токенов. Base (Coinbase) -- крупнейший OP Stack chain по TVL."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  NitroDiagram                                                         */
/* ================================================================== */

interface NitroPipelineStep {
  name: string;
  description: string;
  color: string;
}

const NITRO_PIPELINE: NitroPipelineStep[] = [
  { name: 'Sequencer', description: 'Принимает транзакции от пользователей, упорядочивает', color: '#f59e0b' },
  { name: 'Geth Core + ArbOS', description: 'Стандартный EVM (Geth) + ArbOS для L2-специфичной логики', color: '#6366f1' },
  { name: 'State Transition Function', description: 'Детерминистический STF -- одинаковый результат при повторном исполнении', color: '#10b981' },
  { name: 'Compression', description: 'Сжатие batch data перед публикацией (Brotli)', color: '#a78bfa' },
  { name: 'Fraud Proofs (WASM)', description: 'STF компилируется в WASM для one-step verification в bisection protocol', color: '#ef4444' },
  { name: 'L1 Submission', description: 'State roots + compressed batch data на Ethereum L1', color: '#2563eb' },
];

/**
 * NitroDiagram
 *
 * Arbitrum Nitro architecture flow diagram.
 * Stylus WASM panel. Orbit framework note.
 */
export function NitroDiagram() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [showStylus, setShowStylus] = useState(false);

  return (
    <DiagramContainer title="Arbitrum Nitro: архитектура" color="blue">
      {/* Pipeline */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          Nitro Pipeline: TX -> Execution -> STF -> Compress -> Proof -> L1
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NITRO_PIPELINE.map((step, i) => {
            const isHovered = hoveredStep === i;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {/* Step number with connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 24 }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: `${step.color}20`,
                    border: `2px solid ${step.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: step.color,
                  }}>
                    {i + 1}
                  </div>
                  {i < NITRO_PIPELINE.length - 1 && (
                    <div style={{ width: 2, height: 16, background: `${step.color}30`, marginTop: 2 }} />
                  )}
                </div>

                {/* Content */}
                <div
                  onMouseEnter={() => setHoveredStep(i)}
                  onMouseLeave={() => setHoveredStep(null)}
                  style={{
                    ...glassStyle,
                    padding: '8px 12px',
                    flex: 1,
                    border: `1px solid ${isHovered ? step.color + '50' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: step.color, fontFamily: 'monospace' }}>
                    {step.name}
                  </div>
                  {isHovered && (
                    <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', marginTop: 4, lineHeight: 1.5 }}>
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stylus panel */}
      <div
        onClick={() => setShowStylus(!showStylus)}
        style={{
          ...glassStyle,
          padding: 14,
          marginBottom: 12,
          border: `1px solid ${showStylus ? '#10b98150' : '#10b98125'}`,
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
            Stylus: WASM VM
          </div>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: colors.textMuted }}>
            {showStylus ? '[-]' : '[+]'}
          </span>
        </div>
        <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', marginTop: 4 }}>
          WASM VM alongside EVM. Контракты на Rust, C, C++ рядом с Solidity.
        </div>
        {showStylus && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div style={{ ...glassStyle, padding: 8, borderRadius: 6, border: '1px solid #6366f130' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', fontFamily: 'monospace', marginBottom: 2 }}>EVM</div>
                <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>Solidity, Vyper</div>
                <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>Standard execution</div>
              </div>
              <div style={{ ...glassStyle, padding: 8, borderRadius: 6, border: '1px solid #10b98130' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#10b981', fontFamily: 'monospace', marginBottom: 2 }}>WASM (Stylus)</div>
                <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: 'monospace' }}>Rust, C, C++</div>
                <div style={{ fontSize: 9, color: '#10b981', fontFamily: 'monospace' }}>10-100x дешевле</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.5 }}>
              Stylus контракты деплоятся рядом с Solidity контрактами на той же сети. Одинаковая безопасность. Compute-heavy задачи (crypto, ML inference, complex math) -- в 10-100x дешевле.
            </div>
          </div>
        )}
      </div>

      {/* Orbit */}
      <div style={{
        ...glassStyle,
        padding: 10,
        marginBottom: 14,
        borderRadius: 6,
        border: '1px solid #a78bfa25',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 4 }}>
          Orbit Framework
        </div>
        <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.5 }}>
          L2/L3 chains на технологии Arbitrum. AnyTrust mode: off-chain DA через Data Availability Committee (дешевле, но слабее безопасность).
        </div>
      </div>

      <DataBox
        label="Nitro"
        value="Geth core для EVM-совместимости + ArbOS для L2 логики + WASM для fraud proofs + Stylus для альтернативных языков. Архитектура, оптимизированная для производительности."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  OPvsARBDiagram                                                       */
/* ================================================================== */

interface ComparisonRow {
  category: string;
  optimism: string;
  arbitrum: string;
  opAdvantage: boolean;
  arbAdvantage: boolean;
  opTooltip: string;
  arbTooltip: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    category: 'Fraud Proofs',
    optimism: 'Single-round (Cannon FPVM)',
    arbitrum: 'Multi-round interactive (bisection)',
    opAdvantage: false,
    arbAdvantage: false,
    opTooltip: 'Cannon FPVM повторно исполняет спорную транзакцию целиком на L1. Проще, но дороже по gas.',
    arbTooltip: 'Bisection protocol сужает спор до одной инструкции за ~log2(N) раундов. Дешевле, но сложнее.',
  },
  {
    category: 'L1 Gas Cost (dispute)',
    optimism: 'Выше (re-execute full TX)',
    arbitrum: 'Ниже (single instruction)',
    opAdvantage: false,
    arbAdvantage: true,
    opTooltip: 'O(N) gas за полное повторное исполнение транзакции на L1.',
    arbTooltip: 'O(log N) gas -- финальная верификация только 1 инструкции.',
  },
  {
    category: 'EVM Compatibility',
    optimism: 'EVM equivalent (OP-Geth)',
    arbitrum: 'EVM equivalent (Geth + ArbOS)',
    opAdvantage: false,
    arbAdvantage: false,
    opTooltip: 'OP-Geth -- модифицированный go-ethereum. Те же opcodes, тот же behaviour.',
    arbTooltip: 'Geth core + ArbOS layer. ArbOS добавляет L2-специфичную логику (ArbSys precompile).',
  },
  {
    category: 'VM',
    optimism: 'OP-Geth only (EVM)',
    arbitrum: 'Geth + Stylus (EVM + WASM)',
    opAdvantage: false,
    arbAdvantage: true,
    opTooltip: 'Только EVM. Solidity и Vyper.',
    arbTooltip: 'EVM + WASM Stylus VM. Контракты на Rust, C, C++ с 10-100x экономией для compute-heavy задач.',
  },
  {
    category: 'Ecosystem Framework',
    optimism: 'OP Stack (Superchain)',
    arbitrum: 'Orbit (L2/L3 chains)',
    opAdvantage: true,
    arbAdvantage: false,
    opTooltip: 'OP Stack -- модульный фреймворк. Superchain объединяет Base, Zora, Mode с shared security и interop.',
    arbTooltip: 'Orbit позволяет запускать собственные L2/L3. AnyTrust mode для удешевления DA.',
  },
  {
    category: 'Notable Chains',
    optimism: 'Optimism, Base, Zora, Mode',
    arbitrum: 'Arbitrum One, Nova, Orbit chains',
    opAdvantage: true,
    arbAdvantage: false,
    opTooltip: 'Base (Coinbase) -- крупнейший L2 по TVL (~$12B). Ecosystem растет быстрее.',
    arbTooltip: 'Arbitrum One -- крупнейший по собственному TVL. Nova для gaming (AnyTrust DA).',
  },
  {
    category: 'TVL (2025)',
    optimism: '~$2.5B (OP Mainnet)',
    arbitrum: '~$8B (Arbitrum One)',
    opAdvantage: false,
    arbAdvantage: true,
    opTooltip: 'OP Mainnet TVL. С учетом Superchain (Base + Zora + Mode): $15B+.',
    arbTooltip: 'Arbitrum One -- наибольший TVL среди всех rollups.',
  },
  {
    category: 'Stage Classification',
    optimism: 'Stage 1 (live fraud proofs)',
    arbitrum: 'Stage 1',
    opAdvantage: false,
    arbAdvantage: false,
    opTooltip: 'Cannon FPVM permissionless с 2024. Security Council как fallback.',
    arbTooltip: 'Permissionless bisection protocol. Security Council oversight.',
  },
  {
    category: 'Sequencer',
    optimism: 'Centralized (decentralization planned)',
    arbitrum: 'Centralized (decentralization planned)',
    opAdvantage: false,
    arbAdvantage: false,
    opTooltip: 'Optimism Foundation запускает единый sequencer. Shared sequencing исследуется.',
    arbTooltip: 'Offchain Labs запускает единый sequencer. Decentralization in roadmap.',
  },
  {
    category: 'Unique Feature',
    optimism: 'Superchain interop (ERC-7802)',
    arbitrum: 'Stylus (Rust contracts)',
    opAdvantage: true,
    arbAdvantage: true,
    opTooltip: 'ERC-7802: стандарт для бесшовного bridging токенов между OP Stack chains.',
    arbTooltip: 'Stylus: WASM VM для Rust/C/C++ контрактов. Уникальная возможность multi-language development.',
  },
];

/**
 * OPvsARBDiagram
 *
 * HTML comparison table with 10 rows.
 * Hover reveals detailed tooltips. Green highlighting for advantages.
 */
export function OPvsARBDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<'op' | 'arb' | null>(null);

  return (
    <DiagramContainer title="Optimism vs Arbitrum: сравнение" color="purple">
      {/* Table */}
      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'monospace',
          fontSize: 10,
        }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderBottom: '2px solid rgba(255,255,255,0.15)',
                color: colors.textMuted,
                fontSize: 10,
                fontWeight: 600,
                width: '25%',
              }}>
                Категория
              </th>
              <th style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderBottom: '2px solid #ef444450',
                color: '#ef4444',
                fontSize: 10,
                fontWeight: 600,
                width: '37.5%',
              }}>
                Optimism
              </th>
              <th style={{
                textAlign: 'left',
                padding: '8px 10px',
                borderBottom: '2px solid #2563eb50',
                color: '#2563eb',
                fontSize: 10,
                fontWeight: 600,
                width: '37.5%',
              }}>
                Arbitrum
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => {
              const isHovered = hoveredRow === i;

              return (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null); }}
                  style={{
                    background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <td style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    color: isHovered ? colors.text : colors.textMuted,
                    fontWeight: 600,
                    verticalAlign: 'top',
                  }}>
                    {row.category}
                  </td>
                  <td
                    onMouseEnter={() => setHoveredCol('op')}
                    onMouseLeave={() => setHoveredCol(null)}
                    style={{
                      padding: '8px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      color: row.opAdvantage ? '#10b981' : colors.text,
                      verticalAlign: 'top',
                      position: 'relative',
                    }}
                  >
                    {row.optimism}
                    {isHovered && hoveredCol === 'op' && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        ...glassStyle,
                        padding: 8,
                        fontSize: 9,
                        color: colors.textMuted,
                        lineHeight: 1.5,
                        border: '1px solid #ef444430',
                        borderRadius: 4,
                        backdropFilter: 'blur(8px)',
                        background: 'rgba(15,15,25,0.95)',
                      }}>
                        {row.opTooltip}
                      </div>
                    )}
                  </td>
                  <td
                    onMouseEnter={() => setHoveredCol('arb')}
                    onMouseLeave={() => setHoveredCol(null)}
                    style={{
                      padding: '8px 10px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      color: row.arbAdvantage ? '#10b981' : colors.text,
                      verticalAlign: 'top',
                      position: 'relative',
                    }}
                  >
                    {row.arbitrum}
                    {isHovered && hoveredCol === 'arb' && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        ...glassStyle,
                        padding: 8,
                        fontSize: 9,
                        color: colors.textMuted,
                        lineHeight: 1.5,
                        border: '1px solid #2563eb30',
                        borderRadius: 4,
                        backdropFilter: 'blur(8px)',
                        background: 'rgba(15,15,25,0.95)',
                      }}>
                        {row.arbTooltip}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <DataBox
        label="Ключевой вывод"
        value="Обе системы Stage 1 с активными fraud proofs. Главное отличие: OP Stack = модульность и экосистема (Base), Arbitrum = производительность и Stylus (Rust contracts)."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
