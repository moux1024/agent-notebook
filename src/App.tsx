import { useMemo } from "react";
import { steps } from "./content/steps";
import { useStepProgress } from "./hooks/useStepProgress";
import TopBar from "./components/TopBar";
import TopologyStrip from "./components/TopologyStrip";
import Timeline from "./components/Timeline";
import Hero from "./components/Hero";
import StepSection from "./components/StepSection";
import Outro from "./components/Outro";

export default function App() {
  const { registerRef, active, fraction, scrollToStep } = useStepProgress(steps.length);

  const activeNodes = useMemo(
    () => new Set(active >= 0 ? steps[active].nodes : []),
    [active],
  );

  return (
    <>
      <TopBar active={active} />

      <main>
        <Hero />
        {steps.map((step, i) => (
          <StepSection key={step.id} step={step} index={i} registerRef={registerRef} />
        ))}
        <Outro />
      </main>

      <div className="dock" aria-hidden={false}>
        <TopologyStrip activeNodes={activeNodes} />
        <Timeline active={active} fraction={fraction} onJump={scrollToStep} />
      </div>
    </>
  );
}
