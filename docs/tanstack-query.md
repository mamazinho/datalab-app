# TanStack Query no Datalab APP

> Guia de como a lib funciona e de como ela é usada **neste** projeto.
> Todos os exemplos abaixo são código real do app.

---

## 1. O problema que a lib resolve

Existem dois tipos de estado num app React:

- **Estado de cliente** — nasce no navegador: token de login, empresa selecionada, tema, modal aberto. É papel de `useState`/context.
- **Estado de servidor** — mora no backend e o front mantém uma **cópia local**: o usuário (`/me`), a lista de chats, agentes, membros, permissões.

A cópia local de estado de servidor traz um pacote de problemas que sempre se repetem: loading, erro, retry, cópia desatualizada (stale), duas telas pedindo o mesmo dado ao mesmo tempo, "quem avisa quem" quando uma mutação muda algo. Antes da migração, o app resolvia isso à mão (contexts com fetch, refresh-keys, `getMe()` manual). O TanStack Query resolve esse pacote inteiro com um **cache de queries**.

A regra prática do projeto:

> **Veio da API? Query. Nasceu no navegador? Context/useState.**

---

## 2. O que é uma query

Uma query é a combinação de uma **identidade** (`queryKey`) com uma **forma de buscar o dado** (`queryFn`).

### Catálogo central (`src/queries.ts`)

Em vez de espalhar `queryKey`/`queryFn` pelos componentes, o app define cada query **uma única vez** com `queryOptions()` (helper oficial da lib desde a v5):

```ts
// src/queries.ts
export const chatsQuery = queryOptions({
  queryKey: ['chats'],
  queryFn: () => DatalabAPI.ChatsResource.getAllChats(),
});

// Queries parametrizadas viram função — uma entrada de cache por argumento
export const memberPermissionsQuery = (memberId: UUID) =>
  queryOptions({
    queryKey: ['member-permissions', memberId],
    queryFn: () => DatalabAPI.MembershipsResource.listMemberPermissions(memberId),
  });
```

E cada query ganha um hook fininho em `src/hooks/` (`use-chats.ts`, `use-agents.ts`, `use-me.ts`, etc.) que só chama `useSuspenseQuery` com essas options:

```ts
// src/hooks/use-chats.ts
export const useChats = () => useSuspenseQuery(chatsQuery);
```

O componente consome o hook, não a query crua:

```tsx
// src/pages/Chats/chats.tsx
const ChatsListSection = () => {
  const { data: chats } = useChats();
  return <ChatList chats={chats} />;
};
```

Por que isso compensa a partir de um certo número de queries: a **key vira um valor exportado** (`chatsQuery.queryKey`) em vez de uma string repetida em N lugares — invalidar errado (`['chat']` vs `['chats']`) passa a ser erro de compilação, não bug silencioso em produção. `mutationFn`/`invalidateQueries` em qualquer arquivo usam `algumaQuery.queryKey`, nunca o array literal.

- **`queryKey`** — o "endereço" do dado no cache. Pode ter parâmetros: `['member-permissions', memberId]` é uma entrada **por membro**.
- **`queryFn`** — como buscar quando necessário. No nosso caso, sempre uma chamada do `DatalabAPI`.

Usamos a variante **`useSuspenseQuery`**: em vez de devolver `isLoading`/`error` para tratarmos à mão, ela **suspende** o componente enquanto busca e **lança** o erro para o boundary mais próximo. Por isso todo uso vem embrulhado no nosso `QueryBoundary`:

```tsx
// padrão do app (Suspense + ErrorBoundary + retry)
<QueryBoundary>
  <ChatsListSection />
</QueryBoundary>
```

O [`QueryBoundary`](../src/components/Tools/query-boundary.tsx) mostra o `LoadingPiece` durante o fetch e o `ServerErrorComponent` (com "Tentar novamente" funcional) se a queryFn falhar. Resultado: dentro do componente, `data` **sempre existe** — zero `if (loading)`.

---

## 3. Como as queries são salvas (o cache)

O `QueryClient` (criado uma vez em [`src/App.tsx`](../src/App.tsx)) mantém um **mapa em memória**:

