import { axiosCompanyInstance } from './axios';

export type ConsentBanner = 'opt_in' | 'opt_out' | 'region';
export type ConsentMode = 'advanced' | 'basic';
export type Severity = 'error' | 'warning';

export interface ITrackingTool {
  key: string;
  label: string;
}

export interface ITrackingIdRule {
  key: string;
  constant: string;
  secret: boolean;
  optional: boolean;
  example: string;
  tools: string[];
  server_only: boolean;
  format: string;
  where: string;
  confirmed: boolean;
}

export interface IImportProblemKind {
  key: string;
  label: string;
}

export interface ITrackingRules {
  tools: ITrackingTool[];
  ids: ITrackingIdRule[];
  banners: ConsentBanner[];
  modes: ConsentMode[];
  import_problems: IImportProblemKind[];
  standard_version: string;
}

export interface IHardcodedWarning {
  tool: string;
  label: string;
  ids: string[];
  chosen: boolean;
  why: string;
  where: string[];
}

export interface ISiteAnalysis {
  url: string;
  final_url: string | null;
  host: string;
  cookie_domain: string;
  reachable: boolean;
  error: string | null;
  blocked: boolean;
  protection: string | null;
  platform: string | null;
  is_ecommerce: boolean;
  cmp: string | null;
  has_datalayer: boolean;
  gtm_containers: string[];
  hardcoded: Record<string, string[]>;
  inside_gtm: Record<string, string[]>;
  funnel_domains: string[];
  hostnames: string[];
  detected_tools: string[];
  suggested_ids: Record<string, string>;
  considerations: string[];
  hardcoded_warnings: IHardcodedWarning[];
  diagnosis_markdown: string;
}

export interface IValidationIssue {
  severity: Severity;
  message: string;
  item: string | null;
}

export interface IValidationReport {
  ok: boolean;
  counts: Record<string, number>;
  issues: IValidationIssue[];
}

export interface IContainerFile {
  file: string;
  content: string;
  validation: IValidationReport;
}

export interface IMergeResult extends IContainerFile {
  import_option: string;
  findings: Record<string, number>;
  report_markdown: string;
}

export interface ITagMapResult {
  tags: number;
  attributes: number;
  markdown: string;
  tags_csv: string;
  attributes_csv: string;
}

export interface IDataLayerEvent {
  event: string;
  when: string;
  required: string[];
  tags: number;
}

export interface IGuideStep {
  number: number;
  title: string;
  text: string;
  print: string | null;
  caption: string | null;
}

export interface IBuildRequest {
  site_url: string;
  site: ISiteAnalysis | null;
  client_name: string;
  tools: string[];
  server_side: boolean;
  consent: { banner: ConsentBanner; mode: ConsentMode };
  has_cmp: boolean;
  term_accepted: boolean;
  ids: Record<string, string>;
  client_export: string | null;
}

// An accepted id whose format is only inferred: shown for a human to check before publishing
export interface IIdWarning {
  key: string;
  constant: string;
  label: string;
  message: string;
  format: string;
}

export interface IBuildResult {
  standard_version: string;
  id_warnings: IIdWarning[];
  site: ISiteAnalysis;
  web: IContainerFile;
  server?: IContainerFile | null;
  merge?: IMergeResult | null;
  tag_map: ITagMapResult;
  datalayer: { events: IDataLayerEvent[]; names: Record<string, string>; markdown: string; csv: string };
  requirements: { datalayer: IDataLayerEvent[]; datalayer_note: string; accesses: string[] };
  guide: { import_steps: IGuideStep[]; publish_steps: IGuideStep[] };
  document: { file: string; content_base64: string };
}

// The build refusals carry, in the error detail, what is wrong with each id
export interface IMissingId {
  key: string;
  tool: string;
  tool_label: string;
  label: string;
  where: string;
  format: string;
}

export interface IInvalidId {
  key: string;
  label: string;
  message: string;
  format: string;
  where: string;
}

export interface IPublicationRequest {
  container_id: string;
  ids: Record<string, string>;
}

export interface IPublicationResult {
  container_id: string;
  published: boolean;
  ids: Array<{ key: string; label: string; value: string; found: boolean }>;
  missing: string[];
}

export type PageKind = 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'confirmation';

export interface IImplementationRequest {
  container_id: string;
  ids: Record<string, string>;
  pages: Array<{ kind: PageKind; url: string }>;
}

export interface IEventCheck {
  event: string;
  status: 'ok' | 'missing' | 'incomplete';
  missing_fields: string[];
  note: string | null;
}

export interface IPageCheck {
  kind: PageKind;
  label: string;
  url: string;
  final_url: string | null;
  opened: boolean;
  problem: string | null;
  container_loaded: boolean;
  events: IEventCheck[];
  tags: Array<{ key: string; label: string; fired: boolean }>;
}

export interface IImplementationResult {
  container_id: string;
  ok: boolean;
  pages: IPageCheck[];
  manual_events: string[];
  notes: string[];
}

export interface IImportHelpRequest {
  kind: string;
  message: string;
}

export interface IImportHelp {
  kind: string;
  label: string;
  diagnosis: string;
  steps: string[];
  regenerate: boolean;
  matched_known_error: boolean;
}

export const TrackingResource = {
  async getRules(): Promise<ITrackingRules> {
    const response = await axiosCompanyInstance.get('tracking/rules/');
    return response.data as ITrackingRules;
  },
  async scanSite(siteUrl: string): Promise<ISiteAnalysis> {
    const response = await axiosCompanyInstance.post('tracking/scan/', { site_url: siteUrl });
    return response.data as ISiteAnalysis;
  },
  async build(payload: IBuildRequest): Promise<IBuildResult> {
    const response = await axiosCompanyInstance.post('tracking/build/', payload);
    return response.data as IBuildResult;
  },
  async verifyPublication(payload: IPublicationRequest): Promise<IPublicationResult> {
    const response = await axiosCompanyInstance.post('tracking/verify/', payload);
    return response.data as IPublicationResult;
  },
  async validateImplementation(payload: IImplementationRequest): Promise<IImplementationResult> {
    // Every page opens in a real browser on the server: up to six pages take a couple of minutes
    const response = await axiosCompanyInstance.post('tracking/validate/', payload, { timeout: 200_000 });
    return response.data as IImplementationResult;
  },
  async importHelp(payload: IImportHelpRequest): Promise<IImportHelp> {
    const response = await axiosCompanyInstance.post('tracking/import-help/', payload);
    return response.data as IImportHelp;
  },
};
