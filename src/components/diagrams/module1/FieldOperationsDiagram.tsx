import React, { useState } from 'react';
import { DiagramContainer, FlowRow, FlowNode, colors, Grid } from '@primitives';

export const FieldOperationsDiagram: React.FC = () => {
  const [p] = useState(7);

  // Generate multiplication table for GF(p)
  const elements = Array.from({ length: p }, (_, i) => i);
  const nonZeroElements = elements.filter(x => x !== 0);

  // Find inverses
  const findInverse = (a: number) => {
    for (let i = 1; i < p; i++) {
      if ((a * i) % p === 1) return i;
    }
    return null;
  };

  return (
    <DiagramContainer title={`Конечное поле GF(${p})`}>
      <Grid columns={2} gap={24}>
        {/* Addition table */}
        <div>
          <h5 style={{ color: colors.text, marginBottom: '12px', fontSize: '13px' }}>
            Сложение mod {p}
          </h5>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${p + 1}, 1fr)`,
            gap: '2px',
            fontSize: '11px',
          }}>
            {/* Header row */}
            <div style={{
              background: colors.primary + '30',
              padding: '4px',
              textAlign: 'center',
              color: colors.primary,
              fontWeight: 'bold',
            }}>
              +
            </div>
            {elements.map(j => (
              <div
                key={`header-${j}`}
                style={{
                  background: colors.primary + '20',
                  padding: '4px',
                  textAlign: 'center',
                  color: colors.primary,
                }}
              >
                {j}
              </div>
            ))}

            {/* Data rows */}
            {elements.map(i => (
              <React.Fragment key={`row-${i}`}>
                <div style={{
                  background: colors.primary + '20',
                  padding: '4px',
                  textAlign: 'center',
                  color: colors.primary,
                }}>
                  {i}
                </div>
                {elements.map(j => (
                  <div
                    key={`cell-${i}-${j}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '4px',
                      textAlign: 'center',
                      color: colors.text,
                    }}
                  >
                    {(i + j) % p}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Multiplication table */}
        <div>
          <h5 style={{ color: colors.text, marginBottom: '12px', fontSize: '13px' }}>
            Умножение mod {p}
          </h5>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${p + 1}, 1fr)`,
            gap: '2px',
            fontSize: '11px',
          }}>
            {/* Header row */}
            <div style={{
              background: colors.accent + '30',
              padding: '4px',
              textAlign: 'center',
              color: colors.accent,
              fontWeight: 'bold',
            }}>
              ×
            </div>
            {elements.map(j => (
              <div
                key={`mul-header-${j}`}
                style={{
                  background: colors.accent + '20',
                  padding: '4px',
                  textAlign: 'center',
                  color: colors.accent,
                }}
              >
                {j}
              </div>
            ))}

            {/* Data rows */}
            {elements.map(i => (
              <React.Fragment key={`mul-row-${i}`}>
                <div style={{
                  background: colors.accent + '20',
                  padding: '4px',
                  textAlign: 'center',
                  color: colors.accent,
                }}>
                  {i}
                </div>
                {elements.map(j => (
                  <div
                    key={`mul-cell-${i}-${j}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '4px',
                      textAlign: 'center',
                      color: colors.text,
                    }}
                  >
                    {(i * j) % p}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Grid>

      {/* Inverses */}
      <div style={{ marginTop: '20px' }}>
        <h5 style={{ color: colors.text, marginBottom: '12px', fontSize: '13px' }}>
          Мультипликативные обратные
        </h5>
        <FlowRow gap={12}>
          {nonZeroElements.map(a => {
            const inv = findInverse(a);
            return (
              <div
                key={a}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: colors.text }}>{a}</span>
                <span style={{ color: colors.textMuted }}>⁻¹ = </span>
                <span style={{ color: colors.success }}>{inv}</span>
              </div>
            );
          })}
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
