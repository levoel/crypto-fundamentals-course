import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const UTXODiagram: React.FC = () => {
  return (
    <DiagramContainer title="Модель UTXO">
      <FlowColumn gap={24}>
        {/* Previous Transaction Outputs */}
        <FlowRow justify="center" gap={32}>
          <FlowColumn gap={8}>
            <div style={{ fontSize: '11px', color: colors.textMuted, textAlign: 'center' }}>
              Предыдущие выходы
            </div>
            <FlowNode variant="success" size="md">
              UTXO #1<br />
              0.5 BTC
            </FlowNode>
            <FlowNode variant="success" size="md">
              UTXO #2<br />
              0.3 BTC
            </FlowNode>
          </FlowColumn>

          {/* Arrow to Transaction */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Arrow direction="right" label="Входы" color={colors.accent} />
          </div>

          {/* Transaction */}
          <div
            style={{
              padding: '20px',
              background: `${colors.primary}15`,
              border: `2px solid ${colors.primary}`,
              borderRadius: '12px',
              minWidth: '200px',
            }}
          >
            <div style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              Транзакция
            </div>

            <FlowColumn gap={12}>
              <div style={{ fontSize: '11px', color: colors.text }}>
                <strong>Входы (Inputs):</strong>
                <div style={{ marginLeft: '8px', marginTop: '4px', fontFamily: 'monospace', fontSize: '10px' }}>
                  • UTXO #1: 0.5 BTC<br />
                  • UTXO #2: 0.3 BTC<br />
                  <span style={{ color: colors.success }}>Всего: 0.8 BTC</span>
                </div>
              </div>

              <div style={{
                height: '1px',
                background: colors.border,
                margin: '4px 0',
              }} />

              <div style={{ fontSize: '11px', color: colors.text }}>
                <strong>Выходы (Outputs):</strong>
                <div style={{ marginLeft: '8px', marginTop: '4px', fontFamily: 'monospace', fontSize: '10px' }}>
                  • Получатель: 0.6 BTC<br />
                  • Сдача: 0.19 BTC<br />
                  • Комиссия: 0.01 BTC
                </div>
              </div>
            </FlowColumn>
          </div>

          {/* Arrow to New Outputs */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Arrow direction="right" label="Выходы" color={colors.accent} />
          </div>

          {/* New UTXO Outputs */}
          <FlowColumn gap={8}>
            <div style={{ fontSize: '11px', color: colors.textMuted, textAlign: 'center' }}>
              Новые UTXO
            </div>
            <FlowNode variant="warning" size="md">
              Получатель<br />
              0.6 BTC
            </FlowNode>
            <FlowNode variant="secondary" size="md">
              Сдача<br />
              0.19 BTC
            </FlowNode>
          </FlowColumn>
        </FlowRow>

        {/* Legend */}
        <FlowRow justify="center" gap={24} style={{ marginTop: '16px' }}>
          {[
            { label: 'Старые UTXO', desc: 'Потрачены (израсходованы)', color: colors.success },
            { label: 'Платёж', desc: 'Новый UTXO получателя', color: colors.warning },
            { label: 'Сдача', desc: 'Новый UTXO отправителя', color: colors.secondary },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
              }}
            >
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                background: `${item.color}40`,
                border: `1px solid ${item.color}`,
              }} />
              <div>
                <div style={{ color: item.color }}>{item.label}</div>
                <div style={{ color: colors.textMuted, fontSize: '10px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
};
