import React from 'react';
import { DiagramContainer, FlowRow, colors, Grid } from '@primitives';

export const Ed25519Diagram: React.FC = () => {
  const params = [
    { name: 'p', value: '2²⁵⁵ - 19', desc: 'Размер поля' },
    { name: 'Форма', value: 'Twisted Edwards', desc: '-x² + y² = 1 + dx²y²' },
    { name: 'd', value: '-121665/121666', desc: 'Коэффициент' },
    { name: 'L', value: '2²⁵² + ...', desc: 'Порядок группы' },
    { name: 'h', value: '8', desc: 'Кофактор' },
  ];

  return (
    <DiagramContainer title="Ed25519 — Кривая Solana">
      <FlowRow justify="center" style={{ marginBottom: '24px' }}>
        <div style={{
          padding: '16px 32px',
          background: `${colors.secondary}15`,
          border: `2px solid ${colors.secondary}`,
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '18px',
            color: colors.secondary,
          }}>
            -x² + y² = 1 + dx²y²
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textMuted,
            marginTop: '4px',
          }}>
            Twisted Edwards form
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
              color: colors.secondary,
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
            }}>
              {p.name}
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '10px',
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
        background: `${colors.success}10`,
        border: `1px solid ${colors.success}30`,
        borderRadius: '8px',
      }}>
        <div style={{ color: colors.success, fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
          Преимущества Ed25519:
        </div>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '11px',
          color: colors.textMuted,
        }}>
          <li><strong>Быстрее</strong> — оптимизированная арифметика</li>
          <li><strong>Детерминированные подписи</strong> — нет случайного k</li>
          <li><strong>Встроенная защита</strong> от side-channel атак</li>
          <li><strong>Compact</strong> — 32 байта публичный ключ, 64 байта подпись</li>
        </ul>
      </div>

      <FlowRow justify="center" gap={24} style={{ marginTop: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>◎</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Solana</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>₳</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Cardano</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px' }}>💎</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>TON</div>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
};
