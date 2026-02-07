import React from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, FlowColumn, colors } from '@primitives';

export const CollisionDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Стойкость к коллизиям">
      <FlowRow justify="center" gap={32}>
        <FlowColumn gap={8} align="end">
          <FlowNode variant="primary">Сообщение A</FlowNode>
          <FlowNode variant="secondary">Сообщение B</FlowNode>
        </FlowColumn>

        <Arrow direction="right" label="H(x)" />

        <FlowColumn gap={8}>
          <FlowNode variant="danger" style={{ position: 'relative' }}>
            Одинаковый хеш?
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: colors.danger,
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}>
              ✕
            </span>
          </FlowNode>
        </FlowColumn>
      </FlowRow>

      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}>
        {[
          {
            title: 'Preimage Resistance',
            desc: 'Имея h, невозможно найти m: H(m) = h',
            complexity: '2²⁵⁶',
          },
          {
            title: 'Second Preimage',
            desc: 'Имея m₁, невозможно найти m₂: H(m₁) = H(m₂)',
            complexity: '2²⁵⁶',
          },
          {
            title: 'Collision Resistance',
            desc: 'Невозможно найти любые m₁ ≠ m₂: H(m₁) = H(m₂)',
            complexity: '2¹²⁸',
          },
        ].map((prop, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
            }}
          >
            <h5 style={{ color: colors.primary, marginBottom: '8px', fontSize: '13px' }}>
              {prop.title}
            </h5>
            <p style={{ color: colors.textMuted, fontSize: '12px', marginBottom: '8px' }}>
              {prop.desc}
            </p>
            <div style={{
              fontFamily: 'monospace',
              color: colors.success,
              fontSize: '14px',
            }}>
              ~{prop.complexity} попыток
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: `${colors.info}15`,
        borderRadius: '8px',
        fontSize: '12px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.info }}>Парадокс дней рождения:</strong> Для нахождения коллизии
        нужно ~√N попыток, где N — размер выходного пространства. Для SHA-256: √2²⁵⁶ = 2¹²⁸
      </div>
    </DiagramContainer>
  );
};
