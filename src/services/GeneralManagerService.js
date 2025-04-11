import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';
import util from "src/custom/utilities/util";

class GeneralManagerService {
    static saveGeneralManager(generalManager) {
        generalManager = { ...generalManager, generalManagerId: generalManager.generalManagerId ?? uuidv4() };
        return db.generalManagers.put(generalManager);
      }
 
  
    static generate() {
      return {
        riskTolerance: this.generateRiskTolerance(),
        developmentFocus: this.generateDevelopmentFocus(),
        teamBuildingStrategy: this.generateTeamBuildingStrategy(),
      };
    }

    static risks = {
      CONSERVATIVE: 1,
      NEUTRAL: 2,
      AGGRESSIVE: 3,
    };

    static developmentFocuses = {
      FARM_FIRST: 1,
      MIXED: 2,
      WIN_NOW: 3,
    };
  
    static teamBuildingStrategy = {
      PITCHING_FOCUSED: 1,
      BALANCED: 2,
      OFFENSE_FOCUSED: 3,
    };

    static teamBuildingStrategyToString(strategy) {
      switch (strategy) {
        case this.teamBuildingStrategy.PITCHING_FOCUSED:
          return "Pitching Focused";
        case this.teamBuildingStrategy.BALANCED:
          return "Balanced";
        case this.teamBuildingStrategy.OFFENSE_FOCUSED:
          return "Offense Focused";
        default:
          return "Unknown";
      }
    }

    static riskToString(risk) {
      switch (risk) {
        case this.risks.CONSERVATIVE:
          return "Conservative";
        case this.risks.NEUTRAL:
          return "Neutral";
        case this.risks.AGGRESSIVE:
          return "Aggressive";
        default:
          return "Unknown";
      }
    }

    static developmentFocusToString(focus) {
      switch (focus) {
        case this.developmentFocuses.FARM_FIRST:
          return "Farm First";
        case this.developmentFocuses.MIXED:
          return "Mixed";
        case this.developmentFocuses.WIN_NOW:
          return "Win Now";
        default:
          return "Unknown";
      }
    }

    static generateRiskTolerance() {
      let roll = util.rollD6();
      
      let returnValue = "??";
      if (roll <= 2) returnValue = this.risks.CONSERVATIVE;
      else if (roll <= 4) returnValue = this.risks.NEUTRAL;
      else returnValue = this.risks.AGGRESSIVE;

      return this.riskToString(returnValue);
    }

    static generateDevelopmentFocus() {
      const roll = util.rollD6();
      let returnValue = "??";
      if (roll <= 2) returnValue = this.developmentFocuses.FARM_FIRST;
      else if (roll <= 4) returnValue = this.developmentFocuses.MIXED;
      else returnValue = this.developmentFocuses.WIN_NOW;
      return this.developmentFocusToString(returnValue);
    }

    static generateTeamBuildingStrategy() {
      const roll = util.rollD6();
      let returnValue = "??";
      if (roll <= 2) returnValue = this.teamBuildingStrategy.PITCHING_FOCUSED;
      else if (roll <= 4) returnValue = this.teamBuildingStrategy.BALANCED;
      else returnValue = this.teamBuildingStrategy.OFFENSE_FOCUSED;

      return this.teamBuildingStrategyToString(returnValue);
    }

  }
  
  export default GeneralManagerService;