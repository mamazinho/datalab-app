import styles from '../messages.module.css';
import ReactMarkdown from 'react-markdown';
import type { IChatMember } from '../../../../services/datalab-api/chatsResource';
import type { IClarificationItem } from '../../../../utils/chat-timeline';
import { AuthoredRow } from './authored-row';

interface ClarificationCardProps {
    item: IClarificationItem;
    author: IChatMember | null;
    showAuthor: boolean;
    onAnswer: (answer: string) => void;
    disabled: boolean;
}

export const ClarificationCard = ({ item, author, showAuthor, onAnswer, disabled }: ClarificationCardProps) => {
    const isPending = item.status === 'pending';
    const showOptions = item.options.length > 0;

    return (
        <AuthoredRow author={author} showAuthor={showAuthor} isUser={false}>
            <div className={styles.clarificationBox}>
                <div className={styles.clarificationLabel}>Pergunta do agente</div>
                <div className={styles.clarificationQuestion}>
                    <ReactMarkdown>{item.question}</ReactMarkdown>
                </div>

                {showOptions && (
                    <div className={styles.clarificationOptions}>
                        {item.options.map((option) => (
                            <button className={styles.clarificationOption}
                                key={option}
                                type="button"
                                disabled={!isPending || disabled}
                                data-chosen={item.status === 'answered' && item.answer === option}
                                onClick={() => onAnswer(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {isPending && (
                    <div className={styles.clarificationAnswered}>
                        Escolha uma opção ou responda livremente pelo campo de mensagem.
                    </div>
                )}

                {item.status === 'answered' && item.answer && !item.options.includes(item.answer) && (
                    <div className={styles.clarificationAnswered}>Respondido: {item.answer}</div>
                )}
            </div>
        </AuthoredRow>
    );
};
