/**
 * Optimism & Arbitrum Diagrams (SCALE-06)
 *
 * Exports:
 * - OPStackDiagram: 4-layer OP Stack modular architecture with Superchain vision
 * - NitroDiagram: Arbitrum Nitro architecture flow with Stylus panel
 * - OPvsARBDiagram: HTML comparison table (10 rows) with per-cell DiagramTooltip
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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
  tooltipRu: string;
}

const OP_STACK_LAYERS: StackLayer[] = [
  {
    name: 'Consensus Layer',
    component: 'Sequencer (централизованный)',
    description: 'Упорядочивание транзакций. Текущий: единый sequencer. Будущее: decentralized sequencer network.',
    color: '#f59e0b',
    swappable: true,
    tooltipRu: 'Consensus Layer отвечает за упорядочивание транзакций. Сейчас -- единый централизованный sequencer (Optimism Foundation). Модульность позволяет заменить на decentralized sequencer network или shared sequencing.',
  },
  {
    name: 'Execution Layer',
    component: 'OP-Geth (модифицированный go-ethereum)',
    description: 'Исполнение транзакций. EVM-equivalent: OP-Geth запускает те же opcodes что и Ethereum L1.',
    color: '#6366f1',
    swappable: true,
    tooltipRu: 'Execution Layer -- модифицированный go-ethereum (OP-Geth). EVM-equivalent: те же opcodes, тот же behaviour. Любой Solidity контракт работает без изменений. Swappable: можно заменить на другую VM.',
  },
  {
    name: 'Settlement Layer',
    component: 'Ethereum L1 (fraud proofs)',
    description: 'Финальная верификация state transitions. Cannon FPVM для permissionless fraud proofs (Stage 1).',
    color: '#10b981',
    swappable: false,
    tooltipRu: 'Settlement Layer -- Ethereum L1. Cannon FPVM обеспечивает permissionless fraud proofs (Stage 1 с 2024). Единственный НЕ swappable layer: безопасность привязана к Ethereum.',
  },
  {
    name: 'Data Availability Layer',
    component: 'Ethereum L1 (calldata / blobs)',
    description: 'Хранение данных транзакций. Pre-4844: calldata. Post-4844: blob transactions (10-100x дешевле).',
    color: '#2563eb',
    swappable: true,
    tooltipRu: 'Data Availability Layer хранит данные транзакций. Post EIP-4844: blob transactions в 10-100x дешевле calldata. Swappable: можно использовать Celestia, EigenDA или собственный DAC (validium mode).',
  },
];

interface SuperchainMember {
  name: string;
  color: string;
  tvl: string;
  tooltipRu: string;
}

const SUPERCHAIN_MEMBERS: SuperchainMember[] = [
  { name: 'Optimism', color: '#ef4444', tvl: '~$2.5B', tooltipRu: 'Optimism Mainnet -- оригинальная OP Stack сеть. Пионер optimistic rollups. Revenue sharing через RetroPGF (Public Goods Funding).' },
  { name: 'Base', color: '#2563eb', tvl: '~$12B', tooltipRu: 'Base (Coinbase) -- крупнейший L2 по TVL (~$12B). Интеграция с Coinbase обеспечивает массовый onboarding. Не имеет собственного токена.' },
  { name: 'Zora', color: '#a78bfa', tvl: '~$50M', tooltipRu: 'Zora -- OP Stack сеть, оптимизированная для NFT и creator economy. Низкие комиссии для минтинга и торговли NFT.' },
  { name: 'Mode', color: '#f59e0b', tvl: '~$200M', tooltipRu: 'Mode -- OP Stack сеть с фокусом на DeFi. Sequencer Fee Sharing: часть доходов sequencer распределяется среди разработчиков.' },
];

interface Milestone {
  year: string;
  event: string;
  color: string;
  tooltipRu: string;
}

const OP_MILESTONES: Milestone[] = [
  { year: '2023', event: 'Bedrock -- модульная архитектура', color: '#6366f1', tooltipRu: 'Bedrock (2023) -- фундаментальное обновление OP Stack. Модульная архитектура с replaceable layers. Снижение gas costs на 40%. Основа для Superchain.' },
  { year: '2024', event: 'Cannon FPVM -- permissionless fraud proofs (Stage 1)', color: '#ef4444', tooltipRu: 'Cannon FPVM (2024) -- permissionless fraud proofs. Любой может оспорить некорректный state root. Stage 1 по классификации L2Beat. Критический шаг к децентрализации.' },
  { year: '2024', event: 'EIP-4844 -- blob transactions', color: '#2563eb', tooltipRu: 'EIP-4844 Proto-Danksharding (2024) -- blob transactions. Стоимость DA снизилась в 10-100x. L2 комиссии упали до центов. Ключевое обновление для масштабирования.' },
  { year: '2025', event: 'ERC-7802 -- cross-chain token standard', color: '#10b981', tooltipRu: 'ERC-7802 (2025) -- стандарт для cross-chain токенов между OP Stack сетями. Бесшовный bridging без wrapped tokens. Фундамент для Superchain interoperability.' },
];

/**
 * OPStackDiagram
 *
 * 4-layer OP Stack modular architecture.
 * Superchain vision with member chains. Key milestones. DiagramTooltip on layers, members, milestones.
 */
