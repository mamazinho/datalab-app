export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  // The `detail` of the API error contract, for forms that point each problem at its field
  errorDetail?: unknown;
  traceId?: string;
  timestamp: number;
}

// never in data makes this compatible with any ActionState<T> without falling back to any
export const INITIAL_ACTION_STATE: ActionState<never> = {
    success: false,
    timestamp: 0
};
