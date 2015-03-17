var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./imgs/hero_hooded.png");
ASSET_MANAGER.queueDownload("./imgs/skeleton.png");
ASSET_MANAGER.queueDownload("./imgs/Hero-Warrior.png");
ASSET_MANAGER.queueDownload("./imgs/npc-female.png");
ASSET_MANAGER.queueDownload("./imgs/dragon_1.png");
ASSET_MANAGER.queueDownload("./imgs/dragon_1_npc.png");
ASSET_MANAGER.queueDownload("./imgs/water_elemental.png");
ASSET_MANAGER.queueDownload("./imgs/woods.png");
ASSET_MANAGER.queueDownload("./imgs/desert.png");
ASSET_MANAGER.queueDownload("./imgs/tiles.png");
ASSET_MANAGER.queueDownload("./imgs/tileslevel2.png");
ASSET_MANAGER.queueDownload("./imgs/fire.png");
ASSET_MANAGER.queueDownload("./imgs/fire2.png");
ASSET_MANAGER.queueDownload("./imgs/malboro.png");
ASSET_MANAGER.queueDownload("./imgs/ogre.png");
ASSET_MANAGER.queueDownload("./imgs/wolf1.png");
ASSET_MANAGER.queueDownload("./imgs/wolf_rider.png");
ASSET_MANAGER.queueDownload("./imgs/storekeeper.png");
ASSET_MANAGER.queueDownload("./imgs/witch.png");
ASSET_MANAGER.queueDownload("./imgs/game_over.png");
ASSET_MANAGER.queueDownload("./imgs/game_over_win.png");
ASSET_MANAGER.queueDownload("./imgs/roomInteriorSpritesSheet.png")
ASSET_MANAGER.queueDownload("./imgs/dragoncave.png");
ASSET_MANAGER.queueDownload("./imgs/ice_cave.png");
ASSET_MANAGER.queueDownload("./imgs/archer.png");
ASSET_MANAGER.queueDownload("./imgs/mage.png");
ASSET_MANAGER.queueDownload("./imgs/equipment/accessory.png");
ASSET_MANAGER.queueDownload("./imgs/equipment/armor.png");
ASSET_MANAGER.queueDownload("./imgs/equipment/offhand.png");
ASSET_MANAGER.queueDownload("./imgs/equipment/main_hand.png");
ASSET_MANAGER.queueDownload("./imgs/mountain.png");
ASSET_MANAGER.queueDownload("./imgs/desert.png");
ASSET_MANAGER.queueDownload("./imgs/troll.png");

// level 2 stuffs. 
ASSET_MANAGER.queueDownload("./imgs/mountain_man.png");
ASSET_MANAGER.queueDownload("./imgs/mountain_woman.png");
ASSET_MANAGER.queueDownload("./imgs/items/potion_int.png");
ASSET_MANAGER.queueDownload("./imgs/items/potion_str.png");
ASSET_MANAGER.queueDownload("./imgs/items/staff1.png");
ASSET_MANAGER.queueDownload("./imgs/items/staff2.png");
ASSET_MANAGER.queueDownload("./imgs/items/robe1.png");
ASSET_MANAGER.queueDownload("./imgs/items/robe2.png");
ASSET_MANAGER.queueDownload("./imgs/items/amulet3.png");
ASSET_MANAGER.queueDownload("./imgs/mountainVillager.png");
ASSET_MANAGER.queueDownload("./imgs/mage.png");
ASSET_MANAGER.queueDownload("./imgs/churchInterior.png");
ASSET_MANAGER.queueDownload("./imgs/bishop.png");
ASSET_MANAGER.queueDownload("./imgs/lagoon.png");

//level3 stuff
ASSET_MANAGER.queueDownload("./imgs/maplevel3.png");
ASSET_MANAGER.queueDownload("./imgs/desert.png");
ASSET_MANAGER.queueDownload("./imgs/aladdin.png");
ASSET_MANAGER.queueDownload("./imgs/jasmine.png");
ASSET_MANAGER.queueDownload("./imgs/sultan.png");
// items
ASSET_MANAGER.queueDownload("./imgs/ghost.png");
ASSET_MANAGER.queueDownload("./imgs/items/heal_berry.png");
ASSET_MANAGER.queueDownload("./imgs/items/amulet1.png");
ASSET_MANAGER.queueDownload("./imgs/items/amulet2.png");
ASSET_MANAGER.queueDownload("./imgs/items/armor1.png");
ASSET_MANAGER.queueDownload("./imgs/items/armor2.png");
ASSET_MANAGER.queueDownload("./imgs/items/leather_armor1.png");
ASSET_MANAGER.queueDownload("./imgs/items/pendant.png");
ASSET_MANAGER.queueDownload("./imgs/items/sword1.png");
ASSET_MANAGER.queueDownload("./imgs/items/shield1.png");
ASSET_MANAGER.queueDownload("./imgs/items/shield2.png");
ASSET_MANAGER.queueDownload("./imgs/items/ax.png");
ASSET_MANAGER.queueDownload("./imgs/items/quest_potion.png");
ASSET_MANAGER.queueDownload("./imgs/items/stone.png");
ASSET_MANAGER.queueDownload("./imgs/items/book.png");
ASSET_MANAGER.queueDownload("./imgs/items/key.png");
ASSET_MANAGER.queueDownload("./imgs/level_up_icon.png");
ASSET_MANAGER.queueDownload("./imgs/items/sword.gif");
ASSET_MANAGER.queueDownload("./imgs/items/cactus_flower.png");
ASSET_MANAGER.queueDownload("./imgs/items/staff3.png");
ASSET_MANAGER.queueDownload("./imgs/items/armor3.png");

