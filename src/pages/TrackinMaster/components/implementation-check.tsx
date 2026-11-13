import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useActionState } from 'react';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';
import type { IEventCheck, IImplementationResult, IPageCheck } from '../../../services/datalab-api/trackingResource';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { createValidateImplementationAction, PAGE_FIELD_PREFIX } from '../actions';
import { PAGE_KINDS } from '../schemas';

interface IImplementationCheckProps {
  ids: Record<string, string>;
  containerId: string;
  siteUrl: string;
}

const eventText = (event: IEventCheck) => {
  if (event.status === 'ok') return `${event.event}: enviado com os campos obrigatórios.`;
  if (event.status === 'incomplete') return `${event.event}: enviado, mas faltam ${event.missing_fields.join(', ')}.`;
  return `${event.event}: não enviado.${event.note ? ` ${event.note}` : ''}`;
};

const PageResult = ({ page }: { page: IPageCheck }) => (
  <section className={styles.trackinModalSection} aria-label={page.label}>
    <h4>{page.label}</h4>
    <p className={styles.trackinMuted}>{page.final_url ?? page.url}</p>
    {!page.opened ? (
      <p className={styles.trackinWarning}>{page.problem}</p>
    ) : (
      <ul className={styles.trackinList}>
        <li data-state={page.container_loaded ? 'ok' : 'error'}>
          {page.container_loaded ? 'Contêiner carregou.' : 'Contêiner não carregou.'}
        </li>
        {page.events.map((event) => (
          <li key={event.event} data-state={event.status === 'ok' ? 'ok' : 'error'}>{eventText(event)}</li>
        ))}
        {page.tags.map((tag) => (
          <li key={tag.key} data-state={tag.fired ? 'ok' : 'error'}>
            {tag.label}: {tag.fired ? 'disparou' : 'não disparou'}
          </li>
        ))}
      </ul>
    )}
  </section>
);

const Report = ({ result }: { result: IImplementationResult }) => (
  <div role="status" aria-label="Resultado da validação">
    <p className={result.ok ? undefined : styles.trackinWarning}>
      {result.ok
        ? 'Tudo certo nas páginas abertas: os dataLayers chegam completos e as tags disparam.'
        : 'Encontramos pendências: veja cada página abaixo.'}
    </p>
    {result.notes.map((note) => <p key={note} className={styles.trackinMuted}>{note}</p>)}
    {result.pages.map((page) => <PageResult key={page.kind} page={page} />)}
    {result.manual_events.length > 0 && (
      <section className={styles.trackinModalSection} aria-label="Conferir no modo Visualizar">
        <h4>Conferir no modo Visualizar</h4>
        <p className={styles.trackinMuted}>
          Estes eventos dependem de uma ação na página (clicar, adicionar ao carrinho, entrar) e não aparecem só
          abrindo a página. Confira no modo Visualizar do GTM:
        </p>
        <p>{result.manual_events.join(', ')}</p>
      </section>
    )}
  </div>
);

export const ImplementationCheck = ({ ids, containerId, siteUrl }: IImplementationCheckProps) => {
  const [state, formAction] = useActionState(createValidateImplementationAction(ids), INITIAL_ACTION_STATE);

  return (
    <>
      <form action={formAction} onReset={(event) => event.preventDefault()} aria-label="Validar implementação">
        <p className={styles.trackinMuted}>
          Abrimos cada página num navegador de verdade e conferimos o dataLayer que o site envia e as tags que o
          contêiner publicado dispara. O navegador do teste não aceita o banner de cookies. Cada página conta como uma
          leitura no limite de uso.
        </p>
        <FormFieldset className={modal.fieldset}>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="trackin-validate-container">Código do contêiner publicado</label>
            <input className={modal.input} id="trackin-validate-container" name="container_id"
              defaultValue={containerId} placeholder="GTM-XXXXXXX" autoComplete="off" required />
          </div>
          {PAGE_KINDS.map(({ kind, label, hint }) => (
            <div className={modal.field} key={kind}>
              <label className={modal.label} htmlFor={`trackin-page-${kind}`}>
                {label}{kind === 'home' ? ' *' : ''}
              </label>
              <input className={modal.input} id={`trackin-page-${kind}`} name={`${PAGE_FIELD_PREFIX}${kind}`}
                inputMode="url" defaultValue={kind === 'home' ? siteUrl : ''} placeholder={hint} required={kind === 'home'}
                autoComplete="off" />
            </div>
          ))}
          <SubmitButton className={modal.submit} pendingLabel="Abrindo as páginas...">Validar</SubmitButton>
        </FormFieldset>
        {state.error && !state.success && <p className={modal.error} role="alert">{state.error}</p>}
      </form>
      {state.success && state.data && <Report result={state.data} />}
    </>
  );
};
