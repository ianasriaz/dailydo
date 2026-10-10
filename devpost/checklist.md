---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can capture thoughts and see AI-extracted tasks in the mobile schedule**
  Becomes usable: A running mobile app displaying the brutalist dark theme, floating capture bar, and AWS Bedrock extraction API that takes a freeform thought, calls Amazon Nova Micro, and renders the split tasks categorized in the schedule.
  Why now: Bootstraps the app, establishes the mobile interface, and proves the unique kernel and external AWS Bedrock AI integration right in slice one.
  PRD ref: `prd.md > The Core Journey` (steps 1–6), `prd.md > Features and Behavior` (Natural Language Voice & Text Capture, AI Task Extraction & Categorization)
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Components` (Header, FloatingCaptureBar, CaptureOverlay, TaskCard), `spec.md > External Services and Dependencies` (Amazon Bedrock)
  Build: Scaffold backend and mobile apps per spec; implement AWS Bedrock runtime client (`amazon.nova-micro-v1:0`) with fallback parser; build mobile shell with theme tokens, Header, FloatingCaptureBar, CaptureOverlay, and in-memory Timeline displaying the newly parsed tasks.
  Verify (mechanical): Execute backend test invoking `POST /api/tasks/parse` with a multi-task string, verifying Amazon Bedrock returns JSON tasks with categories; test mobile bundle compilation.
  Learner check: Open the app, type or speak a messy thought in the capture overlay, submit, and see the tasks appear organized into their category badges.
  Commit: `Add core capture bar, Bedrock AI parsing, and mobile timeline`

- [x] **2. Tasks sync and persist in Amazon DynamoDB cloud storage**
  Becomes usable: Tasks created via capture (or reloaded on app startup) are saved, updated, and retrieved from Amazon DynamoDB table `DailyDo_Tasks`.
  Why now: Persists user data in real AWS cloud storage so tasks survive app restarts and sync across devices, proving the second major AWS integration.
  PRD ref: `prd.md > States and Boundaries` (Storage Boundary), `prd.md > The Core Journey` (step 9)
  Spec ref: `spec.md > Data Model (Amazon DynamoDB)`, `spec.md > Components`, `spec.md > External Services and Dependencies` (Amazon DynamoDB)
  Build: Initialize DynamoDB table `DailyDo_Tasks`; create backend CRUD endpoints (`GET /api/tasks`, `POST /api/tasks`, `DELETE /api/tasks`); wire mobile state to fetch and persist tasks to DynamoDB on startup and submission.
  Verify (mechanical): Run automated script that puts a task into DynamoDB, queries it back, restarts the backend query, and confirms the DynamoDB record persists.
  Learner check: Create a task, refresh or reload the app, and verify that your tasks load directly from DynamoDB.
  Commit: `Persist tasks and timeline state in Amazon DynamoDB`

- [x] **3. Timed reminders, audio chime, and in-app notification banner**
  Becomes usable: When a task is due (e.g., 1 minute from now), an in-app alert banner drops down at the top of the mobile screen with an audible chime, status transitions to `Reminded`, and tapping "Mark Done" updates the task in DynamoDB.
  Why now: Completes the full end-to-end loop and provides the exact demonstrable beat needed for the 1–3 minute Devpost demo video.
  PRD ref: `prd.md > Features and Behavior` (Timed In-App Notifications, Task Management & Timeline Display), `prd.md > The Core Journey` (steps 7–8)
  Spec ref: `spec.md > Components` (NotificationBanner, TaskCard), `spec.md > Core Journey Through the System` (steps 5–6)
  Build: Implement `NotificationBanner` component with audio chime generator (`utils/sound.js`), active interval timer hook checking task due dates, `PATCH /api/tasks/:id` endpoint for status changes (`Pending` → `Reminded` → `Done`), and strikethrough completion styling.
  Verify (mechanical): Automated test creates a task due in 2 seconds, simulates interval tick, verifies notification payload fires and status updates in DynamoDB to `Reminded` then `Done`.
  Learner check: Enter a task due in 1 minute, watch the notification banner drop down with chime sound, and tap "Mark Done" to see it complete.
  Commit: `Add timed in-app notifications, audio chime, and mark done flow`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 1 (capture bar and live Bedrock extraction)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [to be recorded upon completion]
Route and stops: [to be recorded upon completion]
Edit outcome: [to be recorded upon completion]
Reflection: [to be recorded upon completion]
Activity mode: [to be recorded upon completion]

## Revisions

- Upgraded Expo to SDK 57 — discovered user's mobile device runs the latest Expo Go client (SDK 57) requiring upgraded package versions and LAN IP configuration (192.168.100.8) for seamless on-device testing.
- Upgraded to modern expo-audio and expo-file-system/legacy in Expo SDK 57 with AWS Transcribe integration using dedicated bucket dailydo-audio-855735869000. Replaced emoji icons with clean minimalist CleanMicIcon vector component. Handled microphone permission lifecycle and real-time recording timer UI.
- Transformed app into a launch-ready commercial product inspired by modern reference UI: replaced generic neon palette with calm off-white and deep forest slate tones; added an elevated bottom navigation bar with a centered AI prompt popup, dedicated categories screen with dynamic Bedrock taxonomy injection, task category reassignment modal, and completed task archive.

