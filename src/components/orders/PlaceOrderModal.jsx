import Modal from "@/components/shared/Modal";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useOrders } from "@/hooks/useOrders";
import { cn, formatPeso } from "@/lib/utils";
import settingsService from "@/services/settings.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// ── Size options per stone type ────────────────────────────────────────────
const GRAVESTONE_SIZES = [
  "20x30",
  "20x40",
  "20x50",
  "20x60",
  "30x40",
  "40x50",
  "40x60",
  "50x60",
  "60x60",
  "60x70",
  "80x80",
  "80x90",
  "15x24",
  "18x24",
];

const SIZE_LABEL = (size) => {
  const inchSizes = ["15x24", "18x24"];
  if (inchSizes.includes(size)) return `${size.replace("x", "×")}"`;
  return `${size.replace("x", " × ")} cm`;
};

export default function PlaceOrderModal({ open, onClose, onSuccess }) {
  const [sessionId, setSessionId] = useState(0);
  const closeAndReset = useCallback(() => {
    setSessionId((id) => id + 1);
    onClose?.();
  }, [onClose]);

  return (
    <PlaceOrderModalSession
      key={sessionId}
      open={open}
      onClose={closeAndReset}
      onSuccess={onSuccess}
    />
  );
}

function PlaceOrderModalSession({ open, onClose, onSuccess }) {
  const { canvas, snapshot } = useCustomizerStore();
  const { placeOrder, isLoading } = useOrders();
  const { user } = useAuthStore();

  const [pricing, setPricing] = useState(null);
  const [step, setStep] = useState(1);
  const [paymentType, setPaymentType] = useState("full");
  const [notes, setNotes] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ── Order-specific selections ──────────────────────────────────────────
  const [gravestoneType, setGravestoneType] = useState("standard"); // 'standard' | 'blackGalaxy'
  const [selectedSize, setSelectedSize] = useState("");
  const [blasting, setBlasting] = useState("withBlasting"); // urn/tableSign
  const [urnSize, setUrnSize] = useState("big"); // urn
  const [tableSignSize, setTableSignSize] = useState("medium"); // tableSign
  const [baseSize, setBaseSize] = useState("30x40-40x50"); // base
  const [extraNames, setExtraNames] = useState(0); // additional names

  const stoneType = canvas.stoneType;

  // ── Load pricing from settings ─────────────────────────────────────────
  useEffect(() => {
    settingsService
      .fetch()
      .then(({ settings }) => setPricing(settings.pricing))
      .catch(() => setPricing(null));
  }, []);

  // ── Calculate base price from selections ──────────────────────────────
  const basePrice = (() => {
    if (!pricing) return 0;

    if (stoneType === "gravestone") {
      const table =
        gravestoneType === "standard"
          ? pricing.standardGravestone
          : pricing.blackGalaxyGravestone;
      return table?.[selectedSize] ?? 0;
    }

    if (stoneType === "urn") {
      return pricing.urn?.[blasting]?.[urnSize] ?? 0;
    }

    if (stoneType === "table-sign") {
      return pricing.tableSign?.[blasting]?.[tableSignSize] ?? 0;
    }

    if (stoneType === "base") {
      return pricing.base?.[baseSize] ?? 0;
    }

    return 0;
  })();

  // ── Add-ons ────────────────────────────────────────────────────────────
  const extraNamesPrice = extraNames * (pricing?.additionalName ?? 500);
  const imageDecals = canvas.decals.filter((d) => d.type === "image").length;
  const frameDecals = canvas.decals.filter((d) => d.type === "frame").length;
  const imagePrice = imageDecals * (pricing?.imageDecal ?? 250);
  const framePrice = frameDecals * (pricing?.frameDecal ?? 300);
  const addOnsPrice = extraNamesPrice + imagePrice + framePrice;
  const totalPrice = basePrice + addOnsPrice;
  const minPartial = Math.ceil(totalPrice * 0.5);

  // ── Validation ─────────────────────────────────────────────────────────
  const isConfigValid = (() => {
    if (stoneType === "gravestone") return !!selectedSize && basePrice > 0;
    if (stoneType === "urn") return true;
    if (stoneType === "table-sign") return true;
    if (stoneType === "base") return true;
    return false;
  })();

  const handleSubmit = async () => {
    if (!termsAccepted || !isConfigValid) return;

    // ── Resolve the stoneType key the backend/pricing engine expects ──────
    // canvas.stoneType is the generic shape ("gravestone", "urn", "table-sign", "base").
    // calculateOrderPrice on the backend expects the pricing-table key, which for
    // gravestones is "standardGravestone" or "blackGalaxyGravestone".
    const resolvedStoneType = (() => {
      if (stoneType === "gravestone") {
        return gravestoneType === "blackGalaxy"
          ? "blackGalaxyGravestone"
          : "standardGravestone";
      }
      // "urn", "table-sign", "base" map 1-to-1
      return stoneType;
    })();

    if (!snapshot) {
      toast.error("Please capture your design first before placing the order.");
      return;
    }

    const order = await placeOrder({
      customerId: user.id,
      customerName: user.name,
      stoneType: resolvedStoneType,
      texture: canvas.texture,
      dimensions: canvas.dimensions,
      decals: canvas.decals,
      snapshot: snapshot,
      selectedSize: selectedSize || urnSize || tableSignSize || baseSize,
      gravestoneType: stoneType === "gravestone" ? gravestoneType : null,
      blasting: ["urn", "table-sign"].includes(stoneType) ? blasting : null,
      extraNames,
      imageDecalCount: imageDecals,
      frameDecalCount: frameDecals,
      basePrice,
      addOnsPrice,
      totalPrice,
      paymentType,
      amountPaid: 0, // ← always 0 at order creation
      balance: totalPrice, // ← full balance until payment confirmed
      notes,
    });

    if (order) {
      onSuccess?.(order);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Place Your Order"
      description="Review your design and confirm the order"
      size="lg"
      footer={
        step === 1 ? (
          <Button
            variant="solid"
            size="md"
            disabled={!isConfigValid || totalPrice === 0}
            onClick={() => setStep(2)}
          >
            Continue to Payment
          </Button>
        ) : (
          <>
            <Button variant="ghost" size="md" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="solid"
              size="md"
              loading={isLoading}
              disabled={!termsAccepted}
              iconLeft={<ShoppingCart className="size-4" />}
              onClick={handleSubmit}
            >
              Confirm Order
            </Button>
          </>
        )
      }
    >
      <div className="space-y-5">
        {/* ── Step 1: Configure & Review ────────────── */}
        {step === 1 && (
          <>
            {/* Snapshot */}
            {snapshot ? (
              <div className="rounded-xl overflow-hidden border border-brand-700">
                <img
                  src={snapshot}
                  alt="Your design"
                  className="w-full object-contain max-h-40 bg-brand-800"
                />
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed border-brand-700
                              bg-brand-800/50 h-24 flex items-center justify-center
                              text-brand-500 text-sm font-sans"
              >
                No snapshot — capture your design first
              </div>
            )}

            {/* ── Stone type: Gravestone ─────────────── */}
            {stoneType === "gravestone" && (
              <ConfigSection title="Gravestone Options">
                {/* Type: Standard or Black Galaxy */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-400 font-sans">
                    Stone Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "standard", label: "Standard" },
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

                {/* Size selection */}
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
                          onClick={() => setSelectedSize(size)}
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
                          <span className="font-mono text-xs">
                            {SIZE_LABEL(size)}
                          </span>
                          <span className="font-mono text-xs font-semibold">
                            {price ? formatPeso(price) : "—"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {!selectedSize && (
                    <p className="text-xs text-amber-400 font-sans">
                      Please select a size
                    </p>
                  )}
                </div>
              </ConfigSection>
            )}

            {/* ── Stone type: Urn ───────────────────── */}
            {stoneType === "urn" && (
              <ConfigSection title="Urn Options">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-400 font-sans">
                    Size
                  </label>
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

            {/* ── Stone type: Table Sign ────────────── */}
            {stoneType === "table-sign" && (
              <ConfigSection title="Table Sign Options">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-brand-400 font-sans">
                    Size
                  </label>
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

            {/* ── Stone type: Base ──────────────────── */}
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
                      <span>
                        {key.replace(/-/g, " – ").replace(/x/g, "×")} cm
                      </span>
                      <span className="font-mono font-semibold">
                        {formatPeso(price)}
                      </span>
                    </button>
                  ))}
                </div>
              </ConfigSection>
            )}

            {/* ── Add-ons ───────────────────────────── */}
            <ConfigSection title="Add-ons">
              {/* Extra names */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-brand-200 font-sans">
                    Additional Names
                  </p>
                  <p className="text-xs text-brand-500 font-sans mt-0.5">
                    1st name included •{" "}
                    {formatPeso(pricing?.additionalName ?? 500)} per extra name
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

              {/* Image/Frame decals from canvas */}
              {(imageDecals > 0 || frameDecals > 0) && (
                <div className="space-y-1.5 pt-2 border-t border-brand-800">
                  {imageDecals > 0 && (
                    <div className="flex justify-between text-xs font-sans text-brand-400">
                      <span>Image elements ({imageDecals}×)</span>
                      <span className="font-mono">
                        {formatPeso(imagePrice)}
                      </span>
                    </div>
                  )}
                  {frameDecals > 0 && (
                    <div className="flex justify-between text-xs font-sans text-brand-400">
                      <span>Picture frames ({frameDecals}×)</span>
                      <span className="font-mono">
                        {formatPeso(framePrice)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </ConfigSection>

            {/* ── Price Summary ─────────────────────── */}
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
              {addOnsPrice > 0 && (
                <ModalRow
                  label="Other Add-ons"
                  value={formatPeso(addOnsPrice - extraNamesPrice)}
                />
              )}
              <div className="border-t border-brand-700 pt-2 mt-1">
                <ModalRow
                  label="Total"
                  value={formatPeso(totalPrice)}
                  highlight
                />
              </div>
            </div>

            {/* Special instructions */}
            <Textarea
              label="Special Instructions (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Rush order, specific engraving details, etc."
              rows={2}
            />
          </>
        )}

        {/* ── Step 2: Payment & Terms ───────────────── */}
        {step === 2 && (
          <>
            <div className="space-y-3">
              <p className="text-sm font-medium text-brand-200 font-sans">
                Payment Type
              </p>
              <PaymentOption
                selected={paymentType === "full"}
                onSelect={() => setPaymentType("full")}
                title="Full Payment"
                amount={formatPeso(totalPrice)}
                desc="Pay the complete amount upfront."
              />
              <PaymentOption
                selected={paymentType === "partial"}
                onSelect={() => setPaymentType("partial")}
                title="Partial Payment (50% down)"
                amount={formatPeso(minPartial)}
                desc={`Balance of ${formatPeso(totalPrice - minPartial)} upon completion.`}
              />
            </div>

            <div className="rounded-xl bg-accent-500/5 border border-accent-500/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-300 font-sans">
                  {paymentType === "full" ? "Pay now" : "Down payment now"}
                </span>
                <span className="text-lg font-display font-bold text-accent-400">
                  {paymentType === "full"
                    ? formatPeso(totalPrice)
                    : formatPeso(minPartial)}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-brand-800 border border-brand-700 p-4 space-y-3">
              <p className="text-xs font-semibold text-brand-400 font-sans uppercase tracking-wide">
                Terms & Conditions
              </p>
              <ul className="space-y-1.5 text-xs text-brand-400 font-sans">
                {[
                  "Minimum 50% down payment required for partial payment.",
                  "Full payment must be settled before order release.",
                  "Cancellations after 24 hours are subject to review.",
                  "Rush orders within 3 days incur an additional ₱500 fee.",
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-600 mt-0.5">•</span>
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setTermsAccepted((v) => !v)}
                className={cn(
                  "size-5 rounded-md border-2 flex items-center justify-center",
                  "transition-all duration-150 shrink-0 mt-0.5",
                  termsAccepted
                    ? "bg-accent-500 border-accent-500"
                    : "border-brand-600 group-hover:border-brand-400",
                )}
              >
                {termsAccepted && <Check className="size-3 text-white" />}
              </div>
              <span className="text-sm text-brand-300 font-sans leading-relaxed">
                I have read and agree to the terms and conditions above.
              </span>
            </label>
          </>
        )}
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
      <label className="text-xs font-medium text-brand-400 font-sans">
        Blasting
      </label>
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

function PaymentOption({ selected, onSelect, title, amount, desc }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-xl border text-left",
        "transition-all duration-150",
        selected
          ? "border-accent-500/60 bg-accent-500/5"
          : "border-brand-700 bg-brand-800/50 hover:border-brand-500",
      )}
    >
      <div
        className={cn(
          "size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
          selected ? "border-accent-500" : "border-brand-600",
        )}
      >
        {selected && <div className="size-2.5 rounded-full bg-accent-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm font-semibold font-sans",
              selected ? "text-accent-400" : "text-brand-200",
            )}
          >
            {title}
          </p>
          <p className="text-sm font-mono font-bold text-brand-100 shrink-0">
            {amount}
          </p>
        </div>
        <p className="text-xs text-brand-400 font-sans mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
