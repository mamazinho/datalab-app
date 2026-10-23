import { useState } from 'react';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { useCompanyContext } from '../../../contexts/company';
import { UsageReport } from './components/usage-report';
import { UsageMonthField, UsageMonthInput } from './usage.style';
import { PageContainer, PageHeader, PageSubtitle, PageTitle } from '../ia.style';

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthPeriod = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDayOfMonth = new Date(year, monthNumber, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${lastDayOfMonth}` };
};

export const Usage = () => {
  const { currentCompany } = useCompanyContext();
  const [month, setMonth] = useState(getCurrentMonth);
  const { start, end } = getMonthPeriod(month);

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Consumo</PageTitle>
          <PageSubtitle>
            {currentCompany?.name} · Tokens e chamadas de modelo das conversas com a IA.
          </PageSubtitle>
        </div>
        <UsageMonthField>
          Mês
          <UsageMonthInput
            type="month"
            defaultValue={month}
            onChange={(event) => {
              if (event.target.value) setMonth(event.target.value);
            }}
          />
        </UsageMonthField>
      </PageHeader>

      <QueryBoundary>
        <UsageReport start={start} end={end} />
      </QueryBoundary>
    </PageContainer>
  );
};
