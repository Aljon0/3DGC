import { useState }       from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { useOrders }      from '@/hooks/useOrders';
import FileUploader       from '@/components/shared/FileUploader';
import Button             from '@/components/ui/Button';

export default function PaymentProofUploader({ order }) {
  const { uploadPaymentProof, isLoading } = useOrders();
  const [pendingFile, setPendingFile]     = useState(null);

  // Normalize field name — DB returns snake_case
  const paymentProofUrl = order.payment_proof_url ?? order.paymentProofUrl ?? null;

  const handleSubmit = async () => {
    if (!pendingFile) return;
    await uploadPaymentProof(order.id, pendingFile);
    setPendingFile(null);
  };

  // Already uploaded
  if (paymentProofUrl) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl
                        bg-emerald-500/5 border border-emerald-500/20">
          <CheckCircle className="size-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-300 font-sans">
              Payment proof submitted
            </p>
            <p className="text-xs text-brand-400 font-sans mt-0.5">
              Awaiting admin confirmation
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<ExternalLink className="size-3.5" />}
            onClick={() => window.open(paymentProofUrl, '_blank')}
          >
            View
          </Button>
        </div>

        {/* Allow re-upload if needed */}
        <p className="text-xs text-brand-500 font-sans text-center">
          Need to replace? Upload a new file below.
        </p>
        <FileUploader
          onFiles={files => setPendingFile(files[0] ?? null)}
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
          maxSize={5 * 1024 * 1024}
          label={null}
          hint="Replace payment proof — max 5MB"
          preview
        />
        {pendingFile && (
          <Button variant="solid" size="sm" fullWidth
            loading={isLoading} onClick={handleSubmit}>
            Replace Payment Proof
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-brand-400 font-sans">
        Upload your GCash or BPI transfer screenshot as proof of payment.
      </p>
      <FileUploader
        onFiles={files => setPendingFile(files[0] ?? null)}
        accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
        maxSize={5 * 1024 * 1024}
        label={null}
        hint="Screenshot of GCash or BPI transfer — max 5MB"
        preview
      />
      {pendingFile && (
        <Button variant="solid" size="sm" fullWidth
          loading={isLoading} onClick={handleSubmit}>
          Submit Payment Proof
        </Button>
      )}
    </div>
  );
}