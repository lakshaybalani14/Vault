'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Lock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getSecretQuestion, verifyClaimAnswer, submitClaim } from '@/lib/actions/claims'
import { CLAIM_MESSAGE_MIN_LENGTH } from '@/lib/constants'

interface ClaimModalProps {
  postId: string
  postType: 'lost' | 'found'
  onClose: () => void
}

export default function ClaimModal({ postId, postType, onClose }: ClaimModalProps) {
  const [step, setStep] = useState<'answer' | 'message' | 'success' | 'locked'>('answer')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)

  useEffect(() => {
    async function loadQuestion() {
      const result = await getSecretQuestion(postId)
      setQuestion(result?.question || 'Loading...')
      if (result?.attemptsLeft !== undefined) {
        setAttemptsLeft(result.attemptsLeft)
      }
      if (result?.isLocked) {
        setStep('locked')
      }
    }
    loadQuestion()
  }, [postId])

  const handleVerifyAnswer = async () => {
    setLoading(true)
    setError('')
    const result = await verifyClaimAnswer(postId, answer)
    setLoading(false)

    if (result.error) {
      if (result.error.includes('locked out')) {
        setStep('locked')
        setAttemptsLeft(0)
      } else {
        setError(result.error)
        if (result.attemptsLeft !== undefined) setAttemptsLeft(result.attemptsLeft)
      }
    } else {
      setStep('message')
    }
  }

  const handleSubmitClaim = async () => {
    if (message.length < CLAIM_MESSAGE_MIN_LENGTH) return
    setLoading(true)
    const result = await submitClaim(postId, message)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      setStep('success')
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {step === 'answer' && 'Verify Your Claim'}
            {step === 'message' && 'Almost there'}
            {step === 'success' && 'Claim submitted!'}
            {step === 'locked' && 'Account locked'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Step A: Answer */}
          {step === 'answer' && (
            <div className="animate-fade-in">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                {postType === 'found'
                  ? "To confirm you're the owner, answer the poster's question:"
                  : "To confirm you found this item, answer the poster's question:"}
              </p>

              <div style={{
                padding: '12px 16px', backgroundColor: 'var(--surface-2)',
                borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)',
                marginBottom: 20, fontSize: '0.9375rem', fontStyle: 'italic',
              }}>
                &ldquo;{question}&rdquo;
              </div>

              <div className="form-group">
                <label htmlFor="claim-answer">Your answer</label>
                <input id="claim-answer" type="text" className={`input ${error ? 'input-error' : ''}`}
                  placeholder="Type your answer..." value={answer}
                  onChange={(e) => { setAnswer(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && answer && handleVerifyAnswer()} />
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  backgroundColor: 'var(--lost-bg)', borderRadius: 'var(--radius-sm)',
                  marginBottom: 16, fontSize: '0.8125rem', color: 'var(--lost)',
                }}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} allowed. Lockout on failure.
              </p>

              <button onClick={handleVerifyAnswer} className="btn btn-primary" disabled={loading || !answer}
                style={{ width: '100%' }}>
                {loading ? 'Verifying...' : 'Next →'}
              </button>
            </div>
          )}

          {/* Step B: Message */}
          {step === 'message' && (
            <div className="animate-fade-in">
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                color: 'var(--found)', fontSize: '0.875rem', fontWeight: 500,
              }}>
                <CheckCircle size={18} /> Answer matched!
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                Now tell the poster something specific about the item that only you would know.
                This helps them confirm it&apos;s really yours. (min {CLAIM_MESSAGE_MIN_LENGTH} characters)
              </p>

              <div className="form-group">
                <textarea className="input" placeholder="Describe specific details about the item..."
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  style={{ minHeight: 100 }} maxLength={500} />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {message.length}/500 characters (min {CLAIM_MESSAGE_MIN_LENGTH})
                </span>
              </div>

              <button onClick={handleSubmitClaim} className="btn btn-primary"
                disabled={loading || message.length < CLAIM_MESSAGE_MIN_LENGTH} style={{ width: '100%' }}>
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="animate-scale-in" style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ marginBottom: 8 }}>Claim submitted!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                The poster will review it and get back to you. You&apos;ll get a notification when they decide.
              </p>
              <button onClick={onClose} className="btn btn-primary">Done</button>
            </div>
          )}

          {/* Locked */}
          {step === 'locked' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
              <Lock size={40} style={{ color: 'var(--lost)', marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8 }}>Too many wrong answers</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                You&apos;re locked out for 24 hours. The poster has been notified.
              </p>
              <button onClick={onClose} className="btn btn-secondary">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
