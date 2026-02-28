# Gradebook v0.2.1a

Front-end prototype modeled after an Infinite Campus-style teacher dashboard.

## What changed

- Dashboard now uses a full-viewport layout with margins removed so Gradebook content reaches the screen edges (auth screens remain centered).
- Centered application shell with Arial Regular body text and Arial Bold headings.
- Updated color system using: `#282d30`, `#e1e1e1`, `#ffffff`, `#f4f4f4`, `#0dabd8`, `#9f9f9f`, and `#93c93c`.
- Functional sign-in and sign-up (Create Account) simulation.
- Dashboard taskbar with left hamburger and right-side Google Material filled icons (help, notifications, account).
- Sidebar navigation sections with working interactions:
  - Control Center
  - Grade Book
  - Planner
  - Message Center
  - Discussions
  - Learning Tools
  - Progress Monitor
  - Attendance
  - Roster
  - Seating Charts
  - Student Groups
  - Post Grades
- Sharp-styled custom checkbox, radio buttons, and switch toggle.

## Run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
