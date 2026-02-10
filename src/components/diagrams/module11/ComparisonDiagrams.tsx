/**
 * Comparison Diagrams (INDEX-08)
 *
 * Exports:
 * - ToolComparisonTableDiagram: Three-way comparison table with compact/detailed toggle (Subsquid vs The Graph vs SubQuery)
 * - IndexingSpeedDiagram: Performance comparison horizontal bar chart (log scale) + latency bars (static)
 * - DecisionTreeDiagram: Interactive decision tree for choosing an indexer (clickable nodes)
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ToolComparisonTableDiagram                                         */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  subsquid: string;
  theGraph: string;
  subquery: string;
  subsquidRating: 'green' | 'yellow' | 'red';
  theGraphRating: 'green' | 'yellow' | 'red';
  subqueryRating: 'green' | 'yellow' | 'red';
  detailed?: boolean;
}

const RATING_COLORS = {
  green: '#22c55e',
  yellow: '#f59e0b',
  red: '#ef4444',
};

const COMPARISON_DATA: ComparisonRow[] = [
  // Compact rows (always visible)
  { aspect: 'Язык маппингов', subsquid: 'TypeScript', theGraph: 'AssemblyScript', subquery: 'TypeScript', subsquidRating: 'green', theGraphRating: 'yellow', subqueryRating: 'green' },
  { aspect: 'Скорость', subsquid: '1K-50K бл/сек', theGraph: '100-150 бл/сек', subquery: '~300 бл/сек', subsquidRating: 'green', theGraphRating: 'red', subqueryRating: 'yellow' },
  { aspect: 'GraphQL сервер', subsquid: 'Встроенный + подписки', theGraph: 'Встроенный в Graph Node', subquery: 'Встроенный', subsquidRating: 'green', theGraphRating: 'green', subqueryRating: 'green' },
  { aspect: 'Хранение', subsquid: 'PostgreSQL', theGraph: 'PostgreSQL (внутренний)', subquery: 'PostgreSQL', subsquidRating: 'green', theGraphRating: 'green', subqueryRating: 'green' },
  { aspect: 'Hot blocks', subsquid: 'Да', theGraph: 'Нет', subquery: 'Да', subsquidRating: 'green', theGraphRating: 'red', subqueryRating: 'green' },
  { aspect: 'Multi-chain', subsquid: 'Несколько процессоров', theGraph: 'Отдельные subgraphs', subquery: 'Multi-chain manifest', subsquidRating: 'yellow', theGraphRating: 'yellow', subqueryRating: 'green' },
  { aspect: 'Токен', subsquid: 'SQD (опционально)', theGraph: 'GRT (staking)', subquery: 'SQT', subsquidRating: 'green', theGraphRating: 'yellow', subqueryRating: 'yellow' },
  { aspect: 'Локальная разработка', subsquid: 'RPC only', theGraph: 'Graph Node + IPFS + PG', subquery: 'Node + PG', subsquidRating: 'green', theGraphRating: 'red', subqueryRating: 'yellow' },
  // Detailed rows (only in expanded mode)
  { aspect: 'Off-chain данные', subsquid: 'Да (Data Lake)', theGraph: 'Нет', subquery: 'Ограниченно', subsquidRating: 'green', theGraphRating: 'red', subqueryRating: 'yellow', detailed: true },
  { aspect: 'Deployment', subsquid: 'SQD Cloud / self-hosted', theGraph: 'Subgraph Studio / Hosted', subquery: 'IPFS + SubQuery Network', subsquidRating: 'green', theGraphRating: 'green', subqueryRating: 'green', detailed: true },
  { aspect: 'Стоимость', subsquid: 'Бесплатно (self-hosted)', theGraph: 'GRT стейкинг для запросов', subquery: 'Бесплатно (self-hosted)', subsquidRating: 'green', theGraphRating: 'yellow', subqueryRating: 'green', detailed: true },
  { aspect: 'Сообщество', subsquid: 'Растущее', theGraph: 'Крупнейшее', subquery: 'Среднее', subsquidRating: 'yellow', theGraphRating: 'green', subqueryRating: 'yellow', detailed: true },
  { aspect: 'Документация', subsquid: 'Хорошая', theGraph: 'Отличная', subquery: 'Хорошая', subsquidRating: 'green', theGraphRating: 'green', subqueryRating: 'green', detailed: true },
];

