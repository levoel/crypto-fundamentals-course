/** @jsxImportSource solid-js */
/**
 * The Graph Diagrams (INDEX-07)
 *
 * Exports:
 * - GraphNodeArchitectureDiagram: Graph Node architecture with hover tooltips (static)
 * - SubgraphManifestDiagram: Annotated subgraph.yaml anatomy (static, color-coded)
 * - AssemblyScriptComparisonDiagram: AssemblyScript vs TypeScript comparison table with code examples (static)
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  GraphNodeArchitectureDiagram                                       */
/* ================================================================== */

interface GraphNodeComponent {
  id: string;
  label: string;
  tooltip: string;
  color: string;
  isSubComponent?: boolean;
}

const GRAPH_NODE_COMPONENTS: GraphNodeComponent[] = [
  { id: 'anvil', label: 'EVM Node (Anvil)', tooltip: 'Локальный Ethereum-узел. Предоставляет JSON-RPC для Graph Node на порту 8545.', color: '#a78bfa' },
  { id: 'graph-node', label: 'Graph Node', tooltip: 'Монолитный Rust binary. Одновременно читает блокчейн, исполняет WASM-маппинги, хранит данные, отдаёт GraphQL.', color: '#3b82f6' },
  { id: 'ipfs', label: 'IPFS (Kubo v0.17.0)', tooltip: 'Хранит subgraph manifests, схемы, WASM-файлы. Обязателен для deployment. Порт 5001.', color: '#22c55e' },
  { id: 'postgres', label: 'PostgreSQL', tooltip: 'Хранит проиндексированные данные. Порт 5434 в LAB-07.', color: '#eab308' },
  { id: 'graphql', label: 'GraphQL Endpoint', tooltip: 'HTTP: порт 8000. WebSocket: порт 8001. Admin: порт 8020.', color: '#f59e0b' },
  { id: 'dapp', label: 'dApp / Frontend', tooltip: 'Клиентское приложение, использующее GraphQL API.', color: '#06b6d4' },
];

const GRAPH_NODE_SUB_COMPONENTS = [
  { label: 'Ethereum Adapter', desc: 'Подключается к RPC' },
  { label: 'Block Ingestor', desc: 'Читает блоки' },
  { label: 'Subgraph Processor', desc: 'Запускает WASM маппинги' },
  { label: 'Store Interface', desc: 'Пишет в PostgreSQL' },
];

