/**
 * Testing Solana Diagrams (SOL-08)
 *
 * Exports:
 * - TestWorkflowDiagram: Build -> Deploy -> Test flow with Anchor CLI commands (static with hover)
 * - AnchorTestArchitectureDiagram: 5-layer test stack (Mocha -> Anchor Client -> RPC -> Validator -> Runtime)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
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
  },
];

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
            <div
              key={i}
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
          );
        })}
      </div>

      {/* Command */}
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

      {/* Description */}
      <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.6, marginBottom: 12 }}>
        {current.what}
      </div>

      {/* Artifacts */}
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

      {/* Duration */}
      <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
        Время: {current.duration}
      </div>

      <DataBox
        label="anchor test = build + deploy + test"
        value="Команда anchor test выполняет все шаги автоматически. anchor test --skip-local-validator использует внешний валидатор (Docker)."
        variant="highlight"
      />
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
}

const ARCH_LAYERS: ArchLayer[] = [
  {
    layer: 1,
    name: 'Test Runner',
    tech: 'Mocha + Chai',
    role: 'Определяет тест-кейсы (describe/it), assertions (expect), lifecycle hooks (before/after)',
    example: 'describe("course-counter", () => {\n  it("initializes the counter", async () => {\n    expect(account.count.toNumber()).to.equal(0);\n  });\n});',
    color: colors.primary,
  },
  {
    layer: 2,
    name: 'Anchor Client',
    tech: '@coral-xyz/anchor',
    role: 'MethodsBuilder API: строит инструкции из IDL, сериализует данные, создает транзакции',
    example: 'await program.methods\n  .initialize()\n  .accounts({ counter: counterPDA })\n  .rpc();',
    color: colors.accent,
  },
  {
    layer: 3,
    name: 'Solana Web3',
    tech: '@solana/web3.js v1',
    role: 'Подписание транзакций, отправка через RPC, чтение account data, PDA derivation',
    example: 'const [pda] = PublicKey.findProgramAddressSync(\n  [Buffer.from("counter"), authority.toBuffer()],\n  programId\n);',
    color: colors.success,
  },
  {
    layer: 4,
    name: 'JSON-RPC',
    tech: 'HTTP POST localhost:8899',
    role: 'Транспорт: sendTransaction, getAccountInfo, requestAirdrop. Validator обрабатывает RPC-запросы.',
    example: '{"jsonrpc":"2.0","method":"sendTransaction",\n "params":["base64_tx..."],"id":1}',
    color: '#e879f9',
  },
  {
    layer: 5,
    name: 'Validator Runtime',
    tech: 'solana-test-validator (Docker)',
    role: 'Исполняет BPF-программу, обновляет аккаунты, подтверждает транзакции. Работает в Docker-контейнере.',
    example: 'docker compose up -d\n# Validator: localhost:8899 (RPC)\n# WebSocket: localhost:8900',
    color: '#f59e0b',
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
            <div
              key={i}
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

      <DataBox
        label="Тест-стек"
        value="Mocha (runner) -> Anchor (builder) -> Web3.js (transport) -> RPC (protocol) -> Validator (execution)"
        variant="highlight"
      />
    </DiagramContainer>
  );
}
