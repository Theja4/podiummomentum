import React, { useEffect, useState } from 'react'
import './client-logo.css'

const logoToneCache = new Map()

function detectDarkArtwork(img) {
  try {
    const size = 64
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context || !img.naturalWidth || !img.naturalHeight) return false

    canvas.width = size
    canvas.height = size
    context.clearRect(0, 0, size, size)
    context.drawImage(img, 0, 0, size, size)

    const pixels = context.getImageData(0, 0, size, size).data
    let visibleWeight = 0
    let luminanceTotal = 0
    let darkWeight = 0

    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3] / 255
      if (alpha < .08) continue

      const luminance = .2126 * pixels[index] + .7152 * pixels[index + 1] + .0722 * pixels[index + 2]
      visibleWeight += alpha
      luminanceTotal += luminance * alpha
      if (luminance < 112) darkWeight += alpha
    }

    if (!visibleWeight) return false
    const averageLuminance = luminanceTotal / visibleWeight
    const darkShare = darkWeight / visibleWeight
    return averageLuminance < 118 || darkShare > .58
  } catch {
    // Cross-origin artwork cannot be sampled. Callers can use forceInvert.
    return false
  }
}

export default function ClientLogo({ src, alt = 'Client logo', className = '', forceInvert = false, onLoad, ...props }) {
  const [isDarkArtwork, setIsDarkArtwork] = useState(() => forceInvert || logoToneCache.get(src) === true)

  useEffect(() => {
    setIsDarkArtwork(forceInvert || logoToneCache.get(src) === true)
  }, [forceInvert, src])

  const handleLoad = event => {
    onLoad?.(event)
    if (forceInvert) {
      logoToneCache.set(src, true)
      setIsDarkArtwork(true)
      return
    }

    if (logoToneCache.has(src)) {
      setIsDarkArtwork(logoToneCache.get(src))
      return
    }

    const isDark = detectDarkArtwork(event.currentTarget)
    logoToneCache.set(src, isDark)
    setIsDarkArtwork(isDark)
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      data-client-logo=""
      data-logo-tone={isDarkArtwork ? 'dark' : 'light'}
      className={['client-logo', isDarkArtwork ? 'is-dark-artwork' : '', className].filter(Boolean).join(' ')}
      onLoad={handleLoad}
    />
  )
}
