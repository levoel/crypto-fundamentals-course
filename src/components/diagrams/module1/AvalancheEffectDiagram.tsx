import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, colors, Grid } from '@primitives';

export const AvalancheEffectDiagram: React.FC = () => {
  // Simulated bit comparison (not real SHA-256)
  const bits1 = '01100001011001000110001101100010'.split('');
  const bits2 = '10011110100110110001110010010101'.split('');

  const changedCount = bits1.filter((b, i) => b !== bits2[i]).length;

  return (
    <DiagramContainer title="Эффект лавины: изменение 1 бита входа">
      <Grid columns={2} gap={24}>
        <FlowColumn gap={8}>
          <span style={{ fontSize: '12px', color: colors.textMuted }}>Вход 1: "Hello World"</span>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: colors.text,
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            letterSpacing: '1px',
          }}>
            {bits1.map((b, i) => (
              <span key={i} style={{ color: bits1[i] === bits2[i] ? colors.text : colors.success }}>
                {b}
              </span>
            ))}
          </div>
        </FlowColumn>

        <FlowColumn gap={8}>
          <span style={{ fontSize: '12px', color: colors.textMuted }}>Вход 2: "Hello world" (w→W)</span>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: colors.text,
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            letterSpacing: '1px',
          }}>
            {bits2.map((b, i) => (
              <span key={i} style={{ color: bits1[i] === bits2[i] ? colors.text : colors.danger }}>
                {b}
              </span>
            ))}
          </div>
        </FlowColumn>
      </Grid>

      <FlowRow justify="center" style={{ marginTop: '24px' }}>
        <div style={{
          padding: '16px 32px',
          background: `${colors.warning}15`,
          border: `1px solid ${colors.warning}40`,
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', color: colors.warning, fontWeight: 'bold' }}>
            ~50%
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>
            битов изменилось ({changedCount} из {bits1.length})
          </div>
        </div>
      </FlowRow>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '8px',
        fontSize: '13px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.primary }}>Лавинный эффект:</strong> Изменение одного бита во входных данных
        должно изменить приблизительно 50% битов на выходе — это делает хеш непредсказуемым.
      </div>
    </DiagramContainer>
  );
};