```
'["chats"]'                          → { data: [...], status, dataUpdatedAt, ... }
'["me"]'                             → { data: {...}, ... }
'["member-permissions","3f2a-..."]'  → { data: [...], ... }
```

A chave do mapa é a `queryKey` serializada — por isso **a key É a identidade**: dois componentes que usam a mesma key leem **a mesma entrada** e disparam **uma** request (deduplicação). Caso real do app: o modal de convite e o modal de permissões de membro pedem `['route-permissions']` — quem abrir segundo lê do cache.

Ciclo de vida de uma entrada:

```
fetch → FRESH (dentro do staleTime) → STALE → refetch quando alguém usar/invalidar → ... → GC (gcTime) quando ninguém mais usa
```

- **`staleTime`** — por quanto tempo o dado é considerado "fresco" (não refaz a request). Global do app: **30s** (`src/App.tsx`). É por isso que navegar lista de chats → conversa → voltar não refaz o GET em sequência.
- **`gcTime`** — quanto tempo uma entrada sem nenhum consumidor montado fica no cache antes de ser descartada (default da lib: 5min).
- **Stale não significa tela vazia**: a lib mostra o dado antigo imediatamente e revalida em background (*stale-while-revalidate*).

### A exceção documentada do chat

```tsx
// src/pages/Chats/Messages/messages.tsx
useSuspenseQuery({
  queryKey: ['chat-messages', chatId],
  queryFn: () => DatalabAPI.ChatMessagesResource.getChatMessages(chatId),
  staleTime: 0,                 // sempre fresco ao abrir a conversa
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,  // NUNCA refetch em background:
});                             // resetaria a timeline durante um streaming
```

O histórico do chat alimenta o `useChatStream`, que mantém uma timeline local durante o streaming NDJSON. Um refetch em background trocaria o `initialHistory` no meio de um stream e resetaria a conversa — por isso essa query não revalida sozinha. **Não mudar essa config.**

---

## 4. O que significa "invalidar" uma query

```ts
queryClient.invalidateQueries({ queryKey: ['agents'] });
```

Invalidar = dizer ao cache **"esse dado ficou velho"**. A lib então:

1. Marca a entrada como stale imediatamente;
2. Se existe algum componente montado usando essa key (query "ativa"), **refaz o fetch na hora** e re-renderiza todos os consumidores;
3. Se ninguém está usando, só fica marcada — o refetch acontece no próximo mount.

A mudança de mentalidade é o ponto mais importante da lib: **a mutação não conhece as telas** — ela só declara *o que* ficou velho, e quem consome se atualiza sozinho. Antes, "aceitar convite" precisava lembrar de chamar `getMe()`; "criar agente" precisava de `refreshAgents()`. Hoje:

| Mutação (onde) | Invalida |
|---|---|
| Criar chat (`create-chat.tsx`) e auto-criação (`use-ensure-chat.ts`) | `['chats']` |
| Criar/editar agente (`agent-form-modal.tsx`) | `['agents']` |
| Excluir/toggles de agente (`agents-table.tsx`) | `['agents']` |
| Enviar convites (`invite-member-modal.tsx`) | `['invites']` |
| Remover convite (`invites-list.tsx`) | `['invites']` |
| Remover membro (`members-list.tsx`) | `['members']` |
| Aceitar/recusar convite (`use-invite-actions.ts`) | `['me']` |
| Criar empresa (`onboarding-welcome.tsx`) | `['me']` |
| Editar perfil (`edit-profile.tsx`) | `['me']` |

Repare no efeito em cascata do `['me']`: header (badge de convites), dropdown de empresas e onboarding consomem `useMe()` — um único invalidate atualiza os três.

---

## 5. Outras formas de mexer no cache

### `setQueryData` — escrita cirúrgica, sem request

Quando a resposta da mutação já diz exatamente o que mudou, dá para editar o cache direto em vez de refetchar. Caso real — toggles de permissão de membro:

```tsx
// src/pages/CompanyMembers/components/member-permissions-modal.tsx
const created = await DatalabAPI.MembershipsResource.grantPermission(memberId, routeId);
queryClient.setQueryData<IMembershipPermission[]>(queryKey, (old = []) => [...old, created]);
```

