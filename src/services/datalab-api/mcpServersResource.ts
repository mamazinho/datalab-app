import { axiosCompanyInstance } from "./axios";
import type { UUID7 } from "../../types/ids";

export type McpTransport = 'streamable_http' | 'sse';

export type McpAuthType = 'none' | 'bearer' | 'static_header';

export type IMcpServerAuth =
  | { type: 'none' }
  | { type: 'bearer'; token: string }
  | { type: 'static_header'; header_name: string; header_value: string };

export interface IRetrieveMcpServer {
  id: UUID7;
  agent_id: UUID7;
  agent_name: string;
  name: string;
  url: string;
  transport: McpTransport;
  auth_type: McpAuthType;
  auth_header_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ICreateMcpServerRequest {
  agent_id: UUID7;
  name: string;
  url: string;
  transport?: McpTransport;
  auth: IMcpServerAuth;
}

export type IUpdateMcpServerRequest = Partial<ICreateMcpServerRequest>;

export interface IMcpServerTool {
  name: string;
  description: string | null;
}

export interface ITestMcpServerResponse {
  ok: boolean;
  tools: IMcpServerTool[];
  error: string | null;
}

export const McpServersResource = {
  async listMcpServers(): Promise<IRetrieveMcpServer[]> {
    const response = await axiosCompanyInstance.get('agents/mcp-servers/');
    return response.data as IRetrieveMcpServer[];
  },
  async createMcpServer(payload: ICreateMcpServerRequest): Promise<IRetrieveMcpServer> {
    const response = await axiosCompanyInstance.post('agents/mcp-servers/', payload);
    return response.data as IRetrieveMcpServer;
  },
  async updateMcpServer(mcpServerId: UUID7, payload: IUpdateMcpServerRequest): Promise<IRetrieveMcpServer> {
    const response = await axiosCompanyInstance.patch(`agents/mcp-servers/${mcpServerId}/`, payload);
    return response.data as IRetrieveMcpServer;
  },
  async deleteMcpServer(mcpServerId: UUID7): Promise<void> {
    await axiosCompanyInstance.delete(`agents/mcp-servers/${mcpServerId}/`);
  },
  async testMcpServer(payload: ICreateMcpServerRequest): Promise<ITestMcpServerResponse> {
    const response = await axiosCompanyInstance.post('agents/mcp-servers/test/', payload);
    return response.data as ITestMcpServerResponse;
  },
}
