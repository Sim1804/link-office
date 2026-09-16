import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: { label: string }[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((stepInfo, index) => {
        const n = index + 1;
        const isPast = currentStep > n;
        const isActive = currentStep === n;
        const isFuture = currentStep < n;

        return (
          <div key={n} style={{ display: "flex", alignItems: "center", flex: n < steps.length ? 1 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                  background: isPast
                    ? "var(--primary)"
                    : isActive
                      ? "var(--primary)"
                      : "var(--surface-2)",
                  color: isPast || isActive ? "white" : "var(--text-2)",
                  border: "none",
                  boxShadow: isActive ? "0 0 16px rgba(0,169,157,0.4)" : "none",
                }}
              >
                {isPast ? <Check size={18} color="white" strokeWidth={3} /> : n}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: isPast || isActive ? "var(--text-1)" : "var(--text-2)",
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {stepInfo.label}
              </span>
            </div>
            {n < steps.length && (
              <div
                style={{
                  flex: 1, height: 2,
                  background: isPast ? "rgba(52,211,153,0.3)" : "var(--surface-2)",
                  margin: "0 12px"
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
