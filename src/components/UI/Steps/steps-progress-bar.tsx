import React from "react";
import { ProgressBarWrapper, ProgressConnector, ProgressStep, ProgressStepButton } from "./steps.style";

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
    <ProgressBarWrapper>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isClickable = isStepClickable(stepNumber);

        return (
          <ProgressStep key={index}>
            <ProgressStepButton
              type="button"
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              $isActive={isActive}
              $isClickable={isClickable}
            >
              {stepNumber}
            </ProgressStepButton>
            {/* Line connector */}
            {index < totalSteps - 1 && (
              <ProgressConnector $isActive={stepNumber < currentStep} />
            )}
          </ProgressStep>
        );
      })}
    </ProgressBarWrapper>
  );
};
