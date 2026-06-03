import Avatar from "@/components/ui/Avatar";
import Tooltip from "@/components/ui/Tooltip";
import { cn, formatDateTime } from "@/lib/utils";
import { X, ZoomIn } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

function ImageLightbox({ src, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 size-9 rounded-full
                   bg-white/10 hover:bg-white/20 text-white
                   flex items-center justify-center transition-colors"
        aria-label="Close image"
      >
        <X className="size-5" />
      </button>
      <img
        src={src}
        alt="Full size"
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl
                   shadow-2xl animate-scale-in"
      />
    </div>,
    document.body,
  );
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  senderName,
}) {
  const { text, image_url: imageUrl, created_at: createdAt, pending, failed } = message;
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isImageOnly = imageUrl && !text;
  const hasImage    = !!imageUrl;

  return (
    <>
      {lightboxOpen && imageUrl && (
        <ImageLightbox src={imageUrl} onClose={() => setLightboxOpen(false)} />
      )}

      <div
        className={cn(
          "flex items-end gap-2 max-w-[85%] animate-fade-in",
          isOwn ? "self-end flex-row-reverse" : "self-start",
        )}
      >
        <div className="shrink-0 w-7">
          {showAvatar && !isOwn ? <Avatar name={senderName} size="xs" /> : null}
        </div>

        <div
          className={cn(
            "flex flex-col gap-1",
            isOwn ? "items-end" : "items-start",
          )}
        >
          {showAvatar && !isOwn && (
            <p className="text-xs text-brand-500 font-sans px-1">
              {senderName}
            </p>
          )}

          <Tooltip
            content={formatDateTime(createdAt)}
            position={isOwn ? "left" : "right"}
            delay={800}
          >
            <div
              className={cn(
                "rounded-2xl overflow-hidden",
                "max-w-70",
                !isImageOnly &&
                  cn(
                    "px-3.5 py-2.5",
                    "text-sm font-sans leading-relaxed wrap-break-words",
                  ),
                isOwn &&
                  !pending &&
                  !failed &&
                  cn(
                    isImageOnly
                      ? "bg-accent-500/20 border border-accent-500/30"
                      : "bg-accent-500 text-white rounded-br-sm",
                  ),
                !isOwn &&
                  cn(
                    "bg-brand-800 border border-brand-700",
                    !isImageOnly && "text-brand-100 rounded-bl-sm",
                  ),
                pending && "opacity-60",
                failed && "bg-red-500/10 border-red-500/20 text-red-300",
              )}
            >
              {hasImage && (
                <div
                  className="relative group cursor-zoom-in"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={imageUrl}
                    alt="Shared image"
                    className={cn(
                      "block w-full object-cover",
                      isImageOnly ? "max-h-56" : "max-h-40 mb-2 rounded-xl",
                      pending && "opacity-70",
                    )}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center
                                bg-black/0 group-hover:bg-black/30
                                transition-colors duration-200 rounded-xl"
                  >
                    <ZoomIn
                      className="size-6 text-white opacity-0
                                     group-hover:opacity-100 transition-opacity duration-200"
                    />
                  </div>
                  {pending && (
                    <div
                      className="absolute inset-0 flex items-center justify-center
                                  bg-black/30 rounded-xl"
                    >
                      <div
                        className="size-5 border-2 border-white/60 border-t-white
                                    rounded-full animate-spin"
                      />
                    </div>
                  )}
                </div>
              )}

              {text && (
                <span className={cn(hasImage && "block px-3.5 pb-2.5 text-sm font-sans")}>
                  {text}
                </span>
              )}
            </div>
          </Tooltip>

          {isOwn && (pending || failed) && (
            <p
              className={cn(
                "text-xs font-sans px-1",
                pending ? "text-brand-600" : "text-red-400",
              )}
            >
              {pending ? "Sending..." : "Failed — tap to retry"}
            </p>
          )}
        </div>
      </div>
    </>
  );
}