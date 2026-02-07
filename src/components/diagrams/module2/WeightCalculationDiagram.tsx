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

export const WeightCalculationDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Расчет Weight Units (Вес транзакции)">
      <FlowColumn>
        {/* Formula */}
        <FlowNode color={colors.primary} style={{ padding: '16px', fontSize: '18px' }}>
          <strong>Формула расчета веса</strong><br />
          <code>Weight = Base Size × 4 + Witness Size × 1</code>
        </FlowNode>

        <Arrow direction="down" />

        {/* Block Limit */}
        <DataBox label="Лимит блока" style={{ backgroundColor: colors.accent + '20' }}>
          Максимум: <strong>4,000,000 weight units</strong><br />
          (вместо старых 1 MB = 1,000,000 байт)
        </DataBox>

        <Arrow direction="down" />

        {/* Comparison */}
        <FlowRow style={{ gap: '30px', alignItems: 'flex-start' }}>
          {/* Legacy Transaction */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.error} style={{ padding: '12px' }}>
              <strong>Legacy транзакция</strong><br />
              (без SegWit)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.error + '20' }}>
              <strong>Размер:</strong><br />
              Base: 250 байт<br />
              Witness: 0 байт<br />
              <em>(подписи в base)</em>
            </DataBox>

            <Arrow direction="down" label="Расчет" />

            <DataBox label="Weight" style={{ backgroundColor: colors.error + '30' }}>
              250 × 4 + 0 × 1 =<br />
              <strong>1,000 WU</strong>
            </DataBox>

            <Arrow direction="down" />

            <FlowNode color={colors.error} style={{ padding: '10px' }}>
              В блоке: ~4,000 TX<br />
              <em>(дороже)</em>
            </FlowNode>
          </FlowColumn>

          {/* SegWit Transaction */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.success} style={{ padding: '12px' }}>
              <strong>SegWit транзакция</strong><br />
              (с разделением)
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.success + '20' }}>
              <strong>Размер:</strong><br />
              Base: 100 байт<br />
              Witness: 150 байт<br />
              <em>(подписи отдельно)</em>
            </DataBox>

            <Arrow direction="down" label="Расчет" />

            <DataBox label="Weight" style={{ backgroundColor: colors.success + '30' }}>
              100 × 4 + 150 × 1 =<br />
              <strong>550 WU</strong>
            </DataBox>

            <Arrow direction="down" />

            <FlowNode color={colors.success} style={{ padding: '10px' }}>
              В блоке: ~7,200 TX<br />
              <em>(на 45% дешевле!)</em>
            </FlowNode>
          </FlowColumn>
        </FlowRow>

        {/* Comparison Table */}
        <DataBox
          label="Сравнение эффективности"
          style={{ marginTop: '20px', backgroundColor: colors.primary + '20' }}
        >
          <FlowRow style={{ gap: '40px', justifyContent: 'space-around' }}>
            <div>
              <strong>Legacy TX:</strong><br />
              250 байт = 1000 WU<br />
              Коэфф: 4.0
            </div>
            <div style={{ color: colors.success }}>
              <strong>SegWit TX:</strong><br />
              250 байт = 550 WU<br />
              Коэфф: 2.2<br />
              <strong>✅ Экономия 45%</strong>
            </div>
          </FlowRow>
        </DataBox>

        {/* Benefits */}
        <DataBox
          label="Преимущества"
          style={{ marginTop: '10px', backgroundColor: colors.accent + '20' }}
        >
          ✅ Witness data весит меньше (×1 vs ×4)<br />
          ✅ Больше транзакций в блоке<br />
          ✅ Ниже комиссии для SegWit транзакций
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
