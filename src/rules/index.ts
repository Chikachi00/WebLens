import { buttonNameRule } from "./buttonNameRule";
import { documentLanguageRule } from "./documentLanguageRule";
import { formLabelRule } from "./formLabelRule";
import { headingOrderRule } from "./headingOrderRule";
import { imageAltRule } from "./imageAltRule";
import { linkNameRule } from "./linkNameRule";
import { overflowRule } from "./overflowRule";
import { touchTargetRule } from "./touchTargetRule";
import type { AuditRule } from "../shared/types";

export const auditRules: AuditRule[] = [
  imageAltRule,
  formLabelRule,
  headingOrderRule,
  touchTargetRule,
  overflowRule,
  buttonNameRule,
  linkNameRule,
  documentLanguageRule
];
