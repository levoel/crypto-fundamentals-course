/** @jsxImportSource solid-js */
/**
 * Secp256k1 and Ed25519 Comparison Diagrams
 *
 * Exports:
 * - CurveComparisonDiagram: secp256k1 vs Ed25519 parameter comparison table
 * - BlockchainCurveUsage: Which blockchain uses which curve
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  CurveComparisonDiagram                                               */
/* ------------------------------------------------------------------ */

interface CurveParam {
  label: string;
  secp256k1: string;
  ed25519: string;
}

const CURVE_PARAMS: CurveParam[] = [
  {
    label: 'Уравнение',
    secp256k1: 'y\u00B2 = x\u00B3 + 7',
    ed25519: '-x\u00B2 + y\u00B2 = 1 + dx\u00B2y\u00B2',
  },
  {
    label: 'Тип кривой',
    secp256k1: 'Short Weierstrass',
    ed25519: 'Twisted Edwards',
  },
  {
    label: 'Размер поля p',
    secp256k1: '2\u00B2\u2075\u2076 \u2212 2\u00B3\u00B2 \u2212 977',
    ed25519: '2\u00B2\u2075\u2075 \u2212 19',
  },
  {
    label: 'Размер группы n',
    secp256k1: '\u2248 2\u00B2\u2075\u2076',
    ed25519: '\u2248 2\u00B2\u2075\u00B2',
  },
  {
    label: 'Размер ключа',
    secp256k1: '256 бит (32 байта)',
    ed25519: '256 бит (32 байта)',
  },
  {
    label: 'Уровень безопасности',
    secp256k1: '~128 бит',
    ed25519: '~128 бит',
  },
  {
    label: 'Детерминированные подписи',
    secp256k1: 'Нет (нужен k)',
    ed25519: 'Да (RFC 6979)',
  },
  {
    label: 'Скорость подписи',
    secp256k1: 'Средняя',
    ed25519: 'Быстрая',
  },
  {
    label: 'Скорость верификации',
    secp256k1: 'Средняя',
    ed25519: 'Очень быстрая',
  },
];

const CURVE_PARAM_TOOLTIPS: Record<string, string> = {
  'Уравнение': 'Алгебраическое уравнение, определяющее множество точек кривой. Weierstrass и Edwards -- два способа задать одну и ту же группу точек с разной арифметикой.',
  'Тип кривой': 'Short Weierstrass (secp256k1) -- стандартная форма, оптимизированная для ECDSA. Twisted Edwards (Ed25519) -- форма, дающая полную группу сложения (complete addition law) без особых случаев.',
  'Размер поля p': 'Простое число p определяет конечное поле Fp, над которым задана кривая. Специальная форма (Mersenne-like) ускоряет модулярную арифметику.',
  'Размер группы n': 'Порядок генератора G -- количество точек в циклической подгруппе. Определяет пространство приватных ключей и стойкость к перебору.',
  'Размер ключа': 'Оба: 256-бит ключи (~128-bit security). Для постквантовой стойкости нужны другие схемы (lattice-based).',
  'Уровень безопасности': '~128 бит означает, что лучшая атака (Pollard rho) требует ~2^128 операций. Эквивалент AES-128.',
  'Детерминированные подписи': 'secp256k1 + ECDSA требует случайный nonce k (опасно при повторении). Ed25519 вычисляет nonce детерминированно из ключа и сообщения (RFC 8032), исключая nonce reuse.',
  'Скорость подписи': 'Ed25519 быстрее из-за complete addition formulas и отсутствия модулярного обращения (нет k^(-1) как в ECDSA).',
  'Скорость верификации': 'Ed25519 поддерживает batch verification -- проверка N подписей за ~1.2x время одной. Критично для блокчейнов с тысячами транзакций в блоке.',
};

/**
 * CurveComparisonDiagram - Side-by-side parameter comparison.
 * Highlights that both curves provide ~128-bit security.
 */
