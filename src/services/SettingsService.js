import { db } from "src/db";
import { v4 as uuidv4 } from 'uuid';

export default {
    getSettings: function () {
        const settingsString = localStorage.getItem("settings");
        if (settingsString) {
            const settings = JSON.parse(settingsString);
            return settings;
        }

        return {
            useHomebrewStoppageTime: false,
        };
    },

    saveSettings: function (settings) {
        const settingsString = JSON.stringify(settings);
        localStorage.setItem("settings", settingsString);
    }
}