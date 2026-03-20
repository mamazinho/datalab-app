import { DatalabAPI } from "../../services/datalab-api";
import type { ActionState } from "../../types/actions";
import { changePasswordSchema } from "./schemas";

export const changePasswordAction = async (_prevState: ActionState, formData: FormData): Promise<ActionState> => {
    const result = changePasswordSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { 
            success: false, 
            error: result.error.issues[0]?.message || 'Parâmetros inválidos.', 
            timestamp: Date.now() 
        };
    }

    const { email, code, password } = result.data;

    try {
        await DatalabAPI.UsersResource.changePassword({
            user_email: email,
            code: code,
            new_password: password
        });
        return { success: true, timestamp: Date.now() };
    } catch (err) {
        console.error("Change password error:", err);
        return { success: false, error: 'Erro ao alterar senha. O link pode ter expirado.', timestamp: Date.now() };
    }
};