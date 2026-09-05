import { Check } from 'lucide-react';

/**
 * Mobile-optimized step progress bar.
 */
export default function StepProgress({ steps = [], currentStepIndex = 0 }) {
  return (
    <div className="w-full pb-2">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id || index} className="flex flex-1 items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    isCompleted
                      ? 'bg-ledger text-white shadow-sm'
                      : isCurrent
                      ? 'border-2 border-route bg-white text-route shadow-sm ring-2 ring-route/20'
                      : 'border border-stone-300 bg-stone-100 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check size={12} strokeWidth={3} /> : index + 1}
                </div>
                <span
                  className={`mt-1 text-[10px] font-medium tracking-tight ${
                    isCurrent
                      ? 'font-semibold text-route'
                      : isCompleted
                      ? 'text-ink'
                      : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={`mx-1.5 h-[2px] flex-1 transition-all ${
                    index < currentStepIndex ? 'bg-ledger' : 'bg-stone-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
