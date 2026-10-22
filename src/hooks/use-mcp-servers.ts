import { useSuspenseQuery } from '@tanstack/react-query';
import { mcpServersQuery } from '../queries';

export const useMcpServers = () => useSuspenseQuery(mcpServersQuery);
