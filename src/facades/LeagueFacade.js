import SeasonService from "src/services/SeasonService";
import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';
import SeasonTeamService from "src/services/SeasonTeamService";

class LeagueFacade {
  static async getCurrentTeams(seasonId) {
    const seasonTeams = await SeasonTeamService.getSeasonTeams(seasonId);
    
    const teams = await Promise.all(seasonTeams.map(async (seasonTeam) => {
      const team = await db.teams.get(seasonTeam.teamId);
      const gm = await db.generalManagers.get(seasonTeam.generalManagerId); // Assuming `gmId` is a property of the team
      const seasonPlayers = await db.seasonPlayers.where("seasonTeamId").equals(seasonTeam.seasonTeamId).toArray();
      return { ...seasonTeam, parent: team, gm, seasonPlayers };
    }));

    teams.sort((a, b) => {
      if (a.parent.city < b.parent.city) return -1;
      if (a.parent.city > b.parent.city) return 1;
      if (a.parent.name < b.parent.name) return -1;
      if (a.parent.name > b.parent.name) return 1;
      return 0;
    });
    return teams;
  }
  

  // This function should retrieve all players by position, sorted by sortString.  It needs to return a list of players who do not have a seasonTeamId set on their
  // seasonPlayers record.
  static async getUndraftedPlayers(seasonId, position) {
    // Default to offense
    var searchPositions = ['1B', '2B', '3B', 'SS', 'OF', 'DH', 'C'];

    if(position) {
    if(position.toLowerCase() == 'offense') {
      searchPositions = ['1B', '2B', '3B', 'SS', 'OF', 'DH', 'C'];
    } else if(position.toLowerCase() == 'pitchers') {
      searchPositions = ['SP', 'RP', 'CL'];
    } else if(position) {
      searchPositions = [position];
    }   
  }

    // there is a seasonPlayers table that has a seasonTeamId on it, but the player's name exists on players table.  We need to get the seasonPlayers who don't have a seasonTeamId
    // set on their record, along with a parent record like we did on lines 10-14 above, using promise.all like we did above.
    const seasonPlayers = await db.seasonPlayers
      .where("seasonId")
      .equals(seasonId)
      .filter((sp) => searchPositions.includes(sp.position))
      .filter((sp) => !sp.seasonTeamId)
      .toArray();

    let offenseSorter = (a, b) => {
      if (a.grade < b.grade) return -1;
      if (a.grade > b.grade) return 1;
      if (a.powerGrade < b.powerGrade) return -1;
      if (a.powerGrade > b.powerGrade) return 1;
      if (a.age > b.age) return -1;
      if (a.age < b.age) return 1;
      return 0;
    };

    seasonPlayers.sort(offenseSorter)

    const players = await Promise.all(seasonPlayers.map(async (seasonPlayer) => {
      const player = await db.players.get(seasonPlayer.playerId);
      return { ...seasonPlayer, parent: player };
    }
    ));
    
    return players;
  }

