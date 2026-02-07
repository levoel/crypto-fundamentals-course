import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const LightningRoutingDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Многоуровневая маршрутизация Lightning">
      <FlowColumn gap={24}>
        {/* Payment Flow */}
        <FlowRow gap={16}>
          <FlowNode
            label="Alice"
            sublabel="Отправитель"
            color={colors.blue}
          />
          <Arrow direction="right" label="→" />
          <FlowNode
            label="Bob"
            sublabel="Узел 1"
            color={colors.green}
          />
          <Arrow direction="right" label="→" />
          <FlowNode
            label="Carol"
            sublabel="Узел 2"
            color={colors.green}
          />
          <Arrow direction="right" label="→" />
          <FlowNode
            label="Dave"
            sublabel="Получатель"
            color={colors.purple}
          />
        </FlowRow>

        <Arrow direction="down" label="Onion Routing Layers" />

        {/* Onion Layers */}
        <FlowColumn gap={16}>
          <DataBox
            label="Layer 1 (Alice)"
            data={[
              { key: 'Next Hop', value: 'Bob' },
              { key: 'Amount', value: '1.003 BTC' },
              { key: 'Timelock', value: 'Block 750,000' },
              { key: 'Encrypted', value: 'Layers 2, 3, 4' }
            ]}
            color={colors.blue}
          />

          <DataBox
            label="Layer 2 (Bob)"
            data={[
              { key: 'Next Hop', value: 'Carol' },
              { key: 'Amount', value: '1.002 BTC (fee: 0.001)' },
              { key: 'Timelock', value: 'Block 749,900' },
              { key: 'Encrypted', value: 'Layers 3, 4' }
            ]}
            color={colors.green}
          />

          <DataBox
            label="Layer 3 (Carol)"
            data={[
              { key: 'Next Hop', value: 'Dave' },
              { key: 'Amount', value: '1.001 BTC (fee: 0.001)' },
              { key: 'Timelock', value: 'Block 749,800' },
              { key: 'Encrypted', value: 'Layer 4' }
            ]}
            color={colors.green}
          />

          <DataBox
            label="Layer 4 (Dave)"
            data={[
              { key: 'Final', value: 'Получатель' },
              { key: 'Amount', value: '1.000 BTC (fee: 0.001)' },
              { key: 'Timelock', value: 'Block 749,700' },
              { key: 'Payment Hash', value: 'Раскрывает preimage' }
            ]}
            color={colors.purple}
          />
        </FlowColumn>

        <Arrow direction="down" label="Decreasing Timelocks" />

        {/* Timelock Visualization */}
        <DataBox
          label="Безопасность таймлоков"
          data={[
            { key: 'Alice', value: '750,000 (самый большой)' },
            { key: 'Bob', value: '749,900 (−100 блоков)' },
            { key: 'Carol', value: '749,800 (−100 блоков)' },
            { key: 'Dave', value: '749,700 (самый маленький)' }
          ]}
          color={colors.orange}
        />

        {/* Privacy Note */}
        <FlowNode
          label="Приватность"
          sublabel="Каждый узел знает только предыдущий и следующий хоп"
          color={colors.purple}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
