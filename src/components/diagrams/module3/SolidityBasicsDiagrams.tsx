/**
 * Solidity Basics Diagrams (ETH-06)
 *
 * Exports:
 * - ContractStorageLayoutDiagram: Interactive storage slot mapping for Solidity state variables
 * - SolidityTypesDiagram: Visual overview of Solidity types and their byte sizes
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ContractStorageLayoutDiagram                                        */
/* ================================================================== */

interface StorageSlot {
  slot: number;
  variables: {
    name: string;
    type: string;
    bytes: number;
    offset: number;
    value: string;
  }[];
}

const STORAGE_LAYOUTS: Record<string, StorageSlot[]> = {
  simple: [
    {
      slot: 0,
      variables: [{ name: 'owner', type: 'address', bytes: 20, offset: 0, value: '0xAbCd...1234' }],
    },
    {
      slot: 1,
      variables: [{ name: 'totalSupply', type: 'uint256', bytes: 32, offset: 0, value: '1000000' }],
    },
    {
      slot: 2,
      variables: [{ name: 'name', type: 'string', bytes: 32, offset: 0, value: '"Token" (short)' }],
    },
  ],
  packed: [
    {
      slot: 0,
      variables: [
        { name: 'isActive', type: 'bool', bytes: 1, offset: 0, value: 'true' },
        { name: 'decimals', type: 'uint8', bytes: 1, offset: 1, value: '18' },
        { name: 'rate', type: 'uint16', bytes: 2, offset: 2, value: '5000' },
        { name: 'admin', type: 'address', bytes: 20, offset: 4, value: '0xAbCd...1234' },
      ],
    },
    {
      slot: 1,
      variables: [{ name: 'balance', type: 'uint256', bytes: 32, offset: 0, value: '500 ETH' }],
    },
    {
      slot: 2,
      variables: [
        { name: 'flags', type: 'uint128', bytes: 16, offset: 0, value: '0xFF00' },
        { name: 'count', type: 'uint128', bytes: 16, offset: 16, value: '42' },
      ],
    },
  ],
};

/**
 * ContractStorageLayoutDiagram
 *
 * Shows how Solidity maps state variables to 32-byte storage slots.
 * Toggle between simple (no packing) and packed layout.
 */
