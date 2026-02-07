import React from 'react';
import {
  DiagramContainer,
  FlowRow,
  FlowColumn,
  FlowNode,
  Arrow,
  colors,
  DataBox,
  Grid,
} from '@primitives';

export const MASTDiagram: React.FC = () => {
  return (
    <DiagramContainer title="MAST (Merkelized Alternative Script Tree)">
      <FlowColumn>
        {/* Header */}
        <FlowNode color={colors.primary} style={{ padding: '16px' }}>
          <strong>MAST - Merkle дерево скриптов</strong><br />
          Скрываем неиспользованные условия
        </FlowNode>

        <Arrow direction="down" />

        {/* Script Conditions */}
        <DataBox label="Условия траты" style={{ backgroundColor: colors.secondary + '20' }}>
          Несколько альтернативных способов потратить монеты
        </DataBox>

        <Arrow direction="down" />

        {/* Merkle Tree Structure */}
        <FlowColumn>
          {/* Root */}
          <FlowNode
            color={colors.success}
            style={{ padding: '12px', width: '300px', margin: '0 auto' }}
          >
            <strong>Merkle Root</strong><br />
            <code style={{ fontSize: '11px' }}>Root Hash</code><br />
            (в блокчейне)
          </FlowNode>

          <Arrow direction="down" />

          {/* Level 2 */}
          <FlowRow style={{ gap: '100px', justifyContent: 'center' }}>
            <FlowNode color={colors.accent} style={{ padding: '10px', minWidth: '120px' }}>
              Hash AB
            </FlowNode>
            <FlowNode color={colors.accent} style={{ padding: '10px', minWidth: '120px' }}>
              Hash CD
            </FlowNode>
          </FlowRow>

          <Arrow direction="down" />

          {/* Level 3 - Leaves */}
          <FlowRow style={{ gap: '20px', justifyContent: 'center' }}>
            <DataBox
              label="Script A"
              style={{
                flex: '0 0 140px',
                backgroundColor: colors.primary + '20',
                fontSize: '12px'
              }}
            >
              Подпись Alice
            </DataBox>

            <DataBox
              label="Script B"
              style={{
                flex: '0 0 140px',
                backgroundColor: colors.secondary + '20',
                fontSize: '12px'
              }}
            >
              Подпись Bob
            </DataBox>

            <DataBox
              label="Script C"
              style={{
                flex: '0 0 140px',
                backgroundColor: colors.secondary + '20',
                fontSize: '12px'
              }}
            >
              2-of-3 мультиподпись
            </DataBox>

            <DataBox
              label="Script D"
              style={{
                flex: '0 0 140px',
                backgroundColor: colors.secondary + '20',
                fontSize: '12px'
              }}
            >
              Timelock (30 дней)<br />+ Подпись Carol
            </DataBox>
          </FlowRow>
        </FlowColumn>

        {/* Spending Example */}
        <Arrow direction="down" label="Пример траты" style={{ marginTop: '20px' }} />

        <FlowRow style={{ gap: '30px', alignItems: 'flex-start' }}>
          {/* What to Reveal */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.success} style={{ padding: '12px' }}>
              <strong>Alice тратит (Script A)</strong>
            </FlowNode>

            <Arrow direction="down" />

            <DataBox
              label="Раскрывается"
              style={{ backgroundColor: colors.success + '20' }}
            >
              ✅ Script A (подпись Alice)<br />
              ✅ Hash B (для доказательства)<br />
              ✅ Hash CD (для доказательства)<br />
              <br />
              <strong>Merkle Proof:</strong><br />
              Hash(A) + Hash(B) = Hash(AB)<br />
              Hash(AB) + Hash(CD) = Root
            </DataBox>
          </FlowColumn>

          {/* What Stays Hidden */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.warning} style={{ padding: '12px' }}>
              <strong>Остается скрытым</strong>
            </FlowNode>

            <Arrow direction="down" />

            <DataBox
              label="Приватно"
              style={{ backgroundColor: colors.warning + '20' }}
            >
              ❌ Script B (не раскрыт)<br />
              ❌ Script C (не раскрыт)<br />
              ❌ Script D (не раскрыт)<br />
              <br />
              <em>Неиспользованные условия<br />
              остаются приватными!</em>
            </DataBox>
          </FlowColumn>
        </FlowRow>

        {/* Comparison */}
        <DataBox
          label="Сравнение с обычными скриптами"
          style={{ marginTop: '20px', backgroundColor: colors.accent + '20' }}
        >
          <Grid columns={2} gap="20px">
            <div>
              <strong>Без MAST:</strong><br />
              ❌ Все условия в блокчейне<br />
              ❌ Большой размер<br />
              ❌ Нет приватности
            </div>
            <div style={{ color: colors.success }}>
              <strong>С MAST:</strong><br />
              ✅ Только используемое условие<br />
              ✅ Маленький размер<br />
              ✅ Приватность альтернатив
            </div>
          </Grid>
        </DataBox>

        {/* Benefits */}
        <DataBox
          label="Преимущества MAST"
          style={{ marginTop: '10px', backgroundColor: colors.primary + '20' }}
        >
          ✅ <strong>Масштабируемость:</strong> меньше данных в блокчейне<br />
          ✅ <strong>Приватность:</strong> скрытие неиспользованных путей<br />
          ✅ <strong>Гибкость:</strong> сложные условия без больших скриптов
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
