import React, { useState } from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, colors, DataBox, Grid } from '@primitives';

export const ModularOperationsDiagram: React.FC = () => {
  const [a, setA] = useState(17);
  const [b, setB] = useState(23);
  const [n, setN] = useState(7);

  const addResult = (a + b) % n;
  const mulResult = (a * b) % n;
  const powResult = Number(BigInt(a) ** BigInt(b) % BigInt(n));

  return (
    <DiagramContainer title="Модулярные операции">
      <Grid columns={3} gap={12} style={{ marginBottom: '24px' }}>
        <div>
          <label style={{ fontSize: '12px', color: colors.textMuted }}>a = </label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: '60px',
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              color: colors.text,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: colors.textMuted }}>b = </label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              width: '60px',
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              color: colors.text,
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: colors.textMuted }}>mod = </label>
          <input
            type="number"
            value={n}
            onChange={(e) => setN(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: '60px',
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              color: colors.text,
            }}
          />
        </div>
      </Grid>

      <Grid columns={1} gap={16}>
        {/* Addition */}
        <FlowRow gap={8}>
          <FlowNode variant="primary" size="sm">{a}</FlowNode>
          <span style={{ color: colors.textMuted }}>+</span>
          <FlowNode variant="primary" size="sm">{b}</FlowNode>
          <span style={{ color: colors.textMuted }}>mod {n}</span>
          <Arrow direction="right" />
          <FlowNode variant="accent" size="sm">{addResult}</FlowNode>
        </FlowRow>

        {/* Multiplication */}
        <FlowRow gap={8}>
          <FlowNode variant="primary" size="sm">{a}</FlowNode>
          <span style={{ color: colors.textMuted }}>×</span>
          <FlowNode variant="primary" size="sm">{b}</FlowNode>
          <span style={{ color: colors.textMuted }}>mod {n}</span>
          <Arrow direction="right" />
          <FlowNode variant="accent" size="sm">{mulResult}</FlowNode>
        </FlowRow>

        {/* Exponentiation */}
        <FlowRow gap={8}>
          <FlowNode variant="primary" size="sm">{a}</FlowNode>
          <span style={{ color: colors.textMuted, fontSize: '12px', verticalAlign: 'super' }}>{b}</span>
          <span style={{ color: colors.textMuted }}>mod {n}</span>
          <Arrow direction="right" />
          <FlowNode variant="accent" size="sm">{powResult}</FlowNode>
        </FlowRow>
      </Grid>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '8px',
        fontSize: '13px',
        color: colors.textMuted,
      }}>
        <strong style={{ color: colors.primary }}>Свойство:</strong> Результат операции по модулю n всегда находится в диапазоне [0, n-1]
      </div>
    </DiagramContainer>
  );
};
