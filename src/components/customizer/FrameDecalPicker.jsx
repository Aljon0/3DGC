import { useState, useRef } from 'react'
import { Frame, Plus, Upload } from 'lucide-react'
import { uid } from '@/lib/utils'
import { useCustomizerStore } from '@/store/useCustomizerStore'
import Button from '@/components/ui/Button'
import * as THREE from 'three'

// ── Frame shape options ────────────────────────────────────────────────────
const FRAME_SHAPES = [
  {
    id:    'circle',
    label: 'Circle',
    desc:  'Round portrait frame',
  },
  {
    id:    'oval',
    label: 'Oval',
    desc:  'Vertical oval frame',
  },
  {
    id:    'square',
    label: 'Square',
    desc:  'Square portrait frame',
  },
  {
    id:    'rectangle',
    label: 'Rectangle',
    desc:  'Horizontal landscape frame',
  },
]

// ── Frame preset colors ────────────────────────────────────────────────────
const FRAME_COLORS = [
  { color: '#c4a84a', label: 'Gold' },
  { color: '#d4d4d4', label: 'Silver' },
  { color: '#8b6914', label: 'Bronze' },
  { color: '#1a1a1a', label: 'Black' },
  { color: '#ffffff', label: 'White' },
  { color: '#b87333', label: 'Copper' },
]

/**
 * Draws a frame + optional photo onto a canvas and returns a CanvasTexture.
 * Each shape uses explicit canvas drawing — no roundRect to avoid browser issues.
 */
function buildFrameTexture(shape, photoUrl, frameColor = '#c4a84a') {
  // Canvas is always square (512x512) but shapes have different aspect ratios
  const SIZE   = 512
  const canvas = document.createElement('canvas')
  canvas.width  = SIZE
  canvas.height = SIZE
  const ctx    = canvas.getContext('2d')

  ctx.clearRect(0, 0, SIZE, SIZE)

  const cx     = SIZE / 2
  const cy     = SIZE / 2
  const BW     = 28   // border width in px

  // ── Define clipping region per shape ──────────────────────────────────
  const drawShapePath = (inset = 0) => {
    ctx.beginPath()
    if (shape === 'circle') {
      const r = SIZE / 2 - BW - inset
      ctx.arc(cx, cy, r, 0, Math.PI * 2)

    } else if (shape === 'oval') {
      // Vertical oval — taller than wide
      const rx = SIZE * 0.30 - inset
      const ry = SIZE * 0.44 - inset
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)

    } else if (shape === 'square') {
      // Perfect square, drawn manually (no roundRect)
      const half = SIZE * 0.38 - inset
      ctx.moveTo(cx - half, cy - half)
      ctx.lineTo(cx + half, cy - half)
      ctx.lineTo(cx + half, cy + half)
      ctx.lineTo(cx - half, cy + half)
      ctx.closePath()

    } else if (shape === 'rectangle') {
      // Horizontal rectangle — wider than tall
      const hw = SIZE * 0.44 - inset   // half-width (wider)
      const hh = SIZE * 0.30 - inset   // half-height (shorter)
      ctx.moveTo(cx - hw, cy - hh)
      ctx.lineTo(cx + hw, cy - hh)
      ctx.lineTo(cx + hw, cy + hh)
      ctx.lineTo(cx - hw, cy + hh)
      ctx.closePath()
    }
  }

  // ── 1. Clip and fill photo ─────────────────────────────────────────────
  ctx.save()
  drawShapePath(0)
  ctx.clip()

  if (photoUrl) {
    const img    = new Image()
    img.src      = photoUrl
    // Object URLs are synchronously available
    ctx.drawImage(img, 0, 0, SIZE, SIZE)
  } else {
    // Placeholder
    ctx.fillStyle = '#2e3038'
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle    = '#5c6170'
    ctx.font         = '64px sans-serif'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('📷', cx, cy)
  }

  ctx.restore()

  // ── 2. Draw frame border ───────────────────────────────────────────────
  // Outer stroke
  ctx.strokeStyle = frameColor
  ctx.lineWidth   = BW
  drawShapePath(BW / 2)
  ctx.stroke()

  // Inner decorative line (subtle white highlight)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth   = 2
  drawShapePath(BW + 2)
  ctx.stroke()

  // Outer edge line
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth   = 2
  drawShapePath(2)
  ctx.stroke()

  const tex      = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * FrameDecalPicker
 * Panel to choose frame shape, upload a photo, pick color, and add to stone.
 */
