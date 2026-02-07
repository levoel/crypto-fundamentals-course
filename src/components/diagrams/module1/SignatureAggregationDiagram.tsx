import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors, Grid } from '@primitives';

export const SignatureAggregationDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Агрегация подписей (MuSig)">
      <Grid columns={2} gap={24}>
        {/* Without aggregation */}
        <div style={{
          padding: '16px',
          background: `${colors.danger}10`,
          border: `1px solid ${colors.danger}30`,
          borderRadius: '8px',
        }}>
          <div style={{
            color: colors.danger,
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: '13px',
          }}>
            Без агрегации (ECDSA)
          </div>

          <FlowColumn gap={8} align="center">
            <FlowRow gap={8}>
              <FlowNode variant="primary" size="sm">sig₁</FlowNode>
              <FlowNode variant="secondary" size="sm">sig₂</FlowNode>
              <FlowNode variant="accent" size="sm">sig₃</FlowNode>
            </FlowRow>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              fontSize: '12px',
              color: colors.text,
            }}>
              3 × 64 = <strong>192 байта</strong>
            </div>
          </FlowColumn>
        </div>

        {/* With aggregation */}
        <div style={{
          padding: '16px',
          background: `${colors.success}10`,
          border: `1px solid ${colors.success}30`,
          borderRadius: '8px',
        }}>
          <div style={{
            color: colors.success,
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: '13px',
          }}>
            С агрегацией (Schnorr)
          </div>

          <FlowColumn gap={8} align="center">
            <FlowRow gap={4}>
              <FlowNode variant="primary" size="sm">sig₁</FlowNode>
              <span style={{ color: colors.textMuted }}>+</span>
              <FlowNode variant="secondary" size="sm">sig₂</FlowNode>
              <span style={{ color: colors.textMuted }}>+</span>
              <FlowNode variant="accent" size="sm">sig₃</FlowNode>
            </FlowRow>
            <Arrow direction="down" />
            <FlowNode variant="success">sig_agg</FlowNode>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              fontSize: '12px',
              color: colors.text,
            }}>
              Всего: <strong>64 байта</strong>
            </div>
          </FlowColumn>
        </div>
      </Grid>

      {/* Formula */}
      <FlowRow justify="center" style={{ marginTop: '24px' }}>
        <div style={{
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: `1px solid ${colors.primary}`,
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: colors.primary,
        }}>
          P<sub>agg</sub> = P₁ + P₂ + P₃ &nbsp;&nbsp;|&nbsp;&nbsp; s<sub>agg</sub> = s₁ + s₂ + s₃
        </div>
      </FlowRow>

      <div style={{
        marginTop: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        {[
          { icon: '💾', title: 'Меньше данных', desc: 'Размер не зависит от числа подписантов' },
          { icon: '🔒', title: 'Приватность', desc: 'Невозможно определить число подписантов' },
          { icon: '💰', title: 'Дешевле', desc: 'Меньше комиссия за транзакцию' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
            <div style={{ color: colors.text, fontSize: '12px', fontWeight: 'bold' }}>{item.title}</div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </DiagramContainer>
  );
};
