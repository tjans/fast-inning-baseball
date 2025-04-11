import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';

class SeasonPlayerService {
    static async saveSeasonPlayer (seasonPlayer) {
        seasonPlayer = { ...seasonPlayer, seasonPlayerId: seasonPlayer.seasonPlayerId ?? uuidv4() };
        return await db.seasonPlayers.put(seasonPlayer);
    }

    static async getSeasonPlayer(seasonPlayerId) {
        let seasonPlayer = await db.seasonPlayers.where("seasonPlayerId")
          .equals(seasonPlayerId)
          .first();
        return seasonPlayer;
    }
}
  
export default SeasonPlayerService;