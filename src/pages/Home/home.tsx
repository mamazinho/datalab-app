import React from 'react';
import { Link } from 'react-router-dom';
import { HomeContainer } from './home.style';
import { useAuthContext } from '../../contexts/auth';

export const Home: React.FC = () => {
  const { logout } = useAuthContext();

  return (
    <HomeContainer>
      <button className="btn btn-primary" onClick={logout}>Logout</button>
      <div className="container-fluid h-100">
        <div className="row justify-content-center h-100">
          <div className="col-lg-10 col-xl-8 d-flex flex-column">
            <div className="text-center mb-4 mt-3">
              <h1 className="display-4 mb-3">DataLab App</h1>
              <p className="lead text-muted">
                Bem-vindo ao DataLab! Escolha uma das opções abaixo para começar.
              </p>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Chat AI</h5>
                  <p className="card-text flex-grow-1">
                    Converse com nossa inteligência artificial e tire suas dúvidas.
                  </p>
                  <Link to="/chats" className="btn btn-primary">
                    Chats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeContainer>
  );
};
