import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const PSBTDiagram: React.FC = () => {
  const steps = [
    { role: 'Creator', action: 'Unsigned TX', variant: 'primary' as const },
    { role: 'Updater', action: 'UTXO + paths', variant: 'secondary' as const },
    { role: 'Signer(s)', action: 'Подписи', variant: 'warning' as const },
    { role: 'Combiner', action: 'Объединение', variant: 'accent' as const },
    { role: 'Finalizer', action: 'Witness', variant: 'info' as const },
    { role: 'Extractor', action: 'Raw TX', variant: 'success' as const },
  ];

  return (
    <DiagramContainer title="PSBT: Partially Signed Bitcoin Transaction (BIP-174)">
      <FlowColumn gap={12}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <FlowRow gap={16}>
              <div style={{
                width: '80px',
                textAlign: 'right',
                fontSize: '11px',
                color: colors.textMuted,
                fontWeight: 'bold',
              }}>
                {step.role}
              </div>
              <FlowNode variant={step.variant} size="sm">{step.action}</FlowNode>
            </FlowRow>
            {i < steps.length - 1 && <Arrow direction="down" style={{ padding: '2px' }} />}
          </React.Fragment>
        ))}
      </FlowColumn>
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: `${colors.warning}10`,
        borderRadius: '8px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.warning }}>Применения:</strong> Hardware wallets (offline signing), Multisig (несколько подписантов), CoinJoin (несколько участников)
      </div>
    </DiagramContainer>
  );
};
