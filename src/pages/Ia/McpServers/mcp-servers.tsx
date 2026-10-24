import styles from '../ia.module.css';
import { useState } from 'react';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { useCompanyContext } from '../../../contexts/company';
import { useMcpServers } from '../../../hooks/use-mcp-servers';
import type { IRetrieveMcpServer } from '../../../services/datalab-api/mcpServersResource';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { McpServersTable } from './components/mcp-servers-table';
import { McpServerFormModal } from './components/mcp-server-form-modal';

interface IMcpServersListSectionProps {
  onEdit: (mcpServer: IRetrieveMcpServer) => void;
}

const McpServersListSection = ({ onEdit }: IMcpServersListSectionProps) => {
  const { data: mcpServers } = useMcpServers();

  return <McpServersTable mcpServers={mcpServers} onEdit={onEdit} />;
};

export const McpServers = () => {
  const { currentCompany, hasPermissionByRoute } = useCompanyContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMcpServer, setEditingMcpServer] = useState<IRetrieveMcpServer | null>(null);

  const canCreate = hasPermissionByRoute(MCP_SERVER_ROUTE_PERMISSIONS.create);

  const openCreateModal = () => {
    setEditingMcpServer(null);
    setIsFormOpen(true);
  };

  const openEditModal = (mcpServer: IRetrieveMcpServer) => {
    setEditingMcpServer(mcpServer);
    setIsFormOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Servidores MCP</h1>
          <p className={styles.pageSubtitle}>
            {currentCompany?.name} · Conecte ferramentas externas aos agentes da empresa.
          </p>
        </div>
        <button className={styles.createButton}
          onClick={openCreateModal}
          disabled={!canCreate}
          title={canCreate ? undefined : 'Você não tem permissão para adicionar servidores MCP'}
        >
          + Adicionar MCP
        </button>
      </div>

      <QueryBoundary>
        <McpServersListSection onEdit={openEditModal} />
      </QueryBoundary>

      <McpServerFormModal
        isOpen={isFormOpen}
        mcpServer={editingMcpServer}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};
