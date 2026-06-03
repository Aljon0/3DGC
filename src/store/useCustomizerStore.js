import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const DEFAULT_CANVAS_STATE = {
  stoneType:        'gravestone',
  texture:          null,                    // null = no texture selected
  dimensions:       { width: 120, height: 50 },
  decals:           [],
  rotation:         { x: 0, y: 0, z: 0 },
  isRotationLocked: false,
}

const MAX_HISTORY = 50

export const useCustomizerStore = create(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        canvas:          { ...DEFAULT_CANVAS_STATE },
        history:         [],
        future:          [],
        selectedDecalId: null,
        activeTool:      'select',
        isLoading:       false,
        snapshot:        null,

        canUndo:       () => get().history.length > 0,
        canRedo:       () => get().future.length  > 0,
        selectedDecal: () => {
          const { canvas, selectedDecalId } = get()
          return canvas.decals.find(d => d.id === selectedDecalId) ?? null
        },

        _pushHistory: () => {
          set((state) => {
            const snapshot = JSON.parse(JSON.stringify(state.canvas))
            state.history.push(snapshot)
            if (state.history.length > MAX_HISTORY) state.history.shift()
            state.future = []
          })
        },

        // ── Canvas Actions ─────────────────────────────────────

        setStoneType: (stoneType) => {
          get()._pushHistory()
          set((state) => {
            state.canvas.stoneType = stoneType
            state.canvas.decals    = []
            state.canvas.texture   = null    // ← clear texture when stone changes
            state.selectedDecalId  = null
          })
        },

        setTexture: (texture) => {
          get()._pushHistory()
          set((state) => { state.canvas.texture = texture })
        },

        setDimensions: (dimensions) => {
          get()._pushHistory()
          set((state) => { state.canvas.dimensions = dimensions })
        },

        toggleRotationLock: () => {
          set((state) => {
            state.canvas.isRotationLocked = !state.canvas.isRotationLocked
          })
        },

        setRotation: (rotation) => {
          set((state) => { state.canvas.rotation = rotation })
        },

        // ── Decal Actions ──────────────────────────────────────

        addDecal: (decal) => {
          get()._pushHistory()
          set((state) => {
            state.canvas.decals.push({
              position: [0, 0, 0.01],
              rotation: [0, 0, 0],
              scale:    [0.2, 0.2, 1],
              flipped:  { x: false, y: false },
              locked:   false,
              ...decal,
            })
            state.selectedDecalId = decal.id
          })
        },

        updateDecal: (id, fields) => {
          set((state) => {
            const idx = state.canvas.decals.findIndex(d => d.id === id)
            if (idx !== -1) Object.assign(state.canvas.decals[idx], fields)
          })
        },

        removeDecal: (id) => {
          get()._pushHistory()
          set((state) => {
            state.canvas.decals   = state.canvas.decals.filter(d => d.id !== id)
            state.selectedDecalId = null
          })
        },

        flipDecal: (id, axis) => {
          get()._pushHistory()
          set((state) => {
            const decal = state.canvas.decals.find(d => d.id === id)
            if (decal) decal.flipped[axis] = !decal.flipped[axis]
          })
        },

        toggleDecalLock: (id) => {
          set((state) => {
            const decal = state.canvas.decals.find(d => d.id === id)
            if (decal) decal.locked = !decal.locked
          })
        },

        selectDecal: (id) => set((state) => { state.selectedDecalId = id }),
        clearSelection: () => set((state) => { state.selectedDecalId = null }),

        // ── Undo / Redo ────────────────────────────────────────

        undo: () => {
          if (get().history.length === 0) return
          set((state) => {
            const prev = state.history.pop()
            state.future.push(JSON.parse(JSON.stringify(state.canvas)))
            state.canvas          = prev
            state.selectedDecalId = null
          })
        },

        redo: () => {
          if (get().future.length === 0) return
          set((state) => {
            const next = state.future.pop()
            state.history.push(JSON.parse(JSON.stringify(state.canvas)))
            state.canvas          = next
            state.selectedDecalId = null
          })
        },

        setActiveTool: (tool) => set((state) => { state.activeTool = tool }),
        setSnapshot:   (base64) => set((state) => { state.snapshot = base64 }),

        resetCanvas: () => set((state) => {
          state.canvas          = { ...DEFAULT_CANVAS_STATE }
          state.history         = []
          state.future          = []
          state.selectedDecalId = null
          state.activeTool      = 'select'
          state.snapshot        = null
        }),
      }))
    ),
    { name: 'CustomizerStore' }
  )
)