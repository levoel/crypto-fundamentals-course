import React from 'react';
import { DiagramContainer, FlowRow, colors } from '@primitives';

export const BlockChainDiagram: React.FC = () => {
  const blocks = [
    {
      height: 0,
      hash: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: '2009-01-03',
      txCount: 1,
      isGenesis: true,
    },
    {
      height: 1,
      hash: '00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048',
      prevHash: '000000000019d668...',
      timestamp: '2009-01-09',
      txCount: 1,
      isGenesis: false,
    },
    {
      height: 2,
      hash: '000000006a625f06636b8bb6ac7b960a8d03705d1ace08b1a19da3fdcc99ddbd',
      prevHash: '00000000839a8e68...',
      timestamp: '2009-01-09',
      txCount: 1,
      isGenesis: false,
    },
    {
      height: 'N',
      hash: '00000000000000000002a7c4c1e48d76c5a37902165a270156b7a8d72728a054',
      prevHash: '000000006a625f06...',
      timestamp: '2026-02-07',
      txCount: 2847,
      isGenesis: false,
    },
  ];

  const renderBlock = (block: typeof blocks[0], index: number) => (
    <div
      key={index}
      style={{
        minWidth: '200px',
        padding: '16px',
        background: block.isGenesis ? `${colors.success}15` : `${colors.primary}10`,
        border: `2px solid ${block.isGenesis ? colors.success : colors.primary}`,
        borderRadius: '12px',
        position: 'relative',
      }}
    >
      {/* Block height badge */}
      <div style={{
        position: 'absolute',
        top: '-12px',
        left: '12px',
        padding: '4px 12px',
        background: block.isGenesis ? colors.success : colors.primary,
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#000',
      }}>
        Block {block.height}
      </div>

      {block.isGenesis && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: '12px',
          padding: '4px 12px',
          background: colors.warning,
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#000',
        }}>
          Genesis
        </div>
      )}

      {/* Block content */}
      <div style={{ marginTop: '8px' }}>
        {/* Previous hash */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '9px',
            color: colors.textMuted,
            marginBottom: '4px',
          }}>
            Previous Hash:
          </div>
          <div style={{
            padding: '6px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            fontSize: '9px',
            fontFamily: 'monospace',
            color: colors.secondary,
            wordBreak: 'break-all',
          }}>
            {block.prevHash}
          </div>
        </div>

        {/* Current hash */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '9px',
            color: colors.textMuted,
            marginBottom: '4px',
          }}>
            Block Hash:
          </div>
          <div style={{
            padding: '6px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            fontSize: '9px',
            fontFamily: 'monospace',
            color: block.isGenesis ? colors.success : colors.accent,
            wordBreak: 'break-all',
          }}>
            {block.hash}
          </div>
        </div>

        {/* Metadata */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '10px',
        }}>
          <div>
            <div style={{ color: colors.textMuted }}>Timestamp:</div>
            <div style={{ color: colors.text, fontFamily: 'monospace' }}>
              {block.timestamp}
            </div>
          </div>
          <div>
            <div style={{ color: colors.textMuted }}>Transactions:</div>
            <div style={{ color: colors.text, fontFamily: 'monospace' }}>
              {block.txCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DiagramContainer title="Цепочка блоков (Blockchain)">
      <div style={{
        padding: '16px',
        background: `${colors.info}10`,
        border: `1px solid ${colors.info}`,
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: colors.info, fontWeight: 'bold' }}>
          Блокчейн - это связанный список блоков
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
          Каждый блок содержит хеш предыдущего блока, образуя неизменяемую цепь
        </div>
      </div>

      {/* Chain visualization */}
      <div style={{
        overflowX: 'auto',
        paddingBottom: '20px',
      }}>
        <FlowRow gap={0} justify="start" wrap={false}>
          {blocks.map((block, index) => (
            <React.Fragment key={index}>
              {renderBlock(block, index)}

              {index < blocks.length - 1 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                }}>
                  <div style={{
                    fontSize: '24px',
                    color: colors.accent,
                  }}>
                    →
                  </div>
                  <div style={{
                    fontSize: '9px',
                    color: colors.textMuted,
                    marginTop: '4px',
                  }}>
                    prev_hash
                  </div>
                </div>
              )}

              {index === blocks.length - 2 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  fontSize: '20px',
                  color: colors.textMuted,
                }}>
                  ...
                </div>
              )}
            </React.Fragment>
          ))}
        </FlowRow>
      </div>

      {/* Chain properties */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
      }}>
        <div style={{
          fontSize: '12px',
          color: colors.success,
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          Свойства блокчейна
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {[
            {
              title: 'Неизменяемость',
              desc: 'Изменение блока меняет его хеш и ломает всю последующую цепь',
              icon: '🔒',
              color: colors.success,
            },
            {
              title: 'Хронология',
              desc: 'Блоки упорядочены по времени через prev_hash и timestamp',
              icon: '⏰',
              color: colors.info,
            },
            {
              title: 'Верификация',
              desc: 'Каждый узел может проверить всю историю транзакций',
              icon: '✓',
              color: colors.accent,
            },
            {
              title: 'Децентрализация',
              desc: 'Копия цепи хранится у тысяч узлов по всему миру',
              icon: '🌐',
              color: colors.primary,
            },
          ].map((prop, i) => (
            <div
              key={i}
              style={{
                padding: '16px',
                background: `${prop.color}10`,
                border: `1px solid ${prop.color}`,
                borderRadius: '8px',
              }}
            >
              <div style={{
                fontSize: '24px',
                marginBottom: '8px',
                textAlign: 'center',
              }}>
                {prop.icon}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: prop.color,
                marginBottom: '6px',
                textAlign: 'center',
              }}>
                {prop.title}
              </div>
              <div style={{
                fontSize: '10px',
                color: colors.textMuted,
                textAlign: 'center',
              }}>
                {prop.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attack resistance */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: `${colors.danger}10`,
        border: `1px solid ${colors.danger}`,
        borderRadius: '8px',
      }}>
        <div style={{
          fontSize: '11px',
          color: colors.danger,
          fontWeight: 'bold',
          marginBottom: '8px',
        }}>
          Защита от атак:
        </div>
        <div style={{ fontSize: '10px', color: colors.text, lineHeight: '1.5' }}>
          Чтобы изменить транзакцию в блоке N, атакующий должен:<br />
          1. Пересчитать Merkle Root блока N<br />
          2. Найти новый nonce для блока N (proof-of-work)<br />
          3. Повторить шаги 1-2 для всех последующих блоков (N+1, N+2, ...)<br />
          4. Обогнать остальную сеть в производстве блоков<br />
          <br />
          <span style={{ color: colors.danger }}>
            Это практически невозможно без контроля 51%+ хешрейта сети!
          </span>
        </div>
      </div>
    </DiagramContainer>
  );
};
