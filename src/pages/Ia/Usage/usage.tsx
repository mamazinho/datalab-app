import iaStyles from '../ia.module.css';
import styles from './usage.module.css';
import { useState } from 'react';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { useCompanyContext } from '../../../contexts/company';
import { UsageReport } from './components/usage-report';

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
    <div className={iaStyles.pageContainer}>
      <div className={iaStyles.pageHeader}>
        <div>
          <h1 className={iaStyles.pageTitle}>Consumo</h1>
          <p className={iaStyles.pageSubtitle}>
            {currentCompany?.name} · Tokens e chamadas de modelo das conversas com a IA.
          </p>
        </div>
        <label className={styles.usageMonthField}>
          Mês
          <input className={styles.usageMonthInput}
            type="month"
            defaultValue={month}
            onChange={(event) => {
              if (event.target.value) setMonth(event.target.value);
            }}
          />
        </label>
      </div>

      <QueryBoundary>
        <UsageReport start={start} end={end} />
      </QueryBoundary>
    </div>
  );
};
