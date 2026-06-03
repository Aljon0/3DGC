import { cn, formatFileSize, isImageFile } from "@/lib/utils";
import { CheckCircle, File, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

/**
 * FileUploader — drag-and-drop file input with preview.
 * Supports single or multiple files, image preview, type validation.
 *
 * @example
 * <FileUploader
 *   accept={{ 'image/*': ['.jpg', '.png', '.webp'] }}
 *   onFiles={(files) => handleUpload(files[0])}
 *   maxSize={5 * 1024 * 1024}
 *   label="Upload Payment Proof"
 * />
 */
export default function FileUploader({
  onFiles,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  label = "Upload File",
  hint,
  preview = true, // show image preview
  className,
  disabled = false,
}) {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback(
    (accepted, rejected) => {
      setErrors([]);

      if (rejected.length > 0) {
        const msgs = rejected.flatMap((r) => r.errors.map((e) => e.message));
        setErrors([...new Set(msgs)]);
        return;
      }

      const next = multiple ? accepted : [accepted[0]].filter(Boolean);
      setFiles(next);
      onFiles?.(next);
    },
    [multiple, onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled,
  });

  const removeFile = (i) => {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    onFiles?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Label */}
      {label && (
        <p className="text-sm font-medium text-brand-200 font-sans">{label}</p>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3",
          "border-2 border-dashed rounded-xl p-6",
          "cursor-pointer transition-all duration-200",
          "text-center",

          isDragActive
            ? "border-accent-500 bg-accent-500/5"
            : "border-brand-700 hover:border-brand-500 bg-brand-800/50 hover:bg-brand-800",

          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        )}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <div
          className={cn(
            "size-11 rounded-xl flex items-center justify-center",
            "bg-brand-800 border border-brand-700",
            isDragActive ? "text-accent-400" : "text-brand-500",
            "transition-colors duration-200",
          )}
        >
          <Upload className="size-5" />
        </div>

        {/* Text */}
        <div>
          <p className="text-sm font-medium text-brand-200 font-sans">
            {isDragActive ? (
              "Drop files here..."
            ) : (
              <>
                <span className="text-accent-400">Click to upload</span> or drag
                & drop
              </>
            )}
          </p>
          {hint && (
            <p className="text-xs text-brand-500 mt-1 font-sans">{hint}</p>
          )}
          <p className="text-xs text-brand-600 mt-1 font-sans">
            Max {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-400 font-sans">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* File list / Previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => {
            const isImg = isImageFile(file);
            const objUrl = isImg && preview ? URL.createObjectURL(file) : null;

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl
                           bg-brand-800 border border-brand-700"
              >
                {/* Preview or icon */}
                {objUrl ? (
                  <img
                    src={objUrl}
                    alt={file.name}
                    className="size-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="size-10 rounded-lg bg-brand-700 flex items-center
                                  justify-center shrink-0 text-brand-400"
                  >
                    <File className="size-5" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-100 font-sans truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-brand-500 font-sans">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Success icon */}
                <CheckCircle className="size-4 text-emerald-400 shrink-0" />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="size-6 flex items-center justify-center rounded-md
                             text-brand-500 hover:text-red-400 hover:bg-red-500/10
                             transition-colors duration-150 shrink-0"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