Ali o **cache é a fonte de verdade da UI**: os switches derivam de `memberPermissions` (a query), e cada toggle atualiza a entrada — sem estado local duplicado e sem um GET extra por clique.

### `ensureQueryData` — "leia do cache, ou busque"

Para código imperativo (fora de render) que precisa do dado:

```ts
// src/pages/Chats/Messages/use-ensure-chat.ts
const chats = await queryClient.ensureQueryData({
  queryKey: ['chats'],
  queryFn: () => DatalabAPI.ChatsResource.getAllChats(),
});
```

Se `['chats']` está fresco no cache, retorna na hora; senão busca (e o resultado fica cacheado para a lista).

---

## 6. Mutations (`useMutation`) — o que são e por que NÃO usamos

Na lib, `useMutation` é o irmão das queries para **escritas**: encapsula o estado da submissão (`isPending`, `error`) e callbacks (`onSuccess` etc.):

```tsx
// como seria com useMutation (NÃO é o nosso padrão)
const mutation = useMutation({
  mutationFn: DatalabAPI.ChatsResource.createChat,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
});
```

**Não usamos** porque o React 19 já entrega exatamente isso de forma nativa com **form actions**, que são o padrão do app:

```tsx
// o nosso padrão (create-chat.tsx): useActionState + useActionFeedback
const [state, formAction, isPending] = useActionState(createChatAction, INITIAL_ACTION_STATE);

useActionFeedback(state, {
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ['chats'] });
    setIsOpen(false);
  },
});

<form action={formAction}>...</form>
```

E a action em si nasce do schema zod via `createFormAction` (`src/utils/create-form-action.ts`) — validação por construção, sem boilerplate:

```ts
// src/pages/Chats/actions.ts
export const createChatAction = createFormAction(
  createChatSchema,
  (payload) => DatalabAPI.ChatsResource.createChat(payload),
  { errorPrefix: 'Falha ao criar chat: ' },
);
```

A equivalência é 1-para-1: `mutationFn` ↔ a action (com zod), `isPending` ↔ o terceiro retorno do `useActionState`, `onSuccess/onError` ↔ `useActionFeedback`. Adotar `useMutation` seria manter **duas** engrenagens para a mesma coisa. Da lib, as mutações pegam emprestado apenas o `invalidateQueries`/`setQueryData` no sucesso.

> Regra do projeto: **leituras = queries; escritas = form actions + invalidação. Nunca `useMutation`.**

---

## 7. Mapa das queries do app

| Key | Onde vive | O que serve | Config especial |
|---|---|---|---|
| `['me']` | `src/hooks/use-me.ts` (`useMe`) | Usuário logado: header, home, onboarding, dropdown, convites, bootstraps de tema/empresa | `enabled: !!accessToken`; 401 → `logout()`; sem retry em 401 |
| `['chats']` | `chats.tsx` + `use-ensure-chat.ts` | Lista de conversas | — |
| `['chat-messages', chatId]` | `Messages/messages.tsx` | Histórico da conversa | `staleTime: 0`, `refetchOnMount: 'always'`, `refetchOnWindowFocus: false` (streaming) |
| `['agents']` | `Ia/Agents/agents.tsx` | Tabela de agentes | — |
| `['members']` | `company-members.tsx` | Membros da empresa | — |
| `['invites']` | `company-members.tsx` | Convites enviados | — |
| `['route-permissions']` | 2 modais de CompanyMembers | Catálogo de permissões de rota | Compartilhada (dedup entre os modais) |
| `['member-permissions', memberId]` | `member-permissions-modal.tsx` | Permissões de um membro | Atualizada via `setQueryData` nos toggles |

Config global (`src/App.tsx`): `retry: 1`, `staleTime: 30_000`. No **logout**, `queryClient.clear()` apaga o cache inteiro — dados do usuário anterior nunca vazam para a próxima sessão.

`useIsAuthLoading()` (também em `use-me.ts`) deriva "tem token mas o `/me` ainda não carregou" do estado da query — é o que segura os guards de rota sem flash de redirect.

