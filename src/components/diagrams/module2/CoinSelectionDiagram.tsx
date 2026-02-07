import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const CoinSelectionDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Выбор монет (Coin Selection)">
      <FlowColumn gap={24}>
        {/* Available UTXOs */}
        <div>
          <div style={{
            fontSize: '12px',
            color: colors.textMuted,
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            Доступные UTXO в кошельке
          </div>
          <FlowRow justify="center" gap={12}>
            <FlowNode variant="success" size="sm">
              #1: 0.5 BTC
            </FlowNode>
            <FlowNode variant="success" size="sm">
              #2: 0.3 BTC
            </FlowNode>
            <FlowNode variant="success" size="sm">
              #3: 0.15 BTC
            </FlowNode>
            <FlowNode variant="success" size="sm">
              #4: 0.05 BTC
            </FlowNode>
            <FlowNode variant="success" size="sm">
              #5: 0.02 BTC
            </FlowNode>
          </FlowRow>
        </div>

        {/* Payment Goal */}
        <div style={{
          padding: '16px',
          background: `${colors.warning}15`,
          border: `2px solid ${colors.warning}`,
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '14px', color: colors.warning, fontWeight: 'bold' }}>
            Цель: отправить 0.7 BTC
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
            Комиссия: 0.001 BTC за вход
          </div>
        </div>

        <Arrow direction="down" color={colors.accent} />

        {/* Selection Algorithm */}
        <div style={{
          padding: '20px',
          background: `${colors.primary}10`,
          border: `1px solid ${colors.primary}`,
          borderRadius: '12px',
        }}>
          <div style={{
            fontSize: '13px',
            color: colors.primary,
            fontWeight: 'bold',
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            Алгоритм выбора
          </div>

          <FlowColumn gap={12}>
            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '11px', color: colors.text, marginBottom: '8px' }}>
                <strong style={{ color: colors.accent }}>1. Largest First:</strong>
              </div>
              <FlowRow gap={8} justify="start">
                <FlowNode variant="primary" size="sm">
                  #1: 0.5 BTC
                </FlowNode>
                <div style={{ fontSize: '16px', color: colors.textMuted }}>+</div>
                <FlowNode variant="primary" size="sm">
                  #2: 0.3 BTC
                </FlowNode>
                <div style={{ fontSize: '16px', color: colors.textMuted }}>=</div>
                <div style={{ fontSize: '12px', color: colors.success, fontFamily: 'monospace' }}>
                  0.8 BTC
                </div>
              </FlowRow>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px' }}>
                Выбраны 2 входа, комиссия: 0.002 BTC
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '11px', color: colors.text, marginBottom: '8px' }}>
                <strong style={{ color: colors.accent }}>2. Smallest First (опционально):</strong>
              </div>
              <FlowRow gap={8} justify="start" wrap={true}>
                <FlowNode variant="secondary" size="sm">
                  #5: 0.02
                </FlowNode>
                <div style={{ fontSize: '14px', color: colors.textMuted }}>+</div>
                <FlowNode variant="secondary" size="sm">
                  #4: 0.05
                </FlowNode>
                <div style={{ fontSize: '14px', color: colors.textMuted }}>+</div>
                <FlowNode variant="secondary" size="sm">
                  #3: 0.15
                </FlowNode>
                <div style={{ fontSize: '14px', color: colors.textMuted }}>+</div>
                <FlowNode variant="secondary" size="sm">
                  #1: 0.5
                </FlowNode>
                <div style={{ fontSize: '14px', color: colors.textMuted }}>+</div>
                <FlowNode variant="secondary" size="sm">
                  #2: 0.3
                </FlowNode>
              </FlowRow>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px' }}>
                Выбраны 5 входов, комиссия: 0.005 BTC (дороже!)
              </div>
            </div>
          </FlowColumn>
        </div>

        <Arrow direction="down" color={colors.accent} />

        {/* Result Transaction */}
        <div style={{
          padding: '20px',
          background: `${colors.success}10`,
          border: `2px solid ${colors.success}`,
          borderRadius: '12px',
        }}>
          <div style={{
            fontSize: '13px',
            color: colors.success,
            fontWeight: 'bold',
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            Результат транзакции
          </div>

          <Grid columns={3} gap={16}>
            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
                Входы
              </div>
              <FlowColumn gap={6}>
                <FlowNode size="sm">
                  0.5 BTC
                </FlowNode>
                <FlowNode size="sm">
                  0.3 BTC
                </FlowNode>
                <div style={{
                  marginTop: '4px',
                  fontSize: '11px',
                  color: colors.success,
                  fontFamily: 'monospace',
                }}>
                  Всего: 0.8 BTC
                </div>
              </FlowColumn>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
                Выходы
              </div>
              <FlowColumn gap={6}>
                <FlowNode variant="warning" size="sm">
                  Платёж: 0.7
                </FlowNode>
                <FlowNode variant="secondary" size="sm">
                  Сдача: 0.098
                </FlowNode>
              </FlowColumn>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
                Комиссия
              </div>
              <FlowNode variant="danger" size="sm">
                0.002 BTC
              </FlowNode>
              <div style={{
                marginTop: '8px',
                fontSize: '10px',
                color: colors.textMuted,
              }}>
                2 входа × 0.001
              </div>
            </div>
          </Grid>
        </div>

        {/* Strategy Notes */}
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '12px', color: colors.info, fontWeight: 'bold', marginBottom: '8px' }}>
            Стратегии выбора
          </div>
          <FlowRow justify="space-around" gap={16}>
            {[
              { name: 'Largest First', pro: 'Меньше комиссий', con: 'Хуже приватность' },
              { name: 'Smallest First', pro: 'Очистка мелких UTXO', con: 'Больше комиссий' },
              { name: 'Random', pro: 'Лучше приватность', con: 'Непредсказуемые комиссии' },
            ].map((strategy, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '10px' }}>
                <div style={{ color: colors.accent, fontWeight: 'bold', marginBottom: '4px' }}>
                  {strategy.name}
                </div>
                <div style={{ color: colors.success }}>+ {strategy.pro}</div>
                <div style={{ color: colors.danger }}>- {strategy.con}</div>
              </div>
            ))}
          </FlowRow>
        </div>
      </FlowColumn>
    </DiagramContainer>
  );
};
