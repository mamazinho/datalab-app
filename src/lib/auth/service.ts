// AuthService: gerencia autenticação, tokens em memória e cache de usuário
import { writable, type Writable } from 'svelte/store';
import { DatalabAPI } from '../apis/datalab-api';
import type { ILoginUserRequest } from '../types/auth';
import type { IUserResponse } from '../types/users';

type User = IUserResponse;

export type AuthStateShape = {
  accessToken: string | null;
  expiresAt: number | null;
  user: User | null;
  userExpiresAt: number | null;
};

export class AuthService {
  public state: Writable<AuthStateShape>;
  private refreshTimer: number | null = null;
  private refreshing: Promise<string | null> | null = null;

  constructor() {
    this.state = writable<AuthStateShape>({ 
      accessToken: null, 
      expiresAt: null, 
      user: null, 
      userExpiresAt: null 
    });
  }

  /**
   * Obtém o token de acesso de forma síncrona
   * Útil para interceptors do axios
   */
  getAccessTokenSync(): string | null {
    let token: string | null = null;
    const unsub = this.state.subscribe(s => (token = s.accessToken));
    unsub();
    return token;
  }

  /**
   * Obtém o usuário de forma síncrona, respeitando o cache
   * Retorna null se o cache expirou
   */
  getUserSync(): User | null {
    let user: User | null = null;
    const unsub = this.state.subscribe(s => {
      user = s.user && s.userExpiresAt && s.userExpiresAt > Date.now() ? s.user : null;
    });
    unsub();
    return user;
  }

  /**
   * Define o token de acesso e agenda o refresh automático
   */
  private setAccessToken(token: string, expiresInSeconds = 300) {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    this.state.update(s => ({ ...s, accessToken: token, expiresAt }));
    this.scheduleRefresh(expiresAt);
  }

  /**
   * Define o usuário em cache com TTL
   */
  private setUser(user: User, ttlSeconds = 300) {
    const userExpiresAt = Date.now() + ttlSeconds * 1000;
    this.state.update(s => ({ ...s, user, userExpiresAt }));
  }

  /**
   * Limpa todo o estado de autenticação
   */
  private clear() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.state.set({ 
      accessToken: null, 
      expiresAt: null, 
      user: null, 
      userExpiresAt: null 
    });
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
      // 1. Faz login e obtém o token
      const loginResponse = await DatalabAPI.AuthResource.login(credentials);
      this.setAccessToken(loginResponse.access_token, loginResponse.expires_in);

      // 2. Busca dados do usuário
      const user = await DatalabAPI.UsersResource.me();
      this.setUser(user, 5 * 60); // Cache de 5 minutos

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
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      this.clear();
    }
  }

  /**
   * Atualiza o token de acesso usando o refresh token
   * Implementa coalescing para evitar múltiplas chamadas simultâneas
   */
  async refreshAccessToken(): Promise<string> {
    // Se já existe uma chamada de refresh em andamento, retorna a mesma promise
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
  async tryRestoreSession(): Promise<boolean> {
    try {
      // Tenta fazer refresh
      await this.refreshAccessToken();
      
      // Busca dados do usuário
      const user = await DatalabAPI.UsersResource.me();
      this.setUser(user, 5 * 60);
      
      return true;
    } catch (error) {
      console.error('Falha ao restaurar sessão:', error);
      this.clear();
      return false;
    }
  }

  /**
   * Obtém os dados do usuário atual
   * Usa cache se disponível, senão busca do servidor
   */
  async getCurrentUser(): Promise<User | null> {
    // Verifica se tem cache válido
    const cachedUser = this.getUserSync();
    if (cachedUser) {
      return cachedUser;
    }

    // Verifica se tem token
    const token = this.getAccessTokenSync();
    if (!token) {
      return null;
    }

    try {
      const user = await DatalabAPI.UsersResource.me();
      this.setUser(user, 5 * 60);
      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessTokenSync();
    return token !== null;
  }
}

// Singleton da instância do AuthService
export const auth = new AuthService();

// Store exportada para uso em componentes Svelte
export const authState = auth.state;