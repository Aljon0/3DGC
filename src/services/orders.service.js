import api from './api';

const ordersService = {

  // ── Fetch orders ────────────────────────────────────────────────────────
  // Admin: all orders. Customer: own orders only.
  // Params: status, isWalkIn, page, limit
  //
  async fetch(params = {}) {
    const response = await api.get('/orders', { params });
    return {
      orders:     response.data.orders,
      total:      response.data.total,
      page:       response.data.page,
      totalPages: response.data.totalPages,
    };
  },

  // ── Fetch single order ──────────────────────────────────────────────────
  async fetchById(id) {
    const response = await api.get(`/orders/${id}`);
    return { order: response.data.order };
  },

  // ── Customer: place order from 3D customizer ────────────────────────────
  // Sends multipart/form-data:
  //   - snapshot (file, optional) — PNG blob from R3F canvas
  //   - orderData (JSON string)   — full customizer state
  //
  async create(orderData, snapshotBlob = null) {
    const form = new FormData();

    // Attach snapshot if provided
    if (snapshotBlob) {
      form.append('snapshot', snapshotBlob, 'snapshot.png');
    }

    // orderData must be a JSON string in multipart form
    form.append('orderData', JSON.stringify(orderData));

    const response = await api.post('/orders/checkout', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { order: response.data.order };
  },

  // ── Admin: create walk-in order ─────────────────────────────────────────
  // Plain JSON — no snapshot needed for walk-ins
  //
  async createWalkIn(orderData) {
    const response = await api.post('/orders/walk-in', orderData);
    return { order: response.data.order };
  },

  // ── Admin: update order status ──────────────────────────────────────────
  // Backend status machine validates transitions.
  // rejectionReason required when status = 'cancelled'
  //
  async updateStatus(id, status, rejectionReason = null, notes = null) {
    const payload = { status };
    if (rejectionReason) payload.rejectionReason = rejectionReason;
    if (notes)           payload.notes           = notes;

    const response = await api.patch(`/orders/${id}/status`, payload);
    return { order: response.data.order };
  },

  // ── Customer: cancel own order ──────────────────────────────────────────
  // Uses the same status endpoint — customer sends cancelled status
  //
  async cancel(id, reason = 'Customer requested cancellation.') {
    const response = await api.patch(`/orders/${id}/status`, {
      status:          'cancelled',
      rejectionReason: reason,
    });
    return { order: response.data.order };
  },

  // ── Customer: upload payment receipt ────────────────────────────────────
  // Field name must be "receipt" — matches upload.middleware.js
  //
  async uploadPaymentProof(id, file) {
    const form = new FormData();
    form.append('receipt', file);   // ← must match backend field name

    const response = await api.post(`/orders/${id}/receipt`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      order:          response.data.order,
      paymentProofUrl: response.data.order.payment_proof_url,
    };
  },

  // ── Fetch orders by status ──────────────────────────────────────────────
  // Convenience method used by KanbanBoard
  //
  async fetchByStatus(status) {
    const response = await api.get('/orders', { params: { status } });
    return {
      orders: response.data.orders,
      total:  response.data.total,
    };
  },
};

export default ordersService;