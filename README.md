# Gradebook v0.3.0

Front-end prototype modeled after an Infinite Campus-style teacher dashboard.

## What changed

- Added focused 0.3.0 navigation with only these sections:
  - Control Center
  - Grade Book
  - Attendance
  - Roster
  - Seating Charts
  - Student Groups
  - Post Grades
- Implemented custom section rendering so every section has a unique layout and content.
- Updated Control Center to list classes as dedicated cards.
- Added a Grade Book screen with setup, student list, and posted score columns.
- Added an Attendance screen with AM/PM controls and a grid-like attendance table format.
- Implemented dark dropdown menus for Help, Notifications, and Account; Account includes a working Sign out action.

## Run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
