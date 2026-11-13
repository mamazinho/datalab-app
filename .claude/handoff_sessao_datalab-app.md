# Handoff — Trackin' Master

Estado do Trackin' Master nos quatro repositórios, para quem continuar o trabalho. Atualizado em 13/11/2026.

## Branches

| Repositório | Branch | Último commit | Estado |
|---|---|---|---|
| datalab-api | `feat/trackin-master` | `e59f9bc` | enviada |
| datalab-core-api | `feat/trackin-master` | `3a953ce` | enviada |
| datalab-app | `feat/trackin-master` | o deste arquivo | enviada |
| datalab-commons | `feat/censor-tracking-bodies` | `a3d8853` | **só local**: a conta conectada não tem push em `mamazinho/datalab-commons`; o patch foi entregue ao Rafa |

Nada foi feito no `main` de nenhum deles.

## Arquitetura

- **datalab-api** (`apps/tracking`): toda a regra. `engine/` tem as regras (`engine/rules/*.json`), os masters do GTM, o builder, a mescla, a validação, os mapas de tags, atributos e dataLayer, a análise do site, a ajuda de importação, o guia, o PDF e o agente (ainda sem rota). O `services.py` orquestra o engine; os limites de uso ficam no Postgres (`limits.py`, tabela `trackingusageevent`).
- **datalab-core-api** (`apps/tracking`): só o que lê a internet pública, sem regra. `POST /v1/tracking/fetch-site` devolve a página bruta (URL final, status, tipo, HTML) lida pelo `SiteClient`, com a proteção contra rede interna e o `detect_protection`, que marca a página de desafio anti-robô. `GET /v1/tracking/gtm-script?id=` devolve o gtm.js público. A futura integração com a API do GTM também fica aqui, como client.
- **Fluxo:** datalab-app → datalab-api (`/v1/tracking/{rules,scan,build,verify,import-help}/`, qualquer membro ativo da empresa, com limites) → core-api (`fetch-site`, `gtm-script`), chamado pelo `CoreAPIClient` com `X-Api-Key`, o Bearer do usuário e o `X-Company-Id` da empresa cuja membresia foi conferida.

## Decisões tomadas (não perguntar de novo)

- A aba é aberta a todos os membros ativos da empresa.
- O sistema nunca inventa nem completa ID. Faltou ID obrigatório de ferramenta escolhida: o build é recusado e lista o que falta, por ferramenta, com onde encontrar. IDs `optional` continuam opcionais.
- Prints do guia: o Rafa pediu que eu os capture no computador dele (Remote Control do Claude Desktop), num contêiner de teste sem dados de cliente.
- Formato de ID confirmado (GA4, Google Ads, Meta, Clarity, GTM, sGTM, cookie domain, país) é estrito. Formato só inferido (lista abaixo) é aceito com o aviso "formato não confirmado, confira antes de publicar", que aparece no campo, no relatório de validação do container e no resultado. Qualquer ID, confirmado ou não, é recusado com aspas, crase, `<`, `>`, `;`, parênteses, chaves, barra invertida ou espaço/quebra de linha.
- Eventos de e-commerce: o site envia `GT_<evento do GA4>` (GT_view_item_list, GT_select_item, GT_view_item, GT_add_to_wishlist, GT_add_to_cart, GT_remove_from_cart, GT_view_cart, GT_begin_checkout, GT_add_shipping_info, GT_add_payment_info, GT_purchase, GT_view_promotion, GT_select_promotion), além do que já envia; as tags do container leem só os `GT_`. login, sign_up, generate_lead e page_view não mudam. O mapa único é `engine/rules/events.json`; o master usa só os nomes padrão do GA4 e o build aplica o `GT_` (não sobrou nenhum `custom_` de e-commerce: os gatilhos de compra do master agora são "DL - Purchase" e "DL - Purchase (Rakuten)", escutando `purchase`). O `custom_page_view` que continua no master é outro evento (page view com grupo de conteúdo), fora da regra. As tags seguem enviando os nomes padrão ao GA4, então o container server não muda.
- Tag instalada no código do site: aviso destacado (ID, por que duplica, onde remover por plataforma), não bloqueia.
- Anti-robô: aviso com o texto combinado; nada é concluído a partir da página de desafio; o preenchimento manual segue.
- Server-side: fluxo inalterado; sem server-side o GA4 Config não leva o sGTM URL, e o sGTM URL só é pedido com server-side.
- Validação de implementação **completa, com navegador headless** (decisão do Rafa, revendo a anterior): o usuário informa a página inicial (obrigatória) e, se quiser, categoria, produto, carrinho, checkout e confirmação; cada página conta como uma leitura no limite. A core-api abre as páginas num Chromium (`POST /v1/tracking/browse`) e devolve os pushes do dataLayer e as requisições; a datalab-api (`engine/implementation.py`, regras em `engine/rules/implementation.json`) confere, por página, o `GT_` que o tipo da página precisa (com os campos obrigatórios), se o contêiner carregou e quais tags dispararam. Eventos que dependem de clique (add_to_cart, login...) aparecem como "conferir no modo Visualizar". O botão fica no popup de importação e no de publicação.
- O último popup (Publicar) tem "Fechar instruções"; "Ver próximos passos" reabre.
- Limites (rígido): leituras (scan e conferência de publicação) 10/h por usuário e 30/dia por empresa; gerações 5/h por usuário e 20/dia por empresa, contando só build entregue. Contados no Postgres, iguais em todas as instâncias e mantidos entre deploys.
- Avisos de atualização por e-mail (antigo item 11): **retirados desta entrega** a pedido do engenheiro; voltam junto de um sistema centralizado de envio de e-mails. O código removido está no histórico da datalab-api (commit `a72005b` e seguintes) e do app (`25d80dc`).
- Nenhum e-mail sai para clientes sem aprovação do Rafa.
- Nenhum nome de cliente real em documentação, teste ou exemplo: só placeholders.

