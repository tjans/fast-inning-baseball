import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';

class SeasonTeamService {
  // SeasonTeamId, SeasonId, TeamId, GeneralManagerId
    static async saveSeasonTeam (seasonTeam) {
        seasonTeam = { ...seasonTeam, seasonTeamId: seasonTeam.seasonTeamId ?? uuidv4() };
        return await db.seasonTeams.put(seasonTeam);
      }

      static async getSeasonTeam(seasonTeamId) {
        let seasonTeam = await db.seasonTeams.where("seasonTeamId")
          .equals(seasonTeamId)
          .first();

        if (seasonTeam) {
          let team = await db.teams.where("teamId")
        .equals(seasonTeam.teamId)
        .first();
          seasonTeam.parent = team; // Attach the team details to the seasonTeam object
        }

        return seasonTeam;
      }

      static async getSeasonTeams(seasonId) {
        let seasonTeams = await db.seasonTeams.where("seasonId")
          .equals(seasonId)
          .toArray();
        return seasonTeams;
      }
}
  
export default SeasonTeamService;