export default function FrameDecalPicker({ onClose }) {
  const { addDecal, setActiveTool } = useCustomizerStore()

  const [selectedShape, setSelectedShape] = useState('circle')
  const [photoUrl,      setPhotoUrl]      = useState(null)
  const [photoFile,     setPhotoFile]     = useState(null)
  const [frameColor,    setFrameColor]    = useState('#c4a84a')
  const [isDragging,    setIsDragging]    = useState(false)
  const fileInputRef = useRef(null)

  // ── File handling ──────────────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPhotoFile(file)
    setPhotoUrl(url)
  }

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = ()  => setIsDragging(false)
  const handleDrop      = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  // ── Add to stone ───────────────────────────────────────────────────────
  const handleAdd = () => {
    const tex     = buildFrameTexture(selectedShape, photoUrl, frameColor)
    const dataUrl = tex.image.toDataURL('image/png')

    // Aspect ratio for decal scale
    // Rectangle is wider, oval/others are squarish
    const scaleX = selectedShape === 'rectangle' ? 0.55 : 0.35
    const scaleY = selectedShape === 'rectangle' ? 0.35 : 0.35

    addDecal({
      id:        uid(),
      type:      'frame',
      frameType: selectedShape,
      url:       dataUrl,
      imageUrl:  photoUrl,
      frameColor,
      position:  [0, 0, 0.08],
      rotation:  [0, 0, 0],
      scale:     [scaleX, scaleY, scaleX],
      flipped:   { x: false, y: false },
    })

    setActiveTool('select')
    onClose?.()
  }

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Frame className="size-4 text-accent-400" />
        <h3 className="text-sm font-semibold font-sans text-brand-100">
          Add Picture Frame
        </h3>
      </div>

      {/* Shape selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-brand-200 font-sans">
          Frame Shape
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FRAME_SHAPES.map(shape => (
            <button
              key={shape.id}
              onClick={() => setSelectedShape(shape.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border
                          transition-all duration-150 text-left
                          ${selectedShape === shape.id
                            ? 'border-accent-500/60 bg-accent-500/10'
                            : 'border-brand-700 bg-brand-800/50 hover:border-brand-500'
                          }`}
            >
              {/* Shape icon — pure CSS so it's reliable */}
              <ShapeIcon
                shape={shape.id}
                color={selectedShape === shape.id ? frameColor : '#5c6170'}
                size={28}
              />
              <div className="min-w-0">
                <p className={`text-xs font-semibold font-sans leading-tight
                              ${selectedShape === shape.id
                                ? 'text-accent-400' : 'text-brand-200'}`}>
                  {shape.label}
                </p>
                <p className="text-xs text-brand-500 font-sans leading-tight mt-0.5">
                  {shape.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Frame color */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-brand-200 font-sans">
          Frame Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {FRAME_COLORS.map(({ color, label }) => (
            <button
              key={color}
              onClick={() => setFrameColor(color)}
              title={label}
              className={`size-7 rounded-full border-2 transition-all duration-150
                ${frameColor === color
                  ? 'border-accent-400 scale-110 shadow-glow'
                  : 'border-brand-600 hover:border-brand-400'
                }`}
              style={{ background: color }}
            />
          ))}
          {/* Custom color */}
          <input
            type="color"
            value={frameColor}
            onChange={e => setFrameColor(e.target.value)}
            className="size-7 rounded-full cursor-pointer bg-transparent
                       border-2 border-brand-600 hover:border-brand-400"
            title="Custom color"
          />
          <span className="text-xs font-mono text-brand-500 ml-1">
            {frameColor}
          </span>
        </div>
      </div>

      {/* Photo upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-brand-200 font-sans">
          Upload Photo{' '}
          <span className="text-brand-500 font-normal">(optional)</span>
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2
                      border-2 border-dashed rounded-xl p-4 cursor-pointer
                      transition-all duration-200 text-center min-h-20
                      ${isDragging
                        ? 'border-accent-500 bg-accent-500/5'
                        : 'border-brand-700 hover:border-brand-500 bg-brand-800/50'
                      }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />

          {photoUrl ? (
            <div className="flex items-center gap-3 w-full">
              <img
                src={photoUrl}
                alt="Selected"
                className="size-12 rounded-lg object-cover border border-brand-600 shrink-0"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-brand-200 font-sans truncate">
                  {photoFile?.name ?? 'Photo selected'}
                </p>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setPhotoUrl(null)
                    setPhotoFile(null)
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-sans mt-0.5"
                >
                  Remove photo
                </button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="size-5 text-brand-500" />
              <p className="text-xs text-brand-400 font-sans">
                <span className="text-accent-400 font-medium">Click to upload</span>
                {' '}or drag & drop
              </p>
              <p className="text-xs text-brand-600 font-sans">
                JPG, PNG, WebP
              </p>
            </>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-brand-200 font-sans">
          Preview
        </label>
        <div className="flex items-center justify-center p-4
                        bg-brand-800 rounded-xl border border-brand-700 min-h-30">
          <FramePreview
            shape={selectedShape}
            photoUrl={photoUrl}
            frameColor={frameColor}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="solid"
          size="sm"
          fullWidth
          iconLeft={<Plus className="size-4" />}
          onClick={handleAdd}
        >
          Add to Stone
        </Button>
      </div>
    </div>
  )
}

// ── ShapeIcon — pure CSS/SVG shape icons ───────────────────────────────────
function ShapeIcon({ shape, color, size = 28 }) {
  const s = size

  if (shape === 'circle') return (
    <div style={{
      width:        s, height:       s,
      borderRadius: '50%',
      border:       `3px solid ${color}`,
      flexShrink:   0,
    }} />
  )

  if (shape === 'oval') return (
    <div style={{
      width:        s * 0.65, height: s,
      borderRadius: '50%',
      border:       `3px solid ${color}`,
      flexShrink:   0,
    }} />
  )

  if (shape === 'square') return (
    <div style={{
      width:        s, height:      s,
      borderRadius: '3px',
      border:       `3px solid ${color}`,
      flexShrink:   0,
    }} />
  )

  if (shape === 'rectangle') return (
    // Horizontal rectangle
    <div style={{
      width:        s * 1.4, height: s * 0.75,
      borderRadius: '3px',
      border:       `3px solid ${color}`,
      flexShrink:   0,
    }} />
  )

  return null
}

// ── FramePreview — CSS live preview ───────────────────────────────────────
function FramePreview({ shape, photoUrl, frameColor }) {
  const BW = 5  // border width in preview units

  const getStyle = () => {
    const base = {
      border:    `${BW}px solid ${frameColor}`,
      overflow:  'hidden',
      position:  'relative',
      boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.5)`,
    }

    if (shape === 'circle') return {
      ...base,
      width:        80, height:       80,
      borderRadius: '50%',
    }
    if (shape === 'oval') return {
      ...base,
      width:        56, height:       80,
      borderRadius: '50%',
    }
    if (shape === 'square') return {
      ...base,
      width:        80, height:       80,
      borderRadius: '4px',
    }
    // rectangle — horizontal
    return {
      ...base,
      width:        108, height:      72,
      borderRadius: '4px',
    }
  }

  return (
    <div style={getStyle()}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt="Frame preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width:           '100%', height:          '100%',
          background:      '#2e3038',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontSize:        '22px',
        }}>
          📷
        </div>
      )}
    </div>
  )
}