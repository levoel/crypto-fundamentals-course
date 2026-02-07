import React from 'react';
import { DiagramContainer, Grid, colors } from '@primitives';

export const ScriptTypesDiagram: React.FC = () => {
  const scriptTypes = [
    {
      name: 'P2PKH',
      fullName: 'Pay-to-PubKey-Hash',
      prefix: '1',
      example: '1A1zP1...DivfNa',
      color: colors.primary,
      description: 'Классический формат',
      features: ['Базовый тип', 'Наиболее распространён', 'Простой'],
      size: '~148 байт',
    },
    {
      name: 'P2SH',
      fullName: 'Pay-to-Script-Hash',
      prefix: '3',
      example: '3J98t1...3DpfZ',
      color: colors.secondary,
      description: 'Скрипт в скрипте',
      features: ['Multisig', 'Сложные условия', 'Меньше данных на блокчейне'],
      size: '~298 байт (2-of-3)',
    },
    {
      name: 'P2WPKH',
      fullName: 'Pay-to-Witness-PubKey-Hash',
      prefix: 'bc1q',
      example: 'bc1qw5...dfg',
      color: colors.accent,
      description: 'SegWit v0',
      features: ['Меньше комиссий', 'Исправление malleability', 'Native SegWit'],
      size: '~110 байт',
    },
    {
      name: 'P2WSH',
      fullName: 'Pay-to-Witness-Script-Hash',
      prefix: 'bc1q (длинный)',
      example: 'bc1qrp...xyz',
      color: colors.info,
      description: 'SegWit Script',
      features: ['SegWit Multisig', 'Сложные скрипты', 'Экономия места'],
      size: '~140 байт (2-of-3)',
    },
    {
      name: 'P2TR',
      fullName: 'Pay-to-Taproot',
      prefix: 'bc1p',
      example: 'bc1p5c...qrs',
      color: colors.success,
      description: 'Taproot (SegWit v1)',
      features: ['Schnorr подписи', 'Лучшая приватность', 'Гибкие скрипты'],
      size: '~110 байт',
    },
  ];

  return (
    <DiagramContainer title="Типы Bitcoin скриптов">
      <div style={{
        padding: '16px',
        background: `${colors.warning}10`,
        border: `1px solid ${colors.warning}`,
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: colors.warning, fontWeight: 'bold' }}>
          Эволюция форматов адресов Bitcoin
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
          От Legacy (P2PKH) до Taproot (P2TR)
        </div>
      </div>

      <Grid columns={1} gap={16}>
        {scriptTypes.map((type, i) => (
          <div
            key={i}
            style={{
              padding: '20px',
              background: `${type.color}10`,
              border: `2px solid ${type.color}`,
              borderRadius: '12px',
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '20px',
            }}>
              {/* Left: Name and Address */}
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: type.color,
                  marginBottom: '4px',
                }}>
                  {type.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: colors.textMuted,
                  marginBottom: '12px',
                }}>
                  {type.fullName}
                </div>

                <div style={{
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    fontSize: '10px',
                    color: colors.textMuted,
                    marginBottom: '6px',
                  }}>
                    Префикс адреса:
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: type.color,
                    fontFamily: 'monospace',
                  }}>
                    {type.prefix}
                  </div>
                </div>

                <div style={{
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: colors.text,
                  wordBreak: 'break-all',
                }}>
                  {type.example}
                </div>

                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  background: `${type.color}15`,
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: type.color,
                  textAlign: 'center',
                }}>
                  {type.size}
                </div>
              </div>

              {/* Right: Description and Features */}
              <div>
                <div style={{
                  fontSize: '12px',
                  color: colors.text,
                  marginBottom: '12px',
                  fontStyle: 'italic',
                }}>
                  {type.description}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: colors.info,
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}>
                  Особенности:
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  {type.features.map((feature, j) => (
                    <div
                      key={j}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: colors.text,
                      }}
                    >
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: type.color,
                      }} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Grid>

      {/* Comparison Table */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
      }}>
        <div style={{
          fontSize: '12px',
          color: colors.accent,
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          Сравнение характеристик
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}>
          {[
            { metric: 'Размер', winner: 'P2WPKH, P2TR', value: '~110 байт' },
            { metric: 'Комиссии', winner: 'P2WPKH, P2TR', value: 'Самые низкие' },
            { metric: 'Приватность', winner: 'P2TR', value: 'Schnorr + MAST' },
            { metric: 'Совместимость', winner: 'P2PKH, P2SH', value: 'Везде поддерживается' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: '11px',
                color: colors.textMuted,
                marginBottom: '6px',
              }}>
                {item.metric}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: colors.success,
                marginBottom: '4px',
              }}>
                {item.winner}
              </div>
              <div style={{
                fontSize: '10px',
                color: colors.textMuted,
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
};
