import mcpServersStyles from '../mcp-servers.module.css';
import styles from '../../ia.module.css';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { PermissionGate } from '../../../../components/Tools/permission-gate';
import { useConfirm } from '../../../../contexts/confirm';
import { mcpServersQuery } from '../../../../queries';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IRetrieveMcpServer } from '../../../../services/datalab-api/mcpServersResource';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import { AUTH_TYPE_LABELS } from '../schemas';
import { useRowActions } from '../../../../hooks/use-row-actions';

interface IMcpServersTableProps {
  mcpServers: IRetrieveMcpServer[];
  onEdit: (mcpServer: IRetrieveMcpServer) => void;
}

export const McpServersTable = ({ mcpServers, onEdit }: IMcpServersTableProps) => {
  const confirm = useConfirm();
  const { rows, busyId, run } = useRowActions(mcpServersQuery.queryKey, mcpServers);

  const handleRemove = async (mcpServer: IRetrieveMcpServer) => {
    const confirmed = await confirm({
      title: 'Remover servidor MCP',
      message: `Remover o servidor MCP "${mcpServer.name}"?`,
      confirmLabel: 'Remover',
    });
    if (!confirmed) return;
    run({
      id: mcpServer.id,
      request: () => DatalabAPI.McpServersResource.deleteMcpServer(mcpServer.id),
      successMessage: 'Servidor MCP removido.',
      optimistic: null,
    });
  };

  if (rows.length === 0) {
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

      {rows.map((mcpServer) => (
        <TableRow key={mcpServer.id}>
          <td><span className={mcpServersStyles.mcpName}>{mcpServer.name}</span></td>
          <td>{mcpServer.agent_name}</td>
          <td><span className={mcpServersStyles.mcpUrl} title={mcpServer.url}>{mcpServer.url}</span></td>
          <td>{AUTH_TYPE_LABELS[mcpServer.auth_type]}</td>
          <td>
            <PermissionGate route={[MCP_SERVER_ROUTE_PERMISSIONS.update, MCP_SERVER_ROUTE_PERMISSIONS.remove]}>
              <TableActions>
                <PermissionGate route={MCP_SERVER_ROUTE_PERMISSIONS.update}>
                  <TableAction disabled={busyId === mcpServer.id} onClick={() => onEdit(mcpServer)}>
                    Editar
                  </TableAction>
                </PermissionGate>
                <PermissionGate route={MCP_SERVER_ROUTE_PERMISSIONS.remove}>
                  <TableAction disabled={busyId === mcpServer.id} onClick={() => void handleRemove(mcpServer)}>
                    Remover
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
