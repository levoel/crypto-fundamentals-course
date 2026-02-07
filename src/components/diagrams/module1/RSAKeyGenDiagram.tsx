import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors, Grid } from '@primitives';

export const RSAKeyGenDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Генерация ключей RSA">
      <Grid columns={2} gap={24}>
        {/* Steps */}
        <FlowColumn gap={12} align="start">
          {[
            { step: '1', action: 'Выбрать p, q', desc: 'Два больших простых числа' },
            { step: '2', action: 'n = p × q', desc: 'Модуль (публичный)' },
            { step: '3', action: 'φ(n) = (p-1)(q-1)', desc: 'Функция Эйлера' },
            { step: '4', action: 'Выбрать e', desc: 'gcd(e, φ(n)) = 1, обычно 65537' },
            { step: '5', action: 'd = e⁻¹ mod φ(n)', desc: 'Приватный экспонент' },
          ].map((item, i) => (
            <FlowRow key={i} gap={12} align="center">
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: `${colors.primary}20`,
                border: `1px solid ${colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: colors.primary,
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div>
                <div style={{ color: colors.text, fontSize: '13px', fontFamily: 'monospace' }}>
                  {item.action}
                </div>
                <div style={{ color: colors.textMuted, fontSize: '11px' }}>
                  {item.desc}
                </div>
              </div>
            </FlowRow>
          ))}
        </FlowColumn>

        {/* Result */}
        <FlowColumn gap={16} align="center" justify="center">
          <div style={{
            padding: '20px',
            background: `${colors.success}15`,
            border: `1px solid ${colors.success}40`,
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ color: colors.success, fontWeight: 'bold', marginBottom: '8px' }}>
              Публичный ключ
            </div>
            <div style={{
              fontFamily: 'monospace',
              color: colors.text,
              fontSize: '14px',
            }}>
              (n, e)
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
              Можно распространять
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: `${colors.danger}15`,
            border: `1px solid ${colors.danger}40`,
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ color: colors.danger, fontWeight: 'bold', marginBottom: '8px' }}>
              Приватный ключ
            </div>
            <div style={{
              fontFamily: 'monospace',
              color: colors.text,
              fontSize: '14px',
            }}>
              (n, d)
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
              СТРОГО СЕКРЕТНО!
            </div>
          </div>
        </FlowColumn>
      </Grid>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.info }}>Безопасность:</strong> Основана на сложности факторизации n = p × q.
        Для RSA-2048: факторизация требует ~10³⁰ операций.
      </div>
    </DiagramContainer>
  );
};
