/**
 * 卡片内示意图（进度驱动：图元素自身的视口穿越，逐步点亮序列）
 * - AnnIndexFigure：向量索引检索（三层结构 + 命中路径逐个点亮 + 规模芯片）
 * - OutStackFigure：出栈分层（rail 随进度延伸，七层自上而下依次激活）
 *
 * 进度锚定在图元素自身而非所在 section：图下方内容伸缩（深潜展开）
 * 不改变图自身的位置，动效状态因此保持稳定。
 */
import { useElementProgress, window_ } from "../hooks/useSectionProgress";

export function AnnIndexFigure() {
  const { ref, p } = useElementProgress<HTMLElement>();
  // 序列窗口：图进入视口即开始，图顶部越过视口中线前完成
  const q = window_(p, 0.1, 0.48);
  const levels: { label: string; note: string; boxes: number; hits: number[] }[] = [
    { label: "入口层", note: "查询向量先与 1,024 个簇中心比对", boxes: 11, hits: [5] },
    { label: "聚类层", note: "top-2 簇 · 簇内 ≈1,200 块", boxes: 17, hits: [4, 11] },
    { label: "候选层", note: "粗筛 ≈40 候选块 → 精确重排", boxes: 23, hits: [3, 7, 13, 18] },
  ];

  return (
    <figure className="fig ann" ref={ref}>
      <div className="fig-title">the index · 向量检索的下降路径</div>
      <div className="fig-sub">ANN 索引 · ≈1.2M 文档块 · 只触碰其中一小撮</div>
      <div className="ann-query">
        query <code>[0.012, -0.034, 0.221, …]</code>
      </div>
      <div className="ann-levels">
        {levels.map((lv, i) => {
          const levelIn = q > 0.06 + i * 0.2;
          const hitsIn = q > 0.18 + i * 0.2;
          return (
            <div className={`ann-level${levelIn ? " in" : ""}`} key={i}>
              <div className="ann-meta">
                <span className="ann-label">{lv.label}</span>
                <span className="ann-note">{lv.note}</span>
              </div>
              <div className="ann-boxes">
                {Array.from({ length: lv.boxes }, (_, j) => (
                  <span
                    key={j}
                    className={`ann-box${lv.hits.includes(j) ? " hit" : ""}${
                      lv.hits.includes(j) && hitsIn ? " lit" : ""
                    }`}
                    style={{ transitionDelay: `${(j % 6) * 30}ms` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className={`ann-land${q > 0.82 ? " in" : ""}`}>top-5 块在此落位 → 注入 prompt</div>
      <figcaption className={`fig-chips${q > 0.92 ? " in" : ""}`}>
        <span>2 / 1,024 簇命中</span>
        <span>≈40 块候选</span>
        <span>毫秒级 · 全程在内存</span>
      </figcaption>
    </figure>
  );
}

export function OutStackFigure() {
  const { ref, p } = useElementProgress<HTMLElement>();
  const q = window_(p, 0.1, 0.48);
  const layers: { name: string; what: string; scale: string }[] = [
    { name: "gpu 集群", what: "逐 token 采样，概率分布 → 下一个字", scale: "10¹¹ FLOPs / token" },
    { name: "harness", what: "组帧为 SSE 事件", scale: 'data: {"token":"北"}' },
    { name: "agent 进程", what: "TLS 库加密（用户态）", scale: "1 条 record · 数十 B" },
    { name: "内核", what: "写入 socket 缓冲区，分段发出", scale: "1× write() 系统调用" },
    { name: "网关", what: "透传事件流，不等完整回复", scale: "流式 · 零缓冲" },
    { name: "互联网", what: "长连接隧道回到客户端", scale: "数十 ms · 跨城" },
    { name: "客户端", what: "逐 token 渲染，文字逐字浮现", scale: "1× 浏览器进程" },
  ];
  const rail = Math.min(1, Math.max(0, (q - 0.05) / 0.75));

  return (
    <figure className="fig stack" ref={ref}>
      <div className="fig-title">out of the machine, top to bottom</div>
      <div className="fig-sub">一个 token 离开 GPU，穿越每一层回到你的屏幕</div>
      <div className="stack-layers">
        <span className="stack-rail" style={{ height: `${rail * 100}%` }} aria-hidden />
        {layers.map((l, i) => {
          const active = q > 0.12 + i * (0.68 / layers.length);
          return (
            <div className={`stack-layer${active ? " on" : ""}`} key={i}>
              <span className="stack-name">{l.name}</span>
              <span className="stack-what">{l.what}</span>
              <span className="stack-scale">{l.scale}</span>
            </div>
          );
        })}
      </div>
      <div className={`stack-land${q > 0.9 ? " in" : ""}`}>
        ↳ 你看到的「逐字浮现」，就是这条下降线在连续发生
      </div>
    </figure>
  );
}
