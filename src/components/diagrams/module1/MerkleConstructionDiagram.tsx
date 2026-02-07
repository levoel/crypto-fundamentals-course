import React, { useState } from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const MerkleConstructionDiagram: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Шаг 1: Хеширование данных', desc: 'Вычисляем хеш каждого элемента' },
    { title: 'Шаг 2: Попарное объединение', desc: 'Конкатенируем и хешируем пары' },
    { title: 'Шаг 3: Корень', desc: 'Продолжаем пока не останется один хеш' },
  ];

  return (
    <DiagramContainer title="Построение дерева Меркла">
      <FlowRow justify="center" gap={8} style={{ marginBottom: '16px' }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              padding: '8px 16px',
              background: step === i ? `${colors.primary}30` : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${step === i ? colors.primary : colors.border}`,
              borderRadius: '6px',
              color: step === i ? colors.primary : colors.textMuted,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {s.title}
          </button>
        ))}
      </FlowRow>

      <div style={{
        padding: '8px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '12px',
        color: colors.textMuted,
      }}>
        {steps[step].desc}
      </div>

      <FlowColumn gap={16} align="center">
        {/* Step 1: Raw data */}
        <FlowRow gap={8}>
          {['Tx1', 'Tx2', 'Tx3', 'Tx4'].map((tx, i) => (
            <FlowNode
              key={i}
              size="sm"
              style={{
                opacity: step >= 0 ? 1 : 0.3,
                background: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              {tx}
            </FlowNode>
          ))}
        </FlowRow>

        {step >= 0 && <Arrow direction="down" label="H()" color={colors.secondary} />}

        {/* Hash layer */}
        <FlowRow gap={8}>
          {['H1', 'H2', 'H3', 'H4'].map((h, i) => (
            <FlowNode
              key={i}
              variant="secondary"
              size="sm"
              style={{ opacity: step >= 0 ? 1 : 0.3 }}
            >
              {h}
            </FlowNode>
          ))}
        </FlowRow>

        {step >= 1 && <Arrow direction="down" label="H(Hi || Hj)" color={colors.primary} />}

        {/* Combined layer */}
        {step >= 1 && (
          <FlowRow gap={24}>
            <FlowNode variant="primary">H(H1 || H2)</FlowNode>
            <FlowNode variant="primary">H(H3 || H4)</FlowNode>
          </FlowRow>
        )}

        {step >= 2 && <Arrow direction="down" label="H()" color={colors.success} />}

        {/* Root */}
        {step >= 2 && (
          <FlowNode variant="success" size="lg">
            Merkle Root
          </FlowNode>
        )}
      </FlowColumn>
    </DiagramContainer>
  );
};
