/**
 * Proof of Stake Diagrams (ETH-10)
 *
 * Exports:
 * - PoWvsPoSDiagram: PoW vs PoS comparison table (static with DiagramTooltip), 8 rows
 * - BeaconChainDiagram: Slot/epoch timeline visualization (static, shows 32 slots)
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  PoWvsPoSDiagram                                                     */
/* ================================================================== */

interface ComparisonRow {
  aspect: string;
  pow: string;
  pos: string;
  tooltip: string;
}

const POW_VS_POS_DATA: ComparisonRow[] = [
  {
    aspect: 'Механизм безопасности',
    pow: 'Вычислительная работа (хеширование)',
    pos: 'Экономический залог (stake)',
    tooltip: 'PoW требует электричества и оборудования (ASIC). PoS требует блокировки ETH как залога -- атакующий рискует своими средствами.',
  },
  {
    aspect: 'Ресурс для участия',
    pow: 'Вычислительная мощность (ASIC)',
    pos: '32 ETH (минимальный депозит)',
    tooltip: 'Для майнинга Bitcoin нужны специализированные ASIC-чипы. Для валидации Ethereum нужен депозит 32 ETH в Beacon Chain deposit contract.',
  },
  {
    aspect: 'Энергопотребление',
    pow: '~150 TWh/год (Bitcoin)',
    pos: '~0.01 TWh/год (~99.95% меньше)',
    tooltip: 'The Merge (сентябрь 2022) сократил энергопотребление Ethereum на 99.95%. Валидация не требует непрерывного хеширования.',
  },
  {
    aspect: 'Выбор создателя блока',
    pow: 'Кто первый нашел nonce < target',
    pos: 'Псевдослучайный выбор из валидаторов',
    tooltip: 'В PoW -- вычислительная лотерея (BTC-06). В PoS -- протокол RANDAO выбирает proposer для каждого слота пропорционально стейку.',
  },
  {
    aspect: 'Наказание за атаку',
    pow: 'Потраченное электричество (невозвратное)',
    pos: 'Slashing: конфискация части/всего стейка',
    tooltip: 'В PoW атакующий теряет электричество, но сохраняет оборудование. В PoS slashing может уничтожить весь залог (32+ ETH) -- наказание внутри протокола.',
  },
  {
    aspect: 'Финальность',
    pow: 'Вероятностная (~60 мин / 6 блоков)',
    pos: 'Детерминированная (~12.8 мин / 2 эпохи)',
    tooltip: 'Bitcoin: транзакция считается подтвержденной после ~6 блоков (вероятностно). Ethereum PoS: Casper FFG обеспечивает математическую финальность за 2 эпохи.',
  },
  {
    aspect: 'Децентрализация',
    pow: 'Пулы майнинга (3-5 крупных)',
    pos: '>900 000 валидаторов',
    tooltip: 'Bitcoin: ~3 пула контролируют >50% хешрейта. Ethereum PoS: сотни тысяч валидаторов, хотя Lido контролирует ~28% стейка. Pectra EIP-7251 позволяет консолидацию.',
  },
  {
    aspect: 'Аппаратные требования',
    pow: 'Специализированные ASIC ($2000-$10000)',
    pos: 'Обычный компьютер (4+ CPU, 16GB RAM)',
    tooltip: 'Валидатор Ethereum может работать на обычном ПК или даже Raspberry Pi. Для майнинга Bitcoin нужны дорогие ASIC-чипы с высоким энергопотреблением.',
  },
];

