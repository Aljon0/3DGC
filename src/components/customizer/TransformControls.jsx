import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import {
  FlipHorizontal2,
  FlipVertical2,
  Lock,
  Move,
  RotateCw,
  Trash2,
  Unlock,
  ZoomIn,
  ZoomOut,
  MousePointer2,
} from "lucide-react";

export default function TransformControls() {
  const {
    selectedDecal,
    updateDecal,
    removeDecal,
    flipDecal,
    toggleDecalLock,
    clearSelection,
    canvas,
  } = useCustomizerStore();

  const decal       = selectedDecal();
  const decalCount  = canvas?.decals?.length ?? 0;

  // ── No decal selected ─────────────────────────────────────────────────
  if (!decal) {
    return (
      <div className="flex flex-col gap-3 p-4">

        {/* Instruction */}
        <div className="flex flex-col items-center justify-center gap-3
                        py-6 text-center">
          <div className="size-10 rounded-xl bg-brand-800 border border-brand-700
                          flex items-center justify-center">
            <MousePointer2 className="size-5 text-brand-500" />
          </div>
          <p className="text-xs text-brand-500 font-sans leading-relaxed max-w-40">
            Click any text or image on the stone to select it
          </p>
        </div>

        {/* All decals list — quick remove without selecting in 3D */}
        {decalCount > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-400 font-sans
                          uppercase tracking-wider">
              All Elements ({decalCount})
            </p>
            {canvas.decals.map((d, i) => (
              <div
                key={d.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl
                           bg-brand-800 border border-brand-700"
              >
                {/* Type badge */}
                <span className="text-xs px-1.5 py-0.5 rounded-md
                                 bg-brand-700 text-brand-400 font-sans capitalize shrink-0">
                  {d.type}
                </span>

                {/* Label */}
                <span className="text-xs text-brand-300 font-sans truncate flex-1">
                  {d.type === "text" ? `"${d.text}"` : `${d.type} ${i + 1}`}
                </span>

                {/* Quick remove button */}
                <Tooltip content="Remove" position="left">
                  <button
                    onClick={() => removeDecal(d.id)}
                    className="size-6 flex items-center justify-center rounded-md
                               text-brand-500 hover:text-red-400 hover:bg-red-500/10
                               transition-colors duration-150 shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Scale handlers ─────────────────────────────────────────────────────
  const scaleBy = (factor) => {
    const [sx, sy, sz] = decal.scale ?? [0.25, 0.25, 0.25];
    updateDecal(decal.id, {
      scale: [
        Math.max(0.05, Math.min(1.5, sx * factor)),
        Math.max(0.05, Math.min(1.5, sy * factor)),
        sz,
      ],
    });
  };

  const rotateBy = (radians) => {
    const [rx, ry, rz] = decal.rotation ?? [0, 0, 0];
    updateDecal(decal.id, { rotation: [rx, ry, rz + radians] });
  };

  const STEP_ROTATE = Math.PI / 12;

  const actions = [
    {
      label: "Scale Up",
      icon: <ZoomIn className="size-4" />,
      onClick: () => scaleBy(1.15),
      disabled: decal.locked,
    },
    {
      label: "Scale Down",
      icon: <ZoomOut className="size-4" />,
      onClick: () => scaleBy(0.87),
      disabled: decal.locked,
    },
    {
      label: "Rotate CW",
      icon: <RotateCw className="size-4" />,
      onClick: () => rotateBy(-STEP_ROTATE),
      disabled: decal.locked,
    },
    {
      label: "Rotate CCW",
      icon: <RotateCw className="size-4 -scale-x-100" />,
      onClick: () => rotateBy(STEP_ROTATE),
      disabled: decal.locked,
    },
    {
      label: "Flip Horizontal",
      icon: <FlipHorizontal2 className="size-4" />,
      onClick: () => flipDecal(decal.id, "x"),
      disabled: decal.locked,
    },
    {
      label: "Flip Vertical",
      icon: <FlipVertical2 className="size-4" />,
      onClick: () => flipDecal(decal.id, "y"),
      disabled: decal.locked,
    },
  ];

  return (
    <div className="flex flex-col gap-3 p-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Move className="size-4 text-accent-400" />
          <h3 className="text-sm font-semibold font-sans text-brand-100">
            Transform
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Decal type badge */}
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-800
                           border border-brand-700 text-brand-400 font-sans capitalize">
            {decal.type}
          </span>
          {/* Deselect */}
          <Tooltip content="Deselect" position="left">
            <button
              onClick={clearSelection}
              className="size-5 flex items-center justify-center rounded
                         text-brand-500 hover:text-brand-200
                         transition-colors duration-150 text-xs font-mono"
            >
              ✕
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Selected decal preview */}
      {decal.type === "text" && (
        <p className="text-xs text-brand-400 font-sans bg-brand-800 rounded-lg
                      px-3 py-2 border border-brand-700 truncate">
          "{decal.text}"
        </p>
      )}

      {/* Transform grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {actions.map((action) => (
          <Tooltip key={action.label} content={action.label} position="top">
            <button
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2.5 rounded-xl",
                "border border-brand-700 bg-brand-800/60",
                "text-brand-400 transition-all duration-150",
                !action.disabled
                  ? "hover:text-brand-100 hover:border-brand-500 hover:bg-brand-800"
                  : "opacity-40 cursor-not-allowed",
              )}
            >
              {action.icon}
              <span className="text-xs font-sans leading-tight text-center">
                {action.label.split(" ")[0]}
              </span>
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Lock / Delete */}
      <div className="flex gap-2 pt-1 border-t border-brand-800">
        <Button
          variant={decal.locked ? "accent" : "ghost"}
          size="sm"
          fullWidth
          iconLeft={
            decal.locked
              ? <Lock   className="size-3.5" />
              : <Unlock className="size-3.5" />
          }
          onClick={() => toggleDecalLock(decal.id)}
        >
          {decal.locked ? "Locked" : "Lock"}
        </Button>

        <Button
          variant="danger"
          size="sm"
          fullWidth
          iconLeft={<Trash2 className="size-3.5" />}
          onClick={() => {
            removeDecal(decal.id);
            clearSelection();
          }}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}