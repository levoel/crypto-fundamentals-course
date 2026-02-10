/**
 * Subsquid Diagrams (INDEX-03, INDEX-04, INDEX-05, INDEX-06)
 *
 * Exports:
 * - SubsquidArchitectureDiagram: Subsquid SDK architecture with hover tooltips (static)
 * - SubsquidProcessorFlowDiagram: 6-step batch processing cycle (history array, step-through)
 * - SubsquidCodegenPipelineDiagram: Code generation pipeline from schema to database (static)
 * - SubsquidMultiEventDiagram: Multi-event indexing pattern with Uniswap example (static)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  SubsquidArchitectureDiagram                                        */
/* ================================================================== */

interface ArchComponent {
  id: string;
  label: string;
  tooltip: string;
  color: string;
}

const ARCH_COMPONENTS: ArchComponent[] = [
  { id: 'anvil', label: 'EVM Node (Anvil)', tooltip: 'Локальный Ethereum-узел для разработки. Предоставляет JSON-RPC эндпоинт на порту 8545.', color: '#a78bfa' },
  { id: 'processor', label: 'EvmBatchProcessor', tooltip: 'Фильтрует и группирует события в батчи. setRpcEndpoint() для локального узла. addLog() для фильтрации по topic0.', color: '#3b82f6' },
  { id: 'store', label: 'TypeORM Store', tooltip: 'Сохраняет обработанные данные в PostgreSQL. Поддерживает hot blocks (незавершённые блоки).', color: '#22c55e' },
  { id: 'postgres', label: 'PostgreSQL', tooltip: 'Структурированное хранилище. Таблицы генерируются из schema.graphql. Порт 5433 в LAB-07.', color: '#eab308' },
  { id: 'graphql', label: 'GraphQL Server', tooltip: 'Автоматически генерирует GraphQL API из схемы. --subscriptions для WebSocket. Порт 4350.', color: '#f59e0b' },
  { id: 'dapp', label: 'dApp / Frontend', tooltip: 'Клиентское приложение, использующее GraphQL API для отображения данных.', color: '#06b6d4' },
];

const CODEGEN_STEPS = [
  { input: 'schema.graphql', command: 'squid-typeorm-codegen', output: 'src/model/ (TypeORM entities)', color: '#22c55e' },
  { input: 'ABI JSON', command: 'squid-evm-typegen', output: 'src/abi/ (TypeScript types)', color: '#3b82f6' },
];

