import { Link, useLocation } from 'react-router-dom';
import styles from './tabs.module.css';

export type TabsVariant = 'tabs' | 'nav';

export interface IRouteTabItem {
  label: string;
  to: string;
  // Marks the tab active when the path differs from the destination, like the header's management item
  match?: string;
  // Active only on the exact path, the default for "/"
  end?: boolean;
}

interface IRouteTabsProps {
  items: IRouteTabItem[];
  variant?: TabsVariant;
  label?: string;
}

const isItemActive = (item: IRouteTabItem, pathname: string): boolean => {
  const base = item.match ?? item.to;

  if (item.end || base === '/') return pathname === base;

  return pathname === base || pathname.startsWith(`${base}/`);
};

export const RouteTabs = ({ items, variant = 'tabs', label }: IRouteTabsProps) => {
  const { pathname } = useLocation();

  return (
    <nav className={styles.list} data-variant={variant} aria-label={label}>
      {items.map((item) => {
        const active = isItemActive(item, pathname);

        return (
          <Link key={item.to} to={item.to} className={styles.item} aria-current={active ? 'page' : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
