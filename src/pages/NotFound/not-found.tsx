import styles from './not-found.module.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
    <div className={styles.notFoundContainer}>
      <section className={styles.notFoundCard} role="alert">
        <strong className={styles.notFoundCode}>404</strong>
        <h1 className={styles.notFoundTitle}>Página não encontrada</h1>
        <p className={styles.notFoundText}>Este endereço não existe ou foi movido.</p>
        <code className={styles.notFoundPath}>{pathname}</code>

        <div className={styles.countdownTrack} aria-hidden="true">
          <div className={styles.countdownBar} style={{ animationDuration: `${REDIRECT_SECONDS}s` }} />
        </div>

        <p className={styles.notFoundText} aria-live="polite">
          {secondsLeft > 0
            ? `Levando você para o início em ${secondsLeft}s...`
            : 'Redirecionando...'}
        </p>

        <p className={styles.notFoundText}>
          <Link className={styles.notFoundLink} to="/" replace>
            Ir agora
          </Link>
        </p>
      </section>
    </div>
  );
};
