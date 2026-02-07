import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const EdDSADiagram: React.FC = () => {
  return (
    <DiagramContainer title="EdDSA (Ed25519): Детерминированная подпись">
      <FlowRow justify="center" gap={16}>
        <FlowColumn gap={8} align="center">
          <FlowNode variant="danger" size="sm">secret key (sk)</FlowNode>
          <Arrow direction="down" style={{ padding: '2px' }} />
          <div style={{
            padding: '6px 12px',
            background: `${colors.info}20`,
            border: `1px solid ${colors.info}`,
            borderRadius: '4px',
            fontSize: '10px',
            color: colors.info,
          }}>
            h = SHA512(sk)
          </div>
          <FlowRow gap={4}>
            <div style={{
              padding: '4px 8px',
              background: `${colors.primary}20`,
              borderRadius: '4px',
              fontSize: '9px',
              color: colors.primary,
            }}>
              a = h[0:32]
            </div>
            <div style={{
              padding: '4px 8px',
              background: `${colors.secondary}20`,
              borderRadius: '4px',
              fontSize: '9px',
              color: colors.secondary,
            }}>
              prefix = h[32:64]
            </div>
          </FlowRow>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <FlowNode variant="primary" size="sm">message</FlowNode>
          <Arrow direction="down" style={{ padding: '2px' }} />
          <div style={{
            padding: '6px 12px',
            background: `${colors.accent}20`,
            border: `1px solid ${colors.accent}`,
            borderRadius: '4px',
            fontSize: '10px',
            color: colors.accent,
          }}>
            r = H(prefix || m)
          </div>
          <Arrow direction="down" style={{ padding: '2px' }} />
          <FlowNode variant="warning" size="sm">R = r × B</FlowNode>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <div style={{ height: '60px' }} />
          <div style={{
            padding: '6px 12px',
            background: `${colors.warning}20`,
            border: `1px solid ${colors.warning}`,
            borderRadius: '4px',
            fontSize: '10px',
            color: colors.warning,
          }}>
            k = H(R || A || m)
          </div>
          <Arrow direction="down" style={{ padding: '2px' }} />
          <div style={{
            padding: '6px 12px',
            background: `${colors.success}20`,
            border: `1px solid ${colors.success}`,
            borderRadius: '4px',
            fontSize: '10px',
            color: colors.success,
          }}>
            S = r + k × a
          </div>
        </FlowColumn>
      </FlowRow>

      <FlowRow justify="center" style={{ marginTop: '16px' }}>
        <div style={{
          padding: '12px 32px',
          background: `${colors.success}15`,
          border: `2px solid ${colors.success}`,
          borderRadius: '8px',
        }}>
          <span style={{ color: colors.textMuted, fontSize: '12px' }}>Подпись: </span>
          <span style={{ color: colors.success, fontFamily: 'monospace', fontSize: '14px' }}>(R, S)</span>
          <span style={{ color: colors.textMuted, fontSize: '11px' }}> — 64 байта</span>
        </div>
      </FlowRow>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: `${colors.success}10`,
        borderRadius: '8px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.success }}>✓ Детерминированность:</strong> r вычисляется из prefix и message,
        а не генерируется случайно. Одно сообщение → одна подпись. Нет риска повторного k!
      </div>
    </DiagramContainer>
  );
};
