import { useSuspenseQuery } from '@tanstack/react-query';
import { memberPermissionsQuery } from '../queries';
import type { UUID7 } from '../types/ids';

export const useMemberPermissions = (memberId: UUID7) => useSuspenseQuery(memberPermissionsQuery(memberId));
