import FileUploader from "@/components/shared/FileUploader";
import Button from "@/components/ui/Button";
import { uid } from "@/lib/utils";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { Image, Plus } from "lucide-react";
import { useState } from "react";

/**
 * ImageDecalUploader
 * Upload an image and place it as a decal on the stone.
 * Also handles element assets from the catalog.
 */
export default function ImageDecalUploader({ onClose, presetUrl = null }) {
  const { addDecal, setActiveTool } = useCustomizerStore();
  const [objectUrl, setObjectUrl] = useState(presetUrl);

  const handleFiles = (files) => {
    if (!files[0]) return;
    setObjectUrl(URL.createObjectURL(files[0]));
  };

  const handleAdd = () => {
    if (!objectUrl) return;

    addDecal({
      id: uid(),
      type: "image",
      url: objectUrl,
      position: [0, 0, 0.08],
      rotation: [0, 0, 0],
      scale: [0.3, 0.3, 0.3],
      flipped: { x: false, y: false },
    });

    setActiveTool("select");
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Image className="size-4 text-accent-400" />
        <h3 className="text-sm font-semibold font-sans text-brand-100">
          Add Image
        </h3>
      </div>

      {/* Upload zone */}
      {!presetUrl && (
        <FileUploader
          onFiles={handleFiles}
          accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp", ".svg"] }}
          maxSize={5 * 1024 * 1024}
          label={null}
          hint="JPG, PNG, WebP, SVG — max 5MB"
          preview={false}
        />
      )}

      {/* Preview */}
      {objectUrl && (
        <div
          className="rounded-xl bg-brand-800 border border-brand-700
                        flex items-center justify-center p-4 overflow-hidden"
        >
          <img
            src={objectUrl}
            alt="Decal preview"
            className="max-h-32 max-w-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="solid"
          size="sm"
          fullWidth
          disabled={!objectUrl}
          iconLeft={<Plus className="size-4" />}
          onClick={handleAdd}
        >
          Add to Stone
        </Button>
      </div>
    </div>
  );
}
