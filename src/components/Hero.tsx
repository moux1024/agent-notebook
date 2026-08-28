import { siteMeta } from "../content/steps";

export default function Hero() {
  return (
    <section className="hero">
      <p className="hero-kicker">AN INTERACTIVE VISUALIZATION</p>
      <h1 className="hero-title">{siteMeta.title}</h1>
      <p className="hero-sub">{siteMeta.subtitle}</p>
      <p className="hero-desc">
        从你按下回车，到 Agent 开口回答——
        <br />
        一条用户消息穿越接入、记忆、上下文、推理、工具循环的完整旅程。
        <br />
        底部算力地图会告诉你：此刻计算发生在哪，动用了多大家伙。
      </p>
      <p className="hero-note">↺ 这不是固定的九步管线——工具循环可反复进入，站点可扩展</p>
      <div className="hero-scroll" aria-hidden>
        <span className="hero-scroll-line" />
        SCROLL
      </div>
    </section>
  );
}
