import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';
import util from "src/custom/utilities/util";
import teamService from "src/services/TeamService";

class PlayerService {
  static async savePlayer(player) {
    player = { ...player, playerId: player.playerId ?? uuidv4() };
    return await db.players.put(player);
  }

  static async getSeasonPlayer(seasonId, playerId) {
    return await db.players
      .where('[seasonId+playerId]')
      .equals([seasonId, playerId])
      .first();
  }

  static async saveSeasonPlayer(seasonPlayer) {
    seasonPlayer = { ...seasonPlayer, playerId: seasonPlayer.playerId ?? uuidv4() };
    return await db.players.put(seasonPlayer);
  }

  static getArchetypeCeilings(archetype) {
    if (archetype == "5E") {
      return {
        gradeCeiling: 7,
        clutchCeiling: 6,
        powerCeiling: 6,
        defenseCeiling: 6,
      }

    } else if (archetype == "5T") {
      return {
        gradeCeiling: 6,
        clutchCeiling: 6,
        powerCeiling: 5,
        defenseCeiling: 5,
      }
    } else if (archetype == "HK") {
      return {
        gradeCeiling: 5,
        clutchCeiling: 4,
        powerCeiling: 7,
        defenseCeiling: 3,
      }
    } else if (archetype == "HE") {
      return {
        gradeCeiling: 7,
        clutchCeiling: 6,
        powerCeiling: 4,
        defenseCeiling: 4,
      }
    } else if (archetype == "DS") {
      return {
        gradeCeiling: 4,
        clutchCeiling: 6,
        powerCeiling: 3,
        defenseCeiling: 7,
      }
    } else if (archetype == "JM") {
      return {
        gradeCeiling: 4,
        clutchCeiling: 6,
        powerCeiling: 4,
        defenseCeiling: 4,
      }
    }


    return {};
  }


  // get the latest season players by draft date descending
  static async getRecentlyDraftedPlayers(seasonId, limit = null) {
    let players = await db.players
      .where("seasonId").equals(seasonId)
      .and((seasonPlayer) => {
        return seasonPlayer.draftDate && !isNaN(new Date(seasonPlayer.draftDate).getTime());
      })
      .sortBy("draftDate");

    if (limit) {
      players = players.slice(-limit);
    }

    const teams = await teamService.getSeasonTeams(seasonId);
    players = players.reverse().map(player => {
      const team = teams.find(team => team.teamId === player.teamId);
      return { player, team };
    });

    return players;
  }



  // #region All Players
  static generateAge() {
    const roll = util.rollTensOnes();

    let ages = [
      { min: 11, max: 11, age: 21 },
      { min: 12, max: 12, age: 22 },
      { min: 13, max: 14, age: 23 },
      { min: 15, max: 16, age: 24 },
      { min: 21, max: 23, age: 25 },
      { min: 24, max: 26, age: 26 },
      { min: 31, max: 33, age: 27 },
      { min: 34, max: 41, age: 28 },
      { min: 42, max: 44, age: 29 },
      { min: 45, max: 52, age: 30 },
      { min: 53, max: 55, age: 31 },
      { min: 56, max: 62, age: 32 },
      { min: 63, max: 64, age: 33 },
      { min: 65, max: 65, age: 34 },
      { min: 66, max: 66, age: 35 }
    ]

    return util.getChartResult(ages, roll, 'age');

  }

  static getGradeValue(grade) {
    switch (grade) {
      case 'A+': return 7;
      case 'A': return 6;
      case 'B+': return 5;
      case 'B': return 4;
      case 'C': return 3;
      case 'D': return 2;
      case 'F': return 1;
    }
  }
  // #endregion

  // #region Pitchers
  static generatePitcherGrade() {
    let pitcherGrades = [
      { min: 11, max: 12, grade: 'F' },
      { min: 13, max: 16, grade: 'D' },
      { min: 21, max: 31, grade: 'C' },
      { min: 32, max: 46, grade: 'B' },
      { min: 51, max: 61, grade: 'B+' },
      { min: 62, max: 64, grade: 'A' },
      { min: 65, max: 66, grade: 'A+' }
    ];

    const roll = util.rollTensOnes();
    return util.getChartResult(pitcherGrades, roll, 'grade');
  }

