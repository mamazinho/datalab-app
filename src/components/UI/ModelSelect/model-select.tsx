import { useEffect, useRef, useState } from 'react';
import { DatalabAPI } from '../../../services/datalab-api';
import { useClickOutside } from '../../../hooks/use-click-outside';
import type { IListAvailableModelsResponse } from '../../../services/datalab-api/agentsResource';
import {
    ModelOptionExpand,
    ModelOptionItem,
    ModelProviderGroup,
    ModelProviderLabel,
    ModelSelectButton,
    ModelSelectList,
    ModelSelectWrapper,
} from './model-select.style';

const VISIBLE_MODELS_PER_PROVIDER = 5;

interface ModelSelectProps {
    value: string;
    onChange: (model: string) => void;
    disabled?: boolean;
    direction?: 'up' | 'down';
    emptyOptionLabel?: string;
}

export const ModelSelect = ({
    value,
    onChange,
    disabled = false,
    direction = 'down',
    emptyOptionLabel,
}: ModelSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
    const [availableModels, setAvailableModels] = useState<IListAvailableModelsResponse[]>([]);
    const [isModelsLoading, setIsModelsLoading] = useState(true);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useClickOutside(wrapperRef, () => setIsOpen(false), isOpen);

    useEffect(() => {
        let isActive = true;

        const loadModels = async () => {
            try {
                setIsModelsLoading(true);
                const modelsList = await DatalabAPI.AgentsResource.listAvailableModels();
                if (isActive) {
                    setAvailableModels(modelsList);
                }
            } catch (err) {
                console.error('Erro ao carregar os modelos disponíveis', err);
            } finally {
                if (isActive) {
                    setIsModelsLoading(false);
                }
            }
        };

        loadModels();
        return () => { isActive = false; };
    }, []);

    const handleSelectModel = (model: string) => {
        onChange(model);
        setIsOpen(false);
    };

    const handleExpandProvider = (provider: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedProviders(prev => ({ ...prev, [provider]: true }));
    };

    const placeholder = emptyOptionLabel ?? 'Selecione um modelo';

    return (
        <ModelSelectWrapper ref={wrapperRef}>
            <ModelSelectButton
                type="button"
                onClick={() => !isModelsLoading && setIsOpen(!isOpen)}
                disabled={disabled || isModelsLoading || availableModels.length === 0}
                aria-expanded={isOpen}
            >
                {isModelsLoading ? 'Carregando...' : (value || placeholder)}
            </ModelSelectButton>

            {isOpen && !isModelsLoading && (
                <ModelSelectList $direction={direction}>
                    {emptyOptionLabel && (
                        <ModelOptionItem
                            onClick={() => handleSelectModel('')}
                            $isSelected={!value}
                        >
                            {emptyOptionLabel}
                        </ModelOptionItem>
                    )}

                    {availableModels.map((providerGroup) => {
                        const isExpanded = expandedProviders[providerGroup.provider];
                        const modelsToShow = isExpanded
                            ? providerGroup.models
                            : providerGroup.models.slice(0, VISIBLE_MODELS_PER_PROVIDER);
                        const hasMore = providerGroup.models.length > VISIBLE_MODELS_PER_PROVIDER && !isExpanded;

                        return (
                            <ModelProviderGroup key={providerGroup.provider}>
                                <ModelProviderLabel>
                                    {providerGroup.provider}
                                </ModelProviderLabel>

                                {modelsToShow.map((model) => (
                                    <ModelOptionItem
                                        key={model}
                                        onClick={() => handleSelectModel(model)}
                                        $isSelected={model === value}
                                    >
                                        {model}
                                    </ModelOptionItem>
                                ))}

                                {hasMore && (
                                    <ModelOptionExpand onClick={(e) => handleExpandProvider(providerGroup.provider, e)}>
                                        <span>Ver mais...</span>
                                        <span style={{ opacity: 0.6 }}>
                                            ({providerGroup.models.length - VISIBLE_MODELS_PER_PROVIDER})
                                        </span>
                                    </ModelOptionExpand>
                                )}
                            </ModelProviderGroup>
                        );
                    })}
                </ModelSelectList>
            )}
        </ModelSelectWrapper>
    );
};
