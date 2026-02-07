import React from 'react';
import {
  DiagramContainer,
  FlowRow,
  FlowColumn,
  FlowNode,
  Arrow,
  colors,
  DataBox,
} from '@primitives';

export const SegWitStructureDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Структура SegWit транзакции">
      <FlowColumn>
        {/* Header */}
        <FlowNode color={colors.primary} style={{ padding: '16px' }}>
          <strong>SegWit Transaction (Segregated Witness)</strong><br />
          Разделение данных и подписей
        </FlowNode>

        <Arrow direction="down" />

        {/* Two Parts Comparison */}
        <FlowRow style={{ gap: '30px', alignItems: 'flex-start' }}>
          {/* Base Transaction Data */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.secondary} style={{ padding: '12px' }}>
              <strong>Base Transaction Data</strong><br />
              (Базовые данные)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox label="Содержимое" style={{ backgroundColor: colors.secondary + '20' }}>
              • Version (версия)<br />
              • Input count<br />
              • Inputs (без подписей):<br />
              &nbsp;&nbsp;- Prev TX hash<br />
              &nbsp;&nbsp;- Output index<br />
              &nbsp;&nbsp;- (ScriptSig пустой)<br />
              • Output count<br />
              • Outputs:<br />
              &nbsp;&nbsp;- Amount<br />
              &nbsp;&nbsp;- ScriptPubKey<br />
              • Locktime
            </DataBox>

            <Arrow direction="down" />

            <FlowNode color={colors.success} style={{ padding: '12px' }}>
              <strong>TXID вычисляется<br />только из этих данных</strong>
            </FlowNode>
          </FlowColumn>

          {/* Witness Data */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.accent} style={{ padding: '12px' }}>
              <strong>Witness Data</strong><br />
              (Данные свидетелей)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox label="Содержимое" style={{ backgroundColor: colors.accent + '20' }}>
              • Witness count<br />
              • Witness для каждого input:<br />
              &nbsp;&nbsp;- Signatures<br />
              &nbsp;&nbsp;- Public keys<br />
              &nbsp;&nbsp;- Redeem scripts<br />
              <br />
              <em>Отделено от основных<br />данных транзакции</em>
            </DataBox>

            <Arrow direction="down" />

            <FlowNode color={colors.warning} style={{ padding: '12px' }}>
              <strong>НЕ влияет на TXID</strong><br />
              (решает проблему<br />malleability)
            </FlowNode>
          </FlowColumn>
        </FlowRow>

        {/* Combined */}
        <Arrow direction="down" label="Объединяются для валидации" />

        <FlowNode color={colors.success} style={{ padding: '16px' }}>
          <strong>Полная транзакция</strong><br />
          Base Data + Witness Data = Валидная SegWit TX
        </FlowNode>

        {/* Benefits */}
        <DataBox
          label="Преимущества разделения"
          style={{ marginTop: '20px', backgroundColor: colors.primary + '20' }}
        >
          ✅ TXID не зависит от подписей (нет malleability)<br />
          ✅ Witness data не учитывается в старых нодах (обратная совместимость)<br />
          ✅ Больше места для транзакций в блоке (witness data дешевле)
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
