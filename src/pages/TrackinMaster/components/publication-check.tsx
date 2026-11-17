import designSystemStyles from '../../../styles/design-system.module.css';
import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useActionState } from 'react';
import { Callout } from '../../../components/UI/Callout';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { createVerifyPublicationAction } from '../actions';

interface IPublicationCheckProps {
  ids: Record<string, string>;
  containerId: string;
}

export const PublicationCheck = ({ ids, containerId }: IPublicationCheckProps) => {
  const [state, formAction] = useActionState(createVerifyPublicationAction(ids), INITIAL_ACTION_STATE);
  const result = state.success ? state.data : undefined;

  return (
    <form action={formAction} aria-label="Conferir publicação">
      <FormFieldset className={modal.fieldset}>
        <div className={modal.field}>
          <label className={modal.label} htmlFor="trackin-container-id">Código do contêiner publicado</label>
          <input className={modal.input} id="trackin-container-id" name="container_id" defaultValue={containerId}
            placeholder="GTM-XXXXXXX" autoComplete="off" required />
        </div>
        <SubmitButton className={modal.submit} pendingLabel="Conferindo...">Avançar</SubmitButton>
      </FormFieldset>
      {state.error && !state.success && <p className={modal.error} role="alert">{state.error}</p>}
      {result && (
        <div className={styles.trackinStack} role="status">
          {!result.published && (
            <Callout>
              <p>O contêiner {result.container_id} ainda não tem versão publicada (o gtm.js público não respondeu).</p>
            </Callout>
          )}
          {result.published && result.missing.length === 0 && (
            <p>Tudo no ar: os IDs gerados já estão na versão publicada de {result.container_id}.</p>
          )}
          {result.published && result.missing.length > 0 && (
            <Callout>
              <p>
                Publicado, mas faltam na versão no ar: {result.missing.join(', ')}. Confira se a versão certa foi
                publicada.
              </p>
            </Callout>
          )}
          <ul className={designSystemStyles.list}>
            {result.ids.map((item) => (
              <li key={item.key}>{item.label}: {item.found ? 'encontrado' : 'não encontrado'}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};
