# 参考资料索引

## 自己的项目（可直接参考/复用代码）

### Curi-ask（主要参考源）
```
路径: D:\Repo\Curi-ask
```

**最有价值的文件：**

| 文件 | 拿来干嘛 |
|------|---------|
| `backend/app.py` | Flask SSE 流式端点写法，直接抄 `api_chat_stream()` |
| `backend/chat_service.py` | 流式生成器封装模式 |
| `backend/config.py` | `.env` 加载 + 配置管理 |
| `frontend/src/App.vue` | SSE 前端消费逻辑（`fetch` + `reader.getReader()` + 逐行解析），完整抄 |
| `frontend/package.json` | 依赖版本参考 |

**关键代码位置：**
- SSE 后端生成器：`app.py` 第 100-135 行
- 前端 fetch SSE：`App.vue` `<script setup>` 中 `handleSubmit()` 函数，约第 1050-1200 行
- Abort 停止生成：`stopStream()` 函数
- Markdown 渲染：`marked` + `highlight.js`，`renderMarkdown()` 函数

### flood-front（侧边栏聊天参考）
```
路径: D:\WorkW\flood-front
```

| 文件 | 拿来干嘛 |
|------|---------|
| `src/views/chat/index.vue` | 聊天 UI 布局参考（但实现用 WebSocket，我们不抄这个） |

**评价：** 聊天逻辑不建议参考（用的 WebSocket，不如 SSE），但侧边栏浮窗的布局 CSS 可以看一眼。

## 外部文档

### DeepSeek API

- 官网：https://platform.deepseek.com
- API 文档：https://platform.deepseek.com/api-docs
- 关键：OpenAI 兼容格式，`base_url="https://api.deepseek.com"`，`stream=True` 即可流式
- 模型 ID：`deepseek-chat`（V3）/ 具体 Flash 版本看官网最新

### Vercel 部署

- 官网：https://vercel.com
- Vue + Vite 部署指南：https://vercel.com/guides/deploying-vuejs-to-vercel
- 自定义域名：https://vercel.com/docs/projects/domains
- 环境变量：https://vercel.com/docs/projects/environment-variables
- 免费额度：https://vercel.com/docs/pricing（静态部署免费无限制）

### Render 部署（Flask 后端）

- 官网：https://render.com
- Flask 部署指南：https://render.com/docs/deploy-flask
- 免费 tier 限制：每月 750h，512MB RAM，15 分钟无请求自动休眠
- 环境变量：Dashboard → Environment

### Vue 3 / Vite

- 官方文档：https://cn.vuejs.org （中文）
- Vite：https://cn.vitejs.dev （中文）

### Flask

- 官方文档：https://flask.palletsprojects.com
- SSE 实现参考：Flask `Response` + `mimetype='text/event-stream'`

## 简历知识库素材

以下文件包含简历相关信息，用于填充 `knowledge/resume.md`：

- `简历/初版260430.md`
- `简历/AI方向260430.md`
- `简历/游戏测开方向260528.md`
- `简历/游戏AI测开方向260603.md`
- `简历/AI个人主页-idea简报.md` — 里面有求职者背景摘要

## 前端风格参考（待定）

> 用户还没选定参考网页。等选定后记录在这里。

候选方向：
- 极简白底（学术风）
- 深色科技感（游戏/Geek 风）
- 像素复古
- 暖色调人情味

## 工具 / 库速查

| 用途 | 库 | 备注 |
|------|-----|------|
| Markdown 渲染 | `marked` (npm) | Curi-ask 用的这个 |
| 代码高亮 | `highlight.js` (npm) | 配合 marked |
| HTTP 请求 | 原生 `fetch` | 不需要 axios |
| 图标 | 手写 SVG 或 emoji | 不需要 icon 库 |
| CSS | 手写 CSS / CSS Variables | 不需要 Tailwind（MVP 阶段） |
| 环境变量 | `python-dotenv` (pip) | Flask 加载 `.env` |
| CORS | `flask-cors` (pip) | 前后端不同域需要 |
| OpenAI SDK | `openai` (pip) | 调 DeepSeek（兼容 OpenAI 格式） |
