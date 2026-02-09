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
    <div className="flex items-center justify-between px-2 mb-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;
        const isClickable = isStepClickable(stepNumber);

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            <button
              type="button"
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/50
                            ${
                              isActive
                                ? "bg-orange-600 border-orange-600 text-white"
                                : "bg-white border-gray-300 text-gray-400"
                            }
                            ${
                              isClickable
                                ? isActive
                                  ? "cursor-pointer hover:bg-orange-700 hover:border-orange-700"
                                  : "cursor-pointer hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50"
                                : "cursor-default"
                            }
                        `}
            >
              {stepNumber}
            </button>
            {/* Line connector */}
            {index < totalSteps - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 z-0 transition-all duration-300 ${
                  stepNumber < currentStep ? "bg-orange-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
