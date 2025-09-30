import { Link } from 'react-router-dom';
import { ChatContainer } from './list-chats.style';
import { useEffect } from 'react';
import { datalabClient } from '../../services/datalab-api';

export const ListChats = () => {
  useEffect(() => {
    datalabClient().get('/chats').then(response => {
      console.log("Chats disponíveis:", response.data);
    });
  }, []);

  return (
    <ChatContainer>
      <div>
        <button className="btn btn-primary">Criar chat!</button>
      </div>

      <div className="mt-4">
        <h3>Chats Disponíveis</h3>
        <div className="list-group">
          <Link to="/chats/1/messages" className="list-group-item list-group-item-action">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">Chat Geral #1</h5>
              <small>Ativo</small>
            </div>
            <p className="mb-1">Chat para perguntas gerais e assistência.</p>
          </Link>
          
          <Link to="/chats/2/messages" className="list-group-item list-group-item-action">
            <div className="d-flex w-100 justify-content-between">
              <h5 className="mb-1">Chat Técnico #2</h5>
              <small>Ativo</small>
            </div>
            <p className="mb-1">Chat especializado em questões técnicas.</p>
          </Link>
        </div>
      </div>
    </ChatContainer>
  );
};
