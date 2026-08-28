import type { Step } from "../content/steps";
import DeepDive from "./DeepDive";
import Reveal from "./Reveal";
import { AnnIndexFigure, OutStackFigure } from "./Figures";

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

          {step.params && (
            <div className="table-wrap param-table">
              <table>
                <thead>
                  <tr>
                    {step.params.headers.map((h, j) => (
                      <th key={j}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {step.params.rows.map((row, j) => (
                    <tr key={j}>
                      {row.map((cell, k) => (
                        <td key={k}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step.figure === "ann-index" && <AnnIndexFigure />}
          {step.figure === "out-stack" && <OutStackFigure />}

          {step.loopsTo && (
            <div className="loop-chip">
              <span className="loop-icon">↺</span> 结果回填 → 再次调用 {step.loopsTo} · 循环 ×N
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
