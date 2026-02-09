import { type ReactNode, forwardRef, useImperativeHandle, useState } from "react";
import React from "react";

interface IStepsControllerProps {
  initialStep?: number;
  children: ReactNode;
}

export interface StepsRef {
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  currentStep: number;
}

export const StepsController = forwardRef<StepsRef, IStepsControllerProps>(({ children, initialStep = 1 }, ref) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  useImperativeHandle(ref, () => ({
    next: () => setCurrentStep((prev) => prev + 1),
    prev: () => setCurrentStep((prev) => prev - 1),
    goTo: (step) => setCurrentStep(step),
    currentStep
  }));

  const steps = React.Children.toArray(children);
  const currentChild = steps[currentStep - 1];
  
  if (!currentChild) return null;
  
  return <>{currentChild}</>;
});