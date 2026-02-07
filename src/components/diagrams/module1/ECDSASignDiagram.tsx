import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const ECDSASignDiagram: React.FC = () => {
  return (
    <DiagramContainer title="ECDSA: Создание подписи">
      <FlowRow justify="center" gap={32}>
        <FlowColumn gap={8} align="center">
          <FlowNode variant="primary">message</FlowNode>
          <Arrow direction="down" />
          <div style={{
            padding: '8px 16px',
            background: `${colors.info}20`,
            border: `1px solid ${colors.info}`,
            borderRadius: '6px',
            fontSize: '11px',
            color: colors.info,
          }}>
            z = SHA256(m)
          </div>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <FlowNode variant="secondary">k (random)</FlowNode>
          <Arrow direction="down" />
          <div style={{
            padding: '8px 16px',
            background: `${colors.accent}20`,
            border: `1px solid ${colors.accent}`,
            borderRadius: '6px',
            fontSize: '11px',
            color: colors.accent,
          }}>
            (x₁, y₁) = k × G
          </div>
          <Arrow direction="down" />
          <FlowNode variant="warning">r = x₁ mod n</FlowNode>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <FlowNode variant="danger">d (private key)</FlowNode>
          <Arrow direction="down" />
          <div style={{
            padding: '8px 16px',
            background: `${colors.warning}20`,
            border: `1px solid ${colors.warning}`,
            borderRadius: '6px',
            fontSize: '10px',
            color: colors.warning,
            textAlign: 'center',
          }}>
            s = k⁻¹(z + rd)<br />mod n
          </div>
        </FlowColumn>
      </FlowRow>

      <FlowRow justify="center" style={{ marginTop: '24px' }}>
        <div style={{
          padding: '16px 32px',
          background: `${colors.success}15`,
          border: `2px solid ${colors.success}`,
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px' }}>
            Подпись:
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            color: colors.success,
          }}>
            (r, s)
          </div>
        </div>
      </FlowRow>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: `${colors.danger}10`,
        border: `1px solid ${colors.danger}30`,
        borderRadius: '8px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.danger }}>⚠️ КРИТИЧНО:</strong> Значение k должно быть уникальным для каждой подписи!
        Повторное использование k раскрывает приватный ключ d.
      </div>
    </DiagramContainer>
  );
};
