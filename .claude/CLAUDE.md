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
- O código ainda não possui testes, focaremos nisso em outro momento e ai essa linha será removida e os padrões para testes adicionados nesse arquivo, não se preocupe com testes ainda

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
