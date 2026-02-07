import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, colors, Grid } from '@primitives';

export const GroupStructureDiagram: React.FC = () => {
  const axioms = [
    { name: 'Замкнутость', formula: 'a ∘ b ∈ G', description: 'Результат операции остается в группе' },
    { name: 'Ассоциативность', formula: '(a ∘ b) ∘ c = a ∘ (b ∘ c)', description: 'Порядок скобок не важен' },
    { name: 'Нейтральный элемент', formula: 'a ∘ e = e ∘ a = a', description: 'Существует "ноль" операции' },
    { name: 'Обратный элемент', formula: 'a ∘ a⁻¹ = e', description: 'Можно "отменить" элемент' },
  ];

  return (
    <DiagramContainer title="Аксиомы группы (G, ∘)">
      <Grid columns={2} gap={16}>
        {axioms.map((axiom, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
            }}>
              <span style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${colors.primary}20`,
                borderRadius: '50%',
                fontSize: '12px',
                color: colors.primary,
              }}>
                {i + 1}
              </span>
              <span style={{ color: colors.text, fontWeight: 600 }}>
                {axiom.name}
              </span>
            </div>
            <div style={{
              fontFamily: 'monospace',
              color: colors.primary,
              marginBottom: '8px',
              fontSize: '16px',
            }}>
              {axiom.formula}
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              {axiom.description}
            </div>
          </div>
        ))}
      </Grid>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: `${colors.accent}10`,
        border: `1px solid ${colors.accent}30`,
        borderRadius: '8px',
      }}>
        <FlowRow justify="space-around">
          <FlowColumn gap={4}>
            <span style={{ color: colors.accent, fontSize: '12px' }}>Пример: (ℤ, +)</span>
            <span style={{ color: colors.textMuted, fontSize: '11px' }}>e = 0, a⁻¹ = -a</span>
          </FlowColumn>
          <FlowColumn gap={4}>
            <span style={{ color: colors.accent, fontSize: '12px' }}>Пример: (ℝ*, ×)</span>
            <span style={{ color: colors.textMuted, fontSize: '11px' }}>e = 1, a⁻¹ = 1/a</span>
          </FlowColumn>
          <FlowColumn gap={4}>
            <span style={{ color: colors.accent, fontSize: '12px' }}>Пример: (ℤₙ, +)</span>
            <span style={{ color: colors.textMuted, fontSize: '11px' }}>e = 0, a⁻¹ = n-a</span>
          </FlowColumn>
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
