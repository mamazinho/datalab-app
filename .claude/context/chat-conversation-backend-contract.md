# Contrato de API — Chat conversacional (front ⇄ Datalab API)

Referência única pro frontend implementar a experiência de chat multi-agente
(estilo Claude Code): bolha principal + caixas expansíveis de "agentes conversando".
Só descreve a **superfície HTTP**; o design interno do backend não importa aqui.

- Base path: `/v1`
- Auth: mesma dos outros endpoints (Bearer token no header `Authorization`; empresa/rota
  resolvidas pelo contexto do usuário autenticado).

---

## Conceito central: 2 canais

Toda mensagem (ao vivo no stream **e** no histórico) tem um `channel`:

- `main` — a conversa que o usuário vê: fala do supervisor pro usuário (tanto um
  "vou consultar o agente X" quanto a resposta final) + o prompt do próprio usuário +
  perguntas de clarificação (HITL).
- `thread` — o que acontece **entre** os agentes. Cada delegação a um especialista é uma
  thread separada, agrupada por `thread_id`. Chamou o especialista X = thread 1; chamou o
  Y depois = thread 2. O front mostra isso como caixa colapsável ("agentes conversando"),
  uma por especialista consultado.

**Regra de roteamento (única, vale live e histórico):**
`channel == "thread"` → agrupa por `thread_id` numa caixa expansível.
`channel == "main"` → linha do tempo principal do chat.
Colapsado = só o `main`. Expandido = o usuário vê as threads.

---

## Endpoints de chat

### `POST /v1/chats/` — cria chat
Body: `{ "title"?: string }` → `RetrieveChat`.

### `GET /v1/chats/` — lista chats
→ `RetrieveChat[]` (mais recentes primeiro).

### `GET /v1/chats/{chat_id}/` — detalhe
→ `RetrieveChat`.

### `GET /v1/chats/{chat_id}/messages/` — histórico (transcrição)
→ `ChatMessageRead[]` (ordem cronológica, inclui as linhas de thread).

### `POST /v1/chats/{chat_id}/messages/` — envia mensagem OU responde clarificação
Body (`UserPrompt`):
```jsonc
{
  "prompt": "liste minhas contas do google analytics",
  "model_name": "gpt-4o",                 // opcional; ausente = modelo do supervisor
  "answer_to_tool_call_id": null          // preenchido só ao responder um clarification
}
```
Resposta: **stream NDJSON** (`Content-Type: application/x-ndjson`). Uma linha = um objeto
JSON `ChatStreamEvent` terminado em `\n`. Consumir incrementalmente (não esperar o fim).

---

## `ChatStreamEvent` (linhas do stream)

Campos nulos são **omitidos** (serialização `exclude_none`).

| campo             | tipo                                                            | quando |
|-------------------|-----------------------------------------------------------------|--------|
| `type`            | `text_delta` \| `agent_event` \| `clarification` \| `error` \| `done` | sempre |
| `channel`         | `main` \| `thread`                                              | sempre |
| `thread_id`       | string                                                          | eventos de thread |
| `author`          | `user` \| `supervisor` \| `specialist`                          | quando aplicável |
| `agent_key`       | string                                                          | eventos de agente |
| `content`         | string                                                          | texto do evento |
| `question`        | string                                                          | `clarification` |
| `options`         | string[]                                                        | `clarification` |
| `allow_free_text` | bool                                                            | presente sempre; só relevante em `clarification` |
| `tool_call_id`    | string                                                          | `clarification` (usar pra responder) |

### Semântica por `type`
- **`text_delta`** — pedaço incremental da fala do supervisor. `channel=main`. Acumular na
  bolha principal (concatenar `content` na ordem de chegada).
- **`agent_event`** — um "beat" de uma delegação. `channel=thread`, agrupar por `thread_id`.
  - `author=supervisor`, `content` = o que o supervisor **perguntou** ao especialista.
  - `author=specialist`, `content` = a **resposta** do especialista. `agent_key` = qual especialista.
- **`clarification`** — HITL: o supervisor precisa que o usuário escolha algo. Renderiza
  `question` + botões de `options` (+ campo livre se `allow_free_text`). O stream **encerra**
  depois disso (vem o `done`). Ver fluxo de retomada abaixo.
- **`error`** — `content` = mensagem de erro.
- **`done`** — fim do stream.

