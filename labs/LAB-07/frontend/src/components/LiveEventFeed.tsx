import { useSubscription } from 'urql'
import { LIVE_TRANSFERS_SUBSCRIPTION } from '../graphql/subscriptions'
import { useRef, useEffect, useState } from 'react'

function truncateAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function formatValue(weiStr: string): string {
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

interface TransferEvent {
  id: string
  from: string
  to: string
  value: string
  blockNumber: number
  timestamp: string
}

export function LiveEventFeed() {
  const [result] = useSubscription({ query: LIVE_TRANSFERS_SUBSCRIPTION })
  const [flashId, setFlashId] = useState<string | null>(null)
  const prevDataRef = useRef<string | null>(null)

  const { data, error } = result

  const transfers: TransferEvent[] = data?.transfers ?? []

  // Flash animation on new entries
  useEffect(() => {
    if (transfers.length > 0) {
      const firstId = transfers[0].id
      if (prevDataRef.current !== null && prevDataRef.current !== firstId) {
        setFlashId(firstId)
        const timer = setTimeout(() => setFlashId(null), 1000)
        return () => clearTimeout(timer)
      }
      prevDataRef.current = firstId
    }
  }, [transfers])

  if (error) {
    return (
      <div style={cardStyle}>
        <p style={{ color: '#f87171' }}>
          WebSocket ошибка: {error.message}
        </p>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Убедитесь, что Subsquid GraphQL сервер запущен с поддержкой подписок (--subscriptions).
        </p>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', color: '#e2e8f0' }}>
          Live Event Feed
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34d399',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Listening for events...</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes flashGreen {
          0% { background: rgba(52, 211, 153, 0.3); }
          100% { background: transparent; }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {transfers.map((t: TransferEvent) => (
          <div
            key={t.id}
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.375rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              animation: flashId === t.id ? 'flashGreen 1s ease-out' : undefined,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: '#94a3b8' }}>Block #{t.blockNumber}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                {new Date(t.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span style={{ color: '#f87171' }}>{truncateAddress(t.from)}</span>
              <span style={{ color: '#94a3b8', margin: '0 0.5rem' }}>&rarr;</span>
              <span style={{ color: '#34d399' }}>{truncateAddress(t.to)}</span>
              <span style={{ color: '#38bdf8', marginLeft: '0.75rem' }}>{formatValue(t.value)}</span>
            </div>
          </div>
        ))}
        {transfers.length === 0 && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.875rem',
          }}>
            Ожидание Transfer событий...
            <br />
            <span style={{ fontSize: '0.75rem' }}>
              Деплойте контракт и выполните трансферы для генерации событий.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
