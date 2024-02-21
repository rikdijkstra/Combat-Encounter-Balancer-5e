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
    constructor(name, type, cost, uses, recharge, dieCount, dieSides, plus, damageType){
        this.name = name;
        this.type = type;  // type: "damage" || "health"
        this.cost = cost;  // cost: [action, bonusaction, reaction, legendary, spellslotlevel] e.g.[1, 0, 0, 2] for a 2nd level spell, or [1, 0, 0, 0] for a regular attack
        this.uses = uses;  // if uses are unlimited, -1
        this.recharge = recharge; //if it's a recharging move, the amount from which the move recharges, e.g. 5 for recharges on 5&6, else 0
        this.recharged = 1;
        this.diceCount = dieCount;
        this.dieSides = dieSides;
        this.plus = plus;
        this.damageType = damageType;
    }

    // Function to roll a single die
    rollDie(sides) {
        return Math.ceil(Math.random() * sides);
    }

    // Getter for damage / health that simulates $dieCount $dieSides-sided dice rolls
    get result() {
        let totalDamage = 0;
        for (let i = 0; i < this.diceCount; i++) {
            totalDamage += this.rollDie(this.dieSides);
        }
        return totalDamage + this.plus;
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

function getCostFromJSON(costjson, level, name){
    var cost = [0, 0, 0, 0, 0]
    const costdict = {
        "action": [1, 0, 0, 0, 0],
        "bonus": [0, 1, 0, 0, 0],
        "reaction": [0, 0, 1, 0, 0],
        "legendary": [0, 0, 0, 1, 0],
        "spelllevel": [0, 0, 0, 0, 1]
    }

    if(costjson.type == "none" || costjson.type == ""|| costjson.type == "hour" || costjson.type == "minute" || costjson.type == "special"){
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
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function getDamageFromDamageString(damageString, damageType, name){
    if (!damageType || damageString[0] == "@" || damageString[0] == "("){
        var damage = [0, 0, "0"];
        return damage;
    }
    var dieCount = damageString.split("d")[0]
    var dieSides = damageString.split("d")[1]
    if (dieSides){
        dieSides = dieSides.split(" +")[0]
        dieSides = dieSides.split("[")[0]
    }
    else{
        var damage = [0, 0, "0"];
        return damage;
    }
    if (!isNumeric(dieCount)){
        var damage = [0, 0, "0"];
        return damage;
    }
    var plus = "0"
    if (damageString.includes("+")){
        plus = damageString.split("+ ")[1]
    }

    if (dieCount && !dieSides && plus == "0"){
        plus = toString(dieCount)
    }
    var damage = [dieCount, dieSides, plus]
    return damage
}

function getActionsFromJSON(data){
    // for now we are ignoring support spells (aside from heals)
    let actions = [];
    data.forEach(a => {
        let { name, type } = a; // Directly destructure common properties
        let actionType = a.system.actionType ?? null;
        let formula = a.system.formula ?? null;
        let save = a.system.save ?? null;
        let target = a.system.target ?? null;
        let duration = a.system.duration ?? null;
        let cost = a.system.activation ? getCostFromJSON(a.system.activation, a.system.level ?? 0, name) : null;
        let description = a.system.description?.value ?? null;
        let recharge = a.system.recharge?.value ?? null;
        let uses = a.system.uses?.value ?? null;
    
        // Handling for damage
        if (a.system.damage?.parts?.length > 0) {
            let [damageString, damageType = null] = a.system.damage.parts[0];
            let [dieCount, dieSides, plus] = getDamageFromDamageString(damageString, damageType, name);
    
            // Add action only if it has damage (based on your condition)
            const costsum = cost.reduce((partialSum, a) => partialSum + a, 0);
            if ((dieCount || dieSides || plus !== "0") && costsum > 0) {
                actions.push(new Action(name, type, cost, uses, recharge, dieCount, dieSides, plus, damageType));
            }
        }
    });
  
    console.log(actions)
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
            // name, type, stats, numAttacks, actions, spellSlots, legendaryActions
            // TODO numAttacks, spellSlots, legendaryActions
            let numAttacks = 1;
            enemies.push(new Actor(name, "enemy", stats, null, getActionsFromJSON(jsondata.items), null, null))
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
            // let actions = getActionsFromJSON(jsondata.items)
            // TODO: need to set damage for monk actions / modifiers @scale.... etc.
            allies.push(new Actor(name, "enemy", stats, null, getActionsFromJSON(jsondata.items), null, null))
        }
    )
    console.log(enemies)
    console.log(allies)
    return {"enemies": enemies, "allies": allies}
}

const actors = initializeAndLoadActors()

actors.allies.forEach(actor => {
    console.log(actor.name, actor.stats, actor)
})

    