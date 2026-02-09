import { useQuery } from 'urql'
import { HOLDER_RANKINGS_QUERY } from '../graphql/queries'

function truncateAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatBalance(weiStr: string): string {
  const wei = BigInt(weiStr)
  const whole = wei / 10n ** 18n
  return whole.toLocaleString() + ' STK'
}

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

export function HolderRankings() {
  const [result] = useQuery({
    query: HOLDER_RANKINGS_QUERY,
    variables: { limit: 20 },
  })

  const { data, fetching, error } = result

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

  const accounts = data?.accounts ?? []

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', color: '#e2e8f0' }}>
          Holder Rankings
          <span style={{ color: '#94a3b8', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
            (Top 20)
          </span>
        </h2>
        {fetching && <span style={{ color: '#38bdf8', fontSize: '0.75rem' }}>Loading...</span>}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '60px' }}>Rank</th>
              <th style={thStyle}>Address</th>
              <th style={thStyle}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a: { id: string; balance: string }, i: number) => {
              const isTop3 = i < 3
              return (
                <tr
                  key={a.id}
                  style={{
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  <td style={{
                    ...tdStyle,
                    color: isTop3 ? '#34d399' : '#94a3b8',
                    fontWeight: isTop3 ? 700 : 400,
                  }}>
                    #{i + 1}
                  </td>
                  <td style={tdStyle}>{truncateAddress(a.id)}</td>
                  <td style={{
                    ...tdStyle,
                    color: isTop3 ? '#34d399' : '#e2e8f0',
                  }}>
                    {formatBalance(a.balance)}
                  </td>
                </tr>
              )
            })}
            {accounts.length === 0 && !fetching && (
              <tr>
                <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8' }}>
                  Нет данных. Деплойте контракт и выполните несколько трансферов.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
