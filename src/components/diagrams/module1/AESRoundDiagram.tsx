import React from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, colors } from '@primitives';

export const AESRoundDiagram: React.FC = () => {
  const operations = [
    {
      name: 'SubBytes',
      desc: 'Замена через S-box',
      color: colors.primary,
      detail: 'Нелинейность',
    },
    {
      name: 'ShiftRows',
      desc: 'Циклический сдвиг строк',
      color: colors.secondary,
      detail: 'Диффузия по строкам',
    },
    {
      name: 'MixColumns',
      desc: 'Умножение в GF(2⁸)',
      color: colors.accent,
      detail: 'Диффузия по столбцам',
    },
    {
      name: 'AddRoundKey',
      desc: 'XOR с ключом раунда',
      color: colors.warning,
      detail: 'Внедрение ключа',
    },
  ];

  return (
    <DiagramContainer title="4 операции раунда AES">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
      }}>
        {operations.map((op, i) => (
          <div
            key={i}
            style={{
              padding: '16px 8px',
              background: `${op.color}10`,
              border: `1px solid ${op.color}40`,
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{
              color: op.color,
              fontWeight: 'bold',
              fontSize: '13px',
              marginBottom: '8px',
            }}>
              {op.name}
            </div>
            <div style={{
              color: colors.textMuted,
              fontSize: '10px',
              marginBottom: '8px',
            }}>
              {op.desc}
            </div>
            <div style={{
              padding: '4px 8px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              fontSize: '9px',
              color: colors.text,
            }}>
              {op.detail}
            </div>
          </div>
        ))}
      </div>

      <FlowRow justify="center" style={{ marginTop: '24px' }}>
        <svg width="100%" height="60" viewBox="0 0 400 60">
          {operations.map((op, i) => (
            <React.Fragment key={i}>
              <rect
                x={i * 100 + 10}
                y={20}
                width={80}
                height={30}
                rx={4}
                fill={`${op.color}20`}
                stroke={op.color}
              />
              <text
                x={i * 100 + 50}
                y={40}
                textAnchor="middle"
                fill={op.color}
                fontSize={10}
              >
                {op.name.substring(0, 8)}
              </text>
              {i < operations.length - 1 && (
                <path
                  d={`M ${i * 100 + 90} 35 L ${i * 100 + 110} 35`}
                  stroke={colors.textMuted}
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
              )}
            </React.Fragment>
          ))}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.textMuted} />
            </marker>
          </defs>
        </svg>
      </FlowRow>
    </DiagramContainer>
  );
};
