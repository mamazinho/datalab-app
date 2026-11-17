import designSystemStyles from '../../../styles/design-system.module.css';
import styles from '../trackin-master.module.css';
import { useState } from 'react';
import { Callout } from '../../../components/UI/Callout';
import { Card } from '../../../components/UI/Card';
import { Modal } from '../../../components/UI/Modal/modal';
import { Step } from '../../../components/UI/Steps/step';
import { StepsController } from '../../../components/UI/Steps/steps-controller';
import type { IBuildResult, IGuideStep } from '../../../services/datalab-api/trackingResource';
import { downloadContainer, downloadDocument } from '../downloads';
import { ImplementationCheck } from './implementation-check';
import { ImportProblem } from './import-problem';
import { PublicationCheck } from './publication-check';

const guideList = (steps: IGuideStep[], label: string) => (
  <ol className={designSystemStyles.list} aria-label={label} start={steps[0]?.number}>
    {steps.map((step) => (
      <li key={step.number}>
        <strong>{step.title}</strong>
        <p className={designSystemStyles.muted}>{step.text}</p>
      </li>
    ))}
  </ol>
);

interface IImportStageProps {
  result: IBuildResult;
  onRegenerate: () => void;
  regenerating: boolean;
}

const ImportStage = ({ result, onRegenerate, regenerating }: IImportStageProps) => {
  const [askingForHelp, setAskingForHelp] = useState(false);
  const importFile = result.merge ?? result.web;

  if (askingForHelp) {
    return (
      <section className={styles.trackinStack} aria-label="Tive um problema ao importar">
        <h3 className={designSystemStyles.sectionTitle}>Tive um problema ao importar</h3>
        <ImportProblem onRegenerate={onRegenerate} regenerating={regenerating} />
        <button className={designSystemStyles.actionButton} type="button" onClick={() => setAskingForHelp(false)}>
          Voltar ao passo a passo
        </button>
      </section>
    );
  }

  return (
    <section className={styles.trackinStack} aria-label="Importar e testar">
      <h3 className={designSystemStyles.sectionTitle}>Importar e testar</h3>
      {result.id_warnings.length > 0 && (
        <Callout title="Confira estes IDs antes de publicar: o formato deles ainda não foi confirmado." label="IDs com formato não confirmado">
          <ul className={designSystemStyles.list}>
            {result.id_warnings.map((warning) => (
              <li key={warning.key}>{warning.label}: formato esperado {warning.format}.</li>
            ))}
          </ul>
        </Callout>
      )}
      <Card title="Arquivos">
        <div className={styles.trackinRow}>
          <button className={designSystemStyles.actionButton} type="button" onClick={() => downloadContainer(importFile)}>
            Baixar {importFile.file}
          </button>
          {result.server && (
            <button className={designSystemStyles.actionButton} type="button" onClick={() => downloadContainer(result.server!)}>
              Baixar {result.server.file}
            </button>
          )}
          <button className={designSystemStyles.actionButton} type="button" onClick={() => downloadDocument(result)}>
            Baixar {result.document.file}
          </button>
        </div>
      </Card>
      <Card title="Requisitos">
        <p className={designSystemStyles.muted}>dataLayers a implementar no código-fonte do site:</p>
        <p>{result.requirements.datalayer_note}</p>
        <ul className={designSystemStyles.list}>
          {result.requirements.datalayer.map((event) => (
            <li key={event.event}>
              <strong>{event.event}</strong>: {event.when}
              {event.required.length > 0 && ` Obrigatórios: ${event.required.join(', ')}.`}
            </li>
          ))}
        </ul>
        <p className={designSystemStyles.muted}>Acessos necessários:</p>
        <ul className={designSystemStyles.list}>
          {result.requirements.accesses.map((access) => <li key={access}>{access}</li>)}
        </ul>
      </Card>
      {guideList(result.guide.import_steps, 'Passos para importar e testar')}
      <Callout title="Não publique ainda">
        <p>Valide a implementação no próximo passo e publique só depois que os dataLayers estiverem no ar.</p>
      </Callout>
      <button className={designSystemStyles.actionButton} type="button" onClick={() => setAskingForHelp(true)}>
        Tive um problema ao importar
      </button>
    </section>
  );
};

interface INextStepsProps {
  result: IBuildResult;
  publicIds: Record<string, string>;
  onClose: () => void;
  onRegenerate: () => void;
  regenerating: boolean;
}

export const NextSteps = ({ result, publicIds, onClose, onRegenerate, regenerating }: INextStepsProps) => (
  <Modal isOpen onClose={onClose} title="Próximos passos">
    <StepsController>
      <Step canGoForward>
        <ImportStage result={result} onRegenerate={onRegenerate} regenerating={regenerating} />
      </Step>
      <Step canGoBack canGoForward>
        <section className={styles.trackinStack} aria-label="Validar implementação">
          <h3 className={designSystemStyles.sectionTitle}>Validar implementação</h3>
          <ImplementationCheck ids={publicIds} />
        </section>
      </Step>
      <Step canGoBack>
        <section className={styles.trackinStack} aria-label="Publicar">
          <h3 className={designSystemStyles.sectionTitle}>Publicar</h3>
          {guideList(result.guide.publish_steps, 'Passos para publicar')}
          <PublicationCheck ids={publicIds} containerId={result.site.gtm_containers[0] ?? ''} />
          <button className={designSystemStyles.actionButton} type="button" onClick={onClose}>
            Fechar instruções
          </button>
        </section>
      </Step>
    </StepsController>
  </Modal>
);
