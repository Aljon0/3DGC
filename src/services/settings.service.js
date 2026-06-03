import api from './api';

const settingsService = {

  // ── Fetch all settings ──────────────────────────────────────────────────
  // Returns { settings: { pricing, payment, business } }
  //
  async fetch() {
    const response = await api.get('/settings');
    return { settings: response.data.settings };
  },

  // ── Update pricing ──────────────────────────────────────────────────────
  // Sends the full pricing object — backend merges into settings.pricing
  //
  async updatePricing(pricing) {
    const response = await api.patch('/settings', { pricing });
    return { settings: response.data.settings };
  },

  // ── Update payment ──────────────────────────────────────────────────────
  // Sends the full payment object — backend merges into settings.payment
  //
  async updatePayment(payment) {
    const response = await api.patch('/settings', { payment });
    return { settings: response.data.settings };
  },

  // ── Update business info ────────────────────────────────────────────────
  async updateBusiness(business) {
    const response = await api.patch('/settings', { business });
    return { settings: response.data.settings };
  },

  // ── Upload QR Code ──────────────────────────────────────────────────────
  // QR codes are uploaded as assets to Supabase Storage.
  // The returned URL is then saved into settings.payment.
  //
  async uploadQRCode(file, type) {
    const form = new FormData();
    form.append('asset', file);
    form.append('name', `${type}-qr-code`);
    form.append('category', 'qr-codes');

    const response = await api.post('/designs/elements', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = response.data.element.url;

    // Save the URL into settings.payment
    const key = type === 'gcash' ? 'gcashQrUrl' : 'bpiQrUrl';
    const currentSettings = await this.fetch();
    const updatedPayment  = {
      ...currentSettings.settings.payment,
      [key]: url,
    };

    await this.updatePayment(updatedPayment);
    return { url };
  },

  // ── Fetch payment info (customer-facing) ────────────────────────────────
  // Used by PaymentGatewayPage — returns only the payment portion
  //
  async fetchPaymentInfo() {
    const response = await api.get('/settings');
    return { payment: response.data.settings.payment };
  },

  // ── Validate price (optional — used before checkout) ───────────────────
  // Lets frontend confirm server-side price before placing order
  //
  async validatePrice(config) {
    const response = await api.post('/settings/validate-price', config);
    return response.data.price;
  },
};

export default settingsService;