export function SubsquidArchitectureDiagram() {
  return (
    <DiagramContainer title="Архитектура Subsquid SDK" color="blue">
      {/* Architecture components */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {ARCH_COMPONENTS.map((comp, i) => (
          <div key={comp.id} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <DiagramTooltip content={comp.tooltip}>
              <div
                style={{
                  ...glassStyle,
                  padding: '10px 12px',
                  border: `1px solid ${comp.color}20`,
                  background: 'rgba(255,255,255,0.02)',
                  textAlign: 'center',
                  minWidth: 90,
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 600, color: comp.color, fontFamily: 'monospace' }}>
                  {comp.label}
                </div>
              </div>
            </DiagramTooltip>
            {i < ARCH_COMPONENTS.length - 1 && (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }}>&rarr;</div>
            )}
          </div>
        ))}
      </div>

      {/* Codegen pipeline */}
      <DiagramTooltip content="Кодогенерация Subsquid: schema.graphql генерирует TypeORM entities, а ABI JSON генерирует типизированные декодеры. Вы никогда не пишете boilerplate вручную.">
        <div style={{ ...glassStyle, padding: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 8 }}>
            Кодогенерация:
          </div>
          {CODEGEN_STEPS.map((step) => (
            <div key={step.command} style={{
              display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap',
            }}>
              <div style={{ ...glassStyle, padding: '4px 8px', border: `1px solid ${step.color}20`, fontSize: 8, fontFamily: 'monospace', color: step.color }}>
                {step.input}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>&rarr;</div>
              <div style={{ fontSize: 8, fontFamily: 'monospace', color: colors.textMuted, fontStyle: 'italic' }}>
                {step.command}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>&rarr;</div>
              <div style={{ ...glassStyle, padding: '4px 8px', border: `1px solid ${step.color}20`, fontSize: 8, fontFamily: 'monospace', color: step.color }}>
                {step.output}
              </div>
            </div>
          ))}
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="TypeScript everywhere -- главное преимущество Subsquid над The Graph. Нет AssemblyScript, нет ограничений. Скорость 50K блоков/сек благодаря батч-обработке через SQD Network.">
        <DataBox
          label="Ключевое преимущество"
          value="Subsquid: ВСЁ на TypeScript. Процессор, модели, сервер -- единый язык. Скорость обработки: 1000-50000 блоков/сек."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SubsquidProcessorFlowDiagram                                       */
/* ================================================================== */

interface ProcessorStep {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  codeHint: string;
}

const PROCESSOR_STEPS: ProcessorStep[] = [
  {
    title: 'POLL',
    subtitle: 'Запрос блоков',
    description: 'Процессор запрашивает новые блоки у EVM-узла через RPC. setFinalityConfirmation(1) для локального Anvil.',
    color: '#a78bfa',
    codeHint: 'Processor -> Anvil: "Есть новые блоки?"',
  },
  {
    title: 'FILTER',
    subtitle: 'Фильтрация логов',
    description: 'Из полученных блоков процессор оставляет только логи, соответствующие фильтру. addLog({ topic0: [TRANSFER_TOPIC] }).',
    color: '#3b82f6',
    codeHint: 'Batch [1000 блоков] -> Filter -> [12 Transfer логов]',
  },
  {
    title: 'DECODE',
    subtitle: 'Декодирование',
    description: 'Логи декодируются из hex в типизированные объекты. topic1 -> from address, topic2 -> to address, data -> value.',
    color: '#22c55e',
    codeHint: '0xddf252ad... -> { from, to, value, blockNumber }',
  },
  {
    title: 'TRANSFORM',
    subtitle: 'Трансформация',
    description: 'Обработчик (handler) в main.ts создаёт Transfer entities и обновляет Account балансы.',
    color: '#f59e0b',
    codeHint: 'decoded data -> new Transfer({...}) + Account.balance',
  },
  {
    title: 'PERSIST',
    subtitle: 'Сохранение',
    description: 'Entities сохраняются в PostgreSQL через TypeORM store. INSERT для новых записей, UPSERT для обновлений.',
    color: '#ef4444',
    codeHint: 'ctx.store.insert(transfers) / ctx.store.upsert(accounts)',
  },
  {
    title: 'NEXT BATCH',
    subtitle: 'Следующий цикл',
    description: 'Процессор запоминает последний обработанный блок и повторяет цикл. Непрерывный цикл: poll -> filter -> decode -> transform -> persist.',
    color: '#06b6d4',
    codeHint: 'lastBlock = 19500200 -> повтор с POLL',
  },
];

export function SubsquidProcessorFlowDiagram() {
  const [history, setHistory] = useState<number[]>([0]);
  const step = history[history.length - 1];
  const current = PROCESSOR_STEPS[step];

  const handleNext = () => {
    if (step < PROCESSOR_STEPS.length - 1) {
      setHistory([...history, step + 1]);
    }
  };
  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
    }
  };
  const handleReset = () => setHistory([0]);

  return (
    <DiagramContainer title="Цикл обработки Subsquid: от блока до базы данных" color="green">
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {PROCESSOR_STEPS.map((s, i) => (
          <div key={i} style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: i === step ? 700 : 400,
            background: i === step ? `${s.color}20` : i < step ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
            color: i === step ? s.color : i < step ? '#22c55e' : colors.textMuted,
            border: `1px solid ${i === step ? `${s.color}50` : 'rgba(255,255,255,0.08)'}`,
          }}>
            {s.title}
          </div>
        ))}
      </div>

      {/* Step detail */}
      <DiagramTooltip content="Batch processing -- ключевое отличие Subsquid от The Graph. Вместо обработки по одному событию, процессор получает БАТЧ блоков и обрабатывает все события за один проход. Это даёт 100-300x ускорение.">
        <div style={{
          ...glassStyle,
          padding: 14,
          marginBottom: 12,
          border: `1px solid ${current.color}30`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: current.color, fontFamily: 'monospace' }}>
              {step + 1}. {current.title}: {current.subtitle}
            </div>
            <span style={{
              fontSize: 9,
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: 4,
              background: `${current.color}15`,
              color: current.color,
              border: `1px solid ${current.color}30`,
            }}>
              Шаг {step + 1}/{PROCESSOR_STEPS.length}
            </span>
          </div>
          <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6, marginBottom: 8 }}>
            {current.description}
          </div>
          <div style={{
            fontSize: 9,
            fontFamily: 'monospace',
            color: current.color,
            padding: '6px 10px',
            background: `${current.color}08`,
            borderRadius: 4,
            borderLeft: `2px solid ${current.color}40`,
          }}>
            {current.codeHint}
          </div>
        </div>
      </DiagramTooltip>

      {/* Loop indicator at last step */}
      {step === 5 && (
        <DiagramTooltip content="Процессор работает бесконечно: после обработки батча он запрашивает следующий. При отключении -- запоминает последний блок и продолжает с него при перезапуске.">
          <div style={{
            ...glassStyle,
            padding: 10,
            marginBottom: 12,
            border: '1px solid rgba(6,182,212,0.2)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#06b6d4', fontFamily: 'monospace' }}>
              &#x21bb; Непрерывный цикл: POLL &rarr; FILTER &rarr; DECODE &rarr; TRANSFORM &rarr; PERSIST &rarr; POLL
            </div>
          </div>
        </DiagramTooltip>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleBack} disabled={history.length <= 1} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: history.length > 1 ? colors.text : colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: history.length > 1 ? 'pointer' : 'not-allowed',
        }}>
          Back
        </button>
        <button onClick={handleNext} disabled={step >= PROCESSOR_STEPS.length - 1} style={{
          padding: '6px 16px',
          borderRadius: 6,
          border: `1px solid ${step < PROCESSOR_STEPS.length - 1 ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
          background: step < PROCESSOR_STEPS.length - 1 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
          color: step < PROCESSOR_STEPS.length - 1 ? '#22c55e' : colors.textMuted,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: step < PROCESSOR_STEPS.length - 1 ? 'pointer' : 'not-allowed',
        }}>
          Step
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
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SubsquidCodegenPipelineDiagram                                     */
/* ================================================================== */

interface CodegenStep {
  step: number;
  input: string;
  command: string;
  output: string;
  example: string;
  color: string;
}

const CODEGEN_PIPELINE: (CodegenStep & { tooltip: string })[] = [
  {
    step: 1,
    input: 'schema.graphql',
    command: 'npx squid-typeorm-codegen',
    output: 'src/model/*.ts (TypeORM entity classes)',
    example: 'Transfer @entity -> class Transfer { @Entity(), @Column(), @PrimaryColumn(), @Index() }',
    color: '#22c55e',
    tooltip: 'squid-typeorm-codegen читает schema.graphql и создаёт TypeORM entity classes. @entity -> @Entity(), каждое поле -> @Column(). Поддерживает @index, @derivedFrom, BigInt.',
  },
  {
    step: 2,
    input: 'abis/erc20.json',
    command: 'npx squid-evm-typegen src/abi ./abi/*.json',
    output: 'src/abi/erc20.ts (типизированные декодеры)',
    example: 'Transfer ABI -> events.Transfer.topic + events.Transfer.decode(log)',
    color: '#3b82f6',
    tooltip: 'squid-evm-typegen генерирует типизированные декодеры из ABI JSON. events.Transfer.topic -- для фильтрации, events.Transfer.decode(log) -- для декодирования raw hex в typed object.',
  },
  {
    step: 3,
    input: 'src/*.ts',
    command: 'npm run build',
    output: 'lib/ (JavaScript)',
    example: 'TypeScript -> JavaScript компиляция',
    color: '#a78bfa',
    tooltip: 'Стандартная TypeScript компиляция. В отличие от The Graph (AssemblyScript -> WASM), Subsquid использует обычный TypeScript -> JavaScript. Полная совместимость с npm-экосистемой.',
  },
  {
    step: 4,
    input: 'src/model/*.ts',
    command: 'npx squid-typeorm-migration generate',
    output: 'db/migrations/XXXX-Data.js',
    example: 'Entity classes -> SQL миграция (CREATE TABLE, ALTER TABLE)',
    color: '#f59e0b',
    tooltip: 'Генерация SQL-миграций из TypeORM entities. Сравнивает текущее состояние модели с базой данных и создаёт CREATE TABLE / ALTER TABLE для синхронизации.',
  },
  {
    step: 5,
    input: 'db/migrations/*.js',
    command: 'npx squid-typeorm-migration apply',
    output: 'PostgreSQL schema updated',
    example: 'Миграция применена к базе данных',
    color: '#ef4444',
    tooltip: 'Применение миграций к PostgreSQL. Создаёт таблицы и индексы. При изменении схемы -- добавляет новые колонки или таблицы через ALTER TABLE.',
  },
];

export function SubsquidCodegenPipelineDiagram() {
  return (
    <DiagramContainer title="Конвейер кодогенерации Subsquid: от схемы до базы" color="orange">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {CODEGEN_PIPELINE.map((cg) => (
          <DiagramTooltip key={cg.step} content={cg.tooltip}>
            <div style={{
              ...glassStyle,
              padding: 10,
              border: `1px solid ${cg.color}20`,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: cg.color,
                  fontFamily: 'monospace',
                  padding: '2px 6px',
                  background: `${cg.color}15`,
                  borderRadius: 4,
                  border: `1px solid ${cg.color}30`,
                }}>
                  Шаг {cg.step}
                </span>
                <div style={{ ...glassStyle, padding: '3px 8px', border: `1px solid ${cg.color}15`, fontSize: 8, fontFamily: 'monospace', color: cg.color }}>
                  {cg.input}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>&rarr;</div>
                <div style={{ fontSize: 8, fontFamily: 'monospace', color: colors.textMuted, fontStyle: 'italic' }}>
                  {cg.command}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>&rarr;</div>
                <div style={{ ...glassStyle, padding: '3px 8px', border: `1px solid ${cg.color}15`, fontSize: 8, fontFamily: 'monospace', color: cg.color }}>
                  {cg.output}
                </div>
              </div>
              <div style={{
                fontSize: 8,
                fontFamily: 'monospace',
                color: colors.textMuted,
                padding: '4px 8px',
                background: `${cg.color}06`,
                borderRadius: 4,
                borderLeft: `2px solid ${cg.color}30`,
              }}>
                {cg.example}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      <DiagramTooltip content="Принцип единственного источника: schema.graphql определяет модель данных, из которой генерируются TypeORM entities, SQL-миграции и GraphQL API. Ручное редактирование сгенерированных файлов запрещено.">
        <DataBox
          label="Важное правило"
          value="Никогда НЕ пишите TypeORM entities и ABI-декодеры вручную. schema.graphql -- единственный файл, который вы редактируете. Всё остальное генерируется."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SubsquidMultiEventDiagram                                          */
/* ================================================================== */

interface EventType {
  name: string;
  topic0: string;
  entity: string;
  fields: string;
  color: string;
}

const EVENT_TYPES: (EventType & { tooltip: string; entityTooltip: string })[] = [
  { name: 'Transfer', topic0: '0xddf252ad...', entity: 'Transfer', fields: 'from, to, value', color: '#3b82f6', tooltip: 'ERC-20 Transfer -- событие перевода токенов. topic0 -- хеш сигнатуры Transfer(address,address,uint256). Самое частое событие на Ethereum.', entityTooltip: 'Transfer entity хранит историю переводов: отправитель, получатель, сумма, блок. Используется для отображения истории транзакций в dApp.' },
  { name: 'Swap', topic0: '0xd78ad95f...', entity: 'Swap', fields: 'amount0In, amount1In, amount0Out, amount1Out', color: '#22c55e', tooltip: 'Uniswap V2 Swap -- событие обмена токенов. Содержит входные и выходные суммы обоих токенов пары. Основа для аналитики торговых объёмов.', entityTooltip: 'Swap entity хранит данные об обменах: входные/выходные суммы по обоим токенам пары. Позволяет рассчитать объёмы торгов, средние цены.' },
  { name: 'Sync', topic0: '0x1c411e9a...', entity: 'Pool', fields: 'reserve0, reserve1', color: '#f59e0b', tooltip: 'Uniswap V2 Sync -- событие обновления резервов пула. Происходит после каждого Swap. Содержит текущие резервы обоих токенов.', entityTooltip: 'Pool entity хранит состояние ликвидного пула: текущие резервы, TVL. Sync-событие обновляет reserve0 и reserve1 после каждого обмена.' },
];

export function SubsquidMultiEventDiagram() {
  return (
    <DiagramContainer title="Мульти-событийная индексация: Uniswap и Governance" color="purple">
      {/* Event types -> processor -> entities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        {/* Events column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EVENT_TYPES.map((evt) => (
            <DiagramTooltip key={evt.name} content={evt.tooltip}>
              <div style={{
                ...glassStyle,
                padding: '8px 10px',
                border: `1px solid ${evt.color}25`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: evt.color, fontFamily: 'monospace' }}>
                  {evt.name}
                </div>
                <div style={{ fontSize: 7, color: colors.textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                  topic0: {evt.topic0}
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {/* Arrows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          {EVENT_TYPES.map((evt) => (
            <div key={evt.name} style={{ fontSize: 14, color: `${evt.color}60` }}>&rarr;</div>
          ))}
        </div>

        {/* Processor */}
        <DiagramTooltip content="EvmBatchProcessor принимает несколько addLog() вызовов для подписки на разные типы событий. Все события обрабатываются в одном батче -- один проход по блокам вместо трёх отдельных.">
          <div style={{
            ...glassStyle,
            padding: 14,
            border: '1px solid rgba(167,139,250,0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', fontFamily: 'monospace', marginBottom: 8 }}>
              EvmBatchProcessor
            </div>
            <div style={{
              fontSize: 7,
              fontFamily: 'monospace',
              color: colors.textMuted,
              textAlign: 'left',
              padding: '6px 8px',
              background: 'rgba(167,139,250,0.06)',
              borderRadius: 4,
              lineHeight: 1.6,
            }}>
              .addLog({'{'} topic0: [TRANSFER] {'}'})<br />
              .addLog({'{'} topic0: [SWAP] {'}'})<br />
              .addLog({'{'} topic0: [SYNC] {'}'})
            </div>
          </div>
        </DiagramTooltip>

        {/* Arrows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          {EVENT_TYPES.map((evt) => (
            <div key={evt.name} style={{ fontSize: 14, color: `${evt.color}60` }}>&rarr;</div>
          ))}
        </div>

        {/* Entity tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EVENT_TYPES.map((evt) => (
            <DiagramTooltip key={evt.name} content={evt.entityTooltip}>
              <div style={{
                ...glassStyle,
                padding: '8px 10px',
                border: `1px solid ${evt.color}25`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: evt.color, fontFamily: 'monospace' }}>
                  {evt.entity} entity
                </div>
                <div style={{ fontSize: 7, color: colors.textMuted, fontFamily: 'monospace', marginTop: 2 }}>
                  {evt.fields}
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </div>

      <DiagramTooltip content="Мульти-событийная индексация -- паттерн для сложных протоколов. Один процессор подписывается на все нужные события и обрабатывает их в одном handler, создавая связанные entities.">
        <DataBox
          label="Один процессор -- несколько событий"
          value="Один процессор может индексировать НЕСКОЛЬКО типов событий. Для Uniswap V2: Transfer (токены), Swap (обмены), Sync (резервы). Каждый тип -> своя entity + свой handler в main.ts."
          variant="info"
        />
      </DiagramTooltip>

      <div style={{ marginTop: 8 }}>
        <DiagramTooltip content="Governance -- ещё один типичный мульти-событийный паттерн. ProposalCreated, VoteCast и ProposalExecuted отслеживаются одним процессором и обновляют единую Proposal entity.">
          <DataBox
            label="Governance паттерн"
            value="Governance: ProposalCreated, VoteCast, ProposalExecuted -> Proposal entity со статусом (Pending -> Active -> Succeeded -> Executed)."
            variant="info"
          />
        </DiagramTooltip>
      </div>
    </DiagramContainer>
  );
}
