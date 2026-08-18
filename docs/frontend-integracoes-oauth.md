# Integrações OAuth2 (Google + Meta) — guia de implementação no front

> App alvo: React 19. Este documento descreve **o contrato final da API** já implementado no backend.
> Tudo abaixo está sob o prefixo `/v1`.

---

## 1. O modelo mental

Existem **dois fluxos** que usam o mesmo app OAuth de cada provider, mudando apenas os **escopos pedidos**:

| Fluxo | Quando | Autenticação exigida | O que pede |
|---|---|---|---|
| `login` | tela de login | nenhuma (usuário anônimo) | só identidade (perfil/e-mail) |
| `connect` | tela de integrações | Bearer token da Datalab | identidade + escopos da integração escolhida |

Cada consentimento novo **soma** permissões à conexão existente (não substitui):
o Google usa `include_granted_scopes`, o Meta acumula permissões no mesmo usuário do app.
Por isso o usuário pode logar com o Google e depois ativar Analytics e Ads em momentos separados,
e pode ativar Meta Ads mesmo **sem nunca ter logado com o Meta**.

Uma conexão = um par (usuário Datalab, provider). Os escopos concedidos ficam salvos nela.
Uma integração aparece como `connected: true` quando **todos** os escopos dela estão concedidos.

### Conectar não é o fim: falta escolher os ativos

Conectar dá **credencial**; ela enxerga tudo que aquela conta Google/Meta alcança — inclusive
projetos de outros clientes do mesmo usuário. Google e Meta não sabem escopar token por
propriedade, então quem delimita "o que esta empresa pode operar" é a Datalab.

Por isso cada company tem uma **allowlist de ativos**, definida pelo **owner**: as properties
do GA4, ad accounts do Meta, páginas e contas do Instagram que pertencem àquela empresa.
O agente só enxerga e só opera o que está nessa lista.

> Consequência de produto: **conexão sem allowlist não serve para nada** — a company fica com
> acesso zero, não com acesso total. A tela precisa deixar isso óbvio, e é por isso que a
> seleção de ativos vem logo depois do consentimento (§5).

### Catálogo de integrações

| `key` | `provider` | `is_login` | O que habilita |
|---|---|---|---|
| `google_login` | `google` | ✅ | Login com Google |
| `google_analytics` | `google` | — | Google Analytics (leitura/edição) |
| `google_ads` | `google` | — | Data Manager, AdSense, DoubleClick Search |
| `meta_login` | `meta` | ✅ | Login com Meta |
| `meta_ads` | `meta` | — | Meta Ads + Graph API (páginas e Instagram) |

---

## 2. Endpoints

### 2.1 `GET /v1/auth/integrations/` 🔒

Lista o catálogo **com o status do usuário logado**. É a fonte da tela de integrações.

```jsonc
[
  {
    "key": "google_analytics",
    "provider": "google",
    "label": "Google Analytics",
    "description": "Leitura e edição de propriedades e relatórios do Google Analytics",
    "is_login": false,
    "scopes": ["https://www.googleapis.com/auth/analytics", "..."],
    "connected": true,
    "missing_scopes": [],
    "token_expires_at": "2026-08-05T18:00:00Z",
    "connected_account_email": "usuario@empresa.com"
  }
]
```

- `connected` → botão "Desconectar" / selo ativo.
- `missing_scopes` não vazio com conta já conectada → é uma ativação **incremental** ("Conceder permissões").
- `connected_account_email` → mostra qual conta do provider está vinculada.

### 2.2 `GET /v1/auth/{provider}/login/` 🌐 (redirect do browser)

`provider` ∈ `google | meta`. **Não é XHR** — é navegação (`window.location.href = ...`).
Sem query params: o login pede só os escopos de identidade.

Ao final, o browser volta para
`CLIENT_URL/auth/{provider}/callback?access_token=...&refresh_token=...&token_type=bearer&expires_in=...&scope=user`
— exatamente o formato que o callback do Google já usava hoje. O fluxo do Meta é idêntico.

### 2.3 `GET /v1/auth/{provider}/authorize/` 🔒 (XHR)

Gera a URL de consentimento para **ativar uma integração** do usuário logado.

