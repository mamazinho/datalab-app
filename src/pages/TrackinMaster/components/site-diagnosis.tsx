import designSystemStyles from '../../../styles/design-system.module.css';
import styles from '../trackin-master.module.css';
import { Callout } from '../../../components/UI/Callout';
import { Card } from '../../../components/UI/Card';
import type { ISiteAnalysis } from '../../../services/datalab-api/trackingResource';
import { ANTI_BOT_MESSAGE } from '../schemas';

const listOrNone = (values: string[], none: string) => (values.length ? values.join(', ') : none);

const AntiBotAlert = ({ protection }: { protection: string | null }) => (
  <Callout title={ANTI_BOT_MESSAGE} role="alert">
    {protection && <p>Proteção detectada: {protection}.</p>}
    <p>
      Para liberar o leitor, permita no firewall o User-Agent que contém GoTrackin-Scanner. Enquanto isso, preencha
      ferramentas e IDs abaixo: nada sobre GTM, banner ou tags foi concluído a partir da página de bloqueio.
    </p>
  </Callout>
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
    <Card title="Diagnóstico do site" state={site.reachable ? 'ok' : 'warning'}>
      <p className={designSystemStyles.muted}>{site.host}</p>
      {site.blocked && <AntiBotAlert protection={site.protection} />}
      {site.hardcoded_warnings.map((warning) => (
        <Callout key={warning.tool} title={`${warning.label} instalado direto no código do site: remova ao publicar o container`}>
          <p>ID encontrado: {warning.ids.join(', ')}</p>
          <p>{warning.why}</p>
          <p>Onde procurar para remover:</p>
          <ul className={designSystemStyles.list}>
            {warning.where.map((place) => <li key={place}>{place}</li>)}
          </ul>
        </Callout>
      ))}
      <dl className={styles.trackinFacts}>
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={designSystemStyles.muted}>O que muda no tagueamento</p>
      <ul className={designSystemStyles.list}>
        {site.considerations
          .filter((note) => !note.startsWith(ANTI_BOT_MESSAGE))
          .map((note) => <li key={note}>{note}</li>)}
      </ul>
    </Card>
  );
};