export function ToolComparisonTableDiagram() {
  const [showDetailed, setShowDetailed] = useState(false);

  const visibleRows = useMemo(
    () => showDetailed ? COMPARISON_DATA : COMPARISON_DATA.filter((r) => !r.detailed),
    [showDetailed],
  );

  return (
    <DiagramContainer title="Subsquid vs The Graph vs SubQuery: полное сравнение" color="green">
      {/* Toggle */}
      <DiagramTooltip content="Краткий обзор показывает 8 ключевых параметров. Подробное сравнение добавляет off-chain данные, deployment, стоимость, сообщество и документацию -- всего 13 параметров.">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {([false, true] as const).map((detailed) => (
            <button
              key={String(detailed)}
              onClick={() => setShowDetailed(detailed)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: `1px solid ${showDetailed === detailed ? '#22c55e50' : 'rgba(255,255,255,0.1)'}`,
                background: showDetailed === detailed ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                color: showDetailed === detailed ? '#22c55e' : colors.textMuted,
                fontSize: 10,
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            >
              {detailed ? 'Подробное сравнение' : 'Краткий обзор'}
            </button>
          ))}
        </div>
      </DiagramTooltip>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, fontFamily: 'monospace' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: colors.textMuted, fontWeight: 600 }}>
                Аспект
              </th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', fontWeight: 600 }}>
                <DiagramTooltip content="Subsquid -- самый быстрый индексатор. TypeScript, батч-обработка, SQD Network для ускорения. Бесплатный self-hosted, опциональный SQD Cloud.">
                  <span>Subsquid</span>
                </DiagramTooltip>
              </th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', fontWeight: 600 }}>
                <DiagramTooltip content="The Graph -- децентрализованная сеть индексирования. AssemblyScript маппинги, GRT стейкинг, крупнейшее сообщество. Стандарт индустрии.">
                  <span>The Graph</span>
                </DiagramTooltip>
              </th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontWeight: 600 }}>
                <DiagramTooltip content="SubQuery -- мультисетевой индексатор. TypeScript маппинги, нативная поддержка мультичейн-манифестов. Изначально создан для Polkadot, расширен на EVM.">
                  <span>SubQuery</span>
                </DiagramTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.aspect}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: colors.text }}>
                  {row.aspect}
                </td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: RATING_COLORS[row.subsquidRating] }}>
                  {row.subsquid}
                </td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: RATING_COLORS[row.theGraphRating] }}>
                  {row.theGraph}
                </td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: RATING_COLORS[row.subqueryRating] }}>
                  {row.subquery}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DiagramTooltip content="Нет однозначно лучшего инструмента. Subsquid выигрывает по скорости и DX. The Graph -- по децентрализации и экосистеме. SubQuery -- по мультичейн. Выбирайте по приоритетам проекта.">
        <DataBox
          label="Резюме"
          value="Subsquid -- быстрый и удобный (TypeScript). The Graph -- децентрализованный и зрелый (крупнейшая экосистема). SubQuery -- мультисетевой и TypeScript. Выбор зависит от приоритетов: скорость разработки, децентрализация, или мультисетевая поддержка."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  IndexingSpeedDiagram                                               */
/* ================================================================== */

interface SpeedEntry {
  label: string;
  minSpeed: number;
  maxSpeed: number;
  note: string;
  color: string;
}

