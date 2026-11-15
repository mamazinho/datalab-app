import styles from '../trackin-master.module.css';
import { useQuery } from '@tanstack/react-query';
import { siteMapQuery } from '../../../queries';
import type { ISiteMap, ISiteMapJob } from '../../../services/datalab-api/trackingResource';

const PRODUCT_IDS: Record<string, string> = {
  sku: 'id da variante (sku)',
  id: 'id do produto',
  both: 'id da variante (sku) e id do produto',
};

const labelsOf = (keys: string[], labels: Record<string, string>) => keys.map((key) => labels[key] ?? key).join(', ');

const Progress = ({ job }: { job: ISiteMapJob }) => {
  const { stage, pages_done: done, pages_total: total } = job.progress;
  return (
    <p className={styles.trackinMuted} role="status">
      {stage ?? 'Começando o mapeamento'}
      {total ? ` (${done ?? 0} de ${total} páginas)` : ''}... Isso leva alguns minutos; pode continuar nesta tela.
    </p>
  );
};

const Summary = ({ siteMap }: { siteMap: ISiteMap }) => (
  <>
    <ul className={styles.trackinList} aria-label="Páginas encontradas">
      {siteMap.pages.map((page) => (
        <li key={page.kind} data-state={page.opened ? 'ok' : 'error'}>
          <strong>{page.label}</strong>: {page.opened ? page.url : `${page.url} (${page.problem})`}
        </li>
      ))}
    </ul>
    <dl className={styles.trackinFacts}>
      <div>
        <dt>Identificação dos produtos</dt>
        <dd>{siteMap.product_identifier ? PRODUCT_IDS[siteMap.product_identifier] : 'não identificada'}</dd>
      </div>
      <div>
        <dt>Dados do cliente pedidos no site</dt>
        <dd>{siteMap.user_fields.length ? labelsOf(siteMap.user_fields, siteMap.field_labels) : 'nenhum encontrado'}</dd>
      </div>
      <div>
        <dt>Campos extras no checkout</dt>
        <dd>{siteMap.checkout_fields.length ? labelsOf(siteMap.checkout_fields, siteMap.field_labels) : 'nenhum encontrado'}</dd>
      </div>
      <div>
        <dt>Listas de produtos</dt>
        <dd>{siteMap.has_product_lists ? 'sim' : 'não encontradas'}</dd>
      </div>
    </dl>
    {siteMap.missing.length > 0 && (
      <p className={styles.trackinMuted}>Não encontradas: {siteMap.missing.join(', ')}.</p>
    )}
  </>
);

export const SiteMap = ({ jobId }: { jobId: string }) => {
  const { data: job, error } = useQuery(siteMapQuery(jobId));
  const failed = job?.status === 'failed' || Boolean(error);

  return (
    <section className={styles.trackinCard} data-state={failed ? 'warning' : 'ok'} aria-label="Mapa do site">
      <div className={styles.trackinCardHead}>
        <h3 className={styles.trackinCardTitle}>Mapa do site</h3>
      </div>
      {!job || job.status === 'running' ? (
        job ? <Progress job={job} /> : <p className={styles.trackinMuted} role="status">Começando o mapeamento...</p>
      ) : job.status === 'failed' || !job.site_map ? (
        <p className={styles.trackinWarning} role="alert">{job.error ?? 'Não foi possível mapear o site.'}</p>
      ) : (
        <Summary siteMap={job.site_map} />
      )}
    </section>
  );
};
