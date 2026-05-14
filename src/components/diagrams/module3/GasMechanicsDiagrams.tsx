/** @jsxImportSource solid-js */
/**
 * Gas Mechanics Diagrams (ETH-05)
 *
 * Exports:
 * - EIP1559Diagram: EIP-1559 base fee adjustment with interactive slider
 * - GasCostTableDiagram: Gas cost comparison table with warm/cold distinction
 */

import { createMemo, createSignal } from 'solid-js';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
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
  const [utilization, setUtilization] = createSignal(60);

  const TARGET_GAS = 15_000_000;
  const MAX_GAS = 30_000_000;
  const MAX_FEE = 30;      // gwei
  const MAX_PRIORITY = 2;  // gwei

  // Block N-1: 50% utilization (baseline)
  const prevBaseFee = 10; // gwei
  const prevUsed = Math.round(TARGET_GAS * 0.5); // 7.5M

  // Block N: user-controlled utilization
  const currentUsed = Math.round(MAX_GAS * utilization() / 100);
  // Base fee adjustment: new_base = old_base * (1 + (gas_used - target) / target / 8)
  const delta = (currentUsed - TARGET_GAS) / TARGET_GAS / 8;
  const currentBaseFee = Math.max(0, Math.round(prevBaseFee * (1 + delta) * 100) / 100);

  // Block N+1: predicted base fee from current block
  const nextDelta = (currentUsed - TARGET_GAS) / TARGET_GAS / 8;
  const nextBaseFee = Math.max(0, Math.round(currentBaseFee * (1 + nextDelta) * 100) / 100);

  // Effective gas price calculation for block N
  const effectiveGasPrice = createMemo(() => {
    return Math.min(MAX_FEE, currentBaseFee + MAX_PRIORITY);
  });

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
      pct: utilization(),
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
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '12px' }}>
        {/* Block utilization slider */}
        <InteractiveValue
          value={utilization()}
          onChange={setUtilization}
          min={0}
          max={100}
          step={5}
          label="Заполненность Block N (%)"
        />

        {/* Three-block sequence */}
        <div style={{ 'display': 'flex', 'gap': '8px' }}>
          {blocks.map((block, i) => (
            <DiagramTooltip content={
              i === 0
                ? 'Block N-1: предыдущий блок с 50% заполненностью (baseline). Base fee определяется заполненностью предыдущих блоков.'
                : i === 1
                ? 'Block N: текущий блок. Заполненность контролируется слайдером. Base fee корректируется на основе отклонения от target (50%).'
                : 'Block N+1: прогнозируемый base fee на основе заполненности Block N. Формула: new_base = old_base * (1 + delta/8).'
            }>
              <div
                style={{
                  'flex': '1',
                  ...glassStyle,
                  'padding': '12px',
                  'border': `1px solid ${block.isCurrent ? colors.primary + '80' : colors.border}`,
                  'background': block.isCurrent ? `${colors.primary}10` : 'rgba(255,255,255,0.03)',
                  'display': 'flex',
                  'flex-direction': 'column',
                  'gap': '8px',
                }}
              >
                <div style={{ 'font-size': '12px', 'font-weight': '700', 'color': block.isCurrent ? colors.primary : colors.text, 'text-align': 'center' }}>
                  {block.label}
                </div>

                {/* Utilization bar */}
                <div style={{ 'height': '8px', 'background': 'rgba(255,255,255,0.1)', 'border-radius': '4px', 'overflow': 'hidden' }}>
                  {block.pct !== null && (
                    <div
                      style={{
                        'width': `${block.pct}%`,
                        'height': '100%',
                        'background': getBarColor(block.pct),
                        'border-radius': '4px',
                        'transition': 'width 200ms ease, background 200ms ease',
                      }}
                    />
                  )}
                </div>

                <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'text-align': 'center' }}>
                  {block.pct !== null ? `${block.pct}% full` : 'predicted'}
                </div>

                <div style={{ 'font-size': '13px', 'font-family': 'monospace', 'color': colors.warning, 'text-align': 'center', 'font-weight': '600' }}>
                  baseFee: {block.baseFee.toFixed(2)} gwei
                </div>

                {block.used !== null && (
                  <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'text-align': 'center' }}>
                    {(block.used / 1_000_000).toFixed(1)}M / {MAX_GAS / 1_000_000}M gas
                  </div>
                )}
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {/* Arrow showing base fee direction */}
        <div style={{ 'text-align': 'center', 'font-size': '12px', 'font-family': 'monospace' }}>
          {utilization() > 50 ? (
            <span style={{ 'color': colors.danger }}>baseFee УВЕЛИЧИВАЕТСЯ ({delta > 0 ? '+' : ''}{(delta * 100).toFixed(1)}% за блок)</span>
          ) : utilization() < 50 ? (
            <span style={{ 'color': colors.success }}>baseFee УМЕНЬШАЕТСЯ ({(delta * 100).toFixed(1)}% за блок)</span>
          ) : (
            <span style={{ 'color': colors.accent }}>baseFee СТАБИЛЕН (блок заполнен на 50% = target)</span>
          )}
        </div>

        {/* Transaction cost breakdown */}
        <div style={{ ...glassStyle, 'padding': '14px' }}>
          <div style={{ 'font-size': '11px', 'color': colors.accent, 'margin-bottom': '10px', 'text-transform': 'uppercase', 'letter-spacing': '0.05em', 'font-weight': '600' }}>
            Расчет стоимости транзакции (Block N, transfer 21000 gas)
          </div>
          <div style={{ 'font-family': 'monospace', 'font-size': '12px', 'line-height': '2', 'color': colors.text }}>
            <div>maxFeePerGas = <span style={{ 'color': colors.primary }}>{MAX_FEE}</span> gwei</div>
            <div>maxPriorityFeePerGas = <span style={{ 'color': colors.primary }}>{MAX_PRIORITY}</span> gwei</div>
            <div>baseFeePerGas = <span style={{ 'color': colors.warning }}>{currentBaseFee.toFixed(2)}</span> gwei</div>
            <div style={{ 'border-top': `1px solid ${colors.border}`, 'padding-top': '4px', 'margin-top': '4px' }}>
              effectiveGasPrice = min({MAX_FEE}, {currentBaseFee.toFixed(2)} + {MAX_PRIORITY}) = <span style={{ 'color': colors.accent }}>{effectiveGasPrice.toFixed(2)}</span> gwei
            </div>
            <div>totalCost = {exampleGasUsed.toLocaleString()} * {effectiveGasPrice.toFixed(2)} = <span style={{ 'color': colors.text, 'font-weight': '600' }}>{totalCostWei.toLocaleString()}</span> gwei</div>
          </div>
        </div>

        {/* Burn and tip breakdown */}
        <Grid columns={3} gap={8}>
          <DiagramTooltip content="Base fee сжигается (удаляется из оборота). Если burn > issuance -- ETH дефляционный. С Merge: ETH часто в дефляции.">
            <DataBox
              label="Сожжено (burned)"
              value={`${burnedTotal.toLocaleString()} gwei`}
              variant="default"
              style={{ 'border-color': `${colors.danger}30` }}
            />
          </DiagramTooltip>
          <DiagramTooltip content="Priority fee (tip): надбавка, идущая напрямую валидатору. Стимул для включения транзакции в блок. Типично 1-2 Gwei.">
            <DataBox
              label="Валидатору (tip)"
              value={`${tipTotal.toLocaleString()} gwei`}
              variant="default"
              style={{ 'border-color': `${colors.success}30` }}
            />
          </DiagramTooltip>
          <DiagramTooltip content="Итого = burned + tip. Max fee per gas -- максимум, который пользователь готов заплатить. Разница (max - actual) возвращается.">
            <DataBox
              label="Итого"
              value={`${totalCostWei.toLocaleString()} gwei`}
              variant="highlight"
            />
          </DiagramTooltip>
        </Grid>

        {/* Visual burn / tip split bar */}
        <DiagramTooltip content="Распределение комиссии: красная часть (burned) -- base fee, сжигается протоколом. Зелёная часть (tip) -- priority fee, идёт валидатору.">
        <div style={{ ...glassStyle, 'padding': '10px' }}>
          <div style={{ 'font-size': '10px', 'color': colors.textMuted, 'margin-bottom': '4px', 'text-align': 'center' }}>
            Распределение комиссии
          </div>
          <div style={{ 'display': 'flex', 'height': '16px', 'border-radius': '8px', 'overflow': 'hidden' }}>
            <div
              style={{
                'width': effectiveGasPrice > 0 ? `${(burned / effectiveGasPrice) * 100}%` : '0%',
                'background': colors.danger,
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '9px',
                'color': '#fff',
                'transition': 'width 200ms ease',
              }}
            >
              {burned > 0 ? 'burned' : ''}
            </div>
            <div
              style={{
                'width': effectiveGasPrice > 0 ? `${(validatorTip / effectiveGasPrice) * 100}%` : '0%',
                'background': colors.success,
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '9px',
                'color': '#fff',
                'transition': 'width 200ms ease',
              }}
            >
              {validatorTip > 0 ? 'tip' : ''}
            </div>
          </div>
        </div>
        </DiagramTooltip>

        <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'text-align': 'center', 'line-height': '1.5' }}>
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
  tooltip: string;
}

