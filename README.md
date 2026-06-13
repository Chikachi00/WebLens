# WebLens

[![CI](https://github.com/Chikachi00/WebLens/actions/workflows/ci.yml/badge.svg)](https://github.com/Chikachi00/WebLens/actions/workflows/ci.yml)

[English](./README.en.md)

WebLens 是一个面向前端初学者和个人开发者的 Chrome 浏览器扩展。它运行在 Chrome Side Panel 中，对当前网页执行本地 UI、HTML 语义和可访问性检测，并支持定位元素、忽略误报、开关规则、导出报告和临时预览安全的推荐修复。

当前版本：V0.4.0。项目不包含 AI、用户登录、云同步、数据库或后台服务。

## 当前功能

- Chrome Extension Manifest V3 扩展结构
- Chrome Side Panel 主界面
- 8 条本地检测规则
- 规则独立开关和 `chrome.storage.local` 持久化
- 页面级和网站级问题忽略
- 忽略记录管理与恢复
- Markdown / JSON 报告导出
- 元素定位与高亮
- 修复建议和代码复制
- 临时修复预览、单项撤销和全部撤销
- 检测结果按规则分组展示
- 检测依据、测量数据、reasonCode 和置信度
- fixtures 测试页面、Vitest 单元测试和 Playwright 浏览器测试
- GitHub Actions CI 和可安装 ZIP 打包

## 检测规则

- 图片缺少 `alt` 属性
- 表单控件缺少可访问标签
- 标题层级跳跃
- 目标尺寸或间距不足
- 页面横向溢出
- 按钮缺少可识别名称
- 链接缺少可识别名称
- HTML 文档缺少语言声明

## V0.4 准确率改进

- 点击目标不再使用固定 40px 阈值。
- 24 × 24 CSS px 是基础候选判断，只有在尺寸不足且相邻目标间距也不足时才报告 warning。
- 44 × 44px 仅作为触控或窄屏场景的舒适度建议，显示为 info，不称为 WCAG 违规。
- 普通段落内的行内文本链接默认使用例外处理。
- 小目标如果有足够间距，不产生基础 warning。
- 横向溢出同时检查 `html`、`body`、`window.innerWidth` 和 `visualViewport`。
- 横向溢出候选元素会按溢出量排序、去重，并跳过合理局部横向滚动容器内部元素。

间距检测属于几何近似，置信度不是合规等级。WebLens 的报告只能反映检测时页面状态，不能代表完整 WCAG 合规认证。

## 修复预览

修复预览只在当前浏览器页面中临时生效，不会修改网站源代码。刷新页面、关闭标签页或撤销预览后，修改会消失。

当前支持预览的规则：

- 目标尺寸或间距不足：临时应用 `min-width` / `min-height`
- HTML 缺少语言声明：临时设置 `lang`
- 图片缺少 alt：临时添加占位 alt，或设置装饰性空 alt
- 按钮缺少可识别名称：临时添加 `aria-label`
- 链接缺少可识别名称：临时添加 `aria-label`

当前不支持预览的规则：

- 表单控件缺少标签
- 标题层级跳跃
- 页面横向溢出

这些问题通常需要理解页面结构、创建节点或定位布局根因，不适合机械预览。

## 项目截图

> 截图占位：请在真实安装并运行 V0.4 后添加 Side Panel、分组结果、检测依据、单项修复预览、全局预览状态条、修改前后对比、设置面板、导出报告和 fixtures 页面截图。不要伪造截图。

## 技术栈

- Chrome Extension Manifest V3
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- Vitest
- Playwright
- Chrome Side Panel API
- `chrome.storage.local`

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会生成在 `dist/`，可直接作为 Chrome 已解压扩展加载。

## 测试页面

```bash
npm run fixtures
```

打开 `http://127.0.0.1:4174/clean.html`，或访问 `touch-targets.html`、`overflow.html`、`accessibility.html`、`mixed.html`。

## 测试

```bash
npm run lint
npm run test
npm run build
npm run test:browser
```

## 打包

```bash
npm run package
```

生成文件：`release/weblens-v0.4.0.zip`。ZIP 解压后根目录直接包含 `manifest.json`、`sidepanel.html`、`assets/` 和 `icons/`。

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
public/              Chrome manifest 和图标
src/background/      service worker
src/content/         content script、审计引擎、高亮和预览管理
src/rules/           独立检测规则
src/shared/          类型、设置、URL、导出和规则元数据
src/sidepanel/       React Side Panel UI
fixtures/            可重复测试网页
tests/browser/       Playwright 浏览器集成测试
scripts/             发布打包脚本
```

## 隐私与安全

- V0.4 不上传网页内容。
- 检测和预览都在用户当前标签页本地执行。
- 不收集浏览历史。
- 不保存用户表单值。
- 不访问未由用户主动分析的页面。
- 用户设置仅保存在 `chrome.storage.local`。
- 忽略记录只保存规则 ID、selector、忽略范围和目标页面或域名。
- 导出报告由用户主动触发，不会自动上传。
- 不执行任意网页脚本。
- 预览只允许白名单中的样式和属性。
- 预览结果不代表源码已被正式修复。

## 当前限制

- 自动检测无法代替人工 UI 和无障碍测试。
- 一些真实页面仍可能存在误报。
- 间距检测是几何近似结果。
- 置信度不是合规等级。
- Side Panel 会缩小网页可用视口，因此可能暴露响应式布局问题。
- selector 在动态网页更新后可能失效。
- 忽略结果依赖 URL 和 selector 匹配。
- 动态框架重新渲染可能使预览失效。
- 预览不会修改源代码。
- 占位 alt 或 aria-label 必须由开发者替换。
- 暂不支持跨 iframe 深度扫描或预览。
- 暂不支持 Shadow DOM 深度扫描或预览。
- 暂不提供 AI 修复。
- 导出的报告仅反映检测时页面状态，不代表完整无障碍合规认证。

## 后续计划

- 增加更多检测规则
- 增加真实浏览器端到端测试
- 改进 iframe 和 Shadow DOM 支持
- 增加可选的修复预览
- 后续再评估 AI 修复解释

## License

MIT
