# 🚀 Plan: Hybrid Storage Strategy (Local + Cloud)

Logged-in users ka data Appwrite Database me save hoga, aur Guest users ka data `AsyncStorage` me. Isse data persistence aur cross-device access milega.

## 1. Appwrite Database Setup (Backend)

Tumhe Appwrite Console me jakar ek Database aur 2 Collections banane honge.

### **Database**

- **Name:** `NeuroPrepDB`
- **ID:** `neuroprep_db` (Add this to config)

### **Collection 1: Notes**

- **ID:** `notes`
- **Permissions:** Role `Users` -> Create, Read, Update, Delete (Document Security enabled recommended)
- **Attributes:**
  | Key | Type | Size | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `userId` | String | 36 | Yes | Owner ID |
  | `title` | String | 255 | Yes | Topic name |
  | `subject` | String | 100 | Yes | Subject name |
  | `content` | String | 10000+ | Yes | Markdown content (Large text) |
  | `topic` | String | 255 | Yes | Original topic query |
  | `noteLength` | String | 50 | Yes | brief/detailed/exam |
  | `createdAt` | Datetime | - | Yes | Creation timestamp |

### **Collection 2: Questions**

- **ID:** `questions`
- **Permissions:** Role `Users` -> Create, Read, Update, Delete
- **Attributes:**
  | Key | Type | Size | Required | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `userId` | String | 36 | Yes | Owner ID |
  | `label` | String | 255 | Yes | Display label |
  | `subject` | String | 100 | Yes | Subject |
  | `topic` | String | 255 | Yes | Topic |
  | `difficulty` | String | 50 | Yes | easy/medium/hard |
  | `questions` | String | 10000+ | Yes | **JSON String** of Question[] |
  | `createdAt` | Datetime | - | Yes | Creation timestamp |

---

## 2. Frontend Architecture (The "Smart" Approach)

Hum existing `utils/storage/` files ko modify karenge taaki wo automatically decide karein ki data kaha save karna hai.

### **New Config (`config/appwrite.ts`)**

Add Database and Collection IDs.

### **Hybrid Logic Pattern**

Har storage function (`save`, `load`, `delete`) me ye logic lagayenge:

```typescript
import { useAuthStore } from "@/store/authStore";
import { databases } from "@/appwrite/client"; // We need to expose databases client

export const saveNote = async (note) => {
  const { user } = useAuthStore.getState();

  if (user) {
    // ✅ Logged In: Save to Appwrite Cloud
    await databases.createDocument(DB_ID, NOTES_COLLECTION_ID, ID.unique(), {
      userId: user.$id,
      ...noteData,
    });
  } else {
    // 🏠 Guest: Save to AsyncStorage (Existing logic)
    await saveToLocal(note);
  }
};
```

## 3. Implementation Steps

1.  **Update Config:** `config/appwrite.ts` me IDs add karna.
2.  **Expose Databases Client:** `store/authStore.ts` ya naye file se `Databases` instance export karna.
3.  **Refactor `utils/storage/notes.ts`:** Hybrid logic implement karna.
4.  **Refactor `utils/storage/questions.ts`:** Hybrid logic implement karna.

## 4. Benefits

- **Seamless UX:** User ko pata bhi nahi chalega, bas login karte hi data cloud pe jayega.
- **Scalable:** Future me "Sync" feature add kar sakte hain (Local data -> Cloud upload on login).
- **Clean Code:** Logic `utils` me encapsulated rahega, UI components (`notes.tsx`) ko change nahi karna padega.
