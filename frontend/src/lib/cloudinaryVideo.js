export function uploadVideoToCloudinary(file, { signature, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', signature.apiKey)
    form.append('timestamp', signature.timestamp)
    form.append('signature', signature.signature)
    form.append('folder', signature.folder)
    form.append('resource_type', signature.resourceType || 'video')

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/${signature.resourceType || 'video'}/upload`)
    console.info('[cloudinary-upload] payload', {
      file: file.name,
      sizeBytes: file.size,
      cloudName: signature.cloudName,
      folder: signature.folder,
      resourceType: signature.resourceType || 'video',
      timestamp: signature.timestamp,
      apiKey: signature.apiKey,
      signature: signature.signature,
    })
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded, e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)) }
        catch { reject(new Error('Cloudinary returned an invalid response')) }
      } else {
        let message = `Upload failed (${xhr.status})`
        try {
          const data = JSON.parse(xhr.responseText)
          console.error('[cloudinary-upload] error response', data)
          if (data?.error?.message) message = data.error.message
        } catch { /* keep default */ }
        reject(new Error(message))
      }
    }
    xhr.onerror = () => reject(new Error('Network error — check your connection and try again'))
    xhr.onabort = () => {
      const err = new Error('Upload cancelled')
      err.name = 'AbortError'
      reject(err)
    }
    if (signal) {
      if (signal.aborted) { xhr.abort(); return }
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }
    xhr.send(form)
  })
}
