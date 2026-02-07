import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, colors } from '@primitives';

export const SHA256RoundDiagram: React.FC = () => {
  const registers = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <DiagramContainer title="Один раунд SHA-256">
      <svg width="100%" height="320" viewBox="0 0 500 320">
        {/* Input registers */}
        {registers.map((reg, i) => (
          <g key={reg}>
            <rect
              x={50 + i * 50}
              y={20}
              width={40}
              height={30}
              rx={4}
              fill={`${colors.primary}20`}
              stroke={colors.primary}
              strokeWidth={1}
            />
            <text
              x={70 + i * 50}
              y={40}
              textAnchor="middle"
              fill={colors.text}
              fontSize={14}
            >
              {reg}
            </text>
          </g>
        ))}

        {/* Σ₁ operation */}
        <rect x={330} y={70} width={60} height={30} rx={4} fill={`${colors.accent}20`} stroke={colors.accent} />
        <text x={360} y={90} textAnchor="middle" fill={colors.accent} fontSize={12}>Σ₁(e)</text>

        {/* Ch operation */}
        <rect x={330} y={110} width={60} height={30} rx={4} fill={`${colors.accent}20`} stroke={colors.accent} />
        <text x={360} y={130} textAnchor="middle" fill={colors.accent} fontSize={12}>Ch(e,f,g)</text>

        {/* T1 computation */}
        <rect x={410} y={90} width={50} height={50} rx={4} fill={`${colors.warning}20`} stroke={colors.warning} />
        <text x={435} y={120} textAnchor="middle" fill={colors.warning} fontSize={12}>T₁</text>

        {/* Σ₀ operation */}
        <rect x={50} y={110} width={60} height={30} rx={4} fill={`${colors.secondary}20`} stroke={colors.secondary} />
        <text x={80} y={130} textAnchor="middle" fill={colors.secondary} fontSize={12}>Σ₀(a)</text>

        {/* Maj operation */}
        <rect x={50} y={150} width={60} height={30} rx={4} fill={`${colors.secondary}20`} stroke={colors.secondary} />
        <text x={80} y={170} textAnchor="middle" fill={colors.secondary} fontSize={12}>Maj(a,b,c)</text>

        {/* T2 computation */}
        <rect x={50} y={190} width={50} height={50} rx={4} fill={`${colors.success}20`} stroke={colors.success} />
        <text x={75} y={220} textAnchor="middle" fill={colors.success} fontSize={12}>T₂</text>

        {/* K[t] and W[t] */}
        <rect x={420} y={150} width={40} height={25} rx={4} fill={`${colors.info}20`} stroke={colors.info} />
        <text x={440} y={167} textAnchor="middle" fill={colors.info} fontSize={10}>K[t]</text>

        <rect x={420} y={180} width={40} height={25} rx={4} fill={`${colors.info}20`} stroke={colors.info} />
        <text x={440} y={197} textAnchor="middle" fill={colors.info} fontSize={10}>W[t]</text>

        {/* Output registers */}
        {registers.map((reg, i) => (
          <g key={`out-${reg}`}>
            <rect
              x={50 + i * 50}
              y={270}
              width={40}
              height={30}
              rx={4}
              fill={`${colors.success}20`}
              stroke={colors.success}
              strokeWidth={1}
            />
            <text
              x={70 + i * 50}
              y={290}
              textAnchor="middle"
              fill={colors.text}
              fontSize={14}
            >
              {reg}'
            </text>
          </g>
        ))}

        {/* Arrows and connections - simplified */}
        <path d="M 70 50 L 70 270" stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4" fill="none" />
        <path d="M 120 50 L 70 270" stroke={colors.primary} strokeWidth={1} fill="none" />
        <path d="M 270 50 L 320 270" stroke={colors.primary} strokeWidth={1} fill="none" />
      </svg>

      <FlowRow justify="center" gap={24} style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '12px' }}>
          <span style={{ color: colors.warning }}>T₁</span>
          <span style={{ color: colors.textMuted }}> = h + Σ₁(e) + Ch(e,f,g) + K[t] + W[t]</span>
        </div>
        <div style={{ fontSize: '12px' }}>
          <span style={{ color: colors.success }}>T₂</span>
          <span style={{ color: colors.textMuted }}> = Σ₀(a) + Maj(a,b,c)</span>
        </div>
      </FlowRow>
    </DiagramContainer>
  );
};
