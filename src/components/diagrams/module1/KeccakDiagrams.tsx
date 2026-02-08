/**
 * Keccak / SHA-3 Diagrams
 *
 * Exports:
 * - SpongeConstructionDiagram: Absorb/squeeze phases visual
 * - MerkleDamgardVsSponge: Side-by-side comparison of SHA-256 and SHA-3 construction
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  SpongeConstructionDiagram                                           */
/* ================================================================== */

/**
 * SpongeConstructionDiagram - Absorb/squeeze phases visual.
 * Shows state divided into rate (r) and capacity (c) portions.
 */
export function SpongeConstructionDiagram() {
  return (
    <DiagramContainer title='Конструкция губки (Sponge)' color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* State explanation */}
        <DataBox
          label="Состояние Keccak"
          value="1600 бит = rate (r) + capacity (c). Для Keccak-256: r=1088, c=512. Для SHA-3-256: r=1088, c=512, но другой padding."
          variant="default"
        />

        {/* State bar visualization */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: 50, borderRadius: 8, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
          <div style={{
            flex: 1088,
            background: `${colors.primary}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: colors.primary,
            fontFamily: 'monospace',
            fontWeight: 600,
          }}>
            rate (r) = 1088 бит
          </div>
          <div style={{
            flex: 512,
            background: `${colors.danger}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: colors.danger,
            fontFamily: 'monospace',
            fontWeight: 600,
            borderLeft: `1px solid ${colors.border}`,
          }}>
            capacity (c) = 512 бит
          </div>
        </div>

        {/* Absorb Phase */}
        <div style={{ ...glassStyle, padding: 16 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.primary,
            marginBottom: 12,
          }}>
            Фаза впитывания (Absorb)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <FlowNode variant="primary" size="sm">
                Блок M1
              </FlowNode>
              <span style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: 16 }}>XOR</span>
              <div style={{
                display: 'flex',
                height: 32,
                borderRadius: 6,
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ width: 80, background: `${colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: colors.primary }}>
                  r
                </div>
                <div style={{ width: 40, background: `${colors.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: colors.danger }}>
                  c
                </div>
              </div>
            </div>

            <Arrow direction="down" label="f-перестановка (Keccak-f)" />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <FlowNode variant="primary" size="sm">
                Блок M2
              </FlowNode>
              <span style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: 16 }}>XOR</span>
              <div style={{
                display: 'flex',
                height: 32,
                borderRadius: 6,
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ width: 80, background: `${colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: colors.primary }}>
                  r
                </div>
                <div style={{ width: 40, background: `${colors.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: colors.danger }}>
                  c
                </div>
              </div>
            </div>

            <Arrow direction="down" label="f-перестановка (Keccak-f)" />

            <div style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>
              ... повторяется для каждого блока входных данных ...
            </div>
          </div>
        </div>

        {/* Squeeze Phase */}
        <div style={{ ...glassStyle, padding: 16 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.success,
            marginBottom: 12,
          }}>
            Фаза выжимания (Squeeze)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{
                display: 'flex',
                height: 32,
                borderRadius: 6,
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ width: 80, background: `${colors.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: colors.success }}>
                  r
                </div>
                <div style={{ width: 40, background: `${colors.danger}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: colors.danger }}>
                  c
                </div>
              </div>
              <Arrow direction="right" label="Читаем r" />
              <FlowNode variant="success" size="sm">
                Выход Z1
              </FlowNode>
            </div>

            <div style={{ fontSize: 12, color: colors.textMuted }}>
              Для Keccak-256: нужно 256 бит, r=1088 бит -- хватает одного выжимания
            </div>
          </div>
        </div>

        <DataBox
          label="Ключевое отличие от Merkle-Damgard"
          value="В конструкции губки capacity (c) никогда не XOR-ится с входом и не читается напрямую. Это обеспечивает безопасность: атакующий не имеет доступа к полному состоянию."
          variant="highlight"
        />
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  MerkleDamgardVsSponge                                               */
/* ================================================================== */

