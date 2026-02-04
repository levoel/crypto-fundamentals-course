/**
 * Ethereum Diagrams - State Trie, EVM, Account Model
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip as Tooltip } from '@primitives/Tooltip';

export function AccountModelDiagram() {
  return (
    <DiagramContainer title="Ethereum Account Model">
      <div className="flex gap-8 justify-center">
        {/* EOA */}
        <Tooltip content={
          <div>
            <strong className="text-blue-300">Externally Owned Account (EOA)</strong>
            <p className="mt-2">Контролируется private key. Может инициировать транзакции.</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>• <span className="text-gray-400">nonce:</span> счётчик транзакций</li>
              <li>• <span className="text-gray-400">balance:</span> ETH баланс</li>
              <li>• <span className="text-gray-400">codeHash:</span> EMPTY</li>
              <li>• <span className="text-gray-400">storageRoot:</span> EMPTY</li>
            </ul>
          </div>
        }>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 cursor-help w-48">
            <div className="text-blue-300 font-bold text-center mb-3">EOA</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">nonce</span>
                <span className="text-white font-mono">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">balance</span>
                <span className="text-white font-mono">1.5 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">code</span>
                <span className="text-gray-500">∅</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">storage</span>
                <span className="text-gray-500">∅</span>
              </div>
            </div>
          </div>
        </Tooltip>

        {/* Contract */}
        <Tooltip content={
          <div>
            <strong className="text-purple-300">Contract Account</strong>
            <p className="mt-2">Контролируется кодом. Не может инициировать транзакции самостоятельно.</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>• <span className="text-gray-400">nonce:</span> счётчик созданных контрактов</li>
              <li>• <span className="text-gray-400">balance:</span> ETH баланс контракта</li>
              <li>• <span className="text-gray-400">codeHash:</span> keccak256(bytecode)</li>
              <li>• <span className="text-gray-400">storageRoot:</span> корень storage trie</li>
            </ul>
          </div>
        }>
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 cursor-help w-48">
            <div className="text-purple-300 font-bold text-center mb-3">Contract</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">nonce</span>
                <span className="text-white font-mono">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">balance</span>
                <span className="text-white font-mono">0 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">code</span>
                <span className="text-purple-400 font-mono">0x3f2b...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">storage</span>
                <span className="text-purple-400 font-mono">0x8a9c...</span>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function EVMExecutionDiagram() {
  return (
    <DiagramContainer title="EVM Execution Model">
      <div className="flex items-center gap-6">
        {/* Transaction */}
        <Tooltip content={
          <div>
            <strong className="text-blue-300">Transaction</strong>
            <p className="mt-2">Входящая транзакция с calldata (encoded function call).</p>
          </div>
        }>
          <FlowNode type="input" className="cursor-help">
            <div className="text-center">
              <div className="text-blue-300 font-bold">TX</div>
              <div className="text-xs text-gray-400">calldata</div>
            </div>
          </FlowNode>
        </Tooltip>

        <Arrow direction="right" />

        {/* EVM */}
        <Tooltip content={
          <div>
            <strong className="text-amber-300">Ethereum Virtual Machine</strong>
            <p className="mt-2">Stack-based VM, 256-bit слова. Каждая операция потребляет gas.</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>• <span className="text-gray-400">Stack:</span> max 1024 elements</li>
              <li>• <span className="text-gray-400">Memory:</span> byte-addressable</li>
              <li>• <span className="text-gray-400">Storage:</span> persistent key-value</li>
            </ul>
          </div>
        }>
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 cursor-help">
            <div className="text-amber-300 font-bold text-center">EVM</div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="bg-amber-900/50 rounded px-2 py-1">Stack</div>
              <div className="bg-amber-900/50 rounded px-2 py-1">Memory</div>
              <div className="bg-amber-900/50 rounded px-2 py-1">Storage</div>
            </div>
          </div>
        </Tooltip>

        <Arrow direction="right" />

        {/* State Changes */}
        <Tooltip content={
          <div>
            <strong className="text-green-300">State Transition</strong>
            <p className="mt-2">Результат выполнения:</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>• Изменения в World State</li>
              <li>• Event logs (для indexing)</li>
              <li>• Return data</li>
            </ul>
          </div>
        }>
          <FlowNode type="output" className="cursor-help">
            <div className="text-center">
              <div className="text-green-300 font-bold">State</div>
              <div className="text-xs text-gray-400">changes</div>
            </div>
          </FlowNode>
        </Tooltip>

        <Arrow direction="right" />

        {/* Receipt */}
        <Tooltip content={
          <div>
            <strong className="text-purple-300">Transaction Receipt</strong>
            <p className="mt-2">Подтверждение выполнения:</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>• <span className="text-gray-400">status:</span> success/revert</li>
              <li>• <span className="text-gray-400">gasUsed:</span> фактический gas</li>
              <li>• <span className="text-gray-400">logs:</span> emitted events</li>
            </ul>
          </div>
        }>
          <FlowNode type="database" className="cursor-help">
            <div className="text-center">
              <div className="text-purple-300 font-bold">Receipt</div>
              <div className="text-xs text-gray-400">logs</div>
            </div>
          </FlowNode>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function StateTrieDiagram() {
  return (
    <DiagramContainer title="State Trie Structure" color="green">
      <div className="flex flex-col items-center gap-3">
        {/* Root */}
        <Tooltip content={
          <div>
            <strong className="text-green-300">State Root</strong>
            <p className="mt-2">32-байтный Merkle root всего World State. Записывается в Block Header.</p>
            <p className="mt-1 text-gray-400 text-xs">Позволяет верифицировать любой account state</p>
          </div>
        }>
          <div className="bg-green-500/30 border border-green-500/50 rounded-lg px-6 py-2 cursor-help">
            <div className="text-green-300 font-bold text-center">State Root</div>
          </div>
        </Tooltip>

        <Arrow direction="down" />

        {/* Level 1 - Extensions */}
        <div className="flex gap-24">
          <Tooltip content={
            <div>
              <strong className="text-blue-300">Extension Node</strong>
              <p className="mt-2">Сжимает общий prefix для группы адресов.</p>
              <p className="mt-1 text-gray-400 text-xs">Оптимизация: экономит место в trie</p>
            </div>
          }>
            <div className="bg-blue-900/50 rounded px-4 py-1 text-sm cursor-help">
              <div className="text-blue-300">[0x1...]</div>
              <div className="text-xs text-gray-500">Extension</div>
            </div>
          </Tooltip>
          <Tooltip content={
            <div>
              <strong className="text-blue-300">Extension Node</strong>
              <p className="mt-2">Shared prefix: 0xa...</p>
            </div>
          }>
            <div className="bg-blue-900/50 rounded px-4 py-1 text-sm cursor-help">
              <div className="text-blue-300">[0xa...]</div>
              <div className="text-xs text-gray-500">Extension</div>
            </div>
          </Tooltip>
        </div>

        <div className="flex gap-24">
          <Arrow direction="down" />
          <Arrow direction="down" />
        </div>

        {/* Level 2 - Branches */}
        <div className="flex gap-8">
          <Tooltip content={
            <div>
              <strong className="text-amber-300">Branch Node</strong>
              <p className="mt-2">16 children (hex digits 0-f) + value slot</p>
            </div>
          }>
            <div className="bg-amber-900/50 rounded px-3 py-1 text-xs cursor-help">[0x1a]</div>
          </Tooltip>
          <Tooltip content={<div><strong>Branch Node</strong></div>}>
            <div className="bg-amber-900/50 rounded px-3 py-1 text-xs cursor-help">[0x1f]</div>
          </Tooltip>
          <Tooltip content={<div><strong>Branch Node</strong></div>}>
            <div className="bg-amber-900/50 rounded px-3 py-1 text-xs cursor-help">[0xab]</div>
          </Tooltip>
          <Tooltip content={<div><strong>Branch Node</strong></div>}>
            <div className="bg-amber-900/50 rounded px-3 py-1 text-xs cursor-help">[0xac]</div>
          </Tooltip>
        </div>

        <div className="flex gap-8">
          <Arrow direction="down" />
          <Arrow direction="down" />
          <Arrow direction="down" />
          <Arrow direction="down" />
        </div>

        {/* Level 3 - Leaves (Accounts) */}
        <div className="flex gap-4">
          {['Account 1', 'Account 2', 'Account 3', 'Account 4'].map((acc, i) => (
            <Tooltip key={acc} content={
              <div>
                <strong className="text-purple-300">Leaf Node</strong>
                <p className="mt-2">RLP-encoded Account data:</p>
                <ul className="mt-1 text-xs space-y-1">
                  <li>• nonce</li>
                  <li>• balance</li>
                  <li>• storageRoot</li>
                  <li>• codeHash</li>
                </ul>
              </div>
            }>
              <div className="bg-purple-900/30 border border-purple-500/30 rounded px-3 py-2 text-xs cursor-help text-purple-300">
                {acc}
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}

export function TransactionFlowDiagram() {
  const steps = [
    { num: 1, label: 'Sign TX', desc: 'User signs transaction with private key' },
    { num: 2, label: 'Broadcast', desc: 'Transaction sent to mempool via P2P' },
    { num: 3, label: 'Selection', desc: 'Validator selects transactions by fee' },
    { num: 4, label: 'Execute', desc: 'EVM executes transaction code' },
    { num: 5, label: 'State Update', desc: 'World State transitions applied' },
    { num: 6, label: 'Receipt', desc: 'Receipt generated with logs and status' },
    { num: 7, label: 'Finalize', desc: 'Block finalized on chain' },
  ];

  return (
    <DiagramContainer title="Transaction Flow" color="blue">
      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center">
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Step {step.num}: {step.label}</strong>
                <p className="mt-2">{step.desc}</p>
              </div>
            }>
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg px-3 py-2 cursor-help text-center min-w-[80px]">
                <div className="text-blue-300 font-bold text-xs">{step.num}</div>
                <div className="text-white text-xs mt-1">{step.label}</div>
              </div>
            </Tooltip>
            {i < steps.length - 1 && (
              <Arrow direction="right" className="mx-1" />
            )}
          </div>
        ))}
      </div>
    </DiagramContainer>
  );
}

export function ProxyPatternDiagram() {
  return (
    <DiagramContainer title="Proxy Pattern (UUPS/Transparent)" color="purple">
      <div className="flex flex-col gap-4">
        {/* Main flow */}
        <div className="flex items-center justify-center gap-4">
          <Tooltip content={
            <div>
              <strong className="text-blue-300">User Transaction</strong>
              <p className="mt-2">Пользователь отправляет TX на адрес Proxy контракта.</p>
            </div>
          }>
            <FlowNode variant="external" className="cursor-help">
              <div className="text-center">
                <div className="font-bold">User</div>
                <div className="text-xs text-gray-400">TX</div>
              </div>
            </FlowNode>
          </Tooltip>

          <Arrow direction="right" />

          <Tooltip content={
            <div>
              <strong className="text-purple-300">Proxy Contract</strong>
              <p className="mt-2">Хранит storage (данные). Перенаправляет все вызовы в Implementation через delegatecall.</p>
              <p className="mt-1 text-gray-400 text-xs">Адрес Implementation хранится в специальном слоте (EIP-1967)</p>
            </div>
          }>
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 cursor-help">
              <div className="text-purple-300 font-bold text-center">Proxy</div>
              <div className="text-xs text-gray-400 mt-2">
                <div>storage: here</div>
                <div className="font-mono mt-1">impl: 0x...</div>
              </div>
            </div>
          </Tooltip>

          <div className="flex flex-col items-center">
            <Arrow direction="right" />
            <span className="text-xs text-amber-400 font-mono">delegatecall</span>
          </div>

          <Tooltip content={
            <div>
              <strong className="text-green-300">Implementation Contract</strong>
              <p className="mt-2">Содержит логику (код). Выполняется в контексте Proxy — storage изменяется в Proxy.</p>
              <p className="mt-1 text-gray-400 text-xs">Можно обновить, изменив адрес в Proxy</p>
            </div>
          }>
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 cursor-help">
              <div className="text-green-300 font-bold text-center">Implementation</div>
              <div className="text-xs text-gray-400 mt-2">
                <div>logic: here</div>
                <div className="mt-1">functions()</div>
              </div>
            </div>
          </Tooltip>
        </div>

        {/* Note */}
        <Tooltip content={
          <div>
            <strong>delegatecall</strong>
            <p className="mt-2">Выполняет код Implementation, но:</p>
            <ul className="mt-1 text-xs space-y-1">
              <li>• msg.sender сохраняется (User)</li>
              <li>• storage модифицируется в Proxy</li>
              <li>• address(this) = адрес Proxy</li>
            </ul>
          </div>
        }>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 text-center cursor-help">
            <span className="text-amber-300 text-sm">Logic executes in Proxy context → Storage changes in Proxy</span>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function EIP1559FeeDiagram() {
  return (
    <DiagramContainer title="EIP-1559 Fee Structure" color="rose">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-4">
          <Tooltip content={
            <div>
              <strong className="text-amber-300">Max Fee</strong>
              <p className="mt-2">Максимум, который пользователь готов заплатить per gas unit.</p>
              <p className="mt-1 text-gray-400 text-xs">max_fee = max_priority_fee + base_fee (max)</p>
            </div>
          }>
            <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3 cursor-help text-center">
              <div className="text-amber-300 font-bold text-sm">Max Fee</div>
              <div className="text-white font-mono text-sm mt-1">50 gwei</div>
            </div>
          </Tooltip>

          <span className="text-gray-500">=</span>

          <div className="flex flex-col gap-2">
            <Tooltip content={
              <div>
                <strong className="text-green-300">Priority Fee (Tip)</strong>
                <p className="mt-2">Чаевые validator'у за включение транзакции.</p>
                <p className="mt-1 text-gray-400 text-xs">Идёт validator'у напрямую</p>
              </div>
            }>
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 cursor-help">
                <div className="text-green-300 text-xs">Priority Fee</div>
                <div className="text-green-400 text-xs">→ Validator</div>
              </div>
            </Tooltip>
            <Tooltip content={
              <div>
                <strong className="text-rose-300">Base Fee</strong>
                <p className="mt-2">Минимальная цена gas. Определяется протоколом, СЖИГАЕТСЯ.</p>
                <p className="mt-1 text-gray-400 text-xs">±12.5% per block based on utilization</p>
              </div>
            }>
              <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg px-4 py-2 cursor-help">
                <div className="text-rose-300 text-xs">Base Fee</div>
                <div className="text-rose-400 text-xs">🔥 Burned</div>
              </div>
            </Tooltip>
          </div>

          <Arrow direction="right" />

          <Tooltip content={
            <div>
              <strong className="text-blue-300">Actual Fee</strong>
              <p className="mt-2">Реальная стоимость = gas_used × (base_fee + priority_fee)</p>
              <p className="mt-1 text-gray-400 text-xs">Разница (max_fee - actual) возвращается</p>
            </div>
          }>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 cursor-help text-center">
              <div className="text-blue-300 font-bold text-sm">Actual</div>
              <div className="text-white font-mono text-sm mt-1">32 gwei</div>
              <div className="text-xs text-gray-500 mt-1">refund: 18 gwei</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function GasModelDiagram() {
  return (
    <DiagramContainer title="EIP-1559 Gas Model">
      <div className="flex flex-col gap-6">
        {/* Fee Breakdown */}
        <div className="flex gap-4 justify-center">
          <Tooltip content={
            <div>
              <strong className="text-rose-300">Base Fee</strong>
              <p className="mt-2">Минимальная цена gas, определяемая протоколом. СЖИГАЕТСЯ (burned).</p>
              <p className="mt-1 text-gray-400 text-xs">Увеличивается/уменьшается на ±12.5% в зависимости от заполненности блока</p>
            </div>
          }>
            <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-4 cursor-help text-center">
              <div className="text-rose-300 font-bold">Base Fee</div>
              <div className="text-white font-mono mt-2">~30 gwei</div>
              <div className="text-xs text-rose-400 mt-1">🔥 Burned</div>
            </div>
          </Tooltip>

          <div className="text-2xl text-gray-500 self-center">+</div>

          <Tooltip content={
            <div>
              <strong className="text-green-300">Priority Fee (Tip)</strong>
              <p className="mt-2">Чаевые для validator'а. Стимулирует включение транзакции.</p>
              <p className="mt-1 text-gray-400 text-xs">Высокий tip = приоритетное включение</p>
            </div>
          }>
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 cursor-help text-center">
              <div className="text-green-300 font-bold">Priority Fee</div>
              <div className="text-white font-mono mt-2">~2 gwei</div>
              <div className="text-xs text-green-400 mt-1">→ Validator</div>
            </div>
          </Tooltip>

          <div className="text-2xl text-gray-500 self-center">=</div>

          <Tooltip content={
            <div>
              <strong className="text-blue-300">Total Fee</strong>
              <p className="mt-2">Общая стоимость транзакции:</p>
              <code className="block mt-1 bg-black/50 p-2 rounded text-xs">
                gas_used × (base_fee + priority_fee)
              </code>
            </div>
          }>
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 cursor-help text-center">
              <div className="text-blue-300 font-bold">Total</div>
              <div className="text-white font-mono mt-2">~32 gwei</div>
              <div className="text-xs text-gray-400 mt-1">per gas unit</div>
            </div>
          </Tooltip>
        </div>

        {/* Example calculation */}
        <Tooltip content={
          <div>
            <strong>Пример расчёта</strong>
            <p className="mt-2">Для простого ETH transfer (21,000 gas):</p>
            <code className="block mt-1 bg-black/50 p-2 rounded text-xs">
              21,000 × 32 gwei = 672,000 gwei = 0.000672 ETH
            </code>
            <p className="mt-1 text-gray-400 text-xs">≈ $1.50 при ETH = $2,500</p>
          </div>
        }>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-center cursor-help">
            <span className="text-gray-400 text-sm">Simple transfer: </span>
            <span className="text-white font-mono">21,000 gas × 32 gwei = 0.000672 ETH</span>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}
