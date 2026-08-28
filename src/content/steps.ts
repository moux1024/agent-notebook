/**
 * Agent Notebook 内容数据
 *
 * 站点 = 一条用户消息在 Agent 系统中的生命周期；深潜（dive）承载概念详解。
 * 内容为数据驱动：增删站点改 steps 数组即可，时间线/拓扑带自动跟随。
 */

export type TopologyNodeId =
  | "CLIENT"
  | "GATEWAY"
  | "AGENT"
  | "GPU"
  | "VECDB"
  | "TOOLS"
  | "DB";

export interface TopologyNode {
  id: TopologyNodeId;
  label: string;
  icon: string;
}

export const topologyNodes: TopologyNode[] = [
  { id: "CLIENT", label: "客户端", icon: "▣" },
  { id: "GATEWAY", label: "网关", icon: "≋" },
  { id: "AGENT", label: "Agent 服务", icon: "⚙" },
  { id: "GPU", label: "GPU 集群", icon: "🔥" },
  { id: "VECDB", label: "向量库", icon: "◍" },
  { id: "TOOLS", label: "工具服务", icon: "🔧" },
  { id: "DB", label: "数据库", icon: "▤" },
];

export type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "code"; lang: string; code: string }
  | { kind: "quote"; text: string };

export interface Dive {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Step {
  id: string;
  name: string;
  body: string;
  badge: string;
  badgeDetail: string;
  /** 卡片内直接展示的参数表（不折叠） */
  params?: { headers: string[]; rows: string[][] };
  /** 卡片内示意图：ann-index = 向量索引检索；out-stack = 出栈分层 */
  figure?: "ann-index" | "out-stack";
  nodes: TopologyNodeId[];
  /** 回路：此站点之后流程跳回的目标站点 */
  loopsTo?: string;
  dives: Dive[];
}

export const steps: Step[] = [
  {
    id: "INPUT",
    name: "发送",
    body: "你在输入框敲下问题，按下回车。客户端把文本、session_id、身份凭证打包成一个 HTTPS 请求——此时它只是一段几百字节的 JSON，还没有遇到任何「智能」。整个旅程中，这是唯一发生在你设备上的一步。",
    badge: "1× 浏览器进程",
    badgeDetail: "单个标签页 · 请求体 ≈ 数百字节",
    nodes: ["CLIENT"],
    dives: [
      {
        id: "input-payload",
        title: "请求体里有什么",
        blocks: [
          { kind: "p", text: "用户输入与接入层通常完成四件事：身份认证（校验 token / API key）、会话标识（携带 session_id / conversation_id 关联历史）、请求封装（输入+会话信息+客户端参数打包）、限流与路由。" },
          {
            kind: "code",
            lang: "json",
            code: `{
  "conversation_id": "sess_a1b2c3",
  "message": "帮我查一下北京明天的天气",
  "auth": "Bearer eyJhbGci..."
}`,
          },
        ],
      },
    ],
  },
  {
    id: "GATEWAY",
    name: "接入",
    body: "请求先抵达网关。它校验你的身份、检查限流、按会话路由到对应的 Agent 服务实例。session_id 在这里被登记，保证接下来的每一步——从记忆加载到流式返回——都关联到同一个会话。",
    badge: "1× 网关实例",
    badgeDetail: "Envoy/Nginx · TLS 终结 · 毫秒级",
    nodes: ["GATEWAY"],
    dives: [
      {
        id: "gateway-pipeline",
        title: "网关的一毫秒里发生了什么",
        blocks: [
          { kind: "p", text: "请求到达网关后、进入 Agent 服务前，会经过一条固定流水线：" },
          { kind: "list", items: [
            "TLS 终结：网关持证书解密 HTTPS，内网以明文或 mTLS 转发",
            "鉴权：本地校验 JWT 签名或 API key（不查库，微秒级）",
            "限流：令牌桶 / 滑动窗口，按用户或 key 维度计数，超限直接返回 429",
            "路由：按 conversation_id 做会话粘性（一致性哈希），同一会话落到同一 Agent 实例，本地缓存的历史不必重拉",
          ] },
          { kind: "code", lang: "http", code: `GET /v1/chat HTTP/1.1
Authorization: Bearer eyJhbGci...
X-Session-Id: sess_a1b2c3` },
          { kind: "p", text: "这一层的意义：把「你是谁、允不允许、转发给谁」从业务逻辑里剥离——Agent 服务收到的请求已经是干净、可信、带着会话锚点的。" },
        ],
      },
    ],
  },
  {
    id: "MEMORY",
    name: "记忆加载",
    body: "Agent 服务收到请求后做的第一件事不是思考，是「回忆」。神经网络本身无状态——它不记得你上一轮说过什么。所以必须从外部存储加载：最近几轮原文（短期记忆）、对话摘要、用户画像、可语义检索的向量记忆。",
    badge: "2~3× 存储查询",
    badgeDetail: "Redis 缓存 · Postgres 会话 · 向量库检索",
    nodes: ["AGENT", "VECDB", "DB"],
    dives: [
      {
        id: "memory-deep",
        title: "神经网络没有记忆，Agent 怎么记住你？",
        blocks: [
          { kind: "p", text: "模型每次推理都是无状态的：输入一组 token，输出一组 token，结束即丢弃。但 Agent 通过外部记忆机制，在模型外部模拟出了「记忆」。" },
          { kind: "p", text: "先区分两种「记忆」——" },
          { kind: "list", items: [
            "参数记忆：训练时固化在权重里的知识（如「北京是中国首都」），静态、全局、不可按用户更新",
            "上下文记忆：把历史信息放进模型输入上下文，动态、会话级、可随时修改",
          ] },
          { kind: "p", text: "Agent 记忆的核心工作流：写入（抽取/总结/存储）→ 读取（按当前问题检索）→ 注入（拼进 prompt）。长期记忆的五种常见形态：" },
          { kind: "list", items: [
            "摘要记忆：LLM 定期压缩历史对话，如「用户偏好简洁回答；最近在问 Python」",
            "向量记忆：对话片段向量化入库，提问时语义检索——「我的猫叫什么？」能找到「猫叫 Luna」",
            "结构化记忆：实体关系入图数据库，「用户A → 住在 → 北京」，可精确查询",
            "用户画像：职业/兴趣/语言风格，以键值对注入系统提示",
            "情景记忆：完整事件序列（观察-思考-行动），供反思与规划复用",
          ] },
          { kind: "p", text: "仅有存储还不够：写入策略（什么值得记）、检索策略（向量相似度+时间衰减）、更新策略（新旧冲突合并）、遗忘机制（删除过时信息）、压缩摘要（适配上下文窗口）——这些由 harness 或专门的 memory 模块管理。" },
        ],
      },
    ],
  },
  {
    id: "CONTEXT",
    name: "上下文组装",
    body: "Harness 把所有材料拼成一次完整的模型输入：系统提示词、工具定义（JSON Schema）、历史消息、刚加载的记忆，以及 RAG 检索结果——先把你的问题变成向量，在向量库里找出语义最相关的文档片段，一起塞进上下文。",
    badge: "1× 服务进程",
    badgeDetail: "内存中拼接 · prompt ≈ 数 KB ~ 数十 KB",
    figure: "ann-index",
    nodes: ["AGENT", "VECDB"],
    dives: [
      {
        id: "harness-deep",
        title: "Harness 到底是什么？",
        blocks: [
          { kind: "quote", text: "Harness 就是 Agent 的执行引擎：它把「调用模型 → 解析输出 → 执行工具 → 回填结果 → 再调用模型」这个循环自动化地管理起来。" },
          { kind: "p", text: "Harness（Agent 运行时/编排层）不是一个小模块，而是驱动整个执行流程的调度中心，覆盖：" },
          { kind: "list", items: [
            "上下文组装：注入系统提示、拼接历史、添加工具定义、插入检索与记忆片段",
            "模型推理调度：调用 LLM API、处理流式响应、解析输出、超时重试",
            "工具调用循环（最核心）：解析→校验→执行→回填→再调用，实现 ReAct / Function Calling 范式",
            "后处理与安全：内容过滤、格式转换、脱敏",
            "流式输出管理：token 逐个转发、中间状态提示",
            "错误处理：模型失败重试、工具异常降级、超长上下文自动压缩",
          ] },
          { kind: "p", text: "没有 harness，模型只会输出一段文本，不会自动去调用工具并继续推理。它位于接入层之后、外部工具之前，是连接模型、工具、记忆和用户请求的中央调度器。" },
        ],
      },
      {
        id: "embed-deep",
        title: "「问题向量化」是什么？",
        blocks: [
          { kind: "p", text: "把用户问题用嵌入模型（Embedding Model）转换成高维数值向量（常见 768 / 1024 / 1536 维），让「文字问题」变成「机器能计算相似度的数字表示」。" },
          { kind: "p", text: "为什么需要它：关键词搜索只能匹配字面——用户问「怎么退款」，文档写「如何申请退货」，就找不到。向量化后语义相近的句子距离更近，用词不同也能检索到。" },
          { kind: "p", text: "流程：文本 → tokenize → 嵌入模型前向计算 → 输出向量，例如：" },
          { kind: "code", lang: "text", code: `"北京明天天气怎么样？" → [0.012, -0.034, 0.221, ..., 0.087]  (1024维)` },
          { kind: "p", text: "随后以该向量为查询，在向量数据库（FAISS / Milvus / Pinecone）中做近似最近邻搜索（ANN），取余弦相似度最高的若干文档片段注入上下文。常见嵌入模型：text-embedding-3、bge-large-zh、m3e-base。" },
        ],
      },
    ],
  },
  {
    id: "MODEL",
    name: "模型推理",
    body: "拼好的上下文被送往 GPU 集群。LLM 是基于 Transformer 的超大规模深度神经网络，它只做一件事：接收 token 序列，逐个预测下一个 token。它没有跨请求的记忆，也不会主动调用任何工具——只输出文本，或一个工具调用指令。",
    badge: "~1000× GPU",
    badgeDetail: "以 DeepSeek-V4-Pro 为例：1.6T 权重 · FP8 ≈ 1.6TB 显存 · 单 token 激活 49B 参数",
    params: {
      headers: ["模型", "参数规模", "激活参数/推理"],
      rows: [
        ["DeepSeek-V4-Pro", "1.6T", "49B（MoE · 1M 上下文）"],
        ["Kimi K2.5", "1T", "32B（MoE · 多模态 agentic）"],
        ["GLM-5", "744B", "40B（MoE）"],
        ["Qwen3.5-397B-A17B", "397B", "17B（MoE · Apache 2.0）"],
        ["MiniMax-M2.5", "229B", "10B（MoE · 10B 激活即达 SOTA 级编码）"],
      ],
    },
    nodes: ["GPU"],
    dives: [
      {
        id: "llm-nn",
        title: "LLM 是神经网络吗？",
        blocks: [
          { kind: "p", text: "是。LLM 是神经网络的一种——基于 Transformer 架构的深度神经网络。" },
          { kind: "quote", text: "LLM = 基于 Transformer 的深度神经网络 + 超大规模参数 + 海量文本训练" },
          { kind: "list", items: [
            "由多层 Transformer 块堆叠（GPT-3 有 96 层）",
            "数亿到数万亿可学习权重，靠反向传播 + 梯度下降训练",
            "核心机制是自注意力（Self-Attention），高效建模长距离依赖",
            "神经网络家族还包括 CNN（视觉）、RNN（序列）、强化学习网络（游戏 AI）——LLM 是其中专攻语言的超大规模成员",
          ] },
        ],
      },
      {
        id: "nn-vs-math",
        title: "神经网络预测 vs 数学模型",
        blocks: [
          { kind: "p", text: "神经网络本身就是一种数学模型，区别在于形式与构建方式——" },
          { kind: "table", headers: ["维度", "传统数学模型", "神经网络"], rows: [
            ["构建方式", "人根据物理规律/统计假设手动设计公式（F=ma、SIR）", "结构人设计，权重由数据驱动自动学习"],
            ["可解释性", "白盒：参数有明确物理/统计含义", "黑盒：数百万参数无直观含义"],
            ["数据需求", "结构正确时小样本即可，物理定律甚至零数据", "需要大量标注数据，否则过拟合"],
            ["表达能力", "受限于预设公式形式", "万能近似：可逼近任意复杂连续函数"],
            ["泛化鲁棒性", "假设范围内外推能力强", "擅长内插，对分布偏移/对抗扰动敏感"],
            ["典型场景", "物理仿真、统计推断", "图像、语音、自然语言等高维非线性任务"],
          ] },
          { kind: "p", text: "两者常结合使用：物理信息神经网络（PINN）把物理定律作为先验注入网络训练。" },
        ],
      },
      {
        id: "thinking",
        title: "彩蛋：模型在「想」什么",
        blocks: [
          { kind: "p", text: "在输出答案之前，很多模型会先生成一段「思维链」——给自己写的推理草稿：拆解问题、回忆相关概念、规划答案结构。对话界面上显示的「Thought for N seconds」就是它。" },
          { kind: "p", text: "它发生在 MODEL 内部，消耗的也是同一批 GPU 的 token 生成算力；这段草稿通常不直接展示给用户，但会占用首 token 之前的那段时间。" },
        ],
      },
    ],
  },
  {
    id: "TOOLS",
    name: "工具调用 · 循环",
    body: "模型说「我需要查一下天气」。Harness 接管：解析参数、检查权限、执行工具、把结果回填上下文、再次调用模型。这个循环可能重复多次——一次请求，N 次推理，直到模型产出最终回复、达到最大迭代次数或触发超时。",
    badge: "1×+ 外部进程",
    badgeDetail: "第三方 API / 代码沙箱 / 数据库 · 循环次数不固定",
    nodes: ["TOOLS", "GPU", "AGENT"],
    loopsTo: "MODEL",
    dives: [
      {
        id: "skills-deep",
        title: "Skills 在哪一层？",
        blocks: [
          { kind: "p", text: "Skill 是封装好的完整能力单元：专门的提示词 + 一组相关工具 + 预设工作流 + 参数 schema（甚至本地脚本）。例如「发送邮件」这个 Skill 内部包含校验收件人、调用邮件 API、失败重试等多个步骤。" },
          { kind: "p", text: "它横跨三个环节：上下文组装（注入 Skill 列表让模型知道有哪些能力）→ 模型推理（选择 Skill 并填参数）→ Harness 执行（加载定义，展开内部子流程，可能嵌套多次工具调用甚至另一个 Skill）。" },
          { kind: "table", headers: ["对比项", "Tool（工具）", "Skill（技能）"], rows: [
            ["粒度", "单一功能，如查天气 API", "复合能力，如「规划旅行」= 查天气+订酒店+路线"],
            ["执行方式", "一次 API 调用", "多步推理、多个工具、条件分支"],
            ["模型交互", "模型直接调用工具", "模型调用 Skill，Skill 内部再组织工具"],
            ["可复用性", "通用但简单", "面向特定任务，封装领域知识"],
          ] },
          { kind: "p", text: "所以 Skills 位于工具调用循环的「上层」——不是流程中的独立阶段，而是对上下文组装到工具执行这段的增强与抽象。" },
        ],
      },
    ],
  },
  {
    id: "SAFETY",
    name: "后处理",
    body: "最终回复生成后，还要过一道安检：安全审核检查违规内容，敏感信息脱敏，Markdown 转换成前端格式，检索来源附加引用标注。不通过的回复可能触发重新生成，或被替换为安全提示。",
    badge: "1× 审核服务",
    badgeDetail: "规则引擎 + 分类小模型 · 毫秒级",
    nodes: ["AGENT"],
    dives: [
      {
        id: "safety-pipeline",
        title: "后处理流水线的四道工序",
        blocks: [
          { kind: "list", items: [
            "安全审核：规则引擎 + 小型分类模型扫描最终文本，命中违规类别则拦截或触发重写",
            "脱敏：正则 + 命名实体识别找出手机号、邮箱、证件号等 PII，替换或掩码",
            "格式转换：Markdown → 前端渲染树，代码块转高亮结构",
            "引用标注：把 RAG 命中的文档 ID 附成脚注，让结论可溯源",
          ] },
          { kind: "p", text: "这一层通常是无状态微服务，毫秒级开销；不通过的内容可能整段重新生成——偶发的「回答变慢」，有时就是在这里被打回重写了。" },
        ],
      },
    ],
  },
  {
    id: "STREAM",
    name: "流式返回",
    body: "回复不是等全部生成完才给你。SSE 或 WebSocket 把 token 逐个推过网关、回到客户端；工具执行阶段你会看到「正在查询…」的中间状态。你看到的逐字浮现，就是此刻正在发生的事。",
    badge: "1× SSE 连接",
    badgeDetail: "KB 级流量 · 客户端逐 token 渲染",
    figure: "out-stack",
    nodes: ["GATEWAY", "CLIENT"],
    dives: [
      {
        id: "sse-wire",
        title: "SSE 事件流长什么样",
        blocks: [
          { kind: "p", text: "主流方案是 SSE（Server-Sent Events）：单向、基于普通 HTTP、断线自动重连，比 WebSocket 轻得多。只有需要客户端主动上行（如中途打断生成）才升级到 WebSocket。" },
          { kind: "code", lang: "text", code: `event: token
data: {"delta":"北"}

event: status
data: {"tool":"search_weather","state":"running"}

event: done
data: [DONE]` },
          { kind: "p", text: "工具调用阶段的中间状态也走同一条连接：你在界面上看到的「正在查询…」，就是服务端推来的一条 status 事件，而不是客户端轮询的结果。" },
        ],
      },
      {
        id: "ttft",
        title: "为什么要流式：TTFT 与总时长的博弈",
        blocks: [
          { kind: "p", text: "非流式下，你要等全部 token 生成完（比如 2.7s）才看到第一个字。流式把「首字时间（TTFT）」提前到模型吐出第一个 token 的时刻（几百毫秒），感知速度提升数倍——总时长没变，等待体验完全不同。" },
          { kind: "p", text: "几个工程细节：" },
          { kind: "list", items: [
            "客户端按渲染帧（约 16ms）批量 append 已到达的 token，避免逐字符重排",
            "网关必须关闭响应缓冲（如 X-Accel-Buffering: no），否则事件会被攒成一坨再发出",
            "空闲连接靠注释行/心跳保活，穿过企业代理的长连接空闲超时一般在 30~60 秒",
          ] },
        ],
      },
    ],
  },
  {
    id: "PERSIST",
    name: "持久化",
    body: "收尾工作决定下一次对话的质量：保存本轮消息、更新对话摘要、提取重要事实写入长期记忆和向量库、记录工具调用日志与耗时。这一步的「写入」，正是第 3 站「读取」的来源——记忆的闭环。",
    badge: "行级写入 ×N",
    badgeDetail: "会话表 · 摘要 · 向量库 · 日志埋点",
    nodes: ["DB", "VECDB"],
    dives: [
      {
        id: "persist-writes",
        title: "一轮对话结束后，写入了什么",
        blocks: [
          { kind: "p", text: "回复返回用户后，Agent 的收尾写入通常有四类：" },
          { kind: "table", headers: ["写入内容", "去向", "下一次的用途"], rows: [
            ["会话消息原文", "会话表（Postgres）", "第 3 站的短期记忆"],
            ["对话摘要", "摘要表 / 缓存", "超长历史的压缩替代"],
            ["事实与偏好", "向量库 + 用户画像", "语义检索式长期记忆"],
            ["工具调用日志 · 耗时", "日志 / 埋点系统", "观测、计费与优化"],
          ] },
          { kind: "p", text: "这些写入多数是异步的（先返回、后台落库），用户不会为持久化多等一毫秒。" },
        ],
      },
      {
        id: "memory-loop",
        title: "记忆闭环：读与写的对偶",
        blocks: [
          { kind: "p", text: "把第 3 站（MEMORY 读取）和这一站（PERSIST 写入）对齐看，才是完整的记忆系统：" },
          { kind: "list", items: [
            "读取（第 3 站）：最近 N 轮原文 + 摘要 + 向量检索 + 画像 → 组装进上下文",
            "写入（本站）：原文落库 → 摘要定时或超长触发更新 → 事实抽取进向量库 → 画像字段合并",
          ] },
          { kind: "p", text: "摘要通常由 LLM 自己生成（每 N 轮、或上下文逼近窗口上限时触发），本质是「用一次便宜的推理，换取之后每一轮都省窗口」；向量写入则把对话片段 embedding 后入库，供未来的语义检索命中。" },
          { kind: "quote", text: "第 3 站读到的每一条，都是此前某一轮在这里写入的。" },
        ],
      },
    ],
  },
];

export const outro: Block[] = [
  { kind: "p", text: "一次请求的本质：无状态的神经网络（LLM）在 Harness 的调度下，通过外部记忆系统模拟「记住」，通过 RAG 向量检索获取知识，通过工具调用扩展能力，最终生成回复。" },
  { kind: "list", items: [
    "Harness 是让这一切自动运转的引擎",
    "记忆是外部存储 + 上下文注入的产物",
    "RAG 是语义检索增强",
    "LLM 只是计算核心，没有任何状态",
  ] },
];

export const siteMeta = {
  title: "Agent Notebook",
  subtitle: "一条用户消息的完整生命周期",
};
