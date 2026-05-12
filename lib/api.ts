import { supabase } from './supabase'

// ─── TEAMS ───────────────────────────────────────────────
export async function getTeams() {
  const { data, error } = await supabase.from('teams').select('*')
  if (error) throw new Error(error.message)
  return data
}

export async function getTeamById(id: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ─── PLAYERS ─────────────────────────────────────────────
export async function getPlayers() {
  const { data, error } = await supabase.from('players').select('*')
  if (error) throw new Error(error.message)

  return (data || []).map((p: any) => ({
    ...p,
    teamId: p.teamId ?? p.team_id,
    ppg: p.ppg,
    rpg: p.rpg,
    apg: p.apg,
  }))
}

export async function getPlayerById(id: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getPlayersByTeam(teamId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .or(`teamId.eq.${teamId},team_id.eq.${teamId}`)

  if (error) throw new Error(error.message)

  return (data || []).map((p: any) => ({
    ...p,
    teamId: p.teamId ?? p.team_id,
  }))
}

// ─── GAMES ───────────────────────────────────────────────
export async function getGames() {
  const { data, error } = await supabase.from('games').select('*')
  if (error) throw new Error(error.message)

  return (data || []).map((g: any) => ({
    ...g,
    // keep both snake_case and camelCase so any component can use either
    home_team_id: g.home_team_id,
    away_team_id: g.away_team_id,
    homeTeamId: g.home_team_id ?? g.homeTeamId,
    awayTeamId: g.away_team_id ?? g.awayTeamId,
    home_score: g.home_score,
    away_score: g.away_score,
    homeScore: g.home_score ?? g.homeScore ?? null,
    awayScore: g.away_score ?? g.awayScore ?? null,
    status: g.status ?? "Scheduled",
    season: String(g.season ?? "2026"),
  }))
}

export async function getGameById(id: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)

  return {
    ...data,
    home_team_id: data.home_team_id,
    away_team_id: data.away_team_id,
    homeTeamId: data.home_team_id ?? data.homeTeamId,
    awayTeamId: data.away_team_id ?? data.awayTeamId,
    home_score: data.home_score,
    away_score: data.away_score,
    homeScore: data.home_score ?? data.homeScore ?? null,
    awayScore: data.away_score ?? data.awayScore ?? null,
    status: data.status ?? "Scheduled",
    season: String(data.season ?? "2026"),
  }
}

export async function getGamesByStatus(status: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('status', status)
  if (error) throw new Error(error.message)

  return (data || []).map((g: any) => ({
    ...g,
    home_team_id: g.home_team_id,
    away_team_id: g.away_team_id,
    homeTeamId: g.home_team_id ?? g.homeTeamId,
    awayTeamId: g.away_team_id ?? g.awayTeamId,
    home_score: g.home_score,
    away_score: g.away_score,
    homeScore: g.home_score ?? g.homeScore ?? null,
    awayScore: g.away_score ?? g.awayScore ?? null,
    status: g.status ?? "Scheduled",
    season: String(g.season ?? "2026"),
  }))
}

// ─── NEWS ────────────────────────────────────────────────
export async function getNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getNewsById(id: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ─── GAME STATS ──────────────────────────────────────────
export async function getGameStats() {
  const { data, error } = await supabase.from('gameStats').select('*')
  if (error) throw new Error(error.message)
  return data
}

export async function getStatsByGame(gameId: string) {
  const { data, error } = await supabase
    .from('gameStats')
    .select('*')
    .eq('gameId', gameId)
  if (error) throw new Error(error.message)
  return data
}

export async function getStatsByPlayer(playerId: string) {
  const { data, error } = await supabase
    .from('gameStats')
    .select('*')
    .eq('playerId', playerId)
  if (error) throw new Error(error.message)
  return data
}