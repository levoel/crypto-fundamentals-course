/**
 * Mining Diagrams (BTC-06)
 *
 * Exports:
 * - MiningSimulator: Interactive nonce-grinding mining simulator with FNV hash
 * - HashTargetVisualization: Number-line hash-below-target with probability display
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  FNV hash -- deterministic, browser-safe (no SubtleCrypto)          */
/* ================================================================== */

/**
 * FNV-1a hash producing 16 hex chars (two 32-bit rounds concatenated).
 * NOT cryptographic -- purely for visual mining demo.
 */
function fnvHash(input: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x45d9f3b);
  h1 ^= h1 >>> 16;

  // Second round with different seed for 16 hex chars total
  let h2 = 0x6c62272e;
  for (let i = 0; i < input.length; i++) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x01000193);
  }
  h2 ^= h2 >>> 16;
  h2 = Math.imul(h2, 0x45d9f3b);
  h2 ^= h2 >>> 16;

  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

/* ================================================================== */
/*  Shared helpers                                                      */
/* ================================================================== */

function btnStyle(active: boolean, accentColor: string): React.CSSProperties {
  return {
    ...glassStyle,
    padding: '8px 16px',
    cursor: active ? 'pointer' : 'not-allowed',
    color: active ? accentColor : colors.textMuted,
    fontSize: 13,
    opacity: active ? 1 : 0.5,
    border: `1px solid ${active ? accentColor + '50' : colors.border}`,
    borderRadius: 8,
    background: active ? accentColor + '10' : 'rgba(255,255,255,0.03)',
  };
}

type Speed = 'step' | 'slow' | 'fast' | 'turbo';

const SPEED_LABELS: Record<Speed, string> = {
  step: 'Пошагово',
  slow: 'Медленно (500мс)',
  fast: 'Быстро (50мс)',
  turbo: 'Турбо (10мс)',
};

const SPEED_INTERVALS: Record<Speed, number> = {
  step: 0,
  slow: 500,
  fast: 50,
  turbo: 10,
};

/* ================================================================== */
/*  Genesis-like block header data                                      */
/* ================================================================== */

const HEADER_FIELDS = {
  version: '00000001',
  prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
  timestamp: '495fab29',
  nBits: '1d00ffff',
};

function buildHeaderString(nonce: number): string {
  return (
    HEADER_FIELDS.version +
    HEADER_FIELDS.prevHash.slice(0, 16) +
    HEADER_FIELDS.merkleRoot.slice(0, 16) +
    HEADER_FIELDS.timestamp +
    HEADER_FIELDS.nBits +
    nonce.toString(16).padStart(8, '0')
  );
}

/**
 * Check if hash meets target: first `leadingZeros` hex chars must be '0'.
 */
function hashMeetsTarget(hash: string, leadingZeros: number): boolean {
  for (let i = 0; i < leadingZeros && i < hash.length; i++) {
    if (hash[i] !== '0') return false;
  }
  return true;
}

/* ================================================================== */
/*  MiningSimulator                                                     */
/* ================================================================== */

