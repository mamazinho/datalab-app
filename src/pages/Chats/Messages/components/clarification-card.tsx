import ReactMarkdown from 'react-markdown';
import type { IClarificationItem } from '../../../../utils/chat-timeline';
import {
    ClarificationAnswered,
    ClarificationBox,
    ClarificationLabel,
    ClarificationOption,
    ClarificationOptions,
    ClarificationQuestion,
    ClarificationRow,
} from '../messages.style';

interface ClarificationCardProps {
    item: IClarificationItem;
    onAnswer: (answer: string) => void;
    disabled: boolean;
}

export const ClarificationCard = ({ item, onAnswer, disabled }: ClarificationCardProps) => {
    const isPending = item.status === 'pending';
    const showOptions = item.status !== 'historic' && item.options.length > 0;

    return (
        <ClarificationRow>
            <ClarificationBox>
                <ClarificationLabel>Pergunta do agente</ClarificationLabel>
                <ClarificationQuestion>
                    <ReactMarkdown>{item.question}</ReactMarkdown>
                </ClarificationQuestion>

                {showOptions && (
                    <ClarificationOptions>
                        {item.options.map((option) => (
                            <ClarificationOption
                                key={option}
                                type="button"
                                disabled={!isPending || disabled}
                                $chosen={item.status === 'answered' && item.answer === option}
                                onClick={() => onAnswer(option)}
                            >
                                {option}
                            </ClarificationOption>
                        ))}
                    </ClarificationOptions>
                )}

                {isPending && (
                    <ClarificationAnswered>
                        Escolha uma opção ou responda livremente pelo campo de mensagem.
                    </ClarificationAnswered>
                )}

                {item.status === 'answered' && item.answer && !item.options.includes(item.answer) && (
                    <ClarificationAnswered>Respondido: {item.answer}</ClarificationAnswered>
                )}
            </ClarificationBox>
        </ClarificationRow>
    );
};
