import styles from '../trackin-master.module.css';
import type { ReactNode } from 'react';
import { Collapsible } from '../../../components/UI/Collapsible';
import { Markdown } from '../../../components/UI/Markdown';
import type { IBuildResult, IContainerFile } from '../../../services/tracking-api/trackingResource';
import { saveBlob } from '../../../utils/download';

const MISSING_ID_PREFIX = 'ID não informado';

const download = (filename: string, content: string, type: string) => saveBlob(new Blob([content], { type }), filename);

interface IContainerCardProps {
  title: string;
  container: IContainerFile;
  children?: ReactNode;
}

const ContainerCard = ({ title, container, children }: IContainerCardProps) => {
  const { ok, counts, issues } = container.validation;
  const errors = issues.filter((issue) => issue.severity === 'error');
  // Missing IDs are already listed as pending, so they are not repeated as warnings
  const warnings = issues.filter((issue) => issue.severity === 'warning' && !issue.message.startsWith(MISSING_ID_PREFIX));

  return (
    <section className={styles.trackinCard} data-state={ok ? 'ok' : 'error'} aria-label={title}>
      <div className={styles.trackinCardHead}>
        <h3 className={styles.trackinCardTitle}>{title}</h3>
        <button className={styles.trackinSecondaryButton} type="button"
          onClick={() => download(container.file, container.content, 'application/json')}>
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
      {container.pending_ids.length > 0 && (
        <p className={styles.trackinWarning}>IDs pendentes: {container.pending_ids.join(', ')}</p>
      )}
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

export const BuildResults = ({ result }: { result: IBuildResult }) => {
  const { web, server, merge, tag_map: tagMap } = result;

  return (
    <div className={styles.trackinResults} aria-live="polite">
      <h2 className={styles.trackinSectionTitle}>Resultado</h2>
      <ContainerCard title="Container web" container={web} />
      {server && <ContainerCard title="Container server-side" container={server} />}
      {merge && (
        <ContainerCard title="Mescla com o GTM do cliente" container={merge}>
          <p className={styles.trackinMuted}>Importar com: {merge.import_option}</p>
          <p className={styles.trackinTags}>
            {Object.entries(merge.findings).map(([action, total]) => (
              <span key={action} className={styles.trackinBadge}>{action}: {total}</span>
            ))}
          </p>
          <button className={styles.trackinSecondaryButton} type="button"
            onClick={() => download('Relatorio_Mescla.md', merge.report_markdown, 'text/markdown')}>
            Baixar relatório da mescla (.md)
          </button>
          <Collapsible label="Ver relatório da mescla">
            <div className={styles.trackinMarkdown}><Markdown>{merge.report_markdown}</Markdown></div>
          </Collapsible>
        </ContainerCard>
      )}
      <section className={styles.trackinCard} data-state="ok" aria-label="Mapa de Tags e Mapa de Atributos">
        <div className={styles.trackinCardHead}>
          <h3 className={styles.trackinCardTitle}>Mapa de Tags + Mapa de Atributos</h3>
        </div>
        <p className={styles.trackinMuted}>{tagMap.tags} tags e {tagMap.attributes} variáveis mapeadas.</p>
        <div className={styles.trackinActions}>
          <button className={styles.trackinSecondaryButton} type="button"
            onClick={() => download('Mapa_de_Tags.md', tagMap.markdown, 'text/markdown')}>Mapa completo (.md)</button>
          <button className={styles.trackinSecondaryButton} type="button"
            onClick={() => download('Mapa_de_Tags.csv', tagMap.tags_csv, 'text/csv;charset=utf-8')}>Tags (.csv)</button>
          <button className={styles.trackinSecondaryButton} type="button"
            onClick={() => download('Mapa_de_Atributos.csv', tagMap.attributes_csv, 'text/csv;charset=utf-8')}>Atributos (.csv)</button>
        </div>
        <Collapsible label="Ver mapa">
          <div className={styles.trackinMarkdown}><Markdown>{tagMap.markdown}</Markdown></div>
        </Collapsible>
      </section>
    </div>
  );
};
