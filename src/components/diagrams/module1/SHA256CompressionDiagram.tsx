import React from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, colors } from '@primitives';

export const SHA256CompressionDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Функция сжатия SHA-256">
      <FlowRow justify="center" gap={16}>
        <div style={{ textAlign: 'center' }}>
          <FlowNode variant="primary">H[i-1]</FlowNode>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
            256 бит (8 × 32)
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <FlowNode variant="secondary">Block[i]</FlowNode>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
            512 бит
          </div>
        </div>
      </FlowRow>

      <FlowRow justify="center" style={{ margin: '16px 0' }}>
        <Arrow direction="down" />
      </FlowRow>

      <FlowRow justify="center">
        <div style={{
          padding: '24px 48px',
          background: `${colors.warning}15`,
          border: `2px solid ${colors.warning}40`,
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ color: colors.warning, fontWeight: 'bold', marginBottom: '8px' }}>
            64 раунда сжатия
          </div>
          <FlowRow gap={8}>
            {['Round 0', '...', 'Round 63'].map((r, i) => (
              <FlowNode key={i} size="sm" style={{ fontSize: '10px' }}>{r}</FlowNode>
            ))}
          </FlowRow>
        </div>
      </FlowRow>

      <FlowRow justify="center" style={{ margin: '16px 0' }}>
        <Arrow direction="down" />
      </FlowRow>

      <FlowRow justify="center" gap={16}>
        <FlowNode variant="primary">H[i-1]</FlowNode>
        <span style={{ color: colors.textMuted, fontSize: '20px' }}>+</span>
        <FlowNode variant="accent">Result</FlowNode>
        <span style={{ color: colors.textMuted, fontSize: '20px' }}>=</span>
        <FlowNode variant="success">H[i]</FlowNode>
      </FlowRow>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '12px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.info }}>Merkle-Damgård конструкция:</strong> Результат каждого блока
        складывается с предыдущим состоянием, образуя цепочку зависимостей.
      </div>
    </DiagramContainer>
  );
};
