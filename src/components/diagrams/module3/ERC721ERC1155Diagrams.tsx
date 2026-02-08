/**
 * ERC-721 & ERC-1155 Diagrams (ETH-09)
 *
 * Exports:
 * - ERC721OwnershipDiagram: NFT ownership model (static with hover)
 * - ERCComparisonDiagram: ERC-20 vs ERC-721 vs ERC-1155 comparison (static with hover)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  ERC721OwnershipDiagram                                               */
/* ================================================================== */

interface NFTCard {
  tokenId: number;
  owner: string;
  ownerShort: string;
  uri: string;
  color: string;
}

const NFT_COLLECTION: NFTCard[] = [
  { tokenId: 0, owner: 'Alice', ownerShort: '0xa1b2...c3d4', uri: 'ipfs://QmCert1', color: colors.success },
  { tokenId: 1, owner: 'Bob', ownerShort: '0xe5f6...g7h8', uri: 'ipfs://QmArt42', color: colors.primary },
  { tokenId: 2, owner: 'Alice', ownerShort: '0xa1b2...c3d4', uri: 'ipfs://QmBadge', color: colors.success },
  { tokenId: 3, owner: 'Carol', ownerShort: '0xi9j0...k1l2', uri: 'ipfs://QmDiploma', color: colors.accent },
  { tokenId: 4, owner: 'Bob', ownerShort: '0xe5f6...g7h8', uri: 'ipfs://QmTicket', color: colors.primary },
];

const BALANCES: Record<string, number> = {};
NFT_COLLECTION.forEach((nft) => {
  BALANCES[nft.owner] = (BALANCES[nft.owner] || 0) + 1;
});

/**
 * ERC721OwnershipDiagram
 *
 * Shows a collection of 5 NFTs with different owners.
 * Hover reveals metadata URI, owner, and mapping details.
 * Contrasts with ERC-20: each token is UNIQUE (tokenId).
 */