export function CurveComparisonDiagram() {
  return (
    <DiagramContainer title="secp256k1 vs Ed25519: сравнение параметров" color="purple">
      {/* Header */}
      <div style={{
        'display': 'grid',
        'grid-template-columns': '1fr 1fr 1fr',
        'gap': '2px',
        'margin-bottom': '2px',
      }}>
        <div style={{
          ...glassStyle,
          'padding': '10px 12px',
          'font-size': '12px',
          'font-weight': '700',
          'color': colors.textMuted,
          'border-color': 'rgba(255,255,255,0.08)',
        }}>
          Параметр
        </div>
        <DiagramTooltip content="secp256k1: кривая y^2 = x^3 + 7 над Fp. Используется в Bitcoin и Ethereum. Koblitz curve -- эффективное вычисление. Не была выбрана NIST (нет backdoor подозрений).">
          <div style={{
            ...glassStyle,
            'padding': '10px 12px',
            'font-size': '12px',
            'font-weight': '700',
            'color': colors.warning,
            'border-color': `${colors.warning}30`,
            'text-align': 'center',
          }}>
            secp256k1
          </div>
        </DiagramTooltip>
        <DiagramTooltip content="Ed25519: twisted Edwards curve -x^2 + y^2 = 1 + dx^2y^2. Используется в Solana, Cardano, Monero. Быстрые подписи, детерминированный nonce (нет nonce reuse risk).">
          <div style={{
            ...glassStyle,
            'padding': '10px 12px',
            'font-size': '12px',
            'font-weight': '700',
            'color': colors.accent,
            'border-color': `${colors.accent}30`,
            'text-align': 'center',
          }}>
            Ed25519
          </div>
        </DiagramTooltip>
      </div>

      {/* Rows */}
      {CURVE_PARAMS.map((param, i) => (
        <div
          style={{
            'display': 'grid',
            'grid-template-columns': '1fr 1fr 1fr',
            'gap': '2px',
            'margin-bottom': '2px',
          }}
        >
          <DiagramTooltip content={CURVE_PARAM_TOOLTIPS[param.label] ?? param.label}>
            <div style={{
              ...glassStyle,
              'padding': '8px 12px',
              'font-size': '11px',
              'color': colors.text,
              'border-color': 'rgba(255,255,255,0.05)',
            }}>
              {param.label}
            </div>
          </DiagramTooltip>
          <div style={{
            ...glassStyle,
            'padding': '8px 12px',
            'font-size': '11px',
            'font-family': 'monospace',
            'color': colors.textMuted,
            'border-color': 'rgba(255,255,255,0.05)',
            'text-align': 'center',
            'word-break': 'break-word',
          }}>
            {param.secp256k1}
          </div>
          <div style={{
            ...glassStyle,
            'padding': '8px 12px',
            'font-size': '11px',
            'font-family': 'monospace',
            'color': colors.textMuted,
            'border-color': 'rgba(255,255,255,0.05)',
            'text-align': 'center',
            'word-break': 'break-word',
          }}>
            {param.ed25519}
          </div>
        </div>
      ))}

      {/* Security note */}
      <DiagramTooltip content="128-бит безопасность означает ~2^128 операций для взлома (Pollard rho). Оба варианта безопасны до появления квантовых компьютеров, после чего потребуется миграция на post-quantum схемы.">
        <div style={{
          'margin-top': '12px',
          'padding': '10px',
          ...glassStyle,
          'border-color': `${colors.success}20`,
          'font-size': '12px',
          'color': colors.textMuted,
          'line-height': '1.6',
          'text-align': 'center',
        }}>
          <strong style={{ 'color': colors.success }}>Обе кривые обеспечивают ~128 бит безопасности.</strong>{' '}
          Ed25519 быстрее и проще в реализации; secp256k1 проверена 15+ годами использования в Bitcoin.
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  BlockchainCurveUsage                                                 */
/* ------------------------------------------------------------------ */

interface ChainInfo {
  name: string;
  curve: 'secp256k1' | 'Ed25519';
  year: number;
  color: string;
  description: string;
}

const CHAINS: ChainInfo[] = [
  { name: 'Bitcoin', curve: 'secp256k1', year: 2009, color: '#f7931a', description: 'Первый блокчейн, ECDSA подписи' },
  { name: 'Ethereum', curve: 'secp256k1', year: 2015, color: '#627eea', description: 'EVM, ECDSA + ecrecover' },
  { name: 'Litecoin', curve: 'secp256k1', year: 2011, color: '#bfbbbb', description: 'Форк Bitcoin' },
  { name: 'Solana', curve: 'Ed25519', year: 2020, color: '#9945ff', description: 'Высокая пропускная способность, EdDSA' },
  { name: 'Polkadot', curve: 'Ed25519', year: 2020, color: '#e6007a', description: 'Мультичейн, sr25519/Ed25519' },
  { name: 'Cardano', curve: 'Ed25519', year: 2017, color: '#0033ad', description: 'Proof of Stake, EdDSA' },
  { name: 'Stellar', curve: 'Ed25519', year: 2015, color: '#08b5e5', description: 'Платежи, EdDSA' },
  { name: 'NEAR', curve: 'Ed25519', year: 2020, color: '#00c08b', description: 'Шардинг, EdDSA' },
];

/**
 * BlockchainCurveUsage - Which blockchain uses which curve.
 * Shows trend: newer chains prefer Ed25519.
 */
export function BlockchainCurveUsage() {
  const secpChains = CHAINS.filter((c) => c.curve === 'secp256k1');
  const edChains = CHAINS.filter((c) => c.curve === 'Ed25519');

  return (
    <DiagramContainer title="Какой блокчейн какую кривую использует" color="green">
      <Grid columns={2} gap={16}>
        {/* secp256k1 column */}
        <div>
          <div style={{
            'font-size': '14px',
            'font-weight': '700',
            'color': colors.warning,
            'margin-bottom': '10px',
            'text-align': 'center',
            'font-family': 'monospace',
          }}>
            secp256k1
          </div>
          {secpChains.map((chain) => (
            <DiagramTooltip content={chain.description}>
              <div
                style={{
                  ...glassStyle,
                  'padding': '8px 12px',
                  'border-color': `${chain.color}30`,
                  'margin-bottom': '6px',
                  'display': 'flex',
                  'align-items': 'center',
                  'gap': '10px',
                }}
              >
                <div style={{
                  'width': '8px',
                  'height': '8px',
                  'border-radius': '50%',
                  'background': chain.color,
                  'flex-shrink': '0',
                }} />
                <div>
                  <div style={{ 'font-size': '12px', 'font-weight': '600', 'color': chain.color }}>
                    {chain.name} <span style={{ 'font-size': '10px', 'color': colors.textMuted }}>({chain.year})</span>
                  </div>
                  <div style={{ 'font-size': '10px', 'color': colors.textMuted }}>{chain.description}</div>
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>

        {/* Ed25519 column */}
        <div>
          <div style={{
            'font-size': '14px',
            'font-weight': '700',
            'color': colors.accent,
            'margin-bottom': '10px',
            'text-align': 'center',
            'font-family': 'monospace',
          }}>
            Ed25519
          </div>
          {edChains.map((chain) => (
            <DiagramTooltip content={chain.description}>
              <div
                style={{
                  ...glassStyle,
                  'padding': '8px 12px',
                  'border-color': `${chain.color}30`,
                  'margin-bottom': '6px',
                  'display': 'flex',
                  'align-items': 'center',
                  'gap': '10px',
                }}
              >
                <div style={{
                  'width': '8px',
                  'height': '8px',
                  'border-radius': '50%',
                  'background': chain.color,
                  'flex-shrink': '0',
                }} />
                <div>
                  <div style={{ 'font-size': '12px', 'font-weight': '600', 'color': chain.color }}>
                    {chain.name} <span style={{ 'font-size': '10px', 'color': colors.textMuted }}>({chain.year})</span>
                  </div>
                  <div style={{ 'font-size': '10px', 'color': colors.textMuted }}>{chain.description}</div>
                </div>
              </div>
            </DiagramTooltip>
          ))}
        </div>
      </Grid>

      {/* Trend note */}
      <DiagramTooltip content="Переход на Ed25519 обусловлен: 1) детерминированный nonce исключает nonce reuse атаку, 2) complete addition law упрощает реализацию (нет edge cases), 3) batch verification ускоряет валидацию блоков.">
        <div style={{
          'margin-top': '12px',
          'padding': '10px',
          ...glassStyle,
          'border-color': `${colors.accent}20`,
          'font-size': '12px',
          'color': colors.textMuted,
          'line-height': '1.6',
          'text-align': 'center',
        }}>
          <strong style={{ 'color': colors.accent }}>Тренд:</strong>{' '}
          Ранние блокчейны (Bitcoin, Ethereum) выбрали secp256k1. Новые блокчейны (Solana, Polkadot, NEAR) предпочитают Ed25519
          за скорость, детерминированные подписи и устойчивость к side-channel атакам.
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}
