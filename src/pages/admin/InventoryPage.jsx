import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DataTable from "@/components/shared/DataTable";
import Modal from "@/components/shared/Modal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { SelectDropdown } from "@/components/ui/Dropdown";
import Input from "@/components/ui/Input";
import { useInventory } from "@/hooks/useInventory";
import { cn, formatPeso } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import {
  AlertTriangle,
  Download,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "stone", label: "Stone" },
  { value: "supplies", label: "Supplies" },
  { value: "paint", label: "Paint" },
];

const BLANK_FORM = {
  name: "",
  category: "stone",
  unit: "pcs",
  quantity: 0,
  lowStockThreshold: 5,
  unitCost: 0,
};

export default function InventoryPage() {
  const { setPageTitle } = useUIStore();
  const {
    filteredItems,
    isLoading,
    lowStockCount,
    search,
    category,
    showLowStock,
    setSearch,
    setCategory,
    setShowLowStock,
    addItem,
    updateItem,
    deleteItem,
    exportCSV,
  } = useInventory({ autoFetch: true });

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setPageTitle("Inventory");
  }, [setPageTitle]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (form.quantity < 0) e.quantity = "Quantity cannot be negative.";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (editItem) {
      await updateItem(editItem.id, form);
    } else {
      await addItem(form);
    }
    setAddOpen(false);
    setEditItem(null);
    setForm(BLANK_FORM);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      unitCost: item.unitCost,
    });
    setEditItem(item);
    setAddOpen(true);
  };

  // ── Table columns ──────────────────────────────────────────────────────
  const columns = [
    {
      key: "name",
      label: "Item Name",
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-brand-100 font-sans">{v}</p>
          <p className="text-xs text-brand-500 font-sans capitalize">
            {row.category}
          </p>
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Qty",
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-mono font-semibold",
              v <= row.lowStockThreshold ? "text-red-400" : "text-brand-100",
            )}
          >
            {v} {row.unit}
          </span>
          {v <= row.lowStockThreshold && (
            <AlertTriangle className="size-3.5 text-amber-400" />
          )}
        </div>
      ),
    },
    {
      key: "lowStockThreshold",
      label: "Min Stock",
      muted: true,
      render: (v) => (
        <span className="text-sm font-mono text-brand-400">{v}</span>
      ),
    },
    {
      key: "unitCost",
      label: "Unit Cost",
      sortable: true,
      render: (v) => (
        <span className="text-sm font-mono text-brand-200">
          {formatPeso(v)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => (
        <Badge
          variant={row.quantity <= row.lowStockThreshold ? "danger" : "success"}
          dot
        >
          {row.quantity <= row.lowStockThreshold ? "Low Stock" : "In Stock"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_, row) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            variant="ghost"
            size="xs"
            iconLeft={<Pencil className="size-3" />}
            onClick={() => openEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="xs"
            iconLeft={<Trash2 className="size-3" />}
            onClick={() => setDeleteId(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-50">
            Inventory
          </h2>
          <p className="text-sm text-brand-400 font-sans mt-1">
            Track materials and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            iconLeft={<Download className="size-4" />}
            onClick={exportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="solid"
            size="sm"
            iconLeft={<Plus className="size-4" />}
            onClick={() => {
              setForm(BLANK_FORM);
              setEditItem(null);
              setAddOpen(true);
            }}
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl
                        bg-amber-500/5 border border-amber-500/20"
        >
          <AlertTriangle className="size-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300 font-sans">
            <span className="font-semibold">
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""}
            </span>{" "}
            below minimum stock level.
          </p>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowLowStock((v) => !v)}
            className="ml-auto text-amber-400"
          >
            {showLowStock ? "Show All" : "Show Low Stock"}
          </Button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={isLoading}
        searchable
        searchPlaceholder="Search inventory..."
        externalSearch={search}
        onSearch={setSearch}
        emptyTitle="No inventory items"
        emptyIcon={<Package className="size-7" />}
        headerExtra={
          <SelectDropdown
            value={category}
            onChange={setCategory}
            options={CATEGORIES}
            size="sm"
            className="w-40"
          />
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditItem(null);
        }}
        title={editItem ? "Edit Item" : "Add Inventory Item"}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setAddOpen(false);
                setEditItem(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="solid" size="md" onClick={handleSave}>
              {editItem ? "Save Changes" : "Add Item"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Item Name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={formErrors.name}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-200 font-sans">
                Category
              </label>
              <SelectDropdown
                value={form.category}
                onChange={(v) => set("category", v)}
                options={CATEGORIES.filter((c) => c.value !== "all")}
              />
            </div>
            <Input
              label="Unit"
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
              placeholder="pcs, bot, set..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.quantity}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                set("quantity", val === "" ? 0 : Number(val));
              }}
              error={formErrors.quantity}
            />
            <Input
              label="Min Stock Alert"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.lowStockThreshold}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                set("lowStockThreshold", val === "" ? 0 : Number(val));
              }}
            />
          </div>
          <Input
            label="Unit Cost (₱)"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={form.unitCost}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              set("unitCost", val === "" ? 0 : Number(val));
            }}
          />
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteItem(deleteId);
          setDeleteId(null);
        }}
        title="Delete Item"
        description="Remove this item from inventory? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
