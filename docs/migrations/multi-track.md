# Multi-track migration

## Goal

Add `Track` so DevOps and Backend curricula coexist without rewriting DevOps lesson IDs or wiping learner progress.

## Non-negotiables

- Preserve every existing `DailyLesson.id` (Progress, attempts, labs stay linked).
- Do not rename or delete DevOps day content.
- Do not reset `Profile` / attempt rows.
- Export/import remains full SQLite file replace; old backups need migrate-after-import.

## Sequence

1. Create `Track`; insert `devops-sre` and `backend-go`.
2. Add nullable `trackId` on `Phase`, `DailyLesson`, `Topic`, `Project`.
3. Backfill all existing curriculum rows to `devops-sre`.
4. Set `trackId` NOT NULL on those tables.
5. Drop global uniques; add composites:
   - `DailyLesson`: `@@unique([trackId, dayNumber])`
   - `Phase`: `@@unique([trackId, slug])`, `@@unique([trackId, order])`
   - `Topic`: `@@unique([trackId, slug])`
6. Create `UserTrackProgress`; copy each user's `Profile.currentDayNumber` / `xp` / `streak` / `lastStudyDate` into the devops row.
7. Add `Profile.activeTrackId` (default devops).
8. Keep `Profile.currentDayNumber` / `xp` / `streak` as mirrors of the **active** track for admin/settings compatibility.

## Compatibility risks

| Risk | Mitigation |
|------|------------|
| Old `.db` backup lacks track columns | After import, run `prisma migrate deploy` (or reject if pragma user_version / migration table missing expected migration). |
| Reseed recreates day child rows | Unchanged: exercises/scenarios/exams are deleted and recreated; DailyLesson IDs must stay via upsert on `(trackId, dayNumber)`. |
| SQLite table rebuild for unique changes | Migration copies data into new tables; verify Progress row counts before/after. |
| Global `dayNumber` lookups | App must use `(trackId, dayNumber)` after deploy; legacy `/learn/[n]` redirects to `/t/devops-sre/learn/[n]`. |

## Rollback

Restore the pre-migration SQLite file from backup (`*.pre-import-*.bak` or a manual copy taken before migrate). Do not attempt partial column drops on a live learner DB without a full file restore.
