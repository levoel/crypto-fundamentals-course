import React, { useState, useEffect } from 'react';
import { DiagramContainer, FlowRow, colors } from '@primitives';

export const EllipticCurveDiagram: React.FC = () => {
  const [a, setA] = useState(0);
  const [b, setB] = useState(7);

  // Generate curve points for visualization
  const generateCurvePoints = (a: number, b: number) => {
    const points: { x: number; y: number }[] = [];
    for (let x = -3; x <= 3; x += 0.05) {
      const ySquared = x * x * x + a * x + b;
      if (ySquared >= 0) {
        const y = Math.sqrt(ySquared);
        points.push({ x, y });
        points.push({ x, y: -y });
      }
    }
    return points;
  };

  const points = generateCurvePoints(a, b);

  return (
    <DiagramContainer title="Эллиптическая кривая: y² = x³ + ax + b">
      <FlowRow justify="space-around" gap={24}>
        {/* Controls */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
              a = {a}
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              style={{ width: '150px', accentColor: colors.primary }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: colors.textMuted, display: 'block', marginBottom: '4px' }}>
              b = {b}
            </label>
            <input
              type="range"
              min="-5"
              max="10"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              style={{ width: '150px', accentColor: colors.primary }}
            />
          </div>
          <div style={{
            marginTop: '16px',
            padding: '8px 12px',
            background: `${colors.primary}15`,
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: colors.primary,
          }}>
            y² = x³ + {a}x + {b}
          </div>
        </div>

        {/* Curve visualization */}
        <svg width="280" height="280" viewBox="-4 -4 8 8">
          {/* Grid */}
          <line x1="-4" y1="0" x2="4" y2="0" stroke={colors.border} strokeWidth="0.02" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke={colors.border} strokeWidth="0.02" />

          {/* Grid lines */}
          {[-3, -2, -1, 1, 2, 3].map(n => (
            <g key={n}>
              <line x1={n} y1="-4" x2={n} y2="4" stroke={colors.border} strokeWidth="0.01" opacity="0.3" />
              <line x1="-4" y1={n} x2="4" y2={n} stroke={colors.border} strokeWidth="0.01" opacity="0.3" />
            </g>
          ))}

          {/* Curve */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={-p.y}
              r="0.04"
              fill={colors.primary}
            />
          ))}

          {/* Example point */}
          <circle
            cx={1}
            cy={-Math.sqrt(1 + a + b)}
            r="0.12"
            fill={colors.accent}
            stroke={colors.text}
            strokeWidth="0.02"
          />
        </svg>
      </FlowRow>

      <div style={{
        marginTop: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
        }}>
          <div style={{ color: colors.primary, fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            secp256k1 (Bitcoin)
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            a = 0, b = 7
          </div>
        </div>
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
        }}>
          <div style={{ color: colors.secondary, fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            Curve25519
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Montgomery форма
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
};
