import React, { useState } from 'react';
import { DiagramContainer, FlowRow, colors, InteractiveValue } from '@primitives';

export const ModularClockDiagram: React.FC = () => {
  const [value, setValue] = useState(15);
  const modulus = 12;
  const result = value % modulus;

  const clockNumbers = Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i);

  return (
    <DiagramContainer title="Модулярная арифметика как часы">
      <FlowRow justify="space-around" style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <InteractiveValue
            value={value}
            onChange={setValue}
            min={0}
            max={36}
            label="Значение"
          />
        </div>
      </FlowRow>

      <FlowRow justify="center">
        <svg width="240" height="240" viewBox="0 0 240 240">
          {/* Clock face */}
          <circle
            cx="120"
            cy="120"
            r="100"
            fill="rgba(255, 255, 255, 0.03)"
            stroke={colors.border}
            strokeWidth="2"
          />

          {/* Clock numbers */}
          {clockNumbers.map((num, i) => {
            const angle = (i - 2) * 30 * (Math.PI / 180);
            const x = 120 + 80 * Math.cos(angle);
            const y = 120 + 80 * Math.sin(angle);
            const isResult = (result === 0 ? 12 : result) === num;

            return (
              <text
                key={num}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isResult ? colors.primary : colors.text}
                fontSize={isResult ? "18" : "14"}
                fontWeight={isResult ? "bold" : "normal"}
              >
                {num}
              </text>
            );
          })}

          {/* Clock hand */}
          <line
            x1="120"
            y1="120"
            x2={120 + 60 * Math.cos(((result === 0 ? 12 : result) - 3) * 30 * (Math.PI / 180))}
            y2={120 + 60 * Math.sin(((result === 0 ? 12 : result) - 3) * 30 * (Math.PI / 180))}
            stroke={colors.primary}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx="120" cy="120" r="5" fill={colors.primary} />
        </svg>
      </FlowRow>

      <div style={{
        textAlign: 'center',
        marginTop: '16px',
        fontFamily: 'monospace',
        fontSize: '18px',
        color: colors.text,
      }}>
        <span style={{ color: colors.textMuted }}>{value}</span>
        <span style={{ color: colors.textMuted }}> mod </span>
        <span style={{ color: colors.textMuted }}>{modulus}</span>
        <span style={{ color: colors.textMuted }}> = </span>
        <span style={{ color: colors.primary, fontWeight: 'bold' }}>
          {result === 0 ? 12 : result}
        </span>
      </div>
    </DiagramContainer>
  );
};
