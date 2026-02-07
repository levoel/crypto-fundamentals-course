import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors, Grid } from '@primitives';

export const AESStructureDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Структура AES-128">
      <FlowRow justify="center" gap={32}>
        <FlowColumn gap={8} align="center">
          <FlowNode variant="primary" style={{ width: '120px' }}>Plaintext</FlowNode>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>128 бит (16 байт)</div>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <FlowNode variant="secondary" style={{ width: '120px' }}>Key</FlowNode>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>128/192/256 бит</div>
        </FlowColumn>
      </FlowRow>

      <FlowRow justify="center" style={{ margin: '16px 0' }}>
        <Arrow direction="down" />
      </FlowRow>

      {/* Rounds */}
      <FlowColumn gap={8} align="center">
        <FlowNode style={{
          padding: '8px 24px',
          background: `${colors.info}15`,
          border: `1px solid ${colors.info}40`,
        }}>
          AddRoundKey (Initial)
        </FlowNode>

        <div style={{
          padding: '16px',
          background: `${colors.warning}10`,
          border: `1px dashed ${colors.warning}40`,
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ color: colors.warning, marginBottom: '8px', fontWeight: 'bold' }}>
            10 раундов (AES-128)
          </div>
          <FlowRow gap={4} justify="center">
            <FlowNode size="sm" variant="primary">SubBytes</FlowNode>
            <Arrow direction="right" style={{ padding: '2px' }} />
            <FlowNode size="sm" variant="secondary">ShiftRows</FlowNode>
            <Arrow direction="right" style={{ padding: '2px' }} />
            <FlowNode size="sm" variant="accent">MixColumns</FlowNode>
            <Arrow direction="right" style={{ padding: '2px' }} />
            <FlowNode size="sm" variant="info">AddRoundKey</FlowNode>
          </FlowRow>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px' }}>
            * Последний раунд без MixColumns
          </div>
        </div>
      </FlowColumn>

      <FlowRow justify="center" style={{ margin: '16px 0' }}>
        <Arrow direction="down" />
      </FlowRow>

      <FlowRow justify="center">
        <FlowNode variant="success" style={{ width: '120px' }}>Ciphertext</FlowNode>
      </FlowRow>

      {/* Variants table */}
      <Grid columns={3} gap={12} style={{ marginTop: '24px' }}>
        {[
          { name: 'AES-128', key: '128 бит', rounds: '10 раундов' },
          { name: 'AES-192', key: '192 бит', rounds: '12 раундов' },
          { name: 'AES-256', key: '256 бит', rounds: '14 раундов' },
        ].map((v, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ color: colors.primary, fontWeight: 'bold', marginBottom: '4px' }}>
              {v.name}
            </div>
            <div style={{ color: colors.textMuted, fontSize: '11px' }}>{v.key}</div>
            <div style={{ color: colors.textMuted, fontSize: '11px' }}>{v.rounds}</div>
          </div>
        ))}
      </Grid>
    </DiagramContainer>
  );
};
