import { useSuspenseQuery } from '@tanstack/react-query';
import { chatUsageReportQuery } from '../queries';

export const useChatUsageReport = (start: string, end: string) =>
  useSuspenseQuery(chatUsageReportQuery(start, end));
