import type { AuditSeverity } from "./types";

export interface RuleMetadata {
  id: string;
  title: string;
  description: string;
  severity: AuditSeverity;
}

export const RULE_METADATA: RuleMetadata[] = [
  {
    id: "image-alt",
    title: "图片缺少 alt",
    description: "检测缺少 alt 属性的图片。",
    severity: "warning"
  },
  {
    id: "form-label",
    title: "表单控件缺少标签",
    description: "检测 input、textarea、select 是否具有可访问标签。",
    severity: "critical"
  },
  {
    id: "heading-order",
    title: "标题层级跳跃",
    description: "检测 H1 到 H6 是否出现向下跳级。",
    severity: "warning"
  },
  {
    id: "touch-target",
    title: "目标尺寸或间距不足",
    description: "检测按钮、链接等交互目标是否过小、过近，或在触控场景下不够舒适。",
    severity: "info"
  },
  {
    id: "horizontal-overflow",
    title: "页面横向溢出",
    description: "检测页面是否出现意外横向滚动，并列出可疑根因元素。",
    severity: "warning"
  },
  {
    id: "button-name",
    title: "按钮缺少可识别名称",
    description: "检测按钮是否有可见文本或可访问名称。",
    severity: "critical"
  },
  {
    id: "link-name",
    title: "链接缺少可识别名称",
    description: "检测链接是否有可见文本或可访问名称。",
    severity: "warning"
  },
  {
    id: "document-language",
    title: "HTML 缺少语言声明",
    description: "检测 html 元素是否设置 lang 属性。",
    severity: "info"
  }
];

export const ALL_RULE_IDS = RULE_METADATA.map((rule) => rule.id);

export function getRuleTitle(ruleId: string): string {
  return RULE_METADATA.find((rule) => rule.id === ruleId)?.title ?? ruleId;
}
