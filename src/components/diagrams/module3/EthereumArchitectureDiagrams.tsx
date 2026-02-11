/**
 * Ethereum Architecture Diagrams (ETH-01)
 *
 * Exports:
 * - EthVsBitcoinDiagram: Side-by-side comparison table (static with DiagramTooltip)
 * - NodeArchitectureDiagram: Ethereum node two-layer architecture (EL + CL)
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  EthVsBitcoinDiagram                                                 */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  bitcoin: string;
  ethereum: string;
  tooltip: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    aspect: 'Модель состояния',
    bitcoin: 'UTXO Set',
    ethereum: 'Глобальный State Trie',
    tooltip: 'Bitcoin хранит набор неизрасходованных выходов. Ethereum хранит глобальное дерево состояния всех аккаунтов с балансами, nonce и кодом контрактов.',
  },
  {
    aspect: 'Баланс',
    bitcoin: 'Сумма UTXO',
    ethereum: 'Поле balance в аккаунте',
    tooltip: 'В Bitcoin баланс вычисляется как сумма всех UTXO, принадлежащих адресу. В Ethereum баланс -- это явное поле в структуре аккаунта.',
  },
  {
    aspect: 'Транзакции',
    bitcoin: 'Потребляют/создают выходы',
    ethereum: 'Модифицируют балансы напрямую',
    tooltip: 'Bitcoin: транзакция тратит UTXO и создает новые. Ethereum: транзакция изменяет поля аккаунтов (balance, nonce, storage) через state transitions.',
  },
  {
    aspect: 'Защита от replay',
    bitcoin: 'UTXO тратится однократно',
    ethereum: 'Nonce инкрементируется',
    tooltip: 'В Bitcoin каждый UTXO можно потратить ровно один раз. В Ethereum каждый аккаунт имеет nonce, который увеличивается с каждой транзакцией, предотвращая повторное выполнение.',
  },
  {
    aspect: 'Смарт-контракты',
    bitcoin: 'Ограниченный Script',
    ethereum: 'Тьюринг-полный EVM',
    tooltip: 'Bitcoin Script -- стековый язык без циклов (~100 опкодов). EVM -- полная виртуальная машина с памятью, хранилищем и произвольными циклами (~140 опкодов).',
  },
  {
    aspect: 'Типы аккаунтов',
    bitcoin: 'Нет (только UTXO)',
    ethereum: 'EOA + Contract Account',
    tooltip: 'В Bitcoin нет понятия аккаунта -- есть только неизрасходованные выходы. Ethereum различает два типа: EOA (управляется ключом) и Contract (управляется кодом).',
  },
  {
    aspect: 'Хранение состояния',
    bitcoin: 'UTXO Set (LevelDB)',
    ethereum: 'MPT (nonce, balance, storageRoot, codeHash)',
    tooltip: 'Bitcoin хранит плоский набор UTXO. Ethereum использует Modified Merkle Patricia Trie для хранения 4 полей каждого аккаунта: nonce, balance, storageRoot, codeHash.',
  },
];

const headerCell: React.CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 12,
  fontFamily: 'monospace',
  borderBottom: `1px solid ${colors.border}`,
};

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontFamily: 'monospace',
  fontSize: 12,
  borderRadius: 4,
  transition: 'background 0.15s',
};

