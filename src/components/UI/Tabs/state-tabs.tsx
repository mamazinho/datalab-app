import { TabButton, TabsList, type TabsVariant } from './tabs.style';

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
  <TabsList as="div" $variant={variant} role="tablist" aria-label={label}>
    {items.map((item) => {
      const active = item.value === value;

      return (
        <TabButton
          key={item.value}
          type="button"
          role="tab"
          aria-selected={active}
          $variant={variant}
          $active={active}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </TabButton>
      );
    })}
  </TabsList>
);
