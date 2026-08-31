import { Minus, Plus, RotateCcw, Upload } from 'lucide-react'
import { useRef, useState, type PointerEvent } from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { useLabelPrintingStore } from '../stores/useLabelPrintingStore'
import type { LocalBackgroundImage } from '../types'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_PIXELS = 16_000_000
const ACCEPTED_TYPES = new Set<LocalBackgroundImage['mimeType']>(['image/png', 'image/jpeg', 'image/webp'])

function decodeImage(file: File): Promise<LocalBackgroundImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('图片像素过高，请选择较小的 PNG、JPEG 或 WebP 图片。'))
        return
      }
      resolve({ mimeType: file.type as LocalBackgroundImage['mimeType'], naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, objectUrl, scale: 1, offsetX: 0, offsetY: 0, maskTone: 'light', maskOpacity: 0.2 })
    }
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('图片无法读取，请更换文件后重试。')) }
    image.src = objectUrl
  })
}

export function LabelBackgroundEditor() {
  const appearance = useLabelPrintingStore((state) => state.draft.appearance)
  const updateAppearance = useLabelPrintingStore((state) => state.updateAppearance)
  const setBackgroundImage = useLabelPrintingStore((state) => state.setBackgroundImage)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const image = appearance.backgroundImage

  const updateImage = (next: Partial<LocalBackgroundImage>) => {
    if (image) updateAppearance({ backgroundImage: { ...image, ...next } })
  }

  const fitBackground = () => updateImage({ scale: 1, offsetX: 0, offsetY: 0 })
  const fillBackground = () => updateImage({ scale: Math.min(2, Math.max(1, 2.5 / (image ? image.naturalWidth / image.naturalHeight : 2.5))), offsetX: 0, offsetY: 0 })

  const handleFile = async (file?: File) => {
    if (!file) return
    setError(null)
    if (!ACCEPTED_TYPES.has(file.type as LocalBackgroundImage['mimeType'])) { setError('仅支持 PNG、JPEG 或 WebP 图片。SVG、远程图片和其他格式不会被接受。'); return }
    if (file.size > MAX_FILE_BYTES) { setError('图片不能超过 5MB，请压缩后重试。'); return }
    try { setBackgroundImage(await decodeImage(file)) } catch (reason) { setError(reason instanceof Error ? reason.message : '图片无法读取，请更换文件后重试。') }
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!image) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY, offsetX: image.offsetX, offsetY: image.offsetY }
  }
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const rect = event.currentTarget.getBoundingClientRect()
    updateImage({ offsetX: drag.offsetX + ((event.clientX - drag.x) / rect.width) * 100, offsetY: drag.offsetY + ((event.clientY - drag.y) / rect.height) * 100 })
  }
  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) event.currentTarget.releasePointerCapture(event.pointerId)
    dragRef.current = null
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-text-muted">整批标签共用一张背景图；图片只在当前浏览器会话内使用，不会上传，刷新后失效。</p>
        <Button onClick={() => inputRef.current?.click()} size="sm" type="button" variant="secondary"><Upload aria-hidden="true" className="size-4" />{image ? '替换图片' : '上传本地图片'}</Button>
        <input accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { void handleFile(event.target.files?.[0]); event.target.value = '' }} ref={inputRef} type="file" />
      </div>
      {error ? <p className="rounded-lg border border-error/25 bg-error/5 px-3 py-2 text-sm leading-6 text-error" role="alert">{error}</p> : null}
      {image ? <>
        <div aria-label="背景图片定位预览，可拖动移动" className="flex max-w-sm touch-none select-none items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-primary/50 bg-surface-raised p-5" onPointerCancel={stopDragging} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={stopDragging} role="img" style={{ backgroundImage: `linear-gradient(${image.maskTone === 'dark' ? `rgba(15,23,42,${image.maskOpacity})` : `rgba(255,255,255,${image.maskOpacity})`}, ${image.maskTone === 'dark' ? `rgba(15,23,42,${image.maskOpacity})` : `rgba(255,255,255,${image.maskOpacity})`}), url(${image.objectUrl})`, backgroundPosition: `calc(50% + ${image.offsetX}%), calc(50% + ${image.offsetY}%)`, backgroundRepeat: 'no-repeat', backgroundSize: `${image.scale * 100}% auto`, aspectRatio: '5 / 2' }}><span className="rounded-md bg-surface-raised/85 px-2 py-1 text-xs font-medium text-text">拖动定位背景</span></div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div><label className="flex items-center justify-between text-sm font-medium text-text" htmlFor="background-scale"><span>图片缩放</span><span className="font-mono text-xs text-text-muted">{Math.round(image.scale * 100)}%</span></label><input className="mt-3 w-full accent-primary" id="background-scale" max="2" min="0.5" onChange={(event) => updateImage({ scale: Number(event.target.value) })} step="0.05" type="range" value={image.scale} /></div>
          <div className="flex flex-wrap items-end gap-2"><Button aria-label="缩小背景图片" className="size-11 p-0" onClick={() => updateImage({ scale: Math.max(0.5, image.scale - 0.05) })} size="sm" type="button" variant="secondary"><Minus aria-hidden="true" className="size-4" /></Button><Button aria-label="放大背景图片" className="size-11 p-0" onClick={() => updateImage({ scale: Math.min(2, image.scale + 0.05) })} size="sm" type="button" variant="secondary"><Plus aria-hidden="true" className="size-4" /></Button><Button onClick={fitBackground} size="sm" type="button" variant="secondary">适应</Button><Button onClick={fillBackground} size="sm" type="button" variant="secondary">填充</Button><Button aria-label="重置背景图片位置" className="size-11 p-0" onClick={() => updateImage({ scale: 1, offsetX: 0, offsetY: 0 })} size="sm" type="button" variant="secondary"><RotateCcw aria-hidden="true" className="size-4" /></Button></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="flex items-center justify-between text-sm font-medium text-text" htmlFor="background-mask"><span>可读性遮罩</span><span className="font-mono text-xs text-text-muted">{Math.round(image.maskOpacity * 100)}%</span></label><input className="mt-3 w-full accent-primary" id="background-mask" max="0.6" min="0" onChange={(event) => updateImage({ maskOpacity: Number(event.target.value) })} step="0.05" type="range" value={image.maskOpacity} /></div>
          <div><label className="flex min-h-8 items-center text-sm font-medium text-text" htmlFor="background-mask-tone">遮罩色调</label><Select onValueChange={(value) => updateImage({ maskTone: value as LocalBackgroundImage['maskTone'] })} value={image.maskTone}><SelectTrigger aria-label="背景遮罩色调" id="background-mask-tone"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">浅色遮罩</SelectItem><SelectItem value="dark">深色遮罩</SelectItem></SelectContent></Select></div>
        </div>
        {image.maskOpacity === 0 ? <p className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs leading-5 text-text-muted" role="status">建议开启遮罩以保证图片背景上的文字清晰度。</p> : null}
      </> : <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-text-muted">上传图片后，可在这里调整图片位置、缩放和文字遮罩。</p>}
    </div>
  )
}
