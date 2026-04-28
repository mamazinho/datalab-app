import { useMemo } from 'react';
import { useCompanyContext } from '../contexts/company';

/**
 * Retorna se o usuário atual pode gerenciar membros da empresa.
 * Owner sempre pode. Membros precisariam de permissões específicas de rota
 * (verificação de rota pode ser expandida futuramente via route-permissions).
 */
export const useCompanyPermissions = () => {
  const { currentCompany } = useCompanyContext();

  const isOwner = useMemo(
    () => currentCompany?.membership.membership_role === 'owner',
    [currentCompany],
  );

  return {
    isOwner,
    canManageUsers: isOwner,
  };
};
