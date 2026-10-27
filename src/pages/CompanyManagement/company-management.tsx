import styles from './company-management.module.css';
import { useState } from 'react';
import { useCompanyContext } from '../../contexts/company';
import { CompanyFormModal } from '../../components/UI/CompanyFormModal';
import { COMPANY_ROUTE_PERMISSIONS } from '../../utils/route-permissions';
import { DeleteCompanyModal } from './components/delete-company-modal';

export const CompanyManagement = () => {
  const { currentCompany, clearSelectedCompany, hasPermissionByRoute } = useCompanyContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!currentCompany) return null;

  const canEdit = hasPermissionByRoute(COMPANY_ROUTE_PERMISSIONS.update);
  const canDelete = hasPermissionByRoute(COMPANY_ROUTE_PERMISSIONS.remove);

  return (
    <div className={styles.companyPageContainer}>
      <div className={styles.companyPageHeader}>
        <div>
          <h1 className={styles.companyPageTitle}>Gerenciamento de empresa</h1>
          <p className={styles.companyPageSubtitle}>
            Edite o nome ou remova a empresa ativa. Para trocar de empresa ou criar
            uma nova, use o seletor no topo.
          </p>
        </div>
      </div>

      <div className={styles.companyRow}>
        <div className={styles.companyInfo}>
          <span className={styles.companyName}>{currentCompany.name}</span>
          <span className={styles.activeBadge}>Empresa ativa</span>
        </div>

        <div className={styles.companyActions}>
          {canEdit && (
            <button className={styles.companyActionButton} onClick={() => setIsEditOpen(true)}>
              Editar nome
            </button>
          )}
          {canDelete && (
            <button className={styles.companyDeleteButton} onClick={() => setIsDeleteOpen(true)}>
              Deletar
            </button>
          )}
        </div>
      </div>

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
    </div>
  );
};
