import { DatalabAPI } from '../apis/datalab-api';
import type { ILoginUserRequest } from '../types/auth';
import type { IUserResponse } from '../types/users';

type User = IUserResponse;

export type AuthStateShape = {
  user: User | null;
};

export class AuthService {
  private _state = $state<AuthStateShape>({ 
    user: null, 
  });

  private refreshTimer: number | null = null;
  private refreshing: Promise<string | null> | null = null;
  private ensurePromise: Promise<boolean> | null = null;
  

  get isAuthenticated(): boolean {
    return localStorage.getItem('accessToken') !== null;
  }

  get currentUser(): User | null {
    return this._state.user || null;
  }

  get accessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setAccessToken(token: string, expiresInSeconds = 300) {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem('accessToken', token);
    this.scheduleRefresh(expiresAt);
  }

  private setUser(user: User) {
    this._state.user = user;
  }

  /**
   * Limpa todo o estado de autenticação
   */
  private clear() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    localStorage.removeItem('accessToken');
    this._state.user = null;
    cookieStore.delete('refreshToken');
  }

  /**
   * Agenda o refresh automático do token
   * Refresh acontece 60 segundos antes da expiração
   */
  private scheduleRefresh(expiresAt: number) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    const now = Date.now();
    const refreshBeforeMs = 60_000; // 60 segundos antes
    const timeUntilRefresh = Math.max(0, expiresAt - now - refreshBeforeMs);
    
    this.refreshTimer = window.setTimeout(async () => {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('Falha no refresh automático:', error);
        this.clear();
      }
    }, timeUntilRefresh);
  }

  /**
   * Faz login do usuário
   * Retorna os dados do usuário se bem-sucedido
   */
  async login(credentials: ILoginUserRequest): Promise<User> {
    try {
      const loginResponse = await DatalabAPI.AuthResource.login(credentials);
      this.setAccessToken(loginResponse.access_token, loginResponse.expires_in);

      const user = await DatalabAPI.UsersResource.me();
      this.setUser(user);

      return user;
    } catch (error) {
      this.clear();
      throw error;
    }
  }

  /**
   * Faz logout do usuário
   * Limpa o estado local e invalida o refresh token no servidor
   */
  async logout(): Promise<void> {
    try {
      await DatalabAPI.AuthResource.logout();
      this.clear();
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
      this.clear();
    }
  }

  /**
   * Atualiza o token de acesso usando o refresh token
   * Implementa coalescing para evitar múltiplas chamadas simultâneas
   */
  async refreshAccessToken(): Promise<string|null> {
    if (this.refreshing) {
      const result = await this.refreshing;
      if (!result) throw new Error('Refresh token inválido');
      return result;
    }

    this.refreshing = (async () => {
      try {
        const refreshResponse = await DatalabAPI.AuthResource.refresh_token();
        this.setAccessToken(refreshResponse.access_token, refreshResponse.expires_in);
        return refreshResponse.access_token;
      } catch (error) {
        this.clear();
        throw error;
      }
    })();

    try {
      const result = await this.refreshing;
      if (!result) throw new Error('Refresh token inválido');
      return result;
    } finally {
      this.refreshing = null;
    }
  }

  /**
   * Tenta restaurar a sessão ao iniciar a aplicação
   * Usa o refresh token armazenado no cookie httpOnly
   */
  async ensureSession(): Promise<boolean> {
    if (this.isAuthenticated) return true;
    if (this.ensurePromise) return this.ensurePromise;

    this.ensurePromise = (async () => {
      try {
        await this.refreshAccessToken();
        const user = await DatalabAPI.UsersResource.me();
        this.setUser(user);
        
        return true;
      } catch  {
        this.clear();
        return false;
      }
    })();

    return this.ensurePromise;
  }
}

// Singleton da instância do AuthService
export const auth = new AuthService();