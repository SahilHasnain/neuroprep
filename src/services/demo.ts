import { mockIncidents } from "../data/mock/incidents";
import { mockTimeline } from "../data/mock/timeline";
import { mockTasks } from "../data/mock/tasks";
import { mockTemplates } from "../data/mock/templates";
import type { Incident, TimelineEvent, Task, Template } from "../types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const demoService = {
  async getIncidents(): Promise<Incident[]> {
    await delay(200);
    return [...mockIncidents];
  },

  async getIncident(id: string): Promise<Incident | undefined> {
    await delay(150);
    return mockIncidents.find((i) => i.id === id);
  },

  async createIncident(data: Omit<Incident, "id" | "createdAt" | "updatedAt">): Promise<Incident> {
    await delay(300);
    const incident: Incident = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockIncidents.unshift(incident);
    return incident;
  },

  async updateIncident(id: string, data: Partial<Incident>): Promise<Incident | undefined> {
    await delay(200);
    const idx = mockIncidents.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    mockIncidents[idx] = { ...mockIncidents[idx], ...data, updatedAt: new Date().toISOString() };
    return mockIncidents[idx];
  },

  async getTimeline(incidentId: string): Promise<TimelineEvent[]> {
    await delay(150);
    return mockTimeline
      .filter((t) => t.incidentId === incidentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async addTimelineEvent(
    data: Omit<TimelineEvent, "id" | "createdAt">
  ): Promise<TimelineEvent> {
    await delay(200);
    const event: TimelineEvent = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    mockTimeline.push(event);
    return event;
  },

  async getTasks(incidentId: string): Promise<Task[]> {
    await delay(150);
    return mockTasks.filter((t) => t.incidentId === incidentId);
  },

  async addTask(data: Omit<Task, "id" | "createdAt">): Promise<Task> {
    await delay(200);
    const task: Task = { ...data, id: String(Date.now()), createdAt: new Date().toISOString() };
    mockTasks.push(task);
    return task;
  },

  async toggleTask(id: string): Promise<Task | undefined> {
    await delay(150);
    const task = mockTasks.find((t) => t.id === id);
    if (task) task.completed = !task.completed;
    return task;
  },

  async getChecklistItems(incidentId: string): Promise<{ id: string; label: string; completed: boolean }[]> {
    await delay(100);
    return [];
  },

  async addChecklistItem(data: { incidentId: string; label: string; completed: boolean }): Promise<any> {
    await delay(150);
    const id = String(Date.now());
    return { id, ...data };
  },

  async toggleChecklistItem(id: string): Promise<any> {
    await delay(100);
    return { id, label: "", completed: true };
  },

  async getTemplates(): Promise<Template[]> {
    await delay(150);
    return [...mockTemplates];
  },
};
