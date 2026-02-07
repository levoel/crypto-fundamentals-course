import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const GCMModeDiagram: React.FC = () => {
  return (
    <DiagramContainer title="GCM (Galois/Counter Mode) — Рекомендуемый">
      <FlowRow justify="center" gap={32}>
        {/* CTR encryption part */}
        <FlowColumn gap={8} align="center">
          <div style={{ fontSize: '12px', color: colors.accent, fontWeight: 'bold' }}>
            CTR Шифрование
          </div>
          <FlowRow gap={8}>
            <FlowColumn gap={4} align="center">
              <FlowNode variant="secondary" size="sm">Nonce||0</FlowNode>
              <Arrow direction="down" style={{ padding: '2px' }} />
              <div style={{
                padding: '4px 8px',
                background: `${colors.warning}20`,
                border: `1px solid ${colors.warning}`,
                borderRadius: '4px',
                fontSize: '10px',
                color: colors.warning,
              }}>
                E<sub>K</sub>
              </div>
              <Arrow direction="down" style={{ padding: '2px' }} />
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: `${colors.primary}20`,
                border: `1px solid ${colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: colors.primary,
              }}>
                ⊕
              </div>
            </FlowColumn>
          </FlowRow>
          <FlowNode variant="primary" size="sm">Plaintext</FlowNode>
          <Arrow direction="down" />
          <FlowNode variant="success" size="sm">Ciphertext</FlowNode>
        </FlowColumn>

        {/* GHASH authentication part */}
        <FlowColumn gap={8} align="center">
          <div style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold' }}>
            GHASH Аутентификация
          </div>
          <FlowRow gap={8}>
            <FlowNode variant="info" size="sm">AAD</FlowNode>
            <FlowNode variant="success" size="sm">Cipher</FlowNode>
            <FlowNode variant="accent" size="sm">Lengths</FlowNode>
          </FlowRow>
          <Arrow direction="down" />
          <div style={{
            padding: '8px 16px',
            background: `${colors.secondary}20`,
            border: `1px solid ${colors.secondary}`,
            borderRadius: '6px',
            fontSize: '11px',
            color: colors.secondary,
          }}>
            GHASH (GF(2¹²⁸))
          </div>
          <Arrow direction="down" />
          <FlowNode variant="warning" size="sm">Auth Tag</FlowNode>
        </FlowColumn>
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: `${colors.success}10`,
        border: `1px solid ${colors.success}30`,
        borderRadius: '8px',
      }}>
        <div style={{ color: colors.success, fontWeight: 'bold', marginBottom: '8px' }}>
          ✓ AES-GCM обеспечивает:
        </div>
        <FlowRow gap={24} justify="space-around">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: colors.primary }}>🔒</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Конфиденциальность</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: colors.secondary }}>✓</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Целостность</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: colors.accent }}>🔑</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Аутентификация</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: colors.warning }}>⚡</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>Параллельность</div>
          </div>
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
