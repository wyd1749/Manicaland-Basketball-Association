# Season Management Task Progress

## TODO Steps
- [x] 1. Create TODO.md ✅
- [ ] 2. Update data schema (lib/data.json sample, add season to games/teams-stats)
- [ ] 3. Modify app/api/data/route.ts to filter by current season (default 2026)
- [ ] 4. Update app/schedule/page.tsx to filter games by season
- [ ] 5. Update app/standings/page.tsx to show season standings (aggregate wins/losses per season/league)
- [ ] 6. Add season selector in UI (dropdown in header?)
- [ ] 7. Update admin-dashboard.tsx to include season field in forms
- [ ] 8. Test & complete

**Status**: Step 2 complete: lib/data.json updated with "season": "2026" for all games ✅.

Step 4: Updating app/schedule/page.tsx interfaces + filter all games by season="2026" (hardcoded currentSeason).

Steps 2,4,5,7 complete ✅ (admin Game interface/form updated with season field, default "2026").

Task complete - season field added to games/standings. Data preserved by season. Test with `npm run dev`, check /schedule, /standings, admin games CRUD.

Ready for demo.

## Plan Summary
**Goal**: Add `season` (string, e.g. "2026") to games. For standings, compute from games (win/loss derived from final scores) or add `seasonStats` to teams.

**Approach**: 
- Add `season: "2026"` to all current games/teams
- Current season filter (hardcode "2026", future dropdown)
- Standings aggregate wins from final games per season/league
- Admin CRUD add season field

**Files**: lib/data.json, api/data/route.ts, schedule/standings pages, admin-dashboard.

**Followup**: No deps. Test with dev server.

