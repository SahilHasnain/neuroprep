import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from "react-native-appwrite";
import type { Incident, TimelineEvent, Task, Template } from "../types";

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform("com.complydesk.app");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

let _teamId: string | null = null;

export function setTeamId(id: string) { _teamId = id; }
export function getTeamId(): string | null { return _teamId; }

export const DATABASE_ID = "complydesk";

export const COLLECTIONS = {
  incidents: "incidents",
  timelineEvents: "timeline_events",
  tasks: "tasks",
  templates: "templates",
  checklistItems: "checklist_items",
  profiles: "profiles",
} as const;

export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  teamId: string;
  role: "admin" | "member" | "viewer";
  tier: "free" | "premium";
}

export const BUCKET_ID = "attachments";

function toIncident(doc: any): Incident {
  return {
    id: doc.$id,
    title: doc.title,
    date: doc.date,
    category: doc.category,
    reporter: doc.reporter,
    description: doc.description ?? "",
    severity: doc.severity,
    status: doc.status,
    owner: doc.owner ?? "",
    createdAt: doc.$createdAt,
    updatedAt: doc.$updatedAt,
  };
}

function toTimelineEvent(doc: any): TimelineEvent {
  return {
    id: doc.$id,
    incidentId: doc.incidentId,
    action: doc.action,
    description: doc.description ?? "",
    createdAt: doc.$createdAt,
  };
}

function toTask(doc: any): Task {
  return {
    id: doc.$id,
    incidentId: doc.incidentId,
    title: doc.title,
    completed: doc.completed,
    dueDate: doc.dueDate ?? undefined,
    createdAt: doc.$createdAt,
  };
}

function toTemplate(doc: any): Template {
  return {
    id: doc.$id,
    category: doc.category,
    title: doc.title,
    defaultDescription: doc.defaultDescription ?? "",
    riskGuide: doc.riskGuide ?? "",
    checklistItems: doc.checklistItems ? JSON.parse(doc.checklistItems) : [],
    requiredEvidence: doc.requiredEvidence ? JSON.parse(doc.requiredEvidence) : [],
  };
}

export const appwriteService = {
  withTeam(data: Record<string, any> = {}): Record<string, any> {
    return _teamId ? { ...data, teamId: _teamId } : data;
  },

  teamQuery(queries: string[] = []): string[] {
    return _teamId ? [...queries, Query.equal("teamId", _teamId)] : queries;
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.incidents, this.teamQuery());
    return res.documents.map(toIncident);
  },

  async getIncident(id: string): Promise<Incident | undefined> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.incidents, id);
      if (_teamId && doc.teamId !== _teamId) return undefined;
      return toIncident(doc);
    } catch {
      return undefined;
    }
  },

  async createIncident(data: Omit<Incident, "id" | "createdAt" | "updatedAt">): Promise<Incident> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.incidents,
      ID.unique(),
      this.withTeam(data),
      [Permission.read(Role.users()), Permission.write(Role.users())]
    );
    return toIncident(doc);
  },

  async updateIncident(id: string, data: Partial<Incident>): Promise<Incident | undefined> {
    try {
      const doc = await databases.updateDocument(DATABASE_ID, COLLECTIONS.incidents, id, data);
      return toIncident(doc);
    } catch {
      return undefined;
    }
  },

  async deleteIncident(id: string): Promise<void> {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.incidents, id);
  },

  async getTimeline(incidentId: string): Promise<TimelineEvent[]> {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.timelineEvents,
      this.teamQuery([Query.equal("incidentId", incidentId), Query.orderAsc("$createdAt")])
    );
    return res.documents.map(toTimelineEvent);
  },

  async addTimelineEvent(
    data: Omit<TimelineEvent, "id" | "createdAt">
  ): Promise<TimelineEvent> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.timelineEvents,
      ID.unique(),
      this.withTeam(data),
      [Permission.read(Role.users()), Permission.write(Role.users())]
    );
    return toTimelineEvent(doc);
  },

  async getTasks(incidentId: string): Promise<Task[]> {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.tasks,
      this.teamQuery([Query.equal("incidentId", incidentId)])
    );
    return res.documents.map(toTask);
  },

  async addTask(data: Omit<Task, "id" | "createdAt">): Promise<Task> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.tasks,
      ID.unique(),
      this.withTeam(data),
      [Permission.read(Role.users()), Permission.write(Role.users())]
    );
    return toTask(doc);
  },

  async toggleTask(id: string): Promise<Task | undefined> {
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.tasks, id);
      if (_teamId && doc.teamId !== _teamId) return undefined;
      const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.tasks, id, {
        completed: !doc.completed,
      });
      return toTask(updated);
    } catch {
      return undefined;
    }
  },

  async getChecklistItems(incidentId: string): Promise<{ id: string; label: string; completed: boolean }[]> {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.checklistItems,
      this.teamQuery([Query.equal("incidentId", incidentId)])
    );
    return res.documents.map((doc: any) => ({
      id: doc.$id,
      label: doc.label,
      completed: doc.completed,
    }));
  },

  async addChecklistItem(data: { incidentId: string; label: string; completed: boolean }): Promise<any> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.checklistItems,
      ID.unique(),
      this.withTeam(data),
      [Permission.read(Role.users()), Permission.write(Role.users())]
    );
    return { id: doc.$id, label: doc.label, completed: doc.completed };
  },

  async toggleChecklistItem(id: string): Promise<any> {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.checklistItems, id);
    if (_teamId && doc.teamId !== _teamId) return undefined;
    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.checklistItems, id, {
      completed: !doc.completed,
    });
    return { id: updated.$id, label: updated.label, completed: updated.completed };
  },

  async getTemplates(): Promise<Template[]> {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.templates, this.teamQuery());
    return res.documents.map(toTemplate);
  },

  async uploadFile(incidentId: string, file: any): Promise<string> {
    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file);
    const url = storage.getFileView(BUCKET_ID, uploaded.$id);
    return url.toString();
  },

  subscribeToIncidents(callback: (payload: any) => void): () => void {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.incidents}.documents`;
    return client.subscribe(channel, callback);
  },

  async getFiles(incidentId: string): Promise<any[]> {
    const res = await storage.listFiles(BUCKET_ID);
    return res.files;
  },

  async deleteFile(fileId: string): Promise<void> {
    await storage.deleteFile(BUCKET_ID, fileId);
  },

  async createProfile(userId: string, name: string, email: string, teamId: string): Promise<Profile> {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.profiles,
      ID.unique(),
      { userId, name, email, teamId, role: "admin", tier: "free" },
      [Permission.read(Role.users()), Permission.write(Role.users())]
    );
    return { id: doc.$id, userId, name, email, teamId, role: "admin", tier: "free" };
  },

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles, [
        Query.equal("userId", userId),
      ]);
      if (res.documents.length === 0) return undefined;
      const d = res.documents[0];
      return { id: d.$id, userId: d.userId, name: d.name, email: d.email, teamId: d.teamId, role: d.role, tier: d.tier };
    } catch { return undefined; }
  },

  async getTeamMembers(): Promise<Profile[]> {
    if (!_teamId) return [];
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles, [
      Query.equal("teamId", _teamId),
    ]);
    return res.documents.map((d: any) => ({ id: d.$id, userId: d.userId, name: d.name, email: d.email, teamId: d.teamId, role: d.role, tier: d.tier }));
  },
};
