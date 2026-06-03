import { InlineSpinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import designsService from "@/services/designs.service";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

export default function TextureSelector() {
  const {
    canvas: { texture, stoneType },
    setTexture,
  } = useCustomizerStore();

  const [textures, setTextures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // No synchronous setState here — just kick off the async work
    designsService
      .fetchElements({ category: "texture", stoneType })
      .then(({ elements }) => {
        if (cancelled) return;
        setIsLoading(false);
        setTextures(
          (elements ?? []).map((el) => ({
            id: el.url,
            label: el.name,
            url: el.url,
            dbId: el.id,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stoneType]);

  if (isLoading) return <InlineSpinner message="Loading textures..." />;

  if (textures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 p-4 text-center">
        <div
          className="size-12 rounded-xl bg-brand-800 border border-brand-700
                        flex items-center justify-center"
        >
          <span className="text-2xl">🪨</span>
        </div>
        <p className="text-xs text-brand-500 font-sans">
          No textures for this stone type yet.
        </p>
        <p className="text-xs text-brand-600 font-sans">
          Admin can upload textures from the Designs page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <h3 className="text-sm font-semibold font-sans text-brand-100">
        Stone Texture
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {textures.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              console.log("[TextureSelector] Setting texture:", t.url);
              setTexture(t.url); // ← explicitly pass t.url not t.id
            }}
            className={cn(
              "flex flex-col gap-2 p-2.5 rounded-xl border transition-all duration-150 text-left group",
              texture === t.url
                ? "border-accent-500/60 bg-accent-500/5"
                : "border-brand-700 hover:border-brand-500 bg-brand-800/50",
            )}
          >
            <div className="w-full h-12 rounded-lg relative overflow-hidden bg-brand-700">
              <img
                src={t.url}
                alt={t.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              {texture === t.url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="size-6 rounded-full bg-accent-500 flex items-center justify-center">
                    <Check className="size-3.5 text-white" />
                  </div>
                </div>
              )}
            </div>
            <p
              className={cn(
                "text-xs font-semibold font-sans leading-tight",
                texture === t.url ? "text-accent-400" : "text-brand-200",
              )}
            >
              {t.label}
            </p>
          </button>
        ))}
      </div>

      <p className="text-xs text-brand-600 font-sans text-center">
        Select a texture to wrap the stone surface
      </p>
    </div>
  );
}
