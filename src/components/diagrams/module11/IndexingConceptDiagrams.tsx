/** @jsxImportSource solid-js */
/**
 * Indexing Concept Diagrams (INDEX-01)
 *
 * Exports:
 * - RPCvsIndexerDiagram: 8-step interactive step-through comparing RPC queries to indexer approach (history array)
 * - IndexingPipelineDiagram: Generic indexing pipeline from blockchain to dApp (static with animated flow)
 * - EventTopicsDiagram: EVM event structure anatomy with raw hex / decoded toggle (interactive)
 */

import { createMemo, createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  RPCvsIndexerDiagram                                                */
/* ================================================================== */

interface RPCStep {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  phase: 'problem' | 'solution';
}

const RPC_STEPS: RPCStep[] = [
  {
    title: 'SCENARIO',
    subtitle: 'Задача',
    description: 'Задача: показать историю всех Transfer событий ERC-20 токена в вашем dApp. Нужны адреса отправителей, получателей, суммы, временные метки.',
    color: '#94a3b8',
    phase: 'problem',
  },
  {
    title: 'RPC APPROACH',
    subtitle: 'Прямой путь',
    description: 'Прямой путь: JSON-RPC вызов eth_getLogs. Запрашиваем ВСЕ Transfer события от блока 0 до latest.',
    color: '#f59e0b',
    phase: 'problem',
  },
  {
    title: 'PROBLEM 1',
    subtitle: 'Таймаут',
    description: 'Проблема: Ethereum mainnet имеет 20+ миллионов блоков. Один запрос eth_getLogs на весь диапазон -- ТАЙМАУТ или ошибка. Нужно разбить на тысячи мелких запросов.',
    color: '#ef4444',
    phase: 'problem',
  },
  {
    title: 'PROBLEM 2',
    subtitle: 'RAW данные',
    description: 'Проблема: нужны не только события. Нужны балансы, агрегации, связи между сущностями. JSON-RPC возвращает RAW данные -- нет JOIN, нет GROUP BY, нет сортировки.',
    color: '#ef4444',
    phase: 'problem',
  },
  {
    title: 'PROBLEM 3',
    subtitle: 'Дублирование',
    description: 'Проблема: каждый пользователь повторяет те же запросы. 1000 пользователей = 1000 x те же тысячи RPC-вызовов. Расточительно и медленно.',
    color: '#ef4444',
    phase: 'problem',
  },
  {
    title: 'SOLUTION',
    subtitle: 'Индексатор',
    description: 'Решение: ИНДЕКСАТОР. Прочитать блокчейн ОДИН РАЗ, обработать события, сохранить в базу данных, выставить GraphQL API.',
    color: '#22c55e',
    phase: 'solution',
  },
  {
    title: 'BENEFITS',
    subtitle: 'Результат',
    description: 'Результат: dApp делает ОДИН GraphQL запрос вместо тысяч RPC-вызовов. Данные уже обработаны, отсортированы, с агрегациями.',
    color: '#3b82f6',
    phase: 'solution',
  },
  {
    title: 'TOOLS',
    subtitle: 'Инструменты',
    description: 'Три основных инструмента: Subsquid (TypeScript, быстрый), The Graph (AssemblyScript, децентрализованный), SubQuery (TypeScript, мультисеть).',
    color: '#a78bfa',
    phase: 'solution',
  },
];

export function RPCvsIndexerDiagram() {
  const [history, setHistory] = createSignal<number[]>([0]);
  const step = history()[history().length - 1];
  const current = RPC_STEPS[step];

  const handleNext = () => {
    if (step < RPC_STEPS.length - 1) {
      setHistory([...history, step + 1]);
    }
  };
  const handleBack = () => {
    if (history().length > 1) {
      setHistory(history().slice(0, -1));
    }
  };
  const handleReset = () => setHistory([0]);

  return (
    <DiagramContainer title="Зачем нужна индексация: RPC vs Indexer" color="blue">
      {/* Step indicator */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'margin-bottom': '16px', 'flex-wrap': 'wrap' }}>
        {RPC_STEPS.map((s, i) => (
          <div style={{
            'padding': '4px 8px',
            'border-radius': '4px',
            'font-size': '9px',
            'font-family': 'monospace',
            'font-weight': i === step ? 700 : 400,
            'background': i === step ? `${s.color}20` : i < step ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
            'color': i === step ? s.color : i < step ? '#22c55e' : colors.textMuted,
            'border': `1px solid ${i === step ? `${s.color}50` : 'rgba(255,255,255,0.08)'}`,
          }}>
            {s.title}
          </div>
        ))}
      </div>

      {/* Visual area */}
      <div style={{ ...glassStyle, 'padding': '16px', 'margin-bottom': '12px', 'border': `1px solid ${current.color}25`, 'min-height': '120px' }}>
        {/* Step 0: Scenario -- dApp wanting data */}
        {step === 0 && (
          <div style={{ 'display': 'flex', 'justify-content': 'center', 'gap': '16px', 'align-items': 'center' }}>
            <DiagramTooltip content="dApp хочет показать историю Transfer-событий: отправители, получатели, суммы. Типичная задача для любого DeFi или NFT проекта.">
              <div style={{ ...glassStyle, 'padding': '12px', 'border': '1px solid rgba(148,163,184,0.3)', 'text-align': 'center' }}>
                <div style={{ 'font-size': '11px', 'font-weight': '600', 'color': '#94a3b8', 'font-family': 'monospace' }}>dApp</div>
                <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-top': '4px' }}>Transfer History?</div>
              </div>
            </DiagramTooltip>
            <div style={{ 'font-size': '18px', 'color': colors.textMuted }}>?</div>
            <DiagramTooltip content="Ethereum mainnet содержит 20+ миллионов блоков. Прямой запрос всех событий через RPC -- технически невозможен за разумное время.">
              <div style={{ ...glassStyle, 'padding': '12px', 'border': '1px solid rgba(148,163,184,0.3)', 'text-align': 'center' }}>
                <div style={{ 'font-size': '11px', 'font-weight': '600', 'color': '#94a3b8', 'font-family': 'monospace' }}>Blockchain</div>
                <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-top': '4px' }}>20M+ блоков</div>
              </div>
            </DiagramTooltip>
          </div>
        )}

        {/* Step 1: RPC approach */}
        {step === 1 && (
          <div>
            <div style={{ 'display': 'flex', 'justify-content': 'center', 'gap': '16px', 'align-items': 'center', 'margin-bottom': '12px' }}>
              <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(245,158,11,0.3)', 'text-align': 'center' }}>
                <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#f59e0b', 'font-family': 'monospace' }}>dApp</div>
              </div>
              <div style={{ 'font-size': '14px', 'color': '#f59e0b' }}>&rarr;</div>
              <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(245,158,11,0.3)', 'text-align': 'center' }}>
                <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#f59e0b', 'font-family': 'monospace' }}>RPC Node</div>
              </div>
            </div>
            <div style={{ ...glassStyle, 'padding': '8px', 'border': '1px solid rgba(255,255,255,0.08)', 'font-family': 'monospace', 'font-size': '9px', 'color': '#f59e0b' }}>
              eth_getLogs({'{'} topics: [Transfer.topic], fromBlock: 0, toBlock: &apos;latest&apos; {'}'})
            </div>
          </div>
        )}

        {/* Step 2: Problem 1 -- timeout */}
        {step === 2 && (
          <div>
            <div style={{ 'display': 'flex', 'justify-content': 'center', 'gap': '8px', 'align-items': 'center', 'margin-bottom': '12px', 'flex-wrap': 'wrap' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div style={{
                  ...glassStyle,
                  'padding': '4px 8px',
                  'border': '1px solid rgba(239,68,68,0.2)',
                  'font-size': '8px',
                  'font-family': 'monospace',
                  'color': '#ef4444',
                }}>
                  {i === 0 ? '0-2000' : i === 5 ? '...' : `${i * 2000}-${(i + 1) * 2000}`}
                </div>
              ))}
            </div>
            <div style={{ 'text-align': 'center', 'font-size': '18px', 'color': '#ef4444', 'margin-bottom': '8px' }}>TIMEOUT</div>
            <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace', 'text-align': 'center' }}>
              Тысячи мелких запросов вместо одного
            </div>
          </div>
        )}

        {/* Step 3: Problem 2 -- raw data */}
        {step === 3 && (
          <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '12px' }}>
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#ef4444', 'font-family': 'monospace', 'margin-bottom': '6px' }}>JSON-RPC (RAW)</div>
              <div style={{ 'font-size': '8px', 'font-family': 'monospace', 'color': colors.textMuted, 'line-height': '1.6' }}>
                0x000...ddf252ad1be2c89b69...<br />
                0x000...00000000000000a5f3...<br />
                data: 0x00000000000186a0
              </div>
            </div>
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#22c55e', 'font-family': 'monospace', 'margin-bottom': '6px' }}>Нужно (SQL)</div>
              <div style={{ 'font-size': '8px', 'font-family': 'monospace', 'color': colors.textMuted, 'line-height': '1.6' }}>
                SELECT from, to, value<br />
                GROUP BY from<br />
                ORDER BY timestamp DESC
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Problem 3 -- duplication */}
        {step === 4 && (
          <div style={{ 'text-align': 'center' }}>
            <div style={{ 'display': 'flex', 'justify-content': 'center', 'gap': '4px', 'margin-bottom': '8px', 'flex-wrap': 'wrap' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div style={{
                  ...glassStyle,
                  'padding': '3px 6px',
                  'border': '1px solid rgba(239,68,68,0.15)',
                  'font-size': '8px',
                  'font-family': 'monospace',
                  'color': '#ef4444',
                }}>
                  User {i + 1}
                </div>
              ))}
            </div>
            <div style={{ 'font-size': '12px', 'color': '#ef4444', 'margin-bottom': '4px' }}>x 1000</div>
            <div style={{ 'font-size': '18px', 'color': '#ef4444' }}>&darr;</div>
            <div style={{ ...glassStyle, 'padding': '8px', 'border': '1px solid rgba(239,68,68,0.3)', 'display': 'inline-block' }}>
              <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#ef4444', 'font-family': 'monospace' }}>RPC Node</div>
            </div>
          </div>
        )}

        {/* Step 5: Solution -- indexer pipeline */}
        {step === 5 && (
          <div style={{ 'display': 'flex', 'justify-content': 'center', 'gap': '8px', 'align-items': 'center', 'flex-wrap': 'wrap' }}>
            {[
              { label: 'Blockchain', color: '#a78bfa', tip: 'Источник данных: блоки, транзакции и event logs. Индексатор читает их через RPC или специализированный Data Lake.' },
              { label: 'Indexer', color: '#3b82f6', tip: 'Процессор фильтрует нужные события, декодирует ABI и трансформирует данные в структурированные сущности.' },
              { label: 'PostgreSQL', color: '#22c55e', tip: 'Реляционная база данных хранит обработанные данные с индексами. Позволяет JOIN, GROUP BY, сортировку.' },
              { label: 'GraphQL', color: '#f59e0b', tip: 'GraphQL API автоматически генерируется из схемы. Поддерживает фильтрацию, пагинацию и подписки.' },
              { label: 'dApp', color: '#06b6d4', tip: 'Фронтенд делает один GraphQL-запрос вместо тысяч RPC-вызовов. Данные уже обработаны и готовы к отображению.' },
            ].map((box, i, arr) => (
              <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '8px' }}>
                <DiagramTooltip content={box.tip}>
                  <div style={{ ...glassStyle, 'padding': '8px 12px', 'border': `1px solid ${box.color}30`, 'text-align': 'center' }}>
                    <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': box.color, 'font-family': 'monospace' }}>{box.label}</div>
                  </div>
                </DiagramTooltip>
                {i < arr.length - 1 && <div style={{ 'font-size': '14px', 'color': '#22c55e' }}>&rarr;</div>}
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Benefits */}
        {step === 6 && (
          <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': '12px' }}>
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#ef4444', 'font-family': 'monospace', 'margin-bottom': '6px' }}>Без индексатора</div>
              <div style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': colors.textMuted, 'line-height': '1.6' }}>
                1000+ RPC-вызовов<br />
                RAW hex данные<br />
                Нет агрегаций<br />
                Медленно
              </div>
            </div>
            <div style={{ ...glassStyle, 'padding': '10px', 'border': '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': '#3b82f6', 'font-family': 'monospace', 'margin-bottom': '6px' }}>С индексатором</div>
              <div style={{ 'font-size': '9px', 'font-family': 'monospace', 'color': colors.textMuted, 'line-height': '1.6' }}>
                1 GraphQL запрос<br />
                Структурированные данные<br />
                JOIN, GROUP BY, сортировка<br />
                Мгновенно
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Tools overview */}
        {step === 7 && (
          <div style={{ 'display': 'grid', 'grid-template-columns': '1fr 1fr 1fr', 'gap': '8px' }}>
            {[
              { name: 'Subsquid', lang: 'TypeScript', trait: 'Быстрый (50K бл/сек)', color: '#3b82f6' },
              { name: 'The Graph', lang: 'AssemblyScript', trait: 'Децентрализованный', color: '#a78bfa' },
              { name: 'SubQuery', lang: 'TypeScript', trait: 'Мультисеть', color: '#22c55e' },
            ].map((tool) => (
              <div style={{ ...glassStyle, 'padding': '12px', 'border': `1px solid ${tool.color}30`, 'text-align': 'center' }}>
                <div style={{ 'font-size': '11px', 'font-weight': '700', 'color': tool.color, 'font-family': 'monospace' }}>{tool.name}</div>
                <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-top': '4px' }}>{tool.lang}</div>
                <div style={{ 'font-size': '9px', 'color': colors.text, 'font-family': 'monospace', 'margin-top': '4px' }}>{tool.trait}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current step detail */}
      <DiagramTooltip content={
        current.phase === 'problem'
          ? 'Проблемы прямого RPC-доступа: таймауты на больших диапазонах блоков, отсутствие структурированных запросов (JOIN, GROUP BY) и дублирование работы между пользователями.'
          : 'Индексатор решает все проблемы RPC: читает блокчейн один раз, обрабатывает данные и предоставляет быстрый GraphQL API.'
      }>
        <div style={{
          ...glassStyle,
          'padding': '14px',
          'margin-bottom': '12px',
          'border': `1px solid ${current.color}30`,
        }}>
          <div style={{ 'display': 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '8px' }}>
            <div style={{ 'font-size': '13px', 'font-weight': '700', 'color': current.color, 'font-family': 'monospace' }}>
              {step + 1}. {current.title}: {current.subtitle}
            </div>
          <span style={{
            'font-size': '9px',
            'font-family': 'monospace',
            'padding': '2px 8px',
            'border-radius': '4px',
            'background': `${current.color}15`,
            'color': current.color,
            'border': `1px solid ${current.color}30`,
          }}>
            {current.phase === 'problem' ? 'Проблема' : 'Решение'} | Шаг {step + 1}/{RPC_STEPS.length}
          </span>
        </div>
        <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6' }}>
          {current.description}
        </div>
      </div>
      </DiagramTooltip>

      {/* Navigation */}
      <div style={{ 'display': 'flex', 'gap': '8px' }}>
        <button onClick={handleBack} disabled={history().length <= 1} style={{
          'padding': '6px 16px',
          'border-radius': '6px',
          'border': '1px solid rgba(255,255,255,0.15)',
          'background': 'rgba(255,255,255,0.05)',
          'color': history().length > 1 ? colors.text : colors.textMuted,
          'font-size': '11px',
          'font-family': 'monospace',
          'cursor': history().length > 1 ? 'pointer' : 'not-allowed',
        }}>
          Back
        </button>
        <button onClick={handleNext} disabled={step >= RPC_STEPS.length - 1} style={{
          'padding': '6px 16px',
          'border-radius': '6px',
          'border': `1px solid ${step < RPC_STEPS.length - 1 ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
          'background': step < RPC_STEPS.length - 1 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
          'color': step < RPC_STEPS.length - 1 ? '#3b82f6' : colors.textMuted,
          'font-size': '11px',
          'font-family': 'monospace',
          'cursor': step < RPC_STEPS.length - 1 ? 'pointer' : 'not-allowed',
        }}>
          Step
        </button>
        <button onClick={handleReset} style={{
          'padding': '6px 16px',
          'border-radius': '6px',
          'border': '1px solid rgba(255,255,255,0.15)',
          'background': 'rgba(255,255,255,0.05)',
          'color': colors.textMuted,
          'font-size': '11px',
          'font-family': 'monospace',
          'cursor': 'pointer',
        }}>
          Reset
        </button>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  IndexingPipelineDiagram                                            */
/* ================================================================== */

interface PipelineStage {
  label: string;
  icon: string;
  description: string;
  color: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { label: 'Блокчейн (EVM)', icon: '\u26d3', description: 'Блоки, транзакции, события (logs)', color: '#a78bfa' },
  { label: 'Процессор', icon: '\u2699', description: 'Фильтрует события, декодирует ABI, трансформирует данные', color: '#3b82f6' },
  { label: 'База данных (PostgreSQL)', icon: '\ud83d\uddc4', description: 'Структурированные таблицы, индексы, связи', color: '#22c55e' },
  { label: 'GraphQL API', icon: '\ud83d\udd0c', description: 'Запросы, фильтры, пагинация, подписки', color: '#f59e0b' },
  { label: 'dApp / Фронтенд', icon: '\ud83c\udf10', description: 'Визуализация данных для пользователя', color: '#06b6d4' },
];

const PIPELINE_TOOLTIPS: Record<string, string> = {
  'Блокчейн (EVM)': 'Extract: блокчейн генерирует блоки с транзакциями и event logs. Индексатор подключается через RPC или SQD Network для получения данных.',
  'Процессор': 'Transform: процессор фильтрует события по topic0, декодирует raw hex через ABI и создаёт типизированные объекты (entities).',
  'База данных (PostgreSQL)': 'Load: структурированные данные сохраняются в PostgreSQL с индексами. Это позволяет выполнять SQL-запросы: JOIN, GROUP BY, ORDER BY.',
  'GraphQL API': 'Serve: GraphQL сервер автоматически генерируется из schema.graphql. Поддерживает фильтрацию, пагинацию, сортировку и WebSocket-подписки.',
  'dApp / Фронтенд': 'Consume: фронтенд делает один GraphQL-запрос и получает готовые данные. Никакого ручного парсинга hex или множественных RPC-вызовов.',
};

const ARROW_LABELS = ['RPC polling', 'Batch processing', 'SQL writes', 'HTTP/WS queries'];

export function IndexingPipelineDiagram() {
  return (
    <DiagramContainer title="Конвейер индексации: от блокчейна до dApp" color="green">
      {/* Horizontal pipeline */}
      <div style={{ 'display': 'flex', 'gap': '4px', 'align-items': 'center', 'margin-bottom': '16px', 'overflow-x': 'auto', 'padding-bottom': '8px' }}>
        {PIPELINE_STAGES.map((stage, i) => (
          <div style={{ 'display': 'flex', 'align-items': 'center', 'gap': '4px', 'flex-shrink': '0' }}>
            <DiagramTooltip content={PIPELINE_TOOLTIPS[stage.label]}>
              <div style={{
                ...glassStyle,
                'padding': '10px 12px',
                'border': `1px solid ${stage.color}30`,
                'text-align': 'center',
                'min-width': '100px',
              }}>
                <div style={{ 'font-size': '16px', 'margin-bottom': '4px' }}>{stage.icon}</div>
                <div style={{ 'font-size': '9px', 'font-weight': '600', 'color': stage.color, 'font-family': 'monospace', 'margin-bottom': '4px' }}>
                  {stage.label}
                </div>
                <div style={{ 'font-size': '8px', 'color': colors.textMuted, 'font-family': 'monospace', 'line-height': '1.4' }}>
                  {stage.description}
                </div>
              </div>
            </DiagramTooltip>
            {i < PIPELINE_STAGES.length - 1 && (
              <div style={{ 'display': 'flex', 'flex-direction': 'column', 'align-items': 'center', 'gap': '2px' }}>
                <div style={{ 'font-size': '7px', 'color': colors.textMuted, 'font-family': 'monospace', 'white-space': 'nowrap' }}>
                  {ARROW_LABELS[i]}
                </div>
                <div style={{ 'font-size': '14px', 'color': 'rgba(255,255,255,0.3)' }}>&rarr;</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <DiagramTooltip content="ETL-паттерн (Extract-Transform-Load) -- фундамент всех блокчейн-индексаторов. Subsquid, The Graph и SubQuery различаются реализацией, но архитектура одинакова.">
        <DataBox
          label="Ключевое наблюдение"
          value="Все индексаторы (Subsquid, The Graph, SubQuery) следуют этому паттерну. Различия -- в реализации каждого этапа."
          variant="info"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  EventTopicsDiagram                                                 */
/* ================================================================== */

interface TopicEntry {
  label: string;
  description: string;
  rawHex: string;
  decoded: string;
  color: string;
}

const TOPIC_ENTRIES: TopicEntry[] = [
  {
    label: 'Topic0',
    description: 'Сигнатура события (keccak256)',
    rawHex: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    decoded: "keccak256('Transfer(address,address,uint256)')",
    color: '#a78bfa',
  },
  {
    label: 'Topic1',
    description: 'Индексированный: from',
    rawHex: '0x000000000000000000000000a5f3c8e2b9d1f0e3a7b6c4d8e1f2a3b4c5d6e7f8',
    decoded: 'from: 0xa5f3...e7f8',
    color: '#3b82f6',
  },
  {
    label: 'Topic2',
    description: 'Индексированный: to',
    rawHex: '0x000000000000000000000000b2c4d6e8f0a1b3c5d7e9f1a2b4c6d8e0f2a4b6c8',
    decoded: 'to: 0xb2c4...b6c8',
    color: '#22c55e',
  },
  {
    label: 'Data',
    description: 'Неиндексированный: value',
    rawHex: '0x00000000000000000000000000000000000000000000000000000000000186a0',
    decoded: 'value: 100,000 STK',
    color: '#f59e0b',
  },
];

const TOPIC_TOOLTIPS: Record<string, string> = {
  'Topic0': 'Topic0 -- хеш сигнатуры события (keccak256). Именно по этому значению индексаторы фильтруют нужные события из миллионов блоков.',
  'Topic1': 'Topic1 -- первый indexed-параметр (from). Индексированные параметры хранятся в topics и доступны для быстрого B-tree поиска.',
  'Topic2': 'Topic2 -- второй indexed-параметр (to). EVM допускает максимум 3 индексированных параметра (topic1, topic2, topic3).',
  'Data': 'Data -- неиндексированные параметры (value). Хранятся в поле data лога. Поиск по ним невозможен без полного сканирования.',
};

export function EventTopicsDiagram() {
  const [viewMode, setViewMode] = createSignal<'raw' | 'decoded'>('decoded');

  return (
    <DiagramContainer title="Анатомия EVM события: topics и data" color="purple">
      {/* Toggle */}
      <div style={{ 'display': 'flex', 'gap': '8px', 'margin-bottom': '16px' }}>
        {(['decoded', 'raw'] as const).map((mode) => (
          <button
            onClick={() => setViewMode(mode)}
            style={{
              'padding': '6px 14px',
              'border-radius': '6px',
              'border': `1px solid ${viewMode() === mode ? '#a78bfa50' : 'rgba(255,255,255,0.1)'}`,
              'background': viewMode() === mode ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)',
              'color': viewMode() === mode ? '#a78bfa' : colors.textMuted,
              'font-size': '10px',
              'font-family': 'monospace',
              'cursor': 'pointer',
            }}
          >
            {mode === 'decoded' ? 'Декодированный' : 'RAW hex'}
          </button>
        ))}
      </div>

      {/* Event log entries */}
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '6px', 'margin-bottom': '16px' }}>
        {TOPIC_ENTRIES.map((entry) => (
          <DiagramTooltip content={TOPIC_TOOLTIPS[entry.label]}>
            <div style={{
              ...glassStyle,
              'padding': '10px',
              'border': `1px solid ${entry.color}25`,
              'display': 'flex',
              'gap': '12px',
              'align-items': 'flex-start',
            }}>
              <div style={{ 'min-width': '60px' }}>
                <div style={{ 'font-size': '10px', 'font-weight': '700', 'color': entry.color, 'font-family': 'monospace' }}>
                  {entry.label}
                </div>
                <div style={{ 'font-size': '8px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-top': '2px' }}>
                  {entry.description}
                </div>
              </div>
              <div style={{
                'flex': '1',
                'font-size': viewMode() === 'raw' ? 8 : 10,
                'font-family': 'monospace',
                'color': entry.color,
                'word-break': 'break-all',
                'line-height': '1.5',
                'padding': '4px 8px',
                'background': `${entry.color}08`,
                'border-radius': '4px',
              }}>
                {viewMode() === 'raw' ? entry.rawHex : entry.decoded}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Explanation */}
      <DiagramTooltip content="EVM событие -- это запись в transaction receipt. Topics индексируются Bloom-фильтром на уровне блока, что позволяет быстро определить, содержит ли блок нужное событие.">
        <div style={{ ...glassStyle, 'padding': '12px', 'margin-bottom': '12px', 'border': '1px solid rgba(167,139,250,0.15)' }}>
          <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#a78bfa', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
            Как это работает:
          </div>
          <div style={{ 'font-size': '10px', 'color': colors.text, 'line-height': '1.6' }}>
            Topic0 = keccak256(&apos;Transfer(address,address,uint256)&apos;) = 0xddf252ad...
            Индексированные параметры попадают в topics (быстрый поиск по B-tree).
            Неиндексированные -- в data. Именно так Subsquid и The Graph находят нужные события.
          </div>
        </div>
      </DiagramTooltip>

      {/* Filter code */}
      <DiagramTooltip content="addLog() -- метод процессора для подписки на события. Процессор пропускает блоки без нужных событий, что драматически ускоряет индексацию.">
        <div style={{ ...glassStyle, 'padding': '12px', 'border': '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ 'font-size': '10px', 'font-weight': '600', 'color': '#3b82f6', 'font-family': 'monospace', 'margin-bottom': '6px' }}>
            Как процессор фильтрует:
          </div>
          <div style={{
            'font-size': '9px',
            'font-family': 'monospace',
            'color': '#3b82f6',
            'padding': '8px 10px',
            'background': 'rgba(59,130,246,0.08)',
            'border-radius': '4px',
            'line-height': '1.5',
          }}>
            addLog({'{'} topic0: [TRANSFER_TOPIC] {'}'})
          </div>
          <div style={{ 'font-size': '9px', 'color': colors.textMuted, 'font-family': 'monospace', 'margin-top': '6px', 'line-height': '1.5' }}>
            Процессор читает ТОЛЬКО блоки с Transfer событиями, пропуская остальные.
          </div>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}
