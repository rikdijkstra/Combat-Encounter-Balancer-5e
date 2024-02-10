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
    constructor(name, type, stats, actions, spellSlots, legendaryActions){
        this.name = name;
        this.type = type;
        this.stats = stats;
        this.actions = actions;
        this.spellSlots = spellSlots;
        this.legendaryActions = legendaryActions;
    }
}

class Action{
    // str, int, [action, bonusaction, legendary, spellslotlevel] e.g.[1, 0, 0, 2] for a 2nd level spell, or [1, 0, 0, -1] for a regular attack
    constructor(name, damage, cost){
        this.name = name;
        this.damage = damage;
        this.cost = cost
    }
}

function runSimulations(allies, enemies, amount=1000){

}

function getMod(score){
    return Math.floor((score-10)/2);
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

function acFromAcEffects(acEffects, dex = 0){
    var value = acEffects[0].changes[acEffects[0].changes.length - 1].value
    if (typeof value === 'number' && Number.isInteger(value)){
        return value
    }
    else if (typeof value === 'string' && value.includes("+")){
        let split = value.split("+")
        const acvalue = split[0]
        const mod = split[split.length - 1]
        if (mod.includes("dex")){
            return parseInt(acvalue) + getMod(dex)
        }
        else{
            console.error("No dex in formula, unsure what to do. Formula:", value)
        }
    }
}

function initializeAndLoadActors(){
    const enemyJsonData = importJsonFiles(jsonDirPathEnemies);
    const allyJsonData = importJsonFiles(jsonDirPathAllies);
    let enemies = []
    let allies = []
    // import enemies
    enemyJsonData.forEach(jsondata =>
        {
            let name = jsondata.name
            let stats = getAllAbilityValues(jsondata)
            stats["ac"] = jsondata.system.attributes.ac.flat
            stats["hp"] = jsondata.system.attributes.hp.value
            let actions = jsondata.items
            enemies.push(new Actor(name, "enemy", stats, actions))
        }
    )
    // import allies
    allyJsonData.forEach(jsondata =>
        {
            let name = jsondata.name
            let stats = getAllAbilityValues(jsondata)
            let acEffects = jsondata.flags.ddbimporter.acEffects
            stats["ac"] = acFromAcEffects(acEffects, stats.dex)
            stats["hp"] = jsondata.system.attributes.hp.value
            let actions = jsondata.items
            allies.push(new Actor(name, "enemy", stats, actions))
        }
    )
    return {"enemies": enemies, "allies": allies}
}

const actors = initializeAndLoadActors()

actors.allies.forEach(actor => {
    console.log(actor.name, actor.stats)
})

    