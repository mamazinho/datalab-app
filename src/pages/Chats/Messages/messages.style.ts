import styled from 'styled-components';

export const MessageContainer = styled.div`
  .app-container {
    flex: 1;
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    padding: 10px;
    overflow: hidden;
  }

  /* Main do chat - maior e mais flexível */
  .app-container main {
    width: 100%;
    max-width: 1000px;
    min-height: 70vh;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e9ecef;
    border-radius: 0.75rem;
    background: white;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  /* Cabeçalho do chat */
  .app-container main .text-center {
    flex-shrink: 0;
    border-bottom: 2px solid #e9ecef;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    padding: 1.5rem;
  }

  .app-container main h2 {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 0.5rem;
    font-size: 1.75rem;
  }

  .app-container main .text-muted {
    color: #6c757d !important;
    font-size: 1rem;
  }

  .app-container {
    flex: 1;
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    padding: 10px;
    overflow: hidden;
  }

  /* Main do chat - maior e mais flexível */
  .app-container main {
    width: 100%;
    max-width: 1000px;
    min-height: 70vh;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e9ecef;
    border-radius: 0.75rem;
    background: white;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  /* Cabeçalho do chat */
  .app-container main .text-center {
    flex-shrink: 0;
    border-bottom: 2px solid #e9ecef;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 0.75rem 0.75rem 0 0;
    padding: 1.5rem;
  }

  .app-container main h2 {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 0.5rem;
    font-size: 1.75rem;
  }

  .app-container main .text-muted {
    color: #6c757d !important;
    font-size: 1rem;
  }
    
  /* Área de conversa - ocupa espaço disponível */
  #conversation {
    flex: 1 1 0%;
    overflow-y: auto;
    padding: 1.5rem;
    background: #fafbfc;
    min-height: 0;
    height: 100vh
  }

  /* Estilos para mensagens do usuário */
  .user {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 1px solid #2196f3;
    border-radius: 18px 18px 4px 18px;
    padding: 1rem 1.25rem;
    margin: 0.75rem 0 0.75rem auto;
    max-width: 80%;
    position: relative;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
    margin-left: 20%;
  }

  .user::before {
    content: '💬 Você:';
    font-weight: 700;
    color: #1976d2;
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Estilos para mensagens da IA */
  .agent {
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
    border: 1px solid #4caf50;
    border-radius: 18px 18px 18px 4px;
    padding: 1rem 1.25rem;
    margin: 0.75rem auto 0.75rem 0;
    max-width: 80%;
    position: relative;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
    margin-right: 20%;
  }

  .agent::before {
    content: '🤖 IA Assistente:';
    font-weight: 700;
    color: #388e3c;
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Markdown content styling */
  .user pre,
  .agent pre {
    background-color: rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 0.25rem;
    padding: 0.5rem;
    overflow-x: auto;
    font-size: 0.85rem;
  }

  .user code,
  .agent code {
    background-color: rgba(0,0,0,0.05);
    border-radius: 0.25rem;
    padding: 0.125rem 0.25rem;
    font-size: 0.875rem;
  }

  /* Spinner */
  .spinner {
    opacity: 0;
    transition: opacity 500ms ease-in;
    width: 30px;
    height: 30px;
    border: 3px solid #007bff;
    border-bottom-color: transparent;
    border-radius: 50%;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% { 
      transform: rotate(0deg); 
    }
    100% { 
      transform: rotate(360deg); 
    }
  }

  .spinner.active {
    opacity: 1;
  }

  /* Form do chat - melhor posicionamento */
  .app-container form {
    flex-shrink: 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-top: 2px solid #e9ecef;
    border-radius: 0 0 0.75rem 0.75rem;
  }

  .app-container form .form-control {
    border-radius: 25px;
    border: 2px solid #e9ecef;
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .app-container form .form-control:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.15), 0 4px 12px rgba(0,123,255,0.1);
    transform: translateY(-1px);
  }

  .app-container form .btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    border: none;
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,123,255,0.2);
  }

  .app-container form .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,123,255,0.3);
  }

  .app-container form .btn-primary:disabled {
    opacity: 0.6;
    transform: none;
  }

  /* Spinner atualizado */
  .spinner {
    opacity: 0;
    transition: opacity 500ms ease-in;
    width: 35px;
    height: 35px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 1rem auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .spinner.active {
    opacity: 1;
  }

  /* Responsividade atualizada */
  @media (max-width: 768px) {
    .app-container {
      padding: 5px;
    }
    
    .app-container main {
      max-width: 100%;
      min-height: 80vh;
      border-radius: 0.5rem;
    }
    
    .user, .model {
      max-width: 90%;
      margin-left: 5%;
      margin-right: 5%;
      border-radius: 15px;
      padding: 0.75rem 1rem;
    }
    
    .app-container form {
      padding: 1rem;
    }
    
    .app-container form .form-control {
      border-radius: 20px;
      padding: 0.6rem 1rem;
    }
    
    .app-container form .btn-primary {
      border-radius: 20px;
      padding: 0.6rem 1.5rem;
    }
  }

  /* Desktop maior */
  @media (min-width: 1200px) {
    .app-container main {
      max-width: 1200px;
    }
  }
`;