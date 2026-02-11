/**
 * ERC-721 & ERC-1155 Diagrams (ETH-09)
 *
 * Exports:
 * - ERC721OwnershipDiagram: NFT ownership model (static with DiagramTooltip)
 * - ERCComparisonDiagram: ERC-20 vs ERC-721 vs ERC-1155 comparison (static with DiagramTooltip)
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
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
 * DiagramTooltip reveals metadata URI, owner, and mapping details.
 * Contrasts with ERC-20: each token is UNIQUE (tokenId).
 */
export function ERC721OwnershipDiagram() {
  const [showMappings, setShowMappings] = useState(false);

  return (
    <DiagramContainer title="ERC-721: уникальные токены (NFT)" color="purple">
      {/* NFT cards grid */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
        {NFT_COLLECTION.map((nft) => (
          <DiagramTooltip
            key={nft.tokenId}
            content={`Token ID #${nft.tokenId}: уникальный non-fungible токен. Владелец: ${nft.owner}. В отличие от ERC-20, каждый токен уникален и неделим. ownerOf(tokenId) возвращает текущего владельца.`}
          >
            <div
              style={{
                ...glassStyle,
                padding: 12,
                minWidth: 100,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.08)`,
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
              <div style={{ marginTop: 8, fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' }}>
                <div>{nft.ownerShort}</div>
                <div style={{ color: nft.color, marginTop: 2 }}>{nft.uri}</div>
              </div>
            </div>
          </DiagramTooltip>
        ))}
      </div>

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
  tooltipRu: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    label: 'Взаимозаменяемость',
    erc20: 'Fungible',
    erc721: 'Non-fungible',
    erc1155: 'Оба типа',
    tooltipRu: 'ERC-20: fungible (взаимозаменяемые). ERC-721: non-fungible (уникальные). ERC-1155: both (один контракт для fungible и non-fungible).',
  },
  {
    label: 'Баланс',
    erc20: 'Одно число',
    erc721: 'Набор tokenId',
    erc1155: 'mapping(id => кол-во)',
    tooltipRu: 'ERC-20: uint256 balance. ERC-721: набор tokenId через _owners mapping. ERC-1155: mapping(id => amount) для каждого токена.',
  },
  {
    label: 'Перевод',
    erc20: 'transfer(to, amount)',
    erc721: 'transferFrom(from, to, tokenId)',
    erc1155: 'safeTransferFrom(from, to, id, amount, data)',
    tooltipRu: 'ERC-20: transfer(to, amount). ERC-721: safeTransferFrom(from, to, tokenId). ERC-1155: safeTransferFrom с id + amount.',
  },
  {
    label: 'Batch',
    erc20: 'Нет',
    erc721: 'Нет',
    erc1155: 'safeBatchTransferFrom',
    tooltipRu: 'ERC-20: нет native batch. ERC-721: нет native batch. ERC-1155: safeBatchTransferFrom -- одна транзакция для множества токенов, экономия gas.',
  },
  {
    label: 'Одобрение (approve)',
    erc20: 'approve(spender, amount)',
    erc721: 'approve(to, tokenId)',
    erc1155: 'setApprovalForAll(op, bool)',
    tooltipRu: 'ERC-20: approve per-amount. ERC-721: approve per-tokenId или setApprovalForAll. ERC-1155: только setApprovalForAll (all-or-nothing).',
  },
  {
    label: 'Метаданные',
    erc20: 'name(), symbol()',
    erc721: 'tokenURI(tokenId)',
    erc1155: 'uri(id) с {id}',
    tooltipRu: 'ERC-20: name() и symbol() на уровне контракта. ERC-721: tokenURI per-token. ERC-1155: uri(id) с шаблоном {id} для всех токенов.',
  },
  {
    label: 'Gas (batch 10)',
    erc20: '10x single',
    erc721: '10x single',
    erc1155: '~1x batch (~90% экономия)',
    tooltipRu: 'При 10 переводах ERC-20/721 нужны 10 транзакций. ERC-1155 safeBatchTransferFrom делает всё за одну транзакцию с ~90% экономией gas.',
  },
  {
    label: 'Применение',
    erc20: 'Валюты, governance',
    erc721: 'Арт, сертификаты',
    erc1155: 'Игровые предметы, коллекции',
    tooltipRu: 'ERC-20: DeFi токены, governance (UNI, AAVE). ERC-721: NFT арт, сертификаты, домены (ENS). ERC-1155: игровые предметы (Enjin), SFT.',
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
      {COMPARISON_DATA.map((row, i) => (
        <div
          key={i}
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
            color: colors.textMuted,
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.15s',
          }}>
            <DiagramTooltip content={row.tooltipRu}>
              <span>{row.label}</span>
            </DiagramTooltip>
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 10,
            color: colors.text,
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.15s',
          }}>
            {row.erc20}
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 10,
            color: colors.text,
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.15s',
          }}>
            {row.erc721}
          </div>
          <div style={{
            ...glassStyle,
            padding: '8px 10px',
            fontSize: 10,
            color: colors.text,
            fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.15s',
          }}>
            {row.erc1155}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 12, fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
        ERC-1155 объединяет преимущества обоих стандартов: fungible токены (как GOLD) и non-fungible (как BADGE)
        в одном контракте с batch-операциями для экономии газа.
      </div>
    </DiagramContainer>
  );
}
