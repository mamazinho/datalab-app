import styles from '../messages.module.css';
import ReactMarkdown from 'react-markdown';
import type { IThreadBoxItem } from '../../../../utils/chat-timeline';

interface ThreadBoxProps {
    item: IThreadBoxItem;
}

// The chat does not load the agents list, so the agent_key is made readable here
const formatAgentKey = (agentKey: string | null): string =>
    agentKey ? agentKey.replace(/_/g, ' ') : 'Especialista';

export const ThreadBox = ({ item }: ThreadBoxProps) => (
    <div className={styles.threadRow}>
        <details className={styles.threadDetails}>
            <summary className={styles.threadSummary}>
                Agentes conversando — {formatAgentKey(item.agentKey)} ({item.entries.length})
            </summary>
            <div className={styles.threadList}>
                {item.entries.map((entry, index) => (
                    <div className={styles.threadItem} key={`${item.threadId}-${index}`}>
                        <div className={styles.threadItemMeta}>
                            {entry.author === 'supervisor'
                                ? `Supervisor → ${formatAgentKey(entry.agentKey)}`
                                : formatAgentKey(entry.agentKey)}
                        </div>
                        <div className={styles.threadItemContent}>
                            <ReactMarkdown>{entry.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
            </div>
        </details>
    </div>
);