---

## 8. Receitas rápidas

**Nova leitura na tela:**

1. Adicione a query em `src/queries.ts` (`queryOptions({ queryKey, queryFn })`; inclua na key TUDO que a queryFn usa; parametrizada vira função);
2. Crie o hook fininho em `src/hooks/use-x.ts`: `useSuspenseQuery(xQuery)`;
3. Consuma o hook no componente, dentro de um `<QueryBoundary>`.

**Nova mutação que afeta uma tela:**

1. Schema em `schemas.ts` + action via `createFormAction(schema, handler)` em `actions.ts`;
2. `useActionState(action, INITIAL_ACTION_STATE)` + `<form action>`;
3. No `useActionFeedback.onSuccess`: `void queryClient.invalidateQueries({ queryKey: xQuery.queryKey })` (importado de `src/queries.ts` — nunca o array literal).

**Erros comuns:**

- *Esquecer o parâmetro na key* — `queryKey: ['member-permissions']` com `queryFn` usando `memberId`: dois membros compartilhariam o mesmo cache. Tudo que a queryFn usa entra na key.
- *Invalidar a key errada* — invalidação é por prefixo: `invalidateQueries({ queryKey: ['chat-messages'] })` invalida **todas** as conversas; `['chat-messages', chatId]` só uma.
- *Usar query para estado de cliente* — modal aberto, aba ativa, seleção: isso continua sendo `useState`/context.

---

## 9. FAQ

**Invalidei — a tela atualiza na hora?**
Se a query está *ativa* (algum componente montado usando a key), o refetch dispara imediatamente e a tela re-renderiza quando a resposta chega (um round-trip). Durante o refetch o dado antigo continua visível — `useSuspenseQuery` só suspende no primeiro load ou quando a key muda. Se ninguém está usando a key, ela só fica marcada como stale e o fetch acontece no próximo mount (de graça). Para atualização instantânea sem round-trip, use `setQueryData` com o retorno da mutação (padrão do modal de permissões).

**Onde declarar a query — no componente pai?**
Não: **no componente que consome o dado, o mais fundo possível**. A página de IA não declara nada; a aba Conversas declara `['chats']` e a aba Agentes declara `['agents']` — declarar no layout buscaria agentes ao entrar no chat (o bug do antigo AgentsProvider). Declarar a mesma key em N componentes é seguro e barato: todos leem a mesma entrada do cache, com uma request só.

**Declarar a query sempre dispara request?**
Não. No mount: cache vazio → busca (suspende); fresh (dentro do `staleTime`) → usa o cache, zero request; stale → mostra o dado antigo na hora e revalida em background.

**Mutations integram com zod? Como ter "formulários com zod"?**
A lib não valida nada — zod é ortogonal a ela. No nosso padrão, o zod entra na **action**, e desde o `createFormAction` (`src/utils/create-form-action.ts`) toda action nasce de um schema: o helper faz o `safeParse` do FormData, transforma a primeira issue em `error` e embrulha o handler em try/catch devolvendo `ActionState`. Forms são zod por construção.

**`staleTime` faz a lib refazer a chamada sozinha num timer?**
Não — `staleTime` não é polling. Ele só define quando o dado deixa de ser "fresco". Passado esse tempo a entrada fica **marcada** como stale, mas o refetch só acontece num **gatilho**: um componente montar usando a key, foco na janela, reconexão, ou uma invalidação manual. `invalidateQueries` é o gatilho manual e funciona a qualquer momento, independente do `staleTime` (marca stale + refetch imediato se a query está ativa). Para refetch por timer de verdade existe a opção `refetchInterval`, que não usamos.

**E quando a query FALHA — a lib fica tentando de novo?**
Sim, conforme a política global em `src/utils/query-retry.ts`: só erros transitórios (5xx / falha de rede) são retentados, até `MAX_QUERY_RETRIES` (10×) espaçados por `QUERY_RETRY_DELAY_MS` (3s); erros 4xx nunca. Detalhes e a interação com o carregamento inicial/sessão em [auth-e-carregamento.md](./auth-e-carregamento.md).
