/**
 * EdDSA and Schnorr Signature Diagrams
 *
 * Exports:
 * - SchnorrVsECDSADiagram: Side-by-side ECDSA vs Schnorr comparison
 * - SignatureSchemeTimeline: Historical progression RSA -> DSA -> ECDSA -> EdDSA -> Schnorr
 */

import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { FlowNode } from '@primitives/FlowNode';
import { Arrow } from '@primitives/Arrow';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  SchnorrVsECDSADiagram                                              */
/* ------------------------------------------------------------------ */

interface ComparisonRow {
  label: string;
  ecdsa: string;
  schnorr: string;
  advantage: 'ecdsa' | 'schnorr' | 'neutral';
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    label: 'Подпись',
    ecdsa: 's = k\u207B\u00B9(h + rd) mod n',
    schnorr: 's = k + e*d mod n',
    advantage: 'schnorr',
  },
  {
    label: 'Верификация',
    ecdsa: 'u1*G + u2*Q, проверяем x-координату',
    schnorr: 'sG == R + eP (одна проверка)',
    advantage: 'schnorr',
  },
  {
    label: 'Nonce',
    ecdsa: 'Случайный k (опасно!)',
    schnorr: 'Случайный k или детерминированный',
    advantage: 'neutral',
  },
  {
    label: 'Линейность',
    ecdsa: 'Нет (из-за k\u207B\u00B9 в формуле)',
    schnorr: 'Да! s1+s2 = агрегированная подпись',
    advantage: 'schnorr',
  },
  {
    label: 'Мультиподписи',
    ecdsa: 'Сложно (MPC протоколы)',
    schnorr: 'Нативно (MuSig, FROST)',
    advantage: 'schnorr',
  },
  {
    label: 'Доказуемая безопасность',
    ecdsa: 'Нет формального доказательства',
    schnorr: 'Доказана в модели случайного оракула',
    advantage: 'schnorr',
  },
  {
    label: 'Размер подписи',
    ecdsa: '64 байта (r, s)',
    schnorr: '64 байта (R, s)',
    advantage: 'neutral',
  },
  {
    label: 'Стандартизация',
    ecdsa: 'ANSI X9.62, FIPS 186 (1992)',
    schnorr: 'BIP 340 (2021 в Bitcoin)',
    advantage: 'ecdsa',
  },
  {
    label: 'Распространенность',
    ecdsa: 'Bitcoin, Ethereum, все EVM',
    schnorr: 'Bitcoin Taproot, Monero',
    advantage: 'ecdsa',
  },
];

const COMPARISON_TOOLTIPS: Record<string, string> = {
  'Подпись': 'ECDSA использует k^(-1) в формуле подписи, что делает её нелинейной. Schnorr: s = k + e*d -- простое сложение, позволяющее агрегацию подписей.',
  'Верификация': 'Schnorr верификация sG == R + eP -- одна проверка равенства точек. ECDSA требует два скалярных умножения и сравнение x-координат.',
  'Nonce': 'В обоих случаях nonce k должен быть уникальным. RFC 6979 делает k детерминированным. EdDSA (Schnorr на Edwards) имеет встроенный детерминированный nonce.',
  'Линейность': 'Линейность Schnorr -- ключевое преимущество. Позволяет складывать подписи: s1 + s2 валидна для P1 + P2. Основа MuSig2 и threshold signatures.',
  'Мультиподписи': 'MuSig2 (Schnorr): N-of-N мультиподпись неотличима от обычной в блокчейне. FROST: t-of-N threshold. ECDSA MPC требует сложных протоколов (Lindell, GG18).',
  'Доказуемая безопасность': 'Schnorr доказуемо безопасен в модели случайного оракула (ROM) при условии ECDLP. ECDSA не имеет формального доказательства безопасности.',
  'Размер подписи': 'Обе схемы: 64 байта. ECDSA: (r, s) -- два 32-байтных целых числа. Schnorr: (R, s) -- 32-байтная точка + 32-байтный скаляр.',
  'Стандартизация': 'ECDSA стандартизирован с 1992 года (FIPS 186). Schnorr в Bitcoin только с 2021 (BIP 340, Taproot). Причина задержки -- патент Шнорра (1989-2008).',
  'Распространенность': 'ECDSA используется в Bitcoin (legacy), Ethereum и всех EVM-совместимых блокчейнах. Schnorr пока только в Bitcoin Taproot и Monero (Bulletproofs).',
};

/**
 * SchnorrVsECDSADiagram - Side-by-side ECDSA vs Schnorr comparison.
 * Highlights Schnorr advantages: simpler formulas, linearity, provable security.
 * Highlights ECDSA advantage: established standard, widely deployed.
 */
