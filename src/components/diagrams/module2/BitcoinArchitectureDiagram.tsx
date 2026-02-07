import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors, Grid } from '@primitives';

export const BitcoinArchitectureDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Архитектура Bitcoin">
      <FlowColumn gap={16}>
        <FlowRow gap={12}>
          <FlowNode variant="primary" size="lg">P2P Network</FlowNode>
        </FlowRow>
        <FlowRow gap={12}>
          <FlowNode variant="success" size="sm">Full Node</FlowNode>
          <FlowNode variant="success" size="sm">Full Node</FlowNode>
          <FlowNode variant="warning" size="sm">SPV Node</FlowNode>
          <FlowNode variant="success" size="sm">Full Node</FlowNode>
          <FlowNode variant="accent" size="sm">Miner</FlowNode>
        </FlowRow>
        <Arrow direction="down" label="gossip protocol" />
        <Grid columns={3} gap={12}>
          <div style={{ padding: '12px', background: `${colors.primary}10`, borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: colors.primary, fontSize: '12px', fontWeight: 'bold' }}>Mempool</div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>Неподтверждённые TX</div>
          </div>
          <div style={{ padding: '12px', background: `${colors.success}10`, borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: colors.success, fontSize: '12px', fontWeight: 'bold' }}>Blockchain</div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>Цепочка блоков</div>
          </div>
          <div style={{ padding: '12px', background: `${colors.accent}10`, borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: colors.accent, fontSize: '12px', fontWeight: 'bold' }}>UTXO Set</div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>Непотраченные выходы</div>
          </div>
        </Grid>
      </FlowColumn>
    </DiagramContainer>
  );
};
