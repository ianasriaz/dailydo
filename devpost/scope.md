---
doc: scope
status: approved
---

# DailyDo — Smart Daily Planner

A minimal, high-efficiency daily task and reminder assistant that turns freeform voice or text notes into structured, categorized schedules and in-app alerts for anyone managing a busy day.

## The Unique Kernel
Zero-friction, multi-intent capture: instead of tedious manual form-filling, anyone can speak or type a natural multi-task sentence (*"Meeting with Alex at 3pm, fix faucet this weekend, pay electricity by Tuesday, pray Zuhr at 1:30"*), and the app extracts, splits, categorizes, and schedules them with timed in-app notifications (10 minutes before and on time).

## Who It's For
Anyone managing an active mix of commitments—work, study, personal routines, spiritual habits, meetings, and household errands—who finds conventional to-do apps too slow and tedious, needing a friction-free way to capture thoughts on the go.

## The Core Loop
1. Open the app to see today's immediate schedule.
2. Tap the floating bottom capture bar to speak or type quick thoughts.
3. The app instantly splits and files items into structured categories and timeline slots.
4. Timed in-app alerts trigger (10m before & at deadline) with sound/visual toast.
5. The user marks items as "Done" with a single click.

## Inspiration & Identity
- Clean, minimal, but bold: high-contrast, crisp, to-the-point UI/UX that avoids bloated enterprise menus or generic "AI wrapper" aesthetics.
- Quick-access floating bottom bar with instantaneous text and microphone toggles.
- Calm, scannable layout showing the current day's priorities without visual clutter.

## Why This Matters to the Learner
Built to solve real daily routine friction ("for my own easness and planned system"), eliminate manual input fatigue, and gain practical hands-on experience integrating cloud services (leveraging available AWS credits) into a functional product that can later be made public.

## What "Working" Looks Like
In a 1–2 minute screen recording demo:
1. The user opens the app displaying a clean schedule for the day.
2. The user types or speaks a messy multi-task prompt containing different categories and times.
3. The app parses the prompt and updates the list in real-time, categorizing each task (e.g., Work & Study, Routines & Habits, Personal & Errands) with appropriate reminder times.
4. An active in-app notification fires right on cue (demonstrated live or via test trigger) with a status update to *Reminded*, and the user toggles it to *Done*.

## The POC Boundary
- Floating bottom capture bar supporting both raw text input and browser voice input (Speech-to-Text).
- AI extraction pipeline: splits multi-task inputs, extracts dates/times, and assigns to clean default categories (Work & Study, Routines & Habits, Personal & Errands).
- Current-day focus view and upcoming timeline list.
- In-app notification banner/toast system with 10-minute warning and on-time alert, tracking state (`Pending` → `Reminded` → `Done`).
- Quick-test notification trigger so the demo video can show alerts firing without a 10-minute real-world wait.
- Local persistent storage so tasks persist across refreshes.

## Later
- Long-term adaptive personalization ("learn and improve day by day" based on completion habits).
- True OS-level mobile push notifications (APNs / FCM) when the app is completely closed.
- Automatic location-based prayer time calculation API integration.
- Public multi-user accounts, social sharing, and cloud sync across devices.

## Explicitly Cut
- Dynamic endless category creation (cut to avoid clutter and maintain a clean, predictable UI).
- Complex collaborative project management boards (cut as unnecessary for personal daily capture).
- Deep multi-level settings or tag taxonomy (cut to keep capture instantaneous).
