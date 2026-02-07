import React from 'react';
import { DiagramContainer, FlowColumn, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const TransactionBuilderDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Процесс построения Bitcoin транзакции">
      <FlowColumn gap={24}>
        {/* Step 1: Select UTXOs */}
        <FlowNode
          label="1. Выбор UTXOs"
          sublabel="Coin selection для покрытия суммы"
          color={colors.blue}
        />

        <Arrow direction="down" />

        <DataBox
          label="Available UTXOs"
          data={[
            { key: 'UTXO 1', value: '0.5 BTC (selected)' },
            { key: 'UTXO 2', value: '0.3 BTC (selected)' },
            { key: 'UTXO 3', value: '0.1 BTC' },
            { key: 'Total Selected', value: '0.8 BTC' }
          ]}
          color={colors.blue}
        />

        <Arrow direction="down" label="Создание inputs" />

        {/* Step 2: Create Inputs */}
        <FlowNode
          label="2. Создание inputs"
          sublabel="Ссылки на выбранные UTXOs"
          color={colors.green}
        />

        <Arrow direction="down" />

        <DataBox
          label="Transaction Inputs"
          data={[
            { key: 'Input 0', value: 'txid: abc123..., vout: 0' },
            { key: 'Input 1', value: 'txid: def456..., vout: 1' },
            { key: 'ScriptSig', value: 'Пока пустой (заполнится при подписи)' },
            { key: 'Sequence', value: '0xffffffff' }
          ]}
          color={colors.green}
        />

        <Arrow direction="down" label="Создание outputs" />

        {/* Step 3: Create Outputs */}
        <FlowNode
          label="3. Создание outputs"
          sublabel="Получатель + сдача + комиссия"
          color={colors.purple}
        />

        <Arrow direction="down" />

        <DataBox
          label="Transaction Outputs"
          data={[
            { key: 'Output 0 (recipient)', value: '0.6 BTC → bc1q...' },
            { key: 'Output 1 (change)', value: '0.199 BTC → bc1q... (свой адрес)' },
            { key: 'Fee', value: '0.001 BTC (не в outputs!)' },
            { key: 'Total', value: '0.6 + 0.199 + 0.001 = 0.8 BTC' }
          ]}
          color={colors.purple}
        />

        <Arrow direction="down" label="Расчет комиссии" />

        {/* Fee Calculation */}
        <DataBox
          label="Fee Calculation"
          data={[
            { key: 'Size', value: '~250 vBytes (2 inputs, 2 outputs)' },
            { key: 'Fee Rate', value: '4 sat/vByte (текущий рынок)' },
            { key: 'Total Fee', value: '250 × 4 = 1000 sat = 0.00001 BTC' },
            { key: 'Fee', value: 'Inputs − Outputs = комиссия' }
          ]}
          color={colors.orange}
        />

        <Arrow direction="down" label="Подпись" />

        {/* Step 4: Sign */}
        <FlowNode
          label="4. Подпись транзакции"
          sublabel="ECDSA или Schnorr для каждого input"
          color={colors.bitcoin}
        />

        <Arrow direction="down" />

        <DataBox
          label="Signing Process"
          data={[
            { key: 'Input 0', value: 'Sign с private key → scriptSig/witness' },
            { key: 'Input 1', value: 'Sign с private key → scriptSig/witness' },
            { key: 'Algorithm', value: 'ECDSA (Legacy/SegWit) или Schnorr (Taproot)' },
            { key: 'Hash Type', value: 'SIGHASH_ALL (обычно)' }
          ]}
          color={colors.bitcoin}
        />

        <Arrow direction="down" label="Проверка" />

        {/* Validation */}
        <FlowNode
          label="Локальная валидация"
          sublabel="Проверка перед отправкой"
          color={colors.green}
        />

        <Arrow direction="down" />

        <DataBox
          label="Validation Checks"
          data={[
            { key: '✓', value: 'Inputs существуют и не потрачены' },
            { key: '✓', value: 'Подписи валидны' },
            { key: '✓', value: 'Outputs ≤ Inputs' },
            { key: '✓', value: 'Комиссия разумная' }
          ]}
          color={colors.green}
        />

        <Arrow direction="down" label="Broadcast" />

        {/* Step 5: Broadcast */}
        <FlowNode
          label="5. Отправка в сеть"
          sublabel="Broadcast через P2P узлы"
          color={colors.purple}
        />

        <Arrow direction="down" />

        <DataBox
          label="Broadcasting"
          data={[
            { key: 'Method', value: 'P2P gossip protocol' },
            { key: 'Mempool', value: 'Попадает в пул неподтвержденных' },
            { key: 'Propagation', value: 'Распространение по сети' },
            { key: 'Mining', value: 'Ожидание включения в блок' }
          ]}
          color={colors.purple}
        />

        <Arrow direction="down" />

        {/* Confirmation */}
        <FlowNode
          label="Подтверждение в блоке"
          sublabel="~10 минут до первого подтверждения"
          color={colors.bitcoin}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