export function OPStackDiagram() {
  return (
    <DiagramContainer title="OP Stack: модульная архитектура" color="red">
      {/* 4-layer stack */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          OP Stack = модульный rollup framework. Каждый layer может быть заменен.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {OP_STACK_LAYERS.map((layer, i) => (
            <DiagramTooltip key={i} content={layer.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '10px 14px',
                  border: `1px solid ${layer.color}25`,
                  borderRadius: 6,
                  borderLeft: `4px solid ${layer.color}`,
                  transition: 'all 0.2s',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
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
              </div>
            </DiagramTooltip>
          ))}
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
            <DiagramTooltip key={member.name} content={member.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: `1px solid ${member.color}30`,
                  fontSize: 10,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: member.color, fontWeight: 600 }}>{member.name}</span>
                <span style={{ color: colors.textMuted, marginLeft: 6 }}>{member.tvl}</span>
              </div>
            </DiagramTooltip>
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
            <DiagramTooltip key={i} content={ms.tooltipRu}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', cursor: 'pointer' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: ms.color, fontFamily: 'monospace', flexShrink: 0 }}>
                  {ms.year}
                </span>
                <span style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.4 }}>
                  {ms.event}
                </span>
              </div>
            </DiagramTooltip>
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
  tooltipRu: string;
}

const NITRO_PIPELINE: NitroPipelineStep[] = [
  { name: 'Sequencer', description: 'Принимает транзакции от пользователей, упорядочивает', color: '#f59e0b', tooltipRu: 'Sequencer принимает транзакции и обеспечивает soft confirmation за секунды. Централизованный (Offchain Labs), но не может подделать state благодаря fraud proofs.' },
  { name: 'Geth Core + ArbOS', description: 'Стандартный EVM (Geth) + ArbOS для L2-специфичной логики', color: '#6366f1', tooltipRu: 'Geth Core -- неизмененное ядро go-ethereum для EVM совместимости. ArbOS -- layer поверх Geth для L2 логики: газ-аккаунтинг, cross-chain messaging (ArbSys precompile), retryable tickets.' },
  { name: 'State Transition Function', description: 'Детерминистический STF -- одинаковый результат при повторном исполнении', color: '#10b981', tooltipRu: 'STF -- детерминистическая функция. Один и тот же input всегда дает тот же output. Это позволяет верификаторам повторить вычисления и обнаружить мошенничество.' },
  { name: 'Compression', description: 'Сжатие batch data перед публикацией (Brotli)', color: '#a78bfa', tooltipRu: 'Brotli compression сжимает batch data перед публикацией на L1. Экономия ~50-80% на DA costs. Каждый байт на L1 стоит ~16 gas, сжатие критично для экономики.' },
  { name: 'Fraud Proofs (WASM)', description: 'STF компилируется в WASM для one-step verification в bisection protocol', color: '#ef4444', tooltipRu: 'STF компилируется в WASM для one-step verification. Bisection protocol сужает спор до одной WASM инструкции, которая верифицируется on-chain. O(log N) gas.' },
  { name: 'L1 Submission', description: 'State roots + compressed batch data на Ethereum L1', color: '#2563eb', tooltipRu: 'Финальная публикация на L1: state root + compressed batch data. После EIP-4844: blob transactions значительно снижают стоимость. State root позволяет верификацию.' },
];

/**
 * NitroDiagram
 *
 * Arbitrum Nitro architecture flow diagram.
 * Stylus WASM panel. Orbit framework note. DiagramTooltip on pipeline steps.
 */