export function EthVsBitcoinDiagram() {
  return (
    <DiagramContainer title="Bitcoin vs Ethereum: модели данных" color="purple">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, width: '22%' }}>Аспект</th>
              <th style={{ ...headerCell, width: '39%', color: '#f39c12' }}>Bitcoin</th>
              <th style={{ ...headerCell, width: '39%', color: '#8b5cf6' }}>Ethereum</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((row, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td style={{
                  ...cellStyle,
                  fontWeight: 600,
                  color: colors.text,
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  <DiagramTooltip content={row.tooltip}>
                    <span>{row.aspect}</span>
                  </DiagramTooltip>
                </td>
                <td style={{
                  ...cellStyle,
                  color: colors.textMuted,
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  {row.bitcoin}
                </td>
                <td style={{
                  ...cellStyle,
                  color: colors.text,
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  {row.ethereum}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  NodeArchitectureDiagram                                             */
/* ================================================================== */

interface NodeComponent {
  id: string;
  label: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  layer: 'el' | 'cl' | 'api';
}

const ETH_NODE_COMPONENTS: NodeComponent[] = [
  // Execution Layer
  {
    id: 'evm',
    label: 'EVM',
    description: 'Ethereum Virtual Machine -- исполняет байткод смарт-контрактов. Стековая машина с 1024 элементами, memory и storage.',
    x: 60, y: 60, width: 120, height: 45,
    color: colors.success, layer: 'el',
  },
  {
    id: 'state-trie',
    label: 'State Trie',
    description: 'Modified Merkle Patricia Trie хранит состояние всех аккаунтов: nonce, balance, storageRoot, codeHash. Обновляется каждым блоком.',
    x: 200, y: 60, width: 120, height: 45,
    color: '#22c55e', layer: 'el',
  },
  {
    id: 'txpool',
    label: 'Tx Pool',
    description: 'Пул ожидающих транзакций (mempool). Транзакции упорядочиваются по gas price и nonce для включения в блок.',
    x: 60, y: 125, width: 120, height: 45,
    color: '#f59e0b', layer: 'el',
  },
  {
    id: 'json-rpc',
    label: 'JSON-RPC API',
    description: 'Интерфейс для взаимодействия с узлом: eth_call, eth_sendTransaction, eth_getBalance, eth_getProof и др.',
    x: 200, y: 125, width: 120, height: 45,
    color: '#06b6d4', layer: 'el',
  },
  // Engine API (bridge)
  {
    id: 'engine-api',
    label: 'Engine API',
    description: 'Связующий протокол между EL и CL. Передает payload для новых блоков, результаты валидации и fork choice updates.',
    x: 195, y: 205, width: 130, height: 40,
    color: '#f472b6', layer: 'api',
  },
  // Consensus Layer
  {
    id: 'beacon',
    label: 'Beacon Chain',
    description: 'Управляет реестром валидаторов, эпохами, слотами и финализацией. Каждый слот (12 сек) -- возможность предложить блок.',
    x: 60, y: 280, width: 120, height: 45,
    color: '#a855f7', layer: 'cl',
  },
  {
    id: 'validator',
    label: 'Validator Client',
    description: 'Подписывает attestation-ы и предлагает блоки. Требует 32 ETH stake. Работает отдельно от beacon node для безопасности.',
    x: 200, y: 280, width: 130, height: 45,
    color: '#8b5cf6', layer: 'cl',
  },
  {
    id: 'fork-choice',
    label: 'Fork Choice',
    description: 'Алгоритм LMD-GHOST + Casper FFG определяет каноническую цепочку. Финализирует блоки после 2 эпох (~12.8 мин).',
    x: 60, y: 345, width: 120, height: 45,
    color: '#c084fc', layer: 'cl',
  },
  {
    id: 'p2p',
    label: 'P2P / libp2p',
    description: 'Сетевой уровень на libp2p: gossipsub для блоков и attestation-ов, req/resp для синхронизации, discv5 для обнаружения узлов.',
    x: 200, y: 345, width: 130, height: 45,
    color: '#e879f9', layer: 'cl',
  },
];

const ETH_NODE_ARROWS: { from: string; to: string }[] = [
  { from: 'evm', to: 'state-trie' },
  { from: 'txpool', to: 'evm' },
  { from: 'json-rpc', to: 'txpool' },
  { from: 'json-rpc', to: 'state-trie' },
  { from: 'evm', to: 'engine-api' },
  { from: 'engine-api', to: 'beacon' },
  { from: 'beacon', to: 'validator' },
  { from: 'beacon', to: 'fork-choice' },
  { from: 'beacon', to: 'p2p' },
];

function getCompCenter(comp: NodeComponent): { cx: number; cy: number } {
  return { cx: comp.x + comp.width / 2, cy: comp.y + comp.height / 2 };
}

export function NodeArchitectureDiagram() {
  return (
    <DiagramContainer title="Архитектура узла Ethereum (EL + CL)" color="blue">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={520} height={420} viewBox="0 0 520 420">
          <defs>
            <marker
              id="arrowhead-eth-node"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={colors.border} />
            </marker>
          </defs>

          {/* Layer backgrounds */}
          <rect x={30} y={30} width={320} height={160} rx={12}
            fill="rgba(34,197,94,0.05)" stroke="rgba(34,197,94,0.15)" strokeWidth={1} strokeDasharray="6,4" />
          <text x={360} y={55} fill="#22c55e" fontSize={12} fontFamily="monospace" fontWeight={600}>
            Execution Layer
          </text>
          <text x={360} y={72} fill={colors.textMuted} fontSize={10} fontFamily="monospace">
            Geth / Nethermind /
          </text>
          <text x={360} y={86} fill={colors.textMuted} fontSize={10} fontFamily="monospace">
            Besu / Erigon
          </text>

          <rect x={30} y={255} width={320} height={155} rx={12}
            fill="rgba(168,85,247,0.05)" stroke="rgba(168,85,247,0.15)" strokeWidth={1} strokeDasharray="6,4" />
          <text x={360} y={280} fill="#a855f7" fontSize={12} fontFamily="monospace" fontWeight={600}>
            Consensus Layer
          </text>
          <text x={360} y={297} fill={colors.textMuted} fontSize={10} fontFamily="monospace">
            Prysm / Lighthouse /
          </text>
          <text x={360} y={311} fill={colors.textMuted} fontSize={10} fontFamily="monospace">
            Teku / Nimbus / Lodestar
          </text>

          {/* Arrows */}
          {ETH_NODE_ARROWS.map(({ from, to }, i) => {
            const fComp = ETH_NODE_COMPONENTS.find((c) => c.id === from)!;
            const tComp = ETH_NODE_COMPONENTS.find((c) => c.id === to)!;
            const f = getCompCenter(fComp);
            const t = getCompCenter(tComp);
            return (
              <line
                key={i}
                x1={f.cx}
                y1={f.cy}
                x2={t.cx}
                y2={t.cy}
                stroke={colors.border}
                strokeWidth={1.5}
                strokeDasharray="6,3"
                markerEnd="url(#arrowhead-eth-node)"
                opacity={0.5}
              />
            );
          })}

          {/* Components (no hover handlers) */}
          {ETH_NODE_COMPONENTS.map((comp) => (
            <g key={comp.id}>
              <rect
                x={comp.x}
                y={comp.y}
                width={comp.width}
                height={comp.height}
                rx={8}
                fill="rgba(255,255,255,0.05)"
                stroke={colors.border}
                strokeWidth={1}
              />
              <text
                x={comp.x + comp.width / 2}
                y={comp.y + comp.height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                fontSize={12}
                fontFamily="monospace"
                fontWeight={400}
              >
                {comp.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* HTML component cards below SVG with DiagramTooltip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 8,
        marginTop: 8,
      }}>
        {ETH_NODE_COMPONENTS.map((comp) => (
          <DiagramTooltip key={comp.id} content={comp.description}>
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: comp.color,
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 11,
                fontFamily: 'monospace',
                color: comp.color,
                fontWeight: 600,
              }}>
                {comp.label}
              </span>
            </div>
          </DiagramTooltip>
        ))}
      </div>
    </DiagramContainer>
  );
}
