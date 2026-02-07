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

export const MiningPoolDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Майнинг-пул (Mining Pool)">
      <FlowColumn>
        {/* Pool Server */}
        <FlowNode color={colors.primary} style={{ padding: '16px', fontSize: '18px' }}>
          <strong>Майнинг-пул (Pool Server)</strong><br />
          Координирует работу майнеров
        </FlowNode>

        <Arrow direction="down" label="Распределяет задачи" />

        {/* Miners */}
        <FlowRow style={{ gap: '20px', justifyContent: 'center' }}>
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.secondary} style={{ padding: '12px' }}>
              <strong>Майнер A</strong><br />
              30% хешрейта
            </FlowNode>
            <DataBox style={{ fontSize: '12px', marginTop: '8px' }}>
              Nonce: 0-100M<br />
              Shares: 30
            </DataBox>
          </FlowColumn>

          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.secondary} style={{ padding: '12px' }}>
              <strong>Майнер B</strong><br />
              50% хешрейта
            </FlowNode>
            <DataBox style={{ fontSize: '12px', marginTop: '8px' }}>
              Nonce: 100M-250M<br />
              Shares: 50
            </DataBox>
          </FlowColumn>

          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.secondary} style={{ padding: '12px' }}>
              <strong>Майнер C</strong><br />
              20% хешрейта
            </FlowNode>
            <DataBox style={{ fontSize: '12px', marginTop: '8px' }}>
              Nonce: 250M-300M<br />
              Shares: 20
            </DataBox>
          </FlowColumn>
        </FlowRow>

        <Arrow direction="down" label="Отправляют shares (частичные решения)" />

        {/* Block Found */}
        <FlowNode color={colors.success} style={{ padding: '16px' }}>
          <strong>Блок найден!</strong><br />
          Майнер B нашел валидный nonce<br />
          Награда: 6.25 BTC
        </FlowNode>

        <Arrow direction="down" label="Распределение наград" />

        {/* Reward Distribution */}
        <FlowRow style={{ gap: '20px' }}>
          <DataBox
            label="Майнер A"
            style={{ flex: 1, backgroundColor: colors.secondary + '20' }}
          >
            30 shares / 100 total<br />
            <strong>1.875 BTC (30%)</strong>
          </DataBox>

          <DataBox
            label="Майнер B"
            style={{ flex: 1, backgroundColor: colors.success + '20' }}
          >
            50 shares / 100 total<br />
            <strong>3.125 BTC (50%)</strong><br />
            (нашел блок)
          </DataBox>

          <DataBox
            label="Майнер C"
            style={{ flex: 1, backgroundColor: colors.secondary + '20' }}
          >
            20 shares / 100 total<br />
            <strong>1.25 BTC (20%)</strong>
          </DataBox>
        </FlowRow>

        {/* Pool Info */}
        <DataBox
          label="Преимущества пула"
          style={{ marginTop: '20px', backgroundColor: colors.accent + '20' }}
        >
          ✅ Стабильный доход (частые малые выплаты)<br />
          ✅ Меньше дисперсии<br />
          ⚠️ Комиссия пула: обычно 1-3%
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
