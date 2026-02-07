import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors, Grid } from '@primitives';

export const BitcoinRPCDiagram: React.FC = () => {
  const categories = [
    {
      name: 'Blockchain',
      color: colors.primary,
      commands: ['getblockchaininfo', 'getblock', 'getbestblockhash'],
    },
    {
      name: 'Wallet',
      color: colors.success,
      commands: ['listunspent', 'getnewaddress', 'getbalance'],
    },
    {
      name: 'Transactions',
      color: colors.warning,
      commands: ['sendtoaddress', 'getrawtransaction', 'decoderawtransaction'],
    },
    {
      name: 'Mining',
      color: colors.accent,
      commands: ['generatetoaddress', 'getmininginfo'],
    },
  ];

  return (
    <DiagramContainer title="Bitcoin Core JSON-RPC">
      <FlowColumn gap={16}>
        <FlowRow gap={8}>
          <FlowNode variant="primary" size="sm">Client (Python)</FlowNode>
          <Arrow direction="right" label="JSON-RPC" />
          <FlowNode variant="success" size="sm">Bitcoin Core (18443)</FlowNode>
        </FlowRow>

        <Grid columns={2} gap={12}>
          {categories.map((cat, i) => (
            <div key={i} style={{
              padding: '12px',
              background: `${cat.color}10`,
              border: `1px solid ${cat.color}30`,
              borderRadius: '8px',
            }}>
              <div style={{ color: cat.color, fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>
                {cat.name}
              </div>
              <FlowColumn gap={4} align="start">
                {cat.commands.map((cmd, j) => (
                  <div key={j} style={{
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    color: colors.text,
                    padding: '2px 6px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '3px',
                  }}>
                    {cmd}
                  </div>
                ))}
              </FlowColumn>
            </div>
          ))}
        </Grid>
      </FlowColumn>
    </DiagramContainer>
  );
};