  static powerTendencyToValue(tendency) {
    switch (tendency) {
      case 'SHAKY': return 1;
      case 'SHAKY•': return 2;
      case 'neutral': return 3;
      case 'TOUGH•': return 4;
      case 'TOUGH': return 5;
    }
  }

  static powerTendencyToGrade(tendency) {
    switch (tendency) {
      case 1: return 'SHAKY';
      case 2: return 'SHAKY•';
      case 3: return 'neutral';
      case 4: return 'TOUGH•';
      case 5: return 'TOUGH';
    }
  }

  static generatePowerTendency() {
    let powerTendencies = [
      { min: 11, max: 13, tendency: 'SHAKY' },
      { min: 14, max: 23, tendency: 'SHAKY•' },
      { min: 24, max: 55, tendency: 'neutral' },
      { min: 56, max: 63, tendency: 'TOUGH•' },
      { min: 64, max: 66, tendency: 'TOUGH' }
    ]

    const roll = util.rollTensOnes();
    return util.getChartResult(powerTendencies, roll, 'tendency');
  }

  static generateStamina(position) {
    let stamina = 0;
    let roll = util.rollTensOnes();

    let staminas = [];

    if (position === 'SP') {
      staminas = [
        { min: 11, max: 15, stamina: 5 },
        { min: 16, max: 61, stamina: 6 },
        { min: 62, max: 66, stamina: 7 }
      ]
    } else if (position === 'CL' || position === 'RP') {
      staminas = [
        { min: 11, max: 64, stamina: 1 },
        { min: 65, max: 66, stamina: 2 }
      ]
    }

    return util.getChartResult(staminas, roll, 'stamina');
  }

  static generatePitcher(position) {
    let grade = this.generatePitcherGrade();
    let value = this.getGradeValue(grade);

    return {
      age: this.generateAge(),
      position,
      grade,
      value,
      powerTendency: this.generatePowerTendency(),
      stamina: this.generateStamina(position)
    }
  }
  // #endregion


  // #region Position Players
  static generatePositionPlayer(position) {
    // hitting, power, defense, clutch, all based off of archetype
    let arch = this.generatePositionPlayerArchetype(position);

    let powerGrade = this.generatePowerGrade(arch);
    let powerValue = this.getGradeValue(powerGrade);
    let hittingGrade = this.generateHittingGrade(arch);
    let hittingValue = this.getGradeValue(hittingGrade);
    let defenseGrade = this.generateDefenseGrade(arch);
    let defenseValue = this.getGradeValue(defenseGrade);
    let clutchGrade = this.generateClutchGrade(arch);
    let clutchValue = this.getGradeValue(clutchGrade);

    return {
      position: position,
      age: this.generateAge(),
      archetype: arch,
      grade: hittingGrade,
      powerGrade,
      defenseGrade,
      clutchGrade,

      hittingValue,
      powerValue,
      defenseValue,
      clutchValue
    }
  }

  static generateHittingGrade(archetype) {
    let chart = [];

    switch (archetype) {
      case '5E':
        chart = [
          { min: 11, max: 14, grade: 'B' },
          { min: 15, max: 34, grade: 'B+' },
          { min: 35, max: 54, grade: 'A' },
          { min: 55, max: 66, grade: 'A+' }
        ];
        break;
      case '5T':
        chart = [
          { min: 11, max: 12, grade: 'B' },
          { min: 13, max: 36, grade: 'B+' },
          { min: 41, max: 66, grade: 'A' }
        ];
        break;
      case 'JM':
        chart = [
          { min: 11, max: 11, grade: 'F' },
          { min: 12, max: 14, grade: 'D' },
          { min: 15, max: 41, grade: 'C' },
          { min: 42, max: 66, grade: 'B' }
        ];
        break;
      case 'DS':
        chart = [
          { min: 11, max: 16, grade: 'F' },
          { min: 21, max: 33, grade: 'D' },
          { min: 34, max: 43, grade: 'C' },
          { min: 44, max: 66, grade: 'B' }
        ];
        break;
      case 'HE':
        chart = [
          { min: 11, max: 21, grade: 'B' },
          { min: 22, max: 42, grade: 'B+' },
          { min: 43, max: 56, grade: 'A' },
          { min: 61, max: 66, grade: 'A+' }
        ];
        break;
      case 'HK':
        chart = [
          { min: 11, max: 14, grade: 'D' },
          { min: 15, max: 34, grade: 'C' },
          { min: 35, max: 44, grade: 'B' },
          { min: 45, max: 66, grade: 'B+' }
        ];
        break;
    }

    const roll = util.rollTensOnes();
    return util.getChartResult(chart, roll, 'grade');
  }

