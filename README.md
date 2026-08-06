# AI 个人主页 — 项目文档索引

## 一句话

带 AI 对话能力的求职个人主页。面试官浏览简历的同时，可以在右下角向一个 AI 形象自由提问求职者相关信息。**正经内容 + AI 彩蛋。**

## 文档导航

| 文档 | 内容 | 适合谁 |
|------|------|--------|
| [docs/GOALS.md](docs/GOALS.md) | 项目目标、核心功能、不做的事 | 所有人先看这个 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 前后端架构、数据流、部署方案 | 开发前读 |
| [docs/KNOWLEDGE.md](docs/KNOWLEDGE.md) | 参考项目、API 文档、技术栈资料索引 | 需要查资料时看 |

## 目录结构

```
ai-homepage/
├── README.md                  # ← 你在这里
├── docs/
│   ├── GOALS.md               # 目标与范围
│   ├── ARCHITECTURE.md        # 架构设计
│   └── KNOWLEDGE.md           # 参考资料索引
├── frontend/                  # Vue 3 + Vite 单页应用
│   ├── src/
│   │   ├── App.vue            # 五章节主页布局
│   │   ├── components/        # 项目展示与 AI 对话组件
│   │   ├── composables/       # 横向章节导航
│   │   └── data/              # 已核对的简历展示数据
│   └── ...
├── backend/                   # Flask 流式对话服务
│   ├── app.py                 # SSE 流式聊天接口
│   ├── knowledge.py           # 确定性简历知识检索
│   ├── chat_service.py        # DeepSeek 流适配与服务器 prompt
│   └── requirements.txt
└── knowledge/                 # 简历知识库数据
    └── resume.md              # 简历结构化信息
```

## 技术选型速览

| 层 | 选型 | 原因 |
|----|------|------|
| 前端 | Vue 3 + Vite | 你最熟 |
| 后端 | Flask | 你最熟 |
| AI 模型 | DeepSeek V4 Flash | OpenAI-compatible API |
| 流式方案 | Named SSE | 复用 Curi-ask 的可靠传输模式 |
| 部署前端 | Cloudflare Pages | 免费，自定域名，大陆可访问 |
| 部署后端 | Render / Railway | 免费 tier |
| 域名 | curioustrea.fun（暂定）| 已购 |

## 本地运行

项目使用 Python 3.12。`.venv` 仅用于本地隔离，不上传部署平台；生产环境按 `backend/requirements.txt` 重建依赖。

```powershell
# 首次设置后端
py -3.12 -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
Copy-Item backend/.env.example backend/.env

# 在 backend/.env 中填写 DEEPSEEK_API_KEY，然后启动 Flask
backend/.venv/Scripts/python.exe -m backend.app
```

另开终端启动前端。Vite 会把 `/api` 代理到 `http://127.0.0.1:5000`：

```powershell
npm --prefix frontend install
npm --prefix frontend run dev
```

打开 <http://127.0.0.1:4173/>。后端健康检查为 <http://127.0.0.1:5000/api/health>，只返回服务状态和 `configured` 布尔值，不验证或暴露密钥。

## 测试与构建

```powershell
backend/.venv/Scripts/python.exe -m unittest discover -s backend/tests -v
npm --prefix frontend test
npm --prefix frontend run build
```

## 安全与部署

- `DEEPSEEK_API_KEY` 仅配置在 Flask 服务端，不使用 `VITE_` 前缀，也不会进入浏览器请求体或构建产物。
- 模型、系统 prompt 与 DeepSeek URL 均由服务端控制；浏览器只能提交最多 10 条、每条最多 2,000 字符的 `user` / `assistant` 历史。
- `knowledge/resume.md` 是回答个人事实的唯一来源；检索不到时助手会明确表示公开资料未收录。
- 生产环境可将 `frontend/dist` 部署到 Cloudflare Pages，将 `backend` 部署到 Render 或 Railway。后端需设置 `DEEPSEEK_API_KEY` 和实际前端域名对应的 `ALLOWED_ORIGINS`。
- 当前限流按客户端 IP 保存在单个 Flask 进程内，每分钟最多 5 次。多实例部署不会共享计数；需要全局限流时应改用 Redis 或平台网关。

## 当前状态

- [x] 域名选购（curioustrea.fun）
- [x] 技术方案定型
- [x] 文档框架建立
- [x] 前端项目初始化
- [x] 五章节横向档案交互
- [x] 移动端竖向阅读模式
- [x] DeepSeek 流式 AI 对话
- [x] 后端 Flask API
- [x] 公开简历知识检索
- [x] Named SSE 前后端协议
- [ ] 真实项目图片与公开链接
- [ ] 部署上线
