# 沈皓褀 简历知识库

> AI 聊天的唯一知识来源。修改后重启后端即可生效。

## 基本信息

- 姓名：沈皓褀（CuriousTrea / thuwa）
- 27届应届硕士
- 浙江工业大学 计算机科学与技术 硕士（2024-2027），省部共建
- 本科：怀化学院 电气工程及其自动化（2020-2024）
- 所在地：杭州
- GitHub：CuriousStreas
- 个人主页：curioustrea.fun
- 邮箱：CuriousStreas@outlook.com
- 在校成绩：专业前十，实验室同届第一

## 技能总览

- 语言：Python、c++（主力）、JavaScript / TypeScript、C#（Unity）
- 后端：Flask、FastAPI、Node.js
- 前端：Vue 3、Next.js 14 (React)、Tailwind CSS、Element Plus、Pinia、axios
- 数据可视化：ECharts（热力图、饼图、折线图、燃尽图）、手写日历热力图
- 数据库：MongoDB、MySQL、Redis
- 游戏相关：Unity 引擎、C#、行为树、配置驱动、Lua 注入、TCP Socket
- 工程化：Git、Linux、TeamCity CI/CD、Docker（基础）
- AI 应用：Azure AI、glm-4-5、AI Agent / Skill 封装、CodeMaker、Copilot

## 实习经历

### 网易雷火 — 测试开发实习生（2026.01 - 2026.04，3个月）

在职期间参与 3 个项目的开发与维护：茯神Web、GMTool、TaffyBot。

#### 茯神Web（FushenWeb）
内网 QA 综合管理平台，覆盖日常监控、性能专项、测试工具、自动化等模块。
- 技术栈：Vue 3 + TypeScript + Element Plus + Pinia（前端）、Python Flask（后端）、Redis
- 负责 9 个功能模块：自动任务健康度、性能特效、自动化用例管理、报错开单、武学信息、资产数据监控、FastPatch 日志监控、场景性能热力图、RPC 协议信息
- 独立开发报错开单数据仪表盘（7个 ECharts 图表组件），设计"一次请求全量拉取 + 前端 computed 切片"数据流架构
- 手写 GitHub 风格日历热力图组件（CalendarHeatmap），纯 Vue 3 + CSS Flex，ResizeObserver 响应式，CSS 变量动态注入
- 热力图颜色映射采用百分位数分布而非线性 min-max，解决极值集中导致色阶失效
- 从零搭建 FastPatch 热更日志监控页面和 RPC 协议信息页面
- 工单一键开单功能封装，多模块复用

#### GMTool（Web GM 工具）
面向 QA 的内网 Web GM 指令工具，浏览器操作替代命令行。
- 从零搭建完整项目（前后端独立开发）
- 技术栈：Next.js 14 (React + Tailwind CSS) + FastAPI (Python) + MongoDB + Redis
- 核心机制：TCP 长连接 + Lua 注入，三种执行模式（GM 指令 / RPC GM / 原生 Lua）
- 每个用户独立 TCP 连接，以 email 隔离
- SSO 鉴权体系：与 FushenWeb 打通，QAWEB_SESS Cookie 直接换取 GMTool session，用户无需二次登录
- RedisSessionMiddleware 中间件：请求级自动管理 session，路由层无感知
- Cookie 安全配置：httponly + samesite + secure
- MongoDB 数据模型：commands、market_combos、operation_history、users 四个集合
- 预留邮箱后缀路由扩展点（email-router.ts），支持后续无侵入定制

#### TaffyBot（QA 验收播报机器人）
剧情组自动化 QA 验收系统，AI 风险分析 + 群消息推送。
- 从零设计并实现完整 6 步流水线
- 技术栈：Python + glm-4-5（智谱 AI）+ TeamCity + 工单系统 API + 群消息推送
- 6 步流水线：拉取里程碑需求 -> 查询关联工单 -> 整理 AI 分析输入 -> AI 风险分析 -> 格式化报告 -> 发送 群组
- 双模板体系：周一高信息密度风险报告 / 周四轻量版预告报告
- AI 降级策略：AI 不可用时自动跳过，不阻断发送
- 每日 Bug 新增提醒子系统（每 10 分钟检查，高优先级 Bug 推送并 @指派人）
- BVT 验收提醒（值班人员轮班配置）
- 封装为 AI Skill，支持自然语言驱动（如"帮我跑周一报告发到群 xxx"）

### 浙江华策影视 — Python 实习生（2025.03 - 2025.07）

- 参与短剧国际化 AI 处理管线开发
- 接入 Azure AI 服务，设计基于生产者-消费者模型和 FSM 的异步任务管线
- 将国内短剧处理耗时降低 90% 以上
- 开发交付便携化工具和群控自动化框架

## 项目经历

### GameJam 项目
- 2024.11 吉比特 GameJam《周公解梦事务所》：类银河恶魔城风格，Unity + C#，负责战斗系统开发、怪物与 Boss 行为逻辑、玩法设计
- 2025.03 开拓芯 GameJam（暂未命名）：对话冒险 RPG，负责程序开发，协调 3 人程序团队，与美术/策划沟通推进

### 中化Map（2024.06 至今）
- Python + 深度学习 + Flask
- 负责模型训练与后端任务调度
- 实现指定地区高分影像农作物地块的自动识别与提取
- 开发 Flask 后端任务调度服务，协调模型推理与业务接口

## 技术亮点

1. CalendarHeatmap：放弃 ECharts，纯 Vue 3 + CSS Flex 手写 GitHub 风格日历热力图，ResizeObserver 响应式自适应，CSS 变量动态注入，5 档颜色分级，Teleport tooltip
2. 仪表盘数据架构："一次请求全量拉取 + 前端 computed 切片"的高性能数据流设计，日期筛选零额外接口请求
3. 热力图百分位数色阶：用百分位数分布代替线性 min-max，解决极值集中场景下色阶失效、大量格子颜色相同的问题
4. GMTool SSO 鉴权：QAWEB_SESS 直接换取 session，用户无需二次登录；RedisSessionMiddleware 中间件请求级自动管理
5. TaffyBot AI 驱动：6 步全自动流水线，AI 风险分析 + 降级策略，封装为 AI Skill 支持自然语言操作
6. 一键开单：多模块复用同一封装，表单根据页面数据自动预填充

## 本网站信息

- 本网站（curioustrea.fun）是沈皓褀的个人技术主页
- 前端：Vue 3 + Vite，五章节横向滚动布局，桌面端/移动端自适应
- 后端：Python Flask，通过 SSE 流式响应实现 AI 对话
- AI 对话：接入 DeepSeek API（deepseek-v4-flash），本知识库为唯一事实来源
- 右下角 AI 聊天终端可回答关于沈皓褀实习、项目、技能、教育等问题
- 部署：前端 Cloudflare Pages，后端 Render / Railway
- 域名 curioustrea.fun 已购

## 联系方式

- 邮箱：CuriousStreas@outlook.com
- GitHub：https://github.com/CuriousStreas
- 个人主页：https://curioustrea.fun