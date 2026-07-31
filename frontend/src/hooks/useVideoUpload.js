import { useCallback, useRef, useState } from 'react'
import { api } from '../lib/api'
import { validateVideoFile } from '../lib/videoValidation'
import { uploadVideoToCloudinary } from '../lib/cloudinaryVideo'
import { shouldCompressVideo, compressVideo } from '../lib/compressVideo'

export const VIDEO_UPLOAD_STATUS = {
  IDLE: 'idle',
  COMPRESSING: 'compressing',
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
}

export default function useVideoUpload() {
  const [status, setStatus] = useState(VIDEO_UPLOAD_STATUS.IDLE)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(null)
  const [eta, setEta] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const busyRef = useRef(false)
  const cancelledRef = useRef(false)
  const fileRef = useRef(null)
  const abortRef = useRef(null)

  const cancel = useCallback(() => {
    cancelledRef.current = true
    busyRef.current = false
    if (abortRef.current) abortRef.current.abort()
    setStatus(VIDEO_UPLOAD_STATUS.IDLE)
    setProgress(0)
    setSpeed(null)
    setEta(null)
  }, [])

  const upload = useCallback(async (file) => {
    if (busyRef.current) return null
    const validation = validateVideoFile(file)
    if (!validation.ok) {
      setError(validation.error)
      setStatus(VIDEO_UPLOAD_STATUS.ERROR)
      return null
    }
    busyRef.current = true
    cancelledRef.current = false
    fileRef.current = file
    setError('')
    setResult(null)
    setProgress(0)
    setSpeed(null)
    setEta(null)

    try {
      let target = file
      if (shouldCompressVideo(file.size)) {
        setStatus(VIDEO_UPLOAD_STATUS.COMPRESSING)
        setProgress(0)
        target = await compressVideo(file, setProgress)
        if (cancelledRef.current) return null
      }

      const signature = await api.getStoryUploadSignature()
      if (cancelledRef.current) return null

      setStatus(VIDEO_UPLOAD_STATUS.UPLOADING)
      setProgress(0)
      const controller = new AbortController()
      abortRef.current = controller
      const startedAt = Date.now()

      const cloudinaryResult = await uploadVideoToCloudinary(target, {
        signature,
        signal: controller.signal,
        onProgress: (loaded, total) => {
          setProgress(Math.round((loaded / total) * 100))
          const seconds = (Date.now() - startedAt) / 1000
          if (seconds > 0.5) {
            const bytesPerSec = loaded / seconds
            setSpeed(bytesPerSec)
            setEta(bytesPerSec > 0 ? (total - loaded) / bytesPerSec : null)
          }
        },
      })
      if (cancelledRef.current) return null
      setResult(cloudinaryResult)
      setStatus(VIDEO_UPLOAD_STATUS.DONE)
      return cloudinaryResult
    } catch (err) {
      if (cancelledRef.current || err?.name === 'AbortError') return null
      setError(err.message || 'Upload failed')
      setStatus(VIDEO_UPLOAD_STATUS.ERROR)
      return null
    } finally {
      busyRef.current = false
      abortRef.current = null
    }
  }, [])

  const retry = useCallback(async () => {
    if (fileRef.current) return upload(fileRef.current)
    return null
  }, [upload])

  const reset = useCallback(() => {
    cancel()
    setResult(null)
    setError('')
    fileRef.current = null
  }, [cancel])

  return {
    status,
    progress,
    speed,
    eta,
    error,
    result,
    busy: status === VIDEO_UPLOAD_STATUS.COMPRESSING || status === VIDEO_UPLOAD_STATUS.UPLOADING,
    upload,
    cancel,
    retry,
    reset,
  }
}
