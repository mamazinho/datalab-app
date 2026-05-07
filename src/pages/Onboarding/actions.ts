import { DatalabAPI } from "../../services/datalab-api";
import type { ICreateCompanyResponse } from "../../services/datalab-api/companiesResource";
import type { ActionState } from "../../types/actions";

export async function createCompanyAction(
  _prevState: ActionState<ICreateCompanyResponse>,
  formData: FormData,
): Promise<ActionState<ICreateCompanyResponse>> {
  const name = formData.get("name") as string;

  if (!name || name.trim().length < 2) {
    return {
      success: false,
      error: "O nome da empresa deve ter pelo menos 2 caracteres.",
      timestamp: Date.now(),
    };
  }

  try {
    const data = await DatalabAPI.CompaniesResource.createCompany({ name: name.trim() });
    return {
      success: true,
      data,
      timestamp: Date.now(),
    };
  } catch (error: Error | unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Falha ao criar empresa: ${message}`,
      timestamp: Date.now(),
    };
  }
}

export async function acceptInviteAction(
  _prevState: ActionState<never>,
  formData: FormData,
): Promise<ActionState<never>> {
  const inviteId = Number(formData.get("inviteId"));

  try {
    await DatalabAPI.UsersResource.acceptInvite(inviteId);
    return { success: true, timestamp: Date.now() };
  } catch (error: Error | unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message, timestamp: Date.now() };
  }
}

export async function declineInviteAction(
  _prevState: ActionState<never>,
  formData: FormData,
): Promise<ActionState<never>> {
  const inviteId = Number(formData.get("inviteId"));

  try {
    await DatalabAPI.UsersResource.declineInvite(inviteId);
    return { success: true, timestamp: Date.now() };
  } catch (error: Error | unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message, timestamp: Date.now() };
  }
}