## Documento do cliente (PDF)

Definido e aplicado, a partir dos decks da Datalab: Montserrat e Bebas Neue, amarelo `#FBBC04` com cinzas `#9E9E9E`/`#434343`/`#999999` e texto `#1C1C1C`, capa dividida com o ícone do notebook, cabeçalho "Documentação de tagueamento | seção" e o logo da Datalab (`engine/document/assets/logo.png`). Tudo em `engine/document/brand.py`.

**Logo (decidido pelo Rafa):** o PDF leva o logo da **Go Trackin'**. Enquanto o Rafa não envia os arquivos, fica o da Datalab. Quando chegarem (PNG com fundo transparente ou SVG, e os hex se as cores mudarem), a troca é só em `brand.py` e `assets/logo.png`.

## Formatos de ID não confirmados (para o Rafa conferir com contas reais)

| ID | Formato inferido | Fonte da inferência |
|---|---|---|
| `dito_api_key` | letras, números, hífen e sublinhado (8 a 200) | exemplos de inicialização do SDK JavaScript da Dito (`dito.init` com a API key pública da marca) |
| `awin_advertiser_id` | só números (3 a 10) | URL do MasterTag da Awin (`dwin1.com/<id>.js`), que usa o ID do anunciante |
| `rakuten_merchant_id` | só números (3 a 12) | documentação de implementação da Rakuten Advertising (MID numérico) |
| `rakuten_global_tag_id` | só números (3 a 12) | URL da Global Tag da Rakuten (`tag.rmp.rakuten.com/<id>.ct.js`) |
| `tiktok_events_api_token` | letras e números (20 a 200) | token gerado no TikTok Events Manager (sequência alfanumérica longa) |
| `pinterest_capi_token` | `pina_` + letras e números | exemplos da API de Conversões do Pinterest (prefixo `pina_`) |

Nenhuma dessas fontes foi conferida nesta sessão contra uma conta real. Confirmado um formato, troque `confirmed` para `true` em `engine/rules/ids.json` (e ajuste o `pattern` se for o caso).

## Próximos passos

1. Rafa: aplicar o patch do datalab-commons, publicar a tag `v0.8.0`, subir a dependência nas duas APIs e remover `TRACKING_BODY_URLS` do `app_builder.py` da datalab-api (a core-api já não precisa da exclusão: nenhuma rota dela recebe o export do cliente).
2. Rafa: enviar os arquivos do logo da Go Trackin' (e as cores, se mudarem) para substituir o da Datalab no PDF.
3. Rafa: confirmar os formatos da tabela acima.
4. Rafa: capturar os 16 prints de `engine/guide/LISTA_DE_PRINTS.md` (datalab-api).
5. Math (infraestrutura): a imagem da core-api agora instala o Chromium (`playwright install --with-deps --only-shell chromium` no Dockerfile), o que aumenta a imagem em algumas centenas de MB; cada validação roda até dois Chromium ao mesmo tempo (algumas centenas de MB de memória cada). Rever a memória da task da core-api no ECS.
6. Math (infraestrutura): criar a rotina diária `purge-tracking-usage` na AWS. O passo a passo está no README da datalab-api: registrar a task definition a partir de `deploy/ecs/purge-tracking-usage.task-definition.json`, criar a role do EventBridge Scheduler, rodar `scripts/schedule-purge-tracking-usage.sh` e dar à role do GitHub Actions permissão de registrar a família. A release já atualiza a imagem da task quando a família existir.
7. Ao aprovar uma versão nova do padrão: subir `engine/rules/standard.json` (e o CHANGELOG nele).

## O que não foi testado

- **Ponta a ponta com navegador e banco:** a tela não foi aberta num navegador (só testes com jsdom), e as rotas da datalab-api não rodaram com login real e Postgres juntos. A ida datalab-api → core-api foi exercitada com as duas aplicações reais em execução local (scan, build com PDF e conferência de publicação), mas aqui o DNS de sites externos não resolve, então a leitura de um site real não foi vista.
- **Validação de implementação:** o Chromium foi testado contra páginas locais (captura do dataLayer, das requisições e o bloqueio de rede interna), e as regras com respostas de exemplo. Não foi aberto nenhum site real nem um contêiner publicado de verdade, e o build da imagem Docker com o Chromium não foi feito aqui.
- **Anti-robô:** só contra HTML e cabeçalhos de exemplo; não contra sites reais atrás de Cloudflare, Akamai, DataDome, PerimeterX ou Imperva.
- **Conferência do gtm.js:** não foi feita contra um contêiner publicado de verdade.
- **Formatos de ID** da tabela acima.
- **Limites:** a contagem compartilhada foi testada com duas instâncias simuladas e, de forma manual, com dois limitadores no mesmo Postgres 18 real; não houve teste de carga, e duas requisições simultâneas do mesmo usuário podem passar um limite por uma.
- **Rotina diária na AWS:** o script e o passo da release foram checados só na sintaxe; nada rodou contra a AWS.
- **PDF:** conferido só como imagem gerada aqui; não foi impresso nem aberto em leitores diferentes.
- **Censura do datalab-commons 0.8.0:** testada no próprio repositório e com a suíte da datalab-api apontando para a cópia local; a tag não foi publicada.
- **Postgres:** as migrações (upgrade, downgrade e `alembic check`) rodaram no Postgres 16 e no 18 (`pgvector/pgvector:pg18-trixie`, a mesma imagem do docker-compose), e os adapters foram exercitados nos dois.
