import designSystemStyles from '../../styles/design-system.module.css';
import modal from '../../styles/modal-form.module.css';
import { useActionState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormFieldset, SubmitButton } from '../../components/UI/Forms';
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { unsubscribeAction } from './actions';

// One click on purpose: mail scanners open every link of an e-mail, and that alone must not unsubscribe anyone
export const UnsubscribeUpdates = () => {
  const [searchParams] = useSearchParams();
  const [state, formAction] = useActionState(unsubscribeAction, INITIAL_ACTION_STATE);

  return (
    <div className={designSystemStyles.authShell}>
      <section className={designSystemStyles.authCard}>
        <header className={designSystemStyles.authHeader}>
          <h1 className={designSystemStyles.brandTitle}>DataLab <span className={designSystemStyles.brandHighlight}>App</span></h1>
          <h2 className={designSystemStyles.subtitle}>Avisos do Trackin' Master</h2>
        </header>
        {state.success ? (
          <p role="status">Pronto: você não vai mais receber os avisos de atualização de container do Trackin' Master.</p>
        ) : (
          <form action={formAction} aria-label="Descadastrar avisos">
            <FormFieldset className={modal.fieldset}>
              <p className={designSystemStyles.description}>
                Confirme para deixar de receber por e-mail os avisos de que um container do GTM precisa de atualização.
              </p>
              <input type="hidden" name="token" value={searchParams.get('token') ?? ''} />
              <SubmitButton className={modal.submit} pendingLabel="Descadastrando...">Confirmar descadastro</SubmitButton>
            </FormFieldset>
            {state.error && <p className={modal.error} role="alert">{state.error}</p>}
          </form>
        )}
      </section>
    </div>
  );
};
