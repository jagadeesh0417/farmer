import { COMPRESS_THRESHOLD } from './videoValidation'

const CDN_BASE = 'https://cdn.jsdelivr.net/npm'

export function shouldCompressVideo(size) {
  return size > COMPRESS_THRESHOLD
}

// ffmpeg.wasm single-thread core loaded lazily from CDN — no SharedArrayBuffer,
// so no COOP/COEP headers are needed and third-party scripts are unaffected.
export async function compressVideo(file, onProgress) {
  const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
    import(/* @vite-ignore */ `${CDN_BASE}/@ffmpeg/ffmpeg@0.12.15/+esm`),
    import(/* @vite-ignore */ `${CDN_BASE}/@ffmpeg/util@0.12.1/+esm`),
  ])

  const ffmpeg = new FFmpeg()
  let totalSeconds = 0
  ffmpeg.on('log', ({ message }) => {
    if (!message) return
    const d = message.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/)
    if (d) totalSeconds = Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3])
    const t = message.match(/time=(\d+):(\d+):(\d+\.\d+)/)
    if (t && totalSeconds > 0) {
      const elapsed = Number(t[1]) * 3600 + Number(t[2]) * 60 + Number(t[3])
      onProgress?.(Math.min(99, Math.round((elapsed / totalSeconds) * 100)))
    }
  })

  await ffmpeg.load({
    coreURL: await toBlobURL(`${CDN_BASE}/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${CDN_BASE}/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`, 'application/wasm'),
  })

  const input = new Uint8Array(await file.arrayBuffer())
  await ffmpeg.writeFile('input', input)
  await ffmpeg.exec([
    '-i', 'input',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '28',
    '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', 'output.mp4',
  ])
  const data = await ffmpeg.readFile('output.mp4')
  await ffmpeg.deleteFile('input').catch(() => {})

  const name = file.name.replace(/\.[^.]+$/, '') + '-compressed.mp4'
  return new File([data.buffer], name, { type: 'video/mp4' })
}
