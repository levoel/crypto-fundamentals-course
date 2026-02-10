/**
 * Testing Solana Diagrams (SOL-08)
 *
 * Exports:
 * - TestWorkflowDiagram: Build -> Deploy -> Test flow with Anchor CLI commands (click-based with DiagramTooltip)
 * - AnchorTestArchitectureDiagram: 5-layer test stack (Mocha -> Anchor Client -> RPC -> Validator -> Runtime)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  TestWorkflowDiagram                                                 */
/* ================================================================== */

interface WorkflowPhase {
  step: number;
  name: string;
  command: string;
  what: string;
  artifacts: string[];
  duration: string;
  color: string;
  tooltip: string;
  commandTooltip: string;
}

const WORKFLOW_PHASES: WorkflowPhase[] = [
  {
    step: 1,
    name: 'Build',
    command: 'anchor build',
    what: 'Компиляция Rust -> BPF байткод. Генерация IDL и TypeScript типов.',
    artifacts: [
      'target/deploy/course_counter.so (BPF программа)',
      'target/idl/course_counter.json (IDL -- интерфейс)',
      'target/types/course_counter.ts (TypeScript типы)',
    ],
    duration: '~30-60s (первый раз), ~10s (incremental)',
    color: colors.primary,
    tooltip: 'Компиляция Rust-программы в BPF-байткод через `anchor build`. Генерирует .so файл и IDL (Interface Description Language) для клиентского взаимодействия.',
    commandTooltip: 'anchor build компилирует Rust-код в BPF-байткод через cargo build-sbf, затем генерирует IDL из макросов #[program] и #[account], и создаёт TypeScript-типы для клиентского SDK.',
  },
  {
    step: 2,
    name: 'Keys Sync',
    command: 'anchor keys sync',
    what: 'Синхронизация program ID: обновляет declare_id! в lib.rs и Anchor.toml.',
    artifacts: [
      'programs/course-counter/src/lib.rs (declare_id! обновлен)',
      'Anchor.toml ([programs.localnet] обновлен)',
    ],
    duration: '< 1s',
    color: colors.accent,
    tooltip: 'Синхронизация program ID между keypair (target/deploy/course_counter-keypair.json), declare_id! в lib.rs и Anchor.toml. Без этого шага деплой будет с неверным ID.',
    commandTooltip: 'anchor keys sync читает публичный ключ из keypair-файла и обновляет declare_id! макрос в lib.rs и секцию [programs.localnet] в Anchor.toml, обеспечивая консистентность program ID.',
  },
  {
    step: 3,
    name: 'Deploy',
    command: 'anchor deploy',
    what: 'Загрузка .so файла на валидатор. Anchor автоматически загружает IDL on-chain.',
    artifacts: [
      'Программа задеплоена на validator (localhost:8899)',
      'IDL доступен on-chain через anchor idl fetch',
    ],
    duration: '~5-10s',
    color: colors.success,
    tooltip: 'Деплой программы в локальный валидатор через `anchor deploy`. Программа загружается в upgradeable BPF loader и получает program ID.',
    commandTooltip: 'anchor deploy загружает .so файл через Upgradeable BPF Loader: создаёт buffer account, записывает байткод по частям (1232 байта), затем вызывает Deploy для финализации. Также загружает IDL on-chain.',
  },
  {
    step: 4,
    name: 'Test',
    command: 'anchor test',
    what: 'Запуск ts-mocha: подключение к validator, выполнение TypeScript тестов через MethodsBuilder API.',
    artifacts: [
      'Test results: 4 passing (initialize, increment x2, wrong authority)',
      'Транзакции на validator (можно inspect через solana confirm)',
    ],
    duration: '~5-15s',
    color: '#e879f9',
    tooltip: 'Запуск тестов через `anchor test`, который автоматически поднимает локальный валидатор, деплоит программу и выполняет TypeScript-тесты через ts-mocha.',
    commandTooltip: 'anchor test выполняет полный цикл: запускает solana-test-validator (если --skip-local-validator не указан), деплоит программу, запускает ts-mocha с тестами из tests/, затем останавливает валидатор.',
  },
  {
    step: 5,
    name: 'Verify',
    command: 'solana account <PDA>',
    what: 'Проверка состояния аккаунтов на валидаторе после тестов. Чтение данных counter.',
    artifacts: [
      'Counter account data: authority + count + bump',
      'Account balance: rent-exempt minimum lamports',
    ],
    duration: '< 1s',
    color: '#f59e0b',
    tooltip: 'Верификация on-chain состояния: чтение данных аккаунта через solana CLI для проверки, что тесты корректно изменили состояние программы.',
    commandTooltip: 'solana account выводит raw data аккаунта в hex. Для PDA-аккаунтов Anchor-программы можно использовать anchor account course_counter Counter <PDA> для десериализованного вывода.',
  },
];

