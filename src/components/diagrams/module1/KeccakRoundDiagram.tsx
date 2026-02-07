import React from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, colors } from '@primitives';

export const KeccakRoundDiagram: React.FC = () => {
  const operations = [
    { symbol: 'θ', name: 'Theta', desc: 'Смешивание столбцов', color: colors.primary },
    { symbol: 'ρ', name: 'Rho', desc: 'Вращение внутри lane', color: colors.secondary },
    { symbol: 'π', name: 'Pi', desc: 'Перестановка lanes', color: colors.accent },
    { symbol: 'χ', name: 'Chi', desc: 'Нелинейность', color: colors.warning },
    { symbol: 'ι', name: 'Iota', desc: 'Константа раунда', color: colors.success },
  ];

  return (
    <DiagramContainer title="Операции раунда Keccak-f[1600]">
      <FlowRow justify="center" gap={8} wrap={true}>
        {operations.map((op, i) => (
          <React.Fragment key={i}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `${op.color}20`,
                border: `2px solid ${op.color}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <span style={{
                  fontSize: '24px',
                  color: op.color,
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                }}>
                  {op.symbol}
                </span>
              </div>
              <div style={{
                marginTop: '8px',
                color: op.color,
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                {op.name}
              </div>
              <div style={{
                color: colors.textMuted,
                fontSize: '10px',
                maxWidth: '80px',
              }}>
                {op.desc}
              </div>
            </div>
            {i < operations.length - 1 && (
              <Arrow direction="right" color={colors.textMuted} style={{ padding: '0 4px' }} />
            )}
          </React.Fragment>
        ))}
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: `${colors.warning}10`,
        border: `1px solid ${colors.warning}30`,
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <span style={{ color: colors.warning, fontWeight: 'bold' }}>χ (Chi)</span>
        <span style={{ color: colors.textMuted }}> — единственная </span>
        <span style={{ color: colors.text }}>нелинейная</span>
        <span style={{ color: colors.textMuted }}> операция, обеспечивающая криптографическую стойкость</span>
      </div>

      <FlowRow justify="center" style={{ marginTop: '16px' }}>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
          fontSize: '12px',
        }}>
          <span style={{ color: colors.textMuted }}>Всего: </span>
          <span style={{ color: colors.primary, fontWeight: 'bold' }}>24 раунда</span>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
};
