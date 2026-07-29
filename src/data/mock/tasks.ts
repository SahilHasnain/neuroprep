import type { Task } from "../../types";

export const mockTasks: Task[] = [
  {
    id: "tk1",
    incidentId: "1",
    title: "Contact the recipient and request deletion",
    completed: false,
    dueDate: "2026-07-29",
    createdAt: "2026-07-28T09:30:00Z",
  },
  {
    id: "tk2",
    incidentId: "1",
    title: "Notify data protection officer",
    completed: true,
    createdAt: "2026-07-28T09:30:00Z",
  },
  {
    id: "tk3",
    incidentId: "1",
    title: "Document the incident in the register",
    completed: false,
    createdAt: "2026-07-28T09:30:00Z",
  },
  {
    id: "tk4",
    incidentId: "2",
    title: "Check device encryption status",
    completed: true,
    createdAt: "2026-07-25T14:15:00Z",
  },
  {
    id: "tk5",
    incidentId: "2",
    title: "Remote wipe device",
    completed: true,
    createdAt: "2026-07-25T14:15:00Z",
  },
  {
    id: "tk6",
    incidentId: "2",
    title: "Assess data exposure risk",
    completed: false,
    dueDate: "2026-07-30",
    createdAt: "2026-07-25T14:15:00Z",
  },
  {
    id: "tk7",
    incidentId: "4",
    title: "Verify requester identity",
    completed: false,
    dueDate: "2026-07-21",
    createdAt: "2026-07-18T11:30:00Z",
  },
  {
    id: "tk8",
    incidentId: "4",
    title: "Locate all personal data",
    completed: false,
    dueDate: "2026-08-01",
    createdAt: "2026-07-18T11:30:00Z",
  },
];
