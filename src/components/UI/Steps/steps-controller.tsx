import { type ReactNode, type ReactElement, forwardRef, useImperativeHandle, useState } from "react";
import React from "react";
import type { IStepProps } from "./step";
import { StepsProgressBar } from "./steps-progress-bar";
import { StepNavButton, StepNavIcon, StepsContainer, StepsContentWrapper, StepsNavigation } from "./steps.style";

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
  
  // Navigation Logic for Progress Bar
  const isStepClickable = (stepNumber: number) => {
      // Can go back to previous steps if current step allows going back
      if (stepNumber < currentStep && canGoBack) return true;
      // Can go to immediate next step if current step allows going forward
      if (stepNumber === currentStep + 1 && canGoForward) return true;
      return false;
  };

  return (
    <StepsContainer>
      {/* Progress Bar / Stepper */}
      {showProgress && (
        <StepsProgressBar
          totalSteps={totalSteps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          isStepClickable={isStepClickable}
        />
      )}

      {/* Navigation & Content Wrapper */}
      <StepsContentWrapper>
        <StepsNavigation>
             {/* Back Button */}
            {canGoBack && currentStep > 1 ? (
                <StepNavButton 
                  onClick={prev}
                  type="button"
                >
                    <StepNavIcon $direction="left" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </StepNavIcon>
                    Voltar
                </StepNavButton>
            ) : <span />}

            {/* Forward Button (if explicitly enabled) */}
            {canGoForward && currentStep < totalSteps && (
                <StepNavButton 
                  onClick={next}
                  type="button"
                >
                    Avançar
                    <StepNavIcon $direction="right" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </StepNavIcon>
                </StepNavButton>
            )}
        </StepsNavigation>
        
        {/* Step Content */}
        {currentChild}
      </StepsContentWrapper>
    </StepsContainer>
  );
});