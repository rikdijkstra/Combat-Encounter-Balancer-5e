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
        this.initiative = 0;
        this.resources = [1, 1, 1, legendaryActions].concat(spellSlots);
    }

    setInitiative(){
        this.initiative = Math.ceil(Math.random() * 20) + Math.floor((this.stats.dex - 10) / 2);
    }
    
    checkDead(initiativeOrder){
        for (let i = 0; i < initiativeOrder.length; i++) {
            if (initiativeOrder[i].name == this.name){
                return false;
            }
        }    
        return true;
    }

    checkViability(action){
        if (action.uses == 0){
            return false;
        }
        const futureResources = subtract(this.resources, action.cost);
        if (Math.min(futureResources) < 0){
            return false;
        }
        return true;
    }

    selectAction(strategy){
        if(strategy == "random"){
            let forbiddenIndices = [];
            let viableAction = false;
            while(true){
                const index = Math.floor(Math.random() * this.actions.length);
                if(!forbiddenIndices.includes(index)){
                    const action = this.actions[index];
                    console.log(action);
                    viableAction = this.checkViability(action);
                    if (viableAction){
                        return action;
                    }
                    else{
                        forbiddenIndices.push(index)
                    }
                }
            }
        }
    }

    selectTarget(initiativeOrder, team, strategy){
        if (strategy == "random"){
            while(true){
                const index = Math.floor(Math.random() * initiativeOrder.length);
                const target = initiativeOrder[index];
                console.log(target);
                if (target.type != team){
                    console.log("check");
    
                    return target;
                }     
            }
        }  
    }

    updateActor(action){
        if (action.type == "health"){
            this.stats["hp"] += action.roll;
        }
        else{
            // Account for saves and to hit
            target.stats["hp"] -= action.roll;
        }
    }

    executeTurn(initiativeOrder){
        const team = this.type;
        if (this.checkDead(initiativeOrder)){
            return initiativeOrder;
        }
        // select action
        let action = this.selectAction("random");
        // select target(s)
        let target = this;
        if (action.type != "health"){
            target = this.selectTarget(initiativeOrder, team, "random");
        }
        console.log(action, target);
        // update all
        this.executeAction(action, target);
    }
}

class Action{   
    constructor(name, type, cost, uses, recharge, dieCount, dieSides, plus, damageType, save){
        this.name = name;
        this.type = type;  // type: "damage" || "health"
        this.cost = cost;  // cost: [action, bonusaction, reaction, legendary].concat(spellSlots) e.g.[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0] for a 2nd level spell, or [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] for a regular attack
        this.uses = uses;  // if uses are unlimited, -1
        this.recharge = recharge; //if it's a recharging move, the amount from which the move recharges, e.g. 5 for recharges on 5&6, else 0
        this.recharged = 1;
        this.diceCount = dieCount;
        this.dieSides = dieSides;
        this.plus = plus;
        this.damageType = damageType;
        this.save = save;
    }

    // Function to roll a single die
    rollDie(sides) {
        return Math.ceil(Math.random() * sides);
    }

    // Getter for damage / health that simulates $dieCount $dieSides-sided dice rolls
    get roll() {
        let totalDamage = 0;
        for (let i = 0; i < this.diceCount; i++) {
            totalDamage += this.rollDie(this.dieSides);
        }
        return totalDamage + this.plus;
    }

}

function winCondition(initiativeOrder){
    var lastType = initiativeOrder[0].type;
    for (let a of initiativeOrder) {
        console.log("Logging wincondition", lastType, a.type);
        console.log(a.type != lastType);
        if (a.type != lastType) {
            return false;
        }
    }
    return true;
}