const SPEED_DATA: (SpeedEntry & { tooltip: string })[] = [
  { label: 'Subsquid', minSpeed: 1000, maxSpeed: 50000, note: 'Батч-обработка + SQD Network', color: '#22c55e', tooltip: 'Subsquid достигает 50K блоков/сек благодаря батч-обработке: читает тысячи блоков за раз и обрабатывает все события в одном проходе. SQD Network ускоряет доступ к данным.' },
  { label: 'SubQuery', minSpeed: 250, maxSpeed: 350, note: 'Последовательная обработка', color: '#eab308', tooltip: 'SubQuery обрабатывает блоки последовательно, но быстрее The Graph за счёт TypeScript runtime (нет WASM overhead). Стабильные ~300 блоков/сек.' },
  { label: 'The Graph', minSpeed: 100, maxSpeed: 150, note: 'WASM sandbox overhead', color: '#f59e0b', tooltip: 'The Graph медленнее из-за WASM sandbox: каждый event handler компилируется в WebAssembly и исполняется изолированно. Безопасно, но дорого по производительности.' },
];

interface LatencyEntry {
  label: string;
  latency: string;
  barWidth: number;
  color: string;
}

const LATENCY_DATA: (LatencyEntry & { tooltip: string })[] = [
  { label: 'Subsquid', latency: '~1-2 сек', barWidth: 15, color: '#22c55e', tooltip: 'Subsquid поддерживает hot blocks -- незавершённые блоки отображаются сразу, обновляются при финализации. Данные доступны через 1-2 секунды после события.' },
  { label: 'SubQuery', latency: '~1-2 сек', barWidth: 15, color: '#eab308', tooltip: 'SubQuery также поддерживает hot blocks для минимальной задержки. Сравнимая с Subsquid скорость отображения свежих данных.' },
  { label: 'The Graph', latency: '~10-30 сек', barWidth: 80, color: '#f59e0b', tooltip: 'The Graph не поддерживает hot blocks. Данные доступны только после finality confirmation, что добавляет 10-30 секунд задержки на mainnet.' },
];

export function IndexingSpeedDiagram() {
  // Log scale: map speed to percentage width (log10)
  const maxLog = useMemo(() => Math.log10(50000), []);

  return (
    <DiagramContainer title="Скорость индексации: количественное сравнение" color="blue">
      {/* Speed bar chart */}
      <div style={{ ...glassStyle, padding: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 10 }}>
          Скорость индексации (блоков/сек, log шкала):
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SPEED_DATA.map((entry) => {
            const minWidth = (Math.log10(entry.minSpeed) / maxLog) * 100;
            const maxWidth = (Math.log10(entry.maxSpeed) / maxLog) * 100;
            return (
              <DiagramTooltip key={entry.label} content={entry.tooltip}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: entry.color, fontFamily: 'monospace' }}>
                      {entry.label}
                    </span>
                    <span style={{ fontSize: 8, color: colors.textMuted, fontFamily: 'monospace' }}>
                      {entry.minSpeed.toLocaleString()}-{entry.maxSpeed.toLocaleString()} бл/сек
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: 16,
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Min bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${minWidth}%`,
                      background: `${entry.color}30`,
                      borderRadius: 4,
                    }} />
                    {/* Max bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${maxWidth}%`,
                      background: `${entry.color}50`,
                      borderRadius: 4,
                    }} />
                  </div>
                  <div style={{ fontSize: 7, color: colors.textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                    {entry.note}
                  </div>
                </div>
              </DiagramTooltip>
            );
          })}
        </div>
      </div>

      {/* Latency comparison */}
      <div style={{ ...glassStyle, padding: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 10 }}>
          Latency до свежих данных:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LATENCY_DATA.map((entry) => (
            <DiagramTooltip key={entry.label} content={entry.tooltip}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: entry.color, fontFamily: 'monospace', minWidth: 70 }}>
                  {entry.label}
                </span>
                <div style={{
                  height: 12,
                  width: `${entry.barWidth}%`,
                  background: `${entry.color}50`,
                  borderRadius: 4,
                  minWidth: 4,
                }} />
                <span style={{ fontSize: 8, color: colors.textMuted, fontFamily: 'monospace' }}>
                  {entry.latency}
                </span>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      <DiagramTooltip content="На mainnet с миллионами блоков разница критична: Subsquid индексирует историю за минуты, The Graph -- за часы. Для локальной разработки (десятки блоков) разница незаметна.">
        <DataBox
          label="Почему такая разница?"
          value="Subsquid до 50x быстрее The Graph благодаря батч-обработке и прямому доступу к данным через SQD Network. Для локальной разработки с Anvil разница менее заметна (десятки блоков), но на mainnet/testnet -- принципиальна."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  DecisionTreeDiagram                                                */
