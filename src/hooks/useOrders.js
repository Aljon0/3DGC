import { useCallback, useEffect } from 'react';
import toast                      from 'react-hot-toast';
import { useOrderStore }          from '@/store/useOrderStore';
import ordersService              from '@/services/orders.service';

// ── Convert base64 dataURL to Blob ────────────────────────────────────────
function dataURLtoBlob(dataURL) {
  if (!dataURL || !dataURL.startsWith('data:')) return null;
  try {
    const [header, base64] = dataURL.split(',');
    const mime   = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const arr    = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch {
    return null;
  }
}

// Poll interval — how often to silently re-fetch orders in the background
const POLL_INTERVAL_MS = 60_000; // 1 minute

export function useOrders({ autoFetch = false } = {}) {
  const {
    orders,
    activeOrderId,
    isLoading,
    error,
    filters,
    activeOrder,
    ordersByStatus,
    filteredOrders,
    setOrders,
    addOrder,
    updateOrder,
    setActiveOrder,
    clearActiveOrder,
    setFilter,
    resetFilters,
    setLoading,
    setError,
  } = useOrderStore();

  // ── Fetch all orders ──────────────────────────────────────────────────
  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const result = await ordersService.fetch(params);
      setOrders(result.orders);
      return result;
    } catch (err) {
      const msg = err.message ?? 'Failed to load orders.';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setOrders, setLoading, setError]);

  // ── Initial fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    if (autoFetch) fetchOrders();
  }, [autoFetch, fetchOrders]);

  // ── Auto-refresh polling ──────────────────────────────────────────────
  // Silently re-fetches orders every 15 seconds while the Kanban board
  // is mounted — no page reload needed, no Realtime dependency.
  useEffect(() => {
    if (!autoFetch) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [autoFetch, fetchOrders]);

  // ── Fetch single order ────────────────────────────────────────────────
  const fetchOrder = useCallback(async (id) => {
    setLoading(true);
    try {
      const { order } = await ordersService.fetchById(id);
      updateOrder(order.id, order);
      setActiveOrder(order.id);
      return order;
    } catch (err) {
      toast.error(err.message ?? 'Could not load order.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateOrder, setActiveOrder, setLoading]);

  // ── Place order ───────────────────────────────────────────────────────
  const placeOrder = useCallback(async (orderData) => {
    setLoading(true);
    try {
      const { snapshot: snapshotBase64, ...restOrderData } = orderData;
      const snapshotBlob = dataURLtoBlob(snapshotBase64);
      const { order } = await ordersService.create(restOrderData, snapshotBlob);
      addOrder(order);
      toast.success(`Order ${order.order_number} placed successfully!`);
      return order;
    } catch (err) {
      toast.error(err.message ?? 'Failed to place order.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [addOrder, setLoading]);

  // ── Create walk-in ────────────────────────────────────────────────────
  const createWalkIn = useCallback(async (orderData) => {
    setLoading(true);
    try {
      const { order } = await ordersService.createWalkIn(orderData);
      addOrder(order);
      toast.success(`Walk-in order ${order.order_number} created.`);
      return order;
    } catch (err) {
      toast.error(err.message ?? 'Failed to create walk-in order.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [addOrder, setLoading]);

  // ── Update status ─────────────────────────────────────────────────────
  const changeStatus = useCallback(async (id, status, rejectionReason = null, notes = null) => {
    try {
      const { order } = await ordersService.updateStatus(id, status, rejectionReason, notes);
      updateOrder(id, order);
      const labels = {
        processing:           'Order accepted — now processing.',
        finished:             'Order marked as finished.',
        cancelled:            'Order has been cancelled.',
        awaiting_2nd_payment: 'Awaiting second payment.',
      };
      toast.success(labels[status] ?? `Status updated to ${status}.`);
      return true;
    } catch (err) {
      toast.error(err.message ?? 'Could not update status.');
      return false;
    }
  }, [updateOrder]);

  // ── Upload payment proof ──────────────────────────────────────────────
  const uploadPaymentProof = useCallback(async (id, file) => {
    const toastId = toast.loading('Uploading payment proof...');
    try {
      const { order, paymentProofUrl } = await ordersService.uploadPaymentProof(id, file);
      updateOrder(id, order);
      toast.success('Payment proof submitted!', { id: toastId });
      return paymentProofUrl;
    } catch (err) {
      toast.error(err.message ?? 'Upload failed.', { id: toastId });
      return null;
    }
  }, [updateOrder]);

  // ── Cancel order ──────────────────────────────────────────────────────
  const cancelOrder = useCallback(async (id, reason) => {
    try {
      const { order } = await ordersService.cancel(id, reason);
      updateOrder(id, order);
      toast.success('Order cancelled.');
      return true;
    } catch (err) {
      toast.error(err.message ?? 'Could not cancel order.');
      return false;
    }
  }, [updateOrder]);

  return {
    orders,
    activeOrderId,
    isLoading,
    error,
    filters,
    activeOrder:    activeOrder(),
    ordersByStatus: ordersByStatus(),
    filteredOrders: filteredOrders(),
    setFilter,
    resetFilters,
    setActiveOrder,
    clearActiveOrder,
    fetchOrders,
    fetchOrder,
    placeOrder,
    createWalkIn,
    changeStatus,
    uploadPaymentProof,
    cancelOrder,
  };
}