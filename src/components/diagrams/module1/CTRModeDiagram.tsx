import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const CTRModeDiagram: React.FC = () => {
  return (
    <DiagramContainer title="CTR (Counter Mode)">
      <FlowRow justify="center" gap={24}>
        {[0, 1, 2].map((i) => (
          <FlowColumn key={i} gap={8} align="center">
            <FlowRow gap={4}>
              <FlowNode variant="secondary" size="sm" style={{ fontSize: '10px' }}>Nonce</FlowNode>
              <FlowNode variant="info" size="sm" style={{ fontSize: '10px' }}>{i}</FlowNode>
            </FlowRow>
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
            <div style={{
              padding: '4px 8px',
              background: `${colors.accent}20`,
              borderRadius: '4px',
              fontSize: '10px',
              color: colors.accent,
            }}>
              Keystream
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: `${colors.primary}20`,
              border: `1px solid ${colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: colors.primary,
            }}>
              ⊕
            </div>
            <FlowNode variant="primary" size="sm">P{i + 1}</FlowNode>
            <Arrow direction="down" style={{ padding: '2px' }} />
            <FlowNode variant="success" size="sm">C{i + 1}</FlowNode>
          </FlowColumn>
        ))}
      </FlowRow>

      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        <div style={{
          padding: '12px',
          background: `${colors.success}10`,
          border: `1px solid ${colors.success}30`,
          borderRadius: '8px',
        }}>
          <div style={{ color: colors.success, fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            ✓ Преимущества:
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: colors.textMuted }}>
            <li>Параллельное шифрование</li>
            <li>Нет паддинга</li>
            <li>Произвольный доступ к блокам</li>
          </ul>
        </div>
        <div style={{
          padding: '12px',
          background: `${colors.danger}10`,
          border: `1px solid ${colors.danger}30`,
          borderRadius: '8px',
        }}>
          <div style={{ color: colors.danger, fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            ⚠️ КРИТИЧНО:
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Никогда не используйте один nonce дважды! Повторное использование полностью
            компрометирует шифрование.
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
};
