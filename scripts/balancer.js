const fs = require('fs');
const path = require('path');

// Directory path of your JSON files
const jsonDirPathEnemies = 'tempdata/enemies';
const jsonDirPathAllies = 'tempdata/allies';

// Function to import all JSON files from a directory
function importJsonFiles(dirPath) {
    // Object to hold all your JSON data
    let jsonData = [];

    // Read directory contents
    const files = fs.readdirSync(dirPath);

    // Loop through all files in the directory
    for (const file of files) {
        // Only process .json files
        if (path.extname(file) === '.json') {
            // Construct full file path
            const filePath = path.join(dirPath, file);

            // Read file and parse JSON
            const fileContents = fs.readFileSync(filePath, 'utf8');
            jsonData.push(JSON.parse(fileContents));
        }
    }

    return jsonData;
}


class Actor{
    constructor(name, stats, actions){
        this.name = name;
        this.stats = stats;
        this.abilities = actions;
    }
}

function getAllAbilityValues(data) {
    const values = {};
    const abilities = data.system.abilities;
  
    for (const ability in abilities) {
      if (abilities.hasOwnProperty(ability)) {
        values[ability] = abilities[ability].value;
      }
    }
  
    return values;
  }

function initializeAndLoadActors(){
    const allJsonData = importJsonFiles(jsonDirPathEnemies);
    let actors = []
    // import enemies
    allJsonData.forEach(jsondata =>
        {
            let name = jsondata.name
            let stats = getAllAbilityValues(jsondata)
            stats["ac"] = jsondata.system.attributes.ac.flat
            stats["hp"] = jsondata.system.attributes.hp.value
            let actions = jsondata.items
            actors.push(new Actor(name, stats, actions))
        }
    )
    return actors
}

const actors = initializeAndLoadActors()

actors.forEach(actor => {
    console.log(actor.name, actor.stats)
})

    