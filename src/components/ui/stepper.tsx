import React from 'react';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-8">
      <div className="relative">
        {/* Ligne de progression */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Étapes */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = onStepClick && step.id < currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ flex: 1 }}
              >
                {/* Cercle de l'étape */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white cursor-pointer hover:bg-blue-700'
                      : isCurrent
                      ? 'bg-white border-blue-600 text-blue-600 shadow-lg'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </button>

                {/* Titre et description */}
                <div className="mt-3 text-center max-w-[150px]">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent || isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

