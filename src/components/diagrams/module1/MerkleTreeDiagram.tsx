import React from 'react';
import { DiagramContainer, FlowRow, colors } from '@primitives';

export const MerkleTreeDiagram: React.FC = () => {
  const nodeStyle = (color: string): React.CSSProperties => ({
    padding: '8px 12px',
    background: `${color}20`,
    border: `1px solid ${color}`,
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '10px',
    color,
    textAlign: 'center',
  });

  return (
    <DiagramContainer title="Дерево Меркла">
      <svg width="100%" height="300" viewBox="0 0 500 300">
        {/* Lines */}
        <line x1="250" y1="40" x2="130" y2="100" stroke={colors.border} strokeWidth="1" />
        <line x1="250" y1="40" x2="370" y2="100" stroke={colors.border} strokeWidth="1" />
        <line x1="130" y1="120" x2="70" y2="180" stroke={colors.border} strokeWidth="1" />
        <line x1="130" y1="120" x2="190" y2="180" stroke={colors.border} strokeWidth="1" />
        <line x1="370" y1="120" x2="310" y2="180" stroke={colors.border} strokeWidth="1" />
        <line x1="370" y1="120" x2="430" y2="180" stroke={colors.border} strokeWidth="1" />

        {/* Root */}
        <rect x="200" y="20" width="100" height="35" rx="6" fill={`${colors.success}20`} stroke={colors.success} />
        <text x="250" y="42" textAnchor="middle" fill={colors.success} fontSize="11" fontWeight="bold">
          Merkle Root
        </text>

        {/* Level 1 */}
        <rect x="80" y="95" width="100" height="35" rx="6" fill={`${colors.primary}20`} stroke={colors.primary} />
        <text x="130" y="117" textAnchor="middle" fill={colors.primary} fontSize="10">
          H(H₁₂)
        </text>

        <rect x="320" y="95" width="100" height="35" rx="6" fill={`${colors.primary}20`} stroke={colors.primary} />
        <text x="370" y="117" textAnchor="middle" fill={colors.primary} fontSize="10">
          H(H₃₄)
        </text>

        {/* Level 2 (leaves) */}
        {[
          { x: 30, label: 'H(Tx1)', color: colors.secondary },
          { x: 150, label: 'H(Tx2)', color: colors.secondary },
          { x: 270, label: 'H(Tx3)', color: colors.secondary },
          { x: 390, label: 'H(Tx4)', color: colors.secondary },
        ].map((node, i) => (
          <g key={i}>
            <rect x={node.x} y="170" width="80" height="35" rx="6" fill={`${node.color}20`} stroke={node.color} />
            <text x={node.x + 40} y="192" textAnchor="middle" fill={node.color} fontSize="10">
              {node.label}
            </text>
          </g>
        ))}

        {/* Lines to data */}
        {[70, 190, 310, 430].map((x, i) => (
          <line key={i} x1={x} y1="205" x2={x} y2="240" stroke={colors.border} strokeWidth="1" strokeDasharray="4" />
        ))}

        {/* Data */}
        {[
          { x: 30, label: 'Tx 1' },
          { x: 150, label: 'Tx 2' },
          { x: 270, label: 'Tx 3' },
          { x: 390, label: 'Tx 4' },
        ].map((node, i) => (
          <g key={`data-${i}`}>
            <rect x={node.x} y="240" width="80" height="30" rx="4" fill="rgba(255,255,255,0.03)" stroke={colors.border} />
            <text x={node.x + 40} y="260" textAnchor="middle" fill={colors.text} fontSize="11">
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <FlowRow justify="center" gap={24} style={{ marginTop: '16px' }}>
        {[
          { label: 'Merkle Root', desc: 'Один хеш для всех данных', color: colors.success },
          { label: 'Внутренние узлы', desc: 'H(left || right)', color: colors.primary },
          { label: 'Листья', desc: 'Хеши транзакций', color: colors.secondary },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              background: `${item.color}40`,
              border: `1px solid ${item.color}`,
            }} />
            <div>
              <div style={{ color: item.color }}>{item.label}</div>
              <div style={{ color: colors.textMuted, fontSize: '10px' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </FlowRow>
    </DiagramContainer>
  );
};
