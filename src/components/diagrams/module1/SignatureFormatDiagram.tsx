import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, colors, Grid } from '@primitives';

export const SignatureFormatDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Форматы ECDSA подписей">
      <Grid columns={2} gap={24}>
        {/* DER format */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
        }}>
          <div style={{
            color: colors.primary,
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: '14px',
          }}>
            DER формат (Bitcoin)
          </div>

          <div style={{
            display: 'flex',
            gap: '2px',
            flexWrap: 'wrap',
            marginBottom: '12px',
          }}>
            {[
              { bytes: '30', desc: 'SEQUENCE', color: colors.textMuted },
              { bytes: 'XX', desc: 'length', color: colors.textMuted },
              { bytes: '02', desc: 'INTEGER', color: colors.primary },
              { bytes: 'XX', desc: 'r_len', color: colors.primary },
              { bytes: 'r...', desc: 'r value', color: colors.primary },
              { bytes: '02', desc: 'INTEGER', color: colors.secondary },
              { bytes: 'XX', desc: 's_len', color: colors.secondary },
              { bytes: 's...', desc: 's value', color: colors.secondary },
            ].map((part, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 8px',
                  background: `${part.color}20`,
                  border: `1px solid ${part.color}40`,
                  borderRadius: '4px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: part.color }}>
                  {part.bytes}
                </div>
                <div style={{ fontSize: '8px', color: colors.textMuted }}>
                  {part.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Размер: 70-72 байта (переменный)
          </div>
        </div>

        {/* Compact format */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
        }}>
          <div style={{
            color: colors.secondary,
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: '14px',
          }}>
            Compact формат (Ethereum)
          </div>

          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '12px',
          }}>
            <div style={{
              flex: 1,
              padding: '12px',
              background: `${colors.primary}20`,
              border: `1px solid ${colors.primary}`,
              borderRadius: '6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: colors.primary, fontWeight: 'bold' }}>r</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>32 байта</div>
            </div>

            <div style={{
              flex: 1,
              padding: '12px',
              background: `${colors.secondary}20`,
              border: `1px solid ${colors.secondary}`,
              borderRadius: '6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold' }}>s</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>32 байта</div>
            </div>

            <div style={{
              padding: '12px 8px',
              background: `${colors.accent}20`,
              border: `1px solid ${colors.accent}`,
              borderRadius: '6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: colors.accent, fontWeight: 'bold' }}>v</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>1 байт</div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Размер: 65 байт (фиксированный)
          </div>
        </div>
      </Grid>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: `${colors.info}10`,
        borderRadius: '8px',
        fontSize: '11px',
      }}>
        <strong style={{ color: colors.info }}>Recovery ID (v):</strong>
        <span style={{ color: colors.textMuted }}> Позволяет восстановить публичный ключ из подписи в Ethereum.
        v = 27 или 28 (legacy), v = chainId * 2 + 35 или 36 (EIP-155)</span>
      </div>
    </DiagramContainer>
  );
};
