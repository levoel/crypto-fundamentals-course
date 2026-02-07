import React from 'react';
import { DiagramContainer, FlowRow, FlowColumn, FlowNode, Arrow, colors } from '@primitives';

export const RSASignatureDiagram: React.FC = () => {
  return (
    <DiagramContainer title="RSA: Цифровая подпись">
      <FlowRow justify="space-around" gap={16}>
        {/* Signing */}
        <FlowColumn gap={8} align="center">
          <div style={{
            fontSize: '13px',
            color: colors.danger,
            fontWeight: 'bold',
          }}>
            Подпись (Alice)
          </div>

          <FlowNode variant="primary" size="sm">message</FlowNode>
          <Arrow direction="down" style={{ padding: '2px' }} />
          <FlowNode size="sm">H(message)</FlowNode>
          <Arrow direction="down" style={{ padding: '2px' }} />

          <div style={{
            padding: '8px 16px',
            background: `${colors.danger}20`,
            border: `1px solid ${colors.danger}`,
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: colors.danger }}>
              s = h<sup>d</sup> mod n
            </div>
            <div style={{ fontSize: '9px', color: colors.textMuted }}>
              Приватный ключ
            </div>
          </div>

          <Arrow direction="down" style={{ padding: '2px' }} />
          <FlowNode variant="warning" size="sm">signature</FlowNode>
        </FlowColumn>

        {/* Transfer */}
        <FlowColumn gap={8} align="center" justify="center">
          <div style={{ color: colors.textMuted }}>→</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>
            message +<br />signature
          </div>
          <div style={{ color: colors.textMuted }}>→</div>
        </FlowColumn>

        {/* Verification */}
        <FlowColumn gap={8} align="center">
          <div style={{
            fontSize: '13px',
            color: colors.success,
            fontWeight: 'bold',
          }}>
            Проверка (Bob)
          </div>

          <FlowRow gap={16}>
            <FlowColumn gap={4} align="center">
              <FlowNode variant="primary" size="sm">message</FlowNode>
              <Arrow direction="down" style={{ padding: '2px' }} />
              <FlowNode size="sm">H(message)</FlowNode>
            </FlowColumn>

            <FlowColumn gap={4} align="center">
              <FlowNode variant="warning" size="sm">signature</FlowNode>
              <Arrow direction="down" style={{ padding: '2px' }} />
              <div style={{
                padding: '4px 8px',
                background: `${colors.success}20`,
                border: `1px solid ${colors.success}`,
                borderRadius: '4px',
                fontSize: '10px',
                color: colors.success,
              }}>
                s<sup>e</sup> mod n
              </div>
            </FlowColumn>
          </FlowRow>

          <div style={{
            padding: '8px 16px',
            background: `${colors.accent}20`,
            border: `1px solid ${colors.accent}`,
            borderRadius: '6px',
            fontSize: '11px',
            color: colors.accent,
          }}>
            Сравнить: H(m) == s<sup>e</sup>?
          </div>

          <FlowNode variant="success" size="sm">✓ Валидна</FlowNode>
        </FlowColumn>
      </FlowRow>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '11px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.primary }}>Свойства подписи:</strong> Аутентичность (только Alice может создать),
        целостность (изменение message инвалидирует подпись), неотрекаемость (Alice не может отрицать).
      </div>
    </DiagramContainer>
  );
};
