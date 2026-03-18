import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
* {
  box-sizing: border-box;
}

html, body {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: ${({ theme }) => theme.fonts.main};
  line-height: 1.5;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 15% 5%, rgba(255, 190, 0, 0.2), transparent 30%),
    radial-gradient(circle at 85% 95%, rgba(255, 190, 0, 0.14), transparent 34%),
    ${({ theme }) => theme.colors.background};
}

/* Reset de elementos padrões */
h1, h2, h3, h4, h5, h6 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  line-height: 1.2;
}

p {
  margin: 0 0 1rem 0;
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  filter: brightness(0.9);
}

ul, ol {
  margin: 0;
  padding-left: 1.5rem;
}

/* Scroll customizado global */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 190, 0, 0.65);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: ${({ theme }) => theme.colors.primary};
}

/* Utilitários globais */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
