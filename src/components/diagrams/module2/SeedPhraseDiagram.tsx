import React from 'react';
import { DiagramContainer, FlowColumn, FlowNode, Arrow, colors, DataBox } from '@primitives';

export const SeedPhraseDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Процесс генерации BIP-39 seed phrase">
      <FlowColumn gap={24}>
        {/* Step 1: Entropy */}
        <FlowNode
          label="1. Генерация энтропии"
          sublabel="128-256 бит случайных данных"
          color={colors.blue}
        />

        <Arrow direction="down" />

        <DataBox
          label="Энтропия (128 бит для 12 слов)"
          data={[
            { key: 'Bits', value: '128 бит (16 байт)' },
            { key: 'Hex', value: 'a1b2c3d4e5f6...' },
            { key: 'Source', value: 'CSPRNG (криптостойкий генератор)' }
          ]}
          color={colors.blue}
        />

        <Arrow direction="down" label="SHA-256" />

        {/* Step 2: Checksum */}
        <FlowNode
          label="2. Добавление контрольной суммы"
          sublabel="SHA-256(entropy) → первые биты"
          color={colors.green}
        />

        <Arrow direction="down" />

        <DataBox
          label="Checksum"
          data={[
            { key: '128 бит энтропии', value: '+ 4 бита checksum = 132 бита' },
            { key: '160 бит энтропии', value: '+ 5 бит checksum = 165 бит' },
            { key: '256 бит энтропии', value: '+ 8 бит checksum = 264 бита' }
          ]}
          color={colors.green}
        />

        <Arrow direction="down" label="Деление на группы" />

        {/* Step 3: Split into groups */}
        <FlowNode
          label="3. Разделение на 11-битные группы"
          sublabel="132 бита / 11 = 12 групп"
          color={colors.purple}
        />

        <Arrow direction="down" />

        <DataBox
          label="11-битные индексы"
          data={[
            { key: 'Группа 1', value: '00101010101 = 341' },
            { key: 'Группа 2', value: '11010110010 = 1714' },
            { key: '...', value: '...' },
            { key: 'Группа 12', value: '01001101100 = 620' }
          ]}
          color={colors.purple}
        />

        <Arrow direction="down" label="Поиск в словаре" />

        {/* Step 4: Map to words */}
        <FlowNode
          label="4. Преобразование в слова"
          sublabel="BIP-39 словарь: 2048 слов"
          color={colors.orange}
        />

        <Arrow direction="down" />

        <DataBox
          label="Mnemonic слова (12 слов)"
          data={[
            { key: 'Word 1 (341)', value: 'army' },
            { key: 'Word 2 (1714)', value: 'squirrel' },
            { key: '...', value: '...' },
            { key: 'Word 12 (620)', value: 'family' }
          ]}
          color={colors.orange}
        />

        <Arrow direction="down" label="PBKDF2 (2048 раундов)" />

        {/* Step 5: Key stretching */}
        <FlowNode
          label="5. Генерация seed"
          sublabel="PBKDF2(mnemonic, salt='mnemonic' + passphrase)"
          color={colors.bitcoin}
        />

        <Arrow direction="down" />

        {/* Final Seed */}
        <DataBox
          label="512-bit Seed"
          data={[
            { key: 'Length', value: '512 бит (64 байта)' },
            { key: 'Use', value: 'Master key для HD кошелька' },
            { key: 'Passphrase', value: 'Опциональная защита (25-е слово)' }
          ]}
          color={colors.bitcoin}
        />

        <Arrow direction="down" />

        {/* HD Wallet */}
        <FlowNode
          label="HD Wallet Master Key"
          sublabel="BIP-32: HMAC-SHA512(seed) → private key + chain code"
          color={colors.green}
        />
      </FlowColumn>
    </DiagramContainer>
  );
};
