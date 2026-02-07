import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const SchnorrDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Schnorr подпись (BIP-340)">
      <FlowRow justify="center" gap={24}>
        <FlowColumn gap={8} align="center">
          <div style={{
            fontSize: '12px',
            color: colors.primary,
            fontWeight: 'bold',
            marginBottom: '8px',
          }}>
            Подпись
          </div>

          <FlowRow gap={8}>
            <FlowNode variant="danger" size="sm">d</FlowNode>
            <FlowNode variant="primary" size="sm">m</FlowNode>
          </FlowRow>

          <Arrow direction="down" style={{ padding: '4px' }} />

          <div style={{
            padding: '8px',
            background: `${colors.secondary}15`,
            borderRadius: '6px',
            fontSize: '10px',
            color: colors.secondary,
            textAlign: 'center',
          }}>
            k = H(aux || P || m)
            <br />
            R = k × G
          </div>

          <Arrow direction="down" style={{ padding: '4px' }} />

          <div style={{
            padding: '8px',
            background: `${colors.accent}15`,
            borderRadius: '6px',
            fontSize: '10px',
            color: colors.accent,
            textAlign: 'center',
          }}>
            e = H(R || P || m)
            <br />
            s = k + e × d
          </div>

          <Arrow direction="down" style={{ padding: '4px' }} />

          <FlowNode variant="success">(R, s)</FlowNode>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <div style={{
            fontSize: '12px',
            color: colors.success,
            fontWeight: 'bold',
            marginBottom: '8px',
          }}>
            Верификация
          </div>

          <FlowRow gap={8}>
            <FlowNode variant="success" size="sm">P</FlowNode>
            <FlowNode variant="warning" size="sm">(R, s)</FlowNode>
            <FlowNode variant="primary" size="sm">m</FlowNode>
          </FlowRow>

          <Arrow direction="down" style={{ padding: '4px' }} />

          <div style={{
            padding: '8px',
            background: `${colors.info}15`,
            borderRadius: '6px',
            fontSize: '10px',
            color: colors.info,
            textAlign: 'center',
          }}>
            e = H(R || P || m)
          </div>

          <Arrow direction="down" style={{ padding: '4px' }} />

          <div style={{
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '12px',
            color: colors.primary,
            textAlign: 'center',
          }}>
            s × G == R + e × P ?
          </div>
        </FlowColumn>
      </FlowRow>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: `${colors.warning}10`,
        borderRadius: '8px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.warning }}>Линейность Schnorr:</strong> s × G = (k + e × d) × G = k × G + e × d × G = R + e × P.
        Это свойство позволяет <strong>агрегировать</strong> несколько подписей в одну!
      </div>
    </DiagramContainer>
  );
};
