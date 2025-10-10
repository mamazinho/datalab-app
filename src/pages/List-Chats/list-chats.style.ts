import styled from 'styled-components';

export const ChatContainer = styled.div`
  .app-container {
    flex: 1;
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    padding: 10px;
    overflow: hidden;
  }

  /* Desktop maior */
  @media (min-width: 1200px) {
    .app-container main {
      max-width: 1200px;
    }
  }
`;