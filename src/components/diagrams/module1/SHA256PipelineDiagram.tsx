import React from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, colors } from '@primitives';

export const SHA256PipelineDiagram: React.FC = () => {
  const steps = [
    { name: 'Сообщение', desc: 'Любая длина', color: colors.primary },
    { name: 'Padding', desc: '+1 + zeros + length', color: colors.secondary },
    { name: 'Разбиение', desc: '512-bit блоки', color: colors.accent },
    { name: '64 раунда', desc: 'Сжатие каждого блока', color: colors.warning },
    { name: 'Хеш', desc: '256 бит', color: colors.success },
  ];

  return (
    <DiagramContainer title="Пайплайн SHA-256">
      <FlowRow justify="center" gap={8} wrap={true}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: 'center' }}>
              <FlowNode
                style={{
                  background: `${step.color}20`,
                  border: `1px solid ${step.color}40`,
                  color: step.color,
                  minWidth: '100px',
                }}
              >
                {step.name}
              </FlowNode>
              <div style={{
                fontSize: '10px',
                color: colors.textMuted,
                marginTop: '4px',
              }}>
                {step.desc}
              </div>
            </div>
            {i < steps.length - 1 && (
              <Arrow direction="right" color={colors.textMuted} />
            )}
          </React.Fragment>
        ))}
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
      }}>
        <h5 style={{ color: colors.text, marginBottom: '12px', fontSize: '13px' }}>
          Внутренние операции:
        </h5>
        <FlowRow gap={16} wrap={true}>
          {[
            { op: 'σ₀, σ₁', desc: 'Малые сигмы (расширение)' },
            { op: 'Σ₀, Σ₁', desc: 'Большие сигмы (сжатие)' },
            { op: 'Ch', desc: 'Choice (x∧y)⊕(¬x∧z)' },
            { op: 'Maj', desc: 'Majority (x∧y)⊕(x∧z)⊕(y∧z)' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
              }}
            >
              <span style={{ color: colors.primary, fontFamily: 'monospace' }}>{item.op}</span>
              <span style={{ color: colors.textMuted, fontSize: '11px', marginLeft: '8px' }}>
                {item.desc}
              </span>
            </div>
          ))}
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
