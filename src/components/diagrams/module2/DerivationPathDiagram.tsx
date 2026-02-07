import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const DerivationPathDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Разбор пути деривации BIP-44">
      <FlowColumn gap={24}>
        {/* Full Path */}
        <FlowNode
          label="m / 84' / 0' / 0' / 0 / 0"
          sublabel="Полный путь деривации BIP-44"
          color={colors.bitcoin}
        />

        <Arrow direction="down" label="Разбор по уровням" />

        {/* Level Breakdown */}
        <FlowColumn gap={16}>
          {/* Master */}
          <DataBox
            label="m"
            data={[
              { key: 'Уровень', value: 'Master Key' },
              { key: 'Описание', value: 'Корневой ключ из seed' },
              { key: 'Источник', value: 'BIP-39 seed phrase' }
            ]}
            color={colors.blue}
          />

          {/* Purpose */}
          <DataBox
            label="84'"
            data={[
              { key: 'Уровень', value: 'Purpose (hardened)' },
              { key: 'Описание', value: 'BIP-84 (Native SegWit)' },
              { key: 'Адреса', value: 'bc1q... (Bech32)' }
            ]}
            color={colors.green}
          />

          {/* Coin Type */}
          <DataBox
            label="0'"
            data={[
              { key: 'Уровень', value: 'Coin Type (hardened)' },
              { key: 'Описание', value: 'Bitcoin Mainnet' },
              { key: 'Альтернативы', value: "1' = Testnet, 2' = Litecoin" }
            ]}
            color={colors.purple}
          />

          {/* Account */}
          <DataBox
            label="0'"
            data={[
              { key: 'Уровень', value: 'Account (hardened)' },
              { key: 'Описание', value: 'Первый аккаунт' },
              { key: 'Использование', value: 'Разделение по пользователям/целям' }
            ]}
            color={colors.orange}
          />

          {/* Change */}
          <DataBox
            label="0"
            data={[
              { key: 'Уровень', value: 'Change (normal)' },
              { key: 'Описание', value: 'External chain (получение)' },
              { key: 'Альтернатива', value: '1 = Internal chain (сдача)' }
            ]}
            color={colors.blue}
          />

          {/* Address Index */}
          <DataBox
            label="0"
            data={[
              { key: 'Уровень', value: 'Address Index (normal)' },
              { key: 'Описание', value: 'Первый адрес в цепочке' },
              { key: 'Диапазон', value: '0 до 2,147,483,647' }
            ]}
            color={colors.green}
          />
        </FlowColumn>

        <Arrow direction="down" />

        {/* Hardened vs Normal Derivation */}
        <FlowRow gap={32}>
          <DataBox
            label="Hardened Derivation (')"
            data={[
              { key: 'Уровни', value: 'Purpose, Coin, Account' },
              { key: 'Индекс', value: '≥ 2³¹ (2,147,483,648+)' },
              { key: 'Требует', value: 'Private key' },
              { key: 'Безопасность', value: 'Высокая изоляция' }
            ]}
            color={colors.purple}
          />

          <DataBox
            label="Normal Derivation"
            data={[
              { key: 'Уровни', value: 'Change, Address Index' },
              { key: 'Индекс', value: '< 2³¹ (0-2,147,483,647)' },
              { key: 'Требует', value: 'Public key (можно)' },
              { key: 'Использование', value: 'Генерация адресов' }
            ]}
            color={colors.orange}
          />
        </FlowRow>

        {/* Result */}
        <FlowNode
          label="Результат"
          sublabel="bc1q... (Native SegWit адрес для получения Bitcoin)"
          color={colors.bitcoin}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
