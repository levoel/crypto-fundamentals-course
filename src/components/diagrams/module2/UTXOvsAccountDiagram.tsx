import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, Grid, colors } from '@primitives';

export const UTXOvsAccountDiagram: React.FC = () => {
  return (
    <DiagramContainer title="UTXO vs Account модель">
      <Grid columns={2} gap={24}>
        {/* UTXO Model (Bitcoin) */}
        <div
          style={{
            padding: '20px',
            background: `${colors.primary}10`,
            border: `2px solid ${colors.primary}`,
            borderRadius: '12px',
          }}
        >
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            UTXO Model
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.accent,
            marginBottom: '12px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            Bitcoin
          </div>

          <FlowColumn gap={12} align="start">
            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              width: '100%',
            }}>
              <div style={{ fontSize: '12px', color: colors.success, fontWeight: 'bold', marginBottom: '8px' }}>
                Неизрасходованные выходы
              </div>
              <div style={{ fontSize: '11px', color: colors.text, fontFamily: 'monospace' }}>
                • UTXO #1: 0.5 BTC<br />
                • UTXO #2: 0.3 BTC<br />
                • UTXO #3: 0.2 BTC
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              width: '100%',
            }}>
              <div style={{ fontSize: '12px', color: colors.warning, fontWeight: 'bold', marginBottom: '8px' }}>
                Выбор монет
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>
                • Явный выбор UTXO для траты<br />
                • Нет единого баланса<br />
                • Требуется "сдача"
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              width: '100%',
            }}>
              <div style={{ fontSize: '12px', color: colors.info, fontWeight: 'bold', marginBottom: '8px' }}>
                Особенности
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>
                • Лучшая приватность<br />
                • Параллельные транзакции<br />
                • Сложнее работать
              </div>
            </div>
          </FlowColumn>
        </div>

        {/* Account Model (Ethereum) */}
        <div
          style={{
            padding: '20px',
            background: `${colors.secondary}10`,
            border: `2px solid ${colors.secondary}`,
            borderRadius: '12px',
          }}
        >
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: colors.secondary,
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            Account Model
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.accent,
            marginBottom: '12px',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            Ethereum
          </div>

          <FlowColumn gap={12} align="start">
            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              width: '100%',
            }}>
              <div style={{ fontSize: '12px', color: colors.success, fontWeight: 'bold', marginBottom: '8px' }}>
                Баланс счёта
              </div>
              <div style={{ fontSize: '11px', color: colors.text, fontFamily: 'monospace' }}>
                Адрес: 0x742d...4f1e<br />
                Баланс: 1.0 ETH<br />
                Nonce: 42
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              width: '100%',
            }}>
              <div style={{ fontSize: '12px', color: colors.warning, fontWeight: 'bold', marginBottom: '8px' }}>
                Отслеживание баланса
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>
                • Единый баланс счёта<br />
                • Nonce предотвращает replay<br />
                • Нет "сдачи"
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              width: '100%',
            }}>
              <div style={{ fontSize: '12px', color: colors.info, fontWeight: 'bold', marginBottom: '8px' }}>
                Особенности
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>
                • Проще использовать<br />
                • Последовательные транзакции<br />
                • Меньше приватности
              </div>
            </div>
          </FlowColumn>
        </div>
      </Grid>

      {/* Comparison Summary */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
      }}>
        <FlowRow justify="space-around" gap={32}>
          {[
            { label: 'Приватность', utxo: '+++', account: '+', color: colors.success },
            { label: 'Удобство', utxo: '+', account: '+++', color: colors.warning },
            { label: 'Параллелизм', utxo: '+++', account: '+', color: colors.info },
            { label: 'Простота', utxo: '+', account: '+++', color: colors.accent },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>
                {item.label}
              </div>
              <FlowRow justify="center" gap={8}>
                <div style={{
                  fontSize: '14px',
                  color: colors.primary,
                  fontFamily: 'monospace',
                }}>
                  {item.utxo}
                </div>
                <div style={{ color: colors.textMuted }}>vs</div>
                <div style={{
                  fontSize: '14px',
                  color: colors.secondary,
                  fontFamily: 'monospace',
                }}>
                  {item.account}
                </div>
              </FlowRow>
            </div>
          ))}
        </FlowRow>
      </div>
    </DiagramContainer>
  );
};
