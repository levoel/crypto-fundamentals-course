import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const HTLCDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Hash Time-Locked Contract (HTLC)">
      <FlowColumn gap={24}>
        {/* HTLC Setup */}
        <FlowNode
          label="HTLC Setup"
          sublabel="Alice блокирует средства"
          color={colors.bitcoin}
        />

        <Arrow direction="down" />

        {/* Contract Conditions */}
        <DataBox
          label="Условия контракта"
          data={[
            { key: 'Hash Lock', value: 'H = SHA256(preimage)' },
            { key: 'Time Lock', value: 'Timeout = Block Height + N' },
            { key: 'Amount', value: '1.0 BTC' }
          ]}
          color={colors.purple}
        />

        <Arrow direction="down" label="Два пути исполнения" />

        {/* Two Paths */}
        <FlowRow gap={48}>
          {/* Success Path */}
          <FlowColumn gap={16}>
            <FlowNode
              label="Success Path"
              sublabel="Bob раскрывает preimage"
              color={colors.green}
            />

            <Arrow direction="down" />

            <DataBox
              label="Условие выполнено"
              data={[
                { key: 'Preimage', value: 'Раскрыт секрет' },
                { key: 'SHA256(preimage)', value: 'Совпадает с H' },
                { key: 'Time', value: '< Timeout' }
              ]}
              color={colors.green}
            />

            <Arrow direction="down" />

            <FlowNode
              label="Bob получает 1.0 BTC"
              sublabel="Atomic swap завершен"
              color={colors.green}
            />
          </FlowColumn>

          {/* Timeout Path */}
          <FlowColumn gap={16}>
            <FlowNode
              label="Timeout Path"
              sublabel="Истекло время"
              color={colors.orange}
            />

            <Arrow direction="down" />

            <DataBox
              label="Условие возврата"
              data={[
                { key: 'Preimage', value: 'Не раскрыт' },
                { key: 'Time', value: '≥ Timeout' },
                { key: 'Block Height', value: 'Достигнут порог' }
              ]}
              color={colors.orange}
            />

            <Arrow direction="down" />

            <FlowNode
              label="Alice получает возврат"
              sublabel="Средства возвращены"
              color={colors.orange}
            />
          </FlowColumn>
        </FlowRow>

        {/* Atomic Swap Concept */}
        <DataBox
          label="Атомарность"
          data={[
            { key: 'Гарантия', value: 'Либо обмен, либо возврат' },
            { key: 'Доверие', value: 'Не требуется третья сторона' },
            { key: 'Безопасность', value: 'Криптографическая защита' }
          ]}
          color={colors.blue}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
