import designSystemStyles from '../../../styles/design-system.module.css';
import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useActionState } from 'react';
import { Callout } from '../../../components/UI/Callout';
import { Card } from '../../../components/UI/Card';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';
import type {
  IEventCheck,
  IImplementationResult,
  IInvalidPreviewLink,
  IPageCheck,
  PageKind,
} from '../../../services/datalab-api/trackingResource';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { createValidateImplementationAction, PAGE_FIELD_PREFIX } from '../actions';
import { PAGE_KINDS, PREVIEW_LINK_EXAMPLE } from '../schemas';

interface IImplementationCheckProps {
  ids: Record<string, string>;
}

const eventText = (event: IEventCheck) => {
  if (event.status === 'ok') return `${event.event}: enviado com os campos obrigatórios.`;
  if (event.status === 'incomplete') return `${event.event}: enviado, mas faltam ${event.missing_fields.join(', ')}.`;
  return `${event.event}: não enviado.${event.note ? ` ${event.note}` : ''}`;
};

const PageResult = ({ page }: { page: IPageCheck }) => (
  <Card title={page.label}>
    <p className={designSystemStyles.muted}>{page.final_url ?? page.url}</p>
    {!page.opened ? (
      <Callout>
        <p>{page.problem}</p>
      </Callout>
    ) : (
      <ul className={designSystemStyles.list}>
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
  </Card>
);

const Report = ({ result }: { result: IImplementationResult }) => (
  <div className={styles.trackinStack} role="status" aria-label="Resultado da validação">
    {result.ok ? (
      <p>Tudo certo nas páginas de QA: os dataLayers chegam completos e as tags da workspace disparam. Pode publicar.</p>
    ) : (
      <Callout>
        <p>Encontramos pendências: veja cada página abaixo.</p>
      </Callout>
    )}
    {result.notes.map((note) => <p key={note} className={designSystemStyles.muted}>{note}</p>)}
    {result.pages.map((page) => <PageResult key={page.kind} page={page} />)}
    {result.manual_events.length > 0 && (
      <Card title="Conferir no modo Visualizar">
        <p className={designSystemStyles.muted}>
          Estes eventos dependem de uma ação na página (clicar, adicionar ao carrinho, entrar) e não aparecem só
          abrindo a página. Confira no modo Visualizar do GTM:
        </p>
        <p>{result.manual_events.join(', ')}</p>
      </Card>
    )}
  </div>
);

const linkProblemsFrom = (detail: unknown): Partial<Record<PageKind, string>> => {
  if (typeof detail !== 'object' || detail === null || !('invalid_links' in detail)) return {};
  const links = (detail as { invalid_links: unknown }).invalid_links;
  if (!Array.isArray(links)) return {};
  return Object.fromEntries((links as IInvalidPreviewLink[]).map((link) => [link.kind, link.message]));
};

const HowToGetTheLinks = () => (
  <Card title="Último teste antes de publicar">
    <p className={designSystemStyles.muted}>
      Teste nas páginas de QA do site, com os dataLayers do padrão Go Trackin' já implementados e ainda fora de
      produção. Para cada página:
    </p>
    <ol className={designSystemStyles.list}>
      <li>No GTM, abra a workspace onde você importou o JSON desta geração e clique em Visualizar.</li>
      <li>Informe a URL da página de QA (página inicial, produto, carrinho, thank you page...) e conecte.</li>
      <li>No Tag Assistant, clique nos três pontinhos no canto superior direito e em Share.</li>
      <li>Copie o "Shareable debug link" e cole no campo da página abaixo.</li>
    </ol>
    <p className={designSystemStyles.muted}>
      Só aceitamos esse link: ele abre a página de QA com a workspace ainda não publicada. Abrimos cada página num
      navegador de verdade, como um visitante que já aceitou o banner de cookies, e cada página conta como uma leitura
      no limite de uso.
    </p>
  </Card>
);

export const ImplementationCheck = ({ ids }: IImplementationCheckProps) => {
  const [state, formAction] = useActionState(createValidateImplementationAction(ids), INITIAL_ACTION_STATE);
  const linkProblems = state.success ? {} : linkProblemsFrom(state.errorDetail);

  return (
    <div className={styles.trackinStack}>
      <HowToGetTheLinks />
      <form action={formAction} onReset={(event) => event.preventDefault()} aria-label="Validar implementação">
        <FormFieldset className={modal.fieldset}>
          {PAGE_KINDS.map(({ kind, label }) => (
            <div className={modal.field} key={kind}>
              <label className={modal.label} htmlFor={`trackin-page-${kind}`}>
                {label}{kind === 'home' ? ' *' : ''}
              </label>
              <input className={modal.input} id={`trackin-page-${kind}`} name={`${PAGE_FIELD_PREFIX}${kind}`}
                inputMode="url" placeholder={PREVIEW_LINK_EXAMPLE} required={kind === 'home'} autoComplete="off"
                aria-invalid={Boolean(linkProblems[kind])}
                aria-describedby={linkProblems[kind] ? `trackin-page-${kind}-error` : undefined} />
              {linkProblems[kind] && (
                <p className={modal.error} id={`trackin-page-${kind}-error`}>{linkProblems[kind]}</p>
              )}
            </div>
          ))}
          <SubmitButton className={modal.submit} pendingLabel="Abrindo as páginas de QA...">Validar</SubmitButton>
        </FormFieldset>
        {state.error && !state.success && <p className={modal.error} role="alert">{state.error}</p>}
      </form>
      {state.success && state.data && <Report result={state.data} />}
    </div>
  );
};
