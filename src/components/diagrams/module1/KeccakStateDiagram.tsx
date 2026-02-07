import React from 'react';
import { DiagramContainer, FlowRow, colors } from '@primitives';

export const KeccakStateDiagram: React.FC = () => {
  return (
    <DiagramContainer title="Состояние Keccak: 5×5×64 бит">
      <FlowRow justify="center">
        <div style={{ position: 'relative', width: '300px', height: '280px' }}>
          {/* 3D-ish grid */}
          {Array.from({ length: 5 }).map((_, y) =>
            Array.from({ length: 5 }).map((_, x) => {
              const offsetX = x * 40 + y * 15;
              const offsetY = y * 35 + x * 5;

              return (
                <div
                  key={`${x}-${y}`}
                  style={{
                    position: 'absolute',
                    left: `${offsetX + 30}px`,
                    top: `${offsetY + 20}px`,
                    width: '35px',
                    height: '50px',
                    background: `${colors.primary}${20 + y * 10}`,
                    border: `1px solid ${colors.primary}60`,
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: colors.textMuted,
                  }}
                >
                  <span>[{x},{y}]</span>
                  <span style={{ fontSize: '8px' }}>64 bit</span>
                </div>
              );
            })
          )}
        </div>
      </FlowRow>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginTop: '24px',
      }}>
        {[
          { term: 'Lane', desc: 'Столбец из 64 бит: A[x,y,0..63]' },
          { term: 'Slice', desc: 'Горизонтальный слой: A[*,*,z]' },
          { term: 'State', desc: 'Полное состояние: 25 lanes = 1600 бит' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
            }}
          >
            <div style={{ color: colors.primary, fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>
              {item.term}
            </div>
            <div style={{ color: colors.textMuted, fontSize: '11px' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </DiagramContainer>
  );
};
