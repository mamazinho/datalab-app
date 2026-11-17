import { useSuspenseQuery } from '@tanstack/react-query';
import { trackingRulesQuery } from '../queries';

export const useTrackingRules = () => useSuspenseQuery(trackingRulesQuery);
