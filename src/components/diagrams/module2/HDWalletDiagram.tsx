import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const HDWalletDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Иерархическое дерево HD кошелька (BIP-32)">
      <FlowColumn gap={24}>
        {/* Master Key */}
        <FlowNode
          label="Master Key (m)"
          sublabel="Seed → HMAC-SHA512 → (private key, chain code)"
          color={colors.bitcoin}
        />

        <Arrow direction="down" label="Level 0" />

        {/* Purpose Level */}
        <DataBox
          label="Purpose (m/purpose')"
          data={[
            { key: "44'", value: 'BIP-44 (Legacy)' },
            { key: "49'", value: 'BIP-49 (SegWit wrapped)' },
            { key: "84'", value: 'BIP-84 (Native SegWit)' },
            { key: "86'", value: 'BIP-86 (Taproot)' }
          ]}
          color={colors.blue}
        />

        <Arrow direction="down" label="Level 1 (hardened)" />

        {/* Coin Type Level */}
        <DataBox
          label="Coin Type (m/purpose'/coin_type')"
          data={[
            { key: "0'", value: 'Bitcoin' },
            { key: "1'", value: 'Bitcoin Testnet' },
            { key: "2'", value: 'Litecoin' },
            { key: "60'", value: 'Ethereum' }
          ]}
          color={colors.green}
        />

        <Arrow direction="down" label="Level 2 (hardened)" />

        {/* Account Level */}
        <FlowNode
          label="Account (m/purpose'/coin_type'/account')"
          sublabel="Разные аккаунты пользователя (0', 1', 2', ...)"
          color={colors.purple}
        />

        <Arrow direction="down" label="Level 3 (hardened)" />

        {/* Change Level */}
        <FlowRow gap={32}>
          <FlowNode
            label="External Chain (0)"
            sublabel="Адреса для получения"
            color={colors.orange}
          />
          <FlowNode
            label="Internal Chain (1)"
            sublabel="Адреса сдачи"
            color={colors.orange}
          />
        </FlowRow>

        <Arrow direction="down" label="Level 4 (normal)" />

        {/* Address Index Level */}
        <DataBox
          label="Address Index (m/purpose'/coin_type'/account'/change/address_index)"
          data={[
            { key: 'Index 0', value: 'Первый адрес' },
            { key: 'Index 1', value: 'Второй адрес' },
            { key: 'Index 2', value: 'Третий адрес' },
            { key: '...', value: 'До 2³¹ - 1 адресов' }
          ]}
          color={colors.blue}
        />

        <Arrow direction="down" label="Level 5 (normal)" />

        {/* Example Path */}
        <FlowNode
          label="Пример: m/84'/0'/0'/0/0"
          sublabel="Native SegWit, Bitcoin, Account 0, External, Address 0"
          color={colors.green}
        />

        {/* Hardened vs Normal */}
        <DataBox
          label="Типы деривации"
          data={[
            { key: "Hardened (')", value: 'Требует private key, более безопасно' },
            { key: 'Normal', value: 'Можно с public key, для адресов' }
          ]}
          color={colors.purple}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
