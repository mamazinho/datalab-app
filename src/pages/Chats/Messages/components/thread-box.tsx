import ReactMarkdown from 'react-markdown';
import { useAgentsContext } from '../../../../contexts/agents';
import type { IThreadBoxItem } from '../../../../utils/chat-timeline';
import {
    ThreadAvatar,
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

export const ThreadBox = ({ item }: ThreadBoxProps) => {
    const { agentsByKey } = useAgentsContext();

    const resolveAgentName = (agentKey: string | null): string => {
        if (!agentKey) return 'Especialista';
        return agentsByKey[agentKey]?.name ?? agentKey;
    };

    const specialist = item.agentKey ? agentsByKey[item.agentKey] : undefined;
    const specialistName = resolveAgentName(item.agentKey);

    return (
        <ThreadRow>
            <ThreadDetails>
                <ThreadSummary>
                    {specialist?.avatar_url && (
                        <ThreadAvatar src={specialist.avatar_url} alt="" />
                    )}
                    Agentes conversando — {specialistName} ({item.entries.length})
                </ThreadSummary>
                <ThreadList>
                    {item.entries.map((entry, index) => (
                        <ThreadItem key={`${item.threadId}-${index}`}>
                            <ThreadItemMeta>
                                {entry.author === 'supervisor'
                                    ? `Supervisor → ${resolveAgentName(entry.agentKey)}`
                                    : resolveAgentName(entry.agentKey)}
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
};
