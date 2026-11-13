import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useState } from 'react';
import { Modal } from '../../../components/UI/Modal/modal';
import type { IBuildResult } from '../../../services/datalab-api/trackingResource';
import { downloadContainer, downloadDocument } from '../downloads';
import { GuideSteps } from './guide-steps';
import { IdWarnings } from './id-warnings';
import { ImportProblem } from './import-problem';
import { PublicationCheck } from './publication-check';

type Stage = 'import' | 'problem' | 'publish';

interface INextStepsProps {
  result: IBuildResult;
  publicIds: Record<string, string>;
  onClose: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
}

const ImportStage = ({ result }: { result: IBuildResult }) => {
  const importFile = result.merge ?? result.web;
  return (
    <>
      <IdWarnings warnings={result.id_warnings} />
      <section className={styles.trackinModalSection} aria-label="Arquivos para baixar">
        <h4>Arquivos</h4>
        <div className={styles.trackinActions}>
          <button className={styles.trackinSecondaryButton} type="button" onClick={() => downloadContainer(importFile)}>
            Baixar {importFile.file}
          </button>
          {result.server && (
            <button className={styles.trackinSecondaryButton} type="button" onClick={() => downloadContainer(result.server!)}>
              Baixar {result.server.file}
            </button>
          )}
          <button className={styles.trackinSecondaryButton} type="button" onClick={() => downloadDocument(result)}>
            Baixar {result.document.file}
          </button>
        </div>
      </section>
      <section className={styles.trackinModalSection} aria-label="Requisitos">
        <h4>Requisitos</h4>
        <p className={styles.trackinMuted}>dataLayers a implementar no código-fonte do site:</p>
        <p>{result.requirements.datalayer_note}</p>
        <ul className={styles.trackinList}>
          {result.requirements.datalayer.map((event) => (
            <li key={event.event}>
              <strong>{event.event}</strong>: {event.when}
              {event.required.length > 0 && ` Obrigatórios: ${event.required.join(', ')}.`}
            </li>
          ))}
        </ul>
        <p className={styles.trackinMuted}>Acessos necessários:</p>
        <ul className={styles.trackinList}>
          {result.requirements.accesses.map((access) => <li key={access}>{access}</li>)}
        </ul>
      </section>
      <section className={styles.trackinModalSection} aria-label="Importar e testar">
        <h4>Importar e testar</h4>
        <GuideSteps steps={result.guide.import_steps} label="Passos para importar e testar" />
      </section>
      <p className={styles.trackinWarning} role="note">
        Não publique ainda: publique só depois que os dataLayers estiverem no ar e os testes no modo Visualizar passarem.
      </p>
    </>
  );
};

export const NextSteps = ({ result, publicIds, onClose, onRegenerate, regenerating }: INextStepsProps) => {
  const [stage, setStage] = useState<Stage>('import');
  const titles: Record<Stage, string> = {
    import: 'Importar e testar',
    problem: 'Tive um problema ao importar',
    publish: 'Publicar',
  };

  return (
    <Modal isOpen onClose={onClose} title={titles[stage]}>
      {stage === 'import' && (
        <>
          <ImportStage result={result} />
          <div className={styles.trackinActions}>
            <button className={styles.trackinSecondaryButton} type="button" disabled
              aria-describedby="trackin-validate-soon">
              <span className={styles.trackinComingSoon}>
                Validar implementação <span className={styles.trackinBadge} id="trackin-validate-soon">em breve</span>
              </span>
            </button>
            <button className={styles.trackinSecondaryButton} type="button" onClick={() => setStage('problem')}>
              Tive um problema ao importar
            </button>
            <button className={modal.submit} type="button" onClick={() => setStage('publish')}>Avançar</button>
          </div>
        </>
      )}
      {stage === 'problem' && (
        <>
          <ImportProblem onRegenerate={onRegenerate} regenerating={regenerating} />
          <button className={styles.trackinSecondaryButton} type="button" onClick={() => setStage('import')}>Voltar</button>
        </>
      )}
      {stage === 'publish' && (
        <>
          <section className={styles.trackinModalSection} aria-label="Publicar">
            <GuideSteps steps={result.guide.publish_steps} label="Passos para publicar" />
          </section>
          <PublicationCheck ids={publicIds} containerId={result.site.gtm_containers[0] ?? ''} />
          <button className={styles.trackinSecondaryButton} type="button" onClick={() => setStage('import')}>Voltar</button>
        </>
      )}
    </Modal>
  );
};