/* ================================================================== */

interface TreeNode {
  id: string;
  question: string;
  options: TreeOption[];
  isEnd?: boolean;
  result?: string;
  resultColor?: string;
}

interface TreeOption {
  label: string;
  nextId: string;
}

const TREE_NODES: (TreeNode & { tooltip?: string })[] = [
  {
    id: 'root',
    question: 'Какой индексатор выбрать?',
    options: [
      { label: 'Начать', nextId: 'decentralized' },
    ],
    tooltip: 'Дерево решений помогает выбрать индексатор для вашего проекта. Ответьте на 3-4 вопроса о требованиях и получите рекомендацию.',
  },
  {
    id: 'decentralized',
    question: 'Нужна децентрализация?',
    options: [
      { label: 'Да', nextId: 'the-graph-result' },
      { label: 'Нет', nextId: 'language' },
    ],
    tooltip: 'Децентрализация означает, что индексатор работает в распределённой сети без единой точки отказа. Только The Graph предоставляет полноценную децентрализованную сеть (Graph Network).',
  },
  {
    id: 'the-graph-result',
    question: '',
    options: [],
    isEnd: true,
    result: 'The Graph (GRT staking, децентрализованная сеть)',
    resultColor: '#a78bfa',
    tooltip: 'The Graph -- единственный индексатор с полноценной децентрализованной сетью. Indexers стейкают GRT и получают вознаграждение за обработку запросов. Гарантия доступности данных.',
  },
  {
    id: 'language',
    question: 'Язык маппингов?',
    options: [
      { label: 'TypeScript', nextId: 'multichain' },
      { label: 'AssemblyScript OK', nextId: 'the-graph-result-2' },
    ],
    tooltip: 'Язык маппингов определяет developer experience. TypeScript -- полноценный язык с npm-экосистемой. AssemblyScript -- подмножество TypeScript с ограничениями (нет async/await, Array.filter).',
  },
  {
    id: 'the-graph-result-2',
    question: '',
    options: [],
    isEnd: true,
    result: 'The Graph (зрелая экосистема, широкое сообщество)',
    resultColor: '#a78bfa',
    tooltip: 'The Graph имеет крупнейшую экосистему: тысячи subgraphs на Subgraph Studio, активное сообщество, отличная документация. AssemblyScript ограничивает, но экосистема компенсирует.',
  },
  {
    id: 'multichain',
    question: 'Мультисеть из коробки?',
    options: [
      { label: 'Да', nextId: 'subquery-result' },
      { label: 'Нет', nextId: 'speed' },
    ],
    tooltip: 'Мультисеть -- индексация нескольких блокчейнов одним проектом. SubQuery поддерживает это нативно через multi-chain manifest. Subsquid требует отдельные процессоры.',
  },
  {
    id: 'subquery-result',
    question: '',
    options: [],
    isEnd: true,
    result: 'SubQuery (multi-chain manifest, TypeScript)',
    resultColor: '#22c55e',
    tooltip: 'SubQuery -- лучший выбор для мультисетевых проектов. Один manifest индексирует Ethereum, Polkadot, Cosmos и другие сети. TypeScript маппинги без ограничений.',
  },
  {
    id: 'speed',
    question: 'Максимальная скорость?',
    options: [
      { label: 'Да', nextId: 'subsquid-result' },
      { label: 'Не приоритет', nextId: 'subsquid-result-2' },
    ],
    tooltip: 'Скорость критична для mainnet: Subsquid индексирует историю Ethereum за минуты (50K бл/сек), The Graph -- за часы (150 бл/сек). Для новых проектов с малой историей -- менее важно.',
  },
  {
    id: 'subsquid-result',
    question: '',
    options: [],
    isEnd: true,
    result: 'Subsquid (SQD Network, 50K блоков/сек)',
    resultColor: '#3b82f6',
    tooltip: 'Subsquid с SQD Network -- самый быстрый вариант. Батч-обработка + прямой доступ к данным через SQD Network вместо RPC. Идеален для аналитики и DeFi-дашбордов.',
  },
  {
    id: 'subsquid-result-2',
    question: '',
    options: [],
    isEnd: true,
    result: 'Subsquid (TypeScript, удобный, хорошая документация)',
    resultColor: '#3b82f6',
    tooltip: 'Subsquid -- оптимальный выбор по умолчанию: TypeScript без ограничений, хорошая документация, бесплатный self-hosted. Подходит для большинства проектов.',
  },
];

