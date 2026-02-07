import React from 'react';
import { DiagramContainer, colors } from '@primitives';

export const CurveComparisonDiagram: React.FC = () => {
  const comparison = [
    { prop: 'Форма', secp: 'Weierstrass', ed: 'Twisted Edwards' },
    { prop: 'Уравнение', secp: 'y² = x³ + 7', ed: '-x² + y² = 1 + dx²y²' },
    { prop: 'Поле', secp: '2²⁵⁶ - 2³² - 977', ed: '2²⁵⁵ - 19' },
    { prop: 'Размер ключа', secp: '33 байта (сжатый)', ed: '32 байта' },
    { prop: 'Размер подписи', secp: '64-72 байта', ed: '64 байта' },
    { prop: 'Скорость подписи', secp: '~8000/с', ed: '~20000/с' },
    { prop: 'Скорость проверки', secp: '~3000/с', ed: '~7000/с' },
    { prop: 'Детерминированность', secp: 'Нет*', ed: 'Да' },
    { prop: 'Кофактор', secp: '1', ed: '8' },
  ];

  return (
    <DiagramContainer title="Сравнение secp256k1 и Ed25519">
      <div style={{
        overflowX: 'auto',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px 8px',
                textAlign: 'left',
                borderBottom: `2px solid ${colors.border}`,
                color: colors.textMuted,
              }}>
                Параметр
              </th>
              <th style={{
                padding: '12px 8px',
                textAlign: 'center',
                borderBottom: `2px solid ${colors.primary}`,
                color: colors.primary,
                background: `${colors.primary}10`,
              }}>
                secp256k1
              </th>
              <th style={{
                padding: '12px 8px',
                textAlign: 'center',
                borderBottom: `2px solid ${colors.secondary}`,
                color: colors.secondary,
                background: `${colors.secondary}10`,
              }}>
                Ed25519
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, i) => (
              <tr key={i}>
                <td style={{
                  padding: '10px 8px',
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.text,
                }}>
                  {row.prop}
                </td>
                <td style={{
                  padding: '10px 8px',
                  textAlign: 'center',
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontFamily: row.prop === 'Уравнение' || row.prop === 'Поле' ? 'monospace' : 'inherit',
                  fontSize: row.prop === 'Уравнение' || row.prop === 'Поле' ? '10px' : '12px',
                }}>
                  {row.secp}
                </td>
                <td style={{
                  padding: '10px 8px',
                  textAlign: 'center',
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.text,
                  fontFamily: row.prop === 'Уравнение' || row.prop === 'Поле' ? 'monospace' : 'inherit',
                  fontSize: row.prop === 'Уравнение' || row.prop === 'Поле' ? '10px' : '12px',
                }}>
                  {row.ed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '16px',
        fontSize: '10px',
        color: colors.textMuted,
      }}>
        * ECDSA на secp256k1 можно сделать детерминированным с RFC 6979
      </div>
    </DiagramContainer>
  );
};
