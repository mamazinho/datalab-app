import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useActionState } from 'react';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import type { ISiteAnalysis } from '../../../services/tracking-api/trackingResource';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { scanSiteAction } from '../actions';

interface ISiteStepProps {
  onAnalyzed: (site: ISiteAnalysis) => void;
}

export const SiteStep = ({ onAnalyzed }: ISiteStepProps) => {
  const [formState, formAction] = useActionState(scanSiteAction, INITIAL_ACTION_STATE);

  useActionFeedback(formState, {
    onSuccess: (site) => {
      if (site) onAnalyzed(site);
    },
    onError: () => {},
  });

  return (
    <form className={styles.trackinSection} action={formAction} aria-label="Site a ser tagueado">
      <h2 className={styles.trackinSectionTitle}>1. Site a ser tagueado</h2>
      <FormFieldset className={modal.fieldset}>
        <div className={modal.field}>
          <label className={modal.label} htmlFor="trackin-site-url">URL do site *</label>
          <div className={styles.trackinInline}>
            <input className={modal.input}
              id="trackin-site-url"
              name="site_url"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="https://www.lojadocliente.com.br"
              aria-describedby="trackin-site-url-hint"
              required
              autoFocus
            />
            <SubmitButton className={modal.submit} pendingLabel="Analisando...">Analisar site</SubmitButton>
          </div>
          <p className={modal.hint} id="trackin-site-url-hint">
            Abrimos a página e identificamos plataforma, GTM instalado, banner de cookies, tags no código e domínios do
            funil. Isso muda o tagueamento e entra na documentação.
          </p>
        </div>
      </FormFieldset>
      {formState.error && !formState.success && <p className={modal.error} role="alert">{formState.error}</p>}
    </form>
  );
};
