import { db } from "src/db";

import teamService from "src/services/TeamService";
import seasonService from "src/services/SeasonService";
import nameService from "src/services/NameService";
import gmService from "src/services/GeneralManagerService";
import playerService from "src/services/PlayerService";
import leagueService from "src/services/LeagueService";


class LeagueFacade {

  // This function should retrieve all players by position, sorted by sortString.  It needs to return a list of players who do not have a seasonTeamId set on their
  // seasonPlayers record.
  static async getUndraftedPlayers(seasonId, position) {
    // Default to offense
    var offensePositions = ['1B', '2B', '3B', 'SS', 'OF', 'DH', 'C'];
    var pitcherPositions = ['SP', 'RP', 'CL'];
    var isPitcher = pitcherPositions.includes(position) || position == "Pitchers";
    var isOffense = offensePositions.includes(position) || position == "Offense";

    let filterPositions = [];
    if (position == "Pitchers") filterPositions = pitcherPositions;
    else if (position == "Offense") filterPositions = offensePositions;
    else filterPositions = [position];


    let sorter = (a, b) => {
      if (a.grade !== b.grade) return b.grade - a.grade;

      if (isOffense && a.powerGrade !== b.powerGrade) {
        return b.powerGrade - a.powerGrade;
      }

      if (isPitcher && a.powerTendency !== b.powerTendency) {
        return b.powerTendency - a.powerTendency;
      }

      return a.age - b.age;
    }


    const seasonPlayers = await db.players
      .where("seasonId")
      .equals(seasonId)
      .filter((sp) => filterPositions.includes(sp.position))
      .filter((sp) => !sp.teamId)
      .toArray();

    seasonPlayers.sort(sorter);

    return seasonPlayers;
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
        `Well-rounded players (no more than 2 grade difference between categories)`,
        `Balance between offense and defense`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Fewer than half of required pitchers drafted`,
        `Position if: Any starting position still empty`,
        `Otherwise: Alternate pitcher/position selections`
      ];
    }

    // Conservative + Mixed + Offense Focused
    if (key === "Conservative + Mixed + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available power hitter with at least C defense`,
        `<strong>2nd:</strong> Best available starting pitcher`,
        `<strong>3rd:</strong> Another quality hitter for power position, preferring 5T/5E players`,
        `<strong>Preferences:</strong>`,
        `Balance of power and contact (similar grades in Hitting and Power)`,
        `Decent defense (C or better) even for power positions`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 3 quality pitchers drafted`,
        `Position if: 1B, 3B, or DH unfilled`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
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
        `<strong>1st:</strong> Best available power hitter`,
        `<strong>2nd:</strong> Best available hitter`,
        `<strong>3rd:</strong> Best available starting pitcher`,
        `<strong>Preferences:</strong>`,
        `Offensive producers regardless of defense`,
        `Power hitters with decent hitting grade`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 3 pitchers drafted`,
        `Position if: 1B, 3B, DH, LF, or RF unfilled`,
        `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Neutral + Mixed + Pitching Focused
    if (key === "Neutral + Mixed + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available starting pitcher`,
        `<strong>2nd:</strong> Best available closer`,
        `<strong>3rd:</strong> Best available power hitter`,
        `<strong>Preferences:</strong>`,
        `Pitchers with good HR tendency`,
        `At least one power hitter with B+ or better`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 5 pitchers drafted`,
        `Position if: No power hitter drafted yet`,
        `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Neutral + Mixed + Balanced
    if (key === "Neutral + Mixed + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available player - A+/A starting pitcher or A+/A 5E/5T hitter`,
        `<strong>2nd:</strong> Fill opposite need from 1st pick`,
        `<strong>3rd:</strong> Best player available at different position than 1st/2nd`,
        `<strong>Preferences:</strong>`,
        `Versatile players with balanced grades`,
        `Players with at least one standout category`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Fewer than half the required pitchers drafted`,
        `Position if: Any starting position still empty`,
        `Otherwise: Choose position with fewest quality players remaining`
      ];
    }

    // Neutral + Mixed + Offense Focused
    if (key === "Neutral + Mixed + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available power hitter`,
        `<strong>2nd:</strong> Best available hitter`,
        `<strong>3rd:</strong> Best available starting pitcher`,
        `<strong>Preferences:</strong>`,
        `Offense first for 1B, DH, and corner outfield`,
        `Defense can be C for power positions`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 3 pitchers drafted`,
        `Position if: 1B, 3B, DH, LF or RF unfilled`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Neutral + Win Now + Pitching Focused
    if (key === "Neutral + Win Now + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available starting pitcher`,
        `<strong>2nd:</strong> Another A+/A grade starting pitcher or B+ who is TOUGH`,
        `<strong>3rd:</strong> Best available power hitter`,
        `<strong>Preferences:</strong>`,
        `Pitchers with TOUGH HR tendency`,
        `Clutch performers at key positions`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 5 quality pitchers drafted`,
        `Position if: C, SS, 2B, or CF unfilled`,
        `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Neutral + Win Now + Balanced
    if (key === "Neutral + Win Now + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available player - A+/A starting pitcher or A+/A 5E/5T hitter`,
        `<strong>2nd:</strong> Fill opposite need from 1st pick`,
        `<strong>3rd:</strong> Best player available in position with fewest quality players remaining`,
        `<strong>Preferences:</strong>`,
        `Balance roster needs as draft progresses`,
        `Players with strong clutch ratings`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Fewer than half the required pitchers drafted`,
        `Position if: 1B, 3B, SS, or CF unfilled`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Neutral + Win Now + Offense Focused
    if (key === "Neutral + Win Now + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available 5E/5T hitter`,
        `<strong>2nd:</strong> Another A+/A grade hitter`,
        `<strong>3rd:</strong> Best starting pitcher available`,
        `<strong>Preferences:</strong>`,
        `Power and clutch over average and defense`,
        `Key offensive positions filled with A-grade talent`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 3 quality pitchers drafted`,
        `Position if: 1B, 3B, DH, LF, or RF unfilled`,
        `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Aggressive + Farm First + Pitching Focused
    if (key === "Aggressive + Farm First + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available starting pitcher`,
        `<strong>2nd:</strong> Pitcher with best grade; if there is a tie: CL > SP > RP`,
        `<strong>3rd:</strong> Best defensive catcher available`,
        `<strong>Preferences:</strong>`,
        `A+/A pitchers`,
        `Defense-first middle infielders`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 5 pitchers drafted`,
        `Position if: SS, 2B, or CF unfilled`,
        `Otherwise: Roll 1d6 (1-5: Pitcher, 6: Position player)`
      ];
    }

    // Aggressive + Farm First + Balanced
    if (key === "Aggressive + Farm First + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available 5E/5T hitter`,
        `<strong>2nd:</strong> Best available starting pitcher`,
        `<strong>3rd:</strong> Best player available regardless of position`,
        `<strong>Preferences:</strong>`,
        `Willing to accept F-grade in one category, if primary is grade is B+ or better`,
        `Younger players`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: No A+/A grade relief pitcher yet`,
        `Position if: Fewer position players than pitchers drafted`,
        `Otherwise: Take player with highest primary grade`
      ];
    }

    // Aggressive + Farm First + Offense Focused
    if (key === "Aggressive + Farm First + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available power hitter`,
        `<strong>2nd:</strong> Another A+/A power hitter or A+/A hitter`,
        `<strong>3rd:</strong> Best starting pitcher available`,
        `<strong>Preferences:</strong>`,
        `Offensive upside over defensive ability`,
        `Power over hitting for corner positions`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: No A+ grade pitcher yet`,
        `Position if: 1B, 3B, DH, LF, or RF unfilled`,
        `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Aggressive + Mixed + Pitching Focused
    if (key === "Aggressive + Mixed + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available starting pitcher`,
        `<strong>2nd:</strong> A second A+/A starting pitcher or best closer`,
        `<strong>3rd:</strong> Best defensive catcher or power hitter available`,
        `<strong>Preferences:</strong>`,
        `Prioritize completing rotation and bullpen`,
        `Will accept multiple F-grades if balanced with A+ primary grades`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 6 pitchers drafted`,
        `Position if: No catcher or power hitter yet`,
        `Otherwise: Roll 1d6 (1-5: Pitcher, 6: Position player)`
      ];
    }

    // Aggressive + Mixed + Balanced
    if (key === "Aggressive + Mixed + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> A+ starting pitcher or 5E/5T player with at least one A+ attribute`,
        `<strong>2nd:</strong> Fill opposite need from 1st pick (pitcher/position)`,
        `<strong>3rd:</strong> Another player with at least one A+ attribute`,
        `<strong>Preferences:</strong>`,
        `High variance players (mix of great and poor grades)`,
        `Risk-taking on uneven talent profiles`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Fewer A+/A pitchers than A+/A hitters`,
        `Position if: Fewer A+/A hitters than A+/A pitchers`,
        `Otherwise: Choose player with highest individual primary grade in an unfilled role`
      ];
    }

    // Aggressive + Mixed + Offense Focused
    if (key === "Aggressive + Mixed + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> A+ power hitter regardless of defense`,
        `<strong>2nd:</strong> Another A+ offensive player (power or hitter)`,
        `<strong>3rd:</strong> Best available starting pitcher`,
        `<strong>Preferences:</strong>`,
        `Power over hitting for offensive positions`,
        `Will accept defensive liability for offensive upside`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: No A+/A grade pitcher yet`,
        `Position if: 1B, 3B, DH, LF, or RF unfilled`,
        `Otherwise: Roll 1d6 (1-2: Pitcher, 3-6: Position player)`
      ];
    }

    // Aggressive + Win Now + Pitching Focused
    if (key === "Aggressive + Win Now + Pitching Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available starting pitcher`,
        `<strong>2nd:</strong> Another A+/A grade starting pitcher`,
        `<strong>3rd:</strong> Hitter with A+/A hitting rating, preferring 5E/5T player`,
        `<strong>Preferences:</strong>`,
        `Clutch performance over consistency`,
        `Will sacrifice defense for elite pitching/clutch hitting`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Less than 6 quality pitchers drafted`,
        `Position if: No A+/A clutch hitter yet`,
        `Otherwise: Roll 1d6 (1-4: Pitcher, 5-6: Position player)`
      ];
    }

    // Aggressive + Win Now + Balanced
    if (key === "Aggressive + Win Now + Balanced") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> A+/A grade player, preferring 5E/5T player`,
        `<strong>2nd:</strong> A+/A grade starting pitcher`,
        `<strong>3rd:</strong> B or better hitter with highest clutch rating available`,
        `<strong>Preferences:</strong>`,
        `Higher clutch grades preferred`,
        `Extreme grades acceptable (mix of A+ and F)`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: Fewer pitchers than position players drafted`,
        `Position if: Fewer position players than pitchers drafted`,
        `Otherwise: Roll 1d6 (1-3: Pitcher, 4-6: Position player)`
      ];
    }

    // Aggressive + Win Now + Offense Focused
    if (key === "Aggressive + Win Now + Offense Focused") {
      return [
        `<strong>First 3 Picks:</strong>`,
        `<strong>1st:</strong> Best available power hitter`,
        `<strong>2nd:</strong> Best available hitter`,
        `<strong>3rd:</strong> Best available starting pitcher`,
        `<strong>Preferences:</strong>`,
        `Power and Hitting over all other attributes`,
        `Willing to accept poor defense for elite offense/clutch`,
        `<strong>Next Pick Guide:</strong>`,
        `Pitcher if: No A+ pitcher yet or less than 3 pitchers or no closer`,
        `Position if: 1B, 3B, DH, LF, or RF unfilled`,
        `Otherwise: Roll 1d6 (1: Pitcher, 2-6: Position player)`
      ];
    }



    return ["??"];
  }

  static async setupNewLeague(data, isDraftLeague) {
    // create a new league
    let newLeague = {
      name: data.leagueName,
      numberOfTeams: data.numberOfTeams,
      numberOfGames: data.numberOfGames,
      isDraftLeague: isDraftLeague,
      year: 1
    };

    var newLeagueId = await leagueService.saveLeague(newLeague);
    var seasonId = await this.createSeason(newLeagueId);

    // iterate over each team and create all the players for the team
    for (let i = 0; i < data.numberOfTeams; i++) {
      let gmId = await this.createTeamGM(newLeagueId); a
      let teamId = await this.createTeam(i, newLeagueId, seasonId, gmId);

      // create position players
      ["C", "1B", "2B", "SS", "3B", "OF", "OF", "OF", "DH"].map(async (position) => {
        // generate a position player
        await this.createPositionPlayer(position, seasonId, isDraftLeague ? null : teamId);
      });

      // create starting pitchers
      for (let i = 0; i < 6; i++) {
        await this.createStartingPitcher(seasonId, isDraftLeague ? null : teamId);
      }

      // create relief pitchers
      for (let i = 0; i < 4; i++) {
        await this.createReliefPitcher('RP', seasonId, isDraftLeague ? null : teamId);
      }

      // create closer
      await this.createReliefPitcher('CL', seasonId, isDraftLeague ? null : teamId);
    }
  }

  static async createStartingPitcher(seasonId, teamId) {
    let pitcher = await playerService.generatePitcher("SP");

    let names = await nameService.generateName();
    let player = {
      firstName: names.firstName,
      lastName: names.lastName,
      position: "SP",
      seasonId,
      teamId,
      ...pitcher
    }
    let playerId = await playerService.savePlayer(player);
  }

  static async createReliefPitcher(position, seasonId, teamId) {
    let names = await nameService.generateName();
    let pitcher = await playerService.generatePitcher("RP");

    let player = {
      firstName: names.firstName,
      lastName: names.lastName,
      seasonId,
      teamId,
      position: "RP",
      ...pitcher,
      position
    }
    let playerId = await playerService.savePlayer(player);
  }

  static async createPositionPlayer(position, seasonId, teamId) {
    let positionPlayer = await playerService.generatePositionPlayer(position);

    let names = await nameService.generateName();
    let player = {
      firstName: names.firstName,
      lastName: names.lastName,
      position: position,
      seasonId,
      teamId,
      ...positionPlayer
    }

    await playerService.savePlayer(player);
  }

  static async createTeam(index, leagueId, seasonId, gmId) {
    // Create the team record
    let team = {
      city: `City ${index + 1}`,
      name: `Team`,
      leagueId: leagueId,
      gmId,
      seasonId,
      abbreviation: `TM${index + 1}`,
    }

    let teamId = await teamService.saveTeam(team);
    return teamId;
  }

  static async createTeamGM(leagueId) {
    // Create a GM for the team
    let gm = await gmService.generate();
    let names = await nameService.generateName();
    gm.firstName = names.firstName;
    gm.lastName = names.lastName;
    gm.leagueId = leagueId;
    let gmId = await gmService.saveGeneralManager(gm);
    return gmId;
  }

  static async createSeason(leagueId) {
    var seasonId = await seasonService.saveSeason({
      leagueId: leagueId,
      year: 1
    });

    return seasonId;
  }


}

export default LeagueFacade;