const OPCODES: OpcodeEntry[] = [
  { name: 'ADD / SUB', gasCold: 3, gasWarm: null, category: 'Arithmetic', note: 'Самые дешевые операции', tooltip: 'ADD/SUB (3 gas): базовые арифметические операции на 256-бит числах. Самые дешёвые computational opcodes в EVM.' },
  { name: 'MUL / DIV', gasCold: 5, gasWarm: null, category: 'Arithmetic', note: 'Чуть дороже сложения', tooltip: 'MUL/DIV (5 gas): умножение и деление 256-бит чисел. DIV на 0 возвращает 0 (не revert). SDIV -- знаковое деление.' },
  { name: 'EXP', gasCold: 10, gasWarm: null, category: 'Arithmetic', note: '+ 50 за каждый байт exponent', tooltip: 'EXP (10 + 50*bytes): возведение в степень. Стоимость растёт с размером exponent -- 50 gas за каждый байт показателя.' },
  { name: 'KECCAK256', gasCold: 30, gasWarm: null, category: 'Hashing', note: '+ 6 gas за каждые 32 байта', tooltip: 'KECCAK256 (30 + 6*words): хеширование данных из memory. Основа mapping storage, event topics, CREATE2 адресов.' },
  { name: 'SLOAD', gasCold: 2100, gasWarm: 100, category: 'Storage', note: 'EIP-2929: cold/warm access', tooltip: 'SLOAD (2100 cold / 100 warm): чтение из storage. Cold = первый доступ в транзакции. Warm = повторный (EIP-2929).' },
  { name: 'SSTORE (0->non-0)', gasCold: 22100, gasWarm: 100, category: 'Storage', note: 'Создание нового слота', tooltip: 'SSTORE 0->non-0 (22100 gas): запись в пустой слот -- самая дорогая операция. Постоянное изменение мирового состояния Ethereum.' },
  { name: 'SSTORE (non-0->non-0)', gasCold: 5000, gasWarm: 100, category: 'Storage', note: 'Обновление существующего', tooltip: 'SSTORE non-0->non-0 (5000 gas): обновление существующего значения. Дешевле создания нового слота.' },
  { name: 'SSTORE (non-0->0)', gasCold: 5000, gasWarm: 100, category: 'Storage', note: '+ 4800 gas refund', tooltip: 'SSTORE non-0->0 (5000 gas + 4800 refund): удаление значения. Gas refund стимулирует очистку storage.' },
  { name: 'CALL', gasCold: 2600, gasWarm: 100, category: 'Call', note: 'Вызов другого контракта', tooltip: 'CALL (2600 cold): вызов другого контракта. Передаёт control flow. Reentrancy risk если не используется CEI pattern.' },
  { name: 'DELEGATECALL', gasCold: 2600, gasWarm: 100, category: 'Call', note: 'Вызов с контекстом caller', tooltip: 'DELEGATECALL (2600 cold): вызов кода другого контракта в контексте caller. Основа proxy pattern и библиотек.' },
  { name: 'CREATE', gasCold: 32000, gasWarm: null, category: 'Create', note: 'Деплой нового контракта', tooltip: 'CREATE (32000 gas): создание нового контракта. Адрес = keccak256(sender, nonce). CREATE2 -- детерминистический адрес.' },
  { name: 'LOG1', gasCold: 750, gasWarm: null, category: 'Logging', note: '375 + 375*topics + 8*data_bytes', tooltip: 'LOG1 (750 gas): запись события с 1 topic. Events не хранятся в state -- только в transaction receipt. Индексируемы off-chain.' },
  { name: 'MLOAD / MSTORE', gasCold: 3, gasWarm: null, category: 'Memory', note: '+ стоимость расширения памяти', tooltip: 'MLOAD/MSTORE (3 gas): чтение/запись 32 байт из memory. Дешевле storage, но memory volatile -- очищается после call context.' },
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
  const [selectedRow, setSelectedRow] = createSignal<number | null>(null);
  const [filter, setFilter] = createSignal<string>('all');

  const categories = createMemo(() => {
    const cats = new Set(OPCODES.map(o => o.category));
    return ['all', ...Array.from(cats)];
  });

  const filteredOpcodes = createMemo(() => {
    if (filter() === 'all') return OPCODES;
    return OPCODES.filter(o => o.category === filter());
  });

  return (
    <DiagramContainer title="Стоимость опкодов EVM (gas)" color="blue">
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '12px' }}>
        {/* Category filter */}
        <div style={{ 'display': 'flex', 'gap': '6px', 'flex-wrap': 'wrap' }}>
          {categories.map(cat => (
            <button
              onClick={() => { setFilter(cat); setSelectedRow(null); }}
              style={{
                ...glassStyle,
                'padding': '4px 12px',
                'cursor': 'pointer',
                'font-size': '11px',
                'color': filter() === cat ? colors.primary : colors.textMuted,
                'border': `1px solid ${filter() === cat ? colors.primary + '60' : colors.border}`,
                'background': filter() === cat ? `${colors.primary}15` : 'rgba(255,255,255,0.03)',
              }}
            >
              {cat === 'all' ? 'Все' : cat}
            </button>
          ))}
        </div>

        {/* Table header */}
        <div style={{
          'display': 'grid',
          'grid-template-columns': '2fr 1fr 1fr',
          'gap': '4px',
          'padding': '8px 12px',
          'background': 'rgba(255,255,255,0.05)',
          'border-radius': '8px',
          'font-size': '11px',
          'color': colors.textMuted,
          'font-weight': '600',
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
        }}>
          <span>Opcode</span>
          <span style={{ 'text-align': 'right' }}>Cold Gas</span>
          <span style={{ 'text-align': 'right' }}>Warm Gas</span>
        </div>

        {/* Table rows */}
        <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '3px' }}>
          {filteredOpcodes.map((op, i) => (
            <div
              onClick={() => setSelectedRow(selectedRow() === i ? null : i)}
              style={{
                'display': 'grid',
                'grid-template-columns': '2fr 1fr 1fr',
                'gap': '4px',
                'padding': '8px 12px',
                'border-radius': '6px',
                'cursor': 'pointer',
                'background': selectedRow() === i ? `${getGasColor(op.gasCold)}10` : 'rgba(255,255,255,0.02)',
                'border': `1px solid ${selectedRow() === i ? getGasColor(op.gasCold) + '40' : 'transparent'}`,
                'transition': 'all 150ms ease',
              }}
            >
              <DiagramTooltip content={op.tooltip}>
                <span style={{ 'font-family': 'monospace', 'font-size': '12px', 'color': colors.text }}>
                  {op.name}
                </span>
              </DiagramTooltip>
              <span style={{
                'text-align': 'right',
                'font-family': 'monospace',
                'font-size': '12px',
                'color': getGasColor(op.gasCold),
                'font-weight': '600',
              }}>
                {op.gasCold.toLocaleString()}
              </span>
              <span style={{
                'text-align': 'right',
                'font-family': 'monospace',
                'font-size': '12px',
                'color': op.gasWarm !== null ? getGasColor(op.gasWarm) : colors.textMuted,
                'font-weight': op.gasWarm !== null ? 600 : 400,
              }}>
                {op.gasWarm !== null ? op.gasWarm.toLocaleString() : '--'}
              </span>
            </div>
          ))}
        </div>

        {/* Selected row detail */}
        {selectedRow() !== null && filteredOpcodes[selectedRow()] && (
          <div style={{
            ...glassStyle,
            'padding': '12px',
            'border': `1px solid ${getGasColor(filteredOpcodes[selectedRow()].gasCold)}30`,
          }}>
            <div style={{ 'font-size': '12px', 'color': colors.text, 'line-height': '1.6' }}>
              <span style={{ 'font-weight': '600', 'color': getGasColor(filteredOpcodes[selectedRow()].gasCold) }}>
                {filteredOpcodes[selectedRow()].name}
              </span>
              : {filteredOpcodes[selectedRow()].note}
              {filteredOpcodes[selectedRow()].gasWarm !== null && (
                <div style={{ 'margin-top': '6px', 'font-size': '11px', 'color': colors.textMuted }}>
                  EIP-2929: первый доступ к адресу/слоту в транзакции = cold ({filteredOpcodes[selectedRow()].gasCold} gas).
                  Повторный доступ = warm ({filteredOpcodes[selectedRow()].gasWarm} gas).
                  Разница: {filteredOpcodes[selectedRow()].gasCold - (filteredOpcodes[selectedRow()].gasWarm || 0)} gas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ 'display': 'flex', 'gap': '16px', 'justify-content': 'center', 'font-size': '11px' }}>
          <DiagramTooltip content="Дешёвые операции (<10 gas): арифметика, memory read/write. Не влияют существенно на стоимость транзакции.">
            <span><span style={{ 'color': colors.success }}>&#9632;</span> &lt;10 gas (дешево)</span>
          </DiagramTooltip>
          <DiagramTooltip content="Средние операции (10-1000 gas): хеширование, логирование. Заметны при частом использовании в циклах.">
            <span><span style={{ 'color': colors.warning }}>&#9632;</span> 10-1000 gas (средне)</span>
          </DiagramTooltip>
          <DiagramTooltip content="Дорогие операции (>1000 gas): storage, external calls, contract creation. Основной драйвер стоимости транзакций.">
            <span><span style={{ 'color': colors.danger }}>&#9632;</span> &gt;1000 gas (дорого)</span>
          </DiagramTooltip>
        </div>

        <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'text-align': 'center', 'line-height': '1.5' }}>
          Нажмите на строку для подробностей. Cold/Warm (EIP-2929): первый доступ к адресу или слоту стоит дороже.
        </div>
      </div>
    </DiagramContainer>
  );
}
