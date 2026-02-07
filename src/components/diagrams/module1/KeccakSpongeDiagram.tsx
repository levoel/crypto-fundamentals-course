import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const KeccakSpongeDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Губчатая конструкция Keccak">
      <FlowRow justify="center" gap={8} style={{ marginBottom: '24px' }}>
        {/* Absorbing phase */}
        <FlowColumn gap={8} align="center">
          <div style={{ fontSize: '12px', color: colors.accent, fontWeight: 'bold' }}>
            ABSORBING (Впитывание)
          </div>
          <FlowRow gap={4}>
            {['M₁', 'M₂', 'M₃'].map((m, i) => (
              <React.Fragment key={i}>
                <FlowNode variant="primary" size="sm">{m}</FlowNode>
                {i < 2 && <Arrow direction="right" style={{ padding: '4px' }} />}
              </React.Fragment>
            ))}
          </FlowRow>
        </FlowColumn>

        <div style={{
          width: '2px',
          height: '80px',
          background: colors.border,
          margin: '0 16px',
        }} />

        {/* Squeezing phase */}
        <FlowColumn gap={8} align="center">
          <div style={{ fontSize: '12px', color: colors.success, fontWeight: 'bold' }}>
            SQUEEZING (Выжимание)
          </div>
          <FlowRow gap={4}>
            {['Z₁', 'Z₂', '...'].map((z, i) => (
              <React.Fragment key={i}>
                <FlowNode variant="success" size="sm">{z}</FlowNode>
                {i < 2 && <Arrow direction="right" style={{ padding: '4px' }} />}
              </React.Fragment>
            ))}
          </FlowRow>
        </FlowColumn>
      </FlowRow>

      {/* State representation */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          border: `2px solid ${colors.primary}`,
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '150px',
            padding: '16px',
            background: `${colors.accent}20`,
            textAlign: 'center',
          }}>
            <div style={{ color: colors.accent, fontWeight: 'bold', marginBottom: '4px' }}>
              r (rate)
            </div>
            <div style={{ color: colors.textMuted, fontSize: '12px' }}>
              1088 бит
            </div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>
              (обрабатывается)
            </div>
          </div>
          <div style={{
            width: '100px',
            padding: '16px',
            background: `${colors.secondary}20`,
            textAlign: 'center',
          }}>
            <div style={{ color: colors.secondary, fontWeight: 'bold', marginBottom: '4px' }}>
              c (capacity)
            </div>
            <div style={{ color: colors.textMuted, fontSize: '12px' }}>
              512 бит
            </div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>
              (скрыта)
            </div>
          </div>
        </div>
      </div>

      <FlowRow justify="center">
        <div style={{
          padding: '12px 24px',
          background: `${colors.warning}15`,
          border: `1px solid ${colors.warning}40`,
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <span style={{ color: colors.warning }}>Состояние: </span>
          <span style={{ color: colors.text }}>r + c = 1600 бит (5 × 5 × 64)</span>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
};
