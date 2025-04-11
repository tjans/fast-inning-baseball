import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';

class LeagueService {
    static async saveLeague (league) {
        league = { ...league, leagueId: league.leagueId ?? uuidv4() };
        return await db.leagues.put(league);
      }

      static async getLeagues () {
        let leagues = await db.leagues.toArray();
        return leagues;
      }

    static async getLeague (leagueId) {
        let league = await db.leagues.get(leagueId);

        let seasons = await db.seasons.where("leagueId")
          .equals(leagueId)
          .sortBy("year");

        league.currentSeason = seasons[seasons.length - 1];
        return league;
      }

      // private
  // positionSorter: function (a, b) {
  //   var ordering = {}, // map for efficient lookup of sortIndex
  //     sortOrder = ["C", "1B", "2B", "3B", "SS", "LF", "RF", "CF", "MI", "CI", "OF", "DH", "P"];
  //   for (var i = 0; i < sortOrder.length; i++) ordering[sortOrder[i]] = i;
  //   return (
  //     ordering[a.position] - ordering[b.position] ||
  //     a.lastName.localeCompare(b.lastName)
  //   );
  // },
}
  
export default LeagueService;