  static generatePowerGrade(archetype) {
    let chart = [];

    switch (archetype) {
      case '5E':
        chart = [
          { min: 11, max: 21, grade: 'B' },
          { min: 22, max: 54, grade: 'B+' },
          { min: 55, max: 66, grade: 'A' },
        ];
        break;
      case '5T':
        chart = [
          { min: 11, max: 31, grade: 'B' },
          { min: 32, max: 66, grade: 'B+' }
        ];
        break;
      case 'JM':
        chart = [
          { min: 11, max: 12, grade: 'F' },
          { min: 13, max: 23, grade: 'D' },
          { min: 24, max: 63, grade: 'C' },
          { min: 64, max: 66, grade: 'B' }
        ];
        break;
      case 'DS':
        chart = [
          { min: 11, max: 11, grade: 'F' },
          { min: 12, max: 23, grade: 'D' },
          { min: 24, max: 64, grade: 'C' },
          { min: 65, max: 66, grade: 'B' }
        ];
        break;
      case 'HE':
        chart = [
          { min: 11, max: 15, grade: 'F' },
          { min: 16, max: 31, grade: 'D' },
          { min: 32, max: 46, grade: 'C' },
          { min: 51, max: 66, grade: 'B' }
        ];
        break;
      case 'HK':
        chart = [
          { min: 11, max: 31, grade: 'B+' },
          { min: 32, max: 54, grade: 'A' },
          { min: 55, max: 66, grade: 'A+' }
        ];
        break;
    }

    const roll = util.rollTensOnes();
    return util.getChartResult(chart, roll, 'grade');
  }

  static generateDefenseGrade(archetype) {
    let chart = [];

    switch (archetype) {
      case '5E':
        chart = [
          { min: 11, max: 16, grade: 'B' },
          { min: 21, max: 46, grade: 'B+' },
          { min: 51, max: 66, grade: 'A' },
        ];
        break;
      case '5T':
        chart = [
          { min: 11, max: 16, grade: 'B' },
          { min: 21, max: 56, grade: 'B+' },
          { min: 61, max: 66, grade: 'A' },
        ];
        break;
      case 'JM':
        chart = [
          { min: 11, max: 11, grade: 'F' },
          { min: 12, max: 14, grade: 'D' },
          { min: 15, max: 31, grade: 'C' },
          { min: 32, max: 66, grade: 'B' }
        ];
        break;
      case 'DS':
        chart = [
          { min: 11, max: 31, grade: 'B+' },
          { min: 32, max: 53, grade: 'A' },
          { min: 54, max: 66, grade: 'A+' }
        ];
        break;
      case 'HE':
        chart = [
          { min: 11, max: 11, grade: 'F' },
          { min: 12, max: 15, grade: 'D' },
          { min: 16, max: 24, grade: 'C' },
          { min: 25, max: 46, grade: 'B' },
          { min: 51, max: 66, grade: 'B+' }
        ];
        break;
      case 'HK':
        chart = [
          { min: 11, max: 22, grade: 'F' },
          { min: 23, max: 34, grade: 'D' },
          { min: 35, max: 66, grade: 'C' }
        ];
        break;
    }



    const roll = util.rollTensOnes();
    return util.getChartResult(chart, roll, 'grade');
  }

