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
    constructor(name, type, stats, numAttacks, actions, spellSlots, legendaryActions){
        this.name = name;
        this.type = type; // ally or enemy
        this.stats = stats; // ability scores, hp, ac
        this.numAttacks = numAttacks; // amount of attacks
        this.actions = actions; // all available heals / actions
        this.spellSlots = spellSlots; // available spell slots
        this.legendaryActions = legendaryActions; // amount of legendary actions
    }
}

class Action{   
    constructor(name, type, cost, uses, recharge, dieCount, dieSides){
        this.name = name;
        this.type = type;  // type: "damage" || "health"
        this.cost = cost;  // cost: [action, bonusaction, reaction, legendary, spellslotlevel] e.g.[1, 0, 0, 2] for a 2nd level spell, or [1, 0, 0, 0] for a regular attack
        this.uses = uses;  // if uses are unlimited, -1
        this.recharge = recharge; //if it's a recharging move, the amount from which the move recharges, e.g. 5 for recharges on 5&6, else 0
        this.recharged = 1;
        this.diceCount = dieCount;
        this.dieSides = dieSides;
    }

    // Function to roll a single die
    rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    // Getter for damage / health that simulates $dieCount $dieSides-sided dice rolls
    get result() {
        let totalDamage = 0;
        for (let i = 0; i < this.diceCount; i++) {
            totalDamage += this.rollDie(this.dieSides);
        }
        return totalDamage;
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

function getCostFromJSON(costjson, level){
    var cost = [0, 0, 0, 0, 0]
    const costdict = {
        "action": [1, 0, 0, 0, 0],
        "bonus": [0, 1, 0, 0, 0],
        "reaction": [0, 0, 1, 0, 0],
        "legendary": [0, 0, 0, 1, 0],
        "spelllevel": [0, 0, 0, 0, 1]
    }
    // What to do with special?
    if(costjson.type == "none" || costjson.type == ""|| costjson.type == "hour" || costjson.type == "minute"){
        return cost;
    }
    
    else{
        costvalue = 0
        if(!costjson.cost == ""){
            costvalue = parseInt(costjson.cost);
        }
        
        var cost = costdict[costjson.type].map(function(x) { return x * costvalue; });
        if(level > 0){
            cost[4] += level;
        }
        return cost
    }
    // TODO: cost calc
}

function getActionsFromJSON(data){
    // for now we are ignoring support spells (aside from heals?)
    let actions = [];
    data.forEach(a => {
        let name, damageString, damageType, formula, type, actionType, uses, description, recharge, save, target, duration, cost
        name = a.name
        type = a.type
        if(Object.keys(a.system).includes("actionType")){
            actionType = a.system.actionType
        }
        if(Object.keys(a.system).includes("formula")){
            formula = a.system.formula
        }
        if(Object.keys(a.system).includes("save")){
            save = a.system.save
        }
        if(Object.keys(a.system).includes("target")){
            target = a.system.target
        }
        if(Object.keys(a.system).includes("activation")){
            level = 0
            if(Object.keys(a.system).includes("level")){
                level = a.system.level
            }
            cost = getCostFromJSON(a.system.activation, level)
        }
        if(Object.keys(a.system).includes("duration")){
            duration = a.system.duration
        }
        if (Object.keys(a.system).includes("damage") && Object.keys(a.system.damage).includes("parts") && a.system.damage.parts.length > 0){
            damageString = a.system.damage.parts[0][0]
            damageType = a.system.damage.parts[0][1]
        }
        if(Object.keys(a.system.description).includes("value")){
            description = a.system.description.value
        }
        if(Object.keys(a.system).includes("recharge") && Object.keys(a.system.recharge).includes("value")){
            recharge = a.system.recharge.value
        }
        if(Object.keys(a.system).includes("uses") && Object.keys(a.system.uses).includes("value")){
            uses = a.system.uses.value
        }

        
        actions.push(1)
            // determine how to set "type"
        // consider what to do with multiattacks (limited information available aside from description)
        
    })

    return actions
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
            if(Object.keys(jsondata.system.resources).includes("legact")){
                stats["la"] = jsondata.system.resources.legact.value
            }
            let actions = getActionsFromJSON(jsondata.items)
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
            let actions = getActionsFromJSON(jsondata.items)
            allies.push(new Actor(name, "enemy", stats, actions))
        }
    )
    return {"enemies": enemies, "allies": allies}
}

const actors = initializeAndLoadActors()

actors.allies.forEach(actor => {
    console.log(actor.name, actor.stats)
})

    