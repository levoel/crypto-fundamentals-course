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

export const TaprootStructureDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Taproot структура (P2TR)">
      <FlowColumn>
        {/* Header */}
        <FlowNode color={colors.primary} style={{ padding: '16px' }}>
          <strong>Taproot Pay-to-Taproot (P2TR)</strong><br />
          Schnorr подписи + MAST скрипты
        </FlowNode>

        <Arrow direction="down" />

        {/* Key Construction */}
        <DataBox label="Построение ключа" style={{ backgroundColor: colors.secondary + '20' }}>
          <strong>Taproot Output Key = Internal Key + Tweak</strong>
        </DataBox>

        <Arrow direction="down" />

        <FlowRow style={{ gap: '30px', alignItems: 'flex-start' }}>
          {/* Internal Key */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.secondary} style={{ padding: '12px' }}>
              <strong>Internal Key</strong><br />
              (Внутренний ключ)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.secondary + '20' }}>
              Обычный публичный ключ<br />
              для key-path spend<br />
              <br />
              <code style={{ fontSize: '11px' }}>
                Q = P
              </code>
            </DataBox>
          </FlowColumn>

          {/* Plus Sign */}
          <div style={{ fontSize: '40px', marginTop: '60px', color: colors.primary }}>+</div>

          {/* Tweak */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.accent} style={{ padding: '12px' }}>
              <strong>Tweak</strong><br />
              (Корректировка)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.accent + '20' }}>
              Hash от MAST root<br />
              <br />
              <code style={{ fontSize: '11px' }}>
                t = Hash(P || MAST_root)
              </code>
            </DataBox>
          </FlowColumn>

          {/* Equals Sign */}
          <div style={{ fontSize: '40px', marginTop: '60px', color: colors.primary }}>=</div>

          {/* Output Key */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.success} style={{ padding: '12px' }}>
              <strong>Output Key</strong><br />
              (Выходной ключ)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.success + '20' }}>
              Ключ в блокчейне<br />
              <br />
              <code style={{ fontSize: '11px' }}>
                K = P + t·G
              </code>
            </DataBox>
          </FlowColumn>
        </FlowRow>

        {/* Two Spending Paths */}
        <Arrow direction="down" label="Два способа траты" />

        <FlowRow style={{ gap: '30px' }}>
          {/* Key Path Spend */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.success} style={{ padding: '16px' }}>
              <strong>1. Key Path Spend</strong><br />
              (Путь через ключ)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.success + '20' }}>
              ✅ Одна Schnorr подпись<br />
              ✅ Выглядит как обычный платеж<br />
              ✅ Минимальный размер<br />
              ✅ Максимальная приватность<br />
              <br />
              <em>Самый дешевый способ</em>
            </DataBox>

            <DataBox
              label="Пример"
              style={{ marginTop: '10px', fontSize: '12px' }}
            >
              Трата по подписи владельца<br />
              внутреннего ключа
            </DataBox>
          </FlowColumn>

          {/* Script Path Spend */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.warning} style={{ padding: '16px' }}>
              <strong>2. Script Path Spend</strong><br />
              (Путь через скрипт)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.warning + '20' }}>
              📜 Раскрывает один скрипт<br />
              📜 Merkle proof из MAST<br />
              📜 Выполняет условия скрипта<br />
              <br />
              <em>Используется для<br />сложных условий</em>
            </DataBox>

            <DataBox
              label="Пример"
              style={{ marginTop: '10px', fontSize: '12px' }}
            >
              Мультиподпись, timelock,<br />
              сложные условия
            </DataBox>
          </FlowColumn>
        </FlowRow>

        {/* Benefits */}
        <DataBox
          label="Преимущества Taproot"
          style={{ marginTop: '20px', backgroundColor: colors.primary + '20' }}
        >
          ✅ Гибкость: простые и сложные условия в одном формате<br />
          ✅ Приватность: key path не раскрывает альтернативные скрипты<br />
          ✅ Эффективность: key path дешевле всех других методов
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
