import styles from '../trackin-master.module.css';
import type { ISiteAnalysis } from '../../../services/datalab-api/trackingResource';
import { ANTI_BOT_MESSAGE } from '../schemas';
import { HardcodedWarnings } from './hardcoded-warnings';

const listOrNone = (values: string[], none: string) => (values.length ? values.join(', ') : none);

const AntiBotAlert = ({ protection }: { protection: string | null }) => (
  <div className={styles.trackinAlert} role="alert">
    <strong>{ANTI_BOT_MESSAGE}</strong>
    {protection && <p>Proteção detectada: {protection}.</p>}
    <p>
      Para liberar o leitor, permita no firewall o User-Agent que contém GoTrackin-Scanner. Enquanto isso, preencha
      ferramentas e IDs abaixo: nada sobre GTM, banner ou tags foi concluído a partir da página de bloqueio.
    </p>
  </div>
);

export const SiteDiagnosis = ({ site }: { site: ISiteAnalysis }) => {
  const facts: Array<[string, string]> = site.reachable
    ? [
        ['Plataforma', site.platform ?? 'não identificada'],
        ['Banner de cookies', site.cmp ?? 'não encontrado'],
        ['GTM instalado', listOrNone(site.gtm_containers, 'nenhum')],
        ['Hostnames (filtro do GA4)', site.hostnames.join(', ')],
        ['Cookie domain', site.cookie_domain],
      ]
    : [['Cookie domain', site.cookie_domain]];

  return (
    <section className={styles.trackinCard} data-state={site.reachable ? 'ok' : 'warning'} aria-label="Diagnóstico do site">
      <div className={styles.trackinCardHead}>
        <h3 className={styles.trackinCardTitle}>Diagnóstico de {site.host}</h3>
      </div>
      {site.blocked && <AntiBotAlert protection={site.protection} />}
      <HardcodedWarnings warnings={site.hardcoded_warnings} />
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
        {site.considerations
          .filter((note) => !note.startsWith(ANTI_BOT_MESSAGE))
          .map((note) => <li key={note}>{note}</li>)}
      </ul>
    </section>
  );
};
