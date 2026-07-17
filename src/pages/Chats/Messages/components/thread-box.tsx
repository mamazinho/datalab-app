import ReactMarkdown from 'react-markdown';
import type { IThreadBoxItem } from '../../../../utils/chat-timeline';
import {
    ThreadDetails,
    ThreadItem,
    ThreadItemContent,
    ThreadItemMeta,
    ThreadList,
    ThreadRow,
    ThreadSummary,
} from '../messages.style';

interface ThreadBoxProps {
    item: IThreadBoxItem;
}

// O chat não busca a lista de agentes — exibe o agent_key do stream de forma legível
const formatAgentKey = (agentKey: string | null): string =>
    agentKey ? agentKey.replace(/_/g, ' ') : 'Especialista';

export const ThreadBox = ({ item }: ThreadBoxProps) => (
    <ThreadRow>
        <ThreadDetails>
            <ThreadSummary>
                Agentes conversando — {formatAgentKey(item.agentKey)} ({item.entries.length})
            </ThreadSummary>
            <ThreadList>
                {item.entries.map((entry, index) => (
                    <ThreadItem key={`${item.threadId}-${index}`}>
                        <ThreadItemMeta>
                            {entry.author === 'supervisor'
                                ? `Supervisor → ${formatAgentKey(entry.agentKey)}`
                                : formatAgentKey(entry.agentKey)}
                        </ThreadItemMeta>
                        <ThreadItemContent>
                            <ReactMarkdown>{entry.content}</ReactMarkdown>
                        </ThreadItemContent>
                    </ThreadItem>
                ))}
            </ThreadList>
        </ThreadDetails>
    </ThreadRow>
);
