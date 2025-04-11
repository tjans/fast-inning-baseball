import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';

class SeasonService {
    static async saveSeason (season) {
        season = { ...season, seasonId: season.seasonId ?? uuidv4() };
        return await db.seasons.put(season);
      }
}
  
export default SeasonService;