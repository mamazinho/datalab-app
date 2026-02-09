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
  
  // Navigation Logic for Progress Bar
  const isStepClickable = (stepNumber: number) => {
      // Can go back to previous steps if current step allows going back
      if (stepNumber < currentStep && canGoBack) return true;
      // Can go to immediate next step if current step allows going forward
      if (stepNumber === currentStep + 1 && canGoForward) return true;
      return false;
  };

  return (
    <div className="flex flex-col gap-6">
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
      <div className="relative">
        <div className="flex justify-between items-center mb-4 min-h-6">
             {/* Back Button */}
            {canGoBack && currentStep > 1 ? (
                <button 
                  onClick={prev}
                  type="button"
                  className="flex items-center text-gray-500 hover:text-orange-600 transition-colors font-medium text-sm group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Voltar
                </button>
            ) : <div />}

            {/* Forward Button (if explicitly enabled) */}
            {canGoForward && currentStep < totalSteps && (
                <button 
                  onClick={next}
                  type="button"
                  className="flex items-center text-gray-500 hover:text-orange-600 transition-colors font-medium text-sm group"
                >
                    Avançar
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            )}
        </div>
        
        {/* Step Content */}
        {currentChild}
      </div>
    </div>
  );
});