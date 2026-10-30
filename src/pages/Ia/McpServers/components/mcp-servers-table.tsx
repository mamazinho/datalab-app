import mcpServersStyles from '../mcp-servers.module.css';
import styles from '../../ia.module.css';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { PermissionGate } from '../../../../components/Tools/permission-gate';
import { mcpServersQuery } from '../../../../queries';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IRetrieveMcpServer } from '../../../../services/datalab-api/mcpServersResource';
import type { UUID7 } from '../../../../types/ids';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import { AUTH_TYPE_LABELS } from '../schemas';

interface IMcpServersTableProps {
  mcpServers: IRetrieveMcpServer[];
  onEdit: (mcpServer: IRetrieveMcpServer) => void;
}

export const McpServersTable = ({ mcpServers, onEdit }: IMcpServersTableProps) => {
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<UUID7 | null>(null);

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
    return <p className={styles.emptyMessage}>Nenhum servidor MCP cadastrado.</p>;
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
          <td><span className={mcpServersStyles.mcpName}>{mcpServer.name}</span></td>
          <td>{mcpServer.agent_name}</td>
          <td><span className={mcpServersStyles.mcpUrl} title={mcpServer.url}>{mcpServer.url}</span></td>
          <td>{AUTH_TYPE_LABELS[mcpServer.auth_type]}</td>
          <td>
            <PermissionGate route={[MCP_SERVER_ROUTE_PERMISSIONS.update, MCP_SERVER_ROUTE_PERMISSIONS.remove]}>
              <TableActions>
                <PermissionGate route={MCP_SERVER_ROUTE_PERMISSIONS.update}>
                  <TableAction disabled={removingId === mcpServer.id} onClick={() => onEdit(mcpServer)}>
                    Editar
                  </TableAction>
                </PermissionGate>
                <PermissionGate route={MCP_SERVER_ROUTE_PERMISSIONS.remove}>
                  <TableAction disabled={removingId === mcpServer.id} onClick={() => void handleRemove(mcpServer)}>
                    {removingId === mcpServer.id ? 'Removendo...' : 'Remover'}
                  </TableAction>
                </PermissionGate>
              </TableActions>
            </PermissionGate>
          </td>
        </TableRow>
      ))}
    </ActionTable>
  );
};
