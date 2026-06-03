import CustomizerToolbar    from "@/components/customizer/CustomizerToolbar";
import DimensionsPanel      from "@/components/customizer/DimensionsPanel";
import ElementsBrowser      from "@/components/customizer/ElementsBrowser";
import FrameDecalPicker     from "@/components/customizer/FrameDecalPicker";
import ImageDecalUploader   from "@/components/customizer/ImageDecalUploader";
import SnapshotButton       from "@/components/customizer/SnapshotButton";
import TextDecalEditor      from "@/components/customizer/TextDecalEditor";
import TextureSelector      from "@/components/customizer/TextureSelector";
import ThreeCanvas          from "@/components/customizer/ThreeCanvas";
import TransformControls    from "@/components/customizer/TransformControls";
import PlaceOrderModal      from "@/components/orders/PlaceOrderModal";
import { InlineSpinner }    from "@/components/ui/Spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn }               from "@/lib/utils";
import designsService       from "@/services/designs.service";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { useUIStore }       from "@/store/useUIStore";
import { Shapes, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import toast                from "react-hot-toast";

export default function CustomizerPage() {
  const { setPageTitle, customizerPanelOpen, toggleCustomizerPanel } = useUIStore();
  const {
    activeTool, setActiveTool, resetCanvas,
    setStoneType, setTexture, setDimensions, addDecal,
  } = useCustomizerStore();

  const { templateId } = useParams();
  const location       = useLocation();

  const [orderModalOpen,  setOrderModalOpen]  = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const captureRef = useRef(null);

  useEffect(() => {
    setPageTitle('3D Customizer');
    return () => resetCanvas();
  }, [setPageTitle, resetCanvas]);

  const handleCanvasCreated = useCallback(({ gl }) => {
    captureRef.current = () => gl.domElement.toDataURL('image/png', 0.92);
  }, []);

  // ── Load template from URL param ───────────────────────────────────────
  useEffect(() => {
    if (!templateId) return;

    const loadTemplate = async () => {
      setTemplateLoading(true);
      try {
        const { template } = await designsService.fetchTemplate(templateId);
        if (template.stone_type) setStoneType(template.stone_type);
        if (template.texture)    setTexture(template.texture);
        if (template.dimensions) setDimensions(template.dimensions);
        if (template.decals?.length > 0) {
          template.decals.forEach(decal => addDecal(decal));
        }
        toast.success(`Template "${template.name}" loaded.`);
      } catch (err) {
        console.error('[CustomizerPage] Failed to load template:', err);
        toast.error('Could not load template. Starting fresh.');
      } finally {
        setTemplateLoading(false);
      }
    };

    loadTemplate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // ── Load preset element from catalog ──────────────────────────────────
  useEffect(() => {
    const presetElement = location.state?.presetElement;
    if (!presetElement) return;
    addDecal({
      id:       `preset_${Date.now()}`,
      type:     'image',
      url:      presetElement.url,
      position: [0, 0, 0.08],
      rotation: [0, 0, 0],
      scale:    [0.3, 0.3, 0.3],
      flipped:  { x: false, y: false },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderToolPanel = () => {
    if (activeTool === 'text')  return <TextDecalEditor    onClose={() => setActiveTool('select')} />;
    if (activeTool === 'image') return <ImageDecalUploader onClose={() => setActiveTool('select')} />;
    if (activeTool === 'frame') return <FrameDecalPicker   onClose={() => setActiveTool('select')} />;
    return null;
  };
  const activeToolPanel = renderToolPanel();

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <InlineSpinner message="Loading template..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-4 md:-m-6 overflow-hidden">
      <CustomizerToolbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Canvas */}
        <div className="flex-1 relative min-w-0">
          <ThreeCanvas className="w-full h-full" onCreated={handleCanvasCreated} />

          {/* Bottom actions — only Place Order / Capture */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                          flex items-center gap-2 z-10">
            <SnapshotButton
              captureRef={captureRef}
              onOrderClick={() => setOrderModalOpen(true)}
            />
          </div>

          {/* Mobile toggle */}
          <button
            onClick={toggleCustomizerPanel}
            className="absolute top-3 right-3 z-10 lg:hidden
                       flex items-center gap-2 px-3 py-2 rounded-xl
                       bg-brand-900/90 backdrop-blur-sm border border-brand-700
                       text-sm font-sans text-brand-200
                       hover:border-brand-500 transition-colors"
          >
            <SlidersHorizontal className="size-4" />
            Tools
          </button>
        </div>

        {/* Right panel — desktop */}
        <div className={cn(
          'hidden lg:flex lg:flex-col',
          'w-72 xl:w-80 shrink-0',
          'bg-brand-900 border-l border-brand-800',
          'overflow-y-auto',
        )}>
          <RightPanel activeToolPanel={activeToolPanel} />
        </div>

        {/* Right panel — mobile */}
        {customizerPanelOpen && (
          <div className="lg:hidden fixed inset-y-0 right-0 z-40 w-80
                          bg-brand-900 border-l border-brand-800
                          overflow-y-auto shadow-float animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-800">
              <p className="text-sm font-semibold font-sans text-brand-100">Design Tools</p>
              <button onClick={toggleCustomizerPanel}
                className="size-7 flex items-center justify-center rounded-lg
                           text-brand-500 hover:text-brand-200 hover:bg-brand-800">
                <X className="size-4" />
              </button>
            </div>
            <RightPanel activeToolPanel={activeToolPanel} />
          </div>
        )}
      </div>

      <PlaceOrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onSuccess={() => setOrderModalOpen(false)}
      />
    </div>
  );
}

function RightPanel({ activeToolPanel }) {
  return (
    <Tabs defaultValue="texture" className="h-full flex flex-col">
      <TabsList className="px-2 pt-2 shrink-0 border-b border-brand-800 w-full">
        <TabsTrigger value="texture"    className="flex-1 text-xs">Texture</TabsTrigger>
        <TabsTrigger value="dimensions" className="flex-1 text-xs">Size</TabsTrigger>
        <TabsTrigger value="elements"
          icon={<Shapes className="size-3" />}
          className="flex-1 text-xs">
          Elements
        </TabsTrigger>
        <TabsTrigger value="transform"  className="flex-1 text-xs">Transform</TabsTrigger>
      </TabsList>
      <div className="flex-1 overflow-y-auto">
        {activeToolPanel ? (
          <div className="animate-fade-in">{activeToolPanel}</div>
        ) : (
          <>
            <TabsContent value="texture"><TextureSelector /></TabsContent>
            <TabsContent value="dimensions"><DimensionsPanel /></TabsContent>
            <TabsContent value="elements"><ElementsBrowser /></TabsContent>
            <TabsContent value="transform"><TransformControls /></TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
}