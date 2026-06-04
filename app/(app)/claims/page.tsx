'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Shield, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getClaimsForUser, approveClaim, rejectClaim } from '@/lib/actions/claims'
import { formatRelativeTime, getTrustScoreColor, getAccountAgeLabel } from '@/lib/utils'
import type { Claim } from '@/types/database.types'

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getClaimsForUser()
      setClaims(data as unknown as Claim[])
      setLoading(false)
    }
    load()
  }, [])

  const handleApprove = async (claimId: string, postId: string) => {
    if (!confirm('Approve this claim? All other pending claims on this post will be automatically rejected.')) return
    setActionLoading(claimId)
    const result = await approveClaim(claimId, postId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Claim approved!')
      const data = await getClaimsForUser()
      setClaims(data as unknown as Claim[])
    }
    setActionLoading(null)
  }

  const handleReject = async (claimId: string, postId: string) => {
    if (!confirm('Reject this claim?')) return
    setActionLoading(claimId)
    const result = await rejectClaim(claimId, postId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Claim rejected.')
      const data = await getClaimsForUser()
      setClaims(data as unknown as Claim[])
    }
    setActionLoading(null)
  }

  const pendingClaims = claims.filter((c) => c.status === 'pending')
  const resolvedClaims = claims.filter((c) => c.status !== 'pending')

  return (
    <div className="container page-shell narrow">
      <div className="page-head">
        <h1 className="page-title">Claims Dashboard</h1>
      </div>

      {loading && (
        <div className="section-stack">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface panel">
              <div className="skeleton" style={{ height: 20, width: '50%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 36, width: '40%' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && claims.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">C</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>No claims yet</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            When someone claims your post, it will appear here.
          </p>
        </div>
      )}

      {pendingClaims.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="section-title" style={{ color: 'var(--pending)' }}>
            <Clock size={16} /> Pending Claims ({pendingClaims.length})
          </h2>
          <div className="section-stack">
            {pendingClaims.map((claim, idx) => (
              <ClaimReviewCard
                key={claim.id}
                claim={claim}
                onApprove={() => handleApprove(claim.id, claim.post_id)}
                onReject={() => handleReject(claim.id, claim.post_id)}
                loading={actionLoading === claim.id}
                delay={idx * 50}
              />
            ))}
          </div>
        </section>
      )}

      {resolvedClaims.length > 0 && (
        <section>
          <h2 className="section-title" style={{ color: 'var(--text-secondary)' }}>
            Past Claims ({resolvedClaims.length})
          </h2>
          <div className="section-stack">
            {resolvedClaims.map((claim) => (
              <div key={claim.id} className="surface panel" style={{ opacity: 0.74 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{claim.post_title}</span>
                  <span className={`badge ${claim.status === 'approved' ? 'badge-found' : 'badge-lost'}`}>
                    {claim.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  by {claim.claimer_name} - {formatRelativeTime(claim.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ClaimReviewCard({
  claim,
  onApprove,
  onReject,
  loading,
  delay,
}: {
  claim: Claim
  onApprove: () => void
  onReject: () => void
  loading: boolean
  delay: number
}) {
  const trustColor = getTrustScoreColor(claim.claimer_trust_score || 5)
  const ageLabel = getAccountAgeLabel(claim.claimer_created_at || '')
  const initials = (claim.claimer_name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="surface claim-card animate-slide-up" style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
        Pending Claim - &quot;{claim.post_title}&quot;
      </div>

      <div className="claim-meta-row">
        <div className="claim-avatar">{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600 }}>{claim.claimer_name}</span>
            <span style={{ fontSize: '0.75rem' }} className={trustColor.color}>
              {trustColor.icon} {(claim.claimer_trust_score || 5).toFixed(1)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{formatRelativeTime(claim.created_at)}</span>
            {ageLabel && (
              <span style={{ fontSize: '0.6875rem' }} className={ageLabel.color}>
                <AlertTriangle size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {ageLabel.label}
              </span>
            )}
            {(claim.claimer_strikes || 0) > 0 && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--lost)' }}>
                {claim.claimer_strikes} strike{claim.claimer_strikes !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.8125rem' }}>
        <Shield size={15} style={{ color: 'var(--found)' }} />
        <span>Secret question answer:</span>
        <span style={{ color: 'var(--found)', fontWeight: 600 }}>
          <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Correct
        </span>
      </div>

      {claim.message && (
        <div className="claim-message">
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)', fontSize: '0.75rem' }}>
            Their message:
          </div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{claim.message}</span>
        </div>
      )}

      <div className="claim-actions">
        <button onClick={onApprove} className="btn btn-primary btn-sm" disabled={loading}>
          <CheckCircle size={15} /> Approve
        </button>
        <button onClick={onReject} className="btn btn-secondary btn-sm" disabled={loading} style={{ color: 'var(--lost)' }}>
          <XCircle size={15} /> Reject
        </button>
      </div>
    </div>
  )
}
