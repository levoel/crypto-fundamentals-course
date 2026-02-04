/**
 * Bitcoin Diagrams - UTXO model, block structure, mining
 */

import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip as Tooltip } from '@primitives/Tooltip';

export function UTXODiagram() {
  return (
    <DiagramContainer title="UTXO Transaction Model">
      <div className="flex flex-col gap-8">
        {/* Input side */}
        <div className="flex items-center gap-4">
          <div className="text-gray-400 text-sm w-20">Inputs</div>
          <div className="flex flex-col gap-2">
            <Tooltip content={
              <div>
                <strong className="text-blue-300">UTXO (Unspent Transaction Output)</strong>
                <p className="mt-2">Неизрасходованный выход предыдущей транзакции. Каждый UTXO может быть потрачен только один раз целиком.</p>
                <p className="mt-1 text-gray-400 text-xs">Аналогия: купюра в кошельке — нельзя потратить "половину купюры"</p>
              </div>
            }>
              <FlowNode type="input" className="cursor-help">
                <div className="text-center">
                  <div className="text-blue-300 font-mono text-xs">UTXO #1</div>
                  <div className="text-white font-bold">0.5 BTC</div>
                </div>
              </FlowNode>
            </Tooltip>
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Второй Input</strong>
                <p className="mt-2">Транзакция может иметь несколько inputs — это объединение нескольких UTXO для формирования нужной суммы.</p>
              </div>
            }>
              <FlowNode type="input" className="cursor-help">
                <div className="text-center">
                  <div className="text-blue-300 font-mono text-xs">UTXO #2</div>
                  <div className="text-white font-bold">0.3 BTC</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>

          <Arrow direction="right" className="mx-4" />

          {/* Transaction */}
          <Tooltip content={
            <div>
              <strong className="text-amber-300">Transaction</strong>
              <p className="mt-2">Транзакция потребляет inputs (уничтожает UTXO) и создаёт outputs (новые UTXO).</p>
              <p className="mt-1 text-gray-400 text-xs">Sum(inputs) = Sum(outputs) + fee</p>
            </div>
          }>
            <FlowNode type="process" className="cursor-help">
              <div className="text-center">
                <div className="text-amber-300 font-bold">TX</div>
                <div className="text-xs text-gray-400">Transfer</div>
              </div>
            </FlowNode>
          </Tooltip>

          <Arrow direction="right" className="mx-4" />

          {/* Output side */}
          <div className="flex flex-col gap-2">
            <Tooltip content={
              <div>
                <strong className="text-green-300">Payment Output</strong>
                <p className="mt-2">Новый UTXO для получателя. Locked скриптом, который требует подпись получателя для траты.</p>
              </div>
            }>
              <FlowNode type="output" className="cursor-help">
                <div className="text-center">
                  <div className="text-green-300 font-mono text-xs">To: Recipient</div>
                  <div className="text-white font-bold">0.7 BTC</div>
                </div>
              </FlowNode>
            </Tooltip>
            <Tooltip content={
              <div>
                <strong className="text-purple-300">Change Output</strong>
                <p className="mt-2">Сдача — новый UTXO, возвращаемый отправителю. 0.8 - 0.7 - 0.001 (fee) = 0.099 BTC</p>
              </div>
            }>
              <FlowNode type="output" className="cursor-help">
                <div className="text-center">
                  <div className="text-purple-300 font-mono text-xs">Change</div>
                  <div className="text-white font-bold">0.099 BTC</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>
          <div className="text-gray-400 text-sm w-20 text-right">Outputs</div>
        </div>

        {/* Fee indicator */}
        <div className="flex justify-center">
          <Tooltip content={
            <div>
              <strong className="text-rose-300">Transaction Fee</strong>
              <p className="mt-2">Fee = Sum(inputs) - Sum(outputs)</p>
              <p className="mt-1">Майнер получает fee за включение транзакции в блок.</p>
            </div>
          }>
            <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg px-4 py-2 cursor-help">
              <div className="text-rose-300 text-sm">Fee: 0.001 BTC</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function BlockStructureDiagram() {
  return (
    <DiagramContainer title="Bitcoin Block Structure">
      <div className="flex flex-col items-center gap-4">
        {/* Block Header */}
        <Tooltip content={
          <div>
            <strong className="text-blue-300">Block Header (80 bytes)</strong>
            <p className="mt-2">Фиксированный размер заголовка. Содержит всю метаинформацию блока.</p>
            <ul className="mt-2 text-xs space-y-1">
              <li>• Version: версия протокола</li>
              <li>• Previous Hash: связь с предыдущим блоком</li>
              <li>• Merkle Root: корень дерева транзакций</li>
              <li>• Timestamp: время создания</li>
              <li>• Bits: текущая сложность</li>
              <li>• Nonce: для Proof of Work</li>
            </ul>
          </div>
        }>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 cursor-help">
            <div className="text-blue-300 font-bold mb-2">Block Header</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-900/50 rounded p-2">Version</div>
              <div className="bg-blue-900/50 rounded p-2 col-span-2">Prev Block Hash</div>
              <div className="bg-blue-900/50 rounded p-2 col-span-3">Merkle Root</div>
              <div className="bg-blue-900/50 rounded p-2">Timestamp</div>
              <div className="bg-blue-900/50 rounded p-2">Bits</div>
              <div className="bg-blue-900/50 rounded p-2">Nonce</div>
            </div>
          </div>
        </Tooltip>

        <Arrow direction="down" className="self-center" />

        {/* Merkle Tree */}
        <Tooltip content={
          <div>
            <strong className="text-green-300">Merkle Tree</strong>
            <p className="mt-2">Бинарное дерево хешей транзакций. Позволяет проверить включение транзакции без загрузки всего блока.</p>
            <p className="mt-1 text-gray-400 text-xs">Merkle Proof: O(log n) вместо O(n)</p>
          </div>
        }>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 cursor-help">
            <div className="text-green-300 font-bold mb-2 text-center">Merkle Tree</div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-green-900/50 rounded px-4 py-1 text-xs">Root Hash</div>
              <div className="flex gap-4">
                <div className="bg-green-900/50 rounded px-3 py-1 text-xs">H12</div>
                <div className="bg-green-900/50 rounded px-3 py-1 text-xs">H34</div>
              </div>
              <div className="flex gap-2">
                <div className="bg-green-900/50 rounded px-2 py-1 text-xs">Tx1</div>
                <div className="bg-green-900/50 rounded px-2 py-1 text-xs">Tx2</div>
                <div className="bg-green-900/50 rounded px-2 py-1 text-xs">Tx3</div>
                <div className="bg-green-900/50 rounded px-2 py-1 text-xs">Tx4</div>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function P2PNetworkDiagram() {
  return (
    <DiagramContainer title="Bitcoin P2P Network">
      <div className="flex flex-col items-center gap-4">
        {/* Network mesh visualization */}
        <div className="relative w-full" style={{ height: '260px' }}>
          {/* SVG for connection lines - rendered behind nodes */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {/* Center to Top */}
            <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#4b5563" strokeWidth="2" strokeDasharray="4,4" />
            {/* Center to Left */}
            <line x1="50%" y1="50%" x2="12%" y2="50%" stroke="#4b5563" strokeWidth="2" strokeDasharray="4,4" />
            {/* Center to Right */}
            <line x1="50%" y1="50%" x2="88%" y2="50%" stroke="#4b5563" strokeWidth="2" strokeDasharray="4,4" />
            {/* Center to Bottom Left */}
            <line x1="50%" y1="50%" x2="25%" y2="85%" stroke="#4b5563" strokeWidth="2" strokeDasharray="4,4" />
            {/* Center to Bottom Right */}
            <line x1="50%" y1="50%" x2="75%" y2="85%" stroke="#4b5563" strokeWidth="2" strokeDasharray="4,4" />
            {/* Top to Left */}
            <line x1="50%" y1="15%" x2="12%" y2="50%" stroke="#374151" strokeWidth="1" strokeDasharray="2,4" />
            {/* Top to Right */}
            <line x1="50%" y1="15%" x2="88%" y2="50%" stroke="#374151" strokeWidth="1" strokeDasharray="2,4" />
            {/* Left to Bottom Left */}
            <line x1="12%" y1="50%" x2="25%" y2="85%" stroke="#374151" strokeWidth="1" strokeDasharray="2,4" />
            {/* Right to Bottom Right */}
            <line x1="88%" y1="50%" x2="75%" y2="85%" stroke="#374151" strokeWidth="1" strokeDasharray="2,4" />
          </svg>

          {/* Center Full Node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 1 }}>
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Full Node</strong>
                <p className="mt-2">Центральный узел в mesh-сети. Подключён к множеству peers.</p>
                <p className="mt-1 text-gray-400 text-xs">Gossip protocol: информация распространяется за секунды</p>
              </div>
            }>
              <FlowNode variant="service" className="cursor-help">
                <div className="text-center">
                  <div className="font-bold text-sm">Full Node</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>

          {/* Top Full Node */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ zIndex: 1 }}>
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Full Node</strong>
                <p className="mt-2">Хранит полную копию блокчейна (~500GB). Валидирует все правила протокола независимо.</p>
                <p className="mt-1 text-gray-400 text-xs">"Don't trust, verify" — проверяет каждую транзакцию</p>
              </div>
            }>
              <FlowNode variant="service" className="cursor-help">
                <div className="text-center">
                  <div className="font-bold text-sm">Full Node</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>

          {/* Left Mining Node */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ zIndex: 1 }}>
            <Tooltip content={
              <div>
                <strong className="text-amber-300">Mining Node</strong>
                <p className="mt-2">Full Node + специализированное оборудование (ASIC) для Proof of Work.</p>
                <p className="mt-1 text-gray-400 text-xs">Создаёт новые блоки, получает block reward + fees</p>
              </div>
            }>
              <FlowNode variant="queue" className="cursor-help">
                <div className="text-center">
                  <div className="font-bold text-sm">Mining</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>

          {/* Right Full Node */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2" style={{ zIndex: 1 }}>
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Full Node</strong>
                <p className="mt-2">Узлы связаны P2P: каждый node подключён к 8-125 peers.</p>
              </div>
            }>
              <FlowNode variant="service" className="cursor-help">
                <div className="text-center">
                  <div className="font-bold text-sm">Full Node</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>

          {/* Bottom Left SPV */}
          <div className="absolute left-1/4 bottom-0 -translate-x-1/2" style={{ zIndex: 1 }}>
            <Tooltip content={
              <div>
                <strong className="text-purple-300">SPV Node (Light)</strong>
                <p className="mt-2">Хранит только заголовки блоков (~100MB). Доверяет full nodes для Merkle proofs.</p>
                <p className="mt-1 text-gray-400 text-xs">Используется в мобильных кошельках</p>
              </div>
            }>
              <FlowNode variant="database" className="cursor-help">
                <div className="text-center">
                  <div className="font-bold text-sm">SPV</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>

          {/* Bottom Right Full Node */}
          <div className="absolute right-1/4 bottom-0 translate-x-1/2" style={{ zIndex: 1 }}>
            <Tooltip content={
              <div>
                <strong className="text-blue-300">Full Node</strong>
                <p className="mt-2">Сеть децентрализована: нет единой точки отказа.</p>
              </div>
            }>
              <FlowNode variant="service" className="cursor-help">
                <div className="text-center">
                  <div className="font-bold text-sm">Full Node</div>
                </div>
              </FlowNode>
            </Tooltip>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-400 border-t border-gray-700 pt-3 w-full justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500/50 rounded"></div>
            <span>Full Node (~15,000)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500/50 rounded"></div>
            <span>Mining Node</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500/50 rounded"></div>
            <span>SPV/Light</span>
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

export function MerkleTreeDetailedDiagram() {
  return (
    <DiagramContainer title="Merkle Tree Structure" color="green">
      <div className="flex flex-col items-center gap-3">
        {/* Root */}
        <Tooltip content={
          <div>
            <strong className="text-green-300">Merkle Root</strong>
            <p className="mt-2">32-байтный fingerprint всех транзакций блока. Записывается в Block Header.</p>
            <p className="mt-1 text-gray-400 text-xs">Изменение любой транзакции меняет Root</p>
          </div>
        }>
          <div className="bg-green-500/30 border border-green-500/50 rounded-lg px-6 py-2 cursor-help">
            <div className="text-green-300 font-bold text-center">Merkle Root</div>
            <div className="text-xs text-gray-400 text-center">HABCDEFGH</div>
          </div>
        </Tooltip>

        {/* Level 1 */}
        <div className="flex gap-16">
          <Tooltip content={
            <div>
              <strong className="text-green-300">Internal Node</strong>
              <p className="mt-2">HABCD = SHA256(SHA256(HAB + HCD))</p>
              <p className="mt-1 text-gray-400 text-xs">Хеш конкатенации дочерних узлов</p>
            </div>
          }>
            <div className="bg-green-900/50 rounded px-4 py-1 text-sm cursor-help">HABCD</div>
          </Tooltip>
          <Tooltip content={
            <div>
              <strong className="text-green-300">Internal Node</strong>
              <p className="mt-2">HEFGH = SHA256(SHA256(HEF + HGH))</p>
            </div>
          }>
            <div className="bg-green-900/50 rounded px-4 py-1 text-sm cursor-help">HEFGH</div>
          </Tooltip>
        </div>

        {/* Level 2 */}
        <div className="flex gap-8">
          <Tooltip content={<div><strong>HAB</strong> = hash(HA + HB)</div>}>
            <div className="bg-green-900/50 rounded px-3 py-1 text-xs cursor-help">HAB</div>
          </Tooltip>
          <Tooltip content={<div><strong>HCD</strong> = hash(HC + HD)</div>}>
            <div className="bg-green-900/50 rounded px-3 py-1 text-xs cursor-help">HCD</div>
          </Tooltip>
          <Tooltip content={<div><strong>HEF</strong> = hash(HE + HF)</div>}>
            <div className="bg-green-900/50 rounded px-3 py-1 text-xs cursor-help">HEF</div>
          </Tooltip>
          <Tooltip content={<div><strong>HGH</strong> = hash(HG + HH)</div>}>
            <div className="bg-green-900/50 rounded px-3 py-1 text-xs cursor-help">HGH</div>
          </Tooltip>
        </div>

        {/* Level 3 - Transaction hashes */}
        <div className="flex gap-2">
          {['HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH'].map((h, i) => (
            <Tooltip key={h} content={<div><strong>{h}</strong> = SHA256(SHA256(Tx{String.fromCharCode(65 + i)}))</div>}>
              <div className="bg-green-900/50 rounded px-2 py-1 text-xs cursor-help">{h}</div>
            </Tooltip>
          ))}
        </div>

        {/* Transactions */}
        <div className="flex gap-2 mt-1">
          {['TxA', 'TxB', 'TxC', 'TxD', 'TxE', 'TxF', 'TxG', 'TxH'].map((tx) => (
            <Tooltip key={tx} content={
              <div>
                <strong className="text-blue-300">{tx}</strong>
                <p className="mt-1">Сериализованная транзакция (input + output)</p>
              </div>
            }>
              <div className="bg-blue-900/30 border border-blue-500/30 rounded px-2 py-1 text-xs cursor-help text-blue-300">{tx}</div>
            </Tooltip>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}

export function ScriptExecutionDiagram() {
  const steps = [
    { op: 'Push <sig>', stack: ['sig'], desc: 'Кладём подпись на стек' },
    { op: 'Push <pubKey>', stack: ['sig', 'pubKey'], desc: 'Кладём публичный ключ' },
    { op: 'OP_DUP', stack: ['sig', 'pubKey', 'pubKey'], desc: 'Дублируем верхний элемент' },
    { op: 'OP_HASH160', stack: ['sig', 'pubKey', 'hash(pubKey)'], desc: 'Хешируем: RIPEMD160(SHA256(x))' },
    { op: 'Push <expected>', stack: ['sig', 'pubKey', 'hash', 'expected'], desc: 'Ожидаемый hash из scriptPubKey' },
    { op: 'OP_EQUALVERIFY', stack: ['sig', 'pubKey'], desc: 'Сравниваем, fail если не равны' },
    { op: 'OP_CHECKSIG', stack: ['true'], desc: 'Проверяем подпись, результат на стек' },
  ];

  return (
    <DiagramContainer title="P2PKH Script Execution" color="amber">
      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {steps.map((step, i) => (
            <Tooltip key={i} content={
              <div>
                <strong className="text-amber-300">Step {i + 1}: {step.op}</strong>
                <p className="mt-2">{step.desc}</p>
                <div className="mt-2 bg-black/50 rounded p-2">
                  <div className="text-xs text-gray-400">Stack:</div>
                  <div className="text-xs font-mono">[{step.stack.join(', ')}]</div>
                </div>
              </div>
            }>
              <div className="flex flex-col items-center gap-2 cursor-help">
                <div className="bg-amber-500/20 border border-amber-500/50 rounded px-3 py-1 text-xs font-mono">
                  {step.op}
                </div>
                <div className="text-gray-500">↓</div>
                <div className="bg-gray-800/50 border border-gray-700 rounded p-2 min-w-[80px]">
                  {step.stack.map((item, j) => (
                    <div key={j} className="text-xs font-mono text-center border-b border-gray-700 last:border-0 py-0.5">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}

export function MiningDiagram() {
  return (
    <DiagramContainer title="Proof of Work Mining">
      <div className="flex items-center gap-6">
        {/* Mempool */}
        <Tooltip content={
          <div>
            <strong className="text-purple-300">Mempool</strong>
            <p className="mt-2">Пул неподтверждённых транзакций. Майнеры выбирают транзакции с высоким fee/byte.</p>
          </div>
        }>
          <FlowNode type="database" className="cursor-help">
            <div className="text-center">
              <div className="text-purple-300 font-bold">Mempool</div>
              <div className="text-xs text-gray-400">Pending TXs</div>
            </div>
          </FlowNode>
        </Tooltip>

        <Arrow direction="right" />

        {/* Mining Process */}
        <Tooltip content={
          <div>
            <strong className="text-amber-300">Mining (PoW)</strong>
            <p className="mt-2">Майнер перебирает nonce пока:</p>
            <code className="block mt-1 bg-black/50 p-2 rounded text-xs">
              SHA256(SHA256(header)) &lt; target
            </code>
            <p className="mt-2 text-gray-400 text-xs">~10 минут на блок при текущей сложности</p>
          </div>
        }>
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 cursor-help">
            <div className="text-amber-300 font-bold text-center">Mining</div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              <div>nonce++</div>
              <div className="font-mono mt-1">hash &lt; target?</div>
            </div>
          </div>
        </Tooltip>

        <Arrow direction="right" />

        {/* New Block */}
        <Tooltip content={
          <div>
            <strong className="text-green-300">Valid Block</strong>
            <p className="mt-2">Когда найден валидный nonce, блок broadcast'ится в сеть.</p>
            <p className="mt-1">Награда: block subsidy + transaction fees</p>
          </div>
        }>
          <FlowNode type="output" className="cursor-help">
            <div className="text-center">
              <div className="text-green-300 font-bold">Block</div>
              <div className="text-xs text-gray-400">Reward:</div>
              <div className="text-xs text-green-400">3.125 BTC</div>
            </div>
          </FlowNode>
        </Tooltip>
      </div>
    </DiagramContainer>
  );
}

export function UTXOTransactionDiagram() {
  return (
    <DiagramContainer title="UTXO Transaction Flow" color="amber">
      <div className="flex items-center gap-4 justify-center">
        {/* Inputs side */}
        <Tooltip content={
          <div>
            <strong className="text-rose-300">Inputs (уничтожаем)</strong>
            <p className="mt-2">Каждый input ссылается на UTXO из предыдущей транзакции.</p>
            <p className="mt-1 text-gray-400 text-xs">UTXO тратится целиком — нельзя потратить "часть"</p>
          </div>
        }>
          <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg p-3 cursor-help">
            <div className="text-rose-300 font-bold text-xs text-center mb-2">Inputs (уничтожаем)</div>
            <div className="space-y-2">
              <div className="bg-rose-900/30 rounded px-3 py-2">
                <div className="text-xs text-rose-300">UTXO #1</div>
                <div className="text-sm font-bold text-white">0.5 BTC</div>
                <div className="text-xs text-gray-500">(от предыдущей tx)</div>
              </div>
              <div className="bg-rose-900/30 rounded px-3 py-2">
                <div className="text-xs text-rose-300">UTXO #2</div>
                <div className="text-sm font-bold text-white">0.3 BTC</div>
                <div className="text-xs text-gray-500">(от другой tx)</div>
              </div>
            </div>
          </div>
        </Tooltip>

        {/* Arrow with TX */}
        <div className="flex flex-col items-center gap-1">
          <Arrow direction="right" />
          <Tooltip content={
            <div>
              <strong className="text-amber-300">Transaction</strong>
              <p className="mt-2">Sum(inputs) = Sum(outputs) + fee</p>
              <p className="mt-1 text-gray-400 text-xs">0.8 = 0.799 + 0.001</p>
            </div>
          }>
            <div className="bg-amber-500/30 border border-amber-500/50 rounded px-2 py-1 cursor-help">
              <div className="text-xs text-amber-300 font-bold">TX</div>
            </div>
          </Tooltip>
          <Arrow direction="right" />
        </div>

        {/* Outputs side */}
        <Tooltip content={
          <div>
            <strong className="text-green-300">Outputs (создаём)</strong>
            <p className="mt-2">Новые UTXO с указанием получателя и суммы.</p>
            <p className="mt-1 text-gray-400 text-xs">Каждый output locked скриптом (scriptPubKey)</p>
          </div>
        }>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 cursor-help">
            <div className="text-green-300 font-bold text-xs text-center mb-2">Outputs (создаём)</div>
            <div className="space-y-2">
              <div className="bg-green-900/30 rounded px-3 py-2">
                <div className="text-xs text-green-300">Получателю</div>
                <div className="text-sm font-bold text-white">0.7 BTC</div>
              </div>
              <div className="bg-purple-900/30 rounded px-3 py-2">
                <div className="text-xs text-purple-300">Сдача (мне)</div>
                <div className="text-sm font-bold text-white">0.099 BTC</div>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Fee calculation */}
      <div className="mt-4 text-center border-t border-gray-700 pt-3">
        <div className="flex justify-center gap-6 text-xs">
          <div className="text-gray-400">Sum(inputs) = <span className="text-white font-mono">0.8 BTC</span></div>
          <div className="text-gray-400">Sum(outputs) = <span className="text-white font-mono">0.799 BTC</span></div>
          <Tooltip content={<div><strong>Fee</strong><p className="mt-1">Разница между inputs и outputs достаётся майнеру</p></div>}>
            <div className="bg-amber-500/20 border border-amber-500/50 rounded px-2 py-1 cursor-help">
              <span className="text-amber-300">Fee = </span>
              <span className="text-white font-mono">0.001 BTC</span>
            </div>
          </Tooltip>
        </div>
      </div>
    </DiagramContainer>
  );
}
