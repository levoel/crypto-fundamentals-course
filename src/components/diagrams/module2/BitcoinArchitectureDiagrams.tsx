/**
 * Bitcoin Architecture Diagrams (BTC-01)
 *
 * Exports:
 * - NodeArchitectureDiagram: Bitcoin full node components with data flow arrows
 * - BitcoinVsBankingDiagram: Side-by-side comparison of traditional banking vs Bitcoin
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hoveredComp = NODE_COMPONENTS.find((c) => c.id === hoveredId);

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

          {/* Components */}
          {NODE_COMPONENTS.map((comp) => {
            const isHovered = hoveredId === comp.id;
            return (
              <g
                key={comp.id}
                onMouseEnter={() => setHoveredId(comp.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={comp.x}
                  y={comp.y}
                  width={comp.width}
                  height={comp.height}
                  rx={8}
                  fill={isHovered ? comp.color + '25' : 'rgba(255,255,255,0.05)'}
                  stroke={isHovered ? comp.color : colors.border}
                  strokeWidth={isHovered ? 2 : 1}
                />
                <text
                  x={comp.x + comp.width / 2}
                  y={comp.y + comp.height / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isHovered ? comp.color : colors.text}
                  fontSize={13}
                  fontFamily="monospace"
                  fontWeight={isHovered ? 600 : 400}
                >
                  {comp.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredComp ? (
        <DataBox
          label={hoveredComp.label}
          value={hoveredComp.description}
          variant="highlight"
        />
      ) : (
        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
          Наведите на компонент, чтобы узнать подробности
        </div>
      )}
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
}

const COMPARISON_DATA: ComparisonRow[] = [
  { aspect: 'Хранение данных', banking: 'Центральный реестр (одна БД)', bitcoin: 'Распределённый реестр (~60 000 узлов)' },
  { aspect: 'Модель баланса', banking: 'Баланс на счёте (account model)', bitcoin: 'Набор UTXO (нет поля "баланс")' },
  { aspect: 'Валидация', banking: 'Банк проверяет и одобряет', bitcoin: 'Каждый узел проверяет независимо' },
  { aspect: 'Отказоустойчивость', banking: 'Single point of failure', bitcoin: 'Нет единой точки отказа' },
  { aspect: 'Доступ', banking: 'KYC, рабочие часы, ограничения', bitcoin: '24/7, без разрешений (permissionless)' },
  { aspect: 'Обработка', banking: 'Секунды (внутри), дни (международ.)', bitcoin: '~10 минут (1 подтверждение)' },
];

export function BitcoinVsBankingDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
            {COMPARISON_DATA.map((row, i) => {
              const isHovered = hoveredRow === i;
              return (
                <tr
                  key={i}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ cursor: 'default' }}
                >
                  <td style={{
                    ...cellStyle,
                    fontWeight: 600,
                    color: isHovered ? colors.primary : colors.text,
                    background: isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  }}>
                    {row.aspect}
                  </td>
                  <td style={{
                    ...cellStyle,
                    color: colors.textMuted,
                    background: isHovered ? 'rgba(231,76,60,0.08)' : 'rgba(255,255,255,0.03)',
                  }}>
                    {row.banking}
                  </td>
                  <td style={{
                    ...cellStyle,
                    color: colors.text,
                    background: isHovered ? `${colors.success}15` : 'rgba(255,255,255,0.03)',
                  }}>
                    {row.bitcoin}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <DataBox
          label="Ключевое отличие"
          value="В банке баланс -- это запись в БД. В Bitcoin баланс вычисляется из набора UTXO. Нет центрального хранилища балансов."
          variant="highlight"
        />
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
