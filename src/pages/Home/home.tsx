import styles from './home.module.css';
import { Link } from 'react-router-dom';
import React from 'react';
import { useMe } from '../../hooks/use-me';
import { extractFirstName } from '../../utils/extractors';

export const Home: React.FC = () => {
  const { data: me } = useMe();

  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeContent}>
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span aria-hidden="true">🚀</span>
          </div>
          <h1 className={styles.heroTitle}>
            DataLab <span className={styles.heroHighlight}>App</span>
          </h1>
          <p className={styles.heroText}>
            Bem-vindo a DataLab, {extractFirstName(me?.name ?? '')}! Escolha uma das opções abaixo para começar a explorar nossos recursos de inteligência.
          </p>
        </section>
        <section className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span aria-hidden="true">🤖</span>
            </div>
            <h5 className={styles.featureTitle}>DataLab AI</h5>
            <p className={styles.featureDescription}>
                Converse com nossa inteligência artificial e tire suas dúvidas em tempo real.
            </p>
            <Link className={styles.featureLink} to="/ia/conversas">
                Acessar conversas
            </Link>
          </article>
        </section>
      </div>
    </div>
  );
};