/** Tooltip for artifact entries */
const ARTIFACT_TOOLTIPS: Record<string, string> = {
  'target/deploy/course_counter.so (BPF программа)': 'Скомпилированный BPF-байткод программы. Этот файл загружается на валидатор через Upgradeable BPF Loader. Размер типично 100KB-2MB.',
  'target/idl/course_counter.json (IDL -- интерфейс)': 'IDL (Interface Description Language) описывает все инструкции, аккаунты и типы программы в JSON-формате. Используется для автогенерации клиентского SDK.',
  'target/types/course_counter.ts (TypeScript типы)': 'Автогенерированные TypeScript-типы из IDL. Обеспечивают типобезопасность при вызове инструкций через Anchor client.',
};

/**
 * TestWorkflowDiagram
 *
 * Shows the complete Anchor test workflow:
 * build -> keys sync -> deploy -> test -> verify
 */
export function TestWorkflowDiagram() {
  const [selectedPhase, setSelectedPhase] = useState<number>(0);

  const current = WORKFLOW_PHASES[selectedPhase];

  return (
    <DiagramContainer title="Anchor: workflow разработки и тестирования" color="blue">
      {/* Phase pipeline */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
        {WORKFLOW_PHASES.map((p, i) => {
          const isActive = i === selectedPhase;
          const isPast = i < selectedPhase;
          return (
            <DiagramTooltip key={i} content={p.tooltip}>
              <div
                onClick={() => setSelectedPhase(i)}
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  ...glassStyle,
                  background: isActive ? `${p.color}20` : isPast ? `${p.color}08` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? p.color : isPast ? p.color + '30' : 'rgba(255,255,255,0.06)'}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{
                  fontSize: 10,
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  marginBottom: 2,
                }}>
                  Step {p.step}
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? p.color : isPast ? p.color + 'bb' : colors.textMuted,
                  fontFamily: 'monospace',
                }}>
                  {p.name}
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Command */}
      <DiagramTooltip content={current.commandTooltip}>
        <div style={{
          ...glassStyle,
          padding: 12,
          background: `${current.color}10`,
          border: `1px solid ${current.color}30`,
          marginBottom: 10,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>$ </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: current.color, fontFamily: 'monospace' }}>
            {current.command}
          </span>
        </div>
      </DiagramTooltip>

      {/* Description */}
      <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.6, marginBottom: 12 }}>
        {current.what}
      </div>

      {/* Artifacts */}
      <DiagramTooltip content="Артефакты, создаваемые на данном шаге. Каждый артефакт используется на последующих этапах workflow: .so для деплоя, IDL для клиента, типы для тестов.">
        <div style={{
          ...glassStyle,
          padding: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
            Артефакты:
          </div>
          {current.artifacts.map((a, i) => (
            <div key={i} style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: current.color,
              marginBottom: 4,
              lineHeight: 1.4,
              paddingLeft: 12,
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: 0, color: colors.textMuted }}>-</span>
              {a}
            </div>
          ))}
        </div>
      </DiagramTooltip>

      {/* Duration */}
      <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
        Время: {current.duration}
      </div>

      <DiagramTooltip content="anchor test объединяет все шаги в одну команду: build + deploy + test. Опция --skip-local-validator позволяет использовать внешний валидатор (например, Docker-контейнер) для более предсказуемого тестирования.">
        <DataBox
          label="anchor test = build + deploy + test"
          value="Команда anchor test выполняет все шаги автоматически. anchor test --skip-local-validator использует внешний валидатор (Docker)."
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  AnchorTestArchitectureDiagram                                       */
/* ================================================================== */

interface ArchLayer {
  layer: number;
  name: string;
  tech: string;
  role: string;
  example: string;
  color: string;
  tooltip: string;
}

