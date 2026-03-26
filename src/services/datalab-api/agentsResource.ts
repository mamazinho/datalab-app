import { axiosPrivateInstance } from "./axios";

export interface IListAvailableModelsResponse {
  models: string[];
  provider: string;
}

export const AgentsResource = {
  async listAvailableModels(): Promise<IListAvailableModelsResponse[]> {
    const response = await axiosPrivateInstance.get('agents/available-models');
    return response.data as IListAvailableModelsResponse[];
  }
}