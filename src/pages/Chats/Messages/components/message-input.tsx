import { useState, useEffect, useRef } from 'react';
import { 
    MessageInputField, 
    MessageInputForm, 
    MessageInputRow, 
    MessageSubmit, 
    SubmitArrow, 
    SubmitSpinner, 
    ModelSelectWrapper, 
    ModelSelectButton, 
    ModelSelectList, 
    ModelProviderGroup, 
    ModelProviderLabel, 
    ModelOptionItem, 
    ModelOptionExpand 
} from '../messages.style';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IListAvailableModelsResponse } from '../../../../services/datalab-api/agentsResource';

interface MessageInputProps {
    value: string;
    modelName: string;
    onModelChange: (model: string) => void;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    isDisabled: boolean;
}

export const MessageInput = ({ 
    value, 
    modelName, 
    onModelChange, 
    onChange, 
    onSubmit, 
    isLoading, 
    isDisabled 
}: MessageInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({});
    const [availableModels, setAvailableModels] = useState<IListAvailableModelsResponse[]>([]);
    const [isModelsLoading, setIsModelsLoading] = useState(true);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        let isActive = true;
        
        const loadModels = async () => {
            try {
                setIsModelsLoading(true);
                const modelsList = await DatalabAPI.AgentsResource.listAvailableModels();
                if (isActive) {
                    setAvailableModels(modelsList);
                    if (modelsList.length > 0 && !modelName) {
                        onModelChange(modelsList[0].models[0]);
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar os modelos disponíveis", err);
            } finally {
                if (isActive) {
                    setIsModelsLoading(false);
                }
            }
        };

        loadModels();
        return () => { isActive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectModel = (model: string) => {
        onModelChange(model);
        setIsOpen(false);
    };

    const handleExpandProvider = (provider: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedProviders(prev => ({ ...prev, [provider]: true }));
    };

    return (
        <MessageInputForm 
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >
            <MessageInputRow>
                <ModelSelectWrapper ref={wrapperRef}>
                    <ModelSelectButton
                        type="button"
                        onClick={() => !isModelsLoading && setIsOpen(!isOpen)}
                        disabled={isDisabled || isModelsLoading || availableModels.length === 0}
                        aria-expanded={isOpen}
                    >
                        {isModelsLoading ? 'Carregando...' : (modelName || 'Selecione um modelo')}
                    </ModelSelectButton>
                    
                    {isOpen && !isModelsLoading && (
                        <ModelSelectList>
                            {availableModels.map((providerGroup) => {
                                const isExpanded = expandedProviders[providerGroup.provider];
                                const modelsToShow = isExpanded 
                                    ? providerGroup.models 
                                    : providerGroup.models.slice(0, 5);
                                const hasMore = providerGroup.models.length > 5 && !isExpanded;

                                return (
                                    <ModelProviderGroup key={providerGroup.provider}>
                                        <ModelProviderLabel>
                                            {providerGroup.provider}
                                        </ModelProviderLabel>
                                        
                                        {modelsToShow.map((model) => (
                                            <ModelOptionItem 
                                                key={model} 
                                                onClick={() => handleSelectModel(model)}
                                                $isSelected={model === modelName}
                                            >
                                                {model}
                                            </ModelOptionItem>
                                        ))}
                                        
                                        {hasMore && (
                                            <ModelOptionExpand onClick={(e) => handleExpandProvider(providerGroup.provider, e)}>
                                                <span>Ver mais...</span>
                                                <span style={{ opacity: 0.6 }}>({providerGroup.models.length - 5})</span>
                                            </ModelOptionExpand>
                                        )}
                                    </ModelProviderGroup>
                                );
                            })}
                        </ModelSelectList>
                    )}
                </ModelSelectWrapper>

                <MessageInputField
                    id="prompt-input"
                    name="prompt"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isDisabled || !modelName}
                    autoComplete="off"
                    placeholder="Digite sua mensagem aqui..."
                    required
                />
                <MessageSubmit
                    type="submit"
                    disabled={isDisabled || !value.trim() || !modelName}
                >
                    {isLoading ? (
                        <>
                            <SubmitSpinner role="status" aria-hidden="true" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <SubmitArrow>➤</SubmitArrow>
                            Enviar
                        </>
                    )}
                </MessageSubmit>
            </MessageInputRow>
        </MessageInputForm>
    );
}
