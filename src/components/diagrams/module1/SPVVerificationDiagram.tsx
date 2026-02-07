import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const SPVVerificationDiagram: React.FC = () => {
  return (
    <DiagramContainer title="SPV: Легкая верификация транзакций">
      <FlowRow justify="space-around" gap={16}>
        {/* Full node */}
        <FlowColumn gap={8} align="center">
          <div style={{
            fontSize: '13px',
            color: colors.primary,
            fontWeight: 'bold',
          }}>
            Полный узел
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${colors.primary}`,
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <FlowColumn gap={4} align="center">
              {['Block Header', 'Все транзакции', 'Merkle Tree'].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '4px 12px',
                    background: `${colors.primary}15`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: colors.text,
                  }}
                >
                  {item}
                </div>
              ))}
            </FlowColumn>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px' }}>
              ~500 GB
            </div>
          </div>
        </FlowColumn>

        {/* Arrow and proof */}
        <FlowColumn gap={8} align="center" justify="center">
          <Arrow direction="right" label="Merkle Proof" />
          <div style={{
            padding: '4px 8px',
            background: `${colors.warning}15`,
            borderRadius: '4px',
            fontSize: '10px',
            color: colors.warning,
          }}>
            ~640 байт
          </div>
        </FlowColumn>

        {/* Light client */}
        <FlowColumn gap={8} align="center">
          <div style={{
            fontSize: '13px',
            color: colors.success,
            fontWeight: 'bold',
          }}>
            Легкий клиент (SPV)
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${colors.success}`,
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <FlowColumn gap={4} align="center">
              {['Block Headers only', 'Merkle Proof', 'Verify: root match?'].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '4px 12px',
                    background: `${colors.success}15`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: colors.text,
                  }}
                >
                  {item}
                </div>
              ))}
            </FlowColumn>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px' }}>
              ~50 MB
            </div>
          </div>
        </FlowColumn>
      </FlowRow>

      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ color: colors.primary, fontSize: '20px', fontWeight: 'bold' }}>80 байт</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Размер заголовка блока</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ color: colors.accent, fontSize: '20px', fontWeight: 'bold' }}>O(log n)</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Размер proof</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', textAlign: 'center' }}>
          <div style={{ color: colors.success, fontSize: '20px', fontWeight: 'bold' }}>10000x</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Экономия места</div>
        </div>
      </div>
    </DiagramContainer>
  );
};
