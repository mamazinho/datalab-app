import styles from '../trackin-master.module.css';
import type { ReactNode } from 'react';
import { Collapsible } from '../../../components/UI/Collapsible';
import type { IBuildResult, IContainerFile } from '../../../services/datalab-api/trackingResource';
import { downloadContainer, downloadDocument, downloadText } from '../downloads';

interface IContainerCardProps {
  title: string;
  container: IContainerFile;
  children?: ReactNode;
}

const ContainerCard = ({ title, container, children }: IContainerCardProps) => {
  const { ok, counts, issues } = container.validation;
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return (
    <section className={styles.trackinCard} data-state={ok ? 'ok' : 'error'} aria-label={title}>
      <div className={styles.trackinCardHead}>
        <h3 className={styles.trackinCardTitle}>{title}</h3>
        <button className={styles.trackinSecondaryButton} type="button" onClick={() => downloadContainer(container)}>
          Baixar {container.file}
        </button>
      </div>
      <p className={styles.trackinTags}>
        <span className={styles.trackinBadge} data-state={ok ? 'ok' : 'error'}>
          {ok ? 'validação ok' : `${errors.length} erro(s)`}
        </span>
        {Object.entries(counts).map(([kind, total]) => (
          <span key={kind} className={styles.trackinBadge}>{total} {kind}</span>
        ))}
      </p>
      {errors.length > 0 && (
        <ul className={styles.trackinList} data-state="error">
          {errors.map((issue, index) => <li key={index}>{issue.item ? `${issue.item} — ` : ''}{issue.message}</li>)}
        </ul>
      )}
      {warnings.length > 0 && (
        <Collapsible label={`${warnings.length} aviso(s)`}>
          <ul className={styles.trackinList}>
            {warnings.map((issue, index) => <li key={index}>{issue.item ? `${issue.item} — ` : ''}{issue.message}</li>)}
          </ul>
        </Collapsible>
      )}
      {children}
    </section>
  );
};

interface IBuildResultsProps {
  result: IBuildResult;
  onShowNextSteps: () => void;
}

export const BuildResults = ({ result, onShowNextSteps }: IBuildResultsProps) => {
  const { web, server, merge, tag_map: tagMap, datalayer } = result;

  return (
    <div className={styles.trackinResults} aria-live="polite">
      <div className={styles.trackinCardHead}>
        <h2 className={styles.trackinSectionTitle}>Resultado</h2>
        <button className={styles.trackinSecondaryButton} type="button" onClick={onShowNextSteps}>
          Ver próximos passos
        </button>
      </div>
      <section className={styles.trackinCard} data-state="ok" aria-label="Documentação do cliente">
        <div className={styles.trackinCardHead}>
          <h3 className={styles.trackinCardTitle}>Documentação Go Trackin' (padrão v{result.standard_version})</h3>
          <button className={styles.trackinSecondaryButton} type="button" onClick={() => downloadDocument(result)}>
            Baixar {result.document.file}
          </button>
        </div>
        <p className={styles.trackinMuted}>
          Diagnóstico, avisos, requisitos, Mapa de Tags, Mapa de Atributos, Mapa de dataLayer, importação, publicação e
          responsabilidades num documento só.
        </p>
      </section>
      {merge ? (
        <ContainerCard title="Mescla com o GTM do cliente" container={merge}>
          <p className={styles.trackinMuted}>Importar com: {merge.import_option}</p>
          <p className={styles.trackinTags}>
            {Object.entries(merge.findings).map(([action, total]) => (
              <span key={action} className={styles.trackinBadge}>{action}: {total}</span>
            ))}
          </p>
        </ContainerCard>
      ) : (
        <ContainerCard title="Container web" container={web} />
      )}
      {server && <ContainerCard title="Container server-side" container={server} />}
      <section className={styles.trackinCard} data-state="ok" aria-label="Planilhas dos mapas">
        <div className={styles.trackinCardHead}>
          <h3 className={styles.trackinCardTitle}>Planilhas dos mapas</h3>
        </div>
        <p className={styles.trackinMuted}>
          {tagMap.tags} tags, {tagMap.attributes} variáveis e {datalayer.events.length} eventos de dataLayer mapeados.
        </p>
        <div className={styles.trackinActions}>
          <button className={styles.trackinSecondaryButton} type="button"
            onClick={() => downloadText('Mapa_de_Tags.csv', tagMap.tags_csv, 'text/csv;charset=utf-8')}>Tags (.csv)</button>
          <button className={styles.trackinSecondaryButton} type="button"
            onClick={() => downloadText('Mapa_de_Atributos.csv', tagMap.attributes_csv, 'text/csv;charset=utf-8')}>Atributos (.csv)</button>
          <button className={styles.trackinSecondaryButton} type="button"
            onClick={() => downloadText('Mapa_de_dataLayer.csv', datalayer.csv, 'text/csv;charset=utf-8')}>dataLayer (.csv)</button>
        </div>
      </section>
    </div>
  );
};