Por que aqui é XHR e o `/login/` é redirect: esta rota precisa saber **qual usuário Datalab**
está conectando, e uma navegação do browser não consegue mandar o header `Authorization`. Sem
isso, conectar o Meta Ads estando logado com Google não teria como saber em quem pendurar a
conexão. Então o `fetch` (que leva o header) devolve a URL e o front navega para ela.

Não é preciso `credentials: 'include'` — o `state` é autocontido e não depende de cookie.

Query param: `integration` (obrigatório) — ex.: `google_ads`

```json
{ "authorization_url": "https://accounts.google.com/o/oauth2/auth?..." }
```

É a mesma tela de consentimento do login, só que pedindo os escopos de identidade **mais** os da
integração. O provider soma ao que já foi concedido antes.

### 2.4 `GET /v1/auth/{provider}/callback/` 🌐

Chamado **pelo provider**, não pelo front. Um callback só para os dois fluxos:

- veio de `/login/` → `CLIENT_URL/auth/{provider}/callback?access_token=...&refresh_token=...&expires_in=...`
- veio de `/authorize/` → `CLIENT_URL/integrations/callback?provider=meta&integration=meta_ads&status=connected`

> O front nunca precisa lidar com `code`/`state`.

### 2.5 `GET /v1/auth/{provider}/token/` 🔒

Devolve o token OAuth do provider, **renovando automaticamente** se estiver a menos de 3 min do vencimento.
Google renova via `refresh_token`; Meta troca o token por um novo de longa duração (~60 dias).

```jsonc
{
  "id": "uuid", "provider": "google", "provider_user_id": "1179...",
  "provider_email": "usuario@empresa.com",
  "access_token": "ya29...",
  "refresh_token": "1//0e...",   // null no Meta
  "token_expires_at": "2026-08-05T18:00:00Z",
  "scopes": ["openid", "email", "..."],
  "user_id": "uuid", "created_at": "...", "updated_at": "..."
}
```

> ⚠️ Mudança: `refresh_token`, `provider_email` e `token_expires_at` agora podem ser `null`
> (o Meta não usa refresh token). A rota devolve **só a credencial** — o que a empresa pode
> operar e o que o membro pode fazer estão em `/v1/memberships/current/` (§6).

### 2.7 `GET /v1/companies/{id}/provider-assets/available/` 🔒👑

Ativos (properties, ad accounts, páginas, contas do Instagram) que a conta conectada **do owner** enxerga. É o insumo da tela de seleção.

Query param: `integration` (obrigatório) — `google_analytics` | `google_ads` | `meta_ads`

```jsonc
{
  "provider": "google",
  "integration": "google_analytics",
  "assets": [
    {
      "asset_type": "ga4_property",
      "external_id": "properties/123456",
      "name": "Acme — Site Principal",
      "parent_name": "Acme (conta)",
      "extra": {}
    }
  ],
  "allowed_external_ids": ["properties/123456"]
}
```

`allowed_external_ids` são os que **já estão** na allowlist — use para marcar os checkboxes iniciais.

### 2.8 `GET /v1/companies/{id}/provider-assets/` 🔒👑

Query opcional `provider=google|meta`. Devolve a allowlist salva:

```jsonc
[{ "id": "uuid", "provider": "google", "asset_type": "ga4_property",
   "external_id": "properties/123456", "name": "Acme — Site Principal",
   "parent_name": "Acme (conta)", "extra": {}, "company_id": "uuid",
   "created_at": "...", "updated_at": "..." }]
```

### 2.9 `POST /v1/companies/{id}/provider-assets/` 🔒

Adiciona **um** ativo à allowlist. Gated por **route permission**, como toda rota da API (owner
passa sempre) — é a mesma rota que a core-api chama depois de criar uma property nova.

```jsonc
{ "provider": "google",
  "asset": { "asset_type": "ga4_property", "external_id": "properties/123456",
             "name": "Acme — Site Principal", "parent_name": "Acme (conta)", "extra": {} } }
```

Idempotente: repetir com o mesmo `external_id` atualiza o nome em vez de duplicar.

### 2.10 `DELETE /v1/companies/{id}/provider-assets/{asset_id}/` 🔒👑

Remove um ativo. `204`, ou `404` se não existir naquela company.

