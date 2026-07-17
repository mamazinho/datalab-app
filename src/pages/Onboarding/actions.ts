import { DatalabAPI } from "../../services/datalab-api";
import type { ICreateCompanyResponse } from "../../services/datalab-api/companiesResource";
import type { ActionState } from "../../types/actions";
import { createCompanySchema } from "./schemas";

export async function createCompanyAction(
  _prevState: ActionState<ICreateCompanyResponse>,
  formData: FormData,
): Promise<ActionState<ICreateCompanyResponse>> {
  const parsed = createCompanySchema.safeParse({
    name: formData.get("name") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      timestamp: Date.now(),
    };
  }

  try {
    const data = await DatalabAPI.CompaniesResource.createCompany(parsed.data);
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
