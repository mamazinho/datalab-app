import styles from './steps.module.css';
import { type ReactNode, type ReactElement, forwardRef, useImperativeHandle, useState } from "react";
import React from "react";
import type { IStepProps } from "./step";
import { StepsProgressBar } from "./steps-progress-bar";

interface IStepsControllerProps {
  initialStep?: number;
  children: ReactNode;
  showProgress?: boolean;
}

export interface StepsRef {
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  currentStep: number;
}

export const StepsController = forwardRef<StepsRef, IStepsControllerProps>(({ children, initialStep = 1, showProgress = true }, ref) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = React.Children.toArray(children) as ReactElement<IStepProps>[];
  const totalSteps = steps.length;
  const next = () => {
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };
  const prev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  useImperativeHandle(ref, () => ({
    next,
    prev,
    goTo: (step) => {
      if (step >= 1 && step <= totalSteps) setCurrentStep(step);
    },
    currentStep
  }));

  const currentChild = steps[currentStep - 1];
  if (!currentChild) return null;

  const { canGoBack = false, canGoForward = false } = currentChild.props;
  const isStepClickable = (stepNumber: number) => {
      if (stepNumber < currentStep && canGoBack) return true;
      if (stepNumber === currentStep + 1 && canGoForward) return true;
      return false;
  };

  return (
    <div className={styles.stepsContainer}>
      {showProgress && (
        <StepsProgressBar
          totalSteps={totalSteps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          isStepClickable={isStepClickable}
        />
      )}

      <div className={styles.stepsContentWrapper}>
        <div className={styles.stepsNavigation}>
            {canGoBack && currentStep > 1 ? (
                <button className={styles.stepNavButton} 
                  onClick={prev}
                  type="button"
                >
                    <svg className={styles.stepNavIcon} data-direction="left" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Voltar
                </button>
            ) : <span />}

            {canGoForward && currentStep < totalSteps && (
                <button className={styles.stepNavButton} 
                  onClick={next}
                  type="button"
                >
                    Avançar
                    <svg className={styles.stepNavIcon} data-direction="right" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            )}
        </div>
        {currentChild}
      </div>
    </div>
  );
});