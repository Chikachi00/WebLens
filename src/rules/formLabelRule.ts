import { createIssueId, getElementTag } from "../content/domUtils";
import { hasProgrammaticLabel, isLabelableFormControl } from "../content/formLabels";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

export const formLabelRule: AuditRule = {
  id: "form-label",
  title: "表单控件缺少可访问标签",
  category: "accessibility",
  severity: "critical",
  supportsPreview: false,
  description: "输入控件需要可被辅助技术识别的标签。",
  check: () => {
    return Array.from(document.querySelectorAll("input, textarea, select"))
      .filter(isLabelableFormControl)
      .filter((control) => !hasProgrammaticLabel(control))
      .map<AuditIssue>((control, index) => {
        const selector = createStableSelector(control);

        return {
          id: createIssueId("form-label", selector, index),
          ruleId: "form-label",
          title: "表单控件缺少标签",
          severity: "critical",
          description: "该表单控件没有 label、aria-label 或 aria-labelledby，用户可能无法理解它的用途。",
          recommendation: "使用 label 的 for 属性关联控件，或在确实无法显示文字时添加 aria-label。",
          selector,
          elementTag: getElementTag(control),
          codeSuggestion: '<label for="email">邮箱</label>\n<input id="email" type="email">'
        };
      });
  }
};
