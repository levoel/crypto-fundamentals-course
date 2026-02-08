/**
 * AES Diagrams
 *
 * Exports:
 * - AESOverviewDiagram: Block cipher structure overview (128-bit block, N rounds)
 * - AESRoundDiagram: Visual of 4 round operations (SubBytes, ShiftRows, MixColumns, AddRoundKey)
 * - AESKeySizeDiagram: Key size comparison for AES-128, AES-192, AES-256
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  AESOverviewDiagram                                                  */
/* ------------------------------------------------------------------ */

/**
 * AESOverviewDiagram - Block cipher structure overview.
 * Shows: 128-bit plaintext + key -> N rounds -> 128-bit ciphertext.
 * Round count varies by key size (10/12/14 for 128/192/256-bit keys).
 */
export function AESOverviewDiagram() {
  const [keySize, setKeySize] = useState<128 | 192 | 256>(256);
  const rounds = keySize === 128 ? 10 : keySize === 192 ? 12 : 14;

  return (
    <DiagramContainer
      title="AES: структура блочного шифра"
      color="blue"
    >
      {/* Key size selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
        {([128, 192, 256] as const).map((ks) => (
          <button
            key={ks}
            onClick={() => setKeySize(ks)}
            style={{
              ...glassStyle,
              padding: '6px 14px',
              cursor: 'pointer',
              background: keySize === ks ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${keySize === ks ? colors.primary : 'rgba(255,255,255,0.1)'}`,
              color: keySize === ks ? colors.primary : colors.text,
              fontSize: 13,
              fontFamily: 'monospace',
            }}
          >
            AES-{ks}
          </button>
        ))}
      </div>

      {/* Flow diagram */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        <FlowNode variant="primary" size="sm">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Открытый текст</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>128 бит</div>
          </div>
        </FlowNode>
        <Arrow direction="right" />
        <div style={{
          ...glassStyle,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          borderColor: `${colors.accent}40`,
        }}>
          <span style={{ fontSize: 11, color: colors.textMuted }}>+</span>
          <FlowNode variant="accent" size="sm">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Ключ</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{keySize} бит</div>
            </div>
          </FlowNode>
        </div>
        <Arrow direction="right" />
      </div>

      {/* Rounds visualization */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        margin: '16px 0',
        flexWrap: 'wrap',
      }}>
        {Array.from({ length: Math.min(rounds, 5) }, (_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              ...glassStyle,
              padding: '10px 14px',
              borderColor: `${colors.primary}30`,
              textAlign: 'center',
              minWidth: 60,
            }}>
              <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600 }}>
                Раунд {i + 1}
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>
                SubBytes
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>ShiftRows</div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>MixColumns</div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>AddRoundKey</div>
            </div>
            {i < Math.min(rounds, 5) - 1 && (
              <span style={{ color: colors.textMuted, fontSize: 16 }}>...</span>
            )}
          </div>
        ))}
        {rounds > 5 && (
          <>
            <span style={{ color: colors.textMuted, fontSize: 16, padding: '0 4px' }}>...</span>
            <div style={{
              ...glassStyle,
              padding: '10px 14px',
              borderColor: `${colors.primary}30`,
              textAlign: 'center',
              minWidth: 60,
            }}>
              <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600 }}>
                Раунд {rounds}
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>
                SubBytes
              </div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>ShiftRows</div>
              <div style={{ fontSize: 9, color: colors.textMuted, textDecoration: 'line-through' }}>MixColumns</div>
              <div style={{ fontSize: 9, color: colors.textMuted }}>AddRoundKey</div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Arrow direction="right" />
        <FlowNode variant="success" size="sm">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Шифротекст</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>128 бит</div>
          </div>
        </FlowNode>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: colors.textMuted }}>
        AES-{keySize}: ключ {keySize} бит, блок 128 бит, {rounds} раундов.
        {keySize === 256 && ' Рекомендуется для криптографических приложений.'}
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  AESRoundDiagram                                                     */
/* ------------------------------------------------------------------ */

/**
 * Render a 4x4 byte grid (AES state matrix).
 */
