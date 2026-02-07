import React from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, colors } from '@primitives';

export const TransactionLifecycleDiagram: React.FC = () => {
  const steps = [
    { label: 'Создание', variant: 'primary' as const },
    { label: 'Подпись', variant: 'warning' as const },
    { label: 'Broadcast', variant: 'accent' as const },
    { label: 'Mempool', variant: 'secondary' as const },
    { label: 'В блок', variant: 'success' as const },
  ];

  return (
    <DiagramContainer title="Жизненный цикл транзакции">
      <FlowRow gap={8}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <FlowNode variant={step.variant} size="sm">{step.label}</FlowNode>
            {i < steps.length - 1 && <Arrow direction="right" />}
          </React.Fragment>
        ))}
      </FlowRow>
      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
        <FlowRow gap={24} justify="space-around">
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.warning, fontSize: '12px', fontWeight: 'bold' }}>1 confirmation</div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>~10 мин</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.success, fontSize: '12px', fontWeight: 'bold' }}>6 confirmations</div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>~60 мин (стандарт)</div>
          </div>
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
