import { useQuery } from 'urql'
import { TRANSFERS_QUERY, TRANSFER_COUNT_QUERY } from '../graphql/queries'
import { useState } from 'react'

function truncateAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatValue(weiStr: string): string {
  const wei = BigInt(weiStr)
  const whole = wei / 10n ** 18n
  return whole.toLocaleString() + ' STK'
}

const PAGE_SIZE = 20

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  backdropFilter: 'blur(8px)',
  padding: '1.5rem',
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  textAlign: 'left' as const,
  color: '#94a3b8',
  fontSize: '0.75rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  color: '#e2e8f0',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
}

export function TransferTable() {
  const [page, setPage] = useState(0)

  const [transfersResult] = useQuery({
    query: TRANSFERS_QUERY,
    variables: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
  })

  const [countResult] = useQuery({ query: TRANSFER_COUNT_QUERY })

  const { data, fetching, error } = transfersResult
  const totalCount = countResult.data?.transfersConnection?.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  if (error) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#f87171' }}>
          Ошибка загрузки: {error.message}
        </p>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Убедитесь, что Subsquid стек запущен: docker compose --profile subsquid up -d
        </p>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', color: '#e2e8f0' }}>
          Transfer History
          {totalCount > 0 && (
            <span style={{ color: '#94a3b8', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
              ({totalCount} total)
            </span>
          )}
        </h2>
        {fetching && <span style={{ color: '#38bdf8', fontSize: '0.75rem' }}>Loading...</span>}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>From</th>
              <th style={thStyle}>To</th>
              <th style={thStyle}>Value</th>
              <th style={thStyle}>Block</th>
              <th style={thStyle}>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {data?.transfers?.map((t: { id: string; from: string; to: string; value: string; blockNumber: number; txHash: string }, i: number) => (
              <tr
                key={t.id}
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}
              >
                <td style={tdStyle}>{truncateAddress(t.from)}</td>
                <td style={tdStyle}>{truncateAddress(t.to)}</td>
                <td style={{ ...tdStyle, color: '#34d399' }}>{formatValue(t.value)}</td>
                <td style={tdStyle}>{t.blockNumber}</td>
                <td style={tdStyle}>{truncateAddress(t.txHash)}</td>
              </tr>
            ))}
            {(!data?.transfers || data.transfers.length === 0) && !fetching && (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>
                  Нет Transfer событий. Деплойте контракт и выполните несколько трансферов.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.25rem',
              background: 'rgba(255,255,255,0.05)',
              color: page === 0 ? '#475569' : '#e2e8f0',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Prev
          </button>
          <span style={{ padding: '0.375rem 0.75rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              padding: '0.375rem 0.75rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.25rem',
              background: 'rgba(255,255,255,0.05)',
              color: page >= totalPages - 1 ? '#475569' : '#e2e8f0',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
