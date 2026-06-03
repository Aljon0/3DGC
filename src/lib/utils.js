import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ── Class Merging ──────────────────────────────────────────────────────────

/**
 * cn — merge Tailwind classes safely.
 * Combines clsx (conditional classes) + tailwind-merge (dedup conflicts).
 *
 * @example
 *   cn('px-4 py-2', isActive && 'bg-accent-500', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs))
}

// ── Currency ───────────────────────────────────────────────────────────────

/**
 * Format a number as Philippine Peso.
 * @param {number} amount
 * @param {boolean} compact  - use compact notation (e.g. ₱8.5K)
 *
 * @example
 *   formatPeso(9700)        → '₱9,700.00'
 *   formatPeso(9700, true)  → '₱9.7K'
 */
export function formatPeso(amount, compact = false) {
  if (amount == null || isNaN(amount)) return '₱0.00'
  return new Intl.NumberFormat('en-PH', {
    style:                 'currency',
    currency:              'PHP',
    notation:              compact ? 'compact' : 'standard',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
  }).format(amount)
}

// ── Date & Time ────────────────────────────────────────────────────────────

/**
 * Format an ISO date string to a readable date.
 * @param {string} iso
 * @param {string} fmt  - date-fns format string
 *
 * @example
 *   formatDate('2024-11-02T10:00:00Z')  → 'Nov 2, 2024'
 */
export function formatDate(iso, fmt = 'MMM d, yyyy') {
  if (!iso) return '—'
  try { return format(parseISO(iso), fmt) }
  catch { return '—' }
}

/**
 * Format an ISO date string to date + time.
 * @example
 *   formatDateTime('2024-11-02T10:00:00Z') → 'Nov 2, 2024 10:00 AM'
 */
export function formatDateTime(iso) {
  return formatDate(iso, 'MMM d, yyyy h:mm a')
}

/**
 * Relative time from now.
 * @example
 *   timeAgo('2024-11-01T10:00:00Z') → '3 days ago'
 */
export function timeAgo(iso) {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true })
  } catch { return '—' }
}

// ── String Utilities ───────────────────────────────────────────────────────

/**
 * Capitalize first letter of each word.
 * @example
 *   titleCase('black granite') → 'Black Granite'
 */
export function titleCase(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Truncate a string to maxLength with ellipsis.
 * @example
 *   truncate('Hello World', 8) → 'Hello Wo...'
 */
export function truncate(str, maxLength = 40) {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Generate a simple unique ID (not cryptographic).
 * Sufficient for decal IDs, temp keys, etc.
 * @example
 *   uid() → 'x7k2p9'
 */
export function uid(length = 8) {
  return Math.random().toString(36).slice(2, 2 + length)
}

/**
 * Slugify a string (for filenames, keys).
 * @example
 *   slugify('Black Granite') → 'black-granite'
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

// ── Numbers ────────────────────────────────────────────────────────────────

/**
 * Clamp a number between min and max.
 * @example
 *   clamp(150, 0, 100) → 100
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation between two values.
 * Used in 3D animations and transitions.
 * @example
 *   lerp(0, 100, 0.5) → 50
 */
export function lerp(start, end, t) {
  return start + (end - start) * t
}

/**
 * Round a number to N decimal places.
 * @example
 *   round(3.14159, 2) → 3.14
 */
export function round(value, decimals = 2) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals
}

// ── Order & Pricing ────────────────────────────────────────────────────────

/**
 * Calculate order total from base + decal add-ons.
 * Uses settings pricing config.
 *
 * @param {object} canvasState  - from useCustomizerStore canvas
 * @param {object} pricing      - from settings.pricing
 * @returns {{ basePrice, addOnsPrice, totalPrice }}
 */
export function calculateOrderPrice(canvasState, pricing) {
  const { stoneType, dimensions, decals } = canvasState
  const { width, height } = dimensions

  const stoneKey = stoneType === 'table-sign' ? 'tableSign' : stoneType
  const stonePricing = pricing[stoneKey] ?? pricing.gravestone

  // Base: flat base + per-cm charges
  const basePrice =
    stonePricing.base +
    (width  * stonePricing.perCmWidth) +
    (height * stonePricing.perCmHeight)

  // Add-ons: each decal type has a price
  const addOnsPrice = decals.reduce((sum, decal) => {
    const decalPrices = {
      text:  pricing.textDecal  ?? 150,
      image: pricing.imageDecal ?? 250,
      frame: pricing.frameDecal ?? 300,
    }
    return sum + (decalPrices[decal.type] ?? 0)
  }, 0)

  return {
    basePrice:   round(basePrice),
    addOnsPrice: round(addOnsPrice),
    totalPrice:  round(basePrice + addOnsPrice),
  }
}

// ── File Utilities ─────────────────────────────────────────────────────────

/**
 * Format file size to human-readable string.
 * @example
 *   formatFileSize(1536000) → '1.5 MB'
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

/**
 * Check if a file is an accepted image type.
 * @param {File} file
 */
export function isImageFile(file) {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)
}

// ── Status Helpers ─────────────────────────────────────────────────────────

/** Map order status to Tailwind color classes */
export const STATUS_STYLES = {
  new:        { bg: 'bg-blue-500/10',    text: 'text-blue-400',   border: 'border-blue-500/30'   },
  processing: { bg: 'bg-amber-500/10',   text: 'text-amber-400',  border: 'border-amber-500/30'  },
  finished:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400',border: 'border-emerald-500/30'},
  cancelled:  { bg: 'bg-red-500/10',     text: 'text-red-400',    border: 'border-red-500/30'    },
}

export function getStatusStyle(status) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.new
}

/** Human-readable status labels */
export const STATUS_LABELS = {
  new:        'New Order',
  processing: 'Processing',
  finished:   'Finished',
  cancelled:  'Cancelled',
}

export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? titleCase(status)
}

// ── 3D / Canvas Utilities ──────────────────────────────────────────────────

/**
 * Convert degrees to radians.
 * Used frequently in Three.js rotations.
 */
export const DEG2RAD = Math.PI / 180
export const RAD2DEG = 180 / Math.PI

export function degToRad(deg) { return deg * DEG2RAD }
export function radToDeg(rad) { return rad * RAD2DEG }

/**
 * Capture a Three.js canvas as a base64 PNG.
 * Pass the canvas DOM element from the R3F gl.domElement.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {string} base64 PNG data URL
 */
export function captureCanvasSnapshot(canvas) {
  try {
    return canvas.toDataURL('image/png', 0.92)
  } catch (err) {
    console.error('[snapshot] Failed to capture canvas:', err)
    return null
  }
}

/**
 * Download a base64 image as a PNG file.
 * @param {string} dataUrl
 * @param {string} filename
 */
export function downloadImage(dataUrl, filename = 'design.png') {
  const link = document.createElement('a')
  link.href     = dataUrl
  link.download = filename
  link.click()
}