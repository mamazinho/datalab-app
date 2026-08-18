import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CountdownBar,
  CountdownTrack,
  NotFoundCard,
  NotFoundCode,
  NotFoundContainer,
  NotFoundLink,
  NotFoundPath,
  NotFoundText,
  NotFoundTitle,
} from './not-found.style';

const REDIRECT_SECONDS = 3;

export const NotFound = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    const timeout = setTimeout(() => navigate('/', { replace: true }), REDIRECT_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <NotFoundContainer>
      <NotFoundCard role="alert">
        <NotFoundCode>404</NotFoundCode>
        <NotFoundTitle>Página não encontrada</NotFoundTitle>
        <NotFoundText>Este endereço não existe ou foi movido.</NotFoundText>
        <NotFoundPath>{pathname}</NotFoundPath>

        <CountdownTrack aria-hidden="true">
          <CountdownBar $durationMs={REDIRECT_SECONDS * 1000} />
        </CountdownTrack>

        <NotFoundText aria-live="polite">
          {secondsLeft > 0
            ? `Levando você para o início em ${secondsLeft}s...`
            : 'Redirecionando...'}
        </NotFoundText>

        <NotFoundText>
          <NotFoundLink to="/" replace>
            Ir agora
          </NotFoundLink>
        </NotFoundText>
      </NotFoundCard>
    </NotFoundContainer>
  );
};
