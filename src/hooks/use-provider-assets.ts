import { useSuspenseQuery } from '@tanstack/react-query';
import { availableProviderAssetsQuery, companyProviderAssetsQuery } from '../queries';
import type { UUID } from '../types/ids';
import type { IntegrationKey } from '../types/integrations';

export const useCompanyProviderAssets = (companyId: UUID) =>
  useSuspenseQuery(companyProviderAssetsQuery(companyId));

export const useAvailableProviderAssets = (companyId: UUID, integration: IntegrationKey) =>
  useSuspenseQuery(availableProviderAssetsQuery(companyId, integration));
