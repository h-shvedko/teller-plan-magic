import React, { useState, useEffect, useRef } from 'react'
import { cdnService } from '@/lib/caching'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  transform?: 'thumbnail' | 'medium' | 'large' | 'webp' | string
  lazy?: boolean
  blur?: boolean
  fallback?: string
  onLoad?: () => void
  onError?: (error: Event) => void
  className?: string
}

interface ImageLoadingState {
  loaded: boolean
  error: boolean
  inView: boolean
}

export function OptimizedImage({
  src,
  alt,
  placeholder,
  transform = 'medium',
  lazy = true,
  blur = true,
  fallback,
  onLoad,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [state, setState] = useState<ImageLoadingState>({
    loaded: false,
    error: false,
    inView: false
  })
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder || '')
  
  // Generate optimized URLs
  const optimizedSrc = cdnService.getImageUrl(src, transform)
  const webpSrc = cdnService.getImageUrl(src, 'webp')
  const srcSet = cdnService.generateSrcSet(src)
  const sizes = cdnService.generateSizes()

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, inView: true }))
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    )

    observer.observe(imgRef.current)

    return () => observer.disconnect()
  }, [lazy])

  // Load image when in view or not lazy
  useEffect(() => {
    if (lazy && !state.inView) return

    const img = new Image()
    
    // Support for modern image formats
    const supportsWebP = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL('image/webp').startsWith('data:image/webp')
    }

    const imageUrl = supportsWebP() ? webpSrc : optimizedSrc

    img.onload = () => {
      setCurrentSrc(imageUrl)
      setState(prev => ({ ...prev, loaded: true, error: false }))
      onLoad?.()
    }

    img.onerror = (error) => {
      setState(prev => ({ ...prev, error: true, loaded: false }))
      if (fallback) {
        setCurrentSrc(fallback)
      }
      onError?.(error)
    }

    // Set srcset for responsive images
    if (srcSet) {
      img.srcset = srcSet
      img.sizes = sizes
    }
    
    img.src = imageUrl
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [state.inView, lazy, optimizedSrc, webpSrc, srcSet, sizes, fallback, onLoad, onError])

  // Progressive loading effect
  const shouldShowPlaceholder = !state.loaded && placeholder
  const shouldBlur = blur && !state.loaded && placeholder

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* Placeholder or low-quality image */}
      {shouldShowPlaceholder && (
        <img
          src={placeholder}
          alt={`${alt} (loading)`}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            shouldBlur && "filter blur-sm scale-110",
            state.loaded && "opacity-0"
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={state.inView || !lazy ? currentSrc : ''}
        srcSet={state.inView || !lazy ? srcSet : ''}
        sizes={sizes}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          !state.loaded && "opacity-0",
          state.loaded && "opacity-100"
        )}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        {...props}
      />
      
      {/* Loading indicator */}
      {!state.loaded && !state.error && (state.inView || !lazy) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
        </div>
      )}
      
      {/* Error state */}
      {state.error && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">Image failed to load</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for progressive image loading
export function useProgressiveImage(src: string, placeholder?: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new Image()
    
    img.onload = () => {
      setCurrentSrc(src)
      setLoading(false)
      setError(false)
    }
    
    img.onerror = () => {
      setLoading(false)
      setError(true)
    }
    
    img.src = src
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return {
    src: currentSrc,
    blur: loading && !!placeholder,
    loading,
    error
  }
}

// Image preloader utility
export class ImagePreloader {
  private cache = new Set<string>()
  private loading = new Map<string, Promise<void>>()

  async preload(src: string | string[], transform?: string): Promise<void> {
    const sources = Array.isArray(src) ? src : [src]
    
    const promises = sources.map(async (source) => {
      const url = transform ? cdnService.getImageUrl(source, transform) : source
      
      if (this.cache.has(url)) {
        return Promise.resolve()
      }

      if (this.loading.has(url)) {
        return this.loading.get(url)!
      }

      const promise = new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          this.cache.add(url)
          this.loading.delete(url)
          resolve()
        }
        img.onerror = () => {
          this.loading.delete(url)
          reject(new Error(`Failed to load image: ${url}`))
        }
        img.src = url
      })

      this.loading.set(url, promise)
      return promise
    })

    await Promise.allSettled(promises)
  }

  preloadInBackground(src: string | string[], transform?: string): void {
    this.preload(src, transform).catch(() => {
      // Silently handle errors for background preloading
    })
  }

  isPreloaded(src: string, transform?: string): boolean {
    const url = transform ? cdnService.getImageUrl(src, transform) : src
    return this.cache.has(url)
  }

  clear(): void {
    this.cache.clear()
    this.loading.clear()
  }

  getStats(): { cached: number; loading: number } {
    return {
      cached: this.cache.size,
      loading: this.loading.size
    }
  }
}

// Export singleton instance
export const imagePreloader = new ImagePreloader()

// High-level image gallery component with optimizations
interface ImageGalleryProps {
  images: Array<{ src: string; alt: string; caption?: string }>
  transform?: string
  lazy?: boolean
  preloadNext?: number
  className?: string
}

export function ImageGallery({
  images,
  transform = 'medium',
  lazy = true,
  preloadNext = 2,
  className
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Preload next images
  useEffect(() => {
    if (preloadNext > 0 && images.length > 1) {
      const nextImages = images
        .slice(currentIndex + 1, currentIndex + 1 + preloadNext)
        .map(img => img.src)
      
      if (nextImages.length > 0) {
        imagePreloader.preloadInBackground(nextImages, transform)
      }
    }
  }, [currentIndex, images, preloadNext, transform])

  if (images.length === 0) return null

  return (
    <div className={cn("grid gap-4", className)}>
      {images.map((image, index) => (
        <div key={index} className="relative">
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            transform={transform}
            lazy={lazy && index > 0} // Don't lazy load first image
            className="rounded-lg"
            onClick={() => setCurrentIndex(index)}
          />
          {image.caption && (
            <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
          )}
        </div>
      ))}
    </div>
  )
}