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

export const MalleabilityDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Transaction Malleability (Изменяемость)">
      <FlowColumn>
        {/* Problem Description */}
        <FlowNode color={colors.error} style={{ padding: '16px' }}>
          <strong>Проблема: Transaction Malleability</strong><br />
          Подпись можно изменить без изменения транзакции
        </FlowNode>

        <Arrow direction="down" />

        {/* Legacy Transaction Problem */}
        <DataBox label="Legacy транзакция" style={{ backgroundColor: colors.error + '20' }}>
          <strong>Исходная транзакция:</strong><br />
          Inputs + Outputs + Signature A
        </DataBox>

        <Arrow direction="down" label="Hash для TXID" />

        <FlowRow style={{ gap: '30px' }}>
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.primary} style={{ padding: '12px' }}>
              <strong>Вариант 1</strong><br />
              Signature A
            </FlowNode>
            <Arrow direction="down" />
            <DataBox style={{ backgroundColor: colors.primary + '20' }}>
              TXID:<br />
              abc123...def
            </DataBox>
          </FlowColumn>

          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.error} style={{ padding: '12px' }}>
              <strong>Вариант 2</strong><br />
              Signature B<br />
              <em>(та же TX!)</em>
            </FlowNode>
            <Arrow direction="down" />
            <DataBox style={{ backgroundColor: colors.error + '20' }}>
              TXID:<br />
              fed321...cba<br />
              <strong>❌ Другой!</strong>
            </DataBox>
          </FlowColumn>
        </FlowRow>

        {/* Problem Impact */}
        <DataBox
          label="Последствия"
          style={{ marginTop: '20px', backgroundColor: colors.warning + '20' }}
        >
          ⚠️ Одна и та же транзакция → разные TXID<br />
          ⚠️ Проблемы с трекингом подтверждений<br />
          ⚠️ Уязвимости в Lightning Network и других L2
        </DataBox>

        {/* SegWit Solution */}
        <Arrow direction="down" label="Решение" />

        <FlowNode color={colors.success} style={{ padding: '16px' }}>
          <strong>SegWit решение</strong>
        </FlowNode>

        <Arrow direction="down" />

        <FlowRow style={{ gap: '30px', alignItems: 'flex-start' }}>
          <FlowColumn style={{ flex: 1 }}>
            <DataBox
              label="TXID вычисляется из"
              style={{ backgroundColor: colors.success + '20' }}
            >
              ✅ Version<br />
              ✅ Inputs (без подписей)<br />
              ✅ Outputs<br />
              ✅ Locktime<br />
              <br />
              <strong>БЕЗ witness data!</strong>
            </DataBox>
          </FlowColumn>

          <FlowColumn style={{ flex: 1 }}>
            <DataBox
              label="Witness data (отдельно)"
              style={{ backgroundColor: colors.accent + '20' }}
            >
              • Signatures<br />
              • Public keys<br />
              • Scripts<br />
              <br />
              <em>НЕ влияет на TXID</em>
            </DataBox>
          </FlowColumn>
        </FlowRow>

        <Arrow direction="down" />

        <FlowNode color={colors.success} style={{ padding: '16px' }}>
          <strong>Результат: TXID всегда одинаковый</strong><br />
          Независимо от формата подписи
        </FlowNode>
      </FlowColumn>
    </DiagramContainer>
  );
};