export function ContractStorageLayoutDiagram() {
  const [layout, setLayout] = useState<'simple' | 'packed'>('simple');

  const slots = STORAGE_LAYOUTS[layout];
  const slotWidth = 320;
  const slotHeight = 52;

  const varTooltips: Record<string, string> = {
    owner: 'address (20 байт) занимает отдельный slot, хотя использует только 20 из 32 байт. 12 байт теряются без упаковки.',
    totalSupply: 'uint256 занимает ровно 1 slot (32 байта). Slot 1 для второй переменной. Все uint256 выровнены по 32 байтам.',
    name: 'string (short): строки до 31 байта хранятся inline в slot. Длинные строки -- по keccak256(slot).',
    isActive: 'bool (1 байт): упакован с другими мелкими типами. Solidity автоматически упаковывает если следующий тип помещается в оставшееся место.',
    decimals: 'uint8 (1 байт): упакован после bool в том же slot. Offset = 1 байт.',
    rate: 'uint16 (2 байта): упакован после bool + uint8. Offset = 2 байта. Все три переменные в одном SLOAD.',
    admin: 'address (20 байт) в packed slot: bool(1) + uint8(1) + uint16(2) + address(20) = 24 байта. Ещё 8 байт свободно.',
    balance: 'uint256 (32 байта): всегда отдельный slot. Невозможно упаковать с другими переменными.',
    flags: 'uint128 (16 байт) + uint128 (16 байт) = 32 байта = 1 slot. Два uint128 идеально заполняют slot.',
    count: 'uint128 (16 байт): упакован с flags в одном slot. Offset = 16 байт.',
  };

  return (
    <DiagramContainer title="Storage Layout: слоты контракта" color="blue">
      {/* Layout toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['simple', 'packed'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLayout(l)}
            style={{
              ...glassStyle,
              padding: '6px 16px',
              cursor: 'pointer',
              background: layout === l ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${layout === l ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              color: layout === l ? colors.primary : colors.text,
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            {l === 'simple' ? 'Без упаковки' : 'С упаковкой (packed)'}
          </button>
        ))}
      </div>

      {/* Slot diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {slots.map((slot) => (
          <div key={slot.slot} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Slot label */}
            <div style={{
              width: 70,
              textAlign: 'right',
              fontSize: 12,
              fontFamily: 'monospace',
              color: colors.textMuted,
            }}>
              Slot {slot.slot}
            </div>

            {/* 32-byte bar */}
            <div style={{
              width: slotWidth,
              height: slotHeight,
              position: 'relative',
              ...glassStyle,
              display: 'flex',
              overflow: 'hidden',
            }}>
              {slot.variables.map((v) => {
                const widthPct = (v.bytes / 32) * 100;
                const varColors = [colors.primary, colors.accent, colors.success, '#e879f9'];
                const idx = slot.variables.indexOf(v);
                const c = varColors[idx % varColors.length];

                return (
                  <DiagramTooltip key={v.name} content={varTooltips[v.name] || `${v.type} = ${v.value} | ${v.bytes} bytes | SLOAD slot ${slot.slot}`}>
                    <div
                      style={{
                        width: `${widthPct}%`,
                        height: '100%',
                        background: `${c}20`,
                        borderRight: `1px solid ${c}60`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 11, color: c, fontFamily: 'monospace', fontWeight: 600 }}>
                        {v.name}
                      </span>
                      <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                        {v.type} ({v.bytes}B)
                      </span>
                    </div>
                  </DiagramTooltip>
                );
              })}

              {/* Unused space */}
              {(() => {
                const usedBytes = slot.variables.reduce((s, v) => s + v.bytes, 0);
                const freeBytes = 32 - usedBytes;
                if (freeBytes <= 0) return null;
                return (
                  <div style={{
                    width: `${(freeBytes / 32) * 100}%`,
                    height: '100%',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 10, color: colors.textMuted, opacity: 0.5, fontFamily: 'monospace' }}>
                      {freeBytes}B free
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* 32 bytes label */}
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
              32 bytes
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <DiagramTooltip content={layout === 'simple'
        ? 'Без упаковки: каждая переменная в отдельном slot (32 байта). Неиспользованные байты теряются. Gas: 1 SLOAD на переменную.'
        : 'С упаковкой: мелкие типы объединяются в один slot. Порядок объявления критичен -- Solidity упаковывает только последовательные переменные.'
      }>
        <div style={{ marginTop: 12, fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          {layout === 'simple' ? (
            <>Каждая переменная занимает отдельный слот (32 байта). <code>address</code> (20 байт) тратит 12 байт впустую.</>
          ) : (
            <>Переменные размером {'<'} 32 байт упаковываются в один слот. Порядок объявления важен: <code>bool + uint8 + uint16 + address = 24 байта</code> в одном слоте.</>
          )}
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  SolidityTypesDiagram                                                */
/* ================================================================== */

interface TypeInfo {
  name: string;
  category: string;
  bytes: number;
  range: string;
  example: string;
  color: string;
}

const SOLIDITY_TYPES: TypeInfo[] = [
  { name: 'bool', category: 'Value', bytes: 1, range: 'true / false', example: 'bool isActive = true;', color: colors.success },
  { name: 'uint8', category: 'Value', bytes: 1, range: '0 .. 255', example: 'uint8 decimals = 18;', color: colors.primary },
  { name: 'uint16', category: 'Value', bytes: 2, range: '0 .. 65,535', example: 'uint16 rate = 5000;', color: colors.primary },
  { name: 'uint32', category: 'Value', bytes: 4, range: '0 .. 4.29 * 10^9', example: 'uint32 timestamp;', color: colors.primary },
  { name: 'uint128', category: 'Value', bytes: 16, range: '0 .. 3.4 * 10^38', example: 'uint128 balance;', color: colors.primary },
  { name: 'uint256', category: 'Value', bytes: 32, range: '0 .. 1.15 * 10^77', example: 'uint256 totalSupply;', color: colors.primary },
  { name: 'int256', category: 'Value', bytes: 32, range: '-5.78 * 10^76 .. 5.78 * 10^76', example: 'int256 delta;', color: '#e879f9' },
  { name: 'address', category: 'Value', bytes: 20, range: '20-byte Ethereum address', example: 'address owner;', color: colors.accent },
  { name: 'bytes32', category: 'Value', bytes: 32, range: '32 raw bytes', example: 'bytes32 hash;', color: '#f59e0b' },
  { name: 'string', category: 'Reference', bytes: 32, range: 'Dynamic UTF-8', example: 'string name = "Token";', color: '#f43f5e' },
  { name: 'bytes', category: 'Reference', bytes: 32, range: 'Dynamic byte array', example: 'bytes data;', color: '#f43f5e' },
  { name: 'mapping', category: 'Reference', bytes: 32, range: 'keccak256(key . slot)', example: 'mapping(address => uint) bal;', color: '#f43f5e' },
];

/**
 * SolidityTypesDiagram
 *
 * Visual reference for Solidity types: byte sizes, ranges, and slot usage.
 */
export function SolidityTypesDiagram() {
  const [filter, setFilter] = useState<'all' | 'Value' | 'Reference'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? SOLIDITY_TYPES : SOLIDITY_TYPES.filter((t) => t.category === filter)),
    [filter]
  );

  const typeTooltips: Record<string, string> = {
    bool: 'bool (1 байт): true/false. Может упаковываться с другими мелкими типами в один storage slot.',
    uint8: 'uint8 (1 байт): 0..255. Часто используется для decimals в ERC-20. Упаковывается в slot с другими типами.',
    uint16: 'uint16 (2 байта): 0..65535. Подходит для rate, percentage. Упаковывается с мелкими типами.',
    uint32: 'uint32 (4 байта): 0..4.29*10^9. Часто для timestamp (до 2106 года). Упаковывается.',
    uint128: 'uint128 (16 байт): 0..3.4*10^38. Два uint128 идеально заполняют один 32-байтный slot.',
    uint256: 'uint256 (32 байта): основной числовой тип Solidity. Занимает весь slot. EVM нативно работает с 256-бит числами.',
    int256: 'int256 (32 байта): знаковое целое. Two\'s complement. Диапазон от -2^255 до 2^255-1.',
    address: 'address (20 байт): Ethereum адрес. Может упаковываться с мелкими типами. address payable -- может получать ETH.',
    bytes32: 'bytes32 (32 байта): фиксированные raw bytes. Используется для хешей, идентификаторов. Дешевле string для коротких данных.',
    string: 'string (dynamic): UTF-8 строка. Short strings (<32 bytes) inline в slot. Long -- длина в slot, данные по keccak256(slot).',
    bytes: 'bytes (dynamic): произвольные байты. Аналогично string, но без UTF-8 валидации. Используется для calldata, bytecode.',
    mapping: 'mapping(key => value): каждый элемент в slot keccak256(key . slot_number). Slot самого mapping пуст. Нельзя итерировать.',
  };

  return (
    <DiagramContainer title="Типы Solidity: размеры и слоты" color="purple">
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['all', 'Value', 'Reference'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...glassStyle,
              padding: '5px 14px',
              cursor: 'pointer',
              background: filter === f ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filter === f ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              color: filter === f ? colors.primary : colors.text,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {f === 'all' ? 'Все' : f === 'Value' ? 'Value-типы' : 'Reference-типы'}
          </button>
        ))}
      </div>

      {/* Type cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 10,
      }}>
        {filtered.map((t) => {
          const barWidth = Math.max((t.bytes / 32) * 100, 8);

          return (
            <DiagramTooltip key={t.name} content={typeTooltips[t.name] || `${t.name}: ${t.bytes} байт, ${t.category} тип.`}>
              <div
                style={{
                  ...glassStyle,
                  padding: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600, color: t.color }}>
                    {t.name}
                  </span>
                  <span style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: `${t.color}20`,
                    color: t.color,
                    fontFamily: 'monospace',
                  }}>
                    {t.bytes}B
                  </span>
                </div>

                {/* Size bar */}
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.05)',
                  marginBottom: 6,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: t.color,
                    borderRadius: 3,
                    opacity: 0.6,
                  }} />
                </div>

                <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
                  {t.range}
                </div>

                <div style={{
                  marginTop: 6,
                  padding: '6px 8px',
                  borderRadius: 4,
                  background: 'rgba(0,0,0,0.3)',
                  fontSize: 11,
                  color: colors.text,
                  fontFamily: 'monospace',
                }}>
                  {t.example}
                </div>
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      <DiagramTooltip content="Value types копируются при присваивании, хранятся в stack/storage напрямую. Reference types хранят ссылку -- важно указать data location: storage, memory, calldata.">
        <div style={{ marginTop: 12, fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          <strong>Value-типы</strong> хранятся непосредственно в слоте. <strong>Reference-типы</strong> (string, bytes, mapping) хранят указатель; данные -- по keccak256(slot).
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}
