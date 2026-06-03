import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { uid } from "@/lib/utils";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { Plus, Type } from "lucide-react";
import { useState } from "react";

// ── All 17 available fonts ─────────────────────────────────────────────────
// value = exact font-family name matching @font-face declaration in index.css
// The 3D canvas uses these same names via canvas.getContext('2d') ctx.font
const FONTS = [
  { value: "CateneoBT",          label: "CateneoBT",           sample: "In Loving Memory" },
  { value: "CommercialScript",   label: "Commercial Script",   sample: "In Loving Memory" },
  { value: "EdwardianScriptITC", label: "Edwardian Script",    sample: "In Loving Memory" },
  { value: "FuturaMdBT",         label: "Futura (Bold)",       sample: "IN LOVING MEMORY" },
  { value: "GreatVibes",         label: "Great Vibes",         sample: "In Loving Memory" },
  { value: "LavanderiaDelicate", label: "Lavanderia Delicate", sample: "In Loving Memory" },
  { value: "LavanderiaRegular",  label: "Lavanderia Regular",  sample: "In Loving Memory" },
  { value: "LavanderiaSturdy",   label: "Lavanderia Sturdy",   sample: "In Loving Memory" },
  { value: "MissionScript",      label: "Mission Script",      sample: "In Loving Memory" },
  { value: "ScriptMTBold",       label: "Script MT Bold",      sample: "In Loving Memory" },
  { value: "TimesBoldItalic",    label: "Times Bold Italic",   sample: "In Loving Memory" },
  { value: "TimesNewRomanItalic",label: "Times New Roman Italic", sample: "In Loving Memory" },
  { value: "TimesNewRomanCyrBold",label: "Times NR Cyr Bold",  sample: "IN LOVING MEMORY" },
  { value: "TimesNewRomanCyr",   label: "Times NR Cyr",        sample: "In Loving Memory" },
  { value: "TirantiSolidLET",    label: "Tiranti Solid LET",   sample: "In Loving Memory" },
  { value: "Walnuts",            label: "Walnuts",             sample: "In Loving Memory" },
  { value: "ZapfinoForteLTPro",  label: "Zapfino Forte",       sample: "In Loving Memory" },
]

const PRESET_COLORS = [
  "#ffffff", "#f5f0e8", "#d4af37",
  "#c0c0c0", "#000000", "#1a1a1a",
  "#8b4513", "#2c3e50",
]

export default function TextDecalEditor({ onClose }) {
  const { addDecal, setActiveTool } = useCustomizerStore()

  const [text,     setText]     = useState("")
  const [font,     setFont]     = useState("TimesNewRomanCyr")
  const [color,    setColor]    = useState("#ffffff")
  const [fontSize, setFontSize] = useState(48)

  const handleAdd = () => {
    if (!text.trim()) return
    addDecal({
      id:       uid(),
      type:     "text",
      text:     text.trim(),
      font,
      color,
      fontSize,
      position: [0, 0, 0.08],
      rotation: [0, 0, 0],
      scale:    [0.5, 0.2, 0.5],
      flipped:  { x: false, y: false },
    })
    setActiveTool("select")
    onClose?.()
  }

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Type className="size-4 text-accent-400" />
        <h3 className="text-sm font-semibold font-sans text-brand-100">
          Add Text
        </h3>
      </div>

      {/* Text input */}
      <Input
        label="Text Content"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="e.g. In Loving Memory"
        maxLength={120}
        hint={`${text.length}/120 characters`}
        onKeyDown={e => e.key === "Enter" && handleAdd()}
      />

      {/* Font selector — visual list with live preview */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-brand-200 font-sans">
          Font Family
        </label>

        {/* Scrollable font list */}
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto
                        rounded-xl border border-brand-700 bg-brand-800/50 p-1">
          {FONTS.map(f => (
            <button
              key={f.value}
              onClick={() => setFont(f.value)}
              className={`flex items-center justify-between gap-3 px-3 py-2
                          rounded-lg text-left transition-all duration-100
                          ${font === f.value
                            ? 'bg-accent-500/15 border border-accent-500/30'
                            : 'hover:bg-brand-700 border border-transparent'
                          }`}
            >
              {/* Font name */}
              <span className={`text-xs font-sans shrink-0
                               ${font === f.value
                                 ? 'text-accent-400 font-semibold'
                                 : 'text-brand-400'}`}>
                {f.label}
              </span>

              {/* Live font preview rendered in that font */}
              <span
                style={{ fontFamily: f.value, fontSize: '13px' }}
                className="text-brand-200 truncate text-right"
              >
                {f.sample}
              </span>
            </button>
          ))}
        </div>

        {/* Selected font indicator */}
        <p className="text-xs text-brand-500 font-sans">
          Selected:{' '}
          <span
            style={{ fontFamily: font }}
            className="text-accent-400"
          >
            {FONTS.find(f => f.value === font)?.label}
          </span>
        </p>
      </div>

      {/* Font size */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-brand-200 font-sans">
          Size:{' '}
          <span className="text-accent-400 font-mono">{fontSize}pt</span>
        </label>
        <input
          type="range"
          min={12}
          max={120}
          value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          className="w-full accent-accent-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-brand-500 font-mono">
          <span>12</span>
          <span>120</span>
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-brand-200 font-sans">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`size-7 rounded-full border-2 transition-all duration-150
                ${color === c
                  ? 'border-accent-400 scale-110 shadow-glow'
                  : 'border-brand-700 hover:border-brand-400'
                }`}
              style={{ background: c }}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="size-8 rounded-lg cursor-pointer bg-transparent border border-brand-600"
          />
          <span className="text-sm font-mono text-brand-400">{color}</span>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded-xl bg-brand-800 border border-brand-700
                      flex items-center justify-center p-4 min-h-16">
        <p
          style={{
            fontFamily:  font,
            fontSize:    `${Math.min(fontSize * 0.4, 32)}px`,
            color,
            textAlign:   'center',
            lineHeight:  1.3,
          }}
          className="wrap-break-words max-w-full"
        >
          {text || (
            <span className="text-brand-600 font-sans text-sm">
              Preview
            </span>
          )}
        </p>
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
          disabled={!text.trim()}
          iconLeft={<Plus className="size-4" />}
          onClick={handleAdd}
        >
          Add to Stone
        </Button>
      </div>
    </div>
  )
}