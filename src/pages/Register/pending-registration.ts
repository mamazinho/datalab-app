import { isUuid7, type UUID7 } from '../../types/ids';

const PENDING_REGISTRATION_KEY = 'pendingRegistration';

export interface IPendingRegistration {
  id: UUID7;
  email: string;
}

export const loadPendingRegistration = (): IPendingRegistration | null => {
  try {
    const saved = JSON.parse(localStorage.getItem(PENDING_REGISTRATION_KEY) ?? 'null');
    return isUuid7(saved?.id) && typeof saved?.email === 'string' ? { id: saved.id, email: saved.email } : null;
  } catch {
    return null;
  }
};

export const savePendingRegistration = (registration: IPendingRegistration): void =>
  localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(registration));

export const clearPendingRegistration = (): void => localStorage.removeItem(PENDING_REGISTRATION_KEY);
