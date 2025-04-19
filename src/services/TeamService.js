import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';
import util from "src/custom/utilities/util";
import playerService from "src/services/PlayerService";

class TeamService {
  static async saveTeam(team) {
    team = { ...team, teamId: team.teamId ?? uuidv4() };
    return await db.teams.put(team);
  }

  // Update these next two methods to pull all the players with a count of 
  static async getPlayers(seasonId, teamId) {
    let players = await db.players.where("[seasonId+teamId]")
      .equals([seasonId, teamId])
      .toArray();

    return players;
  }

  static async getSeasonPositionPlayers(seasonId, teamId) {
    let players = await db.players.where("[seasonId+teamId]")
      .equals([seasonId, teamId])
      .and((player) => ['1B', '2B', '3B', 'SS', 'DH', 'OF', 'C'].includes(player.position))
      .toArray();

    players = players.sort((a, b) => {
      const order = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];
      return order.indexOf(a.position) - order.indexOf(b.position);
    });

    return players;
  }

  static async getSeasonPitchers(seasonId, teamId) {
    let players = await db.players.where("[seasonId+teamId]")
      .equals([seasonId, teamId])
      .and((player) => ['SP', 'RP', 'CL'].includes(player.position))
      .toArray();

    players = players.sort((a, b) => {
      const order = ['SP', 'RP', 'CL'];
      return order.indexOf(a.position) - order.indexOf(b.position);
    });

    return players;
  }

  static async getSeasonTeams(seasonId, sorter = null) {
    // teams has a dexie store and so does gm.  Get the teams that match the seasonId, along with a property for the gm
    let teams = await db.teams.where("seasonId")
      .equals(seasonId)
      .toArray();
    // get the gm for each team

    for (let i = 0; i < teams.length; i++) {
      let gm = await db.generalManagers.where("generalManagerId")
        .equals(teams[i].gmId)
        .first();
      teams[i].gm = gm;
    }

    if (sorter) {
      teams = teams.sort(sorter);
    } else {
      teams = teams.sort((a, b) => a.city.localeCompare(b.city));
    }

    return teams;
  }

  static generateTeam() {

    let positionCounts = {
      "C": 1,
      "1B": 1,
      "2B": 1,
      "SS": 1,
      "3B": 1,
      "OF": 3,
      "DH": 1
    }

    let pitcherCounts = {
      "SP": 6,
      "RP": 4,
      "CL": 1,
    }

    var powerTotal = 0;
    var hittingTotal = 0;
    var defenseTotal = 0;

    // iterate over the position counts and run the generate player
    //let player = playerService.generatePositionPlayer("C");
    let positionPlayers = [];
    for (let position in positionCounts) {
      for (let i = 0; i < positionCounts[position]; i++) {
        let player = playerService.generatePositionPlayer(position);
        powerTotal += player.powerValue;
        hittingTotal += player.hittingValue;
        defenseTotal += player.defenseValue;

        positionPlayers.push(player);
      }
    }

    var bullPenValue = 0;
    var bullpenCount = 0;
    let p = [];
    for (let position in pitcherCounts) {
      for (let i = 0; i < pitcherCounts[position]; i++) {
        let player = playerService.generatePitcher(position);
        pitchers.push(player);

        if (position == "RP") {
          bullpenCount++;
          bullPenValue += player.value;
        }
      }
    }

    var defenseQuality = this.getDefenseQuality(defenseTotal);
    var qualities = {
      power: this.getPowerQuality(powerTotal),
      scoring: this.getScoringQuality(hittingTotal, powerTotal),
      defense: defenseQuality,
      isSlick: this.isSlick(defenseQuality)
    }

    var bullpenAverage = Math.round(bullPenValue / bullpenCount);

    return { qualities, positionPlayers, pitchers, bullpenGrade: this.valueToGrade(bullpenAverage) };
  }

  static valueToGrade(value) {
    switch (value) {
      case 7: return "A+"; break;
      case 6: return "A"; break;
      case 5: return "B+"; break;
      case 4: return "B"; break;
      case 3: return "C"; break;
      case 2: return "D"; break;
      case 1: return "F"; break;
    }

    return "??";
  }

  static powerToValue(power) {
    switch (power) {
      case "STRONG": return 7; break;
      case "STRONG•": return 6; break;
      case "NO DESIGNATION": return 5; break;
      case "WEAK•": return 4; break;
      case "WEAK": return 3; break;
    }
    return 0;
  }

  static powerTendencyToValue(power) {
    switch (power) {
      case "TOUGH": return 7; break;
      case "TOUGH•": return 6; break;
      case "NO DESIGNATION": return 5; break;
      case "SHAKY•": return 4; break;
      case "SHAKY": return 3; break;
    }
    return 0;
  }


  // Move this and other player functions to the playerService
  // It's here because these are mainly used for determining 
  // team qualities.  However, they are specific to players.
  static incrementGrade(currentGrade, addValue = 1) {
    let currentValue = this.gradeToValue(currentGrade);
    let newValue = Math.min(currentValue + addValue, 7);
    return this.valueToGrade(newValue);
  }

  static gradeToValue(grade) {
    switch (grade) {
      case "A+": return 7; break;
      case "A": return 6; break;
      case "B+": return 5; break;
      case "B": return 4; break;
      case "C": return 3; break;
      case "D": return 2; break;
      case "F": return 1; break;
    }
    return 0;
  }

  static getDefenseQuality(points) {
    if (points > 42) {
      return "SOLID";
    } else if (points >= 40 && points <= 42) {
      return "SOLID•";
    } else if (points >= 30 && points <= 39) {
      return "neutral";
    } else if (points >= 27 && points <= 29) {
      return "POROUS•";
    } else {
      return "POROUS";
    }
  }

  static isSlick(fieldingGrade) {
    let roll = util.rollTensOnes();

    if (roll >= 11 && roll <= 36) {
      return false;
    } else if (roll >= 41 && roll <= 44) {
      return fieldingGrade == "POROUS" || fieldingGrade == "POROUS•";
    } else if (roll >= 45 && roll <= 54) {
      return fieldingGrade == "neutral";
    } else if (roll >= 55 && roll <= 66) {
      return fieldingGrade == "SOLID" || fieldingGrade == "SOLID•";
    }
  }

  static getScoringQuality(hittingPoints, powerPoints) {
    var powerBoost = 0;
    if (powerPoints == "STRONG") powerBoost = 6;
    else if (powerPoints == "STRONG•") powerBoost = 3;

    var adjustedHittingPoints = hittingPoints + powerBoost;
    var quality = "";
    if (adjustedHittingPoints > 42) quality = "HIGH";
    else if (adjustedHittingPoints >= 40 && adjustedHittingPoints <= 42) quality = "HIGH•";
    else if (adjustedHittingPoints >= 30 && adjustedHittingPoints <= 39) quality = "neutral";
    else if (adjustedHittingPoints >= 27 && adjustedHittingPoints <= 29) quality = "LOW•";
    else quality = "LOW";

    return quality;
  }

  static getPowerQuality(points) {
    if (points > 36) {
      return "STRONG";
    } else if (points >= 34 && points <= 36) {
      return "STRONG•";
    } else if (points >= 30 && points <= 33) {
      return "neutral";
    } else if (points >= 27 && points <= 29) {
      return "WEAK•";
    } else {
      return "WEAK";
    }
  }

  // Season Specific
  static async saveSeasonTeam(seasonTeam) {
    seasonTeam = { ...seasonTeam, teamId: seasonTeam.teamId ?? uuidv4() };
    return await db.teams.put(seasonTeam);
  }

  static async getSeasonTeam(seasonId, teamId) {
    let seasonTeam = await db.teams.where("[seasonId+teamId]")
      .equals([seasonId, teamId])
      .first();

    return seasonTeam;
  }
}

export default TeamService;