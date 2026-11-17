import styles from '../trackin-master.module.css';
import type { IHardcodedWarning } from '../../../services/datalab-api/trackingResource';

export const HardcodedWarnings = ({ warnings }: { warnings: IHardcodedWarning[] }) => {
  if (!warnings.length) return null;

  return (
    <section className={styles.trackinHighlights} aria-label="Tags instaladas direto no código">
      {warnings.map((warning) => (
        <div key={warning.tool} className={styles.trackinAlert} role="note">
          <strong>{warning.label} instalado direto no código do site: remova ao publicar o container</strong>
          <p>ID encontrado: {warning.ids.join(', ')}</p>
          <p>{warning.why}</p>
          <p>Onde procurar para remover:</p>
          <ul className={styles.trackinList}>
            {warning.where.map((place) => <li key={place}>{place}</li>)}
          </ul>
        </div>
      ))}
    </section>
  );
};
