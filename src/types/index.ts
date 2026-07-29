export interface Incident {
  id: string;
  title: string;
  date: string;
  category: IncidentCategory;
  reporter: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: IncidentStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type IncidentStatus = "open" | "investigating" | "pending" | "closed" | "archived";

export type IncidentCategory =
  | "Data Breach"
  | "Lost Device"
  | "Unauthorized Access"
  | "Email Sent Wrong Person"
  | "SAR"
  | "FOI"
  | "Complaint"
  | "Security Incident";

export interface TimelineEvent {
  id: string;
  incidentId: string;
  action: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: string;
  incidentId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  incidentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface Template {
  id: string;
  category: IncidentCategory;
  title: string;
  defaultDescription: string;
  riskGuide: string;
  checklistItems: string[];
  requiredEvidence: string[];
}

export type AppMode = "demo" | "appwrite";
