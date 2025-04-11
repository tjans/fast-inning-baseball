import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';

export default {
    rollD6: function () {
        return Math.floor(Math.random() * 6) + 1;
    },

    rollTensOnes: function () {
        const roll1 = this.rollD6();
        const roll2 = this.rollD6();
        return roll1 * 10 + roll2;
    },

    getChartResult(chart, roll, property) {
        const entry = chart.find(({ min, max }) => roll >= min && roll <= max);
        return entry ? entry[property] : "??";
    }
}