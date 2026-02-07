import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, colors, Grid } from '@primitives';

export const Secp256k1Diagram: React.FC = () => {
  const params = [
    { name: 'p', value: '2²⁵⁶ - 2³² - 977', desc: 'Размер поля' },
    { name: 'a', value: '0', desc: 'Коэффициент a' },
    { name: 'b', value: '7', desc: 'Коэффициент b' },
    { name: 'n', value: '~2²⁵⁶', desc: 'Порядок группы' },
    { name: 'h', value: '1', desc: 'Кофактор' },
  ];

  return (
    <DiagramContainer title="secp256k1 — Кривая Bitcoin и Ethereum">
      <FlowRow justify="center" style={{ marginBottom: '24px' }}>
        <div style={{
          padding: '16px 32px',
          background: `${colors.primary}15`,
          border: `2px solid ${colors.primary}`,
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '20px',
            color: colors.primary,
          }}>
            y² = x³ + 7
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textMuted,
            marginTop: '4px',
          }}>
            над полем F<sub>p</sub>
          </div>
        </div>
      </FlowRow>

      <Grid columns={5} gap={8}>
        {params.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '12px 8px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{
              color: colors.primary,
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
            }}>
              {p.name}
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: colors.text,
              marginBottom: '4px',
            }}>
              {p.value}
            </div>
            <div style={{
              fontSize: '9px',
              color: colors.textMuted,
            }}>
              {p.desc}
            </div>
          </div>
        ))}
      </Grid>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: `${colors.warning}10`,
        border: `1px solid ${colors.warning}30`,
        borderRadius: '8px',
      }}>
        <div style={{ color: colors.warning, fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
          Почему Сатоши выбрал secp256k1?
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '11px',
          color: colors.textMuted,
        }}>
          <li><strong>a = 0</strong> — упрощает вычисления</li>
          <li><strong>Нестандартная кривая</strong> — меньше подозрений в бэкдорах (в отличие от NIST curves)</li>
          <li><strong>Endomorphism</strong> — ускорение верификации на ~30%</li>
        </ul>
      </div>

      <FlowRow justify="center" gap={24} style={{ marginTop: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>₿</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Bitcoin</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>⟠</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Ethereum</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>Ł</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Litecoin</div>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
};
