import React, { useState } from 'react';
import { DiagramContainer, FlowRow, FlowNode, Arrow, colors } from '@primitives';

export const HashFunctionDiagram: React.FC = () => {
  const [input, setInput] = useState('Hello');

  // Simple hash visualization (not real hash)
  const visualHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0').substring(0, 8) + '...';
  };

  const examples = [
    { input: 'Hello', size: '5 байт' },
    { input: 'Hello World!', size: '12 байт' },
    { input: 'Lorem ipsum dolor sit amet...', size: '26 байт' },
    { input: 'A'.repeat(1000), size: '1000 байт' },
  ];

  return (
    <DiagramContainer title="Хеш-функция: вход любой длины → выход фиксированной длины">
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '12px', color: colors.textMuted, display: 'block', marginBottom: '8px' }}>
          Введите текст:
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${colors.border}`,
            borderRadius: '6px',
            color: colors.text,
            fontFamily: 'monospace',
          }}
        />
      </div>

      <FlowRow justify="center" gap={24}>
        <div style={{ textAlign: 'center' }}>
          <FlowNode variant="primary" style={{ minWidth: '120px' }}>
            {input.length > 10 ? input.substring(0, 10) + '...' : input}
          </FlowNode>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
            {input.length} байт
          </div>
        </div>

        <Arrow direction="right" label="SHA-256" />

        <div style={{ textAlign: 'center' }}>
          <FlowNode variant="accent" style={{ minWidth: '120px', fontFamily: 'monospace' }}>
            {visualHash(input)}
          </FlowNode>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
            256 бит (32 байта)
          </div>
        </div>
      </FlowRow>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
      }}>
        <h5 style={{ color: colors.text, marginBottom: '12px', fontSize: '13px' }}>
          Примеры входов разной длины:
        </h5>
        {examples.map((ex, i) => (
          <FlowRow key={i} justify="space-between" style={{ marginBottom: '8px' }}>
            <span style={{ color: colors.textMuted, fontSize: '12px' }}>
              "{ex.input.length > 20 ? ex.input.substring(0, 20) + '...' : ex.input}" ({ex.size})
            </span>
            <span style={{ color: colors.primary, fontFamily: 'monospace', fontSize: '12px' }}>
              → 256 бит
            </span>
          </FlowRow>
        ))}
      </div>
    </DiagramContainer>
  );
};
