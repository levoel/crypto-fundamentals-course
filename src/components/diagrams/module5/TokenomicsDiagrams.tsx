/**
 * Tokenomics Diagrams (DEFI-12)
 *
 * Exports:
 * - TokenDistributionDiagram: Interactive pie chart with protocol toggle (UNI/AAVE/CRV/COMP), DiagramTooltip on legend
 * - VestingScheduleDiagram: Vesting timeline with cliff and linear vesting (DiagramTooltip on period cards)
 */

import { useState, useMemo } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  TokenDistributionDiagram                                            */
/* ================================================================== */

interface TokenAllocation {
  category: string;
  percentage: number;
  color: string;
  amount: string;
  vesting: string;
  tooltipRu: string;
}

interface ProtocolTokenomics {
  name: string;
  symbol: string;
  totalSupply: string;
  vestingDuration: string;
  governance: string;
  allocations: TokenAllocation[];
}

const PROTOCOL_DATA: ProtocolTokenomics[] = [
  {
    name: 'Uniswap',
    symbol: 'UNI',
    totalSupply: '1,000,000,000 UNI',
    vestingDuration: '4 years',
    governance: 'Simple voting (1 UNI = 1 vote), delegation supported',
    allocations: [
      { category: 'Community', percentage: 60, color: colors.success, amount: '600M UNI', vesting: '4 years (governance treasury + LP mining)', tooltipRu: 'Community/Ecosystem (60%): treasury, grants, LP mining. Контролируется DAO governance. Основной источник protocol growth. Uniswap выделил рекордные 60% community.' },
      { category: 'Team', percentage: 21.27, color: colors.primary, amount: '212.7M UNI', vesting: '4-year vesting with 1-year cliff', tooltipRu: 'Team/Founders (21.27%): allocation для команды Uniswap. 4 года vesting с 1-год cliff. Стандартный подход для выравнивания стимулов команды с long-term успехом протокола.' },
      { category: 'Investors', percentage: 18.04, color: '#a78bfa', amount: '180.4M UNI', vesting: '4-year vesting with 1-year cliff', tooltipRu: 'Investors (18.04%): seed, Series A round allocations. 4 года vesting с 1-год cliff. Paradigm, a16z, USV -- ранние инвесторы Uniswap.' },
      { category: 'Advisors', percentage: 0.69, color: '#f59e0b', amount: '6.9M UNI', vesting: '4-year vesting with 1-year cliff', tooltipRu: 'Advisors (0.69%): минимальная allocation для советников. 4 года vesting. Маленький процент -- хороший знак (меньше sell pressure).' },
    ],
  },
  {
    name: 'Aave',
    symbol: 'AAVE',
    totalSupply: '16,000,000 AAVE',
    vestingDuration: 'Fixed supply (migrated from LEND)',
    governance: 'Governance + Safety Module staking (stkAAVE)',
    allocations: [
      { category: 'Token Holders', percentage: 77, color: colors.success, amount: '12.32M AAVE', vesting: 'Migrated from LEND (100:1 ratio)', tooltipRu: 'Token Holders (77%): мигрировано из LEND токена в ratio 100:1. Крупнейшая community allocation среди DeFi протоколов. Полностью разблокированы.' },
      { category: 'Safety Module', percentage: 13, color: colors.primary, amount: '2.08M AAVE', vesting: 'Ecosystem reserve for insurance', tooltipRu: 'Safety Module (13%): экосистемный резерв для страхования. Stakers получают stkAAVE и защищают протокол от bad debt. 10-day unstaking cooldown.' },
      { category: 'Team & Founders', percentage: 10, color: '#a78bfa', amount: '1.6M AAVE', vesting: '3-year vesting', tooltipRu: 'Team & Founders (10%): минимальная team allocation. 3 года vesting. Stani Kulechov (основатель) -- один из немногих с <15% team allocation.' },
    ],
  },
  {
    name: 'Curve',
    symbol: 'CRV',
    totalSupply: '3,030,303,031 CRV',
    vestingDuration: 'Inflationary (reducing emissions)',
    governance: 'Vote-escrow (veCRV): lock CRV 1-4 years for voting power',
    allocations: [
      { category: 'Community (LP rewards)', percentage: 62, color: colors.success, amount: '1.88B CRV', vesting: 'Continuous emissions to LPs', tooltipRu: 'Community LP rewards (62%): continuous emissions для LP в Curve pools. Уменьшаются каждый год. veCRV holders голосуют за распределение emissions между пулами (gauge voting).' },
      { category: 'Team & Founders', percentage: 23.08, color: colors.primary, amount: '700M CRV', vesting: '2-year vesting', tooltipRu: 'Team & Founders (23.08%): allocation для команды Curve. 2 года vesting. Включает Michael Egorov (основатель) -- крупнейший veCRV holder.' },
      { category: 'Investors', percentage: 5.71, color: '#a78bfa', amount: '173M CRV', vesting: 'Various vesting schedules', tooltipRu: 'Investors (5.71%): относительно маленькая investor allocation. Разные vesting schedules для разных раундов. Curve привлёк меньше VC денег чем другие DeFi.' },
      { category: 'Employees', percentage: 3.68, color: '#f59e0b', amount: '111M CRV', vesting: '2-year vesting', tooltipRu: 'Employees (3.68%): allocation для сотрудников. 2 года vesting. Отдельно от team/founders allocation.' },
      { category: 'Reserve', percentage: 5.53, color: '#ef4444', amount: '168M CRV', vesting: 'Community reserve', tooltipRu: 'Reserve (5.53%): community reserve для будущих инициатив. Контролируется governance. Используется для грантов и партнёрств.' },
    ],
  },
  {
    name: 'Compound',
    symbol: 'COMP',
    totalSupply: '10,000,000 COMP',
    vestingDuration: '4 years',
    governance: 'Simple voting (1 COMP = 1 vote), delegation, timelock',
    allocations: [
      { category: 'Protocol Users', percentage: 42.3, color: colors.success, amount: '4.23M COMP', vesting: 'Distribution to lenders/borrowers over 4 years', tooltipRu: 'Protocol Users (42.3%): распределение lenders и borrowers в течение 4 лет. Liquidity mining -- пользователи получают COMP пропорционально использованию протокола.' },
      { category: 'Shareholders', percentage: 23.96, color: colors.primary, amount: '2.4M COMP', vesting: '4-year vesting', tooltipRu: 'Shareholders (23.96%): Compound Labs shareholders. 4 года vesting. Включает a16z, Bain Capital, Polychain -- крупные VC фонды.' },
      { category: 'Founders & Team', percentage: 22.25, color: '#a78bfa', amount: '2.23M COMP', vesting: '4-year vesting', tooltipRu: 'Founders & Team (22.25%): Robert Leshner и команда. 4 года vesting. Относительно высокая team allocation (>20%) -- типично для ранних DeFi протоколов.' },
      { category: 'Governance Reserve', percentage: 7.75, color: '#f59e0b', amount: '775K COMP', vesting: 'Governance-controlled', tooltipRu: 'Governance Reserve (7.75%): контролируется governance. Используется для грантов, protocol improvements, partnerships. Требует on-chain голосования.' },
      { category: 'Future Team', percentage: 3.74, color: '#ef4444', amount: '374K COMP', vesting: 'Reserved for future hires', tooltipRu: 'Future Team (3.74%): зарезервировано для будущих сотрудников. Стандартная практика -- stock option pool equivalent в crypto.' },
    ],
  },
];

