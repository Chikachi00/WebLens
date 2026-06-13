# WebLens

[English](./README.en.md)

WebLens 是一个面向前端初学者和个人开发者的 Chrome 浏览器扩展。它在 Chrome Side Panel 中运行，可以对当前网页执行本地 UI、HTML 语义和可访问性检查，并帮助用户定位问题元素、查看原因、忽略误报、管理规则和导出报告。

当前版本：V0.2.0。项目不包含 AI、登录、云同步、数据库或后台服务。

## 当前功能

- Chrome Extension Manifest V3 扩展结构
- Chrome Side Panel 主界面
- 点击工具栏图标打开侧边栏
- 分析当前页面并展示检测结果
- 按严重、警告、提示筛选问题
- 点击结果后滚动并高亮页面元素
- 展示问题原因、修复建议和可复制代码示例
- 独立开关 8 条检测规则
- 页面级问题忽略
- 网站级问题忽略
- 忽略记录管理与恢复
- Markdown 报告导出
- JSON 报告导出
- 本地设置持久化
- 浅色和深色模式

## 检测规则

- 图片缺少 `alt` 属性
- 表单控件缺少可访问标签
- 标题层级跳跃
- 交互元素点击区域过小
- 页面横向溢出
- 按钮缺少可识别名称
- 链接缺少可识别名称
- HTML 文档缺少语言声明

## 项目截图

> 截图占位：V0.2 完成浏览器安装和页面分析后，可在此放置 Side Panel、设置面板、忽略列表和导出报告截图。请勿伪造截图。

## 技术栈

- Chrome Extension Manifest V3
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- Vitest
- Chrome Side Panel API
- `chrome.storage.local`

## 本地开发

```bash
npm install
npm run dev
```

开发模式用于调试 side panel 页面和前端代码。扩展完整加载建议使用构建后的 `dist` 目录。

## 构建

```bash
npm run build
```

构建产物会生成在 `dist/`，可直接作为 Chrome 已解压扩展加载。

## Chrome 手动安装

1. 打开 `chrome://extensions`
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择项目中的 `dist` 目录
5. 打开任意普通网页
6. 点击 WebLens 工具栏图标打开侧边栏
7. 点击“分析当前页面”

## 项目结构

```text
WebLens/
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── background/
│   ├── content/
│   ├── rules/
│   ├── shared/
│   ├── sidepanel/
│   └── styles/
├── sidepanel.html
├── package.json
├── vite.config.ts
└── eslint.config.js
```

## 隐私说明

- V0.2 不上传网页内容。
- 检测在用户浏览器本地执行。
- 不收集浏览历史。
- 不保存网页表单内容。
- 不访问未由用户主动分析的页面。
- 用户设置仅保存在 `chrome.storage.local`。
- 忽略记录只保存规则 ID、selector、忽略范围和目标页面或域名。
- 导出报告由用户主动触发。
- 报告不会自动上传。

## 当前限制

- 自动检测无法代替人工 UI 和无障碍测试。
- 一些问题可能存在误报。
- selector 在动态网页更新后可能失效。
- 忽略结果依赖 URL 和 selector 匹配。
- 暂不支持跨 iframe 完整检测。
- 暂不支持 Shadow DOM 深度检测。
- 暂不提供 AI 修复。
- 暂不自动修改网页代码。
- 报告不代表完整的无障碍合规认证。

## 后续计划

- 增加更多检测规则
- 增加真实浏览器端到端测试
- 改进 iframe 和 Shadow DOM 支持
- 增加可选的修复预览
- 后续再评估 AI 修复解释

## License

MIT
