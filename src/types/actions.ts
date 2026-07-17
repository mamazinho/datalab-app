export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// O tipo 'never' no data garante que esse objeto seja compatível com qualquer ActionState<T>,
// pois T | undefined é sempre compatível com undefined.
// Não usamos 'any' para manter segurança de tipo.
export const INITIAL_ACTION_STATE: ActionState<never> = {
    success: false,
    timestamp: 0
};
