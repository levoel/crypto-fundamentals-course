import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const ChannelLifecycleDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Жизненный цикл канала Lightning">
      <FlowColumn gap={24}>
        {/* Stage 1: Open */}
        <FlowNode
          label="1. Open (Открытие)"
          sublabel="Создание канала"
          color={colors.blue}
        />

        <Arrow direction="down" />

        <DataBox
          label="Funding Transaction"
          data={[
            { key: 'Type', value: 'On-chain transaction' },
            { key: 'Output', value: '2-of-2 multisig' },
            { key: 'Confirmations', value: '3-6 blocks' },
            { key: 'Capacity', value: 'Фиксированная сумма' }
          ]}
          color={colors.blue}
        />

        <Arrow direction="down" label="Канал активен" />

        {/* Stage 2: Active */}
        <FlowNode
          label="2. Active (Активный)"
          sublabel="Off-chain обновления"
          color={colors.green}
        />

        <Arrow direction="down" />

        <FlowColumn gap={12}>
          <DataBox
            label="State Updates"
            data={[
              { key: 'Frequency', value: 'Неограниченное количество' },
              { key: 'Speed', value: 'Мгновенные платежи' },
              { key: 'Fees', value: 'Минимальные комиссии' },
              { key: 'Privacy', value: 'Off-chain операции' }
            ]}
            color={colors.green}
          />

          <FlowNode
            label="Commitment Transactions"
            sublabel="Каждое обновление = новая commitment tx"
            color={colors.green}
          />
        </FlowColumn>

        <Arrow direction="down" label="Решение закрыть" />

        {/* Stage 3: Close */}
        <FlowNode
          label="3. Close (Закрытие)"
          sublabel="Возврат средств on-chain"
          color={colors.orange}
        />

        <Arrow direction="down" />

        {/* Closing Options */}
        <FlowRow gap={32}>
          {/* Cooperative Close */}
          <FlowColumn gap={12}>
            <FlowNode
              label="Cooperative Close"
              sublabel="Обоюдное согласие"
              color={colors.purple}
            />

            <DataBox
              label="Характеристики"
              data={[
                { key: 'Signatures', value: 'Обе стороны' },
                { key: 'Speed', value: 'Мгновенно' },
                { key: 'Fees', value: 'Низкие' },
                { key: 'Finality', value: 'Немедленная' }
              ]}
              color={colors.purple}
            />
          </FlowColumn>

          {/* Force Close */}
          <FlowColumn gap={12}>
            <FlowNode
              label="Force Close"
              sublabel="Односторонний выход"
              color={colors.orange}
            />

            <DataBox
              label="Характеристики"
              data={[
                { key: 'Signatures', value: 'Одна сторона' },
                { key: 'Speed', value: 'Задержка (timelock)' },
                { key: 'Fees', value: 'Высокие' },
                { key: 'Penalty', value: 'Возможна (cheating)' }
              ]}
              color={colors.orange}
            />
          </FlowColumn>
        </FlowRow>

        <Arrow direction="down" />

        {/* Final Settlement */}
        <FlowNode
          label="Settlement Transaction"
          sublabel="Финальное распределение средств on-chain"
          color={colors.bitcoin}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
