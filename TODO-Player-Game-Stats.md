# Player Game Stats Task

## Information Gathered
- lib/data.json: players have static ppg/rpg/apg
- app/players/page.tsx: displays static stats, filters/sorts (gender from teamId 'w', position, search)
- components/admin-dashboard.tsx: PlayersTab manual entry ppg/rpg/apg
- Need `gameStats`: array {gameId, playerId, points, rebounds, assists}

## Plan
**Files:**
1. lib/data.json: Add `"gameStats": []` sample data
2. app/players/page.tsx: Compute averages from gameStats (current season), display/sort
3. components/admin-dashboard.tsx: Add "Game Stats" tab/form for per-game entry (select game/player, points/rebs/ast)
4. app/schedule/page.tsx: Add "Box Score" to completed games (show stats for players in that game)
5. Update api/data/route.ts if needed

**Dependent**: None new.

**Followup**: Test averages match manual (add sample stats), box scores.

Plan approved ✅. Step 1: lib/data.json - added "gameStats": [sample for game1 players].
