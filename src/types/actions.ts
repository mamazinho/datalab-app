export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// never in data makes this compatible with any ActionState<T> without falling back to any
export const INITIAL_ACTION_STATE: ActionState<never> = {
    success: false,
    timestamp: 0
};
