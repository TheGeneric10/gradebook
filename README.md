# Gradebook v0.6.0

Front-end prototype modeled after an Infinite Campus-style teacher dashboard.

## What changed

- Added **v0.6.0** class-centric workflow upgrades and overlay management improvements.
- Added quick icons (Gradebook, Attendance, Roster) on each class card in the bottom-right for class-specific navigation.
- Added **Grade Level** field in Manage Classes and surfaced grade level in class info cards/meta.
- Added **Edit/Delete** actions across assignments, students, classes, and categories.
- Added a reusable **confirmation UI overlay** for delete actions.
- Updated Grade Book table format to include:
  - Student List
  - Overall Grade
  - # of Grade Categories (collapse/expand with arrows)
  - # of Grade Assignments
  - thin assignment rectangle columns
- Added student drill-down view on student name click with category dropdown filtering and flag editing.
- Added standard grade status flags: T, X, I, M, L, Ch, Dr with rounded visual legend chips and per-grade display.
- Added assignment header right-click mini menu:
  - Edit Assignment
  - Delete Assignment
  - Manage Student Comments (popup placeholder)
  - Bulk Mass Grade Change (popup UI with min/max, difficulty, replace-mode checkboxes, set-to blank/value)
- Added **Not Set total points** feature for assignments (`#/0` in student view when enabled).
- Preserved and extended local-save behavior for all major state and settings.

## Run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
