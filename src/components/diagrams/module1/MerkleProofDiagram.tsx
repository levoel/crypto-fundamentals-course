import React from 'react';
import { DiagramContainer, FlowRow, colors } from '@primitives';

export const MerkleProofDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Merkle Proof: Доказательство включения">
      <svg width="100%" height="300" viewBox="0 0 500 300">
        {/* Lines */}
        <line x1="250" y1="40" x2="130" y2="100" stroke={colors.border} strokeWidth="1" />
        <line x1="250" y1="40" x2="370" y2="100" stroke={colors.success} strokeWidth="2" />
        <line x1="130" y1="120" x2="70" y2="180" stroke={colors.border} strokeWidth="1" />
        <line x1="130" y1="120" x2="190" y2="180" stroke={colors.border} strokeWidth="1" />
        <line x1="370" y1="120" x2="310" y2="180" stroke={colors.success} strokeWidth="2" />
        <line x1="370" y1="120" x2="430" y2="180" stroke={colors.border} strokeWidth="1" />

        {/* Root (verified) */}
        <rect x="200" y="20" width="100" height="35" rx="6" fill={`${colors.success}30`} stroke={colors.success} strokeWidth="2" />
        <text x="250" y="42" textAnchor="middle" fill={colors.success} fontSize="11" fontWeight="bold">
          Root ✓
        </text>

        {/* Level 1 */}
        {/* Left child - provided in proof */}
        <rect x="80" y="95" width="100" height="35" rx="6" fill={`${colors.warning}20`} stroke={colors.warning} strokeWidth="2" strokeDasharray="4" />
        <text x="130" y="117" textAnchor="middle" fill={colors.warning} fontSize="10">
          Proof[1] 📋
        </text>

        {/* Right child - computed */}
        <rect x="320" y="95" width="100" height="35" rx="6" fill={`${colors.accent}20`} stroke={colors.accent} strokeWidth="2" />
        <text x="370" y="117" textAnchor="middle" fill={colors.accent} fontSize="10">
          Computed
        </text>

        {/* Leaves */}
        {/* Tx3 - the one we're proving */}
        <rect x="270" y="170" width="80" height="35" rx="6" fill={`${colors.primary}30`} stroke={colors.primary} strokeWidth="2" />
        <text x="310" y="192" textAnchor="middle" fill={colors.primary} fontSize="10" fontWeight="bold">
          H(Tx3) ◀
        </text>

        {/* Tx4 - provided in proof */}
        <rect x="390" y="170" width="80" height="35" rx="6" fill={`${colors.warning}20`} stroke={colors.warning} strokeWidth="2" strokeDasharray="4" />
        <text x="430" y="192" textAnchor="middle" fill={colors.warning} fontSize="10">
          Proof[0] 📋
        </text>

        {/* Grayed out nodes */}
        <rect x="30" y="170" width="80" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke={colors.border} opacity="0.3" />
        <text x="70" y="192" textAnchor="middle" fill={colors.textMuted} fontSize="10" opacity="0.3">
          H(Tx1)
        </text>
        <rect x="150" y="170" width="80" height="35" rx="6" fill="rgba(255,255,255,0.02)" stroke={colors.border} opacity="0.3" />
        <text x="190" y="192" textAnchor="middle" fill={colors.textMuted} fontSize="10" opacity="0.3">
          H(Tx2)
        </text>

        {/* Arrow showing verification path */}
        <path d="M 310 170 L 310 145 L 350 135" stroke={colors.success} strokeWidth="1.5" fill="none" markerEnd="url(#arrowMerkle)" />
      </svg>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginTop: '16px',
      }}>
        <div style={{
          padding: '12px',
          background: `${colors.primary}10`,
          border: `1px solid ${colors.primary}30`,
          borderRadius: '8px',
        }}>
          <div style={{ color: colors.primary, fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            ◀ Доказываем включение Tx3
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Знаем хеш транзакции H(Tx3)
          </div>
        </div>
        <div style={{
          padding: '12px',
          background: `${colors.warning}10`,
          border: `1px solid ${colors.warning}30`,
          borderRadius: '8px',
        }}>
          <div style={{ color: colors.warning, fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            📋 Proof = 2 хеша
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Вместо всех 4 транзакций — только 2 хеша (log₂ 4)
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '12px',
      }}>
        <div style={{ color: colors.success, marginBottom: '4px' }}>Путь верификации:</div>
        <div style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: '11px' }}>
          1. computed = H(H(Tx3) || Proof[0])
          <br />
          2. root = H(Proof[1] || computed)
          <br />
          3. root == known_root? → ✓ Tx3 включена!
        </div>
      </div>
    </DiagramContainer>
  );
};