/**
 * MerkleDamgardVsSponge - Side-by-side comparison of SHA-256 (Merkle-Damgard)
 * and SHA-3/Keccak (Sponge construction).
 */
export function MerkleDamgardVsSponge() {
  return (
    <DiagramContainer title="Merkle-Damgard vs Конструкция губки" color="purple">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Merkle-Damgard (SHA-256) */}
        <div style={{ ...glassStyle, padding: 16, flex: 1, minWidth: 280 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.primary,
            marginBottom: 12,
            textAlign: 'center',
          }}>
            Merkle-Damgard (SHA-256)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <FlowNode variant="primary" size="sm">
              IV (256 бит)
            </FlowNode>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Arrow direction="down" />
              <FlowNode variant="default" size="sm">M1</FlowNode>
            </div>

            <FlowNode variant="secondary" size="sm">
              Функция сжатия f
            </FlowNode>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Arrow direction="down" />
              <FlowNode variant="default" size="sm">M2</FlowNode>
            </div>

            <FlowNode variant="secondary" size="sm">
              Функция сжатия f
            </FlowNode>

            <Arrow direction="down" />

            <FlowNode variant="success" size="sm">
              Хеш (256 бит)
            </FlowNode>
          </div>

          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 12, lineHeight: 1.5 }}>
            Фиксированный размер состояния = размер выхода.
            Последовательная обработка блоков. Уязвима к length extension attack.
          </div>
        </div>

        {/* Sponge (Keccak/SHA-3) */}
        <div style={{ ...glassStyle, padding: 16, flex: 1, minWidth: 280 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.accent,
            marginBottom: 12,
            textAlign: 'center',
          }}>
            Конструкция губки (Keccak/SHA-3)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <FlowNode variant="accent" size="sm">
              Нулевое состояние (1600 бит)
            </FlowNode>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Arrow direction="down" label="XOR rate" />
              <FlowNode variant="default" size="sm">M1</FlowNode>
            </div>

            <FlowNode variant="secondary" size="sm">
              Перестановка Keccak-f
            </FlowNode>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Arrow direction="down" label="XOR rate" />
              <FlowNode variant="default" size="sm">M2</FlowNode>
            </div>

            <FlowNode variant="secondary" size="sm">
              Перестановка Keccak-f
            </FlowNode>

            <Arrow direction="down" label="Squeeze" />

            <FlowNode variant="success" size="sm">
              Хеш (256 бит из rate)
            </FlowNode>
          </div>

          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 12, lineHeight: 1.5 }}>
            Большое внутреннее состояние (1600 бит) &gt; размер выхода.
            Capacity защищает от length extension. Нет уязвимости к этой атаке.
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 0,
          fontSize: 12,
          fontFamily: 'monospace',
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          overflow: 'hidden',
        }}>
          {/* Header */}
          {['Свойство', 'SHA-256', 'Keccak-256 / SHA-3'].map((h, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              background: `${colors.primary}15`,
              borderBottom: `1px solid ${colors.border}`,
              color: colors.text,
              fontWeight: 600,
              borderRight: i < 2 ? `1px solid ${colors.border}` : undefined,
            }}>
              {h}
            </div>
          ))}

          {/* Rows */}
          {[
            ['Конструкция', 'Merkle-Damgard', 'Губка (Sponge)'],
            ['Внутреннее состояние', '256 бит', '1600 бит'],
            ['Размер блока', '512 бит', '1088 бит (rate)'],
            ['Раундов', '64', '24 перестановки'],
            ['Length extension', 'Уязвима', 'Защищена'],
            ['Bitcoin', 'SHA-256', '--'],
            ['Ethereum', '--', 'Keccak-256'],
          ].map((row, ri) => (
            row.map((cell, ci) => (
              <div key={`${ri}-${ci}`} style={{
                padding: '6px 12px',
                borderBottom: ri < 6 ? `1px solid ${colors.border}` : undefined,
                borderRight: ci < 2 ? `1px solid ${colors.border}` : undefined,
                color: ci === 0 ? colors.textMuted : colors.text,
                background: 'rgba(255,255,255,0.02)',
              }}>
                {cell}
              </div>
            ))
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}
