import { useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import inventoryService from '@/services/inventory.service';

export function useInventory({ autoFetch = true } = {}) {
  const [items,        setItems]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(false);
  const [search,       setSearch]       = useState('');
  const [category,     setCategory]     = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);

  // ── Derived: filtered items ───────────────────────────────────────────────
  const filteredItems = items
    .filter(i => {
      if (showLowStock) return i.quantity <= i.lowStockThreshold;
      return true;
    })
    .filter(i => category === 'all' || i.category === category)
    .filter(i => {
      if (!search) return true;
      return i.name.toLowerCase().includes(search.toLowerCase());
    });

  const lowStockCount = items.filter(i => i.quantity <= i.lowStockThreshold).length;

  // ── Fetch items ───────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { items: fetched } = await inventoryService.fetch();
      setItems(fetched);
    } catch (err) {
      toast.error(err.message ?? 'Could not load inventory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Add item ──────────────────────────────────────────────────────────────
  const addItem = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const { item } = await inventoryService.create(data);
      setItems(prev => [item, ...prev]);
      toast.success(`"${item.name}" added to inventory.`);
      return item;
    } catch (err) {
      toast.error(err.message ?? 'Could not add item.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Update item ───────────────────────────────────────────────────────────
  const updateItem = useCallback(async (id, fields) => {
    try {
      const { item } = await inventoryService.update(id, fields);
      // Replace the entire normalized item — don't spread stale fields
      setItems(prev => prev.map(i => i.id === id ? item : i));
      toast.success('Item updated.');
      return true;
    } catch (err) {
      toast.error(err.message ?? 'Could not update item.');
      return false;
    }
  }, []);

  // ── Delete item ───────────────────────────────────────────────────────────
  const deleteItem = useCallback(async (id) => {
    try {
      await inventoryService.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Item removed.');
      return true;
    } catch (err) {
      toast.error(err.message ?? 'Could not delete item.');
      return false;
    }
  }, []);

  // ── Export CSV ────────────────────────────────────────────────────────────
  // Generated client-side from already-loaded items — no backend call needed
  //
  const exportCSV = useCallback(() => {
    if (items.length === 0) {
      toast.error('No items to export.');
      return;
    }
    const csv  = inventoryService.exportCSVFromItems(items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Inventory exported!');
  }, [items]);

  // ── Upload texture ────────────────────────────────────────────────────────
  // Textures are design elements — redirect to designs service
  //
  const uploadTexture = useCallback(async (file, label) => {
    const toastId = toast.loading('Uploading texture...');
    try {
      const { default: designsService } =
        await import('@/services/designs.service');
      const { element } = await designsService.uploadElement(
        file, label, 'texture'
      );
      toast.success(`Texture "${label}" uploaded.`, { id: toastId });
      return element;
    } catch (err) {
      toast.error(err.message ?? 'Texture upload failed.', { id: toastId });
      return null;
    }
  }, []);

  // ── Auto-fetch on mount ───────────────────────────────────────────────────
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (!autoFetch || didFetchRef.current) return;
    didFetchRef.current = true;
    fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    items,
    filteredItems,
    isLoading,
    search,
    category,
    showLowStock,
    lowStockCount,
    setSearch,
    setCategory,
    setShowLowStock,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
    uploadTexture,
  };
}