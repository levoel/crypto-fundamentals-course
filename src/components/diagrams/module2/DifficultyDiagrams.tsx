/**
 * Difficulty Adjustment Diagrams (BTC-07)
 *
 * Exports:
 * - DifficultyAdjustmentTimeline: Epoch visualization with adjustment factors and nBits encoding
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Epoch data for visualization                                        */
/* ================================================================== */

interface Epoch {
  label: string;
  blocks: number;
  actualDays: number;
  expectedDays: number;
  factor: number;
  direction: 'harder' | 'easier' | 'stable';
  description: string;
}

const EPOCHS: Epoch[] = [
  {
    label: 'Эпоха 1',
    blocks: 2016,
    actualDays: 12,
    expectedDays: 14,
    factor: 0.857,
    direction: 'harder',
    description: 'Блоки находились слишком быстро (в среднем ~8.6 мин). Сеть увеличивает сложность.',
  },
  {
    label: 'Эпоха 2',
    blocks: 2016,
    actualDays: 15,
    expectedDays: 14,
    factor: 1.071,
    direction: 'easier',
    description: 'Блоки шли чуть медленнее ожидаемого. Сложность немного снижается.',
  },
  {
    label: 'Эпоха 3',
    blocks: 2016,
    actualDays: 14.1,
    expectedDays: 14,
    factor: 1.007,
    direction: 'stable',
    description: 'Почти идеальное попадание в целевое время. Минимальная корректировка.',
  },
  {
    label: 'Эпоха 4',
    blocks: 2016,
    actualDays: 7,
    expectedDays: 14,
    factor: 0.5,
    direction: 'harder',
    description: 'Хешрейт удвоился -- блоки в 2 раза быстрее. Сложность удваивается.',
  },
];

/* ================================================================== */
/*  nBits compact encoding demo                                         */
/* ================================================================== */

function decodeNBits(nBits: number): { exponent: number; mantissa: number; targetHex: string } {
  const exponent = (nBits >> 24) & 0xff;
  const mantissa = nBits & 0x00ffffff;
  // target = mantissa * 2^(8*(exponent-3))
  // For display, we construct a simplified hex representation
  const mantissaHex = mantissa.toString(16).padStart(6, '0');
  const zeroBytes = exponent - 3;
  const targetHex = '0x' + mantissaHex + '00'.repeat(Math.max(0, zeroBytes));
  return { exponent, mantissa, targetHex };
}

/* ================================================================== */
/*  DifficultyAdjustmentTimeline                                        */
/* ================================================================== */

