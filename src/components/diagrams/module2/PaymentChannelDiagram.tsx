import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const PaymentChannelDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Канал платежей Lightning Network">
      <FlowColumn gap={24}>
        {/* Funding Transaction */}
        <FlowNode
          label="Funding Transaction (On-Chain)"
          sublabel="2-of-2 multisig: Alice & Bob"
          color={colors.bitcoin}
        />

        <Arrow direction="down" label="Открытие канала" />

        {/* Initial State */}
        <DataBox
          label="Начальное состояние"
          data={[
            { key: 'Alice', value: '0.5 BTC' },
            { key: 'Bob', value: '0.5 BTC' },
            { key: 'Total', value: '1.0 BTC' }
          ]}
          color={colors.blue}
        />

        <Arrow direction="down" label="Off-Chain Updates" />

        {/* State Updates */}
        <FlowColumn gap={16}>
          <DataBox
            label="Update 1: Alice → Bob (0.1 BTC)"
            data={[
              { key: 'Alice', value: '0.4 BTC' },
              { key: 'Bob', value: '0.6 BTC' }
            ]}
            color={colors.green}
          />

          <DataBox
            label="Update 2: Bob → Alice (0.2 BTC)"
            data={[
              { key: 'Alice', value: '0.6 BTC' },
              { key: 'Bob', value: '0.4 BTC' }
            ]}
            color={colors.green}
          />

          <DataBox
            label="Update 3: Alice → Bob (0.3 BTC)"
            data={[
              { key: 'Alice', value: '0.3 BTC' },
              { key: 'Bob', value: '0.7 BTC' }
            ]}
            color={colors.green}
          />
        </FlowColumn>

        <Arrow direction="down" label="Закрытие канала" />

        {/* Settlement */}
        <FlowRow gap={32}>
          <FlowNode
            label="Cooperative Close"
            sublabel="Обе стороны подписывают финальную транзакцию"
            color={colors.purple}
          />
          <FlowNode
            label="Force Close"
            sublabel="Односторонняя публикация последнего состояния"
            color={colors.orange}
          />
        </FlowRow>

        <Arrow direction="down" />

        {/* Final Settlement */}
        <FlowNode
          label="Settlement Transaction (On-Chain)"
          sublabel="Alice: 0.3 BTC, Bob: 0.7 BTC"
          color={colors.bitcoin}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
