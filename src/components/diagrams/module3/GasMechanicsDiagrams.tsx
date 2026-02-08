/**
 * Gas Mechanics Diagrams (ETH-05)
 *
 * Exports:
 * - EIP1559Diagram: EIP-1559 base fee adjustment with interactive slider
 * - GasCostTableDiagram: Gas cost comparison table with warm/cold distinction
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  EIP1559Diagram                                                      */
/* ================================================================== */

/**
 * EIP-1559 base fee adjustment with block utilization slider.
 *
 * Shows three-block sequence where user controls block N utilization.
 * Fixed example: maxFeePerGas=30 gwei, maxPriorityFeePerGas=2 gwei, target=15M gas.
 */
export function EIP1559Diagram() {
  const [utilization, setUtilization] = useState(60);

  const TARGET_GAS = 15_000_000;
  const MAX_GAS = 30_000_000;
  const MAX_FEE = 30;      // gwei
  const MAX_PRIORITY = 2;  // gwei

  // Block N-1: 50% utilization (baseline)
  const prevBaseFee = 10; // gwei
  const prevUsed = Math.round(TARGET_GAS * 0.5); // 7.5M

  // Block N: user-controlled utilization
  const currentUsed = Math.round(MAX_GAS * utilization / 100);
  // Base fee adjustment: new_base = old_base * (1 + (gas_used - target) / target / 8)
  const delta = (currentUsed - TARGET_GAS) / TARGET_GAS / 8;
  const currentBaseFee = Math.max(0, Math.round(prevBaseFee * (1 + delta) * 100) / 100);

  // Block N+1: predicted base fee from current block
  const nextDelta = (currentUsed - TARGET_GAS) / TARGET_GAS / 8;
  const nextBaseFee = Math.max(0, Math.round(currentBaseFee * (1 + nextDelta) * 100) / 100);

  // Effective gas price calculation for block N
  const effectiveGasPrice = useMemo(() => {
    return Math.min(MAX_FEE, currentBaseFee + MAX_PRIORITY);
  }, [currentBaseFee]);

  const burned = currentBaseFee;
  const validatorTip = Math.round((effectiveGasPrice - currentBaseFee) * 100) / 100;

  // Gas used as example transaction: 21000 (simple transfer)
  const exampleGasUsed = 21000;
  const totalCostWei = exampleGasUsed * effectiveGasPrice;
  const burnedTotal = exampleGasUsed * burned;
  const tipTotal = exampleGasUsed * validatorTip;

  const blocks = [
    {
      label: 'Block N-1',
      baseFee: prevBaseFee,
      used: prevUsed,
      pct: 50,
      isCurrent: false,
    },
    {
      label: 'Block N',
      baseFee: currentBaseFee,
      used: currentUsed,
      pct: utilization,
      isCurrent: true,
    },
    {
      label: 'Block N+1',
      baseFee: nextBaseFee,
      used: null,
      pct: null,
      isCurrent: false,
    },
  ];

  const getBarColor = (pct: number) => {
    if (pct < 40) return colors.success;
    if (pct < 60) return colors.accent;
    if (pct < 80) return colors.warning;
    return colors.danger;
  };

  return (
    <DiagramContainer title="EIP-1559: динамическая комиссия" color="purple">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Block utilization slider */}
        <InteractiveValue
          value={utilization}
          onChange={setUtilization}
          min={0}
          max={100}
          step={5}
          label="Заполненность Block N (%)"
        />

        {/* Three-block sequence */}
        <div style={{ display: 'flex', gap: 8 }}>
          {blocks.map((block, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                ...glassStyle,
                padding: 12,
                border: `1px solid ${block.isCurrent ? colors.primary + '80' : colors.border}`,
                background: block.isCurrent ? `${colors.primary}10` : 'rgba(255,255,255,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: block.isCurrent ? colors.primary : colors.text, textAlign: 'center' }}>
                {block.label}
              </div>

              {/* Utilization bar */}
              <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                {block.pct !== null && (
                  <div
                    style={{
                      width: `${block.pct}%`,
                      height: '100%',
                      background: getBarColor(block.pct),
                      borderRadius: 4,
                      transition: 'width 200ms ease, background 200ms ease',
                    }}
                  />
                )}
              </div>

              <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
                {block.pct !== null ? `${block.pct}% full` : 'predicted'}
              </div>

              <div style={{ fontSize: 13, fontFamily: 'monospace', color: colors.warning, textAlign: 'center', fontWeight: 600 }}>
                baseFee: {block.baseFee.toFixed(2)} gwei
              </div>

              {block.used !== null && (
                <div style={{ fontSize: 10, color: colors.textMuted, textAlign: 'center' }}>
                  {(block.used / 1_000_000).toFixed(1)}M / {MAX_GAS / 1_000_000}M gas
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Arrow showing base fee direction */}
        <div style={{ textAlign: 'center', fontSize: 12, fontFamily: 'monospace' }}>
          {utilization > 50 ? (
            <span style={{ color: colors.danger }}>baseFee УВЕЛИЧИВАЕТСЯ ({delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}% за блок)</span>
          ) : utilization < 50 ? (
            <span style={{ color: colors.success }}>baseFee УМЕНЬШАЕТСЯ ({(delta * 100).toFixed(1)}% за блок)</span>
          ) : (
            <span style={{ color: colors.accent }}>baseFee СТАБИЛЕН (блок заполнен на 50% = target)</span>
          )}
        </div>

        {/* Transaction cost breakdown */}
        <div style={{ ...glassStyle, padding: 14 }}>
          <div style={{ fontSize: 11, color: colors.accent, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Расчет стоимости транзакции (Block N, transfer 21000 gas)
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2, color: colors.text }}>
            <div>maxFeePerGas = <span style={{ color: colors.primary }}>{MAX_FEE}</span> gwei</div>
            <div>maxPriorityFeePerGas = <span style={{ color: colors.primary }}>{MAX_PRIORITY}</span> gwei</div>
            <div>baseFeePerGas = <span style={{ color: colors.warning }}>{currentBaseFee.toFixed(2)}</span> gwei</div>
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 4, marginTop: 4 }}>
              effectiveGasPrice = min({MAX_FEE}, {currentBaseFee.toFixed(2)} + {MAX_PRIORITY}) = <span style={{ color: colors.accent }}>{effectiveGasPrice.toFixed(2)}</span> gwei
            </div>
            <div>totalCost = {exampleGasUsed.toLocaleString()} * {effectiveGasPrice.toFixed(2)} = <span style={{ color: colors.text, fontWeight: 600 }}>{totalCostWei.toLocaleString()}</span> gwei</div>
          </div>
        </div>

        {/* Burn and tip breakdown */}
        <Grid columns={3} gap={8}>
          <DataBox
            label="Сожжено (burned)"
            value={`${burnedTotal.toLocaleString()} gwei`}
            variant="default"
            style={{ borderColor: `${colors.danger}30` }}
          />
          <DataBox
            label="Валидатору (tip)"
            value={`${tipTotal.toLocaleString()} gwei`}
            variant="default"
            style={{ borderColor: `${colors.success}30` }}
          />
          <DataBox
            label="Итого"
            value={`${totalCostWei.toLocaleString()} gwei`}
            variant="highlight"
          />
        </Grid>

        {/* Visual burn / tip split bar */}
        <div style={{ ...glassStyle, padding: 10 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4, textAlign: 'center' }}>
            Распределение комиссии
          </div>
          <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden' }}>
            <div
              style={{
                width: effectiveGasPrice > 0 ? `${(burned / effectiveGasPrice) * 100}%` : '0%',
                background: colors.danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: '#fff',
                transition: 'width 200ms ease',
              }}
            >
              {burned > 0 ? 'burned' : ''}
            </div>
            <div
              style={{
                width: effectiveGasPrice > 0 ? `${(validatorTip / effectiveGasPrice) * 100}%` : '0%',
                background: colors.success,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: '#fff',
                transition: 'width 200ms ease',
              }}
            >
              {validatorTip > 0 ? 'tip' : ''}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
          Target = {TARGET_GAS / 1_000_000}M gas (50% от max {MAX_GAS / 1_000_000}M).
          Если блок заполнен больше target -- baseFee растет (до +12.5% за блок).
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  GasCostTableDiagram                                                 */
/* ================================================================== */

interface OpcodeEntry {
  name: string;
  gasCold: number;
  gasWarm: number | null;
  category: string;
  note: string;
}

const OPCODES: OpcodeEntry[] = [
  { name: 'ADD / SUB', gasCold: 3, gasWarm: null, category: 'Arithmetic', note: 'Самые дешевые операции' },
  { name: 'MUL / DIV', gasCold: 5, gasWarm: null, category: 'Arithmetic', note: 'Чуть дороже сложения' },
  { name: 'EXP', gasCold: 10, gasWarm: null, category: 'Arithmetic', note: '+ 50 за каждый байт exponent' },
  { name: 'KECCAK256', gasCold: 30, gasWarm: null, category: 'Hashing', note: '+ 6 gas за каждые 32 байта' },
  { name: 'SLOAD', gasCold: 2100, gasWarm: 100, category: 'Storage', note: 'EIP-2929: cold/warm access' },
  { name: 'SSTORE (0->non-0)', gasCold: 22100, gasWarm: 100, category: 'Storage', note: 'Создание нового слота' },
  { name: 'SSTORE (non-0->non-0)', gasCold: 5000, gasWarm: 100, category: 'Storage', note: 'Обновление существующего' },
  { name: 'SSTORE (non-0->0)', gasCold: 5000, gasWarm: 100, category: 'Storage', note: '+ 4800 gas refund' },
  { name: 'CALL', gasCold: 2600, gasWarm: 100, category: 'Call', note: 'Вызов другого контракта' },
  { name: 'DELEGATECALL', gasCold: 2600, gasWarm: 100, category: 'Call', note: 'Вызов с контекстом caller' },
  { name: 'CREATE', gasCold: 32000, gasWarm: null, category: 'Create', note: 'Деплой нового контракта' },
  { name: 'LOG1', gasCold: 750, gasWarm: null, category: 'Logging', note: '375 + 375*topics + 8*data_bytes' },
  { name: 'MLOAD / MSTORE', gasCold: 3, gasWarm: null, category: 'Memory', note: '+ стоимость расширения памяти' },
];

function getGasColor(gas: number): string {
  if (gas <= 10) return colors.success;
  if (gas <= 1000) return colors.warning;
  return colors.danger;
}

/**
 * GasCostTableDiagram -- Gas cost comparison table with warm/cold distinction (EIP-2929).
 */
export function GasCostTableDiagram() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(OPCODES.map(o => o.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredOpcodes = useMemo(() => {
    if (filter === 'all') return OPCODES;
    return OPCODES.filter(o => o.category === filter);
  }, [filter]);

  return (
    <DiagramContainer title="Стоимость опкодов EVM (gas)" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setSelectedRow(null); }}
              style={{
                ...glassStyle,
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: 11,
                color: filter === cat ? colors.primary : colors.textMuted,
                border: `1px solid ${filter === cat ? colors.primary + '60' : colors.border}`,
                background: filter === cat ? `${colors.primary}15` : 'rgba(255,255,255,0.03)',
              }}
            >
              {cat === 'all' ? 'Все' : cat}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 4,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          fontSize: 11,
          color: colors.textMuted,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>Opcode</span>
          <span style={{ textAlign: 'right' }}>Cold Gas</span>
          <span style={{ textAlign: 'right' }}>Warm Gas</span>
        </div>

        {/* Table rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredOpcodes.map((op, i) => (
            <div
              key={op.name}
              onClick={() => setSelectedRow(selectedRow === i ? null : i)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                gap: 4,
                padding: '8px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                background: selectedRow === i ? `${getGasColor(op.gasCold)}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedRow === i ? getGasColor(op.gasCold) + '40' : 'transparent'}`,
                transition: 'all 150ms ease',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: colors.text }}>
                {op.name}
              </span>
              <span style={{
                textAlign: 'right',
                fontFamily: 'monospace',
                fontSize: 12,
                color: getGasColor(op.gasCold),
                fontWeight: 600,
              }}>
                {op.gasCold.toLocaleString()}
              </span>
              <span style={{
                textAlign: 'right',
                fontFamily: 'monospace',
                fontSize: 12,
                color: op.gasWarm !== null ? getGasColor(op.gasWarm) : colors.textMuted,
                fontWeight: op.gasWarm !== null ? 600 : 400,
              }}>
                {op.gasWarm !== null ? op.gasWarm.toLocaleString() : '--'}
              </span>
            </div>
          ))}
        </div>

        {/* Selected row detail */}
        {selectedRow !== null && filteredOpcodes[selectedRow] && (
          <div style={{
            ...glassStyle,
            padding: 12,
            border: `1px solid ${getGasColor(filteredOpcodes[selectedRow].gasCold)}30`,
          }}>
            <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600, color: getGasColor(filteredOpcodes[selectedRow].gasCold) }}>
                {filteredOpcodes[selectedRow].name}
              </span>
              : {filteredOpcodes[selectedRow].note}
              {filteredOpcodes[selectedRow].gasWarm !== null && (
                <div style={{ marginTop: 6, fontSize: 11, color: colors.textMuted }}>
                  EIP-2929: первый доступ к адресу/слоту в транзакции = cold ({filteredOpcodes[selectedRow].gasCold} gas).
                  Повторный доступ = warm ({filteredOpcodes[selectedRow].gasWarm} gas).
                  Разница: {filteredOpcodes[selectedRow].gasCold - (filteredOpcodes[selectedRow].gasWarm || 0)} gas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 11 }}>
          <span><span style={{ color: colors.success }}>&#9632;</span> &lt;10 gas (дешево)</span>
          <span><span style={{ color: colors.warning }}>&#9632;</span> 10-1000 gas (средне)</span>
          <span><span style={{ color: colors.danger }}>&#9632;</span> &gt;1000 gas (дорого)</span>
        </div>

        <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 1.5 }}>
          Нажмите на строку для подробностей. Cold/Warm (EIP-2929): первый доступ к адресу или слоту стоит дороже.
        </div>
      </div>
    </DiagramContainer>
  );
}
