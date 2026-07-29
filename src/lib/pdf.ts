import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Incident, TimelineEvent, Task } from "../types";

export async function generateIncidentReport(
  incident: Incident,
  timeline: TimelineEvent[],
  tasks: Task[]
) {
  const html = `
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 13px; margin-bottom: 16px; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; margin-right: 6px; }
        .badge-severity { background: #fef3c7; color: #92400e; }
        .badge-status { background: #dbeafe; color: #1e40af; }
        .section { margin-top: 20px; }
        .section h2 { font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
        .field { margin: 4px 0; font-size: 14px; }
        .field strong { display: inline-block; width: 100px; }
        ul { padding-left: 20px; }
        li { margin: 4px 0; font-size: 14px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(incident.title)}</h1>
      <div class="meta">Created: ${new Date(incident.createdAt).toLocaleDateString()} | ID: ${incident.id}</div>
      <span class="badge badge-severity">${incident.severity}</span>
      <span class="badge badge-status">${incident.status}</span>

      <div class="section">
        <h2>Details</h2>
        <div class="field"><strong>Category:</strong> ${incident.category}</div>
        <div class="field"><strong>Date:</strong> ${incident.date}</div>
        <div class="field"><strong>Reporter:</strong> ${escapeHtml(incident.reporter)}</div>
        <div class="field"><strong>Owner:</strong> ${escapeHtml(incident.owner || "Unassigned")}</div>
        <div class="field"><strong>Description:</strong> ${escapeHtml(incident.description || "N/A")}</div>
      </div>

      <div class="section">
        <h2>Timeline</h2>
        <ul>
          ${timeline.map(t => `<li><strong>${escapeHtml(t.action)}</strong> — ${escapeHtml(t.description)} <em>(${new Date(t.createdAt).toLocaleString()})</em></li>`).join("")}
        </ul>
      </div>

      <div class="section">
        <h2>Tasks</h2>
        <ul>
          ${tasks.length === 0 ? "<li>No tasks</li>" : tasks.map(t => `<li>${t.completed ? "✅" : "⬜"} ${escapeHtml(t.title)}</li>`).join("")}
        </ul>
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePDF(uri: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
