import Input from '@/components/ui/Input';
import { InlineSpinner } from '@/components/ui/Spinner';
import { cn, uid } from '@/lib/utils';
import designsService from '@/services/designs.service';
import { useCustomizerStore } from '@/store/useCustomizerStore';
import { Search, Shapes } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ElementsBrowser() {
  const { addDecal, setActiveTool } = useCustomizerStore();

  const [elements,  setElements]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('all');
  const [adding,    setAdding]    = useState(null);

  useEffect(() => {
    designsService
      .fetchElements()
      .then(({ elements }) => {
        // ── CRITICAL: exclude 'texture' category ──────────────────────────
        // Textures are stone surface materials — not placeable decals.
        // They belong in TextureSelector, not here.
        const decalElements = (elements ?? []).filter(
          e => e.category !== 'texture'
        );
        setElements(decalElements);
      })
      .catch(() => toast.error('Failed to load elements.'))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [
    'all',
    ...new Set(elements.map(e => e.category).filter(Boolean)),
  ];

  const filtered = elements
    .filter(e => category === 'all' || e.category === category)
    .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (element) => {
    setAdding(element.id);
    addDecal({
      id:       uid(),
      type:     'image',
      url:      element.url,
      position: [0, 0, 0.08],
      rotation: [0, 0, 0],
      scale:    [0.3, 0.3, 0.3],
      flipped:  { x: false, y: false },
    });
    toast.success(`"${element.name}" added to stone.`);
    setActiveTool('select');
    setAdding(null);
  };

  if (isLoading) return <InlineSpinner message="Loading elements..." />;

  return (
    <div className="flex flex-col gap-3 p-3">
      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search elements..."
        iconLeft={<Search className="size-3.5" />}
        size="sm"
      />

      {categories.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-sans font-medium',
                'transition-all duration-150 capitalize',
                category === cat
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                  : 'bg-brand-800 text-brand-400 border border-brand-700 hover:border-brand-500',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <div className="size-12 rounded-xl bg-brand-800 border border-brand-700
                          flex items-center justify-center">
            <Shapes className="size-6 text-brand-600" />
          </div>
          <p className="text-xs text-brand-500 font-sans">
            {search ? 'No elements match your search.' : 'No elements uploaded yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filtered.map(element => (
            <button
              key={element.id}
              onClick={() => handleSelect(element)}
              disabled={adding === element.id}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2 rounded-xl',
                'bg-brand-800/60 border border-brand-700',
                'hover:border-accent-500/40 hover:bg-brand-800',
                'transition-all duration-150 group',
                adding === element.id && 'opacity-60 cursor-not-allowed',
              )}
              title={element.name}
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden
                              bg-brand-700 flex items-center justify-center relative">
                {element.url ? (
                  <img
                    src={element.url}
                    alt={element.name}
                    className="w-full h-full object-contain p-1
                               group-hover:scale-110 transition-transform duration-200"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Shapes className="size-6 text-brand-600" />
                )}
                {adding === element.id && (
                  <div className="absolute inset-0 flex items-center justify-center
                                  bg-brand-900/60 rounded-lg">
                    <div className="size-4 border-2 border-accent-500 border-t-transparent
                                    rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <p className="text-xs font-sans text-brand-400 truncate w-full text-center
                             group-hover:text-brand-200 transition-colors duration-150">
                {element.name}
              </p>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-brand-600 font-sans text-center pb-1">
        Click any element to add it to your stone
      </p>
    </div>
  );
}