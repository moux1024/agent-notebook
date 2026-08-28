import type { Step } from "../content/steps";
import DeepDive from "./DeepDive";
import { AnnIndexFigure, OutStackFigure } from "./Figures";
import { useElementProgress } from "../hooks/useSectionProgress";

/**
 * 进度 → 卡片进场/停留/退场的连续变换。
 * 进度锚定在卡片自身的视口穿越：进场在卡片进入视口后 25% 行程内完成，
 * 退场从 75% 行程开始——配合压缩后的间距，相邻卡片在视口内重叠，
 * 形成 module 间真正的交叉溶解。
 */
function cardTransform(p: number): { opacity: number; transform: string } {
  if (p < 0.25) {
    const k = p / 0.25;
    return { opacity: k, transform: `translate3d(0, ${64 * (1 - k)}px, 0)` };
  }
  if (p > 0.75) {
    const k = (p - 0.75) / 0.25;
    return { opacity: 1 - k, transform: `translate3d(0, ${-48 * k}px, 0)` };
  }
  return { opacity: 1, transform: "translate3d(0, 0, 0)" };
}

export default function StepSection({
  step,
  index,
  registerRef,
}: {
  step: Step;
  index: number;
  registerRef: (i: number) => (el: HTMLElement | null) => void;
}) {
  const { ref, p } = useElementProgress<HTMLDivElement>();
  const style = cardTransform(p);

  return (
    <section className="step-section" id={step.id} ref={registerRef(index)}>
      <div className="step-anim" style={style} ref={ref}>
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
      </div>
    </section>
  );
}
