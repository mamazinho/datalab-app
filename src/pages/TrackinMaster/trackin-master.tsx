import styles from './trackin-master.module.css';
import { useState, useTransition } from 'react';
import { toastRequestError } from '../../components/Feedback/ErrorToast';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { useTrackingRules } from '../../hooks/use-tracking-rules';
import { DatalabAPI } from '../../services/datalab-api';
import type { ISiteAnalysis } from '../../services/datalab-api/trackingResource';
import type { IBuilt } from './actions';
import { BuildForm } from './components/build-form';
import { BuildResults } from './components/build-results';
import { NextSteps } from './components/next-steps';
import { SiteDiagnosis } from './components/site-diagnosis';
import { SiteStep } from './components/site-step';
import { publicIds } from './tool-ids';

const Delivery = ({ built, onRegenerated }: { built: IBuilt; onRegenerated: (built: IBuilt) => void }) => {
  const { data: rules } = useTrackingRules();
  const [stepsOpen, setStepsOpen] = useState(true);
  const [regenerating, startRegenerating] = useTransition();

  // A refused JSON is fixed by a fresh file from the same form, not by asking everything again
  const regenerate = () =>
    startRegenerating(async () => {
      try {
        const result = await DatalabAPI.TrackingResource.build(built.request);
        onRegenerated({ request: built.request, result });
      } catch (error) {
        toastRequestError(error);
      }
    });

  return (
    <>
      <BuildResults result={built.result} onShowNextSteps={() => setStepsOpen(true)} />
      {stepsOpen && (
        <NextSteps
          result={built.result}
          publicIds={publicIds(built.request.ids, rules.ids)}
          onClose={() => setStepsOpen(false)}
          onRegenerate={regenerate}
          regenerating={regenerating}
        />
      )}
    </>
  );
};

export const TrackinMaster = () => {
  const [site, setSite] = useState<ISiteAnalysis | null>(null);
  const [built, setBuilt] = useState<IBuilt | null>(null);
  const [generation, setGeneration] = useState(0);

  const handleAnalyzed = (analysis: ISiteAnalysis) => {
    setSite(analysis);
    setBuilt(null);
  };

  // The build answers with the site it used, so the diagnosis on screen is always the one in the files
  const handleBuilt = (delivered: IBuilt) => {
    setSite(delivered.result.site);
    setBuilt(delivered);
    setGeneration((count) => count + 1);
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

      {built && (
        <QueryBoundary>
          <Delivery key={generation} built={built} onRegenerated={handleBuilt} />
        </QueryBoundary>
      )}
    </div>
  );
};