ASSET_MANAGER.downloadAll(function () {
    var canvas = document.getElementById("gameworld");
    var context = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    //var skeleton_sprites = ASSET_MANAGER.getAsset("./imgs/skeleton.png");
    //var malboro_sprites = ASSET_MANAGER.getAsset("./imgs/malboro.png");
	var aladdin_spritesheet = ASSET_MANAGER.getAsset("./imgs/aladdin.png");
	var jasmine_spritesheet = ASSET_MANAGER.getAsset("./imgs/jasmine.png");
	var sultan_spritesheet = ASSET_MANAGER.getAsset("./imgs/sultan.png");
    var npc_sprites = ASSET_MANAGER.getAsset("./imgs/npc-female.png");
    var storekeeper_spritesheet = ASSET_MANAGER.getAsset("./imgs/storekeeper.png");
	var ghost_spritesheet = ASSET_MANAGER.getAsset("./imgs/ghost.png");
	var witch_spritesheet = ASSET_MANAGER.getAsset("./imgs/witch.png");
	var dragon_spritesheet = ASSET_MANAGER.getAsset("./imgs/dragon_1_npc.png");
	var mountain_man_spritesheet = ASSET_MANAGER.getAsset("./imgs/mountain_man.png");
	var mountain_woman_spritesheet = ASSET_MANAGER.getAsset("./imgs/mountain_woman.png");
	var mountain_villager_spritesheet = ASSET_MANAGER.getAsset("./imgs/mountainVillager.png");
	var mage_spritesheet = ASSET_MANAGER.getAsset("./imgs/mage.png");
	var bishop_spritesheet = ASSET_MANAGER.getAsset("./imgs/bishop.png");
	var troll_npc_sprites = ASSET_MANAGER.getAsset("./imgs/troll.png");

	var warrior = new Warrior(gameEngine, new Statistics(250, 220, 35, 4, 3, 1));
	var archer = new Archer(gameEngine, new Statistics(200, 32, 28, 4, 3, 1));
    gameEngine.heroes.push(warrior);
    //gameEngine.heroes.push(archer);
    //var mage_hero = new Mage(this.game, new Statistics(200, 160, 25, 1, 1, 5));
    //gameEngine.heroes.push(mage_hero);

    var girl_sprites = new SpriteSet(new Animation(npc_sprites, 0, 10, 64, 64, 0.25, 9, true, false),
                                            new Animation(npc_sprites, 0, 8, 64, 64, 0.25, 9, true, false),
                                            new Animation(npc_sprites, 0, 9, 64, 64, 0.25, 9, true, false),
                                            new Animation(npc_sprites, 0, 11, 64, 64, 0.25, 9, true, false),
                                            null, null, null);

    var girl_npc = new NPC(gameEngine, [["Oh! My love!! You're back from the war! *sobs heavily*",
                                        "The village has been destroyed by an evil dragon, everyone... they are gone.",
                                        "... except the store keeper. I'm not sure how he made it out alive.",
                                        "We must do something about the dragon! I saw it fly to the southeast *points determinedly*",
                                        "Revenge must be had! And once we are safe from the dragon, we can start to rebuild the village.",
                                        "And by rebuild, I mean repopulate. *wink wink*",
                                        "Oh, before you go! The healing berry bushes along the road have finally grown their berries for the season!",
                                        "You should pick a few for your journey!"],
                                           ["I'm so glad you're back from the war, my love, but right now this village faces destruction from the dragon! Please! Go save us!"]], girl_sprites, [new Point(160, 200), new Point(280, 200)], .10, false, [0], "level1");

    var storekeeper_sprites = new SpriteSet(new Animation(storekeeper_spritesheet, 1, 0, 32, 32, 0.05, 1, true, false),
                                            new Animation(storekeeper_spritesheet, 1, 3, 32, 32, 0.05, 1, true, false),
                                            new Animation(storekeeper_spritesheet, 1, 1, 32, 32, 0.05, 1, true, false),
                                            new Animation(storekeeper_spritesheet, 1, 2, 32, 32, 0.05, 1, true, false), null, null, null);
    var sk_quest_reward = new SpecialItem(gameEngine, "Ax", ASSET_MANAGER.getAsset("./imgs/items/ax.png"), 3, function () { }, "A sturdy tool to chop those pesky logs blocking the treasure chests");
    var storekeeper_quest = new KILL_QUEST(gameEngine, "Willy", sk_quest_reward, "Skeleton", 5);
    var storekeeper_items = [new Armor(gameEngine, "Leather Armor", 170, ASSET_MANAGER.getAsset("./imgs/items/leather_armor1.png"), "armor", new Statistics(2, 0, 3, 0, 2, 0), "The suit's leather is somewhat of low quality, but it's quite effective as defense-wear."),
                            new Armor(gameEngine, "Basic Iron Armor", 230, ASSET_MANAGER.getAsset("./imgs/items/armor1.png"), "armor", new Statistics(5, 0, 5, 1, 0, 0), "A sturdy armor made from iron. It's a bit rusty, but it definitely helps you survive most encounters out there."),
                            new Armor(gameEngine, "Fancy Strength Amulet", 130, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "accessory", new Statistics(0, 0, 0, 3, 0, 0), "A fancy looking amulet made from titanium."),
                            new Armor(gameEngine, "Flawless Steel Sword", 200, ASSET_MANAGER.getAsset("./imgs/items/sword1.png"), "mainhand", new Statistics(0, 10, 0, 4, 0, 0), "A high quality sharpened steel sword. It can cut monsters like butter."),
                            new Armor(gameEngine, "Basic Shield", 125, ASSET_MANAGER.getAsset("./imgs/items/shield1.png"), "offhand", new Statistics(0, 0, 5, 0, 0, 0), "A shabby round shield. It's not too big, but not too small."),
                            new Armor(gameEngine, "Reinforced Shield", 220, ASSET_MANAGER.getAsset("./imgs/items/shield2.png"), "offhand", new Statistics(0, 0, 10, 0, 0, 0), "A better than Basic Shield shield. It's sturdy and thicker, capable of withstanding numerous attacks."),
                            new Potion(gameEngine, "Heal Berry", 10, 3, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "A delicious berry that makes you feel more refreshed.")];
    var storekeeper = new Storekeeper(gameEngine, "Willy", [["Why hello there! It's good to see another survivor in all of this destruction.",
                                             "Unfortunately, I'm dealing with even more damage to my store with all of these skeletons running about.",
                                             "I'd pay handsomely if someone as strong looking as yourself would perhaps rid me of a few. *wink*",
                                                "Well actually all I have is an old ax, but it will just have to do! Think of the honor you will bring this town."],
                                           ["Look kid, I'd really love to sell you some gear but those skeletons are making it impossible to keep the store open.",
                                             "You're the last person in the village I'd want to ask, but since you basically ARE the last person in the village...",
                                             "I'll have a reward for you when you're done helping me out."],
                                           ["Hey! You did a great job at reducing my skeleton problem. I can finally get to work on reparing the store!",
                                           "Why are you still standing there?",
                                           "Oh... I suppose you want that reward. Here you go; this ax has been in my family for generations! Take good care of it."],
                                           ["Hello again, kid. You've been a great help to the town so far.",
                                            "Not to brag or anything, but this town's economy relies solely on the health of this store.",
                                            "However, I cannot and will not open it back up again until that dragon is slain."],
                                            ["Seriously, kid, go kill that dragon."],
                                            ["Wow! I didn't actually think you'd do it! Congratulations! Oh, sorry, but the store wont be open for a while yet.",
                                            "Trust me, I want this store open more than anyone around here. I'll be happy to take your money when the store is ready."]], storekeeper_items,
                                             1200, storekeeper_sprites, [new Point(485, 207)], .1, false, [3, 4], storekeeper_quest, "level1", 1.2, 
                                               [function () {
                                                   if (this.game.current_stage === this.game.stage[0]) {
                                                       // if before dragon is dead, have storekeeper give hero a quest. 
                                                       if (this.part === 1 && this.quest.complete) {
                                                           this.part++;
                                                       }
                                                       this.showDialog();
                                                   } else {
                                                       var that = this.inventory;
                                                       // after dragon is dead, show wares to the hero.
                                                       window.setTimeout(that.showWares.bind(that), 0);
                                                   }
                                               }, function () {
                                                   if (this.game) {
                                                       if (this.game.next === true) {
                                                           var text_box = document.getElementById("dialogue_box");
                                                           var text = document.createElement('p');

                                                           if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                                                               this.dialogue_index++;
                                                               text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                                                               text_box.innerHTML = text.outerHTML;
                                                           } else {
                                                               this.dialogue_index = 0;
                                                               text_box.style.visibility = "hidden";
                                                               text_box.style.display = "none";
                                                               text_box.tabIndex = 2;
                                                               this.game.context.canvas.tabIndex = 1;
                                                               this.game.context.canvas.focus();
                                                               this.game.canControl = true;
                                                               this.interacting = false;
                                                               if (this.part === 0) {
                                                                   this.part++;
                                                                   this.game.entities[0].addQuest(this.quest);
                                                               }
                                                               if (this.part === 2) {
                                                                   this.game.entities[0].inventory.addItem(this.quest.reward);
                                                                   this.part++;
                                                               } else if (this.part === 3) {
                                                                   this.part++;
                                                               } else if (this.part === 4 && this.game.stage.part2) {
                                                                   this.part++;
                                                               } else if (this.part === 5) {
                                                                   this.part++;
                                                               }
                                                           }
                                                           this.game.next = false;
                                                       }
                                                   }
                                               }]);
										
	var ghost_sprites	= new SpriteSet(new Animation(ghost_spritesheet, 0, 0, 32, 32, 0.05, 1, true, false), 
                                        new Animation(ghost_spritesheet, 0, 3, 32, 32, 0.05, 1, true, false),
                                        new Animation(ghost_spritesheet, 0, 1, 32, 32, 0.05, 1, true, false),
                                        new Animation(ghost_spritesheet, 0, 2, 32, 32, 0.05, 1, true, false), null, null, null);
											
	var ghost_quest_potion = new SpecialItem(gameEngine, "Potion", ASSET_MANAGER.getAsset("./imgs/items/quest_potion.png"), 1, function () { }, "Drug Facts: for ghosts only");	
	var ghost_quest_reward = new SpecialItem(gameEngine, "King Arthur's Rock", ASSET_MANAGER.getAsset("./imgs/items/stone.png"), 1, function () { }, "A small magical rock, perhaps it can open something...");	
	var ghost_quest = new RETRIEVE_ITEM_QUEST(gameEngine, "Ghost", ghost_quest_reward, ghost_quest_potion);
	var ghost = new Ghost(gameEngine, "Ghost", [["Set my soul free, Brave Warrior!", 
												"Go to Purple Witch and get me the Heaven Potion! Let my soul fly away from this Sinful World!",
												"Your bravery will be rewarded with the King Arthur's Stone!",
												"This Stone has a power to open things that nothing else can open!",
												"So, go bring the Potion and let me rest in heaven!"],
												["I am grateful for your help, Brave Warrior!"],
												["Bless your soul, Brave Warrior!"]], 
												ghost_sprites, [new Point(928, 30)], .1, false, [2, 2], ghost_quest, "level1");
	
	var witch_sprites = new SpriteSet(new Animation(witch_spritesheet, 1, 0, 32, 32, 0.05, 1, true, false), 
                                        new Animation(witch_spritesheet, 1, 3, 32, 32, 0.05, 1, true, false),
                                        new Animation(witch_spritesheet, 1, 1, 32, 32, 0.05, 1, true, false),
                                        new Animation(witch_spritesheet, 1, 2, 32, 32, 0.05, 1, true, false), null, null, null);

    var witch_quest_book = new SpecialItem(gameEngine, "Book of Spells", ASSET_MANAGER.getAsset("./imgs/items/book.png"), 1, function () { }, "The Witch's spellbook, contains unreadable letters and strange inscriptions");
    var witch_quest_reward = ghost_quest_potion;
    var witch_quest = new RETRIEVE_ITEM_QUEST(gameEngine, "Witch", witch_quest_reward, witch_quest_book);
    var witch = new Witch(gameEngine, "Witch", [["The witch simply glares at you as you approach her and her home."],
                                                 ["Long Time, since I have seen Living Human Being!",
												"I know why you are here and I will give you what you want, only",
												"if you bring me the Holy Book of Spells hidden somewhere in the forest"],
												["Bring me the Holy Book of Spells, young man!"],
	                                              ["Ah yes, thank you! *cackle* If you come back to me another time, I may have a better reward for you than this."],
	                                              ["The witch seems to be back at her silent staring."]],

												witch_sprites, [new Point(864, 289)], .1, false, [1,2], witch_quest, "level1");
	
    var dragon1_NPC_sprites = new SpriteSet(new Animation(dragon_spritesheet, 0, 0, 64, 36, .1, 1, true, false), new Animation(dragon_spritesheet, 0, 0, 64, 36, .1, 1, true, false), new Animation(dragon_spritesheet, 0, 0, 64, 36, .1, 1, true, false), new Animation(dragon_spritesheet, 0, 0, 64, 36, .1, 1, true, false), null, null, null);

    var dragon1_NPC = new Boss(gameEngine, [["I have been waiting for you warrior. We have been waiting for you."
        , "You'll never find make it to the desert to fight our leader.", "Your journey ends here, just like the mage before you."]],
        dragon1_NPC_sprites, [new Point(450, 120)], .1, false, [1], "dragon_cave", "Dragon");
    dragon1_NPC.setScale(1.5);

    
    var troll_NPC_spriteset = new SpriteSet(new Animation(troll_npc_sprites, 13, 4, 256, 256, .1, 1, true, false), new Animation(troll_npc_sprites, 13, 4, 256, 256, .1, 1, true, false), new Animation(troll_npc_sprites, 13, 4, 256, 256, .1, 1, true, false), new Animation(troll_npc_sprites, 13, 4, 256, 256, .1, 1, true, false), null, null, null);
    var troll_NPC = new TrollNPC(gameEngine, [["Why hello there old sport.", "Is it the temple that you would like to go to?", "I'm afraid to inform you I cannot let you do that.",
        "You fancy a tussle you say?", "Well then, we shall fisticuff good sir."]], troll_NPC_spriteset, [new Point(433, 226)], .1, false, [0, 1], "level2", "Troll");
    troll_NPC.setScale(.3);
    //var siren_spritesheet = ASSET_MANAGER.getAsset("./imgs/water_elemental.png");
    //var siren_NPC_sprites = new SpriteSet(new Animation(siren_spritesheet, 11, 5, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 11, 5, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 11, 5, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 11, 5, 256, 256, .1, 1, true, false), null, null, null);

    //var siren_NPC = new Boss(gameEngine, [["Whaddup nigga.", "think youre hard bitch ass nigga?", "ima fuck you up nigga."]],
    //    siren_NPC_sprites, [new Point(350, 120)], .1, false, [2], "level2", "Siren");
    //siren_NPC.setScale(.5);
    // WHEN ADDING THE OTHER TWO HEROS (the mage and archer) ADD THEM TO SPOTS 1 and 2
    // the 3 heroes should only be in slots 0-2 in this array. Other code depends on it. 
    gameEngine.addEntity(warrior);
    //test items
    var heal_berry = new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "A delicious berry that makes you feel more refreshed.");
    var amulet = new Armor(gameEngine, "Inherited Amulet", 130, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "accessory", new Statistics(0, 0, 0, 1, 0, 0), "This is your great great great grandfather's Amulet.");

    warrior.recieveItem(heal_berry);
    warrior.recieveItem(amulet);


    /* LEVEL 2 NPCS AND QUESTS AND ITEMS */
    var mountain_man_items = [  new Potion(gameEngine, "Potion of Intelligence", 35, 4, ASSET_MANAGER.getAsset("./imgs/items/potion_int.png"), "int", 2, "A strange blue liquid that will make you temporarily smarter!"),
                                new Armor(gameEngine, "Magical Rod", 130, ASSET_MANAGER.getAsset("./imgs/items/staff1.png"), "mainhand", new Statistics(0, 5, 0, 0, 0, 2), "This looks like a glowstick, it shines whenever you move it."),
                                new Armor(gameEngine, "Powerful Rod", 250, ASSET_MANAGER.getAsset("./imgs/items/staff2.png"), "mainhand", new Statistics(0, 10, 0, 0, 0, 4), "It emits strong light power, capable of fending off monsters with ease"),
                                new Armor(gameEngine, "Flowing Robes", 100, ASSET_MANAGER.getAsset("./imgs/items/robe1.png"), "armor", new Statistics(0, 0, 5, 0, 0, 2), "The protective robe suitable for any mages, experienced or not"),
                                new Armor(gameEngine, "Sexy Flowing Robes", 230, ASSET_MANAGER.getAsset("./imgs/items/robe2.png"), "armor", new Statistics(0, 0, 10, 0, 0, 4), "This robe is definitely not skimpy, but still sexy nonetheless"),
                                new Armor(gameEngine, "Pendant of Magic", 165, ASSET_MANAGER.getAsset("./imgs/items/amulet3.png"), "accessory", new Statistics(0, 0, 0, 0, 0, 3), "It has mystical powers that will make you smarter")];

                               
    var mountain_man_sprites = new SpriteSet(new Animation(mountain_man_spritesheet, 0, 2, 24, 32, 0.05, 1, true, false),
                                            new Animation(mountain_man_spritesheet, 0, 0, 24, 32, 0.05, 1, true, false),
                                            new Animation(mountain_man_spritesheet, 0, 3, 24, 32, 0.05, 1, true, false),
                                            new Animation(mountain_man_spritesheet, 0, 1, 24, 32, 0.05, 1, true, false), null, null, null);
    var mountain_man_quest =  new KILL_QUEST(gameEngine, "Hilbert", null, "Siren", 1);

    var mountain_man = new Storekeeper(gameEngine, "Hilbert", [["Well, hello there sonny! I haven't seen a newcomer in these remote parts in some time now.",
                                           "My name is Hilbert, and this here beautiful dwarf is my wife, Eliza.",
                                            "Eliza, dear! This is an incredible day, the Dwarven Gods must be smiling up on us today.",
                                            "Excuse me, sonny, it's just that I try to run a shop here, but the goods we sell aren't your regular run of the mill goods, you see.",
                                            "Every time we attempt to open our wares for our customers, which is very rare, by the way,",
                                            "The terrifying yet *whispers in Theon's ear* very beautiful eheh *returns to normal voice* siren from the lake comes to terrorize us!",
                                            "We believe it has something to do with the magical power of our products. Please, sonny, will you do something about her?"],
                                             ["Please, sonny, I have a wife to feed! We need to be able to sell our wares, but we can't until that Siren goes away!"],
                                              ["Oh how incredible, sonny! You did it! I don't think I will ever be able to repay you.",
                                                "I know just the thing! You can now shop at my store!"]], mountain_man_items,
                                             450, mountain_man_sprites, [new Point(576, 230)], .1, false, [1, 2], mountain_man_quest, "level2", 1.5,
                                            [function () {
                                                if (this.part < 3) {
                                                    if (this.part === 1 && this.quest.complete) {
                                                        this.part++;
                                                    }
                                                    this.showDialog();
                                                } else {
                                                    var that = this.inventory;                                                    
                                                    window.setTimeout(that.showWares.bind(that), 0);
                                                    //this.inventory.showWares();
                                                }
                                            },  function () {
                                                if (this.game) {
                                                    if (this.game.next === true) {
                                                        var text_box = document.getElementById("dialogue_box");
                                                        var text = document.createElement('p');

                                                        if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                                                            this.dialogue_index++;
                                                            text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                                                            text_box.innerHTML = text.outerHTML;
                                                        } else {
                                                            this.dialogue_index = 0;
                                                            text_box.style.visibility = "hidden";
                                                            text_box.style.display = "none";
                                                            text_box.tabIndex = 2;
                                                            this.game.context.canvas.tabIndex = 1;
                                                            this.game.context.canvas.focus();
                                                            this.game.canControl = true;
                                                            this.interacting = false;
                                                            if (this.part === 0) {
                                                                this.part++;
                                                                this.game.entities[0].addQuest(this.quest);
                                                                var siren_spritesheet = ASSET_MANAGER.getAsset("./imgs/water_elemental.png");
                                                                var siren_NPC_sprites = new SpriteSet(new Animation(siren_spritesheet, 7, 1, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 7, 1, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 7, 1, 256, 256, .1, 1, true, false), new Animation(siren_spritesheet, 7, 1, 256, 256, .1, 1, true, false), null, null, null);

                                                                var siren_NPC = new SirenNPC(gameEngine, [["I heard someone speak of me!?", "What is this, a puny human come to confront me? Well bring it on, little one!"]],
                                                                    siren_NPC_sprites, [new Point(375, 120)], .1, false, [2], "level2", "Siren");
                                                                siren_NPC.setScale(.4);
                                                                this.game.addEntity(siren_NPC);
                                                                this.quest.complete = true;
                                                            } if (this.part === 2) {
                                                                this.part++;
                                                            }
                                                        }
                                                        this.game.next = false;
                                                    }
                                                }
                                            }]);

    var mountain_woman_sprites = new SpriteSet(new Animation(mountain_woman_spritesheet, 0, 2, 24, 32, 0.05, 1, true, false),
                                                new Animation(mountain_woman_spritesheet, 0, 0, 24, 32, 0.05, 1, true, false),
                                                new Animation(mountain_woman_spritesheet, 0, 3, 24, 32, 0.05, 1, true, false),
                                                new Animation(mountain_woman_spritesheet, 0, 1, 24, 32, 0.05, 1, true, false), null, null, null);
    var mountain_woman = new NPC(gameEngine, [["Oh deary me! A visitor! Hilbert!! A VISITOR!!!",
                                                "If we weren't so concerned about the Lady of the Lake, we would invite you in! But alas, it is not safe, deary."],
                                                ["The Lady of the Lake? I heard she only comes out when there is magic around."]],
                                           mountain_woman_sprites, [new Point(224, 274), new Point(288, 274)], .06, false, [2], "level2", 1.5, 15);

    var mountain_villager_sprites = new SpriteSet(new Animation(mountain_villager_spritesheet, 0, 0, 32, 32, 0.05, 3, true, false),
                                                new Animation(mountain_villager_spritesheet, 0, 3, 32, 32, 0.05, 3, true, false),
                                                new Animation(mountain_villager_spritesheet, 0, 1, 32, 32, 0.05, 3, true, false),
                                                new Animation(mountain_villager_spritesheet, 0, 2, 32, 32, 0.05, 3, true, false), null, null, null);
    var mountain_villager_quest = new KILL_QUEST(gameEngine, "Sherry", null, "Dire Wolf", 5);
    var mountain_villager = new NPC_QUEST(gameEngine, "Sherry", [["HELP!!! HELP!! SOMEONE!!!", "YOU! You there! Are you blind!? Don't you see the wolves around here?!",
                                                                  "Please for the love of all that is good, go kill some wolves and a few of their riders!!",
                                                                  "This village is counting on you!"],
                                                                  ["What are you doing just standing around!? Do you want to be dog food!?"],
                                                                    ["I can breathe again, thank you stranger. My name is Sherry, by the way.",
                                                                     "This town is small and cold, but I've lived here all my life and I'm glad you just saved it from the wolf invaders.",
                                                                     "They come into town looking to loot our store every few months or so, it's an ongoing battle."],
                                                                  ["Hello again, Theon! What lovely weather we're having here in Sohm today. I wish it could be this nice every day!",
                                                                    "You must have brought it with you! Haha!"]], mountain_villager_sprites, [new Point(370, 220)], .05, false, [4, 5],
                                                                    mountain_villager_quest, "level2", 1.25, [function () {
                                                                        if (this.part === 1 && this.quest.complete) {
                                                                            this.part++;
                                                                        }
                                                                        //if (this.quest.complete && this.game.getEntity("Hilbert").quest.complete) {
                                                                        //    this.game.current_stage = this.game.stage[2];
                                                                        //}
                                                                       this.showDialog();       
                                                                    }, function () {
                                                                        if (this.game) {
                                                                            if (this.game.next === true) {
                                                                                var text_box = document.getElementById("dialogue_box");
                                                                                var text = document.createElement('p');

                                                                                if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                                                                                    this.dialogue_index++;
                                                                                    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                                                                                    text_box.innerHTML = text.outerHTML;
                                                                                } else {
                                                                                    this.dialogue_index = 0;
                                                                                    text_box.style.visibility = "hidden";
                                                                                    text_box.style.display = "none";
                                                                                    text_box.tabIndex = 2;
                                                                                    this.game.context.canvas.tabIndex = 1;
                                                                                    this.game.context.canvas.focus();
                                                                                    this.game.canControl = true;
                                                                                    this.interacting = false;
                                                                                    if (this.part === 0) {
                                                                                        this.part++;
                                                                                        this.game.entities[0].addQuest(this.quest);
                                                                                    } if (this.part === 2) {
                                                                                        this.part++;
                                                                                    }
                                                                                }
                                                                                this.game.next = false;
                                                                            }
                                                                        }
                                                                    }], 20);

    var mage_npc_sprites = new SpriteSet(new Animation(mage_spritesheet, 0, 10, 64, 64, 0.05, 1, true, false),
                                        new Animation(mage_spritesheet, 0, 9, 64, 64, 0.05, 1, true, false),
                                        new Animation(mage_spritesheet, 0, 9, 64, 64, 0.05, 1, true, false),
                                        new Animation(mage_spritesheet, 0, 11, 64, 64, 0.05, 1, true, false), null, null, null);

    var mage_npc = new NPC(gameEngine, [["Thank you for saving me, hero! I was captured by the dragon and have been stuck here for days!! I am forever in your debt.",
                                     "In fact, I think I'll follow you around everywhere you go! I will never leave your side. *swoon*",
                                        "Come on! Let's go kill stuff!!! YEA!!! There is a secret exit at the back of this cave, I've seen people use it!!",
                                         "I've overheard people talking about some ancient temple, too! I want to visit! LET'S GO!!!!"]],
                                           mage_npc_sprites, [new Point(475, 115)], .06, false, [2], "dragon_cave", 1);
    
    var bishop_sprites = new SpriteSet(new Animation(bishop_spritesheet, 0, 0, 80, 80, 0.05, 1, true, false),
                                        new Animation(bishop_spritesheet, 0, 0, 80, 80, 0.05, 1, true, false),
                                        new Animation(bishop_spritesheet, 0, 0, 80, 80, 0.05, 1, true, false),
                                        new Animation(bishop_spritesheet, 0, 0, 80, 80, 0.05, 1, true, false), null,
                                        new Animation(bishop_spritesheet, 0, 0, 80, 80, 0.05, 14, false, false), null);
    var bishop = new NPC_QUEST(gameEngine, "Celesto", [["Hello young hero, I am expecting you but not without your fated companion. Go and find her, young one!"],
                                                        ["Ah, our young hero, Theon, and his new friend the mage, Acele. I have been expecting you.",
                                                        "I have been watching you as your story unfolds. You are very important, young hero. You will change this world.", 
                                                        "I am a man of the Gods, and it is not noramlly acceptable for me to alter the threads of fate,",
                                                        "but your work here in Arkesia is so important, that I will make this one exception.", 
                                                        "I now bestow upon you a new magical ability, Acele!"],
                                                       ["Be blessed, young heroes, and stay strong, for your journey is not yet over and the road is long."]], bishop_sprites,
                                                            [new Point(384, 64)], .05, false, [0, 1], null, "church", 1.8, [function () {
                                                                if (this.part === 0 && this.game.heroes[1]) {
                                                                    this.part++;
                                                                }
                                                                        this.showDialog();
                                                                    }, function () {
                                                                        if (this.game) {
                                                                            if (this.game.next === true) {
                                                                                var text_box = document.getElementById("dialogue_box");
                                                                                var text = document.createElement('p');

                                                                                if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                                                                                    this.dialogue_index++;
                                                                                    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                                                                                    text_box.innerHTML = text.outerHTML;
                                                                                } else {
                                                                                    this.dialogue_index = 0;
                                                                                    text_box.style.visibility = "hidden";
                                                                                    text_box.style.display = "none";
                                                                                    text_box.tabIndex = 2;
                                                                                    this.game.context.canvas.tabIndex = 1;
                                                                                    this.game.context.canvas.focus();
                                                                                    this.game.canControl = true;
                                                                                    this.interacting = false;
                                                                                    if (this.part === 1) {
                                                                                        this.part++;
                                                                                        // give acele a new ability
                                                                                        this.game.heroes[1].abilities.push("Blast");
                                                                                        // play hit animation
                                                                                        this.game.animation_queue.push(new Event(this, this.animations.hit, 500, null, null));
                                                                                        this.game.animation_queue.push(new Event(this, this.animations.down, 0, null, null));
                                                                                    } 
                                                                                }
                                                                                this.game.next = false;
                                                                            }
                                                                        }
                                                                    }], -82);
																	
																	
	//LEVEL 3 STUFF
	 var aladdin_sprites = new SpriteSet(new Animation(aladdin_spritesheet, 0, 0, 56, 73.75, 0.1, 3, true, true),
                                            new Animation(aladdin_spritesheet, 0,2, 56, 73.75, 0.1, 3, true, true),
                                            new Animation(aladdin_spritesheet, 0, 1, 56, 73.75, 0.1, 3, true, true),
                                            new Animation(aladdin_spritesheet, 0, 3, 56, 73.75, 0.1, 3, true, true), null, null, null);
    var aladdin_quest_sword = new SpecialItem(gameEngine, "Aladdin Sword", ASSET_MANAGER.getAsset("./imgs/items/sword.gif"), 1, function () { }, "The sword that strikes the Demon!");
     var aladdin_reward = ghost_quest_potion;
    var aladdin_quest = new RETRIEVE_ITEM_QUEST(gameEngine, "Aladdin", aladdin_reward, aladdin_quest_sword);

    var aladdin = new NPC_QUEST(gameEngine, "Aladdin", [["Oh Dear God! Finally there is someone alive in the Death Valley! ",
                                                                  "The Demon has been killing all the cattle in Agrabah and my people are staving now.I am here to fight the Demon and save town!",
                                                                  "But for that I need a sword, since no one in their right mind will fight against Demon with their bare hands", 
																  "All I can give you back is Jasmine's pendant and my friendship! "],
                                                                  ["People in Agrabah are starving to death, bring me the sword and let me save and be a hero like you!"],
                                                                  ["You are officially my bro now! Thank you for help and email me if you will need some help! "],
                                                                  ["You must have brought it with you! Haha!"]], aladdin_sprites, [new Point(224, 220), new Point(270, 220)], .05, false, [3, 4],
                                                                    aladdin_quest, "level3", 1.25, [function () {
                                                                        if (this.part === 0 && this.quest.complete) {
                                                                            this.part++;
                                                                        }
                                                                       this.showDialog();       
                                                                    }, function () {
                                                                        if (this.game) {
                                                                            if (this.game.next === true) {
                                                                                var text_box = document.getElementById("dialogue_box");
                                                                                var text = document.createElement('p');

                                                                                if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                                                                                    this.dialogue_index++;
                                                                                    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                                                                                    text_box.innerHTML = text.outerHTML;
                                                                                } else {
                                                                                    this.dialogue_index = 0;
                                                                                    text_box.style.visibility = "hidden";
                                                                                    text_box.style.display = "none";
                                                                                    text_box.tabIndex = 2;
                                                                                    this.game.context.canvas.tabIndex = 1;
                                                                                    this.game.context.canvas.focus();
                                                                                    this.game.canControl = true;
                                                                                    this.interacting = false;
                                                                                    if (this.part === 0) {
                                                                                        this.part++;
                                                                                        this.game.entities[0].addQuest(this.quest);
                                                                                        this.quest.complete = true;
                                                                                    } if (this.part === 2) {
                                                                                        this.part++;
                                                                                    }
                                                                                }
                                                                                this.game.next = false;
                                                                            }
                                                                        }
                                                                    }], 20);
																	
	var jasmine_sprites = new SpriteSet(new Animation(jasmine_spritesheet, 1, 0, 37.5, 50, 0.05, 1, true, false),
                                                new Animation(jasmine_spritesheet, 1, 0,37.5, 50, 0.05, 1, true, false),
                                                new Animation(jasmine_spritesheet, 1, 0, 37.5, 50, 0.05, 1, true, false),
                                                new Animation(jasmine_spritesheet, 1, 0, 37.5, 50, 0.05, 1, true, false), null, null, null);
    var jasmine = new NPC(gameEngine, [["Oh deary me! A visitor! Hilbert!! A VISITOR!!!",
                                                "If we weren't so concerned about the Lady of the Lake, we would invite you in! But alas, it is not safe, deary."],
                                                ["The Lady of the Lake? I heard she only comes out when there is magic around."]],
                                           jasmine_sprites, [new Point(535, 340)], .06, false, [5], "level3", 1.5, 15);
										   
	var sultan_sprites = new SpriteSet(new Animation(sultan_spritesheet, 0, 3, 36, 51, 0.1, 1, true, true),
                                            new Animation(sultan_spritesheet, 0, 1, 36, 51, 0.1, 1, true, true),
                                            new Animation(sultan_spritesheet, 0, 2, 36, 51, 0.1, 1, true, true),
                                            new Animation(sultan_spritesheet, 0, 1, 36, 51, 0.1, 1, true, true), null, null, null);
    var sultan_quest_sword = new SpecialItem(gameEngine, "Aladdin Sword", ASSET_MANAGER.getAsset("./imgs/items/sword.gif"), 1, function () { }, "The sword that strikes the Demon!");
    var sultan_reward = ghost_quest_potion;
    var sultan_quest = new RETRIEVE_ITEM_QUEST(gameEngine, "Aladdin", sultan_reward, sultan_quest_sword);

    var sultan = new NPC_QUEST(gameEngine, "Sultan", [["Oh Dear God! Finally there is someone alive in the Death Valley! ",
                                                                  "The Demon has been killing all the cattle in Agrabah and my people are staving now.I am here to fight the Demon and save town!",
                                                                  "But for that I need a sword, since no one in their right mind will fight against Demon with their bare hands", 
																  "All I can give you back is Jasmine's pendant and my friendship! "],
                                                                  ["People in Agrabah are starving to death, bring me the sword and let me save and be a hero like you!"],
                                                                  ["You are officially my bro now! Thank you for help and email me if you will need some help! "],
                                                                  ["You must have brought it with you! Haha!"]], sultan_sprites, [new Point(434, 220)], .05, false, [2],
                                                                    sultan_quest, "level3", 1.25, [function () {
                                                                        if (this.part === 0 && this.quest.complete) {
                                                                            this.part++;
                                                                        }
                                                                       this.showDialog();       
                                                                    }, function () {
                                                                        if (this.game) {
                                                                            if (this.game.next === true) {
                                                                                var text_box = document.getElementById("dialogue_box");
                                                                                var text = document.createElement('p');

                                                                                if (this.dialogue_index < this.dialogue[this.part].length - 1) {
                                                                                    this.dialogue_index++;
                                                                                    text.innerHTML = this.dialogue[this.part][this.dialogue_index];
                                                                                    text_box.innerHTML = text.outerHTML;
                                                                                } else {
                                                                                    this.dialogue_index = 0;
                                                                                    text_box.style.visibility = "hidden";
                                                                                    text_box.style.display = "none";
                                                                                    text_box.tabIndex = 2;
                                                                                    this.game.context.canvas.tabIndex = 1;
                                                                                    this.game.context.canvas.focus();
                                                                                    this.game.canControl = true;
                                                                                    this.interacting = false;
                                                                                    if (this.part === 0) {
                                                                                        this.part++;
                                                                                        this.game.entities[0].addQuest(this.quest);
                                                                                        this.quest.complete = true;
                                                                                    } if (this.part === 2) {
                                                                                        this.part++;
                                                                                    }
                                                                                }
                                                                                this.game.next = false;
                                                                            }
                                                                        }
                                                                    }], 20);
	// Environments 
    // indoor game, map (array, floor then interior, animations, tilesheet, quads, interactables. 
    var house1 = new IndoorEnvironment(gameEngine, [[[1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                        [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
                        [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
                        [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2],
                        [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                        [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
                        [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
                        [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2],
                        [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3],
                        [2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4],
                        [3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1],
                        [4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2],
                        [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3]],
                        [[28, 29, 30, 31, 32, 33, 34, 0, 0, 58, 59, 0, 0, 52, 52, 52, 52, 52, 52],
                        [35, 36, 37, 38, 39, 40, 41, 0, 0, 60, 61, 0, 0, 23, 21, 21, 42, 0, 0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 24, 22, 22, 43, 0,0],
                        [7, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 0, 0, 44, 0,0],
                        [6, 9, 0, 0, 0, 0, 47, 47, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0],
                        [5, 8, 0, 0, 0, 0, 26, 27, 0, 0, 66, 66, 66, 66, 66, 66, 0,0, 49],
                        [0, 0, 0, 0, 0, 17, 15, 16, 18, 0, 66, 62, 63, 62, 63, 66, 0, 0,50],
                        [12, 14, 0, 0, 0, 0, 48, 48, 0, 0, 66, 64, 65, 64, 65, 66, 0,0, 51],
                        [11, 13, 0, 0, 0, 0, 0, 0, 0, 0, 66, 62, 63, 62, 63, 66, 0, 0,0],
                        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 66, 64, 65, 64, 65, 66, 0,0, 49],
                        [45, 0, 0, 53, 0, 53, 0, 0, 0, 0, 66, 66, 66, 66, 66, 66, 0,0, 50],
                        [46, 0, 0, 54, 55, 54, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 51],
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]],
                        null, new Tilesheet("./imgs/roomInteriorSpritesSheet.png", 32, 22), [0], [new Portal(9, 12, 0, gameEngine, ExitHouse1)], "house1", null, null, 0, []);

    var house2 = new IndoorEnvironment(gameEngine, [[[67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 68, 67, 67],
                         [67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 68, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67],
                         [68, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67],
                         [67, 67, 68, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 68, 68],
                         [67, 67, 68, 67, 67, 67, 67, 67, 67, 68, 67, 67, 67, 67, 67, 67, 67, 68, 68]],
                          [[88, 85, 70, 71, 70, 71, 70, 72, 88, 85, 73, 70, 71, 70, 71, 70, 88, 88],
                            [84, 87, 77, 78, 77, 78, 77, 79, 84, 83, 80, 77, 78, 77, 78, 77, 84, 84],
                            [87, 0, 0, 0, 0, 0, 0, 0, 87, 86, 0, 0, 0, 0, 86, 0, 87, 87],
                            [0, 0, 0, 83, 0, 0, 0, 0, 0, 0, 0, 0, 0, 85, 0, 0, 0, 0],
                            [85, 0, 0, 0, 69, 75, 0, 0, 0, 0, 86, 0, 0, 0, 83, 0, 86, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 85, 0, 0, 0, 0, 0, 0],
                            [0, 86, 0, 0, 83, 0, 85, 0, 0, 0, 0, 0, 0, 0, 0, 82, 0, 0],
                            [83, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 85, 0, 0, 81, 0, 85],
                            [0, 0, 0, 0, 0, 74, 0, 0, 83, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 76, 0, 0, 0, 0, 0, 0, 86, 0, 0, 0, 0, 0],
                            [0, 85, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 83, 0, 0, 0, 85, 0, 0, 0, 85, 0, 0, 0],
                           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]],
                            null, new Tilesheet("./imgs/roomInteriorSpritesSheet.png", 32, 22), [0], [new Portal(9, 12, 0, gameEngine, ExitHouse2)], "house2", null, null, 0, []);
	
	var church = new IndoorEnvironment(gameEngine, [[
						 [30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
                         [30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
                         [30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
                         [30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
                         [30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
                         [30,30,30,30,28,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,29,30,30,30,30,30],
                         [30,30,30,30,11,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,10,30,30,30,30,30],
                         [30,30,30,30,11,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,10,30,30,30,30,30],
                         [30,30,30,30,11,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,10,30,30,30,30,30],
                         [30,30,30,30,11,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,10,30,30,30,30,30],
                         [30,30,30,30,48,9,9,9,9,9,9,9,14,8,8,8,13,9,9,9,9,9,9,9,49,30,30,30,30,30],
                         [30,30,30,30,30,30,30,30,30,30,30,30,11,8,8,8,10,30,30,30,30,30,30,30,30,30,30,30,30,30],
						 [30,30,30,30,30,30,30,30,30,30,30,30,48,9,9,9,49,30,30,30,30,30,30,30,30,30,30,30,30,30]],
                          [[0,80,81,82,0,0,0,0,0,0,0,0,0,1,2,3,0,0,0,0,0,0,0,0,0,83,84,85,0,0],
                            [0,100,101,102,0,0,15,16,17,0,4,5,0,21,22,23,0,6,7,0,15,16,17,0,0,103,104,105,0,0],
                            [0,120,121,122,0,0,35,36,37,0,24,25,0,41,42,43,0,26,27,0,35,36,37,0,0,123,124,125,0,0],
                            [0,0,0,0,0,0,0,0,0,0,44,45,0,61,62,63,0,46,47,0,0,0,0,0,0,0,0,0,0,0],
                            [0,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0],
                            [0,38,0,0,28,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,29,0,0,38,0,0],
                            [0,58,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,58,0,0],
                            [0,0,0,0,11,0,50,51,52,53,54,0,0,0,0,0,0,0,50,51,52,53,54,,0,0,0,0,0,65],
                            [0,18,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,18,0,0],
                            [0,38,0,0,11,0,50,51,52,53,54,0,0,0,0,0,0,0,50,51,52,53,54,0,10,0,0,38,0,0],
                            [0,58,0,0,48,9,9,9,9,9,9,9,14,0,0,0,13,9,9,9,9,9,9,9,49,0,0,58,0,0],
                            [0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0],
                           [0,0,0,0,0,0,0,0,0,0,0,0,48,9,9,9,49,0,0,0,0,0,0,0,0,0,0,0,0,0]]],
                            null, new Tilesheet("./imgs/churchInterior.png", 32, 20), [0],
                     [new Chest(18, 8, 1, gameEngine, [new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "A delicious berry that makes you feel more refreshed."), 55], true),
                        new Portal(14, 12, 0, gameEngine, ExitChurch), new Portal(3, 12, 1, gameEngine, ExitChurch)], "church", null, null, 0, []);


    


    var dragonCave = new IndoorEnvironment(gameEngine,  
					  [[[0,   0,  0,  0, 0,  0,   0,  0,  0, 28, 28, 28, 33, 33, 33, 28, 28, 33, 28, 28,  0, 28, 28,  28,  28,  28, 33, 33, 28, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [0,   0,  0,  0, 28, 28,  0,  0, 28, 28, 28, 33, 33, 33, 33, 33, 33, 33, 33, 28, 28, 28, 33, 28, 28, 28, 33, 33, 33, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        [28, 28, 28, 28, 28, 28, 28, 28, 28, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 28, 33, 33, 33, 33, 33, 33, 33, 33, 33, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
                        [28, 28, 28, 28, 33, 33, 28, 28, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 35, 35, 35, 35, 35, 35, 35, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 35, 0, 0, 0, 0, 0, 0, 0, 35, 35, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [33, 33, 33, 33, 33, 33, 33, 33, 33, 33,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
                        [35, 35, 35, 35, 35, 35, 33, 33, 33, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 33, 33, 33, 0, 0, 33, 33, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35],
                        [0, 0, 0, 0, 0, 0, 33, 33, 35, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 35, 35, 0, 0, 35, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0, 35, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
                        [[34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 11, 34, 34, 13, 17, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 16, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 31, 12, 34, 34, 23, 34, 34, 34, 11, 34, 34, 34, 15, 34, 34, 22, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 12, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 27, 34, 34, 34, 30, 21, 34, 14, 31, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 31, 27, 34, 34, 27, 34, 34, 34, 8, 6, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 20, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 12, 34, 34, 31, 10, 34, 34, 34, 34, 7, 34, 34, 34, 34, 34, 34, 6, 34, 34, 34, 34, 34, 6, 34, 34, 26, 2, 3, 34, 41, 41, 34, 34, 34, 34, 34, 34, 34],
                        [8, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 24, 34, 34, 34, 34, 7, 34, 34, 34, 34, 34, 6, 7, 34, 30, 32, 8, 9,   34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [2, 8, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 11, 30, 10, 12, 34, 34, 34, 34, 34, 34, 34, 34, 8, 34, 34, 16, 34, 3,   34, 34, 34, 34, 34, 34, 34, 34,34, 34, 34],
                        [3, 7, 2, 34, 34, 34, 34, 34, 34, 34, 34, 31, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 31, 22, 27, 34, 34, 34,  34, 34, 34, 34, 34, 2, 34, 34, 34],
                        [7, 9, 34, 34, 34, 34, 34, 34, 34, 34, 12, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 16, 34, 34, 34, 34, 34, 13, 12, 34, 34, 34,  34, 34, 34, 34, 2, 8, 34, 34, 34],
                        [8, 34, 34, 34, 34, 34, 34, 34, 34, 1, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 22, 10, 34, 14, 34, 13, 14, 34, 34, 34, 34, 41, 41, 34, 3, 9,  7, 3, 34, 34],
                        [34, 34, 34, 34, 34, 34, 34, 30, 2, 5, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 20, 34, 34, 20, 15, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 34, 34, 12, 27, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 21, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34],
                        [34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34]]],
                        null, new Tilesheet("./imgs/dragoncave.png", 32, 6), [0, 1, 2], [new Portal(0, 6, 0, gameEngine, ExitDragonCave), new Portal(18, 6, 2, gameEngine, EnterLevel2, 1),
                        new Chest(10, 4, 2, gameEngine, [185], false), new Chest(11, 4, 2, gameEngine, [218], false), new Chest(10, 9, 2, gameEngine, [75], false), new Chest(11, 9, 2, gameEngine, [245], false)],

                        "dragon_cave", "./imgs/ice_cave.png", ["Skeleton", "Malboro", "Ogre", "Dire Wolf"], 0, [0, 1]);

    var lagoon = new IndoorEnvironment(gameEngine, [[
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 1, 1, 1, 1, 1, 1, 1, 13, 13],
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13],
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13],
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13],
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                                                    [13, 13, 13, 13, 13, 13, 13, 13, 13, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                                                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                                                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                                                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 13],
                                                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 13, 13, 13, 13],
                                                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 13, 13, 13, 13, 13, 13]],

                                                    [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 8, 9, 0, 0, 0, 0, 0, 8, 6, 6, 6, 6, 6, 6, 6, 9, 0],
                                                    [0, 0, 18, 19, 0, 0, 0, 0, 0, 14, 0, 15, 16, 0, 15, 0, 0, 12, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 16, 12, 0],
                                                    [0, 0, 0, 0, 0, 0, 8, 9, 0, 14, 0, 0, 0, 0, 0, 0, 15, 5, 9],
                                                    [0, 0, 0, 0, 0, 0, 18, 19, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 12],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 14, 15, 0, 0, 0, 0, 0, 0, 0, 12],
                                                    [6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 16, 15, 0, 0, 0, 0, 0, 0, 12],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 15, 16, 15, 0, 0, 0, 0, 0, 0, 2, 19],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 15, 2, 3, 3, 19, 0],
                                                    [0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 15, 2, 19, 0, 0, 0, 0],
                                                    [0, 0, 0, 15, 16, 15, 0, 0, 0, 11, 10, 2, 3, 19, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                                                        ]], null, new Tilesheet("./imgs/lagoon.png", 32, 10), [0], [new Portal(0, 10, 0, gameEngine, ExitLagoon)],
                                                    "lagoon", "./imgs/mountain.png", [], 0, []);


    var level1_animation1 = new EnvironmentAnimation(new Animation(ASSET_MANAGER.getAsset("./imgs/fire.png"), 0, 0, 32, 64, 0.5, 9, true, false), 
                            [[0, 3], [1, 3], [7, 3], [14, 3], [16, 3]], [0, 1, 3, 4], 0);

    var level1_animation2 = new EnvironmentAnimation(new Animation(ASSET_MANAGER.getAsset("./imgs/fire2.png"), 0, 0, 32, 32, 0.5, 4, true, false),
                              [[2, 1], [14, 1], [1, 2], [16, 2], [0, 11], [10, 12]], [0, 1, 3, 4], 0);

    var level1 = new OutdoorEnvironment(gameEngine, [[0, 66, 0, 0, 90, 91, 0, 0, 66, 0, 0, 94, 94, 0, 0, 66, 0, 94, 0, 0, 90, 91, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 62, 15, 0, 15, 0, 17, 3, 4, 62],
                [67, 68, 69, 94, 92, 93, 94, 67, 68, 69, 94, 95, 95, 94, 67, 68, 69, 95, 90, 91, 92, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 17, 18, 15, 16, 5, 6, 63],
                [70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 95, 90, 91, 95, 70, 71, 72, 94, 92, 93, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 16, 15, 18, 17, 0, 62, 20],
                [73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 94, 92, 93, 94, 73, 74, 75, 95, 0, 0, 0, 0, 0, 94, 28, 94, 28, 28, 0, 3, 4, 0, 0, 0, 18, 17, 18, 15, 16, 0, 0, 19],
                [76, 76, 78, 95, 90, 91, 95, 76, 78, 76, 95, 90, 91, 95, 76, 78, 76, 94, 0, 0, 0, 0, 0, 95, 29, 95, 29, 29, 0, 5, 6, 28, 28, 0, 0, 16, 1, 18, 0, 0, 3, 4],
                [77, 77, 79, 85, 92, 93, 85, 77, 79, 77, 87, 92, 93, 87, 77, 79, 77, 95, 0, 0, 0, 0, 94, 94, 117, 118, 119, 120, 3, 4, 28, 29, 29, 0, 0, 0, 2, 0, 0, 28, 5, 6],
                [0, 0, 80, 87, 86, 85, 87, 0, 80, 0, 86, 85, 87, 85, 0, 80, 0, 0, 0, 0, 94, 94, 95, 95, 121, 122, 123, 124, 5, 6, 29, 0, 0, 0, 28, 0, 0, 0, 28, 29, 62, 64],
                [7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 7, 8, 95, 95, 94, 94, 125, 126, 127, 128, 0, 0, 0, 0, 3, 4, 29, 0, 0, 0, 29, 0, 3, 4],
                [9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 9, 10, 0, 94, 95, 95, 129, 130, 131, 132, 0, 0, 28, 62, 5, 6, 65, 0, 0, 0, 0, 0, 5, 6],
                [0, 66, 0, 104, 94, 0, 0, 94, 0, 0, 66, 0, 86, 87, 85, 86, 87, 85, 7, 8, 94, 95, 94, 3, 4, 0, 0, 0, 0, 62, 29, 62, 63, 3, 4, 0, 0, 3, 4, 37, 38, 0],
                [67, 68, 69, 94, 95, 0, 0, 95, 94, 67, 68, 69, 85, 86, 87, 85, 86, 87, 9, 10, 95, 94, 95, 5, 6, 0, 0, 0, 103, 37, 38, 3, 4, 5, 6, 0, 0, 5, 6, 3, 4, 0],
                [70, 71, 72, 95, 94, 0, 0, 94, 95, 70, 71, 72, 0, 90, 91, 94, 90, 91, 7, 8, 0, 95, 3, 4, 81, 82, 81, 82, 81, 82, 65, 5, 6, 0, 0, 0, 20, 3, 4, 5, 6, 103],
                [73, 74, 75, 94, 95, 0, 0, 95, 94, 73, 74, 75, 94, 92, 93, 95, 92, 93, 9, 10, 88, 89, 5, 6, 83, 84, 83, 84, 83, 84, 81, 82, 0, 0, 0, 64, 19, 5, 6, 65, 30, 30],
                [76, 78, 76, 95, 94, 0, 0, 0, 95, 76, 78, 76, 95, 94, 94, 90, 91, 94, 7, 8, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 83, 84, 0, 0, 3, 4, 65, 32, 63, 32, 31, 31],
                [77, 79, 77, 0, 95, 0, 0, 0, 0, 77, 79, 77, 0, 95, 95, 92, 93, 95, 9, 10, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 81, 82, 0, 0, 5, 6, 63, 33, 30, 33, 65, 65],
                [0, 80, 0, 25, 26, 27, 0, 0, 0, 0, 80, 0, 90, 91, 133, 106, 107, 108, 0, 104, 104, 0, 3, 4, 0, 21, 22, 20, 11, 12, 83, 84, 0, 0, 81, 82, 81, 82, 31, 96, 97, 32],
                [0, 0, 0, 0, 0, 25, 26, 27, 0, 0, 0, 0, 92, 93, 109, 110, 111, 112, 0, 0, 0, 0, 5, 6, 0, 23, 24, 19, 13, 14, 104, 104, 0, 0, 83, 84, 83, 84, 65, 98, 99, 33],
                [39, 39, 40, 41, 0, 25, 26, 27, 36, 34, 36, 0, 0, 0, 113, 114, 115, 116, 0, 3, 4, 28, 20, 28, 3, 4, 0, 28, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 11, 12, 96, 97],
                [46, 46, 47, 48, 0, 0, 42, 43, 44, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 29, 19, 29, 5, 6, 64, 29, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 13, 14, 98, 99],
                [53, 53, 40, 41, 36, 0, 49, 50, 51, 52, 0, 0, 0, 0, 0, 0, 0, 0, 0, 28, 28, 0, 65, 64, 62, 3, 4, 62, 64, 0, 0, 65, 37, 38, 104, 63, 32, 96, 97, 63, 32, 30],
                [36, 36, 47, 48, 94, 0, 54, 55, 56, 57, 0, 3, 4, 28, 28, 0, 28, 0, 65, 29, 29, 28, 0, 0, 0, 5, 6, 37, 38, 0, 0, 3, 4, 65, 65, 63, 33, 98, 99, 30, 33, 31],
                [90, 91, 36, 36, 95, 0, 58, 59, 60, 61, 0, 5, 6, 29, 29, 20, 29, 28, 64, 3, 4, 29, 37, 38, 0, 0, 0, 0, 3, 4, 0, 5, 6, 3, 4, 65, 30, 30, 65, 31, 65, 65],
                [92, 93, 90, 91, 94, 0, 0, 0, 0, 0, 0, 3, 4, 37, 38, 19, 64, 29, 20, 5, 6, 0, 0, 28, 28, 0, 28, 0, 5, 6, 0, 28, 28, 5, 6, 32, 31, 31, 32, 62, 30, 63],
                [0, 0, 92, 93, 95, 0, 0, 0, 0, 0, 0, 5, 6, 64, 37, 38, 62, 62, 19, 62, 103, 0, 0, 29, 29, 0, 29, 0, 0, 0, 0, 29, 29, 37, 38, 33, 63, 63, 33, 62, 31, 63]],
                 [house1, dragonCave, house2], [level1_animation1, level1_animation2], new Tilesheet("./imgs/tiles.png", 32, 26), [0, 1, 2, 3, 4, 5],
                [new Door(2, 6, 0, gameEngine), new Door(8, 6, 0, gameEngine), new Door(15, 6, [0, 1], gameEngine),
                new Door(1, 4, 3, gameEngine), new Door(10, 4, 3, gameEngine), new Chest(9, 12, 4, gameEngine, [new Armor(gameEngine, "Amulet of Strength", 130, ASSET_MANAGER.getAsset("./imgs/items/amulet1.png"), "accessory", new Statistics(0, 0, 0, 1, 1, 0), "It's so shiny it gives you power."), 100], false),
                new Chest(5, 10, 2, gameEngine, [new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "A delicious berry that makes you feel more refreshed."), 55], true),
                new Chest(18, 11, 2, gameEngine, [new Book(gameEngine, "Book of Spells", ASSET_MANAGER.getAsset("./imgs/items/book.png"))], false),
                new HealBerry(3, 9, 0, gameEngine),new HealBerry(9, 4, 4, gameEngine), new HealBerry(8, 4, 4, gameEngine), new HealBerry(7, 5, 5, gameEngine), new HealBerry(8, 5, 5, gameEngine),
                new HealBerry(11, 8, 5, gameEngine), new Log(11, 10, 4, gameEngine), new Log(16, 9, 2, gameEngine), new Portal(16, 6, 5, gameEngine, EnterDragonCave), new Portal(8, 5, 0, gameEngine, EnterHouse1, 1),
                new Portal(2, 5, 0, gameEngine, EnterHouse2, 1)], ["Skeleton", "Malboro", "Ogre"], "level1", "./imgs/woods.png", 0, [1, 2, 4, 5]);
	
	    var level2 = new OutdoorEnvironment(gameEngine, [[198,199,200,201,202,203,204,205,206,207,208,146,147,146,147,146,147,146,147,146,147,146,147,146,147,146,147,146,147,146,147,146,147,146,147,144,0,0,0,0,0,0],
                [220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 511, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 168, 169, 166, 109, 175, 175, 175, 175, 175],
                [242,243,244,245,246,247,248,249,250,251,252,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,142,143,0,131,7,7,7,7,7],
                [264,265,266,267,268,269,270,271,272,273,274,164,165,164,165,164,165,164,165,164,165,164,165,164,165,164,165,164,165,164,165,164,165,164,165,0,131,7,7,7,7,7],
                [286,287,288,289,290,291,292,293,294,295,296,142,143,144,5,0,0,0,0,0,144,146,147,146,147,146,147,22,23,24,25,26,27,142,143,0,131,7,7,7,7,7],
                [308,309,310,311,312,313,314,315,316,317,318,164,165,166,5,0,0,8,0,0,166,168,169,168,169,168,169,44,45,46,47,48,49,164,165,0,131,7,7,7,7,7],
                [330,331,332,333,334,335,336,337,338,339,340,142,143,144,5,0,29,30,31,0,146,147,144,146,147,146,147,66,67,68,69,70,71,142,143,0,131,7,7,7,7,7],
                [352,353,354,355,356,357,358,359,360,361,362,164,165,166,5,0,51,52,53,0,168,169,166,168,169,168,169,0,0,0,0,148,149,164,165,0,131,7,7,7,7,7],
                [374,375,376,377,378,379,380,381,382,383,384,142,143,144,5,72,73,74,75,76,0,0,0,0,0,0,0,0,0,0,0,170,171,142,143,0,131,7,7,7,7,7],
                [396,397,398,399,400,401,402,403,404,405,406,164,165,166,5,94,95,96,97,98,0,0,0,0,0,0,0,0,0,0,0,0,0,164,165,0,131,7,7,7,7,7],
                [418,419,420,421,422,423,424,425,426,427,428,142,143,144,5,116,117,118,119,120,144,142,143,142,143,142,143,142,143,142,143,142,143,142,143,0,131,7,7,7,7,7],
                [440,441,442,443,444,445,446,447,448,449,450,164,165,166,5,5,5,5,0,0,166,164,165,164,165,164,165,164,165,164,165,164,165,164,165,0,153,197,197,197,197,197],
                [209,210,211,212,213,214,215,216,217,218,219,142,143,144,146,147,0,0,146,147,144,142,143,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [231,232,233,234,235,236,237,238,239,240,241,164,165,166,168,169,0,144,168,169,166,164,165,0,0,0,0,0,0,0,11,12,13,14,15,0,16,17,18,19,20,0],
                [253,254,255,256,257,258,259,260,261,262,263,142,143,146,147,0,0,166,0,146,147,142,143,0,88,89,90,91,92,0,33,34,35,36,37,0,38,39,40,41,42,0],
                [275,276,277,278,279,280,281,282,283,284,285,164,165,168,169,144,0,0,0,168,169,164,165,0,110,111,112,113,114,0,55,56,57,58,59,0,60,61,62,63,64,0],
                [297,298,299,300,301,302,303,304,305,306,307,142,143,144,0,166,146,147,0,146,147,142,143,0,132,133,134,135,136,0,77,78,79,80,81,0,82,83,84,85,86,0],
                [319,320,321,322,323,324,325,326,327,328,329,164,165,166,146,147,168,169,0,168,169,164,165,21,154,155,156,157,158,21,99,100,101,102,103,21,104,105,106,107,108,21],
                [341,342,343,344,345,346,347,348,349,350,351,142,143,144,168,169,0,0,0,144,144,142,143,43,176,177,178,179,180,43,121,122,123,124,125,43,126,127,128,129,130,43],
                [363,364,365,366,367,368,369,370,371,372,373,164,165,166,1,0,0,0,0,166,166,164,165,65,0,0,87,0,0,65,0,0,87,0,0,65,0,0,87,0,0,65],
                [385,386,387,388,389,390,391,392,393,394,395,462,463,464,465,466,467,468,0,146,147,142,143,0,0,0,87,0,0,0,0,0,87,0,0,0,0,0,87,0,0,0],
                [407,408,409,410,411,412,413,414,415,416,417,484,485,486,487,488,489,490,0,168,169,164,165,87,87,87,87,87,87,87,87,87,87,87,87,87,87,87,87,0,0,0],
                [429,430,431,432,433,434,435,436,437,438,439,506,507,508,509,510,511,512,0,0,0,142,143,137,138,6,0,0,0,137,138,0,0,0,137,138,0,0,0,10,137,138],
                [451,452,453,454,455,456,457,458,459,460,461,528,529,530,531,532,533,534,0,0,0,164,165,159,160,28,139,140,141,159,160,139,140,141,159,160,139,140,141,32,159,160]],

                [church, lagoon], [], new Tilesheet("./imgs/tileslevel2.png", 32, 22), [0, 1, 2, 3, 4, 5],
                [new Chest(3, 8, 4, gameEngine, [new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "A delicious berry that makes you feel more refreshed."), 400,
                new Potion(gameEngine, "Potion of Strength", 35, 3, ASSET_MANAGER.getAsset("./imgs/items/potion_str.png"), "str", 2, "A strange red liquid that will make you temporarily stronger!") ], true),
                new Portal(9, 7, 3, gameEngine, EnterDragonCaveFromLevel2), new Portal(6, 10, 1, gameEngine, EnterChurch), new Portal(17, 10, 0, gameEngine, EnterChurch), new Portal(10, 11, 4, gameEngine, Level3),
                new Portal(18, 11, 2, gameEngine, EnterLagoon)],
                ["Dire Wolf", "Wolf Rider", "Skeleton"], "level2", "./imgs/mountain.png", 3, [0, 1, 2, 3, 4, 5]);


	    var level3 = new OutdoorEnvironment(gameEngine,
                   [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 206, 207, 208, 209, 210, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 86, 87, 88, 89, 50, 50, 160, 142, 161, 50, 50, 50, 50, 50, 50],
                   [0, 0, 0, 0, 0, 283, 206, 207, 208, 209, 210, 226, 227, 228, 229, 230, 0, 0, 0, 0, 0, 0, 0, 70, 70, 70, 70, 106, 107, 108, 109, 70, 70, 180, 162, 181, 70, 70, 70, 70, 70, 70],
                   [0, 206, 207, 208, 209, 210, 226, 227, 228, 229, 230, 246, 247, 248, 249, 250, 0, 0, 0, 0, 281, 281, 0, 0, 0, 0, 0, 126, 127, 128, 129, 0, 0, 0, 0, 0, 0, 120, 110, 111, 112, 113],
                   [0, 226, 227, 228, 229, 230, 246, 247, 248, 249, 250, 266, 267, 268, 269, 270, 0, 0, 6, 7, 7, 7, 7, 7, 7, 8, 0, 146, 147, 148, 149, 0, 0, 0, 0, 0, 0, 140, 130, 131, 132, 133],
                   [0, 246, 247, 248, 249, 250, 266, 267, 268, 269, 270, 286, 287, 288, 289, 290, 0, 0, 9, 11, 27, 27, 27, 27, 12, 30, 0, 166, 167, 168, 169, 0, 0, 6, 8, 0, 0, 121, 150, 151, 152, 153],
                   [0, 266, 267, 268, 269, 270, 286, 287, 288, 289, 290, 306, 307, 308, 309, 310, 0, 0, 9, 30, 46, 47, 0, 0, 9, 30, 0, 186, 187, 188, 189, 0, 0, 9, 30, 0, 0, 120, 190, 191, 192, 193],
                   [0, 286, 287, 288, 289, 290, 306, 307, 308, 309, 310, 326, 327, 328, 329, 330, 0, 0, 9, 30, 66, 67, 48, 49, 9, 30, 0, 0, 0, 0, 0, 0, 0, 9, 30, 0, 0, 0, 190, 191, 192, 193],
                   [0, 306, 307, 308, 309, 310, 326, 327, 328, 329, 330, 0, 0, 0, 0, 0, 0, 0, 9, 30, 50, 0, 68, 69, 9, 31, 7, 7, 174, 175, 176, 177, 7, 32, 30, 0, 0, 0, 0, 211, 212, 213],
                   [0, 326, 327, 328, 329, 330, 346, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 30, 70, 0, 0, 0, 26, 27, 27, 27, 194, 195, 196, 197, 27, 27, 28, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 30, 50, 50, 50, 0, 0, 50, 0, 50, 214, 215, 216, 217, 50, 0, 50, 0, 0, 143, 144, 161, 143, 144],
                   [0, 97, 98, 0, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 174, 175, 176, 177, 32, 30, 70, 70, 70, 52, 0, 70, 50, 70, 0, 0, 0, 0, 70, 50, 70, 0, 0, 163, 164, 120, 163, 164],
                   [116, 117, 118, 0, 9, 11, 27, 27, 27, 27, 27, 27, 27, 27, 194, 195, 196, 197, 27, 28, 52, 51, 50, 72, 0, 0, 70, 0, 0, 0, 0, 0, 0, 70, 0, 0, 0, 183, 184, 180, 183, 184],
                   [136, 137, 138, 0, 9, 30, 20, 20, 0, 0, 0, 0, 0, 0, 214, 215, 216, 217, 0, 0, 72, 71, 70, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 242, 0, 0, 0, 0],
                   [156, 157, 158, 0, 9, 30, 0, 0, 0, 0, 37, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 242, 224, 244, 243, 262, 241, 240, 240, 0],
                   [283, 0, 0, 0, 9, 30, 0, 0, 0, 0, 57, 58, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 240, 244, 262, 241, 264, 263, 203, 261, 260, 260, 222],
                   [0, 281, 281, 0, 9, 30, 0, 0, 40, 0, 0, 0, 13, 14, 15, 16, 18, 0, 0, 40, 0, 0, 0, 0, 201, 0, 0, 240, 0, 202, 242, 260, 264, 242, 261, 0, 2, 3, 4, 5, 0, 242],
                   [7, 7, 7, 7, 32, 30, 0, 40, 40, 40, 0, 0, 33, 34, 35, 36, 17, 0, 40, 40, 40, 0, 0, 0, 0, 0, 244, 260, 201, 204, 262, 241, 0, 262, 220, 21, 22, 23, 24, 25, 202, 263],
                   [27, 27, 27, 27, 27, 28, 0, 0, 40, 0, 0, 19, 53, 54, 55, 56, 37, 38, 0, 40, 0, 0, 0, 0, 241, 203, 264, 0, 200, 240, 223, 261, 244, 240, 0, 41, 42, 43, 44, 45, 0, 241],
                   [0, 281, 0, 0, 0, 0, 0, 0, 40, 0, 17, 17, 73, 74, 75, 76, 57, 58, 0, 40, 0, 0, 0, 204, 261, 0, 202, 200, 0, 260, 0, 202, 264, 260, 0, 61, 62, 63, 64, 65, 201, 261],
                   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 18, 93, 94, 95, 96, 0, 18, 0, 0, 0, 0, 200, 0, 0, 0, 0, 97, 98, 0, 0, 201, 242, 201, 200, 81, 82, 83, 84, 85, 0, 283],
                   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 0, 0, 0, 0, 0, 116, 117, 118, 0, 0, 0, 252, 0, 0, 101, 102, 103, 104, 105, 221, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 136, 137, 138, 0, 0, 0, 0, 0, 0, 0, 122, 123, 124, 125, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 156, 157, 158, 0, 240, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 260, 200, 202, 204, 0, 0, 0, 0, 0, 0, 0, 0]],
                    [], [], new Tilesheet("./imgs/maplevel3.png", 32, 20), [0, 1, 2, 3, 4, 5],
                   [new Portal(0, 7, 3, gameEngine, Level2), new CactusFlower(1, 4, 3, gameEngine), new CactusFlower(2, 4, 3, gameEngine), new CactusFlower(1, 7, 3, gameEngine), new CactusFlower(8, 2, 1, gameEngine),
                    new CactusFlower(9, 2, 1, gameEngine), new Chest(18, 8, 1, gameEngine, [new Potion(gameEngine, "Heal Berry", 10, 2, ASSET_MANAGER.getAsset("./imgs/items/heal_berry.png"), "health", 1, "A delicious berry that makes you feel more refreshed."), 55], true),
                   new Chest(5, 1, 0, gameEngine, [new Potion(gameEngine, "Potion of Strength", 35, 3, ASSET_MANAGER.getAsset("./imgs/items/potion_str.png"), "str", 2, "A strange red liquid that will make you temporarily stronger!"), 455], false),
                   new Chest(18, 8, 5, gameEngine, [new Armor(gameEngine, "Blessed Staff", 320, ASSET_MANAGER.getAsset("./imgs/items/staff3.png"), "mainhand", new Statistics(0, 15, 0, 0, 0, 6), "A golden rod that seems to radiate a holy aura.")], true),
                   new Chest(0, 3, 3, gameEngine, [new Armor(gameEngine, "Sword of Protection", 355, ASSET_MANAGER.getAsset("./imgs/items/sword2.png"), "mainhand", new Statistics(0, 20, 20, 5, 0, 0), "A powerful, shiny, exotic, desert-like sword."),
                    new Armor(gameEngine, "Golden Shiny Armor", 420, ASSET_MANAGER.getAsset("./imgs/items/armor3.png"), "armor", new Statistics(0, 0, 30, 5, 10, 0), "Shiny, sexy, and hopefully blinding armor.")], true)],
                    ["Skeleton", "Malboro", "Ogre"], "level3", "./imgs/desert.png", 0, [1, 2, 4, 5]);



    gameEngine.addEnvironment(level1.name, level1);
    gameEngine.addEnvironment(level2.name, level2);
	gameEngine.addEnvironment(level3.name, level3);
    //gameEngine.addAuxillaryEntity(mal);
    //gameEngine.addAuxillaryEntity(skeleton);
    gameEngine.addEntity(girl_npc);
    gameEngine.addEntity(storekeeper);
	gameEngine.addEntity(ghost);
	gameEngine.addEntity(witch);
	gameEngine.addEntity(dragon1_NPC);
	gameEngine.addEntity(mountain_man);
	gameEngine.addEntity(mountain_woman);
	gameEngine.addEntity(mountain_villager);
	gameEngine.addEntity(mage_npc);
	gameEngine.addEntity(bishop);
	gameEngine.addEntity(troll_NPC);

		gameEngine.addEntity(aladdin);
		gameEngine.addEntity(jasmine);
		gameEngine.addEntity(sultan);
	//gameEngine.addEntity(siren_NPC);
    gameEngine.init(context);
    gameEngine.esc_menu.initHero(warrior);
    gameEngine.start();
});
