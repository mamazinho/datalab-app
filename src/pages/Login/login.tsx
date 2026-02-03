import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginContainer } from './login.style';
import { useAuthContext } from '../../contexts/auth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthContext();
  const navigate = useNavigate();
  // const { login, logout, accessToken, email} = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      console.log("Login submitted:", { email, password });
      navigate('/')
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <LoginContainer>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
          <div className="text-center mb-4">
            <h1 className="h3 mb-3 font-weight-normal">DataLab App</h1>
            <h2 className="h5 text-muted">Login</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="inputEmail" className="form-label">Email</label>
              <input 
                type="email" 
                id="inputEmail" 
                className="form-control" 
                placeholder="seu@email.com" 
                required 
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="inputPassword" className="form-label">Senha</label>
              <input 
                type="password" 
                id="inputPassword" 
                className="form-control" 
                placeholder="Sua senha" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="btn btn-lg btn-primary w-100 btn-block" type="submit">Entrar</button>
            
            <div className="mt-4 text-center">
              <div className="mb-2">
                <Link to="/register" className="text-decoration-none">Não possui conta? Cadastra-se</Link>
              </div>
              <div>
                <Link to="/forgot-password" style={{ fontSize: '0.9rem' }} className="text-muted text-decoration-none">Esqueci minha senha</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LoginContainer>
  );
};
