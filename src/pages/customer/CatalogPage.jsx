import CatalogTabs from "@/components/catalog/CatalogTabs";
import designsService from "@/services/designs.service";
import { useUIStore } from "@/store/useUIStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CatalogPage() {
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();

  const [templates, setTemplates] = useState([]);
  const [elements, setElements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPageTitle("Catalog");
  }, [setPageTitle]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [tRes, eRes] = await Promise.all([
          designsService.fetchTemplates(),
          designsService.fetchElements(),
        ]);
        setTemplates(tRes.templates ?? []);

        // Exclude textures — they are stone surface materials, not placeable elements.
        // Textures only appear in the 3D customizer's Texture panel.
        setElements(
          (eRes.elements ?? []).filter((el) => el.category !== "texture"),
        );
      } catch {
        toast.error("Failed to load catalog.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSelectTemplate = (template) => {
    navigate(`/customer/customize/${template.id}`);
  };

  const handleSelectElement = (element) => {
    toast.success(`"${element.name}" ready — opening customizer.`);
    navigate("/customer/customize", { state: { presetElement: element } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-50">
          Design Catalog
        </h2>
        <p className="text-sm text-brand-400 font-sans mt-1">
          Browse templates and elements to start your custom monument design.
        </p>
      </div>

      <CatalogTabs
        templates={templates}
        elements={elements}
        isLoading={isLoading}
        onSelectTemplate={handleSelectTemplate}
        onSelectElement={handleSelectElement}
      />
    </div>
  );
}
