import styles from '../trackin-master.module.css';
import type { IIdWarning } from '../../../services/datalab-api/trackingResource';

export const IdWarnings = ({ warnings }: { warnings: IIdWarning[] }) => {
  if (!warnings.length) return null;

  return (
    <div className={styles.trackinAlert} role="note" aria-label="IDs com formato não confirmado">
      <strong>Confira estes IDs antes de publicar: o formato deles ainda não foi confirmado.</strong>
      <ul className={styles.trackinList}>
        {warnings.map((warning) => (
          <li key={warning.key}>{warning.label}: formato esperado {warning.format}.</li>
        ))}
      </ul>
    </div>
  );
};
