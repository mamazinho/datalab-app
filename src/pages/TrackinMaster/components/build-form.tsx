import modal from '../../../styles/modal-form.module.css';
import styles from '../trackin-master.module.css';
import { useActionState, useState } from 'react';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';
import { Toggle } from '../../../components/UI/Inputs/Toggle';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { useTrackingRules } from '../../../hooks/use-tracking-rules';
import type { IBuildResult, ISiteAnalysis } from '../../../services/tracking-api/trackingResource';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { createBuildContainersAction } from '../actions';
import { BANNER_LABELS, ID_FIELD_PREFIX, MODE_LABELS } from '../schemas';
import { idLabel, idRulesFor } from '../tool-ids';

interface IBuildFormProps {
  site: ISiteAnalysis;
  onBuilt: (result: IBuildResult) => void;
}

// Mounted with key={site.url}: a new analysis restarts the defaults it suggested
export const BuildForm = ({ site, onBuilt }: IBuildFormProps) => {
  const { data: rules } = useTrackingRules();
  const [formState, formAction] = useActionState(createBuildContainersAction(site), INITIAL_ACTION_STATE);
  const [tools, setTools] = useState(() => rules.tools.map((t) => t.key).filter((key) => site.detected_tools.includes(key)));
  // An unreachable site says nothing about the banner, so the default stays "has one"
  const [hasCmp, setHasCmp] = useState(!site.reachable || site.cmp !== null);

  useActionFeedback(formState, {
    onSuccess: (result) => {
      if (result) onBuilt(result);
    },
    onError: () => {},
  });

  const toggleTool = (key: string, checked: boolean) =>
    setTools((current) => (checked ? [...current, key] : current.filter((tool) => tool !== key)));

  return (
    <form className={styles.trackinForm} action={formAction} aria-label="Gerar containers">
      <FormFieldset className={modal.fieldset}>
        <section className={styles.trackinSection}>
          <h2 className={styles.trackinSectionTitle}>2. Cenário</h2>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="trackin-client">Nome do cliente</label>
            <input className={modal.input} id="trackin-client" name="client_name" type="text"
              defaultValue={site.host.replace(/^www\./, '')} autoComplete="off" />
          </div>
          <fieldset className={styles.trackinChoices}>
            <legend className={modal.label}>Ferramentas</legend>
            {rules.tools.map((tool) => (
              <label key={tool.key} className={styles.trackinCheck}>
                <input type="checkbox" name="tools" value={tool.key}
                  checked={tools.includes(tool.key)}
                  onChange={(e) => toggleTool(tool.key, e.target.checked)} />
                {tool.label}
                {site.detected_tools.includes(tool.key) && <span className={styles.trackinBadge}>no site</span>}
              </label>
            ))}
          </fieldset>
          <Toggle label="O cliente tem (ou quer) server-side" name="server_side" />
        </section>

        <section className={styles.trackinSection}>
          <h2 className={styles.trackinSectionTitle}>3. Consentimento</h2>
          <div className={styles.trackinGrid}>
            <div className={modal.field}>
              <label className={modal.label} htmlFor="trackin-banner">Modelo do banner</label>
              <select className={modal.select} id="trackin-banner" name="banner" defaultValue="opt_in">
                {Object.entries(BANNER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div className={modal.field}>
              <label className={modal.label} htmlFor="trackin-mode">Modo do Consent Mode</label>
              <select className={modal.select} id="trackin-mode" name="mode" defaultValue="advanced">
                {Object.entries(MODE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          <Toggle label="O site já tem banner de cookies (CMP)" name="has_cmp" checked={hasCmp}
            onChange={(e) => setHasCmp(e.target.checked)} />
          {!hasCmp && (
            <label className={styles.trackinCheck}>
              <input type="checkbox" name="term_accepted" required />
              Declaro que fui informado de que o site não tem gestão de consentimento e assumo a responsabilidade.
            </label>
          )}
        </section>

        <section className={styles.trackinSection}>
          <h2 className={styles.trackinSectionTitle}>4. IDs</h2>
          <p className={modal.hint}>
            Deixe em branco o que ainda não tiver: o container sai com um valor de exemplo e o resultado avisa o que falta.
            IDs encontrados no site já vêm preenchidos; confirme se são da conta certa.
          </p>
          <div className={styles.trackinGrid}>
            {idRulesFor(rules.ids, tools).map((rule) => {
              const suggested = site.suggested_ids[rule.key];
              return (
                <div key={rule.key} className={modal.field}>
                  <label className={modal.label} htmlFor={`trackin-id-${rule.key}`}>
                    {idLabel(rule)}
                    {suggested && <span className={styles.trackinBadge}>encontrado no site</span>}
                  </label>
                  <input className={modal.input}
                    id={`trackin-id-${rule.key}`}
                    name={`${ID_FIELD_PREFIX}${rule.key}`}
                    type={rule.secret ? 'password' : 'text'}
                    autoComplete={rule.secret ? 'new-password' : 'off'}
                    placeholder={rule.example}
                    defaultValue={suggested ?? ''}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.trackinSection}>
          <h2 className={styles.trackinSectionTitle}>5. GTM atual do cliente</h2>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="trackin-export">Export do contêiner web (.json)</label>
            <input id="trackin-export" name="client_export" type="file" accept=".json,application/json"
              aria-describedby="trackin-export-hint" />
            <p className={modal.hint} id="trackin-export-hint">
              {site.gtm_containers.length > 0
                ? `O site já usa ${site.gtm_containers.join(', ')}: anexe o export para mesclar em vez de criar um container do zero.`
                : 'Opcional: anexe se o cliente já tiver um GTM, para gerar a mescla e o relatório do que pausar ou revisar.'}
            </p>
          </div>
        </section>

        {formState.error && !formState.success && <p className={modal.error} role="alert">{formState.error}</p>}

        <SubmitButton className={modal.submit} pendingLabel="Gerando...">Gerar containers</SubmitButton>
      </FormFieldset>
    </form>
  );
};
