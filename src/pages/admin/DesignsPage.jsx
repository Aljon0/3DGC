import CatalogGrid    from '@/components/catalog/CatalogGrid';
import ConfirmDialog  from '@/components/shared/ConfirmDialog';
import FileUploader   from '@/components/shared/FileUploader';
import Modal          from '@/components/shared/Modal';
import Badge          from '@/components/ui/Badge';
import Button         from '@/components/ui/Button';
import Input          from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import designsService from '@/services/designs.service';
import { useUIStore } from '@/store/useUIStore';
import { Eye, EyeOff, Palette, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast          from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// ── Stone type options for texture upload ──────────────────────────────────
const STONE_TYPE_OPTIONS = [
  { value: '',                      label: 'All stone types (universal)' },
  { value: 'gravestone',            label: 'Gravestone only' },
  { value: 'urn',                   label: 'Urn only' },
  { value: 'table-sign',             label: 'Table Sign only' },
  { value: 'base',                  label: 'Base only' },
];

export default function DesignsPage() {
  const { setPageTitle } = useUIStore();
  const navigate         = useNavigate();

  const [templates,  setTemplates]  = useState([]);
  const [elements,   setElements]   = useState([]);
  const [textures,   setTextures]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);

  // Delete confirm — { type: 'template' | 'element' | 'texture', item }
  const [deleteItem, setDeleteItem] = useState(null);

  // Upload Element modal
  const [elmModal,  setElmModal]  = useState(false);
  const [elmForm,   setElmForm]   = useState({ name: '', category: 'religious' });
  const [elmFile,   setElmFile]   = useState(null);
  const [elmSaving, setElmSaving] = useState(false);

  // Upload Texture modal
  const [texModal,     setTexModal]     = useState(false);
  const [texName,      setTexName]      = useState('');
  const [texFile,      setTexFile]      = useState(null);
  const [texStoneType, setTexStoneType] = useState('');
  const [texSaving,    setTexSaving]    = useState(false);

  useEffect(() => { setPageTitle('Designs'); }, [setPageTitle]);

  useEffect(() => {
    Promise.all([
      designsService.fetchTemplates({ admin: true }),
      designsService.fetchElements(),
      designsService.fetchElements({ category: 'texture' }),
    ])
      .then(([t, e, tx]) => {
        setTemplates(t.templates ?? []);
        setElements((e.elements ?? []).filter(el => el.category !== 'texture'));
        setTextures(tx.elements ?? []);
      })
      .catch(() => toast.error('Failed to load designs.'))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Toggle publish ────────────────────────────────────────────────────
  const togglePublish = async (tpl) => {
    try {
      const { template } = await designsService.togglePublish(tpl.id, tpl.is_published);
      setTemplates(prev => prev.map(t => t.id === tpl.id ? template : t));
      toast.success(template.is_published ? 'Template published.' : 'Template unpublished.');
    } catch {
      toast.error('Failed to update.');
    }
  };

  // ── Confirm delete ────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.type === 'template') {
        await designsService.deleteTemplate(deleteItem.item.id);
        setTemplates(prev => prev.filter(t => t.id !== deleteItem.item.id));
        toast.success('Template deleted.');
      } else {
        await designsService.deleteElement(deleteItem.item.id);
        if (deleteItem.type === 'texture') {
          setTextures(prev => prev.filter(e => e.id !== deleteItem.item.id));
          toast.success('Texture deleted.');
        } else {
          setElements(prev => prev.filter(e => e.id !== deleteItem.item.id));
          toast.success('Element deleted.');
        }
      }
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleteItem(null);
    }
  };

  // ── Upload element ────────────────────────────────────────────────────
  const uploadElement = async () => {
    if (!elmFile || !elmForm.name.trim()) return;
    setElmSaving(true);
    try {
      const { element } = await designsService.uploadElement(
        elmFile,
        elmForm.name.trim(),
        elmForm.category.trim() || 'misc',
        null    // elements are not stone-type specific
      );
      setElements(prev => [element, ...prev]);
      setElmModal(false);
      setElmFile(null);
      setElmForm({ name: '', category: 'religious' });
      toast.success('Element uploaded.');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setElmSaving(false);
    }
  };

  // ── Upload texture ────────────────────────────────────────────────────
  const uploadTexture = async () => {
    if (!texFile || !texName.trim()) return;
    setTexSaving(true);
    try {
      const { element } = await designsService.uploadElement(
        texFile,
        texName.trim(),
        'texture',
        texStoneType || null    // null = universal (all stone types)
      );
      setTextures(prev => [element, ...prev]);
      setTexModal(false);
      setTexFile(null);
      setTexName('');
      setTexStoneType('');
      toast.success('Texture uploaded.');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setTexSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-50">Designs</h2>
          <p className="text-sm text-brand-400 font-sans mt-1">
            Manage templates, textures, and element assets.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm"
            iconLeft={<Upload className="size-4" />}
            onClick={() => setTexModal(true)}>
            Upload Texture
          </Button>
          <Button variant="outline" size="sm"
            iconLeft={<Plus className="size-4" />}
            onClick={() => setElmModal(true)}>
            Upload Element
          </Button>
          <Button variant="solid" size="sm"
            iconLeft={<Palette className="size-4" />}
            onClick={() => navigate('/admin/customize')}>
            Create Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates" badge={templates.length}>Templates</TabsTrigger>
          <TabsTrigger value="textures"  badge={textures.length}>Textures</TabsTrigger>
          <TabsTrigger value="elements"  badge={elements.length}>Elements</TabsTrigger>
        </TabsList>

        {/* ── Templates ──────────────────────────────────────────────── */}
        <TabsContent value="templates" className="pt-6">
          {isLoading ? (
            <CatalogGrid items={[]} isLoading type="template" />
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Palette className="size-10 text-brand-700" />
              <p className="text-sm text-brand-500 font-sans">No templates yet.</p>
              <Button variant="outline" size="sm"
                onClick={() => navigate('/admin/customize')}>
                Create your first template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map(tpl => (
                <div key={tpl.id}
                  className="flex flex-col rounded-2xl bg-brand-900 border border-brand-800
                             overflow-hidden hover:border-brand-600 transition-all duration-200">
                  <div className="aspect-4/3 bg-brand-800 flex items-center justify-center">
                    {tpl.thumbnail_url ? (
                      <img src={tpl.thumbnail_url} alt={tpl.name}
                        className="w-full h-full object-contain" />
                    ) : (
                      <Palette className="size-10 text-brand-700" />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold font-sans text-brand-100">{tpl.name}</p>
                      <p className="text-xs text-brand-500 font-sans capitalize mt-0.5">
                        {tpl.stone_type} · {tpl.texture}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={tpl.is_published ? 'success' : 'default'} dot size="sm">
                        {tpl.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="xs"
                          iconLeft={tpl.is_published
                            ? <EyeOff className="size-3" />
                            : <Eye className="size-3" />}
                          onClick={() => togglePublish(tpl)}>
                          {tpl.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="danger" size="xs"
                          iconLeft={<Trash2 className="size-3" />}
                          onClick={() => setDeleteItem({ type: 'template', item: tpl })}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Textures ───────────────────────────────────────────────── */}
        <TabsContent value="textures" className="pt-6">
          {isLoading ? (
            <CatalogGrid items={[]} isLoading type="element" />
          ) : textures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Upload className="size-10 text-brand-700" />
              <p className="text-sm text-brand-500 font-sans">No textures uploaded yet.</p>
              <p className="text-xs text-brand-600 font-sans text-center max-w-xs">
                Upload stone texture images here. Assign them to a specific stone type
                or leave universal to show on all stones.
              </p>
              <Button variant="outline" size="sm" onClick={() => setTexModal(true)}>
                Upload first texture
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {textures.map(tex => (
                <div key={tex.id}
                  className="flex flex-col rounded-2xl bg-brand-900 border border-brand-800
                             overflow-hidden hover:border-brand-600 transition-all duration-200 group">
                  <div className="aspect-square bg-brand-800 overflow-hidden">
                    <img src={tex.url} alt={tex.name}
                      className="w-full h-full object-cover
                                 group-hover:scale-105 transition-transform duration-200"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold font-sans text-brand-200 truncate">
                      {tex.name}
                    </p>
                    {/* Show which stone type this texture is for */}
                    <p className="text-xs text-brand-600 font-sans capitalize">
                      {tex.stone_type
                        ? STONE_TYPE_OPTIONS.find(o => o.value === tex.stone_type)?.label
                          ?? tex.stone_type
                        : 'Universal'}
                    </p>
                    <Button variant="danger" size="xs" className="w-full mt-1"
                      iconLeft={<Trash2 className="size-3" />}
                      onClick={() => setDeleteItem({ type: 'texture', item: tex })}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Elements ───────────────────────────────────────────────── */}
        <TabsContent value="elements" className="pt-6">
          {isLoading ? (
            <CatalogGrid items={[]} isLoading type="element" />
          ) : elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Plus className="size-10 text-brand-700" />
              <p className="text-sm text-brand-500 font-sans">No elements uploaded yet.</p>
              <Button variant="outline" size="sm" onClick={() => setElmModal(true)}>
                Upload first element
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {elements.map(elm => (
                <div key={elm.id}
                  className="flex flex-col rounded-2xl bg-brand-900 border border-brand-800
                             overflow-hidden hover:border-brand-600 transition-all duration-200 group">
                  <div className="aspect-square bg-brand-800 overflow-hidden
                                  flex items-center justify-center p-3">
                    <img src={elm.url} alt={elm.name}
                      className="w-full h-full object-contain
                                 group-hover:scale-105 transition-transform duration-200"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-xs font-semibold font-sans text-brand-200 truncate">
                        {elm.name}
                      </p>
                      <p className="text-xs text-brand-600 font-sans capitalize">
                        {elm.category}
                      </p>
                    </div>
                    <Button variant="danger" size="xs" className="w-full"
                      iconLeft={<Trash2 className="size-3" />}
                      onClick={() => setDeleteItem({ type: 'element', item: elm })}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Upload Element Modal ────────────────────────────────────────── */}
      <Modal open={elmModal} onClose={() => setElmModal(false)}
        title="Upload Element Asset" size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setElmModal(false)}>
              Cancel
            </Button>
            <Button variant="solid" size="md"
              disabled={!elmFile || !elmForm.name.trim() || elmSaving}
              loading={elmSaving}
              onClick={uploadElement}>
              Upload
            </Button>
          </>
        }>
        <div className="space-y-4">
          <p className="text-xs text-brand-400 font-sans">
            Elements are decorative assets placed ON the stone — crosses, roses, doves, etc.
            Use PNG with transparent background for best results.
          </p>
          <Input
            label="Element Name"
            value={elmForm.name}
            onChange={e => setElmForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Golden Cross"
            required
          />
          <Input
            label="Category"
            value={elmForm.category}
            onChange={e => setElmForm(f => ({ ...f, category: e.target.value }))}
            placeholder="religious, floral, geometric..."
          />
          <FileUploader
            accept={{ 'image/*': ['.png', '.svg', '.webp'] }}
            maxSize={5 * 1024 * 1024}
            hint="PNG with transparent background — max 5MB"
            onFiles={files => setElmFile(files[0] ?? null)}
          />
        </div>
      </Modal>

      {/* ── Upload Texture Modal ────────────────────────────────────────── */}
      <Modal open={texModal} onClose={() => setTexModal(false)}
        title="Upload Stone Texture" size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setTexModal(false)}>
              Cancel
            </Button>
            <Button variant="solid" size="md"
              disabled={!texFile || !texName.trim() || texSaving}
              loading={texSaving}
              onClick={uploadTexture}>
              Upload
            </Button>
          </>
        }>
        <div className="space-y-4">
          <p className="text-xs text-brand-400 font-sans">
            Textures wrap the entire stone surface in the 3D customizer.
            Use high-resolution seamless stone images for best results.
          </p>
          <Input
            label="Texture Name"
            value={texName}
            onChange={e => setTexName(e.target.value)}
            placeholder="e.g. Beige Marble, Black Galaxy"
            required
          />

          {/* Stone type selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-200 font-sans">
              Stone Type
            </label>
            <select
              value={texStoneType}
              onChange={e => setTexStoneType(e.target.value)}
              className="w-full bg-brand-800 border border-brand-700 rounded-xl
                         px-3 py-2.5 text-sm text-brand-100 font-sans
                         focus:outline-none focus:border-accent-500
                         transition-colors duration-150"
            >
              {STONE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-brand-600 font-sans">
              Universal textures appear for all stone types.
              Stone-specific textures only appear when that stone is selected in the customizer.
            </p>
          </div>

          <FileUploader
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
            maxSize={10 * 1024 * 1024}
            hint="Seamless stone texture image — max 10MB"
            onFiles={files => setTexFile(files[0] ?? null)}
          />
        </div>
      </Modal>

      {/* ── Delete Confirm ──────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${
          deleteItem?.type === 'template' ? 'Template'
          : deleteItem?.type === 'texture' ? 'Texture'
          : 'Element'
        }`}
        description={`Delete "${deleteItem?.item?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}