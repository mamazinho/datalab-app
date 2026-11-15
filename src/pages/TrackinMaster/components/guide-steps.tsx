import styles from '../trackin-master.module.css';
import { guidePrintUrl, type IGuideStep } from '../../../services/datalab-api/trackingResource';

export const GuideSteps = ({ steps, label }: { steps: IGuideStep[]; label: string }) => (
  <ol className={styles.trackinSteps} aria-label={label} start={steps[0]?.number}>
    {steps.map((step) => (
      <li key={step.number}>
        <strong>{step.title}</strong>
        <p>{step.text}</p>
        {step.print && (
          <figure className={styles.trackinPrint}>
            <img src={guidePrintUrl(step.print)} alt={step.caption ?? step.title} loading="lazy" />
            {step.caption && <figcaption>{step.caption}</figcaption>}
          </figure>
        )}
      </li>
    ))}
  </ol>
);
