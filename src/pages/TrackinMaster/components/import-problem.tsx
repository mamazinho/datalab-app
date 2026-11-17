import designSystemStyles from '../../../styles/design-system.module.css';
import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useActionState, useState } from 'react';
import { PermissionGate } from '../../../components/Tools/permission-gate';
import { Card } from '../../../components/UI/Card';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';
import { useTrackingRules } from '../../../hooks/use-tracking-rules';
import type { IImportHelp } from '../../../services/datalab-api/trackingResource';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { CHAT_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { importHelpAction } from '../actions';
import { AdvisorChat } from './advisor-chat';

interface IImportProblemProps {
  onRegenerate: () => void;
  regenerating: boolean;
}

const advisorOpening = (help: IImportHelp, gtmMessage: string) =>
  [
    `Tive um problema ao importar o contêiner no GTM (${help.label}).`,
    gtmMessage.trim() && `O GTM mostrou: "${gtmMessage.trim()}".`,
    'O diagnóstico sugerido não resolveu.',
  ]
    .filter(Boolean)
    .join(' ');

export const ImportProblem = ({ onRegenerate, regenerating }: IImportProblemProps) => {
  const { data: rules } = useTrackingRules();
  const [state, formAction] = useActionState(importHelpAction, INITIAL_ACTION_STATE);
  const [gtmMessage, setGtmMessage] = useState('');
  const [talkingToAdvisor, setTalkingToAdvisor] = useState(false);
  const help = state.success ? state.data : undefined;

  return (
    <div className={styles.trackinStack}>
      <form action={formAction} aria-label="Problema ao importar">
        <FormFieldset className={modal.fieldset}>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="trackin-problem-kind">O que aconteceu?</label>
            <select className={modal.select} id="trackin-problem-kind" name="kind" defaultValue="">
              <option value="" disabled>Escolha o tipo de problema</option>
              {rules.import_problems.map((kind) => <option key={kind.key} value={kind.key}>{kind.label}</option>)}
            </select>
          </div>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="trackin-problem-message">Mensagem do GTM</label>
            <textarea className={modal.textarea} id="trackin-problem-message" name="message" maxLength={2000} rows={3}
              placeholder="Cole aqui o texto do erro que o GTM mostrou" value={gtmMessage}
              onChange={(event) => setGtmMessage(event.target.value)} />
          </div>
          <SubmitButton className={modal.submit} pendingLabel="Buscando...">Ver o que fazer</SubmitButton>
        </FormFieldset>
        {state.error && !state.success && <p className={modal.error} role="alert">{state.error}</p>}
      </form>
      {help && (
        <Card title={help.label}>
          <p>{help.diagnosis}</p>
          <ol className={designSystemStyles.list}>
            {help.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          {help.regenerate && (
            <button className={modal.submit} type="button" onClick={onRegenerate} disabled={regenerating}>
              {regenerating ? 'Gerando...' : 'Gerar o container de novo'}
            </button>
          )}
          <PermissionGate route={CHAT_ROUTE_PERMISSIONS.create}>
            {talkingToAdvisor ? (
              <AdvisorChat opening={advisorOpening(help, gtmMessage)} />
            ) : (
              <button className={designSystemStyles.actionButton} type="button" onClick={() => setTalkingToAdvisor(true)}>
                Ainda não resolveu? Falar com o assessor
              </button>
            )}
          </PermissionGate>
        </Card>
      )}
    </div>
  );
};
