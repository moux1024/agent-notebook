import type { Step } from "../content/steps";
import DeepDive from "./DeepDive";
import Reveal from "./Reveal";

export default function StepSection({
  step,
  index,
  registerRef,
}: {
  step: Step;
  index: number;
  registerRef: (i: number) => (el: HTMLElement | null) => void;
}) {
  return (
    <section className="step-section" id={step.id} ref={registerRef(index)}>
      <Reveal>
        <article className="step-card">
          <header className="step-head">
            <span className="step-no">{String(index + 1).padStart(2, "0")}</span>
            <h2 className="step-title">
              <span className="step-id">{step.id}</span>
              <span className="step-name">{step.name}</span>
            </h2>
          </header>

          <p className="step-body">{step.body}</p>

          <div className="badge-chip">
            <span className="badge-main">{step.badge}</span>
            <span className="badge-detail">{step.badgeDetail}</span>
          </div>

          {step.loopsTo && (
            <div className="loop-chip" title="流程不是固定管线，可循环可扩展">
              <span className="loop-icon">↺</span> 跳回 {step.loopsTo} · 循环 ×N —— 这不是固定管线
            </div>
          )}

          {step.dives.map((d) => (
            <DeepDive key={d.id} dive={d} />
          ))}
        </article>
      </Reveal>
    </section>
  );
}
