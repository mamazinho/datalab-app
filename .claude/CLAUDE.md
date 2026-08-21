# Guia de Projeto Claude.md

> Este arquivo serve como referência única para o Claude compreender o projeto, sua arquitetura, padrões e como deve proceder em solicitações.

---

## 📋 Informações do Projeto

**Nome do Projeto:** Datalab APP  
**Descrição:** Esse projeto é um APP em monolito escrito com React 19, axios e styled-components que gerencia todos os recursos de uma empresa de marketing com AI no centro da empresa. Essa SPA tem código em typescript e se comunica com um backend em python. Ela deve ser o mais componentizada possível para fazer uma ótima reutilização de código. A SPA possui envvars.
**Objetivo Principal:** Melhorias, manutenção e criação de código para a SPA em react 19 

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
project-root/
├── public/
├── src/
|   ├── assets
|   ├── components/
|   ├── contexts/
|   ├── hooks/
|   ├── pages/
|   ├── routes/
|   ├── schemas/
|   ├── services/
|   ├── styles/
|   ├── types/
|   ├── utils/
└── package.json
└── README.md
└── vite.config.ts
```

### Stack Tecnológico

- **Frontend:** [Typescript, React 19, Vite, Axios, react-router]
- **API:** API backend em python

### Padrões de Código

- **Linguagem Principal:** Typescript/Tsx
- **Naming Convention:** camelCase para variáveis/funções, PascalCase para classes

---

## 🎯 Princípios e Padrões

### Padrões de Design

- **Padrão de Arquitetura:** Clean arch/Componentizado

### Princípios de Desenvolvimento

1. **DRY (Don't Repeat Yourself):** Reutilizar código sempre que possível
2. **SOLID Principles:** Seguir princípios SOLID quando aplicável
3. **Component-Based:** Componentes pequenos e reutilizáveis
4. **Type Safety:** Usar typescript para segurança de tipos
5. **Comments:** Comentar apenas em funções muito especificas que ficaram muito complexas, não comente o código em excesso

### Convenções Importantes

- Sempre usar imports nomeados (absolutos)

---

## 🧪 Testes

**Stack:** Vitest (roda pelo mesmo `vite.config.ts`) + Testing Library (React + jest-dom + user-event), ambiente `jsdom`.

```bash
yarn test            # roda a suíte uma vez (CI)
yarn test:watch      # modo watch durante o desenvolvimento
yarn test:coverage   # relatório de cobertura (v8) em coverage/
```

### Convenções

- Arquivo de teste co-localizado ao lado do código: `password.ts` → `password.test.ts`
- Imports explícitos do Vitest (`import { describe, it, expect, vi } from 'vitest'`) — o projeto **não** usa `globals: true`
- Componentes: usar `renderWithProviders` de `src/test/test-utils.tsx`, que já embrulha em QueryClientProvider + ThemeProvider + MemoryRouter. Nunca o `render` puro em componente que dependa de tema, query ou rota
- Consultar o DOM por papel/rótulo acessível (`getByRole`, `getByLabelText`), não por classe ou test-id
- Interação sempre via `userEvent` (`await user.click(...)`), não `fireEvent`
- Serviços de API: mockar pelo `adapter` do axios (ver `src/services/datalab-api/axios.test.ts`), não pelo `vi.mock` do módulo inteiro
- Testar comportamento observável (o que a tela mostra, o que a função devolve), não detalhe de implementação (estado interno, nome de função privada)

### O que priorizar

Utils e schemas puros, hooks customizados, componentes de UI com lógica (validação, toggle, cooldown) e os interceptors do axios. Componente que é só estilo não precisa de teste.

---

## 📁 Guia de Pastas e Responsabilidades

### `/assets`
Ícones, imagens e outros arquivos estáticos que o projeto pode precisar

### `/components`
Guarda componentes que não são Páginas navegáveis do React, são componentes menores e geralmente altamente reutilizáveis entre multiplas páginas

### `/contexts`
Gerenciamento de contextos globais do app, são contextos do react que podem ser usados em vários componentes

### `/pages`
Guarda componentes de página, é a página renderizada pelo react-router em determinada rota. São menos reutilizáveis mas devem ser montadas por componentes menores e reutilizáveis. Em algumas páginas podem existir pastas de components também, que possuem componentes menores e especificos para aquela página, por ex, páginas que possuem 2 etapas, como um cadastro, as duas etapas estarão em uma pasta components

### `/routes`
Declaração do nome e caminho das rotas do react-router, com seus loaders e configurações

### `/schemas`
Essa pasta deve guardar schemas globais e reutilizáveis do zod. Atualmente temos a senha como exemplo, que precisa passr por uma série de validações e existem 2 ou mais páginas usando essa mesma validação

### `/services`
Nessa pasta fica a conexão do axios com a API Backend, separada por recursos que o backend possui

### `/styles`
Pasta que possui os arquivos de estilos globais do app, controle de tema e etc

### `/types`
Pasta com os tipos globais que são usados em mais de um lugar

### `/utils`
São códigos typescript puro, sem componentes react, que servem como helpers para auxiliar uma lógica mais complexa que não precisa ser declarada dentro de um componente para não polui-lo

---

## 🔌 Integrações e APIs

### APIs Externas

- **Backend da Datalab com API python:**
  - Autenticação: jwt token = access_token no localStorage e refresh_token no cookie httpOnly

### Variáveis de Ambiente
Todas elas são declaradas no arquivo .env

---

## ✅ Regras Importantes

### Deve-se Fazer ✓

- [ ] Sempre perguntar sobre regras de negócio
- [ ] Comentar lógica complexa com exemplos

### Não Deve-se Fazer ✗

- [ ] Excesso de comentários no código

---

## 🚀 Como Executar

### Desenvolvimento

```bash
yarn dev
```
---

## 📞 Contato e Escalação

**Dúvidas sobre o projeto?**
- Referir-se a este documento como fonte de verdade
- Apontar inconsistências quando encontradas
- Sugerir melhorias na estrutura quando apropriado

**Conflitos com padrões?**
- Sinalizar se a solicitação vai contra as práticas definidas
- Oferecer alternativa alinhada com o projeto
