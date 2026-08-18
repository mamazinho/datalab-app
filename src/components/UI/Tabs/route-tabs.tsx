import { useLocation } from 'react-router-dom';
import { TabLink, TabsList, type TabsVariant } from './tabs.style';

export interface IRouteTabItem {
  label: string;
  to: string;
  /**
   * Prefixo que decide a aba ativa quando ele difere do destino — é o caso do
   * item "Gerenciamento" do header, que aponta para a primeira sub-aba visível
   * mas precisa acender em qualquer uma delas.
   */
  match?: string;
  /** Ativa só no path exato (padrão para "/") */
  end?: boolean;
}

interface IRouteTabsProps {
  items: IRouteTabItem[];
  variant?: TabsVariant;
  label?: string;
}

// Regra única de "aba ativa" no app: igualdade de path ou subrota do prefixo.
const isItemActive = (item: IRouteTabItem, pathname: string): boolean => {
  const base = item.match ?? item.to;

  if (item.end || base === '/') return pathname === base;

  return pathname === base || pathname.startsWith(`${base}/`);
};

/**
 * Abas navegáveis: cada item é uma rota. Quem monta a lista decide quais itens
 * aparecem (permissões), não este componente.
 */
export const RouteTabs = ({ items, variant = 'tabs', label }: IRouteTabsProps) => {
  const { pathname } = useLocation();

  return (
    <TabsList $variant={variant} aria-label={label}>
      {items.map((item) => {
        const active = isItemActive(item, pathname);

        return (
          <TabLink
            key={item.to}
            to={item.to}
            $variant={variant}
            $active={active}
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </TabLink>
        );
      })}
    </TabsList>
  );
};
