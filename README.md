# WebLens

[English](./README.en.md)

WebLens 是一个面向前端初学者和个人开发者的 Chrome 浏览器扩展。它在 Chrome Side Panel 中运行，可以对当前网页执行本地 UI、HTML 语义和可访问性检查，并帮助用户定位问题元素、查看原因和复制基础修复示例。

V0.1 不包含 AI、登录、云同步、数据库或后台服务。

## 当前功能

- Chrome Extension Manifest V3 扩展结构
- Chrome Side Panel 主界面
- 点击工具栏图标打开侧边栏
- 分析当前页面并展示检测结果
- 按严重、警告、提示筛选问题
- 点击结果后滚动并高亮页面元素
- 展示问题原因、修复建议和可复制代码示例
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

> 截图占位：V0.1 完成浏览器安装和页面分析后，可在此放置 Side Panel 界面截图与元素高亮截图。

## 技术栈

- Chrome Extension Manifest V3
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- Vitest
- Chrome Side Panel API

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

- V0.1 不上传网页内容。
- 检测在用户浏览器本地执行。
- 不收集浏览历史。
- 不保存网页表单内容。
- 不访问未由用户主动分析的页面。

## 当前限制

- 自动检测无法代替人工 UI 和无障碍测试。
- 一些问题可能存在误报。
- 暂不支持跨 iframe 完整检测。
- 暂不支持 Shadow DOM 深度检测。
- 暂不提供 AI 修复。
- 暂不自动修改网页代码。

## 后续计划

- 增加规则配置和忽略列表
- 增加结果导出能力
- 增加更多布局、可访问性和语义规则
- 改进 iframe 和 Shadow DOM 场景支持
- 增加更完整的浏览器端端到端验证

## License

MIT
