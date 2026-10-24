import type { TabsVariant } from './route-tabs';
import styles from './tabs.module.css';

export interface IStateTabItem<TValue extends string> {
  label: string;
  value: TValue;
}

interface IStateTabsProps<TValue extends string> {
  items: IStateTabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  variant?: TabsVariant;
  label?: string;
}

/**
 * Abas que trocam conteúdo sem mudar de rota (ex.: Membros | Convites).
 * Mesmo visual das navegáveis — muda só quem guarda a aba ativa.
 */
export const StateTabs = <TValue extends string>({
  items,
  value,
  onChange,
  variant = 'tabs',
  label,
}: IStateTabsProps<TValue>) => (
  <div className={styles.list} data-variant={variant} role="tablist" aria-label={label}>
    {items.map((item) => {
      const active = item.value === value;

      return (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={active}
          className={styles.item}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);
