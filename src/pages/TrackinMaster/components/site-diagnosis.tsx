import styles from '../trackin-master.module.css';
import type { ISiteAnalysis } from '../../../services/datalab-api/trackingResource';
import { saveBlob } from '../../../utils/download';

const listOrNone = (values: string[], none: string) => (values.length ? values.join(', ') : none);

export const SiteDiagnosis = ({ site }: { site: ISiteAnalysis }) => {
  const facts: Array<[string, string]> = [
    ['Plataforma', site.platform ?? 'não identificada'],
    ['Banner de cookies', site.cmp ?? 'não encontrado'],
    ['GTM instalado', listOrNone(site.gtm_containers, 'nenhum')],
    ['Hostnames (filtro do GA4)', site.hostnames.join(', ')],
    ['Cookie domain', site.cookie_domain],
  ];

  return (
    <section className={styles.trackinCard} data-state={site.reachable ? 'ok' : 'warning'} aria-label="Diagnóstico do site">
      <div className={styles.trackinCardHead}>
        <h3 className={styles.trackinCardTitle}>Diagnóstico de {site.host}</h3>
        <button className={styles.trackinSecondaryButton}
          type="button"
          onClick={() => saveBlob(new Blob([site.diagnosis_markdown], { type: 'text/markdown' }), 'Diagnostico_do_Site.md')}
        >
          Baixar diagnóstico (.md)
        </button>
      </div>
      <dl className={styles.trackinFacts}>
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.trackinMuted}>O que muda no tagueamento</p>
      <ul className={styles.trackinList}>
        {site.considerations.map((note) => <li key={note}>{note}</li>)}
      </ul>
    </section>
  );
};
