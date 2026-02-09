import { useState } from 'react'
import { TransferTable } from './components/TransferTable'
import { HolderRankings } from './components/HolderRankings'
import { LiveEventFeed } from './components/LiveEventFeed'

const tabs = [
  { id: 'transfers', label: 'Transfer History' },
  { id: 'holders', label: 'Holder Rankings' },
  { id: 'live', label: 'Live Events' },
] as const

type TabId = typeof tabs[number]['id']

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('transfers')

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#38bdf8' }}>
        LAB-07: Data Indexing Dashboard
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Визуализация проиндексированных ERC-20 Transfer событий из локального Anvil
      </p>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              background: activeTab === tab.id ? '#2563eb' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#fff' : '#94a3b8',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'transfers' && <TransferTable />}
      {activeTab === 'holders' && <HolderRankings />}
      {activeTab === 'live' && <LiveEventFeed />}
    </div>
  )
}