🔒 = Bearer · 👑 = **somente owner** da company (membro comum recebe `403`) · 🌐 = navegação

> Todas as rotas de company exigem o header `X-Company-Id` **igual** ao `{id}` do path — é o padrão já usado nas outras rotas de company. Divergir devolve `404`.

### 2.6 `DELETE /v1/auth/{provider}/connection/` 🔒

Remove a conexão do provider inteiro (todas as integrações dele). `204` em sucesso, `404` se não havia conexão.
Não revoga o consentimento no lado do Google/Meta — na próxima conexão o provider pode pular a tela de consentimento.

🔒 = exige `Authorization: Bearer <access_token>` · 🌐 = navegação do browser

---

## 3. O que muda no front (checklist)

1. **Login**: trocar `/v1/auth/google/login/` por `/v1/auth/{provider}/login/` — o path do Google é idêntico ao atual, só ganhou `meta` como opção. Adicionar o botão "Entrar com Meta" (`/v1/auth/meta/login/`).
2. **Rota de retorno do login**: manter `/auth/google/callback` e adicionar `/auth/meta/callback` — mesmo formato de query string nos dois.
3. **Nova tela `/integrations`**: consome `GET /v1/auth/integrations/`.
4. **Nova rota `/integrations/callback`**: lê `status`, `provider`, `integration`, `error` da query string e — no sucesso — **abre direto a seleção de ativos** daquela integração (§5).
5. **Conectar**: `GET /v1/auth/{provider}/authorize/?integration=X` → `window.location.href = data.authorization_url`.
6. **Nova tela de seleção de ativos**, acessível tanto logo após conectar quanto depois, para editar/remover (§5). **Só owner.**
7. **Desconectar**: `DELETE /v1/auth/{provider}/connection/`.

---

## 4. Código de referência (React 19)

### 4.1 Tipos

```ts
export type Provider = "google" | "meta";
export type IntegrationKey =
  | "google_login" | "google_analytics" | "google_ads"
  | "meta_login" | "meta_ads";

export interface IntegrationStatus {
  key: IntegrationKey;
  provider: Provider;
  label: string;
  description: string;
  is_login: boolean;
  scopes: string[];
  connected: boolean;
  missing_scopes: string[];
  token_expires_at: string | null;
  connected_account_email: string | null;
}
```

### 4.2 Serviço

```ts
const API_URL = import.meta.env.VITE_API_URL; // ex.: http://localhost:8000

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export async function listIntegrations(): Promise<IntegrationStatus[]> {
  const response = await fetch(`${API_URL}/v1/auth/integrations/`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Não foi possível carregar as integrações");
  return response.json();
}

export async function startIntegration(provider: Provider, integration: IntegrationKey) {
  const response = await fetch(`${API_URL}/v1/auth/${provider}/authorize/?integration=${integration}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Não foi possível iniciar a integração");
  const { authorization_url } = await response.json();
  window.location.href = authorization_url; // sai da SPA de propósito
}

export function startProviderLogin(provider: Provider) {
  window.location.href = `${API_URL}/v1/auth/${provider}/login/`;
}

