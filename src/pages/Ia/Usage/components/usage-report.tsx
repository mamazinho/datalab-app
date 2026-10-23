import { ActionTable, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { ChatMember } from '../../../../components/UI/ChatMember';
import { useChatUsageReport } from '../../../../hooks/use-chat-usage-report';
import type { ChatUsageOrigin, IChatUsage, IChatUsageByChat } from '../../../../services/datalab-api/chatsResource';
import { Badge } from '../../../../styles/design-system.style';
import { formatNumber } from '../../../../utils/format';
import { EmptyMessage } from '../../ia.style';
import {
  UsageChatLink,
  UsageChatTitle,
  UsageSectionTitle,
  UsageTotal,
  UsageTotalLabel,
  UsageTotals,
  UsageTotalValue,
} from '../usage.style';

const ORIGIN_LABELS: Record<ChatUsageOrigin, string> = {
  supervisor: 'Supervisor',
  specialist: 'Especialistas',
  complexity_classifier: 'Classificador de complexidade',
  answer_rewriter: 'Reescrita da resposta',
};

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
  return <UsageChatLink to={`/ia/conversas/${chat.chat_id}/mensagens`}>{chat.title}</UsageChatLink>;
};

export const UsageReport = ({ start, end }: { start: string; end: string }) => {
  const { data: report } = useChatUsageReport(start, end);

  return (
    <>
      <UsageTotals>
        <UsageTotal>
          <UsageTotalLabel>Tokens (entrada + saída)</UsageTotalLabel>
          <UsageTotalValue>{formatNumber(sumTokens(report.totals))}</UsageTotalValue>
        </UsageTotal>
        <UsageTotal>
          <UsageTotalLabel>Chamadas de modelo</UsageTotalLabel>
          <UsageTotalValue>{formatNumber(report.totals.requests)}</UsageTotalValue>
        </UsageTotal>
      </UsageTotals>

      {report.totals.requests === 0 ? (
        <EmptyMessage>Nenhum consumo registrado neste mês.</EmptyMessage>
      ) : (
        <>
          <section>
            <UsageSectionTitle>Por pessoa</UsageSectionTitle>
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
            <UsageSectionTitle>Por conversa</UsageSectionTitle>
            <ActionTable>
              <TableHeaders>
                <th>Conversa</th>
                <th>Criada por</th>
                <UsageHeaders />
              </TableHeaders>
              {report.by_chat.map((chat) => (
                <TableRow key={chat.chat_id}>
                  <td>
                    <UsageChatTitle>
                      {renderChatTitle(chat)}
                      {chat.archived && <Badge>Arquivada</Badge>}
                      {chat.deleted && <Badge>Excluída</Badge>}
                    </UsageChatTitle>
                  </td>
                  <td>{chat.created_by ? <ChatMember member={chat.created_by} /> : '—'}</td>
                  <UsageCells usage={chat} />
                </TableRow>
              ))}
            </ActionTable>
          </section>

          <section>
            <UsageSectionTitle>Por origem</UsageSectionTitle>
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
            <UsageSectionTitle>Por modelo</UsageSectionTitle>
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
