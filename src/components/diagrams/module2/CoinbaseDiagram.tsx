import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, Arrow, colors } from '@primitives';

export const CoinbaseDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Coinbase транзакция">
      <div style={{
        padding: '16px',
        background: `${colors.success}10`,
        border: `1px solid ${colors.success}`,
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: colors.success, fontWeight: 'bold' }}>
          Coinbase - первая транзакция в каждом блоке
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
          Создаёт новые биткоины (block reward) и собирает комиссии за транзакции
        </div>
      </div>

      {/* Main structure */}
      <FlowRow justify="center" gap={32} wrap={false}>
        {/* No Inputs - Special case */}
        <div style={{
          flex: 1,
          padding: '20px',
          background: `${colors.danger}15`,
          border: `2px solid ${colors.danger}`,
          borderRadius: '12px',
          minWidth: '200px',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: colors.danger,
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            Входы (Inputs)
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '8px',
            }}>
              ∅
            </div>
            <div style={{
              fontSize: '12px',
              color: colors.danger,
              fontWeight: 'bold',
            }}>
              НЕТ ВХОДОВ
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            fontSize: '10px',
          }}>
            <div style={{ color: colors.text, marginBottom: '8px' }}>
              <strong>Вместо UTXO:</strong>
            </div>
            <div style={{ color: colors.textMuted, lineHeight: '1.5' }}>
              • prev_hash = 0x00...00<br />
              • prev_index = 0xFFFFFFFF<br />
              • Особый "null" вход
            </div>
          </div>

          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: `${colors.info}15`,
            borderRadius: '8px',
            fontSize: '10px',
          }}>
            <div style={{ color: colors.info, fontWeight: 'bold', marginBottom: '4px' }}>
              Coinbase Data:
            </div>
            <div style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: '9px' }}>
              Произвольные данные (до 100 байт)
            </div>
            <div style={{ color: colors.text, marginTop: '6px', fontSize: '9px' }}>
              Может содержать: высоту блока, extra nonce, сообщения
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            padding: '12px 20px',
            background: `${colors.primary}20`,
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: colors.primary,
            textAlign: 'center',
          }}>
            Coinbase<br />Transaction
          </div>
          <Arrow direction="right" color={colors.accent} />
        </div>

        {/* Outputs - Block Reward + Fees */}
        <div style={{
          flex: 1,
          padding: '20px',
          background: `${colors.success}15`,
          border: `2px solid ${colors.success}`,
          borderRadius: '12px',
          minWidth: '200px',
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: colors.success,
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            Выходы (Outputs)
          </div>

          {/* Block Reward */}
          <div style={{
            padding: '12px',
            background: `${colors.warning}20`,
            border: `1px solid ${colors.warning}`,
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '11px',
              color: colors.warning,
              fontWeight: 'bold',
              marginBottom: '6px',
            }}>
              Block Reward
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: colors.warning,
              fontFamily: 'monospace',
              marginBottom: '6px',
            }}>
              3.125 BTC
            </div>
            <div style={{
              fontSize: '9px',
              color: colors.textMuted,
            }}>
              Halving #4 (2024)
            </div>
          </div>

          {/* Transaction Fees */}
          <div style={{
            padding: '12px',
            background: `${colors.accent}20`,
            border: `1px solid ${colors.accent}`,
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            <div style={{
              fontSize: '11px',
              color: colors.accent,
              fontWeight: 'bold',
              marginBottom: '6px',
            }}>
              Transaction Fees
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: colors.accent,
              fontFamily: 'monospace',
              marginBottom: '6px',
            }}>
              + 0.15 BTC
            </div>
            <div style={{
              fontSize: '9px',
              color: colors.textMuted,
            }}>
              Сумма комиссий блока
            </div>
          </div>

          {/* Total */}
          <div style={{
            padding: '12px',
            background: `${colors.success}30`,
            border: `2px solid ${colors.success}`,
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '11px',
              color: colors.textMuted,
              marginBottom: '4px',
            }}>
              Всего майнеру:
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: colors.success,
              fontFamily: 'monospace',
            }}>
              3.275 BTC
            </div>
          </div>
        </div>
      </FlowRow>

      {/* Halving schedule */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
      }}>
        <div style={{
          fontSize: '12px',
          color: colors.warning,
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          График Halving (уменьшение награды в 2 раза каждые 210,000 блоков)
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          {[
            { period: '2009-2012', reward: '50 BTC', halving: 0 },
            { period: '2012-2016', reward: '25 BTC', halving: 1 },
            { period: '2016-2020', reward: '12.5 BTC', halving: 2 },
            { period: '2020-2024', reward: '6.25 BTC', halving: 3 },
            { period: '2024-2028', reward: '3.125 BTC', halving: 4, current: true },
            { period: '2028-2032', reward: '1.5625 BTC', halving: 5 },
            { period: '~2140', reward: '0 BTC', halving: 'Final', final: true },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                background: item.current
                  ? `${colors.success}20`
                  : item.final
                  ? `${colors.danger}15`
                  : 'rgba(255, 255, 255, 0.03)',
                border: item.current
                  ? `2px solid ${colors.success}`
                  : item.final
                  ? `2px solid ${colors.danger}`
                  : `1px solid ${colors.border}`,
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '10px',
                color: colors.textMuted,
                marginBottom: '6px',
              }}>
                {item.period}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: item.current ? colors.success : item.final ? colors.danger : colors.warning,
                fontFamily: 'monospace',
                marginBottom: '4px',
              }}>
                {item.reward}
              </div>
              <div style={{
                fontSize: '9px',
                color: colors.textMuted,
              }}>
                {item.current ? 'Текущий' : item.final ? 'Финал' : `Halving #${item.halving}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special notes */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: `${colors.info}10`,
        border: `1px solid ${colors.info}`,
        borderRadius: '8px',
      }}>
        <div style={{
          fontSize: '11px',
          color: colors.info,
          fontWeight: 'bold',
          marginBottom: '12px',
        }}>
          Особенности Coinbase транзакций:
        </div>

        <FlowColumn gap={8}>
          {[
            'Всегда первая транзакция в блоке',
            'Не имеет входов (создаёт новые монеты из "воздуха")',
            'Выход может быть потрачен только после 100 подтверждений',
            'Содержит высоту блока с BIP34 (начиная с блока 227,836)',
            'Может содержать произвольные данные в coinbase data',
            'Genesis block coinbase навсегда неизрасходован (баг/фича)',
          ].map((note, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                fontSize: '10px',
                color: colors.text,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <div style={{
                minWidth: '6px',
                height: '6px',
                borderRadius: '50%',
                background: colors.info,
                marginTop: '5px',
              }} />
              {note}
            </div>
          ))}
        </FlowColumn>
      </div>

      {/* Famous coinbase messages */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: `${colors.primary}10`,
        border: `1px solid ${colors.primary}`,
        borderRadius: '8px',
      }}>
        <div style={{
          fontSize: '11px',
          color: colors.primary,
          fontWeight: 'bold',
          marginBottom: '8px',
        }}>
          Известные сообщения в coinbase:
        </div>
        <div style={{
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: colors.text,
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: colors.accent }}>Block 0 (Genesis):</strong><br />
            "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
          </div>
          <div>
            <strong style={{ color: colors.accent }}>Block 666,666:</strong><br />
            "₿ 666666 ₿ Behold, the number of a beast! 🤘"
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
};
