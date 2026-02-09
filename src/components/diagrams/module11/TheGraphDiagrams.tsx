/**
 * The Graph Diagrams (INDEX-07)
 *
 * Exports:
 * - GraphNodeArchitectureDiagram: Graph Node architecture with hover tooltips (static)
 * - SubgraphManifestDiagram: Annotated subgraph.yaml anatomy (static, color-coded)
 * - AssemblyScriptComparisonDiagram: AssemblyScript vs TypeScript comparison table with code examples (static)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hoveredComponent = hoveredId ? GRAPH_NODE_COMPONENTS.find((c) => c.id === hoveredId) : null;

  return (
    <DiagramContainer title="Архитектура Graph Node: от блокчейна до API" color="purple">
      {/* Main pipeline */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {GRAPH_NODE_COMPONENTS.filter((c) => c.id !== 'ipfs').map((comp, i, arr) => (
          <div key={comp.id} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div
              onMouseEnter={() => setHoveredId(comp.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...glassStyle,
                padding: '10px 12px',
                border: `1px solid ${hoveredId === comp.id ? `${comp.color}50` : `${comp.color}20`}`,
                background: hoveredId === comp.id ? `${comp.color}10` : 'rgba(255,255,255,0.02)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: 90,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 600, color: comp.color, fontFamily: 'monospace' }}>
                {comp.label}
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>&rarr;</div>
            )}
          </div>
        ))}
      </div>

      {/* IPFS + Graph Node sub-components */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {/* IPFS */}
        <div
          onMouseEnter={() => setHoveredId('ipfs')}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            ...glassStyle,
            padding: 10,
            border: `1px solid ${hoveredId === 'ipfs' ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.15)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', fontFamily: 'monospace', marginBottom: 4 }}>
            IPFS (Kubo v0.17.0)
          </div>
          <div style={{ fontSize: 8, color: colors.textMuted, fontFamily: 'monospace' }}>
            Subgraph manifests, схемы, WASM
          </div>
          <div style={{ fontSize: 9, color: '#22c55e', marginTop: 4 }}>&uarr; upload subgraph</div>
        </div>

        {/* Graph Node internals */}
        <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace', marginBottom: 6 }}>
            Graph Node (внутренние компоненты):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {GRAPH_NODE_SUB_COMPONENTS.map((sub) => (
              <div key={sub.label} style={{
                ...glassStyle,
                padding: '4px 6px',
                border: '1px solid rgba(59,130,246,0.1)',
                fontSize: 7,
                fontFamily: 'monospace',
              }}>
                <div style={{ color: '#3b82f6', fontWeight: 600 }}>{sub.label}</div>
                <div style={{ color: colors.textMuted }}>{sub.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredComponent && (
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 12,
          border: `1px solid ${hoveredComponent.color}30`,
          background: `${hoveredComponent.color}06`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: hoveredComponent.color, fontFamily: 'monospace', marginBottom: 4 }}>
            {hoveredComponent.label}
          </div>
          <div style={{ fontSize: 10, color: colors.text, lineHeight: 1.6 }}>
            {hoveredComponent.tooltip}
          </div>
        </div>
      )}

      <DataBox
        label="Ресурсоёмкость"
        value="Graph Node -- монолитный Rust binary. Он одновременно: читает блокчейн, исполняет WASM-маппинги, хранит данные, отдаёт GraphQL. Ресурсоёмкий (~512MB-1GB RAM), но самодостаточный."
        variant="info"
      />
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

const MANIFEST_LINES: ManifestLine[] = [
  { code: 'specVersion: 0.0.5', annotation: 'Версия спецификации', color: '#94a3b8' },
  { code: 'schema:', annotation: '', color: '#94a3b8' },
  { code: '  file: ./schema.graphql', annotation: 'GraphQL схема сущностей', color: '#22c55e' },
  { code: 'dataSources:', annotation: 'Источники данных (контракты)', color: '#3b82f6' },
  { code: '  - kind: ethereum/contract', annotation: 'Тип: Ethereum контракт', color: '#3b82f6' },
  { code: '    network: localhost', annotation: 'ВАЖНО: должно совпадать с ethereum env в Graph Node', color: '#ef4444', highlight: true },
  { code: '    source:', annotation: '', color: '#94a3b8' },
  { code: '      address: "0x5FbDB..."', annotation: 'Адрес контракта', color: '#f59e0b' },
  { code: '      abi: SimpleToken', annotation: 'Имя ABI', color: '#f59e0b' },
  { code: '      startBlock: 1', annotation: 'Начальный блок для индексации', color: '#f59e0b' },
  { code: '    mapping:', annotation: '', color: '#94a3b8' },
  { code: '      language: wasm/assemblyscript', annotation: 'НЕ TypeScript! AssemblyScript -> WASM', color: '#ef4444', highlight: true },
  { code: '      entities:', annotation: '', color: '#94a3b8' },
  { code: '        - Transfer', annotation: '', color: '#94a3b8' },
  { code: '      eventHandlers:', annotation: 'Список обработчиков событий', color: '#22c55e' },
  { code: '        - event: Transfer(indexed address,indexed address,uint256)', annotation: '', color: '#22c55e' },
  { code: '          handler: handleTransfer', annotation: '', color: '#22c55e' },
  { code: '      file: ./src/mapping.ts', annotation: 'Файл с обработчиками', color: '#a78bfa' },
];

export function SubgraphManifestDiagram() {
  return (
    <DiagramContainer title="Анатомия subgraph.yaml: манифест индексатора" color="blue">
      {/* Annotated code */}
      <div style={{ ...glassStyle, padding: 12, marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)', maxHeight: 380, overflowY: 'auto' }}>
        {MANIFEST_LINES.map((line, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            padding: '2px 0',
            background: line.highlight ? 'rgba(239,68,68,0.06)' : 'transparent',
            borderLeft: line.highlight ? '2px solid rgba(239,68,68,0.4)' : '2px solid transparent',
            paddingLeft: 6,
          }}>
            <div style={{
              flex: 1,
              fontSize: 9,
              fontFamily: 'monospace',
              color: line.color,
              whiteSpace: 'pre',
              lineHeight: 1.7,
            }}>
              {line.code}
            </div>
            {line.annotation && (
              <div style={{
                fontSize: 8,
                fontFamily: 'monospace',
                color: line.highlight ? '#ef4444' : colors.textMuted,
                fontStyle: 'italic',
                minWidth: 180,
                lineHeight: 1.7,
                flexShrink: 0,
              }}>
                {line.annotation}
              </div>
            )}
          </div>
        ))}
      </div>

      <DataBox
        label="Три файла = один subgraph"
        value="subgraph.yaml -- описание ЧТО индексировать. mapping.ts -- описание КАК обрабатывать. schema.graphql -- описание КАК хранить. Три файла определяют весь subgraph."
        variant="info"
      />
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
      <div style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, fontFamily: 'monospace' }}>
          <thead>
            <tr>
              <th style={{
                padding: '6px 10px',
                textAlign: 'left',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: colors.textMuted,
                fontWeight: 600,
              }}>
                Аспект
              </th>
              <th style={{
                padding: '6px 10px',
                textAlign: 'left',
                borderBottom: '1px solid rgba(34,197,94,0.2)',
                color: '#22c55e',
                fontWeight: 600,
              }}>
                TypeScript (Subsquid)
              </th>
              <th style={{
                padding: '6px 10px',
                textAlign: 'left',
                borderBottom: '1px solid rgba(245,158,11,0.2)',
                color: '#f59e0b',
                fontWeight: 600,
              }}>
                AssemblyScript (The Graph)
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.aspect}>
                <td style={{
                  padding: '5px 10px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: colors.text,
                }}>
                  {row.aspect}
                </td>
                <td style={{
                  padding: '5px 10px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: row.tsColor,
                }}>
                  {row.typescript}
                </td>
                <td style={{
                  padding: '5px 10px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  color: row.asColor,
                }}>
                  {row.assemblyscript}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Code comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#22c55e', fontFamily: 'monospace', marginBottom: 6 }}>
            Subsquid: обычный TypeScript
          </div>
          <pre style={{
            fontSize: 8,
            fontFamily: 'monospace',
            color: colors.text,
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
{`// Subsquid: обычный TypeScript
const transfers = events
  .filter(e => e.topic0 === TRANSFER_TOPIC)
  .map(e => new Transfer({ ... }))
await ctx.store.insert(transfers)`}
          </pre>
        </div>
        <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace', marginBottom: 6 }}>
            Graph: AssemblyScript (НЕ TypeScript!)
          </div>
          <pre style={{
            fontSize: 8,
            fontFamily: 'monospace',
            color: colors.text,
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
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
      </div>

      <DataBox
        label="Главное отличие"
        value="AssemblyScript ВЫГЛЯДИТ как TypeScript, но это другой язык. Компилируется в WASM для безопасного исполнения в Graph Node. Отсутствие async/await и стандартных Array-методов -- главный источник путаницы."
        variant="info"
      />
    </DiagramContainer>
  );
}
