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

export const ProofOfWorkDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Proof of Work (Доказательство работы)">
      <FlowColumn>
        {/* Header Data */}
        <FlowNode color={colors.primary} style={{ padding: '16px' }}>
          Данные блока<br />
          Prev Hash + Transactions + Timestamp
        </FlowNode>

        <Arrow direction="down" label="+ Nonce" />

        {/* Mining Process */}
        <FlowRow style={{ gap: '40px', alignItems: 'flex-start' }}>
          {/* Nonce Iteration */}
          <FlowColumn>
            <DataBox label="Попытка 1" style={{ backgroundColor: colors.error + '20' }}>
              Nonce: 0<br />
              Hash: 8a3f2e... (большой)<br />
              ❌ Hash {'>'} Target
            </DataBox>

            <Arrow direction="down" label="nonce++" />

            <DataBox label="Попытка 2" style={{ backgroundColor: colors.error + '20' }}>
              Nonce: 1<br />
              Hash: 7b4c1d... (большой)<br />
              ❌ Hash {'>'} Target
            </DataBox>

            <Arrow direction="down" label="nonce++" />

            <DataBox label="Попытка N" style={{ backgroundColor: colors.success + '20' }}>
              Nonce: 2,547,893<br />
              Hash: 00000a... (малый)<br />
              ✅ Hash {'<'} Target
            </DataBox>
          </FlowColumn>

          {/* Target Comparison */}
          <FlowColumn>
            <FlowNode color={colors.secondary} style={{ padding: '16px', minWidth: '250px' }}>
              <strong>Target (Цель)</strong><br />
              0000ffff...ffff
            </FlowNode>

            <Arrow direction="down" />

            <DataBox label="Условие успеха">
              Hash(Block + Nonce) {'<'} Target
            </DataBox>

            <Arrow direction="down" />

            <FlowNode color={colors.success} style={{ padding: '16px' }}>
              <strong>Блок найден!</strong><br />
              Награда: 6.25 BTC<br />
              Proof of Work выполнен
            </FlowNode>
          </FlowColumn>
        </FlowRow>

        {/* Statistics */}
        <DataBox
          label="Статистика работы"
          style={{ marginTop: '20px', backgroundColor: colors.accent + '20' }}
        >
          Попыток: 2,547,893 • Время: ~10 минут<br />
          Сложность подбирается автоматически
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
