import React from 'react';
import { DiagramContainer, FlowColumn, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const ScriptPathSpendDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Структура траты Taproot Script Path">
      <FlowColumn gap={24}>
        {/* Witness Structure */}
        <DataBox
          label="Witness Stack"
          data={[
            { key: 'Script', value: 'Раскрытый скрипт' },
            { key: 'Control Block', value: 'Контрольный блок' },
            { key: 'Merkle Proof', value: 'Доказательство Меркла' }
          ]}
          color={colors.purple}
        />

        <Arrow direction="down" label="Раскрытие" />

        {/* Script Details */}
        <FlowNode
          label="Раскрытый скрипт"
          sublabel="OP_CHECKSIG, OP_CHECKMULTISIG, и т.д."
          color={colors.blue}
        />

        <Arrow direction="down" />

        {/* Control Block */}
        <DataBox
          label="Control Block (33-65 байт)"
          data={[
            { key: 'Byte 0', value: 'Leaf version + parity bit' },
            { key: 'Bytes 1-32', value: 'Internal pubkey' },
            { key: 'Bytes 33+', value: 'Merkle path (32-byte hashes)' }
          ]}
          color={colors.green}
        />

        <Arrow direction="down" />

        {/* Merkle Proof */}
        <FlowNode
          label="Merkle Proof"
          sublabel="Путь от листа к корню"
          color={colors.orange}
        />

        <Arrow direction="down" label="Верификация" />

        {/* Verification Result */}
        <FlowNode
          label="Taproot Output = TweakHash(P, root)"
          sublabel="Проверка соответствия корня дерева"
          color={colors.purple}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
