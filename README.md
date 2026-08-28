# Agent Notebook

一条用户消息在 Agent 系统中的完整生命周期——滚动驱动的交互式可视化。

**线上地址**: <https://moux1024.github.io/agent-notebook/>

## 这是什么

从你按下回车，到 Agent 开口回答：一条消息穿越 接入层 → 记忆加载 → 上下文组装 → GPU 推理 → 工具调用循环 → 后处理 → 流式返回 → 持久化 的完整旅程。底部固定的算力地图随滚动点亮，展示每一步「计算发生在哪、动用了什么规模的资源」。

↺ 流程不是固定的九步管线：工具调用可循环多次（时间线上有 TOOLS→MODEL 回路弧），站点也可扩展。

## 内容来源

整理自与 DeepSeek 的 [8 组对话](https://chat.deepseek.com/share/vki6orvo1y2x40op79)，覆盖：Agent 全流程、Harness、RAG 向量化、神经网络 vs 数学模型、LLM 与神经网络、Agent 记忆机制、Skills 定位。

视觉设计参考 [200ms.thenodebook.com](https://200ms.thenodebook.com/)。

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

## 内容修订

所有站点文案与深潜内容集中在 `src/content/steps.ts`，以数据驱动：
- 增删站点：改 `steps` 数组即可，时间线/拓扑带自动跟随
- 已知缺口：思维链（thinking）目前仅作为 MODEL 站的彩蛋深潜，若完整流程中应为独立站点，在 `steps` 的 MODEL 之前插入新条目即可

## 部署

推送到 `main` 分支后 GitHub Actions 自动构建并发布到 GitHub Pages（`.github/workflows/deploy.yml`）。
