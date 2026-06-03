import Badge   from "@/components/ui/Badge";
import Button  from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { cn, formatDate, titleCase } from "@/lib/utils";
import {
  ChevronRight, Clock, LayoutTemplate, Shapes, Wand2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CatalogCard({ item, type, onSelect }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const isElement  = type === "element";
  const isTemplate = type === "template" || type === "recent";

  // ── Normalize field names ───────────────────────────────────────────────
  // Backend returns snake_case; recent designs from localStorage use camelCase.
  // Support both so the card works for all three item types.
  //
  const thumbnailUrl = item.thumbnail_url   // DB template
    ?? item.thumbnail                        // localStorage recent design
    ?? item.url                              // element asset
    ?? null;

  const stoneType = item.stone_type          // DB snake_case
    ?? item.stoneType                        // localStorage camelCase
    ?? null;

  const texture = item.texture ?? null;

  // Only show texture as text if it's NOT a URL (i.e. it's a named material)
  const textureLabel = texture && !texture.startsWith('http')
    ? `${texture} finish`
    : null;

  const createdAt = item.created_at ?? item.createdAt ?? null;

  // ── Stone type badge variant ────────────────────────────────────────────
  const stoneVariants = {
    gravestone:            'info',
    standardGravestone:    'info',
    blackGalaxyGravestone: 'default',
    urn:                   'accent',
    tableSign:             'warning',
    'table-sign':          'warning',
    pictureFrame:          'success',
    base:                  'default',
  };

  // ── Human-readable stone type label ────────────────────────────────────
  const stoneLabels = {
    gravestone:            'Gravestone',
    standardGravestone:    'Gravestone',
    blackGalaxyGravestone: 'Black Galaxy',
    urn:                   'Urn',
    tableSign:             'Table Sign',
    'table-sign':          'Table Sign',
    pictureFrame:          'Picture Frame',
    base:                  'Base',
  };
  const handleOpenCustomizer = () => {
    if (onSelect) {
      onSelect(item);
      return;
    }
  
    // Recent designs live only in localStorage — pass canvas state via
    // location.state so CustomizerPage doesn't try to fetch them from the API
    if (type === 'recent') {
      navigate('/customer/customize', {
        state: {
          recentDesign: {
            stoneType:  item.stoneType  ?? item.stone_type,
            texture:    item.texture    ?? null,
            dimensions: item.dimensions ?? null,
            decals:     item.decals     ?? [],
          },
        },
      });
      return;
    }
  
    // Templates have a real DB id — load via URL param as before
    navigate(`/customer/customize/${item.id}`);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'group flex flex-col rounded-2xl overflow-hidden',
        'bg-brand-900 border border-brand-800',
        'transition-all duration-200',
        'hover:border-brand-600 hover:shadow-panel hover:-translate-y-0.5',
        isElement && 'cursor-pointer',
      )}
    >
      {/* ── Thumbnail ───────────────────────────────────────────────────── */}
      <div className={cn(
        'relative overflow-hidden bg-brand-800',
        isElement ? 'aspect-square' : 'aspect-4/3',
      )}>

        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={item.name}
            className={cn(
              'w-full h-full object-contain transition-transform duration-300',
              hovered && 'scale-105',
            )}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isElement
              ? <Shapes        className="size-10 text-brand-700" />
              : <LayoutTemplate className="size-10 text-brand-700" />
            }
          </div>
        )}

        {/* Template hover overlay */}
        {isTemplate && (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center gap-2',
            'bg-brand-950/70 backdrop-blur-sm',
            'transition-opacity duration-200',
            hovered ? 'opacity-100' : 'opacity-0',
          )}>
            <Button variant="solid" size="sm"
              iconLeft={<Wand2 className="size-3.5" />}
              onClick={handleOpenCustomizer}>
              Customize
            </Button>
          </div>
        )}

        {/* Element hover overlay */}
        {isElement && (
          <div className={cn(
            'absolute inset-0 flex items-center justify-center gap-2',
            'bg-brand-950/60 backdrop-blur-sm',
            'transition-opacity duration-200',
            hovered ? 'opacity-100' : 'opacity-0',
          )}>
            <Tooltip content="Use in Customizer" position="bottom">
              <button
                onClick={() => onSelect?.(item)}
                className="size-8 flex items-center justify-center rounded-lg
                           bg-accent-500 text-white hover:bg-accent-400
                           transition-colors duration-150"
              >
                <Wand2 className="size-4" />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Stone type badge — top left */}
        {stoneType && !isElement && (
          <div className="absolute top-2 left-2">
            <Badge variant={stoneVariants[stoneType] ?? 'default'} size="sm">
              {stoneLabels[stoneType] ?? titleCase(stoneType)}
            </Badge>
          </div>
        )}

        {/* Category badge for elements */}
        {item.category && isElement && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" size="sm">
              {titleCase(item.category)}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Card body — templates and recent designs ─────────────────────── */}
      {!isElement && (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold font-sans text-brand-100 truncate">
              {item.name}
            </h3>
            {/* Only show texture label if it's a named material, not a URL */}
            {textureLabel && (
              <p className="text-xs text-brand-500 font-sans mt-0.5 capitalize">
                {textureLabel}
              </p>
            )}
            {/* If no texture label, show stone type as subtitle */}
            {!textureLabel && stoneType && (
              <p className="text-xs text-brand-500 font-sans mt-0.5">
                {stoneLabels[stoneType] ?? titleCase(stoneType)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {createdAt ? (
              <div className="flex items-center gap-1.5 text-xs text-brand-600 font-sans">
                <Clock className="size-3 shrink-0" />
                <span>{formatDate(createdAt)}</span>
              </div>
            ) : (
              <span />
            )}

            <button
              onClick={handleOpenCustomizer}
              className="flex items-center gap-1 text-xs font-medium font-sans
                         text-accent-400 hover:text-accent-300
                         transition-colors duration-150"
            >
              Customize
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Element name below thumbnail ─────────────────────────────────── */}
      {isElement && (
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-brand-300 font-sans truncate text-center">
            {item.name}
          </p>
        </div>
      )}
    </div>
  );
}