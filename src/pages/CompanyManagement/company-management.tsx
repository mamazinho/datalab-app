import { useState } from 'react';
import { useCompanyContext } from '../../contexts/company';
import { CompanyFormModal } from '../../components/UI/CompanyFormModal';
import { COMPANY_ROUTE_PERMISSIONS } from '../../utils/route-permissions';
import { DeleteCompanyModal } from './components/delete-company-modal';
import {
  ActiveBadge,
  CompanyActionButton,
  CompanyActions,
  CompanyDeleteButton,
  CompanyInfo,
  CompanyName,
  CompanyPageContainer,
  CompanyPageHeader,
  CompanyPageSubtitle,
  CompanyPageTitle,
  CompanyRow,
} from './company-management.style';

// Painel da empresa ATIVA (trocar/criar vivem no seletor do header). Só chega
// aqui quem tem permissão de editar ou deletar (CompanyManagementRoute).
export const CompanyManagement = () => {
  const { currentCompany, clearSelectedCompany, hasPermissionByRoute } = useCompanyContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!currentCompany) return null;

  const canEdit = hasPermissionByRoute(COMPANY_ROUTE_PERMISSIONS.update);
  const canDelete = hasPermissionByRoute(COMPANY_ROUTE_PERMISSIONS.remove);

  return (
    <CompanyPageContainer>
      <CompanyPageHeader>
        <div>
          <CompanyPageTitle>Gerenciamento de empresa</CompanyPageTitle>
          <CompanyPageSubtitle>
            Edite o nome ou remova a empresa ativa. Para trocar de empresa ou criar
            uma nova, use o seletor no topo.
          </CompanyPageSubtitle>
        </div>
      </CompanyPageHeader>

      <CompanyRow $active>
        <CompanyInfo>
          <CompanyName>{currentCompany.name}</CompanyName>
          <ActiveBadge>Empresa ativa</ActiveBadge>
        </CompanyInfo>

        <CompanyActions>
          {canEdit && (
            <CompanyActionButton onClick={() => setIsEditOpen(true)}>
              Editar nome
            </CompanyActionButton>
          )}
          {canDelete && (
            <CompanyDeleteButton onClick={() => setIsDeleteOpen(true)}>
              Deletar
            </CompanyDeleteButton>
          )}
        </CompanyActions>
      </CompanyRow>

      <CompanyFormModal
        isOpen={isEditOpen}
        company={currentCompany}
        onClose={() => setIsEditOpen(false)}
      />

      <DeleteCompanyModal
        isOpen={isDeleteOpen}
        company={currentCompany}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={clearSelectedCompany}
      />
    </CompanyPageContainer>
  );
};
