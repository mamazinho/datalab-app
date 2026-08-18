import { useSuspenseQuery } from '@tanstack/react-query';
import { memberPermissionsQuery } from '../queries';
import type { UUID } from '../types/ids';

export const useMemberPermissions = (memberId: UUID) => useSuspenseQuery(memberPermissionsQuery(memberId));
