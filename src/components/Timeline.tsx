import { steps } from "../content/steps";

/**
 * 底部固定时间线：站点刻度 + 进度光点 + TOOLS→MODEL 回路弧 + 可扩展提示「…」
 */
export default function Timeline({
  active,
  fraction,
  onJump,
}: {
  active: number;
  fraction: number;
  onJump: (i: number) => void;
}) {
  const loopFrom = steps.findIndex((s) => s.id === "TOOLS");
  const loopTo = steps.findIndex((s) => s.id === "MODEL");
  const pos = (i: number) => ((i + 0.5) / steps.length) * 100;

  return (
    <div className="timeline" role="navigation" aria-label="流程时间线">
      <div className="tl-track" aria-hidden />
      <div className="tl-progress" style={{ width: `${fraction * 100}%` }} aria-hidden />

      {loopFrom >= 0 && loopTo >= 0 && (
        <div
          className="tl-loop"
          aria-hidden
          style={{
            left: `${pos(Math.min(loopFrom, loopTo))}%`,
            width: `${Math.abs(pos(loopFrom) - pos(loopTo))}%`,
          }}
        >
          <span className="tl-loop-label">↺ ×N</span>
        </div>
      )}

      {steps.map((s, i) => (
        <button
          key={s.id}
          className={`tl-stop${i === active ? " active" : ""}`}
          style={{ left: `${pos(i)}%` }}
          onClick={() => onJump(i)}
          title={`${s.id} · ${s.name}`}
        >
          <span className="tl-tick" aria-hidden />
          <span className="tl-name">{s.id}</span>
        </button>
      ))}

      <span className="tl-dot" style={{ left: `${fraction * 100}%` }} aria-hidden />
    </div>
  );
}
