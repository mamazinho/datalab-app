import styles from './model-menu.module.css';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClickOutside } from '../../../hooks/use-click-outside';
import { availableModelsQuery } from '../../../queries';

const AUTOMATIC_LABEL = 'Automático';

interface IModelMenuProps {
  value: string;
  onChange: (model: string) => void;
}

export const ModelMenu = ({ value, onChange }: IModelMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data: providers = [] } = useQuery(availableModelsQuery);

  useClickOutside(wrapperRef, () => setIsOpen(false), isOpen);

  const selected = providers.flatMap((provider) => provider.models).find((model) => model.name === value);
  const shownProvider = providers.find((provider) => provider.provider === activeProvider) ?? providers[0];

  const choose = (model: string) => {
    onChange(model);
    setIsOpen(false);
  };

  return (
    <div className={styles.modelMenuWrapper} ref={wrapperRef}>
      <button className={styles.modelMenuToggle}
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {selected?.display_name ?? AUTOMATIC_LABEL}
        <svg className={styles.modelMenuChevron}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          data-open={isOpen}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.modelMenuPanel} role="dialog" aria-label="Modelo da mensagem">
          <button className={styles.modelOption} type="button" data-selected={!value} onClick={() => choose('')}>
            {AUTOMATIC_LABEL}
          </button>
          <div className={styles.modelTabs} role="tablist">
            {providers.map((provider) => (
              <button className={styles.modelTab}
                key={provider.provider}
                type="button"
                role="tab"
                aria-selected={provider === shownProvider}
                data-active={provider === shownProvider}
                onClick={() => setActiveProvider(provider.provider)}
              >
                {provider.display_name}
              </button>
            ))}
          </div>
          <div className={styles.modelScrollArea}>
            {shownProvider?.models.map((model) => (
              <button className={styles.modelOption}
                key={model.name}
                type="button"
                data-selected={model.name === value}
                onClick={() => choose(model.name)}
              >
                {model.display_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
