'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Images, Upload, X, ImageIcon } from 'lucide-react'
import { MAX_IMAGES } from '@/lib/constants'

interface ImageUploaderProps {
  imageUrls: string[]
  onImagesChange: (urls: string[]) => void
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImageUploader({ imageUrls, onImagesChange }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(imageUrls)
  const [isMobile, setIsMobile] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Detect mobile on mount (touch-capable + narrow screen)
  useEffect(() => {
    const check = () =>
      setIsMobile(window.matchMedia('(max-width: 768px)').matches && ('ontouchstart' in window || navigator.maxTouchPoints > 0))
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const addFiles = useCallback(async (files: File[]) => {
    const remaining = MAX_IMAGES - previews.length
    const filesToAdd = files.slice(0, remaining)
    const results = await Promise.all(filesToAdd.map(readFileAsDataURL))
    setPreviews(prev => {
      const updated = [...prev, ...results].slice(0, MAX_IMAGES)
      onImagesChange(updated)
      return updated
    })
  }, [previews.length, onImagesChange])

  const removeImage = (index: number) => {
    setPreviews(prev => {
      const updated = prev.filter((_, i) => i !== index)
      onImagesChange(updated)
      return updated
    })
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) void addFiles(files)
    // Reset so same file can be re-selected
    e.target.value = ''
  }, [addFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: MAX_IMAGES - previews.length,
    disabled: previews.length >= MAX_IMAGES,
  })

  const canAdd = previews.length < MAX_IMAGES
  const remaining = MAX_IMAGES - previews.length

  return (
    <div>
      {/* Preview thumbnails */}
      {previews.length > 0 && (
        <div className="img-uploader-previews">
          {previews.map((preview, index) => (
            <div key={index} className="img-uploader-thumb">
              <img src={preview} alt={`Upload ${index + 1}`} className="img-uploader-thumb-img" />
              <button
                onClick={() => removeImage(index)}
                className="img-uploader-remove"
                aria-label="Remove image"
                type="button"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile: Camera + Gallery buttons */}
      {canAdd && isMobile && (
        <div className="img-uploader-mobile">
          {/* Hidden camera input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleInputChange}
          />
          {/* Hidden gallery input */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleInputChange}
          />

          <button
            type="button"
            className="img-uploader-mobile-btn img-uploader-camera-btn"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={22} />
            <span>Take Photo</span>
            <small>Opens camera</small>
          </button>

          <button
            type="button"
            className="img-uploader-mobile-btn img-uploader-gallery-btn"
            onClick={() => galleryInputRef.current?.click()}
          >
            <Images size={22} />
            <span>Gallery</span>
            <small>Choose from library</small>
          </button>
        </div>
      )}

      {/* Desktop: Drag & drop zone */}
      {canAdd && !isMobile && (
        <div
          {...getRootProps()}
          className={`img-uploader-dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="img-uploader-dropzone-inner">
            {isDragActive
              ? <Upload size={32} className="img-uploader-icon active" />
              : <ImageIcon size={32} className="img-uploader-icon" />
            }
            <div className="img-uploader-label">
              {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to select'}
            </div>
            <div className="img-uploader-hint">
              Up to {remaining} more • JPG, PNG, WebP
            </div>
          </div>
        </div>
      )}

      {/* Slot count badge */}
      {previews.length > 0 && canAdd && (
        <p className="img-uploader-slots">
          {remaining} photo slot{remaining !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  )
}
