import { outro } from "../content/steps";
import { useSectionProgress } from "../hooks/useSectionProgress";

function OutroBlocks() {
  return (
    <>
      {outro.map((b, i) => {
        if (b.kind === "p") return <p key={i}>{b.text}</p>;
        if (b.kind === "list")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        return null;
      })}
    </>
  );
}

export default function Outro() {
  const { ref, p } = useSectionProgress<HTMLElement>();
  const k = Math.min(1, Math.max(0, p / 0.35));
  const style = {
    opacity: k,
    transform: `translate3d(0, ${48 * (1 - k)}px, 0)`,
  };

  return (
    <footer className="outro" ref={ref}>
      <div className="outro-anim" style={style}>
        <div className="outro-card">
          <h2 className="outro-title">旅程结束 · 一次请求的本质</h2>
          <OutroBlocks />
          <p className="outro-loop-note">
            而这一切的下一步，永远是下一次 INPUT —— 记忆的闭环让对话得以延续。
          </p>
        </div>
        <div className="site-credit">
          <a href="https://github.com/moux1024/agent-notebook" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
