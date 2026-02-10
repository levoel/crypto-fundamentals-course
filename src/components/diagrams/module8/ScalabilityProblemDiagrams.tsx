/**
 * Scalability Problem Diagrams (SCALE-01)
 *
 * Exports:
 * - BlockchainTrilemmaDiagram: Interactive trilemma triangle with sliders and preset buttons
 * - TPSComparisonDiagram: Static horizontal bar chart comparing TPS across chains
 * - ScalingTimelineDiagram: Static horizontal timeline of Ethereum scaling (2015-2026)
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  BlockchainTrilemmaDiagram                                           */
/* ================================================================== */

interface TrilemmaPreset {
  name: string;
  scalability: number;
  security: number;
  decentralization: number;
  tps: string;
  nodes: string;
  color: string;
  tooltipRu: string;
}

const TRILEMMA_PRESETS: TrilemmaPreset[] = [
  { name: 'Ethereum L1', scalability: 15, security: 95, decentralization: 90, tps: '~15-30 TPS', nodes: '~800k validators', color: '#6366f1', tooltipRu: 'Ethereum L1 жертвует масштабируемостью ради максимальной безопасности и децентрализации. ~800k валидаторов делают сеть практически неатакуемой, но throughput ограничен ~15-30 TPS.' },
  { name: 'Solana', scalability: 80, security: 75, decentralization: 40, tps: '~400-4,000 TPS', nodes: '~2,000 validators', color: '#10b981', tooltipRu: 'Solana оптимизирует масштабируемость через высокие требования к hardware (validator cost ~$1000/мес). Результат: высокий TPS, но меньше валидаторов и централизованная инфраструктура.' },
  { name: 'BSC', scalability: 70, security: 55, decentralization: 15, tps: '~300 TPS', nodes: '21 validators', color: '#f59e0b', tooltipRu: 'BSC (BNB Smart Chain) -- крайний случай: всего 21 валидатор (PoSA). Высокая пропускная способность за счет полной централизации. По сути, это корпоративный блокчейн Binance.' },
  { name: 'Rollups', scalability: 85, security: 90, decentralization: 60, tps: '~2,000-10,000 TPS', nodes: 'L1 validators', color: '#a78bfa', tooltipRu: 'Rollups обходят трилемму: execution на L2 (масштабируемость), security от L1 (все данные на Ethereum), decentralization через открытые sequencers и shared provers.' },
];

/**
 * BlockchainTrilemmaDiagram
 *
 * SVG equilateral triangle with 3 vertices: Scalability, Security, Decentralization.
 * 3 sliders adjust the inner point. Preset buttons show where projects optimize.
 */
