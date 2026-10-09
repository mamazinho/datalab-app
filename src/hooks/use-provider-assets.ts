import { useSuspenseQuery } from '@tanstack/react-query';
import { availableProviderAssetsQuery, companyProviderAssetsQuery } from '../queries';
import type { UUID7 } from '../types/ids';
import type { IntegrationKey } from '../types/integrations';

export const useCompanyProviderAssets = (companyId: UUID7) =>
  useSuspenseQuery(companyProviderAssetsQuery(companyId));

export const useAvailableProviderAssets = (companyId: UUID7, integration: IntegrationKey) =>
  useSuspenseQuery(availableProviderAssetsQuery(companyId, integration));
