'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Clock, Star, CheckCircle, XCircle, AlertCircle, Sparkles, Send } from 'lucide-react'
import { toast } from 'sonner'
import {
  getMeetupDetails,
  proposeMeetup,
  acceptMeetup,
  cancelMeetup,
  submitRating,
} from '@/lib/actions/meetups'
import { MEETUP_SPOTS } from '@/lib/constants'
import type { Meetup, Profile } from '@/types/database.types'

export default function MeetupCoordinator({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    claim: any
    post: any
    meetup: Meetup | null
    ratings: any[]
    currentUserRole: 'claimer' | 'owner'
    otherUser: Profile
  } | null>(null)

  // Proposal form state
  const [selectedSpot, setSelectedSpot] = useState<string>(MEETUP_SPOTS[0])
  const [customSpot, setCustomSpot] = useState('')
  const [meetupTime, setMeetupTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Rating state
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [rated, setRated] = useState(false)

  const loadDetails = async () => {
    setLoading(true)
    try {
      const res = await getMeetupDetails(postId)
      setData(res)
      if (res && res.meetup) {
        // Check if user has already rated
        const hasRated = res.ratings.some((r: any) => r.rater_id === res.claim.claimer_id || r.rater_id === res.post.user_id)
        // More specifically, did the CURRENT user rate?
        const currentUserId = res.currentUserRole === 'claimer' ? res.claim.claimer_id : res.post.user_id
        const userHasRated = res.ratings.some((r: any) => r.rater_id === currentUserId)
        setRated(userHasRated)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load meetup details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetails()
  }, [postId])

  if (loading) {
    return (
      <div className="surface" style={{ padding: 24, marginTop: 24 }}>
        <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 100, marginBottom: 12 }} />
      </div>
    )
  }

  if (!data) return null

  const { claim, post, meetup, currentUserRole, otherUser, ratings } = data
  const isProposer = meetup?.proposed_by === (currentUserRole === 'claimer' ? claim.claimer_id : post.user_id)

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetupTime) {
      toast.error('Please choose a date and time.')
      return
    }

    setSubmitting(true)
    const finalLocation = selectedSpot === 'Other' ? customSpot : selectedSpot

    const res = await proposeMeetup({
      claimId: claim.id,
      postId,
      location: finalLocation || selectedSpot,
      time: new Date(meetupTime).toISOString(),
    })

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Meetup proposed successfully!')
      loadDetails()
    }
    setSubmitting(false)
  }

  const handleAccept = async () => {
    if (!meetup) return
    setSubmitting(true)
    const res = await acceptMeetup(meetup.id, postId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Meetup confirmed! See you there!')
      loadDetails()
    }
    setSubmitting(false)
  }

  const handleCancel = async () => {
    if (!meetup) return
    if (!confirm('Are you sure you want to cancel or reschedule this meetup?')) return
    setSubmitting(true)
    const res = await cancelMeetup(meetup.id, postId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Meetup cancelled.')
      loadDetails()
    }
    setSubmitting(false)
  }

  const handleRate = async () => {
    if (!meetup) return
    setSubmitting(true)
    const res = await submitRating(meetup.id, otherUser.id, rating, postId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Feedback submitted! Thank you.')
      setRated(true)
      loadDetails()
    }
    setSubmitting(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="surface" style={{ padding: 24, marginTop: 24, borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          backgroundColor: 'var(--accent-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Meetup Coordination</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            {meetup ? `Status: ${meetup.status.toUpperCase()}` : 'Coordinate item handover'}
          </p>
        </div>
      </div>

      {/* Meetup is not proposed or was cancelled */}
      {(!meetup || meetup.status === 'cancelled') && (
        <div>
          <div style={{
            backgroundColor: 'var(--accent-light)', border: '1px solid var(--border)',
            padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.8125rem'
          }}>
            🎉 <strong>Claim Approved!</strong> Propose a safe location and time on campus to complete the item exchange. We recommend public areas during daytime.
          </div>

          <form onSubmit={handlePropose}>
            <div className="form-group">
              <label>Select Meetup Spot</label>
              <select
                className="input"
                value={selectedSpot}
                onChange={(e) => setSelectedSpot(e.target.value)}
              >
                {MEETUP_SPOTS.map((spot) => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
                <option value="Other">Other (Specify below)</option>
              </select>
            </div>

            {selectedSpot === 'Other' && (
              <div className="form-group">
                <label>Specify Location</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Near Nescafe booth under SJT"
                  value={customSpot}
                  onChange={(e) => setCustomSpot(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Proposed Date &amp; Time</label>
              <input
                type="datetime-local"
                className="input"
                value={meetupTime}
                onChange={(e) => setMeetupTime(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              <Send size={16} /> Propose Meetup
            </button>
          </form>
        </div>
      )}

      {/* Meetup is proposed (pending confirmation) */}
      {meetup && meetup.status === 'pending' && (
        <div>
          <div style={{
            backgroundColor: 'var(--pending-bg)', border: '1px solid var(--border)',
            padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertCircle size={20} style={{ color: 'var(--pending)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {isProposer ? 'Meetup Proposal Sent' : 'Meetup Proposal Received'}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {isProposer
                    ? `Waiting for ${otherUser.name} to confirm or reschedule.`
                    : `${otherUser.name} has proposed the following meetup details.`}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-2" style={{ padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Location:</strong> {meetup.proposed_location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Date:</strong> {formatDate(meetup.proposed_time)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Time:</strong> {formatTime(meetup.proposed_time)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {!isProposer && (
              <button onClick={handleAccept} className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                <CheckCircle size={16} /> Accept Proposal
              </button>
            )}
            <button onClick={handleCancel} className="btn btn-secondary" style={{ flex: 1 }} disabled={submitting}>
              <XCircle size={16} style={{ color: 'var(--lost)' }} /> {isProposer ? 'Cancel Proposal' : 'Reschedule'}
            </button>
          </div>
        </div>
      )}

      {/* Meetup is confirmed */}
      {meetup && meetup.status === 'confirmed' && (
        <div>
          <div style={{
            backgroundColor: 'var(--found-bg)', border: '1px solid var(--border)',
            padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ color: 'var(--found)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Meetup Confirmed!
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Make sure to arrive on time. Contact each other if any changes.
                </p>
              </div>
            </div>
          </div>

          <div className="surface-2" style={{ padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Location:</strong> {meetup.proposed_location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Date:</strong> {formatDate(meetup.proposed_time)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                <span><strong>Time:</strong> {formatTime(meetup.proposed_time)}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Contact Name:</strong> {otherUser.name} ({otherUser.email})
              </div>
            </div>
          </div>

          {/* Rating / Completion section */}
          <div className="surface" style={{ padding: 16, border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>Have you met?</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Rate {otherUser.name} to confirm the exchange and complete this post.
            </p>

            {!rated ? (
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <Star
                        size={28}
                        style={{
                          fill: star <= (hoveredRating ?? rating) ? 'var(--pending)' : 'none',
                          stroke: star <= (hoveredRating ?? rating) ? 'var(--pending)' : 'var(--text-muted)',
                          transition: 'transform 0.15s ease'
                        }}
                      />
                    </button>
                  ))}
                </div>
                <button onClick={handleRate} className="btn btn-primary btn-sm" style={{ width: '100%' }} disabled={submitting}>
                  Confirm Exchange &amp; Rate
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--found)', fontSize: '0.8125rem', fontWeight: 500 }}>
                ✓ You have submitted feedback. Waiting for the other party to complete feedback.
              </div>
            )}
          </div>

          <button onClick={handleCancel} className="btn btn-secondary btn-sm" style={{ width: '100%', color: 'var(--lost)' }} disabled={submitting}>
            Cancel/Reschedule Meetup
          </button>
        </div>
      )}

      {/* Meetup completed */}
      {meetup && meetup.status === 'completed' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--found)', marginBottom: 4 }}>
            Meetup Completed &amp; Resolved
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto' }}>
            The item has been successfully reunited with its owner! Thank you for keeping VIT safe and honest.
          </p>
        </div>
      )}
    </div>
  )
}
