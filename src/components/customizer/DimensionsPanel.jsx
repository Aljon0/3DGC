import { useState, useEffect, useRef } from 'react'
import { Ruler, Lock } from 'lucide-react'
import { clamp } from '@/lib/utils'
import { useCustomizerStore } from '@/store/useCustomizerStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

// ── Dimension limits per stone type (in cm) ────────────────────────────────
const LIMITS = {
  gravestone:   { w: { min: 30, max: 120 }, h: { min: 50, max: 180 } },
  'table-sign': { w: { min: 20, max: 200 }, h: { min: 8,  max: 40  } },
  base:         { w: { min: 40, max: 160 }, h: { min: 10, max: 40  } },
}

// ── Fixed urn specs (not user-adjustable) ──────────────────────────────────
const URN_FIXED = {
  width:  35,   // cm (approximate real-world size)
  height: 42,
}

export default function DimensionsPanel() {
  const {
    canvas: { dimensions, stoneType },
    setDimensions,
  } = useCustomizerStore()

  const [localW, setLocalW] = useState(String(dimensions.width))
  const [localH, setLocalH] = useState(String(dimensions.height))

  const prevStoneTypeRef = useRef(stoneType)
  useEffect(() => {
    if (prevStoneTypeRef.current !== stoneType) {
      prevStoneTypeRef.current = stoneType
      setLocalW(String(dimensions.width))
      setLocalH(String(dimensions.height))
    }
  }, [stoneType, dimensions.width, dimensions.height])

  // ── Urn: show fixed/locked panel ──────────────────────────────────────
  if (stoneType === 'urn') {
    return (
      <div className="flex flex-col gap-4 p-4">

        {/* Header */}
        <div className="flex items-center gap-2">
          <Ruler className="size-4 text-accent-400" />
          <h3 className="text-sm font-semibold font-sans text-brand-100">
            Dimensions
          </h3>
          <span className="text-xs text-brand-500 font-sans ml-auto">cm</span>
        </div>

        {/* Fixed notice */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                        bg-accent-500/8 border border-accent-500/20">
          <Lock className="size-3.5 text-accent-400 shrink-0" />
          <p className="text-xs text-accent-300 font-sans leading-relaxed">
            Urn dimensions are fixed and cannot be customized.
          </p>
        </div>

        {/* Fixed values display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-400 font-sans">
              Width
            </label>
            <div className="h-9 px-3 flex items-center rounded-lg
                            bg-brand-800/50 border border-brand-700
                            text-sm font-mono text-brand-500 cursor-not-allowed">
              {URN_FIXED.width} cm
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-400 font-sans">
              Height
            </label>
            <div className="h-9 px-3 flex items-center rounded-lg
                            bg-brand-800/50 border border-brand-700
                            text-sm font-mono text-brand-500 cursor-not-allowed">
              {URN_FIXED.height} cm
            </div>
          </div>
        </div>

        {/* Visual guide */}
        <div className="flex items-center justify-center">
          <div className="border-2 border-dashed border-accent-500/20 rounded-full
                          bg-accent-500/5 flex items-center justify-center
                          text-xs font-mono text-accent-400/60 w-20 h-24">
            {URN_FIXED.width}×{URN_FIXED.height}
          </div>
        </div>
      </div>
    )
  }

  // ── All other stones: editable dimensions ─────────────────────────────
  const limits = LIMITS[stoneType] ?? LIMITS.gravestone

  const handleApply = () => {
    const w = clamp(Number(localW) || dimensions.width, limits.w.min, limits.w.max)
    const h = clamp(Number(localH) || dimensions.height, limits.h.min, limits.h.max)
    setDimensions({ width: w, height: h })
    setLocalW(String(w))
    setLocalH(String(h))
  }

  const isDirty =
    Number(localW) !== dimensions.width ||
    Number(localH) !== dimensions.height

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Ruler className="size-4 text-accent-400" />
        <h3 className="text-sm font-semibold font-sans text-brand-100">
          Dimensions
        </h3>
        <span className="text-xs text-brand-500 font-sans ml-auto">cm</span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Width"
          type="number"
          value={localW}
          onChange={e => setLocalW(e.target.value)}
          min={limits.w.min}
          max={limits.w.max}
          hint={`${limits.w.min}–${limits.w.max} cm`}
          size="sm"
        />
        <Input
          label="Height"
          type="number"
          value={localH}
          onChange={e => setLocalH(e.target.value)}
          min={limits.h.min}
          max={limits.h.max}
          hint={`${limits.h.min}–${limits.h.max} cm`}
          size="sm"
        />
      </div>

      {/* Visual guide */}
      <div className="flex items-center justify-center">
        <div
          className="border-2 border-dashed border-accent-500/40 rounded-lg
                     bg-accent-500/5 flex items-center justify-center
                     text-xs font-mono text-accent-400 transition-all duration-300"
          style={{
            width:  `${Math.min(100, (Number(localW) / limits.w.max) * 100)}%`,
            height: `${Math.max(40, Math.min(80, (Number(localH) / limits.h.max) * 80))}px`,
          }}
        >
          {localW} × {localH}
        </div>
      </div>

      {/* Apply */}
      <Button
        variant="solid"
        size="sm"
        fullWidth
        disabled={!isDirty}
        onClick={handleApply}
      >
        Apply Dimensions
      </Button>
    </div>
  )
}