export function ERC721OwnershipDiagram() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showMappings, setShowMappings] = useState(false);

  const hoveredNFT = hoveredId !== null ? NFT_COLLECTION[hoveredId] : null;

  return (
    <DiagramContainer title="ERC-721: уникальные токены (NFT)" color="purple">
      {/* NFT cards grid */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
        {NFT_COLLECTION.map((nft) => {
          const isHovered = hoveredId === nft.tokenId;

          return (
            <div
              key={nft.tokenId}
              onMouseEnter={() => setHoveredId(nft.tokenId)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...glassStyle,
                padding: 12,
                minWidth: 100,
                textAlign: 'center',
                background: isHovered ? `${nft.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHovered ? nft.color : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {/* Token ID badge */}
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: nft.color,
                fontFamily: 'monospace',
                marginBottom: 4,
              }}>
                #{nft.tokenId}
              </div>
              <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'monospace' }}>
                {nft.owner}
              </div>
              {isHovered && (
                <div style={{ marginTop: 8, fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                  <div>{nft.ownerShort}</div>
                  <div style={{ color: nft.color, marginTop: 2 }}>{nft.uri}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hovered detail */}
      {hoveredNFT && (
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 12,
          background: `${hoveredNFT.color}08`,
          border: `1px solid ${hoveredNFT.color}30`,
        }}>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.text, lineHeight: 1.8 }}>
            <div><span style={{ color: colors.textMuted }}>ownerOf({hoveredNFT.tokenId})</span> = <span style={{ color: hoveredNFT.color }}>{hoveredNFT.owner} ({hoveredNFT.ownerShort})</span></div>
            <div><span style={{ color: colors.textMuted }}>tokenURI({hoveredNFT.tokenId})</span> = <span style={{ color: hoveredNFT.color }}>{hoveredNFT.uri}</span></div>
          </div>
        </div>
      )}

      {/* Mappings toggle */}
      <button
        onClick={() => setShowMappings(!showMappings)}
        style={{
          ...glassStyle,
          padding: '6px 14px',
          cursor: 'pointer',
          background: showMappings ? `${colors.primary}15` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${showMappings ? colors.primary : 'rgba(255,255,255,0.1)'}`,
          color: showMappings ? colors.primary : colors.textMuted,
          fontSize: 12,
          fontFamily: 'monospace',
          marginBottom: 12,
        }}
      >
        {showMappings ? 'Скрыть маппинги' : 'Показать внутренние маппинги'}
      </button>

      {showMappings && (
        <div style={{
          ...glassStyle,
          padding: 12,
          marginBottom: 12,
        }}>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.textMuted, marginBottom: 8 }}>
            mapping(uint256 =&gt; address) _owners:
          </div>
          {NFT_COLLECTION.map((nft) => (
            <div key={nft.tokenId} style={{ fontSize: 11, fontFamily: 'monospace', color: colors.text, marginBottom: 2 }}>
              <span style={{ color: colors.textMuted }}>_owners[{nft.tokenId}]</span> = <span style={{ color: nft.color }}>{nft.owner}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: colors.textMuted, marginTop: 12, marginBottom: 8 }}>
            mapping(address =&gt; uint256) _balances:
          </div>
          {Object.entries(BALANCES).map(([owner, count]) => (
            <div key={owner} style={{ fontSize: 11, fontFamily: 'monospace', color: colors.text, marginBottom: 2 }}>
              <span style={{ color: colors.textMuted }}>_balances[{owner}]</span> = <span style={{ color: colors.primary }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* ERC-20 vs ERC-721 contrast */}
      <div style={{
        ...glassStyle,
        padding: 12,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 1.6,
      }}>
        <span style={{ color: colors.success, fontFamily: 'monospace' }}>ERC-20</span>: balanceOf(Alice) = 500 (сколько токенов, не какие)<br />
        <span style={{ color: colors.primary, fontFamily: 'monospace' }}>ERC-721</span>: balanceOf(Alice) = 2, но каждый токен уникален (#0, #2)
      </div>
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ERCComparisonDiagram                                                 */
/* ================================================================== */

interface ComparisonRow {
  label: string;
  erc20: string;
  erc721: string;
  erc1155: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    label: 'Взаимозаменяемость',
    erc20: 'Fungible',
    erc721: 'Non-fungible',
    erc1155: 'Оба типа',
  },
  {
    label: 'Баланс',
    erc20: 'Одно число',
    erc721: 'Набор tokenId',
    erc1155: 'mapping(id => кол-во)',
  },
  {
    label: 'Перевод',
    erc20: 'transfer(to, amount)',
    erc721: 'transferFrom(from, to, tokenId)',
    erc1155: 'safeTransferFrom(from, to, id, amount, data)',
  },
  {
    label: 'Batch',
    erc20: 'Нет',
    erc721: 'Нет',
    erc1155: 'safeBatchTransferFrom',
  },
  {
    label: 'Одобрение (approve)',
    erc20: 'approve(spender, amount)',
    erc721: 'approve(to, tokenId)',
    erc1155: 'setApprovalForAll(op, bool)',
  },
  {
    label: 'Метаданные',
    erc20: 'name(), symbol()',
    erc721: 'tokenURI(tokenId)',
    erc1155: 'uri(id) с {id}',
  },
  {
    label: 'Gas (batch 10)',
    erc20: '10x single',
    erc721: '10x single',
    erc1155: '~1x batch (~90% экономия)',
  },
  {
    label: 'Применение',
    erc20: 'Валюты, governance',
    erc721: 'Арт, сертификаты',
    erc1155: 'Игровые предметы, коллекции',
  },
];

const COL_COLORS = {
  erc20: colors.success,
  erc721: colors.primary,
  erc1155: colors.accent,
};

/**
 * ERCComparisonDiagram
 *
 * Three-column comparison: ERC-20 vs ERC-721 vs ERC-1155.
 */
export function ERCComparisonDiagram() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <DiagramContainer title="ERC-20 vs ERC-721 vs ERC-1155" color="blue">
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '130px 1fr 1fr 1fr',
        gap: 2,
        marginBottom: 2,
      }}>
        <div style={{
          ...glassStyle,
          padding: '8px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: colors.textMuted,
          fontFamily: 'monospace',
        }}>
          Свойство
        </div>
        <div style={{
          ...glassStyle,
          padding: '8px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: COL_COLORS.erc20,
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          ERC-20
        </div>
        <div style={{
          ...glassStyle,
          padding: '8px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: COL_COLORS.erc721,
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          ERC-721
        </div>
        <div style={{
          ...glassStyle,
          padding: '8px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: COL_COLORS.erc1155,
          fontFamily: 'monospace',
          textAlign: 'center',
        }}>
          ERC-1155
        </div>
      </div>

      {/* Rows */}
      {COMPARISON_DATA.map((row, i) => {
        const isHovered = hoveredRow === i;

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: '130px 1fr 1fr 1fr',
              gap: 2,
              marginBottom: 2,
            }}
          >
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 11,
              color: isHovered ? colors.text : colors.textMuted,
              fontFamily: 'monospace',
              background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
            }}>
              {row.label}
            </div>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 10,
              color: isHovered ? COL_COLORS.erc20 : colors.text,
              fontFamily: 'monospace',
              background: isHovered ? `${COL_COLORS.erc20}10` : 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
            }}>
              {row.erc20}
            </div>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 10,
              color: isHovered ? COL_COLORS.erc721 : colors.text,
              fontFamily: 'monospace',
              background: isHovered ? `${COL_COLORS.erc721}10` : 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
            }}>
              {row.erc721}
            </div>
            <div style={{
              ...glassStyle,
              padding: '8px 10px',
              fontSize: 10,
              color: isHovered ? COL_COLORS.erc1155 : colors.text,
              fontFamily: 'monospace',
              background: isHovered ? `${COL_COLORS.erc1155}10` : 'rgba(255,255,255,0.02)',
              transition: 'all 0.15s',
            }}>
              {row.erc1155}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 12, fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
        ERC-1155 объединяет преимущества обоих стандартов: fungible токены (как GOLD) и non-fungible (как BADGE)
        в одном контракте с batch-операциями для экономии газа.
      </div>
    </DiagramContainer>
  );
}
