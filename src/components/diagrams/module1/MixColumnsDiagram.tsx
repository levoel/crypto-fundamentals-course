import React from 'react';
import { DiagramContainer, FlowRow, colors, Grid } from '@primitives';

export const MixColumnsDiagram: React.FC = () => {
  const matrix = [
    ['02', '03', '01', '01'],
    ['01', '02', '03', '01'],
    ['01', '01', '02', '03'],
    ['03', '01', '01', '02'],
  ];

  return (
    <DiagramContainer title="MixColumns: Умножение матриц в GF(2⁸)">
      <FlowRow justify="center" gap={16} align="center">
        {/* MDS Matrix */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
            MDS матрица
          </div>
          <div style={{
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2px',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
          }}>
            {matrix.flat().map((val, i) => (
              <div
                key={i}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${colors.primary}20`,
                  border: `1px solid ${colors.primary}40`,
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: colors.primary,
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        <span style={{ color: colors.textMuted, fontSize: '24px' }}>×</span>

        {/* Input column */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
            Столбец входа
          </div>
          <div style={{
            display: 'inline-grid',
            gridTemplateColumns: '1fr',
            gap: '2px',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
          }}>
            {['a₀', 'a₁', 'a₂', 'a₃'].map((val, i) => (
              <div
                key={i}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${colors.secondary}20`,
                  border: `1px solid ${colors.secondary}40`,
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: colors.secondary,
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        <span style={{ color: colors.textMuted, fontSize: '24px' }}>=</span>

        {/* Output column */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
            Столбец выхода
          </div>
          <div style={{
            display: 'inline-grid',
            gridTemplateColumns: '1fr',
            gap: '2px',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
          }}>
            {['b₀', 'b₁', 'b₂', 'b₃'].map((val, i) => (
              <div
                key={i}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${colors.accent}20`,
                  border: `1px solid ${colors.accent}40`,
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: colors.accent,
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '12px',
        background: `${colors.info}10`,
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: colors.text,
        textAlign: 'center',
      }}>
        b₀ = (02 ⊗ a₀) ⊕ (03 ⊗ a₁) ⊕ a₂ ⊕ a₃
      </div>

      <div style={{
        marginTop: '12px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.warning }}>⊗</strong> — умножение в GF(2⁸) с неприводимым полиномом x⁸ + x⁴ + x³ + x + 1
        <br />
        <strong style={{ color: colors.warning }}>⊕</strong> — сложение (XOR)
      </div>
    </DiagramContainer>
  );
};
