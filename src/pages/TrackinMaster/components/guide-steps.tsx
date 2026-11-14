import styles from '../trackin-master.module.css';
import type { IGuideStep } from '../../../services/datalab-api/trackingResource';

export const GuideSteps = ({ steps, label }: { steps: IGuideStep[]; label: string }) => (
  <ol className={styles.trackinSteps} aria-label={label} start={steps[0]?.number}>
    {steps.map((step) => (
      <li key={step.number}>
        <strong>{step.title}</strong>
        <p>{step.text}</p>
      </li>
    ))}
  </ol>
);
