/**
 * Layer 2 Diagrams - Rollup architecture, scaling comparison
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip as Tooltip } from '@primitives/Tooltip';
import { SequenceDiagram } from '@primitives/SequenceDiagram';
import type { SequenceActorDef, SequenceMessageDef } from '@primitives/types';

export function RollupArchitectureDiagram() {
  return (
    <DiagramContainer title="Rollup Architecture">
      <div className="flex flex-col gap-6">
        {/* L2 Layer */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="text-purple-300 font-bold mb-4 text-center">Layer 2</div>
          <div className="flex items-center gap-6 justify-center">
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Users</strong>
                <p className="mt-2">Пользователи отправляют транзакции на L2. Быстрее и дешевле, чем на L1.</p>
              </div>
            }>
              <FlowNode type="input" className="cursor-help">
                <div className="text-center">
                  <div className="text-blue-300">Users</div>
                  <div className="text-xs text-gray-400">TXs</div>
                </div>
              </FlowNode>
            </Tooltip>

            <Arrow direction="right" />

            <Tooltip content={
              <div>
                <strong className="text-amber-300">Sequencer</strong>
                <p className="mt-2">Центральный оператор (пока):</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Принимает транзакции</li>
                  <li>• Упорядочивает (ordering)</li>
                  <li>• Выполняет off-chain</li>
                  <li>• Формирует batches</li>
                </ul>
                <p className="mt-2 text-gray-400 text-xs">⚠️ Централизован, но НЕ может украсть средства</p>
              </div>
            }>
              <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 cursor-help">
                <div className="text-amber-300 font-bold">Sequencer</div>
                <div className="text-xs text-gray-400 mt-1">order + execute</div>
              </div>
            </Tooltip>

            <Arrow direction="right" />

            <Tooltip content={
              <div>
                <strong className="text-green-300">Batch</strong>
                <p className="mt-2">Сжатый пакет транзакций для публикации на L1.</p>
                <p className="mt-1 text-gray-400 text-xs">Содержит: tx data + state root</p>
              </div>
            }>
              <FlowNode type="process" className="cursor-help">
                <div className="text-center">
                  <div className="text-green-300">Batch</div>
                  <div className="text-xs text-gray-400">compressed</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>
        </div>

        <Arrow direction="down" className="self-center" />

        {/* L1 Layer */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-blue-300 font-bold mb-4 text-center">Layer 1 (Ethereum)</div>
          <div className="flex items-center gap-6 justify-center">
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Rollup Contract</strong>
                <p className="mt-2">Smart contract на L1:</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Принимает batches</li>
                  <li>• Хранит state roots</li>
                  <li>• Обрабатывает withdrawals</li>
                  <li>• Verifies proofs (ZK) или fraud proofs (Optimistic)</li>
                </ul>
              </div>
            }>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 cursor-help">
                <div className="text-blue-300 font-bold">Rollup Contract</div>
                <div className="text-xs text-gray-400 mt-1">verify + store</div>
              </div>
            </Tooltip>

            <Arrow direction="right" />

            <Tooltip content={
              <div>
                <strong className="text-purple-300">Data Availability</strong>
                <p className="mt-2">Transaction data публикуется на L1:</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• Calldata (до EIP-4844)</li>
                  <li>• Blobs (после EIP-4844)</li>
                </ul>
                <p className="mt-2 text-gray-400 text-xs">Позволяет любому восстановить state</p>
              </div>
            }>
              <FlowNode type="database" className="cursor-help">
                <div className="text-center">
                  <div className="text-purple-300">DA</div>
                  <div className="text-xs text-gray-400">blobs</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function OptimisticVsZKDiagram() {
  return (
    <DiagramContainer title="Optimistic vs ZK Rollups">
      <div className="grid grid-cols-2 gap-6">
        {/* Optimistic */}
        <Tooltip content={
          <div>
            <strong className="text-amber-300">Optimistic Rollup</strong>
            <p className="mt-2">Предполагает валидность, проверяет при challenge:</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>✅ Проще реализовать</li>
              <li>✅ EVM-совместимость</li>
              <li>❌ 7-дневный withdrawal</li>
              <li>❌ Зависит от fraud proofs</li>
            </ul>
            <p className="mt-2 text-gray-400 text-xs">Примеры: Arbitrum, Optimism, Base</p>
          </div>
        }>
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 cursor-help">
            <div className="text-amber-300 font-bold text-center mb-3">Optimistic</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Validity</span>
                <span className="text-white">Assumed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Proof</span>
                <span className="text-white">Fraud proof</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Finality</span>
                <span className="text-amber-400">7 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">EVM</span>
                <span className="text-green-400">Native</span>
              </div>
            </div>
          </div>
        </Tooltip>

        {/* ZK */}
        <Tooltip content={
          <div>
            <strong className="text-purple-300">ZK Rollup</strong>
            <p className="mt-2">Доказывает валидность криптографически:</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>✅ Быстрый withdrawal</li>
              <li>✅ Математическая гарантия</li>
              <li>❌ Сложнее реализовать</li>
              <li>❌ Дорогой proof generation</li>
            </ul>
            <p className="mt-2 text-gray-400 text-xs">Примеры: zkSync, Polygon zkEVM, Scroll</p>
          </div>
        }>
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 cursor-help">
            <div className="text-purple-300 font-bold text-center mb-3">ZK Rollup</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Validity</span>
                <span className="text-white">Proven</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Proof</span>
                <span className="text-white">ZK-SNARK/STARK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Finality</span>
                <span className="text-green-400">Minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">EVM</span>
                <span className="text-amber-400">zkEVM</span>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function VerticalScalingDiagram() {
  return (
    <DiagramContainer title="Vertical Scaling" color="amber">
      <div className="flex flex-col gap-3">
        <div className="text-center text-gray-400 text-sm mb-2">Trade-offs</div>
        <div className="space-y-2">
          <Tooltip content={<div><strong>Bigger blocks</strong><p className="mt-1">Больше транзакций per block, но дольше propagation</p></div>}>
            <div className="bg-amber-500/20 border border-amber-500/50 rounded px-4 py-2 cursor-help text-center">
              <span className="text-amber-300">↑ Bigger blocks</span>
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>Faster blocks</strong><p className="mt-1">Меньше latency, но больше orphan blocks</p></div>}>
            <div className="bg-amber-500/20 border border-amber-500/50 rounded px-4 py-2 cursor-help text-center">
              <span className="text-amber-300">↑ Faster blocks</span>
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>Powerful nodes</strong><p className="mt-1">Больше throughput, но меньше decentralization</p></div>}>
            <div className="bg-amber-500/20 border border-amber-500/50 rounded px-4 py-2 cursor-help text-center">
              <span className="text-amber-300">↑ More powerful nodes</span>
            </div>
          </Tooltip>
        </div>
        <div className="border-t border-gray-700 mt-2 pt-2 space-y-1 text-sm">
          <div className="text-rose-400">❌ Reduces decentralization</div>
          <div className="text-rose-400">❌ State grows faster</div>
          <div className="text-rose-400">❌ Higher node requirements</div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function ShardingDiagram() {
  return (
    <DiagramContainer title="Sharding (Danksharding)" color="blue">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <Tooltip content={<div><strong>State splitting</strong><p className="mt-1">Разделение данных на независимые части</p></div>}>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded px-4 py-2 cursor-help text-center">
              Split state into multiple "shards"
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>Parallel processing</strong><p className="mt-1">Каждый shard обрабатывается независимо</p></div>}>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded px-4 py-2 cursor-help text-center">
              Each shard processed in parallel
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>Beacon chain</strong><p className="mt-1">Координация через consensus layer</p></div>}>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded px-4 py-2 cursor-help text-center">
              Cross-shard via beacon chain
            </div>
          </Tooltip>
        </div>
        <div className="border-t border-gray-700 mt-2 pt-2 space-y-1 text-sm">
          <div className="text-green-400">✅ Scales with number of shards</div>
          <div className="text-rose-400">❌ Cross-shard txs complex</div>
          <div className="text-rose-400">❌ Implementation challenging</div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function L2SolutionsDiagram() {
  return (
    <DiagramContainer title="Layer 2 Solutions" color="green">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <Tooltip content={<div><strong>Off-chain execution</strong><p className="mt-1">Транзакции выполняются вне L1, результаты публикуются</p></div>}>
            <div className="bg-green-500/20 border border-green-500/50 rounded px-4 py-2 cursor-help text-center">
              Execute transactions off-chain
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>Proofs on L1</strong><p className="mt-1">Fraud proofs (Optimistic) или validity proofs (ZK)</p></div>}>
            <div className="bg-green-500/20 border border-green-500/50 rounded px-4 py-2 cursor-help text-center">
              Post proofs/data to L1
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>Security inheritance</strong><p className="mt-1">L2 наследует security от Ethereum</p></div>}>
            <div className="bg-green-500/20 border border-green-500/50 rounded px-4 py-2 cursor-help text-center">
              Inherit L1 security guarantees
            </div>
          </Tooltip>
        </div>
        <div className="border-t border-gray-700 mt-2 pt-2 space-y-1 text-sm">
          <div className="text-green-400">✅ Doesn't change L1</div>
          <div className="text-green-400">✅ Multiple L2s in parallel</div>
          <div className="text-green-400">✅ Different trade-offs per L2</div>
          <div className="text-amber-400">⚠️ Composability between L2s limited</div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function InteractiveBisectionDiagram() {
  const rounds = [
    { range: '0-1000', desc: 'Sequencer claims state after instruction 500' },
    { range: '0-500', desc: 'Narrowed to first half' },
    { range: '250-500', desc: 'Narrowed to 250 instructions' },
    { range: '375-500', desc: 'Narrowed to 125 instructions' },
    { range: '...', desc: 'Continue bisection...' },
    { range: '1 instr', desc: 'Execute on L1, determine winner' },
  ];

  return (
    <DiagramContainer title="Interactive Bisection Protocol" color="purple">
      <div className="space-y-2">
        {rounds.map((round, i) => (
          <Tooltip key={i} content={<div><strong>Round {i + 1}</strong><p className="mt-1">{round.desc}</p></div>}>
            <div className={`flex items-center gap-3 cursor-help ${i === rounds.length - 1 ? 'bg-green-500/20 border-green-500/50' : 'bg-purple-500/20 border-purple-500/50'} border rounded px-3 py-1`}>
              <span className="text-gray-400 text-xs w-16">Round {i + 1}</span>
              <span className={`font-mono text-sm ${i === rounds.length - 1 ? 'text-green-300' : 'text-purple-300'}`}>{round.range}</span>
              {i < rounds.length - 1 && <Arrow direction="right" className="ml-auto" />}
            </div>
          </Tooltip>
        ))}
        <div className="text-center text-gray-400 text-xs mt-2">
          Complexity: O(log n) rounds instead of O(n) execution
        </div>
      </div>
    </DiagramContainer>
  );
}

export function WithdrawalFlowDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'user',
      label: 'User',
      variant: 'external',
      tooltip: 'Пользователь, который хочет вывести средства с L2 на L1.',
    },
    {
      id: 'l2',
      label: 'L2 Sequencer',
      variant: 'service',
      tooltip: 'Обрабатывает транзакции на Layer 2 и формирует батчи для отправки на L1.',
    },
    {
      id: 'l1inbox',
      label: 'L1 Inbox',
      variant: 'queue',
      tooltip: 'Smart contract на Ethereum, принимающий батчи от sequencer.',
    },
    {
      id: 'l1contract',
      label: 'Rollup Contract',
      variant: 'database',
      tooltip: 'Главный контракт rollup на L1. Хранит state roots и обрабатывает withdrawals.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'user',
      to: 'l2',
      label: 'Initiate withdrawal',
      variant: 'sync',
      tooltip: 'Пользователь отправляет транзакцию вывода на L2. Средства блокируются.',
    },
    {
      id: 'msg2',
      from: 'l2',
      to: 'l1inbox',
      label: 'Post batch',
      variant: 'async',
      tooltip: 'Sequencer включает withdrawal в batch и отправляет на L1.',
    },
    {
      id: 'msg3',
      from: 'l1inbox',
      to: 'l1contract',
      label: 'State root + data',
      variant: 'sync',
      tooltip: 'Батч записывается в контракт. Начинается 7-дневный challenge period.',
    },
    {
      id: 'msg4',
      from: 'l1contract',
      to: 'l1contract',
      label: '7 day challenge',
      variant: 'async',
      tooltip: 'Период ожидания fraud proofs. Любой может оспорить невалидное состояние.',
    },
    {
      id: 'msg5',
      from: 'user',
      to: 'l1contract',
      label: 'Prove withdrawal',
      variant: 'sync',
      tooltip: 'После challenge period пользователь отправляет Merkle proof для withdrawal.',
    },
    {
      id: 'msg6',
      from: 'l1contract',
      to: 'user',
      label: 'ETH',
      variant: 'return',
      tooltip: 'Контракт проверяет proof и отправляет ETH на адрес пользователя.',
    },
  ];

  return (
    <DiagramContainer title="Optimistic Rollup Withdrawal Flow" color="rose">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={45}
      />
      <div className="mt-4 pt-3 border-t border-gray-700">
        <Tooltip content={<div><strong>Alternative: Bridge</strong><p className="mt-1">Liquidity providers дают instant withdrawal, сами ждут 7 дней</p></div>}>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 text-center cursor-help">
            <span className="text-green-300 text-sm">Alternative: Use bridge for instant withdrawal</span>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function ZkEVMSpectrumDiagram() {
  const types = [
    {
      type: 'Type 1',
      name: 'Ethereum-equivalent',
      desc: 'Proves actual Ethereum blocks',
      examples: '(in development)',
      bgClass: 'bg-blue-500/20 border-blue-500/50',
      textClass: 'text-blue-300',
    },
    {
      type: 'Type 2',
      name: 'EVM-equivalent',
      desc: '100% Solidity compatible',
      examples: 'Scroll, Polygon zkEVM',
      bgClass: 'bg-green-500/20 border-green-500/50',
      textClass: 'text-green-300',
    },
    {
      type: 'Type 2.5',
      name: 'EVM except gas',
      desc: 'Different gas costs for some opcodes',
      examples: 'Scroll (current)',
      bgClass: 'bg-teal-500/20 border-teal-500/50',
      textClass: 'text-teal-300',
    },
    {
      type: 'Type 3',
      name: 'Almost EVM',
      desc: 'Most contracts work, some edge cases differ',
      examples: '(transitional)',
      bgClass: 'bg-amber-500/20 border-amber-500/50',
      textClass: 'text-amber-300',
    },
    {
      type: 'Type 4',
      name: 'Language-equivalent',
      desc: 'Compiles to ZK-friendly VM',
      examples: 'zkSync Era, StarkNet',
      bgClass: 'bg-purple-500/20 border-purple-500/50',
      textClass: 'text-purple-300',
    },
  ];

  return (
    <DiagramContainer title="zkEVM Type Spectrum" color="purple">
      <div className="space-y-2">
        {types.map((t) => (
          <Tooltip key={t.type} content={<div><strong>{t.type}: {t.name}</strong><p className="mt-1">{t.desc}</p><p className="mt-1 text-gray-400 text-xs">Examples: {t.examples}</p></div>}>
            <div className={`${t.bgClass} border rounded px-4 py-2 cursor-help flex justify-between items-center`}>
              <span className={`${t.textClass} font-bold text-sm`}>{t.type}</span>
              <span className="text-gray-300 text-sm">{t.name}</span>
            </div>
          </Tooltip>
        ))}
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
          <span>← More compatible</span>
          <span>Faster proofs →</span>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function DataWithholdingDiagram() {
  return (
    <DiagramContainer title="Data Withholding Attack" color="rose">
      <div className="space-y-3">
        <Tooltip content={<div><strong>Malicious Sequencer</strong><p className="mt-1">Публикует state root, но скрывает данные транзакций</p></div>}>
          <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-3 cursor-help">
            <div className="text-rose-300 font-bold text-center mb-2">Malicious Sequencer</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">1.</span>
                <span>Execute: Alice → Bob 100 ETH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">2.</span>
                <span>Post state root to L1 ✓</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">3.</span>
                <span className="text-rose-400">DON'T post transaction data ✗</span>
              </div>
            </div>
          </div>
        </Tooltip>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <div className="text-gray-400 font-bold text-center mb-2">Result</div>
          <div className="space-y-1 text-sm">
            <div className="text-gray-300">• L1 knows new state root</div>
            <div className="text-rose-400">• Nobody can verify it's correct</div>
            <div className="text-rose-400">• Alice can't prove she still has funds</div>
            <div className="text-rose-400">• Validators can't generate fraud proof</div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function DankshardingDiagram() {
  return (
    <DiagramContainer title="Full Danksharding (Future)" color="blue">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Tooltip content={<div><strong>Current (EIP-4844)</strong><p className="mt-1">All nodes download all blobs</p></div>}>
            <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 cursor-help">
              <div className="text-gray-300 font-bold text-center text-sm mb-2">Current</div>
              <div className="text-xs space-y-1">
                <div>• 6 blobs max per block</div>
                <div>• All nodes download all</div>
                <div>• ~768 KB/block</div>
              </div>
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>Full Danksharding</strong><p className="mt-1">Data Availability Sampling - nodes sample random chunks</p></div>}>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 cursor-help">
              <div className="text-blue-300 font-bold text-center text-sm mb-2">Danksharding</div>
              <div className="text-xs space-y-1">
                <div>• 64+ blobs per block</div>
                <div>• Data Availability Sampling</div>
                <div>• ~16 MB/block</div>
              </div>
            </div>
          </Tooltip>
        </div>
        <Tooltip content={<div><strong>DAS</strong><p className="mt-1">Nodes sample random blob chunks. Erasure coding allows reconstruction from 50% of data.</p></div>}>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 text-center cursor-help">
            <span className="text-green-300 text-sm">DAS: No node needs ALL data, probabilistic guarantee</span>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function BlockchainTrilemmaDiagram() {
  return (
    <DiagramContainer title="Blockchain Trilemma">
      <div className="flex justify-center">
        <Tooltip content={
          <div>
            <strong>Blockchain Trilemma</strong>
            <p className="mt-2">Невозможно одновременно максимизировать все три свойства:</p>
            <ul className="mt-2 text-xs space-y-2">
              <li><span className="text-blue-300">Decentralization:</span> много независимых валидаторов</li>
              <li><span className="text-green-300">Security:</span> устойчивость к атакам</li>
              <li><span className="text-amber-300">Scalability:</span> высокий throughput</li>
            </ul>
            <p className="mt-2 text-gray-400 text-xs">Layer 2 — способ обойти trilemma: inherit security от L1</p>
          </div>
        }>
          <svg viewBox="0 0 200 180" className="w-64 h-auto cursor-help">
            {/* Triangle */}
            <polygon
              points="100,10 10,170 190,170"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-600"
            />

            {/* Labels */}
            <text x="100" y="8" textAnchor="middle" className="text-xs fill-blue-300 font-bold">
              Decentralization
            </text>
            <text x="10" y="185" textAnchor="start" className="text-xs fill-green-300 font-bold">
              Security
            </text>
            <text x="190" y="185" textAnchor="end" className="text-xs fill-amber-300 font-bold">
              Scalability
            </text>

            {/* Bitcoin - D+S */}
            <circle cx="55" cy="90" r="8" className="fill-orange-500" />
            <text x="55" y="75" textAnchor="middle" className="text-xs fill-orange-300">BTC</text>

            {/* Ethereum - D+S (with L2 → +Scalability) */}
            <circle cx="75" cy="100" r="8" className="fill-blue-500" />
            <text x="75" y="85" textAnchor="middle" className="text-xs fill-blue-300">ETH</text>

            {/* Solana - S+Sc */}
            <circle cx="145" cy="140" r="8" className="fill-purple-500" />
            <text x="145" y="155" textAnchor="middle" className="text-xs fill-purple-300">SOL</text>

            {/* L2s - closer to center */}
            <circle cx="100" cy="110" r="6" className="fill-green-500" />
            <text x="100" y="125" textAnchor="middle" className="text-xs fill-green-300">L2</text>
          </svg>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function OptimisticRollupArchDiagram() {
  return (
    <DiagramContainer title="Optimistic Rollup Architecture" color="amber">
      <div className="flex flex-col gap-3">
        {/* L2 components */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="text-amber-300 font-bold text-xs mb-2 text-center">Layer 2 (Off-chain)</div>
          <div className="flex items-center justify-center gap-3">
            <Tooltip content={<div><strong>Users</strong><p className="mt-1">Submit transactions to sequencer</p></div>}>
              <FlowNode type="input" className="cursor-help">
                <div className="text-xs text-center">Users</div>
              </FlowNode>
            </Tooltip>
            <Arrow direction="right" />
            <Tooltip content={<div><strong>Sequencer</strong><p className="mt-1">Orders, executes, and batches transactions off-chain</p></div>}>
              <div className="bg-amber-500/30 border border-amber-500/50 rounded px-3 py-2 cursor-help">
                <div className="text-amber-300 font-bold text-xs">Sequencer</div>
                <div className="text-xs text-gray-400">Execute off-chain</div>
              </div>
            </Tooltip>
            <Arrow direction="right" />
            <Tooltip content={<div><strong>Batch</strong><p className="mt-1">State Root + Compressed TX Data</p></div>}>
              <div className="bg-gray-700/50 border border-gray-600 rounded px-3 py-2 cursor-help">
                <div className="text-xs">Batch</div>
                <div className="text-xs text-gray-500">state + data</div>
              </div>
            </Tooltip>
          </div>
        </div>

        <Arrow direction="down" className="self-center" />

        {/* L1 components */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-300 font-bold text-xs mb-2 text-center">Layer 1 (Ethereum)</div>
          <div className="flex items-center justify-center gap-3">
            <Tooltip content={<div><strong>L1 Inbox</strong><p className="mt-1">Receives batches and stores transaction data</p></div>}>
              <div className="bg-blue-500/30 border border-blue-500/50 rounded px-3 py-2 cursor-help">
                <div className="text-blue-300 font-bold text-xs">L1 Inbox</div>
              </div>
            </Tooltip>
            <Arrow direction="right" />
            <Tooltip content={<div><strong>7 Day Challenge</strong><p className="mt-1">Anyone can submit fraud proof during this period</p></div>}>
              <div className="bg-rose-500/20 border border-rose-500/50 rounded px-3 py-2 cursor-help">
                <div className="text-rose-300 text-xs">7 day challenge</div>
              </div>
            </Tooltip>
            <Arrow direction="right" />
            <Tooltip content={<div><strong>Finalized</strong><p className="mt-1">State is considered final after challenge period</p></div>}>
              <div className="bg-green-500/20 border border-green-500/50 rounded px-3 py-2 cursor-help">
                <div className="text-green-300 text-xs">Finalized</div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function ArbitrumArchitectureDiagram() {
  return (
    <DiagramContainer title="Arbitrum Architecture" color="blue">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Tooltip content={<div><strong>Sequencer</strong><p className="mt-1">Operated by Offchain Labs, orders transactions</p></div>}>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded p-2 cursor-help">
              <div className="text-blue-300 font-bold text-xs">Sequencer</div>
              <div className="text-xs text-gray-400">(Offchain Labs)</div>
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>ArbOS</strong><p className="mt-1">Modified Geth + custom precompiles</p></div>}>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded p-2 cursor-help">
              <div className="text-blue-300 font-bold text-xs">ArbOS</div>
              <div className="text-xs text-gray-400">(Geth + custom)</div>
            </div>
          </Tooltip>
        </div>

        <Arrow direction="down" className="self-center" />

        <Tooltip content={<div><strong>Rollup Protocol</strong><p className="mt-1">Inbox (batches), Outbox (withdrawals), RollupCore (state roots)</p></div>}>
          <div className="bg-purple-500/20 border border-purple-500/50 rounded p-2 cursor-help">
            <div className="text-purple-300 font-bold text-xs text-center">Rollup Protocol</div>
            <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
              <div className="bg-purple-900/30 rounded px-2 py-1 text-center">Inbox</div>
              <div className="bg-purple-900/30 rounded px-2 py-1 text-center">Outbox</div>
              <div className="bg-purple-900/30 rounded px-2 py-1 text-center">RollupCore</div>
            </div>
          </div>
        </Tooltip>

        <Arrow direction="down" className="self-center" />

        <div className="bg-gray-700/50 border border-gray-600 rounded p-2 text-center">
          <div className="text-xs">Ethereum L1</div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function OPStackDiagram() {
  return (
    <DiagramContainer title="OP Stack Architecture" color="rose">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Tooltip content={<div><strong>op-node</strong><p className="mt-1">Consensus client, derivation from L1</p></div>}>
            <div className="bg-rose-500/20 border border-rose-500/50 rounded p-2 cursor-help">
              <div className="text-rose-300 font-bold text-xs">op-node</div>
              <div className="text-xs text-gray-400">(consensus)</div>
            </div>
          </Tooltip>
          <Tooltip content={<div><strong>op-geth</strong><p className="mt-1">Execution client (modified Geth)</p></div>}>
            <div className="bg-rose-500/20 border border-rose-500/50 rounded p-2 cursor-help">
              <div className="text-rose-300 font-bold text-xs">op-geth</div>
              <div className="text-xs text-gray-400">(execution)</div>
            </div>
          </Tooltip>
        </div>

        <Arrow direction="down" className="self-center" />

        <Tooltip content={<div><strong>L1 Contracts (Bedrock)</strong><p className="mt-1">OptimismPortal, L2OutputOracle, SystemConfig</p></div>}>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded p-2 cursor-help">
            <div className="text-blue-300 font-bold text-xs text-center">L1 Contracts (Bedrock)</div>
            <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
              <div className="bg-blue-900/30 rounded px-1 py-1 text-center">Portal</div>
              <div className="bg-blue-900/30 rounded px-1 py-1 text-center">L2Output</div>
              <div className="bg-blue-900/30 rounded px-1 py-1 text-center">Config</div>
            </div>
          </div>
        </Tooltip>

        <Arrow direction="down" className="self-center" />

        <div className="bg-gray-700/50 border border-gray-600 rounded p-2 text-center">
          <div className="text-xs">Ethereum L1</div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
          <div className="text-green-300 text-xs font-bold">Superchain</div>
          <div className="text-xs text-gray-400">OP + Base + Zora + Mode + ...</div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function ZkRollupArchDiagram() {
  return (
    <DiagramContainer title="ZK Rollup Architecture" color="purple">
      <div className="flex flex-col gap-3">
        {/* L2 components */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-purple-300 font-bold text-xs mb-2 text-center">Layer 2 (Off-chain)</div>
          <div className="flex items-center justify-center gap-2">
            <Tooltip content={<div><strong>Users</strong><p className="mt-1">Submit transactions</p></div>}>
              <FlowNode type="input" className="cursor-help">
                <div className="text-xs">Users</div>
              </FlowNode>
            </Tooltip>
            <Arrow direction="right" />
            <Tooltip content={<div><strong>Sequencer</strong><p className="mt-1">Orders and batches transactions</p></div>}>
              <div className="bg-purple-500/30 border border-purple-500/50 rounded px-2 py-1 cursor-help">
                <div className="text-xs">Sequencer</div>
              </div>
            </Tooltip>
            <Arrow direction="right" />
            <Tooltip content={<div><strong>Prover</strong><p className="mt-1">Generates ZK proof (GPU-intensive)</p></div>}>
              <div className="bg-amber-500/30 border border-amber-500/50 rounded px-2 py-1 cursor-help">
                <div className="text-amber-300 text-xs font-bold">Prover</div>
                <div className="text-xs text-gray-400">ZK Proof</div>
              </div>
            </Tooltip>
          </div>
        </div>

        <Arrow direction="down" className="self-center" />

        {/* L1 components */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-300 font-bold text-xs mb-2 text-center">Layer 1 (Ethereum)</div>
          <div className="flex items-center justify-center gap-3">
            <Tooltip content={<div><strong>Verifier Contract</strong><p className="mt-1">Verifies ZK proof on-chain (O(1) time)</p></div>}>
              <div className="bg-blue-500/30 border border-blue-500/50 rounded px-3 py-2 cursor-help">
                <div className="text-blue-300 text-xs font-bold">Verifier</div>
                <div className="text-xs text-gray-400">O(1) verify</div>
              </div>
            </Tooltip>
            <Arrow direction="right" />
            <Tooltip content={<div><strong>State Finalized</strong><p className="mt-1">If proof valid, state immediately final (no challenge period)</p></div>}>
              <div className="bg-green-500/20 border border-green-500/50 rounded px-3 py-2 cursor-help">
                <div className="text-green-300 text-xs">Finalized</div>
                <div className="text-xs text-gray-400">(instant)</div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function ProverPipelineDiagram() {
  const stages = [
    { name: 'Execution Trace', desc: 'Every opcode, memory, storage access' },
    { name: 'Arithmetic Circuit', desc: 'Polynomial constraints (R1CS / AIR)' },
    { name: 'Prover', desc: 'Generate ZK-SNARK/STARK proof' },
  ];

  return (
    <DiagramContainer title="ZK Prover Pipeline" color="amber">
      <div className="flex flex-col gap-2">
        <Tooltip content={<div><strong>Input</strong><p className="mt-1">Batch of transactions to prove</p></div>}>
          <div className="bg-gray-700/50 border border-gray-600 rounded p-2 cursor-help text-center">
            <div className="text-xs">Transactions</div>
          </div>
        </Tooltip>

        {stages.map((stage) => (
          <div key={stage.name}>
            <Arrow direction="down" className="self-center mx-auto block" />
            <Tooltip content={<div><strong>{stage.name}</strong><p className="mt-1">{stage.desc}</p></div>}>
              <div className="bg-amber-500/20 border border-amber-500/50 rounded p-2 cursor-help">
                <div className="text-amber-300 font-bold text-xs text-center">{stage.name}</div>
                <div className="text-xs text-gray-400 text-center">{stage.desc}</div>
              </div>
            </Tooltip>
          </div>
        ))}

        <Arrow direction="down" className="self-center mx-auto block" />

        <div className="bg-green-500/20 border border-green-500/50 rounded p-2 text-center">
          <div className="text-green-300 font-bold text-xs">ZK Proof</div>
          <div className="text-xs text-gray-400">Submit to L1</div>
        </div>

        <div className="text-xs text-gray-500 text-center mt-1">
          Compute: GPU cluster, 100+ GB RAM, minutes-hours
        </div>
      </div>
    </DiagramContainer>
  );
}

export function ProofAggregationDiagram() {
  return (
    <DiagramContainer title="Proof Aggregation" color="green">
      <div className="flex items-center gap-3 justify-center">
        <div className="flex flex-col gap-1">
          {['Batch 1', 'Batch 2', 'Batch 3'].map((b) => (
            <div key={b} className="bg-gray-700/50 border border-gray-600 rounded px-2 py-1 text-xs text-center">{b}</div>
          ))}
        </div>
        <Arrow direction="right" />
        <div className="flex flex-col gap-1">
          {['Proof 1', 'Proof 2', 'Proof 3'].map((p) => (
            <div key={p} className="bg-purple-500/20 border border-purple-500/50 rounded px-2 py-1 text-xs text-center">{p}</div>
          ))}
        </div>
        <Arrow direction="right" />
        <Tooltip content={<div><strong>Aggregated Proof</strong><p className="mt-1">One L1 verification for multiple batches</p></div>}>
          <div className="bg-green-500/20 border border-green-500/50 rounded px-3 py-4 cursor-help text-center">
            <div className="text-green-300 font-bold text-xs">Aggregated</div>
            <div className="text-green-300 font-bold text-xs">Proof</div>
          </div>
        </Tooltip>
        <Arrow direction="right" />
        <div className="bg-blue-500/20 border border-blue-500/50 rounded px-2 py-1 text-xs">L1</div>
      </div>
      <div className="text-xs text-gray-400 text-center mt-2">
        Benefit: Amortizes L1 verification cost across batches
      </div>
    </DiagramContainer>
  );
}

export function StateChannelDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'alice',
      label: 'Alice',
      variant: 'external',
      tooltip: 'Участник A канала. Блокирует свои средства в контракте при открытии.',
    },
    {
      id: 'contract',
      label: 'Channel Contract',
      variant: 'database',
      tooltip: 'Smart contract на L1, который хранит заблокированные средства и разрешает споры.',
    },
    {
      id: 'bob',
      label: 'Bob',
      variant: 'external',
      tooltip: 'Участник B канала. Блокирует свои средства в контракте при открытии.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'alice',
      to: 'contract',
      label: 'Deposit 1 ETH',
      variant: 'sync',
      tooltip: 'Alice блокирует 1 ETH в контракте канала.',
    },
    {
      id: 'msg2',
      from: 'bob',
      to: 'contract',
      label: 'Deposit 1 ETH',
      variant: 'sync',
      tooltip: 'Bob блокирует 1 ETH в контракте канала. Канал открыт!',
    },
    {
      id: 'msg3',
      from: 'alice',
      to: 'bob',
      label: 'Signed state #1',
      variant: 'async',
      tooltip: 'Off-chain: Alice отправляет Bob подписанное состояние. Мгновенно и бесплатно!',
    },
    {
      id: 'msg4',
      from: 'bob',
      to: 'alice',
      label: 'Signed state #2',
      variant: 'async',
      tooltip: 'Off-chain: Bob отправляет обновленное состояние Alice.',
    },
    {
      id: 'msg5',
      from: 'alice',
      to: 'bob',
      label: 'Signed state #N',
      variant: 'async',
      tooltip: 'Множество off-chain транзакций без газа.',
    },
    {
      id: 'msg6',
      from: 'alice',
      to: 'contract',
      label: 'Close (final state)',
      variant: 'sync',
      tooltip: 'Любая сторона может закрыть канал, отправив последнее подписанное состояние.',
    },
    {
      id: 'msg7',
      from: 'contract',
      to: 'alice',
      label: '0.5 ETH',
      variant: 'return',
      tooltip: 'Контракт распределяет средства согласно финальному состоянию.',
    },
    {
      id: 'msg8',
      from: 'contract',
      to: 'bob',
      label: '1.5 ETH',
      variant: 'return',
      tooltip: 'Bob получает 1.5 ETH (1 + 0.5 от Alice).',
    },
  ];

  return (
    <DiagramContainer title="State Channel Flow" color="blue">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={40}
      />
      <div className="grid grid-cols-2 gap-2 text-xs mt-4 pt-3 border-t border-gray-700">
        <div className="text-green-400">✅ Instant finality, minimal fees</div>
        <div className="text-rose-400">❌ Both parties must be online</div>
      </div>
    </DiagramContainer>
  );
}

export function PlasmaDiagram() {
  return (
    <DiagramContainer title="Plasma Architecture" color="purple">
      <div className="flex flex-col gap-2">
        <div className="bg-blue-500/20 border border-blue-500/50 rounded p-2 text-center">
          <div className="text-blue-300 font-bold text-xs">L1 (Ethereum)</div>
        </div>

        <Arrow direction="down" className="self-center" />

        <Tooltip content={<div><strong>Plasma Contract</strong><p className="mt-1">Accepts merkle root commitments from child chain</p></div>}>
          <div className="bg-purple-500/20 border border-purple-500/50 rounded p-2 cursor-help text-center">
            <div className="text-purple-300 text-xs">Plasma Contract</div>
          </div>
        </Tooltip>

        <Arrow direction="down" className="self-center" />

        <Tooltip content={<div><strong>Plasma Chain</strong><p className="mt-1">Operator runs child chain, commits merkle roots</p></div>}>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 cursor-help">
            <div className="text-purple-300 font-bold text-xs text-center">Plasma Chain (operator)</div>
            <div className="flex gap-2 justify-center mt-2">
              <div className="bg-purple-900/30 rounded px-2 py-1 text-xs">Block [txs]</div>
              <div className="bg-purple-900/30 rounded px-2 py-1 text-xs">Block [txs]</div>
            </div>
          </div>
        </Tooltip>

        <Arrow direction="up" className="self-center" />

        <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 text-center">
          <div className="text-amber-300 text-xs">Merkle Root → L1</div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mt-1">
          <div className="text-green-400">✅ High throughput</div>
          <div className="text-rose-400">❌ Data availability issues</div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function CelestiaDiagram() {
  return (
    <DiagramContainer title="Celestia DA Layer" color="purple">
      <div className="flex flex-col gap-3">
        <Tooltip content={<div><strong>Purpose-built DA layer</strong><p className="mt-1">Only does data availability (no execution)</p></div>}>
          <div className="bg-purple-500/20 border border-purple-500/50 rounded p-3 cursor-help">
            <div className="text-purple-300 font-bold text-center">Celestia</div>
            <div className="text-xs text-gray-400 text-center mt-1">
              2D Reed-Solomon + Data Availability Sampling
            </div>
          </div>
        </Tooltip>

        <div className="flex items-center justify-center gap-3">
          <Tooltip content={<div><strong>Rollup Sequencer</strong><p className="mt-1">Posts data to Celestia instead of Ethereum</p></div>}>
            <div className="bg-amber-500/20 border border-amber-500/50 rounded px-3 py-2 cursor-help">
              <div className="text-amber-300 text-xs">Rollup</div>
            </div>
          </Tooltip>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">DA</span>
            <Arrow direction="right" />
          </div>
          <div className="bg-purple-500/30 border border-purple-500/50 rounded px-3 py-2">
            <div className="text-purple-300 text-xs">Celestia</div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">proof</span>
            <Arrow direction="right" />
          </div>
          <Tooltip content={<div><strong>Ethereum L1</strong><p className="mt-1">Settlement layer, only receives DA attestation</p></div>}>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded px-3 py-2 cursor-help">
              <div className="text-blue-300 text-xs">ETH L1</div>
            </div>
          </Tooltip>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-700/50 rounded p-2">
            <div className="text-gray-400">Security</div>
            <div className="text-amber-300">Celestia consensus</div>
          </div>
          <div className="bg-gray-700/50 rounded p-2">
            <div className="text-gray-400">Cost</div>
            <div className="text-green-300">~$0.001/KB</div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function EigenDADiagram() {
  return (
    <DiagramContainer title="EigenDA (Restaking)" color="blue">
      <div className="flex flex-col gap-3">
        <Tooltip content={<div><strong>EigenLayer Restaking</strong><p className="mt-1">Uses ETH validators who restake for additional yield</p></div>}>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded p-3 cursor-help">
            <div className="text-blue-300 font-bold text-center">EigenDA</div>
            <div className="text-xs text-gray-400 text-center mt-1">
              Restaked ETH validators
            </div>
          </div>
        </Tooltip>

        <div className="flex items-center justify-center gap-3">
          <div className="bg-amber-500/20 border border-amber-500/50 rounded px-3 py-2">
            <div className="text-amber-300 text-xs">Rollup</div>
          </div>
          <Arrow direction="right" />
          <div className="bg-blue-500/30 border border-blue-500/50 rounded px-3 py-2">
            <div className="text-blue-300 text-xs">EigenDA</div>
            <div className="text-xs text-gray-500">(restaked)</div>
          </div>
          <Arrow direction="right" />
          <div className="bg-blue-500/20 border border-blue-500/50 rounded px-3 py-2">
            <div className="text-blue-300 text-xs">ETH L1</div>
            <div className="text-xs text-gray-500">(proof)</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-700/50 rounded p-2">
            <div className="text-gray-400">Security</div>
            <div className="text-blue-300">Staked ETH economic security</div>
          </div>
          <div className="bg-gray-700/50 rounded p-2">
            <div className="text-gray-400">Cost</div>
            <div className="text-green-300">Competitive with blobs</div>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function ZKProofFlowDiagram() {
  const actors: SequenceActorDef[] = [
    {
      id: 'prover',
      label: 'Prover',
      variant: 'service',
      tooltip: 'Знает секрет x, хочет доказать f(x) = y не раскрывая x. Вычислительно затратный процесс (GPU кластеры).',
    },
    {
      id: 'verifier',
      label: 'Verifier',
      variant: 'database',
      tooltip: 'Проверяет доказательство не узнавая x. O(1) время верификации, ~500K gas on-chain.',
    },
  ];

  const messages: SequenceMessageDef[] = [
    {
      id: 'msg1',
      from: 'prover',
      to: 'verifier',
      label: 'Claim: "I know x"',
      variant: 'sync',
      tooltip: 'Prover заявляет, что знает x такой что f(x) = y.',
    },
    {
      id: 'msg2',
      from: 'prover',
      to: 'prover',
      label: 'Generate proof',
      variant: 'async',
      tooltip: 'Prover генерирует криптографическое доказательство. SNARK: ~200 bytes, STARK: ~50 KB.',
    },
    {
      id: 'msg3',
      from: 'prover',
      to: 'verifier',
      label: 'Proof π',
      variant: 'sync',
      tooltip: 'Криптографическое доказательство, которое не раскрывает x но доказывает знание.',
    },
    {
      id: 'msg4',
      from: 'verifier',
      to: 'verifier',
      label: 'Verify(π, y)',
      variant: 'async',
      tooltip: 'Verifier проверяет доказательство за O(1) время.',
    },
    {
      id: 'msg5',
      from: 'verifier',
      to: 'prover',
      label: 'true / false',
      variant: 'return',
      tooltip: 'Результат верификации. Verifier ничего не узнал о x.',
    },
  ];

  return (
    <DiagramContainer title="Zero-Knowledge Proof Flow" color="purple">
      <SequenceDiagram
        actors={actors}
        messages={messages}
        messageSpacing={50}
      />
      {/* Properties */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-700 text-xs">
        <Tooltip content={<div><strong>Completeness</strong><p className="mt-1">Honest prover always convinces verifier</p></div>}>
          <div className="bg-gray-700/50 rounded p-2 cursor-help text-center">
            <div className="text-green-300">Completeness</div>
            <div className="text-gray-400">Honest prover wins</div>
          </div>
        </Tooltip>
        <Tooltip content={<div><strong>Soundness</strong><p className="mt-1">Dishonest prover cannot deceive verifier</p></div>}>
          <div className="bg-gray-700/50 rounded p-2 cursor-help text-center">
            <div className="text-blue-300">Soundness</div>
            <div className="text-gray-400">Can't fake proof</div>
          </div>
        </Tooltip>
        <Tooltip content={<div><strong>Zero-Knowledge</strong><p className="mt-1">Verifier learns nothing except validity</p></div>}>
          <div className="bg-gray-700/50 rounded p-2 cursor-help text-center">
            <div className="text-purple-300">Zero-Knowledge</div>
            <div className="text-gray-400">x stays secret</div>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}
