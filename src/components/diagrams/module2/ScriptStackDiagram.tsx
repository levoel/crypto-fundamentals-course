import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const ScriptStackDiagram: React.FC = () => {
  const stackSteps = [
    {
      label: 'Шаг 1: Push Signature',
      stack: ['<sig>'],
      operation: 'scriptSig',
    },
    {
      label: 'Шаг 2: Push PubKey',
      stack: ['<pubKey>', '<sig>'],
      operation: 'scriptSig',
    },
    {
      label: 'Шаг 3: OP_DUP',
      stack: ['<pubKey>', '<pubKey>', '<sig>'],
      operation: 'Дублировать верхний элемент',
    },
    {
      label: 'Шаг 4: OP_HASH160',
      stack: ['<pubKeyHash>', '<pubKey>', '<sig>'],
      operation: 'Хешировать верхний элемент',
    },
    {
      label: 'Шаг 5: Push <pubKeyHash>',
      stack: ['<pubKeyHash>', '<pubKeyHash>', '<pubKey>', '<sig>'],
      operation: 'scriptPubKey',
    },
    {
      label: 'Шаг 6: OP_EQUALVERIFY',
      stack: ['<pubKey>', '<sig>'],
      operation: 'Проверить равенство хешей',
    },
    {
      label: 'Шаг 7: OP_CHECKSIG',
      stack: ['TRUE'],
      operation: 'Проверить подпись',
    },
  ];

  const renderStack = (items: string[]) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '4px',
      minHeight: '160px',
      justifyContent: 'flex-start',
    }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            padding: '8px 12px',
            background: i === 0 ? `${colors.accent}20` : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${i === 0 ? colors.accent : colors.border}`,
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: i === 0 ? colors.accent : colors.text,
            textAlign: 'center',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );

  return (
    <DiagramContainer title="Стековая машина Bitcoin Script">
      <div style={{
        padding: '16px',
        background: `${colors.info}10`,
        border: `1px solid ${colors.info}`,
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '12px', color: colors.info, fontWeight: 'bold' }}>
          Bitcoin Script - стековый язык программирования
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
          Операции выполняются последовательно, данные хранятся в стеке (LIFO)
        </div>
      </div>

      {/* Main execution flow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
      }}>
        {stackSteps.map((step, i) => (
          <div key={i}>
            <div style={{
              fontSize: '10px',
              color: colors.textMuted,
              marginBottom: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}>
              {step.label}
            </div>
            {renderStack(step.stack)}
            <div style={{
              marginTop: '8px',
              fontSize: '9px',
              color: step.operation.includes('script') ? colors.primary : colors.warning,
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              {step.operation}
            </div>
          </div>
        ))}
      </div>

      {/* Stack operations reference */}
      <div style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
      }}>
        <div style={{
          fontSize: '11px',
          color: colors.success,
          fontWeight: 'bold',
          marginBottom: '12px',
        }}>
          Основные операции стека
        </div>
        <Grid columns={2} gap={12}>
          {[
            { op: 'OP_DUP', desc: 'Дублирует верхний элемент стека' },
            { op: 'OP_HASH160', desc: 'SHA256 + RIPEMD160 верхнего элемента' },
            { op: 'OP_EQUALVERIFY', desc: 'Проверяет равенство двух элементов, удаляет их' },
            { op: 'OP_CHECKSIG', desc: 'Проверяет ECDSA подпись' },
            { op: 'OP_RETURN', desc: 'Завершает скрипт неудачей' },
            { op: 'OP_DROP', desc: 'Удаляет верхний элемент стека' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                fontSize: '10px',
              }}
            >
              <div style={{
                color: colors.accent,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                marginBottom: '4px',
              }}>
                {item.op}
              </div>
              <div style={{ color: colors.textMuted }}>
                {item.desc}
              </div>
            </div>
          ))}
        </Grid>
      </div>

      {/* Result indicator */}
      <FlowRow justify="center" style={{ marginTop: '16px' }}>
        <div style={{
          padding: '12px 24px',
          background: `${colors.success}20`,
          border: `2px solid ${colors.success}`,
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 'bold',
          color: colors.success,
        }}>
          Результат: TRUE (транзакция валидна)
        </div>
      </FlowRow>
    </DiagramContainer>
  );
};

const Grid: React.FC<{
  children: React.ReactNode;
  columns: number;
  gap: number;
}> = ({ children, columns, gap }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  }}>
    {children}
  </div>
);
