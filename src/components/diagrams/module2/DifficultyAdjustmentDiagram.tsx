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

export const DifficultyAdjustmentDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Корректировка сложности">
      <FlowColumn>
        {/* Adjustment Period */}
        <FlowNode color={colors.primary} style={{ padding: '16px' }}>
          <strong>Период корректировки</strong><br />
          Каждые 2016 блоков (~2 недели)
        </FlowNode>

        <Arrow direction="down" label="Измерение времени" />

        {/* Time Measurement */}
        <DataBox label="Фактическое время">
          Время создания 2016 блоков<br />
          Цель: 20,160 минут (14 дней)
        </DataBox>

        <Arrow direction="down" />

        {/* Three Scenarios */}
        <FlowRow style={{ gap: '30px' }}>
          {/* Too Fast */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.error} style={{ padding: '16px' }}>
              <strong>Слишком быстро</strong><br />
              {'<'} 14 дней
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.error + '20' }}>
              Время: 12 дней<br />
              ~8.5 мин/блок
            </DataBox>

            <Arrow direction="down" label="Увеличить" />

            <FlowNode color={colors.error} style={{ padding: '12px' }}>
              Сложность ↑<br />
              Target ↓<br />
              (меньше валидных хешей)
            </FlowNode>
          </FlowColumn>

          {/* Perfect */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.success} style={{ padding: '16px' }}>
              <strong>Идеально</strong><br />
              = 14 дней
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.success + '20' }}>
              Время: 14 дней<br />
              10 мин/блок
            </DataBox>

            <Arrow direction="down" label="Не менять" />

            <FlowNode color={colors.success} style={{ padding: '12px' }}>
              Сложность =<br />
              Target =<br />
              (без изменений)
            </FlowNode>
          </FlowColumn>

          {/* Too Slow */}
          <FlowColumn style={{ flex: 1 }}>
            <FlowNode color={colors.warning} style={{ padding: '16px' }}>
              <strong>Слишком медленно</strong><br />
              {'>'} 14 дней
            </FlowNode>

            <Arrow direction="down" />

            <DataBox style={{ backgroundColor: colors.warning + '20' }}>
              Время: 16 дней<br />
              ~11.4 мин/блок
            </DataBox>

            <Arrow direction="down" label="Уменьшить" />

            <FlowNode color={colors.warning} style={{ padding: '12px' }}>
              Сложность ↓<br />
              Target ↑<br />
              (больше валидных хешей)
            </FlowNode>
          </FlowColumn>
        </FlowRow>

        {/* Formula */}
        <DataBox
          label="Формула корректировки"
          style={{ marginTop: '20px', backgroundColor: colors.accent + '20' }}
        >
          <code>
            new_difficulty = old_difficulty × (20,160 мин / фактическое_время)
          </code><br />
          Ограничение: изменение не более чем в 4 раза
        </DataBox>
      </FlowColumn>
    </DiagramContainer>
  );
};
