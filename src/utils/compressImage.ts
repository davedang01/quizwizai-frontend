/**
 * Compress an image data URL to stay under a target size.
 *
 * Uses an off-screen <canvas> to decode → resize → re-encode as JPEG.
 * This ensures large phone camera images (5-15 MB) are compressed before
 * being sent to the backend / Claude Vision API (5 MB base64 limit).
 */

const MAX_B64_SIZE = 4.5 * 1024 * 1024 // 4.5 MB target (leaves headroom under Claude's 5 MB limit)
const MAX_DIMENSION = 2048              // Max width or height in pixels

export async function compressImageDataURL(dataURL: string): Promise<string> {
  // If it's not an image data URL or is already small, return as-is
  if (!dataURL.startsWith('data:image')) return dataURL
  const b64Part = dataURL.split(',')[1] || ''
  if (b64Part.length <= MAX_B64_SIZE) return dataURL

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img

      // Scale down to MAX_DIMENSION while maintaining aspect ratio
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      // Try decreasing quality until under the target size
      for (const quality of [0.85, 0.75, 0.65, 0.5, 0.35]) {
        const compressed = canvas.toDataURL('image/jpeg', quality)
        const compressedB64 = compressed.split(',')[1] || ''
        if (compressedB64.length <= MAX_B64_SIZE) {
          console.log(
            `[compressImage] ${b64Part.length} → ${compressedB64.length} bytes (quality=${quality}, ${width}x${height})`
          )
          resolve(compressed)
          return
        }
      }

      // Last resort: shrink dimensions further
      const smallW = Math.round(width * 0.5)
      const smallH = Math.round(height * 0.5)
      canvas.width = smallW
      canvas.height = smallH
      ctx.drawImage(img, 0, 0, smallW, smallH)
      const result = canvas.toDataURL('image/jpeg', 0.7)
      console.log(`[compressImage] final fallback: ${smallW}x${smallH}`)
      resolve(result)
    }
    img.onerror = () => {
      console.warn('[compressImage] Failed to load image, returning original')
      resolve(dataURL)
    }
    img.src = dataURL
  })
}
