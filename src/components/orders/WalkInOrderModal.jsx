import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import Input, { Textarea } from "@/components/ui/Input";
import { useOrders } from "@/hooks/useOrders";
import { cn, formatPeso } from "@/lib/utils";
import settingsService from "@/services/settings.service";
import { Minus, Phone, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";

// ── Size options per stone type ────────────────────────────────────────────
const GRAVESTONE_SIZES = [
  "20x30", "20x40", "20x50", "20x60",
  "30x40", "40x50", "40x60", "50x60",
  "60x60", "60x70", "80x80", "80x90",
  "15x24", "18x24",
];

const SIZE_LABEL = (size) => {
  const inchSizes = ["15x24", "18x24"];
  if (inchSizes.includes(size)) return `${size.replace("x", "×")}"`;
  return `${size.replace("x", " × ")} cm`;
};

/**
 * WalkInOrderModal
 * Admin-only modal to create a walk-in order manually.
 * - Mirrors PlaceOrderModal structure (stone type, size grid, add-ons, price summary)
 * - No snapshot (walk-in customer didn't use the online customizer)
 * - Always full payment (face-to-face); order goes directly to "processing"
 */
export default function WalkInOrderModal({ open, onClose }) {
  const { createWalkIn, isLoading } = useOrders();

  const [pricing, setPricing] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Customer info ──────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  // ── Stone selections ───────────────────────────────────────────────────
  const [stoneType, setStoneType] = useState("gravestone");
  const [gravestoneType, setGravestoneType] = useState("standard");
  const [selectedSize, setSelectedSize] = useState("");
  const [blasting, setBlasting] = useState("withBlasting");
  const [urnSize, setUrnSize] = useState("big");
  const [tableSignSize, setTableSignSize] = useState("medium");
  const [baseSize, setBaseSize] = useState("");

  // ── Add-ons ────────────────────────────────────────────────────────────
  const [extraNames, setExtraNames] = useState(0);

  // ── Notes ──────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState("");

  // ── Load pricing from settings ─────────────────────────────────────────
  useEffect(() => {
    settingsService
      .fetch()
      .then(({ settings }) => {
        setPricing(settings.pricing);
        // Set default baseSize once pricing loads
        const firstBase = Object.keys(settings.pricing?.base ?? {})[0];
        if (firstBase) setBaseSize(firstBase);
      })
      .catch(() => setPricing(null));
  }, []);

  // Reset size selections when stone type changes
  const handleStoneTypeChange = (type) => {
    setStoneType(type);
    setSelectedSize("");
    setGravestoneType("standard");
    setBlasting("withBlasting");
    setUrnSize("big");
    setTableSignSize("medium");
    const firstBase = Object.keys(pricing?.base ?? {})[0];
    setBaseSize(firstBase ?? "");
  };

  // ── Base price ─────────────────────────────────────────────────────────
  const basePrice = (() => {
    if (!pricing) return 0;
    if (stoneType === "gravestone") {
      const table =
        gravestoneType === "standard"
          ? pricing.standardGravestone
          : pricing.blackGalaxyGravestone;
      return table?.[selectedSize] ?? 0;
    }
    if (stoneType === "urn") return pricing.urn?.[blasting]?.[urnSize] ?? 0;
    if (stoneType === "table-sign") return pricing.tableSign?.[blasting]?.[tableSignSize] ?? 0;
    if (stoneType === "base") return pricing.base?.[baseSize] ?? 0;
    return 0;
  })();

  // ── Add-ons price ──────────────────────────────────────────────────────
  const extraNamesPrice = extraNames * (pricing?.additionalName ?? 500);
  const addOnsPrice = extraNamesPrice;
  const totalPrice = basePrice + addOnsPrice;

  // ── Validation ─────────────────────────────────────────────────────────
  const isConfigValid = (() => {
    if (stoneType === "gravestone") return !!selectedSize && basePrice > 0;
    return basePrice > 0;
  })();

  const validate = () => {
    const e = {};
    if (!customerName.trim()) e.customerName = "Customer name is required.";
    if (!isConfigValid) e.size = "Please select a valid size.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit — always full payment, straight to processing ───────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const resolvedStoneType = (() => {
      if (stoneType === "gravestone") {
        return gravestoneType === "blackGalaxy"
          ? "blackGalaxyGravestone"
          : "standardGravestone";
      }
      return stoneType;
    })();

    const result = await createWalkIn({
      customerName,
      phone,
      stoneType: resolvedStoneType,
      texture: null,
      dimensions: null,
      decals: [],
      snapshot: null,
      selectedSize: selectedSize || urnSize || tableSignSize || baseSize,
      gravestoneType: stoneType === "gravestone" ? gravestoneType : null,
      blasting: ["urn", "table-sign"].includes(stoneType) ? blasting : null,
      extraNames,
      imageDecalCount: 0,
      frameDecalCount: 0,
      basePrice,
      addOnsPrice,
      totalPrice,
      paymentType: "full",
      amountPaid: totalPrice,   // fully paid face-to-face
      balance: 0,
      status: "processing",     // skip new_orders / awaiting_payment / 2nd_payment
      notes,
    });

    if (result) {
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setPhone("");
    setStoneType("gravestone");
    setGravestoneType("standard");
    setSelectedSize("");
    setBlasting("withBlasting");
    setUrnSize("big");
    setTableSignSize("medium");
    setExtraNames(0);
    setNotes("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Walk-in Order"
      description="Manually create an order for a walk-in customer"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="solid"
            size="md"
            loading={isLoading}
            disabled={!isConfigValid || totalPrice === 0}
            onClick={handleSubmit}
          >
            Create Order
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* ── Customer Information ───────────────────── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-brand-400 font-sans uppercase tracking-wide">
            Customer Information
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setErrors((err) => ({ ...err, customerName: null }));
              }}
              placeholder="e.g. Juan dela Cruz"
              error={errors.customerName}
              iconLeft={<User className="size-4" />}
              required
            />
            <Input
              label="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XX-XXX-XXXX"
              iconLeft={<Phone className="size-4" />}
            />
          </div>
        </div>

        {/* ── Stone Type Tabs ────────────────────────── */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-brand-400 font-sans uppercase tracking-wide">
            Stone Type
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: "gravestone",  label: "Gravestone" },
              { value: "urn",         label: "Urn" },
              { value: "table-sign",  label: "Table Sign" },
              { value: "base",        label: "Base" },
            ].map((opt) => (
              <OptionButton
                key={opt.value}
                selected={stoneType === opt.value}
                onClick={() => handleStoneTypeChange(opt.value)}
              >
                {opt.label}
              </OptionButton>
            ))}
          </div>
        </div>

        {/* ── Gravestone Options ─────────────────────── */}
        {stoneType === "gravestone" && (
          <ConfigSection title="Gravestone Options">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-400 font-sans">
                Stone Variant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "standard",    label: "Standard" },
                  { value: "blackGalaxy", label: "Black Galaxy" },
                ].map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={gravestoneType === opt.value}
                    onClick={() => {
                      setGravestoneType(opt.value);
                      setSelectedSize("");
                    }}
                  >
                    {opt.label}
                  </OptionButton>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-400 font-sans">
                Size <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {GRAVESTONE_SIZES.map((size) => {
                  const table =
                    gravestoneType === "standard"
                      ? pricing?.standardGravestone
                      : pricing?.blackGalaxyGravestone;
                  const price = table?.[size];
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setErrors((e) => ({ ...e, size: null }));
                      }}
                      disabled={!price}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl",
                        "border text-sm font-sans transition-all duration-150",
                        selectedSize === size
                          ? "border-accent-500/60 bg-accent-500/10 text-accent-400"
                          : price
                            ? "border-brand-700 bg-brand-800/50 text-brand-200 hover:border-brand-500"
                            : "border-brand-800 bg-brand-800/20 text-brand-600 cursor-not-allowed",
                      )}
                    >
                      <span className="font-mono text-xs">{SIZE_LABEL(size)}</span>
                      <span className="font-mono text-xs font-semibold">
                        {price ? formatPeso(price) : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.size && (
                <p className="text-xs text-amber-400 font-sans">{errors.size}</p>
              )}
              {!selectedSize && !errors.size && (
                <p className="text-xs text-amber-400 font-sans">Please select a size</p>
              )}
            </div>
          </ConfigSection>
        )}

        {/* ── Urn Options ────────────────────────────── */}
        {stoneType === "urn" && (
          <ConfigSection title="Urn Options">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-400 font-sans">Size</label>
              <div className="grid grid-cols-2 gap-2">
                {["big", "small"].map((s) => (
                  <OptionButton
                    key={s}
                    selected={urnSize === s}
                    onClick={() => setUrnSize(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {pricing?.urn?.[blasting]?.[s] ? (
                      <span className="block text-xs font-mono opacity-70">
                        {formatPeso(pricing.urn[blasting][s])}
                      </span>
                    ) : null}
                  </OptionButton>
                ))}
              </div>
            </div>
            <BlastingToggle value={blasting} onChange={setBlasting} />
          </ConfigSection>
        )}

        {/* ── Table Sign Options ─────────────────────── */}
        {stoneType === "table-sign" && (
          <ConfigSection title="Table Sign Options">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-brand-400 font-sans">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {["small", "medium", "big"].map((s) => (
                  <OptionButton
                    key={s}
                    selected={tableSignSize === s}
                    onClick={() => setTableSignSize(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {pricing?.tableSign?.[blasting]?.[s] ? (
                      <span className="block text-xs font-mono opacity-70">
                        {formatPeso(pricing.tableSign[blasting][s])}
                      </span>
                    ) : null}
                  </OptionButton>
                ))}
              </div>
            </div>
            <BlastingToggle value={blasting} onChange={setBlasting} />
          </ConfigSection>
        )}

        {/* ── Base Options ───────────────────────────── */}
        {stoneType === "base" && (
          <ConfigSection title="Base Size">
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(pricing?.base ?? {}).map(([key, price]) => (
                <button
                  key={key}
                  onClick={() => setBaseSize(key)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border",
                    "text-sm font-sans transition-all duration-150",
                    baseSize === key
                      ? "border-accent-500/60 bg-accent-500/10 text-accent-400"
                      : "border-brand-700 bg-brand-800/50 text-brand-200 hover:border-brand-500",
                  )}
                >
                  <span>{key.replace(/-/g, " – ").replace(/x/g, "×")} cm</span>
                  <span className="font-mono font-semibold">{formatPeso(price)}</span>
                </button>
              ))}
            </div>
          </ConfigSection>
        )}

        {/* ── Add-ons ────────────────────────────────── */}
        <ConfigSection title="Add-ons">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-200 font-sans">
                Additional Names
              </p>
              <p className="text-xs text-brand-500 font-sans mt-0.5">
                1st name included • {formatPeso(pricing?.additionalName ?? 500)} per extra name
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setExtraNames((n) => Math.max(0, n - 1))}
                className="size-8 rounded-lg bg-brand-800 border border-brand-700
                           flex items-center justify-center text-brand-300
                           hover:border-brand-500 transition-colors"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-mono font-bold text-brand-100">
                {extraNames}
              </span>
              <button
                onClick={() => setExtraNames((n) => n + 1)}
                className="size-8 rounded-lg bg-brand-800 border border-brand-700
                           flex items-center justify-center text-brand-300
                           hover:border-brand-500 transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        </ConfigSection>

        {/* ── Price Summary ──────────────────────────── */}
        <div className="rounded-xl bg-brand-800 border border-brand-700 p-4 space-y-2">
          <p className="text-xs font-semibold text-brand-400 font-sans uppercase tracking-wide mb-3">
            Price Summary
          </p>
          <ModalRow label="Base Price" value={formatPeso(basePrice)} />
          {extraNames > 0 && (
            <ModalRow
              label={`Extra names (${extraNames}×)`}
              value={formatPeso(extraNamesPrice)}
            />
          )}
          <div className="border-t border-brand-700 pt-2 mt-1">
            <ModalRow label="Total" value={formatPeso(totalPrice)} highlight />
          </div>
          {/* Walk-in payment note */}
          <p className="text-xs text-brand-500 font-sans pt-1">
            Walk-in orders are recorded as fully paid. Order will go directly to{" "}
            <span className="text-emerald-400 font-medium">Processing</span>.
          </p>
        </div>

        {/* ── Notes ─────────────────────────────────── */}
        <Textarea
          label="Special Instructions (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Rush order, specific engraving details, etc."
          rows={2}
        />
      </div>
    </Modal>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function ConfigSection({ title, children }) {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-brand-800/50 border border-brand-700">
      <p className="text-xs font-semibold text-brand-400 font-sans uppercase tracking-wide">
        {title}
      </p>
      {children}
    </div>
  );
}

function OptionButton({ selected, onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl border",
        "text-sm font-medium font-sans transition-all duration-150 text-center",
        selected
          ? "border-accent-500/60 bg-accent-500/10 text-accent-400"
          : "border-brand-700 bg-brand-800/50 text-brand-300 hover:border-brand-500",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

function BlastingToggle({ value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-brand-400 font-sans">Blasting</label>
      <div className="grid grid-cols-2 gap-2">
        <OptionButton
          selected={value === "withBlasting"}
          onClick={() => onChange("withBlasting")}
        >
          With Blasting
        </OptionButton>
        <OptionButton
          selected={value === "withoutBlasting"}
          onClick={() => onChange("withoutBlasting")}
        >
          Without Blasting
        </OptionButton>
      </div>
    </div>
  );
}

function ModalRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-brand-400 font-sans">{label}</span>
      <span
        className={cn(
          "text-sm font-sans",
          highlight ? "text-accent-400 font-semibold" : "text-brand-200",
        )}
      >
        {value}
      </span>
    </div>
  );
}