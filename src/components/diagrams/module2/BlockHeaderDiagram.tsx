import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, colors } from '@primitives';

export const BlockHeaderDiagram: React.FC = () => {
  const headerFields = [
    {
      name: 'Version',
      bytes: 4,
      color: colors.primary,
      description: 'Версия блока',
      example: '0x20000000',
      details: 'Указывает на правила консенсуса',
    },
    {
      name: 'Previous Hash',
      bytes: 32,
      color: colors.secondary,
      description: 'Хеш предыдущего блока',
      example: '0000000000000000000a...',
      details: 'Связывает блоки в цепь',
    },
    {
      name: 'Merkle Root',
      bytes: 32,
      color: colors.success,
      description: 'Корень дерева Меркла',
      example: '7d8b6d2f3a1e4c5b9a...',
      details: 'Хеш всех транзакций блока',
    },
    {
      name: 'Timestamp',
      bytes: 4,
      color: colors.warning,
      description: 'Время создания блока',
      example: '1644336000',
      details: 'Unix timestamp (секунды)',
    },
    {
      name: 'Bits (Difficulty)',
      bytes: 4,
      color: colors.info,
      description: 'Целевая сложность',
      example: '0x17034219',
      details: 'Компактное представление target',
    },
    {
      name: 'Nonce',
      bytes: 4,
      color: colors.accent,
      description: 'Число для майнинга',
      example: '0x1234abcd',
      details: 'Изменяется для поиска хеша',
    },
  ];

  const totalBytes = headerFields.reduce((sum, field) => sum + field.bytes, 0);

  return (
    <DiagramContainer title="Заголовок блока Bitcoin (80 байт)">
      <div style={{
        padding: '16px',
        background: `${colors.danger}10`,
        border: `1px solid ${colors.danger}`,
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: colors.danger, fontWeight: 'bold' }}>
          Block Header - 80 байт фиксированного размера
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
          SHA256(SHA256(header)) должен быть меньше целевой сложности (target)
        </div>
      </div>

      {/* Visual byte representation */}
      <div style={{
        marginBottom: '24px',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '12px',
      }}>
        <div style={{
          fontSize: '11px',
          color: colors.textMuted,
          marginBottom: '12px',
          textAlign: 'center',
        }}>
          Структура заголовка (всего {totalBytes} байт)
        </div>

        <FlowColumn gap={2}>
          {headerFields.map((field, i) => {
            const widthPercent = (field.bytes / totalBytes) * 100;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Field bar */}
                <div
                  style={{
                    flex: 1,
                    height: '40px',
                    background: `${field.color}30`,
                    border: `2px solid ${field.color}`,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: field.color,
                    zIndex: 1,
                  }}>
                    {field.name}
                  </div>
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    fontSize: '10px',
                    color: colors.textMuted,
                    fontFamily: 'monospace',
                  }}>
                    {field.bytes} bytes
                  </div>
                </div>
              </div>
            );
          })}
        </FlowColumn>
      </div>

      {/* Detailed field descriptions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {headerFields.map((field, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              background: `${field.color}10`,
              border: `1px solid ${field.color}`,
              borderRadius: '8px',
            }}
          >
            <FlowRow justify="space-between" align="center" style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: field.color,
              }}>
                {field.name}
              </div>
              <div style={{
                padding: '4px 8px',
                background: `${field.color}20`,
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: field.color,
              }}>
                {field.bytes} bytes
              </div>
            </FlowRow>

            <div style={{
              fontSize: '11px',
              color: colors.text,
              marginBottom: '8px',
            }}>
              {field.description}
            </div>

            <div style={{
              padding: '8px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '6px',
              marginBottom: '8px',
            }}>
              <div style={{
                fontSize: '9px',
                color: colors.textMuted,
                marginBottom: '4px',
              }}>
                Пример:
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                color: colors.text,
                wordBreak: 'break-all',
              }}>
                {field.example}
              </div>
            </div>

            <div style={{
              fontSize: '10px',
              color: colors.textMuted,
              fontStyle: 'italic',
            }}>
              {field.details}
            </div>
          </div>
        ))}
      </div>

      {/* Mining process note */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: `${colors.accent}10`,
        border: `2px solid ${colors.accent}`,
        borderRadius: '12px',
      }}>
        <div style={{
          fontSize: '12px',
          color: colors.accent,
          fontWeight: 'bold',
          marginBottom: '12px',
          textAlign: 'center',
        }}>
          Процесс майнинга
        </div>

        <FlowColumn gap={12}>
          {[
            '1. Майнер собирает транзакции и строит Merkle Tree',
            '2. Заполняет все поля заголовка (кроме nonce)',
            '3. Изменяет nonce и вычисляет SHA256(SHA256(header))',
            '4. Проверяет: hash < target?',
            '5. Если нет - увеличивает nonce и повторяет шаг 3',
            '6. Если да - блок найден! Отправляет в сеть',
          ].map((step, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                fontSize: '11px',
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
                background: colors.accent,
                marginTop: '6px',
              }} />
              {step}
            </div>
          ))}
        </FlowColumn>
      </div>

      {/* Example hash */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
      }}>
        <div style={{
          fontSize: '11px',
          color: colors.success,
          fontWeight: 'bold',
          marginBottom: '8px',
        }}>
          Пример хеша блока:
        </div>
        <div style={{
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: colors.text,
          wordBreak: 'break-all',
        }}>
          00000000000000000002a7c4c1e48d76c5a37902165a270156b7a8d72728a054
        </div>
        <div style={{
          fontSize: '10px',
          color: colors.textMuted,
          marginTop: '6px',
        }}>
          Заметьте ведущие нули - это proof-of-work!
        </div>
      </div>
    </DiagramContainer>
  );
};
