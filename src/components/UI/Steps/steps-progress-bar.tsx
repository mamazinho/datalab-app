import styles from './steps.module.css';
import React from "react";

interface IStepsProgressBarProps {
  totalSteps: number;
  currentStep: number;
  onStepClick: (step: number) => void;
  isStepClickable: (step: number) => boolean;
}

export const StepsProgressBar: React.FC<IStepsProgressBarProps> = ({
  totalSteps,
  currentStep,
  onStepClick,
  isStepClickable,
}) => {
  return (
    <div className={styles.progressBarWrapper}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isClickable = isStepClickable(stepNumber);

        return (
          <div className={styles.progressStep} key={index}>
            <button className={styles.progressStepButton}
              type="button"
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              data-active={isActive}
            >
              {stepNumber}
            </button>
                        {index < totalSteps - 1 && (
              <div className={styles.progressConnector} data-active={stepNumber < currentStep} />
            )}
          </div>
        );
      })}
    </div>
  );
};
