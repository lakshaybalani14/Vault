'use client'

import { useEffect, useState } from 'react'
import { getWeeklyAnalytics } from '@/lib/actions/analytics'

export default function CampusAnalytics() {
  const [stats, setStats] = useState({
    lostCount: 0,
    foundCount: 0,
    reunitedCount: 0,
    avgResolutionHours: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWeeklyAnalytics().then((data) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="analytics-sidebar panel surface skeleton" style={{ minHeight: '260px' }}></div>
    )
  }

  return (
    <div className="analytics-sidebar panel surface animate-fade-in">
      <h3 className="section-title" style={{ marginBottom: '16px' }}>
        This week at VIT Vault
      </h3>
      
      <div className="analytics-grid">
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <div className="stat-value">{stats.lostCount}</div>
            <div className="stat-label">Items reported lost</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-value">{stats.foundCount}</div>
            <div className="stat-label">Items found & posted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.reunitedCount}</div>
            <div className="stat-label">Successfully reunited</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgResolutionHours} <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>hrs</span></div>
            <div className="stat-label">Avg. resolution time</div>
          </div>
        </div>
      </div>
    </div>
  )
}
