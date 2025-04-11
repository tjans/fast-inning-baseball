class NameService {
        static async loadJSON (filePath) {
        const response = await fetch(filePath);  // use fs.readFileSync in Node.js
        const data = await response.json();
        return data;
      }; 

      static async generateRandomName (firstNames, lastNames) {
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        return {
            firstName: randomFirstName,
            lastName: randomLastName
        };
      };

      static async selectEthnicity () {
        const rand = Math.random() * 100;
        if (rand < 60) return 'american';
        if (rand < 70) return 'african';
        if (rand < 97) return 'latin';
        return 'japanese';  // 3% chance for Japanese
      };

      static async generateName () {
        // Select ethnicity based on probabilities
        const ethnicity = await this.selectEthnicity();
        let firstNamesFile, lastNamesFile;

        // Define file paths based on ethnicity
        switch (ethnicity) {
            case 'american':
            firstNamesFile = 'american_first_names.json';
            lastNamesFile = 'american_last_names.json';
            break;
            case 'african':
            firstNamesFile = 'african_first_names.json';
            lastNamesFile = 'african_last_names.json';
            break;
            case 'latin':
            firstNamesFile = 'latin_first_names.json';
            lastNamesFile = 'latin_last_names.json';
            break;
            case 'japanese':
            firstNamesFile = 'japanese_first_names.json';
            lastNamesFile = 'japanese_last_names.json';
            break;
            default:
            throw new Error('Invalid ethnicity: ' + ethnicity);
        }

        // Load the JSON files for first and last names
        const firstNames = await this.loadJSON(`/names/${firstNamesFile}`);
        const lastNames = await this.loadJSON(`/names/${lastNamesFile}`);

        // Generate and return the random full name as an object
        return await this.generateRandomName(firstNames, lastNames);
      }
}
  
export default NameService;