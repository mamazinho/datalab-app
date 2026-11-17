import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useActionState } from 'react';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';
import { useTrackingRules } from '../../../hooks/use-tracking-rules';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { importHelpAction } from '../actions';

interface IImportProblemProps {
  onRegenerate: () => void;
  regenerating: boolean;
}

export const ImportProblem = ({ onRegenerate, regenerating }: IImportProblemProps) => {
  const { data: rules } = useTrackingRules();
  const [state, formAction] = useActionState(importHelpAction, INITIAL_ACTION_STATE);
  const help = state.success ? state.data : undefined;

  return (
    <div className={styles.trackinModalSection}>
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
              placeholder="Cole aqui o texto do erro que o GTM mostrou" />
          </div>
          <SubmitButton className={modal.submit} pendingLabel="Buscando...">Ver o que fazer</SubmitButton>
        </FormFieldset>
        {state.error && !state.success && <p className={modal.error} role="alert">{state.error}</p>}
      </form>
      {help && (
        <section className={styles.trackinModalSection} aria-label="Diagnóstico do problema">
          <h4>{help.label}</h4>
          <p>{help.diagnosis}</p>
          <ol className={styles.trackinSteps}>
            {help.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          {help.regenerate && (
            <button className={modal.submit} type="button" onClick={onRegenerate} disabled={regenerating}>
              {regenerating ? 'Gerando...' : 'Gerar o container de novo'}
            </button>
          )}
        </section>
      )}
    </div>
  );
};
