import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tooltip — hover/focus triggered popover label.
 * Positions: top, bottom, left, right
 */
export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 400,
  className,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const show = useCallback(() => {
    if (disabled || !content) return;
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [disabled, content, delay]);

  const hide = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const positions = {
    top: "-top-2 left-1/2 -translate-x-1/2 -translate-y-full",
    bottom: "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full",
    left: "top-1/2 -left-2 -translate-x-full -translate-y-1/2",
    right: "top-1/2 -right-2 translate-x-full -translate-y-1/2",
  };

  const arrows = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-brand-700",
    bottom:
      "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-brand-700",
    left: "right-0 top-1/2 translate-x-full -translate-y-1/2 border-l-brand-700",
    right:
      "left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-brand-700",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && content && (
        <div
          className={cn(
            "absolute z-50 pointer-events-none",
            "animate-scale-in",
            positions[position],
            className,
          )}
        >
          {/* Arrow */}
          <span
            className={cn(
              "absolute border-4 border-transparent",
              arrows[position],
            )}
          />

          {/* Content */}
          <div
            className={cn(
              "bg-brand-700 border border-brand-600",
              "text-brand-100 text-xs font-sans font-medium",
              "px-2.5 py-1.5 rounded-lg whitespace-nowrap",
              "shadow-float max-w-60",
            )}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
