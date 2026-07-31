import { FFmpeg } from '@ffmpeg/ffmpeg'
import { COMPRESS_THRESHOLD } from './videoValidation'

// ffmpeg.wasm assets are served locally from /public/ffmpeg (same origin):
//   ffmpeg-core.js / ffmpeg-core.wasm  - ESM core from @ffmpeg/core (single-thread,
//     no SharedArrayBuffer, no COOP/COEP headers needed, Razorpay unaffected)
//   worker.js / const.js / errors.js   - class worker from @ffmpeg/ffmpeg plus its
//     relative imports, copied verbatim so the module worker resolves them locally
// No CDN URLs anywhere - loading from a different origin is what broke worker
// construction ("Failed to construct 'Worker'").
const FFMPEG_BASE = '/ffmpeg'

export function shouldCompressVideo(size) {
  return size > COMPRESS_THRESHOLD
}

export async function compressVideo(file, onProgress) {
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
    coreURL: `${FFMPEG_BASE}/ffmpeg-core.js`,
    wasmURL: `${FFMPEG_BASE}/ffmpeg-core.wasm`,
    classWorkerURL: `${FFMPEG_BASE}/worker.js`,
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