export function BlockchainTrilemmaDiagram() {
  const [scalability, setScalability] = useState(50);
  const [security, setSecurity] = useState(50);
  const [decentralization, setDecentralization] = useState(50);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const svgW = 340;
  const svgH = 300;
  const cx = svgW / 2;
  const cy = svgH / 2 + 10;
  const r = 110;

  // Triangle vertices: top = Scalability, bottom-left = Security, bottom-right = Decentralization
  const vertices = useMemo(() => ({
    scalability: { x: cx, y: cy - r, label: 'Scalability' },
    security: { x: cx - r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6), label: 'Security' },
    decentralization: { x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6), label: 'Decentralization' },
  }), []);

  const trianglePoints = `${vertices.scalability.x},${vertices.scalability.y} ${vertices.security.x},${vertices.security.y} ${vertices.decentralization.x},${vertices.decentralization.y}`;

  // Compute inner point based on sliders (barycentric coordinates)
  const total = scalability + security + decentralization || 1;
  const innerX = (scalability * vertices.scalability.x + security * vertices.security.x + decentralization * vertices.decentralization.x) / total;
  const innerY = (scalability * vertices.scalability.y + security * vertices.security.y + decentralization * vertices.decentralization.y) / total;

  const applyPreset = (preset: TrilemmaPreset) => {
    setScalability(preset.scalability);
    setSecurity(preset.security);
    setDecentralization(preset.decentralization);
    setActivePreset(preset.name);
  };

  const currentPreset = TRILEMMA_PRESETS.find((p) => p.name === activePreset);

  return (
    <DiagramContainer title="Трилемма блокчейна" color="blue">
      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TRILEMMA_PRESETS.map((preset) => (
          <DiagramTooltip key={preset.name} content={preset.tooltipRu}>
            <div>
              <button
                onClick={() => applyPreset(preset)}
                style={{
                  ...glassStyle,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: activePreset === preset.name ? preset.color : colors.textMuted,
                  border: `1px solid ${activePreset === preset.name ? preset.color : 'rgba(255,255,255,0.1)'}`,
                  background: activePreset === preset.name ? `${preset.color}15` : 'rgba(255,255,255,0.03)',
                  borderRadius: 6,
                  transition: 'all 0.2s',
                }}
              >
                {preset.name}
              </button>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* SVG Triangle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {/* Triangle outline */}
          <polygon
            points={trianglePoints}
            fill="rgba(99,102,241,0.06)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />

          {/* Grid lines (3 levels) */}
          {[0.33, 0.66].map((t) => {
            const p1x = vertices.scalability.x + (vertices.security.x - vertices.scalability.x) * t;
            const p1y = vertices.scalability.y + (vertices.security.y - vertices.scalability.y) * t;
            const p2x = vertices.scalability.x + (vertices.decentralization.x - vertices.scalability.x) * t;
            const p2y = vertices.scalability.y + (vertices.decentralization.y - vertices.scalability.y) * t;
            return <line key={t} x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />;
          })}

          {/* Lines from center to vertices */}
          <line x1={innerX} y1={innerY} x2={vertices.scalability.x} y2={vertices.scalability.y} stroke="rgba(99,102,241,0.3)" strokeWidth={1} strokeDasharray="4,3" />
          <line x1={innerX} y1={innerY} x2={vertices.security.x} y2={vertices.security.y} stroke="rgba(99,102,241,0.3)" strokeWidth={1} strokeDasharray="4,3" />
          <line x1={innerX} y1={innerY} x2={vertices.decentralization.x} y2={vertices.decentralization.y} stroke="rgba(99,102,241,0.3)" strokeWidth={1} strokeDasharray="4,3" />

          {/* Inner point */}
          <circle cx={innerX} cy={innerY} r={7} fill={currentPreset?.color || '#6366f1'} opacity={0.9} />
          <circle cx={innerX} cy={innerY} r={3} fill="white" opacity={0.8} />

          {/* Vertex labels */}
          <text x={vertices.scalability.x} y={vertices.scalability.y - 14} fill={colors.text} fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
            Scalability
          </text>
          <text x={vertices.scalability.x} y={vertices.scalability.y - 3} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            {scalability}%
          </text>
          <text x={vertices.security.x - 8} y={vertices.security.y + 18} fill={colors.text} fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
            Security
          </text>
          <text x={vertices.security.x - 8} y={vertices.security.y + 29} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            {security}%
          </text>
          <text x={vertices.decentralization.x + 8} y={vertices.decentralization.y + 18} fill={colors.text} fontSize={11} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
            Decentralization
          </text>
          <text x={vertices.decentralization.x + 8} y={vertices.decentralization.y + 29} fill={colors.textMuted} fontSize={9} textAnchor="middle" fontFamily="monospace">
            {decentralization}%
          </text>
        </svg>
      </div>

      {/* Vertex tooltips below SVG */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <DiagramTooltip content="Масштабируемость -- способность обрабатывать больше транзакций. Измеряется в TPS (transactions per second). Ethereum L1 ~15-30 TPS, Visa ~65,000 TPS. Разница в 1000x -- проблема, которую решают L2.">
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6366f1', padding: '3px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            Scalability: {scalability}%
          </span>
        </DiagramTooltip>
        <DiagramTooltip content="Безопасность -- устойчивость к атакам (51% attack, double spend, censorship). Зависит от количества и diversity валидаторов, стоимости атаки, и криптографических гарантий.">
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#10b981', padding: '3px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            Security: {security}%
          </span>
        </DiagramTooltip>
        <DiagramTooltip content="Децентрализация -- распределение контроля между участниками. Больше независимых валидаторов = больше устойчивости к цензуре и единым точкам отказа. Ethereum: ~800k валидаторов, BSC: 21.">
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#f59e0b', padding: '3px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            Decentralization: {decentralization}%
          </span>
        </DiagramTooltip>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Scalability', value: scalability, setter: setScalability, color: '#6366f1' },
          { label: 'Security', value: security, setter: setSecurity, color: '#10b981' },
          { label: 'Decentralization', value: decentralization, setter: setDecentralization, color: '#f59e0b' },
        ].map(({ label, value, setter, color }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color, fontFamily: 'monospace', marginBottom: 4, textAlign: 'center' }}>
              {label}: {value}
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              onChange={(e) => { setter(Number(e.target.value)); setActivePreset(null); }}
              style={{ width: '100%', accentColor: color }}
            />
          </div>
        ))}
      </div>

      {/* Preset info */}
      {currentPreset && (
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 12,
          border: `1px solid ${currentPreset.color}30`,
        }}>
          <DiagramTooltip content={currentPreset.tooltipRu}>
            <span style={{ fontSize: 13, fontWeight: 600, color: currentPreset.color, fontFamily: 'monospace', marginBottom: 6, display: 'inline-block' }}>
              {currentPreset.name}
            </span>
          </DiagramTooltip>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, fontFamily: 'monospace' }}>
              <span style={{ color: colors.textMuted }}>TPS: </span>
              <span style={{ color: colors.text }}>{currentPreset.tps}</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: 'monospace' }}>
              <span style={{ color: colors.textMuted }}>Nodes: </span>
              <span style={{ color: colors.text }}>{currentPreset.nodes}</span>
            </div>
          </div>
        </div>
      )}

      <DataBox
        label="Ключевой инсайт"
        value="Блокчейн может оптимизировать максимум 2 из 3 свойств. Rollups -- попытка обойти ограничение, вынося execution на L2 при сохранении security и data availability на L1."
        variant="highlight"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  TPSComparisonDiagram                                                */
