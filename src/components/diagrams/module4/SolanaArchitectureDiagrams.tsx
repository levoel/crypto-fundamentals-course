/**
 * Solana Architecture Diagrams (SOL-01)
 *
 * Exports:
 * - SolanaVsEthereumDiagram: Side-by-side comparison table (static with hover/tooltips)
 * - SolanaInnovationsDiagram: 8 key Solana innovations overview (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  SolanaVsEthereumDiagram                                            */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  ethereum: string;
  solana: string;
  tooltip: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    aspect: 'Консенсус',
    ethereum: 'PoS (Casper FFG + LMD GHOST)',
    solana: 'PoH + Tower BFT (Alpenglow planned)',
    tooltip: 'Ethereum использует Casper FFG для финализации и LMD GHOST для выбора форка. Solana использует Proof of History как криптографические часы и Tower BFT для голосования. Alpenglow -- планируемая замена PoH/Tower BFT с финальностью ~100-150ms.',
  },
  {
    aspect: 'Время блока',
    ethereum: '~12 секунд',
    solana: '~400ms',
    tooltip: 'Ethereum производит блок каждые 12 секунд (фиксированный слот). Solana производит блоки каждые ~400ms благодаря непрерывному потоку PoH-хешей.',
  },
  {
    aspect: 'Финальность',
    ethereum: '~12.8 минут (2 эпохи)',
    solana: '~6.4s confirmed / ~13s finalized',
    tooltip: 'В Ethereum блок финализируется после 2 эпох (64 слота по 12 секунд). В Solana "confirmed" означает голоса 2/3 валидаторов (~6.4s), а "finalized" -- 32+ голоса поверх (~13s).',
  },
  {
    aspect: 'TPS (практический)',
    ethereum: '~30',
    solana: '~4,000+',
    tooltip: 'Ethereum обрабатывает ~30 транзакций в секунду (ограничено gas лимитом блока). Solana обрабатывает 4,000+ благодаря параллельному выполнению через Sealevel.',
  },
  {
    aspect: 'Язык',
    ethereum: 'Solidity (EVM bytecode)',
    solana: 'Rust (BPF bytecode)',
    tooltip: 'Ethereum использует Solidity, компилируемый в байткод EVM (стековая машина). Solana использует Rust, компилируемый в BPF/SBF (регистровая машина). Rust строже типизирован и ближе к системному уровню.',
  },
  {
    aspect: 'Модель состояния',
    ethereum: 'Код + хранилище вместе',
    solana: 'Код и данные разделены',
    tooltip: 'В Ethereum контракт хранит и код, и данные в одном аккаунте (storage slots). В Solana программа (код) -- это read-only аккаунт, а данные хранятся в отдельных аккаунтах, принадлежащих программе.',
  },
  {
    aspect: 'Смарт-контракты',
    ethereum: 'Stateful контракты',
    solana: 'Stateless программы',
    tooltip: 'Контракты Ethereum хранят состояние внутри себя (mapping, переменные). Программы Solana не хранят состояние -- они получают аккаунты с данными как аргументы и оперируют ими.',
  },
  {
    aspect: 'Рынок комиссий',
    ethereum: 'Глобальный (EIP-1559 base fee)',
    solana: 'Локальный (per-account hotspot)',
    tooltip: 'В Ethereum единый baseFee для всех транзакций растет при загрузке сети. В Solana комиссии растут только для "горячих" аккаунтов -- транзакции к холодным аккаунтам остаются дешевыми.',
  },
  {
    aspect: 'Подписанты',
    ethereum: 'Один подписант на tx',
    solana: 'Множество подписантов на tx',
    tooltip: 'Транзакция Ethereum имеет одного отправителя (msg.sender). Транзакция Solana может требовать подписи от нескольких аккаунтов одновременно.',
  },
  {
    aspect: 'Параллельное выполнение',
    ethereum: 'Последовательное',
    solana: 'Параллельное через Sealevel',
    tooltip: 'EVM выполняет транзакции строго последовательно. Sealevel в Solana выполняет параллельно транзакции, которые не конфликтуют по read/write аккаунтам.',
  },
  {
    aspect: 'Runtime',
    ethereum: 'EVM (стековая машина)',
    solana: 'SBF/BPF (регистровая машина)',
    tooltip: 'EVM -- стековая машина с 1024 элементами стека. SBF (Solana BPF) -- регистровая машина с 11 регистрами общего назначения, ближе к реальному процессору.',
  },
  {
    aspect: 'Обновляемость',
    ethereum: 'Proxy-паттерн (сложно)',
    solana: 'По умолчанию обновляема; --final для блокировки',
    tooltip: 'В Ethereum для обновления контракта нужен сложный proxy-паттерн (delegatecall). В Solana программы обновляемы по умолчанию через authority. Команда --final навсегда блокирует обновления.',
  },
];

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

export function SolanaVsEthereumDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const hoveredData = hoveredRow !== null ? COMPARISON_DATA[hoveredRow] : null;

  return (
    <DiagramContainer title="Ethereum vs Solana: сравнение архитектур" color="green">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, width: '20%' }}>Аспект</th>
              <th style={{ ...headerCell, width: '40%', color: '#8b5cf6' }}>Ethereum</th>
              <th style={{ ...headerCell, width: '40%', color: '#22c55e' }}>Solana</th>
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
                    background: isHovered ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
                  }}>
                    {row.ethereum}
                  </td>
                  <td style={{
                    ...cellStyle,
                    color: colors.text,
                    background: isHovered ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                  }}>
                    {row.solana}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hoveredData ? (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label={hoveredData.aspect}
            value={hoveredData.tooltip}
            variant="highlight"
          />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 12 }}>
          Наведите на строку, чтобы увидеть подробное сравнение
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SolanaInnovationsDiagram                                           */
/* ================================================================== */

