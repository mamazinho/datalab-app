import type { ReactNode } from "react";
import React from "react";

interface IStepsControllerProps {
  currentStep: number;
  children: ReactNode;
}

export const StepsController = ({ currentStep, children }: IStepsControllerProps) => {
  const steps = React.Children.toArray(children);
  const currentChild = steps[currentStep - 1];
  
  if (!currentChild) return null;
  
  return <>{currentChild}</>;
};