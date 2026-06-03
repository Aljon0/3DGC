import Spinner from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { Image, Send, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export default function MessageInput({ onSend, onSendImage, isSending, disabled }) {
  const [text,         setText]         = useState("")
  const [pendingImage, setPendingImage] = useState(null)
  const textareaRef  = useRef(null)
  const fileInputRef = useRef(null)

  const handleSend = useCallback(() => {
    if (pendingImage) {
      onSendImage?.(pendingImage.file, text.trim())
      URL.revokeObjectURL(pendingImage.previewUrl)
      setPendingImage(null)
      setText("")
      return
    }
    const trimmed = text.trim()
    if (!trimmed || isSending) return
    onSend(trimmed)
    setText("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }, [text, isSending, onSend, onSendImage, pendingImage])

  const handleChange = (e) => {
    setText(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    const previewUrl = URL.createObjectURL(file)
    setPendingImage({ file, previewUrl })
    e.target.value = ""
  }

  const removePendingImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl)
    setPendingImage(null)
  }

  const canSend = (!pendingImage && text.trim().length > 0 && !isSending && !disabled)
               || (pendingImage && !isSending && !disabled)

  return (
    <div className="flex flex-col gap-0 p-3">

      {/* Pending image preview */}
      {pendingImage && (
        <div className="mb-2 relative inline-flex self-start">
          <img
            src={pendingImage.previewUrl}
            alt="Attachment preview"
            className="max-h-28 max-w-45 rounded-xl border border-brand-600
                       object-cover shadow-md"
          />
          <button
            onClick={removePendingImage}
            className="absolute -top-2 -right-2 size-5 rounded-full
                       bg-red-500 text-white flex items-center justify-center
                       hover:bg-red-400 transition-colors shadow-md"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || !!pendingImage}
          className={cn(
            "size-10 rounded-2xl flex items-center justify-center shrink-0",
            "transition-all duration-150 border",
            disabled || pendingImage
              ? "text-brand-700 border-brand-800 cursor-not-allowed"
              : "text-brand-400 border-brand-700 hover:text-accent-400 hover:border-accent-500/50 hover:bg-brand-800",
          )}
          aria-label="Attach image"
        >
          <Image className="size-4" />
        </button>

        <div className={cn(
          "flex-1 flex items-end gap-2",
          "bg-brand-800 border border-brand-700 rounded-2xl",
          "px-3.5 py-2.5",
          "focus-within:border-accent-500/60",
          "transition-colors duration-150",
        )}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={pendingImage ? "Add a caption (optional)..." : "Type a message..."}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 bg-transparent resize-none outline-none",
              "text-sm font-sans text-brand-100",
              "placeholder:text-brand-500",
              "leading-relaxed",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-5 max-h-30",
            )}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "size-10 rounded-2xl flex items-center justify-center shrink-0",
            "transition-all duration-150",
            canSend
              ? "bg-accent-500 text-white hover:bg-accent-400 shadow-glow"
              : "bg-brand-800 text-brand-600 border border-brand-700",
            "disabled:cursor-not-allowed",
          )}
          aria-label="Send message"
        >
          {isSending
            ? <Spinner size="xs" variant="white" />
            : <Send className="size-4" />
          }
        </button>
      </div>
    </div>
  )
}