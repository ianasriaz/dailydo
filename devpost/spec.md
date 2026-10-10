---
doc: spec
status: approved
---

# DailyDo — Technical Specification

## How This Works, In Plain Language
DailyDo is a mobile-first application designed for rapid, friction-free daily task management, powered by native mobile capture and cloud AWS services.

The system is split into two cleanly separated layers:
1. **The Mobile App (React Native / Expo):** Runs on your phone (via Expo Go) or on-screen in an interactive mobile simulator. It renders the brutalist charcoal dark theme, provides the floating bottom capture bar, captures voice or text, displays today's chronological schedule and flexible tasks, and manages active in-app reminder banners.
2. **The Cloud Backend & AWS Services (Node.js + AWS SDK v3):**
   - **Amazon Bedrock (Foundation Model: `amazon.nova-micro-v1:0`):** Amazon's ultra-fast, low-cost foundation model in `us-east-1`. When you submit a freeform thought, Bedrock parses the natural language, splits multi-task sentences, extracts relative/absolute times, and categorizes them into **Work & Study**, **Routines & Habits**, or **Personal & Errands**.
   - **Amazon DynamoDB (`DailyDo_Tasks` table):** A fully managed AWS NoSQL database that persists all tasks, timestamps, categories, and completion states across devices with millisecond latency.
   - **Local AWS Service Bridge (`backend/server.js`):** A lightweight server that uses your existing AWS CLI credentials to call Bedrock and DynamoDB securely, preventing AWS IAM secrets from ever being exposed inside client mobile bundles.

---

## The Core Journey Through the System
Implements `prd.md > The Core Journey`.

1. **Arrival & Sync:**
   - The user launches DailyDo on mobile.
   - The mobile app requests `GET /api/tasks` from the backend.
   - The backend queries Amazon DynamoDB (`DailyDo_Tasks`) and returns active tasks.
   - The app renders today's timed tasks in chronological order, followed by the **Anytime / Flexible** tasks.
2. **Focused Voice or Text Capture:**
   - The user taps the floating bottom microphone or text bar.
   - Implements `prd.md > Natural Language Voice & Text Capture`.
   - The capture bar animates into an expanding focused overlay with live voice transcription (or keyboard input).
3. **AI Task Extraction via Amazon Bedrock:**
   - The user hits submit (e.g. *"Team sync in 1 minute, pay electricity by Tuesday, buy groceries"*).
   - Mobile sends `POST /api/tasks/parse` with the raw text payload.
   - The backend sends a structured ConverseCommand to Amazon Bedrock using `amazon.nova-micro-v1:0`.
   - Bedrock returns a clean JSON array of extracted tasks with calculated due times and category assignments.
   - The backend stores each item into Amazon DynamoDB and returns the created tasks.
4. **Instant UI Injection:**
   - Implements `prd.md > Task Management & Timeline Display`.
   - The focused capture sheet closes and the new tasks immediately appear in the schedule: timed tasks at their appropriate hour slot, untimed tasks under "Anytime".
5. **In-App Notification Trigger:**
   - Implements `prd.md > Timed In-App Notifications`.
   - The mobile app's reminder hook checks task timestamps every 2 seconds against current time.
   - When a task reaches its trigger time, the in-app notification banner drops down from the top of the mobile screen with an audible chime.
   - The app calls `PATCH /api/tasks/:id` to update status from `Pending` to `Reminded` in DynamoDB.
6. **One-Tap Completion:**
   - The user taps **"Mark Done"** directly on the notification toast or task card.
   - The app updates the local state and sends `PATCH /api/tasks/:id` with status `Done`.
   - The task visually strikes through with muted typography.

---

