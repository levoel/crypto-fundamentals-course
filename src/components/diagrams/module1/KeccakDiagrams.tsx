/** @jsxImportSource solid-js */
/**
 * Keccak / SHA-3 Diagrams
 *
 * Exports:
 * - SpongeConstructionDiagram: Absorb/squeeze phases visual
 * - MerkleDamgardVsSponge: Side-by-side comparison of SHA-256 and SHA-3 construction
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
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
      <div style={{ 'display': 'flex', 'flex-direction': 'column', 'gap': '16px' }}>
        {/* State explanation */}
        <DiagramTooltip content="Состояние Keccak: 1600 бит организованы в матрицу 5x5 из 64-битных слов. Размер state фиксирован и не зависит от длины входа или выхода.">
        <DataBox
          label="Состояние Keccak"
          value="1600 бит = rate (r) + capacity (c). Для Keccak-256: r=1088, c=512. Для SHA-3-256: r=1088, c=512, но другой padding."
          variant="default"
        />
        </DiagramTooltip>

        {/* State bar visualization */}
        <DiagramTooltip content="Rate (r): часть state, взаимодействующая с входом/выходом. Больше rate = быстрее, но менее безопасно. Capacity (c): скрытая часть, определяющая security level. Для SHA3-256: c = 512 бит (256-bit security).">
        <div style={{ 'display': 'flex', 'align-items': 'stretch', 'height': '50px', 'border-radius': '8px', 'overflow': 'hidden', 'border': `1px solid ${colors.border}` }}>
          <div style={{
            'flex': '1088',
            'background': `${colors.primary}25`,
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-size': '13px',
            'color': colors.primary,
            'font-family': 'monospace',
            'font-weight': '600',
          }}>
            rate (r) = 1088 бит
          </div>
          <div style={{
            'flex': '512',
            'background': `${colors.danger}20`,
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-size': '13px',
            'color': colors.danger,
            'font-family': 'monospace',
            'font-weight': '600',
            'border-left': `1px solid ${colors.border}`,
          }}>
            capacity (c) = 512 бит
          </div>
        </div>
        </DiagramTooltip>

        {/* Absorb Phase */}
        <DiagramTooltip content="Фаза абсорбции: входные данные XOR-ятся с частью state (rate portion) и пропускаются через permutation f. Повторяется для каждого блока входа. Capacity не затрагивается.">
        <div style={{ ...glassStyle, 'padding': '16px' }}>
          <div style={{
            'font-size': '13px',
            'font-weight': '600',
            'color': colors.primary,
            'margin-bottom': '12px',
          }}>
            Фаза впитывания (Absorb)
          </div>
          <div style={{ 'display': 'flex', 'flex-direction': 'column', 'align-items': 'center', 'gap': '8px' }}>
            <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
              <FlowNode variant="primary" size="sm">
                Блок M1
              </FlowNode>
              <span style={{ 'color': colors.textMuted, 'font-family': 'monospace', 'font-size': '16px' }}>XOR</span>
              <div style={{
                'display': 'flex',
                'height': '32px',
                'border-radius': '6px',
                'overflow': 'hidden',
                'border': `1px solid ${colors.border}`,
              }}>
                <div style={{ 'width': '80px', 'background': `${colors.primary}20`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'font-size': '10px', 'color': colors.primary }}>
                  r
                </div>
                <div style={{ 'width': '40px', 'background': `${colors.danger}15`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'font-size': '10px', 'color': colors.danger }}>
                  c
                </div>
              </div>
            </div>

            <Arrow direction="down" label="f-перестановка (Keccak-f)" />

            <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
              <FlowNode variant="primary" size="sm">
                Блок M2
              </FlowNode>
              <span style={{ 'color': colors.textMuted, 'font-family': 'monospace', 'font-size': '16px' }}>XOR</span>
              <div style={{
                'display': 'flex',
                'height': '32px',
                'border-radius': '6px',
                'overflow': 'hidden',
                'border': `1px solid ${colors.border}`,
              }}>
                <div style={{ 'width': '80px', 'background': `${colors.primary}20`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'font-size': '10px', 'color': colors.primary }}>
                  r
                </div>
                <div style={{ 'width': '40px', 'background': `${colors.danger}15`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'font-size': '10px', 'color': colors.danger }}>
                  c
                </div>
              </div>
            </div>

            <Arrow direction="down" label="f-перестановка (Keccak-f)" />

            <div style={{ 'font-size': '12px', 'color': colors.textMuted, 'font-style': 'italic' }}>
              ... повторяется для каждого блока входных данных ...
            </div>
          </div>
        </div>
        </DiagramTooltip>

        {/* Squeeze Phase */}
        <DiagramTooltip content="Фаза выжимания: выходные биты извлекаются из rate portion state. Если нужно больше выхода, применяется ещё одна permutation f. Для SHA3-256 хватает одного выжимания (256 < 1088).">
        <div style={{ ...glassStyle, 'padding': '16px' }}>
          <div style={{
            'font-size': '13px',
            'font-weight': '600',
            'color': colors.success,
            'margin-bottom': '12px',
          }}>
            Фаза выжимания (Squeeze)
          </div>
          <div style={{ 'display': 'flex', 'flex-direction': 'column', 'align-items': 'center', 'gap': '8px' }}>
            <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center', 'flex-wrap': 'wrap', 'justify-content': 'center' }}>
              <div style={{
                'display': 'flex',
                'height': '32px',
                'border-radius': '6px',
                'overflow': 'hidden',
                'border': `1px solid ${colors.border}`,
              }}>
                <div style={{ 'width': '80px', 'background': `${colors.success}20`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'font-size': '10px', 'color': colors.success }}>
                  r
                </div>
                <div style={{ 'width': '40px', 'background': `${colors.danger}15`, 'display': 'flex', 'align-items': 'center', 'justify-content': 'center', 'font-size': '10px', 'color': colors.danger }}>
                  c
                </div>
              </div>
              <Arrow direction="right" label="Читаем r" />
              <FlowNode variant="success" size="sm">
                Выход Z1
              </FlowNode>
            </div>

            <div style={{ 'font-size': '12px', 'color': colors.textMuted }}>
              Для Keccak-256: нужно 256 бит, r=1088 бит -- хватает одного выжимания
            </div>
          </div>
        </div>
        </DiagramTooltip>

        <DiagramTooltip content="Permutation f (Keccak-f[1600]): 24 раунда из 5 операций (theta, rho, pi, chi, iota). Обрабатывает весь state (1600 бит). Capacity никогда не выдаётся наружу -- атакующий не имеет доступа к полному состоянию.">
        <DataBox
          label="Ключевое отличие от Merkle-Damgard"
          value="В конструкции губки capacity (c) никогда не XOR-ится с входом и не читается напрямую. Это обеспечивает безопасность: атакующий не имеет доступа к полному состоянию."
          variant="highlight"
        />
        </DiagramTooltip>
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
      <div style={{ 'display': 'flex', 'gap': '16px', 'flex-wrap': 'wrap' }}>
        {/* Merkle-Damgard (SHA-256) */}
        <DiagramTooltip content="Merkle-Damgard: последовательная обработка блоков через compression function. Используется в SHA-1, SHA-256, MD5. Уязвим к length extension attack.">
        <div style={{ ...glassStyle, 'padding': '16px', 'flex': '1', 'min-width': '280px' }}>
          <div style={{
            'font-size': '14px',
            'font-weight': '600',
            'color': colors.primary,
            'margin-bottom': '12px',
            'text-align': 'center',
          }}>
            Merkle-Damgard (SHA-256)
          </div>
          <div style={{ 'display': 'flex', 'flex-direction': 'column', 'align-items': 'center', 'gap': '8px' }}>
            <FlowNode variant="primary" size="sm">
              IV (256 бит)
            </FlowNode>

            <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center' }}>
              <Arrow direction="down" />
              <FlowNode variant="default" size="sm">M1</FlowNode>
            </div>

            <FlowNode variant="secondary" size="sm">
              Функция сжатия f
            </FlowNode>

            <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center' }}>
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

          <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'margin-top': '12px', 'line-height': '1.5' }}>
            Фиксированный размер состояния = размер выхода.
            Последовательная обработка блоков. Уязвима к length extension attack.
          </div>
        </div>
        </DiagramTooltip>

        {/* Sponge (Keccak/SHA-3) */}
        <DiagramTooltip content="Sponge: absorb-squeeze architecture. Используется в SHA-3/Keccak. Immune к length extension attack. Может генерировать произвольно длинный выход (XOF).">
        <div style={{ ...glassStyle, 'padding': '16px', 'flex': '1', 'min-width': '280px' }}>
          <div style={{
            'font-size': '14px',
            'font-weight': '600',
            'color': colors.accent,
            'margin-bottom': '12px',
            'text-align': 'center',
          }}>
            Конструкция губки (Keccak/SHA-3)
          </div>
          <div style={{ 'display': 'flex', 'flex-direction': 'column', 'align-items': 'center', 'gap': '8px' }}>
            <FlowNode variant="accent" size="sm">
              Нулевое состояние (1600 бит)
            </FlowNode>

            <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center' }}>
              <Arrow direction="down" label="XOR rate" />
              <FlowNode variant="default" size="sm">M1</FlowNode>
            </div>

            <FlowNode variant="secondary" size="sm">
              Перестановка Keccak-f
            </FlowNode>

            <div style={{ 'display': 'flex', 'gap': '8px', 'align-items': 'center' }}>
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

          <div style={{ 'font-size': '11px', 'color': colors.textMuted, 'margin-top': '12px', 'line-height': '1.5' }}>
            Большое внутреннее состояние (1600 бит) {'>'} размер выхода.
            Capacity защищает от length extension. Нет уязвимости к этой атаке.
          </div>
        </div>
        </DiagramTooltip>
      </div>

      {/* Comparison table */}
      <div style={{ 'margin-top': '16px' }}>
        <div style={{
          'display': 'grid',
          'grid-template-columns': '1fr 1fr 1fr',
          'gap': '0',
          'font-size': '12px',
          'font-family': 'monospace',
          'border': `1px solid ${colors.border}`,
          'border-radius': '8px',
          'overflow': 'hidden',
        }}>
          {/* Header */}
          {['Свойство', 'SHA-256', 'Keccak-256 / SHA-3'].map((h, i) => (
            <div style={{
              'padding': '8px 12px',
              'background': `${colors.primary}15`,
              'border-bottom': `1px solid ${colors.border}`,
              'color': colors.text,
              'font-weight': '600',
              'border-right': i < 2 ? `1px solid ${colors.border}` : undefined,
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
              <div style={{
                'padding': '6px 12px',
                'border-bottom': ri < 6 ? `1px solid ${colors.border}` : undefined,
                'border-right': ci < 2 ? `1px solid ${colors.border}` : undefined,
                'color': ci === 0 ? colors.textMuted : colors.text,
                'background': 'rgba(255,255,255,0.02)',
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
