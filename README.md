# Datalab Chat App

Uma aplicação de chat React moderna construída com TypeScript, Vite e Axios para comunicação com APIs.

## Características

- **React 18** com TypeScript para type safety
- **Vite** para desenvolvimento rápido e build otimizado
- **Axios** para requisições HTTP com suporte a streaming
- **Bootstrap 5** para estilização
- **Marked** para renderização de markdown
- **Variáveis de ambiente** para configuração flexível

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd datalab-app
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```bash
DATALAB_API_URL=http://localhost:3000
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter
- `npm run type-check` - Verifica tipos TypeScript

## Configuração da API

A aplicação se comunica com uma API de chat através das seguintes rotas:

- `GET /v1/chats/1/messages/` - Recupera mensagens existentes
- `POST /v1/chats/1/messages/` - Envia nova mensagem

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `DATALAB_API_URL` | URL base da API do Datalab | `http://localhost:3000` |

## Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
├── services/           # Serviços de API e utilitários
│   └── chatApi.ts      # Serviço principal da API de chat
├── App.tsx            # Componente principal
├── App.css           # Estilos principais
└── main.tsx          # Ponto de entrada da aplicação
```

## Como Usar

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o navegador em `http://localhost:5173`

3. Digite uma mensagem no campo de input e pressione Enter ou clique em "Send"

4. As mensagens são exibidas em tempo real com suporte a markdown

## Tecnologias Utilizadas

- **React 18** - Biblioteca para interface de usuário
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **Axios** - Cliente HTTP baseado em Promises
- **Bootstrap 5** - Framework CSS para estilização
- **Marked** - Parser de markdown

## Desenvolvimento

### Adicionando Novas Funcionalidades

1. Crie novos componentes em `src/components/`
2. Adicione novos serviços em `src/services/`
3. Mantenha os tipos TypeScript atualizados
4. Siga as convenções de nomenclatura existentes

### API Service

O serviço `chatApi.ts` fornece uma interface limpa para comunicação com a API:

```typescript
import chatApiService from './services/chatApi';

// Buscar mensagens
const stream = await chatApiService.getMessages();

// Enviar mensagem
const stream = await chatApiService.sendMessage('Hello!');

// Processar resposta streaming
await chatApiService.processStreamResponse(stream, onMessage, onComplete);
```

## Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo `LICENSE` para detalhes.

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
