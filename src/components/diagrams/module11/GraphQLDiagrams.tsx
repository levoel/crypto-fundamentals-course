/** @jsxImportSource solid-js */
/**
 * GraphQL Diagrams (INDEX-02)
 *
 * Exports:
 * - GraphQLSchemaDesignDiagram: Three-panel schema design (entities, relations, indexes) with codegen pipeline (static)
 * - GraphQLQueryBuilderDiagram: Interactive GraphQL query builder with entity/field selector and generated query display
 */

import { createMemo, createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  GraphQLSchemaDesignDiagram                                         */
/* ================================================================== */

interface SchemaPanel {
  title: string;
  code: string;
  annotation: string;
  color: string;
}

const SCHEMA_PANELS: (SchemaPanel & { tooltip: string })[] = [
  {
    title: 'Сущности (Entities)',
    code: `type Transfer @entity {
  id: ID!
  from: String!
  to: String!
  value: BigInt!
  timestamp: DateTime!
  blockNumber: Int!
  txHash: String!
}`,
    annotation: '@entity = таблица в PostgreSQL. Каждое поле = колонка.',
    color: '#22c55e',
    tooltip: 'Entity -- это таблица в PostgreSQL. Transfer @entity создаёт таблицу transfer с колонками id, from, to, value и т.д. Codegen генерирует TypeORM класс автоматически.',
  },
  {
    title: 'Связи (Relations)',
    code: `type Account @entity {
  id: ID!
  balance: BigInt!
  transfersFrom: [Transfer!]
    @derivedFrom(field: "from")
  transfersTo: [Transfer!]
    @derivedFrom(field: "to")
}`,
    annotation: '@derivedFrom = обратная связь. Account.transfersFrom -- все трансферы ОТ этого аккаунта.',
    color: '#3b82f6',
    tooltip: '@derivedFrom создаёт обратную связь без дополнительной колонки. Account.transfersFrom автоматически находит все Transfer, где from = account.id. Это SQL JOIN под капотом.',
  },
  {
    title: 'Индексы (@index)',
    code: `type Transfer @entity {
  id: ID!
  from: String! @index
  to: String! @index
  blockNumber: Int! @index
}`,
    annotation: '@index = B-tree индекс в PostgreSQL. Ускоряет WHERE from = \'0x...\' запросы.',
    color: '#f59e0b',
    tooltip: '@index создаёт B-tree индекс в PostgreSQL. Без индекса поиск по адресу -- full table scan (секунды). С индексом -- O(log n) (миллисекунды). Критично для production.',
  },
];

export function GraphQLSchemaDesignDiagram() {
  return (
    <DiagramContainer title="Проектирование GraphQL схемы для блокчейн-данных" color="orange">
      {/* Three panels */}
      <div style={{ 'display': 'grid', 'grid-template-columns': 'repeat(3, 1fr)', 'gap': '8px', 'margin-bottom': '16px' }}>
        {SCHEMA_PANELS.map((panel) => (
          <DiagramTooltip content={panel.tooltip}>
            <div style={{
              ...glassStyle,
              'padding': '12px',
              'border': `1px solid ${panel.color}25`,
            }}>
              <div style={{ 'font-size': '10px', 'font-weight': '700', 'color': panel.color, 'font-family': 'monospace', 'margin-bottom': '8px' }}>
                {panel.title}
              </div>
              <pre style={{
                'font-size': '8px',
                'font-family': 'monospace',
                'color': colors.text,
                'line-height': '1.5',
                'padding': '8px 10px',
                'background': `${panel.color}08`,
                'border-radius': '4px',
                'overflow': 'auto',
                'margin': '0',
                'white-space': 'pre-wrap',
                'word-break': 'break-word',
              }}>
                {panel.code}
              </pre>
              <div style={{
                'font-size': '9px',
                'color': panel.color,
                'font-family': 'monospace',
                'margin-top': '8px',
                'padding': '6px 8px',
                'background': `${panel.color}06`,
                'border-radius': '4px',
                'border-left': `2px solid ${panel.color}40`,
                'line-height': '1.5',
              }}>
                {panel.annotation}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Codegen pipeline */}
      <DiagramTooltip content="Кодогенерация -- ключевой принцип: schema.graphql -- единственный файл, который вы пишете вручную. Все TypeORM-классы и AssemblyScript-типы генерируются автоматически.">
        <div style={{ ...glassStyle, 'padding': '12px', 'margin-bottom': '12px', 'border': '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '8px' }}>
            Кодогенерация из схемы:
          </div>
          <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center', 'flex-wrap': 'wrap' }}>
            <div style={{ ...glassStyle, 'padding': '6px 10px', 'border': '1px solid rgba(167,139,250,0.2)' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#a78bfa', 'font-family': 'monospace' }}>schema.graphql</div>
            </div>
            <div style={{ 'font-size': '12px', 'color': 'rgba(255,255,255,0.3)' }}>&rarr;</div>
            <div style={{ ...glassStyle, 'padding': '6px 10px', 'border': '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#3b82f6', 'font-family': 'monospace' }}>codegen</div>
            </div>
            <div style={{ 'font-size': '12px', 'color': 'rgba(255,255,255,0.3)' }}>&rarr;</div>
            <div style={{ 'display': 'flex', 'gap': '6px' }}>
              <div style={{ ...glassStyle, 'padding': '6px 10px', 'border': '1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ 'font-size': '8px', 'font-weight': '600', 'color': '#22c55e', 'font-family': 'monospace' }}>TypeORM entities</div>
              </div>
              <div style={{ ...glassStyle, 'padding': '6px 10px', 'border': '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ 'font-size': '8px', 'font-weight': '600', 'color': '#f59e0b', 'font-family': 'monospace' }}>AS types</div>
              </div>
            </div>
          </div>
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="Schema-first подход: определяете сущности в schema.graphql, а codegen создаёт TypeORM-классы (Subsquid) или AssemblyScript-типы (The Graph). Один файл -- два инструмента.">
        <DataBox
          label="Единственный источник истины"
          value="schema.graphql -- единственный источник истины. И Subsquid, и The Graph генерируют код из этого файла."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  GraphQLQueryBuilderDiagram                                         */
/* ================================================================== */

type EntityType = 'Transfer' | 'Account';

interface FieldDef {
  name: string;
  type: string;
  entity: EntityType;
}

const ALL_FIELDS: FieldDef[] = [
  { name: 'from', type: 'String', entity: 'Transfer' },
  { name: 'to', type: 'String', entity: 'Transfer' },
  { name: 'value', type: 'BigInt', entity: 'Transfer' },
  { name: 'blockNumber', type: 'Int', entity: 'Transfer' },
  { name: 'timestamp', type: 'DateTime', entity: 'Transfer' },
  { name: 'txHash', type: 'String', entity: 'Transfer' },
  { name: 'balance', type: 'BigInt', entity: 'Account' },
  { name: 'transfersFrom', type: '[Transfer!]', entity: 'Account' },
  { name: 'transfersTo', type: '[Transfer!]', entity: 'Account' },
];

const ORDER_OPTIONS: Record<EntityType, string[]> = {
  Transfer: ['blockNumber_DESC', 'timestamp_DESC', 'value_DESC', 'blockNumber_ASC'],
  Account: ['balance_DESC', 'balance_ASC'],
};

const MOCK_RESPONSES: Record<EntityType, string> = {
  Transfer: `{
  "data": {
    "transfers": [
      { "from": "0xa5f3...e7f8", "to": "0xb2c4...b6c8", "value": "100000", "blockNumber": 19500123 },
      { "from": "0xd1e2...f3a4", "to": "0xa5f3...e7f8", "value": "50000", "blockNumber": 19500100 }
    ]
  }
}`,
  Account: `{
  "data": {
    "accounts": [
      { "balance": "2500000", "transfersFrom": [{ "to": "0xb2c4..." }] }
    ]
  }
}`,
};

type QueryTab = 'query' | 'subscription' | 'connection';

export function GraphQLQueryBuilderDiagram() {
  const [entity, setEntity] = createSignal<EntityType>('Transfer');
  const [selectedFields, setSelectedFields] = createSignal<Set<string>>(new Set(['from', 'to', 'value', 'blockNumber']));
  const [filterValue, setFilterValue] = createSignal('0xa5f3...e7f8');
  const [orderBy, setOrderBy] = createSignal('blockNumber_DESC');
  const [limit, setLimit] = createSignal(10);
  const [queryTab, setQueryTab] = createSignal<QueryTab>('query');

  const entityFields = createMemo(() => ALL_FIELDS.filter((f) => f.entity === entity()));

  const toggleField = (name: string) => {
    const next = new Set(selectedFields());
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelectedFields(next);
  };

  const handleEntityChange = (newEntity: EntityType) => {
    setEntity(newEntity);
    if (newEntity === 'Transfer') {
      setSelectedFields(new Set(['from', 'to', 'value', 'blockNumber']));
      setOrderBy('blockNumber_DESC');
    } else {
      setSelectedFields(new Set(['balance', 'transfersFrom']));
      setOrderBy('balance_DESC');
    }
  };

  const activeFields = createMemo(
    () => entityFields.filter((f) => selectedFields().has(f.name)).map((f) => f.name),
    [entityFields, selectedFields()]);

  const pluralEntity = entity() === 'Transfer' ? 'transfers' : 'accounts';
  const filterField = entity() === 'Transfer' ? 'from_eq' : 'id_eq';

  const generatedQuery = createMemo(() => {
    const fields = activeFields.length > 0 ? activeFields.join('\n    ') : 'id';
    if (queryTab() === 'query') {
      return `query {
  ${pluralEntity}(
    orderBy: ${orderBy()},
    limit: ${limit()},
    where: { ${filterField}: "${filterValue()}" }
  ) {
    ${fields}
  }
}`;
    }
    if (queryTab() === 'subscription') {
      return `subscription {
  ${pluralEntity}(
    orderBy: ${orderBy()},
    limit: ${limit()},
    where: { ${filterField}: "${filterValue()}" }
  ) {
    ${fields}
  }
}`;
    }
    // connection
    return `query {
  ${pluralEntity}Connection(
    orderBy: ${orderBy()},
    first: ${limit()},
    where: { ${filterField}: "${filterValue()}" }
  ) {
    totalCount
    edges {
      node {
        ${fields}
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`;
  });

  return (
    <DiagramContainer title="Построение GraphQL запросов для блокчейн-данных" color="blue">
      <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1.4fr', 'gap': '12px', 'margin-bottom': '12px' }}>
        {/* Left panel -- builder */}
        <div style={{ ...glassStyle, 'padding': '12px', 'border': '1px solid rgba(59,130,246,0.15)' }}>
          {/* Entity selector */}
          <div style={{ 'margin-bottom': '10px' }}>
            <DiagramTooltip content="Сущность (Entity) -- это тип данных в вашем subgraph. Transfer хранит историю переводов, Account -- балансы и связи. Выбор сущности определяет доступные поля запроса.">
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                Сущность:
              </div>
            </DiagramTooltip>
            <div style={{ 'display': 'flex', 'gap': '6px' }}>
              {(['Transfer', 'Account'] as EntityType[]).map((e) => (
                <button
                  onClick={() => handleEntityChange(e)}
                  style={{
                    'padding': '4px 10px',
                    'border-radius': '4px',
                    'border': `1px solid ${entity() === e ? '#3b82f650' : 'rgba(255,255,255,0.1)'}`,
                    'background': entity() === e ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                    'color': entity() === e ? '#3b82f6' : colors.textMuted,
                    'font-size': '9px',
                    'font-family': 'monospace',
                    'cursor': 'pointer',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Field checkboxes */}
          <div style={{ 'margin-bottom': '10px' }}>
            <DiagramTooltip content="Поля определяют, какие данные вернёт GraphQL-запрос. Запрашивайте только нужные поля -- это преимущество GraphQL над REST (нет over-fetching).">
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                Поля:
              </div>
            </DiagramTooltip>
            <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '3px' }}>
              {entityFields.map((f) => (
                <label style={{ 'display': 'flex', 'align-items': 'center', 'gap': '6px', 'cursor': 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedFields().has(f.name)}
                    onChange={() => toggleField(f.name)}
                    style={{ 'accent-color': '#3b82f6' }}
                  />
                  <span style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': colors.text }}>
                    {f.name}
                  </span>
                  <span style={{ 'font-size': '8px', 'color': colors.textMuted, 'font-family': 'monospace' }}>
                    ({f.type})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div style={{ 'margin-bottom': '10px' }}>
            <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Фильтр ({filterField}):
            </div>
            <input
              type="text"
              value={filterValue()}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{
                'width': '100%',
                'padding': '4px 8px',
                'border-radius': '4px',
                'border': '1px solid rgba(255,255,255,0.1)',
                'background': 'rgba(255,255,255,0.05)',
                'color': colors.text,
                'font-size': '9px',
                'font-family': 'monospace',
                'box-sizing': 'border-box',
              }}
            />
          </div>

          {/* Order */}
          <div style={{ 'margin-bottom': '10px' }}>
            <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Сортировка:
            </div>
            <select
              value={orderBy()}
              onChange={(e) => setOrderBy(e.target.value)}
              style={{
                'width': '100%',
                'padding': '4px 8px',
                'border-radius': '4px',
                'border': '1px solid rgba(255,255,255,0.1)',
                'background': 'rgba(255,255,255,0.05)',
                'color': colors.text,
                'font-size': '9px',
                'font-family': 'monospace',
              }}
            >
              {ORDER_OPTIONS[entity()].map((opt) => (
                <option value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Limit */}
          <div>
            <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
              Лимит:
            </div>
            <input
              type="number"
              value={limit()}
              onChange={(e) => setLimit(Math.max(1, Math.min(100, Number(e.target.value) || 10)))}
              style={{
                'width': '60px',
                'padding': '4px 8px',
                'border-radius': '4px',
                'border': '1px solid rgba(255,255,255,0.1)',
                'background': 'rgba(255,255,255,0.05)',
                'color': colors.text,
                'font-size': '9px',
                'font-family': 'monospace',
              }}
            />
          </div>
        </div>

        {/* Right panel -- generated query */}
        <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '8px' }}>
          {/* Query type tabs */}
          <DiagramTooltip content="Три типа GraphQL-операций: Query -- одноразовое получение данных. Subscription -- подписка на изменения через WebSocket (живой поток). Connection -- курсорная пагинация для больших наборов данных.">
            <div style={{ 'display': 'flex', 'gap': '4px' }}>
              {([
                { key: 'query' as QueryTab, label: 'Query (GET)' },
                { key: 'subscription' as QueryTab, label: 'Subscription (LIVE)' },
                { key: 'connection' as QueryTab, label: 'Connection (PAGE)' },
              ]).map((tab) => (
                <button
                  onClick={() => setQueryTab(tab.key)}
                  style={{
                    'padding': '4px 10px',
                    'border-radius': '4px',
                    'border': `1px solid ${queryTab() === tab.key ? '#3b82f650' : 'rgba(255,255,255,0.08)'}`,
                    'background': queryTab() === tab.key ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                    'color': queryTab() === tab.key ? '#3b82f6' : colors.textMuted,
                    'font-size': '8px',
                    'font-family': 'monospace',
                    'cursor': 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </DiagramTooltip>

          {/* Generated query */}
          <DiagramTooltip content="GraphQL-запрос генерируется из выбранных параметров. orderBy, limit, where -- стандартные аргументы Subsquid/The Graph. Запрос отправляется POST-запросом на GraphQL-эндпоинт.">
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(59,130,246,0.15)', 'flex': '1' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#3b82f6', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
                Сгенерированный запрос:
              </div>
              <pre style={{
                'font-size': '8px',
                'font-family': 'monospace',
                'color': colors.text,
                'line-height': '1.5',
                'margin': '0',
                'white-space': 'pre-wrap',
                'word-break': 'break-word',
              }}>
                {generatedQuery}
              </pre>
            </div>
          </DiagramTooltip>

          {/* Mock response */}
          <DiagramTooltip content="GraphQL всегда возвращает JSON с полем data. Структура ответа точно повторяет структуру запроса -- никаких лишних данных, только запрошенные поля.">
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(34,197,94,0.15)' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#22c55e', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
                Ответ (mock):
              </div>
              <pre style={{
                'font-size': '7px',
                'font-family': 'monospace',
                'color': colors.textMuted,
                'line-height': '1.4',
                'margin': '0',
                'white-space': 'pre-wrap',
                'word-break': 'break-word',
                'max-height': '100px',
                'overflow': 'auto',
              }}>
                {MOCK_RESPONSES[entity()]}
              </pre>
            </div>
          </DiagramTooltip>
        </div>
      </div>

      <DiagramTooltip content="Query -- самый частый тип (90% случаев). Subscription нужен для live-дашбордов (DEX, NFT minting). Connection -- для пагинации таблиц с тысячами записей.">
        <DataBox
          label="Три типа запросов"
          value="Query -- получение данных (GET). Subscription -- подписка на изменения в реальном времени (WebSocket). Connection -- пагинация с totalCount и cursor (для больших наборов данных)."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