export function PoWvsPoSDiagram() {
  return (
    <DiagramContainer title="Proof of Work vs Proof of Stake" color="green">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{
                padding: '10px 12px',
                textAlign: 'left',
                color: colors.textMuted,
                fontWeight: 600,
                borderBottom: `1px solid ${colors.border}`,
                whiteSpace: 'nowrap',
              }}>
                Аспект
              </th>
              <th style={{
                padding: '10px 12px',
                textAlign: 'left',
                color: '#f97316',
                fontWeight: 700,
                borderBottom: `1px solid ${colors.border}`,
                whiteSpace: 'nowrap',
              }}>
                PoW (Bitcoin)
              </th>
              <th style={{
                padding: '10px 12px',
                textAlign: 'left',
                color: '#4ade80',
                fontWeight: 700,
                borderBottom: `1px solid ${colors.border}`,
                whiteSpace: 'nowrap',
              }}>
                PoS (Ethereum)
              </th>
            </tr>
          </thead>
          <tbody>
            {POW_VS_POS_DATA.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: 'transparent',
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}
              >
                <td style={{
                  padding: '8px 12px',
                  color: colors.text,
                  fontWeight: 600,
                  borderBottom: `1px solid ${colors.border}`,
                  verticalAlign: 'top',
                }}>
                  <DiagramTooltip content={row.tooltip}>
                    <span>{row.aspect}</span>
                  </DiagramTooltip>
                </td>
                <td style={{
                  padding: '8px 12px',
                  color: '#f97316',
                  borderBottom: `1px solid ${colors.border}`,
                  verticalAlign: 'top',
                  fontFamily: 'monospace',
                  fontSize: 11,
                }}>
                  {row.pow}
                </td>
                <td style={{
                  padding: '8px 12px',
                  color: '#4ade80',
                  borderBottom: `1px solid ${colors.border}`,
                  verticalAlign: 'top',
                  fontFamily: 'monospace',
                  fontSize: 11,
                }}>
                  {row.pos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{
        marginTop: 12,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <DataBox
          label="The Merge"
          value="15 сентября 2022"
          variant="highlight"
        />
        <DataBox
          label="Сокращение энергии"
          value="99.95%"
          variant="default"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  BeaconChainDiagram                                                  */
/* ================================================================== */

interface SlotData {
  index: number;
  isProposed: boolean;
  isMissed: boolean;
  isFinalized: boolean;
}

function generateSlots(): SlotData[] {
  const slots: SlotData[] = [];
  // Simulate one epoch (32 slots) with some variety
  const missedSlots = new Set([5, 18, 27]); // 3 missed slots (~9%)
  for (let i = 0; i < 32; i++) {
    slots.push({
      index: i,
      isProposed: !missedSlots.has(i),
      isMissed: missedSlots.has(i),
      isFinalized: i < 16, // First half finalized (prior epoch)
    });
  }
  return slots;
}

const EPOCH_SLOTS = generateSlots();

export function BeaconChainDiagram() {
  const slotSize = 22;
  const gap = 3;
  const cols = 16;
  const rows = 2;
  const svgWidth = cols * (slotSize + gap) + 40;
  const svgHeight = rows * (slotSize + gap) + 140;

  return (
    <DiagramContainer title="Beacon Chain: слоты и эпохи" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { color: '#4ade80', label: 'Предложен (finalized)' },
            { color: colors.primary, label: 'Предложен (pending)' },
            { color: '#ef4444', label: 'Пропущен (missed)' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <div style={{
                width: 12, height: 12, borderRadius: 3,
                background: `${color}30`, border: `2px solid ${color}`,
              }} />
              <span style={{ color: colors.textMuted }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Slots grid */}
        <div style={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {/* Epoch label */}
            <text x={svgWidth / 2} y={18} fill={colors.text} fontSize={13} fontWeight={700} textAnchor="middle">
              Эпоха N (32 слота = 6.4 мин)
            </text>

            {/* Slot grid */}
            {EPOCH_SLOTS.map((slot, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              const x = 20 + col * (slotSize + gap);
              const y = 35 + row * (slotSize + gap);

              let fillColor: string;
              let strokeColor: string;
              if (slot.isMissed) {
                fillColor = 'rgba(239,68,68,0.2)';
                strokeColor = '#ef4444';
              } else if (slot.isFinalized) {
                fillColor = 'rgba(74,222,128,0.2)';
                strokeColor = '#4ade80';
              } else {
                fillColor = `${colors.primary}20`;
                strokeColor = colors.primary;
              }

              return (
                <g key={i} style={{ cursor: 'default' }}>
                  <rect
                    x={x}
                    y={y}
                    width={slotSize}
                    height={slotSize}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={1}
                    rx={4}
                  />
                  <text
                    x={x + slotSize / 2}
                    y={y + slotSize / 2 + 4}
                    fill={strokeColor}
                    fontSize={8}
                    fontFamily="monospace"
                    fontWeight={600}
                    textAnchor="middle"
                  >
                    {slot.index}
                  </text>
                </g>
              );
            })}

            {/* Time markers */}
            <text x={20} y={100} fill={colors.textMuted} fontSize={10} fontFamily="monospace">
              t=0s
            </text>
            <text x={svgWidth / 2} y={100} fill={colors.textMuted} fontSize={10} fontFamily="monospace" textAnchor="middle">
              t=192s
            </text>
            <text x={svgWidth - 20} y={100} fill={colors.textMuted} fontSize={10} fontFamily="monospace" textAnchor="end">
              t=384s
            </text>

            {/* Arrow under time markers */}
            <line x1={20} y1={106} x2={svgWidth - 20} y2={106} stroke={colors.border} strokeWidth={1} />
            <polygon points={`${svgWidth - 20},106 ${svgWidth - 26},103 ${svgWidth - 26},109`} fill={colors.border} />
          </svg>
        </div>

        {/* Slot detail cards below SVG */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <DiagramTooltip content="Slot: 12-секундный интервал. Случайно выбранный proposer предлагает блок. Комитет из ~128 валидаторов аттестует блок. 32 слота = 1 epoch.">
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              fontSize: 11,
              color: colors.text,
              fontFamily: 'monospace',
            }}>
              Слот = 12 сек
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Epoch: 32 слота (~6.4 минуты). Контрольная точка для finality. Два finalized epochs подряд = economic finality.">
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              fontSize: 11,
              color: colors.text,
              fontFamily: 'monospace',
            }}>
              Эпоха = 32 слота
            </div>
          </DiagramTooltip>
          <DiagramTooltip content="Casper FFG + LMD GHOST: Casper обеспечивает финальность через checkpoint каждую эпоху. GHOST выбирает каноническую цепочку по весу аттестаций.">
            <div style={{
              ...glassStyle,
              padding: '8px 12px',
              fontSize: 11,
              color: colors.text,
              fontFamily: 'monospace',
            }}>
              Финальность = 2 эпохи
            </div>
          </DiagramTooltip>
        </div>

        {/* Key metrics */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <DataBox label="Слот" value="12 секунд" variant="default" />
          <DataBox label="Эпоха" value="32 слота = 6.4 мин" variant="default" />
          <DataBox label="Финальность" value="2 эпохи = 12.8 мин" variant="highlight" />
          <DataBox label="Комитет" value="128+ валидаторов / слот" variant="default" />
        </div>

        {/* Finality explanation */}
        <div style={{
          ...glassStyle,
          padding: '10px 14px',
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.6,
          maxWidth: 560,
          textAlign: 'center',
        }}>
          <strong style={{ color: colors.primary }}>Casper FFG + LMD GHOST:</strong>{' '}
          Casper FFG обеспечивает финальность (checkpoint каждую эпоху, финализация через 2 эпохи).
          LMD GHOST выбирает каноническую цепочку внутри эпохи по весу аттестаций.
          Вместе они образуют <strong style={{ color: colors.accent }}>Gasper</strong> -- консенсус Ethereum.
        </div>
      </div>
    </DiagramContainer>
  );
}
