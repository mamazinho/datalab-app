import { DatalabAPI } from "../../services/datalab-api";
import type { ActionState } from "../../types/actions";


export const changePasswordAction = async (_prevState: ActionState, formData: FormData): Promise<ActionState> => {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const email = formData.get('email') as string;
    const code = formData.get('code') as string;

    if (password !== confirmPassword) {
        return { success: false, error: 'As senhas não coincidem.', timestamp: Date.now() };
    }

    if (!email || !code) {
        return { success: false, error: 'Link inválido (email ou código ausente).', timestamp: Date.now() };
    }

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