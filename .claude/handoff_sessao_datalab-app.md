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
- Documento do cliente em PDF, Montserrat + Bebas Neue, só o logo da Go Trackin' (sem logo do cliente).
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
4. Item 11 (histórico de gerações e aviso de atualização): proposta abaixo, aguardando respostas.

## Item 11 — proposta (não implementada)

Tabela `tracking_generations` no datalab-api, uma linha por build entregue: `id`, `company_id`, `user_id`, `site_host` (só o domínio), `tools` (lista), `server_side`, `standard_version`, `created_at`. Sem IDs, sem export do cliente, sem URL de preview. Gravada pelo `TrackingService.build_containers` depois da resposta do motor.

Aviso de atualização: o `standard.json` ganha, por versão, a lista de ferramentas afetadas. Quando o Rafa aprova uma versão nova, um comando (`make notify-tracking-update`, rodado à mão) cruza as gerações com versão anterior e ferramenta afetada e envia o e-mail pelo serviço que já existe no datalab-api. O e-mail não leva dado do container; o link aponta só para o app.

Perguntas em aberto: quem recebe (quem gerou ou os donos da empresa), se o aviso aparece também na aba, por quanto tempo guardar o histórico, e como fica o consentimento e o descadastro desses e-mails.

## O que não foi testado

- Nada rodou de ponta a ponta com as três APIs reais depois desta sessão; só suítes unitárias e de rota com a rede mockada.
- A tela não foi aberta num browser (o app não tem mocks de browser); só testes com jsdom.
- Detecção anti-robô só contra HTML de exemplo; não contra sites reais atrás de Cloudflare, Akamai, DataDome ou PerimeterX.
- Os formatos de ID da Rakuten, da Dito, da Awin e dos tokens de API de TikTok e Pinterest foram inferidos e precisam ser confirmados com contas reais; um ID válido fora do padrão seria recusado.
- A conferência do gtm.js não foi feita contra um container publicado de verdade.
- O PDF foi conferido visualmente só como imagem gerada aqui; não foi impresso nem aberto em leitores diferentes.
- Os limites por processo não foram testados com várias instâncias.
- As cores do PDF são provisórias (o Google Slides não estava acessível nesta sessão).