export function GraphNodeArchitectureDiagram() {
  return (
    <DiagramContainer title="Архитектура Graph Node: от блокчейна до API" color="purple">
      {/* Main pipeline */}
      <div style={{ 'display': 'flex', 'gap': '6px', 'align-items': 'center', 'margin-bottom': '12px', 'overflow-x': 'auto', 'padding-bottom': '8px' }}>
        {GRAPH_NODE_COMPONENTS.filter((c) => c.id !== 'ipfs').map((comp, i, arr) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px', 'flex-shrink': '0' }}>
            <DiagramTooltip content={comp.tooltip}>
              <div
                style={{
                  ...glassStyle,
                  'padding': '10px 12px',
                  'border': `1px solid ${comp.color}20`,
                  'background': 'rgba(255,255,255,0.02)',
                  'text-align': 'center',
                  'min-width': '90px',
                }}
              >
                <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': comp.color, 'font-family': 'monospace' }}>
                  {comp.label}
                </div>
              </div>
            </DiagramTooltip>
            {i < arr.length - 1 && (
              <div style={{ 'font-size': '14px', 'color': 'rgba(255,255,255,0.25)' }}>&rarr;</div>
            )}
          </div>
        ))}
      </div>

      {/* IPFS + Graph Node sub-components */}
      <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '8px', 'margin-bottom': '12px' }}>
        {/* IPFS */}
        <DiagramTooltip content="IPFS (InterPlanetary File System) хранит subgraph manifests, GraphQL-схемы и скомпилированные WASM-файлы. Обязателен для deploy -- Graph Node скачивает subgraph из IPFS по CID.">
          <div
            style={{
              ...glassStyle,
              'padding': '10px',
              'border': '1px solid rgba(34,197,94,0.15)',
            }}
          >
            <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#22c55e', 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              IPFS (Kubo v0.17.0)
            </div>
            <div style={{ 'font-size': '8px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
              Subgraph manifests, схемы, WASM
            </div>
            <div style={{ 'font-size': '9px', 'color': '#22c55e', 'margin-top': '4px' }}>&uarr; upload subgraph</div>
          </div>
        </DiagramTooltip>

        {/* Graph Node internals */}
        <DiagramTooltip content="Graph Node -- монолитный Rust binary с четырьмя подсистемами: Ethereum Adapter (RPC), Block Ingestor (чтение блоков), Subgraph Processor (WASM маппинги), Store Interface (запись в PostgreSQL).">
          <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#3b82f6', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
              Graph Node (внутренние компоненты):
            </div>
            <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '4px' }}>
              {GRAPH_NODE_SUB_COMPONENTS.map((sub) => (
                <div style={{
                  ...glassStyle,
                  'padding': '4px 6px',
                  'border': '1px solid rgba(59,130,246,0.1)',
                  'font-size': '7px',
                  'font-family': 'monospace',
                }}>
                  <div style={{ 'color': '#3b82f6', 'font-weight': '600' }}>{sub.label}</div>
                  <div style={{ 'color': colors.textMuted }}>{sub.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </DiagramTooltip>
      </div>

      <DiagramTooltip content="Graph Node потребляет значительно больше ресурсов, чем Subsquid. Для локальной разработки необходимы Graph Node + IPFS + PostgreSQL (3 сервиса). Subsquid требует только PostgreSQL.">
        <DataBox
          label="Ресурсоёмкость"
          value="Graph Node -- монолитный Rust binary. Он одновременно: читает блокчейн, исполняет WASM-маппинги, хранит данные, отдаёт GraphQL. Ресурсоёмкий (~512MB-1GB RAM), но самодостаточный."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SubgraphManifestDiagram                                            */
/* ================================================================== */

interface ManifestLine {
  code: string;
  annotation: string;
  color: string;
  highlight?: boolean;
}

const MANIFEST_LINES: (ManifestLine & { tooltip?: string })[] = [
  { code: 'specVersion: 0.0.5', annotation: 'Версия спецификации', color: '#94a3b8', tooltip: 'specVersion определяет формат манифеста. Версия 0.0.5 -- текущая стабильная. Более новые версии могут добавлять поля, но обратно совместимы.' },
  { code: 'schema:', annotation: '', color: '#94a3b8' },
  { code: '  file: ./schema.graphql', annotation: 'GraphQL схема сущностей', color: '#22c55e', tooltip: 'schema.graphql -- единственный источник истины для модели данных. Из него генерируются AssemblyScript-типы (graph codegen) и GraphQL API.' },
  { code: 'dataSources:', annotation: 'Источники данных (контракты)', color: '#3b82f6', tooltip: 'dataSources -- список смарт-контрактов для индексации. Каждый dataSource привязан к конкретному контракту и определяет, какие события обрабатывать.' },
  { code: '  - kind: ethereum/contract', annotation: 'Тип: Ethereum контракт', color: '#3b82f6' },
  { code: '    network: localhost', annotation: 'ВАЖНО: должно совпадать с ethereum env в Graph Node', color: '#ef4444', highlight: true, tooltip: 'network ДОЛЖЕН совпадать с именем сети в docker-compose.yml (ethereum env). Несовпадение -- самая частая ошибка при локальной разработке.' },
  { code: '    source:', annotation: '', color: '#94a3b8' },
  { code: '      address: "0x5FbDB..."', annotation: 'Адрес контракта', color: '#f59e0b', tooltip: 'Адрес задеплоенного контракта. При деплое на Hardhat/Anvil адрес создаётся автоматически. Должен быть в checksum-формате.' },
  { code: '      abi: SimpleToken', annotation: 'Имя ABI', color: '#f59e0b' },
  { code: '      startBlock: 1', annotation: 'Начальный блок для индексации', color: '#f59e0b', tooltip: 'startBlock -- с какого блока начинать индексацию. Для локальной разработки -- 1. Для mainnet -- блок деплоя контракта (экономит время синхронизации).' },
  { code: '    mapping:', annotation: '', color: '#94a3b8' },
  { code: '      language: wasm/assemblyscript', annotation: 'НЕ TypeScript! AssemblyScript -> WASM', color: '#ef4444', highlight: true, tooltip: 'AssemblyScript компилируется в WebAssembly и исполняется в sandbox внутри Graph Node. Это обеспечивает безопасность, но ограничивает возможности языка.' },
  { code: '      entities:', annotation: '', color: '#94a3b8' },
  { code: '        - Transfer', annotation: '', color: '#94a3b8' },
  { code: '      eventHandlers:', annotation: 'Список обработчиков событий', color: '#22c55e', tooltip: 'eventHandlers маппят события контракта на функции-обработчики. Сигнатура события (Transfer(indexed address,...)) должна точно соответствовать ABI.' },
  { code: '        - event: Transfer(indexed address,indexed address,uint256)', annotation: '', color: '#22c55e' },
  { code: '          handler: handleTransfer', annotation: '', color: '#22c55e' },
  { code: '      file: ./src/mapping.ts', annotation: 'Файл с обработчиками', color: '#a78bfa', tooltip: 'mapping.ts содержит функции-обработчики (handleTransfer и др.). Несмотря на расширение .ts, код пишется на AssemblyScript с его ограничениями.' },
];

export function SubgraphManifestDiagram() {
  return (
    <DiagramContainer title="Анатомия subgraph.yaml: манифест индексатора" color="blue">
      {/* Annotated code */}
      <div style={{ ...glassStyle, 'padding': '12px', 'margin-bottom': '16px', 'border': '1px solid rgba(255,255,255,0.08)', 'max-height': '380px', 'overflow-y': 'auto' }}>
        {MANIFEST_LINES.map((line, i) => {
          const lineContent = (
            <div style={{
              'display': 'flex',
              'gap': '12px',
              'align-items': 'flex-start',
              'padding': '2px 0',
              'background': line.highlight ? 'rgba(239,68,68,0.06)' : 'transparent',
              'border-left': line.highlight ? '2px solid rgba(239,68,68,0.4)' : '2px solid transparent',
              'padding-left': '6px',
            }}>
              <div style={{
                'flex': '1',
                'font-size': '9px',
                'font-family': 'monospace',
                'color': line.color,
                'white-space': 'pre',
                'line-height': '1.7',
              }}>
                {line.code}
              </div>
              {line.annotation && (
                <div style={{
                  'font-size': '8px',
                  'font-family': 'monospace',
                  'color': line.highlight ? '#ef4444' : colors.textMuted,
                  'font-style': 'italic',
                  'min-width': '180px',
                  'line-height': '1.7',
                  'flex-shrink': '0',
                }}>
                  {line.annotation}
                </div>
              )}
            </div>
          );

          return line.tooltip ? (
            <DiagramTooltip content={line.tooltip}>
              {lineContent}
            </DiagramTooltip>
          ) : (
            <div>{lineContent}</div>
          );
        })}
      </div>

      <DiagramTooltip content="Минимальный subgraph -- три файла. subgraph.yaml связывает их вместе: указывает контракт, схему и маппинги. graph deploy загружает всё в IPFS и регистрирует в Graph Node.">
        <DataBox
          label="Три файла = один subgraph"
          value="subgraph.yaml -- описание ЧТО индексировать. mapping.ts -- описание КАК обрабатывать. schema.graphql -- описание КАК хранить. Три файла определяют весь subgraph."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AssemblyScriptComparisonDiagram                                    */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  typescript: string;
  assemblyscript: string;
  tsColor: string;
  asColor: string;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { aspect: 'Синтаксис', typescript: 'Полный TypeScript', assemblyscript: 'Подмножество TypeScript', tsColor: '#22c55e', asColor: '#f59e0b' },
  { aspect: 'Среда выполнения', typescript: 'Node.js', assemblyscript: 'WebAssembly (WASM)', tsColor: '#22c55e', asColor: '#f59e0b' },
  { aspect: 'async/await', typescript: 'Да', assemblyscript: 'Нет', tsColor: '#22c55e', asColor: '#ef4444' },
  { aspect: 'Array.filter/map', typescript: 'Да', assemblyscript: 'Нет (for loop)', tsColor: '#22c55e', asColor: '#ef4444' },
  { aspect: 'Closures', typescript: 'Да', assemblyscript: 'Ограничено', tsColor: '#22c55e', asColor: '#f59e0b' },
  { aspect: 'Nullable types', typescript: 'T | null', assemblyscript: 'T | null (stricter)', tsColor: '#22c55e', asColor: '#f59e0b' },
  { aspect: 'String operations', typescript: 'Полные', assemblyscript: 'Ограничены (no regex)', tsColor: '#22c55e', asColor: '#ef4444' },
  { aspect: 'JSON parsing', typescript: 'JSON.parse()', assemblyscript: 'Нет встроенного', tsColor: '#22c55e', asColor: '#ef4444' },
  { aspect: 'Entity API', typescript: 'TypeORM (store.insert)', assemblyscript: 'entity.save()', tsColor: '#3b82f6', asColor: '#a78bfa' },
  { aspect: 'Типы данных', typescript: 'BigInt, ethers.js types', assemblyscript: 'BigInt, Bytes, Address', tsColor: '#3b82f6', asColor: '#a78bfa' },
];

export function AssemblyScriptComparisonDiagram() {
  return (
    <DiagramContainer title="AssemblyScript vs TypeScript: ключевые отличия" color="orange">
      {/* Comparison table */}
      <div style={{ 'overflow-x': 'auto', 'margin-bottom': '16px' }}>
        <table style={{ 'width': '100%', 'border-collapse': 'collapse', 'font-size': '9px', 'font-family': 'monospace' }}>
          <thead>
            <tr>
              <th style={{
                'padding': '6px 10px',
                'text-align': 'left',
                'border-bottom': '1px solid rgba(255,255,255,0.1)',
                'color': colors.textMuted,
                'font-weight': '600',
              }}>
                <DiagramTooltip content="Каждый аспект показывает конкретное различие между TypeScript (Subsquid) и AssemblyScript (The Graph) -- от синтаксиса до API работы с данными.">
                  <span>Аспект</span>
                </DiagramTooltip>
              </th>
              <th style={{
                'padding': '6px 10px',
                'text-align': 'left',
                'border-bottom': '1px solid rgba(34,197,94,0.2)',
                'color': '#22c55e',
                'font-weight': '600',
              }}>
                <DiagramTooltip content="Subsquid использует полноценный TypeScript с Node.js runtime. Все npm-пакеты, async/await, Array методы -- всё доступно без ограничений.">
                  <span>TypeScript (Subsquid)</span>
                </DiagramTooltip>
              </th>
              <th style={{
                'padding': '6px 10px',
                'text-align': 'left',
                'border-bottom': '1px solid rgba(245,158,11,0.2)',
                'color': '#f59e0b',
                'font-weight': '600',
              }}>
                <DiagramTooltip content="The Graph использует AssemblyScript -- подмножество TypeScript, компилируемое в WebAssembly. Синтаксис похож, но многие стандартные возможности TypeScript отсутствуют.">
                  <span>AssemblyScript (The Graph)</span>
                </DiagramTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr>
                <td style={{
                  'padding': '5px 10px',
                  'border-bottom': '1px solid rgba(255,255,255,0.04)',
                  'color': colors.text,
                }}>
                  {row.aspect}
                </td>
                <td style={{
                  'padding': '5px 10px',
                  'border-bottom': '1px solid rgba(255,255,255,0.04)',
                  'color': row.tsColor,
                }}>
                  {row.typescript}
                </td>
                <td style={{
                  'padding': '5px 10px',
                  'border-bottom': '1px solid rgba(255,255,255,0.04)',
                  'color': row.asColor,
                }}>
                  {row.assemblyscript}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Code comparison */}
      <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '8px', 'margin-bottom': '16px' }}>
        <DiagramTooltip content="Subsquid: батч-обработка. Получаем массив событий, фильтруем .filter(), маппим .map(), вставляем массивом через ctx.store.insert(). Одна SQL-транзакция на батч.">
          <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#22c55e', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
              Subsquid: обычный TypeScript
            </div>
            <pre style={{
              'font-size': '8px',
              'font-family': 'monospace',
              'color': colors.text,
              'line-height': '1.6',
              'margin': '0',
              'white-space': 'pre-wrap',
              'word-break': 'break-word',
            }}>
{`// Subsquid: обычный TypeScript
const transfers = events
  .filter(e => e.topic0 === TRANSFER_TOPIC)
  .map(e => new Transfer({ ... }))
await ctx.store.insert(transfers)`}
            </pre>
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="The Graph: по-событийная обработка. Каждое событие вызывает отдельный handler. entity.save() -- синхронный вызов (нет async). Каждый save() -- отдельная запись в БД.">
          <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#f59e0b', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
              Graph: AssemblyScript (НЕ TypeScript!)
            </div>
            <pre style={{
              'font-size': '8px',
              'font-family': 'monospace',
              'color': colors.text,
              'line-height': '1.6',
              'margin': '0',
              'white-space': 'pre-wrap',
              'word-break': 'break-word',
            }}>
{`// Graph: AssemblyScript (НЕ TypeScript!)
// Нет .filter(), нет .map(), нет await
export function handleTransfer(
  event: TransferEvent
): void {
  let entity = new Transfer(...)
  entity.from = event.params.from
  entity.save()  // Не async!
}`}
            </pre>
          </div>
        </DiagramTooltip>
      </div>

      <DiagramTooltip content="Это главная причина, почему многие разработчики предпочитают Subsquid: полный TypeScript без ограничений. Но The Graph остаётся стандартом индустрии благодаря децентрализованной сети Graph Network.">
        <DataBox
          label="Главное отличие"
          value="AssemblyScript ВЫГЛЯДИТ как TypeScript, но это другой язык. Компилируется в WASM для безопасного исполнения в Graph Node. Отсутствие async/await и стандартных Array-методов -- главный источник путаницы."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
