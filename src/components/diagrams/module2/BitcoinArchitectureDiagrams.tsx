/**
 * Bitcoin Architecture Diagrams (BTC-01)
 *
 * Exports:
 * - NodeArchitectureDiagram: Bitcoin full node components with data flow arrows
 * - BitcoinVsBankingDiagram: Side-by-side comparison of traditional banking vs Bitcoin
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  NodeArchitectureDiagram                                            */
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
}

const NODE_COMPONENTS: NodeComponent[] = [
  {
    id: 'network',
    label: 'P2P Сеть',
    description: 'Получение и отправка блоков, транзакций и адресов через TCP-соединения с другими узлами.',
    x: 200, y: 20, width: 160, height: 50,
    color: colors.primary,
  },
  {
    id: 'mempool',
    label: 'Mempool',
    description: 'Пул неподтверждённых транзакций. Каждая транзакция проходит валидацию перед попаданием в mempool.',
    x: 80, y: 110, width: 140, height: 50,
    color: colors.accent,
  },
  {
    id: 'validation',
    label: 'Валидация блоков',
    description: 'Проверка Proof-of-Work, структуры заголовка, всех транзакций в блоке и соблюдения правил консенсуса.',
    x: 280, y: 110, width: 160, height: 50,
    color: colors.success,
  },
  {
    id: 'utxo',
    label: 'UTXO Set',
    description: 'Множество всех неизрасходованных выходов (~100M записей). Позволяет быстро проверить, существует ли UTXO.',
    x: 200, y: 200, width: 160, height: 50,
    color: '#e67e22',
  },
  {
    id: 'wallet',
    label: 'Кошелёк',
    description: 'Управление ключами (descriptor wallet), создание и подписание транзакций. Отслеживание баланса по UTXO.',
    x: 60, y: 290, width: 140, height: 50,
    color: '#9b59b6',
  },
  {
    id: 'rpc',
    label: 'RPC интерфейс',
    description: 'JSON-RPC API для взаимодействия с узлом: getblock, sendrawtransaction, listunspent и другие команды.',
    x: 320, y: 290, width: 150, height: 50,
    color: '#1abc9c',
  },
];

const NODE_ARROWS: { from: string; to: string }[] = [
  { from: 'network', to: 'mempool' },
  { from: 'network', to: 'validation' },
  { from: 'validation', to: 'utxo' },
  { from: 'mempool', to: 'utxo' },
  { from: 'utxo', to: 'wallet' },
  { from: 'utxo', to: 'rpc' },
];

function getCenter(comp: NodeComponent): { cx: number; cy: number } {
  return { cx: comp.x + comp.width / 2, cy: comp.y + comp.height / 2 };
}

export function NodeArchitectureDiagram() {
  return (
    <DiagramContainer title="Архитектура узла Bitcoin" color="blue">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={540} height={370} viewBox="0 0 540 370">
          {/* Arrows */}
          {NODE_ARROWS.map(({ from, to }, i) => {
            const fComp = NODE_COMPONENTS.find((c) => c.id === from)!;
            const tComp = NODE_COMPONENTS.find((c) => c.id === to)!;
            const f = getCenter(fComp);
            const t = getCenter(tComp);
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
                markerEnd="url(#arrowhead-node)"
                opacity={0.5}
              />
            );
          })}

          <defs>
            <marker
              id="arrowhead-node"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={colors.border} />
            </marker>
          </defs>

          {/* Components (static, no hover) */}
          {NODE_COMPONENTS.map((comp) => (
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
                fontSize={13}
                fontFamily="monospace"
                fontWeight={400}
              >
                {comp.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* HTML node legend with DiagramTooltip (replaces SVG hover + conditional DataBox) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginTop: 8,
      }}>
        {NODE_COMPONENTS.map((comp) => (
          <DiagramTooltip key={comp.id} content={comp.description}>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              borderColor: `${comp.color}30`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: comp.color }}>
                {comp.label}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  BitcoinVsBankingDiagram                                            */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  banking: string;
  bitcoin: string;
  tooltipRu: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  { aspect: 'Хранение данных', banking: 'Центральный реестр (одна БД)', bitcoin: 'Распределённый реестр (~60 000 узлов)', tooltipRu: 'В банке все данные хранятся в одной централизованной базе. В Bitcoin каждый полный узел хранит копию всей цепочки блоков. Нет единого хранилища, которое можно взломать или отключить.' },
  { aspect: 'Модель баланса', banking: 'Баланс на счёте (account model)', bitcoin: 'Набор UTXO (нет поля "баланс")', tooltipRu: 'Банк хранит баланс как число в базе данных. Bitcoin не имеет понятия "баланс" -- только набор неизрасходованных выходов (UTXO). Баланс кошелька = сумма всех принадлежащих UTXO.' },
  { aspect: 'Валидация', banking: 'Банк проверяет и одобряет', bitcoin: 'Каждый узел проверяет независимо', tooltipRu: 'В банке только банк решает, валидна ли транзакция. В Bitcoin каждый из ~60 000 узлов самостоятельно проверяет каждую транзакцию и блок по правилам консенсуса. "Don\'t trust, verify."' },
  { aspect: 'Отказоустойчивость', banking: 'Single point of failure', bitcoin: 'Нет единой точки отказа', tooltipRu: 'Банк может быть отключен, заблокирован или взломан. Bitcoin работает пока хотя бы один узел функционирует. Для остановки сети нужно отключить все ~60 000 узлов одновременно.' },
  { aspect: 'Доступ', banking: 'KYC, рабочие часы, ограничения', bitcoin: '24/7, без разрешений (permissionless)', tooltipRu: 'Банк требует документы (KYC), может заблокировать счет, работает в рабочие часы. Bitcoin доступен 24/7 для любого, кто может создать пару ключей. Никто не может запретить отправку транзакции.' },
  { aspect: 'Обработка', banking: 'Секунды (внутри), дни (международ.)', bitcoin: '~10 минут (1 подтверждение)', tooltipRu: 'Внутрибанковские переводы мгновенны, международные -- дни через SWIFT. Bitcoin: ~10 минут для 1 подтверждения, 1 час для 6 подтверждений. Lightning Network: мгновенно для малых сумм.' },
];

export function BitcoinVsBankingDiagram() {
  return (
    <DiagramContainer title="Bitcoin vs банковская система" color="purple">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, width: '25%' }}>Аспект</th>
              <th style={{ ...headerCell, width: '37.5%', color: '#e74c3c' }}>Банковская система</th>
              <th style={{ ...headerCell, width: '37.5%', color: colors.success }}>Bitcoin</th>
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
                  <DiagramTooltip content={row.tooltipRu}>
                    <span>{row.aspect}</span>
                  </DiagramTooltip>
                </td>
                <td style={{
                  ...cellStyle,
                  color: colors.textMuted,
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  {row.banking}
                </td>
                <td style={{
                  ...cellStyle,
                  color: colors.text,
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  {row.bitcoin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DiagramTooltip content="UTXO (Unspent Transaction Output) -- неизрасходованный выход транзакции. В Bitcoin нет поля 'баланс'. Кошелек суммирует все UTXO, принадлежащие вашим ключам, чтобы показать баланс.">
          <DataBox
            label="Ключевое отличие"
            value="В банке баланс -- это запись в БД. В Bitcoin баланс вычисляется из набора UTXO. Нет центрального хранилища балансов."
            variant="highlight"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}

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