export function NitroDiagram() {
  const [showStylus, setShowStylus] = useState(false);

  return (
    <DiagramContainer title="Arbitrum Nitro: архитектура" color="blue">
      {/* Pipeline */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          Nitro Pipeline: TX {'->'} Execution {'->'} STF {'->'} Compress {'->'} Proof {'->'} L1
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NITRO_PIPELINE.map((step, i) => (
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
              <DiagramTooltip content={step.tooltipRu}>
                <div
                  style={{
                    ...glassStyle,
                    padding: '8px 12px',
                    flex: 1,
                    border: `1px solid rgba(255,255,255,0.06)`,
                    borderRadius: 6,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: step.color, fontFamily: 'monospace' }}>
                    {step.name}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginTop: 4, lineHeight: 1.5 }}>
                    {step.description}
                  </div>
                </div>
              </DiagramTooltip>
            </div>
          ))}
        </div>
      </div>

      {/* Stylus panel */}
      <DiagramTooltip content="Stylus -- WASM VM рядом с EVM. Контракты на Rust, C, C++ с 10-100x экономией для compute-heavy задач. Одинаковая безопасность с Solidity контрактами.">
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
      </DiagramTooltip>

      {/* Orbit */}
      <DiagramTooltip content="Orbit -- фреймворк для запуска собственных L2/L3 на технологии Arbitrum. AnyTrust mode хранит данные off-chain через DAC (дешевле, но слабее безопасность). Используется для gaming chains.">
        <div style={{
          ...glassStyle,
          padding: 10,
          marginBottom: 14,
          borderRadius: 6,
          border: '1px solid #a78bfa25',
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 4 }}>
            Orbit Framework
          </div>
          <div style={{ fontSize: 10, color: colors.text, fontFamily: 'monospace', lineHeight: 1.5 }}>
            L2/L3 chains на технологии Arbitrum. AnyTrust mode: off-chain DA через Data Availability Committee (дешевле, но слабее безопасность).
          </div>
        </div>
      </DiagramTooltip>

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
  categoryTooltipRu: string;
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
    categoryTooltipRu: 'Fraud Proofs -- механизм верификации state transitions. Ключевое архитектурное отличие: Optimism использует single-round (проще), Arbitrum -- multi-round interactive (дешевле).',
  },
  {
    category: 'L1 Gas Cost (dispute)',
    optimism: 'Выше (re-execute full TX)',
    arbitrum: 'Ниже (single instruction)',
    opAdvantage: false,
    arbAdvantage: true,
    opTooltip: 'O(N) gas за полное повторное исполнение транзакции на L1.',
    arbTooltip: 'O(log N) gas -- финальная верификация только 1 инструкции.',
    categoryTooltipRu: 'Стоимость разрешения спора на L1. Single-round: O(N) gas (вся транзакция). Multi-round: O(log N) gas (одна инструкция). Для сложных транзакций разница может быть 100x+.',
  },
  {
    category: 'EVM Compatibility',
    optimism: 'EVM equivalent (OP-Geth)',
    arbitrum: 'EVM equivalent (Geth + ArbOS)',
    opAdvantage: false,
    arbAdvantage: false,
    opTooltip: 'OP-Geth -- модифицированный go-ethereum. Те же opcodes, тот же behaviour.',
    arbTooltip: 'Geth core + ArbOS layer. ArbOS добавляет L2-специфичную логику (ArbSys precompile).',
    categoryTooltipRu: 'EVM совместимость: оба rollup используют модифицированный Geth. Любой Solidity контракт работает без изменений. Различия минимальны и касаются L2-специфичных precompiles.',
  },
  {
    category: 'VM',
    optimism: 'OP-Geth only (EVM)',
    arbitrum: 'Geth + Stylus (EVM + WASM)',
    opAdvantage: false,
    arbAdvantage: true,
    opTooltip: 'Только EVM. Solidity и Vyper.',
    arbTooltip: 'EVM + WASM Stylus VM. Контракты на Rust, C, C++ с 10-100x экономией для compute-heavy задач.',
    categoryTooltipRu: 'Virtual Machine: Arbitrum уникален наличием Stylus WASM VM рядом с EVM. Это позволяет писать контракты на Rust/C/C++ с значительной экономией для вычислительных задач.',
  },
  {
    category: 'Ecosystem Framework',
    optimism: 'OP Stack (Superchain)',
    arbitrum: 'Orbit (L2/L3 chains)',
    opAdvantage: true,
    arbAdvantage: false,
    opTooltip: 'OP Stack -- модульный фреймворк. Superchain объединяет Base, Zora, Mode с shared security и interop.',
    arbTooltip: 'Orbit позволяет запускать собственные L2/L3. AnyTrust mode для удешевления DA.',
    categoryTooltipRu: 'Ecosystem Framework: оба предлагают создание собственных rollups. OP Stack Superchain фокусируется на интероперабельности, Orbit -- на гибкости (L2/L3, AnyTrust mode).',
  },
  {
    category: 'Notable Chains',
    optimism: 'Optimism, Base, Zora, Mode',
    arbitrum: 'Arbitrum One, Nova, Orbit chains',
    opAdvantage: true,
    arbAdvantage: false,
    opTooltip: 'Base (Coinbase) -- крупнейший L2 по TVL (~$12B). Ecosystem растет быстрее.',
    arbTooltip: 'Arbitrum One -- крупнейший по собственному TVL. Nova для gaming (AnyTrust DA).',
    categoryTooltipRu: 'Notable Chains: OP Stack экосистема лидирует по совокупному TVL (Base $12B + Optimism $2.5B + Mode + Zora). Arbitrum лидирует по TVL единственной сети (Arbitrum One $8B).',
  },
  {
    category: 'TVL (2025)',
    optimism: '~$2.5B (OP Mainnet)',
    arbitrum: '~$8B (Arbitrum One)',
    opAdvantage: false,
    arbAdvantage: true,
    opTooltip: 'OP Mainnet TVL. С учетом Superchain (Base + Zora + Mode): $15B+.',
    arbTooltip: 'Arbitrum One -- наибольший TVL среди всех rollups.',
    categoryTooltipRu: 'TVL (Total Value Locked): Arbitrum One лидирует как отдельная сеть ($8B). Но Superchain совокупно: $15B+ (Base доминирует). Метрика зависит от того, как считать.',
  },
  {
    category: 'Stage Classification',
    optimism: 'Stage 1 (live fraud proofs)',
    arbitrum: 'Stage 1',
    opAdvantage: false,
    arbAdvantage: false,
    opTooltip: 'Cannon FPVM permissionless с 2024. Security Council как fallback.',
    arbTooltip: 'Permissionless bisection protocol. Security Council oversight.',
    categoryTooltipRu: 'L2Beat Stage Classification: Stage 1 означает permissionless fraud proofs с Security Council как fallback. Stage 2 -- полная децентрализация без Security Council override.',
  },
  {
    category: 'Sequencer',
    optimism: 'Centralized (decentralization planned)',
    arbitrum: 'Centralized (decentralization planned)',
    opAdvantage: false,
    arbAdvantage: false,
    opTooltip: 'Optimism Foundation запускает единый sequencer. Shared sequencing исследуется.',
    arbTooltip: 'Offchain Labs запускает единый sequencer. Decentralization in roadmap.',
    categoryTooltipRu: 'Sequencer: оба rollup используют централизованный sequencer. Это обеспечивает быстрые подтверждения, но создает single point of failure. Децентрализация -- в roadmap обоих проектов.',
  },
  {
    category: 'Unique Feature',
    optimism: 'Superchain interop (ERC-7802)',
    arbitrum: 'Stylus (Rust contracts)',
    opAdvantage: true,
    arbAdvantage: true,
    opTooltip: 'ERC-7802: стандарт для бесшовного bridging токенов между OP Stack chains.',
    arbTooltip: 'Stylus: WASM VM для Rust/C/C++ контрактов. Уникальная возможность multi-language development.',
    categoryTooltipRu: 'Unique Feature: каждый проект имеет уникальное преимущество. Optimism -- Superchain interop (ERC-7802) для бесшовного bridging. Arbitrum -- Stylus для multi-language smart contracts.',
  },
];

