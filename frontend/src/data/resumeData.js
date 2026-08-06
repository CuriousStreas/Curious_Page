export const sections = [
  { id: 'index', label: 'INDEX', title: '身份索引' },
  { id: 'profile', label: 'PROFILE', title: '能力档案' },
  { id: 'experience', label: 'EXPERIENCE', title: '实习记录' },
  { id: 'projects', label: 'PROJECTS', title: '工程项目' },
  { id: 'ask', label: 'GAME / ASK', title: '对话入口' },
]

export const capabilities = [
  { label: 'ENGINEERING', value: 'Python / Flask / FastAPI' },
  { label: 'FRONTEND', value: 'Vue / Next.js / ECharts' },
  { label: 'DATA', value: 'MongoDB / MySQL / Redis' },
  { label: 'AI QUALITY', value: 'Agent / Skills / Prompt / 评测' },
  { label: 'GAME', value: 'Unity / C# / GameJam' },
]

export const experienceDossiers = [
  {
    code: 'EXP-03',
    date: '2026.01 — 2026.04',
    company: '杭州网易雷火科技有限公司',
    shortCompany: '网易雷火',
    role: '测试开发实习生',
    summary: '把 AI、游戏 GM 能力与 QA 工作流接入可控的工程工具。在职期间参与 3 个项目。',
    stack: 'Python / FastAPI / Vue / Next.js / Redis / MongoDB / Agent / TeamCity',
    projects: [
      {
        name: '茯神Web（FushenWeb）',
        desc: '内网 QA 综合管理平台，覆盖日常监控、性能专项、测试工具、自动化等模块。',
        details: [
          '负责 9 个功能模块的开发与维护，涵盖报错开单、性能热力图、FastPatch 日志监控、RPC 协议信息、资产数据监控等',
          '独立开发开单数据仪表盘，包含 7 个 ECharts 图表组件，设计"一次请求全量拉取 + 前端 computed 切片"高性能数据流架构',
          '手写 GitHub 风格日历热力图（CalendarHeatmap），纯 Vue 3 + CSS Flex，ResizeObserver 响应式自适应',
          '热力图颜色映射采用百分位数分布代替线性 min-max，解决极值集中导致色阶失效',
          '从零搭建 FastPatch 热更日志监控页面和 RPC 协议信息页面',
          '封装一键开单功能，多模块复用',
        ],
        tech: 'Vue 3 / TypeScript / Element Plus / Pinia / Python Flask / Redis / ECharts',
      },
      {
        name: 'GMTool（Web GM 工具）',
        desc: '面向 QA 的内网 Web GM 指令工具，浏览器操作替代命令行。从零搭建完整项目。',
        details: [
          '设计 TCP 长连接 + Lua 注入的 GM 指令执行机制，支持 GM 指令、RPC GM、原生 Lua 三种执行模式',
          '实现与 FushenWeb 打通的 SSO 鉴权体系，用户无需二次登录',
          '设计 RedisSessionMiddleware 中间件，请求级自动管理 session',
          'MongoDB 数据建模：commands、market_combos、operation_history、users 四个集合',
        ],
        tech: 'Next.js 14 / React / Tailwind CSS / FastAPI / MongoDB / Redis / TCP',
      },
      {
        name: 'TaffyBot（QA 验收播报机器人）',
        desc: '剧情组自动化 QA 验收系统，AI 风险分析 + 群消息推送。从零设计并实现。',
        details: [
          '设计 6 步全自动流水线：拉取需求 → 查询工单 → 整理输入 → AI 风险分析 → 格式化报告 → 推送群组',
          '接入 glm-4-5 大模型进行风险分析（每条需求 100 字风险结论），设计 AI 降级策略',
          '双模板体系：周一高信息密度风险报告 / 周四轻量版预告报告',
          '每日 Bug 新增提醒子系统，BVT 验收值班提醒',
          '封装为 AI Skill，支持自然语言驱动',
        ],
        tech: 'Python / glm-4-5 / TeamCity / AI Agent / Skills',
      },
    ],
    highlights: [
      { label: 'CalendarHeatmap', detail: '纯 Vue 3 + CSS Flex 手写 GitHub 风格热力图，ResizeObserver 响应式' },
      { label: '仪表盘数据架构', detail: '一次请求全量拉取 + 前端 computed 切片，日期筛选零额外请求' },
      { label: '百分位数色阶', detail: '热力图色阶用百分位数分布，解决极值集中导致色阶失效' },
      { label: 'SSO 鉴权打通', detail: 'QAWEB_SESS 直接换取 session，RedisSessionMiddleware 请求级管理' },
      { label: 'AI 验收流水线', detail: '6 步全自动，AI 风险分析 + 降级策略，Skill 封装自然语言驱动' },
    ],
  },
  {
    code: 'EXP-02',
    date: '2025.08 — 2025.11',
    company: '之江实验室',
    shortCompany: '之江实验室',
    role: '深度学习实习生',
    summary: '从数据准备到分布式训练，参与 1B 规模大语言模型训练实践。',
    stack: 'Python / LLM / DeepSpeed / SFT / 分布式训练',
    projects: [
      {
        name: '大语言模型训练',
        desc: '参与 1B 参数规模 LLM 的全流程训练实践。',
        details: [
          '语料库整理与数据清洗，构建高质量训练数据集',
          'Tokenizer 调整与适配，优化分词效果',
          '本地部署 DeepSpeed 分布式训练环境',
          'SFT 监督微调实验与评估',
        ],
        tech: 'Python / DeepSpeed / SFT / Tokenizer',
      },
    ],
    highlights: [
      { label: '全流程实践', detail: '从数据→训练→微调完整参与，理解 LLM 训练管线各环节' },
      { label: '分布式训练', detail: 'DeepSpeed 环境搭建与配置，处理分布式训练中的通信与同步' },
    ],
  },
  {
    code: 'EXP-01',
    date: '2025.03 — 2025.07',
    company: '浙江华策影视股份有限公司',
    shortCompany: '华策影视',
    role: 'Python 实习生',
    summary: '参与短剧国际化 AI 处理管线与运营自动化工具开发。',
    stack: 'Python / Azure AI / FSM / 异步任务调度',
    projects: [
      {
        name: 'AI 处理管线',
        desc: '短剧国际化 AI 处理管线，将国内短剧高效转换为海外版本。',
        details: [
          '接入 Azure AI 相关服务，设计基于生产者-消费者模型和 FSM 的异步任务管线',
          '将国内短剧处理耗时降低 90% 以上',
          '开发交付便携化工具，提升运营部门效能',
          '开发群控自动化框架',
        ],
        tech: 'Python / Azure AI / FSM / 异步任务调度',
      },
    ],
    highlights: [
      { label: '效能提升', detail: '短剧处理耗时降低 90%+，从瓶颈环节变为流水线中最快的环节' },
      { label: '异步架构', detail: '生产者-消费者 + FSM 状态机设计，处理复杂异步任务编排' },
    ],
  },
]

