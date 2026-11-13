import styles from '../trackin-master.module.css';
import { useQuery } from '@tanstack/react-query';
import { useCompanyContext } from '../../../contexts/company';
import { trackingUpdatesQuery } from '../../../queries';
import type { UUID7 } from '../../../types/ids';

const Notices = ({ companyId }: { companyId: UUID7 }) => {
  const { data: notices = [] } = useQuery(trackingUpdatesQuery(companyId));
  if (!notices.length) return null;

  return (
    <section className={styles.trackinHighlights} aria-label="Containers que precisam de atualização">
      {notices.map((notice) => (
        <div key={notice.site_host} className={styles.trackinAlert} role="status">
          <strong>
            O container de {notice.site_host} precisa de atualização: foi gerado no padrão v{notice.generated_version} e
            a versão atual é a v{notice.latest_version}.
          </strong>
          {notice.summaries.map((summary) => <p key={summary}>{summary}</p>)}
          <p>Gere o container de novo abaixo e importe com Mesclar &gt; Substituir itens conflitantes.</p>
        </div>
      ))}
    </section>
  );
};

export const UpdateNotices = () => {
  const { currentCompany } = useCompanyContext();
  return currentCompany ? <Notices companyId={currentCompany.id} /> : null;
};
