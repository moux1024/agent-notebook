import { steps } from "../content/steps";

export default function TopBar({ active }: { active: number }) {
  const step = active >= 0 ? steps[active] : null;
  return (
    <header className="topbar">
      <span className="topbar-brand">AGENT&nbsp;NOTEBOOK</span>
      <span className="topbar-phase">
        {step ? (
          <>
            <span className="phase-no">{String(active + 1).padStart(2, "0")}</span>
            <span className="phase-id">{step.id}</span>
            <span className="phase-name">{step.name}</span>
            <span className="phase-badge" title={step.badgeDetail}>
              {step.badge}
            </span>
          </>
        ) : (
          <span className="phase-hint">SCROLL ↓</span>
        )}
      </span>
    </header>
  );
}
