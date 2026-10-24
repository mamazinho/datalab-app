import styles from './model-select.module.css';
import { useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClickOutside } from '../../../hooks/use-click-outside';
import { availableModelsQuery } from '../../../queries';

interface IModelSelectProps {
    name: string;
    defaultValue?: string;
    emptyOptionLabel: string;
    labelId?: string;
}

interface IModelOptionProps {
    label: string;
    isSelected: boolean;
    onSelect: () => void;
}

const ModelOption = ({ label, isSelected, onSelect }: IModelOptionProps) => (
    <button className={styles.modelOptionItem}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={onSelect}
    >
        {label}
    </button>
);

export const ModelSelect = ({ name, defaultValue = '', emptyOptionLabel, labelId }: IModelSelectProps) => {
    const [value, setValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonId = useId();
    const { data: providers = [], isLoading, isError } = useQuery(availableModelsQuery);

    useClickOutside(wrapperRef, () => setIsOpen(false), isOpen);

    const selectedModel = providers.flatMap((provider) => provider.models).find((model) => model.name === value);

    const select = (model: string) => {
        setValue(model);
        setIsOpen(false);
    };

    return (
        <>
            <div className={styles.modelSelectWrapper} ref={wrapperRef}>
                <input type="hidden" name={name} value={value} />

                <button className={styles.modelSelectButton}
                    id={buttonId}
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    disabled={isLoading}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-labelledby={labelId ? `${labelId} ${buttonId}` : undefined}
                >
                    {isLoading ? 'Carregando modelos...' : (selectedModel?.display_name ?? (value || emptyOptionLabel))}
                </button>

                {isOpen && (
                    <div className={styles.modelSelectList} role="listbox" aria-labelledby={labelId}>
                        <ModelOption label={emptyOptionLabel} isSelected={!value} onSelect={() => select('')} />

                        {value && !selectedModel && (
                            <ModelOption label={value} isSelected onSelect={() => select(value)} />
                        )}

                        {providers.map((provider) => (
                            <div className={styles.modelProviderGroup}
                                key={provider.provider}
                                role="group"
                                aria-labelledby={`${buttonId}-${provider.provider}`}
                            >
                                <div className={styles.modelProviderLabel} id={`${buttonId}-${provider.provider}`}>
                                    {provider.display_name}
                                </div>

                                {provider.models.map((model) => (
                                    <ModelOption
                                        key={model.name}
                                        label={model.display_name}
                                        isSelected={model.name === value}
                                        onSelect={() => select(model.name)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isError && <p className={styles.modelSelectHint} role="status">Não foi possível carregar a lista de modelos.</p>}
        </>
    );
};
