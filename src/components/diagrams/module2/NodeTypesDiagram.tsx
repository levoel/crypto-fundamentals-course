import React from 'react';
import { DiagramContainer, FlowColumn, colors, Grid } from '@primitives';

export const NodeTypesDiagram: React.FC = () => {
  const nodes = [
    { name: 'Full Node', color: colors.success, features: ['Полная валидация', 'Вся история', '~600 GB'], icon: '🖥️' },
    { name: 'Pruned Node', color: colors.info, features: ['Полная валидация', 'Частичная история', '~10 GB'], icon: '📦' },
    { name: 'SPV Node', color: colors.warning, features: ['Только заголовки', 'Merkle proofs', '~50 MB'], icon: '📱' },
    { name: 'Mining Node', color: colors.accent, features: ['Full Node + майнинг', 'Создаёт блоки', 'ASIC оборудование'], icon: '⛏️' },
  ];

  return (
    <DiagramContainer title="Типы узлов Bitcoin">
      <Grid columns={2} gap={16}>
        {nodes.map((node, i) => (
          <div key={i} style={{
            padding: '16px',
            background: `${node.color}10`,
            border: `1px solid ${node.color}30`,
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{node.icon}</div>
            <div style={{ color: node.color, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>
              {node.name}
            </div>
            <FlowColumn gap={4} align="start">
              {node.features.map((f, j) => (
                <div key={j} style={{ fontSize: '11px', color: colors.textMuted }}>• {f}</div>
              ))}
            </FlowColumn>
          </div>
        ))}
      </Grid>
    </DiagramContainer>
  );
};
