require("dotenv").config({ path: ".env.local" });
const { Client, Databases, Storage, Permission, Role } = require("node-appwrite");

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing env variables. Check .env.local");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const storage = new Storage(client);

async function run() {
  // ── Database ──
  try {
    console.log("Creating database: complydesk");
    const db = await databases.create("complydesk", "complyDesk");
    console.log(`  OK  ${db.$id}`);
  } catch (e) {
    console.log(`  SKIP (${e.message})`);
  }

  // ── Collections ──
  const collections = [
    {
      id: "incidents",
      name: "Incidents",
      attributes: [
        { type: "string", key: "title", size: 255, required: true },
        { type: "string", key: "date", size: 20, required: true },
        {
          type: "enum",
          key: "category",
          elements: [
            "Data Breach", "Lost Device", "Unauthorized Access",
            "Email Sent Wrong Person", "SAR", "FOI", "Complaint",
            "Security Incident",
          ],
          required: true,
        },
        { type: "string", key: "reporter", size: 255, required: true },
        { type: "string", key: "description", size: 4096, required: false },
        {
          type: "enum",
          key: "severity",
          elements: ["low", "medium", "high", "critical"],
          required: true,
        },
        {
          type: "enum",
          key: "status",
          elements: ["open", "investigating", "pending", "closed", "archived"],
          required: true,
        },
        { type: "string", key: "owner", size: 255, required: false },
      ],
    },
    {
      id: "timeline_events",
      name: "Timeline Events",
      attributes: [
        { type: "string", key: "incidentId", size: 255, required: true },
        { type: "string", key: "action", size: 255, required: true },
        { type: "string", key: "description", size: 1024, required: false },
      ],
    },
    {
      id: "tasks",
      name: "Tasks",
      attributes: [
        { type: "string", key: "incidentId", size: 255, required: true },
        { type: "string", key: "title", size: 255, required: true },
        { type: "boolean", key: "completed", required: true },
        { type: "string", key: "dueDate", size: 20, required: false },
      ],
    },
    {
      id: "templates",
      name: "Templates",
      attributes: [
        {
          type: "enum",
          key: "category",
          elements: [
            "Data Breach", "Lost Device", "Unauthorized Access",
            "Email Sent Wrong Person", "SAR", "FOI", "Complaint",
            "Security Incident",
          ],
          required: true,
        },
        { type: "string", key: "title", size: 255, required: true },
        { type: "string", key: "defaultDescription", size: 4096, required: false },
        { type: "string", key: "riskGuide", size: 4096, required: false },
        { type: "string", key: "checklistItems", size: 4096, required: false },
        { type: "string", key: "requiredEvidence", size: 4096, required: false },
      ],
    },
    {
      id: "checklist_items",
      name: "Checklist Items",
      attributes: [
        { type: "string", key: "incidentId", size: 255, required: true },
        { type: "string", key: "label", size: 255, required: true },
        { type: "boolean", key: "completed", required: true },
      ],
    },
    {
      id: "profiles",
      name: "Profiles",
      attributes: [
        { type: "string", key: "userId", size: 255, required: true },
        { type: "string", key: "name", size: 255, required: false },
        { type: "email", key: "email", required: false },
        {
          type: "enum",
          key: "tier",
          elements: ["free", "premium"],
          required: true,
        },
      ],
    },
  ];

  for (const col of collections) {
    try {
      console.log(`Creating collection: ${col.name}`);
      const collection = await databases.createCollection("complydesk", col.id, col.name);
      console.log(`  OK  ${collection.$id}`);
    } catch (e) {
      console.log(`  SKIP (${e.message})`);
    }

    for (const attr of col.attributes) {
      console.log(`  Creating attribute: ${attr.key} (${attr.type})`);
      try {
        switch (attr.type) {
          case "string":
            await databases.createStringAttribute("complydesk", col.id, attr.key, attr.size, attr.required);
            break;
          case "enum":
            await databases.createEnumAttribute("complydesk", col.id, attr.key, attr.elements, attr.required);
            break;
          case "boolean":
            await databases.createBooleanAttribute("complydesk", col.id, attr.key, attr.required);
            break;
          case "email":
            await databases.createEmailAttribute("complydesk", col.id, attr.key, attr.required);
            break;
        }
        console.log(`    OK`);
      } catch (e) {
        console.log(`    SKIP (${e.message})`);
      }
    }
  }

  // ── Collection Permissions ──
  console.log("\n--- Setting collection permissions ---");
  const usersRole = Role.users();
  for (const col of collections) {
    console.log(`  Updating permissions: ${col.name}`);
    try {
      await databases.updateCollection("complydesk", col.id, col.name, [
        Permission.read(usersRole),
        Permission.write(usersRole),
      ]);
      console.log(`    OK`);
    } catch (e) {
      console.log(`    FAIL (${e.message})`);
    }
  }

  // ── Storage Bucket ──
  console.log("\n--- Storage bucket ---");
  console.log("Creating storage bucket: attachments");
  try {
    const bucket = await storage.createBucket("attachments", "Attachments", [
      Permission.read(usersRole),
      Permission.write(usersRole),
    ]);
    console.log(`  OK  ${bucket.$id}`);
  } catch (e) {
    console.log(`  SKIP (${e.message})`);
  }

  console.log("\n Done!");
}

run().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
