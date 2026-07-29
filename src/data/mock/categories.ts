import type { IncidentCategory } from "../../types";

export const categories: IncidentCategory[] = [
  "Data Breach",
  "Lost Device",
  "Unauthorized Access",
  "Email Sent Wrong Person",
  "SAR",
  "FOI",
  "Complaint",
  "Security Incident",
];

export const categoryChecklists: Record<IncidentCategory, string[]> = {
  "Data Breach": [
    "Assess risk",
    "Notify manager",
    "Contact affected person",
    "Record evidence",
    "Close report",
  ],
  "Lost Device": [
    "Confirm device details",
    "Check last backup",
    "Notify IT security",
    "Remote wipe if possible",
    "Assess data exposure",
  ],
  "Unauthorized Access": [
    "Identify source of access",
    "Revoke access",
    "Review logs",
    "Notify data owner",
    "Update access controls",
  ],
  "Email Sent Wrong Person": [
    "Request email recall",
    "Contact recipient",
    "Assess data in email",
    "Notify manager",
    "Document incident",
  ],
  SAR: [
    "Verify requester identity",
    "Locate requested data",
    "Review for exemptions",
    "Prepare response",
    "Send within deadline",
  ],
  FOI: [
    "Log request",
    "Search records",
    "Apply exemptions",
    "Prepare response",
    "Send within deadline",
  ],
  Complaint: [
    "Acknowledge receipt",
    "Investigate issue",
    "Prepare response",
    "Review by manager",
    "Send final response",
  ],
  "Security Incident": [
    "Isolate affected systems",
    "Assess scope",
    "Contain threat",
    "Document findings",
    "Implement fix",
  ],
};
