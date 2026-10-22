import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { useCompanyContext } from '../../../../contexts/company';
import { mcpServersQuery } from '../../../../queries';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IRetrieveMcpServer } from '../../../../services/datalab-api/mcpServersResource';
import type { UUID7 } from '../../../../types/ids';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import { EmptyMessage } from '../../ia.style';
import { AUTH_TYPE_LABELS } from '../schemas';
import { McpName, McpUrl } from '../mcp-servers.style';

interface IMcpServersTableProps {
  mcpServers: IRetrieveMcpServer[];
  onEdit: (mcpServer: IRetrieveMcpServer) => void;
}

export const McpServersTable = ({ mcpServers, onEdit }: IMcpServersTableProps) => {
  const { hasPermissionByRoute } = useCompanyContext();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<UUID7 | null>(null);

  const canUpdate = hasPermissionByRoute(MCP_SERVER_ROUTE_PERMISSIONS.update);
  const canRemove = hasPermissionByRoute(MCP_SERVER_ROUTE_PERMISSIONS.remove);

  const handleRemove = async (mcpServer: IRetrieveMcpServer) => {
    if (!window.confirm(`Remover o servidor MCP "${mcpServer.name}"?`)) return;
    setRemovingId(mcpServer.id);
    try {
      await DatalabAPI.McpServersResource.deleteMcpServer(mcpServer.id);
      toast.success('Servidor MCP removido.');
      void queryClient.invalidateQueries({ queryKey: mcpServersQuery.queryKey });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover o servidor MCP.');
    } finally {
      setRemovingId(null);
    }
  };

  if (mcpServers.length === 0) {
    return <EmptyMessage>Nenhum servidor MCP cadastrado.</EmptyMessage>;
  }

  return (
    <ActionTable>
      <TableHeaders>
        <th>Nome</th>
        <th>Agente</th>
        <th>URL</th>
        <th>Autenticação</th>
      </TableHeaders>

      {mcpServers.map((mcpServer) => (
        <TableRow key={mcpServer.id}>
          <td><McpName>{mcpServer.name}</McpName></td>
          <td>{mcpServer.agent_name}</td>
          <td><McpUrl title={mcpServer.url}>{mcpServer.url}</McpUrl></td>
          <td>{AUTH_TYPE_LABELS[mcpServer.auth_type]}</td>
          <td>
            {(canUpdate || canRemove) && (
              <TableActions>
                {canUpdate && (
                  <TableAction disabled={removingId === mcpServer.id} onClick={() => onEdit(mcpServer)}>
                    Editar
                  </TableAction>
                )}
                {canRemove && (
                  <TableAction disabled={removingId === mcpServer.id} onClick={() => void handleRemove(mcpServer)}>
                    {removingId === mcpServer.id ? 'Removendo...' : 'Remover'}
                  </TableAction>
                )}
              </TableActions>
            )}
          </td>
        </TableRow>
      ))}
    </ActionTable>
  );
};
