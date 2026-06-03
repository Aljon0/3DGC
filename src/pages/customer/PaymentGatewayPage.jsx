import { InlineSpinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import settingsService from "@/services/settings.service";
import { useUIStore } from "@/store/useUIStore";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Copy,
  Info,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PaymentGatewayPage() {
  const { setPageTitle } = useUIStore();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    setPageTitle("Payment");
  }, [setPageTitle]);

  useEffect(() => {
    settingsService
      .fetchPaymentInfo()
      .then(({ payment }) => setPaymentInfo(payment))
      .catch(() => toast.error("Failed to load payment info."))
      .finally(() => setIsLoading(false));
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) return <InlineSpinner message="Loading payment info..." />;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-50">
          Payment Information
        </h2>
        <p className="text-sm text-brand-400 font-sans mt-1">
          Send your payment to any of the channels below, then upload your proof
          of payment in your order.
        </p>
      </div>

      {/* Payment channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* GCash */}
        <PaymentChannel
          icon={<Smartphone className="size-6" />}
          name="GCash"
          color="from-blue-600/20 to-brand-900"
          border="border-blue-500/20"
          iconColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
          details={[
            {
              label: "Account Name",
              value: paymentInfo?.gcashNumber ? "Double Seven Monuments" : "—",
            },
            { label: "GCash Number", value: paymentInfo?.gcashNumber ?? "—" },
          ]}
          qrUrl={paymentInfo?.gcashQrUrl}
          onCopy={(val, key) => copyToClipboard(val, key)}
          copied={copied}
          prefix="gcash"
        />

        {/* BPI */}
        <PaymentChannel
          icon={<Building2 className="size-6" />}
          name="BPI Bank Transfer"
          color="from-red-600/20 to-brand-900"
          border="border-red-500/20"
          iconColor="text-red-400 bg-red-500/10 border-red-500/20"
          details={[
            { label: "Account Name", value: paymentInfo?.bpiAccount ?? "—" },
            { label: "Bank", value: "Bank of the Philippine Islands" },
          ]}
          qrUrl={paymentInfo?.bpiQrUrl}
          onCopy={(val, key) => copyToClipboard(val, key)}
          copied={copied}
          prefix="bpi"
        />
      </div>

      {/* How to pay steps */}
      <div className="rounded-2xl bg-brand-900 border border-brand-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-accent-400" />
          <h3 className="text-sm font-semibold font-sans text-brand-100">
            How to Pay
          </h3>
        </div>
        <ol className="space-y-3">
          {[
            "Send payment to your preferred channel above.",
            "Take a screenshot or save the transaction receipt.",
            "Go to My Orders and open your order.",
            'Click "Upload Payment Proof" and submit your screenshot.',
            "Our team will confirm your payment within 1 business day.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="size-5 rounded-full bg-accent-500/20 border border-accent-500/30
                               text-accent-400 text-xs font-bold font-mono
                               flex items-center justify-center shrink-0 mt-0.5"
              >
                {i + 1}
              </span>
              <span className="text-sm text-brand-300 font-sans leading-relaxed">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Payment policies */}
      {paymentInfo?.policies?.length > 0 && (
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-400" />
            <h3 className="text-sm font-semibold font-sans text-amber-300">
              Payment Policies
            </h3>
          </div>
          <ul className="space-y-2">
            {paymentInfo.policies.map((policy, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm
                                     text-brand-300 font-sans leading-relaxed"
              >
                <span className="text-amber-500 mt-1 shrink-0">•</span>
                {policy}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── PaymentChannel ─────────────────────────────────────────────────────────
function PaymentChannel({
  icon,
  name,
  color,
  border,
  iconColor,
  details,
  qrUrl,
  onCopy,
  copied,
  prefix,
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 space-y-5",
        "bg-linear-to-br",
        color,
        border,
      )}
    >
      {/* Channel header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center border",
            iconColor,
          )}
        >
          {icon}
        </div>
        <h3 className="text-sm font-semibold font-sans text-brand-100">
          {name}
        </h3>
      </div>

      {/* QR Code */}
      {qrUrl ? (
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <img
              src={qrUrl}
              alt={`${name} QR`}
              className="size-36 object-contain"
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div
            className="size-36 rounded-xl bg-brand-800 border border-dashed
                          border-brand-700 flex items-center justify-center"
          >
            <p className="text-xs text-brand-600 font-sans text-center px-4">
              QR code not yet uploaded
            </p>
          </div>
        </div>
      )}

      {/* Account details */}
      <div className="space-y-3">
        {details.map(({ label, value }, i) => {
          const copyKey = `${prefix}-${i}`;
          return (
            <div key={i} className="space-y-1">
              <p className="text-xs text-brand-500 font-sans">{label}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-brand-100 font-sans">
                  {value}
                </p>
                {value !== "—" && (
                  <button
                    onClick={() => onCopy(value, copyKey)}
                    className={cn(
                      "size-7 flex items-center justify-center rounded-lg",
                      "transition-all duration-150",
                      copied === copyKey
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-brand-500 hover:text-brand-200 hover:bg-brand-800",
                    )}
                  >
                    {copied === copyKey ? (
                      <CheckCircle className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