/**
 * TokenDistributionDiagram
 *
 * Interactive pie chart with clickable protocol toggle (UNI/AAVE/CRV/COMP).
 * Legend items wrapped with DiagramTooltip (SVG path hover removed).
 */
export function TokenDistributionDiagram() {
  const [protocolIdx, setProtocolIdx] = useState(0);

  const protocol = PROTOCOL_DATA[protocolIdx];

  // Calculate pie chart segments
  const sectors = useMemo(() => {
    const result: Array<{
      startAngle: number;
      endAngle: number;
      allocation: TokenAllocation;
      index: number;
    }> = [];
    let currentAngle = -Math.PI / 2; // Start from top

    protocol.allocations.forEach((alloc, i) => {
      const angle = (alloc.percentage / 100) * Math.PI * 2;
      result.push({
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        allocation: alloc,
        index: i,
      });
      currentAngle += angle;
    });
    return result;
  }, [protocolIdx]);

  const cx = 130;
  const cy = 130;
  const outerR = 110;
  const innerR = 50;

  const sectorPath = (start: number, end: number, r1: number, r2: number) => {
    const x1 = cx + Math.cos(start) * r2;
    const y1 = cy + Math.sin(start) * r2;
    const x2 = cx + Math.cos(end) * r2;
    const y2 = cy + Math.sin(end) * r2;
    const x3 = cx + Math.cos(end) * r1;
    const y3 = cy + Math.sin(end) * r1;
    const x4 = cx + Math.cos(start) * r1;
    const y4 = cy + Math.sin(start) * r1;
    const large = end - start > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${r2},${r2} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${large} 0 ${x4},${y4} Z`;
  };

  return (
    <DiagramContainer title="\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0442\u043e\u043a\u0435\u043d\u043e\u0432" color="green">
      {/* Protocol selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {PROTOCOL_DATA.map((p, i) => (
          <button
            key={i}
            onClick={() => setProtocolIdx(i)}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: 'pointer',
              background: protocolIdx === i ? `${colors.success}15` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${protocolIdx === i ? colors.success : 'rgba(255,255,255,0.08)'}`,
              color: protocolIdx === i ? colors.success : colors.textMuted,
              fontSize: 13,
              fontFamily: 'monospace',
              fontWeight: protocolIdx === i ? 600 : 400,
              borderRadius: 6,
            }}
          >
            {p.symbol}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* Pie chart */}
        <div style={{ ...glassStyle, padding: 12, minWidth: 280 }}>
          <svg width="260" height="260" viewBox="0 0 260 260">
            {sectors.map((s) => {
              const midAngle = (s.startAngle + s.endAngle) / 2;

              return (
                <g key={s.index}>
                  <path
                    d={sectorPath(s.startAngle, s.endAngle, innerR, outerR)}
                    fill={`${s.allocation.color}80`}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth={1}
                    style={{ transition: 'all 0.2s' }}
                  />
                  {/* Percentage label */}
                  {s.allocation.percentage > 5 && (
                    <text
                      x={cx + Math.cos(midAngle) * ((outerR + innerR) / 2)}
                      y={cy + Math.sin(midAngle) * ((outerR + innerR) / 2)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={11}
                      fontFamily="monospace"
                      fontWeight={600}
                    >
                      {s.allocation.percentage}%
                    </text>
                  )}
                </g>
              );
            })}
            {/* Center text */}
            <text x={cx} y={cy - 6} textAnchor="middle" fill={colors.text} fontSize={16} fontWeight={700} fontFamily="monospace">
              {protocol.symbol}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fill={colors.textMuted} fontSize={10} fontFamily="monospace">
              {protocol.totalSupply.split(' ')[0]}
            </text>
          </svg>
        </div>

        {/* Legend + details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          {/* Protocol info */}
          <DiagramTooltip content={`${protocol.name} (${protocol.symbol}): Total Supply ${protocol.totalSupply}. ${protocol.governance}. Vesting: ${protocol.vestingDuration}.`}>
            <div style={{
              ...glassStyle,
              padding: 10,
              marginBottom: 10,
              background: `${colors.success}05`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                {protocol.name} ({protocol.symbol})
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
                Total Supply: {protocol.totalSupply}<br />
                Vesting: {protocol.vestingDuration}<br />
                Governance: {protocol.governance}
              </div>
            </div>
          </DiagramTooltip>

          {/* Allocation legend -- DiagramTooltip replaces hoveredSector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {protocol.allocations.map((alloc, i) => (
              <DiagramTooltip key={i} content={alloc.tooltipRu}>
                <div
                  style={{
                    ...glassStyle,
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: alloc.color,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: colors.text,
                      flex: 1,
                    }}>
                      {alloc.category}
                    </span>
                    <span style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: colors.textMuted,
                    }}>
                      {alloc.percentage}%
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: colors.textMuted,
                    marginTop: 6,
                    marginLeft: 18,
                    lineHeight: 1.5,
                  }}>
                    Amount: {alloc.amount}<br />
                    Vesting: {alloc.vesting}
                  </div>
                </div>
              </DiagramTooltip>
            ))}
          </div>
        </div>
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  VestingScheduleDiagram                                              */
/* ================================================================== */

interface VestingPeriod {
  label: string;
  startMonth: number;
  endMonth: number;
  percentage: number;
  type: 'tge' | 'cliff' | 'linear' | 'full';
  color: string;
  description: string;
  detail: string;
}

const VESTING_PERIODS: VestingPeriod[] = [
  {
    label: 'TGE (Airdrop)',
    startMonth: 0,
    endMonth: 0,
    percentage: 10,
    type: 'tge',
    color: colors.success,
    description: 'Token Generation Event',
    detail: 'Community airdrop: 10% от общего supply доступны сразу. Мгновенная ликвидность для ранних пользователей. Обычно это минимальная часть -- чтобы начать торговлю и создать рынок.',
  },
  {
    label: 'Cliff (Lock)',
    startMonth: 0,
    endMonth: 12,
    percentage: 0,
    type: 'cliff',
    color: '#ef4444',
    description: '12 months locked',
    detail: 'Team и investor токены полностью заблокированы. Cliff период защищает от мгновенного дампа после запуска. Без cliff основатели могут продать все токены на TGE и уйти (rug pull).',
  },
  {
    label: 'Cliff Release',
    startMonth: 12,
    endMonth: 12,
    percentage: 25,
    type: 'tge',
    color: '#f59e0b',
    description: '25% released at cliff end',
    detail: 'После cliff первый крупный транш: 25% от заблокированных токенов. Момент высокого давления на продажу -- market часто реагирует падением цены (token unlock event).',
  },
  {
    label: 'Linear Vesting',
    startMonth: 12,
    endMonth: 48,
    percentage: 65,
    type: 'linear',
    color: colors.primary,
    description: 'Monthly/quarterly release',
    detail: 'Оставшиеся 65% разблокируются равномерно каждый месяц (или квартал) в течение 3 лет. Это минимизирует давление на продажу и выравнивает долгосрочные стимулы команды.',
  },
];

const TOTAL_MONTHS = 48;

/**
 * VestingScheduleDiagram
 *
 * 4-year vesting timeline with cliff and linear vesting.
 * DiagramTooltip on each period card (replaces hoveredIdx).
 */
export function VestingScheduleDiagram() {
  // Calculate cumulative unlock percentages at each month
  const monthlyUnlocks = useMemo(() => {
    const unlocks: number[] = Array(TOTAL_MONTHS + 1).fill(0);
    // TGE
    unlocks[0] = 10;
    // Cliff: no change for months 1-11
    for (let m = 1; m < 12; m++) unlocks[m] = 10;
    // Cliff release at month 12
    unlocks[12] = 35; // 10 + 25
    // Linear vesting months 13-48
    const linearPerMonth = 65 / 36;
    for (let m = 13; m <= 48; m++) {
      unlocks[m] = 35 + linearPerMonth * (m - 12);
    }
    return unlocks;
  }, []);

  const svgW = 500;
  const svgH = 180;
  const padL = 45;
  const padR = 20;
  const padT = 15;
  const padB = 30;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const toX = (month: number) => padL + (month / TOTAL_MONTHS) * chartW;
  const toY = (pct: number) => padT + chartH - (pct / 100) * chartH;

  // Build cumulative unlock line
  const linePath = monthlyUnlocks
    .map((pct, m) => `${m === 0 ? 'M' : 'L'}${toX(m)},${toY(pct)}`)
    .join(' ');

  // Area under the curve
  const areaPath = `${linePath} L${toX(TOTAL_MONTHS)},${toY(0)} L${toX(0)},${toY(0)} Z`;

  return (
    <DiagramContainer title="Vesting: \u0433\u0440\u0430\u0444\u0438\u043a \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0438" color="blue">
      {/* SVG Timeline */}
      <div style={{
        ...glassStyle,
        padding: 12,
        marginBottom: 16,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
          {/* Grid */}
          {[25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line
                x1={padL}
                x2={svgW - padR}
                y1={toY(pct)}
                y2={toY(pct)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4,4"
              />
              <text x={padL - 5} y={toY(pct) + 4} textAnchor="end" fill={colors.textMuted} fontSize={9} fontFamily="monospace">
                {pct}%
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {[0, 12, 24, 36, 48].map((m) => (
            <text
              key={m}
              x={toX(m)}
              y={svgH - 5}
              textAnchor="middle"
              fill={colors.textMuted}
              fontSize={9}
              fontFamily="monospace"
            >
              {m === 0 ? 'TGE' : `${m}m`}
            </text>
          ))}

          {/* Cliff zone highlight */}
          <rect
            x={toX(0)}
            y={padT}
            width={toX(12) - toX(0)}
            height={chartH}
            fill="#ef444408"
          />
          <text x={toX(6)} y={padT + 10} textAnchor="middle" fill="#ef4444" fontSize={9} fontFamily="monospace" opacity={0.6}>
            Cliff
          </text>

          {/* Area under curve */}
          <path d={areaPath} fill={`${colors.primary}10`} />

          {/* Unlock line */}
          <path d={linePath} fill="none" stroke={colors.primary} strokeWidth={2} />

          {/* Key points */}
          <circle cx={toX(0)} cy={toY(10)} r={4} fill={colors.success} />
          <circle cx={toX(12)} cy={toY(35)} r={4} fill="#f59e0b" />
          <circle cx={toX(48)} cy={toY(100)} r={4} fill={colors.primary} />

          {/* Maintenance line label */}
          <line x1={toX(12)} y1={padT} x2={toX(12)} y2={padT + chartH} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
        </svg>
      </div>

      {/* Period cards -- DiagramTooltip replaces hoveredIdx */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {VESTING_PERIODS.map((period, i) => (
          <DiagramTooltip key={i} content={period.detail}>
            <div
              style={{
                ...glassStyle,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: period.color,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    color: colors.text,
                  }}>
                    {period.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: colors.textMuted }}>
                    {period.startMonth === period.endMonth
                      ? `Month ${period.startMonth}`
                      : `Month ${period.startMonth}-${period.endMonth}`}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: colors.textMuted,
                  }}>
                    {period.percentage > 0 ? `${period.percentage}%` : 'Locked'}
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: 11,
                color: colors.textMuted,
                marginTop: 6,
                marginLeft: 16,
                lineHeight: 1.6,
              }}>
                {period.description}
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Key insight */}
      <DataBox label="Vesting Purpose" mono>
        Vesting aligns incentives: team cannot dump tokens immediately.{'\n'}
        Cliff prevents early exit. Linear vesting reduces sell pressure.{'\n'}
        Token unlock events (cliff end, large tranches) often cause{'\n'}
        short-term price drops -- watch the schedule!
      </DataBox>
    </DiagramContainer>
  );
}
