# Career Companion (全栈职场精英求职私域大盘 / AI求职助手) 🚀

<div align="center">
  <img src="https://img.shields.io/badge/AI%20Agent-DeepSeek%20API-blue?style=for-the-badge&logo=openai" alt="AI Agent DeepSeek API求职" />
  <img src="https://img.shields.io/badge/Chrome%20Extension-Boss%E7%9B%B4%E8%81%98%E8%87%AA%E5%8A%A8%E5%8C%96-success?style=for-the-badge&logo=googlechrome" alt="Chrome Extension Boss直聘自动化爬虫" />
  <img src="https://img.shields.io/badge/React%20+%20Vite-Tailwind%20CSS-61DAFB?style=for-the-badge&logo=react" alt="React Vite Tailwind CSS 前端框架" />
  <img src="https://img.shields.io/badge/AI-Resume%20&%20Interview-purple?style=for-the-badge" alt="AI简历诊断 面试辅导" />
</div>
<br/>

> 基于 **Vite + React + DeepSeek API** 与**原生 Chrome Web Scraper 扩展**构建的硬核职场精英反海投作战中枢，您的私人 **AI 面试辅导官**与**简历优化辅助库**。

这是一个区别于市面上所有通用求职工具的个人主权系统。结合**大模型赋能、爬虫助手、自动化投递**等前沿技术，本项目经过极简科技风 (Light Minimalist Tech) 深度改造，并自建跨域通信插件，专为**高阶白领、资深业务骨干、产品/研发大牛**打造。从此告别无效的海投，建立你自己的私域高能求职漏斗！

## ✨ 核心模块与特色 (Core Features)

本项目通过五大核心模块构建严密的求职流水线：

1. 🩺 **简历问诊室 (AI Resume Reviewer) `ResumeDoctor.jsx`**
   - **全景 X 光透视**：支持 10MB 已内私域 PDF 简历纯本地直接解析。
   - 提取信息经加密链路发送给 AI 总监（铁血 HR 视角），秒出简历雷区与优化建议。
   - **脱水神器**：针对单段虚浮无力经历，提供“痛点-Action-数据化结果”的三段式满分重构。

2. ⚡ **岗位雷达 (Boss直聘自动抓取连携) `JobAssessor.jsx`**
   - 搭载了**私有化的 Boss 直聘拦截抓取爬虫插件**（`extension/` 目录）。
   - 在平台正常浏览时，通过悬浮的 `✨ 发送至本地雷达` 按钮一键绕过反爬机制，抓取猎物数据发送至本地大盘。
   - **自动化零点按闭环**：收到数据自动打穿分析，若判定为潜力客户，系统会自动喷涌并组合“高转化狙击破冰语 (Icebreaker)”。

3. 🎪 **高压模拟面试场 (AI Interview Coach) `InterviewCoach.jsx`**
   - 包含基于 Web Speech API 的全自动语音双向交互。
   - 引入极度毒舌苛刻的【互联网 P9 总监】人设，每轮对答动态更新你的“业务深度、逻辑闭环、协作抗压”实时雷达打分图。

4. ⚓ **PMO 成长陪伴 (Career Planning) `CareerPath.jsx`**
   - 对抗人性的妥协与懒惰，采用强压 PMO 树状进度追踪。
   - 自动将庞大目标拆解为执行任务列阵，充当你的 AI 职场打乱教练。

5. 📊 **私域求职漏斗看板 (Job Pipeline Dashboard) `Dashboard.jsx`**
   - 将所有高分目标 JD 归档，采用极简干净的 Kanban (看板)，动态追踪每一个岗位的破冰与突围周期。

---

## 🛠️ 技术栈 (Tech Stack)

* **客户端引擎**：React 18 + Vite 构建全栈级交互
* **UI 骨架**：Tailwind CSS (自建 V2 极简科技冷灰风样式底座) + Lucide React (图标库)
* **AI 大模型引擎**：DeepSeek API 集成
* **浏览器拓展**：Chrome Manifest V3 原生插件开发 (Web Scraping Extension)
* **PDF 解析**：pdfjs-dist 纯前端无后端文本提取方案

---

## 🚀 启动与部署 (Quick Start)

### 前置准备 
1. 克隆本项目：`git clone https://github.com/litbooby-a11y/career-companion.git`
2. 进入根目录：`cd career-companion-app`
3. 安装依赖：`npm install` 或 `yarn`
4. 创建环境变量文件：在根目录创建 `.env`，填入您的 API 密钥：
   ```env
   VITE_DEEPSEEK_API_KEY=sk-your-deepseek-key-here
   ```

### 运行本站
```bash
npm run dev
```
将自动运行在 `localhost:5173`。

### 插件挂载 (Boss 直聘抓取自动化)
要解锁最硬核的自动化抓取功能：
1. 打开浏览器：输入 `chrome://extensions/`
2. 开启右上角 **“开发者模式”**。
3. 点击 **“加载已解压的扩展程序”**。
4. 选择本项目根目录下的 `/extension` 文件夹即可完装出击！

---

## 📝 更新日志 (Changelog)

**v2.0 (最新)**
- **UI 巨变**：大刀阔斧重构至浅白色高雅排版底座，提升白领环境专业感与视觉聚焦。
- **自动抓取投递闭环**：独立开发 `career-companion-ext` 插件系统，彻底融合线上找工作（公域）与本地智能打分（私域），通过跨页面事件 `window.dispatchEvent` 实现 1 秒全自动反应。

---

## 🔍 Tags (搜索关键词)
`AI求职` `AI Agent` `AI 面试辅导` `简历优化` `Boss直聘自动化` `爬虫助手` `求职漏斗` `Web Scraping` `DeepSeek` `React Vite` `Chrome Extension` `AI Resume Reviewer` `Career Planning` `职场工具` `大模型应用实践`

---
*Powered by Deepmind AI Agentic Coding // Designed for top 1% professionals.*