function runSimulations(allies, enemies, amount=1000){
    wins = []
    let actors = allies.concat(enemies);
    actors.forEach(a => a.setInitiative());
    let initiativeOrder = actors.sort((p1, p2) => (p1.intitiave < p2.initiative) ? 1 : (p1.initiative > p2.initiative) ? -1 : 0);
    while(!winCondition(initiativeOrder)){
        // copy initiative order for editing
        let updatedInitiativeOrder = new Array(initiativeOrder.length);
        for (i = 0; i < initiativeOrder.length; i++) {
            updatedInitiativeOrder[i] = initiativeOrder[i];
        }
        initiativeOrder.forEach(a => {
            updatedInitiativeOrder = a.executeTurn(updatedInitiativeOrder)
        })
        // update initiative order outside of forloop to avoid unexpected things
        for (i = 0; i < initiativeOrder.length; i++) {
            initiativeOrder[i] = updatedInitiativeOrder[i];
        }
    }
    
    // go down initiative order
        // pick action
        // pick target(s)
        // update hp's, resources and initiative order
        // check if one side won
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

function add(arrA, arrB){
    if (arrA.length !== arrB.length) {
        throw new Error('Vectors must be of the same length');
    }

    let result = arrA.map((element, index) => element + arrB[index]);
    return result;
}

function subtract(arrA, arrB){
    if (arrA.length !== arrB.length) {
        throw new Error('Vectors must be of the same length');
    }

    let result = arrA.map((element, index) => element - arrB[index]);
    return result;
}

function getCostFromJSON(costjson, level, name){
    var cost = [0, 0, 0, 0, 0]
    const costdict = {
        "action": [1, 0, 0, 0],
        "bonus": [0, 1, 0, 0],
        "reaction": [0, 0, 1, 0],
        "legendary": [0, 0, 0, 1],
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
        let spellLevels = Array(9).fill(0);
        if(level > 0){
            spellLevels[level-1] += 1;
        }
        return cost.concat(spellLevels)
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

function getSaveFromJSON(savejson){
    if (!(savejson.ability && savejson.dc)){
        return null;
    }
    let save = [];
    save.push(savejson.ability);
    save.push(savejson.dc);
    return save;
}

function getActionsFromJSON(data){
    // for now we are ignoring support spells (aside from heals)
    let actions = [];
    data.forEach(a => {
        let { name, type } = a; // Directly destructure common properties
        let actionType = a.system.actionType ?? null;
        let formula = a.system.formula ?? null;
        let save = a.system.save ? getSaveFromJSON(a.system.save) : null;
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
                actions.push(new Action(name, type, cost, uses, recharge, dieCount, dieSides, plus, damageType, save ?? null));
            }
        }
    });
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

function getSpellSlots(spells){

    // Initialize an array with 9 elements set to 0
    let spellSlots = new Array(9).fill(0);

    // Iterate over the spell levels
    for (let i = 1; i <= 9; i++) {
        // Construct the key name for the current spell level
        let key = `spell${i}`;
        // Check if the key exists in the spells object and has a "value"
        if (spells[key] && spells[key].hasOwnProperty('value')) {
            // If so, update the corresponding index in the array with the value
            spellSlots[i - 1] = spells[key].value;
        }
        // If the key doesn't exist or doesn't have a "value", the default 0 remains
    }
    return spellSlots
}

function actorFromJSON(jsondata, type){
    let name = jsondata.name
    let stats = getAllAbilityValues(jsondata)
    stats["ac"] = jsondata.system.attributes.ac.flat ?? acFromAcEffects(jsondata.flags.ddbimporter.acEffects, stats.dex) ?? null;
    stats["hp"] = jsondata.system.attributes.hp.value;
    let legendaryActions = jsondata.system.resources.legact?.value ?? 0
    
    let numAttacks = 1;
    if (jsondata.items.filter(item => item.name === 'Multiattack').length>0){
        numAttacks += 1;
    }
    let spells = jsondata.system.spells;
    let spellSlots = getSpellSlots(spells);
    return new Actor(name, type, stats, numAttacks, getActionsFromJSON(jsondata.items), spellSlots, legendaryActions)
}

function initializeAndLoadActors(){
    const enemyJsonData = importJsonFiles(jsonDirPathEnemies);
    const allyJsonData = importJsonFiles(jsonDirPathAllies);
    let enemies = []
    let allies = []
    // TODO: lair actions
    // import enemies
    enemyJsonData.forEach(jsondata =>
        {
            let actor = actorFromJSON(jsondata, "enemy");
            enemies.push(actor);
        }
    )
    // import allies
    // TODO: allies don't have multiattack
    allyJsonData.forEach(jsondata =>
        {
            let actor = actorFromJSON(jsondata, "ally");
            allies.push(actor)
        }
    )
    return {"enemies": enemies, "allies": allies}
}

const actors = initializeAndLoadActors()
runSimulations(actors["allies"], actors["enemies"]);
actors.allies.forEach(actor => {
    console.log(actor.name, actor.stats, actor)
})

    