export function DecisionTreeDiagram() {
  const [path, setPath] = useState<string[]>(['root']);

  const currentId = path[path.length - 1];
  const currentNode = TREE_NODES.find((n) => n.id === currentId);

  const handleChoice = (nextId: string) => {
    setPath([...path, nextId]);
  };

  const handleReset = () => {
    setPath(['root']);
  };

  const handleBack = () => {
    if (path.length > 1) {
      setPath(path.slice(0, -1));
    }
  };

  return (
    <DiagramContainer title="Дерево решений: какой индексатор использовать?" color="orange">
      {/* Path breadcrumb */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {path.map((nodeId, i) => {
          const node = TREE_NODES.find((n) => n.id === nodeId);
          if (!node) return null;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>&rarr;</span>}
              <span style={{
                fontSize: 8,
                fontFamily: 'monospace',
                padding: '3px 6px',
                borderRadius: 4,
                background: node.isEnd ? `${node.resultColor}15` : 'rgba(255,255,255,0.05)',
                color: node.isEnd ? node.resultColor : colors.textMuted,
                border: `1px solid ${node.isEnd ? `${node.resultColor}30` : 'rgba(255,255,255,0.08)'}`,
              }}>
                {node.isEnd ? node.result : (node.question.length > 25 ? node.question.slice(0, 25) + '...' : node.question)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current node */}
      {currentNode && (
        <DiagramTooltip content={currentNode.tooltip || ''}>
          <div style={{
            ...glassStyle,
            padding: 16,
            marginBottom: 12,
            border: `1px solid ${currentNode.isEnd ? `${currentNode.resultColor}30` : 'rgba(245,158,11,0.2)'}`,
            background: currentNode.isEnd ? `${currentNode.resultColor}06` : 'rgba(255,255,255,0.02)',
          }}>
            {currentNode.isEnd ? (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
                  Рекомендация:
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: currentNode.resultColor, fontFamily: 'monospace' }}>
                  {currentNode.result}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace', marginBottom: 12 }}>
                  {currentNode.question}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {currentNode.options.map((opt) => (
                    <button
                      key={opt.nextId}
                      onClick={() => handleChoice(opt.nextId)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: '1px solid rgba(245,158,11,0.3)',
                        background: 'rgba(245,158,11,0.1)',
                        color: '#f59e0b',
                        fontSize: 11,
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </DiagramTooltip>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={handleBack} disabled={path.length <= 1} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: path.length > 1 ? colors.text : colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: path.length > 1 ? 'pointer' : 'not-allowed',
        }}>
          Back
        </button>
        <button onClick={handleReset} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: 'pointer',
        }}>
          Reset
        </button>
      </div>

      <DiagramTooltip content="В этом курсе вы практикуете Subsquid (LAB-05, LAB-06) и The Graph (LAB-07). SubQuery изучается концептуально для понимания альтернатив на рынке.">
        <DataBox
          label="Для этого курса"
          value="Subsquid как primary tool (TypeScript, быстрый, удобный). The Graph как secondary (зрелая экосистема, важен для индустрии). SubQuery -- концептуальное сравнение."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
