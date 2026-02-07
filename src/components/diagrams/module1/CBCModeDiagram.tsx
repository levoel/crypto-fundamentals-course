import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const CBCModeDiagram: React.FC = () => {
  return (
    <DiagramContainer title="CBC (Cipher Block Chaining)">
      <FlowRow justify="center" gap={8} align="start">
        {/* IV */}
        <FlowColumn gap={8} align="center">
          <FlowNode variant="secondary" size="sm">IV</FlowNode>
          <div style={{ height: '30px' }} />
        </FlowColumn>

        {[1, 2, 3].map((i) => (
          <FlowColumn key={i} gap={8} align="center">
            <FlowNode variant="primary" size="sm">P{i}</FlowNode>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `${colors.accent}20`,
              border: `1px solid ${colors.accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: colors.accent,
            }}>
              ⊕
            </div>
            <Arrow direction="down" style={{ padding: '2px' }} />
            <div style={{
              padding: '6px 12px',
              background: `${colors.warning}20`,
              border: `1px solid ${colors.warning}`,
              borderRadius: '6px',
              fontSize: '11px',
              color: colors.warning,
            }}>
              E<sub>K</sub>
            </div>
            <Arrow direction="down" style={{ padding: '2px' }} />
            <FlowNode variant="success" size="sm">C{i}</FlowNode>
          </FlowColumn>
        ))}
      </FlowRow>

      {/* Chaining arrows */}
      <svg width="100%" height="40" style={{ marginTop: '-60px', marginBottom: '20px' }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={colors.accent} />
          </marker>
        </defs>
        <path
          d="M 80 30 L 140 30"
          stroke={colors.accent}
          strokeWidth="1"
          strokeDasharray="4"
          markerEnd="url(#arrowhead)"
          fill="none"
        />
        <path
          d="M 180 30 L 240 30"
          stroke={colors.accent}
          strokeWidth="1"
          strokeDasharray="4"
          markerEnd="url(#arrowhead)"
          fill="none"
        />
        <path
          d="M 280 30 L 340 30"
          stroke={colors.accent}
          strokeWidth="1"
          strokeDasharray="4"
          markerEnd="url(#arrowhead)"
          fill="none"
        />
      </svg>

      <div style={{
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '12px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.success }}>Преимущество:</strong> Каждый блок зависит от предыдущего — одинаковые блоки дают разный шифротекст.
        <br />
        <strong style={{ color: colors.warning }}>Недостаток:</strong> Нельзя параллелить шифрование. Требует паддинг.
      </div>
    </DiagramContainer>
  );
};
