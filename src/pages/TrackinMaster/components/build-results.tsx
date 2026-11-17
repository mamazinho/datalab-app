import designSystemStyles from '../../../styles/design-system.module.css';
import styles from '../trackin-master.module.css';
import type { ReactNode } from 'react';
import { Card } from '../../../components/UI/Card';
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
    <Card
      title={title}
      state={ok ? 'ok' : 'error'}
      actions={
        <button className={designSystemStyles.actionButton} type="button" onClick={() => downloadContainer(container)}>
          Baixar {container.file}
        </button>
      }
    >
      <p className={styles.trackinRow}>
        <span className={designSystemStyles.badge} data-state={ok ? 'ok' : 'error'}>
          {ok ? 'validação ok' : `${errors.length} erro(s)`}
        </span>
        {Object.entries(counts).map(([kind, total]) => (
          <span key={kind} className={designSystemStyles.badge}>{total} {kind}</span>
        ))}
      </p>
      {errors.length > 0 && (
        <ul className={designSystemStyles.list} data-state="error">
          {errors.map((issue, index) => <li key={index}>{issue.item ? `${issue.item} — ` : ''}{issue.message}</li>)}
        </ul>
      )}
      {warnings.length > 0 && (
        <Collapsible label={`${warnings.length} aviso(s)`}>
          <ul className={designSystemStyles.list}>
            {warnings.map((issue, index) => <li key={index}>{issue.item ? `${issue.item} — ` : ''}{issue.message}</li>)}
          </ul>
        </Collapsible>
      )}
      {children}
    </Card>
  );
};

interface IBuildResultsProps {
  result: IBuildResult;
  onShowNextSteps: () => void;
}

export const BuildResults = ({ result, onShowNextSteps }: IBuildResultsProps) => {
  const { web, server, merge, tag_map: tagMap, datalayer } = result;

  return (
    <div className={styles.trackinStack} aria-live="polite">
      <div className={styles.trackinHead}>
        <h2 className={designSystemStyles.sectionTitle}>Resultado</h2>
        <button className={designSystemStyles.actionButton} type="button" onClick={onShowNextSteps}>
          Ver próximos passos
        </button>
      </div>
      <Card
        title={`Documentação Go Trackin' (padrão v${result.standard_version})`}
        state="ok"
        actions={
          <button className={designSystemStyles.actionButton} type="button" onClick={() => downloadDocument(result)}>
            Baixar {result.document.file}
          </button>
        }
      >
        <p className={designSystemStyles.muted}>
          Diagnóstico, avisos, requisitos, Mapa de Tags, Mapa de Atributos, Mapa de dataLayer, importação, publicação e
          responsabilidades num documento só.
        </p>
      </Card>
      {merge ? (
        <ContainerCard title="Mescla com o GTM do cliente" container={merge}>
          <p className={designSystemStyles.muted}>Importar com: {merge.import_option}</p>
          <p className={styles.trackinRow}>
            {Object.entries(merge.findings).map(([action, total]) => (
              <span key={action} className={designSystemStyles.badge}>{action}: {total}</span>
            ))}
          </p>
        </ContainerCard>
      ) : (
        <ContainerCard title="Container web" container={web} />
      )}
      {server && <ContainerCard title="Container server-side" container={server} />}
      <Card title="Planilhas dos mapas" state="ok">
        <p className={designSystemStyles.muted}>
          {tagMap.tags} tags, {tagMap.attributes} variáveis e {datalayer.events.length} eventos de dataLayer mapeados.
        </p>
        <div className={styles.trackinRow}>
          <button className={designSystemStyles.actionButton} type="button"
            onClick={() => downloadText('Mapa_de_Tags.csv', tagMap.tags_csv, 'text/csv;charset=utf-8')}>Tags (.csv)</button>
          <button className={designSystemStyles.actionButton} type="button"
            onClick={() => downloadText('Mapa_de_Atributos.csv', tagMap.attributes_csv, 'text/csv;charset=utf-8')}>Atributos (.csv)</button>
          <button className={designSystemStyles.actionButton} type="button"
            onClick={() => downloadText('Mapa_de_dataLayer.csv', datalayer.csv, 'text/csv;charset=utf-8')}>dataLayer (.csv)</button>
        </div>
      </Card>
    </div>
  );
};
