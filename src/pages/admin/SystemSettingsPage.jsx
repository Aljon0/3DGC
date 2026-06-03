import FileUploader from "@/components/shared/FileUploader";
import Button from "@/components/ui/Button";
import Input, { Textarea } from "@/components/ui/Input";
import { InlineSpinner } from "@/components/ui/Spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import settingsService from "@/services/settings.service";
import { useUIStore } from "@/store/useUIStore";
import { Building, CreditCard, DollarSign, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SystemSettingsPage() {
  const { setPageTitle } = useUIStore();
  const [settings,  setSettings]  = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);

  useEffect(() => { setPageTitle("System Settings"); }, [setPageTitle]);

  useEffect(() => {
    settingsService.fetch()
      .then(({ settings }) => setSettings(settings))
      .catch(() => toast.error("Failed to load settings."))
      .finally(() => setIsLoading(false));
  }, []);

  const updatePricing  = async (pricing)  => { setIsSaving(true); try { const { settings: s } = await settingsService.updatePricing(pricing);  setSettings(s); toast.success("Pricing updated.");          } catch { toast.error("Failed to save."); } finally { setIsSaving(false); } };
  const updatePayment  = async (payment)  => { setIsSaving(true); try { const { settings: s } = await settingsService.updatePayment(payment);  setSettings(s); toast.success("Payment settings updated."); } catch { toast.error("Failed to save."); } finally { setIsSaving(false); } };
  const updateBusiness = async (business) => { setIsSaving(true); try { const { settings: s } = await settingsService.updateBusiness(business); setSettings(s); toast.success("Business info updated.");   } catch { toast.error("Failed to save."); } finally { setIsSaving(false); } };

  const uploadQR = async (file, type) => {
    try {
      const { url } = await settingsService.uploadQRCode(file, type);
      setSettings(prev => ({ ...prev, payment: { ...prev.payment, [type === 'gcash' ? 'gcashQrUrl' : 'bpiQrUrl']: url } }));
      toast.success(`${type.toUpperCase()} QR code uploaded.`);
    } catch { toast.error("Upload failed."); }
  };

  if (isLoading) return <InlineSpinner message="Loading settings..." />;
  if (!settings)  return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-50">System Settings</h2>
        <p className="text-sm text-brand-400 font-sans mt-1">
          Manage pricing, payment channels, and business information.
        </p>
      </div>

      <Tabs defaultValue="pricing">
        <TabsList>
          <TabsTrigger value="pricing"  icon={<DollarSign className="size-3.5" />}>Pricing</TabsTrigger>
          <TabsTrigger value="payment"  icon={<CreditCard  className="size-3.5" />}>Payment</TabsTrigger>
          <TabsTrigger value="business" icon={<Building    className="size-3.5" />}>Business</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing"  className="pt-6"><PricingForm  pricing={settings.pricing}   onSave={updatePricing}  isSaving={isSaving} /></TabsContent>
        <TabsContent value="payment"  className="pt-6"><PaymentForm  payment={settings.payment}   onSave={updatePayment}  onUploadQR={uploadQR} isSaving={isSaving} /></TabsContent>
        <TabsContent value="business" className="pt-6"><BusinessForm business={settings.business} onSave={updateBusiness} isSaving={isSaving} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ── Gravestone size list ───────────────────────────────────────────────────
const GRAVESTONE_SIZES = [
  '20x30','20x40','20x50','20x60',
  '30x40','40x50','40x60','50x60',
  '60x60','60x70','80x80','80x90',
  '15x24','18x24',
]

// ── PricingForm ────────────────────────────────────────────────────────────
function PricingForm({ pricing, onSave, isSaving }) {
  const [form, setForm] = useState(structuredClone(pricing))

  const setVal = (path, value) => {
    setForm(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value === '' ? null : Number(value)
      return next
    })
  }

  return (
    <div className="space-y-8">

      {/* ── Standard Gravestone ─────────────────────── */}
      <SectionCard title="Standard Gravestone Prices">
        <div className="grid grid-cols-2 gap-3">
          {GRAVESTONE_SIZES.map(size => (
            <SizeInput
              key={size}
              label={size.includes('x') && !size.includes('.')
                ? size.replace('x', ' × ') + ' cm'
                : size + '"'
              }
              value={form.standardGravestone?.[size] ?? ''}
              onChange={v => setVal(`standardGravestone.${size}`, v)}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── Black Galaxy Gravestone ─────────────────── */}
      <SectionCard title="Black Galaxy Gravestone Prices">
        <div className="grid grid-cols-2 gap-3">
          {GRAVESTONE_SIZES.map(size => (
            <SizeInput
              key={size}
              label={size + (size.includes('"') ? '"' : ' cm')}
              value={form.blackGalaxyGravestone?.[size] ?? ''}
              onChange={v => setVal(`blackGalaxyGravestone.${size}`, v)}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── Urn ─────────────────────────────────────── */}
      <SectionCard title="Urn Prices">
        <div className="space-y-4">
          <SubSection title="With Blasting">
            <div className="grid grid-cols-2 gap-3">
              <SizeInput label="Big"   value={form.urn?.withBlasting?.big   ?? ''} onChange={v => setVal('urn.withBlasting.big',   v)} />
              <SizeInput label="Small" value={form.urn?.withBlasting?.small ?? ''} onChange={v => setVal('urn.withBlasting.small', v)} />
            </div>
          </SubSection>
          <SubSection title="Without Blasting">
            <div className="grid grid-cols-2 gap-3">
              <SizeInput label="Big"   value={form.urn?.withoutBlasting?.big   ?? ''} onChange={v => setVal('urn.withoutBlasting.big',   v)} />
              <SizeInput label="Small" value={form.urn?.withoutBlasting?.small ?? ''} onChange={v => setVal('urn.withoutBlasting.small', v)} />
            </div>
          </SubSection>
        </div>
      </SectionCard>

      {/* ── Table Sign ──────────────────────────────── */}
      <SectionCard title="Table Sign Prices">
        <div className="space-y-4">
          <SubSection title="With Blasting">
            <div className="grid grid-cols-3 gap-3">
              <SizeInput label="Small"  value={form.tableSign?.withBlasting?.small  ?? ''} onChange={v => setVal('tableSign.withBlasting.small',  v)} />
              <SizeInput label="Medium" value={form.tableSign?.withBlasting?.medium ?? ''} onChange={v => setVal('tableSign.withBlasting.medium', v)} />
              <SizeInput label="Big"    value={form.tableSign?.withBlasting?.big    ?? ''} onChange={v => setVal('tableSign.withBlasting.big',    v)} />
            </div>
          </SubSection>
          <SubSection title="Without Blasting">
            <div className="grid grid-cols-3 gap-3">
              <SizeInput label="Small"  value={form.tableSign?.withoutBlasting?.small  ?? ''} onChange={v => setVal('tableSign.withoutBlasting.small',  v)} />
              <SizeInput label="Medium" value={form.tableSign?.withoutBlasting?.medium ?? ''} onChange={v => setVal('tableSign.withoutBlasting.medium', v)} />
              <SizeInput label="Big"    value={form.tableSign?.withoutBlasting?.big    ?? ''} onChange={v => setVal('tableSign.withoutBlasting.big',    v)} />
            </div>
          </SubSection>
        </div>
      </SectionCard>

      {/* ── Picture Frame ────────────────────────────── */}
      <SectionCard title="Picture Frame Prices">
        <div className="grid grid-cols-2 gap-3">
          <SizeInput label='4.5×6 inches' value={form.pictureFrame?.['4.5x6'] ?? ''} onChange={v => setVal('pictureFrame.4.5x6', v)} />
          <SizeInput label='4×5 inches'   value={form.pictureFrame?.['4x5']   ?? ''} onChange={v => setVal('pictureFrame.4x5',   v)} />
        </div>
      </SectionCard>

      {/* ── Base ────────────────────────────────────── */}
      <SectionCard title="Gravestone Base Prices">
        <div className="grid grid-cols-2 gap-3">
          <SizeInput label="30×40 – 40×50 cm" value={form.base?.['30x40-40x50'] ?? ''} onChange={v => setVal('base.30x40-40x50', v)} />
          <SizeInput label="50×60 – 60×60 cm" value={form.base?.['50x60-60x60'] ?? ''} onChange={v => setVal('base.50x60-60x60', v)} />
        </div>
      </SectionCard>

      {/* ── Add-ons ─────────────────────────────────── */}
      <SectionCard title="Add-on Pricing">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SizeInput label="Additional Name (₱)" value={form.additionalName ?? ''} onChange={v => setVal('additionalName', v)} />
          <SizeInput label="Image Decal (₱)"     value={form.imageDecal     ?? ''} onChange={v => setVal('imageDecal',     v)} />
          <SizeInput label="Frame Decal (₱)"     value={form.frameDecal     ?? ''} onChange={v => setVal('frameDecal',     v)} />
          <SizeInput label="Rush Fee (₱)"         value={form.rushFee        ?? ''} onChange={v => setVal('rushFee',        v)} />
        </div>
      </SectionCard>

      <Button variant="solid" size="md" loading={isSaving}
        iconLeft={<Save className="size-4" />}
        onClick={() => onSave(form)}>
        Save All Pricing
      </Button>
    </div>
  )
}

// ── PaymentForm ────────────────────────────────────────────────────────────
function PaymentForm({ payment, onSave, onUploadQR, isSaving }) {
  const [form, setForm] = useState({ ...payment })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <SectionCard title="GCash">
        <Input label="GCash Number" value={form.gcashNumber ?? ''}
          onChange={e => set('gcashNumber', e.target.value)} />
        <div className="mt-3">
          <p className="text-sm font-medium text-brand-200 font-sans mb-2">GCash QR Code</p>
          {form.gcashQrUrl && (
            <img src={form.gcashQrUrl} alt="GCash QR"
              className="size-24 rounded-xl mb-2 border border-brand-700 bg-white p-1" />
          )}
          <FileUploader accept={{ 'image/*': ['.jpg', '.png', '.webp'] }}
            maxSize={5 * 1024 * 1024} label={null} hint="QR code image — max 5MB"
            onFiles={files => files[0] && onUploadQR(files[0], 'gcash')} />
        </div>
      </SectionCard>

      <SectionCard title="BPI">
        <Input label="Account Name" value={form.bpiAccount ?? ''}
          onChange={e => set('bpiAccount', e.target.value)} />
        <div className="mt-3">
          <p className="text-sm font-medium text-brand-200 font-sans mb-2">BPI QR Code</p>
          {form.bpiQrUrl && (
            <img src={form.bpiQrUrl} alt="BPI QR"
              className="size-24 rounded-xl mb-2 border border-brand-700 bg-white p-1" />
          )}
          <FileUploader accept={{ 'image/*': ['.jpg', '.png', '.webp'] }}
            maxSize={5 * 1024 * 1024} label={null} hint="QR code image — max 5MB"
            onFiles={files => files[0] && onUploadQR(files[0], 'bpi')} />
        </div>
      </SectionCard>

      <SectionCard title="Payment Policies">
        <Textarea label="Policies (one per line)"
          value={(form.policies ?? []).join('\n')}
          onChange={e => set('policies', e.target.value.split('\n'))}
          rows={5} hint="Each line becomes a separate policy bullet." />
      </SectionCard>

      <Button variant="solid" size="md" loading={isSaving}
        iconLeft={<Save className="size-4" />} onClick={() => onSave(form)}>
        Save Payment Settings
      </Button>
    </div>
  )
}

// ── BusinessForm ───────────────────────────────────────────────────────────
function BusinessForm({ business, onSave, isSaving }) {
  const [form, setForm] = useState({ ...business })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-4">
      <Input label="Business Name" value={form.name ?? ''} onChange={e => set('name', e.target.value)} />
      <Input label="Address"       value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
        <Input label="Email" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
      </div>
      <Button variant="solid" size="md" loading={isSaving}
        iconLeft={<Save className="size-4" />} onClick={() => onSave(form)}>
        Save Business Info
      </Button>
    </div>
  )
}

// ── UI Helpers ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-brand-900 border border-brand-800 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-brand-800 bg-brand-800/50">
        <h4 className="text-sm font-semibold font-display text-brand-100">{title}</h4>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function SubSection({ title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-accent-500" />
        <p className="text-xs font-semibold text-brand-300 font-sans">{title}</p>
      </div>
      {children}
    </div>
  )
}

function SizeInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-brand-800 border border-brand-700
                    rounded-xl px-4 py-3">
      <span className="text-sm text-brand-300 font-sans shrink-0 min-w-20">
        {label}:
      </span>
      <input
        type="number"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter price"
        className="flex-1 bg-transparent text-sm font-mono text-brand-100
                   outline-none placeholder:text-brand-600 min-w-0"
      />
    </div>
  )
}