export function SchnorrVsECDSADiagram() {
  return (
    <DiagramContainer title="ECDSA vs Schnorr: сравнение" color="purple">
      {/* Signing formulas side by side */}
      <Grid columns={2} gap={12}>
        <DiagramTooltip content="ECDSA (Elliptic Curve Digital Signature Algorithm): стандарт с 1992 года. Нелинейная формула из-за k^(-1). Используется в Bitcoin (legacy), Ethereum, всех EVM.">
          <div style={{
            ...glassStyle,
            padding: 14,
            borderColor: `${colors.warning}30`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: colors.warning,
              marginBottom: 8,
            }}>
              ECDSA
            </div>
          <div style={{
            fontSize: 11,
            color: colors.textMuted,
            marginBottom: 6,
          }}>
            Подпись:
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: colors.text,
            padding: '6px 8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            marginBottom: 8,
          }}>
            R = kG, r = R.x mod n<br />
            s = k<sup>-1</sup>(h + rd) mod n
          </div>
          <div style={{
            fontSize: 11,
            color: colors.textMuted,
            marginBottom: 6,
          }}>
            Верификация:
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: colors.text,
            padding: '6px 8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
          }}>
            u1 = hs<sup>-1</sup>, u2 = rs<sup>-1</sup><br />
            P.x mod n == r ?
          </div>
          </div>
        </DiagramTooltip>

        <DiagramTooltip content="Schnorr подписи линейны: подписи можно складывать (key aggregation). Это основа MuSig2 (Bitcoin Taproot) и threshold signatures. Доказуемо безопасны в модели случайного оракула.">
          <div style={{
            ...glassStyle,
            padding: 14,
            borderColor: `${colors.accent}30`,
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 700,
              color: colors.accent,
              marginBottom: 8,
            }}>
              Schnorr
            </div>
          <div style={{
            fontSize: 11,
            color: colors.textMuted,
            marginBottom: 6,
          }}>
            Подпись:
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: colors.text,
            padding: '6px 8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            marginBottom: 8,
          }}>
            R = kG<br />
            e = H(R || P || m)<br />
            s = k + e*d mod n
          </div>
          <div style={{
            fontSize: 11,
            color: colors.textMuted,
            marginBottom: 6,
          }}>
            Верификация:
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: colors.text,
            padding: '6px 8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
          }}>
            sG == R + eP ?
          </div>
          </div>
        </DiagramTooltip>
      </Grid>

      {/* Detailed comparison table */}
      <div style={{ marginTop: 16 }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.5fr 1.5fr',
          gap: 2,
          marginBottom: 2,
        }}>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: colors.textMuted,
            borderColor: 'rgba(255,255,255,0.08)',
          }}>
            Свойство
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: colors.warning,
            borderColor: `${colors.warning}30`,
            textAlign: 'center',
          }}>
            ECDSA
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: colors.accent,
            borderColor: `${colors.accent}30`,
            textAlign: 'center',
          }}>
            Schnorr
          </div>
        </div>

        {/* Rows */}
        {COMPARISON_DATA.map((row, i) => {
          const ecdsaHighlight = row.advantage === 'ecdsa';
          const schnorrHighlight = row.advantage === 'schnorr';
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.5fr 1.5fr',
                gap: 2,
                marginBottom: 2,
              }}
            >
              <DiagramTooltip content={COMPARISON_TOOLTIPS[row.label] ?? row.label}>
                <div style={{
                  ...glassStyle,
                  padding: '6px 10px',
                  fontSize: 11,
                  color: colors.text,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}>
                  {row.label}
                </div>
              </DiagramTooltip>
              <div style={{
                ...glassStyle,
                padding: '6px 10px',
                fontSize: 11,
                color: ecdsaHighlight ? colors.warning : colors.textMuted,
                borderColor: ecdsaHighlight ? `${colors.warning}20` : 'rgba(255,255,255,0.05)',
                background: ecdsaHighlight ? `${colors.warning}08` : undefined,
                fontWeight: ecdsaHighlight ? 600 : 400,
              }}>
                {row.ecdsa}
              </div>
              <div style={{
                ...glassStyle,
                padding: '6px 10px',
                fontSize: 11,
                color: schnorrHighlight ? colors.accent : colors.textMuted,
                borderColor: schnorrHighlight ? `${colors.accent}20` : 'rgba(255,255,255,0.05)',
                background: schnorrHighlight ? `${colors.accent}08` : undefined,
                fontWeight: schnorrHighlight ? 600 : 400,
              }}>
                {row.schnorr}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key insight: linearity */}
      <DiagramTooltip content="Линейность s = k + e*d позволяет: 1) MuSig2 -- мультиподписи за 2 раунда коммуникации, 2) Adaptor signatures -- атомарные свопы, 3) Scriptless scripts -- приватные смарт-контракты в Bitcoin.">
        <div style={{
          marginTop: 14,
          padding: 12,
          ...glassStyle,
          borderColor: `${colors.accent}30`,
          background: `${colors.accent}08`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.accent, marginBottom: 6 }}>
            Ключевое преимущество Schnorr: линейность
          </div>
        <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
          Подпись Schnorr линейна: s = k + e*d. Это позволяет складывать подписи.
          Если s1 = k1 + e*d1 и s2 = k2 + e*d2, то s1 + s2 = (k1+k2) + e*(d1+d2) --
          валидная подпись для агрегированного ключа P1 + P2. ECDSA так не может из-за k<sup>-1</sup> в формуле.
          <br /><br />
          <strong style={{ color: colors.accent }}>В Bitcoin Taproot (BIP 340)</strong> это используется для MuSig2 --
          мультиподписей, которые выглядят как обычная одиночная подпись в блокчейне.
        </div>
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  SignatureSchemeTimeline                                             */
/* ------------------------------------------------------------------ */

interface TimelineEntry {
  year: string;
  name: string;
  description: string;
  color: string;
  blockchain?: string;
}

const TIMELINE: TimelineEntry[] = [
  {
    year: '1977',
    name: 'RSA подписи',
    description: 'Ривест, Шамир, Адлеман. Первая практическая асимметричная схема. Основана на факторизации.',
    color: colors.textMuted,
  },
  {
    year: '1989',
    name: 'Подпись Шнорра',
    description: 'Клаус-Петер Шнорр. Простая, доказуемо безопасная. Запатентована до 2008 года.',
    color: colors.accent,
  },
  {
    year: '1991',
    name: 'DSA (NIST)',
    description: 'Стандарт NIST. Разработан для обхода патента Шнорра. Менее элегантный, но свободный.',
    color: colors.warning,
  },
  {
    year: '1992',
    name: 'ECDSA',
    description: 'DSA на эллиптических кривых. Меньшие ключи, та же безопасность. Стандартизирован в 2005.',
    color: colors.warning,
    blockchain: 'Bitcoin (2009), Ethereum (2015)',
  },
  {
    year: '2011',
    name: 'EdDSA (Ed25519)',
    description: 'Бернштейн и др. Schnorr на кривых Эдвардса. Детерминированный nonce, быстрый, безопасный.',
    color: colors.success,
    blockchain: 'Solana (2020), Polkadot, Cardano',
  },
  {
    year: '2021',
    name: 'BIP 340 (Schnorr)',
    description: 'Schnorr подписи в Bitcoin (Taproot). Патент истек. Агрегация ключей, приватность MAST.',
    color: colors.primary,
    blockchain: 'Bitcoin Taproot',
  },
];

/**
 * SignatureSchemeTimeline - Historical progression of digital signature schemes.
 * From RSA (1977) to Schnorr in Bitcoin (2021, Taproot).
 */
export function SignatureSchemeTimeline() {
  return (
    <DiagramContainer title="Эволюция схем цифровых подписей" color="blue">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {TIMELINE.map((entry, i) => (
          <div key={i}>
            {/* Timeline entry */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}>
              {/* Year + dot */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 56,
                flexShrink: 0,
              }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: entry.color,
                  marginBottom: 4,
                }}>
                  {entry.year}
                </div>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: `${entry.color}30`,
                  border: `2px solid ${entry.color}`,
                  flexShrink: 0,
                }} />
                {/* Connecting line */}
                {i < TIMELINE.length - 1 && (
                  <div style={{
                    width: 2,
                    height: 24,
                    background: `${entry.color}30`,
                    marginTop: 4,
                  }} />
                )}
              </div>

              {/* Content */}
              <DiagramTooltip content={entry.description}>
                <div style={{
                  ...glassStyle,
                  padding: '10px 14px',
                  borderColor: `${entry.color}30`,
                  flex: 1,
                }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: entry.color,
                    marginBottom: 4,
                  }}>
                    {entry.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: colors.textMuted,
                    lineHeight: 1.5,
                  }}>
                    {entry.description}
                  </div>
                  {entry.blockchain && (
                    <div style={{
                      marginTop: 6,
                      fontSize: 10,
                      fontWeight: 600,
                      color: entry.color,
                      padding: '3px 8px',
                      background: `${entry.color}15`,
                      borderRadius: 4,
                      display: 'inline-block',
                    }}>
                      {entry.blockchain}
                    </div>
                  )}
                </div>
              </DiagramTooltip>
            </div>
          </div>
        ))}
      </div>

      {/* Patent note */}
      <DiagramTooltip content="Патент Шнорра US4995082 (1989-2008) заблокировал использование Schnorr подписей на 19 лет. NIST разработал DSA (1991) как свободную альтернативу. Taproot (BIP 340/341/342) активирован в Bitcoin в ноябре 2021.">
        <div style={{
          marginTop: 14,
          padding: 10,
          ...glassStyle,
          borderColor: `${colors.info}20`,
          fontSize: 12,
          color: colors.textMuted,
          lineHeight: 1.6,
          textAlign: 'center',
        }}>
          <strong style={{ color: colors.info }}>Почему Schnorr пришел в Bitcoin так поздно?</strong>{' '}
          Патент Шнорра (1989-2008) вынудил создать DSA/ECDSA как альтернативу. Сатоши в 2009 году выбрал
          ECDSA (secp256k1). Только после истечения патента Schnorr стал доступен для Bitcoin через Taproot (2021).
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}
