import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, colors, Grid } from '@primitives';

export const MultiProofDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Multi-proof: Доказательство нескольких элементов">
      <Grid columns={2} gap={24}>
        {/* Individual proofs */}
        <div style={{
          padding: '16px',
          background: `${colors.danger}10`,
          border: `1px solid ${colors.danger}30`,
          borderRadius: '8px',
        }}>
          <div style={{
            color: colors.danger,
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: '13px',
          }}>
            Отдельные proofs
          </div>
          <FlowColumn gap={8} align="start">
            <div style={{ fontSize: '11px', color: colors.textMuted }}>
              Proof для Tx1: 3 хеша
            </div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>
              Proof для Tx3: 3 хеша
            </div>
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: colors.text,
            }}>
              Итого: 6 хешей (192 байта)
            </div>
          </FlowColumn>
        </div>

        {/* Multi-proof */}
        <div style={{
          padding: '16px',
          background: `${colors.success}10`,
          border: `1px solid ${colors.success}30`,
          borderRadius: '8px',
        }}>
          <div style={{
            color: colors.success,
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: '13px',
          }}>
            Multi-proof
          </div>
          <FlowColumn gap={8} align="start">
            <div style={{ fontSize: '11px', color: colors.textMuted }}>
              Общий proof для Tx1 и Tx3
            </div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>
              Общие узлы не дублируются
            </div>
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: colors.text,
            }}>
              Итого: 4 хеша (128 байт)
            </div>
          </FlowColumn>
        </div>
      </Grid>

      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '12px', color: colors.text, marginBottom: '12px' }}>
          <strong>Применения multi-proof:</strong>
        </div>
        <FlowRow gap={16} justify="space-around">
          {[
            { title: 'Batch Airdrop', desc: 'Claim нескольких токенов за раз' },
            { title: 'Rollup Proofs', desc: 'Доказательство пакета транзакций' },
            { title: 'State Sync', desc: 'Синхронизация части state trie' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: colors.primary, fontSize: '12px', fontWeight: 'bold' }}>
                {item.title}
              </div>
              <div style={{ color: colors.textMuted, fontSize: '10px' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
