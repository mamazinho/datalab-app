# Autenticação, carregamento inicial e resiliência

> Como o app decide entre **app / login / onboarding / tela de erro** ao abrir,
> e como ele se comporta quando o token é inválido ou o backend está fora do ar.
> Todos os exemplos são código real do projeto.

O fluxo em uma frase:

> **token** (localStorage) → `useMe()` busca **`/me`** → **AuthGate** libera a área privada → **guards** decidem empresa/permissão.

---

## 1. Duas coisas separadas: sessão e usuário

- **Sessão (estado de cliente)** — o `AuthContext` guarda só `accessToken` + `login`/`logout` (`src/contexts/auth/`). Nada de dados do servidor.
- **Usuário (estado de servidor)** — os dados do `/me` são uma query `['me']` (`useMe()` em `src/hooks/use-me.ts`), `enabled` apenas quando há token.

Isso importa porque o app precisa distinguir **três** situações que antes eram confundidas como "sem empresa → onboarding":

| Situação | Destino correto |
|---|---|
| `/me` carregou e o usuário **não tem empresa** | `/onboarding` |
| Token **inválido/expirado** (401) | `/login` |
| Backend **fora do ar** (5xx/rede) | Tela de erro com "Tentar novamente" |

---

## 2. AuthGate — o portão da área autenticada

`src/routes/auth-gate.tsx` resolve o `/me` **antes** de renderizar a área privada. Enquanto isso não acontece, ninguém decide rota com base em dado incompleto:

```tsx
export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { data: me, error, refetch } = useMe();

  if (me) return <>{children}</>;                    // sucesso → app

  const isAuthError = axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403);

  if (error && !isAuthError) {                        // erro de servidor → tela de erro + retry
    return <ServerErrorComponent error={error} resetErrorBoundary={() => void refetch()} />;
  }

  return <LoadingPiece />;                            // carregando (ou 401 em transição p/ logout)
};
```

O `isAuthError` evita um flash: num 401 o logout está a caminho (ver §3), então mostramos spinner em vez da tela de erro — o token some e o guard redireciona para `/login`.

**Onde é usado** (`src/routes/wrappers.tsx`): tanto em `PrivateRoutes` quanto em `OnboardingRoute`, porque as duas áreas precisam do `/me` resolvido (o onboarding usa `me.companies`). Como o AuthGate garante `me` carregado, os guards internos ficaram simples — só olham empresa/permissão, sem mais checagens de "auth carregando":

```tsx
export const CompanyRoutes = () => {
  const { currentCompany } = useCompanyContext();
  return currentCompany !== null ? <Outlet /> : <Navigate to="/onboarding" replace />;
};
```

---

## 3. Fim de sessão é central no axios (401 → login)

Antes, só um 401 com a mensagem exata `"Invalid token"` era tratado; qualquer outra mensagem escapava e o app caía em `/onboarding`. Agora, **qualquer 401 não-recuperável encerra a sessão** — a lógica vive num único lugar, o interceptor de resposta em `src/services/datalab-api/axios.ts`:

```ts
if (error.response.status === 401) {
  // 1) tenta um refresh silencioso uma vez (401 "Invalid token" recuperável)
  if (config && !config._retry && refreshableErrors.some(m => message.includes(m))) {
    config._retry = true;
    try { /* refresh + repete a request original */ }
    catch { return Promise.reject(error); } // refreshToken já encerra a sessão
  }
  // 2) qualquer outro 401 = sessão inválida → encerra e volta ao login
  endSession();
  return Promise.reject(error);
}
```

`endSession()` faz **soft logout** (sem recarregar a página) através de um handler que o `AuthProvider` registra:

```ts
// axios.ts — o app injeta como encerrar a sessão
let _onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) { _onSessionExpired = handler; }
function endSession() {
  if (_onSessionExpired) { _onSessionExpired(); return; }   // soft: logout via React
  window.location.href = '/login';                          // fallback (reload) se não registrado
}
```

```ts
// AuthProvider — registra o logout como handler
useEffect(() => {
  setSessionExpiredHandler(logout);          // logout = limpa token + queryClient.clear()
  return () => setSessionExpiredHandler(null);
}, [logout]);
```

Resultado: token inválido → 401 → `endSession()` → `logout()` (token some, cache limpo) → os guards veem "sem token" → **`/login`**. Nunca mais `/onboarding` por sessão inválida. Como o `/me` roda já no boot (via `CompanyBootstrap`), isso vale inclusive ao abrir o app numa aba nova.

> `403` (sem permissão) **não** encerra a sessão — é erro de autorização, não de autenticação; passa como erro normal.

---

## 4. Retry: não martelar o backend fora do ar

Política compartilhada em `src/utils/query-retry.ts`, aplicada globalmente no `QueryClient` (`src/App.tsx`):

```ts
export const MAX_QUERY_RETRIES = 10;
export const QUERY_RETRY_DELAY_MS = 3000;

export const shouldRetryQuery = (failureCount, error) => {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === undefined) return true; // rede/servidor inacessível → retenta
    return status >= 500;                   // 5xx → retenta; 4xx → não
  }
  return true;
};
```

```ts
new QueryClient({
  defaultOptions: { queries: { retry: shouldRetryQuery, retryDelay: QUERY_RETRY_DELAY_MS, staleTime: 30_000 } },
});
```

- **5xx / erro de rede** → retenta até **10×**, espaçado **3s** — sem a enxurrada de requests instantâneas de antes.
- **4xx** (401/403/404, validação) → **nunca** retenta (não se resolvem com o tempo).
- Enquanto retenta, o AuthGate mostra spinner; esgotadas as tentativas, mostra a tela de erro com "Tentar novamente" (que refaz o `/me`).

**Tunável:** o pior caso de spinner é `MAX_QUERY_RETRIES × QUERY_RETRY_DELAY_MS` (hoje ~30s). Baixe as constantes se for muito para as telas internas.

---

## 5. Cenários

| Cenário | O que acontece |
|---|---|
| Token válido | `/me` carrega → app |
| Sem token | `/login` |
| Token inválido/expirado | 401 → `endSession` → logout → **`/login`** |
| Sessão expira durante o uso | qualquer request 401 → `endSession` → volta ao `/login` |
| Backend fora do ar | retenta 10×3s (spinner) → **tela de erro + "Tentar novamente"** |
| `/me` ok, sem empresa | `/onboarding` |
| `/me` ok, com empresa | app |

---

## Verificação manual (`yarn dev`)

1. **Token inválido** no localStorage + backend up → cai em `/login` (não `/onboarding`).
2. **Backend desligado** + logado → spinner por ~30s, depois "Falha no Servidor / Tentar novamente"; sem enxurrada no Network.
3. **Fluxo normal**: login → app; logout → login; sessão expirando no meio do uso → volta ao login sozinha.

Ver também [tanstack-query.md](./tanstack-query.md) para o funcionamento das queries/cache.
