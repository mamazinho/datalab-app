# Handoff — Trackin' Master (sessão de 13/11/2026)

Resumo do estado do Trackin' Master nos quatro repositórios, para quem continuar o trabalho.

## Branches

| Repositório | Branch | Estado |
|---|---|---|
| datalab-core-api | `feat/trackin-master` | enviada (`e82eb81`, `f3aa479`) |
| datalab-api | `feat/trackin-master` | enviada (`4b23bb2`) |
| datalab-app | `feat/trackin-master` | enviada (`fa9e69e` + este arquivo) |
| datalab-commons | `feat/censor-tracking-bodies` | **só local**: a conta conectada não tem push em `mamazinho/datalab-commons`; o patch foi entregue ao Rafa |

Nada foi feito no `main` de nenhum deles.

## Fluxo

`datalab-app` → `datalab-api` (`/v1/tracking/{rules,scan,build,verify,import-help}/`, qualquer membro ativo da empresa, limites por usuário e empresa) → `datalab-core-api` (`/v1/tracking/...`, `X-Api-Key` + Bearer do usuário + `X-Company-Id` da empresa cuja membresia foi conferida) → motor em `datalab_core_api/tracking`.

## Decisões já tomadas (não perguntar de novo)

- A aba é aberta a todos os membros (a rota não depende mais de permissão de rota; depende da membresia ativa).
- O sistema nunca inventa nem completa ID. Faltou ID obrigatório de ferramenta escolhida: o build é recusado e lista o que falta, por ferramenta, com onde encontrar. IDs `optional` continuam opcionais.
- Tag no código do site: aviso destacado, não bloqueia.
- Anti-robô: aviso com o texto combinado, nunca diagnóstico a partir da página de desafio; o preenchimento manual segue.
- Server-side: fluxo inalterado. Exceção decidida pelo Rafa: sem server-side, o GA4 Config perde o `server_container_url` (antes apontava para o sGTM de exemplo e os dados do GA4 se perdiam). O sGTM URL só é pedido com server-side.
- Sem navegador headless nesta fase; "Validar implementação" visível e desativado ("em breve").
- Documento do cliente em PDF, no padrão visual dos decks da Datalab: Montserrat + Bebas Neue, amarelo #FBBC04, capa dividida com o ícone do notebook, só o logo da Datalab (sem logo do cliente). Nada de nome de cliente real em documentação, teste ou exemplo: só placeholders.
- Eventos de e-commerce: sempre `GT_<evento GA4>` (GT_view_item, GT_add_to_cart, GT_purchase...), enviados pelo site além do que ele já envia; o container escuta só os `GT_`. Vale para os eventos de e-commerce do GA4 (view_item_list, select_item, view_item, add_to_wishlist, add_to_cart, remove_from_cart, view_cart, begin_checkout, add_shipping_info, add_payment_info, purchase, view_promotion, select_promotion). login, sign_up, generate_lead e page_view não mudam. O mapa único é `rules/events.json`; o build reescreve os triggers do master a partir dele. As tags seguem enviando os nomes padrão do GA4, então o server não muda.
- Histórico de gerações (item 11): avisos para todas as pessoas com acesso à organização que gerou o container; aviso também dentro da aba; histórico por 2 anos, um registro por empresa e site (uma geração nova substitui a anterior); o formulário avisa antes de gerar; descadastro pelo botão do próprio e-mail.
- Limites (rígido): leituras (scan + conferência de publicação) 10/h por usuário e 30/dia por empresa; gerações 5/h por usuário e 20/dia por empresa, contando só build entregue. Valores em `settings` do datalab-api.
- Nenhum e-mail sai para clientes sem aprovação do Rafa.

## O que existe agora

### Motor (`datalab-core-api/src/datalab_core_api/tracking`)

- `rules/ids.json`: cada ID com ferramenta, formato estrito (regex), texto do formato, onde encontrar e se é só server-side. `ids.py` recusa qualquer valor fora do formato antes de montar o container e calcula os IDs obrigatórios que faltam a partir do container construído.
- Nome do cliente reduzido a texto simples; a análise do site devolvida pelo browser é reconstruída e host/cookie domain são recalculados pela URL.
- `rules/standard.json`: versão do padrão Go Trackin' (1.0.0). Versão e data da geração vão nas notas do container; os nomes das tags não mudam entre versões (é o que permite reimportar com Mesclar > Substituir sem duplicar).
- `site.py`: `detect_protection` (Cloudflare, Akamai, DataDome, PerimeterX, Imperva, genérico); `hardcoded_warnings` com ID, por que duplica e onde remover por plataforma (`rules/hardcoded.json`).
- `datalayer.py` + `rules/datalayer.json`: Mapa de dataLayer gerado do container construído (eventos que alguma tag escuta, nome real do evento no trigger — a compra é `custom_purchase` no master —, campos, tags e variáveis que leem cada campo, exemplo com limpeza do `ecommerce`). Markdown e CSV.
- `csv_export.py`: CSV com apóstrofo nas células que começam com `= + - @`.
- `rules/guide.json` → `guide/GUIA_IMPORTACAO_GTM.md` e `guide/LISTA_DE_PRINTS.md` (regenerar com `python -m datalab_core_api.tracking guide`; um teste garante que estão em dia). Prints em `guide/assets/gtm-import/NN-nome.png`.
- `rules/import_errors.json` + `import_help.py`: base versionada de erros de importação.
- `publication.py`: confere no gtm.js público se os IDs gerados (não secretos) estão publicados.
- `document/`: PDF do cliente (reportlab). Identidade em `document/brand.py`; logo em `document/assets/logo.png` quando existir.

