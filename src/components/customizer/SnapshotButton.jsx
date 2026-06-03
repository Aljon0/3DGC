import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { captureCanvasSnapshot, cn, downloadImage } from "@/lib/utils";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { useThree } from "@react-three/fiber";
import { Camera, Download, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * SnapshotButton
 * Captures the current R3F canvas as a PNG.
 * Stores in Zustand and optionally triggers the Place Order modal.
 *
 * Must be rendered INSIDE a Canvas context (or use a portal approach).
 * For the toolbar (outside Canvas), use SnapshotTrigger instead.
 */

/**
 * SnapshotCapture — rendered inside R3F Canvas to access gl.domElement.
 * Exposes capture function via ref callback.
 */
export function SnapshotCapture({ onCapture }) {
  const { gl } = useThree();

  // Called from outside via a shared ref or callback
  const capture = useCallback(() => {
    const dataUrl = captureCanvasSnapshot(gl.domElement);
    if (dataUrl) onCapture(dataUrl);
    return dataUrl;
  }, [gl, onCapture]);

  // Expose the capture function to the parent on mount (and whenever it changes)
  useEffect(() => {
    onCapture(capture);
  }, [capture, onCapture]);

  return null;
}

/**
 * SnapshotButton — the UI button outside the Canvas.
 * Reads snapshot from store and triggers download or order modal.
 */
export default function SnapshotButton({
  onOrderClick, // callback to open PlaceOrderModal
  captureRef, // ref to the internal capture function
  className,
}) {
  const { snapshot, setSnapshot } = useCustomizerStore();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    // captureRef.current is set by handleCanvasCreated in the page
    if (!captureRef?.current || typeof captureRef.current !== 'function') {
      toast.error('Canvas not ready. Wait a moment and try again.')
      return
    }
    setIsCapturing(true)
    try {
      // Small delay to let the current frame finish rendering
      await new Promise(r => setTimeout(r, 150))
      let dataUrl = null
      try {
        dataUrl = captureRef.current()
      } catch (err) {
        console.error('[SnapshotButton] Capture error:', err)
        toast.error('Capture failed. Try again.')
        return
      }
      if (dataUrl && dataUrl.length > 100) {
        setSnapshot(dataUrl)
        toast.success('Design captured!')
      } else {
        toast.error('Capture returned empty. Try again.')
      }
    } finally {
      setIsCapturing(false)
    }
  }, [captureRef, setSnapshot])

  const handleDownload = () => {
    if (!snapshot) return;
    downloadImage(snapshot, `double-seven-design-${Date.now()}.png`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Capture button */}
      <Button
        variant="outline"
        size="sm"
        loading={isCapturing}
        iconLeft={<Camera className="size-4" />}
        onClick={handleCapture}
      >
        Capture
      </Button>

      {/* Download (only if snapshot exists) */}
      {snapshot && (
        <Tooltip content="Download PNG" position="top">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<Download className="size-4" />}
            onClick={handleDownload}
          >
            <span className="hidden sm:inline">Save</span>
          </Button>
        </Tooltip>
      )}

      {/* Place Order CTA */}
      <Button
        variant="solid"
        size="sm"
        iconLeft={<ShoppingCart className="size-4" />}
        onClick={() => {
          if (!snapshot) {
            toast.error("Please capture your design first.");
            return;
          }
          onOrderClick?.();
        }}
        className="bg-accent-500 hover:bg-accent-400"
      >
        Place Order
      </Button>
    </div>
  );
}