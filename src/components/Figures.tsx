/**
 * 卡片内示意图
 * - AnnIndexFigure：向量索引检索（层级结构 + 高亮命中路径 + 逐层规模芯片）
 * - OutStackFigure：出栈分层（token 从 GPU 回到屏幕的竖直分层穿越，每层标注发生的事与规模）
 */

const hit = "hit";

export function AnnIndexFigure() {
  // 三层结构：入口层 / 聚类层 / 候选层；hit 下标模拟 ANN 的下降命中路径
  const levels: { label: string; note: string; boxes: number; hits: number[] }[] = [
    { label: "入口层", note: "查询向量先与 1,024 个簇中心比对", boxes: 11, hits: [5] },
    { label: "聚类层", note: "top-2 簇 · 簇内 ≈1,200 块", boxes: 17, hits: [4, 11] },
    { label: "候选层", note: "粗筛 ≈40 候选块 → 精确重排", boxes: 23, hits: [3, 7, 13, 18] },
  ];

  return (
    <figure className="fig ann">
      <div className="fig-title">the index · 向量检索的下降路径</div>
      <div className="fig-sub">ANN 索引 · ≈1.2M 文档块 · 只触碰其中一小撮</div>
      <div className="ann-query">
        query <code>[0.012, -0.034, 0.221, …]</code>
      </div>
      <div className="ann-levels">
        {levels.map((lv, i) => (
          <div className="ann-level" key={i}>
            <div className="ann-meta">
              <span className="ann-label">{lv.label}</span>
              <span className="ann-note">{lv.note}</span>
            </div>
            <div className="ann-boxes">
              {Array.from({ length: lv.boxes }, (_, j) => (
                <span key={j} className={`ann-box${lv.hits.includes(j) ? ` ${hit}` : ""}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="ann-land">top-5 块在此落位 → 注入 prompt</div>
      <figcaption className="fig-chips">
        <span>2 / 1,024 簇命中</span>
        <span>≈40 块候选</span>
        <span>毫秒级 · 全程在内存</span>
      </figcaption>
    </figure>
  );
}

export function OutStackFigure() {
  const layers: { name: string; what: string; scale: string }[] = [
    { name: "gpu 集群", what: "逐 token 采样，概率分布 → 下一个字", scale: "10¹¹ FLOPs / token" },
    { name: "harness", what: "组帧为 SSE 事件", scale: 'data: {"token":"北"}' },
    { name: "agent 进程", what: "写入 socket 缓冲区", scale: "1× write() 系统调用" },
    { name: "内核", what: "TLS 加密后发出", scale: "1 条 record · 数十 B" },
    { name: "网关", what: "透传事件流，不等完整回复", scale: "流式 · 零缓冲" },
    { name: "互联网", what: "长连接隧道回到客户端", scale: "数十 ms · 跨城" },
    { name: "客户端", what: "逐 token 渲染，文字逐字浮现", scale: "1× 浏览器进程" },
  ];

  return (
    <figure className="fig stack">
      <div className="fig-title">out of the machine, top to bottom</div>
      <div className="fig-sub">一个 token 离开 GPU，穿越每一层回到你的屏幕</div>
      <div className="stack-layers">
        {layers.map((l, i) => (
          <div className="stack-layer" key={i}>
            <span className="stack-name">{l.name}</span>
            <span className="stack-what">{l.what}</span>
            <span className="stack-scale">{l.scale}</span>
          </div>
        ))}
      </div>
      <div className="stack-land">↳ 你看到的「逐字浮现」，就是这条下降线在连续发生</div>
    </figure>
  );
}
