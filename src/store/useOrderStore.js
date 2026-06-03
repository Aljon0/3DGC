import { create }   from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer }    from 'zustand/middleware/immer'

export const KANBAN_COLUMNS = [
  { id: 'new',                  label: 'New Orders',         color: 'status-new'        },
  { id: 'awaiting_payment',     label: 'Awaiting Payment',   color: 'status-processing' },
  { id: 'awaiting_2nd_payment', label: '2nd Payment',        color: 'status-processing' },
  { id: 'processing',           label: 'Processing',         color: 'status-processing' },
  { id: 'finished',             label: 'Finished',           color: 'status-finished'   },
  { id: 'cancelled',            label: 'Cancelled',          color: 'status-cancelled'  },
]

export const useOrderStore = create(
  devtools(
    immer((set, get) => ({
      orders:        [],
      activeOrderId: null,
      isLoading:     false,
      error:         null,
      filters: {
        status:   'all',
        search:   '',
        dateFrom: null,
        dateTo:   null,
      },

      activeOrder: () => {
        const { orders, activeOrderId } = get()
        return orders.find(o => o.id === activeOrderId) ?? null
      },

      ordersByStatus: () => {
        const { orders } = get()
        return KANBAN_COLUMNS.reduce((acc, col) => {
          acc[col.id] = orders.filter(o => o.status === col.id)
          return acc
        }, {})
      },

      filteredOrders: () => {
        const { orders, filters } = get()
        return orders
          .filter(o => filters.status === 'all' || o.status === filters.status)
          .filter(o => {
            if (!filters.search) return true
            const q = filters.search.toLowerCase()
            return (
              (o.order_number  ?? '').toLowerCase().includes(q) ||
              (o.customer_name ?? '').toLowerCase().includes(q)
            )
          })
      },

      setOrders:    (orders) => set(state => { state.orders = orders }),
      addOrder:     (order)  => set(state => { state.orders.unshift(order) }),

      updateOrder: (id, fields) => set(state => {
        const idx = state.orders.findIndex(o => o.id === id)
        if (idx !== -1) Object.assign(state.orders[idx], fields)
      }),

      updateOrderStatus: (id, status, reason = null) => set(state => {
        const order = state.orders.find(o => o.id === id)
        if (order) {
          order.status     = status
          order.updated_at = new Date().toISOString()
          if (reason) order.rejection_reason = reason
        }
      }),

      setActiveOrder:   (id) => set(state => { state.activeOrderId = id }),
      clearActiveOrder: ()   => set(state => { state.activeOrderId = null }),

      setFilter: (key, value) => set(state => { state.filters[key] = value }),
      resetFilters: () => set(state => {
        state.filters = { status: 'all', search: '', dateFrom: null, dateTo: null }
      }),

      setLoading: (v) => set(state => { state.isLoading = v }),
      setError:   (e) => set(state => { state.error = e }),
    })),
    { name: 'OrderStore' }
  )
)