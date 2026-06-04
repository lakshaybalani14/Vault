'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createPost } from '@/lib/actions/posts'
import { CATEGORIES, CAMPUS_LOCATIONS, QUESTION_TEMPLATES } from '@/lib/constants'
import { getCategoryEmoji } from '@/lib/utils'
import ImageUploader from '@/components/posts/ImageUploader'
import Stepper, { Step } from '@/components/shared/Stepper'

type PostType = 'lost' | 'found'

export default function NewPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quickType = searchParams.get('type')
  const initialType: PostType | null = quickType === 'lost' || quickType === 'found' ? quickType : null

  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  const [postType, setPostType] = useState<PostType | null>(initialType)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16))
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const totalSteps = 5

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return Boolean(postType && title.length >= 5 && category)
      case 2:
        return Boolean(description.length >= 20 && location)
      case 3:
        return true
      case 4:
        return Boolean(question.length >= 10 && answer.length >= 1)
      case 5:
        return true
      default:
        return false
    }
  }

  const handlePublish = async () => {
    if (!postType || loading) return
    setLoading(true)

    const result = await createPost({
      type: postType,
      title,
      description,
      category,
      found_at: location,
      is_anonymous: isAnonymous,
      question,
      answer,
      image_urls: imageUrls,
    })

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Post published!')
      router.push(`/post/${result.postId}`)
    }
  }

  return (
    <div className="container page-shell">
      <div className="wizard-shell">
        <div className="wizard-head">
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: 8 }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="page-title" style={{ fontSize: '1.25rem' }}>Post an Item</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Step {activeStep} of {totalSteps}</p>
          </div>
        </div>

        <div className="wizard-step">
          <div className="surface wizard-card">
            <Stepper
              initialStep={activeStep}
              onStepChange={setActiveStep}
              onFinalStepCompleted={handlePublish}
              stepContainerClassName="mb-6"
              contentClassName="pb-2"
              footerClassName="pt-3"
              nextButtonText="Next"
              nextButtonProps={{ disabled: !canProceed(activeStep) || loading }}
              backButtonProps={{ disabled: loading }}
            >
              <Step>
                <h2 style={{ marginBottom: 20 }}>What happened?</h2>
                <div className="toggle-grid">
                  {(['lost', 'found'] as const).map((type) => {
                    const active = postType === type
                    return (
                      <button
                        key={type}
                        onClick={() => setPostType(type)}
                        className={`type-tile ${active ? (type === 'lost' ? 'active-lost' : 'active-found') : ''}`}
                      >
                        <div style={{ fontSize: 28, marginBottom: 4 }}>{type === 'lost' ? 'L' : 'F'}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {type === 'lost' ? 'I Lost Something' : 'I Found Something'}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="form-group">
                  <label htmlFor="title">What is the item?</label>
                  <input id="title" type="text" className="input" placeholder="e.g., Blue Water Bottle, AirPods Pro" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{title.length}/100 characters</span>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <div className="category-grid">
                    {CATEGORIES.map((cat) => (
                      <button key={cat.value} onClick={() => setCategory(cat.value)} className={`category-tile ${category === cat.value ? 'active' : ''}`}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.emoji}</div>
                        <div style={{ fontWeight: category === cat.value ? 700 : 500, color: category === cat.value ? 'var(--accent)' : 'var(--text-secondary)' }}>
                          {cat.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Step>

              <Step>
                <h2 style={{ marginBottom: 20 }}>Tell us more</h2>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" className="input" placeholder="Describe the item - color, size, brand, marks" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} style={{ minHeight: 120 }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{description.length}/1000 characters (min 20)</span>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Where on campus?</label>
                  <select id="location" className="input" value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="">Select a location...</option>
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="datetime">When?</label>
                  <input id="datetime" type="datetime-local" className="input" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
                </div>
              </Step>

              <Step>
                <h2 style={{ marginBottom: 8 }}>Add photos</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
                  Upload up to 3 images. Photos help identify items faster.
                </p>
                <ImageUploader imageUrls={imageUrls} onImagesChange={setImageUrls} />
              </Step>

              <Step>
                <h2 style={{ marginBottom: 8 }}>Set a verification question</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                  {postType === 'lost'
                    ? 'Set a question only the person who found your item can answer. Avoid visible details.'
                    : 'Set a question only the real owner would know. Avoid visible details.'}
                </p>

                <div className="template-row">
                  {(postType ? QUESTION_TEMPLATES[postType] : []).map((template) => (
                    <button key={template} onClick={() => setQuestion(template)} className={`template-chip ${question === template ? 'active' : ''}`}>
                      {template}
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label htmlFor="question">Your question</label>
                  <input id="question" type="text" className="input" placeholder="Type a custom question or choose a template" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} />
                </div>

                <div className="form-group">
                  <label htmlFor="answer">Correct answer</label>
                  <input id="answer" type="text" className="input" placeholder="Type the correct answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Answer is case-insensitive.
                  </span>
                </div>

                <div className="switch-row">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Post anonymously?</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your name and avatar will be hidden</div>
                  </div>
                  <button onClick={() => setIsAnonymous(!isAnonymous)} className={`switch-btn ${isAnonymous ? 'on' : ''}`}>
                    <div className="switch-knob" />
                  </button>
                </div>
              </Step>

              <Step>
                <h2 style={{ marginBottom: 20 }}>Preview your post</h2>
                <div className="surface panel" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span className={`badge ${postType === 'lost' ? 'badge-lost' : 'badge-found'}`}>{postType?.toUpperCase()}</span>
                    <span className="badge badge-category">{getCategoryEmoji(category)} {category}</span>
                    {isAnonymous && <span className="badge badge-category">Anonymous</span>}
                  </div>

                  {imageUrls.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
                      {imageUrls.map((url, i) => (
                        <img key={i} src={url} alt={`Item ${i + 1}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                      ))}
                    </div>
                  )}

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>{description}</p>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{location}</span>
                    <span>{new Date(dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Security Question</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{question}</div>
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>
        </div>
      </div>
    </div>
  )
}
