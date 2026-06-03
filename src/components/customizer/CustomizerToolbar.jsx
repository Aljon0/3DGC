import { SelectDropdown } from "@/components/ui/Dropdown";
import Tooltip from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import {
  Frame,
  Image,
  Layers,
  Lock,
  MousePointer2,
  Redo2,
  RotateCcw,
  Type,
  Undo2,
  Unlock,
} from "lucide-react";

// ── Stone type options ─────────────────────────────────────────────────────
const STONE_TYPES = [
  { value: "gravestone", label: "Gravestone" },
  { value: "urn", label: "Urn" },
  { value: "table-sign", label: "Table Sign" },
  { value: "base", label: "Base" },
];

// ── Tool definitions ───────────────────────────────────────────────────────
const TOOLS = [
  { id: "select", label: "Select", icon: <MousePointer2 className="size-4" /> },
  { id: "text", label: "Add Text", icon: <Type className="size-4" /> },
  { id: "image", label: "Add Image", icon: <Image className="size-4" /> },
  { id: "frame", label: "Add Frame", icon: <Frame className="size-4" /> },
];

/**
 * CustomizerToolbar
 * Top toolbar for the 3D workspace.
 * Contains: stone type picker, tool buttons, undo/redo, rotation lock, reset.
 */
export default function CustomizerToolbar({ onToolSelect }) {
  const {
    canvas: { stoneType, isRotationLocked },
    activeTool,
    canUndo,
    canRedo,
    setStoneType,
    setActiveTool,
    toggleRotationLock,
    resetCanvas,
    undo,
    redo,
  } = useCustomizerStore();

  const handleTool = (toolId) => {
    setActiveTool(toolId);
    onToolSelect?.(toolId);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-wrap",
        "px-3 py-2.5",
        "bg-brand-900 border-b border-brand-800",
      )}
    >
      {/* ── Stone Type Selector ──────────────────────── */}
      <div className="flex items-center gap-2">
        <Layers className="size-4 text-brand-500 shrink-0" />
        <SelectDropdown
          value={stoneType}
          onChange={setStoneType}
          options={STONE_TYPES}
          size="sm"
          className="w-36"
        />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-brand-700 mx-1" />

      {/* ── Tool Buttons ─────────────────────────────── */}
      <div className="flex items-center gap-1">
        {TOOLS.map((tool) => (
          <Tooltip key={tool.id} content={tool.label} position="bottom">
            <button
              onClick={() => handleTool(tool.id)}
              className={cn(
                "flex items-center justify-center size-8 rounded-lg",
                "transition-all duration-150 font-sans text-sm",
                activeTool === tool.id
                  ? "bg-accent-500/20 text-accent-400 border border-accent-500/30"
                  : "text-brand-400 hover:text-brand-100 hover:bg-brand-800 border border-transparent",
              )}
              aria-label={tool.label}
              aria-pressed={activeTool === tool.id}
            >
              {tool.icon}
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-brand-700 mx-1" />

      {/* ── Undo / Redo ──────────────────────────────── */}
      <div className="flex items-center gap-1">
        <Tooltip content="Undo (Ctrl+Z)" position="bottom">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className={cn(
              "flex items-center justify-center size-8 rounded-lg",
              "transition-colors duration-150",
              "border border-transparent",
              canUndo()
                ? "text-brand-400 hover:text-brand-100 hover:bg-brand-800"
                : "text-brand-700 cursor-not-allowed",
            )}
            aria-label="Undo"
          >
            <Undo2 className="size-4" />
          </button>
        </Tooltip>

        <Tooltip content="Redo (Ctrl+Y)" position="bottom">
          <button
            onClick={redo}
            disabled={!canRedo()}
            className={cn(
              "flex items-center justify-center size-8 rounded-lg",
              "transition-colors duration-150",
              "border border-transparent",
              canRedo()
                ? "text-brand-400 hover:text-brand-100 hover:bg-brand-800"
                : "text-brand-700 cursor-not-allowed",
            )}
            aria-label="Redo"
          >
            <Redo2 className="size-4" />
          </button>
        </Tooltip>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-brand-700 mx-1" />

      {/* ── Rotation Lock ─────────────────────────────── */}
      <Tooltip
        content={isRotationLocked ? "Unlock Rotation" : "Lock Rotation"}
        position="bottom"
      >
        <button
          onClick={toggleRotationLock}
          className={cn(
            "flex items-center justify-center size-8 rounded-lg",
            "transition-all duration-150 border",
            isRotationLocked
              ? "bg-accent-500/10 text-accent-400 border-accent-500/30"
              : "text-brand-400 hover:text-brand-100 hover:bg-brand-800 border-transparent",
          )}
          aria-label={isRotationLocked ? "Unlock rotation" : "Lock rotation"}
          aria-pressed={isRotationLocked}
        >
          {isRotationLocked ? (
            <Lock className="size-4" />
          ) : (
            <Unlock className="size-4" />
          )}
        </button>
      </Tooltip>

      {/* ── Reset Canvas ──────────────────────────────── */}
      <Tooltip content="Reset Canvas" position="bottom">
        <button
          onClick={resetCanvas}
          className="flex items-center justify-center size-8 rounded-lg
                       text-brand-500 hover:text-red-400 hover:bg-red-500/10
                       transition-colors duration-150 border border-transparent ml-auto"
          aria-label="Reset canvas"
        >
          <RotateCcw className="size-4" />
        </button>
      </Tooltip>
    </div>
  );
}