### Exemplo (usuário: "liste minhas contas e analise", supervisor delega a 2 especialistas)
```
{"type":"text_delta","channel":"main","author":"supervisor","content":"Vou consultar suas contas","allow_free_text":true}
{"type":"agent_event","channel":"thread","thread_id":"call_X","author":"supervisor","agent_key":"google_analytics","content":"quais contas o usuário tem?","allow_free_text":true}
{"type":"agent_event","channel":"thread","thread_id":"call_X","author":"specialist","agent_key":"google_analytics","content":"Ele tem 2 contas: x e y","allow_free_text":true}
{"type":"agent_event","channel":"thread","thread_id":"call_Y","author":"supervisor","agent_key":"insights","content":"analise as contas x e y","allow_free_text":true}
{"type":"agent_event","channel":"thread","thread_id":"call_Y","author":"specialist","agent_key":"insights","content":"insight z","allow_free_text":true}
{"type":"text_delta","channel":"main","author":"supervisor","content":"Suas contas são x e y. Posso detalhar alguma?","allow_free_text":true}
{"type":"done","allow_free_text":true}
```
→ Bolha principal: "Vou consultar suas contas" … "Suas contas são x e y…".
→ Duas caixas de thread: `call_X` (google_analytics) e `call_Y` (insights), cada uma com
   a pergunta do supervisor + a resposta do especialista.

---

## `ChatMessageRead` (histórico)

```jsonc
{
  "id": 123,
  "author": "user" | "supervisor" | "specialist",
  "agent_key": "google_analytics" | null,
  "message_type": "chat" | "agent_event" | "clarification",
  "thread_id": "call_X" | null,
  "content": "texto exibível" | null,
  "created_at": "2026-07-10T12:00:00Z",
  "channel": "main" | "thread"    // derivado; mesmo roteamento do live
}
```
Reconstruir a tela no reload usa **exatamente** a mesma regra: agrupa `channel=thread` por
`thread_id`, o resto vai pro `main`. (Custo/tokens **não** vêm aqui — ficam só no banco.)

---

## Fluxo HITL (clarificação) — retomar no MESMO endpoint

1. Durante o stream chega `{"type":"clarification","question":...,"options":[...],"tool_call_id":"abc","allow_free_text":true}`.
2. O stream encerra (`done`).
3. Front mostra `question` + botões de `options` (e campo livre se `allow_free_text`).
4. Usuário responde → **novo** `POST /v1/chats/{chat_id}/messages/`:
   ```json
   { "prompt": "<opção escolhida ou texto livre>", "answer_to_tool_call_id": "abc" }
   ```
5. Um novo stream retoma o raciocínio de onde parou (mesma conversa). Não há endpoint separado.

---

## Gerência de especialistas (telas de configuração de agentes)

- `GET /v1/agents/available-models` → `AvailableModelsResponse[]` `{ provider, models[] }`.
- `GET /v1/agents/` → `RetrieveAgentWithState[]` — especialistas de sistema + da empresa,
  já com estado resolvido: `disabled_by_company`, `disabled_by_user`, `is_enabled`.
- `POST /v1/agents/` → cria especialista. Body `CreateSpecialist`:
  `{ name, avatar_url?, description?, instructions, model_name? }` (a `key` é derivada do `name`).
- `PATCH /v1/agents/{id}/` → `UpdateSpecialist` (mesmos campos, todos opcionais, + `is_active`).
- `DELETE /v1/agents/{id}/` → 204.
- `PUT /v1/agents/{id}/company-state/` → `{ "enabled": bool }` (desliga/liga pra empresa toda;
  exige permissão de rota). Company tem prioridade sobre user.
- `PUT /v1/agents/{id}/user-state/` → `{ "enabled": bool }` (só pro usuário atual; qualquer membro).

`RetrieveAgent` (base de `RetrieveAgentWithState`):
```jsonc
{ "id", "type": "supervisor"|"specialist", "key", "name", "avatar_url"?, "description",
  "model_name", "is_system", "is_active", "mcp_servers": [ { "id","name","url","transport","auth_type" } ] }
```

---

## Notas de implementação pro front
- O supervisor tem **nome e foto** (`name`, `avatar_url` no agente) — usar nas bolhas/threads.
- Um turno pode gerar fala **e** delegação juntos → um `text_delta` (main) seguido de
  `agent_event` (thread) no mesmo fluxo. Também pode delegar **sem** preface (aí não há bolha
  main até a resposta final). Ambos suportados; o roteamento por `channel`/`thread_id` cobre os dois.
- `allow_free_text` aparece em todos os eventos por serialização, mas só significa algo no
  `clarification`. Ignorar nos demais.
