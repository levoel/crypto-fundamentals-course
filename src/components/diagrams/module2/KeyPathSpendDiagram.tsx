import React from 'react';
import {
  DiagramContainer,
  FlowRow,
  FlowColumn,
  FlowNode,
  Arrow,
  colors,
  DataBox,
} from '@primitives';

export const KeyPathSpendDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Key Path Spend (Трата через ключ)">
      <FlowColumn>
        {/* Header */}
        <FlowNode color={colors.primary} style={{ padding: '16px' }}>
          <strong>Key Path Spend - Самый эффективный способ</strong><br />
          Одна Schnorr подпись, выглядит как обычный платеж
        </FlowNode>

        <Arrow direction="down" />

        {/* Taproot Output */}
        <DataBox label="Taproot Output (UTXO)" style={{ backgroundColor: colors.secondary + '20' }}>
          <strong>Output Key:</strong><br />
          <code style={{ fontSize: '12px' }}>K = Internal_Key + tweak·G</code><br />
          <em>(содержит скрытые скрипты в tweak)</em>
        </DataBox>

        <Arrow direction="down" label="Alice хочет потратить" />

        {/* Spending Process */}
        <FlowRow style={{ gap: '30px', alignItems: 'flex-start' }}>
          {/* Step 1: Private Key */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.secondary} style={{ padding: '12px' }}>
              <strong>Шаг 1</strong><br />
              Приватный ключ
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.secondary + '20' }}>
              Alice владеет<br />
              приватным ключом<br />
              для Internal Key<br />
              <br />
              <code style={{ fontSize: '11px' }}>
                priv_key
              </code>
            </DataBox>
          </FlowColumn>

          {/* Step 2: Adjust Key */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.accent} style={{ padding: '12px' }}>
              <strong>Шаг 2</strong><br />
              Корректировка
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.accent + '20' }}>
              Добавить tweak<br />
              к приватному ключу<br />
              <br />
              <code style={{ fontSize: '11px' }}>
                priv_key' =<br />
                priv_key + tweak
              </code>
            </DataBox>
          </FlowColumn>

          {/* Step 3: Sign */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.success} style={{ padding: '12px' }}>
              <strong>Шаг 3</strong><br />
              Подпись
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.success + '20' }}>
              Создать Schnorr<br />
              подпись<br />
              <br />
              <code style={{ fontSize: '11px' }}>
                Schnorr_Sign(<br />
                &nbsp;&nbsp;priv_key', tx<br />
                )
              </code>
            </DataBox>
          </FlowColumn>
        </FlowRow>

        <Arrow direction="down" />

        {/* Transaction Structure */}
        <FlowNode color={colors.success} style={{ padding: '16px' }}>
          <strong>Транзакция в блокчейне</strong>
        </FlowNode>

        <Arrow direction="down" />

        <DataBox
          label="Witness (свидетель)"
          style={{ backgroundColor: colors.success + '20' }}
        >
          <strong>Только одна Schnorr подпись!</strong><br />
          <code style={{ fontSize: '12px' }}>
            witness: [64-byte Schnorr signature]
          </code><br />
          <br />
          ✅ Размер: 64 байта<br />
          ✅ Никаких скриптов не раскрыто<br />
          ✅ Выглядит как обычный перевод
        </DataBox>

        {/* Benefits */}
        <Arrow direction="down" label="Преимущества" />

        <FlowRow style={{ gap: '20px' }}>
          <DataBox
            label="Размер"
            style={{ flex: 1, backgroundColor: colors.primary + '20' }}
          >
            <strong>Минимальный</strong><br />
            ~57.5 vbytes<br />
            <br />
            Самый дешевый<br />
            способ траты
          </DataBox>

          <DataBox
            label="Приватность"
            style={{ flex: 1, backgroundColor: colors.accent + '20' }}
          >
            <strong>Максимальная</strong><br />
            Неотличим от<br />
            простого платежа<br />
            <br />
            MAST скрипты<br />
            остаются скрытыми
          </DataBox>

          <DataBox
            label="Эффективность"
            style={{ flex: 1, backgroundColor: colors.success + '20' }}
          >
            <strong>Оптимальная</strong><br />
            Одна подпись<br />
            быстрая валидация<br />
            <br />
            Schnorr<br />
            агрегация
          </DataBox>
        </FlowRow>

        {/* Comparison */}
        <DataBox
          label="Сравнение с Script Path"
          style={{ marginTop: '20px', backgroundColor: colors.warning + '20' }}
        >
          <FlowRow style={{ gap: '40px', justifyContent: 'space-around' }}>
            <div style={{ color: colors.success }}>
              <strong>Key Path:</strong><br />
              ✅ 64 байта (подпись)<br />
              ✅ Приватно<br />
              ✅ Дешево
            </div>
            <div>
              <strong>Script Path:</strong><br />
              📜 64+ байта (подпись + скрипт + proof)<br />
              📜 Раскрывает скрипт<br />
              📜 Дороже
            </div>
          </FlowRow>
        </DataBox>

        {/* Use Case */}
        <DataBox
          label="Когда использовать"
          style={{ marginTop: '10px', backgroundColor: colors.primary + '20' }}
        >
          ✅ Обычные платежи между пользователями<br />
          ✅ Когда владелец Internal Key доступен<br />
          ✅ Когда нужна максимальная эффективность и приватность
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