const ARCH_LAYERS: ArchLayer[] = [
  {
    layer: 1,
    name: 'Test Runner',
    tech: 'Mocha + Chai',
    role: 'Определяет тест-кейсы (describe/it), assertions (expect), lifecycle hooks (before/after)',
    example: 'describe("course-counter", () => {\n  it("initializes the counter", async () => {\n    expect(account.count.toNumber()).to.equal(0);\n  });\n});',
    color: colors.primary,
    tooltip: 'Mocha + Chai — тест-фреймворк, который определяет структуру тестов (describe/it), assertions (expect/assert) и lifecycle hooks (before/after). Anchor использует ts-mocha для поддержки TypeScript.',
  },
  {
    layer: 2,
    name: 'Anchor Client',
    tech: '@coral-xyz/anchor',
    role: 'MethodsBuilder API: строит инструкции из IDL, сериализует данные, создает транзакции',
    example: 'await program.methods\n  .initialize()\n  .accounts({ counter: counterPDA })\n  .rpc();',
    color: colors.accent,
    tooltip: 'Anchor Client SDK предоставляет MethodsBuilder API для типобезопасного вызова инструкций. Автоматически сериализует аргументы через Borsh, выводит PDA-адреса и подписывает транзакции.',
  },
  {
    layer: 3,
    name: 'Solana Web3',
    tech: '@solana/web3.js v1',
    role: 'Подписание транзакций, отправка через RPC, чтение account data, PDA derivation',
    example: 'const [pda] = PublicKey.findProgramAddressSync(\n  [Buffer.from("counter"), authority.toBuffer()],\n  programId\n);',
    color: colors.success,
    tooltip: 'Solana Web3.js — низкоуровневый SDK для взаимодействия с Solana. Управляет ключами (Keypair), создаёт транзакции (Transaction), вычисляет PDA (findProgramAddressSync) и отправляет запросы через RPC.',
  },
  {
    layer: 4,
    name: 'JSON-RPC',
    tech: 'HTTP POST localhost:8899',
    role: 'Транспорт: sendTransaction, getAccountInfo, requestAirdrop. Validator обрабатывает RPC-запросы.',
    example: '{"jsonrpc":"2.0","method":"sendTransaction",\n "params":["base64_tx..."],"id":1}',
    color: '#e879f9',
    tooltip: 'JSON-RPC — стандартный протокол взаимодействия с Solana-валидатором. Методы: sendTransaction (отправка), getAccountInfo (чтение), requestAirdrop (получение тестовых SOL). WebSocket (порт 8900) для подписок.',
  },
  {
    layer: 5,
    name: 'Validator Runtime',
    tech: 'solana-test-validator (Docker)',
    role: 'Исполняет BPF-программу, обновляет аккаунты, подтверждает транзакции. Работает в Docker-контейнере.',
    example: 'docker compose up -d\n# Validator: localhost:8899 (RPC)\n# WebSocket: localhost:8900',
    color: '#f59e0b',
    tooltip: 'Solana test validator — полный локальный валидатор, исполняющий BPF-программы в SBF runtime. В Docker-контейнере обеспечивает воспроизводимость тестов. Поддерживает clone аккаунтов из mainnet.',
  },
];

/**
 * AnchorTestArchitectureDiagram
 *
 * Shows the 5-layer test stack: Mocha -> Anchor Client -> Web3.js -> RPC -> Validator.
 * Click each layer to see details.
 */
export function AnchorTestArchitectureDiagram() {
  const [selectedLayer, setSelectedLayer] = useState<number>(0);

  const current = ARCH_LAYERS[selectedLayer];

  return (
    <DiagramContainer title="Архитектура Anchor-тестов: 5 уровней" color="purple">
      {/* Layer stack visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 16 }}>
        {ARCH_LAYERS.map((l, i) => {
          const isActive = i === selectedLayer;
          return (
            <DiagramTooltip key={i} content={l.tooltip}>
              <div
                onClick={() => setSelectedLayer(i)}
                style={{
                  ...glassStyle,
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: isActive ? `${l.color}15` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? l.color : 'rgba(255,255,255,0.06)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: l.color,
                    fontFamily: 'monospace',
                    width: 20,
                  }}>
                    {l.layer}
                  </span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? l.color : colors.text,
                    fontFamily: 'monospace',
                  }}>
                    {l.name}
                  </span>
                </div>
                <span style={{
                  fontSize: 11,
                  color: isActive ? l.color : colors.textMuted,
                  fontFamily: 'monospace',
                }}>
                  {l.tech}
                </span>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      {/* Arrow between layers hint */}
      <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 12, fontFamily: 'monospace' }}>
        Layer {current.layer}: {current.name}
      </div>

      {/* Role description */}
      <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.6, marginBottom: 12 }}>
        {current.role}
      </div>

      {/* Code example */}
      <DiagramTooltip content={`Пример кода для уровня "${current.name}" (${current.tech}). Каждый слой абстрагирует нижележащий: Mocha определяет тесты, Anchor строит инструкции, Web3 подписывает, RPC передаёт, Validator исполняет.`}>
        <div style={{
          ...glassStyle,
          padding: 12,
          background: `${current.color}08`,
          border: `1px solid ${current.color}20`,
          marginBottom: 10,
        }}>
          <pre style={{
            margin: 0,
            fontSize: 11,
            fontFamily: 'monospace',
            color: current.color,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
          }}>
            {current.example}
          </pre>
        </div>
      </DiagramTooltip>

      <DiagramTooltip content="Стек тестирования Anchor работает сверху вниз: Mocha определяет тесты, Anchor строит транзакции из IDL, Web3.js подписывает и сериализует, JSON-RPC передаёт по HTTP, а Validator исполняет BPF-программу и обновляет состояние.">
        <DataBox
          label="Тест-стек"
          value="Mocha (runner) -> Anchor (builder) -> Web3.js (transport) -> RPC (protocol) -> Validator (execution)"
          variant="highlight"
        />
      </DiagramTooltip>
    </DiagramContainer>
  );
}