/**
 * OPvsARBDiagram
 *
 * HTML comparison table with 10 rows.
 * DiagramTooltip on category labels and per-cell values. Green highlighting for advantages.
 */
export function OPvsARBDiagram() {
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
            {COMPARISON_ROWS.map((row, i) => (
              <tr
                key={i}
                style={{
                  transition: 'background 0.15s',
                }}
              >
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: colors.textMuted,
                  fontWeight: 600,
                  verticalAlign: 'top',
                }}>
                  <DiagramTooltip content={row.categoryTooltipRu}>
                    <span style={{ borderBottom: '1px dotted rgba(255,255,255,0.3)', cursor: 'help' }}>{row.category}</span>
                  </DiagramTooltip>
                </td>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: row.opAdvantage ? '#10b981' : colors.text,
                  verticalAlign: 'top',
                }}>
                  <DiagramTooltip content={row.opTooltip}>
                    <span style={{ cursor: 'help' }}>{row.optimism}</span>
                  </DiagramTooltip>
                </td>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: row.arbAdvantage ? '#10b981' : colors.text,
                  verticalAlign: 'top',
                }}>
                  <DiagramTooltip content={row.arbTooltip}>
                    <span style={{ cursor: 'help' }}>{row.arbitrum}</span>
                  </DiagramTooltip>
                </td>
              </tr>
            ))}
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
