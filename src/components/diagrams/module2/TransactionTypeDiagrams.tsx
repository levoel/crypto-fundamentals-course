/**
 * Transaction Type Diagrams
 *
 * Exports:
 * - TransactionTypeComparison: Side-by-side comparison of 5 tx types (P2PKH, P2SH, P2WPKH, P2WSH, P2TR)
 * - SegWitFormatDiagram: Legacy vs SegWit transaction format explorer
 * - WeightCalculationDiagram: Weight/vbytes step-through with history array
 */

import React, { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { Grid } from '@primitives/Grid';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  TransactionTypeComparison Data                                     */
/* ------------------------------------------------------------------ */

interface TxType {
  name: string;
  era: string;
  bip: string;
  scriptPubKey: string;
  unlock: string;
  addressPrefix: string;
  advantages: string;
  color: string;
  generation: 'legacy' | 'segwit' | 'taproot';
  tooltipRu: string;
}

const TX_TYPES: TxType[] = [
  {
    name: 'P2PKH',
    era: '2009+',
    bip: 'Original',
    scriptPubKey: 'OP_DUP OP_HASH160\n<hash> OP_EQUALVERIFY\nOP_CHECKSIG',
    unlock: 'scriptSig:\n<sig> <pubKey>',
    addressPrefix: '1... (Base58)',
    advantages: 'Простой,\nпонятный',
    color: colors.textMuted,
    generation: 'legacy',
    tooltipRu: 'Pay-to-Public-Key-Hash -- самый старый формат транзакций Bitcoin. Получатель указывается хешем публичного ключа (HASH160). Простой и понятный, но не поддерживает сложные скрипты и занимает больше места в блоке.',
  },
  {
    name: 'P2SH',
    era: '2012+ (BIP 16)',
    bip: 'BIP 16',
    scriptPubKey: 'OP_HASH160\n<scriptHash>\nOP_EQUAL',
    unlock: 'scriptSig:\n<data> <redeemScript>',
    addressPrefix: '3... (Base58)',
    advantages: 'Сложные скрипты,\nмультиподпись',
    color: colors.primary,
    generation: 'legacy',
    tooltipRu: 'Pay-to-Script-Hash -- позволяет отправлять на произвольный скрипт (мультиподпись, таймлоки). Отправитель видит только хеш скрипта, а сложность раскрывается при трате. Включил мультиподпись без обновления протокола.',
  },
  {
    name: 'P2WPKH',
    era: '2017+ (BIP 141)',
    bip: 'BIP 141',
    scriptPubKey: 'OP_0\n<20-byte hash>',
    unlock: 'witness:\n<sig> <pubKey>',
    addressPrefix: 'bc1q... (bech32)',
    advantages: 'Экономия ~37%,\nfix malleability',
    color: colors.accent,
    generation: 'segwit',
    tooltipRu: 'Pay-to-Witness-Public-Key-Hash -- SegWit-версия P2PKH. Подпись и публичный ключ вынесены в witness-поле, что экономит ~37% места. Решает проблему transaction malleability и использует bech32-адреса.',
  },
  {
    name: 'P2WSH',
    era: '2017+ (BIP 141)',
    bip: 'BIP 141',
    scriptPubKey: 'OP_0\n<32-byte hash>',
    unlock: 'witness:\n<data> <witnessScript>',
    addressPrefix: 'bc1q... (bech32)',
    advantages: 'Сложные скрипты\n+ экономия',
    color: colors.info,
    generation: 'segwit',
    tooltipRu: 'Pay-to-Witness-Script-Hash -- SegWit-версия P2SH. Поддерживает сложные скрипты (мультиподпись, HTLC для Lightning) с экономией на комиссиях. Witness-данные считаются с дисконтом по весу.',
  },
  {
    name: 'P2TR',
    era: '2021+ (BIP 341)',
    bip: 'BIP 341/342',
    scriptPubKey: 'OP_1\n<32-byte tweaked\npubKey>',
    unlock: 'Key path: <schnorr sig>\nScript path: <script>\n<control block>',
    addressPrefix: 'bc1p... (bech32m)',
    advantages: 'Приватность,\nгибкость, Schnorr',
    color: colors.success,
    generation: 'taproot',
    tooltipRu: 'Pay-to-Taproot -- новейший формат, использующий Schnorr-подписи и MAST. Key path выглядит одинаково для всех транзакций (приватность). Script path позволяет сложную логику без раскрытия неиспользованных веток.',
  },
];

const GENERATION_LABELS: Record<string, string> = {
  legacy: 'Legacy',
  segwit: 'SegWit v0',
  taproot: 'Taproot (v1)',
};

const GENERATION_COLORS: Record<string, string> = {
  legacy: colors.textMuted,
  segwit: colors.accent,
  taproot: colors.success,
};

const GENERATION_TOOLTIPS: Record<string, string> = {
  legacy: 'Legacy-форматы (P2PKH, P2SH) -- оригинальные типы транзакций Bitcoin. Подпись хранится в scriptSig, что влияет на txid и создает проблему malleability.',
  segwit: 'SegWit v0 (P2WPKH, P2WSH) -- вынос подписей в отдельное witness-поле. Экономия ~37% на комиссиях, решение malleability, foundation для Lightning Network.',
  taproot: 'Taproot v1 (P2TR) -- Schnorr-подписи, MAST, key/script path. Все транзакции выглядят одинаково снаружи: максимальная приватность и гибкость.',
};

/* ------------------------------------------------------------------ */
/*  TransactionTypeComparison                                          */
/* ------------------------------------------------------------------ */

/**
 * TransactionTypeComparison - Side-by-side comparison of 5 Bitcoin tx types.
 * Rows: Era, ScriptPubKey pattern, Unlock mechanism, Address prefix, Advantages.
 * Color-coded by generation.
 */
export function TransactionTypeComparison() {
  return (
    <DiagramContainer title="Эволюция типов транзакций Bitcoin" color="blue">
      {/* Generation legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {Object.entries(GENERATION_LABELS).map(([key, label]) => (
          <DiagramTooltip key={key} content={GENERATION_TOOLTIPS[key]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: `${GENERATION_COLORS[key]}30`,
                border: `2px solid ${GENERATION_COLORS[key]}`,
              }} />
              <span style={{ fontSize: 12, color: GENERATION_COLORS[key], fontWeight: 600 }}>
                {label}
              </span>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Evolution arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 16,
        padding: '6px 0',
      }}>
        <span style={{ fontSize: 11, color: colors.textMuted }}>2009</span>
        <div style={{
          flex: 1,
          maxWidth: 400,
          height: 2,
          background: `linear-gradient(to right, ${colors.textMuted}, ${colors.accent}, ${colors.success})`,
          borderRadius: 1,
        }} />
        <span style={{ fontSize: 11, color: colors.success }}>2021+</span>
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(5, 1fr)', gap: 4, minWidth: 700 }}>
          {/* Header row */}
          <div style={{ padding: 8 }} />
          {TX_TYPES.map((tx) => (
            <DiagramTooltip key={tx.name} content={tx.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '10px 8px',
                  textAlign: 'center',
                  borderColor: `${tx.color}30`,
                  background: `${tx.color}05`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: tx.color }}>{tx.name}</div>
                <div style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: `${GENERATION_COLORS[tx.generation]}15`,
                  color: GENERATION_COLORS[tx.generation],
                  display: 'inline-block',
                  marginTop: 4,
                }}>
                  {GENERATION_LABELS[tx.generation]}
                </div>
              </div>
            </DiagramTooltip>
          ))}

          {/* Era row */}
          <div style={{ padding: 8, fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'flex', alignItems: 'center' }}>
            Эпоха
          </div>
          {TX_TYPES.map((tx) => (
            <div
              key={`era-${tx.name}`}
              style={{
                ...glassStyle,
                padding: 8,
                fontSize: 11,
                color: colors.text,
                textAlign: 'center',
                borderColor: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              {tx.era}
            </div>
          ))}

          {/* ScriptPubKey row */}
          <DiagramTooltip content="scriptPubKey -- условие траты UTXO. Записывается в выход транзакции и определяет, какие данные нужны для разблокировки средств.">
            <div style={{ padding: 8, fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'flex', alignItems: 'center' }}>
              scriptPubKey
            </div>
          </DiagramTooltip>
          {TX_TYPES.map((tx) => (
            <div
              key={`spk-${tx.name}`}
              style={{
                ...glassStyle,
                padding: 8,
                fontSize: 10,
                fontFamily: 'monospace',
                color: colors.text,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                borderColor: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              {tx.scriptPubKey}
            </div>
          ))}

          {/* Unlock row */}
          <DiagramTooltip content="Механизм разблокировки -- данные, которые отправитель предоставляет для выполнения условий scriptPubKey. В Legacy это scriptSig, в SegWit -- witness-поле.">
            <div style={{ padding: 8, fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'flex', alignItems: 'center' }}>
              Разблокировка
            </div>
          </DiagramTooltip>
          {TX_TYPES.map((tx) => (
            <div
              key={`unlock-${tx.name}`}
              style={{
                ...glassStyle,
                padding: 8,
                fontSize: 10,
                fontFamily: 'monospace',
                color: colors.text,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                borderColor: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              {tx.unlock}
            </div>
          ))}

          {/* Address prefix row */}
          <DiagramTooltip content="Префикс адреса -- по первым символам можно определить тип транзакции. Base58 (1.../3...) -- Legacy, bech32 (bc1q...) -- SegWit, bech32m (bc1p...) -- Taproot.">
            <div style={{ padding: 8, fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'flex', alignItems: 'center' }}>
              Адрес
            </div>
          </DiagramTooltip>
          {TX_TYPES.map((tx) => (
            <div
              key={`addr-${tx.name}`}
              style={{
                ...glassStyle,
                padding: 8,
                fontSize: 11,
                fontFamily: 'monospace',
                color: tx.color,
                textAlign: 'center',
                borderColor: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              {tx.addressPrefix}
            </div>
          ))}

          {/* Advantages row */}
          <DiagramTooltip content="Преимущества каждого типа определяют, когда его стоит использовать. Новые форматы сохраняют совместимость со старыми, но предлагают экономию и улучшенную приватность.">
            <div style={{ padding: 8, fontSize: 11, fontWeight: 600, color: colors.textMuted, display: 'flex', alignItems: 'center' }}>
              Плюсы
            </div>
          </DiagramTooltip>
          {TX_TYPES.map((tx) => (
            <div
              key={`adv-${tx.name}`}
              style={{
                ...glassStyle,
                padding: 8,
                fontSize: 11,
                color: colors.text,
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                borderColor: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s',
              }}
            >
              {tx.advantages}
            </div>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  SegWitFormatDiagram Data                                           */
/* ------------------------------------------------------------------ */

interface TxField {
  name: string;
  bytes: string;
  color: string;
  description: string;
  isWitness?: boolean;
  isNew?: boolean;
}

const LEGACY_FIELDS: TxField[] = [
  { name: 'Version', bytes: '4', color: colors.primary, description: 'Версия транзакции (обычно 1 или 2)' },
  { name: 'Input Count', bytes: 'varint', color: colors.accent, description: 'Количество входов (compact size)' },
  { name: 'Inputs', bytes: '~148', color: colors.accent, description: 'Входы: txid (32) + vout (4) + scriptSig + sequence (4)' },
  { name: 'Output Count', bytes: 'varint', color: colors.warning, description: 'Количество выходов' },
  { name: 'Outputs', bytes: '~68', color: colors.warning, description: 'Выходы: amount (8) + scriptPubKey' },
  { name: 'Locktime', bytes: '4', color: colors.textMuted, description: 'Время блокировки транзакции' },
];

const SEGWIT_FIELDS: TxField[] = [
  { name: 'Version', bytes: '4', color: colors.primary, description: 'Версия транзакции' },
  { name: 'Marker', bytes: '1', color: colors.success, description: 'Маркер 0x00 -- индикатор SegWit формата', isNew: true },
  { name: 'Flag', bytes: '1', color: colors.success, description: 'Флаг 0x01 -- подтверждает наличие witness данных', isNew: true },
  { name: 'Input Count', bytes: 'varint', color: colors.accent, description: 'Количество входов' },
  { name: 'Inputs', bytes: '~41', color: colors.accent, description: 'Входы: txid + vout + пустой scriptSig + sequence' },
  { name: 'Output Count', bytes: 'varint', color: colors.warning, description: 'Количество выходов' },
  { name: 'Outputs', bytes: '~63', color: colors.warning, description: 'Выходы: amount + scriptPubKey (witness program)' },
  { name: 'Witness', bytes: '~107', color: colors.secondary, description: 'Witness данные: подпись + публичный ключ (НЕ входят в txid)', isWitness: true, isNew: true },
  { name: 'Locktime', bytes: '4', color: colors.textMuted, description: 'Время блокировки транзакции' },
];

/* ------------------------------------------------------------------ */
/*  SegWitFormatDiagram                                                */
/* ------------------------------------------------------------------ */

/**
 * SegWitFormatDiagram - Legacy vs SegWit transaction format.
 * Click fields to see description and byte sizes.
 */
export function SegWitFormatDiagram() {
  const [selectedField, setSelectedField] = useState<{ format: string; index: number } | null>(null);

  const renderField = (field: TxField, format: string, index: number) => {
    const isSelected = selectedField?.format === format && selectedField?.index === index;
    return (
      <DiagramTooltip key={`${format}-${index}`} content={field.description}>
        <div
          onClick={() => setSelectedField(isSelected ? null : { format, index })}
          style={{
            ...glassStyle,
            padding: '8px 10px',
            cursor: 'pointer',
            borderColor: isSelected ? `${field.color}80` : `${field.color}25`,
            background: isSelected ? `${field.color}15` : field.isNew ? `${field.color}08` : 'transparent',
            transition: 'all 0.2s',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {field.isNew && (
            <div style={{
              position: 'absolute',
              top: -4,
              right: -4,
              fontSize: 8,
              padding: '1px 5px',
              borderRadius: 4,
              background: colors.success,
              color: '#000',
              fontWeight: 700,
            }}>
              NEW
            </div>
          )}
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: field.color,
            marginBottom: 2,
          }}>
            {field.name}
          </div>
          <div style={{
            fontSize: 10,
            color: colors.textMuted,
            fontFamily: 'monospace',
          }}>
            {field.bytes} B
          </div>
        </div>
      </DiagramTooltip>
    );
  };

  const getSelectedInfo = () => {
    if (!selectedField) return null;
    const fields = selectedField.format === 'legacy' ? LEGACY_FIELDS : SEGWIT_FIELDS;
    return fields[selectedField.index];
  };

  const selected = getSelectedInfo();

  return (
    <DiagramContainer title="Формат транзакции SegWit" color="green">
      <Grid columns={2} gap={16}>
        {/* Legacy format */}
        <div>
          <DiagramTooltip content="Legacy-формат транзакции: все данные (включая подписи) находятся в одном блоке и полностью входят в вычисление txid. Это создает проблему transaction malleability.">
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.textMuted,
              marginBottom: 10,
              textAlign: 'center',
            }}>
              Legacy формат
            </div>
          </DiagramTooltip>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LEGACY_FIELDS.map((f, i) => renderField(f, 'legacy', i))}
          </div>
          <div style={{
            marginTop: 8,
            fontSize: 11,
            color: colors.textMuted,
            textAlign: 'center',
            fontFamily: 'monospace',
          }}>
            ~226 bytes (P2PKH)
          </div>
        </div>

        {/* SegWit format */}
        <div>
          <DiagramTooltip content="SegWit-формат: подписи вынесены в отдельное witness-поле и НЕ входят в txid. Marker (0x00) и Flag (0x01) сигнализируют о наличии witness данных.">
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: colors.success,
              marginBottom: 10,
              textAlign: 'center',
            }}>
              SegWit формат
            </div>
          </DiagramTooltip>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SEGWIT_FIELDS.map((f, i) => renderField(f, 'segwit', i))}
          </div>
          <div style={{
            marginTop: 8,
            fontSize: 11,
            color: colors.success,
            textAlign: 'center',
            fontFamily: 'monospace',
          }}>
            ~141 bytes (P2WPKH), 574 WU
          </div>
        </div>
      </Grid>

      {/* Selected field details */}
      {selected && (
        <div style={{
          marginTop: 16,
          ...glassStyle,
          padding: 14,
          borderColor: `${selected.color}40`,
          background: `${selected.color}08`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: selected.color }}>
              {selected.name}
            </span>
            <span style={{
              fontSize: 10,
              fontFamily: 'monospace',
              padding: '2px 6px',
              borderRadius: 4,
              background: `${selected.color}20`,
              color: selected.color,
            }}>
              {selected.bytes} bytes
            </span>
            {selected.isWitness && (
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: `${colors.secondary}20`,
                color: colors.secondary,
              }}>
                witness (1x WU)
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
            {selected.description}
          </div>
        </div>
      )}

      {/* Key difference note */}
      <DiagramTooltip content="Transaction malleability -- возможность третьей стороны изменить txid, не инвалидируя транзакцию. SegWit решил это, вынеся подписи из данных, участвующих в вычислении txid.">
        <div style={{
          marginTop: 16,
          ...glassStyle,
          padding: 10,
          borderColor: `${colors.info}20`,
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.6,
        }}>
          <strong style={{ color: colors.info }}>Ключевое отличие:</strong>{' '}
          В SegWit подпись и публичный ключ перенесены из scriptSig в отдельное поле witness.
          Witness данные НЕ входят в вычисление txid, что решает проблему transaction malleability.
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  WeightCalculationDiagram Data                                      */
/* ------------------------------------------------------------------ */

interface WeightStep {
  title: string;
  description: string;
  visual: { label: string; value: string; color: string; tooltipRu: string }[];
  formula?: string;
}

const WEIGHT_STEPS: WeightStep[] = [
  {
    title: 'Шаг 0: Разделяем байты транзакции',
    description: 'SegWit-транзакция (1 вход P2WPKH, 2 выхода) разделяется на non-witness и witness части. Non-witness: version, inputs, outputs, locktime. Witness: подпись + публичный ключ.',
    visual: [
      { label: 'Non-witness', value: '100 bytes', color: colors.primary, tooltipRu: 'Non-witness данные: version (4B), marker+flag (2B), input count, inputs (txid+vout+scriptSig+seq), output count, outputs, locktime. Эти байты считаются с множителем x4.' },
      { label: 'Witness', value: '107 bytes', color: colors.secondary, tooltipRu: 'Witness данные: подпись (~72B) + публичный ключ (33B) + длины элементов. Считаются с множителем x1 -- это и есть "скидка" SegWit.' },
      { label: 'Всего', value: '207 bytes', color: colors.text, tooltipRu: 'Общий размер SegWit-транзакции в байтах. Но комиссия рассчитывается не по сырому размеру, а по весу (Weight Units).' },
    ],
  },
  {
    title: 'Шаг 1: Non-witness * 4',
    description: 'Non-witness данные "стоят" 4 весовых единицы за каждый байт. Это сохраняет обратную совместимость: для старых нод legacy-транзакция весит столько же.',
    visual: [
      { label: 'Non-witness', value: '100 bytes', color: colors.primary, tooltipRu: '100 байт non-witness данных: это все поля транзакции кроме witness (version, inputs без scriptSig, outputs, locktime).' },
      { label: 'x 4 =', value: '400 WU', color: colors.primary, tooltipRu: 'Множитель x4 для non-witness данных. Это обеспечивает обратную совместимость: legacy-транзакция из 226 байт = 904 WU = 226 vB, как и раньше.' },
    ],
    formula: 'non_witness_weight = 100 * 4 = 400 WU',
  },
  {
    title: 'Шаг 2: Witness * 1',
    description: 'Witness данные "стоят" только 1 весовую единицу за байт. Это дает SegWit-транзакциям скидку на комиссию: подписи и публичные ключи занимают много места, но стоят меньше.',
    visual: [
      { label: 'Witness', value: '107 bytes', color: colors.secondary, tooltipRu: '107 байт witness данных: ECDSA-подпись (~72B), сжатый публичный ключ (33B) и служебные байты длин элементов.' },
      { label: 'x 1 =', value: '107 WU', color: colors.secondary, tooltipRu: 'Множитель x1 для witness данных -- это "скидка" SegWit. Подписи занимают ~50% транзакции, но оплачиваются по сниженной ставке.' },
    ],
    formula: 'witness_weight = 107 * 1 = 107 WU',
  },
  {
    title: 'Шаг 3: Total weight и Virtual bytes',
    description: 'Суммарный вес транзакции = 507 WU. Виртуальные байты (vB) = weight / 4. Комиссия рассчитывается в sat/vB, поэтому SegWit экономит ~37% по сравнению с P2PKH.',
    visual: [
      { label: 'Weight', value: '400 + 107 = 507 WU', color: colors.accent, tooltipRu: 'Суммарный вес: non-witness (400 WU) + witness (107 WU) = 507 WU. Лимит блока: 4,000,000 WU (вместо старого лимита 1 MB).' },
      { label: 'Virtual bytes', value: '507 / 4 = 126.75 vB', color: colors.success, tooltipRu: 'Virtual bytes = weight / 4. Комиссия: vB * fee_rate (sat/vB). P2PKH: 226 vB, P2WPKH: 126.75 vB -- экономия ~37% на комиссиях!' },
    ],
    formula: 'weight = 400 + 107 = 507 WU\nvB = 507 / 4 = 126.75',
  },
];

const SIZE_COMPARISON = [
  { type: 'P2PKH', vb: '~226', wu: '~904', savings: '0%', color: colors.textMuted, tooltipRu: 'P2PKH -- базовый Legacy-формат. Все 226 байт считаются с множителем x4 = 904 WU = 226 vB. Никакой скидки.' },
  { type: 'P2WPKH', vb: '~143.5', wu: '~574', savings: '~37%', color: colors.accent, tooltipRu: 'P2WPKH -- SegWit. Witness данные с множителем x1 дают итого ~574 WU = ~143.5 vB. Экономия ~37% на комиссиях.' },
  { type: 'P2TR', vb: '~154', wu: '~616', savings: '~32%', color: colors.success, tooltipRu: 'P2TR -- Taproot. Schnorr-подпись (64B вместо ~72B DER), но tweaked pubkey (32B). Экономия ~32% по сравнению с P2PKH.' },
];

/* ------------------------------------------------------------------ */
/*  WeightCalculationDiagram                                           */
/* ------------------------------------------------------------------ */

/**
 * WeightCalculationDiagram - Weight/vbytes step-through.
 * Uses history array pattern for forward/backward navigation.
 * Shows weight formula: weight = non_witness * 4 + witness * 1.
 */
export function WeightCalculationDiagram() {
  const [step, setStep] = useState(0);

  const current = WEIGHT_STEPS[step];
  const maxStep = WEIGHT_STEPS.length - 1;

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, maxStep));
  }, [maxStep]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
  }, []);

  return (
    <DiagramContainer title="Расчет веса транзакции (Weight Units)" color="purple">
      {/* Formula banner */}
      <DiagramTooltip content="Формула веса SegWit: non-witness байты умножаются на 4, witness байты -- на 1. Это создает экономический стимул использовать SegWit и позволяет вместить больше транзакций в блок.">
        <div style={{
          ...glassStyle,
          padding: '10px 16px',
          marginBottom: 16,
          textAlign: 'center',
          borderColor: `${colors.secondary}30`,
          background: `${colors.secondary}08`,
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: colors.secondary,
          }}>
            weight = non_witness * 4 + witness * 1
          </div>
          <div style={{
            fontSize: 11,
            color: colors.textMuted,
            marginTop: 4,
          }}>
            vB = weight / 4
          </div>
        </div>
      </DiagramTooltip>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {WEIGHT_STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              background: i <= step ? `${colors.secondary}30` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${i === step ? colors.secondary : i < step ? `${colors.secondary}60` : 'rgba(255,255,255,0.1)'}`,
              color: i <= step ? colors.secondary : colors.textMuted,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => setStep(i)}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Current step content */}
      <div style={{
        ...glassStyle,
        padding: 16,
        marginBottom: 16,
        borderColor: `${colors.secondary}30`,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: colors.secondary,
          marginBottom: 8,
        }}>
          {current.title}
        </div>
        <div style={{
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.7,
          marginBottom: 12,
        }}>
          {current.description}
        </div>

        {/* Visual boxes */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: current.formula ? 12 : 0 }}>
          {current.visual.map((v, i) => (
            <DiagramTooltip key={i} content={v.tooltipRu}>
              <div
                style={{
                  ...glassStyle,
                  padding: '8px 14px',
                  borderColor: `${v.color}30`,
                  flex: 1,
                  minWidth: 100,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>{v.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: v.color }}>
                  {v.value}
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {/* Formula */}
        {current.formula && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 13,
            color: colors.text,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
          }}>
            {current.formula}
          </div>
        )}
      </div>

      {/* Size comparison table (shown on last step) */}
      {step === maxStep && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            Сравнение типов (1 вход, 2 выхода)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {/* Header */}
            <div style={{ padding: 6, fontSize: 11, fontWeight: 600, color: colors.textMuted }}>Тип</div>
            <div style={{ padding: 6, fontSize: 11, fontWeight: 600, color: colors.textMuted, textAlign: 'center' }}>vB</div>
            <div style={{ padding: 6, fontSize: 11, fontWeight: 600, color: colors.textMuted, textAlign: 'center' }}>WU</div>
            <div style={{ padding: 6, fontSize: 11, fontWeight: 600, color: colors.textMuted, textAlign: 'center' }}>Экономия</div>
            {/* Rows */}
            {SIZE_COMPARISON.map((row) => (
              <React.Fragment key={row.type}>
                <DiagramTooltip content={row.tooltipRu}>
                  <div style={{
                    padding: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: row.color,
                    fontFamily: 'monospace',
                  }}>
                    {row.type}
                  </div>
                </DiagramTooltip>
                <div style={{
                  padding: 6,
                  fontSize: 12,
                  color: colors.text,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}>
                  {row.vb}
                </div>
                <div style={{
                  padding: 6,
                  fontSize: 12,
                  color: colors.text,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                }}>
                  {row.wu}
                </div>
                <div style={{
                  padding: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: row.savings === '0%' ? colors.textMuted : colors.success,
                  textAlign: 'center',
                }}>
                  {row.savings}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <div>
          <button
            onClick={handleReset}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 12,
              color: colors.textMuted,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            Сброс
          </button>
        </div>
        <div>
          <button
            onClick={handlePrev}
            disabled={step <= 0}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: step <= 0 ? 'default' : 'pointer',
              fontSize: 12,
              color: step <= 0 ? colors.textMuted : colors.accent,
              border: `1px solid ${step <= 0 ? 'rgba(255,255,255,0.1)' : colors.accent}`,
              background: step <= 0 ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
              opacity: step <= 0 ? 0.5 : 1,
            }}
          >
            Назад
          </button>
        </div>
        <div>
          <button
            onClick={handleNext}
            disabled={step >= maxStep}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: step >= maxStep ? 'default' : 'pointer',
              fontSize: 12,
              color: step >= maxStep ? colors.textMuted : colors.secondary,
              border: `1px solid ${step >= maxStep ? 'rgba(255,255,255,0.1)' : colors.secondary}`,
              background: step >= maxStep ? 'rgba(255,255,255,0.03)' : `${colors.secondary}15`,
              opacity: step >= maxStep ? 0.5 : 1,
            }}
          >
            Далее
          </button>
        </div>
      </div>
    </DiagramContainer>
  );
}