## Stack
- **Mobile Framework:** [React Native](https://reactnative.dev/) with [Expo](https://docs.expo.dev/) (SDK 52+).
  - *Rationale:* True native mobile app experience on iOS/Android (and testable via Expo Go or web mobile simulator) with zero-config Windows setup.
- **Styling:** React Native StyleSheet / Tailwind-inspired design tokens matching the crisp charcoal/monochrome brutalist design.
- **Cloud AI:** [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) with foundation model `amazon.nova-micro-v1:0` via [@aws-sdk/client-bedrock-runtime](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/bedrock-runtime/).
  - *Rationale:* Verified active in `us-east-1` with 349ms latency; uses learner AWS credits and provides optimal speed and accuracy for JSON task extraction.
- **Cloud Database:** [Amazon DynamoDB](https://docs.aws.amazon.com/dynamodb/) via [@aws-sdk/client-dynamodb](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/) & [@aws-sdk/lib-dynamodb](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/lib-dynamodb/).
  - *Rationale:* Industry-standard serverless AWS database for persistent cloud task storage.
- **Backend Service:** [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/).
  - *Rationale:* Native runtime on user's machine (v24.12.0) that securely connects to AWS using ambient AWS CLI credentials.
- **Audio & Sound:** HTML5 / Web Audio API sound synthesizer for zero-dependency alert chimes.

---

## Where It Runs and How Someone Tries It
- **Runtime:**
  - Backend: Node.js server running locally on `http://localhost:4000`.
  - Mobile: Expo development server running on `http://localhost:8081`.
- **Environment Requirements:**
  - Node.js v24.12.0 and Git (verified installed).
  - AWS CLI configured with active IAM credentials in `us-east-1` (verified working with Account `855735869000`).
- **Exact Start Commands for Demo Recording:**
  1. Terminal 1 (Backend): `npm run server` (starts API connected to Bedrock & DynamoDB).
  2. Terminal 2 (Mobile): `npm run mobile` (starts Expo app; press `w` to open mobile simulator in browser, or scan QR code in Expo Go app on phone).
- **Submission Proof:** Both the short screen recording (1–3 minutes) demonstrating live capture, Bedrock extraction, and notification chime, plus the public GitHub repository.

---

## Look and Feel
Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`.
- **Background:** Deep dark charcoal (`#09090B`) and elevated card surface (`#121216`).
- **Typography:** High-contrast clean sans-serif; primary text pure white (`#FFFFFF`), secondary text muted silver (`#A1A1AA`).
- **Accent:** Electric Lime (`#CCFF00`) / Sharp Cyan (`#00F0FF`) for active microphone pulses, due badges, and primary action buttons.
- **Borders & Dividers:** Subtle dark neutral borders (`#272730`).
- **Energy:** Crisp, brutalist-clean, minimal, uncluttered.

---

## Components

### 1. `Header` Component
- Displays DailyDo branding, formatted current day and date, and quick stats (e.g., "4 Tasks · 1 Due").
- Implements `prd.md > Screens and Layout`.

### 2. `Timeline` & `AnytimeSection` Component
- Displays chronological schedule cards for timed tasks with explicit time pills.
- Secondary collapsible section for untimed items ("Anytime / Flexible").
- Implements `prd.md > Task Management & Timeline Display`.

### 3. `TaskCard` Component
- Renders task item with title, scheduled time pill, category pill, status badge (`Pending`, `Reminded`, `Done`), checkbox toggle, and delete icon.
- Implements `prd.md > Task Management & Timeline Display`.

### 4. `FloatingCaptureBar` Component
- Docked at bottom of screen with text input placeholder, glowing microphone trigger, and quick submit action.
- Implements `prd.md > Natural Language Voice & Text Capture`.

### 5. `CaptureOverlay` Component
- Smooth expanding mobile overlay for distraction-free typing or live speech transcription.
- Implements `prd.md > Natural Language Voice & Text Capture`.

### 6. `NotificationBanner` Component
- Top-sliding alert banner with sound chime and instant "Mark Done" button.
- Implements `prd.md > Timed In-App Notifications`.

---

## Data Model (Amazon DynamoDB)
Table Name: `DailyDo_Tasks`

| Field | Type | Description |
|---|---|---|
| `taskId` | String (UUID) | Partition Key: Unique task identifier |
| `title` | String | Extracted task description |
| `category` | String | `Work & Study` \| `Routines & Habits` \| `Personal & Errands` |
| `dueTime` | String (ISO 8601) | Scheduled deadline timestamp (or `null` for Anytime tasks) |
| `isAnytime` | Boolean | `true` if untimed; `false` if scheduled |
| `status` | String | `Pending` \| `Reminded` \| `Done` |
| `createdAt` | String (ISO 8601) | Creation timestamp |

---

## File Structure

```
Build With AI - Basics/
├── backend/
│   ├── server.js            # Express server (REST endpoints)
│   ├── bedrock.js           # Amazon Bedrock client (Nova Micro prompt logic)
│   └── dynamo.js            # Amazon DynamoDB client & table manager
├── mobile/
│   ├── App.js               # Main mobile entry & notification controller
│   ├── app.json             # Expo configuration
│   ├── package.json         # Mobile dependencies
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── Timeline.js
│   │   │   ├── TaskCard.js
│   │   │   ├── FloatingCaptureBar.js
│   │   │   ├── CaptureOverlay.js
│   │   │   └── NotificationBanner.js
│   │   ├── services/
│   │   │   └── api.js       # Backend & AWS API client
│   │   └── utils/
│   │       ├── sound.js     # Chime audio player
│   │       └── theme.js     # Charcoal monochrome tokens
├── devpost/                 # Hackathon planning workspace
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── package.json             # Root runner scripts
└── README.md
```

---

## External Services and Dependencies
1. **Amazon Bedrock:**
   - Model: `amazon.nova-micro-v1:0` (Region: `us-east-1`).
   - SDK: `@aws-sdk/client-bedrock-runtime` (v3).
   - Auth: AWS ambient CLI credentials (`~/.aws/credentials`).
   - Latency: ~350ms.
2. **Amazon DynamoDB:**
   - Table: `DailyDo_Tasks` (Region: `us-east-1`).
   - SDK: `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`.
   - Free tier / On-Demand capacity (uses AWS credits).

---

## Important Failure Modes
1. **Bedrock API Rate Limit / Network Hiccup:**
   - *Fallback:* Backend includes a local regex/date-extractor parser so the app still splits tasks and extracts times without failing in front of the user.
2. **Microphone Permission Denied:**
   - *Fallback:* Seamless immediate text entry directly in the focused capture bar with full keyboard support.
3. **DynamoDB Offline or Network Disconnect:**
   - *Fallback:* Mobile app caches tasks in local client state, syncing with cloud on next reconnect.

---

## What Was Simplified and Why
- **Local Service Bridge instead of direct mobile IAM keys:** Keeps AWS credentials secure on the machine without embedding secret keys in mobile app code.
- **In-App Toast Banner instead of native APNs/FCM push:** Lets notifications trigger reliably on-screen without requiring Apple Developer account fees or complex push certificates.
- **Predefined 3 categories instead of dynamic AI taxonomies:** Avoids screen clutter and ensures reliable classification.

---

## Decisions and Open Issues
- **Decisions Made:**
  - Mobile architecture: React Native / Expo to deliver a true mobile app experience.
  - AWS AI Engine: Amazon Nova Micro foundation model (`amazon.nova-micro-v1:0`) selected and verified.
  - AWS Storage: Amazon DynamoDB table `DailyDo_Tasks`.
  - Audio: Clean synthesized audio chime for reminder alerts.
- **One Useful Concept Clarified:**
  - How AWS IAM credentials are handled for mobile apps: rather than compiling AWS keys into mobile code (which is insecure), the local backend securely executes AWS SDK calls using your existing `aws configure` identity.
- **Open Issues:** None blocking build execution.