### datalab-api

- `apps/tracking`: relay das cinco rotas, `TrackingCaller`, limites (`utils/rate_limit.py`, em memória por processo), repasse do `detail` do erro do motor (`missing_ids`, `invalid_ids`).

### datalab-app

- Campos de ID por ferramenta e server-side, erro ao lado de cada campo, aviso anti-robô, tags no código em destaque, popup 1 (arquivos, requisitos, importar e testar, não publicar ainda, validar desativado, "tive um problema"), popup 2 (publicar + conferência do gtm.js), PDF e CSVs.

### datalab-commons (patch local, versão 0.8.0)

- `Censor` por conteúdo: JSON dentro de string, parâmetros chave/valor do GTM, formato do valor (EAA, JWT, Bearer, sk-/AIza/ghp_/xox, aleatório 32+), corte por campo (4 KB) e limites progressivos no log; argumentos do endpoint no span do Logfire também censurados.
- **Enquanto a 0.8.0 não for publicada**, `/tracking/build` e `/tracking/scan` ficam fora do log e do Logfire nas duas APIs (`TRACKING_BODY_URLS` nos `app_builder.py`). Ao subir a dependência para `v0.8.0`, remover essa lista.

## Próximos passos

1. Rafa aplicar o patch do datalab-commons, publicar a tag `v0.8.0`, subir a dependência nas duas APIs e remover `TRACKING_BODY_URLS`.
2. Rafa mandar as cores oficiais (hex) e o logo; trocar em `document/brand.py` e `document/assets/logo.png`.
3. Rafa capturar os 16 prints de `guide/LISTA_DE_PRINTS.md`.
4. Agendar `make purge-tracking-history` (diário) no ambiente de produção.
5. Ao aprovar uma versão nova do padrão: subir `rules/standard.json` no core-api e rodar `make notify-tracking-updates VERSION=... TOOLS=... SUMMARY="..."` (prévia) e depois com `CONFIRM=1` (envia).

## Item 11 — histórico e avisos (implementado)

- `trackinggeneration` (datalab-api): empresa, usuário, domínio do site, ferramentas, server-side, versão do padrão e data. Sem IDs, sem export, sem URL de preview. Uma linha por empresa e site; `make purge-tracking-history` apaga o que passa de 2 anos.
- `trackingstandardrelease`: a aprovação do Rafa (versão, ferramentas afetadas, resumo), gravada pelo `make notify-tracking-updates`. Sem `CONFIRM=1` é só prévia; a mesma versão nunca é enviada duas vezes.
- Destinatários: membros ativos da empresa, menos quem se descadastrou (`trackingupdateoptout`). O e-mail não leva dado do container; links só para o app, com o cabeçalho List-Unsubscribe.
- `GET /v1/tracking/updates/` alimenta o aviso na aba; `POST /v1/tracking/updates/unsubscribe/` é público e recebe o token assinado do e-mail. A página `/descadastrar-avisos` do app pede um clique de confirmação (leitores de e-mail abrem os links sozinhos).
- Migração testada num Postgres 16 local (`alembic upgrade head` e `alembic check` sem diferenças); adapters exercitados contra o banco real.

## O que não foi testado

- Nada rodou de ponta a ponta com as três APIs reais depois desta sessão; só suítes unitárias e de rota com a rede mockada.
- A tela não foi aberta num browser (o app não tem mocks de browser); só testes com jsdom.
- Detecção anti-robô só contra HTML de exemplo; não contra sites reais atrás de Cloudflare, Akamai, DataDome ou PerimeterX.
- Os formatos de ID da Rakuten, da Dito, da Awin e dos tokens de API de TikTok e Pinterest foram inferidos e precisam ser confirmados com contas reais; um ID válido fora do padrão seria recusado.
- A conferência do gtm.js não foi feita contra um container publicado de verdade.
- O PDF foi conferido visualmente só como imagem gerada aqui; não foi impresso nem aberto em leitores diferentes.
- Os limites por processo não foram testados com várias instâncias.
- O envio real de e-mail (SMTP) dos avisos não foi testado; só com o serviço de e-mail substituído nos testes.
- O evento `trinioEmailIdentification` do master é de um fornecedor e ficou com o nome original (renomear quebraria o gatilho).
