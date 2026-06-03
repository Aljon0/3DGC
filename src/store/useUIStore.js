import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * UI Store
 * Global UI state: sidebar, modals, theme, notifications.
 * Kept separate from domain stores to avoid mixing concerns.
 */
export const useUIStore = create(
  devtools(
    (set, get) => ({
      // ── Sidebar ────────────────────────────────────────────
      sidebarOpen:     false,   // mobile hamburger state
      sidebarCollapsed: false,  // desktop collapsed state

      toggleSidebar:    () => set(s => ({ sidebarOpen:     !s.sidebarOpen })),
      setSidebarOpen:   (v) => set({ sidebarOpen: v }),
      toggleCollapse:   () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      // ── Modals ─────────────────────────────────────────────
      // Each modal has an id and optional data payload
      activeModals: [],   // stack of { id, data }

      openModal: (id, data = null) => set((state) => ({
        activeModals: [...state.activeModals, { id, data }],
      })),

      closeModal: (id) => set((state) => ({
        activeModals: state.activeModals.filter(m => m.id !== id),
      })),

      closeAllModals: () => set({ activeModals: [] }),

      isModalOpen:  (id) => get().activeModals.some(m => m.id === id),
      getModalData: (id) => get().activeModals.find(m => m.id === id)?.data ?? null,

      // ── SlideOver ──────────────────────────────────────────
      slideOverOpen: false,
      slideOverContent: null,  // component key or id

      openSlideOver:  (content) => set({ slideOverOpen: true,  slideOverContent: content }),
      closeSlideOver: ()        => set({ slideOverOpen: false, slideOverContent: null }),

      // ── Notifications / Toast queue ────────────────────────
      // (react-hot-toast handles rendering; this is for programmatic access)
      pendingNotification: null,

      notify: (message, type = 'success') => set({
        pendingNotification: { message, type, id: Date.now() }
      }),

      clearNotification: () => set({ pendingNotification: null }),

      // ── Page Title ─────────────────────────────────────────
      pageTitle: 'Dashboard',
      setPageTitle: (title) => set({ pageTitle: title }),

      // ── Global Loading Overlay ─────────────────────────────
      globalLoading: false,
      setGlobalLoading: (v) => set({ globalLoading: v }),

      // ── Customizer Panel visibility (for mobile) ───────────
      customizerPanelOpen: false,
      toggleCustomizerPanel: () => set(s => ({
        customizerPanelOpen: !s.customizerPanelOpen,
      })),
    }),
    { name: 'UIStore' }
  )
)