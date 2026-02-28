# Gradebook v0.7.0

Front-end prototype modeled after an Infinite Campus-style teacher dashboard.

## What changed

- Upgraded to **v0.7.0** with a larger student-focused grade workflow.
- Student view now opens as a **large separate overlay UI** instead of inline.
- Added **custom edit grade value** flow (cell click opens dedicated grade edit popup).
- Added safeguards for grade calculations:
  - blank grades are not counted
  - `M` and `Ch` automatically evaluate to 0
  - not-set assignments (`#/0`) are treated as extra credit logic (`10/0` contributes like `110%`, `0/0` as `100%`, blank remains blank)
- Assignment sorting:
  - Grade Book main table: **oldest -> newest**
  - Student grade overlay: **latest -> oldest**
- Rounded View now rounds **grade values up** in calculations instead of changing visual row layout.
- Kept assignment context menu tools (edit/delete/comments/bulk mass grade), class quick icons, CRUD overlays, and local save.
- Added conflict-prevention cleanup checks (`rg` checks) to ensure no conflict-marker remnants.

## Run

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
