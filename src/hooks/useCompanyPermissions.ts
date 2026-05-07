import { useMemo } from 'react';
import { useCompanyContext } from '../contexts/company';

/**
 * Retorna se o usuário atual pode gerenciar membros da empresa.
 * Owner sempre pode. Membros precisariam de permissões específicas de rota
 * (verificação de rota pode ser expandida futuramente via route-permissions).
 */
export const useCompanyPermissions = () => {
  const { currentMembership } = useCompanyContext();

  const isOwner = useMemo(
    () => currentMembership?.membership_role === 'owner',
    [currentMembership],
  );

  return {
    isOwner,
    canManageUsers: isOwner,
  };
};