export function DifficultyAdjustmentTimeline() {
  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null);

  const genesisNBits = 0x1d00ffff;
  const decoded = decodeNBits(genesisNBits);

  const maxDays = 20; // Scale for bar chart
  const barMaxHeight = 120;
  const barWidth = 60;
  const barGap = 20;
  const chartWidth = EPOCHS.length * (barWidth + barGap) + barGap;
  const expectedLine = (14 / maxDays) * barMaxHeight;

  return (
    <DiagramContainer title="Корректировка сложности Bitcoin" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Formula display */}
        <div style={{ ...glassStyle, padding: '10px 14px', fontSize: 12, fontFamily: 'monospace' }}>
          <div style={{ color: colors.textMuted, marginBottom: 6 }}>Формула корректировки:</div>
          <div style={{ color: colors.text }}>
            new_target = old_target * (actual_time / expected_time)
          </div>
          <div style={{ color: colors.textMuted, marginTop: 4 }}>
            expected_time = 2016 * 600с = 1 209 600с (14 дней) | factor: min 0.25x, max 4.0x
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg width={chartWidth + 60} height={barMaxHeight + 60} viewBox={`0 0 ${chartWidth + 60} ${barMaxHeight + 60}`}>
            {/* Expected time dashed line */}
            <line
              x1={30}
              y1={barMaxHeight - expectedLine + 20}
              x2={chartWidth + 30}
              y2={barMaxHeight - expectedLine + 20}
              stroke={colors.accent}
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
            <text
              x={chartWidth + 34}
              y={barMaxHeight - expectedLine + 24}
              fill={colors.accent}
              fontSize={9}
              fontFamily="monospace"
            >
              14д
            </text>

            {/* Epoch bars */}
            {EPOCHS.map((epoch, i) => {
              const x = 30 + barGap + i * (barWidth + barGap);
              const barH = (epoch.actualDays / maxDays) * barMaxHeight;
              const y = barMaxHeight - barH + 20;
              const isSelected = selectedEpoch === i;

              const barColor =
                epoch.direction === 'harder'
                  ? '#ef4444'
                  : epoch.direction === 'easier'
                    ? '#4ade80'
                    : colors.accent;

              return (
                <g
                  key={i}
                  onClick={() => setSelectedEpoch(isSelected ? null : i)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    fill={barColor + '30'}
                    stroke={isSelected ? barColor : barColor + '60'}
                    strokeWidth={isSelected ? 2 : 1}
                    rx={4}
                  />
                  {/* Value label */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    fill={barColor}
                    fontSize={11}
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight={600}
                  >
                    {epoch.actualDays}д
                  </text>
                  {/* Factor label */}
                  <text
                    x={x + barWidth / 2}
                    y={y + barH / 2 + 4}
                    fill={colors.text}
                    fontSize={10}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    x{epoch.factor.toFixed(3)}
                  </text>
                  {/* Epoch label */}
                  <text
                    x={x + barWidth / 2}
                    y={barMaxHeight + 38}
                    fill={colors.textMuted}
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {epoch.label}
                  </text>
                  {/* Direction arrow */}
                  <text
                    x={x + barWidth / 2}
                    y={barMaxHeight + 52}
                    fill={barColor}
                    fontSize={12}
                    textAnchor="middle"
                  >
                    {epoch.direction === 'harder' ? '^ сложнее' : epoch.direction === 'easier' ? 'v легче' : '= стабильно'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected epoch details */}
        {selectedEpoch !== null && (
          <div
            style={{
              ...glassStyle,
              padding: '12px',
              border: `1px solid ${colors.primary}30`,
              background: `${colors.primary}08`,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
              {EPOCHS[selectedEpoch].label}: {EPOCHS[selectedEpoch].actualDays} дней (ожидалось {EPOCHS[selectedEpoch].expectedDays})
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>
              {EPOCHS[selectedEpoch].description}
            </div>
            <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.text, marginTop: 6 }}>
              factor = {EPOCHS[selectedEpoch].actualDays} / {EPOCHS[selectedEpoch].expectedDays} = {EPOCHS[selectedEpoch].factor.toFixed(3)}
              {EPOCHS[selectedEpoch].factor < 0.25 && ' (capped at 0.25)'}
              {EPOCHS[selectedEpoch].factor > 4.0 && ' (capped at 4.0)'}
            </div>
          </div>
        )}

        {/* nBits encoding */}
        <div style={{ ...glassStyle, padding: '12px' }}>
          <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, marginBottom: 8 }}>
            nBits компактный формат (Genesis block)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DataBox
              label="nBits"
              value={`0x${genesisNBits.toString(16)}`}
              variant="default"
            />
            <DataBox
              label="Экспонента"
              value={`0x${decoded.exponent.toString(16)} = ${decoded.exponent}`}
              variant="default"
            />
            <DataBox
              label="Мантисса"
              value={`0x${decoded.mantissa.toString(16).padStart(6, '0')}`}
              variant="default"
            />
          </div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: colors.text, marginTop: 8 }}>
            target = 0x{decoded.mantissa.toString(16).padStart(6, '0')} * 2^(8 * ({decoded.exponent} - 3)) = 0x00000000FFFF00...0000
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
            Формат: первый байт = экспонента (количество байт в target), остальные 3 байта = мантисса (старшие значащие байты target).
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}
