import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';

class LeagueService {
  static async saveLeague(league) {
    league = { ...league, leagueId: league.leagueId ?? uuidv4() };
    return await db.leagues.put(league);
  }

  static async getLeagues() {
    let leagues = await db.leagues.toArray();
    return leagues;
  }

  static async getLeague(leagueId) {
    let league = await db.leagues.get(leagueId);
    if (!league) return null;

    let seasons = await db.seasons.where("leagueId")
      .equals(leagueId)
      .sortBy("year");

    league.currentSeason = seasons[seasons.length - 1];
    return league;
  }

  static async getAllPositionPlayers(seasonId) {
    let players = await db.players.where("seasonId")
      .equals(seasonId)
      .filter(player => ['1B', '2B', '3B', 'SS', 'DH', 'OF', 'C'].includes(player.position))
      .toArray();
    return players;
  }

  static async getAllPitchers(seasonId) {
    let pitchers = await db.players.where("seasonId")
      .equals(seasonId)
      .filter(player => ["SP", "RP", "CL"].includes(player.position))
      .toArray();
    return pitchers;
  }
}

export default LeagueService;