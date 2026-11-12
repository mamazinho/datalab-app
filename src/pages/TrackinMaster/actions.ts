import { DatalabAPI } from '../../services/datalab-api';
import type { ISiteAnalysis } from '../../services/datalab-api/trackingResource';
import { createFormAction } from '../../utils/create-form-action';
import { buildContainersSchema, ID_FIELD_PREFIX, scanSiteSchema } from './schemas';

export const scanSiteAction = createFormAction(scanSiteSchema, ({ site_url }) =>
  DatalabAPI.TrackingResource.scanSite(site_url),
);

const idsFrom = (formData: FormData) =>
  Object.fromEntries(
    [...formData.entries()]
      .filter(([name, value]) => name.startsWith(ID_FIELD_PREFIX) && typeof value === 'string' && value.trim())
      .map(([name, value]) => [name.slice(ID_FIELD_PREFIX.length), String(value).trim()]),
  );

// Checkboxes are absent from FormData when unchecked, and the export file arrives empty when none was picked
const mapBuildFormData = (formData: FormData) => {
  const exportFile = formData.get('client_export');
  return {
    client_name: formData.get('client_name') ?? '',
    tools: formData.getAll('tools'),
    server_side: formData.has('server_side'),
    banner: formData.get('banner'),
    mode: formData.get('mode'),
    has_cmp: formData.has('has_cmp'),
    term_accepted: formData.has('term_accepted'),
    ids: idsFrom(formData),
    client_export: exportFile instanceof File && exportFile.size > 0 ? exportFile : undefined,
  };
};

export const createBuildContainersAction = (site: ISiteAnalysis) =>
  createFormAction(
    buildContainersSchema,
    async ({ banner, mode, client_export, ...data }) =>
      DatalabAPI.TrackingResource.build({
        ...data,
        site_url: site.url,
        site,
        consent: { banner, mode },
        client_export: client_export ? await client_export.text() : null,
      }),
    { mapFormData: mapBuildFormData },
  );
