import styles from '../messages.module.css';
import { Markdown } from '../../../../components/UI/Markdown';
import type { IThreadBoxItem } from '../../../../utils/chat-timeline';

interface ThreadBoxProps {
    item: IThreadBoxItem;
}

export const ThreadBox = ({ item }: ThreadBoxProps) => (
    <div className={styles.threadRow}>
        <details className={styles.threadDetails}>
            <summary className={styles.threadSummary}>
                Agentes conversando — {item.agentName} ({item.entries.length})
            </summary>
            <div className={styles.threadList}>
                {item.entries.map((entry, index) => (
                    <div className={styles.threadItem} key={`${item.threadId}-${index}`}>
                        <div className={styles.threadItemMeta}>
                            {entry.author === 'supervisor'
                                ? `Supervisor → ${entry.agentName}`
                                : `${entry.agentName} → Supervisor`}
                        </div>
                        <div className={styles.threadItemContent}>
                            <Markdown>{entry.content}</Markdown>
                        </div>
                    </div>
                ))}
            </div>
        </details>
    </div>
);
