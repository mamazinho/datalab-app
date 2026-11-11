import { trackingAxios } from './axios';

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
}

export interface ITrackingRules {
  tools: ITrackingTool[];
  ids: ITrackingIdRule[];
  banners: ConsentBanner[];
  modes: ConsentMode[];
}

export interface ISiteAnalysis {
  url: string;
  final_url: string | null;
  host: string;
  cookie_domain: string;
  reachable: boolean;
  error: string | null;
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
  pending_ids: string[];
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

export interface IBuildResult {
  site: ISiteAnalysis;
  web: IContainerFile;
  server?: IContainerFile;
  merge?: IMergeResult;
  tag_map: ITagMapResult;
}

export const TrackingResource = {
  async getRules(): Promise<ITrackingRules> {
    const response = await trackingAxios.get('rules');
    return response.data as ITrackingRules;
  },
  async scanSite(siteUrl: string): Promise<ISiteAnalysis> {
    const response = await trackingAxios.post('scan', { site_url: siteUrl });
    return response.data as ISiteAnalysis;
  },
  async build(payload: IBuildRequest): Promise<IBuildResult> {
    const response = await trackingAxios.post('build', payload);
    return response.data as IBuildResult;
  },
};
