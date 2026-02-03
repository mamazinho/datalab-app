import styled from 'styled-components';

export const LoginContainer = styled.div`
  .home-container {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    padding: 20px 0;
  }

  .home-container .container-fluid {
    padding: 0 15px;
  }

  .home-container .display-4 {
    font-weight: 700;
    color: #2c3e50;
  }

  .home-container .lead {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  /* Cards da home */
  .home-container .card {
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .home-container .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .home-container .card-title {
    color: #495057;
    font-weight: 600;
  }

  .home-container .card-text {
    color: #6c757d;
    line-height: 1.5;
  }

  /* Lista de chats */
  .home-container .list-group-item {
    border: 1px solid #e9ecef;
    transition: all 0.2s ease;
  }

  .home-container .list-group-item:hover {
    background-color: #f8f9fa;
    border-color: #007bff;
  }

  .home-container .list-group-item h5 {
    color: #495057;
    font-weight: 600;
  }

  .home-container .list-group-item p {
    color: #6c757d;
    margin-bottom: 0;
  }

  .home-container .list-group-item small {
    color: #28a745;
    font-weight: 500;
  }

  /* Responsividade para mobile */
  @media (max-width: 768px) {
    .home-container {
      padding: 10px 0;
    }
    
    .home-container .container-fluid {
      padding: 0 10px;
    }
    
    .home-container .display-4 {
      font-size: 2rem;
    }
    
    .home-container .card {
      margin-bottom: 1rem;
    }
  }
`;
