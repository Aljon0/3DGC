import CustomizerToolbar    from "@/components/customizer/CustomizerToolbar";
import DimensionsPanel      from "@/components/customizer/DimensionsPanel";
import ElementsBrowser      from "@/components/customizer/ElementsBrowser";
import FrameDecalPicker     from "@/components/customizer/FrameDecalPicker";
import ImageDecalUploader   from "@/components/customizer/ImageDecalUploader";
import TextDecalEditor      from "@/components/customizer/TextDecalEditor";
import TextureSelector      from "@/components/customizer/TextureSelector";
import ThreeCanvas          from "@/components/customizer/ThreeCanvas";
import TransformControls    from "@/components/customizer/TransformControls";
import Modal                from "@/components/shared/Modal";
import Button               from "@/components/ui/Button";
import Input                from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import designsService       from "@/services/designs.service";
import { useCustomizerStore } from "@/store/useCustomizerStore";
import { useUIStore }       from "@/store/useUIStore";
import { Save, Shapes, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast                from "react-hot-toast";

// ── Convert base64 dataURL to Blob ─────────────────────────────────────────
// The canvas gives us a base64 PNG string.
// The backend expects a file Blob for multipart/form-data upload.
//
function dataURLtoBlob(dataURL) {
  const [header, base64] = dataURL.split(',');
  const mime   = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const arr    = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

export default function AdminCustomizerPage() {
  const { setPageTitle, customizerPanelOpen, toggleCustomizerPanel } = useUIStore();
  const { canvas, activeTool, setActiveTool, resetCanvas } = useCustomizerStore();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [templateName,  setTemplateName]  = useState('');
  const [isSaving,      setIsSaving]      = useState(false);

  // captureRef holds the function that calls gl.domElement.toDataURL()
  // It's set by handleCanvasCreated when the Three.js canvas is ready
  const captureRef = useRef(null);

  useEffect(() => {
    setPageTitle('Admin Customizer');
    return () => resetCanvas();
  }, [setPageTitle, resetCanvas]);

  const handleCanvasCreated = useCallback(({ gl }) => {
    captureRef.current = () => gl.domElement.toDataURL('image/png', 0.92);
  }, []);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    setIsSaving(true);

    try {
      // 1. Capture the current 3D scene as a PNG dataURL
      let thumbnailBlob = null;
      if (captureRef.current && typeof captureRef.current === 'function') {
        try {
          // Small delay to ensure the current frame is fully rendered
          await new Promise(r => setTimeout(r, 150));
          const dataURL = captureRef.current();
          if (dataURL && dataURL.length > 100) {
            thumbnailBlob = dataURLtoBlob(dataURL);
          }
        } catch (err) {
          console.warn('[AdminCustomizer] Snapshot capture failed:', err);
          // Continue saving without thumbnail — not a fatal error
        }
      }

      // 2. Build the template data from current canvas state
      const templateData = {
        name:        templateName.trim(),
        stoneType:   canvas.stoneType,
        texture:     canvas.texture   ?? null,
        decals:      canvas.decals    ?? [],
        dimensions:  canvas.dimensions ?? null,
        isPublished: false,   // always save as draft — publish from Designs page
      };

      // 3. Save template — passes blob for multipart upload
      const { template } = await designsService.saveTemplate(
        templateData,
        thumbnailBlob    // Blob | null
      );

      toast.success(`Template "${template.name}" saved as draft.`);
      setSaveModalOpen(false);
      setTemplateName('');
    } catch (err) {
      console.error('[AdminCustomizer] Save template error:', err);
      toast.error(err.message ?? 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderToolPanel = () => {
    if (activeTool === 'text')  return <TextDecalEditor    onClose={() => setActiveTool('select')} />;
    if (activeTool === 'image') return <ImageDecalUploader onClose={() => setActiveTool('select')} />;
    if (activeTool === 'frame') return <FrameDecalPicker   onClose={() => setActiveTool('select')} />;
    return null;
  };

  const activeToolPanel = renderToolPanel();

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-4 md:-m-6 overflow-hidden">
      <CustomizerToolbar />

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Canvas */}
        <div className="flex-1 relative min-w-0">
          <ThreeCanvas
            className="w-full h-full"
            onCreated={handleCanvasCreated}
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            <Button
              variant="solid"
              size="sm"
              iconLeft={<Save className="size-4" />}
              onClick={() => setSaveModalOpen(true)}
            >
              Save as Template
            </Button>
          </div>

          <button
            onClick={toggleCustomizerPanel}
            className="absolute top-3 right-3 z-10 lg:hidden
                       flex items-center gap-2 px-3 py-2 rounded-xl
                       bg-brand-900/90 backdrop-blur-sm border border-brand-700
                       text-sm font-sans text-brand-200"
          >
            Tools
          </button>
        </div>

        {/* Right panel — desktop */}
        <div className="hidden lg:flex lg:flex-col w-72 xl:w-80 shrink-0
                        bg-brand-900 border-l border-brand-800 overflow-y-auto">
          <AdminRightPanel activeToolPanel={activeToolPanel} />
        </div>

        {/* Right panel — mobile overlay */}
        {customizerPanelOpen && (
          <div className="lg:hidden fixed inset-y-0 right-0 z-40 w-80
                          bg-brand-900 border-l border-brand-800 overflow-y-auto
                          shadow-float animate-slide-in-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-800">
              <p className="text-sm font-semibold font-sans text-brand-100">Tools</p>
              <button
                onClick={toggleCustomizerPanel}
                className="size-7 flex items-center justify-center rounded-lg
                           text-brand-500 hover:text-brand-200 hover:bg-brand-800"
              >
                <X className="size-4" />
              </button>
            </div>
            <AdminRightPanel activeToolPanel={activeToolPanel} />
          </div>
        )}
      </div>

      {/* Save as Template modal */}
      <Modal
        open={saveModalOpen}
        onClose={() => { setSaveModalOpen(false); setTemplateName(''); }}
        title="Save as Template"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="md"
              onClick={() => { setSaveModalOpen(false); setTemplateName(''); }}>
              Cancel
            </Button>
            <Button
              variant="solid"
              size="md"
              loading={isSaving}
              disabled={!templateName.trim() || isSaving}
              iconLeft={<Save className="size-4" />}
              onClick={handleSaveTemplate}
            >
              Save Template
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Template Name"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="e.g. Classic Cross Gravestone"
            required
            hint="Saved as draft — publish from the Designs page."
          />
          {/* Show current canvas state summary */}
          <div className="rounded-xl bg-brand-800 border border-brand-700 p-3 space-y-1">
            <p className="text-xs font-medium text-brand-300 font-sans">Canvas state to save:</p>
            <p className="text-xs text-brand-500 font-sans capitalize">
              Stone: {canvas.stoneType} ·{' '}
              {canvas.texture ? `Texture: ${canvas.texture.startsWith('http')
                ? 'Custom uploaded' : canvas.texture}` : 'No texture'} ·{' '}
              {canvas.decals?.length ?? 0} decal{canvas.decals?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminRightPanel({ activeToolPanel }) {
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
        <TabsTrigger value="transform" className="flex-1 text-xs">Transform</TabsTrigger>
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