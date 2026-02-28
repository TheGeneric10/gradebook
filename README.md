# Gradebook v0.5.0

Front-end prototype modeled after an Infinite Campus-style teacher dashboard.

## What changed

- Added **v0.5.0** major UI update with large popup overlays for management tasks.
- Grade Book now has dedicated buttons for:
  - **Manage Assignments** (big overlay)
  - **Manage Categories** (big overlay + drag reorder)
- Roster now has a dedicated **Manage Students** big overlay.
- Added **Manage Classes** in Control Center to add/update class list and class details.
- Added **class selector dropdown** in the top bar and class quick-icons for Attendance, Grade Book, and Roster.
- Added **bottom-right quick dock icons** for Gradebook, Attendance, and Roster.
- Added class meta subtitle with total students under the section title.
- Fixed sidebar-collapse layout: when sidebar is hidden, content expands to full width.
- Added term + semester selectors in Grade Book.
- Added Grade Settings overlay with max overall grade (default 100) and bulk options checkboxes:
  - Terms: T1, T2, T3, T4
  - Semester: S1, S2, S3, S4 (S1 and S2 checked by default)
- Continued local save for classes, students, assignments, categories/order, grades, attendance, and settings.

## Run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
