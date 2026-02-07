import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const ECDSAVerifyDiagram: React.FC = () => {
  return (
    <DiagramContainer title="ECDSA: Верификация подписи">
      <FlowRow justify="center" gap={24}>
        <FlowColumn gap={8} align="center">
          <FlowRow gap={8}>
            <FlowNode variant="primary" size="sm">message</FlowNode>
            <FlowNode variant="warning" size="sm">(r, s)</FlowNode>
            <FlowNode variant="success" size="sm">Q (pubkey)</FlowNode>
          </FlowRow>
          <Arrow direction="down" />
        </FlowColumn>
      </FlowRow>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginTop: '16px',
      }}>
        <FlowColumn gap={8} align="center">
          <div style={{
            padding: '8px',
            background: `${colors.info}15`,
            borderRadius: '6px',
            textAlign: 'center',
            width: '100%',
          }}>
            <div style={{ fontSize: '10px', color: colors.textMuted }}>Шаг 1</div>
            <div style={{ fontSize: '12px', color: colors.info, fontFamily: 'monospace' }}>
              z = H(m)
            </div>
          </div>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <div style={{
            padding: '8px',
            background: `${colors.secondary}15`,
            borderRadius: '6px',
            textAlign: 'center',
            width: '100%',
          }}>
            <div style={{ fontSize: '10px', color: colors.textMuted }}>Шаг 2</div>
            <div style={{ fontSize: '11px', color: colors.secondary, fontFamily: 'monospace' }}>
              u₁ = zs⁻¹<br />u₂ = rs⁻¹
            </div>
          </div>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <div style={{
            padding: '8px',
            background: `${colors.accent}15`,
            borderRadius: '6px',
            textAlign: 'center',
            width: '100%',
          }}>
            <div style={{ fontSize: '10px', color: colors.textMuted }}>Шаг 3</div>
            <div style={{ fontSize: '11px', color: colors.accent, fontFamily: 'monospace' }}>
              (x₁,y₁) = u₁G + u₂Q
            </div>
          </div>
        </FlowColumn>
      </div>

      <FlowRow justify="center" style={{ marginTop: '24px' }}>
        <div style={{
          padding: '16px 32px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: `2px solid ${colors.primary}`,
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>
            Проверка:
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '16px',
            color: colors.primary,
          }}>
            r ≡ x₁ (mod n) ?
          </div>
        </div>
      </FlowRow>

      <FlowRow justify="center" gap={32} style={{ marginTop: '16px' }}>
        <FlowNode variant="success">✓ Валидна</FlowNode>
        <FlowNode variant="danger">✗ Невалидна</FlowNode>
      </FlowRow>
    </DiagramContainer>
  );
};