/* ================================================================== */

interface TPSEntry {
  name: string;
  tps: number;
  tpsLabel: string;
  finality: string;
  color: string;
  tooltipRu: string;
}

const TPS_DATA: TPSEntry[] = [
  { name: 'Bitcoin', tps: 7, tpsLabel: '~7 TPS', finality: '~60 min', color: '#f59e0b', tooltipRu: 'Bitcoin: ~7 TPS с финальностью ~60 минут (6 подтверждений). Приоритет -- безопасность и decentralization. 10-минутные блоки по 1 MB делают масштабирование невозможным без Lightning Network.' },
  { name: 'Ethereum L1', tps: 27, tpsLabel: '~15-30 TPS', finality: '~12 min', color: '#6366f1', tooltipRu: 'Ethereum L1: ~15-30 TPS с финальностью ~12 минут (2 epochs). Блоки каждые 12 секунд, gas limit ~30M. Settlement layer для rollups, а не для direct user transactions.' },
  { name: 'Optimism', tps: 2000, tpsLabel: '~2,000 TPS', finality: '~7 days (L1)', color: '#ef4444', tooltipRu: 'Optimism: ~2,000 TPS с L1 финальностью ~7 дней (challenge period для fraud proofs). Optimistic rollup на OP Stack. Быстрый soft confirmation (~2с), но L1-финальность требует ожидания.' },
  { name: 'Arbitrum', tps: 4000, tpsLabel: '~4,000 TPS', finality: '~7 days (L1)', color: '#2563eb', tooltipRu: 'Arbitrum: ~4,000 TPS, Nitro VM (WASM). L1 финальность ~7 дней. Interactive fraud proof -- валидаторы играют в bisection game для нахождения спорной инструкции.' },
  { name: 'Solana', tps: 4000, tpsLabel: '~400-4,000 TPS', finality: '~0.4s', color: '#10b981', tooltipRu: 'Solana: ~400-4,000 TPS с финальностью ~0.4с (single slot confirmation). Proof of History + Tower BFT. Высокие требования к hardware (~$1000/мес для validator).' },
  { name: 'zkSync Era', tps: 10000, tpsLabel: '~10,000+ TPS (target)', finality: '~hours', color: '#a78bfa', tooltipRu: 'zkSync Era: целевой ~10,000+ TPS. ZK rollup с validity proofs (PLONK-based SNARKs). Финальность зависит от batch posting и proof generation (~часы). Native account abstraction.' },
  { name: 'Visa', tps: 65000, tpsLabel: '~65,000 TPS', finality: '~seconds', color: '#6b7280', tooltipRu: 'Visa: ~65,000 TPS -- benchmark centralized системы. Полностью централизованная инфраструктура. Блокчейны стремятся к comparable throughput при сохранении decentralization.' },
];

