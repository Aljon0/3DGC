import api from './api';

const designsService = {

  async fetchTemplates(params = {}) {
    const response = await api.get('/designs/templates', { params });
    return { templates: response.data.templates };
  },

  async fetchTemplate(id) {
    const response = await api.get(`/designs/templates/${id}`);
    return { template: response.data.template };
  },

  async saveTemplate(data, thumbnailBlob = null) {
    const form = new FormData();
  
    if (thumbnailBlob) {
      form.append('asset', thumbnailBlob, 'thumbnail.png');
    }
  
    // templateData JSON must match exactly what backend createTemplate expects
    form.append('templateData', JSON.stringify({
      name:        data.name,
      stoneType:   data.stoneType,      // must match stone_type enum in DB
      texture:     data.texture  ?? null,
      decals:      data.decals   ?? [],
      dimensions:  data.dimensions ?? null,
      isPublished: data.isPublished ?? false,
    }));
  
    const response = await api.post('/designs/templates', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  
    return { template: response.data.template };
  },

  async updateTemplate(id, fields, thumbnailBlob = null) {
    if (thumbnailBlob) {
      const form = new FormData();
      form.append('asset', thumbnailBlob, 'thumbnail.png');
      form.append('templateData', JSON.stringify(fields));
      const response = await api.patch(`/designs/templates/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { template: response.data.template };
    }
    const response = await api.patch(`/designs/templates/${id}`, fields);
    return { template: response.data.template };
  },

  async togglePublish(id, currentState) {
    return designsService.updateTemplate(id, { isPublished: !currentState });
  },

  async deleteTemplate(id) {
    await api.delete(`/designs/templates/${id}`);
    return { success: true };
  },

  // ── Elements ────────────────────────────────────────────────────────────
  // params: { category, stoneType }
  //
  async fetchElements(params = {}) {
    const response = await api.get('/designs/elements', { params });
    return { elements: response.data.elements };
  },

  // stoneType: which stone this texture applies to (null = all stones)
  async uploadElement(file, name, category, stoneType = null) {
    const form = new FormData();
    form.append('asset',    file);
    form.append('name',     name);
    form.append('category', category);
    if (stoneType) form.append('stoneType', stoneType);

    const response = await api.post('/designs/elements', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { element: response.data.element };
  },

  async deleteElement(id) {
    await api.delete(`/designs/elements/${id}`);
    return { success: true };
  },
};

export default designsService;