export async function disconnectProvider(provider: Provider) {
  const response = await fetch(`${API_URL}/v1/auth/${provider}/connection/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok && response.status !== 404) throw new Error("Não foi possível desconectar");
}
```

### 4.3 Tela de integrações

```tsx
import { useEffect, useState, useTransition } from "react";

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    listIntegrations().then(setIntegrations);
  }, []);

  const connectable = integrations.filter((integration) => !integration.is_login);

  return (
    <ul>
      {connectable.map((integration) => (
        <li key={integration.key}>
          <strong>{integration.label}</strong>
          <p>{integration.description}</p>
          {integration.connected ? (
            <>
              <span>Conectado — {integration.connected_account_email}</span>
              <button
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await disconnectProvider(integration.provider);
                    setIntegrations(await listIntegrations());
                  })
                }
              >
                Desconectar
              </button>
            </>
          ) : (
            <button
              disabled={isPending}
              onClick={() => startIntegration(integration.provider, integration.key)}
            >
              {integration.connected_account_email ? "Conceder permissões" : "Conectar"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
```

### 4.4 Rota de retorno da integração

```tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export function IntegrationCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get("status");
    const integration = searchParams.get("integration");
    if (status === "connected") {
      toast.success(`Integração ${integration} conectada`);
    } else {
      toast.error(searchParams.get("error") ?? "Não foi possível conectar");
    }
    navigate("/integrations", { replace: true });
  }, [searchParams, navigate]);

  return <p>Finalizando integração…</p>;
}
```

---

## 5. Seleção de ativos (properties, ad accounts, páginas, Instagram)

**Quem pode:** apenas o **owner** da company. Membro comum recebe `403` — não mostre a tela
para ele; mostre a allowlist em modo leitura, ou nada.

### 5.1 A jornada

```
[Integrações] → "Conectar Google Analytics"
      ↓  consentimento no Google
[/integrations/callback?status=connected&integration=google_analytics]
      ↓  SEM passar pela tela de integrações
[Seleção de ativos: "Quais properties pertencem a esta empresa?"]
      ↓  POST/DELETE provider-assets
[Integrações] com a integração ativa e "3 properties selecionadas"
```

Emendar a seleção logo após o callback é o ponto central: é o único momento em que o owner
tem o contexto fresco do que acabou de autorizar. Conectar e parar aí deixa a empresa com
acesso zero — e o usuário achando que terminou.

Depois, o mesmo componente é reaberto pelo card da integração ("Gerenciar ativos"), para
adicionar, remover ou trocar. Mesma tela, dois pontos de entrada.

### 5.2 Fluxo de dados

```
GET  /v1/companies/{id}/provider-assets/available/?integration=google_analytics
     → { assets: ProviderAsset[], allowed_external_ids: string[] }
     → agrupe por `parent_name`, marque os que estão em allowed_external_ids

POST   /v1/companies/{id}/provider-assets/           ← um por ativo marcado
DELETE /v1/companies/{id}/provider-assets/{asset_id}/ ← um por ativo desmarcado
```

**A allowlist é editada item a item**, não em lote: ao salvar, envie um `POST` para cada ativo
recém-marcado e um `DELETE` para cada desmarcado. Diffar contra `allowed_external_ids` é o
suficiente — e nada é apagado por engano, que é o risco de um "substitui tudo".

> O `id` para o `DELETE` vem de `GET /v1/companies/{id}/provider-assets/`, não do `available/`.

### 5.3 Tipos

```ts
export type AssetType =
  | "ga4_property" | "google_ads_customer"
  | "meta_ad_account" | "meta_page" | "meta_instagram_account";

export interface ProviderAsset {
  asset_type: AssetType;
  external_id: string;     // "properties/123456" | "act_9876" | "123-456-7890"
  name: string;
  parent_name: string | null;
  extra: Record<string, unknown>;
}

export interface AvailableAssets {
  provider: Provider;
  integration: IntegrationKey;
  assets: ProviderAsset[];
  allowed_external_ids: string[];
}

export interface CompanyProviderAsset extends ProviderAsset {
  id: string;
  provider: Provider;
  company_id: string;
  created_at: string;
  updated_at: string;
}
```

### 5.4 Como renderizar

Agrupe por `parent_name` — é ele que carrega a hierarquia do provider (conta do GA, Business
Manager do Meta). O `asset_type` vira um rótulo discreto; o owner não deve precisar entendê-lo.

```
Google Analytics                                    [Selecionar tudo]
  Acme (conta)
    ☑ Acme — Site Principal            properties/123456
    ☐ Acme — App                       properties/456789
  Cliente XPTO (conta)
    ☐ XPTO — Landing                   properties/999888

Meta Ads
  Acme Business                                     [Selecionar tudo]
    ☑ Acme Performance                 ad account
    ☑ Acme Brasil                      página
    ☑ @acme                            instagram
```

Cinco decisões que fazem essa tela funcionar:

1. **Nada vem pré-marcado numa company nova.** O owner opta por incluir. Esquecer de marcar
   deixa a empresa sem acesso (chato); esquecer de desmarcar daria acesso indevido (grave).
2. **"Selecionar tudo" por grupo.** No Meta, os ativos sob o mesmo Business Manager quase
   sempre são do mesmo cliente — um clique resolve a maioria dos casos.
3. **Mostre o `external_id`** em texto secundário. Nomes se repetem entre clientes ("Site
   Principal"); o id é o desempate.
4. **Estado vazio explícito.** Zero ativos = "Esta empresa ainda não pode operar o Google
   Analytics". Não deixe parecer que está tudo certo.
5. **Confirme remoções.** Tirar um ativo faz o agente perder acesso a ele na hora; explique
   isso no diálogo em vez de só perguntar "tem certeza?".

### 5.5 Serviço

```ts
export async function listAvailableAssets(
  companyId: string, integration: IntegrationKey,
): Promise<AvailableAssets> {
  const response = await fetch(
    `${API_URL}/v1/companies/${companyId}/provider-assets/available/?integration=${integration}`,
    { headers: { ...authHeaders(), "X-Company-Id": companyId } },
  );
  if (response.status === 403) throw new OwnerOnlyError();
  if (response.status === 400) throw new NotConnectedError();
  if (!response.ok) throw new Error("Não foi possível listar os ativos");
  return response.json();
}

export async function addAsset(
  companyId: string, provider: Provider, asset: ProviderAsset,
): Promise<CompanyProviderAsset> {
  const response = await fetch(`${API_URL}/v1/companies/${companyId}/provider-assets/`, {
    method: "POST",
    headers: { ...authHeaders(), "X-Company-Id": companyId, "Content-Type": "application/json" },
    body: JSON.stringify({ provider, asset }),
  });
  if (!response.ok) throw new Error("Não foi possível adicionar o ativo");
  return response.json();
}

export async function removeAsset(companyId: string, assetId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/v1/companies/${companyId}/provider-assets/${assetId}/`,
    { method: "DELETE", headers: { ...authHeaders(), "X-Company-Id": companyId } },
  );
  if (!response.ok && response.status !== 404) throw new Error("Não foi possível remover o ativo");
}
```

### 5.6 Contas do GA4 e criação de properties

Instrumentar o site de um cliente pode exigir **criar** uma property nova. Duas consequências
para a tela:

1. **`ga4_account` é um tipo de ativo.** A listagem do GA traz contas (`accounts/123`) além de
   properties. Liberar a **conta** é o que permite criar dentro dela. Deixe isso explícito:
   *"Liberar esta conta permite que o agente crie novas properties nela"*.
2. **Criar é uma permissão de pessoa**, não da empresa — ver §6.2.

Uma property criada pelo agente entra na allowlist automaticamente. A tela deve reconsultar
`GET provider-assets/` ao voltar de um chat que criou algo, ou o usuário vê a lista desatualizada.

### 5.7 Erros que a tela precisa tratar

| Situação | Resposta | O que mostrar |
|---|---|---|
| Não é owner | `403` | Esconder a edição; allowlist em leitura |
| Provider não conectado | `400` "No … credentials found" | CTA para conectar antes de selecionar |
| Token expirou / foi revogado | `400` na `available/` | "Reconecte sua conta Google" → fluxo de conectar |
| core-api fora do ar | `502` | Erro transitório, com botão de tentar de novo — **não** trate como "sem ativos" |
| Google Ads sem developer token | `502` ou lista vazia | Campo manual para o customer ID (ver §7) |

---

## 6. Autorização: dois escopos, uma chamada

São **duas camadas diferentes**, e confundi-las é a origem de quase todo bug nesta área:

| Camada | Dono | Campo | O que é |
|---|---|---|---|
| **Permissões do app** | pessoa | `permissions[]` | rotas da Datalab que ela pode chamar |
| **Permissões nos agentes** | pessoa | `provider_permissions{}` | tools que o agente pode executar por ela no provider |
| **Ativos da empresa** | company | `company.provider_assets[]` | onde qualquer membro pode operar |

> As duas primeiras são **independentes** e é assim de propósito: alguém pode ter permissão de
> criar uma property no GA4 pelo agente (`provider_permissions`) e **não** ter permissão de
> adicionar essa property à empresa (`permissions`, rota `POST provider-assets`), ou o contrário.
> Parece contraintuitivo, mas é o nível de granularidade que queremos — a tela deve tratá-las
> como duas seções separadas, nunca como uma só.

`GET /v1/memberships/current/` devolve as duas — a de company aninhada em `company`, onde ela
de fato mora (as mesmas rotas de company também a devolvem, §2.8):

```jsonc
{
  "id": "uuid", "membership_role": "member", "status": "active",

  "company": {
    "id": "uuid", "name": "Acme", "status": "active",
    "provider_assets": [{ "id": "uuid", "provider": "google", "asset_type": "ga4_property",
                          "external_id": "properties/123456", "name": "Acme — Site Principal",
                          "parent_name": "Acme (conta)", "extra": {}, "company_id": "uuid",
                          "created_at": "...", "updated_at": "..." }]
  },

  "permissions": [{ "id": "uuid", "method": "POST", "path": "/v1/companies/{id}/...",
                    "name": "...", "description": "...", "tag": "companies",
                    "created_at": "...", "updated_at": "..." }],

  "provider_permissions": {
    "google": [{ "id": "uuid", "key": "ga4_property_create", "provider": "google",
                 "name": "Criar propriedades no Google Analytics", "description": "...",
                 "created_at": "...", "updated_at": "..." }],
    "meta": []
  }
}
```

Três coisas que evitam bug:

- **Tudo já vem resolvido.** Owner recebe o catálogo inteiro, membro recebe o que lhe foi
  concedido. Você **não** precisa checar `membership_role` para interpretar: se está na lista,
  pode. Não existe campo "efetivo" separado — é este.
- **`provider_permissions` é um dict por plataforma**, não uma lista. Para saber se pode criar
  property: `provider_permissions.google?.some(p => p.key === "ga4_property_create")`.
- **`company.provider_assets` é da empresa, não da pessoa.** Todo membro vê a mesma lista. Trocar
  de empresa troca a lista inteira — invalide qualquer cache ao trocar `X-Company-Id`.

> `/current/` responde "o que **eu** posso"; ele não traz as linhas de concessão (com id) porque
> um owner não tem nenhuma. Para **editar** o que outra pessoa pode, use
> `/members/{id}/permissions/` e `/members/{id}/provider-permissions/`, que devolvem as concessões
> com o id necessário para revogar.

### 6.1 Checagem pontual

```jsonc
QUERY /v1/memberships/current/access/
X-Company-Id: <uuid>

{ "provider_permissions": ["ga4_property_create"],
  "route_permissions": ["POST:/v1/companies/{id}/provider-assets/"] }

→ { "allowed": true, "membership_role": "member" }
```

> ⚠️ **O front não usa esta rota.** Ela usa o método `QUERY` (RFC 10008), e o `fetch()` do browser
> ainda não consegue enviá-lo — a WHATWG Fetch não adotou o método. É uma rota servidor-a-servidor,
> para a core-api.
>
> Para a tela, use `/v1/memberships/current/`, que já devolve tudo resolvido numa chamada.

Regras (para referência): exige **todas** as permissões informadas; lista vazia ou ausente é
ignorada e só a outra é validada; as duas vazias → `400`.

### 6.2 Permissões nos agentes (provider permissions)

**Nada nesta API é gated por elas.** Quem as consome é a core-api/MCP, para decidir se aquele
usuário pode mandar o agente executar uma tool de escrita — hoje, criar conta ou property no GA4.
Tudo que é rota da Datalab, inclusive adicionar um ativo à empresa, continua sendo
`route_permission`.

Mesmo modelo das route permissions que a tela de membros já usa, só que para o que não é rota:

| Permissão de rota | Permissão de provider |
|---|---|
| `GET /v1/memberships/route-permissions/` | `GET /v1/memberships/provider-permissions/` |
| `GET /v1/memberships/members/{id}/permissions/` | `GET /v1/memberships/members/{id}/provider-permissions/` |
| `POST .../permissions/{route_permission_id}/` | `POST .../provider-permissions/{provider_permission_id}/` |
| `DELETE .../permissions/{route_permission_id}/` | `DELETE .../provider-permissions/{provider_permission_id}/` |
| `current.permissions[]` | `current.provider_permissions{}` |

Catálogo (`GET /v1/memberships/provider-permissions/`):

```jsonc
[{ "id": "uuid", "key": "ga4_property_create", "provider": "google",
   "name": "Criar propriedades no Google Analytics",
   "description": "Permite criar novas properties dentro das contas GA4 liberadas para a empresa",
   "created_at": "...", "updated_at": "..." }]
```

Keys atuais: `ga4_account_create`, `ga4_property_create` (ambas `provider: "google"`).

### 6.3 Convite já carrega permissões de provider

O owner concede na hora de convidar, junto com as de rota — mesmo formato:

```jsonc
PUT /v1/memberships/invites/
{ "emails": ["novo@empresa.com"],
  "permissions":          ["<route_permission_id>"],
  "provider_permissions": ["<provider_permission_id>"] }
```

`GET /v1/memberships/invites/` devolve `permissions[]` e `provider_permissions[]` no convite. Ao
aceitar, as duas listas viram concessões do membership — o convidado já entra podendo.

Na tela de convite: mesma seção de permissões, mais um bloco de permissões de provider.
Reaproveite o componente; muda só a chave do payload e o endpoint do catálogo.

### 6.4 O que fazer com isso

1. **Tela de membros**: duas seções separadas — "Permissões do app" (rotas) e "Permissões nos
   agentes" (providers) — com os mesmos toggles. Dá para reaproveitar o componente inteiro
   trocando a chave e o endpoint. **Não** as combine numa lista só: são independentes.
2. **Owner tem todas implicitamente** — a API recusa conceder (`400`) e recusa revogar (`400`)
   para um owner. Mostre "Todas as permissões (owner)" em vez de toggles.
3. **Exibir ação de criação** → cheque `provider_permissions` do `/current/`. Isso é conveniência
   de tela: quem aplica a regra de verdade é a core-api, então nunca dependa disso para segurança.

---

## 7. Detalhes que costumam morder

- **Uma conta de provider por usuário Datalab**: se a conta do Google/Meta já estiver vinculada a outro usuário, o callback volta com `status=error` e a mensagem "already linked to another user".
- **Trocar de conta no mesmo provider substitui a conexão anterior** (e os escopos são recontados do zero).
- **Login com Meta exige e-mail**: se o usuário negar a permissão `email`, o login falha com erro explícito. Já a ativação de `meta_ads` não precisa de e-mail — por isso ela funciona para quem logou com Google.
- **Token do Meta não tem `refresh_token`**: `/v1/auth/meta/token/` devolve `refresh_token: null` e renova sozinho enquanto o token de 60 dias estiver válido. Se expirar, o usuário precisa reconectar (a tela deve tratar `status=error`).
- **`prompt=consent` no Google**: a tela de consentimento aparece toda vez, inclusive em reconexões. É proposital — é o que garante o `refresh_token`.
- **Allowlist é por company, não por usuário.** Trocar de empresa (`X-Company-Id`) troca a lista inteira. Não guarde a seleção em cache global; invalide ao trocar de empresa.
- **A conexão OAuth continua sendo por usuário.** O owner define a allowlist, mas cada membro opera com a conta Google/Meta dele. Se ele não tiver acesso próprio ao ativo permitido, o provider recusa — o agente devolve o erro, e isso não é bug da tela.
- **Google Ads e Google Analytics dividem o `provider: "google"`.** `GET provider-assets/?provider=google` traz os ativos das duas integrações juntos; separe por `asset_type` na tela.
- **Owner ≠ concessão.** Owner tem todas as permissões implicitamente, resolvidas na leitura; ele não tem linha de concessão nenhuma. Conceder ou revogar para um owner devolve `400`.

---

## 8. Configuração fora do código (backend/infra)

Novas variáveis de ambiente (só duas):

```env
META_CLIENT_ID=...
META_CLIENT_SECRET=...
```

Opcionais (já têm default): `META_GRAPH_API_VERSION` (`v21.0`), `META_LOGIN_SCOPES`, `META_ADS_SCOPES`,
`GOOGLE_LOGIN_SCOPES`, `GOOGLE_ANALYTICS_SCOPES`, `GOOGLE_ADS_SCOPES`.

Redirect URIs a cadastrar nos consoles:

- Google Cloud Console → `{API_URL}/v1/auth/google/callback/` *(já existente, sem mudança)*
- Meta for Developers → Facebook Login → `{API_URL}/v1/auth/meta/callback/`
  (o Meta exige HTTPS fora de `localhost`; as permissões de Ads precisam de App Review antes de sair do modo dev)
