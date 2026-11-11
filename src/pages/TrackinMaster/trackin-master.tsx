import styles from './trackin-master.module.css';
import { useState } from 'react';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import type { IBuildResult, ISiteAnalysis } from '../../services/tracking-api/trackingResource';
import { BuildForm } from './components/build-form';
import { BuildResults } from './components/build-results';
import { SiteDiagnosis } from './components/site-diagnosis';
import { SiteStep } from './components/site-step';

export const TrackinMaster = () => {
  const [site, setSite] = useState<ISiteAnalysis | null>(null);
  const [result, setResult] = useState<IBuildResult | null>(null);

  const handleAnalyzed = (analysis: ISiteAnalysis) => {
    setSite(analysis);
    setResult(null);
  };

  // The build answers with the site it used, so the diagnosis on screen is always the one in the files
  const handleBuilt = (built: IBuildResult) => {
    setSite(built.site);
    setResult(built);
  };

  return (
    <div className={styles.trackinPageContainer}>
      <div>
        <h1 className={styles.trackinPageTitle}>Trackin' Master</h1>
        <p className={styles.trackinPageSubtitle}>
          Tagueamento plug-and-play: informe o site, revise o que encontramos e baixe os containers do GTM com a
          documentação.
        </p>
      </div>

      <SiteStep onAnalyzed={handleAnalyzed} />

      {site && (
        <>
          <SiteDiagnosis site={site} />
          <QueryBoundary>
            <BuildForm key={site.url} site={site} onBuilt={handleBuilt} />
          </QueryBoundary>
        </>
      )}

      {result && <BuildResults result={result} />}
    </div>
  );
};