  static generateClutchGrade(archetype) {
    let chart = [];

    switch (archetype) {
      case '5E':
        chart = [
          { min: 11, max: 16, grade: 'D' },
          { min: 21, max: 26, grade: 'C' },
          { min: 31, max: 46, grade: 'B' },
          { min: 51, max: 56, grade: 'B+' },
          { min: 61, max: 66, grade: 'A' }
        ];
        break;
      case '5T':
        chart = [
          { min: 11, max: 16, grade: 'D' },
          { min: 21, max: 26, grade: 'C' },
          { min: 31, max: 46, grade: 'B' },
          { min: 51, max: 56, grade: 'B+' },
          { min: 61, max: 66, grade: 'A' }
        ];
        break;
      case 'JM':
        chart = [
          { min: 11, max: 16, grade: 'F' },
          { min: 21, max: 26, grade: 'D' },
          { min: 31, max: 36, grade: 'C' },
          { min: 41, max: 46, grade: 'B' },
          { min: 51, max: 56, grade: 'B+' },
          { min: 61, max: 66, grade: 'A' }
        ];
        break;
      case 'DS':
        chart = [
          { min: 11, max: 16, grade: 'D' },
          { min: 21, max: 26, grade: 'C' },
          { min: 31, max: 46, grade: 'B' },
          { min: 51, max: 56, grade: 'B+' },
          { min: 61, max: 66, grade: 'A' }
        ];
        break;
      case 'HE':
        chart = [
          { min: 11, max: 16, grade: 'D' },
          { min: 21, max: 26, grade: 'C' },
          { min: 31, max: 46, grade: 'B' },
          { min: 51, max: 56, grade: 'B+' },
          { min: 61, max: 66, grade: 'A' }
        ];
        break;
      case 'HK':
        chart = [
          { min: 11, max: 12, grade: 'F' },
          { min: 13, max: 26, grade: 'D' },
          { min: 31, max: 46, grade: 'C' },
          { min: 51, max: 66, grade: 'B' }
        ];
        break;
    }



    const roll = util.rollTensOnes();
    return util.getChartResult(chart, roll, 'grade');
  }

  static generatePositionPlayerArchetype(position) {

    let catchers = [
      { min: 11, max: 26, archetype: 'JM' },
      { min: 31, max: 44, archetype: 'DS' },
      { min: 45, max: 53, archetype: 'HE' },
      { min: 54, max: 65, archetype: 'HK' },
      { min: 66, max: 66, archetype: '5T' }
    ]

    let firstBasemen = [
      { min: 11, max: 24, archetype: 'JM' },
      { min: 25, max: 34, archetype: 'DS' },
      { min: 35, max: 51, archetype: 'HE' },
      { min: 52, max: 63, archetype: 'HK' },
      { min: 64, max: 66, archetype: '5T' }
    ]

    let secondBasemen = [
      { min: 11, max: 32, archetype: 'JM' },
      { min: 33, max: 54, archetype: 'DS' },
      { min: 55, max: 61, archetype: 'HE' },
      { min: 62, max: 64, archetype: 'HK' },
      { min: 65, max: 66, archetype: '5T' }
    ]

    let shortstops = [
      { min: 11, max: 32, archetype: 'JM' },
      { min: 33, max: 53, archetype: 'DS' },
      { min: 54, max: 61, archetype: 'HE' },
      { min: 62, max: 64, archetype: 'HK' },
      { min: 65, max: 66, archetype: '5T' }
    ]

    let thirdBasemen = [
      { min: 11, max: 23, archetype: 'JM' },
      { min: 24, max: 34, archetype: 'DS' },
      { min: 35, max: 51, archetype: 'HE' },
      { min: 52, max: 61, archetype: 'HK' },
      { min: 62, max: 66, archetype: '5T' }
    ]

    let outfielders = [
      { min: 11, max: 26, archetype: 'JM' },
      { min: 31, max: 36, archetype: 'DS' },
      { min: 41, max: 52, archetype: 'HE' },
      { min: 53, max: 61, archetype: 'HK' },
      { min: 62, max: 66, archetype: '5T' }
    ]

    let designatedHitters = [
      { min: 11, max: 26, archetype: 'JM' },
      { min: 31, max: 56, archetype: 'HE' },
      { min: 61, max: 66, archetype: 'HK' }
    ]

    let chart = [];
    switch (position) {
      case 'C': chart = catchers; break;
      case '1B': chart = firstBasemen; break;
      case '2B': chart = secondBasemen; break;
      case 'SS': chart = shortstops; break;
      case '3B': chart = thirdBasemen; break;
      case 'OF': chart = outfielders; break;
      case 'DH': chart = designatedHitters; break;
    }

    const roll = util.rollTensOnes();
    let archetype = util.getChartResult(chart, roll, 'archetype');
    //archetype = "5T";
    if (archetype === '5T') {
      const eliteRoll = util.rollTensOnes();
      if (eliteRoll >= 51) {
        archetype = '5E';
      }
    }

    return archetype;
  }

  // #endregion
}

export default PlayerService;