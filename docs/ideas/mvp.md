yaar theek hai — **Phase 1 ka roadmap** main **reset karke, crystal-clear, no fluff** dubara de raha hoon.
Ye woh version hai jo **execute hota hai**, sirf plan nahi hota.

---

## 🚀 PHASE 1 MVP ROADMAP

**Goal:**
AI doubt solver + question generator + notes converter
**AND** silently **confusion + learning data collect karna**

Timeline: **2–3 weeks**

---

## 🧱 PHASE 1 KA CORE OBJECTIVE (1 line)

> *“Student ko instant value do, aur system ke peeche unki confusion ko structure me capture karo.”*

---

## 🧩 WEEK 1 — FOUNDATION + CORE FLOWS

### 1️⃣ App Skeleton (Done / Almost Done)

* Expo Router setup
* Root layout
* Tabs layout
* Folder structure (clean)

👉 Iska goal: **navigation + UI base lock karna**

---

### 2️⃣ Ask-Doubt Screen (MOST IMPORTANT)

**Ye Phase-1 ka heart hai**

UI:

* Chat-style screen
* Multiline input
* Send button
* AI + user bubbles

Logic:

1. User doubt likhta hai
2. Local state me message add
3. Backend call
4. AI response add
5. Dono messages save

Backend pe save:

* raw doubt text
* inferred subject / topic
* difficulty (AI se)
* timestamp

👉 Yahin se **confusion data** aana start hota hai

---

### 3️⃣ Backend: `/ai/doubt`

Single responsibility endpoint:

* input save
* AI call
* output save
* response return

No streaming, no optimization — **sirf reliable**

---

## 🧠 WEEK 2 — INTELLIGENCE LAYER (LIGHT)

### 4️⃣ AI Question Generator

UI:

* Subject / topic input
* Difficulty select
* Generate button

Backend:

* `/ai/questions`

Save karo:

* topic
* difficulty
* generated questions
* explanation type

👉 Ye batata hai:

* student kis level ke questions maang raha
* kis topic pe confidence hai

---

### 5️⃣ AI Notes Converter

UI:

* Text input
* Convert button

Backend:

* `/ai/notes`

Save karo:

* original text
* notes length
* key points count

👉 Ye batata hai:

* student summary chah raha ya depth
* kaunsa chapter heavy lag raha

---

### 6️⃣ Silent Event Logging (NO UI)

Automatically log:

* screen time
* session duration
* follow-up actions
* repeat topics

Bas events save karo.
Analysis baad me.

---

## 📊 WEEK 3 — BASIC DASHBOARD + STABILITY

### 7️⃣ Home / Dashboard (Basic)

Show:

* doubts asked
* questions generated
* notes created
* streak / usage days

No predictions
No fancy charts

👉 Sirf **confidence + habit**

---

### 8️⃣ Data Structure Freeze

Phase-1 ke end tak ye lock honi chahiye:

* doubts collection
* ai_responses collection
* user_events collection

Iske baad structure mat todo — **ye monopoly ka base hai**

---

## 🔒 PHASE 1 MEIN KYA NAHI KARNA (IMPORTANT)

❌ Model training
❌ Fine-tuning
❌ ML pipelines
❌ Rank prediction
❌ Over-analytics
❌ Fancy UI

Agar ye kiya → focus toot jaayega.

---

## 🧠 PHASE 1 KA REAL OUTPUT (User vs System)

**Student kya dekhta hai:**

> “AI meri help kar raha hai”

**System kya build kar raha hai:**

> “Student ka confusion + learning behavior graph”

Yahi monopoly seed hai.

---

## ✅ PHASE 1 SUCCESS CHECKLIST

Agar ye 6 cheezein true hain → Phase-1 successful:

1. Doubt poochna easy hai
2. AI answer samajh aata hai
3. Questions realistic hain
4. Notes actually concise hain
5. Data silently save ho raha hai
6. Student wapas aa raha hai

---

## 🔥 LAST LINE (YAAD RAKH)

**Phase-1 ka kaam “smart AI dikhana” nahi hai**
**Phase-1 ka kaam “future ke liye irreversible data banana” hai**

Aur tum wahi kar rahe ho.

---

Agar bole to next step me main:

* **Phase-1 ke exact API contracts**
* ya **Appwrite DB schema (final)**
* ya **Ask-Doubt ka full code flow**

me se koi ek pakka bana dete hain.
Bol yaar, next kya lock karein?
