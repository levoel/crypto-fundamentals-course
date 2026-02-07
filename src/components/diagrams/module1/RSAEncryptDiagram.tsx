import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const RSAEncryptDiagram: React.FC = () => {
  return (
    <DiagramContainer title="RSA: Шифрование и расшифрование">
      <FlowRow justify="space-around" gap={24}>
        {/* Encryption */}
        <FlowColumn gap={12} align="center">
          <div style={{
            fontSize: '14px',
            color: colors.primary,
            fontWeight: 'bold',
            borderBottom: `2px solid ${colors.primary}`,
            paddingBottom: '4px',
          }}>
            Шифрование
          </div>

          <FlowNode variant="primary">m (сообщение)</FlowNode>
          <Arrow direction="down" />

          <div style={{
            padding: '12px 24px',
            background: `${colors.warning}20`,
            border: `2px solid ${colors.warning}`,
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: '16px', color: colors.warning }}>
              c = m<sup>e</sup> mod n
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
              Публичный ключ (n, e)
            </div>
          </div>

          <Arrow direction="down" />
          <FlowNode variant="accent">c (шифротекст)</FlowNode>
        </FlowColumn>

        {/* Network */}
        <FlowColumn gap={8} align="center" justify="center">
          <div style={{ fontSize: '32px' }}>📡</div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Передача<br />по сети
          </div>
        </FlowColumn>

        {/* Decryption */}
        <FlowColumn gap={12} align="center">
          <div style={{
            fontSize: '14px',
            color: colors.success,
            fontWeight: 'bold',
            borderBottom: `2px solid ${colors.success}`,
            paddingBottom: '4px',
          }}>
            Расшифрование
          </div>

          <FlowNode variant="accent">c (шифротекст)</FlowNode>
          <Arrow direction="down" />

          <div style={{
            padding: '12px 24px',
            background: `${colors.danger}20`,
            border: `2px solid ${colors.danger}`,
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: '16px', color: colors.danger }}>
              m = c<sup>d</sup> mod n
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
              Приватный ключ (n, d)
            </div>
          </div>

          <Arrow direction="down" />
          <FlowNode variant="success">m (сообщение)</FlowNode>
        </FlowColumn>
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '12px',
        background: `${colors.info}10`,
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '12px',
      }}>
        <span style={{ color: colors.info }}>Почему это работает: </span>
        <span style={{ color: colors.text, fontFamily: 'monospace' }}>
          (m<sup>e</sup>)<sup>d</sup> ≡ m<sup>ed</sup> ≡ m<sup>1</sup> ≡ m (mod n)
        </span>
        <span style={{ color: colors.textMuted }}> по теореме Эйлера</span>
      </div>
    </DiagramContainer>
  );
};