  static getDraftNotes(gm) {
    let key = `${gm.riskTolerance} + ${gm.developmentFocus} + ${gm.teamBuildingStrategy}`;
    
    const notes = [];

    // Conservative + Farm First + Pitching Focused
    if (key === "Conservative + Farm First + Pitching Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Starting pitcher with best grade`,
      `<strong>2nd:</strong> Another quality starter (B+ or better)`,
      `<strong>3rd:</strong> Defensive C or SS (B+ or better defense)`,
      `<strong>Preferences:</strong>`,
      `Pitchers with TOUGH/semi-TOUGH HR tendency`,
      `Defense-first middle infielders`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 3 quality starters drafted`,
      `Position if: No catcher or shortstop yet`,
      `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Conservative + Farm First + Balanced
    if (key === "Conservative + Farm First + Balanced") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available player (A+/A pitching or A+/A hitting) with no weakness`,
      `<strong>2nd:</strong> If 1st was pitcher, draft position player (or vice versa)`,
      `<strong>3rd:</strong> Whichever position has fewest quality players remaining`,
      `<strong>Preferences:</strong>`,
      `Well-rounded players with consistent grades`,
      `Quality defense up the middle (C, 2B, SS, CF)`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Fewer pitchers than position players drafted`,
      `Position if: Fewer position players than pitchers drafted`,
      `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Conservative + Farm First + Offense Focused
    if (key === "Conservative + Farm First + Offense Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Power hitter (B+ or better) with decent defense (C or better)`,
      `<strong>2nd:</strong> Quality starting pitcher (B+ or better)`,
      `<strong>3rd:</strong> Another quality hitter (B+ or better hitting) preferring 5T/5E players`,
      `<strong>Preferences:</strong>`,
      `Balanced hitting (both Power and Hitting grades similar)`,
      `TOUGH/semi-TOUGH HR tendency for pitchers`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 3 quality starters drafted`,
      `Position if: 1B, 3B, LF, RF or DH unfilled`,
      `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Conservative + Mixed + Pitching Focused
    if (key === "Conservative + Mixed + Pitching Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available starting pitcher`,
      `<strong>2nd:</strong> Another quality starter or closer (if closer has better grade)`,
      `<strong>3rd:</strong> Defensive catcher or shortstop (B+ or better)`,
      `<strong>Preferences:</strong>`,
      `Balanced defensive roster (no position below C)`,
      `Clutch rating of B or better for key offensive positions`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 4 pitchers drafted or no closer yet`,
      `Position if: No catcher or middle infielders yet`,
      `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Conservative + Mixed + Balanced
    if (key === "Conservative + Mixed + Balanced") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available player (A+/A pitching or A+/A hitting) with no weakness`,
      `<strong>2nd:</strong> Fill opposite need from 1st pick (pitcher/position)`,
      `<strong>3rd:</strong> Best available player at position with fewest draft picks remaining`,
      `<strong>Preferences:</strong>`,
      `Well-rounded players with few weaknesses`,
      `Prefer players with strong development history or upside potential`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Pitching depth still lacking or quality options available`,
      `Position if: Any starting role still unfilled`,
      `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Conservative + Mixed + Offense Focused
    if (key === "Conservative + Mixed + Offense Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Power hitter or high average hitter with clutch (B or better)`,
      `<strong>2nd:</strong> Starting pitcher with quality secondary ratings (HR tendency, clutch)`,
      `<strong>3rd:</strong> Defensive-minded catcher or center fielder`,
      `<strong>Preferences:</strong>`,
      `Avoid extreme low defensive ratings`,
      `Prioritize lineup depth and plate discipline`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Only one or fewer pitchers drafted so far`,
      `Position if: Lineup still lacks run producers`,
      `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Conservative + Win Now + Pitching Focused
    if (key === "Conservative + Win Now + Pitching Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available starting pitcher`,
      `<strong>2nd:</strong> Another quality starter or closer (if closer has better grade)`,
      `<strong>3rd:</strong> B+ or better power hitter at power position`,
      `<strong>Preferences:</strong>`,
      `A/B+ clutch rating for power positions (1B, 3B, DH, LF, RF)`,
      `TOUGH/semi-TOUGH HR tendency for pitchers`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 5 quality pitchers drafted`,
      `Position if: C, SS, or 2B unfilled`,
      `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Conservative + Win Now + Balanced
    if (key === "Conservative + Win Now + Balanced") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available hitter, preferring 5T and 5E players`,
      `<strong>2nd:</strong> Best available starting pitcher`,
      `<strong>3rd:</strong> Another A+/A grade hitter`,
      `<strong>Preferences:</strong>`,
      `Players with B+ or higher hitting ratings`,
      `Balanced defensive prowess across positions`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Fewer than half the required pitchers drafted`,
      `Position if: 2B, SS, or CF unfilled`,
      `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Conservative + Win Now + Offense Focused
    if (key === "Conservative + Win Now + Offense Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available power hitter`,
      `<strong>2nd:</strong> A+/A grade hitter or if none left then an A+/A grade starting pitcher`,
      `<strong>3rd:</strong> If no pitcher yet, A+/A grade starting pitcher; otherwise, another quality hitter`,
      `<strong>Preferences:</strong>`,
      `Hitters with balanced Power/Hitting grades`,
      `A/B+ clutch ratings for power positions`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 3 quality starting pitchers drafted`,
      `Position if: 1B, 3B, DH, LF or RF unfilled`,
      `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }
    
    // Neutral + Farm First + Pitching Focused
    if (key === "Neutral + Farm First + Pitching Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available starting pitcher`,
      `<strong>2nd:</strong> Another quality starter`,
      `<strong>3rd:</strong> Best defensive player available for C or SS`,
      `<strong>Preferences:</strong>`,
      `Pitchers with high grades and acceptable flaws`,
      `Defensive strength up the middle`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 4 quality starters drafted`,
      `Position if: C, SS, or 2B still unfilled`,
      `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Neutral + Farm First + Balanced
    if (key === "Neutral + Farm First + Balanced") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available player - A+/A starting pitcher or A+/A 5E/5T hitter`,
      `<strong>2nd:</strong> Fill opposite need from 1st pick`,
      `<strong>3rd:</strong> Best player available at position with the least good players remaining`,
      `<strong>Preferences:</strong>`,
      `Players with at least one standout category (A/A+)`,
      `Balance between different skills`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Fewer pitchers than position players drafted`,
      `Position if: Fewer position players than pitchers drafted`,
      `Otherwise: Take best available regardless of position`
      ];
    }

    // Neutral + Farm First + Offense Focused
    if (key === "Neutral + Farm First + Offense Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available power hitter (B+ or better) with decent defense`,
      `<strong>2nd:</strong> Quality starting pitcher (B+ or better)`,
      `<strong>3rd:</strong> Another offensive player (B+ or better hitter)`,
      `<strong>Preferences:</strong>`,
      `Balanced hitting with a mix of power and average`,
      `Pitchers with TOUGH/semi-TOUGH HR tendency`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 3 quality starters drafted`,
      `Position if: 1B, 3B, LF, RF, or DH unfilled`,
      `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Neutral + Mixed + Pitching Focused
    if (key === "Neutral + Mixed + Pitching Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available starting pitcher`,
      `<strong>2nd:</strong> Another quality starter or closer (if closer has better grade)`,
      `<strong>3rd:</strong> Defensive catcher or shortstop (B+ or better)`,
      `<strong>Preferences:</strong>`,
      `Balanced defensive roster (no position below C)`,
      `Clutch rating of B or better for key offensive positions`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 4 pitchers drafted or no closer yet`,
      `Position if: No catcher or middle infielders yet`,
      `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Neutral + Mixed + Balanced
    if (key === "Neutral + Mixed + Balanced") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available player (A+/A pitching or A+/A hitting) with no weakness`,
      `<strong>2nd:</strong> Fill opposite need from 1st pick (pitcher/position)`,
      `<strong>3rd:</strong> Best available player at position with fewest draft picks remaining`,
      `<strong>Preferences:</strong>`,
      `Well-rounded players with few weaknesses`,
      `Prefer players with strong development history or upside potential`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Pitching depth still lacking or quality options available`,
      `Position if: Any starting role still unfilled`,
      `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Neutral + Mixed + Offense Focused
    if (key === "Neutral + Mixed + Offense Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Power hitter or high average hitter with clutch (B or better)`,
      `<strong>2nd:</strong> Starting pitcher with quality secondary ratings (HR tendency, clutch)`,
      `<strong>3rd:</strong> Defensive-minded catcher or center fielder`,
      `<strong>Preferences:</strong>`,
      `Avoid extreme low defensive ratings`,
      `Prioritize lineup depth and plate discipline`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Only one or fewer pitchers drafted so far`,
      `Position if: Lineup still lacks run producers`,
      `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Neutral + Win Now + Pitching Focused
    if (key === "Neutral + Win Now + Pitching Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available starting pitcher`,
      `<strong>2nd:</strong> Another quality starter or closer (if closer has better grade)`,
      `<strong>3rd:</strong> B+ or better power hitter at power position`,
      `<strong>Preferences:</strong>`,
      `A/B+ clutch rating for power positions (1B, 3B, DH, LF, RF)`,
      `TOUGH/semi-TOUGH HR tendency for pitchers`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 5 quality pitchers drafted`,
      `Position if: C, SS, or 2B unfilled`,
      `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Neutral + Win Now + Balanced
    if (key === "Neutral + Win Now + Balanced") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available hitter, preferring 5T and 5E players`,
      `<strong>2nd:</strong> Best available starting pitcher`,
      `<strong>3rd:</strong> Another A+/A grade hitter`,
      `<strong>Preferences:</strong>`,
      `Players with B+ or higher hitting ratings`,
      `Balanced defensive prowess across positions`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Fewer than half the required pitchers drafted`,
      `Position if: 2B, SS, or CF unfilled`,
      `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Neutral + Win Now + Offense Focused
    if (key === "Neutral + Win Now + Offense Focused") {
      return [
      `<strong>First 3 Picks:</strong>`,
      `<strong>1st:</strong> Best available power hitter`,
      `<strong>2nd:</strong> A+/A grade hitter or if none left then an A+/A grade starting pitcher`,
      `<strong>3rd:</strong> If no pitcher yet, A+/A grade starting pitcher; otherwise, another quality hitter`,
      `<strong>Preferences:</strong>`,
      `Hitters with balanced Power/Hitting grades`,
      `A/B+ clutch ratings for power positions`,
      `<strong>Next Pick Guide:</strong>`,
      `Pitcher if: Less than 3 quality starting pitchers drafted`,
      `Position if: 1B, 3B, DH, LF or RF unfilled`,
      `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Aggressive + Farm First + Pitching Focused
    if (key === "Aggressive + Farm First + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Top-tier starting pitcher (A+ or A)`,
        `<strong>2nd:</strong> Another quality starting pitcher (A or B+ grade)`,
        `<strong>3rd:</strong> Defensive-minded catcher or shortstop (B+ or better)`,
        `<strong>Preferences:</strong>`,
        `Pitchers with excellent secondary ratings (HR tendency, clutch, etc.)`,
        `Strong defensive catchers and middle infielders`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 3 quality starters drafted`,
        `Position if: No catcher or shortstop yet`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Aggressive + Farm First + Balanced
    if (key === "Aggressive + Farm First + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available player (A+/A pitching or A+/A hitting) with no major weaknesses`,
        `<strong>2nd:</strong> Fill need for either pitching or hitting depending on the first pick`,
        `<strong>3rd:</strong> Best available player at position of greatest need`,
        `<strong>Preferences:</strong>`,
        `Well-rounded players who can contribute immediately`,
        `Top-notch defense up the middle (C, 2B, SS, CF)`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Fewer pitchers than position players drafted`,
        `Position if: Fewer position players than pitchers drafted`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Aggressive + Farm First + Offense Focused
    if (key === "Aggressive + Farm First + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Power hitter (B+ or better) with solid defense (C or better)`,
        `<strong>2nd:</strong> Quality starting pitcher (A or B+ grade)`,
        `<strong>3rd:</strong> Another offensive player (B+ or better hitter, preferring 5T/5E players)`,
        `<strong>Preferences:</strong>`,
        `Balanced hitting (both Power and Hitting grades similar)`,
        `Pitchers with TOUGH/semi-TOUGH HR tendency`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 3 quality starters drafted`,
        `Position if: 1B, 3B, LF, RF, or DH unfilled`,
        `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Aggressive + Mixed + Pitching Focused
    if (key === "Aggressive + Mixed + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available starting pitcher (A+ or A)`,
        `<strong>2nd:</strong> Another quality starter (A or B+ grade)`,
        `<strong>3rd:</strong> Defensive catcher or shortstop (B+ or better)`,
        `<strong>Preferences:</strong>`,
        `Balanced defensive roster with no major weaknesses`,
        `Clutch rating of B or better for key offensive positions`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 4 pitchers drafted or no closer yet`,
        `Position if: No catcher or middle infielders yet`,
        `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Aggressive + Mixed + Balanced
    if (key === "Aggressive + Mixed + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available player (A+/A pitching or A+/A hitting) with no weaknesses`,
        `<strong>2nd:</strong> Fill need for either pitching or hitting depending on the first pick`,
        `<strong>3rd:</strong> Best available player at the position with greatest need`,
        `<strong>Preferences:</strong>`,
        `Well-rounded players with few weaknesses`,
        `Prefer players with strong development history or upside potential`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Pitching depth still lacking or quality options available`,
        `Position if: Any starting role still unfilled`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Aggressive + Mixed + Offense Focused
    if (key === "Aggressive + Mixed + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Power hitter or high average hitter with clutch (B or better)`,
        `<strong>2nd:</strong> Starting pitcher with quality secondary ratings (HR tendency, clutch)`,
        `<strong>3rd:</strong> Defensive-minded catcher or center fielder`,
        `<strong>Preferences:</strong>`,
        `Avoid extreme low defensive ratings`,
        `Prioritize lineup depth and plate discipline`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Only one or fewer pitchers drafted so far`,
        `Position if: Lineup still lacks run producers`,
        `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Aggressive + Win Now + Pitching Focused
    if (key === "Aggressive + Win Now + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available starting pitcher (A+ or A)`,
        `<strong>2nd:</strong> Another quality starting pitcher (A or B+ grade)`,
        `<strong>3rd:</strong> Power hitter (B+ or better) at power position`,
        `<strong>Preferences:</strong>`,
        `A/B+ clutch rating for power positions`,
        `TOUGH/semi-TOUGH HR tendency for pitchers`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 5 quality pitchers drafted`,
        `Position if: C, SS, or 2B unfilled`,
        `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Aggressive + Win Now + Balanced
    if (key === "Aggressive + Win Now + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available hitter, preferring 5T and 5E players`,
        `<strong>2nd:</strong> Best available starting pitcher`,
        `<strong>3rd:</strong> Another A+/A grade hitter`,
        `<strong>Preferences:</strong>`,
        `Players with B+ or higher hitting ratings`,
        `Balanced defensive prowess across positions`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Fewer than half the required pitchers drafted`,
        `Position if: 2B, SS, or CF unfilled`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Aggressive + Win Now + Offense Focused
    if (key === "Aggressive + Win Now + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available power hitter`,
        `<strong>2nd:</strong> A+/A grade hitter or if none left, then an A+/A grade starting pitcher`,
        `<strong>3rd:</strong> If no pitcher yet, A+/A grade starting pitcher; otherwise, another quality hitter`,
        `<strong>Preferences:</strong>`,
        `Hitters with balanced Power/Hitting grades`,
        `A/B+ clutch ratings for power positions`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 3 quality starting pitchers drafted`,
        `Position if: 1B, 3B, DH, LF or RF unfilled`,
        `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }


    return ["??"];
  }
}

export default LeagueFacade;