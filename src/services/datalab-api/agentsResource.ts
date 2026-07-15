import { axiosCompanyInstance } from "./axios";

export interface IListAvailableModelsResponse {
  models: string[];
  provider: string;
}

export type AgentType = 'supervisor' | 'specialist';

export interface IMcpServer {
  id: number;
  name: string;
  url: string;
  transport: string;
  auth_type: string;
}

export interface IRetrieveAgent {
  id: number;
  type: AgentType;
  key: string;
  name: string;
  avatar_url?: string | null;
  description: string;
  model_name: string;
  is_system: boolean;
  is_active: boolean;
  mcp_servers: IMcpServer[];
}

export interface IRetrieveAgentWithState extends IRetrieveAgent {
  disabled_by_company: boolean;
  disabled_by_user: boolean;
  is_enabled: boolean;
}

export interface ICreateSpecialistRequest {
  name: string;
  avatar_url?: string;
  description?: string;
  instructions: string;
  model_name?: string;
}

export type IUpdateSpecialistRequest = Partial<ICreateSpecialistRequest>;

export const AgentsResource = {
  async listAvailableModels(): Promise<IListAvailableModelsResponse[]> {
    const response = await axiosCompanyInstance.get('agents/available-models');
    return response.data as IListAvailableModelsResponse[];
  },
  async listAgents(): Promise<IRetrieveAgentWithState[]> {
    const response = await axiosCompanyInstance.get('agents/');
    return response.data as IRetrieveAgentWithState[];
  },
  async createSpecialist(payload: ICreateSpecialistRequest): Promise<IRetrieveAgent> {
    const response = await axiosCompanyInstance.post('agents/', payload);
    return response.data as IRetrieveAgent;
  },
  async updateSpecialist(agentId: number, payload: IUpdateSpecialistRequest): Promise<IRetrieveAgent> {
    const response = await axiosCompanyInstance.patch(`agents/${agentId}/`, payload);
    return response.data as IRetrieveAgent;
  },
  async deleteSpecialist(agentId: number): Promise<void> {
    await axiosCompanyInstance.delete(`agents/${agentId}/`);
  },
  async setCompanyState(agentId: number, enabled: boolean): Promise<void> {
    await axiosCompanyInstance.put(`agents/${agentId}/company-state/`, { enabled });
  },
  async setUserState(agentId: number, enabled: boolean): Promise<void> {
    await axiosCompanyInstance.put(`agents/${agentId}/user-state/`, { enabled });
  },
}
