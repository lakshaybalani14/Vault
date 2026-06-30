'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Images, Upload, X, ImageIcon } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { MAX_IMAGES } from '@/lib/constants'

interface ImageUploaderProps {
  images: File[]
  onImagesChange: (files: File[]) => void
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])
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

  // Generate previews from File objects
  useEffect(() => {
    const urls = images.map(file => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [images])

  const addFiles = useCallback(async (files: File[]) => {
    const remaining = MAX_IMAGES - images.length
    const filesToAdd = files.slice(0, remaining)
    
    const compressedFiles = await Promise.all(
      filesToAdd.map(async (file) => {
        try {
          return await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true
          })
        } catch (error) {
          console.error('Image compression failed:', error)
          return file // Fallback to original
        }
      })
    )
    
    onImagesChange([...images, ...compressedFiles].slice(0, MAX_IMAGES))
  }, [images, onImagesChange])

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onImagesChange(updated)
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
    maxFiles: MAX_IMAGES - images.length,
    disabled: images.length >= MAX_IMAGES,
  })

  const canAdd = images.length < MAX_IMAGES
  const remaining = MAX_IMAGES - images.length

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