/**
 * TPSComparisonDiagram
 *
 * Horizontal bar chart comparing TPS across chains.
 * Log scale for bar widths to handle the wide range.
 * Hover migrated from SVG to HTML DiagramTooltip legend below chart.
 */
export function TPSComparisonDiagram() {
  const svgW = 480;
  const barH = 28;
  const gap = 6;
  const padL = 90;
  const padR = 120;
  const svgH = TPS_DATA.length * (barH + gap) + 20;
  const chartW = svgW - padL - padR;

  const maxLog = Math.log10(65000);

  return (
    <DiagramContainer title="Сравнение пропускной способности (TPS)" color="green">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
          {TPS_DATA.map((entry, i) => {
            const y = i * (barH + gap) + 6;
            const w = (Math.log10(Math.max(entry.tps, 1)) / maxLog) * chartW;

            return (
              <g key={i}>
                {/* Name label */}
                <text
                  x={padL - 8}
                  y={y + barH / 2 + 4}
                  fill={colors.text}
                  fontSize={10}
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {entry.name}
                </text>
                {/* Bar */}
                <rect
                  x={padL}
                  y={y}
                  width={Math.max(w, 4)}
                  height={barH}
                  fill={entry.color}
                  opacity={0.6}
                  rx={4}
                />
                {/* TPS label */}
                <text
                  x={padL + Math.max(w, 4) + 8}
                  y={y + barH / 2 + 1}
                  fill={entry.color}
                  fontSize={10}
                  fontFamily="monospace"
                  dominantBaseline="middle"
                >
                  {entry.tpsLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Chain details legend (replaces SVG hover) */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, justifyContent: 'center' }}>
        {TPS_DATA.map((entry) => (
          <DiagramTooltip key={entry.name} content={entry.tooltipRu}>
            <span style={{
              fontSize: 9,
              fontFamily: 'monospace',
              color: entry.color,
              padding: '2px 8px',
              borderRadius: 4,
              background: `${entry.color}10`,
              border: `1px solid ${entry.color}25`,
              cursor: 'pointer',
            }}>
              {entry.name}: {entry.finality}
            </span>
          </DiagramTooltip>
        ))}
      </div>

      <DataBox
        label="Примечание"
        value="TPS варьируется в зависимости от типа транзакции (простой перевод vs вызов смарт-контракта). Указаны приблизительные оценки для простых переводов."
        variant="info"
      />
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ScalingTimelineDiagram                                              */
/* ================================================================== */

interface TimelineEvent {
  year: number;
  label: string;
  description: string;
  category: 'channels' | 'plasma' | 'optimistic' | 'zk' | 'infra';
  tooltipRu: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  { year: 2015, label: 'Ethereum launch', description: '~15 TPS на L1', category: 'infra', tooltipRu: 'Запуск Ethereum Mainnet (30 июля 2015). Frontier release. ~15 TPS с Proof of Work. Начало эры smart contracts и проблемы масштабирования.' },
  { year: 2016, label: 'State channels research', description: 'Raiden Network, Connext', category: 'channels', tooltipRu: 'Первые исследования state channels для Ethereum. Raiden Network -- аналог Lightning Network для ETH. Ограничение: фиксированные участники, заблокированная ликвидность.' },
  { year: 2017, label: 'Plasma whitepaper', description: 'Poon & Buterin: child chains + Merkle roots', category: 'plasma', tooltipRu: 'Whitepaper от Joseph Poon и Vitalik Buterin. Идея: child chains с Merkle roots на L1. Казалось решением масштабирования, но data availability problem оказалась фатальной.' },
  { year: 2019, label: 'Matic Network (Plasma)', description: 'Первая production Plasma реализация', category: 'plasma', tooltipRu: 'Matic Network (позже Polygon) -- первая production реализация Plasma. Commit chain с PoS checkpoint на Ethereum. Позже перешли на zk-решения из-за ограничений Plasma.' },
  { year: 2019.5, label: 'Rollup papers', description: 'Optimistic + ZK rollup концепции', category: 'optimistic', tooltipRu: 'Публикация ключевых работ по rollups. John Adler -- optimistic rollups, Barry Whitehat -- ZK rollups. Ключевой инсайт: публикация данных на L1 решает data availability.' },
  { year: 2020, label: 'Rollup-centric roadmap', description: 'Виталик: Ethereum = settlement layer', category: 'infra', tooltipRu: 'Виталик объявляет rollup-centric roadmap. Ethereum отказывается от execution sharding. L1 = settlement + data availability. L2 rollups = execution. Поворотный момент в стратегии масштабирования.' },
  { year: 2021, label: 'Arbitrum + Optimism launch', description: 'Первые optimistic rollups в production', category: 'optimistic', tooltipRu: 'Запуск первых optimistic rollups: Arbitrum One (август) и Optimism (январь). Fraud proof модель с 7-дневным challenge period. Быстрый рост TVL и пользователей.' },
  { year: 2022, label: 'Arbitrum Nitro, zkSync Era', description: 'WASM execution, ZK rollup mainnet', category: 'zk', tooltipRu: 'Arbitrum Nitro -- переход на WASM execution (10x улучшение). zkSync Era -- первый general-purpose ZK rollup на mainnet. Начало эпохи ZK в production.' },
  { year: 2023, label: 'Polygon zkEVM, Scroll, Linea', description: 'Множество ZK rollups на mainnet', category: 'zk', tooltipRu: 'Взрывной рост ZK rollups: Polygon zkEVM, Scroll, Linea -- все на mainnet. Конкуренция между Type 1-4 zkEVM подходами. ZK становится доминирующей технологией.' },
  { year: 2024, label: 'EIP-4844 (Proto-Danksharding)', description: 'Blobs: 10-100x снижение комиссий L2', category: 'infra', tooltipRu: 'EIP-4844 (Dencun upgrade, март 2024). Введение blob transactions. L2 комиссии снижаются в 10-100x. Base становится крупнейшим L2 по volume. Газ на L2 < $0.01.' },
  { year: 2024.5, label: 'Base -- крупнейший L2', description: 'Coinbase L2 (OP Stack) по TVL', category: 'optimistic', tooltipRu: 'Base (Coinbase) становится крупнейшим L2 по daily transactions. OP Stack позволяет быстрый запуск rollup. Institutional adoption L2 технологии.' },
  { year: 2025, label: 'Pectra upgrade', description: '6 blobs/block (удвоение throughput)', category: 'infra', tooltipRu: 'Pectra upgrade (2025) увеличивает blob capacity с 3 до 6 blobs/block. Удвоение L2 data bandwidth. Снижение комиссий L2 еще в 2x. Шаг к full Danksharding.' },
  { year: 2026, label: 'Full Danksharding (target)', description: 'Полный data sharding для L2', category: 'infra', tooltipRu: 'Целевой Full Danksharding -- 64+ blobs/block через Data Availability Sampling (DAS). Финальное решение data availability для L2. Ethereum становится полноценным DA layer.' },
];

const categoryColors: Record<string, string> = {
  channels: '#f43f5e',
  plasma: '#f59e0b',
  optimistic: '#2563eb',
  zk: '#a78bfa',
  infra: '#10b981',
};

const categoryLabels: Record<string, string> = {
  channels: 'State Channels',
  plasma: 'Plasma',
  optimistic: 'Optimistic Rollups',
  zk: 'ZK Rollups',
  infra: 'Infrastructure',
};

const CATEGORY_TOOLTIPS: Record<string, string> = {
  channels: 'State Channels -- оффчейн протоколы между фиксированными участниками. Примеры: Lightning Network (Bitcoin), Raiden (Ethereum). Ограничены по применимости.',
  plasma: 'Plasma -- child chains с Merkle roots на L1. Проблема data availability сделала подход непрактичным. Исторически важный шаг к rollups.',
  optimistic: 'Optimistic Rollups -- execution на L2, данные на L1, fraud proofs для безопасности. 7-дневный challenge period для L1 финальности.',
  zk: 'ZK Rollups -- execution на L2, данные на L1, validity proofs для мгновенной финальности. Более сложная технология, но без challenge period.',
  infra: 'Infrastructure -- обновления Ethereum L1, улучшающие data availability и throughput для L2 rollups.',
};

/**
 * ScalingTimelineDiagram
 *
 * Horizontal timeline from 2015 to 2026 showing Ethereum scaling milestones.
 * Color-coded by category. Click to expand description.
 */
export function ScalingTimelineDiagram() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <DiagramContainer title="Хронология масштабирования Ethereum" color="purple">
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <DiagramTooltip key={key} content={CATEGORY_TOOLTIPS[key]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: categoryColors[key] }} />
              <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>{label}</span>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Timeline cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 8,
        marginBottom: 16,
      }}>
        {TIMELINE_EVENTS.map((evt, i) => {
          const isSelected = selectedIdx === i;
          const evtColor = categoryColors[evt.category];

          return (
            <DiagramTooltip key={i} content={evt.tooltipRu}>
              <div
                onClick={() => setSelectedIdx(isSelected ? null : i)}
                style={{
                  ...glassStyle,
                  padding: 10,
                  cursor: 'pointer',
                  borderLeft: `3px solid ${evtColor}`,
                  background: isSelected ? `${evtColor}10` : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: evtColor, fontFamily: 'monospace', marginBottom: 2 }}>
                  {Math.floor(evt.year)}
                </div>
                <div style={{
                  fontSize: 10,
                  color: isSelected ? colors.text : colors.textMuted,
                  fontFamily: 'monospace',
                  lineHeight: 1.4,
                }}>
                  {evt.label}
                </div>
                {isSelected && (
                  <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 6, lineHeight: 1.4, fontStyle: 'italic' }}>
                    {evt.description}
                  </div>
                )}
              </div>
            </DiagramTooltip>
          );
        })}
      </div>

      <DataBox
        label="Ключевой момент"
        value="2020: Виталик объявляет rollup-centric roadmap. Ethereum отказывается от execution sharding в пользу L2 rollups. L1 становится settlement и data availability layer."
        variant="highlight"
      />
    </DiagramContainer>
  );
}
