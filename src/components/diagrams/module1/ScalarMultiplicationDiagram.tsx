import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const ScalarMultiplicationDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Скалярное умножение: k × G">
      <FlowRow justify="center" gap={24}>
        <FlowColumn gap={8} align="center">
          <FlowNode variant="primary">G (генератор)</FlowNode>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Известная точка на кривой
          </div>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <span style={{ color: colors.textMuted, fontSize: '24px' }}>×</span>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <FlowNode variant="danger">k (скаляр)</FlowNode>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Приватный ключ
          </div>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <span style={{ color: colors.textMuted, fontSize: '24px' }}>=</span>
        </FlowColumn>

        <FlowColumn gap={8} align="center">
          <FlowNode variant="success">P = k × G</FlowNode>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Публичный ключ
          </div>
        </FlowColumn>
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '12px', color: colors.text, marginBottom: '12px' }}>
          <strong>Double-and-Add алгоритм:</strong>
        </div>
        <FlowRow gap={8} wrap={true} justify="center">
          {[
            { k: '1', p: 'G' },
            { k: '2', p: '2G' },
            { k: '3', p: '2G + G' },
            { k: '4', p: '4G' },
            { k: '5', p: '4G + G' },
            { k: '...', p: '...' },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                background: `${colors.primary}15`,
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: colors.primary, fontFamily: 'monospace', fontSize: '12px' }}>
                k = {step.k}
              </div>
              <div style={{ color: colors.textMuted, fontSize: '10px' }}>
                {step.p}
              </div>
            </div>
          ))}
        </FlowRow>
      </div>

      <div style={{
        marginTop: '16px',
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
            ✓ Легко (O(log k)):
          </div>
          <div style={{ color: colors.textMuted, fontSize: '11px' }}>
            Зная k и G, вычислить P = k × G
          </div>
        </div>
        <div style={{
          padding: '12px',
          background: `${colors.danger}10`,
          border: `1px solid ${colors.danger}30`,
          borderRadius: '8px',
        }}>
          <div style={{ color: colors.danger, fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            ✗ Сложно (ECDLP):
          </div>
          <div style={{ color: colors.textMuted, fontSize: '11px' }}>
            Зная P и G, найти k — вычислительно невозможно
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
};