interface Innovation {
  id: number;
  name: string;
  shortDesc: string;
  fullDesc: string;
  layer: 'consensus' | 'network' | 'execution' | 'storage';
}

const LAYER_COLORS: Record<Innovation['layer'], string> = {
  consensus: '#22c55e',
  network: '#3b82f6',
  execution: '#a855f7',
  storage: '#f59e0b',
};

const LAYER_LABELS: Record<Innovation['layer'], string> = {
  consensus: 'Консенсус',
  network: 'Сеть',
  execution: 'Исполнение',
  storage: 'Хранение',
};

const INNOVATIONS: Innovation[] = [
  {
    id: 1,
    name: 'Proof of History',
    shortDesc: 'Криптографические часы (VDF)',
    fullDesc: 'PoH -- это последовательная цепочка SHA-256 хешей, которая служит верифицируемыми часами. Она доказывает, что время прошло между событиями, без обмена сообщениями между валидаторами. В Ethereum валидаторы синхронизируют время через несколько раундов сообщений.',
    layer: 'consensus',
  },
  {
    id: 2,
    name: 'Tower BFT',
    shortDesc: 'PBFT-вариант на основе PoH',
    fullDesc: 'Tower BFT использует PoH как часы для голосования: каждый голос имеет экспоненциально растущий lockout. В Ethereum Casper FFG требует 2 эпохи (~12.8 мин) для финализации, а Tower BFT финализирует за ~13 секунд.',
    layer: 'consensus',
  },
  {
    id: 3,
    name: 'Gulf Stream',
    shortDesc: 'Пересылка tx следующему лидеру',
    fullDesc: 'Gulf Stream устраняет mempool -- транзакции пересылаются напрямую следующему лидеру до начала его слотов. В Ethereum транзакции ждут в mempool, пока блок-пропозер не включит их в блок.',
    layer: 'network',
  },
  {
    id: 4,
    name: 'Turbine',
    shortDesc: 'BitTorrent-подобная рассылка блоков',
    fullDesc: 'Turbine разбивает блоки на пакеты с erasure coding и раздает их по дереву валидаторов, как BitTorrent. Это позволяет лидеру раздать блок, не отправляя его целиком каждому валидатору. В Ethereum блоки рассылаются через gossipsub.',
    layer: 'network',
  },
  {
    id: 5,
    name: 'Sealevel',
    shortDesc: 'Параллельное выполнение транзакций',
    fullDesc: 'Sealevel выполняет транзакции параллельно, если они не пересекаются по read/write аккаунтам. Каждая транзакция заранее объявляет, какие аккаунты ей нужны. В Ethereum EVM выполняет транзакции строго последовательно.',
    layer: 'execution',
  },
  {
    id: 6,
    name: 'Cloudbreak',
    shortDesc: 'Горизонтально масштабируемая БД',
    fullDesc: 'Cloudbreak -- это система хранения аккаунтов, оптимизированная для параллельного чтения и записи с использованием memory-mapped файлов. Она поддерживает параллелизм Sealevel на уровне хранения.',
    layer: 'storage',
  },
  {
    id: 7,
    name: 'Pipelining',
    shortDesc: 'GPU-конвейер обработки транзакций',
    fullDesc: 'Pipelining разбивает обработку транзакций на стадии: получение данных (GPU), верификация подписей (GPU), банкинг (CPU), запись (ядро). Каждая стадия обрабатывает свой пакет параллельно, как конвейер процессора.',
    layer: 'execution',
  },
  {
    id: 8,
    name: 'Archivers',
    shortDesc: 'Распределенное хранение леджера',
    fullDesc: 'Archivers -- это узлы, которые хранят историю леджера с помощью Proof of Replication. Валидаторы не обязаны хранить всю историю -- они делегируют это архиваторам, что снижает требования к оборудованию.',
    layer: 'storage',
  },
];

export function SolanaInnovationsDiagram() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const hoveredInnovation = hoveredId !== null ? INNOVATIONS.find((i) => i.id === hoveredId) : null;

  return (
    <DiagramContainer title="8 инноваций Solana" color="purple">
      {/* Layer legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, justifyContent: 'center' }}>
        {(Object.keys(LAYER_COLORS) as Innovation['layer'][]).map((layer) => (
          <div key={layer} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: LAYER_COLORS[layer],
              opacity: 0.7,
            }} />
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
              {LAYER_LABELS[layer]}
            </span>
          </div>
        ))}
      </div>

      {/* Grid of innovation cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 10,
      }}>
        {INNOVATIONS.map((innovation) => {
          const isHovered = hoveredId === innovation.id;
          const layerColor = LAYER_COLORS[innovation.layer];
          return (
            <div
              key={innovation.id}
              onMouseEnter={() => setHoveredId(innovation.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...glassStyle,
                padding: '12px 14px',
                borderRadius: 8,
                cursor: 'default',
                background: isHovered ? `${layerColor}15` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isHovered ? layerColor + '50' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
                  color: layerColor,
                  background: `${layerColor}20`,
                  padding: '2px 6px', borderRadius: 4,
                }}>
                  {innovation.id}
                </span>
                <span style={{
                  fontSize: 13, fontFamily: 'monospace', fontWeight: 600,
                  color: isHovered ? layerColor : colors.text,
                }}>
                  {innovation.name}
                </span>
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace', lineHeight: 1.4 }}>
                {innovation.shortDesc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover detail */}
      {hoveredInnovation ? (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label={hoveredInnovation.name}
            value={hoveredInnovation.fullDesc}
            variant="highlight"
          />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 12 }}>
          Наведите на инновацию, чтобы увидеть подробности и сравнение с Ethereum
        </div>
      )}
    </DiagramContainer>
  );
}
