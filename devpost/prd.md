---
doc: prd
status: approved
---

# DailyDo — Product Requirements

A minimal, high-efficiency daily task and reminder assistant that turns freeform voice or text notes into structured, categorized schedules and in-app alerts.
Source: `scope.md > The Unique Kernel` and `scope.md > The Core Loop`.

## The Core Journey
1. **Arrival:** The user opens DailyDo in their browser. Today's schedule loads instantly in a crisp, high-contrast dark interface.
2. **First View / Empty State:** If no tasks are present for today, an encouraging empty state card appears: *"All clear for today. Tap the mic or type below to plan your day."* with a 1-tap example suggestion.
3. **Capture Trigger:** The user taps the floating bottom capture bar or the microphone button.
4. **Focused Capture:** The capture bar smoothly expands into a focused capture overlay. The user speaks (with live speech-to-text transcription) or types a natural thought (e.g., *"Team sync in 1 minute, review slides at 4pm, pick up groceries"*).
5. **AI Extraction:** The user submits the capture. The AI engine instantly parses the raw thought, splitting it into individual tasks, extracting specific times or relative intervals (e.g., "in 1 minute"), and assigning each to a core category (**Work & Study**, **Routines & Habits**, **Personal & Errands**).
6. **Timeline Update:** Without interrupting with unnecessary confirmation modals, the overlay closes and the newly extracted tasks appear directly in the schedule:
   - Timed tasks appear in chronological order with explicit time badges.
   - Tasks without a specific time appear in an **"Anytime / Flexible"** section below.
7. **In-App Notification:** When a scheduled task reaches its reminder time, an in-app notification banner slides in at the top of the screen with a subtle audio chime, showing the task name, category, and a one-click **"Mark Done"** action.
8. **Completion:** The user marks the task as **Done**, updating its status to completed with a clean strikethrough.
9. **Persistence:** All tasks, categories, and completion states persist reliably across page refreshes.

## Screens and Layout
A unified single-surface interface optimized for desktop and mobile browsers:
- **Sticky Header:** Displays the DailyDo logo, current day and date, and quick task count stats (e.g., "3 Pending · 1 Completed").
- **Main Timeline View:**
  - **Today's Timed Schedule:** Chronological list of task cards for the current day.
  - **Anytime / Flexible Tasks:** A clean secondary section for untimed daily priorities and errands.
- **Floating Bottom Capture Bar:**
  - Docked at the bottom of the viewport with a text input placeholder, a prominent microphone icon, and a send button.
- **Focused Capture Overlay:**
  - Expands upon tapping the capture bar or mic, dimming the background to focus attention. Provides real-time speech transcription display, editing area, and a clear "Add to DailyDo" button.
- **In-App Notification Banner:**
  - Floating top toast banner with high visibility, audio chime, and instant "Mark Done" / "Dismiss" buttons.

## Look and Feel
- **Theme:** Crisp dark mode using deep charcoal and true black background tones (`#09090B`, `#121216`).
- **Typography:** High-contrast crisp white and light-neutral typography (`#FFFFFF`, `#E4E4E7`, `#A1A1AA`), clean sans-serif with bold headers.
- **Accent Color:** A single sharp, vibrant accent color (Electric Lime `#CCFF00` or Sharp Cyan `#00F0FF`) used sparingly for active mic states, due reminders, and primary buttons.
- **Cards & Borders:** Minimal, thin neutral borders (`#272730`), subtle rounded corners (`rounded-lg`), avoiding heavy drop shadows or generic AI gradients.
- **Overall Tone:** Purposeful, sharp, brutalist-clean, and visible to the point.

## Features and Behavior

### Natural Language Voice & Text Capture
- Users can speak naturally into the app via the Web Speech API (with clear microphone permission handling) or type freeform text.
- Focused overlay prevents distraction and displays live words as spoken.
- Keyboard support: pressing `Enter` submits; pressing `Escape` closes the overlay.

### AI Task Extraction & Categorization
- Splits multi-task sentences into individual distinct items.
- Resolves relative times ("in 1 minute", "in 2 hours", "at 5pm", "tomorrow morning").
- Categorizes items into three primary buckets:
  - **Work & Study:** lectures, assignments, team meetings, project deadlines.
  - **Routines & Habits:** prayers, daily workouts, medication, routine check-ins.
  - **Personal & Errands:** chores, bills, calls, groceries.

### Task Management & Timeline Display
- Each task card displays: Title, Time/Date badge, Category badge, Status (`Pending`, `Reminded`, `Done`), Checkbox toggle, and Delete action.
- Timed tasks sorted chronologically; untimed tasks organized in the Anytime section.

### Timed In-App Notifications
- In-app scheduler checks tasks against current time every few seconds.
- Triggers alert banner at top of viewport with an audible chime when a task is due.
- Automatically marks task status as `Reminded`.
- Provides an immediate "Mark Done" button directly on the banner.

## States and Boundaries
- **Empty State:** Displayed when there are no tasks for the day; shows an encouraging prompt and an instant 1-tap example.
- **Listening State:** Microphone icon animates with the sharp accent color and displays live transcribed text in the capture overlay.
- **Processing State:** Brief inline indicator ("Organizing tasks...") while AI processes the input.
- **Notification State:** High-contrast floating toast appears at top of screen with audio alert.
- **Completed State:** Checked off with strikethrough and muted gray text.
- **Storage Boundary:** Stored locally in browser `localStorage` ensuring immediate zero-latency access and persistence across sessions.

## Product Decisions
- **No confirmation preview modal:** Tasks inject directly into the schedule upon submission for instant flow.
- **Untimed items in "Anytime":** Prevents assigning arbitrary default times to items that don't have explicit deadlines.
- **Direct 1-minute relative scheduling:** Enables effortless, live verification during the 1–3 minute demo video recording (e.g. typing or speaking "call mom in 1 minute").
- **Monochrome + sharp accent palette:** Deliberately chosen to eliminate generic AI styling and provide an energetic, high-contrast look.

## What We're Building
- Complete single-page application with responsive desktop/mobile layout.
- Floating capture bar with speech recognition and text entry.
- AI parsing engine for splitting, time extraction, and categorization.
- Chronological timeline + anytime task list.
- In-app notification toast system with audio chime and status tracking.
- Local storage persistence.

## Deferred From the POC
- Native OS background push notifications when the browser tab is fully closed.
- User accounts and cross-device cloud database sync.
- Calendar integration (Google Calendar, iCal export).

## Non-Goals
- User-created dynamic categories (cut to preserve clean UI hierarchy).
- Heavy team collaboration features or multi-member assigning.

## Open Questions
- None blocking technical specification.
