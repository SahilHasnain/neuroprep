import type { Template } from "../../types";

export const mockTemplates: Template[] = [
  {
    id: "1",
    category: "Data Breach",
    title: "Data Breach Report",
    defaultDescription:
      "A data breach involving personal data has been identified. Immediate assessment and notification may be required.",
    riskGuide: "Consider risk to rights and freedoms of individuals. Assess likelihood and severity.",
    checklistItems: [
      "Assess risk",
      "Notify manager",
      "Contact affected person",
      "Record evidence",
      "Close report",
    ],
    requiredEvidence: ["Breach details", "Affected data", "Systems involved", "Timeline of events"],
  },
  {
    id: "2",
    category: "Lost Device",
    title: "Lost / Stolen Device Report",
    defaultDescription:
      "A device containing personal data has been lost or stolen. Immediate action required to secure data.",
    riskGuide: "Assess what data was on the device and whether it was encrypted.",
    checklistItems: [
      "Confirm device details",
      "Check last backup",
      "Notify IT security",
      "Remote wipe if possible",
      "Assess data exposure",
    ],
    requiredEvidence: ["Device type", "Data at risk", "Encryption status", "Last known location"],
  },
  {
    id: "3",
    category: "Unauthorized Access",
    title: "Unauthorized Access Report",
    defaultDescription:
      "Unauthorized access to personal data has been detected. Access must be investigated and secured.",
    riskGuide: "Identify the scope of access and whether any data was exfiltrated.",
    checklistItems: [
      "Identify source of access",
      "Revoke access",
      "Review logs",
      "Notify data owner",
      "Update access controls",
    ],
    requiredEvidence: [
      "Access logs",
      "Systems affected",
      "Time of incident",
      "User accounts involved",
    ],
  },
  {
    id: "4",
    category: "Email Sent Wrong Person",
    title: "Email Mis-delivery Report",
    defaultDescription:
      "An email containing personal data was sent to an incorrect recipient.",
    riskGuide: "Assess the sensitivity of data sent and whether the recipient can be contacted.",
    checklistItems: [
      "Request email recall",
      "Contact recipient",
      "Assess data in email",
      "Notify manager",
      "Document incident",
    ],
    requiredEvidence: ["Email content", "Recipient details", "Time sent", "Recall status"],
  },
  {
    id: "5",
    category: "SAR",
    title: "Subject Access Request",
    defaultDescription:
      "A Subject Access Request has been received. Response must be provided within the statutory timeframe.",
    riskGuide: "Verify identity before disclosing any data.",
    checklistItems: [
      "Verify requester identity",
      "Locate requested data",
      "Review for exemptions",
      "Prepare response",
      "Send within deadline",
    ],
    requiredEvidence: [
      "Request letter",
      "ID verification",
      "Data located",
      "Response sent",
    ],
  },
];
