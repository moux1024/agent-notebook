# 修复知识性审查发现的 5 处问题

全部为 src/content/steps.ts 单文件改动：

1. **GATEWAY 深潜**：HTTP 示例 `GET /v1/chat` → `POST /v1/chat`（发送消息必为 POST）
2. **INPUT 深潜**：JSON 示例移除 body 内的 `auth` 字段（凭证应在请求头），替换为 `"stream": true`
3. **STREAM 出栈图**（Figures.tsx）：交换第 3/4 层职责——agent 进程改为「TLS 库加密（用户态）· 1 条 record · 数十 B」，内核改为「写入 socket 缓冲区，分段发出 · 1× write() 系统调用」（标准 TLS 在用户态加密，内核仅缓冲分段）
4. **GATEWAY 深潜鉴权项**：JWT 本地验签（不查库）与 API key 查缓存比对分开表述
5. **MODEL 参数表**：MiniMax-M2.5 行「10B 激活即达 SOTA 级编码」→「10B 激活即接近 SOTA 编码水准」

完成后 npm run build 验证 + 本地浏览器抽检出栈图新层次 → git commit（不推送，间距提交仍在等确认）。