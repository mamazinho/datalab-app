import { useState } from 'react';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { useCompanyContext } from '../../../contexts/company';
import { useMcpServers } from '../../../hooks/use-mcp-servers';
import type { IRetrieveMcpServer } from '../../../services/datalab-api/mcpServersResource';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { McpServersTable } from './components/mcp-servers-table';
import { McpServerFormModal } from './components/mcp-server-form-modal';
import { CreateButton, PageContainer, PageHeader, PageSubtitle, PageTitle } from '../ia.style';

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
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Servidores MCP</PageTitle>
          <PageSubtitle>
            {currentCompany?.name} · Conecte ferramentas externas aos agentes da empresa.
          </PageSubtitle>
        </div>
        <CreateButton
          onClick={openCreateModal}
          disabled={!canCreate}
          title={canCreate ? undefined : 'Você não tem permissão para adicionar servidores MCP'}
        >
          + Adicionar MCP
        </CreateButton>
      </PageHeader>

      <QueryBoundary>
        <McpServersListSection onEdit={openEditModal} />
      </QueryBoundary>

      <McpServerFormModal
        isOpen={isFormOpen}
        mcpServer={editingMcpServer}
        onClose={() => setIsFormOpen(false)}
      />
    </PageContainer>
  );
};
