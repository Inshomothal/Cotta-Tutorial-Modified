import { world, system, BlockLocation, MinecraftBlockTypes } from "@minecraft/server";
import Utilities from "./Utilities";
const START_TICK = 100;
const ARENA_X_SIZE = 30;
const ARENA_Z_SIZE = 30;
const ARENA_X_OFFSET = 0;
const ARENA_Y_OFFSET = -60;
const ARENA_Z_OFFSET = 0;
//global variables
let curTick = 0;
let score = 0;
let cottaX = 0;
let cottaZ = 0;
let spawnCountdown = 1;
let pickGrade = 0; //for the pickaxe code
function intitializeBreakTheTerracotta() {
    const overworld = world.getDimension("overworld");
    //world.say("intitializeBreakTheTerracotta has started..."); //testing the function -> Success!!!
    overworld.runCommandAsync("clear @p"); //For clearing inventory with debugging
    //catch in case we've already added this score
    try {
        //world.say("Trying to add a score..."); //Testing try function -> Success!!!
        overworld.runCommandAsync('scoreboard objectives add score dummy "Level"');
    }
    catch (e) {
        world.say("score error:" + e); //Catching the error
    }
    //eliminate nearby pesky mobs
    try {
        overworld.runCommandAsync("kill @e[type=!player]");
    }
    catch (e) { }
    overworld.runCommandAsync("scoreboard objectives setdisplay sidebar score");
    overworld.runCommandAsync("give @p diamond_sword");
    overworld.runCommandAsync("give @p dirt 64");
    overworld.runCommandAsync("scoreboard player set @p score 0");
    world.say("BREAK THE TERRACOTTA");
    //Making the arena
    Utilities.fillBlock(
    //Making a clear area
    MinecraftBlockTypes.air, ARENA_X_OFFSET - ARENA_X_SIZE / 2 + 1, ARENA_Y_OFFSET, ARENA_Z_OFFSET - ARENA_Z_SIZE / 2 + 1, ARENA_X_OFFSET + ARENA_X_SIZE / 2 - 1, ARENA_Y_OFFSET + 10, ARENA_Z_OFFSET + ARENA_Z_SIZE / 2 - 1);
    Utilities.fourWalls(
    //Creating the Walls
    MinecraftBlockTypes.cobblestone, ARENA_X_OFFSET - ARENA_X_SIZE / 2, ARENA_Y_OFFSET, ARENA_Z_OFFSET - ARENA_Z_SIZE / 2, ARENA_X_OFFSET + ARENA_X_SIZE / 2, ARENA_Y_OFFSET + 10, ARENA_Z_OFFSET + ARENA_Z_SIZE / 2);
    overworld.runCommandAsync(
    //Teleporting the players
    "tp @p " + String(ARENA_X_OFFSET - 3) + " " + ARENA_Y_OFFSET + " " + String(ARENA_Z_OFFSET - 3));
}
//This is the function that will run during each tick (20 per second).
//It's where game logic can get implemented.
function gameTick() {
    try {
        //Tested -> world.say("trying to run the game..."); -> Success!!
        //world.say("curTick is " + curTick);
        if (curTick === START_TICK) {
            //This is at 100 ticks, which gives Minecraft time to load the world.
            intitializeBreakTheTerracotta(); //ALWAYS ADD () WITH FUNCTIONS!!!
            //Tested if logic with -> world.say("curTick equals START_TICK!!!"); -> Success!!!
        }
        else {
            //world.say("curTick doesnt equal START_TICK");
        }
        curTick++;
        if (curTick > START_TICK && curTick % 20 === 0) {
            let overworld = world.getDimension("overworld");
            //no terracotta exists, we're waiting to spawn a new one
            if (spawnCountdown > 0) {
                spawnCountdown--;
                if (spawnCountdown <= 0) {
                    spawnNewTerracotta();
                }
            }
            else {
                checkForTerracotta();
            }
        }
        let spawnInterval = Math.ceil(200 / ((score + 1) / 3));
        if (curTick > START_TICK && curTick % spawnInterval === 0) {
            world.say("RELEASE THE FAILURES!!!!");
            spawnMobs();
        }
        //Self-inserted code to give a pickaxe to help break terracotta
        if (score === 5 && pickGrade === 0) {
            let overworld = world.getDimension("overworld");
            overworld.runCommandAsync("give @p diamond_pickaxe");
            world.say("Better dig faster....");
            pickGrade++;
        }
        if (curTick > START_TICK && curTick % 29 === 0) {
            addFuzzyLeaves();
        }
    }
    catch (e) {
        console.warn("Tick Error: " + e);
        world.say("error logged in console");
    }
    //testing what functions are working...Success!!!
    //world.say("mainTick is working");
    //Ensures a callback to the gameTick function.
    system.run(gameTick);
}
function spawnNewTerracotta() {
    let overworld = world.getDimension("overworld");
    //create a new terracotta
    cottaX = Math.floor(Math.random() * (ARENA_X_SIZE - 1)) - (ARENA_X_SIZE / 2 - 1);
    cottaZ = Math.floor(Math.random() * (ARENA_Z_SIZE - 1)) - (ARENA_Z_SIZE / 2 - 1);
    world.say("Spawning...");
    overworld
        .getBlock(new BlockLocation(cottaX + ARENA_X_OFFSET, 1 + ARENA_Y_OFFSET, cottaZ + ARENA_Z_OFFSET))
        .setType(MinecraftBlockTypes.yellowGlazedTerracotta);
}
function checkForTerracotta() {
    let overworld = world.getDimension("overworld");
    let block = overworld.getBlock(new BlockLocation(cottaX + ARENA_X_OFFSET, 1 + ARENA_Y_OFFSET, cottaZ + ARENA_Z_OFFSET));
    if (block.type !== MinecraftBlockTypes.yellowGlazedTerracotta) {
        //we didn't find any terracotta! set a new spawn countdown
        score++;
        spawnCountdown = 2;
        cottaX = -1;
        overworld.runCommandAsync("scoreboard players set @p score " + score);
        world.say("You broke the terracotta! Creating new ones.");
        cottaZ = -1;
    }
}
function spawnMobs() {
    let overworld = world.getDimension("overworld");
    //spawn mobs creates about 1-2 mobs
    let spawnMobCount = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j <= spawnMobCount; j++) {
        let zombieX = Math.floor(Math.random() * (ARENA_X_SIZE - 2)) - ARENA_X_SIZE / 2;
        let zombieZ = Math.floor(Math.random() * (ARENA_Z_SIZE - 2)) - ARENA_Z_SIZE / 2;
        overworld.spawnEntity("minecraft:zombie", new BlockLocation(zombieX + ARENA_X_OFFSET, 1 + ARENA_Y_OFFSET, zombieZ + ARENA_Z_OFFSET));
    }
}
function addFuzzyLeaves() {
    let overworld = world.getDimension("overworld");
    for (let i = 0; i < 10; i++) {
        const leafX = Math.floor(Math.random() * (ARENA_X_SIZE - 1)) - (ARENA_X_SIZE / 2 - 1);
        const leafY = Math.floor(Math.random() * 10);
        const leafZ = Math.floor(Math.random() * (ARENA_Z_SIZE - 1)) - (ARENA_Z_SIZE / 2 - 1);
        overworld
            .getBlock(new BlockLocation(leafX + ARENA_X_OFFSET, leafY + ARENA_Y_OFFSET, leafZ + ARENA_Z_OFFSET))
            .setType(MinecraftBlockTypes.leaves);
    }
}
//Ensures a callback to the gameTick function.
system.run(gameTick);

//# sourceMappingURL=../../_cottaDebug/main.js.map
