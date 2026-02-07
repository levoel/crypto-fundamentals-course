import React from 'react';
import { DiagramContainer, FlowRow, colors } from '@primitives';

export const PointAdditionDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Сложение точек на эллиптической кривой">
      <FlowRow justify="center">
        <svg width="400" height="300" viewBox="-4 -4 8 8">
          {/* Grid */}
          <line x1="-4" y1="0" x2="4" y2="0" stroke={colors.border} strokeWidth="0.02" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke={colors.border} strokeWidth="0.02" />

          {/* Curve y² = x³ - x + 1 */}
          {(() => {
            const points: { x: number; y: number }[] = [];
            for (let x = -2; x <= 3; x += 0.05) {
              const ySquared = x * x * x - x + 1;
              if (ySquared >= 0) {
                const y = Math.sqrt(ySquared);
                points.push({ x, y });
                points.push({ x, y: -y });
              }
            }
            return points.map((p, i) => (
              <circle key={i} cx={p.x} cy={-p.y} r="0.03" fill={colors.textMuted} opacity="0.5" />
            ));
          })()}

          {/* Points P, Q, R */}
          <circle cx={-1} cy={-1} r="0.15" fill={colors.primary} />
          <text x={-1} y={-1.4} textAnchor="middle" fill={colors.primary} fontSize="0.4">P</text>

          <circle cx={0.5} cy={-1.3} r="0.15" fill={colors.secondary} />
          <text x={0.5} y={-1.7} textAnchor="middle" fill={colors.secondary} fontSize="0.4">Q</text>

          {/* Line through P and Q */}
          <line x1={-2} y1={-0.55} x2={2.5} y2={-2.05} stroke={colors.accent} strokeWidth="0.03" strokeDasharray="0.1" />

          {/* Intersection point R' */}
          <circle cx={2} cy={-1.85} r="0.12" fill="none" stroke={colors.warning} strokeWidth="0.03" />
          <text x={2.3} y={-1.85} fill={colors.warning} fontSize="0.35">R'</text>

          {/* Reflection */}
          <line x1={2} y1={-1.85} x2={2} y2={1.85} stroke={colors.warning} strokeWidth="0.02" strokeDasharray="0.1" />

          {/* Result point R = P + Q */}
          <circle cx={2} cy={1.85} r="0.15" fill={colors.success} />
          <text x={2.3} y={1.85} fill={colors.success} fontSize="0.4">R = P+Q</text>

          {/* Labels */}
          <text x={-3.5} y={-3.5} fill={colors.text} fontSize="0.3">y² = x³ - x + 1</text>
        </svg>
      </FlowRow>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: '16px',
      }}>
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
          textAlign: 'center',
        }}>
          <div style={{ color: colors.primary, fontWeight: 'bold', fontSize: '12px' }}>1. Провести прямую</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>через P и Q</div>
        </div>
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
          textAlign: 'center',
        }}>
          <div style={{ color: colors.warning, fontWeight: 'bold', fontSize: '12px' }}>2. Найти R'</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>третья точка пересечения</div>
        </div>
        <div style={{
          padding: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
          textAlign: 'center',
        }}>
          <div style={{ color: colors.success, fontWeight: 'bold', fontSize: '12px' }}>3. Отразить</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>R = -R' (по оси X)</div>
        </div>
      </div>
    </DiagramContainer>
  );
};