export function MiningSimulator() {
  const [nonce, setNonce] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [speed, setSpeed] = useState<Speed>('step');
  const [mining, setMining] = useState(false);
  const [found, setFound] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const headerStr = buildHeaderString(nonce);
  const hash = fnvHash(headerStr);
  const meetsTarget = hashMeetsTarget(hash, difficulty);

  // Target string for display
  const targetDisplay = '0'.repeat(difficulty) + 'f'.repeat(16 - difficulty);

  // Stop mining when block found
  useEffect(() => {
    if (meetsTarget && mining) {
      setMining(false);
      setFound(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [meetsTarget, mining]);

  // Auto-mining interval
  useEffect(() => {
    if (mining && speed !== 'step') {
      intervalRef.current = setInterval(() => {
        setNonce((n) => n + 1);
      }, SPEED_INTERVALS[speed]);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mining, speed]);

  const handleStartStop = useCallback(() => {
    if (mining) {
      setMining(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setFound(false);
      setMining(true);
    }
  }, [mining]);

  const handleIncrement = useCallback(() => {
    setFound(false);
    setNonce((n) => n + 1);
  }, []);

  const handleReset = useCallback(() => {
    setMining(false);
    setFound(false);
    setNonce(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleDifficultyChange = useCallback((v: number) => {
    setDifficulty(v);
    setMining(false);
    setFound(false);
    setNonce(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Render hash with green matching prefix
  const renderHash = () => {
    return hash.split('').map((ch, i) => {
      const matchesTarget = i < difficulty && ch === '0';
      return (
        <span
          key={i}
          style={{
            color: matchesTarget ? '#4ade80' : found && meetsTarget ? '#4ade80' : colors.text,
            fontWeight: matchesTarget ? 700 : 400,
            fontFamily: 'monospace',
            fontSize: 18,
            transition: 'color 0.15s',
          }}
        >
          {ch}
        </span>
      );
    });
  };

  return (
    <DiagramContainer title="Майнинг-симулятор: поиск nonce" color="green">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top: header fields + hash result */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {/* Left: block header fields */}
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, marginBottom: 4 }}>
              Заголовок блока
            </div>
            {[
              { label: 'Version', value: HEADER_FIELDS.version },
              { label: 'Prev Hash', value: HEADER_FIELDS.prevHash.slice(0, 16) + '...' },
              { label: 'Merkle Root', value: HEADER_FIELDS.merkleRoot.slice(0, 16) + '...' },
              { label: 'Timestamp', value: HEADER_FIELDS.timestamp },
              { label: 'nBits', value: HEADER_FIELDS.nBits },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  ...glassStyle,
                  padding: '4px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                }}
              >
                <span style={{ color: colors.textMuted }}>{label}</span>
                <span style={{ fontFamily: 'monospace', color: colors.text }}>{value}</span>
              </div>
            ))}
            {/* Nonce - highlighted */}
            <div
              style={{
                ...glassStyle,
                padding: '6px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
                border: `1px solid ${colors.primary}50`,
                background: `${colors.primary}10`,
              }}
            >
              <span style={{ color: colors.primary, fontWeight: 600 }}>Nonce</span>
              <span style={{ fontFamily: 'monospace', color: colors.primary, fontWeight: 600, fontSize: 14 }}>
                {nonce}
              </span>
            </div>
          </div>

          {/* Right: hash result and target */}
          <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, marginBottom: 4 }}>
              Результат хеширования
            </div>
            <div
              style={{
                ...glassStyle,
                padding: '12px',
                border: `1px solid ${found && meetsTarget ? '#4ade80' : colors.border}`,
                background: found && meetsTarget ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Hash:</div>
              <div style={{ letterSpacing: 1, lineHeight: 1.6 }}>{renderHash()}</div>
            </div>
            <div style={{ ...glassStyle, padding: '12px' }}>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Target (цель):</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, color: colors.accent, letterSpacing: 1 }}>
                {targetDisplay}
              </div>
            </div>
            <InteractiveValue
              value={difficulty}
              onChange={handleDifficultyChange}
              min={1}
              max={5}
              label="Ведущие нули (сложность)"
            />
          </div>
        </div>

        {/* Status bar */}
        <div
          style={{
            ...glassStyle,
            padding: '10px 14px',
            textAlign: 'center',
            fontSize: 13,
            fontFamily: 'monospace',
            color: found && meetsTarget ? '#4ade80' : mining ? colors.accent : colors.textMuted,
            border: `1px solid ${found && meetsTarget ? '#4ade80' + '50' : colors.border}`,
            background: found && meetsTarget ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
          }}
        >
          {found && meetsTarget
            ? `Блок найден! Nonce: ${nonce} (hash < target)`
            : mining
              ? `Майнинг... Nonce: ${nonce}`
              : `Готов к майнингу. Nonce: ${nonce}`}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleIncrement}
            disabled={mining}
            style={btnStyle(!mining, colors.primary)}
          >
            +1 Nonce
          </button>
          <button
            onClick={handleStartStop}
            style={btnStyle(true, mining ? '#ef4444' : '#4ade80')}
          >
            {mining ? 'Стоп' : 'Старт майнинг'}
          </button>
          <button onClick={handleReset} style={btnStyle(true, colors.textMuted)}>
            Сброс
          </button>
        </div>

        {/* Speed selector */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(['step', 'slow', 'fast', 'turbo'] as Speed[]).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                ...glassStyle,
                padding: '5px 12px',
                cursor: 'pointer',
                fontSize: 12,
                color: speed === s ? colors.primary : colors.textMuted,
                background: speed === s ? `${colors.primary}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${speed === s ? colors.primary + '40' : colors.border}`,
                borderRadius: 6,
              }}
            >
              {SPEED_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  HashTargetVisualization                                              */
/* ================================================================== */

/**
 * Number-line visualization showing hash values vs target.
 * Hashes below target = green (valid), above = red (invalid).
 */
export function HashTargetVisualization() {
  const [difficulty, setDifficulty] = useState(2);

  // We use a 0-to-1 scale representing 0x0000..0000 to 0xFFFF..FFFF
  // Target position = (16^(16-difficulty)) / 16^16 = 16^(-difficulty) = 1/16^difficulty
  const targetFraction = Math.pow(16, -difficulty);
  const targetPercent = Math.min(targetFraction * 100, 100);

  // Generate sample hashes as points
  const sampleData = [
    { label: 'TX-A', input: 'sample_block_header_nonce_1' },
    { label: 'TX-B', input: 'sample_block_header_nonce_42' },
    { label: 'TX-C', input: 'sample_block_header_nonce_999' },
    { label: 'TX-D', input: 'sample_block_header_nonce_12345' },
    { label: 'TX-E', input: 'sample_block_header_nonce_0' },
    { label: 'TX-F', input: 'sample_block_header_nonce_77777' },
  ];

  const samples = sampleData.map((s) => {
    const h = fnvHash(s.input);
    // Map hash to 0..1 fraction (first 8 hex chars / 0xFFFFFFFF)
    const numericValue = parseInt(h.slice(0, 8), 16);
    const fraction = numericValue / 0xffffffff;
    return {
      label: s.label,
      hash: h,
      fraction,
      belowTarget: fraction < targetFraction,
    };
  });

  const barWidth = 520;
  const barHeight = 30;
  const barY = 80;

  return (
    <DiagramContainer title="Хеш ниже цели: лотерея Proof of Work" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <InteractiveValue
          value={difficulty}
          onChange={setDifficulty}
          min={1}
          max={5}
          label="Ведущие нули цели"
        />

        <div style={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <svg width={barWidth + 40} height={200} viewBox={`0 0 ${barWidth + 40} 200`}>
            {/* Axis labels */}
            <text x={20} y={barY - 10} fill={colors.textMuted} fontSize={10} fontFamily="monospace">
              0x0000...
            </text>
            <text
              x={barWidth + 20}
              y={barY - 10}
              fill={colors.textMuted}
              fontSize={10}
              fontFamily="monospace"
              textAnchor="end"
            >
              0xFFFF...
            </text>

            {/* Full range bar */}
            <rect
              x={20}
              y={barY}
              width={barWidth}
              height={barHeight}
              fill="rgba(255,255,255,0.05)"
              stroke={colors.border}
              rx={4}
            />

            {/* Target zone (green region) */}
            <rect
              x={20}
              y={barY}
              width={Math.max(targetPercent * barWidth / 100, 2)}
              height={barHeight}
              fill="rgba(74,222,128,0.2)"
              rx={4}
            />

            {/* Target line */}
            <line
              x1={20 + targetPercent * barWidth / 100}
              y1={barY - 5}
              x2={20 + targetPercent * barWidth / 100}
              y2={barY + barHeight + 5}
              stroke="#4ade80"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
            <text
              x={20 + Math.min(targetPercent * barWidth / 100 + 4, barWidth - 40)}
              y={barY - 12}
              fill="#4ade80"
              fontSize={10}
              fontFamily="monospace"
            >
              Target
            </text>

            {/* Sample hash points */}
            {samples.map((s, i) => {
              const x = 20 + s.fraction * barWidth;
              const y = barY + barHeight + 20 + i * 22;
              const dotY = barY + barHeight / 2;
              return (
                <g key={s.label}>
                  {/* Dot on bar */}
                  <circle
                    cx={x}
                    cy={dotY}
                    r={4}
                    fill={s.belowTarget ? '#4ade80' : '#ef4444'}
                    stroke={s.belowTarget ? '#4ade80' : '#ef4444'}
                    strokeWidth={1}
                  />
                  {/* Label below */}
                  <line
                    x1={x}
                    y1={barY + barHeight}
                    x2={x}
                    y2={y - 6}
                    stroke={s.belowTarget ? '#4ade80' + '40' : '#ef4444' + '40'}
                    strokeWidth={0.5}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    fill={s.belowTarget ? '#4ade80' : '#ef4444'}
                    fontSize={9}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {s.label}: {s.hash.slice(0, 6)}...
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <DataBox
            label="Вероятность"
            value={`target / 2^64 = 1 / 16^${difficulty} = 1 / ${Math.pow(16, difficulty).toLocaleString()}`}
            variant="default"
          />
          <DataBox
            label="Валидные хеши"
            value={`${samples.filter((s) => s.belowTarget).length} из ${samples.length}`}
            variant="highlight"
          />
        </div>

        <div style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', maxWidth: 480 }}>
          Зеленая зона -- хеши меньше цели (валидный блок).
          Красные точки -- хеши выше цели (не прошли PoW).
          Чем больше ведущих нулей, тем уже зеленая зона и тем больше попыток нужно.
        </div>
      </div>
    </DiagramContainer>
  );
}