function StateGrid({
  values,
  highlight,
  label,
}: {
  values: string[][];
  highlight?: Set<string>;
  label: string;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 2,
        width: 'fit-content',
        margin: '0 auto',
      }}>
        {values.flat().map((val, idx) => {
          const row = Math.floor(idx / 4);
          const col = idx % 4;
          const key = `${row}-${col}`;
          const isHighlighted = highlight?.has(key);
          return (
            <div
              key={idx}
              style={{
                width: 36,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontFamily: 'monospace',
                borderRadius: 4,
                background: isHighlighted ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isHighlighted ? colors.primary + '60' : 'rgba(255,255,255,0.1)'}`,
                color: isHighlighted ? colors.primary : colors.text,
                transition: 'all 0.2s',
              }}
            >
              {val}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Example state values for demonstration
const EXAMPLE_STATE: string[][] = [
  ['63', '53', 'e0', '8c'],
  ['09', '60', 'e1', '04'],
  ['cd', '70', 'b7', '51'],
  ['ba', 'ca', 'd0', 'e7'],
];

const AFTER_SUBBYTES: string[][] = [
  ['fb', 'ed', 'e1', '64'],
  ['01', 'd0', 'f8', 'f2'],
  ['bd', '51', 'a9', 'd1'],
  ['f4', '74', '70', '94'],
];

const AFTER_SHIFTROWS: string[][] = [
  ['fb', 'ed', 'e1', '64'],
  ['d0', 'f8', 'f2', '01'],
  ['a9', 'd1', 'bd', '51'],
  ['94', 'f4', '74', '70'],
];

const AFTER_MIXCOLUMNS: string[][] = [
  ['3e', '1c', '22', '7b'],
  ['08', '96', 'c4', '3c'],
  ['52', '79', '5a', 'b1'],
  ['e5', 'b2', '56', '1a'],
];

/**
 * AESRoundDiagram - Visual of 4 round operations as a static pipeline.
 * Shows 4x4 state going through SubBytes -> ShiftRows -> MixColumns -> AddRoundKey.
 */
export function AESRoundDiagram() {
  const operations = [
    {
      name: 'Исходное состояние',
      state: EXAMPLE_STATE,
      description: '4x4 матрица байтов (128 бит)',
      highlight: new Set<string>(),
      color: colors.textMuted,
    },
    {
      name: '1. SubBytes',
      state: AFTER_SUBBYTES,
      description: 'Каждый байт заменяется через S-box (нелинейная подстановка)',
      highlight: new Set(EXAMPLE_STATE.flatMap((row, r) => row.map((_, c) => `${r}-${c}`))),
      color: colors.primary,
    },
    {
      name: '2. ShiftRows',
      state: AFTER_SHIFTROWS,
      description: 'Строки сдвигаются влево на 0, 1, 2, 3 позиции',
      highlight: new Set(['1-0', '1-1', '1-2', '1-3', '2-0', '2-1', '2-2', '2-3', '3-0', '3-1', '3-2', '3-3']),
      color: colors.accent,
    },
    {
      name: '3. MixColumns',
      state: AFTER_MIXCOLUMNS,
      description: 'Столбцы перемешиваются полиномиальным умножением в GF(2^8)',
      highlight: new Set(EXAMPLE_STATE.flatMap((row, r) => row.map((_, c) => `${r}-${c}`))),
      color: colors.success,
    },
    {
      name: '4. AddRoundKey',
      state: [
        ['a0', '88', '23', '2a'],
        ['fa', '54', 'a3', '6c'],
        ['fe', '2c', '39', '76'],
        ['17', 'b1', '39', '05'],
      ],
      description: 'XOR с раундовым ключом',
      highlight: new Set(EXAMPLE_STATE.flatMap((row, r) => row.map((_, c) => `${r}-${c}`))),
      color: colors.warning,
    },
  ];

  return (
    <DiagramContainer
      title="Раунд AES: четыре операции"
      color="purple"
    >
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 8,
        alignItems: 'flex-start',
      }}>
        {operations.map((op, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              ...glassStyle,
              padding: 12,
              borderColor: `${op.color}30`,
              minWidth: 170,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: op.color,
                marginBottom: 8,
                textAlign: 'center',
              }}>
                {op.name}
              </div>
              <StateGrid
                values={op.state}
                highlight={op.highlight}
                label=""
              />
              <div style={{
                fontSize: 10,
                color: colors.textMuted,
                marginTop: 8,
                textAlign: 'center',
                lineHeight: 1.4,
              }}>
                {op.description}
              </div>
            </div>
            {i < operations.length - 1 && (
              <span style={{ fontSize: 20, color: colors.textMuted, flexShrink: 0 }}>
                {'\u2192'}
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16,
        padding: 12,
        ...glassStyle,
        borderColor: `${colors.primary}20`,
      }}>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          <strong style={{ color: colors.primary }}>SubBytes</strong> {'\u2014'} обеспечивает <em>нелинейность</em> (confusion).{' '}
          <strong style={{ color: colors.accent }}>ShiftRows</strong> + <strong style={{ color: colors.success }}>MixColumns</strong> {'\u2014'} обеспечивают <em>диффузию</em> (diffusion).{' '}
          <strong style={{ color: colors.warning }}>AddRoundKey</strong> {'\u2014'} вносит зависимость от ключа.
          Последний раунд пропускает MixColumns.
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  AESKeySizeDiagram                                                   */
/* ------------------------------------------------------------------ */

interface AESVariant {
  name: string;
  keyBits: number;
  blockBits: number;
  rounds: number;
  security: string;
  recommended: boolean;
  useCase: string;
}

const aesVariants: AESVariant[] = [
  {
    name: 'AES-128',
    keyBits: 128,
    blockBits: 128,
    rounds: 10,
    security: '2^128 операций',
    recommended: false,
    useCase: 'Быстрое шифрование, где скорость критична',
  },
  {
    name: 'AES-192',
    keyBits: 192,
    blockBits: 128,
    rounds: 12,
    security: '2^192 операций',
    recommended: false,
    useCase: 'Редко используется на практике',
  },
  {
    name: 'AES-256',
    keyBits: 256,
    blockBits: 128,
    rounds: 14,
    security: '2^256 операций',
    recommended: true,
    useCase: 'Криптовалютные кошельки, секретные данные',
  },
];

/**
 * AESKeySizeDiagram - Key size comparison for AES-128, AES-192, AES-256.
 * Highlights AES-256 as recommended for cryptographic applications.
 */
export function AESKeySizeDiagram() {
  return (
    <DiagramContainer
      title="Размеры ключей AES"
      color="green"
    >
      <Grid columns={3} gap={12}>
        {aesVariants.map((variant) => (
          <div
            key={variant.name}
            style={{
              ...glassStyle,
              padding: 16,
              borderColor: variant.recommended ? `${colors.success}50` : 'rgba(255,255,255,0.08)',
              background: variant.recommended ? `${colors.success}08` : 'rgba(255,255,255,0.02)',
              position: 'relative',
            }}
          >
            {variant.recommended && (
              <div style={{
                position: 'absolute',
                top: -8,
                right: 12,
                background: colors.success,
                color: '#000',
                fontSize: 9,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                Рекомендуется
              </div>
            )}

            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: variant.recommended ? colors.success : colors.text,
              marginBottom: 12,
              fontFamily: 'monospace',
            }}>
              {variant.name}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <DataBox label="Размер ключа" value={`${variant.keyBits} бит`} variant="default" />
              <DataBox label="Размер блока" value={`${variant.blockBits} бит`} variant="default" />
              <DataBox label="Раундов" value={`${variant.rounds}`} variant="default" />
              <DataBox
                label="Стойкость"
                value={variant.security}
                variant={variant.recommended ? 'highlight' : 'default'}
              />
            </div>

            <div style={{
              marginTop: 10,
              fontSize: 11,
              color: colors.textMuted,
              lineHeight: 1.4,
            }}>
              {variant.useCase}
            </div>
          </div>
        ))}
      </Grid>

      <div style={{
        marginTop: 12,
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
      }}>
        Ethereum keystore файлы используют AES-128-CTR. Bitcoin wallet.dat использует AES-256-CBC.
      </div>
    </DiagramContainer>
  );
}
