import React from 'react';
import { DiagramContainer, FlowColumn, FlowRow, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const WalletTypeDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Эволюция типов Bitcoin кошельков">
      <FlowColumn gap={24}>
        {/* Type 1: JBOK */}
        <FlowNode
          label="1. JBOK (Just a Bunch Of Keys)"
          sublabel="Случайные независимые ключи"
          color={colors.orange}
        />

        <Arrow direction="down" />

        <DataBox
          label="Характеристики JBOK"
          data={[
            { key: 'Pros', value: 'Простота реализации' },
            { key: 'Cons', value: 'Нужен backup каждого ключа' },
            { key: 'Cons', value: 'Сложное управление' },
            { key: 'Cons', value: 'Невозможность восстановления' }
          ]}
          color={colors.orange}
        />

        <Arrow direction="down" label="Улучшение: детерминизм" />

        {/* Type 2: Deterministic */}
        <FlowNode
          label="2. Deterministic Wallet"
          sublabel="Все ключи из одного seed"
          color={colors.blue}
        />

        <Arrow direction="down" />

        <FlowRow gap={32}>
          <DataBox
            label="Pros"
            data={[
              { key: '✓', value: 'Один backup (seed)' },
              { key: '✓', value: 'Легкое восстановление' },
              { key: '✓', value: 'Предсказуемые адреса' }
            ]}
            color={colors.green}
          />

          <DataBox
            label="Cons"
            data={[
              { key: '✗', value: 'Линейная структура' },
              { key: '✗', value: 'Нет иерархии' },
              { key: '✗', value: 'Нет разделения' }
            ]}
            color={colors.orange}
          />
        </FlowRow>

        <Arrow direction="down" label="Улучшение: иерархия (BIP-32)" />

        {/* Type 3: HD Wallet */}
        <FlowNode
          label="3. HD Wallet (Hierarchical Deterministic)"
          sublabel="BIP-32: иерархическое дерево ключей"
          color={colors.purple}
        />

        <Arrow direction="down" />

        <DataBox
          label="Структура HD"
          data={[
            { key: 'Master', value: 'm' },
            { key: 'Purpose', value: "m/84'" },
            { key: 'Coin', value: "m/84'/0'" },
            { key: 'Account', value: "m/84'/0'/0'" },
            { key: 'Chain', value: "m/84'/0'/0'/0" },
            { key: 'Address', value: "m/84'/0'/0'/0/0" }
          ]}
          color={colors.purple}
        />

        <Arrow direction="down" />

        <FlowRow gap={32}>
          <DataBox
            label="Pros HD"
            data={[
              { key: '✓', value: 'Один seed для всего' },
              { key: '✓', value: 'Иерархическая организация' },
              { key: '✓', value: 'Разделение аккаунтов' },
              { key: '✓', value: 'Hardened derivation' },
              { key: '✓', value: 'Extended public keys' }
            ]}
            color={colors.green}
          />

          <DataBox
            label="Стандарты BIP"
            data={[
              { key: 'BIP-32', value: 'HD деривация' },
              { key: 'BIP-39', value: 'Mnemonic seed' },
              { key: 'BIP-44', value: 'Multi-account' },
              { key: 'BIP-84', value: 'Native SegWit' },
              { key: 'BIP-86', value: 'Taproot' }
            ]}
            color={colors.blue}
          />
        </FlowRow>

        <Arrow direction="down" />

        {/* Modern Standard */}
        <FlowNode
          label="Современный стандарт"
          sublabel="HD Wallet + BIP-39 + BIP-44/84/86"
          color={colors.bitcoin}
        />

        {/* Evolution Summary */}
        <DataBox
          label="Прогрессия"
          data={[
            { key: 'JBOK', value: 'Много backups → HD: Один backup' },
            { key: 'Det', value: 'Линейный → HD: Иерархия' },
            { key: 'HD', value: 'Гибкость + Безопасность + Удобство' }
          ]}
          color={colors.green}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
