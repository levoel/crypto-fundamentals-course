import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, Arrow, colors, CodeBlock } from '@primitives';

export const P2PKHDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Pay-to-PubKey-Hash (P2PKH)">
      <div style={{
        padding: '16px',
        background: `${colors.info}10`,
        border: `1px solid ${colors.info}`,
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: colors.info, fontWeight: 'bold' }}>
          P2PKH - классический формат Bitcoin транзакций
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
          Адрес начинается с "1" (например: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa)
        </div>
      </div>

      <FlowColumn gap={24}>
        {/* Spending Process */}
        <FlowRow justify="center" gap={24} wrap={false}>
          {/* scriptSig (unlocking script) */}
          <div style={{
            flex: 1,
            padding: '16px',
            background: `${colors.primary}15`,
            border: `2px solid ${colors.primary}`,
            borderRadius: '12px',
          }}>
            <div style={{
              fontSize: '13px',
              color: colors.primary,
              fontWeight: 'bold',
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              scriptSig (Unlocking)
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.textMuted,
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              Предоставляется отправителем
            </div>

            <CodeBlock>
              {'<signature> <publicKey>'}
            </CodeBlock>

            <FlowColumn gap={8} style={{ marginTop: '12px' }}>
              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                fontSize: '10px',
              }}>
                <div style={{ color: colors.accent, fontWeight: 'bold' }}>
                  signature
                </div>
                <div style={{ color: colors.textMuted, marginTop: '4px' }}>
                  ECDSA подпись транзакции
                </div>
              </div>

              <div style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '6px',
                fontSize: '10px',
              }}>
                <div style={{ color: colors.accent, fontWeight: 'bold' }}>
                  publicKey
                </div>
                <div style={{ color: colors.textMuted, marginTop: '4px' }}>
                  Публичный ключ отправителя
                </div>
              </div>
            </FlowColumn>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '24px',
            color: colors.accent,
          }}>
            +
          </div>

          {/* scriptPubKey (locking script) */}
          <div style={{
            flex: 1,
            padding: '16px',
            background: `${colors.secondary}15`,
            border: `2px solid ${colors.secondary}`,
            borderRadius: '12px',
          }}>
            <div style={{
              fontSize: '13px',
              color: colors.secondary,
              fontWeight: 'bold',
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              scriptPubKey (Locking)
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.textMuted,
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              В предыдущей транзакции
            </div>

            <CodeBlock>
              {'OP_DUP\nOP_HASH160\n<pubKeyHash>\nOP_EQUALVERIFY\nOP_CHECKSIG'}
            </CodeBlock>

            <div style={{
              marginTop: '12px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              fontSize: '10px',
            }}>
              <div style={{ color: colors.accent, fontWeight: 'bold', marginBottom: '4px' }}>
                pubKeyHash
              </div>
              <div style={{ color: colors.textMuted }}>
                HASH160(publicKey) получателя
              </div>
              <div style={{
                marginTop: '6px',
                fontFamily: 'monospace',
                fontSize: '9px',
                color: colors.text,
                wordBreak: 'break-all',
              }}>
                62e907b15cbf27d5425399ebf6f0fb50ebb88f18
              </div>
            </div>
          </div>
        </FlowRow>

        <Arrow direction="down" color={colors.accent} />

        {/* Combined Script Execution */}
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
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            Объединённый скрипт
          </div>

          <CodeBlock>
            {'<signature> <publicKey> OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG'}
          </CodeBlock>

          <div style={{ marginTop: '16px' }}>
            <div style={{
              fontSize: '11px',
              color: colors.info,
              fontWeight: 'bold',
              marginBottom: '12px',
            }}>
              Процесс валидации:
            </div>

            <FlowColumn gap={8}>
              {[
                { step: '1', text: 'Push <signature> на стек' },
                { step: '2', text: 'Push <publicKey> на стек' },
                { step: '3', text: 'OP_DUP дублирует publicKey' },
                { step: '4', text: 'OP_HASH160 хеширует верхний publicKey' },
                { step: '5', text: 'Push <pubKeyHash> на стек' },
                { step: '6', text: 'OP_EQUALVERIFY проверяет совпадение хешей' },
                { step: '7', text: 'OP_CHECKSIG проверяет подпись' },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: `${colors.accent}30`,
                    border: `1px solid ${colors.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: colors.accent,
                  }}>
                    {item.step}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.text }}>
                    {item.text}
                  </div>
                </div>
              ))}
            </FlowColumn>
          </div>
        </div>

        {/* Result */}
        <FlowRow justify="center" gap={32}>
          <div style={{
            padding: '16px 32px',
            background: `${colors.success}20`,
            border: `2px solid ${colors.success}`,
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: colors.success,
              textAlign: 'center',
            }}>
              Результат: TRUE
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.textMuted,
              marginTop: '4px',
              textAlign: 'center',
            }}>
              Транзакция валидна
            </div>
          </div>

          <div style={{
            padding: '16px 32px',
            background: `${colors.danger}20`,
            border: `2px solid ${colors.danger}`,
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: colors.danger,
              textAlign: 'center',
            }}>
              Результат: FALSE
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.textMuted,
              marginTop: '4px',
              textAlign: 'center',
            }}>
              Транзакция отклонена
            </div>
          </div>
        </FlowRow>
      </FlowColumn>
    </DiagramContainer>
  );
};
