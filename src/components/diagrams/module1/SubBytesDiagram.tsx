import React, { useState } from 'react';
import { DiagramContainer, FlowRow, colors, Grid } from '@primitives';

// Partial S-box for visualization
const S_BOX_PARTIAL = [
  [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5],
  [0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0],
  [0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc],
  [0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a],
];

export const SubBytesDiagram: React.FC = () => {
  const [selectedByte, setSelectedByte] = useState<number | null>(0x53);

  const row = selectedByte !== null ? (selectedByte >> 4) & 0x0f : null;
  const col = selectedByte !== null ? selectedByte & 0x0f : null;
  const result = row !== null && col !== null && row < 4 && col < 8
    ? S_BOX_PARTIAL[row][col]
    : null;

  return (
    <DiagramContainer title="SubBytes: Замена через S-box">
      <Grid columns={2} gap={24}>
        {/* S-box preview */}
        <div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>
            S-box (частичная таблица):
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `32px repeat(8, 1fr)`,
            gap: '2px',
            fontSize: '10px',
          }}>
            {/* Header */}
            <div style={{ padding: '4px', color: colors.primary }}></div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`col-${i}`}
                style={{
                  padding: '4px',
                  textAlign: 'center',
                  color: colors.primary,
                  background: `${colors.primary}20`,
                }}
              >
                {i.toString(16)}
              </div>
            ))}

            {/* Rows */}
            {S_BOX_PARTIAL.map((rowData, r) => (
              <React.Fragment key={`row-${r}`}>
                <div style={{
                  padding: '4px',
                  textAlign: 'center',
                  color: colors.primary,
                  background: `${colors.primary}20`,
                }}>
                  {r.toString(16)}
                </div>
                {rowData.map((val, c) => {
                  const isSelected = row === r && col === c;
                  return (
                    <div
                      key={`cell-${r}-${c}`}
                      onClick={() => setSelectedByte(r * 16 + c)}
                      style={{
                        padding: '4px',
                        textAlign: 'center',
                        background: isSelected
                          ? `${colors.accent}40`
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? `1px solid ${colors.accent}` : 'none',
                        cursor: 'pointer',
                        color: colors.text,
                        fontFamily: 'monospace',
                      }}
                    >
                      {val.toString(16).padStart(2, '0')}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Transformation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>
              Вход:
            </div>
            <div style={{
              padding: '12px 24px',
              background: `${colors.primary}20`,
              border: `1px solid ${colors.primary}`,
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '18px',
              color: colors.primary,
            }}>
              0x{selectedByte?.toString(16).padStart(2, '0') || '??'}
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
              row = {row?.toString(16) || '?'}, col = {col?.toString(16) || '?'}
            </div>
          </div>

          <div style={{ color: colors.textMuted, fontSize: '20px' }}>↓</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>
              Выход:
            </div>
            <div style={{
              padding: '12px 24px',
              background: `${colors.accent}20`,
              border: `1px solid ${colors.accent}`,
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '18px',
              color: colors.accent,
            }}>
              0x{result?.toString(16).padStart(2, '0') || '??'}
            </div>
          </div>
        </div>
      </Grid>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.info }}>S-box:</strong> Нелинейная замена, основанная на
        инверсии в GF(2⁸) + аффинное преобразование. Обеспечивает стойкость к линейному и
        дифференциальному криптоанализу.
      </div>
    </DiagramContainer>
  );
};
