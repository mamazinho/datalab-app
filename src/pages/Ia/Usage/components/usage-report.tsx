import usageStyles from '../usage.module.css';
import styles from '../../ia.module.css';
import designSystemStyles from '../../../../styles/design-system.module.css';
import { Link } from 'react-router-dom';
import { ActionTable, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { ChatMember } from '../../../../components/UI/ChatMember';
import { useChatUsageReport } from '../../../../hooks/use-chat-usage-report';
import type { ChatUsageOrigin, IChatUsage, IChatUsageByChat } from '../../../../services/datalab-api/chatsResource';

const ORIGIN_LABELS: Record<ChatUsageOrigin, string> = {
  supervisor: 'Supervisor',
  specialist: 'Especialistas',
  complexity_classifier: 'Classificador de complexidade',
  answer_rewriter: 'Reescrita da resposta',
};

const formatNumber = new Intl.NumberFormat('pt-BR').format;

const sumTokens = (usage: IChatUsage) => usage.input_tokens + usage.output_tokens;

const UsageHeaders = () => (
  <>
    <th>Chamadas</th>
    <th>Tokens</th>
  </>
);

const UsageCells = ({ usage }: { usage: IChatUsage }) => (
  <>
    <td>{formatNumber(usage.requests)}</td>
    <td>{formatNumber(sumTokens(usage))}</td>
    <td aria-hidden="true" />
  </>
);

const renderChatTitle = (chat: IChatUsageByChat) => {
  if (chat.title === null) return 'Conversa privada';
  if (chat.deleted) return chat.title;
  return <Link className={usageStyles.usageChatLink} to={`/ia/conversas/${chat.chat_id}/mensagens`}>{chat.title}</Link>;
};

export const UsageReport = ({ start, end }: { start: string; end: string }) => {
  const { data: report } = useChatUsageReport(start, end);

  return (
    <>
      <dl className={usageStyles.usageTotals}>
        <div className={usageStyles.usageTotal}>
          <dt className={usageStyles.usageTotalLabel}>Tokens (entrada + saída)</dt>
          <dd className={usageStyles.usageTotalValue}>{formatNumber(sumTokens(report.totals))}</dd>
        </div>
        <div className={usageStyles.usageTotal}>
          <dt className={usageStyles.usageTotalLabel}>Chamadas de modelo</dt>
          <dd className={usageStyles.usageTotalValue}>{formatNumber(report.totals.requests)}</dd>
        </div>
      </dl>

      {report.totals.requests === 0 ? (
        <p className={styles.emptyMessage}>Nenhum consumo registrado neste mês.</p>
      ) : (
        <>
          <section>
            <h2 className={usageStyles.usageSectionTitle}>Por pessoa</h2>
            <ActionTable>
              <TableHeaders>
                <th>Pessoa</th>
                <UsageHeaders />
              </TableHeaders>
              {report.by_member.map((member) => (
                <TableRow key={member.membership_id ?? 'datalab-admin'}>
                  <td>{member.name ? <ChatMember member={{ name: member.name, avatar_url: member.avatar_url }} /> : '—'}</td>
                  <UsageCells usage={member} />
                </TableRow>
              ))}
            </ActionTable>
          </section>

          <section>
            <h2 className={usageStyles.usageSectionTitle}>Por conversa</h2>
            <ActionTable>
              <TableHeaders>
                <th>Conversa</th>
                <th>Criada por</th>
                <UsageHeaders />
              </TableHeaders>
              {report.by_chat.map((chat) => (
                <TableRow key={chat.chat_id}>
                  <td>
                    <span className={usageStyles.usageChatTitle}>
                      {renderChatTitle(chat)}
                      {chat.archived && <span className={designSystemStyles.badge}>Arquivada</span>}
                      {chat.deleted && <span className={designSystemStyles.badge}>Excluída</span>}
                    </span>
                  </td>
                  <td>{chat.created_by ? <ChatMember member={chat.created_by} /> : '—'}</td>
                  <UsageCells usage={chat} />
                </TableRow>
              ))}
            </ActionTable>
          </section>

          <section>
            <h2 className={usageStyles.usageSectionTitle}>Por origem</h2>
            <ActionTable>
              <TableHeaders>
                <th>Origem</th>
                <UsageHeaders />
              </TableHeaders>
              {report.by_origin.map((origin) => (
                <TableRow key={origin.origin}>
                  <td>{ORIGIN_LABELS[origin.origin]}</td>
                  <UsageCells usage={origin} />
                </TableRow>
              ))}
            </ActionTable>
          </section>

          <section>
            <h2 className={usageStyles.usageSectionTitle}>Por modelo</h2>
            <ActionTable>
              <TableHeaders>
                <th>Modelo</th>
                <th>Provedor</th>
                <UsageHeaders />
              </TableHeaders>
              {report.by_model.map((model) => (
                <TableRow key={`${model.provider}-${model.model}`}>
                  <td>{model.model ?? '—'}</td>
                  <td>{model.provider ?? '—'}</td>
                  <UsageCells usage={model} />
                </TableRow>
              ))}
            </ActionTable>
          </section>
        </>
      )}
    </>
  );
};
