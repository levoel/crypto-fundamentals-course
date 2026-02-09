/**
 * GraphQL Diagrams (INDEX-02)
 *
 * Exports:
 * - GraphQLSchemaDesignDiagram: Three-panel schema design (entities, relations, indexes) with codegen pipeline (static)
 * - GraphQLQueryBuilderDiagram: Interactive GraphQL query builder with entity/field selector and generated query display
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
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

const SCHEMA_PANELS: SchemaPanel[] = [
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
  },
];

export function GraphQLSchemaDesignDiagram() {
  return (
    <DiagramContainer title="Проектирование GraphQL схемы для блокчейн-данных" color="orange">
      {/* Three panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {SCHEMA_PANELS.map((panel) => (
          <div key={panel.title} style={{
            ...glassStyle,
            padding: 12,
            border: `1px solid ${panel.color}25`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: panel.color, fontFamily: 'monospace', marginBottom: 8 }}>
              {panel.title}
            </div>
            <pre style={{
              fontSize: 8,
              fontFamily: 'monospace',
              color: colors.text,
              lineHeight: 1.5,
              padding: '8px 10px',
              background: `${panel.color}08`,
              borderRadius: 4,
              overflow: 'auto',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {panel.code}
            </pre>
            <div style={{
              fontSize: 9,
              color: panel.color,
              fontFamily: 'monospace',
              marginTop: 8,
              padding: '6px 8px',
              background: `${panel.color}06`,
              borderRadius: 4,
              borderLeft: `2px solid ${panel.color}40`,
              lineHeight: 1.5,
            }}>
              {panel.annotation}
            </div>
          </div>
        ))}
      </div>

      {/* Codegen pipeline */}
      <div style={{ ...glassStyle, padding: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
          Кодогенерация из схемы:
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ ...glassStyle, padding: '6px 10px', border: '1px solid rgba(167,139,250,0.2)' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#a78bfa', fontFamily: 'monospace' }}>schema.graphql</div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>&rarr;</div>
          <div style={{ ...glassStyle, padding: '6px 10px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace' }}>codegen</div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>&rarr;</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ ...glassStyle, padding: '6px 10px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#22c55e', fontFamily: 'monospace' }}>TypeORM entities</div>
            </div>
            <div style={{ ...glassStyle, padding: '6px 10px', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: 8, fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace' }}>AS types</div>
            </div>
          </div>
        </div>
      </div>

      <DataBox
        label="Единственный источник истины"
        value="schema.graphql -- единственный источник истины. И Subsquid, и The Graph генерируют код из этого файла."
        variant="info"
      />
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
  const [entity, setEntity] = useState<EntityType>('Transfer');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(['from', 'to', 'value', 'blockNumber']));
  const [filterValue, setFilterValue] = useState('0xa5f3...e7f8');
  const [orderBy, setOrderBy] = useState('blockNumber_DESC');
  const [limit, setLimit] = useState(10);
  const [queryTab, setQueryTab] = useState<QueryTab>('query');

  const entityFields = useMemo(() => ALL_FIELDS.filter((f) => f.entity === entity), [entity]);

  const toggleField = (name: string) => {
    const next = new Set(selectedFields);
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

  const activeFields = useMemo(
    () => entityFields.filter((f) => selectedFields.has(f.name)).map((f) => f.name),
    [entityFields, selectedFields],
  );

  const pluralEntity = entity === 'Transfer' ? 'transfers' : 'accounts';
  const filterField = entity === 'Transfer' ? 'from_eq' : 'id_eq';

  const generatedQuery = useMemo(() => {
    const fields = activeFields.length > 0 ? activeFields.join('\n    ') : 'id';
    if (queryTab === 'query') {
      return `query {
  ${pluralEntity}(
    orderBy: ${orderBy},
    limit: ${limit},
    where: { ${filterField}: "${filterValue}" }
  ) {
    ${fields}
  }
}`;
    }
    if (queryTab === 'subscription') {
      return `subscription {
  ${pluralEntity}(
    orderBy: ${orderBy},
    limit: ${limit},
    where: { ${filterField}: "${filterValue}" }
  ) {
    ${fields}
  }
}`;
    }
    // connection
    return `query {
  ${pluralEntity}Connection(
    orderBy: ${orderBy},
    first: ${limit},
    where: { ${filterField}: "${filterValue}" }
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
  }, [activeFields, orderBy, limit, filterValue, filterField, pluralEntity, queryTab]);

  return (
    <DiagramContainer title="Построение GraphQL запросов для блокчейн-данных" color="blue">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12, marginBottom: 12 }}>
        {/* Left panel -- builder */}
        <div style={{ ...glassStyle, padding: 12, border: '1px solid rgba(59,130,246,0.15)' }}>
          {/* Entity selector */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Сущность:
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['Transfer', 'Account'] as EntityType[]).map((e) => (
                <button
                  key={e}
                  onClick={() => handleEntityChange(e)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: `1px solid ${entity === e ? '#3b82f650' : 'rgba(255,255,255,0.1)'}`,
                    background: entity === e ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                    color: entity === e ? '#3b82f6' : colors.textMuted,
                    fontSize: 9,
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Field checkboxes */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Поля:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {entityFields.map((f) => (
                <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedFields.has(f.name)}
                    onChange={() => toggleField(f.name)}
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <span style={{ fontSize: 9, fontFamily: 'monospace', color: colors.text }}>
                    {f.name}
                  </span>
                  <span style={{ fontSize: 8, color: colors.textMuted, fontFamily: 'monospace' }}>
                    ({f.type})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Фильтр ({filterField}):
            </div>
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: colors.text,
                fontSize: 9,
                fontFamily: 'monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Order */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Сортировка:
            </div>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: colors.text,
                fontSize: 9,
                fontFamily: 'monospace',
              }}
            >
              {ORDER_OPTIONS[entity].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Limit */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              Лимит:
            </div>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(100, Number(e.target.value) || 10)))}
              style={{
                width: 60,
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: colors.text,
                fontSize: 9,
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>

        {/* Right panel -- generated query */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Query type tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'query' as QueryTab, label: 'Query (GET)' },
              { key: 'subscription' as QueryTab, label: 'Subscription (LIVE)' },
              { key: 'connection' as QueryTab, label: 'Connection (PAGE)' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setQueryTab(tab.key)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: `1px solid ${queryTab === tab.key ? '#3b82f650' : 'rgba(255,255,255,0.08)'}`,
                  background: queryTab === tab.key ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                  color: queryTab === tab.key ? '#3b82f6' : colors.textMuted,
                  fontSize: 8,
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Generated query */}
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(59,130,246,0.15)', flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#3b82f6', fontFamily: 'monospace', marginBottom: 6 }}>
              Сгенерированный запрос:
            </div>
            <pre style={{
              fontSize: 8,
              fontFamily: 'monospace',
              color: colors.text,
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {generatedQuery}
            </pre>
          </div>

          {/* Mock response */}
          <div style={{ ...glassStyle, padding: 10, border: '1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#22c55e', fontFamily: 'monospace', marginBottom: 6 }}>
              Ответ (mock):
            </div>
            <pre style={{
              fontSize: 7,
              fontFamily: 'monospace',
              color: colors.textMuted,
              lineHeight: 1.4,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 100,
              overflow: 'auto',
            }}>
              {MOCK_RESPONSES[entity]}
            </pre>
          </div>
        </div>
      </div>

      <DataBox
        label="Три типа запросов"
        value="Query -- получение данных (GET). Subscription -- подписка на изменения в реальном времени (WebSocket). Connection -- пагинация с totalCount и cursor (для больших наборов данных)."
        variant="info"
      />
    </DiagramContainer>
  );
}
