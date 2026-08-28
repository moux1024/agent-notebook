import { outro } from "../content/steps";
import Reveal from "./Reveal";

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
  return (
    <footer className="outro">
      <Reveal>
        <div className="outro-card">
          <h2 className="outro-title">旅程结束 · 一次请求的本质</h2>
          <OutroBlocks />
          <p className="outro-loop-note">
            而这一切的下一步，永远是下一次 INPUT —— 记忆的闭环让对话得以延续。
          </p>
        </div>
      </Reveal>
      <div className="site-credit">
        <a href="https://github.com/moux1024/agent-notebook" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  );
}
