import { DatalabAPI } from '../../services/datalab-api';
import type { IBuildRequest, IBuildResult, ISiteAnalysis } from '../../services/datalab-api/trackingResource';
import { createFormAction } from '../../utils/create-form-action';
import { buildContainersSchema, ID_FIELD_PREFIX, importHelpSchema, scanSiteSchema, verifyPublicationSchema } from './schemas';

export interface IBuilt {
  request: IBuildRequest;
  result: IBuildResult;
}

export const scanSiteAction = createFormAction(scanSiteSchema, ({ site_url }) =>
  DatalabAPI.TrackingResource.scanSite(site_url),
);

const idsFrom = (formData: FormData) =>
  Object.fromEntries(
    [...formData.entries()]
      .filter(([name, value]) => name.startsWith(ID_FIELD_PREFIX) && typeof value === 'string' && value.trim())
      .map(([name, value]) => [name.slice(ID_FIELD_PREFIX.length), String(value).trim()]),
  );

// Checkboxes are absent from FormData when unchecked. The export file comes from state, not from the form:
// React clears the file input after every submit, and a refused build must not lose it
const mapBuildFormData = (formData: FormData, exportFile: File | null) => ({
    client_name: formData.get('client_name') ?? '',
    tools: formData.getAll('tools'),
    server_side: formData.has('server_side'),
    banner: formData.get('banner'),
    mode: formData.get('mode'),
    has_cmp: formData.has('has_cmp'),
    term_accepted: formData.has('term_accepted'),
    ids: idsFrom(formData),
    client_export: exportFile && exportFile.size > 0 ? exportFile : undefined,
});

export const createBuildContainersAction = (site: ISiteAnalysis, exportFile: File | null) =>
  createFormAction(
    buildContainersSchema,
    async ({ banner, mode, client_export, ...data }): Promise<IBuilt> => {
      const request: IBuildRequest = {
        ...data,
        site_url: site.url,
        site,
        consent: { banner, mode },
        client_export: client_export ? await client_export.text() : null,
      };
      return { request, result: await DatalabAPI.TrackingResource.build(request) };
    },
    { mapFormData: (formData) => mapBuildFormData(formData, exportFile) },
  );

export const createVerifyPublicationAction = (ids: Record<string, string>) =>
  createFormAction(verifyPublicationSchema, ({ container_id }) =>
    DatalabAPI.TrackingResource.verifyPublication({ container_id, ids }),
  );

export const importHelpAction = createFormAction(importHelpSchema, (data) => DatalabAPI.TrackingResource.importHelp(data));
