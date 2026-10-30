import type { ReactNode } from 'react';
import { useCompanyContext } from '../../contexts/company';
import type { IRoutePermissionRef } from '../../utils/route-permissions';

interface IPermissionGateProps {
  // A list shows the children when any of its routes is granted, e.g. a menu of several actions
  route: IRoutePermissionRef | IRoutePermissionRef[];
  children: ReactNode;
}

export const PermissionGate = ({ route, children }: IPermissionGateProps) => {
  const { hasPermissionByRoute } = useCompanyContext();

  return hasPermissionByRoute(route) ? <>{children}</> : null;
};
