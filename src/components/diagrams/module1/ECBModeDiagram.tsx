import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const ECBModeDiagram: React.FC = () => {
  return (
    <DiagramContainer title="ECB (Electronic Codebook) — НЕ ИСПОЛЬЗОВАТЬ!">
      <FlowRow justify="center" gap={16}>
        {[1, 2, 3].map((i) => (
          <FlowColumn key={i} gap={8} align="center">
            <FlowNode variant="primary" size="sm">P{i}</FlowNode>
            <Arrow direction="down" />
            <div style={{
              padding: '8px 16px',
              background: `${colors.warning}20`,
              border: `1px solid ${colors.warning}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: colors.warning,
            }}>
              E<sub>K</sub>
            </div>
            <Arrow direction="down" />
            <FlowNode variant="accent" size="sm">C{i}</FlowNode>
          </FlowColumn>
        ))}
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: `${colors.danger}15`,
        border: `1px solid ${colors.danger}40`,
        borderRadius: '8px',
      }}>
        <div style={{ color: colors.danger, fontWeight: 'bold', marginBottom: '8px' }}>
          ⚠️ Проблема ECB:
        </div>
        <div style={{ color: colors.textMuted, fontSize: '13px' }}>
          Одинаковые блоки открытого текста → одинаковые блоки шифротекста.
          Паттерны в данных сохраняются!
        </div>
        <FlowRow justify="center" gap={24} style={{ marginTop: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
            }}>
              {['A', 'A', 'B', 'A', 'A', 'B', 'C', 'C', 'C'].map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: v === 'A' ? colors.primary : v === 'B' ? colors.secondary : colors.accent,
                    borderRadius: '2px',
                    fontSize: '10px',
                    color: 'white',
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
              Plaintext
            </div>
          </div>
          <Arrow direction="right" label="ECB" />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
            }}>
              {['X', 'X', 'Y', 'X', 'X', 'Y', 'Z', 'Z', 'Z'].map((v, i) => (
                <div
                  key={i}
                  style={{
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: v === 'X' ? colors.primary : v === 'Y' ? colors.secondary : colors.accent,
                    borderRadius: '2px',
                    fontSize: '10px',
                    color: 'white',
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
              Ciphertext (паттерн сохранен!)
            </div>
          </div>
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