export const experiences = experienceDossiers.map(({ code, date, company, role, summary, facts, stack }) => ({
  code, date, company, role, summary,
  facts: facts || [],
  stack,
}))

export const projects = [
  {
    id: 'gmtool',
    code: 'PRJ-01',
    title: 'GMTool',
    type: 'GAME QA INFRASTRUCTURE',
    statement: '让 QA 在浏览器中完成游戏客户端 GM 指令执行，替代分散的手动链路。',
    role: '从零搭建后端服务、鉴权、指令管理与执行链路。',
    mechanism: 'TCP 长连接 + Lua 注入；支持 GM 指令、RPC GM、原生 Lua 三种执行模式，并接入 FushenWeb SSO。',
    result: '提升测试、问题复现与验收效率。',
    stack: ['Next.js', 'FastAPI', 'MongoDB', 'Redis', 'TCP'],
    glyph: 'GM://EXEC',
  },
  {
    id: 'taffybot',
    code: 'PRJ-02',
    title: 'TaffyBot',
    type: 'AI QUALITY WORKFLOW',
    statement: '把需求拉取、工单聚合、风险分析、报告生成和群通知串成端到端自动化流程。',
    role: '独立设计 AI 辅助验收与风险分析工具。',
    mechanism: '将固定业务流程封装为可复用 Skill，覆盖意图解析、参数抽取、工具编排、结构化输出、异常兜底与人工复核。',
    result: '让大模型进入可控、可核对的真实 QA 验收场景。',
    stack: ['Python', 'GLM-4', 'Agent', 'Skills', 'TeamCity'],
    glyph: 'AI://VERIFY',
  },
  {
    id: 'map',
    code: 'PRJ-03',
    title: '中化 Map',
    type: 'REMOTE SENSING AI',
    statement: '从高分遥感影像中自动识别并提取指定地区的农作物地块。',
    role: '负责模型设计训练、后端任务调度与甲方需求对接。',
    mechanism: '以 Flask 协调模型推理服务与业务接口，持续推动功能迭代。',
    result: '形成模型推理与业务服务之间的完整工程链路。',
    stack: ['Python', 'Deep Learning', 'Flask', '遥感影像'],
    glyph: 'CV://BOUNDARY',
  },
]

export const chatReplies = {
  '他在雷火做了什么？': '在网易雷火实习期间，他主要做了三类工作：独立设计 TaffyBot AI 辅助验收工具；从零搭建 GMTool 内网 Web 工具；参与茯神 Web QA 综合管理平台的报错开单、日志监控、数据看板等模块。',
  '介绍一下 GMTool': 'GMTool 是面向 QA 的内网 Web GM 工具。他负责后端服务、鉴权、指令管理与执行链路，核心机制是 TCP 长连接加 Lua 注入，支持 GM 指令、RPC GM 和原生 Lua 三种模式，并接入了 FushenWeb SSO。',
  '他的 AI 工程经验？': '他的 AI 工程经验覆盖真实 QA 流程中的 Agent 与 Skills 落地，也参与过 1B 规模大模型的数据清洗、Tokenizer 调整、分布式训练和 SFT 微调。重点不是只调用模型，而是处理结构化输出、异常兜底与人工复核。',
}