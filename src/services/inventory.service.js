import api from './api';

// ── Normalize API response to camelCase ───────────────────────────────────────
// Backend returns snake_case — frontend uses camelCase throughout
//
const normalizeItem = (item) => ({
  id:                item.id,
  name:              item.name,
  category:          item.category,
  unit:              item.unit,
  quantity:          Number(item.quantity),
  lowStockThreshold: Number(item.low_stock_threshold),
  unitCost:          Number(item.unit_cost),
  isLowStock:        item.is_low_stock ?? (item.quantity <= item.low_stock_threshold),
  createdAt:         item.created_at,
});

const inventoryService = {

  // ── Fetch all inventory items ───────────────────────────────────────────
  async fetch(params = {}) {
    const response = await api.get('/inventory', { params });
    return {
      items:      response.data.items.map(normalizeItem),
      total:      response.data.total,
      page:       response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  // ── Fetch low stock items only ──────────────────────────────────────────
  async fetchLowStock() {
    const response = await api.get('/inventory/low-stock');
    return { items: response.data.items.map(normalizeItem) };
  },

  // ── Fetch single item ───────────────────────────────────────────────────
  async fetchById(id) {
    const response = await api.get(`/inventory/${id}`);
    return { item: normalizeItem(response.data.item) };
  },

  // ── Create inventory item ───────────────────────────────────────────────
  async create(data) {
    const response = await api.post('/inventory', {
      name:              data.name,
      category:          data.category,
      unit:              data.unit,
      quantity:          data.quantity          ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 0,
      unitCost:          data.unitCost          ?? 0,
    });
    return { item: normalizeItem(response.data.item) };
  },

  // ── Update inventory item ───────────────────────────────────────────────
  async update(id, fields) {
    const response = await api.patch(`/inventory/${id}`, fields);
    return { item: normalizeItem(response.data.item) };
  },

  // ── Delete inventory item ───────────────────────────────────────────────
  async delete(id) {
    await api.delete(`/inventory/${id}`);
    return { success: true };
  },

  // ── Export CSV (client-side from current items) ─────────────────────────
  // No backend endpoint — generated from the already-fetched items array
  //
  exportCSVFromItems(items) {
    const headers = [
      'Name', 'Category', 'Unit',
      'Quantity', 'Min Stock', 'Unit Cost',
    ];
    const rows = items.map(i => [
      i.name, i.category, i.unit,
      i.quantity, i.lowStockThreshold, i.unitCost,
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\n');
  },
};

export default inventoryService;